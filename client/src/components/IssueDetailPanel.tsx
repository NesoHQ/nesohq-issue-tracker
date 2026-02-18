import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useIssuesStore } from '../store/issuesStore'
import { useToast } from '../contexts/ToastContext'
import { getIssue, updateIssue, listRepoLabels, listIssueLinkedPullRequests, deleteIssue } from '../lib/githubClient'
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
  onDeleted?: () => void
}

export default function IssueDetailPanel({
  repo,
  issueNumber,
  onClose,
  onDeleted,
}: IssueDetailPanelProps) {
  const MIN_WIDTH = 360
  const MAX_WIDTH = 760
  const { token } = useAuth()
  const { updateIssueLocally, removeIssueLocally } = useIssuesStore()
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
  const [width, setWidth] = useState(420)
  const [isResizing, setIsResizing] = useState(false)
  const resizeStartXRef = useRef(0)
  const resizeStartWidthRef = useRef(0)

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

  useEffect(() => {
    if (!isResizing) return
    const onMove = (e: MouseEvent) => {
      const delta = resizeStartXRef.current - e.clientX
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, resizeStartWidthRef.current + delta))
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

  const handleDeleteIssue = async () => {
    if (!token || !issue) return
    const confirmed = window.confirm(
      `Delete issue #${issue.number} from GitHub?\n\nThis cannot be undone.`
    )
    if (!confirmed) return
    setSaving(true)
    try {
      await deleteIssue(token, repo, issue.number)
      removeIssueLocally(repo, issue.number)
      addToast('Issue deleted from GitHub', 'success')
      onDeleted?.()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete issue'
      addToast(message, 'error')
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

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    resizeStartXRef.current = e.clientX
    resizeStartWidthRef.current = width
    setIsResizing(true)
  }

  if (loading || !issue) {
    return (
      <div
        className={`shrink-0 flex flex-col border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/20 overflow-hidden relative ${isResizing ? '' : 'transition-[width] duration-200'}`}
        style={{ width }}
      >
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize issue detail panel"
          className="absolute left-0 top-0 h-full w-2 cursor-col-resize hover:bg-blue-200/40 dark:hover:bg-blue-400/25"
          onMouseDown={handleResizeStart}
        />
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/30">
          <div className="text-sm font-medium text-gray-700 dark:text-white/80">Loading issue...</div>
          <button
            type="button"
            className="h-8 w-8 p-0 rounded-md border border-gray-300 dark:border-white/15 text-gray-700 dark:text-white/70 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10"
            onClick={onClose}
            aria-label="Close details panel"
          >
            x
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 text-sm text-gray-600 dark:text-white/70">Loading...</div>
      </div>
    )
  }

  return (
    <div
      className={`shrink-0 flex flex-col border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/20 overflow-hidden relative ${isResizing ? '' : 'transition-[width] duration-200'}`}
      style={{ width }}
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={width}
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={MAX_WIDTH}
        aria-label="Resize issue detail panel"
        className="absolute left-0 top-0 h-full w-2 cursor-col-resize hover:bg-blue-200/40 dark:hover:bg-blue-400/25"
        onMouseDown={handleResizeStart}
      />
      <div className="shrink-0 px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/30 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-white/55">
              {repo}
            </div>
            <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white/90">
              Issue #{issue.number}
            </div>
            <div className="mt-1 text-[11px] text-gray-500 dark:text-white/45">
              Drag the left edge to resize
            </div>
          </div>
          <button
            type="button"
            className="h-8 w-8 p-0 rounded-md border border-gray-300 dark:border-white/15 text-gray-700 dark:text-white/70 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10"
            onClick={onClose}
            aria-label="Close details panel"
          >
            x
          </button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <a
            href={issue.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Open on GitHub
          </a>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              issue.state === 'open'
                ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-500/30 dark:text-gray-200'
            }`}
          >
            {issue.state}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <section className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3">
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
        </section>

        <section className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3">
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
                    className="block p-2.5 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm text-blue-600 dark:text-blue-400">PR #{pr.number}</div>
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded ${
                          pr.state === 'open'
                            ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-500/30 dark:text-gray-200'
                        }`}
                      >
                        {pr.state}
                      </span>
                    </div>
                    <div className="text-sm text-gray-800 dark:text-white/85 break-words">
                      {pr.title}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3">
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
        </section>

        <section className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3">
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
              className="text-sm whitespace-pre-wrap text-gray-800 dark:text-white/85 cursor-pointer leading-6"
              onDoubleClick={() => setEditing('body')}
            >
              {issue.body || <em>No description</em>}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3">
          <button
            type="button"
            onClick={() => setLabelsExpanded((v) => !v)}
            className="flex items-center gap-2 w-full text-left text-xs font-semibold text-gray-500 dark:text-white/50 mb-2 hover:text-gray-700 dark:hover:text-white/75 transition-colors"
          >
            <span
              className={`transition-transform ${labelsExpanded ? 'rotate-90' : ''}`}
              aria-hidden
            >
              ›
            </span>
            Labels
            {issue.labels.length > 0 && (
              <span className="text-gray-500 dark:text-white/40 text-xs">({issue.labels.length} selected)</span>
            )}
          </button>
          {labelsExpanded && (
            <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 max-h-[140px] overflow-y-auto">
              {allLabels.map((l) => labelChip(l, selectedLabelNames.includes(l.name)))}
            </div>
          )}
        </section>

        <section className="pt-2">
          <button
            type="button"
            onClick={handleDeleteIssue}
            disabled={saving}
            className="w-full px-3 py-2 rounded-md border border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Delete issue from GitHub
          </button>
        </section>
      </div>
    </div>
  )
}
