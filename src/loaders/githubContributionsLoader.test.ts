import { describe, it, expect, vi, beforeEach } from 'vitest';
import { githubContributionsLoader } from './githubContributionsLoader.server';
import type { LoaderContext } from 'astro/loaders';

vi.mock('../graphql/github/client.server', () => ({
  executeGithubQuery: vi.fn(),
  assertTokenScopesAllowed: vi.fn().mockResolvedValue(undefined),
}));

import { executeGithubQuery, assertTokenScopesAllowed } from '../graphql/github/client.server';

const CURRENT_YEAR = new Date().getFullYear();
const START_YEAR = 2013;

function makeContext(): Pick<LoaderContext, 'store' | 'logger'> {
  return {
    store: {
      set: vi.fn(),
      clear: vi.fn(),
      delete: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      entries: vi.fn(() => []),
      keys: vi.fn(() => []),
      values: vi.fn(() => []),
    } as unknown as LoaderContext['store'],
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      label: 'test',
      fork: vi.fn(),
    } as unknown as LoaderContext['logger'],
  };
}

function makeContributionsResponse(total: number) {
  return {
    user: {
      contributionsCollection: {
        contributionCalendar: { totalContributions: total },
      },
    },
  };
}

describe('githubContributionsLoader', () => {
  const mockExecuteQuery = vi.mocked(executeGithubQuery);
  const TOKEN = 'gh_test_token';

  beforeEach(() => {
    vi.clearAllMocks();
    mockExecuteQuery.mockResolvedValue(makeContributionsResponse(100));
  });

  it('startYear から現在年まで各年のエントリを store に set する', async () => {
    const ctx = makeContext();
    const loader = githubContributionsLoader({ login: 'uuki', startYear: START_YEAR, token: TOKEN });

    await loader.load(ctx as LoaderContext);

    const expectedCount = CURRENT_YEAR - START_YEAR + 1;
    expect(ctx.store.set).toHaveBeenCalledTimes(expectedCount);
  });

  it('各エントリの id は年の文字列になる', async () => {
    const ctx = makeContext();
    const loader = githubContributionsLoader({ login: 'uuki', startYear: 2023, token: TOKEN });

    await loader.load(ctx as LoaderContext);

    const calls = vi.mocked(ctx.store.set).mock.calls;
    const ids = calls.map(([entry]) => entry.id);
    expect(ids).toContain('2023');
    expect(ids).toContain('2024');
    expect(ids).toContain(String(CURRENT_YEAR));
  });

  it('取得した totalContributions を data.total に格納する', async () => {
    mockExecuteQuery.mockResolvedValue(makeContributionsResponse(999));
    const ctx = makeContext();
    const loader = githubContributionsLoader({ login: 'uuki', startYear: 2024, token: TOKEN });

    await loader.load(ctx as LoaderContext);

    const [firstCall] = vi.mocked(ctx.store.set).mock.calls;
    expect(firstCall[0].data).toMatchObject({ year: 2024, total: 999 });
  });

  it('特定の年で API エラーが発生した場合はその年をスキップする', async () => {
    mockExecuteQuery
      .mockRejectedValueOnce(new Error('API error for 2023'))
      .mockResolvedValue(makeContributionsResponse(50));

    const ctx = makeContext();
    const loader = githubContributionsLoader({ login: 'uuki', startYear: 2023, token: TOKEN });

    await loader.load(ctx as LoaderContext);

    const calls = vi.mocked(ctx.store.set).mock.calls;
    const setIds = calls.map(([entry]) => entry.id);
    expect(setIds).not.toContain('2023');
  });

  it('API エラーが発生した年は logger.warn を呼ぶ', async () => {
    mockExecuteQuery.mockRejectedValue(new Error('Network error'));
    const ctx = makeContext();
    const loader = githubContributionsLoader({ login: 'uuki', startYear: 2024, token: TOKEN });

    await loader.load(ctx as LoaderContext);

    expect(ctx.logger.warn).toHaveBeenCalled();
  });

  it('"repo" スコープを持つトークンはエラーをスローする', async () => {
    vi.mocked(assertTokenScopesAllowed).mockRejectedValueOnce(
      new Error('[GitHub] Token has "repo" scope'),
    );
    const ctx = makeContext();
    const loader = githubContributionsLoader({ login: 'uuki', startYear: 2024, token: TOKEN });

    await expect(loader.load(ctx as LoaderContext)).rejects.toThrow('"repo" scope');
    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });

  it('token が未設定の場合は何も fetch せず早期 return する', async () => {
    const ctx = makeContext();
    const loader = githubContributionsLoader({ login: 'uuki', startYear: 2024 });

    await loader.load(ctx as LoaderContext);

    expect(mockExecuteQuery).not.toHaveBeenCalled();
    expect(ctx.store.set).not.toHaveBeenCalled();
    expect(ctx.logger.warn).toHaveBeenCalled();
  });

  it('クエリに正しい from/to 日時を渡す', async () => {
    const ctx = makeContext();
    const loader = githubContributionsLoader({ login: 'uuki', startYear: 2020, token: TOKEN });

    await loader.load(ctx as LoaderContext);

    const firstCallVars = mockExecuteQuery.mock.calls[0][1] as {
      login: string; from: string; to: string;
    };
    expect(firstCallVars.from).toBe('2020-01-01T00:00:00Z');
    expect(firstCallVars.to).toBe('2020-12-31T23:59:59Z');
  });
});
