'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { type RefundRequest } from '@/lib/zenstack/generated/models';
import { Check, Clock, ExternalLink, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

type RefundRequestCardProps = {
  readonly onProcessed: () => void;
  readonly refundRequest: RefundRequest;
  readonly stripePaymentId?: string | null;
};

const REASON_LABELS: Record<string, string> = {
  changed_mind: 'Changed my mind',
  not_as_described: 'Not as described',
  other: 'Other',
  technical_issues: 'Technical issues',
};

export function RefundRequestCard({
  onProcessed,
  refundRequest,
  stripePaymentId,
}: RefundRequestCardProps) {
  const [adminNote, setAdminNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState<
    'approve' | 'reject' | null
  >(null);

  const handleProcess = async (action: 'approve' | 'reject') => {
    setIsProcessing(true);
    setProcessingAction(action);

    try {
      const response = await fetch(
        `/api/refund-request/${refundRequest.id}/process`,
        {
          body: JSON.stringify({
            action,
            adminNote: adminNote || undefined,
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process refund request');
      }

      toast.success(
        action === 'approve'
          ? 'Refund approved and processed'
          : 'Refund request rejected',
      );
      setAdminNote('');
      onProcessed();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to process refund request';
      toast.error(message);
    } finally {
      setIsProcessing(false);
      setProcessingAction(null);
    }
  };

  const isPending = refundRequest.status === 'pending';

  return (
    <Card className={isPending ? 'border-amber-500' : undefined}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Refund Request
              <StatusBadge status={refundRequest.status} />
            </CardTitle>
            <CardDescription>
              Submitted on {formatDate(refundRequest.createdAt)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground text-xs">Reason</Label>
            <p className="font-medium">
              {REASON_LABELS[refundRequest.reason] || refundRequest.reason}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Status</Label>
            <p className="font-medium capitalize">{refundRequest.status}</p>
          </div>
        </div>

        {refundRequest.note && (
          <div>
            <Label className="text-muted-foreground text-xs">Customer Note</Label>
            <div className="bg-muted/50 rounded-lg p-3 mt-1">
              <p className="text-sm">{refundRequest.note}</p>
            </div>
          </div>
        )}

        {refundRequest.adminNote && (
          <div>
            <Label className="text-muted-foreground text-xs">Admin Response</Label>
            <div className="bg-muted/50 rounded-lg p-3 mt-1">
              <p className="text-sm">{refundRequest.adminNote}</p>
            </div>
          </div>
        )}

        {refundRequest.processedAt && (
          <div>
            <Label className="text-muted-foreground text-xs">Processed</Label>
            <p className="text-sm">
              {formatDate(refundRequest.processedAt)}
            </p>
          </div>
        )}

        {refundRequest.status === 'approved' && stripePaymentId && stripePaymentId !== 'free' && (
          <div>
            <Label className="text-muted-foreground text-xs">Stripe Dashboard</Label>
            <div className="mt-1">
              <Link
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                href={`https://dashboard.stripe.com/payments/${stripePaymentId}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                View payment in Stripe
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        {isPending && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label htmlFor="admin-note">Response Note (optional)</Label>
              <Textarea
                disabled={isProcessing}
                id="admin-note"
                onChange={(event) => setAdminNote(event.target.value)}
                placeholder="Add a note to include with your decision..."
                rows={3}
                value={adminNote}
              />
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1"
                disabled={isProcessing}
                onClick={() => handleProcess('approve')}
                variant="default"
              >
                {processingAction === 'approve' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Approve Refund
                  </>
                )}
              </Button>
              <Button
                className="flex-1"
                disabled={isProcessing}
                onClick={() => handleProcess('reject')}
                variant="destructive"
              >
                {processingAction === 'reject' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Reject Request
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { readonly status: string }) {
  switch (status) {
    case 'pending':
      return (
        <Badge
          className="bg-amber-500 hover:bg-amber-600"
          variant="default"
        >
          <Clock className="mr-1 h-3 w-3" />
          Pending Review
        </Badge>
      );
    case 'approved':
      return (
        <Badge
          className="bg-green-600 hover:bg-green-700"
          variant="default"
        >
          <Check className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="destructive">
          <X className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      );
    case 'cancelled':
      return <Badge variant="secondary">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

