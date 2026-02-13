import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useIssuesStore } from '../store/issuesStore'
import { useToast } from '../contexts/ToastContext'
import {
  createIssue,
  listRepoLabels,
  listRepoCollaborators,
} from '../lib/githubClient'

interface CreateIssueModalProps {
  onClose: () => void
  selectedRepos: string[]
}

export default function CreateIssueModal({
  onClose,
  selectedRepos,
}: CreateIssueModalProps) {
  const { token } = useAuth()
  const { addIssue } = useIssuesStore()
  const { addToast } = useToast()
  const [repo, setRepo] = useState(selectedRepos[0] || '')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [labels, setLabels] = useState<string[]>([])
  const [assignees, setAssignees] = useState<string[]>([])
  const [repoLabels, setRepoLabels] = useState<Awaited<ReturnType<typeof listRepoLabels>>>([])
  const [repoCollaborators, setRepoCollaborators] = useState<Awaited<ReturnType<typeof listRepoCollaborators>>>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!token || !repo) return
    Promise.all([
      listRepoLabels(token, repo),
      listRepoCollaborators(token, repo),
    ]).then(([l, c]) => {
      setRepoLabels(l)
      setRepoCollaborators(c)
      setLabels([])
      setAssignees([])
    })
  }, [token, repo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !title.trim()) return
    setSaving(true)
    try {
      const issue = await createIssue(token, repo, {
        title: title.trim(),
        body: body.trim() || null,
        labels: labels.length ? labels : undefined,
        assignees: assignees.length ? assignees : undefined,
      })
      addIssue(repo, issue)
      addToast('Issue created', 'success')
      onClose()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to create issue', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New issue</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-field">
            <label>Repository</label>
            <select
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              required
            >
              {selectedRepos.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Issue title"
              required
            />
          </div>
          <div className="form-field">
            <label>Description</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add a description..."
              rows={6}
            />
          </div>
          <div className="form-field">
            <label>Labels</label>
            <select
              multiple
              value={labels}
              onChange={(e) =>
                setLabels(
                  Array.from(e.target.selectedOptions, (o) => o.value)
                )
              }
            >
              {repoLabels.map((l) => (
                <option key={l.id} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Assignees</label>
            <select
              multiple
              value={assignees}
              onChange={(e) =>
                setAssignees(
                  Array.from(e.target.selectedOptions, (o) => o.value)
                )
              }
            >
              {repoCollaborators.map((c) => (
                <option key={c.id} value={c.login}>
                  {c.login}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={saving || !title.trim()}>
              {saving ? 'Creating...' : 'Create issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
