'use client';

import { SeedButton } from '@/components/seed-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plus } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/admin/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
        >
          <Link href="/admin/courses">
            <BookOpen className="mr-2 h-4 w-4" />
            Manage Courses
          </Link>
        </Button>
        {isDev && <SeedButton />}
      </CardContent>
    </Card>
  );
}

