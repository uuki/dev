import type { AstroIntegration } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import { fetchTitleWithCache } from './src/utils/fetchTitle';

interface BlogTitleFetcherOptions {
  enabled?: boolean;
  blogDir?: string;
}

function collectBlogFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isFile() && /\.(md|mdx)$/.test(e.name))
    .map(e => path.join(dir, e.name));
}

function extractUrlAndTitle(content: string): { url?: string; title?: string } {
  const fm = content.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const url = fm.match(/^url:\s*(\S+)/m)?.[1];
  const title = fm.match(/^title:\s*"?(.*?)"?\s*$/m)?.[1]?.trim();
  return { url, title };
}

export function blogTitleFetcher(options: BlogTitleFetcherOptions = {}): AstroIntegration {
  const { enabled = false, blogDir = 'src/data/blog' } = options;

  return {
    name: 'blog-title-fetcher',
    hooks: {
      'astro:build:start': async ({ logger }) => {
        if (!enabled) {
          logger.info('blog-title-fetcher: disabled');
          return;
        }

        const dir = path.join(process.cwd(), blogDir);
        const files = collectBlogFiles(dir);
        logger.info(`blog-title-fetcher: checking ${files.length} posts`);

        for (const file of files) {
          const content = fs.readFileSync(file, 'utf-8');
          const { url, title } = extractUrlAndTitle(content);
          if (url && (!title || title === '')) {
            await fetchTitleWithCache(url);
          }
        }
      },
    },
  };
}
