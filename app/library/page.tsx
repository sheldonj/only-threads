'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/lib/auth/client';
import { usePurchaseQueries } from '@/lib/hooks/use-models';
import { BookOpen, Loader2, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LibraryPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const purchaseQueries = usePurchaseQueries();

  const { data: purchases, isLoading: isPurchasesLoading } = purchaseQueries.useFindMany(
    {
      include: {
        course: true,
      },
      orderBy: { createdAt: 'desc' },
    },
    { enabled: Boolean(session) }
  );

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push('/sign-in');
    }
  }, [isSessionPending, session, router]);

  const isLoading = isSessionPending || isPurchasesLoading;

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
          {purchases.map((purchase) => {
            const course = purchase.course;
            if (!course) return null;

            return (
              <Card
                className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow"
                key={purchase.id}
              >
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
                <CardHeader>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground line-clamp-2 mb-4">
                    {course.description || 'No description available.'}
                  </p>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Link
                    className="w-full"
                    href={`/learn/${course.slug}`}
                  >
                    <Button className="w-full">
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Continue Learning
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No courses yet</h2>
          <p className="text-muted-foreground mb-8">
            You haven&apos;t purchased any courses yet. Browse our catalog to get started!
          </p>
          <Link href="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
