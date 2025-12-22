'use client';

import { CourseForm } from '@/components/courses/course-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSession } from '@/lib/auth/client';
import {
  useCoursePriceQueries,
  useCourseQueries,
} from '@/lib/hooks/use-models';
import { type CourseFormData } from '@/lib/validations/course';
import { AlertTriangle, ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function EditCoursePage() {
  const parameters = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const courseQueries = useCourseQueries();
  const coursePriceQueries = useCoursePriceQueries();
  const [error, setError] = useState<null | string>(null);

  // Fetch course with current active price
  const { data: course, isLoading } = courseQueries.useFindUnique({
    include: {
      prices: {
        take: 1,
        where: { validTo: null },
      },
    },
    where: { id: parameters.id },
  });

  const updateCourse = courseQueries.useUpdate();
  const updateCoursePrice = coursePriceQueries.useUpdate();
  const createCoursePrice = coursePriceQueries.useCreate();

  const isAdmin = session?.user?.role === 'admin';

  // Get the current active price record
  const currentPriceRecord = course?.prices?.[0];

  const handleSubmit = async (data: CourseFormData) => {
    setError(null);
    try {
      const priceChanged = course && data.price !== course.price;
      const now = new Date();

      // If price changed, close the old price and create a new one
      if (priceChanged && currentPriceRecord) {
        // Close the current price record
        await updateCoursePrice.mutateAsync({
          data: { validTo: now },
          where: { id: currentPriceRecord.id },
        });

        // Create new price record
        await createCoursePrice.mutateAsync({
          data: {
            courseId: parameters.id,
            price: data.price,
            validFrom: now,
            validTo: null,
          },
        });
      }

      // Update the course
      await updateCourse.mutateAsync({
        data: {
          coverImage: data.coverImage || null,
          description: data.description || null,
          price: data.price,
          published: data.published,
          slug: data.slug,
          title: data.title,
        },
        where: { id: parameters.id },
      });
      toast.success('Course updated successfully!');
      router.push('/admin/courses');
    } catch (caughtError) {
      const errorMessage =
        caughtError instanceof Error
          ? caughtError.message
          : 'An unexpected error occurred';

      if (
        errorMessage.includes('denied') ||
        errorMessage.includes('permission') ||
        errorMessage.includes('Access')
      ) {
        setError(
          'You do not have permission to update courses. Please ensure you have admin privileges.',
        );
      } else if (
        errorMessage.includes('unique') ||
        errorMessage.includes('slug')
      ) {
        setError(
          'A course with this URL slug already exists. Please choose a different slug.',
        );
      } else {
        setError(errorMessage);
      }

      toast.error('Failed to update course');
    }
  };

  if (isLoading || isSessionPending) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card>
          <CardContent className="p-8">
            <div className="flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Not Authenticated</AlertTitle>
          <AlertDescription>
            Please{' '}
            <Link
              className="underline font-medium"
              href="/sign-in"
            >
              sign in
            </Link>{' '}
            to access the admin area.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Course Not Found</AlertTitle>
          <AlertDescription>
            The course you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have permission to view it.
            <br />
            <Link
              className="underline font-medium"
              href="/admin/courses"
            >
              Back to Course Management
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-4">
        <Link
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          href="/admin/courses"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Link>
      </div>

      {!isAdmin && (
        <Alert
          className="mb-4"
          variant="destructive"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Admin Access Required</AlertTitle>
          <AlertDescription>
            You need admin privileges to edit courses. Your current role is:{' '}
            <strong>{session.user?.role || 'user'}</strong>.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Edit Course</CardTitle>
          <CardDescription>
            Update the details for &quot;{course.title}&quot;
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert
              className="mb-4"
              variant="destructive"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <CourseForm
            initialData={{
              coverImage: course.coverImage ?? '',
              description: course.description ?? '',
              price: course.price,
              published: course.published,
              slug: course.slug,
              title: course.title,
            }}
            isSubmitting={updateCourse.isPending}
            onSubmit={handleSubmit}
            submitLabel="Update Course"
          />
        </CardContent>
      </Card>
    </div>
  );
}
