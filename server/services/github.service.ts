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

/**
 * Exchange OAuth authorization code for access token.
 */
export async function exchangeCodeForToken(
  code: string,
  redirectUri: string,
  codeVerifier?: string
): Promise<TokenResponse> {
  const body: Record<string, string> = {
    client_id: GITHUB_CLIENT_ID!,
    client_secret: GITHUB_CLIENT_SECRET!,
    code,
    redirect_uri: redirectUri,
  }
  if (codeVerifier) body.code_verifier = codeVerifier

  const res = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })

  return res.json()
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
  return res.json()
}
