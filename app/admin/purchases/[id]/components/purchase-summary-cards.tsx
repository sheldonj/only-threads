'use client';

import { type PurchaseWithRelations } from '../client-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { BookOpen, Calendar, DollarSign, User } from 'lucide-react';

type PurchaseSummaryCardsProps = {
  readonly purchase: PurchaseWithRelations;
};

export function PurchaseSummaryCards({ purchase }: PurchaseSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Amount</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(purchase.amount)}
          </div>
          <p className="text-xs text-muted-foreground">
            {purchase.refundedAt ? 'Refunded' : 'Paid'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Date</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {format(new Date(purchase.createdAt), 'MMM d')}
          </div>
          <p className="text-xs text-muted-foreground">
            {format(new Date(purchase.createdAt), 'yyyy')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Course</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold truncate">
            {purchase.course?.title || 'Unknown'}
          </div>
          <p className="text-xs text-muted-foreground">
            {purchase.course?.slug ? `/${purchase.course.slug}` : 'N/A'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Customer</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold truncate">
            {purchase.user?.name || 'Unknown'}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {purchase.user?.email || 'N/A'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(cents / 100);
}
