'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSession } from '@/lib/auth/client';
import { usePurchaseQueries } from '@/lib/hooks/use-models';
import { type Course, type Lesson } from '@/lib/zenstack/generated/models';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Loader2,
  Lock,
  PlayCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type CourseWithLessons = Course & {
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

export function CoursePurchaseCard({
  course,
}: {
  readonly course: CourseWithLessons;
}) {
  const router = useRouter();
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

  const handlePurchase = () => {
    if (!session) {
      router.push('/sign-in');
      return;
    }

    router.push(`/api/stripe/checkout?courseId=${course.id}`);
  };

  if (isLoading) {
    return (
      <Card className="sticky top-24">
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <div className="flex items-center justify-between">
          {course.price > 0 ? (
            <span className="text-3xl font-bold">
              ${(course.price / 100).toFixed(2)}
            </span>
          ) : (
            <Badge
              className="text-lg px-4 py-1"
              variant="default"
            >
              Free
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPurchased ? (
          <>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">You own this course</span>
            </div>
            <Link href={`/learn/${course.slug}`}>
              <Button
                className="w-full"
                size="lg"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Start Learning
              </Button>
            </Link>
          </>
        ) : (
          <Button
            className="w-full"
            onClick={handlePurchase}
            size="lg"
          >
            {course.price > 0 ? 'Purchase Course' : 'Enroll for Free'}
          </Button>
        )}

        <Separator />

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span>{course.lessons?.length ?? 0} lessons</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Self-paced learning</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
