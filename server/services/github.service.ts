import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '../config'
import { GITHUB_TOKEN_URL, GITHUB_USER_URL } from '../constants'

export interface TokenResponse {
  access_token?: string
  error?: string
  error_description?: string
}

export interface GitHubUser {
  login: string
  avatar_url: string
  name: string | null
}

function asTokenResponse(value: unknown): TokenResponse {
  if (!value || typeof value !== 'object') {
    return {}
  }

  const payload = value as Record<string, unknown>
  return {
    access_token:
      typeof payload.access_token === 'string' ? payload.access_token : undefined,
    error: typeof payload.error === 'string' ? payload.error : undefined,
    error_description:
      typeof payload.error_description === 'string'
        ? payload.error_description
        : undefined,
  }
}

function asGitHubUser(value: unknown): GitHubUser | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const payload = value as Record<string, unknown>
  if (
    typeof payload.login !== 'string' ||
    typeof payload.avatar_url !== 'string' ||
    (payload.name !== null && typeof payload.name !== 'string')
  ) {
    return null
  }

  return {
    login: payload.login,
    avatar_url: payload.avatar_url,
    name: payload.name,
  }
}

/**
 * Exchange OAuth authorization code for access token.
 */
export async function exchangeCodeForToken(
  code: string,
  redirectUri?: string,
  codeVerifier?: string
): Promise<TokenResponse> {
  const body: Record<string, string> = {
    client_id: GITHUB_CLIENT_ID!,
    client_secret: GITHUB_CLIENT_SECRET!,
    code,
  }
  if (redirectUri) body.redirect_uri = redirectUri
  if (codeVerifier) body.code_verifier = codeVerifier

  const res = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data: unknown = await res.json()
  return asTokenResponse(data)
}

/**
 * Fetch GitHub user profile using access token.
 */
export async function fetchGitHubUser(
  accessToken: string
): Promise<GitHubUser | null> {
  const res = await fetch(GITHUB_USER_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  })

  if (!res.ok) return null
  const data: unknown = await res.json()
  return asGitHubUser(data)
}
