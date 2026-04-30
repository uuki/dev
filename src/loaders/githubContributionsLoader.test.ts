import { describe, it, expect, vi, beforeEach } from 'vitest';
import { githubContributionsLoader } from './githubContributionsLoader.server';
import type { LoaderContext } from 'astro/loaders';

vi.mock('../graphql/github/client.server', () => ({
  executeGithubQuery: vi.fn(),
  assertTokenScopesAllowed: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => false),
  readFileSync: vi.fn(() => '{}'),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

import { executeGithubQuery, assertTokenScopesAllowed } from '../graphql/github/client.server';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const CURRENT_YEAR = new Date().getFullYear();
const START_YEAR = 2013;

function makeContext(): Pick<LoaderContext, 'store' | 'logger' | 'config'> {
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
    config: { root: new URL('file:///project/') } as unknown as LoaderContext['config'],
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

function makeBackup(years: Record<string, unknown>, lastFetchedAt?: string) {
  return JSON.stringify({ lastFetchedAt, years });
}

describe('githubContributionsLoader', () => {
  const mockExecuteQuery = vi.mocked(executeGithubQuery);
  const TOKEN = 'gh_test_token';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.mocked(existsSync).mockReturnValue(false);
    vi.stubEnv('NODE_ENV', 'development');
    mockExecuteQuery.mockResolvedValue(makeContributionsResponse(100));
  });

  it('startYear から現在年まで各年のエントリを store に set する', async () => {
    const ctx = makeContext();
    await githubContributionsLoader({ login: 'uuki', startYear: START_YEAR, token: TOKEN }).load(ctx as LoaderContext);

    expect(ctx.store.set).toHaveBeenCalledTimes(CURRENT_YEAR - START_YEAR + 1);
  });

  it('各エントリの id は年の文字列になる', async () => {
    const ctx = makeContext();
    await githubContributionsLoader({ login: 'uuki', startYear: 2023, token: TOKEN }).load(ctx as LoaderContext);

    const ids = vi.mocked(ctx.store.set).mock.calls.map(([e]) => e.id);
    expect(ids).toContain('2023');
    expect(ids).toContain(String(CURRENT_YEAR));
  });

  it('取得した totalContributions を data.total に格納する', async () => {
    mockExecuteQuery.mockResolvedValue(makeContributionsResponse(999));
    const ctx = makeContext();
    await githubContributionsLoader({ login: 'uuki', startYear: 2024, token: TOKEN }).load(ctx as LoaderContext);

    expect(vi.mocked(ctx.store.set).mock.calls[0][0].data).toMatchObject({ year: 2024, total: 999 });
  });

  it('クエリに正しい from/to 日時を渡す', async () => {
    const ctx = makeContext();
    await githubContributionsLoader({ login: 'uuki', startYear: 2020, token: TOKEN }).load(ctx as LoaderContext);

    const vars = mockExecuteQuery.mock.calls[0][1] as { from: string; to: string };
    expect(vars.from).toBe('2020-01-01T00:00:00Z');
    expect(vars.to).toBe('2020-12-31T23:59:59Z');
  });

  // --- dev mode caching ---

  it('[dev] store にエントリがある場合は fetch をスキップする', async () => {
    const ctx = makeContext();
    vi.mocked(ctx.store.has).mockReturnValue(true);

    await githubContributionsLoader({ login: 'uuki', startYear: 2024, token: TOKEN }).load(ctx as LoaderContext);

    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });

  it('[dev] backup に年キーがある場合は fetch をスキップして store に復元する', async () => {
    const backupEntry = { id: '2026', data: { year: 2026, total: 120 } };
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(makeBackup({ '2026': backupEntry }));
    const ctx = makeContext();

    await githubContributionsLoader({ login: 'uuki', startYear: 2026, token: TOKEN }).load(ctx as LoaderContext);

    expect(ctx.store.set).toHaveBeenCalledWith(backupEntry);
    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });

  // --- production mode ---

  it('[prod] lastFetchedAt が 24h 以内なら全件 backup から復元してフェッチしない', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const backupEntry = { id: '2024', data: { year: 2024, total: 300 } };
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(makeBackup({ '2024': backupEntry }, new Date().toISOString()));
    const ctx = makeContext();

    await githubContributionsLoader({ login: 'uuki', startYear: 2024, token: TOKEN }).load(ctx as LoaderContext);

    expect(ctx.store.set).toHaveBeenCalledWith(backupEntry);
    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });

  it('[prod] lastFetchedAt が 24h 超なら再フェッチして backup を更新する', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const staleDate = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(makeBackup({}, staleDate));
    mockExecuteQuery.mockResolvedValue(makeContributionsResponse(200));
    const ctx = makeContext();

    await githubContributionsLoader({ login: 'uuki', startYear: 2024, token: TOKEN }).load(ctx as LoaderContext);

    expect(ctx.store.set).toHaveBeenCalled();
    expect(writeFileSync).toHaveBeenCalled();
    const [, content] = vi.mocked(writeFileSync).mock.calls[0];
    const written = JSON.parse(content as string) as { lastFetchedAt: string };
    expect(written.lastFetchedAt).toBeDefined();
  });

  it('[prod] lastFetchedAt がない場合はフェッチする', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const ctx = makeContext();

    await githubContributionsLoader({ login: 'uuki', startYear: 2024, token: TOKEN }).load(ctx as LoaderContext);

    expect(mockExecuteQuery).toHaveBeenCalled();
  });

  // --- error handling ---

  it('特定の年で API エラーが発生した場合はその年をスキップする', async () => {
    mockExecuteQuery
      .mockRejectedValueOnce(new Error('API error for 2023'))
      .mockResolvedValue(makeContributionsResponse(50));
    const ctx = makeContext();
    await githubContributionsLoader({ login: 'uuki', startYear: 2023, token: TOKEN }).load(ctx as LoaderContext);

    const ids = vi.mocked(ctx.store.set).mock.calls.map(([e]) => e.id);
    expect(ids).not.toContain('2023');
  });

  it('API エラーが発生した年は logger.warn を呼ぶ', async () => {
    mockExecuteQuery.mockRejectedValue(new Error('Network error'));
    const ctx = makeContext();
    await githubContributionsLoader({ login: 'uuki', startYear: 2024, token: TOKEN }).load(ctx as LoaderContext);

    expect(ctx.logger.warn).toHaveBeenCalled();
  });

  it('フェッチ失敗時にバックアップがある場合は store に復元する', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const backupEntry = { id: '2024', data: { year: 2024, total: 350 } };
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(makeBackup({ '2024': backupEntry }));
    mockExecuteQuery.mockRejectedValue(new Error('API unavailable'));
    const ctx = makeContext();

    await githubContributionsLoader({ login: 'uuki', startYear: 2024, token: TOKEN }).load(ctx as LoaderContext);

    expect(ctx.store.set).toHaveBeenCalledWith(backupEntry);
    expect(ctx.logger.warn).toHaveBeenCalledWith(expect.stringContaining('restored cached total'));
  });

  it('フェッチ成功時に lastFetchedAt 付きで backup ファイルを書き込む', async () => {
    mockExecuteQuery.mockResolvedValue(makeContributionsResponse(200));
    const ctx = makeContext();
    await githubContributionsLoader({ login: 'uuki', startYear: 2024, token: TOKEN }).load(ctx as LoaderContext);

    expect(writeFileSync).toHaveBeenCalled();
    const [, content] = vi.mocked(writeFileSync).mock.calls[0];
    const backup = JSON.parse(content as string) as { years: Record<string, unknown>; lastFetchedAt: string };
    expect(backup.years['2024']).toBeDefined();
    expect(backup.lastFetchedAt).toBeDefined();
  });

  it('"repo" スコープを持つトークンはエラーをスローする', async () => {
    vi.mocked(assertTokenScopesAllowed).mockRejectedValueOnce(new Error('[GitHub] Token has "repo" scope'));
    const ctx = makeContext();

    await expect(githubContributionsLoader({ login: 'uuki', startYear: 2024, token: TOKEN }).load(ctx as LoaderContext))
      .rejects.toThrow('"repo" scope');
    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });

  it('token が未設定の場合は何も fetch せず早期 return する', async () => {
    const ctx = makeContext();
    await githubContributionsLoader({ login: 'uuki', startYear: 2024 }).load(ctx as LoaderContext);

    expect(mockExecuteQuery).not.toHaveBeenCalled();
    expect(ctx.store.set).not.toHaveBeenCalled();
    expect(ctx.logger.warn).toHaveBeenCalled();
  });
});
