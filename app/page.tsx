import { SeedButton } from '@/components/seed-button';
import { SignInButton, SignInFallback } from '@/components/sign-in-button';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap, PlayCircle, Trophy } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export default async function Home() {
  const features = [
    {
      description: 'Access courses anytime, anywhere',
      icon: PlayCircle,
      title: 'On-Demand Learning',
    },
    {
      description: 'Learn from industry experts',
      icon: GraduationCap,
      title: 'Expert Instructors',
    },
    {
      description: 'Wide range of topics to explore',
      icon: BookOpen,
      title: 'Comprehensive Courses',
    },
    {
      description: 'Earn credentials for your achievements',
      icon: Trophy,
      title: 'Certificates',
    },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center overflow-hidden no-visible-scrollbar px-6 md:px-0">
      <main className="flex flex-col gap-8 items-center justify-center max-w-4xl">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full">
          {features.map((feature) => (
            <div
              className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              key={feature.title}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
