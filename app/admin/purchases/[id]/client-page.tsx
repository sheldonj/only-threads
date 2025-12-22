'use client';

import { RefundDialog } from '../components/refund-dialog';
import { ContentConsumptionCard } from './components/content-consumption-card';
import { CourseDetailsCard } from './components/course-details-card';
import { CustomerDetailsCard } from './components/customer-details-card';
import { PaymentDetailsCard } from './components/payment-details-card';
import { PurchaseSummaryCards } from './components/purchase-summary-cards';
import { RefundRequestCard } from './components/refund-request-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/lib/auth/client';
import {
  useLessonProgressQueries,
  useLessonQueries,
  usePurchaseQueries,
} from '@/lib/hooks/use-models';
import {
  type Course,
  type CoursePrice,
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
  refundRequest?: RefundRequest | null;
  user?: User;
};

export function PurchaseDetailClient() {
  const parameters = useParams<{ id: string }>();
  const { data: session, isPending: isSessionPending } = useSession();
  const purchaseQueries = usePurchaseQueries();
  const lessonQueries = useLessonQueries();
  const lessonProgressQueries = useLessonProgressQueries();

  const [showRefundDialog, setShowRefundDialog] = useState(false);

  const isAdmin = session?.user?.role === 'admin';

  const {
    data: purchase,
    isLoading: isPurchaseLoading,
    refetch,
  } = purchaseQueries.useFindUnique({
    include: {
      course: true,
      coursePrice: true,
      refundRequest: true,
      user: {
        select: { email: true, id: true, image: true, name: true, role: true },
      },
    },
    where: { id: parameters.id },
  });

  // Fetch lessons for the course to get total count
  const { data: lessons } = lessonQueries.useFindMany(
    {
      where: { courseId: purchase?.courseId },
    },
    { enabled: Boolean(purchase?.courseId) },
  );

  // Fetch lesson progress for the user
  const { data: lessonProgress } = lessonProgressQueries.useFindMany(
    {
      where: {
        lesson: { courseId: purchase?.courseId },
        userId: purchase?.userId,
      },
    },
    { enabled: Boolean(purchase?.courseId) && Boolean(purchase?.userId) },
  );

  const isLoading = isPurchaseLoading || isSessionPending;

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

  const canRefund =
    isAdmin &&
    !purchase.refundedAt &&
    !purchase.refundRequest?.status &&
    purchase.stripePaymentId &&
    purchase.stripePaymentId !== 'free';

  const hasRefundRequest = Boolean(purchase.refundRequest);

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
        <PurchaseStatusBadge purchase={purchase as PurchaseWithRelations} />
      </div>

      <PurchaseSummaryCards purchase={purchase} />

      {/* Refund Request Card - show if there's a request */}
      {hasRefundRequest && purchase.refundRequest && (
        <RefundRequestCard
          onProcessed={refetch}
          refundRequest={purchase.refundRequest}
          stripePaymentId={purchase.stripePaymentId}
        />
      )}

      {/* Content Consumption Card - show for refund requests */}
      {hasRefundRequest && purchase.course && (
        <ContentConsumptionCard
          amount={purchase.amount}
          lessonProgress={lessonProgress || []}
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
        purchase={showRefundDialog ? (purchase as PurchaseWithRelations) : null}
      />
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
      case 'cancelled':
        return <Badge variant="outline">Request Cancelled</Badge>;
      default:
        return <Badge variant="default">Completed</Badge>;
    }
  }

  return <Badge variant="default">Completed</Badge>;
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
