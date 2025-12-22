'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { client } from '@/lib/auth/client';
import {
  useCourseQueries,
  useLessonProgressQueries,
  usePurchaseQueries,
} from '@/lib/hooks/use-models';
import { type Purchase } from '@/lib/zenstack/generated/models';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, CheckCircle, DollarSign, Users } from 'lucide-react';

export function StatsCards() {
  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryFn: async () => {
      const data = await client.admin.listUsers(
        { query: { limit: 250 } },
        { throw: true },
      );
      return data?.users || [];
    },
    queryKey: ['admin-users-count'],
  });

  const courseQueries = useCourseQueries();
  const { data: courses, isLoading: isCoursesLoading } =
    courseQueries.useFindMany({});

  const purchaseQueries = usePurchaseQueries();
  const { data: purchases, isLoading: isPurchasesLoading } =
    purchaseQueries.useFindMany({});

  const progressQueries = useLessonProgressQueries();
  const { data: completions, isLoading: isCompletionsLoading } =
    progressQueries.useFindMany({
      where: { completed: true },
    });

  const totalRevenue =
    purchases?.reduce(
      (sum: number, purchase: Purchase) => sum + purchase.amount,
      0,
    ) ?? 0;

  const stats = [
    {
      icon: Users,
      isLoading: isUsersLoading,
      title: 'Total Users',
      value: users?.length ?? 0,
    },
    {
      icon: BookOpen,
      isLoading: isCoursesLoading,
      title: 'Total Courses',
      value: courses?.length ?? 0,
    },
    {
      icon: DollarSign,
      isLoading: isPurchasesLoading,
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
    },
    {
      icon: CheckCircle,
      isLoading: isCompletionsLoading,
      title: 'Lesson Completions',
      value: completions?.length ?? 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            {stat.isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{stat.value}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(cents / 100);
}
