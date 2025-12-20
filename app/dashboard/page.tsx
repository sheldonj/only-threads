'use client';

import UserCard from './user-card';
import { client, useSession } from '@/lib/auth/client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();

  const { data: activeSessions, isPending: isSessionsPending } = useQuery({
    enabled: Boolean(session),
    queryFn: async () => {
      const result = await client.listSessions();
      return result.data || [];
    },
    queryKey: ['sessions'],
  });

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push('/sign-in');
    }
  }, [isSessionPending, router, session]);

  if (isSessionPending || isSessionsPending) {
    return null;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex gap-4 flex-col">
        <UserCard
          activeSessions={activeSessions || []}
          session={session}
        />
      </div>
    </div>
  );
}
