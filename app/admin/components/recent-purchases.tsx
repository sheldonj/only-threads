'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserHoverCard } from '@/components/user-hover-card';
import { usePurchaseQueries } from '@/lib/hooks/use-models';
import { format } from 'date-fns';

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(cents / 100);
}

export function RecentPurchases() {
  const purchaseQueries = usePurchaseQueries();
  const { data: purchases, isLoading } = purchaseQueries.useFindMany({
    include: {
      course: { select: { title: true } },
      user: { select: { email: true, image: true, name: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Purchases</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                className="h-12 w-full"
                key={i}
              />
            ))}
          </div>
        ) : purchases && purchases.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>
                    <UserHoverCard
                      email={purchase.user?.email}
                      image={purchase.user?.image}
                      name={purchase.user?.name}
                      role={purchase.user?.role}
                      showEmail
                    />
                  </TableCell>
                  <TableCell>{purchase.course?.title ?? 'Unknown'}</TableCell>
                  <TableCell>{formatCurrency(purchase.amount)}</TableCell>
                  <TableCell>
                    {format(new Date(purchase.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No purchases yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}

