import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parse } from 'graphql';
import { executeGithubQuery } from './client.server';

const ENDPOINT = 'https://api.github.com/graphql';
const TOKEN = 'test-token';

const mockDoc = parse('query { viewer { login } }');

function makeFetch(overrides?: Partial<{ ok: boolean; status: number; body: unknown }>) {
  const { ok = true, status = 200, body = { data: { viewer: { login: 'uuki' } } } } = overrides ?? {};
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  });
}

describe('executeGithubQuery', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('POSTsクエリを正しいエンドポイントに送る', async () => {
    const fetch = makeFetch();
    vi.stubGlobal('fetch', fetch);

    await executeGithubQuery(mockDoc, {}, TOKEN);

    expect(fetch).toHaveBeenCalledOnce();
    const [url] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(ENDPOINT);
  });

  it('Authorization ヘッダに token を付与する', async () => {
    const fetch = makeFetch();
    vi.stubGlobal('fetch', fetch);

    await executeGithubQuery(mockDoc, {}, TOKEN);

    const [, options] = fetch.mock.calls[0] as [string, RequestInit];
    expect((options.headers as Record<string, string>)['Authorization']).toBe(`Bearer ${TOKEN}`);
  });

  it('variables を JSON body に含める', async () => {
    const fetch = makeFetch();
    vi.stubGlobal('fetch', fetch);
    const vars = { login: 'uuki', from: '2025-01-01T00:00:00Z' };

    await executeGithubQuery(mockDoc, vars, TOKEN);

    const [, options] = fetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string) as { variables: typeof vars };
    expect(body.variables).toEqual(vars);
  });

  it('成功時に data を返す', async () => {
    vi.stubGlobal('fetch', makeFetch({ body: { data: { total: 42 } } }));

    const result = await executeGithubQuery<{ total: number }>(mockDoc, {}, TOKEN);

    expect(result).toEqual({ total: 42 });
  });

  it('HTTP エラー時に例外を投げる', async () => {
    vi.stubGlobal('fetch', makeFetch({ ok: false, status: 401, body: {} }));

    await expect(executeGithubQuery(mockDoc, {}, TOKEN)).rejects.toThrow('HTTP 401');
  });

  it('GraphQL errors フィールドがある場合に例外を投げる', async () => {
    vi.stubGlobal('fetch', makeFetch({
      body: { errors: [{ message: 'Field not found' }] },
    }));

    await expect(executeGithubQuery(mockDoc, {}, TOKEN)).rejects.toThrow('Field not found');
  });
});
