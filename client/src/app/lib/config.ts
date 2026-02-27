/**
 * Returns the backend API base URL.
 * In Next.js, this uses NEXT_PUBLIC_API_URL environment variable.
 * Falls back to empty string (same-origin relative paths) which works with Next.js rewrites.
 */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side: use internal URL or empty for relative
    return '';
  }
  
  // Client-side: check for runtime config first (backward compatibility)
  const runtimeConfig = (window as any).APP_CONFIG?.apiBaseUrl;
  if (runtimeConfig) {
    return runtimeConfig.trim().replace(/\/$/, '');
  }
  
  // Use Next.js environment variable
  const envUrl = process.env.NEXT_PUBLIC_API_URL || '';
  return envUrl.trim().replace(/\/$/, '');
}
