'use client';

import { QuickActions } from './components/quick-actions';
import { RecentPurchases } from './components/recent-purchases';
import { StatsCards } from './components/stats-cards';
import { UsersSection } from './components/users-section';
import { Toaster } from 'sonner';

export function AdminDashboardClient() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <Toaster richColors />
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <StatsCards />
      <QuickActions />
      <RecentPurchases />
      <UsersSection />
    </div>
  );
}
