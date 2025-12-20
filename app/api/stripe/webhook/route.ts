import { db } from '@/lib/database/client';
import { stripe } from '@/lib/stripe/client';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { type Stripe } from 'stripe';

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

    if (!userId || !courseId) {
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
          stripePaymentId: session.payment_intent as string,
          userId,
        },
      });

      // eslint-disable-next-line no-console -- logging successful purchase creation
      console.log(`Purchase created for user ${userId}, course ${courseId}`);
    }
  }

  return NextResponse.json({ received: true });
}
