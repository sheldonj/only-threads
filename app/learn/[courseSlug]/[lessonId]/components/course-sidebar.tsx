'use client';

import { CourseProgressBar } from '@/components/courses/progress-bar';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Lesson } from '@/lib/zenstack/generated/models';
import { Check, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

type CourseSidebarProps = {
  readonly completedCount: number;
  readonly completedLessonIds: Set<string>;
  readonly courseSlug: string;
  readonly currentLessonId: string;
  readonly lessons: Array<Pick<Lesson, 'id' | 'order' | 'title'>>;
  readonly totalCount: number;
};

export function CourseSidebar({
  completedCount,
  completedLessonIds,
  courseSlug,
  currentLessonId,
  lessons,
  totalCount,
}: CourseSidebarProps) {
  return (
    <aside className="w-full lg:w-80 xl:w-96 shrink-0 order-first lg:order-last">
      <div className="lg:sticky lg:top-20">
        <Card className="overflow-hidden bg-sidebar border-sidebar-border shadow-xl">
          <CardContent className="p-0">
            {/* Header */}
            <div className="p-5 border-b border-sidebar-border bg-gradient-to-r from-sidebar to-sidebar/80">
              <h3 className="font-bold text-sidebar-foreground text-lg mb-1">
                Course Content
              </h3>
              <CourseProgressBar
                className="mt-3"
                completedCount={completedCount}
                size="sm"
                totalCount={totalCount}
              />
            </div>

            {/* Lesson List */}
            <ScrollArea className="max-h-[60vh] lg:max-h-[calc(100vh-14rem)]">
              <div className="p-3 space-y-1">
                {lessons.map((lessonItem, index) => {
                  const isCompleted = completedLessonIds.has(lessonItem.id);
                  const isCurrent = lessonItem.id === currentLessonId;

                  return (
                    <Link
                      href={`/learn/${courseSlug}/${lessonItem.id}`}
                      key={lessonItem.id}
                    >
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                          isCurrent
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-md ring-1 ring-sidebar-primary/20'
                            : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                            isCompleted
                              ? 'bg-green-500/20 text-green-500 dark:bg-green-500/30 dark:text-green-400'
                              : isCurrent
                                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                                : 'bg-sidebar-accent/50 text-sidebar-foreground/70'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p
                            className={`font-medium truncate text-sm ${
                              isCurrent ? 'text-sidebar-accent-foreground' : ''
                            }`}
                          >
                            {lessonItem.title}
                          </p>
                        </div>
                        {isCompleted && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400 shrink-0" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
