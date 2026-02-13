import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { listUserRepos } from '../lib/githubClient'
import { useWorkspaceStore } from '../store/workspaceStore'

const MIN_WIDTH = 160
const MAX_WIDTH = 480
const DEFAULT_WIDTH = 260

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
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

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

  useEffect(() => {
    if (!isResizing) return
    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + delta))
      setWidth(next)
    }
    const onUp = () => setIsResizing(false)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    startXRef.current = e.clientX
    startWidthRef.current = width
    setIsResizing(true)
  }

  return (
    <aside
      className={`flex flex-col shrink-0 min-h-0 border-r border-white/10 bg-black/10 overflow-hidden relative ${
        isResizing ? '' : 'transition-[width] duration-200'
      } ${expanded ? '' : 'w-12'}`}
      style={expanded ? { width } : undefined}
    >
      <div
        className={`flex items-center shrink-0 border-b border-white/[0.08] gap-2 ${
          expanded ? 'justify-between p-4' : 'justify-center p-2'
        }`}
      >
        {expanded && (
          <h2 className="m-0 text-xs font-semibold uppercase tracking-wider text-white/60 flex-1 min-w-0">
            Repositories
          </h2>
        )}
        <button
          type="button"
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-white/10 border border-white/20 text-white/80 cursor-pointer text-xs hover:bg-white/20"
          onClick={() => setExpanded(!expanded)}
          title={expanded ? 'Collapse' : 'Expand'}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {expanded ? '◀' : '▶'}
        </button>
      </div>
      {expanded && (
        <div className="flex-1 min-h-0 overflow-y-scroll overflow-x-hidden p-2 overscroll-contain sidebar-repo-list">
          {loading && <p className="p-4 text-sm text-white/60">Loading repos...</p>}
          {error && <p className="p-4 text-sm text-red-400">{error}</p>}
          {!loading && !error && (
            <ul className="list-none m-0 p-0">
              {availableRepos.map((repo) => (
                <li key={repo.id} className="m-0">
                  <label className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md text-sm hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={isRepoSelected(repo.full_name)}
                      onChange={() => toggleRepo(repo.full_name)}
                    />
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {repo.full_name}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {expanded && selectedRepos.length > 0 && (
        <div className="px-4 py-3 text-xs text-white/50 border-t border-white/[0.08]">
          {selectedRepos.length} repo{selectedRepos.length !== 1 ? 's' : ''}{' '}
          selected
        </div>
      )}
      {expanded && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-valuenow={width}
          aria-valuemin={MIN_WIDTH}
          aria-valuemax={MAX_WIDTH}
          className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-white/10"
          onMouseDown={handleResizeStart}
        />
      )}
    </aside>
  )
}
