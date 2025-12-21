import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { type Course, type Lesson } from '@/lib/zenstack/generated/models';
import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type CourseCatalogCardProps = {
  readonly course: Course & { lessons?: Array<Pick<Lesson, 'id'>> };
};

export function CourseCatalogCard({ course }: CourseCatalogCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
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
  );
}
