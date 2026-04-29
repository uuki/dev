import { describe, it, expect } from 'vitest';
import { normalizeActivities, type BlogEntry, type ReleaseEntry, type ContributionEntry } from './normalizeActivities';

function makePost(overrides: Partial<BlogEntry['data']> & { id?: string } = {}): BlogEntry {
  return {
    id: overrides.id ?? 'post-1',
    data: {
      created_at: new Date('2024-06-15T00:00:00Z'),
      title: 'Test Post',
      url: null,
      slug: 'test-post',
      tags: ['ts'],
      ...overrides,
    },
  };
}

function makeRelease(overrides: Partial<ReleaseEntry['data']> & { id?: string } = {}): ReleaseEntry {
  return {
    id: overrides.id ?? 'repo@v1.0.0',
    data: {
      created_at: new Date('2024-03-01T00:00:00Z'),
      title: 'v1.0.0',
      url: 'https://github.com/uuki/repo/releases/tag/v1.0.0',
      version: 'v1.0.0',
      repo: 'uuki/repo',
      prerelease: false,
      ...overrides,
    },
  };
}

function makeContribution(overrides: Partial<ContributionEntry['data']> = {}): ContributionEntry {
  return {
    data: { year: 2023, total: 500, ...overrides },
  };
}

describe('normalizeActivities', () => {
  it('blog post を article activity に変換する', () => {
    const result = normalizeActivities([makePost()], [], []);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      kind: 'article',
      id: 'post-1',
      date: '2024-06-15',
      title: 'Test Post',
      url: null,
      slug: 'test-post',
      tags: ['ts'],
    });
  });

  it('release を release activity に変換する', () => {
    const result = normalizeActivities([], [makeRelease()], []);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      kind: 'release',
      id: 'repo@v1.0.0',
      date: '2024-03-01',
      title: 'v1.0.0',
      version: 'v1.0.0',
      repo: 'uuki/repo',
      prerelease: false,
    });
  });

  it('contribution の date は year+1 の 1/1 になる', () => {
    const result = normalizeActivities([], [], [makeContribution({ year: 2023 })]);

    expect(result[0]).toMatchObject({
      kind: 'contribution',
      date: '2024-01-01',
      year: 2023,
      total: 500,
    });
  });

  it('全アイテムを date 降順でソートする', () => {
    const posts = [
      makePost({ id: 'old', created_at: new Date('2023-05-01T00:00:00Z'), slug: 'old' }),
      makePost({ id: 'new', created_at: new Date('2024-08-01T00:00:00Z'), slug: 'new' }),
    ];
    const result = normalizeActivities(posts, [], []);

    expect(result[0].date).toBe('2024-08-01');
    expect(result[1].date).toBe('2023-05-01');
  });

  it('article と release と contribution が混在してソートされる', () => {
    const result = normalizeActivities(
      [makePost({ created_at: new Date('2024-06-15T00:00:00Z'), slug: 'p' })],
      [makeRelease({ created_at: new Date('2024-09-01T00:00:00Z') })],
      [makeContribution({ year: 2023 })],  // → 2024-01-01
    );

    expect(result.map((a) => a.date)).toEqual(['2024-09-01', '2024-06-15', '2024-01-01']);
  });

  it('post.url が存在する場合はそのまま url に入る', () => {
    const result = normalizeActivities(
      [makePost({ url: 'https://example.com', slug: null })],
      [], [],
    );
    expect(result[0]).toMatchObject({ kind: 'article', url: 'https://example.com', slug: null });
  });

  it('contribution の date が未来の場合は除外する', () => {
    const futureYear = new Date().getUTCFullYear(); // date = `${futureYear + 1}-01-01` → 未来
    const result = normalizeActivities([], [], [makeContribution({ year: futureYear })]);
    expect(result).toHaveLength(0);
  });

  it('contribution の date が過去の場合は含める', () => {
    const pastYear = new Date().getUTCFullYear() - 2; // date = `${pastYear + 1}-01-01` → 過去
    const result = normalizeActivities([], [], [makeContribution({ year: pastYear, total: 100 })]);
    expect(result).toHaveLength(1);
  });

  it('created_at が文字列の場合も正しく date 変換する', () => {
    const post = makePost({ created_at: '2024-06-15T00:00:00Z' as unknown as Date, slug: 'p' });
    const result = normalizeActivities([post], [], []);
    expect(result[0].date).toBe('2024-06-15');
  });

  it('全て空配列を渡すと空配列を返す', () => {
    expect(normalizeActivities([], [], [])).toEqual([]);
  });
});
