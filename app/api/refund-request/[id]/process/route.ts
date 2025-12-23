import { auth } from '@/lib/auth/server';
import { db } from '@/lib/database/client';
import { reactRefundRequestApprovedEmail } from '@/lib/email/refund-request-approved';
import { reactRefundRequestRejectedEmail } from '@/lib/email/refund-request-rejected';
import { resend } from '@/lib/email/resend';
import { stripe } from '@/lib/stripe/client';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const from = process.env.BETTER_AUTH_EMAIL || 'delivered@resend.dev';
const testEmailOverride = process.env.TEST_EMAIL;

type RouteParameters = {
  params: Promise<{ id: string }>;
};

const processRequestSchema = z.object({
  action: z.enum(['approve', 'reject']),
  adminNote: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: RouteParameters) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = processRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { details: validationResult.error.issues, error: 'Validation failed' },
        { status: 400 },
      );
    }

    const { action, adminNote } = validationResult.data;

    // Fetch refund request with purchase and user
    const refundRequest = await db.refundRequest.findUnique({
      include: {
        purchase: {
          include: {
            course: true,
            user: true,
          },
        },
      },
      where: { id },
    });

    if (!refundRequest) {
      return NextResponse.json(
        { error: 'Refund request not found' },
        { status: 404 },
      );
    }

    // Check if still pending
    if (refundRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'This refund request has already been processed' },
        { status: 400 },
      );
    }

    const purchase = refundRequest.purchase;
    const user = purchase.user;
    const course = purchase.course;

    if (action === 'approve') {
      // Process refund via Stripe
      if (!purchase.stripePaymentId || purchase.stripePaymentId === 'free') {
        return NextResponse.json(
          { error: 'Cannot refund a free purchase' },
          { status: 400 },
        );
      }

      try {
        await stripe.refunds.create({
          payment_intent: purchase.stripePaymentId,
          reason: 'requested_by_customer',
        });
      } catch (stripeError) {
        // eslint-disable-next-line no-console -- logging Stripe errors
        console.error('Stripe refund failed:', stripeError);
        return NextResponse.json(
          { error: 'Failed to process refund with Stripe' },
          { status: 500 },
        );
      }

      const refundDate = new Date();

      // Update purchase and refund request
      await db.purchase.update({
        data: { refundedAt: refundDate },
        where: { id: purchase.id },
      });

      await db.refundRequest.update({
        data: {
          adminNote,
          processedAt: refundDate,
          processedBy: session.user.id,
          status: 'approved',
        },
        where: { id },
      });

      // eslint-disable-next-line no-console -- logging successful refund
      console.log(`Refund request ${id} approved by admin ${session.user.id}`);

      // Send approval email
      if (user) {
        const customerEmailRecipient = testEmailOverride || user.email;
        const formattedAmount = formatCurrency(purchase.amount);
        const formattedPurchaseDate = formatDate(purchase.createdAt);
        const formattedRefundDate = formatDate(refundDate);

        try {
          await resend.emails.send({
            from,
            react: reactRefundRequestApprovedEmail({
              adminNote: adminNote || undefined,
              amount: formattedAmount,
              courseTitle: course?.title || 'Course',
              customerName: user.name || user.email,
              purchaseDate: formattedPurchaseDate,
              refundDate: formattedRefundDate,
            }),
            subject: `Your refund for ${course?.title || 'your course'} has been approved`,
            to: customerEmailRecipient,
          });
          // eslint-disable-next-line no-console -- logging email success
          console.log(
            `Refund approval email sent to ${customerEmailRecipient}`,
          );
        } catch (emailError) {
          // eslint-disable-next-line no-console -- logging email failures
          console.error('Failed to send refund approval email:', emailError);
        }
      }

      return NextResponse.json({
        message: 'Refund approved and processed successfully',
        refundedAt: refundDate.toISOString(),
      });
    } else {
      // Reject the refund request
      await db.refundRequest.update({
        data: {
          adminNote,
          processedAt: new Date(),
          processedBy: session.user.id,
          status: 'rejected',
        },
        where: { id },
      });

      // eslint-disable-next-line no-console -- logging rejection
      console.log(`Refund request ${id} rejected by admin ${session.user.id}`);

      // Send rejection email
      if (user) {
        const customerEmailRecipient = testEmailOverride || user.email;
        try {
          await resend.emails.send({
            from,
            react: reactRefundRequestRejectedEmail({
              adminNote: adminNote || undefined,
              amount: formatCurrency(purchase.amount),
              courseTitle: course?.title || 'Course',
              customerName: user.name || user.email,
            }),
            subject: `Update on your refund request for ${course?.title || 'your course'}`,
            to: customerEmailRecipient,
          });
          // eslint-disable-next-line no-console -- logging email success
          console.log(
            `Refund rejection email sent to ${customerEmailRecipient}`,
          );
        } catch (emailError) {
          // eslint-disable-next-line no-console -- logging email failures
          console.error('Failed to send refund rejection email:', emailError);
        }
      }

      return NextResponse.json({
        message: 'Refund request rejected',
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console -- logging API errors
    console.error('Process refund request API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(amountInCents / 100);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
  }).format(date);
}
