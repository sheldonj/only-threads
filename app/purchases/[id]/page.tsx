'use client';

/* eslint-disable react/no-unknown-property */

import { Logo } from '@/components/logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSession } from '@/lib/auth/client';
import { usePurchaseQueries } from '@/lib/hooks/use-models';
import { type RefundRequest } from '@/lib/zenstack/generated/models';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  Loader2,
  Printer,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ReceiptPage() {
  const parameters = useParams();
  const router = useRouter();
  const purchaseId = parameters.id as string;
  const { data: session, isPending: isSessionPending } = useSession();
  const purchaseQueries = usePurchaseQueries();

  const { data: purchase, isLoading: isPurchaseLoading } =
    purchaseQueries.useFindUnique(
      {
        include: {
          course: true,
          refundRequest: true,
        },
        where: { id: purchaseId },
      },
      { enabled: Boolean(session) && Boolean(purchaseId) },
    );

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push('/sign-in');
    }
  }, [isSessionPending, router, session]);

  const isLoading = isSessionPending || isPurchaseLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!purchase) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">Purchase not found</h2>
          <p className="text-muted-foreground mb-8">
            This purchase doesn&apos;t exist or you don&apos;t have access to
            it.
          </p>
          <Link href="/purchases">
            <Button>Back to Purchases</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button - hidden when printing */}
      <div className="mb-6 print:hidden">
        <Link href="/purchases">
          <Button
            size="sm"
            variant="ghost"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Purchases
          </Button>
        </Link>
      </div>

      {/* Refund Request Status Card - shown if there's a refund request */}
      {purchase.refundRequest && (
        <RefundRequestStatusCard refundRequest={purchase.refundRequest} />
      )}

      {/* Receipt Card */}
      <Card className="max-w-2xl mx-auto print:shadow-none print:border-none">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold">
            {purchase.refundedAt ? 'Refunded Receipt' : 'Receipt'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Order #{purchase.id.slice(-8).toUpperCase()}
          </p>
          {purchase.refundedAt && (
            <Badge
              className="mt-2"
              variant="destructive"
            >
              Refunded on {formatDate(purchase.refundedAt)}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <Separator />

          {/* Purchase Details */}
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">
                {formatDate(purchase.createdAt)}
              </span>
            </div>

            {purchase.stripePaymentId &&
              purchase.stripePaymentId !== 'free' && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-xs">
                    {purchase.stripePaymentId.slice(-12).toUpperCase()}
                  </span>
                </div>
              )}
          </div>

          <Separator />

          {/* Course Details */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Item
            </h3>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium">
                  {purchase.course?.title || 'Course'}
                </p>
                {purchase.course?.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {purchase.course.description}
                  </p>
                )}
              </div>
              <span className="font-medium ml-4">
                {formatAmount(purchase.amount)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Total</span>
            <span
              className={`font-bold ${purchase.refundedAt ? 'line-through text-muted-foreground' : ''}`}
            >
              {formatAmount(purchase.amount)}
            </span>
          </div>

          {purchase.refundedAt && (
            <div className="flex justify-between items-center text-lg text-destructive">
              <span className="font-semibold">Refunded</span>
              <span className="font-bold">
                -{formatAmount(purchase.amount)}
              </span>
            </div>
          )}

          <Separator />

          {/* Thank you message */}
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              {purchase.refundedAt
                ? 'This purchase has been refunded. You no longer have access to the course content.'
                : 'Thank you for your purchase! We hope you enjoy learning with us.'}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center print:hidden">
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
        </CardFooter>
      </Card>

      {/* Print-only styles - styled-jsx */}
      <style
        global
        jsx
      >{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
        }
      `}</style>
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

function handlePrint() {
  globalThis.print();
}

function RefundRequestStatusCard({
  refundRequest,
}: {
  readonly refundRequest: RefundRequest;
}) {
  const getStatusConfig = () => {
    switch (refundRequest.status) {
      case 'approved':
        return {
          bgColor:
            'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900',
          description:
            'Your refund has been approved and processed. The funds should appear in your account within 5-10 business days.',
          icon: <Check className="h-5 w-5 text-green-600" />,
          title: 'Refund Approved',
        };
      case 'cancelled':
        return {
          bgColor:
            'bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800',
          description:
            'You cancelled your refund request. You still have full access to the course content.',
          icon: <AlertCircle className="h-5 w-5 text-gray-600" />,
          title: 'Refund Request Cancelled',
        };
      case 'pending':
        return {
          bgColor:
            'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900',
          description:
            "Your refund request is being reviewed by our team. We'll notify you once a decision has been made.",
          icon: <Clock className="h-5 w-5 text-amber-600" />,
          title: 'Refund Request Pending',
        };
      case 'rejected':
        return {
          bgColor:
            'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900',
          description:
            'Unfortunately, your refund request was not approved. You still have access to the course content.',
          icon: <X className="h-5 w-5 text-red-600" />,
          title: 'Refund Request Denied',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <Card className={`max-w-2xl mx-auto mb-6 print:hidden ${config.bgColor}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {config.icon}
          <div className="flex-1">
            <h3 className="font-semibold">{config.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {config.description}
            </p>
            {refundRequest.adminNote && (
              <div className="mt-3 p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Note from our team:
                </p>
                <p className="text-sm mt-1">{refundRequest.adminNote}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Submitted on {formatDate(refundRequest.createdAt)}
              {refundRequest.processedAt && (
                <> • Processed on {formatDate(refundRequest.processedAt)}</>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* eslint-enable react/no-unknown-property */
