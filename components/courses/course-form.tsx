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

type CourseFormProps = {
  readonly initialData?: Partial<CourseFormData>;
  readonly isSubmitting?: boolean;
  readonly onSubmit: (data: CourseFormData) => Promise<void>;
  readonly submitLabel?: string;
};

export function CourseForm({
  initialData,
  isSubmitting = false,
  onSubmit,
  submitLabel = 'Save Course',
}: CourseFormProps) {
  // Track if slug was manually edited by the user
  const slugManuallyEdited = useRef(Boolean(initialData?.slug));

  const form = useForm<CourseFormData>({
    defaultValues: {
      coverImage: initialData?.coverImage ?? '',
      description: initialData?.description ?? '',
      price: initialData?.price ?? 0,
      published: initialData?.published ?? false,
      slug: initialData?.slug ?? '',
      title: initialData?.title ?? '',
    },
    resolver: zodResolver(courseSchema),
  });

  const handleTitleChange = (
    value: string,
    onChange: (value: string) => void,
  ) => {
    onChange(value);

    // Only auto-generate slug if it hasn't been manually edited
    if (!slugManuallyEdited.current && value) {
      form.setValue('slug', generateSlug(value), { shouldValidate: false });
    }
  };

  const handleSlugChange = (
    value: string,
    onChange: (value: string) => void,
  ) => {
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
                  onChange={(event) =>
                    handleTitleChange(event.target.value, field.onChange)
                  }
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
                  onChange={(event) =>
                    handleSlugChange(event.target.value, field.onChange)
                  }
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
                  onChange={(event) =>
                    field.onChange(Number.parseInt(event.target.value, 10) || 0)
                  }
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
                  onCheckedChange={(checked) => field.onChange(checked)}
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

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replaceAll(/[^\s\w-]/gu, '')
    .replaceAll(/[\s_-]+/gu, '-')
    .replaceAll(/^-+|-+$/gu, '');
}
