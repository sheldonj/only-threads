'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type Course, type Purchase } from '@/lib/zenstack/generated/models';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type RefundRequestDialogProps = {
  readonly onClose: () => void;
  readonly onSuccess: () => void;
  readonly purchase: null | (Purchase & { course?: Course });
};

const REFUND_REASONS = [
  { label: 'Not as described', value: 'not_as_described' },
  { label: 'Changed my mind', value: 'changed_mind' },
  { label: 'Technical issues', value: 'technical_issues' },
  { label: 'Other', value: 'other' },
] as const;

export function RefundRequestDialog({
  onClose,
  onSuccess,
  purchase,
}: RefundRequestDialogProps) {
  const [reason, setReason] = useState<string>('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!purchase || !reason) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/refund-request', {
        body: JSON.stringify({
          note: note || undefined,
          purchaseId: purchase.id,
          reason,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit refund request');
      }

      toast.success('Refund request submitted successfully');
      setReason('');
      setNote('');
      onSuccess();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to submit refund request';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReason('');
      setNote('');
      onClose();
    }
  };

  return (
    <Dialog
      onOpenChange={handleOpenChange}
      open={Boolean(purchase)}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request a Refund</DialogTitle>
          <DialogDescription>
            Please let us know why you&apos;d like a refund. Our team will
            review your request and get back to you.
          </DialogDescription>
        </DialogHeader>

        {purchase && (
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Course</span>
                <span className="font-medium">
                  {purchase.course?.title || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  {formatCurrency(purchase.amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Purchase Date</span>
                <span className="font-medium">
                  {formatDate(purchase.createdAt)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for refund *</Label>
              <Select
                disabled={isSubmitting}
                onValueChange={setReason}
                value={reason}
              >
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REFUND_REASONS.map((refundReason) => (
                    <SelectItem
                      key={refundReason.value}
                      value={refundReason.value}
                    >
                      {refundReason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Additional details (optional)</Label>
              <Textarea
                disabled={isSubmitting}
                id="note"
                onChange={(event) => setNote(event.target.value)}
                placeholder="Please provide any additional information that might help us process your request..."
                rows={4}
                value={note}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            disabled={isSubmitting}
            onClick={onClose}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={isSubmitting || !reason}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
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
    month: 'long',
    year: 'numeric',
  });
}
