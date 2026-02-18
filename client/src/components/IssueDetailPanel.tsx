import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useIssuesStore } from '../store/issuesStore'
import { useToast } from '../contexts/ToastContext'
import { getIssue, updateIssue, listRepoLabels, listIssueLinkedPullRequests } from '../lib/githubClient'
import type { GitHubIssue, GitHubLabel, GitHubLinkedPullRequest } from '../types/github'

function isColorLight(hex: string): boolean {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6
}

interface IssueDetailPanelProps {
  repo: string
  issueNumber: number
  onClose: () => void
}

export default function IssueDetailPanel({
  repo,
  issueNumber,
  onClose,
}: IssueDetailPanelProps) {
  const { token } = useAuth()
  const { updateIssueLocally } = useIssuesStore()
  const { addToast } = useToast()
  const [issue, setIssue] = useState<GitHubIssue | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<'title' | 'body' | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [labels, setLabels] = useState<Awaited<ReturnType<typeof listRepoLabels>>>([])
  const [linkedPullRequests, setLinkedPullRequests] = useState<GitHubLinkedPullRequest[]>([])
  const [saving, setSaving] = useState(false)
  const [labelsExpanded, setLabelsExpanded] = useState(true)

  useEffect(() => {
    if (!token || !repo) return
    setLoading(true)
    Promise.all([
      getIssue(token, repo, issueNumber),
      listRepoLabels(token, repo),
      listIssueLinkedPullRequests(token, repo, issueNumber),
    ])
      .then(([i, l, prs]) => {
        setIssue(i)
        setEditTitle(i.title)
        setEditBody(i.body || '')
        setLabels(l)
        setLinkedPullRequests(prs)
      })
      .catch(() => addToast('Failed to load issue', 'error'))
      .finally(() => setLoading(false))
  }, [token, repo, issueNumber, addToast])

  const handleSaveTitle = async () => {
    if (!token || !issue || editTitle.trim() === issue.title) {
      setEditing(null)
      return
    }
    setSaving(true)
    const prev = issue.title
    updateIssueLocally(repo, issueNumber, { title: editTitle })
    try {
      const updated = await updateIssue(token, repo, issueNumber, {
        title: editTitle.trim(),
      })
      setIssue(updated)
      addToast('Title updated', 'success')
      setEditing(null)
    } catch {
      updateIssueLocally(repo, issueNumber, { title: prev })
      addToast('Failed to update title', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBody = async () => {
    if (!token || !issue) {
      setEditing(null)
      return
    }
    setSaving(true)
    const prev = issue.body
    updateIssueLocally(repo, issueNumber, { body: editBody })
    try {
      const updated = await updateIssue(token, repo, issueNumber, {
        body: editBody || null,
      })
      setIssue(updated)
      addToast('Description updated', 'success')
      setEditing(null)
    } catch {
      updateIssueLocally(repo, issueNumber, { body: prev })
      addToast('Failed to update description', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleStateChange = async (state: 'open' | 'closed') => {
    if (!token || !issue || state === issue.state) return
    setSaving(true)
    const prev = issue.state
    updateIssueLocally(repo, issueNumber, { state })
    try {
      const updated = await updateIssue(token, repo, issueNumber, { state })
      setIssue(updated)
      addToast(`Issue ${state}`, 'success')
    } catch {
      updateIssueLocally(repo, issueNumber, { state: prev })
      addToast('Failed to update state', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLabelsChange = async (newLabels: string[]) => {
    if (!token || !issue) return
    setSaving(true)
    const prev = issue.labels
    const newLabelObjs = newLabels
      .map((name) => labels.find((l) => l.name === name) ?? issue.labels.find((l) => l.name === name))
      .filter((l): l is GitHubLabel => !!l)
    updateIssueLocally(repo, issueNumber, { labels: newLabelObjs })
    try {
      const updated = await updateIssue(token, repo, issueNumber, {
        labels: newLabels,
      })
      setIssue(updated)
      addToast('Labels updated', 'success')
    } catch {
      updateIssueLocally(repo, issueNumber, { labels: prev })
      addToast('Failed to update labels', 'error')
    } finally {
      setSaving(false)
    }
  }

  const selectedLabelNames = issue?.labels.map((l) => l.name) ?? []
  const labelMap = new Map<string, GitHubLabel>()
  labels.forEach((l) => labelMap.set(l.name, l))
  issue?.labels.forEach((l) => labelMap.set(l.name, l))
  const allLabels = Array.from(labelMap.values()).sort((a, b) => {
    const aSel = selectedLabelNames.includes(a.name)
    const bSel = selectedLabelNames.includes(b.name)
    return aSel === bSel ? 0 : aSel ? -1 : 1
  })

  const labelChip = (l: GitHubLabel, isSelected: boolean) => {
    const bgColor = `#${l.color}`
    const isLight = isColorLight(l.color)
    return (
      <button
        key={l.id}
        type="button"
        onClick={() => {
          if (saving) return
          const next = isSelected
            ? selectedLabelNames.filter((n) => n !== l.name)
            : [...selectedLabelNames, l.name]
          handleLabelsChange(next)
        }}
        disabled={saving}
        className={`px-2.5 py-1 rounded-md text-xs font-medium border-2 transition-all cursor-pointer disabled:opacity-50 ${
          isSelected
            ? 'border-gray-800 dark:border-white ring-2 ring-gray-400 dark:ring-white/30'
            : 'border-transparent hover:border-gray-500 dark:hover:border-white/30'
        }`}
        style={{
          backgroundColor: bgColor,
          color: isLight ? '#1a1a1a' : '#fff',
        }}
        title={l.description || l.name}
      >
        {l.name}
      </button>
    )
  }

  if (loading || !issue) {
    return (
      <div className="w-[360px] shrink-0 flex flex-col border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/15 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
          <button className="bg-transparent border-none text-2xl cursor-pointer text-gray-600 dark:text-white/70 px-1" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">Loading...</div>
      </div>
    )
  }

  return (
    <div className="w-[360px] shrink-0 flex flex-col border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/15 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
        <a
          href={issue.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Open on GitHub
        </a>
        <button className="bg-transparent border-none text-2xl cursor-pointer text-gray-600 dark:text-white/70 px-1" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 dark:text-white/50 mb-1">State</label>
          <select
            value={issue.state}
            onChange={(e) => handleStateChange(e.target.value as 'open' | 'closed')}
            disabled={saving}
            className="w-full px-2 py-1.5 rounded-md bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-inherit"
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 dark:text-white/50 mb-1">
            Linked pull requests ({linkedPullRequests.length})
          </label>
          {linkedPullRequests.length === 0 ? (
            <p className="m-0 text-sm text-gray-600 dark:text-white/60">No linked pull requests yet.</p>
          ) : (
            <ul className="m-0 p-0 list-none space-y-2">
              {linkedPullRequests.map((pr) => (
                <li key={pr.id}>
                  <a
                    href={pr.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2 rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      PR #{pr.number}
                    </div>
                    <div className="text-sm text-gray-800 dark:text-white/85 break-words">
                      {pr.title}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 dark:text-white/50 mb-1">Title</label>
          {editing === 'title' ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle()
                if (e.key === 'Escape') {
                  setEditTitle(issue.title)
                  setEditing(null)
                }
              }}
              autoFocus
              className="w-full px-2 py-2 rounded-md bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-inherit font-inherit"
            />
          ) : (
            <h2
              className="m-0 text-base font-semibold cursor-pointer text-gray-900 dark:text-inherit"
              onDoubleClick={() => setEditing('title')}
            >
              {issue.title}
            </h2>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 dark:text-white/50 mb-1">Description</label>
          {editing === 'body' ? (
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              onBlur={handleSaveBody}
              rows={8}
              autoFocus
              className="w-full px-2 py-2 rounded-md bg-white/10 border border-white/20 text-inherit font-inherit resize-y min-h-[120px]"
            />
          ) : (
            <div
              className="text-sm whitespace-pre-wrap text-gray-800 dark:text-white/85 cursor-pointer"
              onDoubleClick={() => setEditing('body')}
            >
              {issue.body || <em>No description</em>}
            </div>
          )}
        </div>

        <div className="mb-4">
          <button
            type="button"
            onClick={() => setLabelsExpanded((v) => !v)}
            className="flex items-center gap-2 w-full text-left text-xs font-semibold text-white/50 mb-2 hover:text-white/70 transition-colors"
          >
            <span
              className={`transition-transform ${labelsExpanded ? 'rotate-90' : ''}`}
              aria-hidden
            >
              ›
            </span>
            Labels
            {issue.labels.length > 0 && (
              <span className="text-white/40 text-xs">({issue.labels.length} selected)</span>
            )}
          </button>
          {labelsExpanded && (
            <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 max-h-[140px] overflow-y-auto">
              {allLabels.map((l) => labelChip(l, selectedLabelNames.includes(l.name)))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
