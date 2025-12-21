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
import { type Course, type Lesson } from '@/lib/zenstack/generated/models';
import { BookOpen, CheckCircle2, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type LibraryCourseCardProps = {
  readonly completedLessonIds: Set<string>;
  readonly course: Course & { lessons?: Lesson[] };
  readonly purchaseId: string;
};

export function LibraryCourseCard({
  completedLessonIds,
  course,
  purchaseId,
}: LibraryCourseCardProps) {
  const totalLessons = course.lessons?.length ?? 0;
  const completedCount =
    course.lessons?.filter((lesson: Lesson) =>
      completedLessonIds.has(lesson.id),
    ).length ?? 0;
  const isComplete = completedCount === totalLessons && totalLessons > 0;
  const hasStarted = completedCount > 0;

  return (
    <Card
      className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow"
      key={purchaseId}
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
        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
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
}
