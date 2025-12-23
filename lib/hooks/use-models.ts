'use client';

import { schema } from '@/lib/zenstack/generated/schema';
import { useClientQueries } from '@zenstackhq/tanstack-query/react';

export function useCoursePriceQueries() {
  const { coursePrice } = useClientQueries(schema);
  return coursePrice;
}

// Export typed hooks for convenience
export function useCourseQueries() {
  const { course } = useClientQueries(schema);
  return course;
}

export function useLessonProgressQueries() {
  const { lessonProgress } = useClientQueries(schema);
  return lessonProgress;
}

export function useLessonQueries() {
  const { lesson } = useClientQueries(schema);
  return lesson;
}

export function usePurchaseQueries() {
  const { purchase } = useClientQueries(schema);
  return purchase;
}

export function useRefundRequestQueries() {
  const { refundRequest } = useClientQueries(schema);
  return refundRequest;
}
