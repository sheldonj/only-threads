'use client';

import { type PurchaseWithRelations } from '../client-page';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { CreditCard, ExternalLink, RotateCcw } from 'lucide-react';
import Link from 'next/link';

type PaymentDetailsCardProps = {
  readonly canRefund: boolean;
  readonly onRefundClick: () => void;
  readonly purchase: PurchaseWithRelations;
};

export function PaymentDetailsCard({
  canRefund,
  onRefundClick,
  purchase,
}: PaymentDetailsCardProps) {
  const stripePaymentUrl = purchase.stripePaymentId
    ? `https://dashboard.stripe.com/payments/${purchase.stripePaymentId}`
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>Transaction and payment information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Purchase ID</span>
            <span className="font-mono text-xs">{purchase.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Stripe Payment ID</span>
            <span className="font-mono text-xs">
              {purchase.stripePaymentId || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">List Price</span>
            <span className="font-medium">
              {formatCurrency(purchase.coursePrice?.price ?? purchase.amount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="font-medium">
              {formatCurrency(purchase.amount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Purchase Date</span>
            <span>
              {format(new Date(purchase.createdAt), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
          {purchase.refundedAt && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Refunded Date</span>
              <span className="text-destructive">
                {format(new Date(purchase.refundedAt), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex flex-wrap gap-2">
          {stripePaymentUrl && (
            <Link
              href={stripePaymentUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Button
                size="sm"
                variant="outline"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                View in Stripe
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          )}
          {canRefund && (
            <Button
              onClick={onRefundClick}
              size="sm"
              variant="destructive"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Process Refund
            </Button>
          )}
        </div>
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
