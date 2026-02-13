import { useState, useEffect, useCallback, useRef } from 'react'
import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import { useAuth } from '../contexts/AuthContext'
import { uploadImage } from '../lib/api'

function isColorLight(hex: string): boolean {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6
}
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
  const [labelsExpanded, setLabelsExpanded] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!token || !repo) return
    listRepoLabels(token, repo).then((l) => {
      setRepoLabels(l)
      setLabels([])
    })
  }, [token, repo])

  const handleImageInsert = useCallback(
    async (file: File, insertAt: number, replaceLen: number) => {
      try {
        const url = await uploadImage(file)
        const insert = `![image](${url})`
        setBody((prev) => {
          const pos = insertAt < 0 ? prev.length : insertAt
          return prev.slice(0, pos) + insert + prev.slice(pos + replaceLen)
        })
        addToast('Image uploaded', 'success')
      } catch (err) {
        addToast(err instanceof Error ? err.message : 'Image upload failed', 'error')
      }
    },
    [addToast]
  )

  const handleImageUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleImageFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      // Append at end (position will be resolved in setBody callback)
      handleImageInsert(file, -1, 0)
      e.target.value = ''
    },
    [handleImageInsert]
  )

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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white/80">
                Description <span className="text-white/40 text-xs">(optional)</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleImageFileSelect}
              />
              <button
                type="button"
                onClick={handleImageUploadClick}
                className="text-xs text-white/60 hover:text-white/90 transition-colors"
              >
                Upload image
              </button>
            </div>
            <div data-color-mode="dark" className="[&_.w-md-editor]:bg-white/10 [&_.w-md-editor-toolbar]:bg-white/5 [&_.w-md-editor-toolbar]:border-white/20 [&_.w-md-editor-content]:bg-transparent [&_.w-md-editor-text-pre]:text-inherit [&_.w-md-editor-text-input]:text-inherit [&_.w-md-editor-text-input]:placeholder-white/40 [&_.w-md-editor-preview]:bg-white/5 [&_.w-md-editor-preview]:border-white/10">
              <MDEditor
                value={body}
                onChange={(v) => setBody(v ?? '')}
                height={180}
                preview="live"
                textareaProps={{
                  placeholder:
                    'Add more context, steps to reproduce, or screenshots. Supports **markdown** and images (paste or drag).',
                  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
                    const clipboardData = e.clipboardData
                    if (!clipboardData) return
                    let file: File | undefined = clipboardData.files?.[0]
                    if (!file && clipboardData.items) {
                      for (const item of clipboardData.items) {
                        if (item.type.startsWith('image/')) {
                          file = item.getAsFile() ?? undefined
                          break
                        }
                      }
                    }
                    if (!file?.type.startsWith('image/')) return
                    e.preventDefault()
                    e.stopPropagation()
                    const target = e.currentTarget
                    const start = target.selectionStart ?? 0
                    const end = target.selectionEnd ?? 0
                    handleImageInsert(file, start, end - start)
                  },
                  onDrop: (e: React.DragEvent<HTMLTextAreaElement>) => {
                    const file = e.dataTransfer?.files?.[0]
                    if (!file?.type.startsWith('image/')) return
                    e.preventDefault()
                    e.stopPropagation()
                    const target = e.currentTarget
                    const start = target.selectionStart ?? 0
                    const end = target.selectionEnd ?? 0
                    handleImageInsert(file, start, end - start)
                  },
                  onDragOver: (e: React.DragEvent<HTMLTextAreaElement>) => {
                    if (e.dataTransfer?.types?.includes('Files')) {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'copy'
                    }
                  },
                }}
              />
            </div>
          </div>

          {repoLabels.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setLabelsExpanded((v) => !v)}
                className="flex items-center gap-2 w-full text-left text-sm font-medium text-white/80 mb-2 hover:text-white/90 transition-colors"
              >
                <span
                  className={`transition-transform ${labelsExpanded ? 'rotate-90' : ''}`}
                  aria-hidden
                >
                  ›
                </span>
                Labels <span className="text-white/40 text-xs">(optional)</span>
                {labels.length > 0 && (
                  <span className="text-white/50 text-xs">({labels.length} selected)</span>
                )}
              </button>
              {labelsExpanded && (
              <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-white/5 border border-white/10 max-h-[140px] overflow-y-auto">
                {repoLabels.map((l) => {
                  const isSelected = labels.includes(l.name)
                  const bgColor = `#${l.color}`
                  const isLight = isColorLight(l.color)
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() =>
                        setLabels((prev) =>
                          isSelected
                            ? prev.filter((n) => n !== l.name)
                            : [...prev, l.name]
                        )
                      }
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-white ring-2 ring-white/30'
                          : 'border-transparent hover:border-white/30'
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
                })}
              </div>
              )}
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
