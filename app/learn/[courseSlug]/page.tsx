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
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  Loader2,
  Lock,
  PlayCircle,
  RotateCcw,
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
        <Loader2 className="h-8 w-8 animate-spin" />
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          className="text-primary hover:underline text-sm"
          href="/library"
        >
          ← Back to Library
        </Link>
        <h1 className="text-3xl font-bold mt-4">{course.title}</h1>
        <p className="text-muted-foreground mt-2">
          {course.lessons?.length ?? 0} lessons
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Welcome Card */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="py-12 text-center">
              {isComplete ? (
                <>
                  <CheckCircle2 className="h-16 w-16 mx-auto text-green-600 mb-6" />
                  <h2 className="text-2xl font-semibold mb-4">
                    Course Completed!
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Congratulations! You&apos;ve completed all lessons in{' '}
                    {course.title}. Feel free to revisit any lesson or explore
                    other courses.
                  </p>
                  {firstLesson && (
                    <Link href={`/learn/${course.slug}/${firstLesson.id}`}>
                      <Button
                        size="lg"
                        variant="outline"
                      >
                        <RotateCcw className="mr-2 h-5 w-5" />
                        Review Course
                      </Button>
                    </Link>
                  )}
                </>
              ) : hasStarted ? (
                <>
                  <BookOpen className="h-16 w-16 mx-auto text-primary mb-6" />
                  <h2 className="text-2xl font-semibold mb-4">
                    Continue Learning
                  </h2>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    You&apos;re making great progress! Keep going to complete{' '}
                    {course.title}.
                  </p>
                  <div className="max-w-xs mx-auto mb-8">
                    <CourseProgressBar
                      completedCount={completedCount}
                      totalCount={totalLessons}
                    />
                  </div>
                  {resumeLesson && (
                    <Link href={`/learn/${course.slug}/${resumeLesson.id}`}>
                      <Button size="lg">
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Resume: {resumeLesson.title}
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <BookOpen className="h-16 w-16 mx-auto text-primary mb-6" />
                  <h2 className="text-2xl font-semibold mb-4">
                    Welcome to {course.title}
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    {course.description ||
                      'Start learning by selecting a lesson from the sidebar.'}
                  </p>
                  {firstLesson && (
                    <Link href={`/learn/${course.slug}/${firstLesson.id}`}>
                      <Button size="lg">
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Start First Lesson
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lesson List */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b space-y-3">
                <h3 className="font-semibold">Course Content</h3>
                {totalLessons > 0 && (
                  <CourseProgressBar
                    completedCount={completedCount}
                    size="sm"
                    totalCount={totalLessons}
                  />
                )}
              </div>
              <ScrollArea className="h-[400px]">
                <div className="p-2">
                  {course.lessons && course.lessons.length > 0 ? (
                    course.lessons.map((lesson: Lesson, index: number) => {
                      const isCompleted = completedLessonIds.has(lesson.id);

                      return (
                        <Link
                          href={`/learn/${course.slug}/${lesson.id}`}
                          key={lesson.id}
                        >
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                isCompleted
                                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-primary/10'
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
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                            )}
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <p className="p-4 text-muted-foreground text-center">
                      No lessons available yet.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
