'use client';

/* eslint-disable no-alert */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSession } from '@/lib/auth/client';
import { useCourseQueries } from '@/lib/hooks/use-models';
import {
  type Course,
  type Lesson,
  type Purchase,
} from '@/lib/zenstack/generated/models';
import {
  AlertTriangle,
  BookOpen,
  Loader2,
  Pencil,
  Plus,
  ShieldAlert,
  Trash,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminCoursesPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const course = useCourseQueries();

  const {
    data: courses,
    isLoading,
    refetch,
  } = course.useFindMany({
    include: {
      lessons: { select: { id: true } },
      purchases: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const deleteCourse = course.useDelete();

  const isAdmin = session?.user?.role === 'admin';

  const handleDelete = async (id: string) => {
    const shouldDelete = confirm(
      'Are you sure you want to delete this course? This will also delete all lessons and cannot be undone.',
    );
    if (!shouldDelete) return;

    try {
      await deleteCourse.mutateAsync({ where: { id } });
      toast.success('Course deleted successfully');
      refetch();
    } catch {
      toast.error('Failed to delete course');
    }
  };

  if (isSessionPending) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
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

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Admin Warning */}
      {!isAdmin && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Admin Access Required</AlertTitle>
          <AlertDescription>
            <p>
              You need admin privileges to manage courses. Your current role is:{' '}
              <strong>{session.user?.role || 'user'}</strong>.
            </p>
            <p className="text-sm mt-2">
              To become an admin, you need to update your user role in the
              database. Run this SQL command:{' '}
              <code className="bg-destructive/20 px-1 rounded">
                UPDATE user SET role = &apos;admin&apos; WHERE email = &apos;
                {session.user?.email}&apos;;
              </code>
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Links for New Admins */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common tasks for managing your LMS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/courses/new">
              <Button
                size="sm"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" /> Create Course
              </Button>
            </Link>
            <Link href="/courses">
              <Button
                size="sm"
                variant="outline"
              >
                <BookOpen className="mr-2 h-4 w-4" /> View Public Catalog
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="sm"
                variant="outline"
              >
                Account Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Course Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Course Management</CardTitle>
            <CardDescription>Create and manage your courses</CardDescription>
          </div>
          <Link href="/admin/courses/new">
            <Button disabled={!isAdmin}>
              <Plus className="mr-2 h-4 w-4" /> New Course
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : courses && courses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead>Purchases</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map(
                  (
                    courseRow: Course & {
                      lessons?: Lesson[];
                      purchases?: Purchase[];
                    },
                  ) => (
                    <TableRow key={courseRow.id}>
                      <TableCell className="font-medium">
                        {courseRow.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {courseRow.slug}
                      </TableCell>
                      <TableCell>
                        ${(courseRow.price / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>{courseRow.lessons?.length ?? 0}</TableCell>
                      <TableCell>{courseRow.purchases?.length ?? 0}</TableCell>
                      <TableCell>
                        {courseRow.published ? (
                          <Badge variant="default">Published</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() =>
                              router.push(
                                `/admin/courses/${courseRow.id}/lessons`,
                              )
                            }
                            size="sm"
                            title="Manage Lessons"
                            variant="outline"
                          >
                            <BookOpen className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() =>
                              router.push(`/admin/courses/${courseRow.id}/edit`)
                            }
                            size="sm"
                            title="Edit Course"
                            variant="outline"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            disabled={deleteCourse.isPending}
                            onClick={() => handleDelete(courseRow.id)}
                            size="sm"
                            title="Delete Course"
                            variant="destructive"
                          >
                            {deleteCourse.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No courses yet</p>
              <p className="text-sm text-muted-foreground mb-6">
                Get started by creating your first course. You can add lessons,
                set pricing, and publish when ready.
              </p>
              <Link href="/admin/courses/new">
                <Button disabled={!isAdmin}>
                  <Plus className="mr-2 h-4 w-4" /> Create Your First Course
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* eslint-enable no-alert */
