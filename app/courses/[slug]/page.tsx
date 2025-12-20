'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSession } from '@/lib/auth/client';
import { useCourseQueries, usePurchaseQueries } from '@/lib/hooks/use-models';
import { BookOpen, CheckCircle, Clock, Loader2, Lock, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const courseQueries = useCourseQueries();
  const purchaseQueries = usePurchaseQueries();

  const { data: course, isLoading: isCourseLoading } = courseQueries.useFindFirst({
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        select: { description: true, id: true, order: true, title: true },
      },
    },
    where: { published: true, slug: params.slug },
  });

  const { data: purchase, isLoading: isPurchaseLoading } = purchaseQueries.useFindFirst(
    {
      where: {
        courseId: course?.id ?? '',
        userId: session?.user?.id ?? '',
      },
    },
    { enabled: Boolean(session && course) }
  );

  const isPurchased = Boolean(purchase);
  const isLoading = isCourseLoading || isPurchaseLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The course you&apos;re looking for doesn&apos;t exist or isn&apos;t published yet.
        </p>
        <Link href="/courses">
          <Button>Browse Courses</Button>
        </Link>
      </div>
    );
  }

  const handlePurchase = () => {
    if (!session) {
      router.push('/sign-in');
      return;
    }
    router.push(`/api/stripe/checkout?courseId=${course.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {course.coverImage && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <Image
                alt={course.title}
                className="object-cover"
                fill
                src={course.coverImage}
              />
            </div>
          )}

          <div>
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-muted-foreground text-lg">
              {course.description || 'No description available.'}
            </p>
          </div>

          <Separator />

          {/* Curriculum */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Curriculum</h2>
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
                        {isPurchased ? (
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
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <div className="flex items-center justify-between">
                {course.price > 0 ? (
                  <span className="text-3xl font-bold">${(course.price / 100).toFixed(2)}</span>
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
        </div>
      </div>
    </div>
  );
}
