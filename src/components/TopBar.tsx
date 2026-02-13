import { useAuth } from '../contexts/AuthContext'

export default function TopBar() {
  const { user, signOut } = useAuth()

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-black/20 border-b border-white/10">
      <h1 className="m-0 text-xl font-semibold">GitHub Issues</h1>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="flex items-center gap-2">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-7 h-7 rounded-full"
              />
              <span className="text-sm text-white/90">{user.login}</span>
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
