'use client';

/* eslint-disable no-alert */

import { AdminWarningAlert } from './components/admin-warning-alert';
import { CourseTable } from './components/course-table';
import { EmptyState } from './components/empty-state';
import { NotAuthenticatedAlert } from './components/not-authenticated-alert';
import { QuickActionsCard } from './components/quick-actions-card';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSession } from '@/lib/auth/client';
import { useCourseQueries } from '@/lib/hooks/use-models';
import { Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export function AdminCoursesClient() {
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
    return <NotAuthenticatedAlert />;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {!isAdmin && (
        <AdminWarningAlert
          email={session.user?.email}
          role={session.user?.role}
        />
      )}

      <QuickActionsCard />

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
            <CourseTable
              courses={courses}
              isDeleting={deleteCourse.isPending}
              onDelete={handleDelete}
            />
          ) : (
            <EmptyState isAdmin={isAdmin} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* eslint-enable no-alert */
