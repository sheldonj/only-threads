import { AdminPurchasesClient } from './client-page';
import { createMetadata } from '@/lib/utils/metadata';
import { type Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  description:
    'View and manage all platform purchases, process refunds, and export data.',
  title: 'Purchase Management',
});

export default function AdminPurchasesPage() {
  return <AdminPurchasesClient />;
}
