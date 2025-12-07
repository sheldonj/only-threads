'use client';

import { InvitationError } from './invitation-error';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { client, organization } from '@/lib/auth/client';
import { CheckIcon, XIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const InvitationSkeleton = () => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Skeleton className="h-10 w-24" />
      </CardFooter>
    </Card>
  );
};

export default function InvitationPage() {
  const parameters = useParams<{
    id: string;
  }>();
  const router = useRouter();
  const [invitationStatus, setInvitationStatus] = useState<
    'accepted' | 'pending' | 'rejected'
  >('pending');

  const [error, setError] = useState<null | string>(null);

  const handleAccept = async () => {
    const response = await organization.acceptInvitation({
      invitationId: parameters.id,
    });
    if (response.error) {
      setError(response.error?.message || 'An error occurred');
    } else {
      setInvitationStatus('accepted');
      router.push(`/dashboard`);
    }
  };

  const handleReject = async () => {
    const response = await organization.rejectInvitation({
      invitationId: parameters.id,
    });
    if (response.error) {
      setError(response.error?.message || 'An error occurred');
    } else {
      setInvitationStatus('rejected');
    }
  };

  const [invitation, setInvitation] = useState<null | {
    email: string;
    expiresAt: Date;
    id: string;
    inviterEmail: string;
    inviterId: string;
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    role: string;
    status: 'accepted' | 'canceled' | 'pending' | 'rejected';
  }>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      const response = await client.organization.getInvitation({
        query: {
          id: parameters.id,
        },
      });

      if (response.error) {
        setError(response.error.message || 'An error occurred');
      } else {
        setInvitation(response.data);
      }
    };

    void fetchInvitation();
  }, [parameters.id]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      {invitation ? (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Organization Invitation</CardTitle>
            <CardDescription>
              You&apos;ve been invited to join an organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invitationStatus === 'pending' && (
              <div className="space-y-4">
                <p>
                  <strong>{invitation?.inviterEmail}</strong> has invited you to
                  join <strong>{invitation?.organizationName}</strong>.
                </p>
                <p>
                  This invitation was sent to{' '}
                  <strong>{invitation?.email}</strong>.
                </p>
              </div>
            )}
            {invitationStatus === 'accepted' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full">
                  <CheckIcon className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-center">
                  Welcome to {invitation?.organizationName}!
                </h2>
                <p className="text-center">
                  You&apos;ve successfully joined the organization. We&apos;re
                  excited to have you on board!
                </p>
              </div>
            )}
            {invitationStatus === 'rejected' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
                  <XIcon className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-center">
                  Invitation Declined
                </h2>
                <p className="text-center">
                  You&lsquo;ve declined the invitation to join{' '}
                  {invitation?.organizationName}.
                </p>
              </div>
            )}
          </CardContent>
          {invitationStatus === 'pending' && (
            <CardFooter className="flex justify-between">
              <Button
                onClick={handleReject}
                variant="outline"
              >
                Decline
              </Button>
              <Button onClick={handleAccept}>Accept Invitation</Button>
            </CardFooter>
          )}
        </Card>
      ) : error ? (
        <InvitationError />
      ) : (
        <InvitationSkeleton />
      )}
    </div>
  );
}
