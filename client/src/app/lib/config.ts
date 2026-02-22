declare global {
  interface Window {
    APP_CONFIG?: {
      apiBaseUrl?: string
    }
  }
}

/**
 * Returns the backend API base URL from the runtime config injected by /config.js.
 * Falls back to empty string (same-origin relative paths) when no base URL is set,
 * which works with the Vite dev proxy.
 */
export function getApiBaseUrl(): string {
  const raw = (window.APP_CONFIG?.apiBaseUrl ?? '').trim()
  return raw.replace(/\/$/, '')
}
