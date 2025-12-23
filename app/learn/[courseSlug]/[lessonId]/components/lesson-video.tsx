'use client';

import { VideoPlayer } from '@/components/courses/video-player';

type LessonVideoProps = {
  readonly isFree?: boolean;
  readonly lessonId: string;
  readonly thumbnailUrl?: string | null;
  readonly title: string;
  readonly videoUrl: string;
};

/**
 * Determines if the video URL is an external embed (YouTube, Vimeo, etc.)
 * vs a Vercel Blob URL that should use our VideoPlayer
 */
function isExternalEmbed(url: string): boolean {
  const embedDomains = [
    'youtube.com',
    'youtu.be',
    'vimeo.com',
    'wistia.com',
    'loom.com',
  ];

  try {
    const urlObject = new URL(url);
    return embedDomains.some((domain) => urlObject.hostname.includes(domain));
  } catch {
    return false;
  }
}

export function LessonVideo({
  isFree = false,
  lessonId,
  thumbnailUrl,
  title,
  videoUrl,
}: LessonVideoProps) {
  // For external embeds (YouTube, Vimeo, etc.), use iframe
  if (isExternalEmbed(videoUrl)) {
    return (
      <div className="aspect-video overflow-hidden rounded-xl bg-black/90 shadow-xl ring-1 ring-white/10">
        {/* eslint-disable-next-line react/iframe-missing-sandbox -- video embeds require scripts and same-origin */}
        <iframe
          allowFullScreen
          className="h-full w-full"
          src={videoUrl}
          title={title}
        />
      </div>
    );
  }

  // For Vercel Blob videos, use our VideoPlayer with access control
  return (
    <VideoPlayer
      className="overflow-hidden rounded-xl shadow-xl ring-1 ring-white/10"
      isFree={isFree}
      lessonId={lessonId}
      poster={thumbnailUrl ?? undefined}
      title={title}
    />
  );
}
