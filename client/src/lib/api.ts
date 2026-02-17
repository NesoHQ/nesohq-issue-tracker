// Runtime config (from /config.js, replaceable at container startup) takes
// precedence over the build-time VITE_API_URL env var.
const runtimeConfig = (window as unknown as { __APP_CONFIG__?: { API_URL?: string } }).__APP_CONFIG__
export const API_BASE = runtimeConfig?.API_URL || import.meta.env.VITE_API_URL || ''

async function parseJsonOrThrow(res: Response, fallbackMessage: string): Promise<unknown> {
  const text = await res.text()
  const ct = res.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) {
    if (res.status === 404) {
      throw new Error('API not found. Is the auth server running? (npm run dev:server)')
    }
    if (res.status >= 500) {
      throw new Error('Server error. Check that the auth server is running.')
    }
    throw new Error(fallbackMessage)
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Invalid server response. Is the auth server running?')
  }
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  })
  const data = (await parseJsonOrThrow(res, 'Image upload failed')) as { url?: string; error?: string }
  if (!res.ok) {
    throw new Error(data.error || 'Image upload failed')
  }
  const url = data.url as string
  return url.startsWith('http') ? url : `${window.location.origin}${url}`
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string,
  codeVerifier?: string | null
): Promise<{ access_token: string; user: { login: string; avatar_url: string; name: string } }> {
  const res = await fetch(`${API_BASE}/api/auth/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      redirect_uri: redirectUri,
      ...(codeVerifier && { code_verifier: codeVerifier }),
    }),
  })

  const data = (await parseJsonOrThrow(res, 'Authentication failed')) as {
    access_token?: string
    user?: { login: string; avatar_url: string; name: string }
    error?: string
  }
  if (!res.ok) {
    throw new Error(data.error || 'Authentication failed')
  }
  return data as { access_token: string; user: { login: string; avatar_url: string; name: string } }
}
