'use client';

import { CourseProgressBar } from '@/components/courses/progress-bar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSession } from '@/lib/auth/client';
import {
  useLessonProgressQueries,
  usePurchaseQueries,
} from '@/lib/hooks/use-models';
import {
  type Course,
  type Lesson,
  type LessonProgress,
  type Purchase,
} from '@/lib/zenstack/generated/models';
import { BookOpen, CheckCircle2, Loader2, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

export default function LibraryPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const purchaseQueries = usePurchaseQueries();
  const progressQueries = useLessonProgressQueries();

  const { data: purchases, isLoading: isPurchasesLoading } =
    purchaseQueries.useFindMany(
      {
        include: {
          course: {
            include: {
              lessons: {
                select: { id: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      { enabled: Boolean(session) },
    );

  // Get all lesson IDs from all purchased courses
  const allLessonIds = useMemo(() => {
    if (!purchases) return [];
    return purchases.flatMap(
      (purchase: Purchase & { course?: Course & { lessons?: Lesson[] } }) =>
        purchase.course?.lessons?.map((lesson: Lesson) => lesson.id) ?? [],
    );
  }, [purchases]);

  // Fetch all progress records for the user
  const { data: allProgress, isLoading: isProgressLoading } =
    progressQueries.useFindMany(
      {
        where: {
          completed: true,
          lessonId: { in: allLessonIds },
          userId: session?.user?.id ?? '',
        },
      },
      { enabled: Boolean(session && allLessonIds.length > 0) },
    );

  // Create a Set of completed lesson IDs for quick lookup
  const completedLessonIds = useMemo(
    () =>
      new Set(
        allProgress?.map((progress: LessonProgress) => progress.lessonId) ?? [],
      ),
    [allProgress],
  );

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push('/sign-in');
    }
  }, [isSessionPending, router, session]);

  const isLoading = isSessionPending || isPurchasesLoading || isProgressLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Library</h1>
        <p className="text-muted-foreground">
          Access your purchased courses and continue learning.
        </p>
      </div>

      {purchases && purchases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchases.map(
            (
              purchase: Purchase & {
                course?: Course & { lessons?: Lesson[] };
              },
            ) => {
              const course = purchase.course;
              if (!course) return null;

              const totalLessons = course.lessons?.length ?? 0;
              const completedCount =
                course.lessons?.filter((lesson: Lesson) =>
                  completedLessonIds.has(lesson.id),
                ).length ?? 0;
              const isComplete =
                completedCount === totalLessons && totalLessons > 0;
              const hasStarted = completedCount > 0;

              return (
                <Card
                  className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow"
                  key={purchase.id}
                >
                  <div className="relative">
                    {course.coverImage ? (
                      <div className="relative h-48 w-full">
                        <Image
                          alt={course.title}
                          className="object-cover"
                          fill
                          src={course.coverImage}
                        />
                      </div>
                    ) : (
                      <div className="h-48 w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-primary/40" />
                      </div>
                    )}
                    {isComplete && (
                      <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <p className="text-muted-foreground line-clamp-2">
                      {course.description || 'No description available.'}
                    </p>
                    {totalLessons > 0 && (
                      <CourseProgressBar
                        completedCount={completedCount}
                        size="sm"
                        totalCount={totalLessons}
                      />
                    )}
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Link
                      className="w-full"
                      href={`/learn/${course.slug}`}
                    >
                      <Button
                        className="w-full"
                        variant={isComplete ? 'outline' : 'default'}
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        {isComplete
                          ? 'Review Course'
                          : hasStarted
                            ? 'Continue Learning'
                            : 'Start Course'}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            },
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No courses yet</h2>
          <p className="text-muted-foreground mb-8">
            You haven&apos;t purchased any courses yet. Browse our catalog to
            get started!
          </p>
          <Link href="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
