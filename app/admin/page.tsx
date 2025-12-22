import { AdminDashboardClient } from './client-page';
import { createMetadata } from '@/lib/utils/metadata';
import { type Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  description: 'Manage users, courses, and view platform statistics.',
  title: 'Admin Dashboard',
});

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
