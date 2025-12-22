'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { type Course } from '@/lib/zenstack/generated/models';
import { BookOpen, ExternalLink } from 'lucide-react';
import Link from 'next/link';

type CourseDetailsCardProps = {
  readonly course: Course;
};

export function CourseDetailsCard({ course }: CourseDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Details</CardTitle>
        <CardDescription>
          Information about the purchased course
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{course.title}</h3>
            <p className="text-sm text-muted-foreground">
              {course.description || 'No description available'}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                Slug: <span className="font-mono">/{course.slug}</span>
              </span>
              <span className="text-muted-foreground">
                Price: {formatCurrency(course.price)}
              </span>
              <Badge variant={course.published ? 'default' : 'secondary'}>
                {course.published ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/courses/${course.id}`}>
              <Button
                size="sm"
                variant="outline"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                View Course
              </Button>
            </Link>
            {course.published && (
              <Link
                href={`/courses/${course.slug}`}
                target="_blank"
              >
                <Button
                  size="sm"
                  variant="ghost"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Public Page
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(cents / 100);
}
