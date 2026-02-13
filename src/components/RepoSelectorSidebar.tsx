import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { listUserRepos } from '../lib/githubClient'
import { useWorkspaceStore } from '../store/workspaceStore'

export default function RepoSelectorSidebar() {
  const { token } = useAuth()
  const {
    availableRepos,
    setAvailableRepos,
    selectedRepos,
    toggleRepo,
    isRepoSelected,
  } = useWorkspaceStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError(null)
    listUserRepos(token, { per_page: 100, sort: 'updated' })
      .then((repos) => {
        setAvailableRepos(repos)
      })
      .catch((err) => {
        setError(err.message || 'Failed to load repos')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [token, setAvailableRepos])

  return (
    <aside className={`sidebar ${expanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      <div className="sidebar-header">
        <h2>Repositories</h2>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setExpanded(!expanded)}
          title={expanded ? 'Collapse' : 'Expand'}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {expanded ? '◀' : '▶'}
        </button>
      </div>
      {expanded && (
      <div className="sidebar-content">
        {loading && <p className="sidebar-loading">Loading repos...</p>}
        {error && <p className="sidebar-error">{error}</p>}
        {!loading && !error && (
          <ul className="repo-list">
            {availableRepos.map((repo) => (
              <li key={repo.id} className="repo-item">
                <label className="repo-checkbox">
                  <input
                    type="checkbox"
                    checked={isRepoSelected(repo.full_name)}
                    onChange={() => toggleRepo(repo.full_name)}
                  />
                  <span className="repo-name">{repo.full_name}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
      )}
      {expanded && selectedRepos.length > 0 && (
        <div className="sidebar-footer">
          {selectedRepos.length} repo{selectedRepos.length !== 1 ? 's' : ''}{' '}
          selected
        </div>
      )}
    </aside>
  )
}
