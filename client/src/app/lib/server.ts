import { getApiBaseUrl } from './config';

export function apiUrl(path: string): string {
  if (!path.startsWith('/')) {
    throw new Error(`API path must start with "/": ${path}`);
  }
  const base = getApiBaseUrl();
  return base ? `${base}${path}` : path;
}

export async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  let payload: unknown = null;
  const contentType = response.headers.get('content-type') || ''

  try {
    payload = await response.json();
  } catch (_error) {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload && typeof payload.error === 'string'
        ? payload.error
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (payload === null) {
    if (contentType.includes('text/html')) {
      throw new Error(
        'API returned HTML instead of JSON. Check /config.js → APP_CONFIG.apiBaseUrl or the /api dev proxy.'
      )
    }
    throw new Error('API returned an empty response')
  }

  return payload as T
}
