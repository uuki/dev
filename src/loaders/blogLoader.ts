import { glob } from 'astro/loaders';
import { fetchTitleWithCache } from '../utils/fetchTitle';
import type { Loader } from 'astro/loaders';
import crypto from 'node:crypto';

/**
 * Custom blog loader that auto-fetches titles from external URLs
 * Only fetches during production builds (astro build)
 */
export function blogLoader(): Loader {
  const baseLoader = glob({ pattern: '**/*.{md,mdx}', base: './src/data/blog' });

  return {
    name: 'blog-loader-with-title-fetch',
    load: async (context) => {
      // First, load all entries using the base glob loader
      await baseLoader.load(context);

      // In production mode, fetch titles for entries with URLs
      if (import.meta.env.PROD) {
        const entries = Array.from(context.store.entries());
        console.log(`[blogLoader] Running in PROD mode. Checking ${entries.length} entries for title fetch...`);

        let fetchCount = 0;
        for (const [id, entry] of entries) {
          const data = entry.data as any;

          // If entry has a URL but no title (or empty title), fetch it
          if (data?.url && (!data?.title || data.title === '')) {
            console.log(`[blogLoader] Fetching title for: ${data.url}`);
            const fetchedTitle = await fetchTitleWithCache(data.url);

            if (fetchedTitle) {
              // Update the entry with the fetched title
              const updatedData = {
                ...data,
                title: fetchedTitle,
              };

              // Generate new digest since data has changed
              const newDigest = crypto
                .createHash('sha256')
                .update(JSON.stringify(updatedData) + entry.body)
                .digest('hex');

              context.store.set({
                id,
                data: updatedData,
                body: entry.body,
                filePath: entry.filePath,
                digest: newDigest,
              });
              console.log(`[blogLoader] ✓ Title fetched: ${fetchedTitle}`);
              fetchCount++;
            }
          }
        }

        if (fetchCount === 0) {
          console.log(`[blogLoader] No titles needed to be fetched (all posts have titles)`);
        } else {
          console.log(`[blogLoader] Fetched ${fetchCount} titles from external URLs`);
        }
      } else {
        console.log(`[blogLoader] Running in DEV mode. Skipping title fetch.`);
      }
    },
  };
}
