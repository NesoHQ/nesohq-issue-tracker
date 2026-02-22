import { apiUrl, fetchJson } from './server';

export interface User {
  id: string
  login: string
  name: string
  avatar_url: string
  email?: string
}

interface AuthExchangeResponse {
  access_token: string
  user: {
    login: string
    avatar_url: string
    name: string
  }
}

interface AuthConfigResponse {
  client_id: string
  redirect_uri?: string | null
}

const STORAGE_KEY = 'github_user'
const TOKEN_STORAGE_KEY = 'github_access_token'
const OAUTH_STATE_KEY = 'github_oauth_state'
const OAUTH_VERIFIER_KEY = 'github_oauth_code_verifier'
const OAUTH_REDIRECT_URI_KEY = 'github_oauth_redirect_uri'

function resolveRedirectUri(config: AuthConfigResponse): string | null {
  return (config.redirect_uri || '').trim() || null
}

function createRandomString(length = 64): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => charset[byte % charset.length]).join('')
}

async function sha256Base64Url(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const bytes = new Uint8Array(digest)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export const authService = {
  getUser(): User | null {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  },

  setUser(user: User) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  },

  setAccessToken(token: string) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  },

  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  },

  signOut() {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    sessionStorage.removeItem(OAUTH_STATE_KEY)
    sessionStorage.removeItem(OAUTH_VERIFIER_KEY)
    sessionStorage.removeItem(OAUTH_REDIRECT_URI_KEY)
  },

  async initiateGitHubOAuth(): Promise<void> {
    const config = await fetchJson<AuthConfigResponse>(apiUrl('/api/auth/config'))
    if (!config?.client_id) {
      throw new Error('OAuth configuration is missing client_id')
    }
    const state = createRandomString(32)
    const codeVerifier = createRandomString(96)
    const codeChallenge = await sha256Base64Url(codeVerifier)
    const redirectUri = resolveRedirectUri(config)

    sessionStorage.setItem(OAUTH_STATE_KEY, state)
    sessionStorage.setItem(OAUTH_VERIFIER_KEY, codeVerifier)
    if (redirectUri) {
      sessionStorage.setItem(OAUTH_REDIRECT_URI_KEY, redirectUri)
    } else {
      sessionStorage.removeItem(OAUTH_REDIRECT_URI_KEY)
    }

    const params = new URLSearchParams({
      client_id: config.client_id,
      scope: 'read:user repo',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      allow_signup: 'true',
    })
    if (redirectUri) {
      params.set('redirect_uri', redirectUri)
    }

    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`
  },

  async completeGitHubOAuth(code: string, stateFromUrl: string | null): Promise<User> {
    const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY)
    const codeVerifier = sessionStorage.getItem(OAUTH_VERIFIER_KEY)

    if (!expectedState || !stateFromUrl || expectedState !== stateFromUrl) {
      throw new Error('Invalid OAuth state')
    }
    if (!codeVerifier) {
      throw new Error('Missing OAuth verifier')
    }

    const redirectUri = sessionStorage.getItem(OAUTH_REDIRECT_URI_KEY)
    const exchangeBody: {
      code: string
      code_verifier: string
      redirect_uri?: string
    } = {
      code,
      code_verifier: codeVerifier,
    }
    if (redirectUri) {
      exchangeBody.redirect_uri = redirectUri
    }
    const exchange = await fetchJson<AuthExchangeResponse>(apiUrl('/api/auth/exchange'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exchangeBody),
    })

    const user: User = {
      id: exchange.user.login,
      login: exchange.user.login,
      name: exchange.user.name,
      avatar_url: exchange.user.avatar_url,
    }

    this.setUser(user)
    this.setAccessToken(exchange.access_token)
    sessionStorage.removeItem(OAUTH_STATE_KEY)
    sessionStorage.removeItem(OAUTH_VERIFIER_KEY)
    sessionStorage.removeItem(OAUTH_REDIRECT_URI_KEY)
    return user
  },
}
