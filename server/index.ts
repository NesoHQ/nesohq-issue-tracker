import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import express from 'express'
import cors from 'cors'
import * as multerModule from 'multer'

const multer = (multerModule as unknown as { default?: typeof multerModule }).default ?? multerModule

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

const UPLOADS_DIR = path.resolve(__dirname, '../uploads')
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '.png'
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype)
    cb(null, ok)
  },
})

const PORT = process.env.PORT || 3001
const GITHUB_CLIENT_ID =
  process.env.GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  console.warn(
    'Warning: GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set for OAuth. ' +
    'Create a GitHub OAuth App at https://github.com/settings/developers'
  )
}

app.use('/api/uploads', express.static(UPLOADS_DIR))

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' })
  }
  const base =
    process.env.API_PUBLIC_URL ||
    process.env.VITE_API_URL ||
    (req.headers.origin ?? `http://localhost:${PORT}`)
  const url = `${base.replace(/\/$/, '')}/api/uploads/${req.file.filename}`
  res.json({ url })
})

app.post('/api/auth/exchange', async (req, res) => {
  const { code, redirect_uri, code_verifier } = req.body

  if (!code || !redirect_uri) {
    return res.status(400).json({ error: 'Missing code or redirect_uri' })
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return res.status(500).json({ error: 'OAuth not configured' })
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri,
        ...(code_verifier && { code_verifier }),
      }),
    })

    const tokenData = await tokenRes.json()

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description || tokenData.error })
    }

    const accessToken = tokenData.access_token
    if (!accessToken) {
      return res.status(400).json({ error: 'No access token received' })
    }

    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    })

    if (!userRes.ok) {
      return res.status(500).json({ error: 'Failed to fetch user' })
    }

    const user = await userRes.json()

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

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`)
})
