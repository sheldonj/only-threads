'use client';

import { type BanFormState } from '../types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';

type BanUserDialogProps = {
  readonly banForm: BanFormState;
  readonly isLoading: boolean;
  readonly isOpen: boolean;
  readonly onBanFormChange: (form: BanFormState) => void;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSubmit: (event: React.FormEvent) => void;
};

export function BanUserDialog({
  banForm,
  isLoading,
  isOpen,
  onBanFormChange,
  onOpenChange,
  onSubmit,
}: BanUserDialogProps) {
  return (
    <Dialog
      onOpenChange={onOpenChange}
      open={isOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={onSubmit}
        >
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              onChange={(event) =>
                onBanFormChange({
                  ...banForm,
                  reason: event.target.value,
                })
              }
              required
              value={banForm.reason}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="expirationDate">Expiration Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !banForm.expirationDate && 'text-muted-foreground',
                  )}
                  id="expirationDate"
                  variant="outline"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {banForm.expirationDate ? (
                    format(banForm.expirationDate, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  initialFocus
                  mode="single"
                  onSelect={(date) =>
                    onBanFormChange({
                      ...banForm,
                      expirationDate: date,
                    })
                  }
                  selected={banForm.expirationDate}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button
            className="w-full"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Banning...
              </>
            ) : (
              'Ban User'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
