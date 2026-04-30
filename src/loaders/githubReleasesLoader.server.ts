// SERVER-ONLY: do not import from client components or client:* scripts.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Loader, LoaderContext } from 'astro/loaders';
import { z } from 'zod';
import { sanitize } from '@/js/libs/Sanitizer';
import { isOk } from '@/js/libs/result';
import { assertTokenScopesAllowed } from '../graphql/github/client.server';
import { withConcurrency } from '../utils/concurrency';

const CONCURRENCY = 3;
const TIMEOUT_MS = 15_000;
const REPO_RE = /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/;
const TTL_MS = 24 * 60 * 60 * 1000;

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

type BackupEntry = { id: string; data: Record<string, unknown> };
type Backup = { lastFetchedAt?: string; repos: Record<string, BackupEntry[]> };

interface ReleaseOptions {
  /** Falls back to process.env.GITHUB_TOKEN when omitted. */
  token?: string;
}

function readBackup(backupPath: string): Backup {
  try {
    if (existsSync(backupPath)) {
      const parsed = JSON.parse(readFileSync(backupPath, 'utf-8')) as unknown;
      if (parsed && typeof parsed === 'object' && 'repos' in parsed) {
        return parsed as Backup;
      }
    }
  } catch {
    // unreadable or old format — start fresh
  }
  return { repos: {} };
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

      await assertTokenScopesAllowed(token);

      const isDev = process.env['NODE_ENV'] !== 'production';
      const backupPath = fileURLToPath(new URL('.astro/releases-backup.json', context.config.root));

      // Read backup synchronously before clearAll's debounced disk-write fires.
      const backup = readBackup(backupPath);

      // Production: skip all fetches if backup is fresh enough.
      if (!isDev && backup.lastFetchedAt) {
        const age = Date.now() - new Date(backup.lastFetchedAt).getTime();
        if (age < TTL_MS) {
          console.log('[ReleasesLoader] Running in PROD mode. Skipping all fetches (backup fresh).');
          for (const entries of Object.values(backup.repos)) {
            for (const entry of entries) context.store.set(entry);
          }
          return;
        }
      }

      const validRepos = repos.filter((repo) => {
        if (REPO_RE.test(repo)) return true;
        context.logger.warn(`[ReleasesLoader] Skipping invalid repo slug: "${repo}"`);
        return false;
      });

      let backupModified = false;
      let skippedCount = 0;

      const tasks = validRepos.map((repo) => async () => {
        if (isDev) {
          // Dev: skip if store already has entries.
          if (Array.from(context.store.keys()).some((key) => key.startsWith(`${repo}@`))) {
            skippedCount++;
            return;
          }
          // Dev: skip if backup has this repo (fetched before, even if 0 releases).
          if (repo in backup.repos) {
            skippedCount++;
            for (const entry of backup.repos[repo]) context.store.set(entry);
            return;
          }
        }
        // Production (stale backup): always re-fetch.

        try {
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

          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const parsed = releasesSchema.safeParse(await res.json());
          if (!parsed.success) throw new Error('Unexpected releases response schema');

          const entries: BackupEntry[] = [];
          for (const release of parsed.data) {
            if (release.draft) continue;

            const sanitized = sanitize(release.body ?? '');
            const description = isOk(sanitized) ? sanitized.value : '';

            const entry: BackupEntry = {
              id: `${repo}@${release.tag_name}`,
              data: {
                title: release.name?.trim() || `${repo} ${release.tag_name}`,
                version: release.tag_name,
                repo,
                url: release.html_url,
                created_at: release.published_at,
                description,
                prerelease: release.prerelease,
                tags: [],
              },
            };
            entries.push(entry);
            context.store.set(entry);
          }

          backup.repos[repo] = entries;
          backupModified = true;
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'unknown error';
          const cached = backup.repos[repo];
          if (cached?.length) {
            for (const entry of cached) context.store.set(entry);
            context.logger.warn(
              `[ReleasesLoader] Failed to fetch ${repo} (${msg}), restored ${cached.length} cached entries`,
            );
          } else {
            context.logger.warn(`[ReleasesLoader] Failed to fetch ${repo}: ${msg}`);
          }
        }
      });

      await withConcurrency(tasks, CONCURRENCY);

      if (skippedCount > 0) {
        console.log(`[ReleasesLoader] Running in DEV mode. Skipped ${skippedCount} repo(s) (local cache).`);
      }

      if (backupModified) {
        backup.lastFetchedAt = new Date().toISOString();
        try {
          mkdirSync(fileURLToPath(new URL('.astro/', context.config.root)), { recursive: true });
          writeFileSync(backupPath, JSON.stringify(backup));
        } catch {
          // ignore write errors (e.g. read-only FS in CI)
        }
      }
    },
  };
}
