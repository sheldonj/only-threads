'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type Course, type Purchase } from '@/lib/zenstack/generated/models';
import { Receipt } from 'lucide-react';
import Link from 'next/link';

type PurchasesTableProps = {
  readonly purchases: Array<Purchase & { course?: Course }>;
};

export function PurchasesTable({ purchases }: PurchasesTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="text-right">Receipt</TableHead>
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
              <TableCell className="text-right">
                <Link href={`/purchases/${purchase.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    <Receipt className="mr-2 h-4 w-4" />
                    View Receipt
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
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
