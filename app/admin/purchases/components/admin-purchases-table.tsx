'use client';

import { type PurchaseWithRelations } from '../client-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserHoverCard } from '@/components/user-hover-card';
import { format } from 'date-fns';
import { Eye, RotateCcw } from 'lucide-react';
import Link from 'next/link';

type AdminPurchasesTableProps = {
  readonly isAdmin: boolean;
  readonly onRefundClick: (purchase: PurchaseWithRelations) => void;
  readonly purchases: PurchaseWithRelations[];
};

export function AdminPurchasesTable({
  isAdmin,
  onRefundClick,
  purchases,
}: AdminPurchasesTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>List Price</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment ID</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => (
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
              <TableCell className="font-medium">
                {purchase.course?.title || 'Unknown Course'}
              </TableCell>
              <TableCell>
                {formatCurrency(purchase.coursePrice?.price ?? purchase.amount)}
              </TableCell>
              <TableCell>{formatCurrency(purchase.amount)}</TableCell>
              <TableCell>
                {format(new Date(purchase.createdAt), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                {purchase.refundedAt ? (
                  <Badge variant="destructive">Refunded</Badge>
                ) : (
                  <Badge variant="default">Completed</Badge>
                )}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {purchase.stripePaymentId
                  ? purchase.stripePaymentId.slice(-8).toUpperCase()
                  : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/admin/purchases/${purchase.id}`}>
                    <Button
                      size="sm"
                      title="View Details"
                      variant="outline"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {!purchase.refundedAt &&
                    purchase.stripePaymentId &&
                    purchase.stripePaymentId !== 'free' && (
                      <Button
                        disabled={!isAdmin}
                        onClick={() => onRefundClick(purchase)}
                        size="sm"
                        title="Process Refund"
                        variant="destructive"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(cents / 100);
}
