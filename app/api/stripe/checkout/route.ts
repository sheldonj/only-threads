import { auth } from '@/lib/auth/server';
import { db } from '@/lib/database/client';
import { stripe } from '@/lib/stripe/client';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const requestHeaders = await headers();
    const sessionResult = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!sessionResult) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Get course from database
    const course = await db.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (!course.published) {
      return NextResponse.json({ error: 'Course is not available for purchase' }, { status: 400 });
    }

    // Check if already purchased
    const existingPurchase = await db.purchase.findFirst({
      where: {
        courseId,
        userId: sessionResult.session.userId,
      },
    });

    if (existingPurchase) {
      return NextResponse.redirect(new URL(`/learn/${course.slug}`, request.url));
    }

    // Handle free courses
    if (course.price === 0) {
      await db.purchase.create({
        data: {
          amount: 0,
          courseId,
          stripePaymentId: 'free',
          userId: sessionResult.session.userId,
        },
      });
      return NextResponse.redirect(new URL(`/learn/${course.slug}`, request.url));
    }

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      cancel_url: `${baseUrl}/courses/${course.slug}`,
      customer_email: sessionResult.user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              description: course.description || undefined,
              images: course.coverImage ? [course.coverImage] : undefined,
              name: course.title,
            },
            unit_amount: Math.round(course.price),
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseId: course.id,
        userId: sessionResult.session.userId,
      },
      mode: 'payment',
      success_url: `${baseUrl}/learn/${course.slug}?success=true`,
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    return NextResponse.redirect(checkoutSession.url);
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

