import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useIssuesStore } from '../store/issuesStore'
import { useToast } from '../contexts/ToastContext'
import {
  getIssue,
  updateIssue,
  listRepoLabels,
  listRepoCollaborators,
} from '../lib/githubClient'
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
  const [collaborators, setCollaborators] = useState<Awaited<ReturnType<typeof listRepoCollaborators>>>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!token || !repo) return
    setLoading(true)
    Promise.all([
      getIssue(token, repo, issueNumber),
      listRepoLabels(token, repo),
      listRepoCollaborators(token, repo),
    ])
      .then(([i, l, c]) => {
        setIssue(i)
        setEditTitle(i.title)
        setEditBody(i.body || '')
        setLabels(l)
        setCollaborators(c)
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

  const handleAssigneeChange = async (assignees: string[]) => {
    if (!token || !issue) return
    setSaving(true)
    const prev = issue.assignees
    const newAssignees = collaborators.filter((c) => assignees.includes(c.login))
    updateIssueLocally(repo, issueNumber, {
      assignees: newAssignees,
      assignee: newAssignees[0] || null,
    })
    try {
      const updated = await updateIssue(token, repo, issueNumber, {
        assignees,
      })
      setIssue(updated)
      addToast('Assignees updated', 'success')
    } catch {
      updateIssueLocally(repo, issueNumber, { assignees: prev, assignee: prev[0] || null })
      addToast('Failed to update assignees', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !issue) {
    return (
      <div className="detail-panel">
        <div className="detail-panel-header">
          <button className="detail-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="detail-panel-body">Loading...</div>
      </div>
    )
  }

  return (
    <div className="detail-panel">
      <div className="detail-panel-header">
        <a
          href={issue.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="detail-external"
        >
          Open on GitHub
        </a>
        <button className="detail-close" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="detail-panel-body">
        <div className="detail-field">
          <label>State</label>
          <select
            value={issue.state}
            onChange={(e) => handleStateChange(e.target.value as 'open' | 'closed')}
            disabled={saving}
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="detail-field">
          <label>Title</label>
          {editing === 'title' ? (
            <div className="detail-edit">
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
              />
            </div>
          ) : (
            <h2
              className="detail-title"
              onDoubleClick={() => setEditing('title')}
            >
              {issue.title}
            </h2>
          )}
        </div>

        <div className="detail-field">
          <label>Description</label>
          {editing === 'body' ? (
            <div className="detail-edit">
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                onBlur={handleSaveBody}
                rows={8}
                autoFocus
              />
            </div>
          ) : (
            <div
              className="detail-body"
              onDoubleClick={() => setEditing('body')}
            >
              {issue.body || <em>No description</em>}
            </div>
          )}
        </div>

        <div className="detail-field">
          <label>Labels</label>
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
          >
            {labels.map((l) => (
              <option key={l.id} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="detail-field">
          <label>Assignees</label>
          <select
            multiple
            value={issue.assignees.map((a) => a.login)}
            onChange={(e) => {
              const selected = Array.from(
                e.target.selectedOptions,
                (o) => o.value
              )
              handleAssigneeChange(selected)
            }}
            disabled={saving}
          >
            {collaborators.map((c) => (
              <option key={c.id} value={c.login}>
                {c.login}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
