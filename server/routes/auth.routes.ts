import type { Request, Response } from 'express'
import { Router } from 'express'
import {
  GH_CLIENT_ID,
  GH_CLIENT_SECRET,
  GH_REDIRECT_URI,
} from '../config'
import {
  exchangeCodeForToken,
  fetchGitHubUser,
} from '../services/github.service'

const router = Router()

const MAX_CODE_LENGTH = 512
const MAX_VERIFIER_LENGTH = 128
const MAX_URI_LENGTH = 2048

/**
 * GET /api/auth/config
 * Returns non-secret OAuth config required by the frontend.
 */
router.get('/config', (_req: Request, res: Response): void => {
  if (!GH_CLIENT_ID) {
    res.status(500).json({ error: 'OAuth not configured' })
    return
  }

  res.json({
    client_id: GH_CLIENT_ID,
    redirect_uri: GH_REDIRECT_URI || null,
  })
})

/**
 * POST /api/auth/exchange
 * Exchanges OAuth authorization code for access token and fetches user info.
 */
router.post('/exchange', async (req: Request, res: Response): Promise<void> => {
  const code = req.body?.code
  const clientRedirectUri = req.body?.redirect_uri
  const codeVerifier = req.body?.code_verifier

  if (typeof code !== 'string' || code.length === 0) {
    res.status(400).json({ error: 'Missing code' })
    return
  }
  if (code.length > MAX_CODE_LENGTH) {
    res.status(400).json({ error: 'Invalid code' })
    return
  }

  if (codeVerifier != null) {
    if (typeof codeVerifier !== 'string' || codeVerifier.length > MAX_VERIFIER_LENGTH) {
      res.status(400).json({ error: 'Invalid code_verifier' })
      return
    }
  }

  if (clientRedirectUri != null) {
    if (typeof clientRedirectUri !== 'string' || clientRedirectUri.length > MAX_URI_LENGTH) {
      res.status(400).json({ error: 'Invalid redirect_uri' })
      return
    }
    // Reject any redirect_uri that doesn't match the server's configured value.
    // This prevents an attacker from substituting a different URI in the exchange call.
    if (GH_REDIRECT_URI && clientRedirectUri !== GH_REDIRECT_URI) {
      res.status(400).json({ error: 'redirect_uri mismatch' })
      return
    }
  }

  if (!GH_CLIENT_ID || !GH_CLIENT_SECRET) {
    res.status(500).json({ error: 'OAuth not configured' })
    return
  }

  // Always use the server-configured redirect_uri; ignore the client-supplied value.
  try {
    const tokenData = await exchangeCodeForToken(
      code,
      GH_REDIRECT_URI || undefined,
      typeof codeVerifier === 'string' ? codeVerifier : undefined
    )

    if (tokenData.error) {
      res.status(400).json({
        error: tokenData.error_description || tokenData.error,
      })
      return
    }

    const accessToken = tokenData.access_token
    if (!accessToken) {
      res.status(400).json({ error: 'No access token received' })
      return
    }

    const user = await fetchGitHubUser(accessToken)
    if (!user) {
      res.status(500).json({ error: 'Failed to fetch user' })
      return
    }

    res.json({
      access_token: accessToken,
      user: {
        login: user.login,
        avatar_url: user.avatar_url,
        name: user.name || user.login,
      },
    })
  } catch (err) {
    console.error('OAuth exchange error:', err)
    res.status(500).json({ error: 'Authentication failed' })
  }
})

export default router
