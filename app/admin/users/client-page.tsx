'use client';

import { UsersSection } from '../components/users-section';

export function UsersClient() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>
      <UsersSection showViewAll={false} />
    </div>
  );
}

