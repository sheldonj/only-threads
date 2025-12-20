'use client';

import { schema } from '@/lib/zenstack/generated/schema';
import { useClientQueries } from '@zenstackhq/tanstack-query/react';

// Export typed hooks for convenience
export function useCourseQueries() {
  const { course } = useClientQueries(schema);
  return course;
}

export function useLessonQueries() {
  const { lesson } = useClientQueries(schema);
  return lesson;
}

export function useModels() {
  return useClientQueries(schema);
}

export function usePurchaseQueries() {
  const { purchase } = useClientQueries(schema);
  return purchase;
}
