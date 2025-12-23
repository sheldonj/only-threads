import { del, list, put } from '@vercel/blob';

import {
  BLOB_FOLDERS,
  getAllowedTypesForMediaType,
  getMaxSizeForType,
  isAllowedMimeType,
  type MediaType,
} from './constants';

type UploadResult = {
  contentType: string;
  pathname: string;
  size: number;
  url: string;
};

type UploadError = {
  code: 'INVALID_TYPE' | 'SIZE_EXCEEDED' | 'UPLOAD_FAILED';
  message: string;
};

type UploadResponse =
  | { error: UploadError; success: false }
  | { result: UploadResult; success: true };

/**
 * Upload a file to Vercel Blob storage
 */
export async function uploadToBlob(
  file: File,
  mediaType: MediaType,
): Promise<UploadResponse> {
  // Validate MIME type
  if (!isAllowedMimeType(file.type, mediaType)) {
    const allowed = getAllowedTypesForMediaType(mediaType);
    return {
      error: {
        code: 'INVALID_TYPE',
        message: `Invalid file type. Allowed types: ${allowed.join(', ')}`,
      },
      success: false,
    };
  }

  // Validate file size
  const maxSize = getMaxSizeForType(mediaType);
  if (file.size > maxSize) {
    return {
      error: {
        code: 'SIZE_EXCEEDED',
        message: `File size exceeds maximum of ${maxSize / (1024 * 1024)}MB`,
      },
      success: false,
    };
  }

  try {
    const folder =
      mediaType === 'video' ? BLOB_FOLDERS.videos : BLOB_FOLDERS.images;
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const pathname = `${folder}/${timestamp}-${sanitizedName}`;

    const blob = await put(pathname, file, {
      access: 'public',
      contentType: file.type,
    });

    return {
      result: {
        contentType: blob.contentType,
        pathname: blob.pathname,
        size: file.size,
        url: blob.url,
      },
      success: true,
    };
  } catch (error) {
    // eslint-disable-next-line no-console -- logging upload errors
    console.error('Blob upload failed:', error);
    return {
      error: {
        code: 'UPLOAD_FAILED',
        message:
          error instanceof Error ? error.message : 'Failed to upload file',
      },
      success: false,
    };
  }
}

/**
 * Delete a file from Vercel Blob storage by URL
 */
export async function deleteFromBlob(url: string): Promise<boolean> {
  try {
    await del(url);
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console -- logging delete errors
    console.error('Blob delete failed:', error);
    return false;
  }
}

/**
 * Delete multiple files from Vercel Blob storage
 */
export async function deleteMultipleFromBlob(urls: string[]): Promise<number> {
  let deletedCount = 0;
  for (const url of urls) {
    const success = await deleteFromBlob(url);
    if (success) deletedCount++;
  }
  return deletedCount;
}

/**
 * List all blobs in a folder
 */
export async function listBlobs(folder?: string) {
  try {
    const { blobs } = await list({ prefix: folder });
    return blobs;
  } catch (error) {
    // eslint-disable-next-line no-console -- logging list errors
    console.error('Blob list failed:', error);
    return [];
  }
}

/**
 * Extract blob URL from various formats
 * Handles both full URLs and pathnames
 */
export function normalizeBlobUrl(urlOrPath: string): string {
  if (urlOrPath.startsWith('http')) {
    return urlOrPath;
  }
  // If it's just a pathname, we can't reconstruct the full URL
  // This shouldn't happen in normal usage
  return urlOrPath;
}

