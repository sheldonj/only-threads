'use client';

import { useSession } from '@/lib/auth/client';
import {
  useCourseQueries,
  useLessonProgressQueries,
  useLessonQueries,
  usePurchaseQueries,
} from '@/lib/hooks/use-models';
import {
  type Course,
  type Lesson,
  type LessonProgress,
} from '@/lib/zenstack/generated/models';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

type CourseWithLessons = Course & {
  lessons?: Array<Pick<Lesson, 'id' | 'order' | 'title'>>;
};

type UseLessonDataParameters = {
  courseSlug: string;
  lessonId: string;
};

export function useLessonData({
  courseSlug,
  lessonId,
}: UseLessonDataParameters) {
  const queryClient = useQueryClient();
  const { data: session, isPending: isSessionPending } = useSession();
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  const courseQueries = useCourseQueries();
  const lessonQueries = useLessonQueries();
  const purchaseQueries = usePurchaseQueries();
  const progressQueries = useLessonProgressQueries();

  const { data: course, isLoading: isCourseLoading } =
    courseQueries.useFindFirst({
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          select: { id: true, order: true, title: true },
        },
      },
      where: { slug: courseSlug },
    });

  const { data: lesson, isLoading: isLessonLoading } =
    lessonQueries.useFindUnique({
      where: { id: lessonId },
    });

  const { data: purchase, isLoading: isPurchaseLoading } =
    purchaseQueries.useFindFirst(
      {
        where: {
          courseId: course?.id ?? '',
          userId: session?.user?.id ?? '',
        },
      },
      { enabled: Boolean(session && course) },
    );

  const lessonIds = useMemo(
    () =>
      course?.lessons?.map((lessonItem: Pick<Lesson, 'id'>) => lessonItem.id) ??
      [],
    [course?.lessons],
  );

  const { data: allProgress, isLoading: isProgressLoading } =
    progressQueries.useFindMany(
      {
        where: {
          completed: true,
          lessonId: { in: lessonIds },
          userId: session?.user?.id ?? '',
        },
      },
      { enabled: Boolean(session && lessonIds.length > 0) },
    );

  const completedLessonIds = useMemo(
    () =>
      new Set<string>(
        allProgress?.map((progress: LessonProgress) => progress.lessonId) ?? [],
      ),
    [allProgress],
  );

  const createProgress = progressQueries.useCreate();

  const triggerEvent = useCallback(
    async (type: 'completed' | 'started') => {
      if (!course) return;
      try {
        await fetch('/api/events', {
          body: JSON.stringify({ courseId: course.id, type }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });
      } catch {
        // Silently fail - event tracking is non-critical
      }
    },
    [course],
  );

  const isCurrentLessonComplete = completedLessonIds.has(lessonId);
  const completedCount = completedLessonIds.size;
  const totalLessons = course?.lessons?.length ?? 0;

  const handleMarkComplete = useCallback(async () => {
    if (!session?.user?.id || !lesson || isCurrentLessonComplete) return;

    setIsMarkingComplete(true);
    try {
      await createProgress.mutateAsync({
        data: {
          completed: true,
          completedAt: new Date(),
          lessonId: lesson.id,
          userId: session.user.id,
        },
      });

      if (completedCount === 0) {
        await triggerEvent('started');
      }

      if (completedCount + 1 === totalLessons) {
        await triggerEvent('completed');
      }

      await queryClient.invalidateQueries({ queryKey: ['lessonProgress'] });
    } catch {
      // Silently fail
    } finally {
      setIsMarkingComplete(false);
    }
  }, [
    session?.user?.id,
    lesson,
    isCurrentLessonComplete,
    createProgress,
    completedCount,
    totalLessons,
    triggerEvent,
    queryClient,
  ]);

  const isLoading =
    isSessionPending ||
    isCourseLoading ||
    isLessonLoading ||
    isPurchaseLoading ||
    isProgressLoading;

  const hasAccess = Boolean(purchase) || session?.user?.role === 'admin';

  return {
    completedCount,
    completedLessonIds,
    course: course as CourseWithLessons | undefined,
    handleMarkComplete,
    hasAccess,
    isCurrentLessonComplete,
    isLoading,
    isMarkingComplete,
    isSessionPending,
    lesson,
    session,
    totalLessons,
  };
}
