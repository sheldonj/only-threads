import { createMetadata } from '@/lib/utils/metadata';
import { type Metadata } from 'next';
import { UsersClient } from './client-page';

export const metadata: Metadata = createMetadata({
  description: 'Manage platform users, roles, and permissions.',
  title: 'User Management',
});

export default function UsersPage() {
  return <UsersClient />;
}

