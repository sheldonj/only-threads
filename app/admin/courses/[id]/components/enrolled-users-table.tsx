'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type Purchase, type User } from '@/lib/zenstack/generated/models';
import { Users } from 'lucide-react';

type EnrolledUsersTableProps = {
  readonly lessonCount: number;
  readonly progressByUser: Map<
    string,
    { completed: number; lastActivity: Date | null }
  >;
  readonly purchases: PurchaseWithUser[];
};

type PurchaseWithUser = Purchase & {
  user: Pick<User, 'email' | 'id' | 'image' | 'name'>;
};

export function EnrolledUsersTable({
  lessonCount,
  progressByUser,
  purchases,
}: EnrolledUsersTableProps) {
  if (purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-2">No students enrolled yet</p>
        <p className="text-sm text-muted-foreground">
          Students will appear here once they purchase this course.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Purchase Date</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Completion</TableHead>
          <TableHead>Last Activity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchases.map((purchase) => {
          const userProgress = progressByUser.get(purchase.userId) ?? {
            completed: 0,
            lastActivity: null,
          };
          const completedLessons = userProgress.completed;
          const percentage =
            lessonCount > 0
              ? Math.round((completedLessons / lessonCount) * 100)
              : 0;

          return (
            <TableRow key={purchase.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      alt={purchase.user.name ?? purchase.user.email}
                      src={purchase.user.image ?? undefined}
                    />
                    <AvatarFallback>
                      {getInitials(purchase.user.name, purchase.user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {purchase.user.name ?? 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {purchase.user.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(purchase.createdAt)}
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {completedLessons}/{lessonCount} lessons
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 min-w-[120px]">
                  <Progress
                    className="h-2 flex-1"
                    value={percentage}
                  />
                  <span className="text-sm text-muted-foreground w-10">
                    {percentage}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatRelativeDate(userProgress.lastActivity)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatRelativeDate(date: Date | null): string {
  if (!date) return '—';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1_000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(date);
}

function getInitials(name: null | string, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  return email.slice(0, 2).toUpperCase();
}
