'use client';

import { ShoppingBag } from 'lucide-react';

type EmptyPurchasesProps = {
  readonly hasFilters: boolean;
};

export function EmptyPurchases({ hasFilters }: EmptyPurchasesProps) {
  return (
    <div className="text-center py-16">
      <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
      <h2 className="text-xl font-semibold mb-2">
        {hasFilters ? 'No purchases match your filters' : 'No purchases yet'}
      </h2>
      <p className="text-muted-foreground">
        {hasFilters
          ? 'Try adjusting your filters to see more results.'
          : 'When customers purchase courses, they will appear here.'}
      </p>
    </div>
  );
}
