import { useAuth } from '../contexts/AuthContext'

export default function TopBar() {
  const { user, signOut } = useAuth()

  return (
    <header className="top-bar">
      <h1 className="top-bar-title">GitHub Issues</h1>
      <div className="top-bar-actions">
        {user && (
          <>
            <div className="top-bar-user">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="top-bar-avatar"
              />
              <span className="top-bar-username">{user.login}</span>
            </div>
            <button className="top-bar-signout" onClick={signOut}>
              Sign out
            </button>
          </>
        )}
      </div>
    </header>
  )
}
