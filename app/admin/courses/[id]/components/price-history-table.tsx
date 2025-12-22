'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type CoursePrice } from '@/lib/zenstack/generated/models';
import { format } from 'date-fns';

type PriceHistoryTableProps = {
  readonly prices: CoursePrice[];
};

export function PriceHistoryTable({ prices }: PriceHistoryTableProps) {
  if (prices.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No price history available
      </div>
    );
  }

  // Sort prices by validFrom descending (most recent first)
  const sortedPrices = [...prices].sort(
    (a, b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime(),
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Valid From</TableHead>
          <TableHead>Valid To</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedPrices.map((price) => {
          const isActive = price.validTo === null;
          return (
            <TableRow key={price.id}>
              <TableCell className="font-medium">
                ${(price.price / 100).toFixed(2)}
              </TableCell>
              <TableCell>
                {isActive ? (
                  <Badge variant="default">Active</Badge>
                ) : (
                  <Badge variant="secondary">Expired</Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(price.validFrom), 'MMM d, yyyy h:mm a')}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {price.validTo
                  ? format(new Date(price.validTo), 'MMM d, yyyy h:mm a')
                  : '—'}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
