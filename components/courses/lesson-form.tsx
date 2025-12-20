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
import { Textarea } from '@/components/ui/textarea';
import { type LessonFormData, lessonSchema } from '@/lib/validations/course';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

type LessonFormProps = {
  readonly initialData?: Partial<LessonFormData>;
  readonly isSubmitting?: boolean;
  readonly onSubmit: (data: LessonFormData) => Promise<void>;
  readonly submitLabel?: string;
};

export function LessonForm({
  initialData,
  isSubmitting = false,
  onSubmit,
  submitLabel = 'Save Lesson',
}: LessonFormProps) {
  const form = useForm<LessonFormData>({
    defaultValues: {
      content: initialData?.content ?? '',
      description: initialData?.description ?? '',
      order: initialData?.order ?? 0,
      title: initialData?.title ?? '',
      videoUrl: initialData?.videoUrl ?? '',
    },
    resolver: zodResolver(lessonSchema),
  });

  const handleSubmit = async (data: LessonFormData) => {
    await onSubmit(data);
  };

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
              <FormLabel>Lesson Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Getting Started"
                  {...field}
                />
              </FormControl>
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
                  placeholder="In this lesson, we'll cover..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://..."
                  type="url"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter the URL of your video (YouTube, Vimeo, or direct link)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lesson Content (Markdown)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="# Lesson Content&#10;&#10;Write your lesson content here..."
                  rows={10}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order</FormLabel>
              <FormControl>
                <Input
                  min="0"
                  type="number"
                  {...field}
                  onChange={(event) =>
                    field.onChange(Number.parseInt(event.target.value, 10) || 0)
                  }
                />
              </FormControl>
              <FormDescription>
                Lower numbers appear first in the course
              </FormDescription>
              <FormMessage />
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
