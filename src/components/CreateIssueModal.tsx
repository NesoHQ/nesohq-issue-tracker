import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useIssuesStore } from '../store/issuesStore'
import { useToast } from '../contexts/ToastContext'
import { createIssue, listRepoLabels } from '../lib/githubClient'

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
  const [repoLabels, setRepoLabels] = useState<Awaited<ReturnType<typeof listRepoLabels>>>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!token || !repo) return
    listRepoLabels(token, repo).then((l) => {
      setRepoLabels(l)
      setLabels([])
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
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1e1e1e] rounded-xl w-full max-w-[480px] max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="m-0 text-lg font-semibold">Create new issue</h2>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-transparent text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer text-xl leading-none"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Repository
            </label>
            <select
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              required
              className="w-full px-2 py-2 rounded-md bg-white/10 border border-white/20 text-inherit font-inherit focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {selectedRepos.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's the issue?"
              required
              autoFocus
              className="w-full px-2 py-2 rounded-md bg-white/10 border border-white/20 text-inherit font-inherit placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Description <span className="text-white/40 text-xs">(optional)</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add more context, steps to reproduce, or screenshots..."
              rows={5}
              className="w-full px-2 py-2 rounded-md bg-white/10 border border-white/20 text-inherit font-inherit resize-y placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {repoLabels.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Labels <span className="text-white/40 text-xs">(optional)</span>
              </label>
              <select
                multiple
                value={labels}
                onChange={(e) =>
                  setLabels(Array.from(e.target.selectedOptions, (o) => o.value))
                }
                className="w-full px-2 py-2 rounded-md bg-white/10 border border-white/20 text-inherit font-inherit focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[80px]"
                title="Hold Ctrl/Cmd to select multiple"
              >
                {repoLabels.map((l) => (
                  <option key={l.id} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-white/40 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Creating...' : 'Create issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
