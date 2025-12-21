'use client';

import { CourseProgressBar } from '@/components/courses/progress-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from '@/lib/auth/client';
import {
  useCourseQueries,
  useLessonProgressQueries,
  usePurchaseQueries,
} from '@/lib/hooks/use-models';
import {
  type Lesson,
  type LessonProgress,
} from '@/lib/zenstack/generated/models';
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Loader2,
  Lock,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

// eslint-disable-next-line complexity -- UI component with multiple states
export default function LearnCoursePage() {
  const parameters = useParams<{ courseSlug: string }>();
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();

  const courseQueries = useCourseQueries();
  const purchaseQueries = usePurchaseQueries();
  const progressQueries = useLessonProgressQueries();

  const { data: course, isLoading: isCourseLoading } =
    courseQueries.useFindFirst({
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
      where: { slug: parameters.courseSlug },
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

  const completedCount = completedLessonIds.size;
  const totalLessons = course?.lessons?.length ?? 0;
  const isComplete = completedCount === totalLessons && totalLessons > 0;
  const hasStarted = completedCount > 0;

  // Find the next lesson to resume (first incomplete lesson)
  const resumeLesson = useMemo(() => {
    if (!course?.lessons) return null;
    // Find first incomplete lesson
    const nextIncomplete = course.lessons.find(
      (lessonItem: Lesson) => !completedLessonIds.has(lessonItem.id),
    );
    if (nextIncomplete) return nextIncomplete;
    // If all complete, return last lesson
    return course.lessons[course.lessons.length - 1];
  }, [course?.lessons, completedLessonIds]);

  const isLoading =
    isSessionPending ||
    isCourseLoading ||
    isPurchaseLoading ||
    isProgressLoading;
  const hasAccess = Boolean(purchase) || session?.user?.role === 'admin';

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push('/sign-in');
    }
  }, [isSessionPending, router, session]);

  useEffect(() => {
    if (!isLoading && course && !hasAccess) {
      router.push(`/courses/${course.slug}`);
    }
  }, [course, hasAccess, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || !course) {
    return null;
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

  const firstLesson = course.lessons?.[0];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <Link
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
          href="/library"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Library
        </Link>
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {course.title}
          </h1>
          <p className="text-muted-foreground text-lg">
            {course.lessons?.length ?? 0} lessons
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Welcome Card */}
        <div className="flex-1 min-w-0">
          <Card className="overflow-hidden border-border/50 shadow-xl">
            <CardContent className="p-0">
              {isComplete ? (
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10" />
                  <div className="relative p-8 md:p-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
                      <Trophy className="h-10 w-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                      Course Completed!
                    </h2>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg leading-relaxed">
                      Congratulations! You&apos;ve completed all lessons in{' '}
                      <span className="font-semibold text-foreground">
                        {course.title}
                      </span>
                      . Feel free to revisit any lesson or explore other
                      courses.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      {firstLesson && (
                        <Link href={`/learn/${course.slug}/${firstLesson.id}`}>
                          <Button
                            className="group"
                            size="lg"
                            variant="outline"
                          >
                            <RotateCcw className="mr-2 h-5 w-5 group-hover:-rotate-45 transition-transform" />
                            Review Course
                          </Button>
                        </Link>
                      )}
                      <Link href="/library">
                        <Button
                          className="group"
                          size="lg"
                        >
                          <Sparkles className="mr-2 h-5 w-5" />
                          Explore More Courses
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : hasStarted ? (
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10" />
                  <div className="relative p-8 md:p-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6">
                      <BookOpen className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                      Continue Learning
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto text-lg leading-relaxed">
                      You&apos;re making great progress! Keep going to complete{' '}
                      <span className="font-semibold text-foreground">
                        {course.title}
                      </span>
                      .
                    </p>
                    <div className="max-w-sm mx-auto mb-8">
                      <CourseProgressBar
                        completedCount={completedCount}
                        totalCount={totalLessons}
                      />
                    </div>
                    {resumeLesson && (
                      <Link href={`/learn/${course.slug}/${resumeLesson.id}`}>
                        <Button
                          className="group shadow-lg"
                          size="lg"
                        >
                          <PlayCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                          Resume: {resumeLesson.title}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10" />
                  <div className="relative p-8 md:p-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6">
                      <BookOpen className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                      Welcome to {course.title}
                    </h2>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg leading-relaxed">
                      {course.description ||
                        'Start learning by selecting a lesson from the sidebar.'}
                    </p>
                    {firstLesson && (
                      <Link href={`/learn/${course.slug}/${firstLesson.id}`}>
                        <Button
                          className="group shadow-lg"
                          size="lg"
                        >
                          <PlayCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                          Start First Lesson
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lesson List Sidebar */}
        <aside className="w-full lg:w-80 xl:w-96 shrink-0">
          <div className="lg:sticky lg:top-20">
            <Card className="overflow-hidden bg-sidebar border-sidebar-border shadow-xl">
              <CardContent className="p-0">
                {/* Header */}
                <div className="p-5 border-b border-sidebar-border bg-gradient-to-r from-sidebar to-sidebar/80">
                  <h3 className="font-bold text-sidebar-foreground text-lg mb-1">
                    Course Content
                  </h3>
                  {totalLessons > 0 && (
                    <CourseProgressBar
                      className="mt-3"
                      completedCount={completedCount}
                      size="sm"
                      totalCount={totalLessons}
                    />
                  )}
                </div>

                {/* Lesson List */}
                <ScrollArea className="max-h-[60vh] lg:max-h-[calc(100vh-14rem)]">
                  <div className="p-3 space-y-1">
                    {course.lessons && course.lessons.length > 0 ? (
                      course.lessons.map((lesson: Lesson, index: number) => {
                        const isCompleted = completedLessonIds.has(lesson.id);

                        return (
                          <Link
                            href={`/learn/${course.slug}/${lesson.id}`}
                            key={lesson.id}
                          >
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent/50 transition-all duration-200 text-sidebar-foreground">
                              <div
                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                                  isCompleted
                                    ? 'bg-green-500/20 text-green-500 dark:bg-green-500/30 dark:text-green-400'
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
                                <p className="font-medium truncate">
                                  {lesson.title}
                                </p>
                              </div>
                              {isCompleted && (
                                <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400 shrink-0" />
                              )}
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <p className="p-4 text-sidebar-foreground/60 text-center">
                        No lessons available yet.
                      </p>
                    )}
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
