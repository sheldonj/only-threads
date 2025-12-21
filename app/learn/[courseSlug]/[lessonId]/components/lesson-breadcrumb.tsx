'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

type LessonBreadcrumbProps = {
  readonly courseSlug: string;
  readonly courseTitle: string;
  readonly lessonTitle: string;
};

export function LessonBreadcrumb({
  courseSlug,
  courseTitle,
  lessonTitle,
}: LessonBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link
        className="text-muted-foreground hover:text-primary transition-colors"
        href="/library"
      >
        Library
      </Link>
      <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
      <Link
        className="text-muted-foreground hover:text-primary transition-colors"
        href={`/learn/${courseSlug}`}
      >
        {courseTitle}
      </Link>
      <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
      <span className="text-foreground font-medium truncate max-w-[200px]">
        {lessonTitle}
      </span>
    </nav>
  );
}
