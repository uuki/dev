import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/blog' }),
  schema: z.object({
    title: z.string(),
    // 空文字列やnullを許容（Next.js互換）
    description: z.string().nullable().default(''),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date().optional(),
    // Next.js互換フィールド（後方互換性のため残す）
    date: z.coerce.date().optional(),
    lastmod: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    // draftは空文字列の場合もあるため、coerceでbooleanに変換
    draft: z.coerce.boolean().default(false),
    heroImage: z.string().nullable().optional(),
    origin: z.string().nullable().optional(),
    // 外部記事用URL（これがある場合はslugなし）
    url: z.string().nullable().optional(),
    // 内部記事用slug（これがある場合はurlなし）
    slug: z.string().nullable().optional(),
    preview: z.string().nullable().optional(),
    categories: z.string().nullable().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().nullable().default(''),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date().optional(),
    // Next.js互換フィールド（後方互換性のため残す）
    date: z.coerce.date().optional(),
    lastmod: z.coerce.date().optional(),
  }),
});

export const collections = { blog, pages };
