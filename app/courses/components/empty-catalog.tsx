import { BookOpen } from 'lucide-react';

export function EmptyCatalog() {
  return (
    <div className="text-center py-16">
      <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
      <h2 className="text-xl font-semibold mb-2">No courses available yet</h2>
      <p className="text-muted-foreground">Check back soon for new courses!</p>
    </div>
  );
}
