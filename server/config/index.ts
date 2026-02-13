import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '../..')
dotenv.config({ path: path.join(projectRoot, '.env') })

/** Server port (default 3001) */
export const PORT = Number(process.env.PORT) || 3001

/** GitHub OAuth client ID */
export const GITHUB_CLIENT_ID =
  process.env.GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID

/** GitHub OAuth client secret */
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET

/** Directory for uploaded images */
export const UPLOADS_DIR = path.join(projectRoot, 'uploads')

/** Ensure uploads directory exists */
export function ensureUploadsDir(): void {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  }
}

/** Base URL for API (used for upload URLs) */
export function getApiBaseUrl(reqOrigin?: string): string {
  return (
    process.env.API_PUBLIC_URL ||
    process.env.VITE_API_URL ||
    reqOrigin ||
    `http://localhost:${PORT}`
  )
}

/** Log a warning if OAuth is not configured */
export function warnIfOAuthNotConfigured(): void {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    console.warn(
      'Warning: GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set for OAuth. ' +
        'Create a GitHub OAuth App at https://github.com/settings/developers'
    )
  }
}
