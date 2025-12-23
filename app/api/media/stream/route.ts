import { auth } from '@/lib/auth/server';
import { db } from '@/lib/database/client';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/media/stream?lessonId=<id>
 * Stream video content with access control
 * - Free lessons: anyone can access
 * - Paid lessons: requires purchase or admin role
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    if (!lessonId) {
      return NextResponse.json(
        { error: 'lessonId is required' },
        { status: 400 },
      );
    }

    // Fetch the lesson (bypassing ZenStack policy to check access manually)
    const lesson = await db.$raw.lesson.findUnique({
      include: {
        course: {
          include: {
            purchases: {
              select: { userId: true },
            },
          },
        },
      },
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 },
      );
    }

    if (!lesson.videoUrl) {
      return NextResponse.json(
        { error: 'No video available for this lesson' },
        { status: 404 },
      );
    }

    // Check access
    const hasAccess = await checkVideoAccess(request, lesson);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied. Purchase the course to view this lesson.' },
        { status: 403 },
      );
    }

    // Redirect to the blob URL
    // For Vercel Blob, we can redirect since URLs are public but unguessable
    return NextResponse.redirect(lesson.videoUrl);
  } catch (error) {
    // eslint-disable-next-line no-console -- logging API errors
    console.error('Stream error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

type LessonWithCourse = {
  course: {
    purchases: Array<{ userId: string }>;
  };
  isFree: boolean;
};

async function checkVideoAccess(
  request: NextRequest,
  lesson: LessonWithCourse,
): Promise<boolean> {
  // Free lessons are accessible to everyone
  if (lesson.isFree) {
    return true;
  }

  // Check authentication
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return false;
  }

  // Admins can access all videos
  if (session.user.role === 'admin') {
    return true;
  }

  // Check if user has purchased the course
  const hasPurchase = lesson.course.purchases.some(
    (purchase) => purchase.userId === session.user.id,
  );

  return hasPurchase;
}

