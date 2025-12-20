'use client';

/* eslint-disable react/no-danger */

import { CourseProgressBar } from '@/components/courses/progress-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from '@/lib/auth/client';
import {
  useCourseQueries,
  useLessonProgressQueries,
  useLessonQueries,
  usePurchaseQueries,
} from '@/lib/hooks/use-models';
import {
  type Lesson,
  type LessonProgress,
} from '@/lib/zenstack/generated/models';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Loader2,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

// eslint-disable-next-line complexity -- UI component with multiple states
export default function LessonPage() {
  const parameters = useParams<{ courseSlug: string; lessonId: string }>();
  const router = useRouter();
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
      where: { slug: parameters.courseSlug },
    });

  const { data: lesson, isLoading: isLessonLoading } =
    lessonQueries.useFindUnique({
      where: { id: parameters.lessonId },
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

  // Get all progress for this course's lessons
  const lessonIds = useMemo(
    () => course?.lessons?.map((lessonItem: Lesson) => lessonItem.id) ?? [],
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

  // Create a Set of completed lesson IDs for quick lookup
  const completedLessonIds = useMemo(
    () =>
      new Set(
        allProgress?.map((progress: LessonProgress) => progress.lessonId) ?? [],
      ),
    [allProgress],
  );

  const isCurrentLessonComplete = completedLessonIds.has(parameters.lessonId);
  const completedCount = completedLessonIds.size;
  const totalLessons = course?.lessons?.length ?? 0;

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

  const handleMarkComplete = useCallback(async () => {
    if (!session?.user?.id || !lesson || isCurrentLessonComplete) return;

    setIsMarkingComplete(true);
    try {
      // Create progress record
      await createProgress.mutateAsync({
        data: {
          completed: true,
          completedAt: new Date(),
          lessonId: lesson.id,
          userId: session.user.id,
        },
      });

      // Check if this is the first lesson being completed (course started)
      if (completedCount === 0) {
        await triggerEvent('started');
      }

      // Check if this completes the course (all lessons done after this one)
      if (completedCount + 1 === totalLessons) {
        await triggerEvent('completed');
      }

      // Invalidate progress queries to refresh UI
      await queryClient.invalidateQueries({ queryKey: ['lessonProgress'] });
    } catch {
      // Silently fail - will retry on next attempt
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

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push('/sign-in');
    }
  }, [isSessionPending, router, session]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session || !course || !lesson) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Lesson Not Found</h1>
        <Link href="/library">
          <Button>Back to Library</Button>
        </Link>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Access Required</h1>
        <p className="text-muted-foreground mb-8">
          You need to purchase this course to access its content.
        </p>
        <Link href={`/courses/${course.slug}`}>
          <Button>View Course Details</Button>
        </Link>
      </div>
    );
  }

  // Find previous and next lessons
  const currentIndex =
    course.lessons?.findIndex(
      (lessonItem: Lesson) => lessonItem.id === lesson.id,
    ) ?? -1;
  const previousLesson =
    currentIndex > 0 ? course.lessons?.[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < (course.lessons?.length ?? 0) - 1
      ? course.lessons?.[currentIndex + 1]
      : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              className="hover:text-foreground"
              href="/library"
            >
              Library
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              className="hover:text-foreground"
              href={`/learn/${course.slug}`}
            >
              {course.title}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{lesson.title}</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold">{lesson.title}</h1>
            {isCurrentLessonComplete ? (
              <div className="flex items-center gap-2 text-green-600 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            ) : (
              <Button
                disabled={isMarkingComplete}
                onClick={handleMarkComplete}
                size="sm"
                variant="outline"
              >
                {isMarkingComplete ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Mark Complete
              </Button>
            )}
          </div>

          {lesson.description && (
            <p className="text-lg text-muted-foreground">
              {lesson.description}
            </p>
          )}

          {/* Video Player Placeholder */}
          {lesson.videoUrl && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {/* eslint-disable-next-line react/iframe-missing-sandbox -- video embeds require scripts and same-origin */}
              <iframe
                allowFullScreen
                className="w-full h-full"
                src={lesson.videoUrl}
                title={lesson.title}
              />
            </div>
          )}

          {/* Lesson Content */}
          {lesson.content && (
            <Card>
              <CardContent className="py-6 prose dark:prose-invert max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: lesson.content.replaceAll('\n', '<br />'),
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t">
            {previousLesson ? (
              <Link href={`/learn/${course.slug}/${previousLesson.id}`}>
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous: {previousLesson.title}
                </Button>
              </Link>
            ) : (
              <div />
            )}
            {nextLesson ? (
              <Link href={`/learn/${course.slug}/${nextLesson.id}`}>
                <Button>
                  Next: {nextLesson.title}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href={`/learn/${course.slug}`}>
                <Button variant="secondary">Complete Course</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar - Lesson List */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-0">
              <div className="p-4 border-b space-y-3">
                <h3 className="font-semibold">Course Content</h3>
                <CourseProgressBar
                  completedCount={completedCount}
                  size="sm"
                  totalCount={totalLessons}
                />
              </div>
              <ScrollArea className="h-[500px]">
                <div className="p-2">
                  {course.lessons?.map((lessonItem: Lesson, index: number) => {
                    const isCompleted = completedLessonIds.has(lessonItem.id);
                    const isCurrent = lessonItem.id === lesson.id;

                    return (
                      <Link
                        href={`/learn/${course.slug}/${lessonItem.id}`}
                        key={lessonItem.id}
                      >
                        <div
                          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            isCurrent
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              isCompleted
                                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                : isCurrent
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="font-medium truncate text-sm">
                              {lessonItem.title}
                            </p>
                          </div>
                          {isCompleted && !isCurrent && (
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                          )}
                          {!isCompleted && !isCurrent && (
                            <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* eslint-enable react/no-danger */
