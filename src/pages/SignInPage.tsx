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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center p-8 rounded-xl bg-white/5 max-w-md">
        <h1 className="m-0 mb-2 text-2xl font-semibold">GitHub Issues</h1>
        <p className="text-white/70 mb-8">Manage your GitHub issues in a Notion-like workspace</p>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <button
          className="px-6 py-3 text-base cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleSignIn}
          disabled={loading || !hasClientId}
        >
          {loading ? 'Redirecting...' : 'Sign in with GitHub'}
        </button>
        {!hasClientId && (
          <p className="text-sm text-white/60 mt-4">
            Configure VITE_GITHUB_CLIENT_ID in .env and run the auth server with
            GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.
          </p>
        )}
      </div>
    </div>
  )
}
