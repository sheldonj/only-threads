'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils/cn';

type CourseProgressBarProps = {
  readonly className?: string;
  readonly completedCount: number;
  readonly showLabel?: boolean;
  readonly size?: 'default' | 'sm';
  readonly totalCount: number;
};

export function CourseProgressBar({
  className,
  completedCount,
  showLabel = true,
  size = 'default',
  totalCount,
}: CourseProgressBarProps) {
  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {completedCount} of {totalCount} lessons
          </span>
          <span className="font-medium">{percentage}%</span>
        </div>
      )}
      <Progress
        className={cn(size === 'sm' && 'h-1.5')}
        value={percentage}
      />
    </div>
  );
}



