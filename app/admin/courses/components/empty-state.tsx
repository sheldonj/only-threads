'use client';

import { Button } from '@/components/ui/button';
import { BookOpen, Plus } from 'lucide-react';
import Link from 'next/link';

type EmptyStateProps = {
  readonly isAdmin: boolean;
};

export function EmptyState({ isAdmin }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground mb-4">No courses yet</p>
      <p className="text-sm text-muted-foreground mb-6">
        Get started by creating your first course. You can add lessons, set
        pricing, and publish when ready.
      </p>
      <Link href="/admin/courses/new">
        <Button disabled={!isAdmin}>
          <Plus className="mr-2 h-4 w-4" /> Create Your First Course
        </Button>
      </Link>
    </div>
  );
}
