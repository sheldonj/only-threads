import { db } from '@/lib/database/client';
import { reactAdminSaleNotificationEmail } from '@/lib/email/admin-sale-notification';
import { reactPurchaseConfirmationEmail } from '@/lib/email/purchase-confirmation';
import { resend } from '@/lib/email/resend';
import { stripe } from '@/lib/stripe/client';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { type Stripe } from 'stripe';

const from = process.env.BETTER_AUTH_EMAIL || 'delivered@resend.dev';
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const adminEmail = process.env.ADMIN_EMAIL;
// TEST_EMAIL overrides recipient for development (Resend free tier only sends to verified emails)
const testEmailOverride = process.env.TEST_EMAIL;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 },
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    // eslint-disable-next-line no-console -- logging configuration errors
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    // eslint-disable-next-line no-console -- logging webhook errors for debugging
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const courseId = session.metadata?.courseId;
    const coursePriceId = session.metadata?.coursePriceId;

    if (!userId || !courseId || !coursePriceId) {
      // eslint-disable-next-line no-console -- logging webhook errors for debugging
      console.error('Missing metadata in checkout session:', session.id);
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    // Check if purchase already exists (idempotency)
    const existingPurchase = await db.purchase.findFirst({
      where: { courseId, userId },
    });

    if (!existingPurchase) {
      // Create purchase record
      await db.purchase.create({
        data: {
          amount: session.amount_total ?? 0,
          courseId,
          coursePriceId,
          stripePaymentId: session.payment_intent as string,
          userId,
        },
      });

      // eslint-disable-next-line no-console -- logging successful purchase creation
      console.log(`Purchase created for user ${userId}, course ${courseId}`);

      // Fetch user and course details for emails
      const [user, course] = await Promise.all([
        db.user.findUnique({ where: { id: userId } }),
        db.course.findUnique({ where: { id: courseId } }),
      ]);

      if (user && course) {
        const purchaseDate = formatDate(new Date());
        const amount = formatCurrency(session.amount_total ?? 0);
        const stripePaymentId = (session.payment_intent as string) || '';
        const courseUrl = `${baseUrl}/learn/${course.slug}`;

        // Send purchase confirmation email to customer
        const customerEmailRecipient = testEmailOverride || user.email;
        try {
          await resend.emails.send({
            from,
            react: reactPurchaseConfirmationEmail({
              amount,
              courseTitle: course.title,
              courseUrl,
              customerName: user.name || user.email,
              purchaseDate,
            }),
            subject: `Your purchase of ${course.title} is confirmed!`,
            to: customerEmailRecipient,
          });
          // eslint-disable-next-line no-console -- logging email success
          console.log(
            `Purchase confirmation email sent to ${customerEmailRecipient}`,
          );
        } catch (emailError) {
          // eslint-disable-next-line no-console -- logging email failures for debugging
          console.error(
            'Failed to send purchase confirmation email:',
            emailError,
          );
          // Don't fail the webhook if email fails
        }

        // Send sale notification email to admin
        if (adminEmail) {
          try {
            await resend.emails.send({
              from,
              react: reactAdminSaleNotificationEmail({
                amount,
                courseTitle: course.title,
                customerEmail: user.email,
                customerName: user.name || user.email,
                purchaseDate,
                stripePaymentId,
              }),
              subject: `New sale: ${course.title} purchased by ${user.name || user.email}`,
              to: adminEmail,
            });
            // eslint-disable-next-line no-console -- logging email success
            console.log(`Admin sale notification sent to ${adminEmail}`);
          } catch (emailError) {
            // eslint-disable-next-line no-console -- logging email failures for debugging
            console.error(
              'Failed to send admin sale notification email:',
              emailError,
            );
            // Don't fail the webhook if email fails
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
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
