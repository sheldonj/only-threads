'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from '@/lib/auth/client';
import { useCourseQueries, usePurchaseQueries } from '@/lib/hooks/use-models';
import { BookOpen, ChevronRight, Loader2, Lock, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LearnCoursePage() {
  const params = useParams<{ courseSlug: string }>();
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();

  const courseQueries = useCourseQueries();
  const purchaseQueries = usePurchaseQueries();

  const { data: course, isLoading: isCourseLoading } = courseQueries.useFindFirst({
    include: {
      lessons: {
        orderBy: { order: 'asc' },
      },
    },
    where: { slug: params.courseSlug },
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

  const isLoading = isSessionPending || isCourseLoading || isPurchaseLoading;
  const hasAccess = Boolean(purchase) || session?.user?.role === 'admin';

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push('/sign-in');
    }
  }, [isSessionPending, session, router]);

  useEffect(() => {
    if (!isLoading && course && !hasAccess) {
      router.push(`/courses/${course.slug}`);
    }
  }, [isLoading, course, hasAccess, router]);

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
        <p className="text-muted-foreground mt-2">{course.lessons?.length ?? 0} lessons</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Welcome Card */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto text-primary mb-6" />
              <h2 className="text-2xl font-semibold mb-4">Welcome to {course.title}</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {course.description || 'Start learning by selecting a lesson from the sidebar.'}
              </p>
              {firstLesson && (
                <Link href={`/learn/${course.slug}/${firstLesson.id}`}>
                  <Button size="lg">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Start First Lesson
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lesson List */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Course Content</h3>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="p-2">
                  {course.lessons && course.lessons.length > 0 ? (
                    course.lessons.map((lesson, index) => (
                      <Link
                        href={`/learn/${course.slug}/${lesson.id}`}
                        key={lesson.id}
                      >
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="font-medium truncate">{lesson.title}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </Link>
                    ))
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
