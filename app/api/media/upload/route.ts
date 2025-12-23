import { auth } from '@/lib/auth/server';
import { uploadToBlob } from '@/lib/media/blob';
import {
  formatBytes,
  getAllowedTypesForMediaType,
  getMaxSizeForType,
  type MediaType,
} from '@/lib/media/constants';
import { type NextRequest, NextResponse } from 'next/server';

function isValidMediaType(value: unknown): value is MediaType {
  return value === 'video' || value === 'image';
}

/**
 * POST /api/media/upload
 * Upload a video or image file to Vercel Blob storage
 * Admin only
 */
export async function POST(request: NextRequest) {
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file');
    const mediaTypeParam = formData.get('type');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 },
      );
    }

    if (!isValidMediaType(mediaTypeParam)) {
      return NextResponse.json(
        { error: 'Invalid media type. Must be "video" or "image"' },
        { status: 400 },
      );
    }

    // Upload to blob storage
    const response = await uploadToBlob(file, mediaTypeParam);

    if (!response.success) {
      const status = response.error.code === 'UPLOAD_FAILED' ? 500 : 400;
      return NextResponse.json({ error: response.error.message }, { status });
    }

    return NextResponse.json({
      contentType: response.result.contentType,
      pathname: response.result.pathname,
      size: response.result.size,
      url: response.result.url,
    });
  } catch (error) {
    // eslint-disable-next-line no-console -- logging API errors
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/media/upload
 * Get upload constraints (allowed types, max sizes)
 */
export async function GET() {
  return NextResponse.json({
    image: {
      allowedTypes: getAllowedTypesForMediaType('image'),
      maxSize: getMaxSizeForType('image'),
      maxSizeFormatted: formatBytes(getMaxSizeForType('image')),
    },
    video: {
      allowedTypes: getAllowedTypesForMediaType('video'),
      maxSize: getMaxSizeForType('video'),
      maxSizeFormatted: formatBytes(getMaxSizeForType('video')),
    },
  });
}

