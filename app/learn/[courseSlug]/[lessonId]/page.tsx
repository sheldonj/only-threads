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
  Loader2,
  Lock,
  Sparkles,
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <div className="min-h-screen">
      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm">
            <Link
              className="text-muted-foreground hover:text-primary transition-colors"
              href="/library"
            >
              Library
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            <Link
              className="text-muted-foreground hover:text-primary transition-colors"
              href={`/learn/${course.slug}`}
            >
              {course.title}
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {lesson.title}
            </span>
          </nav>

          {/* Lesson Header */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {lesson.title}
                </h1>
                {lesson.description && (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {lesson.description}
                  </p>
                )}
              </div>
              {isCurrentLessonComplete ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-semibold">Completed</span>
                </div>
              ) : (
                <Button
                  className="shrink-0 group"
                  disabled={isMarkingComplete}
                  onClick={handleMarkComplete}
                  size="lg"
                  variant="outline"
                >
                  {isMarkingComplete ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  )}
                  Mark Complete
                </Button>
              )}
            </div>
          </div>

          {/* Video Player */}
          {lesson.videoUrl && (
            <div className="aspect-video bg-black/90 rounded-xl overflow-hidden shadow-xl ring-1 ring-white/10">
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
            <Card className="overflow-hidden border-border/50 shadow-lg">
              <CardContent className="p-6 md:p-8 prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-code:text-primary">
                <div
                  dangerouslySetInnerHTML={{
                    __html: lesson.content.replaceAll('\n', '<br />'),
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-8 border-t border-border/50">
            {previousLesson ? (
              <Link
                className="flex-1 sm:flex-initial"
                href={`/learn/${course.slug}/${previousLesson.id}`}
              >
                <Button
                  className="w-full sm:w-auto group"
                  size="lg"
                  variant="outline"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="truncate max-w-[150px] md:max-w-[200px]">
                    {previousLesson.title}
                  </span>
                </Button>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}
            {nextLesson ? (
              <Link
                className="flex-1 sm:flex-initial"
                href={`/learn/${course.slug}/${nextLesson.id}`}
              >
                <Button
                  className="w-full sm:w-auto group bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                  size="lg"
                >
                  <span className="mr-2">Next:</span>
                  <span className="truncate max-w-[150px] md:max-w-[200px]">
                    {nextLesson.title}
                  </span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : (
              <Link
                className="flex-1 sm:flex-initial"
                href={`/learn/${course.slug}`}
              >
                <Button
                  className="w-full sm:w-auto group"
                  size="lg"
                  variant="secondary"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Complete Course
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar - Course Content */}
        <aside className="w-full lg:w-80 xl:w-96 shrink-0 order-first lg:order-last">
          <div className="lg:sticky lg:top-20">
            <Card className="overflow-hidden bg-sidebar border-sidebar-border shadow-xl">
              <CardContent className="p-0">
                {/* Header */}
                <div className="p-5 border-b border-sidebar-border bg-gradient-to-r from-sidebar to-sidebar/80">
                  <h3 className="font-bold text-sidebar-foreground text-lg mb-1">
                    Course Content
                  </h3>
                  <CourseProgressBar
                    className="mt-3"
                    completedCount={completedCount}
                    size="sm"
                    totalCount={totalLessons}
                  />
                </div>

                {/* Lesson List */}
                <ScrollArea className="max-h-[60vh] lg:max-h-[calc(100vh-14rem)]">
                  <div className="p-3 space-y-1">
                    {course.lessons?.map((lessonItem: Lesson, index: number) => {
                      const isCompleted = completedLessonIds.has(lessonItem.id);
                      const isCurrent = lessonItem.id === lesson.id;

                      return (
                        <Link
                          href={`/learn/${course.slug}/${lessonItem.id}`}
                          key={lessonItem.id}
                        >
                          <div
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                              isCurrent
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-md ring-1 ring-sidebar-primary/20'
                                : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                            }`}
                          >
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                                isCompleted
                                  ? 'bg-green-500/20 text-green-500 dark:bg-green-500/30 dark:text-green-400'
                                  : isCurrent
                                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                                    : 'bg-sidebar-accent/50 text-sidebar-foreground/70'
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div className="flex-grow min-w-0">
                              <p
                                className={`font-medium truncate text-sm ${
                                  isCurrent ? 'text-sidebar-accent-foreground' : ''
                                }`}
                              >
                                {lessonItem.title}
                              </p>
                            </div>
                            {isCompleted && (
                              <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400 shrink-0" />
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
        </aside>
      </div>
    </div>
  );
}

/* eslint-enable react/no-danger */
