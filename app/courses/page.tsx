'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCourseQueries } from '@/lib/hooks/use-models';
import { BookOpen, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CourseCatalogPage() {
  const courseQueries = useCourseQueries();

  const { data: courses, isLoading } = courseQueries.useFindMany({
    include: {
      lessons: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
    where: { published: true },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Course Catalog</h1>
        <p className="text-muted-foreground">
          Browse our collection of courses and start learning today.
        </p>
      </div>

      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card
              className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow"
              key={course.id}
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
                <p className="text-muted-foreground line-clamp-3 mb-4">
                  {course.description || 'No description available.'}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.lessons?.length ?? 0} lessons</span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-2">
                  {course.price > 0 ? (
                    <Badge
                      className="text-lg"
                      variant="secondary"
                    >
                      ${(course.price / 100).toFixed(2)}
                    </Badge>
                  ) : (
                    <Badge variant="default">Free</Badge>
                  )}
                </div>
                <Link href={`/courses/${course.slug}`}>
                  <Button>View Course</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No courses available yet</h2>
          <p className="text-muted-foreground">Check back soon for new courses!</p>
        </div>
      )}
    </div>
  );
}
