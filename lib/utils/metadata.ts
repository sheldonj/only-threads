import { type Metadata } from 'next/types';

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export function createMetadata(override: Metadata): Metadata {
  const baseUrl = getBaseUrl();

  return {
    ...override,
    openGraph: {
      description: override.description ?? undefined,
      images: `${baseUrl}/og.png`,
      siteName: 'Learn Something',
      title: override.title ?? undefined,
      type: 'website',
      url: baseUrl,
      ...override.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      description: override.description ?? undefined,
      images: `${baseUrl}/og.png`,
      title: override.title ?? undefined,
      ...override.twitter,
    },
  };
}

export { getBaseUrl };
