// SERVER-ONLY: do not import from client components or client:* scripts.
import { print, type DocumentNode } from 'graphql';
import { z } from 'zod';

const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';
const TIMEOUT_MS = 15_000;

// Redact token-shaped strings from error messages before logging / rethrowing.
function redactSecrets(message: string): string {
  return message
    .replace(/gh[pousr]_[A-Za-z0-9]+/gi, '[REDACTED]')
    .replace(/github_pat_[A-Za-z0-9_]+/gi, '[REDACTED]');
}

const graphqlResponseSchema = z.object({
  data: z.unknown().optional(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

export async function executeGithubQuery<
  TData = unknown,
  TVars extends Record<string, unknown> = Record<string, unknown>,
>(
  doc: DocumentNode,
  variables: TVars,
  token: string,
): Promise<TData> {
  const res = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: print(doc), variables }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const raw = await res.json();
  const parsed = graphqlResponseSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error('Unexpected GitHub API response structure');
  }

  const { data, errors } = parsed.data;

  if (errors && errors.length > 0) {
    const messages = errors.map((e) => redactSecrets(e.message)).join('; ');
    throw new Error(`GraphQL error: ${messages}`);
  }

  return data as TData;
}
