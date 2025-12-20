'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from '@/lib/auth/client';
import { useCourseQueries, useLessonQueries, usePurchaseQueries } from '@/lib/hooks/use-models';
import { ArrowLeft, ArrowRight, ChevronRight, Loader2, Lock } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LessonPage() {
  const params = useParams<{ courseSlug: string; lessonId: string }>();
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();

  const courseQueries = useCourseQueries();
  const lessonQueries = useLessonQueries();
  const purchaseQueries = usePurchaseQueries();

  const { data: course, isLoading: isCourseLoading } = courseQueries.useFindFirst({
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        select: { id: true, order: true, title: true },
      },
    },
    where: { slug: params.courseSlug },
  });

  const { data: lesson, isLoading: isLessonLoading } = lessonQueries.useFindUnique({
    where: { id: params.lessonId },
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

  const isLoading = isSessionPending || isCourseLoading || isLessonLoading || isPurchaseLoading;
  const hasAccess = Boolean(purchase) || session?.user?.role === 'admin';

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push('/sign-in');
    }
  }, [isSessionPending, session, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
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
  const currentIndex = course.lessons?.findIndex((l) => l.id === lesson.id) ?? -1;
  const prevLesson = currentIndex > 0 ? course.lessons?.[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < (course.lessons?.length ?? 0) - 1 ? course.lessons?.[currentIndex + 1] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              className="hover:text-foreground"
              href="/library"
            >
              Library
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              className="hover:text-foreground"
              href={`/learn/${course.slug}`}
            >
              {course.title}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{lesson.title}</span>
          </div>

          <h1 className="text-3xl font-bold">{lesson.title}</h1>

          {lesson.description && (
            <p className="text-lg text-muted-foreground">{lesson.description}</p>
          )}

          {/* Video Player Placeholder */}
          {lesson.videoUrl && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
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
            <Card>
              <CardContent className="py-6 prose dark:prose-invert max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, '<br />') }}
                />
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t">
            {prevLesson ? (
              <Link href={`/learn/${course.slug}/${prevLesson.id}`}>
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous: {prevLesson.title}
                </Button>
              </Link>
            ) : (
              <div />
            )}
            {nextLesson ? (
              <Link href={`/learn/${course.slug}/${nextLesson.id}`}>
                <Button>
                  Next: {nextLesson.title}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href={`/learn/${course.slug}`}>
                <Button variant="secondary">Complete Course</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar - Lesson List */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Course Content</h3>
              </div>
              <ScrollArea className="h-[500px]">
                <div className="p-2">
                  {course.lessons?.map((l, index) => (
                    <Link
                      href={`/learn/${course.slug}/${l.id}`}
                      key={l.id}
                    >
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          l.id === lesson.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            l.id === lesson.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-medium truncate text-sm">{l.title}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
