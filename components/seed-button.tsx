'use client';

import { Button } from '@/components/ui/button';
import { Database, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function SeedButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSeed = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Database seeded!', {
          description: `Created ${data.results.users.length} users and ${data.results.courses.length} courses`,
        });
      } else {
        toast.error('Seed failed', {
          description: data.error,
        });
      }
    } catch {
      toast.error('Seed failed', {
        description: 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      disabled={isLoading}
      onClick={handleSeed}
      size="lg"
      variant="outline"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Database className="mr-2 h-5 w-5" />
      )}
      Seed Database
    </Button>
  );
}
