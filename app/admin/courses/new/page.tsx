'use client';

import { CourseForm } from '@/components/courses/course-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/lib/auth/client';
import { useCourseQueries } from '@/lib/hooks/use-models';
import type { CourseFormData } from '@/lib/validations/course';
import { AlertTriangle, ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NewCoursePage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const course = useCourseQueries();
  const createCourse = course.useCreate();
  const [error, setError] = useState<string | null>(null);

  const isAdmin = session?.user?.role === 'admin';

  const handleSubmit = async (data: CourseFormData) => {
    setError(null);
    try {
      await createCourse.mutateAsync({
        data: {
          coverImage: data.coverImage || null,
          description: data.description || null,
          price: data.price,
          published: data.published,
          slug: data.slug,
          title: data.title,
        },
      });
      toast.success('Course created successfully!');
      router.push('/admin/courses');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      // Check for common error patterns
      if (errorMessage.includes('denied') || errorMessage.includes('permission') || errorMessage.includes('Access')) {
        setError('You do not have permission to create courses. Please ensure you have admin privileges.');
      } else if (errorMessage.includes('unique') || errorMessage.includes('slug')) {
        setError('A course with this URL slug already exists. Please choose a different slug.');
      } else {
        setError(errorMessage);
      }
      
      toast.error('Failed to create course');
    }
  };

  if (isSessionPending) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-pulse">Loading...</div>
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
            Please <Link href="/sign-in" className="underline font-medium">sign in</Link> to access the admin area.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-4">
        <Link 
          href="/admin/courses" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Link>
      </div>

      {!isAdmin && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Admin Access Required</AlertTitle>
          <AlertDescription>
            You need admin privileges to create courses. Your current role is: <strong>{session.user?.role || 'user'}</strong>.
            <br />
            <span className="text-sm mt-1 block">
              To become an admin, update your user role in the database or contact the site administrator.
            </span>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create New Course</CardTitle>
          <CardDescription>
            Fill in the details below to create a new course. You can add lessons after creating the course.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <CourseForm
            onSubmit={handleSubmit}
            submitLabel="Create Course"
            isSubmitting={createCourse.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
