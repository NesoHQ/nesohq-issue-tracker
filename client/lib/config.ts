/**
 * Returns the backend API base URL.
 * Falls back to empty string (same-origin relative paths) which works with Next.js rewrites.
 */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const runtimeConfig = (window as unknown as { APP_CONFIG?: { apiBaseUrl?: string } }).APP_CONFIG?.apiBaseUrl;
  if (runtimeConfig) {
    return runtimeConfig.trim().replace(/\/$/, '');
  }

  const envUrl = process.env.NEXT_PUBLIC_API_URL || '';
  return envUrl.trim().replace(/\/$/, '');
}
