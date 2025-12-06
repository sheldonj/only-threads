import { type Metadata } from 'next/types';

export function createMetadata(override: Metadata): Metadata {
  return {
    ...override,
    openGraph: {
      description: override.description ?? undefined,
      images: 'https://demo.better-auth.com/og.png',
      siteName: 'Better Auth',
      title: override.title ?? undefined,
      url: 'https://demo.better-auth.com',
      ...override.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@baku',
      description: override.description ?? undefined,
      images: 'https://demo.better-auth.com/og.png',
      title: override.title ?? undefined,
      ...override.twitter,
    },
  };
}
