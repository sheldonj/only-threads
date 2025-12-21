'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useSession } from '@/lib/auth/client';
import { usePurchaseQueries } from '@/lib/hooks/use-models';
import { type Course, type Lesson } from '@/lib/zenstack/generated/models';
import { Loader2, Lock, PlayCircle } from 'lucide-react';

export type CourseWithLessons = Course & {
  lessons?: Array<Pick<Lesson, 'description' | 'id' | 'order' | 'title'>>;
};

export function CourseLessonList({
  course,
}: {
  readonly course: CourseWithLessons;
}) {
  const { data: session, isPending: isSessionPending } = useSession();
  const purchaseQueries = usePurchaseQueries();

  const { data: purchase, isLoading: isPurchaseLoading } =
    purchaseQueries.useFindFirst(
      {
        where: {
          courseId: course.id,
          userId: session?.user?.id ?? '',
        },
      },
      { enabled: Boolean(session) },
    );

  const isPurchased = Boolean(purchase);
  const isLoading = isSessionPending || isPurchaseLoading;

  return (
    <div className="space-y-2">
      {course.lessons && course.lessons.length > 0 ? (
        course.lessons.map((lesson, index) => (
          <Card key={lesson.id}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-grow">
                <h3 className="font-medium">{lesson.title}</h3>
                {lesson.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {lesson.description}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : isPurchased ? (
                  <PlayCircle className="h-5 w-5 text-primary" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-muted-foreground">No lessons available yet.</p>
      )}
    </div>
  );
}
