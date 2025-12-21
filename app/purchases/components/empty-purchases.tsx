'use client';

import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export function EmptyPurchases() {
  return (
    <div className="text-center py-16">
      <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
      <h2 className="text-xl font-semibold mb-2">No purchases yet</h2>
      <p className="text-muted-foreground mb-8">
        You haven&apos;t made any purchases yet. Browse our courses to get
        started!
      </p>
      <Link href="/courses">
        <Button>Browse Courses</Button>
      </Link>
    </div>
  );
}
