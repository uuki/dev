// SERVER-ONLY: do not import from client components or client:* scripts.
import type { Loader, LoaderContext } from 'astro/loaders';
import { z } from 'zod';
import { sanitize } from '@/js/libs/Sanitizer';
import { isOk } from '@/js/libs/result';
import { withConcurrency } from '../utils/concurrency';

const CONCURRENCY = 3;
const TIMEOUT_MS = 15_000;
const REPO_RE = /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/;

const releaseSchema = z.object({
  id: z.number(),
  tag_name: z.string(),
  name: z.string().nullable(),
  body: z.string().nullable(),
  html_url: z.string().url(),
  published_at: z.string(),
  prerelease: z.boolean(),
  draft: z.boolean(),
});

const releasesSchema = z.array(releaseSchema);

interface ReleaseOptions {
  /** Falls back to process.env.GITHUB_TOKEN when omitted. */
  token?: string;
}

export function githubReleasesLoader(repos: string[], options: ReleaseOptions = {}): Loader {
  return {
    name: 'github-releases-loader',
    load: async (context: LoaderContext) => {
      const token = options.token ?? process.env['GITHUB_TOKEN'];

      if (!token) {
        context.logger.warn('[ReleasesLoader] GITHUB_TOKEN is not set — skipping');
        return;
      }

      const validRepos = repos.filter((repo) => {
        if (REPO_RE.test(repo)) return true;
        context.logger.warn(`[ReleasesLoader] Skipping invalid repo slug: "${repo}"`);
        return false;
      });

      const tasks = validRepos.map((repo) => async () => {
        const [owner, name] = repo.split('/');
        const url = new URL(
          `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/releases`,
          'https://api.github.com',
        );

        const res = await fetch(url.href, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
          },
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const parsed = releasesSchema.safeParse(await res.json());
        if (!parsed.success) {
          throw new Error('Unexpected releases response schema');
        }

        for (const release of parsed.data) {
          if (release.draft) continue;

          const sanitized = sanitize(release.body ?? '');
          const description = isOk(sanitized) ? sanitized.value : '';

          context.store.set({
            id: `${repo}@${release.tag_name}`,
            data: {
              title: release.name?.trim() || `${repo} ${release.tag_name}`,
              version: release.tag_name,
              repo,
              url: release.html_url,
              created_at: release.published_at,
              description,
              prerelease: release.prerelease,
              tags: [] as string[],
            } as unknown as Record<string, unknown>,
          });
        }
      });

      const results = await withConcurrency(tasks, CONCURRENCY);

      results.forEach((result, i) => {
        if (result.status === 'rejected') {
          context.logger.warn(
            `[ReleasesLoader] Failed to fetch ${validRepos[i]}: ${result.reason instanceof Error ? result.reason.message : 'unknown error'}`,
          );
        }
      });
    },
  };
}
