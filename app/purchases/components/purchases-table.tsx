'use client';

import { RefundRequestDialog } from './refund-request-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  type Course,
  type Purchase,
  type RefundRequest,
} from '@/lib/zenstack/generated/models';
import { Loader2, MoreHorizontal, Receipt, RotateCcw, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

type CancelRefundMenuItemProps = {
  readonly cancellingId: null | string;
  readonly onCancel: (refundRequestId: string) => void;
  readonly refundRequest: null | RefundRequest | undefined;
};

type PurchasesTableProps = {
  readonly onRefresh: () => void;
  readonly purchases: PurchaseWithRelations[];
};

type PurchaseWithRelations = Purchase & {
  course?: Course;
  refundRequest?: null | RefundRequest;
};

export function PurchasesTable({ onRefresh, purchases }: PurchasesTableProps) {
  const [selectedPurchase, setSelectedPurchase] =
    useState<null | PurchaseWithRelations>(null);
  const [cancellingId, setCancellingId] = useState<null | string>(null);

  const handleCancelRequest = async (refundRequestId: string) => {
    setCancellingId(refundRequestId);

    try {
      const response = await fetch(
        `/api/refund-request/${refundRequestId}/cancel`,
        {
          method: 'POST',
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel refund request');
      }

      toast.success('Refund request cancelled');
      onRefresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to cancel refund request';
      toast.error(message);
    } finally {
      setCancellingId(null);
    }
  };

  const canRequestRefund = (purchase: PurchaseWithRelations): boolean => {
    // Can't request refund if already refunded
    if (purchase.refundedAt) return false;
    // Can't request refund if there's already a request
    if (purchase.refundRequest) return false;
    // Can't request refund for free purchases
    if (!purchase.stripePaymentId || purchase.stripePaymentId === 'free')
      return false;
    return true;
  };

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell className="font-medium">
                  {purchase.course?.title || 'Unknown Course'}
                </TableCell>
                <TableCell>{formatDate(purchase.createdAt)}</TableCell>
                <TableCell>{formatAmount(purchase.amount)}</TableCell>
                <TableCell>
                  <PurchaseStatusBadge purchase={purchase} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/purchases/${purchase.id}`}>
                          <Receipt className="mr-2 h-4 w-4" />
                          View Receipt
                        </Link>
                      </DropdownMenuItem>
                      {canRequestRefund(purchase) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setSelectedPurchase(purchase)}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Request Refund
                          </DropdownMenuItem>
                        </>
                      )}
                      <CancelRefundMenuItem
                        cancellingId={cancellingId}
                        onCancel={handleCancelRequest}
                        refundRequest={purchase.refundRequest}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <RefundRequestDialog
        onClose={() => setSelectedPurchase(null)}
        onSuccess={() => {
          setSelectedPurchase(null);
          onRefresh();
        }}
        purchase={selectedPurchase}
      />
    </>
  );
}

function CancelRefundMenuItem({
  cancellingId,
  onCancel,
  refundRequest,
}: CancelRefundMenuItemProps) {
  if (!refundRequest || refundRequest.status !== 'pending') {
    return null;
  }

  const isCancelling = cancellingId === refundRequest.id;

  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="text-destructive focus:text-destructive"
        disabled={isCancelling}
        onClick={() => onCancel(refundRequest.id)}
      >
        {isCancelling ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cancelling...
          </>
        ) : (
          <>
            <X className="mr-2 h-4 w-4" />
            Cancel Refund Request
          </>
        )}
      </DropdownMenuItem>
    </>
  );
}

function formatAmount(cents: number) {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(cents / 100);
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function PurchaseStatusBadge({
  purchase,
}: {
  readonly purchase: PurchaseWithRelations;
}) {
  if (purchase.refundedAt) {
    return <Badge variant="destructive">Refunded</Badge>;
  }

  const refundRequest = purchase.refundRequest;

  if (refundRequest) {
    switch (refundRequest.status) {
      case 'cancelled':
        return <Badge variant="outline">Request Cancelled</Badge>;
      case 'pending':
        return (
          <Badge
            className="bg-amber-500 hover:bg-amber-600"
            variant="default"
          >
            Refund Pending
          </Badge>
        );
      case 'rejected':
        return <Badge variant="secondary">Refund Denied</Badge>;
      default:
        return <Badge variant="default">Completed</Badge>;
    }
  }

  return <Badge variant="default">Completed</Badge>;
}
