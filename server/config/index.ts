import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const serverRoot = path.resolve(__dirname, '..')
// Load .env from server directory first, then fall back to parent directory
dotenv.config({ path: path.join(serverRoot, '.env') })
dotenv.config({ path: path.join(serverRoot, '..', '.env') })

/** Server port (default 3001) */
export const PORT = Number(process.env.PORT) || 3001

/** GitHub OAuth client ID */
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID

/** GitHub OAuth client secret */
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET

/** Optional canonical GitHub OAuth callback URL */
export const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI

function parseCsvEnv(value: string | undefined): string[] {
  return (value || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

/** Allowed CORS origins */
export const CORS_ORIGINS = parseCsvEnv(process.env.CORS_ORIGIN)

/** Log a warning if OAuth is not configured */
export function warnIfOAuthNotConfigured(): void {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    console.warn(
      'Warning: GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set for OAuth. ' +
        'Create a GitHub OAuth App at https://github.com/settings/developers'
    )
  }
}
