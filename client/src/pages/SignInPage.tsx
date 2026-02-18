import { useState } from 'react'
import { buildAuthUrl } from '../lib/auth'
import { useTheme } from '../contexts/ThemeContext'

export default function SignInPage() {
  const { theme, toggleTheme } = useTheme()
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <div className="text-center p-8 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent shadow-lg dark:shadow-none max-w-md">
        <h1 className="m-0 mb-2 text-2xl font-semibold text-gray-900 dark:text-white">GitHub Issues</h1>
        <p className="text-gray-600 dark:text-white/70 mb-8">Manage your GitHub issues in a Notion-like workspace</p>
        {error && <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>}
        <button
          className="px-6 py-3 text-base cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? 'Redirecting...' : 'Sign in with GitHub'}
        </button>
        <p className="text-sm text-gray-500 dark:text-white/60 mt-4">
          Requires GitHub OAuth config in either <code>client/.env</code> or the auth server.
        </p>
      </div>
    </div>
  )
}
