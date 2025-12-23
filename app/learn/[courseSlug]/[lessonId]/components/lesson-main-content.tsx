'use client';

import { LessonBreadcrumb } from './lesson-breadcrumb';
import { LessonContent } from './lesson-content';
import { LessonHeader } from './lesson-header';
import { LessonNavigation } from './lesson-navigation';
import { LessonVideo } from './lesson-video';
import { type Lesson } from '@/lib/zenstack/generated/models';

type LessonMainContentProps = {
  readonly courseSlug: string;
  readonly courseTitle: string;
  readonly isComplete: boolean;
  readonly isMarkingComplete: boolean;
  readonly lesson: Lesson;
  readonly nextLesson: null | Pick<Lesson, 'id' | 'title'>;
  readonly onMarkComplete: () => void;
  readonly previousLesson: null | Pick<Lesson, 'id' | 'title'>;
};

export function LessonMainContent({
  courseSlug,
  courseTitle,
  isComplete,
  isMarkingComplete,
  lesson,
  nextLesson,
  onMarkComplete,
  previousLesson,
}: LessonMainContentProps) {
  return (
    <div className="flex-1 min-w-0 space-y-8">
      <LessonBreadcrumb
        courseSlug={courseSlug}
        courseTitle={courseTitle}
        lessonTitle={lesson.title}
      />

      <LessonHeader
        description={lesson.description}
        isComplete={isComplete}
        isMarkingComplete={isMarkingComplete}
        onMarkComplete={onMarkComplete}
        title={lesson.title}
      />

      {lesson.videoUrl && (
        <LessonVideo
          isFree={lesson.isFree}
          lessonId={lesson.id}
          thumbnailUrl={lesson.thumbnailUrl}
          title={lesson.title}
          videoUrl={lesson.videoUrl}
        />
      )}

      {lesson.content && <LessonContent content={lesson.content} />}

      <LessonNavigation
        courseSlug={courseSlug}
        nextLesson={nextLesson}
        previousLesson={previousLesson}
      />
    </div>
  );
}
