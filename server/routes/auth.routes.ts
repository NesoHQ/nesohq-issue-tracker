import type { Request, Response } from 'express'
import { Router } from 'express'
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '../config'
import {
  exchangeCodeForToken,
  fetchGitHubUser,
} from '../services/github.service'

const router = Router()

/**
 * GET /api/auth/config
 * Returns non-secret OAuth config required by the frontend.
 */
router.get('/config', (_req: Request, res: Response): void => {
  if (!GITHUB_CLIENT_ID) {
    res.status(500).json({ error: 'OAuth not configured' })
    return
  }

  res.json({ client_id: GITHUB_CLIENT_ID })
})

/**
 * POST /api/auth/exchange
 * Exchanges OAuth authorization code for access token and fetches user info.
 */
router.post('/exchange', async (req: Request, res: Response): Promise<void> => {
  const code = req.body?.code
  const redirectUri = req.body?.redirect_uri
  const codeVerifier = req.body?.code_verifier

  if (typeof code !== 'string' || typeof redirectUri !== 'string') {
    res.status(400).json({ error: 'Missing code or redirect_uri' })
    return
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    res.status(500).json({ error: 'OAuth not configured' })
    return
  }

  try {
    const tokenData = await exchangeCodeForToken(
      code,
      redirectUri,
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
