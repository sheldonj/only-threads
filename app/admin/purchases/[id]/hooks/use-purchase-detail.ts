'use client';

import { type PurchaseWithRelations } from '../client-page';
import { useSession } from '@/lib/auth/client';
import {
  useLessonProgressQueries,
  useLessonQueries,
  usePurchaseQueries,
} from '@/lib/hooks/use-models';

export function usePurchaseDetail(purchaseId: string) {
  const { data: session, isPending: isSessionPending } = useSession();
  const purchaseQueries = usePurchaseQueries();
  const lessonQueries = useLessonQueries();
  const lessonProgressQueries = useLessonProgressQueries();

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
    where: { id: purchaseId },
  });

  const { data: lessons } = lessonQueries.useFindMany(
    {
      where: { courseId: purchase?.courseId },
    },
    { enabled: Boolean(purchase?.courseId) },
  );

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

  const canRefund =
    isAdmin &&
    !purchase?.refundedAt &&
    !purchase?.refundRequest?.status &&
    purchase?.stripePaymentId &&
    purchase?.stripePaymentId !== 'free';

  const hasRefundRequest = Boolean(purchase?.refundRequest);

  return {
    canRefund,
    hasRefundRequest,
    isAdmin,
    isLoading,
    lessonProgress: lessonProgress || [],
    lessons,
    purchase: purchase as PurchaseWithRelations | undefined,
    refetch,
    session,
  };
}
