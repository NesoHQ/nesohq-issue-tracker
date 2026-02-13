import { useState } from 'react'
import { useWorkspaceStore } from '../store/workspaceStore'
import { useIssuesStore } from '../store/issuesStore'
import { useIssues } from '../hooks/useIssues'
import IssuesTable from './IssuesTable'
import IssueDetailPanel from './IssueDetailPanel'
import CreateIssueModal from './CreateIssueModal'

export default function IssuesWorkspace() {
  const { selectedRepos } = useWorkspaceStore()
  const { loading, error, getFilteredIssues, hasMore } = useIssuesStore()
  const { loadMore } = useIssues(selectedRepos)
  const [filters, setFilters] = useState({
    state: 'all' as 'open' | 'closed' | 'all',
    search: '',
    labelFilter: null as string | null,
    assigneeFilter: null as string | null,
  })
  const [selectedIssue, setSelectedIssue] = useState<{
    repo: string
    number: number
  } | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const issues = getFilteredIssues(selectedRepos, filters)
  const anyHasMore = selectedRepos.some((r) => hasMore[r])

  if (selectedRepos.length === 0) {
    return (
      <div className="py-12 text-center text-white/60">
        <p>Select one or more repositories from the sidebar to view issues.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex gap-3 items-center">
          <select
            value={filters.state}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                state: e.target.value as 'open' | 'closed' | 'all',
              }))
            }
            className="px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-inherit"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          <input
            type="search"
            placeholder="Search issues..."
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
            className="px-3 py-1.5 min-w-[200px] rounded-md bg-white/10 border border-white/20 text-inherit"
          />
        </div>
        <button
          className="px-4 py-2 bg-blue-500 border-none rounded-md text-white font-medium cursor-pointer hover:bg-blue-600"
          onClick={() => setShowCreateModal(true)}
        >
          New issue
        </button>
      </div>

      {loading && issues.length === 0 && (
        <div className="p-4 text-white/70 flex items-center gap-2">
          <span className="inline-block w-[18px] h-[18px] border-2 border-white/20 border-t-white/80 rounded-full animate-spin-slow" />
          Loading issues...
        </div>
      )}
      {error && <div className="p-4 text-red-400">{error}</div>}

      <div className="flex-1 flex gap-4 min-h-0">
        <IssuesTable
          issues={issues}
          selectedRepos={selectedRepos}
          onSelectIssue={setSelectedIssue}
          selectedIssue={selectedIssue}
        />
        {selectedIssue && (
          <IssueDetailPanel
            repo={selectedIssue.repo}
            issueNumber={selectedIssue.number}
            onClose={() => setSelectedIssue(null)}
          />
        )}
      </div>

      {anyHasMore && (
        <div className="py-4 text-center">
          <button onClick={loadMore} disabled={loading} className="px-4 py-2">
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateIssueModal
          onClose={() => setShowCreateModal(false)}
          selectedRepos={selectedRepos}
        />
      )}
    </div>
  )
}
