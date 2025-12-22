'use client';

import { EnrolledUsersTable } from './components/enrolled-users-table';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/lib/auth/client';
import {
  useCourseQueries,
  useLessonProgressQueries,
} from '@/lib/hooks/use-models';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  DollarSign,
  ExternalLink,
  Loader2,
  Pencil,
  ShieldAlert,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export function ClientPage() {
  const params = useParams<{ id: string }>();
  const { data: session, isPending: isSessionPending } = useSession();
  const courseQueries = useCourseQueries();
  const lessonProgressQueries = useLessonProgressQueries();

  const isAdmin = session?.user?.role === 'admin';

  const { data: course, isLoading: isCourseLoading } =
    courseQueries.useFindUnique({
      include: {
        lessons: { select: { id: true } },
        purchases: {
          include: {
            user: { select: { email: true, id: true, image: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      where: { id: params.id },
    });

  const lessonIds = course?.lessons.map((l) => l.id) ?? [];
  const userIds = course?.purchases.map((p) => p.userId) ?? [];

  const { data: progress, isLoading: isProgressLoading } =
    lessonProgressQueries.useFindMany({
      where: {
        completed: true,
        lessonId: { in: lessonIds },
        userId: { in: userIds },
      },
    });

  const isLoading = isCourseLoading || isSessionPending;

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
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

  const totalRevenue = course.purchases.reduce((sum, p) => sum + p.amount, 0);
  const lessonCount = course.lessons.length;
  const enrolledCount = course.purchases.length;

  // Aggregate progress by user
  const progressByUser = new Map<string, { completed: number; lastActivity: Date | null }>();
  
  if (progress) {
    for (const p of progress) {
      const existing = progressByUser.get(p.userId) ?? { completed: 0, lastActivity: null };
      existing.completed += 1;
      const updatedAt = new Date(p.updatedAt);
      if (!existing.lastActivity || updatedAt > existing.lastActivity) {
        existing.lastActivity = updatedAt;
      }
      progressByUser.set(p.userId, existing);
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Back Navigation */}
      <Link
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        href="/admin/courses"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Courses
      </Link>

      {/* Admin Warning */}
      {!isAdmin && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Admin Access Required</AlertTitle>
          <AlertDescription>
            You need admin privileges to manage this course. Your current role
            is: <strong>{session.user?.role || 'user'}</strong>.
          </AlertDescription>
        </Alert>
      )}

      {/* Course Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Cover Image */}
            {course.coverImage && (
              <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0">
                <Image
                  alt={course.title}
                  className="object-cover"
                  fill
                  src={course.coverImage}
                />
              </div>
            )}

            {/* Course Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{course.title}</h1>
                  <p className="text-muted-foreground text-sm">/{course.slug}</p>
                </div>
                <Badge variant={course.published ? 'default' : 'secondary'}>
                  {course.published ? 'Published' : 'Draft'}
                </Badge>
              </div>

              {course.description && (
                <p className="text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Link href={`/admin/courses/${params.id}/edit`}>
                  <Button
                    disabled={!isAdmin}
                    size="sm"
                    variant="outline"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Course
                  </Button>
                </Link>
                <Link href={`/admin/courses/${params.id}/lessons`}>
                  <Button
                    disabled={!isAdmin}
                    size="sm"
                    variant="outline"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Manage Lessons
                  </Button>
                </Link>
                {course.published && (
                  <Link
                    href={`/courses/${course.slug}`}
                    target="_blank"
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Public Page
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lessons</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lessonCount}</div>
            <p className="text-xs text-muted-foreground">
              {lessonCount === 1 ? 'lesson' : 'lessons'} in this course
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrolled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCount}</div>
            <p className="text-xs text-muted-foreground">
              {enrolledCount === 1 ? 'student' : 'students'} enrolled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalRevenue / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              total from {enrolledCount} {enrolledCount === 1 ? 'sale' : 'sales'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(course.price / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">per enrollment</p>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Users Section */}
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students</CardTitle>
          <CardDescription>
            Students who have purchased this course and their progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isProgressLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <EnrolledUsersTable
              lessonCount={lessonCount}
              progressByUser={progressByUser}
              purchases={course.purchases}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

