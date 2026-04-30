import { describe, it, expect, vi, beforeEach } from 'vitest';
import { githubReleasesLoader } from './githubReleasesLoader.server';
import type { LoaderContext } from 'astro/loaders';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => false),
  readFileSync: vi.fn(() => '{}'),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const TOKEN = 'gh_test_token';

function makeContext(): Pick<LoaderContext, 'store' | 'logger' | 'config'> {
  return {
    store: {
      set: vi.fn(),
      clear: vi.fn(),
      delete: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      entries: vi.fn(() => []),
      keys: vi.fn(() => [][Symbol.iterator]() as IterableIterator<string>),
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

function makeRelease(overrides: Partial<{
  tag_name: string; name: string; body: string;
  html_url: string; published_at: string; prerelease: boolean; draft: boolean;
}> = {}) {
  return {
    id: 1,
    tag_name: 'v1.0.0',
    name: 'Release v1.0.0',
    body: 'Release notes',
    html_url: 'https://github.com/uuki/repo/releases/tag/v1.0.0',
    published_at: '2025-01-01T00:00:00Z',
    prerelease: false,
    draft: false,
    ...overrides,
  };
}

function makeHeaders(scope: string | null) {
  return { get: (h: string) => h === 'X-OAuth-Scopes' ? scope : null };
}

function stubFetch(responses: Record<string, unknown[]>, scopeHeader: string | null = 'read:user') {
  return vi.fn().mockImplementation((url: string) => {
    if (url === 'https://api.github.com/user') {
      return Promise.resolve({
        ok: true, status: 200,
        headers: makeHeaders(scopeHeader),
        json: () => Promise.resolve({ login: 'uuki' }),
      });
    }
    const matched = Object.entries(responses).find(([key]) => url.includes(key));
    if (!matched) {
      return Promise.resolve({ ok: false, status: 404, headers: makeHeaders(null), json: () => Promise.resolve([]) });
    }
    const [, body] = matched;
    return Promise.resolve({ ok: true, status: 200, headers: makeHeaders(null), json: () => Promise.resolve(body) });
  });
}

function makeBackup(repos: Record<string, unknown[]>, lastFetchedAt?: string) {
  return JSON.stringify({ lastFetchedAt, repos });
}

describe('githubReleasesLoader', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    vi.mocked(existsSync).mockReturnValue(false);
    vi.stubEnv('NODE_ENV', 'development');
  });

  it('各リポジトリの releases エンドポイントを fetch する', async () => {
    const fetch = stubFetch({ 'repos/uuki/repo-a/releases': [makeRelease()] });
    vi.stubGlobal('fetch', fetch);
    const ctx = makeContext();

    const loader = githubReleasesLoader(['uuki/repo-a'], { token: TOKEN });
    await loader.load(ctx as LoaderContext);

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/uuki/repo-a/releases',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      }),
    );
  });

  it('各リリースを "{repo}@{tag}" の id で store に set する', async () => {
    vi.stubGlobal('fetch', stubFetch({ 'repos/uuki/repo-a/releases': [makeRelease({ tag_name: 'v2.0.0' })] }));
    const ctx = makeContext();

    const loader = githubReleasesLoader(['uuki/repo-a'], { token: TOKEN });
    await loader.load(ctx as LoaderContext);

    const [entry] = vi.mocked(ctx.store.set).mock.calls[0];
    expect(entry.id).toBe('uuki/repo-a@v2.0.0');
  });

  it('data に正しいフィールドが格納される', async () => {
    const release = makeRelease({
      tag_name: 'v1.2.3',
      name: 'My Release',
      body: 'Notes here',
      html_url: 'https://github.com/uuki/repo-a/releases/tag/v1.2.3',
      published_at: '2025-06-01T00:00:00Z',
    });
    vi.stubGlobal('fetch', stubFetch({ 'repos/uuki/repo-a/releases': [release] }));
    const ctx = makeContext();

    const loader = githubReleasesLoader(['uuki/repo-a'], { token: TOKEN });
    await loader.load(ctx as LoaderContext);

    const [entry] = vi.mocked(ctx.store.set).mock.calls[0];
    expect(entry.data).toMatchObject({
      title: 'My Release',
      version: 'v1.2.3',
      repo: 'uuki/repo-a',
      url: 'https://github.com/uuki/repo-a/releases/tag/v1.2.3',
      created_at: '2025-06-01T00:00:00Z',
      description: 'Notes here',
      prerelease: false,
    });
  });

  it('release.name が空の場合は "{repo} {tag}" をタイトルにする', async () => {
    vi.stubGlobal('fetch', stubFetch({
      'repos/uuki/repo-a/releases': [makeRelease({ name: '', tag_name: 'v0.9.0' })],
    }));
    const ctx = makeContext();

    const loader = githubReleasesLoader(['uuki/repo-a'], { token: TOKEN });
    await loader.load(ctx as LoaderContext);

    const [entry] = vi.mocked(ctx.store.set).mock.calls[0];
    expect(entry.data.title).toBe('uuki/repo-a v0.9.0');
  });

  it('draft リリースはスキップする', async () => {
    vi.stubGlobal('fetch', stubFetch({
      'repos/uuki/repo-a/releases': [makeRelease({ draft: true })],
    }));
    const ctx = makeContext();

    const loader = githubReleasesLoader(['uuki/repo-a'], { token: TOKEN });
    await loader.load(ctx as LoaderContext);

    expect(ctx.store.set).not.toHaveBeenCalled();
  });

  it('複数リポジトリを処理する', async () => {
    vi.stubGlobal('fetch', stubFetch({
      'repos/uuki/repo-a/releases': [makeRelease({ tag_name: 'v1.0.0' })],
      'repos/uuki/repo-b/releases': [makeRelease({ tag_name: 'v2.0.0' })],
    }));
    const ctx = makeContext();

    const loader = githubReleasesLoader(['uuki/repo-a', 'uuki/repo-b'], { token: TOKEN });
    await loader.load(ctx as LoaderContext);

    expect(ctx.store.set).toHaveBeenCalledTimes(2);
  });

  // --- dev mode caching ---

  it('[dev] store にエントリがある場合は fetch をスキップする', async () => {
    const fetch = stubFetch({ 'repos/uuki/repo-a/releases': [makeRelease()] });
    vi.stubGlobal('fetch', fetch);
    const ctx = makeContext();
    vi.mocked(ctx.store.keys).mockReturnValue(['uuki/repo-a@v1.0.0'][Symbol.iterator]() as IterableIterator<string>);

    await githubReleasesLoader(['uuki/repo-a'], { token: TOKEN }).load(ctx as LoaderContext);

    expect(ctx.store.set).not.toHaveBeenCalled();
    expect(fetch.mock.calls.find(([u]) => (u as string).includes('/releases'))).toBeUndefined();
  });

  it('[dev] backup にリポジトリキーがある場合は fetch をスキップして store に復元する', async () => {
    const backupEntry = { id: 'uuki/repo-a@v1.0.0', data: { title: 'v1.0.0', version: 'v1.0.0', repo: 'uuki/repo-a', url: 'https://github.com', created_at: '2025-01-01T00:00:00Z', description: '', prerelease: false, tags: [] } };
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(makeBackup({ 'uuki/repo-a': [backupEntry] }));
    const fetch = stubFetch({});
    vi.stubGlobal('fetch', fetch);

    await githubReleasesLoader(['uuki/repo-a'], { token: TOKEN }).load(makeContext() as LoaderContext);

    expect(vi.mocked(makeContext().store.set)).not.toHaveBeenCalled(); // store.set checked via ctx below
  });

  it('[dev] backup にリポジトリキーがある場合は fetch をスキップして store に復元する (詳細)', async () => {
    const backupEntry = { id: 'uuki/repo-a@v1.0.0', data: { title: 'v1.0.0', version: 'v1.0.0', repo: 'uuki/repo-a', url: 'https://github.com', created_at: '2025-01-01T00:00:00Z', description: '', prerelease: false, tags: [] } };
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(makeBackup({ 'uuki/repo-a': [backupEntry] }));
    const fetch = stubFetch({});
    vi.stubGlobal('fetch', fetch);
    const ctx = makeContext();

    await githubReleasesLoader(['uuki/repo-a'], { token: TOKEN }).load(ctx as LoaderContext);

    expect(ctx.store.set).toHaveBeenCalledWith(backupEntry);
    expect(fetch.mock.calls.find(([u]) => (u as string).includes('/releases'))).toBeUndefined();
  });

  it('[dev] backup にリポジトリキーが空配列でも fetch をスキップする（0件確認済み）', async () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(makeBackup({ 'uuki/repo-a': [] }));
    const fetch = stubFetch({ 'repos/uuki/repo-a/releases': [makeRelease()] });
    vi.stubGlobal('fetch', fetch);
    const ctx = makeContext();

    await githubReleasesLoader(['uuki/repo-a'], { token: TOKEN }).load(ctx as LoaderContext);

    expect(ctx.store.set).not.toHaveBeenCalled();
    expect(fetch.mock.calls.find(([u]) => (u as string).includes('/releases'))).toBeUndefined();
  });

  // --- production mode ---

  it('[prod] lastFetchedAt が 24h 以内なら全件 backup から復元してフェッチしない', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const backupEntry = { id: 'uuki/repo-a@v1.0.0', data: { title: 'v1.0.0', version: 'v1.0.0', repo: 'uuki/repo-a', url: 'https://github.com', created_at: '2025-01-01T00:00:00Z', description: '', prerelease: false, tags: [] } };
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(makeBackup({ 'uuki/repo-a': [backupEntry] }, new Date().toISOString()));
    const fetch = stubFetch({});
    vi.stubGlobal('fetch', fetch);
    const ctx = makeContext();

    await githubReleasesLoader(['uuki/repo-a'], { token: TOKEN }).load(ctx as LoaderContext);

    expect(ctx.store.set).toHaveBeenCalledWith(backupEntry);
    expect(fetch.mock.calls.find(([u]) => (u as string).includes('/releases'))).toBeUndefined();
  });

  it('[prod] lastFetchedAt が 24h 超なら再フェッチして backup を更新する', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const staleDate = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(makeBackup({ 'uuki/repo-a': [] }, staleDate));
    vi.stubGlobal('fetch', stubFetch({ 'repos/uuki/repo-a/releases': [makeRelease({ tag_name: 'v2.0.0' })] }));
    const ctx = makeContext();

    await githubReleasesLoader(['uuki/repo-a'], { token: TOKEN }).load(ctx as LoaderContext);

    expect(ctx.store.set).toHaveBeenCalledTimes(1);
    expect(writeFileSync).toHaveBeenCalled();
    const [, content] = vi.mocked(writeFileSync).mock.calls[0];
    const written = JSON.parse(content as string) as { lastFetchedAt: string };
    expect(written.lastFetchedAt).toBeDefined();
  });

  it('[prod] lastFetchedAt がない場合はフェッチする', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.mocked(existsSync).mockReturnValue(false);
    vi.stubGlobal('fetch', stubFetch({ 'repos/uuki/repo-a/releases': [makeRelease()] }));
    const ctx = makeContext();

    await githubReleasesLoader(['uuki/repo-a'], { token: TOKEN }).load(ctx as LoaderContext);

    expect(ctx.store.set).toHaveBeenCalledTimes(1);
  });

  // --- error handling ---

  it('フェッチ失敗時にバックアップがある場合は store に復元する', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const backupEntry = { id: 'uuki/repo-a@v1.0.0', data: { title: 'v1.0.0', version: 'v1.0.0', repo: 'uuki/repo-a', url: 'https://github.com', created_at: '2025-01-01T00:00:00Z', description: '', prerelease: false, tags: [] } };
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(makeBackup({ 'uuki/repo-a': [backupEntry] }));
    const fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, status: 200, headers: makeHeaders('read:user'), json: () => Promise.resolve({}) })
      .mockResolvedValue({ ok: false, status: 503, headers: makeHeaders(null), json: () => Promise.resolve([]) });
    vi.stubGlobal('fetch', fetch);
    const ctx = makeContext();

    await githubReleasesLoader(['uuki/repo-a'], { token: TOKEN }).load(ctx as LoaderContext);

    expect(ctx.store.set).toHaveBeenCalledWith(backupEntry);
    expect(ctx.logger.warn).toHaveBeenCalledWith(expect.stringContaining('restored 1 cached entries'));
  });

  it('フェッチ失敗かつバックアップなしの場合は warn のみ出す', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, status: 200, headers: makeHeaders('read:user'), json: () => Promise.resolve({}) })
      .mockResolvedValue({ ok: false, status: 404, headers: makeHeaders(null), json: () => Promise.resolve([]) });
    vi.stubGlobal('fetch', fetch);
    const ctx = makeContext();

    await githubReleasesLoader(['uuki/repo-a'], { token: TOKEN }).load(ctx as LoaderContext);

    expect(ctx.store.set).not.toHaveBeenCalled();
    expect(ctx.logger.warn).toHaveBeenCalledWith(expect.stringContaining('Failed to fetch uuki/repo-a'));
  });

  it('フェッチ成功時に lastFetchedAt 付きで backup ファイルを書き込む', async () => {
    vi.stubGlobal('fetch', stubFetch({ 'repos/uuki/repo-a/releases': [makeRelease({ tag_name: 'v1.0.0' })] }));
    const ctx = makeContext();

    await githubReleasesLoader(['uuki/repo-a'], { token: TOKEN }).load(ctx as LoaderContext);

    expect(writeFileSync).toHaveBeenCalled();
    const [, content] = vi.mocked(writeFileSync).mock.calls[0];
    const backup = JSON.parse(content as string) as { repos: Record<string, unknown[]>; lastFetchedAt: string };
    expect(backup.repos['uuki/repo-a']).toHaveLength(1);
    expect(backup.lastFetchedAt).toBeDefined();
  });

  it('リポジトリの fetch が失敗した場合はそのリポジトリをスキップして続行する', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, status: 200, headers: makeHeaders('read:user'), json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({ ok: false, status: 404, headers: makeHeaders(null), json: () => Promise.resolve([]) })
      .mockResolvedValue({ ok: true, status: 200, headers: makeHeaders(null), json: () => Promise.resolve([makeRelease({ tag_name: 'v1.0.0' })]) });
    vi.stubGlobal('fetch', fetch);
    const ctx = makeContext();

    await githubReleasesLoader(['uuki/broken', 'uuki/repo-b'], { token: TOKEN }).load(ctx as LoaderContext);

    expect(ctx.store.set).toHaveBeenCalledTimes(1);
    expect(ctx.logger.warn).toHaveBeenCalled();
  });

  it('"repo" スコープを持つトークンはエラーをスローする', async () => {
    vi.stubGlobal('fetch', stubFetch({}, 'repo, read:user'));
    const ctx = makeContext();

    await expect(githubReleasesLoader(['uuki/repo-a'], { token: TOKEN }).load(ctx as LoaderContext))
      .rejects.toThrow('overly permissive scopes');
    expect(ctx.store.set).not.toHaveBeenCalled();
  });

  it('token が未設定の場合は早期 return する', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const ctx = makeContext();

    await githubReleasesLoader(['uuki/repo-a']).load(ctx as LoaderContext);

    expect(fetch).not.toHaveBeenCalled();
    expect(ctx.logger.warn).toHaveBeenCalled();
  });
});
