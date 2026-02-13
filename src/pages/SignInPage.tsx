import { useState } from 'react'
import { buildAuthUrl } from '../lib/auth'

export default function SignInPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = await buildAuthUrl()
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start sign in')
      setLoading(false)
    }
  }

  const hasClientId = !!import.meta.env.VITE_GITHUB_CLIENT_ID

  return (
    <div className="signin-page">
      <div className="signin-card">
        <h1>GitHub Issues</h1>
        <p className="subtitle">Manage your GitHub issues in a Notion-like workspace</p>
        {error && <p className="error">{error}</p>}
        <button
          className="signin-button"
          onClick={handleSignIn}
          disabled={loading || !hasClientId}
        >
          {loading ? 'Redirecting...' : 'Sign in with GitHub'}
        </button>
        {!hasClientId && (
          <p className="hint">
            Configure VITE_GITHUB_CLIENT_ID in .env and run the auth server with
            GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.
          </p>
        )}
      </div>
    </div>
  )
}
