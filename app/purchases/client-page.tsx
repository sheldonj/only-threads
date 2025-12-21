'use client';

import { EmptyPurchases } from './components/empty-purchases';
import { PurchasesTable } from './components/purchases-table';
import { useSession } from '@/lib/auth/client';
import { usePurchaseQueries } from '@/lib/hooks/use-models';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function PurchasesPageClient() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const purchaseQueries = usePurchaseQueries();

  const { data: purchases, isLoading: isPurchasesLoading } =
    purchaseQueries.useFindMany(
      {
        include: {
          course: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      { enabled: Boolean(session) },
    );

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push('/sign-in');
    }
  }, [isSessionPending, router, session]);

  const isLoading = isSessionPending || isPurchasesLoading;

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Purchases</h1>
        <p className="text-muted-foreground">
          View your purchase history and download receipts.
        </p>
      </div>

      {purchases && purchases.length > 0 ? (
        <PurchasesTable purchases={purchases} />
      ) : (
        <EmptyPurchases />
      )}
    </div>
  );
}
