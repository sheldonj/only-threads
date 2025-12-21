import { CourseCatalogCard } from './components/course-catalog-card';
import { EmptyCatalog } from './components/empty-catalog';
import { db } from '@/lib/database/client';
import { createMetadata } from '@/lib/utils/metadata';
import { type Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  description:
    'Browse our collection of courses and start learning today. Find courses on a wide range of topics.',
  title: 'Course Catalog',
});

export default async function CourseCatalogPage() {
  const courses = await db.course.findMany({
    include: {
      lessons: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
    where: { published: true },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Course Catalog</h1>
        <p className="text-muted-foreground">
          Browse our collection of courses and start learning today.
        </p>
      </div>

      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCatalogCard
              course={course}
              key={course.id}
            />
          ))}
        </div>
      ) : (
        <EmptyCatalog />
      )}
    </div>
  );
}
