'use client';

/* eslint-disable react/no-danger */

import { Card, CardContent } from '@/components/ui/card';

type LessonContentProps = {
  readonly content: string;
};

export function LessonContent({ content }: LessonContentProps) {
  return (
    <Card className="overflow-hidden border-border/50 shadow-lg">
      <CardContent className="p-6 md:p-8 prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-code:text-primary">
        <div
          dangerouslySetInnerHTML={{
            __html: content.replaceAll('\n', '<br />'),
          }}
        />
      </CardContent>
    </Card>
  );
}

/* eslint-enable react/no-danger */
