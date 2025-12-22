import { auth } from '@/lib/auth/server';
import { db } from '@/lib/database/client';
import { reactAdminRefundNotificationEmail } from '@/lib/email/admin-refund-notification';
import { reactRefundConfirmationEmail } from '@/lib/email/refund-confirmation';
import { resend } from '@/lib/email/resend';
import { stripe } from '@/lib/stripe/client';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const from = process.env.BETTER_AUTH_EMAIL || 'delivered@resend.dev';
const adminEmail = process.env.ADMIN_EMAIL;
// TEST_EMAIL overrides recipient for development (Resend free tier only sends to verified emails)
const testEmailOverride = process.env.TEST_EMAIL;

const refundRequestSchema = z.object({
  purchaseId: z.string().min(1),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify admin role
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = refundRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { details: validationResult.error.issues, error: 'Validation failed' },
        { status: 400 },
      );
    }

    const { purchaseId, reason } = validationResult.data;

    // Fetch purchase with user and course details
    const purchase = await db.purchase.findUnique({
      include: {
        course: true,
        user: true,
      },
      where: { id: purchaseId },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 },
      );
    }

    if (purchase.refundedAt) {
      return NextResponse.json(
        { error: 'Purchase has already been refunded' },
        { status: 400 },
      );
    }

    if (!purchase.stripePaymentId || purchase.stripePaymentId === 'free') {
      return NextResponse.json(
        { error: 'Cannot refund a free purchase' },
        { status: 400 },
      );
    }

    // Process refund via Stripe
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

    // Update purchase record with refund timestamp
    const refundDate = new Date();
    await db.purchase.update({
      data: { refundedAt: refundDate },
      where: { id: purchaseId },
    });

    // eslint-disable-next-line no-console -- logging successful refund
    console.log(`Refund processed for purchase ${purchaseId}`);

    // Send email notifications
    const formattedAmount = formatCurrency(purchase.amount);
    const formattedPurchaseDate = formatDate(purchase.createdAt);
    const formattedRefundDate = formatDate(refundDate);

    // Send refund confirmation email to customer
    if (purchase.user) {
      const customerEmailRecipient = testEmailOverride || purchase.user.email;
      try {
        await resend.emails.send({
          from,
          react: reactRefundConfirmationEmail({
            amount: formattedAmount,
            courseTitle: purchase.course?.title || 'Course',
            customerName: purchase.user.name || purchase.user.email,
            purchaseDate: formattedPurchaseDate,
            refundDate: formattedRefundDate,
          }),
          subject: `Your refund for ${purchase.course?.title || 'your course'} has been processed`,
          to: customerEmailRecipient,
        });
        // eslint-disable-next-line no-console -- logging email success
        console.log(
          `Refund confirmation email sent to ${customerEmailRecipient}`,
        );
      } catch (emailError) {
        // eslint-disable-next-line no-console -- logging email failures
        console.error('Failed to send refund confirmation email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Send refund notification email to admin
    if (adminEmail && purchase.user) {
      try {
        await resend.emails.send({
          from,
          react: reactAdminRefundNotificationEmail({
            amount: formattedAmount,
            courseTitle: purchase.course?.title || 'Course',
            customerEmail: purchase.user.email,
            customerName: purchase.user.name || purchase.user.email,
            reason,
            refundDate: formattedRefundDate,
            stripePaymentId: purchase.stripePaymentId,
          }),
          subject: `Refund processed: ${purchase.course?.title || 'Course'} for ${purchase.user.name || purchase.user.email}`,
          to: adminEmail,
        });
        // eslint-disable-next-line no-console -- logging email success
        console.log(`Admin refund notification sent to ${adminEmail}`);
      } catch (emailError) {
        // eslint-disable-next-line no-console -- logging email failures
        console.error(
          'Failed to send admin refund notification email:',
          emailError,
        );
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      message: 'Refund processed successfully',
      refundedAt: refundDate.toISOString(),
    });
  } catch (error) {
    // eslint-disable-next-line no-console -- logging API errors
    console.error('Refund API error:', error);
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
