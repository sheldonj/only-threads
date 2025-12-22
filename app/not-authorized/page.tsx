import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createMetadata } from '@/lib/utils/metadata';
import { ShieldX } from 'lucide-react';
import { type Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = createMetadata({
  description: 'You do not have permission to access this page.',
  title: 'Access Denied',
});

export default function NotAuthorizedPage() {
  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <ShieldX className="h-5 w-5" />
            <AlertTitle className="text-lg">Access Denied</AlertTitle>
            <AlertDescription className="mt-2">
              <p>
                You do not have permission to access this page. Admin privileges
                are required.
              </p>
              <p className="mt-2 text-sm">
                If you believe this is an error, please contact the site
                administrator.
              </p>
            </AlertDescription>
          </Alert>
          <div className="mt-6 flex justify-center">
            <Button asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

