// SERVER-ONLY: do not import from client components or client:* scripts.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Loader, LoaderContext } from 'astro/loaders';
import { z } from 'zod';
import { assertTokenScopesAllowed, executeGithubQuery } from '../graphql/github/client.server';
import { contributionsQuery } from '../graphql/github/queries/contributions';
import { withConcurrency } from '../utils/concurrency';

const CONCURRENCY = 3;
const TTL_MS = 24 * 60 * 60 * 1000;

const contributionsDataSchema = z.object({
  user: z
    .object({
      contributionsCollection: z.object({
        contributionCalendar: z.object({
          totalContributions: z.number(),
        }),
      }),
    })
    .nullable(),
});

type BackupEntry = { id: string; data: { year: number; total: number } };
type Backup = { lastFetchedAt?: string; years: Record<string, BackupEntry> };

interface Options {
  login: string;
  startYear: number;
  /** Falls back to process.env.GITHUB_TOKEN when omitted. */
  token?: string;
}

function readBackup(backupPath: string): Backup {
  try {
    if (existsSync(backupPath)) {
      const parsed = JSON.parse(readFileSync(backupPath, 'utf-8')) as unknown;
      if (parsed && typeof parsed === 'object' && 'years' in parsed) {
        return parsed as Backup;
      }
    }
  } catch {
    // unreadable or old format — start fresh
  }
  return { years: {} };
}

export function githubContributionsLoader(options: Options): Loader {
  return {
    name: 'github-contributions-loader',
    load: async (context: LoaderContext) => {
      const token = options.token ?? process.env['GITHUB_TOKEN'];

      if (!token) {
        context.logger.warn('[ContributionsLoader] GITHUB_TOKEN is not set — skipping');
        return;
      }

      await assertTokenScopesAllowed(token);

      const isDev = process.env['NODE_ENV'] !== 'production';
      const backupPath = fileURLToPath(
        new URL('.astro/contributions-backup.json', context.config.root),
      );

      // Read backup synchronously before clearAll's debounced disk-write fires.
      const backup = readBackup(backupPath);

      // Production: skip all fetches if backup is fresh enough.
      if (!isDev && backup.lastFetchedAt) {
        const age = Date.now() - new Date(backup.lastFetchedAt).getTime();
        if (age < TTL_MS) {
          console.log('[ContributionsLoader] Running in PROD mode. Skipping all fetches (backup fresh).');
          for (const entry of Object.values(backup.years)) context.store.set(entry);
          return;
        }
      }

      const currentYear = new Date().getUTCFullYear();

      const years = Array.from(
        { length: currentYear - options.startYear + 1 },
        (_, i) => options.startYear + i,
      );

      let backupModified = false;
      let skippedCount = 0;

      const tasks = years.map((year) => async () => {
        if (isDev) {
          // Dev: skip if store already has this year.
          if (context.store.has(String(year))) {
            skippedCount++;
            return;
          }
          // Dev: skip if backup has this year (fetched before).
          if (String(year) in backup.years) {
            skippedCount++;
            context.store.set(backup.years[String(year)]);
            return;
          }
        }
        // Production (stale backup): always re-fetch.
        try {
          const result = await executeGithubQuery(
            contributionsQuery,
            {
              login: options.login,
              from: `${year}-01-01T00:00:00Z`,
              to: `${year}-12-31T23:59:59Z`,
            },
            token,
          );

          const parsed = contributionsDataSchema.safeParse(result);
          if (!parsed.success) throw new Error(`Unexpected response schema for year ${year}`);

          const total =
            parsed.data.user?.contributionsCollection.contributionCalendar.totalContributions;

          if (total === undefined) return;

          const entry: BackupEntry = { id: String(year), data: { year, total } };
          context.store.set(entry);
          backup.years[String(year)] = entry;
          backupModified = true;
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'unknown error';
          const cached = backup.years[String(year)];
          if (cached) {
            context.store.set(cached);
            context.logger.warn(
              `[ContributionsLoader] Failed to fetch ${year} (${msg}), restored cached total`,
            );
          } else {
            context.logger.warn(`[ContributionsLoader] Failed to fetch ${year}: ${msg}`);
          }
        }
      });

      await withConcurrency(tasks, CONCURRENCY);

      if (skippedCount > 0) {
        console.log(`[ContributionsLoader] Running in DEV mode. Skipped ${skippedCount} year(s) (local cache).`);
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
