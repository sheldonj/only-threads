'use client';

import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import Link from 'next/link';

type AccessRequiredProps = {
  readonly courseSlug: string;
};

export function AccessRequired({ courseSlug }: AccessRequiredProps) {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-4">Access Required</h1>
      <p className="text-muted-foreground mb-8">
        You need to purchase this course to access its content.
      </p>
      <Link href={`/courses/${courseSlug}`}>
        <Button>View Course Details</Button>
      </Link>
    </div>
  );
}
