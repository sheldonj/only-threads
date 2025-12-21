'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

type AdminWarningAlertProps = {
  readonly email?: null | string;
  readonly role?: null | string;
};

export function AdminWarningAlert({ email, role }: AdminWarningAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Admin Access Required</AlertTitle>
      <AlertDescription>
        <p>
          You need admin privileges to manage courses. Your current role is:{' '}
          <strong>{role || 'user'}</strong>.
        </p>
        <p className="text-sm mt-2">
          To become an admin, you need to update your user role in the database.
          Run this SQL command:{' '}
          <code className="bg-destructive/20 px-1 rounded">
            UPDATE user SET role = &apos;admin&apos; WHERE email = &apos;
            {email}&apos;;
          </code>
        </p>
      </AlertDescription>
    </Alert>
  );
}
