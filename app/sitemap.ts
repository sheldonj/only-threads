import { db } from '@/lib/database/client';
import { getBaseUrl } from '@/lib/utils/metadata';
import { type MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // Fetch all published courses
  const courses = await db.course.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
    where: { published: true },
  });

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      changeFrequency: 'weekly',
      lastModified: new Date(),
      priority: 1,
      url: baseUrl,
    },
    {
      changeFrequency: 'daily',
      lastModified: new Date(),
      priority: 0.9,
      url: `${baseUrl}/courses`,
    },
  ];

  // Dynamic course pages
  const coursePages: MetadataRoute.Sitemap = courses.map((course) => ({
    changeFrequency: 'weekly' as const,
    lastModified: course.updatedAt,
    priority: 0.8,
    url: `${baseUrl}/courses/${course.slug}`,
  }));

  return [...staticPages, ...coursePages];
}
