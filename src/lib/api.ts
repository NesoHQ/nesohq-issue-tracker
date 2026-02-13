export const API_BASE = import.meta.env.VITE_API_URL || ''

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

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Authentication failed')
  }
  return data
}
