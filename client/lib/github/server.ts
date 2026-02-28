import { getAuthToken } from '@/lib/auth/cookies';
import { API_CONFIG } from '@/lib/constants';

const DEFAULT_REVALIDATE_SECONDS = 60;
const DEFAULT_TAGS = ['github'];

type GitHubCacheMode = 'read' | 'no-store';

interface GitHubJsonRequestOptions {
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
  cacheMode?: GitHubCacheMode;
  revalidate?: number;
  tags?: string[];
}

function withBody(options: GitHubJsonRequestOptions): {
  body: BodyInit | undefined;
  headers: HeadersInit;
} {
  if (options.body === undefined) {
    return { body: undefined, headers: options.headers ?? {} };
  }

  if (
    typeof options.body === 'string' ||
    options.body instanceof URLSearchParams ||
    options.body instanceof FormData
  ) {
    return { body: options.body, headers: options.headers ?? {} };
  }

  return {
    body: JSON.stringify(options.body),
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  };
}

export async function githubJson<T>(
  path: string,
  options: GitHubJsonRequestOptions = {}
): Promise<T> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const method = options.method ?? 'GET';
  const cacheMode = options.cacheMode ?? 'no-store';
  const { body, headers } = withBody(options);
  const url = `${API_CONFIG.GITHUB_API}${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': API_CONFIG.GITHUB_VERSION,
      ...headers,
    },
    body,
    ...(cacheMode === 'read'
      ? {
          next: {
            revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS,
            tags: options.tags ?? DEFAULT_TAGS,
          },
        }
      : { cache: 'no-store' }),
  });

  if (response.status === 401) {
    throw new Error('Session expired. Please sign in again.');
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === 'object' &&
      'message' in payload &&
      typeof (payload as Record<string, unknown>).message === 'string'
        ? ((payload as Record<string, unknown>).message as string)
        : `GitHub API error: ${response.status}`;
    throw new Error(message);
  }

  if (payload === null) {
    throw new Error('GitHub API returned an empty response');
  }

  return payload as T;
}

export async function githubReadJson<T>(
  path: string,
  options: Omit<GitHubJsonRequestOptions, 'cacheMode' | 'method'> = {}
): Promise<T> {
  return githubJson<T>(path, {
    ...options,
    method: 'GET',
    cacheMode: 'read',
  });
}

export async function githubWriteJson<T>(
  path: string,
  options: Omit<GitHubJsonRequestOptions, 'cacheMode'>
): Promise<T> {
  return githubJson<T>(path, {
    ...options,
    cacheMode: 'no-store',
  });
}
