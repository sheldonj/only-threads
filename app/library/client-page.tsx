'use client';

import { EmptyLibrary } from './components/empty-library';
import { LibraryCourseCard } from './components/library-course-card';
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
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

export function LibraryPageClient() {
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
      new Set<string>(
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

              return (
                <LibraryCourseCard
                  completedLessonIds={completedLessonIds}
                  course={course}
                  key={purchase.id}
                  purchaseId={purchase.id}
                />
              );
            },
          )}
        </div>
      ) : (
        <EmptyLibrary />
      )}
    </div>
  );
}
