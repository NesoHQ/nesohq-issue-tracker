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
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000]"
      onClick={onClose}
    >
      <div
        className="bg-[#1e1e1e] rounded-xl w-full max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="m-0 text-xl">New issue</h2>
          <button className="bg-transparent border-none text-2xl cursor-pointer text-white/70" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto">
          <div className="mb-4">
            <label className="block text-xs font-semibold text-white/60 mb-1">Repository</label>
            <select
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              required
              className="w-full px-2 py-2 rounded-md bg-white/10 border border-white/20 text-inherit font-inherit"
            >
              {selectedRepos.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-white/60 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Issue title"
              required
              className="w-full px-2 py-2 rounded-md bg-white/10 border border-white/20 text-inherit font-inherit"
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-white/60 mb-1">Description</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add a description..."
              rows={6}
              className="w-full px-2 py-2 rounded-md bg-white/10 border border-white/20 text-inherit font-inherit resize-y"
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-white/60 mb-1">Labels</label>
            <select
              multiple
              value={labels}
              onChange={(e) =>
                setLabels(
                  Array.from(e.target.selectedOptions, (o) => o.value)
                )
              }
              className="w-full px-2 py-2 rounded-md bg-white/10 border border-white/20 text-inherit font-inherit"
            >
              {repoLabels.map((l) => (
                <option key={l.id} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-white/60 mb-1">Assignees</label>
            <select
              multiple
              value={assignees}
              onChange={(e) =>
                setAssignees(
                  Array.from(e.target.selectedOptions, (o) => o.value)
                )
              }
              className="w-full px-2 py-2 rounded-md bg-white/10 border border-white/20 text-inherit font-inherit"
            >
              {repoCollaborators.map((c) => (
                <option key={c.id} value={c.login}>
                  {c.login}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
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
