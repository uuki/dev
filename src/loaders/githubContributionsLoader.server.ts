// SERVER-ONLY: do not import from client components or client:* scripts.
import type { Loader, LoaderContext } from 'astro/loaders';
import { z } from 'zod';
import { executeGithubQuery } from '../graphql/github/client.server';
import { contributionsQuery } from '../graphql/github/queries/contributions';
import { withConcurrency } from '../utils/concurrency';

const CONCURRENCY = 3;

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

interface Options {
  login: string;
  startYear: number;
  /** Falls back to process.env.GITHUB_TOKEN when omitted. */
  token?: string;
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

      const currentYear = new Date().getUTCFullYear();

      const years = Array.from(
        { length: currentYear - options.startYear + 1 },
        (_, i) => options.startYear + i,
      );

      const tasks = years.map((year) => async () => {
        // Past years are immutable — use cached store entry if available.
        if (year < currentYear && context.store.has(String(year))) {
          return;
        }

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
        if (!parsed.success) {
          throw new Error(`Unexpected response schema for year ${year}`);
        }

        const total =
          parsed.data.user?.contributionsCollection.contributionCalendar.totalContributions;

        if (total === undefined) return;

        context.store.set({
          id: String(year),
          data: { year, total },
        });
      });

      const results = await withConcurrency(tasks, CONCURRENCY);

      results.forEach((result, i) => {
        if (result.status === 'rejected') {
          context.logger.warn(
            `[ContributionsLoader] Failed to fetch ${years[i]}: ${result.reason instanceof Error ? result.reason.message : 'unknown error'}`,
          );
        }
      });
    },
  };
}
