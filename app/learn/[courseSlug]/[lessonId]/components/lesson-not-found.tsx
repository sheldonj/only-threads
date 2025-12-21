'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function LessonNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Lesson Not Found</h1>
      <Link href="/library">
        <Button>Back to Library</Button>
      </Link>
    </div>
  );
}
