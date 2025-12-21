'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookOpen, Plus } from 'lucide-react';
import Link from 'next/link';

export function QuickActionsCard() {
  return (
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
  );
}
