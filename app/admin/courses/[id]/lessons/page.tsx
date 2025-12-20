'use client';

/* eslint-disable no-alert */

import { LessonForm } from '@/components/courses/lesson-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSession } from '@/lib/auth/client';
import { useCourseQueries, useLessonQueries } from '@/lib/hooks/use-models';
import { type LessonFormData } from '@/lib/validations/course';
import { type Lesson } from '@/lib/zenstack/generated/models';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Loader2,
  Pencil,
  Plus,
  ShieldAlert,
  Trash,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CourseLessonsPage() {
  const parameters = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const courseQueries = useCourseQueries();
  const lessonQueries = useLessonQueries();

  const isAdmin = session?.user?.role === 'admin';

  const { data: course, isLoading: isCourseLoading } =
    courseQueries.useFindUnique({
      where: { id: parameters.id },
    });

  const {
    data: lessons,
    isLoading: isLessonsLoading,
    refetch,
  } = lessonQueries.useFindMany({
    orderBy: { order: 'asc' },
    where: { courseId: parameters.id },
  });

  const createLesson = lessonQueries.useCreate();
  const deleteLesson = lessonQueries.useDelete();

  const handleCreateLesson = async (data: LessonFormData) => {
    setError(null);
    try {
      await createLesson.mutateAsync({
        data: {
          content: data.content || null,
          courseId: parameters.id,
          description: data.description || null,
          order: data.order,
          title: data.title,
          videoUrl: data.videoUrl || null,
        },
      });
      toast.success('Lesson created successfully!');
      setIsDialogOpen(false);
      refetch();
    } catch (caughtError) {
      const errorMessage =
        caughtError instanceof Error
          ? caughtError.message
          : 'An unexpected error occurred';

      if (
        errorMessage.includes('denied') ||
        errorMessage.includes('permission')
      ) {
        setError('You do not have permission to create lessons.');
      } else {
        setError(errorMessage);
      }

      toast.error('Failed to create lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    const shouldDelete = confirm(
      'Are you sure you want to delete this lesson? This action cannot be undone.',
    );
    if (!shouldDelete) return;

    try {
      await deleteLesson.mutateAsync({ where: { id: lessonId } });
      toast.success('Lesson deleted successfully');
      refetch();
    } catch {
      toast.error('Failed to delete lesson');
    }
  };

  if (isCourseLoading || isLessonsLoading || isSessionPending) {
    return (
      <div className="container mx-auto p-4">
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
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          href="/admin/courses"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Link>
      </div>

      {!isAdmin && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Admin Access Required</AlertTitle>
          <AlertDescription>
            You need admin privileges to manage lessons. Your current role is:{' '}
            <strong>{session.user?.role || 'user'}</strong>.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Lessons</CardTitle>
            <CardDescription>
              Managing lessons for &quot;{course.title}&quot; •{' '}
              {lessons?.length ?? 0} lessons
            </CardDescription>
          </div>
          <Dialog
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setError(null);
            }}
            open={isDialogOpen}
          >
            <DialogTrigger asChild>
              <Button disabled={!isAdmin}>
                <Plus className="mr-2 h-4 w-4" /> Add Lesson
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Lesson</DialogTitle>
                <DialogDescription>
                  Create a new lesson for this course. Lessons are ordered by
                  the &quot;Order&quot; field.
                </DialogDescription>
              </DialogHeader>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <LessonForm
                initialData={{ order: lessons?.length ?? 0 }}
                isSubmitting={createLesson.isPending}
                onSubmit={handleCreateLesson}
                submitLabel="Create Lesson"
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {lessons && lessons.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Order</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Video</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson: Lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell>{lesson.order}</TableCell>
                    <TableCell className="font-medium">
                      {lesson.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {lesson.description || '—'}
                    </TableCell>
                    <TableCell>
                      {lesson.videoUrl ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() =>
                            router.push(
                              `/admin/courses/${parameters.id}/lessons/${lesson.id}/edit`,
                            )
                          }
                          size="sm"
                          title="Edit Lesson"
                          variant="outline"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          disabled={deleteLesson.isPending || !isAdmin}
                          onClick={() => handleDeleteLesson(lesson.id)}
                          size="sm"
                          title="Delete Lesson"
                          variant="destructive"
                        >
                          {deleteLesson.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No lessons yet</p>
              <p className="text-sm text-muted-foreground mb-6">
                Start building your course by adding your first lesson.
              </p>
              <Button
                disabled={!isAdmin}
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Your First Lesson
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* eslint-enable no-alert */
