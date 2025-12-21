'use client';

import { AccessRequired } from './components/access-required';
import { CourseSidebar } from './components/course-sidebar';
import { LessonLoading } from './components/lesson-loading';
import { LessonMainContent } from './components/lesson-main-content';
import { LessonNotFound } from './components/lesson-not-found';
import { useLessonData } from './hooks/use-lesson-data';
import { type Lesson } from '@/lib/zenstack/generated/models';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function LessonPageClient() {
  const parameters = useParams<{ courseSlug: string; lessonId: string }>();
  const router = useRouter();

  const {
    completedCount,
    completedLessonIds,
    course,
    handleMarkComplete,
    hasAccess,
    isCurrentLessonComplete,
    isLoading,
    isMarkingComplete,
    isSessionPending,
    lesson,
    session,
    totalLessons,
  } = useLessonData({
    courseSlug: parameters.courseSlug,
    lessonId: parameters.lessonId,
  });

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push('/sign-in');
    }
  }, [isSessionPending, router, session]);

  if (isLoading) {
    return <LessonLoading />;
  }

  if (!session || !course || !lesson) {
    return <LessonNotFound />;
  }

  if (!hasAccess) {
    return <AccessRequired courseSlug={course.slug} />;
  }

  const currentIndex =
    course.lessons?.findIndex(
      (lessonItem: Pick<Lesson, 'id'>) => lessonItem.id === lesson.id,
    ) ?? -1;

  const previousLesson =
    currentIndex > 0 ? (course.lessons?.[currentIndex - 1] ?? null) : null;

  const nextLesson =
    currentIndex < (course.lessons?.length ?? 0) - 1
      ? (course.lessons?.[currentIndex + 1] ?? null)
      : null;

  return (
    <div className="min-h-screen">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <LessonMainContent
          courseSlug={course.slug}
          courseTitle={course.title}
          isComplete={isCurrentLessonComplete}
          isMarkingComplete={isMarkingComplete}
          lesson={lesson}
          nextLesson={nextLesson}
          onMarkComplete={handleMarkComplete}
          previousLesson={previousLesson}
        />

        <CourseSidebar
          completedCount={completedCount}
          completedLessonIds={completedLessonIds}
          courseSlug={course.slug}
          currentLessonId={lesson.id}
          lessons={course.lessons ?? []}
          totalCount={totalLessons}
        />
      </div>
    </div>
  );
}
