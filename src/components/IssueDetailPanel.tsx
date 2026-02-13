import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useIssuesStore } from '../store/issuesStore'
import { useToast } from '../contexts/ToastContext'
import { getIssue, updateIssue, listRepoLabels } from '../lib/githubClient'
import type { GitHubIssue } from '../types/github'

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
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!token || !repo) return
    setLoading(true)
    Promise.all([
      getIssue(token, repo, issueNumber),
      listRepoLabels(token, repo),
    ])
      .then(([i, l]) => {
        setIssue(i)
        setEditTitle(i.title)
        setEditBody(i.body || '')
        setLabels(l)
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
    updateIssueLocally(repo, issueNumber, {
      labels: labels.filter((l) => newLabels.includes(l.name)),
    })
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

  if (loading || !issue) {
    return (
      <div className="w-[360px] shrink-0 flex flex-col border border-white/10 rounded-lg bg-black/15 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <button className="bg-transparent border-none text-2xl cursor-pointer text-white/70 px-1" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">Loading...</div>
      </div>
    )
  }

  return (
    <div className="w-[360px] shrink-0 flex flex-col border border-white/10 rounded-lg bg-black/15 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <a
          href={issue.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm"
        >
          Open on GitHub
        </a>
        <button className="bg-transparent border-none text-2xl cursor-pointer text-white/70 px-1" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <label className="block text-xs font-semibold text-white/50 mb-1">State</label>
          <select
            value={issue.state}
            onChange={(e) => handleStateChange(e.target.value as 'open' | 'closed')}
            disabled={saving}
            className="w-full px-2 py-1.5 rounded-md bg-white/10 border border-white/20 text-inherit"
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-white/50 mb-1">Title</label>
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
              className="w-full px-2 py-2 rounded-md bg-white/10 border border-white/20 text-inherit font-inherit"
            />
          ) : (
            <h2
              className="m-0 text-base font-semibold cursor-pointer"
              onDoubleClick={() => setEditing('title')}
            >
              {issue.title}
            </h2>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-white/50 mb-1">Description</label>
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
              className="text-sm whitespace-pre-wrap text-white/85 cursor-pointer"
              onDoubleClick={() => setEditing('body')}
            >
              {issue.body || <em>No description</em>}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-white/50 mb-1">Labels</label>
          <select
            multiple
            value={issue.labels.map((l) => l.name)}
            onChange={(e) => {
              const selected = Array.from(
                e.target.selectedOptions,
                (o) => o.value
              )
              handleLabelsChange(selected)
            }}
            disabled={saving}
            className="w-full px-2 py-1.5 rounded-md bg-white/10 border border-white/20 text-inherit"
          >
            {labels.map((l) => (
              <option key={l.id} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
