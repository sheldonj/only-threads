'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { AlertTriangle, Lock, Loader2, Play } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

type VideoPlayerProps = {
  readonly className?: string;
  readonly isFree?: boolean;
  readonly lessonId: string;
  readonly locked?: boolean;
  readonly onEnded?: () => void;
  readonly onTimeUpdate?: (currentTime: number, duration: number) => void;
  readonly poster?: string;
  readonly title?: string;
};

type PlayerState = 'error' | 'idle' | 'loading' | 'playing' | 'ready';

export function VideoPlayer({
  className,
  isFree = false,
  lessonId,
  locked = false,
  onEnded,
  onTimeUpdate,
  poster,
  title,
}: VideoPlayerProps) {
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const streamUrl = `/api/media/stream?lessonId=${lessonId}`;

  const handlePlay = useCallback(() => {
    if (locked) return;
    setPlayerState('loading');
    setError(null);
  }, [locked]);

  const handleCanPlay = useCallback(() => {
    setPlayerState('ready');
  }, []);

  const handlePlaying = useCallback(() => {
    setPlayerState('playing');
  }, []);

  const handleError = useCallback(() => {
    setPlayerState('error');
    setError('Failed to load video. Please try again later.');
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(videoRef.current.currentTime, videoRef.current.duration);
    }
  }, [onTimeUpdate]);

  const handleEnded = useCallback(() => {
    setPlayerState('idle');
    if (onEnded) {
      onEnded();
    }
  }, [onEnded]);

  // Locked state - show lock overlay
  if (locked) {
    return (
      <div
        className={cn(
          'relative flex aspect-video w-full items-center justify-center rounded-lg bg-muted',
          className,
        )}
      >
        {poster && (
          <img
            alt={title ?? 'Video thumbnail'}
            className="absolute inset-0 h-full w-full rounded-lg object-cover opacity-30"
            src={poster}
          />
        )}
        <div className="relative z-10 flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-background/90 p-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Purchase Required</p>
            <p className="text-sm text-muted-foreground">
              Buy this course to watch this lesson
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Idle state - show play button overlay
  if (playerState === 'idle') {
    return (
      <div
        className={cn(
          'group relative flex aspect-video w-full cursor-pointer items-center justify-center rounded-lg bg-muted transition-colors hover:bg-muted/80',
          className,
        )}
        onClick={handlePlay}
      >
        {poster && (
          <img
            alt={title ?? 'Video thumbnail'}
            className="absolute inset-0 h-full w-full rounded-lg object-cover"
            src={poster}
          />
        )}
        <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:bg-black/40" />
        <Button
          className="relative z-10 h-16 w-16 rounded-full"
          size="icon"
          variant="secondary"
        >
          <Play className="h-8 w-8" />
        </Button>
        {isFree && (
          <div className="absolute left-3 top-3 z-10 rounded bg-green-600 px-2 py-1 text-xs font-medium text-white">
            Free Preview
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (playerState === 'error') {
    return (
      <div
        className={cn(
          'flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg bg-muted',
          className,
        )}
      >
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={handlePlay} size="sm" variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  // Loading/Playing state - show video
  return (
    <div className={cn('relative aspect-video w-full', className)}>
      {playerState === 'loading' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-muted">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      )}
      <video
        autoPlay
        className="h-full w-full rounded-lg bg-black"
        controls
        onCanPlay={handleCanPlay}
        onEnded={handleEnded}
        onError={handleError}
        onPlaying={handlePlaying}
        onTimeUpdate={handleTimeUpdate}
        playsInline
        poster={poster}
        preload="metadata"
        ref={videoRef}
        src={streamUrl}
      >
        Your browser does not support the video tag.
      </video>
      {isFree && playerState !== 'loading' && (
        <div className="absolute left-3 top-3 z-10 rounded bg-green-600 px-2 py-1 text-xs font-medium text-white">
          Free Preview
        </div>
      )}
    </div>
  );
}

