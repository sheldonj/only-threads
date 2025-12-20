import { z } from 'zod';

export const courseSchema = z.object({
  coverImage: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(2_000, 'Description must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(1_000_000, 'Price is too high'),
  published: z.boolean(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(
      /^[\da-z]+(?:-[\da-z]+)*$/u,
      'Slug must be lowercase with hyphens only (e.g., my-course-title)',
    ),
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
});

export type CourseFormData = z.infer<typeof courseSchema>;

export const lessonSchema = z.object({
  content: z
    .string()
    .max(50_000, 'Content is too long')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  order: z.number().min(0, 'Order must be positive'),
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  videoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type LessonFormData = z.infer<typeof lessonSchema>;
