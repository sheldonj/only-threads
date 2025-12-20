'use client';

import { LessonForm } from '@/components/courses/lesson-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/lib/auth/client';
import { useLessonQueries } from '@/lib/hooks/use-models';
import type { LessonFormData } from '@/lib/validations/course';
import { AlertTriangle, ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function EditLessonPage() {
  const params = useParams<{ id: string; lessonId: string }>();
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const lessonQueries = useLessonQueries();
  const [error, setError] = useState<string | null>(null);

  const isAdmin = session?.user?.role === 'admin';

  const { data: lesson, isLoading } = lessonQueries.useFindUnique({
    where: { id: params.lessonId },
  });

  const updateLesson = lessonQueries.useUpdate();

  const handleSubmit = async (data: LessonFormData) => {
    setError(null);
    try {
      await updateLesson.mutateAsync({
        data: {
          content: data.content || null,
          description: data.description || null,
          order: data.order,
          title: data.title,
          videoUrl: data.videoUrl || null,
        },
        where: { id: params.lessonId },
      });
      toast.success('Lesson updated successfully!');
      router.push(`/admin/courses/${params.id}/lessons`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      if (errorMessage.includes('denied') || errorMessage.includes('permission')) {
        setError('You do not have permission to update lessons.');
      } else {
        setError(errorMessage);
      }
      
      toast.error('Failed to update lesson');
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
            Please <Link href="/sign-in" className="underline font-medium">sign in</Link> to access the admin area.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Lesson Not Found</AlertTitle>
          <AlertDescription>
            The lesson you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
            <br />
            <Link href={`/admin/courses/${params.id}/lessons`} className="underline font-medium">
              Back to Lessons
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl space-y-4">
      <Link 
        href={`/admin/courses/${params.id}/lessons`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Lessons
      </Link>

      {!isAdmin && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Admin Access Required</AlertTitle>
          <AlertDescription>
            You need admin privileges to edit lessons. Your current role is: <strong>{session.user?.role || 'user'}</strong>.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Edit Lesson</CardTitle>
          <CardDescription>Update the details for &quot;{lesson.title}&quot;</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <LessonForm
            initialData={{
              content: lesson.content ?? '',
              description: lesson.description ?? '',
              order: lesson.order,
              title: lesson.title,
              videoUrl: lesson.videoUrl ?? '',
            }}
            onSubmit={handleSubmit}
            submitLabel="Update Lesson"
            isSubmitting={updateLesson.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
