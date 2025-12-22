'use client';

import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { type LessonProgress } from '@/lib/zenstack/generated/models';
import { BookOpen, Calendar, Clock, DollarSign, TrendingUp } from 'lucide-react';

type ContentConsumptionCardProps = {
  readonly amount: number;
  readonly lessonProgress: LessonProgress[];
  readonly purchaseDate: Date | string;
  readonly totalLessons: number;
};

export function ContentConsumptionCard({
  amount,
  lessonProgress,
  purchaseDate,
  totalLessons,
}: ContentConsumptionCardProps) {
  const completedLessons = lessonProgress.filter((lp) => lp.completed).length;
  const progressPercentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const daysSincePurchase = getDaysSincePurchase(purchaseDate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Content Consumption
        </CardTitle>
        <CardDescription>
          Context to help evaluate this refund request
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Course Progress</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress
            className="h-2"
            value={progressPercentage}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatItem
            icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
            label="Lessons Completed"
            value={`${completedLessons} / ${totalLessons}`}
          />
          <StatItem
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
            label="Days Since Purchase"
            value={daysSincePurchase.toString()}
          />
          <StatItem
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            label="Amount Paid"
            value={formatCurrency(amount)}
          />
          <StatItem
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            label="Purchase Date"
            value={formatDate(purchaseDate)}
          />
        </div>

        {/* Assessment */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <Label className="text-xs text-muted-foreground">Assessment</Label>
          <p className="text-sm">
            {getAssessmentText(progressPercentage, daysSincePurchase)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatItem({
  icon,
  label,
  value,
}: {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function getDaysSincePurchase(purchaseDate: Date | string): number {
  const purchase = new Date(purchaseDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - purchase.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getAssessmentText(
  progressPercentage: number,
  daysSincePurchase: number,
): string {
  if (progressPercentage === 0) {
    if (daysSincePurchase <= 7) {
      return 'Customer has not started the course. Recent purchase - standard refund policy may apply.';
    }
    return 'Customer has not started the course despite having access for some time.';
  }

  if (progressPercentage < 25) {
    return 'Customer has begun the course but completed less than a quarter of the content.';
  }

  if (progressPercentage < 50) {
    return 'Customer has completed a significant portion of the course (25-50%). Consider the refund reason carefully.';
  }

  if (progressPercentage < 75) {
    return 'Customer has completed over half the course. Substantial content has been consumed.';
  }

  return 'Customer has completed most or all of the course content. High consumption before refund request.';
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(cents / 100);
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

