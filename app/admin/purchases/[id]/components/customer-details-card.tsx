'use client';

import { type PurchaseWithRelations } from '../client-page';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserHoverCard } from '@/components/user-hover-card';

type CustomerDetailsCardProps = {
  readonly purchase: PurchaseWithRelations;
};

export function CustomerDetailsCard({ purchase }: CustomerDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Details</CardTitle>
        <CardDescription>Information about the purchaser</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <UserHoverCard
            email={purchase.user?.email}
            image={purchase.user?.image}
            name={purchase.user?.name}
            role={purchase.user?.role}
            size="lg"
          />
          <div>
            <p className="font-medium">
              {purchase.user?.name || 'Unknown User'}
            </p>
            <p className="text-sm text-muted-foreground">
              {purchase.user?.email || 'No email'}
            </p>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">User ID</p>
            <p className="font-mono text-xs">{purchase.userId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Role</p>
            <p className="capitalize">{purchase.user?.role || 'user'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
