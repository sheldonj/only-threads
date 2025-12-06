import { OrganizationCard } from './organization-card';
import TodoListsCard from './todo-lists-card';
import UserCard from './user-card';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const [session, activeSessions, organization] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    auth.api.listSessions({
      headers: await headers(),
    }),
    auth.api.getFullOrganization({
      headers: await headers(),
    }),
  ]).catch(() => {
    throw redirect('/sign-in');
  });
  return (
    <div className="w-full">
      <div className="flex gap-4 flex-col">
        <UserCard
          activeSessions={JSON.parse(JSON.stringify(activeSessions))}
          session={JSON.parse(JSON.stringify(session))}
        />
        <OrganizationCard
          activeOrganization={JSON.parse(JSON.stringify(organization))}
          session={JSON.parse(JSON.stringify(session))}
        />
        <TodoListsCard />
      </div>
    </div>
  );
}
