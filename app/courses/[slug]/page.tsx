import { CourseLessonList, CoursePurchaseCard } from './course-client';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { db } from '@/lib/database/client';
import { CourseJsonLd } from '@/lib/seo/json-ld';
import { createMetadata } from '@/lib/utils/metadata';
import { type Metadata } from 'next';
import Image from 'next/image';

type Props = {
  readonly params: Promise<{ slug: string }>;
};

const getCourse = (slug: string) =>
  db.course.findFirst({
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        select: { description: true, id: true, order: true, title: true },
      },
    },
    where: { published: true, slug },
  });

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    return <CourseNotFound />;
  }

  return (
    <>
      <CourseJsonLd
        coverImage={course.coverImage}
        description={course.description}
        lessonCount={course.lessons?.length ?? 0}
        price={course.price}
        slug={course.slug}
        title={course.title}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {course.coverImage && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <Image
                  alt={course.title}
                  className="object-cover"
                  fill
                  src={course.coverImage}
                />
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-muted-foreground text-lg">
                {course.description || 'No description available.'}
              </p>
            </div>

            <Separator />

            {/* Curriculum */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Curriculum</h2>
              <CourseLessonList course={course} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CoursePurchaseCard course={course} />
          </div>
        </div>
      </div>
    </>
  );
}

export function CourseNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
      <p className="text-muted-foreground mb-8">
        The course you&apos;re looking for doesn&apos;t exist or isn&apos;t
        published yet.
      </p>
      <Button asChild>
        <a href="/courses">Browse Courses</a>
      </Button>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    return createMetadata({
      title: 'Course Not Found',
    });
  }

  return createMetadata({
    description:
      course.description ||
      `Learn ${course.title} with our comprehensive course.`,
    openGraph: {
      images: course.coverImage || undefined,
      type: 'website',
    },
    title: course.title,
  });
}
