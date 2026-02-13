import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { exchangeCodeForToken } from '../lib/api'
import { getStoredCodeVerifier, getStoredState } from '../lib/auth'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      setError(searchParams.get('error_description') || 'No authorization code received')
      return
    }

    const storedState = getStoredState()
    if (state !== storedState) {
      setError('Invalid state - possible CSRF attack')
      return
    }

    const codeVerifier = getStoredCodeVerifier()
    const redirectUri = `${window.location.origin}/auth/callback`

    exchangeCodeForToken(code, redirectUri, codeVerifier)
      .then(({ access_token, user }) => {
        signIn(access_token, user)
        navigate('/', { replace: true })
      })
      .catch((err) => {
        setError(err.message || 'Authentication failed')
      })
  }, [searchParams, signIn, navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center p-8 rounded-xl bg-white/5 max-w-md">
          <h2>Sign in failed</h2>
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => navigate('/signin')}>Back to sign in</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center p-8 rounded-xl bg-white/5 max-w-md">
        <p>Completing sign in...</p>
      </div>
    </div>
  )
}
