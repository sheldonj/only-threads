'use client';

import { RefundDialog } from '../components/refund-dialog';
import { ContentConsumptionCard } from './components/content-consumption-card';
import { CourseDetailsCard } from './components/course-details-card';
import { CustomerDetailsCard } from './components/customer-details-card';
import { PaymentDetailsCard } from './components/payment-details-card';
import { PurchaseSummaryCards } from './components/purchase-summary-cards';
import { RefundRequestCard } from './components/refund-request-card';
import { usePurchaseDetail } from './hooks/use-purchase-detail';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type Course,
  type CoursePrice,
  type Lesson,
  type LessonProgress,
  type Purchase,
  type RefundRequest,
  type User,
} from '@/lib/zenstack/generated/models';
import { AlertTriangle, ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export type PurchaseWithRelations = Purchase & {
  course?: Course;
  coursePrice?: CoursePrice;
  refundRequest?: null | RefundRequest;
  user?: User;
};

type PurchaseDetailContentProps = {
  readonly canRefund: boolean;
  readonly handleRefundComplete: () => void;
  readonly hasRefundRequest: boolean;
  readonly isAdmin: boolean;
  readonly lessonProgress: LessonProgress[];
  readonly lessons: Lesson[] | undefined;
  readonly purchase: PurchaseWithRelations;
  readonly refetch: () => void;
  readonly session: { user?: { role?: null | string } };
  readonly setShowRefundDialog: (show: boolean) => void;
  readonly showRefundDialog: boolean;
};

export function PurchaseDetailClient() {
  const parameters = useParams<{ id: string }>();
  const [showRefundDialog, setShowRefundDialog] = useState(false);

  const {
    canRefund,
    hasRefundRequest,
    isAdmin,
    isLoading,
    lessonProgress,
    lessons,
    purchase,
    refetch,
    session,
  } = usePurchaseDetail(parameters.id);

  const handleRefundComplete = () => {
    setShowRefundDialog(false);
    refetch();
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!session) {
    return <NotAuthenticatedAlert />;
  }

  if (!purchase) {
    return <PurchaseNotFoundAlert />;
  }

  return (
    <PurchaseDetailContent
      canRefund={canRefund}
      handleRefundComplete={handleRefundComplete}
      hasRefundRequest={hasRefundRequest}
      isAdmin={isAdmin}
      lessonProgress={lessonProgress}
      lessons={lessons}
      purchase={purchase}
      refetch={refetch}
      session={session}
      setShowRefundDialog={setShowRefundDialog}
      showRefundDialog={showRefundDialog}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function NotAuthenticatedAlert() {
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

function PurchaseDetailContent({
  canRefund,
  handleRefundComplete,
  hasRefundRequest,
  isAdmin,
  lessonProgress,
  lessons,
  purchase,
  refetch,
  session,
  setShowRefundDialog,
  showRefundDialog,
}: PurchaseDetailContentProps) {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <Link
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        href="/admin/purchases"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Purchases
      </Link>

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

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchase Details</h1>
          <p className="text-muted-foreground">
            Order #{purchase.id.slice(-8).toUpperCase()}
          </p>
        </div>
        <PurchaseStatusBadge purchase={purchase} />
      </div>

      <PurchaseSummaryCards purchase={purchase} />

      {hasRefundRequest && purchase.refundRequest && (
        <RefundRequestCard
          onProcessed={refetch}
          refundRequest={purchase.refundRequest}
          stripePaymentId={purchase.stripePaymentId}
        />
      )}

      {hasRefundRequest && purchase.course && (
        <ContentConsumptionCard
          amount={purchase.amount}
          lessonProgress={lessonProgress}
          purchaseDate={purchase.createdAt}
          totalLessons={lessons?.length || 0}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerDetailsCard purchase={purchase} />
        <PaymentDetailsCard
          canRefund={canRefund}
          onRefundClick={() => setShowRefundDialog(true)}
          purchase={purchase}
        />
      </div>

      {purchase.course && <CourseDetailsCard course={purchase.course} />}

      <RefundDialog
        onClose={() => setShowRefundDialog(false)}
        onRefundComplete={handleRefundComplete}
        purchase={showRefundDialog ? purchase : null}
      />
    </div>
  );
}

function PurchaseNotFoundAlert() {
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Purchase Not Found</AlertTitle>
        <AlertDescription>
          The purchase you&apos;re looking for doesn&apos;t exist or you
          don&apos;t have permission to view it.
          <br />
          <Link
            className="underline font-medium"
            href="/admin/purchases"
          >
            Back to Purchase Management
          </Link>
        </AlertDescription>
      </Alert>
    </div>
  );
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
