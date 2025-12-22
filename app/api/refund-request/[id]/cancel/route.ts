import { auth } from '@/lib/auth/server';
import { db } from '@/lib/database/client';
import { reactRefundRequestCancelledEmail } from '@/lib/email/refund-request-cancelled';
import { resend } from '@/lib/email/resend';
import { type NextRequest, NextResponse } from 'next/server';

const from = process.env.BETTER_AUTH_EMAIL || 'delivered@resend.dev';
const testEmailOverride = process.env.TEST_EMAIL;

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Verify ownership
    if (refundRequest.purchase.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only cancel your own refund requests' },
        { status: 403 },
      );
    }

    // Check if still pending
    if (refundRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending refund requests can be cancelled' },
        { status: 400 },
      );
    }

    // Update the status to cancelled
    await db.refundRequest.update({
      data: {
        processedAt: new Date(),
        status: 'cancelled',
      },
      where: { id },
    });

    // eslint-disable-next-line no-console -- logging cancellation
    console.log(`Refund request ${id} cancelled by user ${session.user.id}`);

    // Send cancellation confirmation email
    const user = refundRequest.purchase.user;
    const course = refundRequest.purchase.course;

    if (user) {
      const customerEmailRecipient = testEmailOverride || user.email;
      try {
        await resend.emails.send({
          from,
          react: reactRefundRequestCancelledEmail({
            amount: formatCurrency(refundRequest.purchase.amount),
            courseTitle: course?.title || 'Course',
            customerName: user.name || user.email,
          }),
          subject: `Your refund request for ${course?.title || 'your course'} has been cancelled`,
          to: customerEmailRecipient,
        });
        // eslint-disable-next-line no-console -- logging email success
        console.log(`Refund request cancellation email sent to ${customerEmailRecipient}`);
      } catch (emailError) {
        // eslint-disable-next-line no-console -- logging email failures
        console.error('Failed to send refund request cancellation email:', emailError);
      }
    }

    return NextResponse.json({
      message: 'Refund request cancelled successfully',
    });
  } catch (error) {
    // eslint-disable-next-line no-console -- logging API errors
    console.error('Cancel refund request API error:', error);
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

