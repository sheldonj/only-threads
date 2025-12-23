import { auth } from '@/lib/auth/server';
import { deleteFromBlob, deleteMultipleFromBlob } from '@/lib/media/blob';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const deleteSchema = z.object({
  urls: z.array(z.string().url()).min(1),
});

/**
 * DELETE /api/media/delete
 * Delete one or more files from Vercel Blob storage
 * Admin only
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const parsed = deleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { details: parsed.error.errors, error: 'Invalid request body' },
        { status: 400 },
      );
    }

    const { urls } = parsed.data;

    // Delete files
    if (urls.length === 1) {
      const success = await deleteFromBlob(urls[0]);
      return NextResponse.json({
        deleted: success ? 1 : 0,
        success,
      });
    }

    const deletedCount = await deleteMultipleFromBlob(urls);
    return NextResponse.json({
      deleted: deletedCount,
      success: deletedCount === urls.length,
      total: urls.length,
    });
  } catch (error) {
    // eslint-disable-next-line no-console -- logging API errors
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

