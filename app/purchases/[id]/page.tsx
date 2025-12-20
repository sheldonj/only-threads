'use client';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSession } from '@/lib/auth/client';
import { usePurchaseQueries } from '@/lib/hooks/use-models';
import { ArrowLeft, Loader2, Printer } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatAmount(cents: number) {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(cents / 100);
}

export default function ReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const purchaseId = params.id as string;
  const { data: session, isPending: isSessionPending } = useSession();
  const purchaseQueries = usePurchaseQueries();

  const { data: purchase, isLoading: isPurchaseLoading } = purchaseQueries.useFindUnique(
    {
      include: {
        course: true,
      },
      where: { id: purchaseId },
    },
    { enabled: Boolean(session) && Boolean(purchaseId) }
  );

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push('/sign-in');
    }
  }, [isSessionPending, session, router]);

  const handlePrint = () => {
    window.print();
  };

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
            This purchase doesn&apos;t exist or you don&apos;t have access to it.
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
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Purchases
          </Button>
        </Link>
      </div>

      {/* Receipt Card */}
      <Card className="max-w-2xl mx-auto print:shadow-none print:border-none">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold">Receipt</h1>
          <p className="text-sm text-muted-foreground">
            Order #{purchase.id.slice(-8).toUpperCase()}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <Separator />

          {/* Purchase Details */}
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{formatDate(purchase.createdAt)}</span>
            </div>

            {purchase.stripePaymentId && purchase.stripePaymentId !== 'free' && (
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
                <p className="font-medium">{purchase.course?.title || 'Course'}</p>
                {purchase.course?.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {purchase.course.description}
                  </p>
                )}
              </div>
              <span className="font-medium ml-4">{formatAmount(purchase.amount)}</span>
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Total</span>
            <span className="font-bold">{formatAmount(purchase.amount)}</span>
          </div>

          <Separator />

          {/* Thank you message */}
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              Thank you for your purchase! We hope you enjoy learning with us.
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

      {/* Print-only styles */}
      <style jsx global>{`
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

