const CODE_VERIFIER_KEY = 'oauth_code_verifier'
const STATE_KEY = 'oauth_state'
const runtimeConfig = (window as unknown as { __APP_CONFIG__?: { API_URL?: string } }).__APP_CONFIG__
const API_BASE = runtimeConfig?.API_URL || import.meta.env.VITE_API_URL || ''

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const arr = new Uint8Array(length)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => chars[b % chars.length]).join('')
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return crypto.subtle.digest('SHA-256', data)
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function buildAuthUrl(): Promise<string> {
  let clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
  if (!clientId) {
    const res = await fetch(`${API_BASE}/api/auth/config`)
    if (res.ok) {
      const data = (await res.json()) as { client_id?: string }
      if (typeof data.client_id === 'string' && data.client_id.length > 0) {
        clientId = data.client_id
      }
    }
  }

  if (!clientId) {
    throw new Error(
      'GitHub OAuth is not configured. Set GITHUB_CLIENT_ID in server/.env'
    )
  }

  const redirectUri = `${window.location.origin}/auth/callback`
  const state = generateRandomString(32)
  const codeVerifier = generateRandomString(64)
  const codeChallenge = base64UrlEncode(await sha256(codeVerifier))

  sessionStorage.setItem(CODE_VERIFIER_KEY, codeVerifier)
  sessionStorage.setItem(STATE_KEY, state)

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo read:user',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  return `https://github.com/login/oauth/authorize?${params.toString()}`
}

export function getStoredCodeVerifier(): string | null {
  const verifier = sessionStorage.getItem(CODE_VERIFIER_KEY)
  sessionStorage.removeItem(CODE_VERIFIER_KEY)
  sessionStorage.removeItem(STATE_KEY)
  return verifier
}

export function getStoredState(): string | null {
  return sessionStorage.getItem(STATE_KEY)
}

export function getAuthCallbackUrl(): string {
  return `${window.location.origin}/auth/callback`
}
