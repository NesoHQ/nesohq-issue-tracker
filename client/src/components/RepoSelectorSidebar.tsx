import { useEffect, useMemo, useRef, useState } from 'react'
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
    setSelectedRepos,
    isRepoSelected,
  } = useWorkspaceStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  const filteredRepos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return availableRepos
    return availableRepos.filter((repo) => repo.full_name.toLowerCase().includes(term))
  }, [availableRepos, searchTerm])

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
      className={`flex flex-col shrink-0 min-h-0 border-r border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/10 overflow-hidden relative ${
        isResizing ? '' : 'transition-[width] duration-200'
      } ${expanded ? '' : 'w-12'}`}
      style={expanded ? { width } : undefined}
    >
      <div
        className={`shrink-0 border-b border-gray-200 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] ${
          expanded ? 'p-4 space-y-3' : 'p-2'
        }`}
      >
        <div className={`flex items-center gap-2 ${expanded ? 'justify-between' : 'justify-center'}`}>
          {expanded && (
            <div className="min-w-0">
              <h2 className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-white/60">
                Repositories
              </h2>
              <p className="m-0 mt-1 text-xs text-gray-600 dark:text-white/50">
                {availableRepos.length} available
              </p>
            </div>
          )}
          <button
            type="button"
            className="shrink-0 h-8 w-8 p-0 inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-white/[0.06] text-gray-600 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? 'Collapse' : 'Expand'}
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <span className="text-xs" aria-hidden>{expanded ? '◀' : '▶'}</span>
          </button>
        </div>
        {expanded && (
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search repositories..."
              className="w-full h-9 rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-black/20 px-3 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
              aria-label="Search repositories"
            />
          </div>
        )}
      </div>
      {expanded && (
        <div className="flex-1 min-h-0 overflow-y-scroll overflow-x-hidden p-2 overscroll-contain sidebar-repo-list">
          {loading && <p className="p-4 text-sm text-gray-500 dark:text-white/60">Loading repos...</p>}
          {error && <p className="p-4 text-sm text-red-500 dark:text-red-400">{error}</p>}
          {!loading && !error && (
            <ul className="list-none m-0 p-0">
              {filteredRepos.map((repo) => (
                <li key={repo.id} className="m-0">
                  <label
                    className={`group flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg text-sm border transition-colors ${
                      isRepoSelected(repo.full_name)
                        ? 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-500/15 dark:border-blue-400/30 dark:text-white'
                        : 'border-transparent text-gray-800 dark:text-inherit hover:bg-gray-200 dark:hover:bg-white/5'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isRepoSelected(repo.full_name)}
                      onChange={() => toggleRepo(repo.full_name)}
                      className="accent-blue-600 dark:accent-blue-400"
                    />
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {repo.full_name}
                    </span>
                  </label>
                </li>
              ))}
              {filteredRepos.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-gray-500 dark:text-white/50">
                  No repositories match "{searchTerm.trim()}".
                </li>
              )}
            </ul>
          )}
        </div>
      )}
      {expanded && selectedRepos.length > 0 && (
        <div className="px-3 py-3 border-t border-gray-200 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between gap-2 text-xs text-gray-600 dark:text-white/60">
            <span>{selectedRepos.length} repo{selectedRepos.length !== 1 ? 's' : ''} selected</span>
            <button
              type="button"
              onClick={() => setSelectedRepos([])}
              className="h-7 px-2.5 text-[11px] rounded-md border border-gray-300 dark:border-white/15 bg-white dark:bg-white/[0.08] text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/[0.14]"
            >
              Clear
            </button>
          </div>
        </div>
      )}
      {expanded && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-valuenow={width}
          aria-valuemin={MIN_WIDTH}
          aria-valuemax={MAX_WIDTH}
          className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-gray-300 dark:hover:bg-white/10"
          onMouseDown={handleResizeStart}
        />
      )}
    </aside>
  )
}
