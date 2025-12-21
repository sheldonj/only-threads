'use client';

type LessonVideoProps = {
  readonly title: string;
  readonly videoUrl: string;
};

export function LessonVideo({ title, videoUrl }: LessonVideoProps) {
  return (
    <div className="aspect-video bg-black/90 rounded-xl overflow-hidden shadow-xl ring-1 ring-white/10">
      {/* eslint-disable-next-line react/iframe-missing-sandbox -- video embeds require scripts and same-origin */}
      <iframe
        allowFullScreen
        className="w-full h-full"
        src={videoUrl}
        title={title}
      />
    </div>
  );
}
