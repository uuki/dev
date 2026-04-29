import type { Activity } from '@/types/activity';

export interface BlogEntry {
  id: string;
  data: {
    created_at: Date | string;
    title: string;
    url?: string | null;
    slug?: string | null;
    tags: string[];
  };
}

export interface ReleaseEntry {
  id: string;
  data: {
    created_at: Date | string;
    title: string;
    url: string;
    version: string;
    repo: string;
    prerelease: boolean;
  };
}

export interface ContributionEntry {
  data: {
    year: number;
    total: number;
  };
}

const toDateStr = (d: Date | string): string => new Date(d).toISOString().split('T')[0];

export function normalizeActivities(
  posts: BlogEntry[],
  releases: ReleaseEntry[],
  contributions: ContributionEntry[],
): Activity[] {
  const articles: Activity[] = posts.map((p) => ({
    kind: 'article',
    id: p.id,
    date: toDateStr(p.data.created_at),
    title: p.data.title,
    url: p.data.url ?? null,
    slug: p.data.slug ?? null,
    tags: p.data.tags,
  }));

  const releaseItems: Activity[] = releases.map((r) => ({
    kind: 'release',
    id: r.id,
    date: toDateStr(r.data.created_at),
    title: r.data.title,
    url: r.data.url,
    version: r.data.version,
    repo: r.data.repo,
    prerelease: r.data.prerelease,
  }));

  const contributionItems: Activity[] = contributions.map((c) => ({
    kind: 'contribution',
    date: `${c.data.year + 1}-01-01`,
    year: c.data.year,
    total: c.data.total,
  }));

  return [...articles, ...releaseItems, ...contributionItems].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}
