import { z } from 'zod';

export const courseSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase with hyphens only (e.g., my-course-title)'
    ),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
  coverImage: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(1000000, 'Price is too high'),
  published: z.boolean(),
});

export type CourseFormData = z.infer<typeof courseSchema>;

export const lessonSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  videoUrl: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  content: z
    .string()
    .max(50000, 'Content is too long')
    .optional()
    .or(z.literal('')),
  order: z.number().min(0, 'Order must be positive'),
});

export type LessonFormData = z.infer<typeof lessonSchema>;


