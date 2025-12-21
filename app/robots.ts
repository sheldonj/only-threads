import { getBaseUrl } from '@/lib/utils/metadata';
import { type MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/library/',
          '/learn/',
          '/purchases/',
        ],
        userAgent: '*',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
