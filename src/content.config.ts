import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { blogLoader } from '@/loaders/blogLoader';
import { githubContributionsLoader } from '@/loaders/githubContributionsLoader.server';
import { githubReleasesLoader } from '@/loaders/githubReleasesLoader.server';

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

const contributions = defineCollection({
  loader: githubContributionsLoader({
    login: import.meta.env.GITHUB_LOGIN ?? 'uuki',
    startYear: 2013,
    token: import.meta.env.GITHUB_TOKEN,
  }),
  schema: z.object({
    year: z.number(),
    total: z.number(),
  }),
});

const releases = defineCollection({
  loader: githubReleasesLoader(
    [
      'uuki/lit-issue-reporter',
      'uuki/astro-basic-template',
      'uuki/style-template-flocss',
      'uuki/11ty-hbs-webpack',
    ],
    { token: import.meta.env.GITHUB_TOKEN },
  ),
  schema: z.object({
    title: z.string(),
    version: z.string(),
    repo: z.string(),
    url: z.string(),
    created_at: z.coerce.date(),
    description: z.string().default(''),
    prerelease: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog, pages, contributions, releases };
