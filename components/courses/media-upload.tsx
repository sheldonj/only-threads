'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils/cn';
import { ImageIcon, Loader2, Upload, Video, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

type MediaType = 'image' | 'video';

type MediaUploadProps = {
  readonly accept?: string;
  readonly className?: string;
  readonly currentUrl?: string;
  readonly disabled?: boolean;
  readonly maxSizeMB?: number;
  readonly onChange: (url: string | null) => void;
  readonly type: MediaType;
};

type UploadState = 'error' | 'idle' | 'success' | 'uploading';

export function MediaUpload({
  accept,
  className,
  currentUrl,
  disabled = false,
  maxSizeMB,
  onChange,
  type,
}: MediaUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultAccept =
    type === 'video'
      ? 'video/mp4,video/quicktime,video/webm'
      : 'image/jpeg,image/png,image/gif,image/webp';

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Reset state
      setError(null);
      setProgress(0);
      setUploadState('uploading');

      // Create preview for images
      if (type === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        // Simulate progress for better UX (real progress would require XHR)
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const response = await fetch('/api/media/upload', {
          body: formData,
          method: 'POST',
        });

        clearInterval(progressInterval);
        setProgress(100);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Upload failed');
        }

        const data = await response.json();
        setUploadState('success');
        setPreviewUrl(data.url);
        onChange(data.url);
      } catch (uploadError) {
        setUploadState('error');
        const message =
          uploadError instanceof Error ? uploadError.message : 'Upload failed';
        setError(message);
        setPreviewUrl(null);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [type, onChange],
  );

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setUploadState('idle');
    setProgress(0);
    setError(null);
    onChange(null);
  }, [onChange]);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const file = event.dataTransfer.files[0];
      if (file && fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        fileInputRef.current.dispatchEvent(
          new Event('change', { bubbles: true }),
        );
      }
    },
    [],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
    },
    [],
  );

  const Icon = type === 'video' ? Video : ImageIcon;

  return (
    <div className={cn('space-y-2', className)}>
      <input
        accept={accept ?? defaultAccept}
        className="hidden"
        disabled={disabled || uploadState === 'uploading'}
        onChange={handleFileSelect}
        ref={fileInputRef}
        type="file"
      />

      {previewUrl ? (
        <div className="relative rounded-lg border bg-muted/50 p-2">
          <div className="flex items-center gap-3">
            {type === 'image' ? (
              <img
                alt="Preview"
                className="h-16 w-16 rounded object-cover"
                src={previewUrl}
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded bg-muted">
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 truncate text-sm">
              {uploadState === 'success' && (
                <span className="text-green-600">Uploaded successfully</span>
              )}
              {uploadState === 'uploading' && (
                <span className="text-muted-foreground">Uploading...</span>
              )}
            </div>
            <Button
              disabled={disabled || uploadState === 'uploading'}
              onClick={handleRemove}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {uploadState === 'uploading' && (
            <Progress className="mt-2" value={progress} />
          )}
        </div>
      ) : (
        <div
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
            disabled
              ? 'cursor-not-allowed opacity-50'
              : 'hover:border-primary hover:bg-muted/50',
            error && 'border-destructive',
          )}
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {uploadState === 'uploading' ? (
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Icon className="h-10 w-10 text-muted-foreground" />
              <div className="mt-2 text-center">
                <p className="text-sm font-medium">
                  <Upload className="mr-1 inline h-4 w-4" />
                  Click or drag to upload {type}
                </p>
                {maxSizeMB && (
                  <p className="text-xs text-muted-foreground">
                    Max size: {maxSizeMB}MB
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

