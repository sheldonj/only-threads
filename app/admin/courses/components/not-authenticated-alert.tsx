'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export function NotAuthenticatedAlert() {
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
