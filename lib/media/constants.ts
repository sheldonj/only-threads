/**
 * Media upload configuration constants
 */

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-msvideo',
] as const;

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

export const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024; // 500MB
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const BLOB_FOLDERS = {
  images: 'images',
  videos: 'videos',
} as const;

export type MediaType = 'image' | 'video';

export function getMaxSizeForType(type: MediaType): number {
  return type === 'video' ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
}

export function getAllowedTypesForMediaType(
  type: MediaType,
): readonly string[] {
  return type === 'video' ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
}

export function isAllowedMimeType(
  mimeType: string,
  mediaType: MediaType,
): boolean {
  const allowed = getAllowedTypesForMediaType(mediaType);
  return allowed.includes(mimeType as (typeof allowed)[number]);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const kilo = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const idx = Math.floor(Math.log(bytes) / Math.log(kilo));
  return `${parseFloat((bytes / Math.pow(kilo, idx)).toFixed(2))} ${sizes[idx]}`;
}

