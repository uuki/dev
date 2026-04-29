import { describe, it, expect } from 'vitest';
import { filterActivities, type ActivityFilter } from './filterActivities';
import type { Activity } from '@/types/activity';

const article: Activity = {
  kind: 'article', id: 'a1', date: '2024-06-01',
  title: 'Post', url: null, slug: 'post', tags: [],
};

const release: Activity = {
  kind: 'release', id: 'r1', date: '2024-05-01',
  title: 'v1.0.0', url: 'https://github.com', version: 'v1.0.0',
  repo: 'uuki/repo', prerelease: false,
};

const contribution: Activity = {
  kind: 'contribution', date: '2024-01-01', year: 2023, total: 300,
};

const all = [article, release, contribution];

describe('filterActivities', () => {
  it('"all" は全アイテムをそのまま返す', () => {
    expect(filterActivities(all, 'all')).toEqual(all);
  });

  it('"article" は article のみ返す', () => {
    const result = filterActivities(all, 'article');
    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe('article');
  });

  it('"release" は release のみ返す', () => {
    const result = filterActivities(all, 'release');
    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe('release');
  });

  it('"contribution" は contribution のみ返す', () => {
    const result = filterActivities(all, 'contribution');
    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe('contribution');
  });

  it('"oss" は release と contribution を返す', () => {
    const result = filterActivities(all, 'oss');
    expect(result).toHaveLength(2);
    expect(result.map((a) => a.kind).sort()).toEqual(['contribution', 'release']);
  });

  it('該当 kind が存在しない場合は空配列を返す', () => {
    const result = filterActivities([article], 'release');
    expect(result).toEqual([]);
  });

  it('空配列を渡すと空配列を返す', () => {
    const filters: ActivityFilter[] = ['all', 'article', 'release', 'contribution', 'oss'];
    filters.forEach((f) => {
      expect(filterActivities([], f)).toEqual([]);
    });
  });
});
