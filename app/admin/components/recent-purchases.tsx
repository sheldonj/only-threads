'use client';

import { Button } from '@/components/ui/button';
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
import {
  type Course,
  type Purchase,
  type User,
} from '@/lib/zenstack/generated/models';
import { format } from 'date-fns';
import { ArrowRight, Eye } from 'lucide-react';
import Link from 'next/link';

type PurchaseWithRelations = Purchase & {
  course?: Pick<Course, 'title'>;
  user?: Pick<User, 'email' | 'image' | 'name' | 'role'>;
};

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
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <CardTitle>Recent Purchases</CardTitle>
          <Button
            asChild
            size="sm"
            variant="ghost"
          >
            <Link href="/admin/purchases">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, index) => `skeleton-${index}`).map(
              (key) => (
                <Skeleton
                  className="h-12 w-full"
                  key={key}
                />
              ),
            )}
          </div>
        ) : purchases && purchases.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(purchases as PurchaseWithRelations[]).map((purchase) => (
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
                  <TableCell>
                    <Link
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      href={`/admin/purchases/${purchase.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
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

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(cents / 100);
}
