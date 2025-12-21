import { db } from '@/lib/database/client';
import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Course Image';
export const size = {
  height: 630,
  width: 1_200,
};
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const course = await db.course.findFirst({
    select: {
      description: true,
      title: true,
    },
    where: { published: true, slug },
  });

  const title = course?.title || 'Course Not Found';
  const description = course?.description || 'Explore our courses';

  return new ImageResponse(
    <div
      style={{
        alignItems: 'center',
        background:
          'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'center',
        padding: '60px',
        width: '100%',
      }}
    >
      <div
        style={{
          alignItems: 'center',
          color: '#e94560',
          display: 'flex',
          fontSize: 32,
          fontWeight: 600,
          marginBottom: 40,
        }}
      >
        <svg
          fill="none"
          height="40"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          style={{ marginRight: 12 }}
          viewBox="0 0 24 24"
          width="40"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        Learn Something
      </div>
      <div
        style={{
          color: '#ffffff',
          display: 'flex',
          fontSize: 64,
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: 24,
          maxWidth: '900px',
          textAlign: 'center',
        }}
      >
        {title.length > 60 ? `${title.slice(0, 60)}...` : title}
      </div>
      <div
        style={{
          color: '#a0a0a0',
          display: 'flex',
          fontSize: 28,
          lineHeight: 1.4,
          maxWidth: '800px',
          textAlign: 'center',
        }}
      >
        {description && description.length > 120
          ? `${description.slice(0, 120)}...`
          : description}
      </div>
      <div
        style={{
          background: '#e94560',
          borderRadius: 12,
          color: '#ffffff',
          display: 'flex',
          fontSize: 24,
          fontWeight: 600,
          marginTop: 48,
          padding: '16px 48px',
        }}
      >
        Start Learning Today
      </div>
    </div>,
    { ...size },
  );
}
