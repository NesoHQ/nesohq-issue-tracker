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

/** GH OAuth client ID */
export const GH_CLIENT_ID = process.env.GH_CLIENT_ID

/** GH OAuth client secret */
export const GH_CLIENT_SECRET = process.env.GH_CLIENT_SECRET

/** Optional canonical GH OAuth callback URL */
export const GH_REDIRECT_URI = process.env.GH_REDIRECT_URI

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
  if (!GH_CLIENT_ID || !GH_CLIENT_SECRET) {
    console.warn(
      'Warning: GH_CLIENT_ID and GH_CLIENT_SECRET must be set for OAuth. ' +
        'Create a GH OAuth App at https://GH.com/settings/developers'
    )
  }
}
