'use client';

import { AdminPurchasesTable } from './components/admin-purchases-table';
import { EmptyPurchases } from './components/empty-purchases';
import { PurchaseFilters } from './components/purchase-filters';
import { RefundDialog } from './components/refund-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSession } from '@/lib/auth/client';
import { useCourseQueries, usePurchaseQueries } from '@/lib/hooks/use-models';
import {
  type Course,
  type CoursePrice,
  type Purchase,
  type User,
} from '@/lib/zenstack/generated/models';
import { AlertTriangle, Download, Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export type PurchaseWithRelations = Purchase & {
  course?: Course;
  coursePrice?: CoursePrice;
  user?: User;
};

type Filters = {
  courseId: string;
  endDate: Date | undefined;
  startDate: Date | undefined;
  userSearch: string;
};

export function AdminPurchasesClient() {
  const { data: session, isPending: isSessionPending } = useSession();
  const purchaseQueries = usePurchaseQueries();
  const courseQueries = useCourseQueries();

  const [filters, setFilters] = useState<Filters>({
    courseId: '',
    endDate: undefined,
    startDate: undefined,
    userSearch: '',
  });

  const [refundPurchase, setRefundPurchase] =
    useState<null | PurchaseWithRelations>(null);

  const {
    data: purchases,
    isLoading: isPurchasesLoading,
    refetch,
  } = purchaseQueries.useFindMany({
    include: {
      course: true,
      coursePrice: true,
      user: {
        select: { email: true, id: true, image: true, name: true, role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const { data: courses } = courseQueries.useFindMany({
    orderBy: { title: 'asc' },
    select: { id: true, title: true },
  });

  const isAdmin = session?.user?.role === 'admin';

  // Apply client-side filtering
  const filteredPurchases = useMemo(() => {
    if (!purchases) return [];

    return (purchases as PurchaseWithRelations[]).filter((purchase) => {
      // Course filter
      if (filters.courseId && purchase.courseId !== filters.courseId) {
        return false;
      }

      // Date range filter
      if (filters.startDate) {
        const purchaseDate = new Date(purchase.createdAt);
        if (purchaseDate < filters.startDate) {
          return false;
        }
      }

      if (filters.endDate) {
        const purchaseDate = new Date(purchase.createdAt);
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (purchaseDate > endOfDay) {
          return false;
        }
      }

      // User search filter
      if (filters.userSearch) {
        const searchLower = filters.userSearch.toLowerCase();
        const user = purchase.user;
        if (!user) return false;
        const matchesName = user.name?.toLowerCase().includes(searchLower);
        const matchesEmail = user.email?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesEmail) {
          return false;
        }
      }

      return true;
    });
  }, [filters, purchases]);

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'User Email',
      'User Name',
      'Course',
      'List Price',
      'Amount Paid',
      'Date',
      'Payment ID',
      'Refunded',
    ];
    const rows = filteredPurchases.map((purchase) => [
      purchase.id,
      purchase.user?.email || '',
      purchase.user?.name || '',
      purchase.course?.title || '',
      ((purchase.coursePrice?.price ?? purchase.amount) / 100).toFixed(2),
      (purchase.amount / 100).toFixed(2),
      new Date(purchase.createdAt).toISOString(),
      purchase.stripePaymentId || '',
      purchase.refundedAt ? 'Yes' : 'No',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `purchases-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRefundClick = (purchase: PurchaseWithRelations) => {
    setRefundPurchase(purchase);
  };

  const handleRefundComplete = () => {
    setRefundPurchase(null);
    refetch();
  };

  if (isSessionPending) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Not Authenticated</AlertTitle>
          <AlertDescription>
            Please{' '}
            <Link
              className="underline font-medium"
              href="/sign-in"
            >
              sign in
            </Link>{' '}
            to access the admin area.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasFilters = Boolean(
    filters.courseId ||
    filters.startDate ||
    filters.endDate ||
    filters.userSearch,
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      {!isAdmin && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Admin Access Required</AlertTitle>
          <AlertDescription>
            You need admin privileges to manage purchases. Your current role is:{' '}
            <strong>{session.user?.role || 'user'}</strong>.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Purchase Management</CardTitle>
            <CardDescription>
              View all purchases, filter by date or course, and process refunds
            </CardDescription>
          </div>
          <Button
            disabled={filteredPurchases.length === 0}
            onClick={handleExportCSV}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <PurchaseFilters
            courses={courses || []}
            filters={filters}
            onFiltersChange={setFilters}
          />

          {isPurchasesLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredPurchases.length > 0 ? (
            <AdminPurchasesTable
              isAdmin={isAdmin}
              onRefundClick={handleRefundClick}
              purchases={filteredPurchases}
            />
          ) : (
            <EmptyPurchases hasFilters={hasFilters} />
          )}
        </CardContent>
      </Card>

      <RefundDialog
        onClose={() => setRefundPurchase(null)}
        onRefundComplete={handleRefundComplete}
        purchase={refundPurchase}
      />
    </div>
  );
}
