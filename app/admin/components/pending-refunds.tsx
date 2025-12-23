'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserHoverCard } from '@/components/user-hover-card';
import { useRefundRequestQueries } from '@/lib/hooks/use-models';
import {
  type Course,
  type Purchase,
  type RefundRequest,
  type User,
} from '@/lib/zenstack/generated/models';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, ArrowRight, Clock, Eye } from 'lucide-react';
import Link from 'next/link';

type RefundRequestWithRelations = RefundRequest & {
  purchase?: Purchase & {
    course?: Pick<Course, 'title'>;
    user?: Pick<User, 'email' | 'image' | 'name' | 'role'>;
  };
};

const REASON_LABELS: Record<string, string> = {
  changed_mind: 'Changed mind',
  not_as_described: 'Not as described',
  other: 'Other',
  technical_issues: 'Technical issues',
};

export function PendingRefunds() {
  const refundRequestQueries = useRefundRequestQueries();
  const { data: pendingRefunds, isLoading } = refundRequestQueries.useFindMany({
    include: {
      purchase: {
        include: {
          course: { select: { title: true } },
          user: {
            select: { email: true, image: true, name: true, role: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
    where: { status: 'pending' },
  });

  const count = pendingRefunds?.length ?? 0;

  return (
    <Card className={count > 0 ? 'border-amber-500' : undefined}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle
              className={`h-5 w-5 ${count > 0 ? 'text-amber-500' : 'text-muted-foreground'}`}
            />
            Pending Refund Requests
            {count > 0 && (
              <Badge
                className="bg-amber-500 hover:bg-amber-600"
                variant="default"
              >
                {count}
              </Badge>
            )}
          </CardTitle>
          <Button
            asChild
            size="sm"
            variant="ghost"
          >
            <Link href="/admin/purchases">
              View All Purchases <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }, (_, index) => `skeleton-${index}`).map(
              (key) => (
                <Skeleton
                  className="h-12 w-full"
                  key={key}
                />
              ),
            )}
          </div>
        ) : pendingRefunds && pendingRefunds.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(pendingRefunds as RefundRequestWithRelations[]).map(
                (refundRequest) => (
                  <TableRow key={refundRequest.id}>
                    <TableCell>
                      <UserHoverCard
                        email={refundRequest.purchase?.user?.email}
                        image={refundRequest.purchase?.user?.image}
                        name={refundRequest.purchase?.user?.name}
                        role={refundRequest.purchase?.user?.role}
                        showEmail
                      />
                    </TableCell>
                    <TableCell>
                      {refundRequest.purchase?.course?.title ?? 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(refundRequest.purchase?.amount ?? 0)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {REASON_LABELS[refundRequest.reason] ||
                          refundRequest.reason}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(
                          new Date(refundRequest.createdAt),
                          {
                            addSuffix: true,
                          },
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        href={`/admin/purchases/${refundRequest.purchaseId}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No pending refund requests</p>
            <p className="text-sm text-muted-foreground mt-1">
              All refund requests have been processed
            </p>
          </div>
        )}
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
