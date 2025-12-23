'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  type Course,
  type Lesson,
  type Purchase,
} from '@/lib/zenstack/generated/models';
import { BookOpen, Eye, Loader2, Pencil, Trash } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type CourseTableProps = {
  readonly courses: CourseWithRelations[];
  readonly isDeleting: boolean;
  readonly onDelete: (id: string) => void;
};

type CourseWithRelations = Course & {
  lessons?: Lesson[];
  purchases?: Purchase[];
};

export function CourseTable({
  courses,
  isDeleting,
  onDelete,
}: CourseTableProps) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Lessons</TableHead>
          <TableHead>Purchases</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((courseRow) => (
          <TableRow key={courseRow.id}>
            <TableCell className="font-medium">
              <Link
                className="hover:underline hover:text-primary transition-colors"
                href={`/admin/courses/${courseRow.id}`}
              >
                {courseRow.title}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {courseRow.slug}
            </TableCell>
            <TableCell>${(courseRow.price / 100).toFixed(2)}</TableCell>
            <TableCell>{courseRow.lessons?.length ?? 0}</TableCell>
            <TableCell>{courseRow.purchases?.length ?? 0}</TableCell>
            <TableCell>
              {courseRow.published ? (
                <Badge variant="default">Published</Badge>
              ) : (
                <Badge variant="secondary">Draft</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => router.push(`/admin/courses/${courseRow.id}`)}
                  size="sm"
                  title="View Details"
                  variant="outline"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() =>
                    router.push(`/admin/courses/${courseRow.id}/lessons`)
                  }
                  size="sm"
                  title="Manage Lessons"
                  variant="outline"
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() =>
                    router.push(`/admin/courses/${courseRow.id}/edit`)
                  }
                  size="sm"
                  title="Edit Course"
                  variant="outline"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  disabled={isDeleting}
                  onClick={() => onDelete(courseRow.id)}
                  size="sm"
                  title="Delete Course"
                  variant="destructive"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
