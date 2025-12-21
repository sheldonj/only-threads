import { SeedButton } from '@/components/seed-button';
import { SignInButton, SignInFallback } from '@/components/sign-in-button';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export function HeroSection() {
  return (
    <div className="flex flex-col gap-8 items-center justify-center">
      <div className="flex flex-col gap-3 text-center">
        <h1 className="font-bold text-4xl md:text-5xl text-black dark:text-white">
          Learn Something New Today
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
          Expand your skills with our curated collection of courses. your own
          pace and achieve your goals.
        </p>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        <Link href="/courses">
          <Button
            className="px-8"
            size="lg"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Browse Courses
          </Button>
        </Link>
        <Suspense fallback={<SignInFallback />}>
          <SignInButton />
        </Suspense>
        <SeedButton />
      </div>
    </div>
  );
}
