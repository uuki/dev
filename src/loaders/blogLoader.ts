import { glob } from 'astro/loaders';
import { getCachedTitle } from '../utils/fetchTitle';
import type { Loader } from 'astro/loaders';

export function blogLoader(): Loader {
  const baseLoader = glob({ pattern: '**/*.{md,mdx}', base: './src/data/blog' });

  return {
    name: 'blog-loader-with-title-fetch',
    load: async (context) => {
      await baseLoader.load(context);

      for (const [id, entry] of context.store.entries()) {
        const data = entry.data as any;
        if (data?.url && (!data?.title || data.title === '')) {
          const cached = getCachedTitle(data.url);
          if (cached) {
            context.store.set({
              id,
              data: { ...data, title: cached },
              body: entry.body,
              filePath: entry.filePath,
              digest: entry.digest,
            });
          }
        }
      }
    },
  };
}
