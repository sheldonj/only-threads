import { Button } from '@/components/ui/button';

export function CourseNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
      <p className="text-muted-foreground mb-8">
        The course you&apos;re looking for doesn&apos;t exist or isn&apos;t
        published yet.
      </p>
      <Button asChild>
        <a href="/courses">Browse Courses</a>
      </Button>
    </div>
  );
}
