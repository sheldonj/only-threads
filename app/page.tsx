import { FeatureCard } from './components/feature-card';
import { HeroSection } from './components/hero-section';
import { OrganizationJsonLd, WebsiteJsonLd } from '@/lib/seo/json-ld';
import { BookOpen, GraduationCap, PlayCircle, Trophy } from 'lucide-react';

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

export default async function Home() {
  return (
    <>
      <WebsiteJsonLd
        description="Learn something new today with our curated collection of courses. Expand your skills at your own pace."
        name="Learn Something"
      />
      <OrganizationJsonLd
        description="An online learning platform offering courses to help you expand your skills."
        name="Learn Something"
      />
      <div className="min-h-[80vh] flex items-center justify-center overflow-hidden no-visible-scrollbar px-6 md:px-0">
        <main className="flex flex-col gap-8 items-center justify-center max-w-4xl">
          <HeroSection />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full">
            {features.map((feature) => (
              <FeatureCard
                description={feature.description}
                icon={feature.icon}
                key={feature.title}
                title={feature.title}
              />
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
