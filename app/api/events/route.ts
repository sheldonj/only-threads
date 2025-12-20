import { auth } from '@/lib/auth/server';
import { db } from '@/lib/database/client';
import { reactCourseCompletedEmail } from '@/lib/email/course-completed';
import { reactCourseStartedEmail } from '@/lib/email/course-started';
import { resend } from '@/lib/email/resend';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

const from = process.env.BETTER_AUTH_EMAIL || 'delivered@resend.dev';
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const requestHeaders = await headers();
    const sessionResult = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!sessionResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, type } = body as {
      courseId: string;
      type: 'completed' | 'started';
    };

    if (!courseId || !type) {
      return NextResponse.json(
        { error: 'courseId and type are required' },
        { status: 400 },
      );
    }

    if (type !== 'started' && type !== 'completed') {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 },
      );
    }

    // Get the course details
    const course = await db.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if this event already exists (prevent duplicate emails)
    const existingEvent = await db.courseEvent.findFirst({
      where: {
        courseId,
        type,
        userId: sessionResult.session.userId,
      },
    });

    if (existingEvent) {
      // Event already recorded, no need to send another email
      return NextResponse.json({ duplicate: true, success: true });
    }

    // Create the event
    const event = await db.courseEvent.create({
      data: {
        courseId,
        type,
        userId: sessionResult.session.userId,
      },
    });

    // Send email based on event type
    try {
      if (type === 'started') {
        await resend.emails.send({
          from,
          react: reactCourseStartedEmail({
            courseTitle: course.title,
            courseUrl: `${baseUrl}/learn/${course.slug}`,
            username: sessionResult.user.name || sessionResult.user.email,
          }),
          subject: `You've started ${course.title}!`,
          to: sessionResult.user.email,
        });
      } else if (type === 'completed') {
        await resend.emails.send({
          from,
          react: reactCourseCompletedEmail({
            courseTitle: course.title,
            libraryUrl: `${baseUrl}/library`,
            username: sessionResult.user.name || sessionResult.user.email,
          }),
          subject: `Congratulations! You've completed ${course.title}!`,
          to: sessionResult.user.email,
        });
      }

      // Mark email as sent (using raw db since we're admin-level here)
      await db.courseEvent.update({
        data: { emailSent: true },
        where: { id: event.id },
      });
    } catch (emailError) {
      // eslint-disable-next-line no-console -- logging email failures for debugging
      console.error('Failed to send email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ eventId: event.id, success: true });
  } catch (error) {
    // eslint-disable-next-line no-console -- logging server errors for debugging
    console.error('Event creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
