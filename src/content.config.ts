import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { blogLoader } from '@/loaders/blogLoader';

const blog = defineCollection({
  loader: blogLoader(),
  schema: z
    .object({
      title: z.string(),
      description: z.string().nullable().default(''),
      created_at: z.coerce.date(),
      updated_at: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.coerce.boolean().default(false),
      url: z.string().nullable().optional(),
      slug: z.string().nullable().optional(),
    })
    .refine(
      (data) => {
        if (data.url) return true;
        return data.slug != null && data.slug !== '';
      },
      {
        message: 'slug is required for internal posts (posts without url)',
        path: ['slug'],
      }
    ),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().nullable().default(''),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date().optional(),
  }),
});

export const collections = { blog, pages };
