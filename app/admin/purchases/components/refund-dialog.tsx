'use client';

import { type PurchaseWithRelations } from '../client-page';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type RefundDialogProps = {
  readonly onClose: () => void;
  readonly onRefundComplete: () => void;
  readonly purchase: null | PurchaseWithRelations;
};

export function RefundDialog({
  onClose,
  onRefundComplete,
  purchase,
}: RefundDialogProps) {
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRefund = async () => {
    if (!purchase) return;

    setIsProcessing(true);

    try {
      const response = await fetch('/api/stripe/refund', {
        body: JSON.stringify({
          purchaseId: purchase.id,
          reason: reason || undefined,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process refund');
      }

      toast.success('Refund processed successfully');
      setReason('');
      onRefundComplete();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to process refund';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReason('');
      onClose();
    }
  };

  return (
    <AlertDialog
      onOpenChange={handleOpenChange}
      open={Boolean(purchase)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Process Refund</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to refund this purchase? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {purchase && (
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium">
                  {purchase.user?.name || purchase.user?.email || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Course</span>
                <span className="font-medium">
                  {purchase.course?.title || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium text-destructive">
                  {formatCurrency(purchase.amount)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for refund (optional)</Label>
              <Textarea
                disabled={isProcessing}
                id="reason"
                onChange={(event) => setReason(event.target.value)}
                placeholder="Enter a reason for this refund..."
                rows={3}
                value={reason}
              />
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isProcessing}
            onClick={(event) => {
              event.preventDefault();
              handleRefund();
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Process Refund'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(cents / 100);
}
