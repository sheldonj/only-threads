'use client';

import { Button } from '@/components/ui/button';
import { type Lesson } from '@/lib/zenstack/generated/models';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

type LessonNavigationProps = {
  readonly courseSlug: string;
  readonly nextLesson: null | Pick<Lesson, 'id' | 'title'>;
  readonly previousLesson: null | Pick<Lesson, 'id' | 'title'>;
};

export function LessonNavigation({
  courseSlug,
  nextLesson,
  previousLesson,
}: LessonNavigationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-8 border-t border-border/50">
      {previousLesson ? (
        <Link
          className="flex-1 sm:flex-initial"
          href={`/learn/${courseSlug}/${previousLesson.id}`}
        >
          <Button
            className="w-full sm:w-auto group"
            size="lg"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="truncate max-w-[150px] md:max-w-[200px]">
              {previousLesson.title}
            </span>
          </Button>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
      {nextLesson ? (
        <Link
          className="flex-1 sm:flex-initial"
          href={`/learn/${courseSlug}/${nextLesson.id}`}
        >
          <Button
            className="w-full sm:w-auto group bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            size="lg"
          >
            <span className="mr-2">Next:</span>
            <span className="truncate max-w-[150px] md:max-w-[200px]">
              {nextLesson.title}
            </span>
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      ) : (
        <Link
          className="flex-1 sm:flex-initial"
          href={`/learn/${courseSlug}`}
        >
          <Button
            className="w-full sm:w-auto group"
            size="lg"
            variant="secondary"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Complete Course
          </Button>
        </Link>
      )}
    </div>
  );
}
