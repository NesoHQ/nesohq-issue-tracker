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
      <div className="workspace-empty">
        <p>Select one or more repositories from the sidebar to view issues.</p>
      </div>
    )
  }

  return (
    <div className="issues-workspace">
      <div className="issues-toolbar">
        <div className="issues-filters">
          <select
            value={filters.state}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                state: e.target.value as 'open' | 'closed' | 'all',
              }))
            }
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
            className="issues-search"
          />
        </div>
        <button
          className="new-issue-btn"
          onClick={() => setShowCreateModal(true)}
        >
          New issue
        </button>
      </div>

      {loading && issues.length === 0 && (
        <div className="issues-loading">
          <span className="spinner" /> Loading issues...
        </div>
      )}
      {error && <div className="issues-error">{error}</div>}

      <div className="issues-content">
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
        <div className="issues-load-more">
          <button onClick={loadMore} disabled={loading}>
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
