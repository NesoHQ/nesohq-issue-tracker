import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export default function TopBar() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-black/20 border-b border-gray-200 dark:border-white/10">
      <h1 className="m-0 text-xl font-semibold text-gray-900 dark:text-white">GitHub Issues</h1>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <span className="text-lg" aria-hidden>☀️</span>
          ) : (
            <span className="text-lg" aria-hidden>🌙</span>
          )}
        </button>
        {user && (
          <>
            <div className="flex items-center gap-2">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-7 h-7 rounded-full"
              />
              <span className="text-sm text-gray-700 dark:text-white/90">{user.login}</span>
            </div>
            <button className="px-3 py-1.5 text-sm" onClick={signOut}>
              Sign out
            </button>
          </>
        )}
      </div>
    </header>
  )
}
