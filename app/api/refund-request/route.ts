import { auth } from '@/lib/auth/server';
import { db } from '@/lib/database/client';
import { reactRefundRequestSubmittedEmail } from '@/lib/email/refund-request-submitted';
import { resend } from '@/lib/email/resend';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const from = process.env.BETTER_AUTH_EMAIL || 'delivered@resend.dev';
const adminEmail = process.env.ADMIN_EMAIL;
const testEmailOverride = process.env.TEST_EMAIL;

const refundRequestSchema = z.object({
  note: z.string().optional(),
  purchaseId: z.string().min(1),
  reason: z.enum(['not_as_described', 'changed_mind', 'technical_issues', 'other']),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = refundRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { details: validationResult.error.issues, error: 'Validation failed' },
        { status: 400 },
      );
    }

    const { note, purchaseId, reason } = validationResult.data;

    // Fetch purchase and verify ownership
    const purchase = await db.purchase.findUnique({
      include: {
        course: true,
        refundRequest: true,
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

    // Verify the user owns this purchase
    if (purchase.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only request refunds for your own purchases' },
        { status: 403 },
      );
    }

    // Check if already refunded
    if (purchase.refundedAt) {
      return NextResponse.json(
        { error: 'This purchase has already been refunded' },
        { status: 400 },
      );
    }

    // Check if there's already a pending refund request
    if (purchase.refundRequest) {
      return NextResponse.json(
        { error: 'A refund request already exists for this purchase' },
        { status: 400 },
      );
    }

    // Check if it's a free purchase
    if (!purchase.stripePaymentId || purchase.stripePaymentId === 'free') {
      return NextResponse.json(
        { error: 'Cannot request a refund for a free purchase' },
        { status: 400 },
      );
    }

    // Create the refund request
    const refundRequest = await db.refundRequest.create({
      data: {
        note,
        purchaseId,
        reason,
        status: 'pending',
      },
    });

    // eslint-disable-next-line no-console -- logging refund request creation
    console.log(`Refund request created: ${refundRequest.id} for purchase ${purchaseId}`);

    // Send email notifications
    const formattedAmount = formatCurrency(purchase.amount);
    const formattedDate = formatDate(new Date());
    const reasonLabel = getReasonLabel(reason);

    // Send confirmation to customer
    if (purchase.user) {
      const customerEmailRecipient = testEmailOverride || purchase.user.email;
      try {
        await resend.emails.send({
          from,
          react: reactRefundRequestSubmittedEmail({
            amount: formattedAmount,
            courseTitle: purchase.course?.title || 'Course',
            customerName: purchase.user.name || purchase.user.email,
            note: note || undefined,
            reason: reasonLabel,
            requestDate: formattedDate,
          }),
          subject: `Your refund request for ${purchase.course?.title || 'your course'} has been submitted`,
          to: customerEmailRecipient,
        });
        // eslint-disable-next-line no-console -- logging email success
        console.log(`Refund request confirmation email sent to ${customerEmailRecipient}`);
      } catch (emailError) {
        // eslint-disable-next-line no-console -- logging email failures
        console.error('Failed to send refund request confirmation email:', emailError);
      }
    }

    // Send notification to admin
    if (adminEmail && purchase.user) {
      try {
        await resend.emails.send({
          from,
          react: reactRefundRequestSubmittedEmail({
            amount: formattedAmount,
            courseTitle: purchase.course?.title || 'Course',
            customerName: purchase.user.name || purchase.user.email,
            isAdminCopy: true,
            note: note || undefined,
            reason: reasonLabel,
            requestDate: formattedDate,
          }),
          subject: `New refund request: ${purchase.course?.title || 'Course'} from ${purchase.user.name || purchase.user.email}`,
          to: adminEmail,
        });
        // eslint-disable-next-line no-console -- logging email success
        console.log(`Admin refund request notification sent to ${adminEmail}`);
      } catch (emailError) {
        // eslint-disable-next-line no-console -- logging email failures
        console.error('Failed to send admin refund request notification:', emailError);
      }
    }

    return NextResponse.json({
      message: 'Refund request submitted successfully',
      refundRequest: {
        createdAt: refundRequest.createdAt,
        id: refundRequest.id,
        status: refundRequest.status,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console -- logging API errors
    console.error('Refund request API error:', error);
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

function getReasonLabel(reason: string): string {
  const labels: Record<string, string> = {
    changed_mind: 'Changed my mind',
    not_as_described: 'Not as described',
    other: 'Other',
    technical_issues: 'Technical issues',
  };
  return labels[reason] || reason;
}

