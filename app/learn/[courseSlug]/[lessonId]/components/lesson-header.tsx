'use client';

import { Button } from '@/components/ui/button';
import { Check, CheckCircle2, Loader2 } from 'lucide-react';

type LessonHeaderProps = {
  readonly description?: null | string;
  readonly isComplete: boolean;
  readonly isMarkingComplete: boolean;
  readonly onMarkComplete: () => void;
  readonly title: string;
};

export function LessonHeader({
  description,
  isComplete,
  isMarkingComplete,
  onMarkComplete,
  title,
}: LessonHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {isComplete ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full shrink-0">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-semibold">Completed</span>
          </div>
        ) : (
          <Button
            className="shrink-0 group"
            disabled={isMarkingComplete}
            onClick={onMarkComplete}
            size="lg"
            variant="outline"
          >
            {isMarkingComplete ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            )}
            Mark Complete
          </Button>
        )}
      </div>
    </div>
  );
}
