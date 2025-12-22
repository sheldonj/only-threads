'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSession } from '@/lib/auth/client';
import { usePurchaseQueries } from '@/lib/hooks/use-models';
import { type Course, type Lesson } from '@/lib/zenstack/generated/models';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Clock,
  Loader2,
  PlayCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type CoursePurchaseCardProps = {
  readonly course: CourseWithLessons;
  readonly hasActivePrice: boolean;
};

type CourseWithLessons = Course & {
  lessons?: Array<Pick<Lesson, 'description' | 'id' | 'order' | 'title'>>;
};

export function CoursePurchaseCard({
  course,
  hasActivePrice,
}: CoursePurchaseCardProps) {
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
        ) : hasActivePrice ? (
          <Button
            className="w-full"
            onClick={handlePurchase}
            size="lg"
          >
            {course.price > 0 ? 'Purchase Course' : 'Enroll for Free'}
          </Button>
        ) : (
          <>
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Currently unavailable</span>
            </div>
            <Button
              className="w-full"
              disabled
              size="lg"
              variant="secondary"
            >
              Purchase Unavailable
            </Button>
          </>
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
