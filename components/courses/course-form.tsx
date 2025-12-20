'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { type CourseFormData, courseSchema } from '@/lib/validations/course';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';

interface CourseFormProps {
  readonly initialData?: Partial<CourseFormData>;
  readonly onSubmit: (data: CourseFormData) => Promise<void>;
  readonly submitLabel?: string;
  readonly isSubmitting?: boolean;
}

export function CourseForm({
  initialData,
  onSubmit,
  submitLabel = 'Save Course',
  isSubmitting = false,
}: CourseFormProps) {
  // Track if slug was manually edited by the user
  const slugManuallyEdited = useRef(!!initialData?.slug);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      slug: initialData?.slug ?? '',
      description: initialData?.description ?? '',
      coverImage: initialData?.coverImage ?? '',
      price: initialData?.price ?? 0,
      published: initialData?.published ?? false,
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (value: string, onChange: (value: string) => void) => {
    onChange(value);
    
    // Only auto-generate slug if it hasn't been manually edited
    if (!slugManuallyEdited.current && value) {
      form.setValue('slug', generateSlug(value), { shouldValidate: false });
    }
  };

  const handleSlugChange = (value: string, onChange: (value: string) => void) => {
    slugManuallyEdited.current = true;
    onChange(value);
  };

  const handleSubmit = async (data: CourseFormData) => {
    await onSubmit(data);
  };

  const price = form.watch('price');
  const slug = form.watch('slug');

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Introduction to TypeScript"
                  {...field}
                  onChange={(e) => handleTitleChange(e.target.value, field.onChange)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Slug</FormLabel>
              <FormControl>
                <Input
                  placeholder="introduction-to-typescript"
                  {...field}
                  onChange={(e) => handleSlugChange(e.target.value, field.onChange)}
                />
              </FormControl>
              <FormDescription>
                This will be the URL: /courses/{slug || 'your-slug'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A comprehensive course on TypeScript fundamentals..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/image.jpg"
                  type="url"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (in cents)</FormLabel>
              <FormControl>
                <Input
                  min="0"
                  placeholder="4999"
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                Display price: ${(price / 100).toFixed(2)}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Published</FormLabel>
                <FormDescription>
                  Make this course visible to students
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          className="w-full"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </form>
    </Form>
  );
}
