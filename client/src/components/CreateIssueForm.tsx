import { useState, useEffect, useCallback, useRef } from 'react'
import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { uploadImage } from '../lib/api'
import { useIssuesStore } from '../store/issuesStore'
import { useToast } from '../contexts/ToastContext'
import { createIssue, listRepoLabels } from '../lib/githubClient'

const DRAFT_KEY = 'create-issue-draft'
const TITLE_MAX = 256

interface Draft {
  repo: string
  title: string
  body: string
  labels: string[]
}

function isColorLight(hex: string): boolean {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6
}

export interface CreateIssueFormProps {
  selectedRepos: string[]
  onClose: () => void
  /** Editor min height in px. Editor fills remaining space when used with flex layout. */
  editorMinHeight?: number
  /** Called when draft content changes. Use for Back button discard confirmation. */
  onDraftChange?: (hasContent: boolean) => void
}

export default function CreateIssueForm({
  selectedRepos,
  onClose,
  editorMinHeight = 300,
  onDraftChange,
}: CreateIssueFormProps) {
  const { token } = useAuth()
  const { theme } = useTheme()
  const { addIssue } = useIssuesStore()
  const { addToast } = useToast()
  const [repo, setRepo] = useState(selectedRepos[0] || '')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [labels, setLabels] = useState<string[]>([])
  const [repoLabels, setRepoLabels] = useState<Awaited<ReturnType<typeof listRepoLabels>>>([])
  const [labelsLoading, setLabelsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [labelsExpanded, setLabelsExpanded] = useState(true)
  const [labelFilter, setLabelFilter] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [editorHeight, setEditorHeight] = useState(() =>
    typeof window !== 'undefined' ? Math.min(900, window.innerHeight - 320) : 600
  )

  useEffect(() => {
    const updateHeight = () =>
      setEditorHeight(Math.min(900, window.innerHeight - 320))
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  const initialRepo = selectedRepos[0] || ''
  const hasContent = title.trim().length > 0 || body.trim().length > 0

  useEffect(() => {
    onDraftChange?.(hasContent)
  }, [hasContent, onDraftChange])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const d: Draft = JSON.parse(raw)
        if (selectedRepos.includes(d.repo)) {
          setRepo(d.repo)
          setTitle(d.title)
          setBody(d.body)
          setLabels(d.labels)
          return
        }
      }
    } catch {
      /* ignore */
    }
    setRepo(initialRepo)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!token || !repo) return
    setLabelsLoading(true)
    listRepoLabels(token, repo)
      .then((l) => {
        setRepoLabels(l)
        setLabels((prev) => prev.filter((n) => l.some((x) => x.name === n)))
      })
      .finally(() => setLabelsLoading(false))
  }, [token, repo])

  useEffect(() => {
    const draft: Draft = { repo, title, body, labels }
    if (title || body) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } else {
      localStorage.removeItem(DRAFT_KEY)
    }
  }, [repo, title, body, labels])

  const handleClose = useCallback(() => {
    if (hasContent && !window.confirm('Discard draft? Your content will be lost.')) {
      return
    }
    localStorage.removeItem(DRAFT_KEY)
    onClose()
  }, [hasContent, onClose])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        formRef.current?.requestSubmit()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleClose])

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasContent) e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [hasContent])

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
        title: title.trim().slice(0, TITLE_MAX),
        body: body.trim() || null,
        labels: labels.length ? labels : undefined,
      })
      addIssue(repo, issue)
      localStorage.removeItem(DRAFT_KEY)
      addToast('Issue created', 'success')
      onClose()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to create issue', 'error')
    } finally {
      setSaving(false)
    }
  }

  const filteredLabels = labelFilter.trim()
    ? repoLabels.filter((l) =>
        l.name.toLowerCase().includes(labelFilter.toLowerCase())
      )
    : repoLabels

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col flex-1 min-h-0 overflow-hidden"
    >
      <div className="p-5 pb-2 flex flex-col gap-4 overflow-y-auto flex-1 min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-6 flex-1 min-h-0">
          <div className="flex flex-col gap-5 min-h-0">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
                  placeholder="Add a clear, descriptive title..."
                  required
                  autoFocus
                  maxLength={TITLE_MAX}
                  aria-describedby="title-count"
                  className={`w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-base text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/40 transition-all ${
                  title.length > TITLE_MAX * 0.8 ? 'pr-16' : ''
                }`}
                />
                {title.length > TITLE_MAX * 0.8 && (
                  <span
                    id="title-count"
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums ${
                      title.length >= TITLE_MAX ? 'text-red-500' : 'text-gray-400 dark:text-white/40'
                    }`}
                  >
                    {title.length}/{TITLE_MAX}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0" style={{ minHeight: editorMinHeight }}>
              <div className="flex items-center justify-between mb-2 shrink-0">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">
                  Description <span className="text-white/40 font-normal normal-case">(optional)</span>
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
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  <span aria-hidden>📷</span>
                  Add image
                </button>
              </div>
              <div
                data-color-mode={theme}
                className="flex-1 min-h-0 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 [&_.w-md-editor]:bg-gray-50 [&_.w-md-editor]:dark:bg-white/5 [&_.w-md-editor]:border-0 [&_.w-md-editor-toolbar]:bg-gray-100 [&_.w-md-editor-toolbar]:dark:bg-white/5 [&_.w-md-editor-toolbar]:border-b [&_.w-md-editor-toolbar]:border-gray-200 [&_.w-md-editor-toolbar]:dark:border-white/10 [&_.w-md-editor-content]:bg-transparent [&_.w-md-editor-text-pre]:text-inherit [&_.w-md-editor-text-input]:text-inherit [&_.w-md-editor-text-input]:placeholder-gray-400 [&_.w-md-editor-text-input]:dark:placeholder-white/30 [&_.w-md-editor-preview]:bg-gray-100 [&_.w-md-editor-preview]:dark:bg-white/5 [&_.w-md-editor-preview]:border-gray-200 [&_.w-md-editor-preview]:dark:border-white/10"
              >
                <MDEditor
                  value={body}
                  onChange={(v) => setBody(v ?? '')}
                  height={Math.max(editorMinHeight, editorHeight)}
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
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50 mb-2">
                Repository
              </label>
              <select
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/40 transition-all"
              >
                {selectedRepos.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {(repoLabels.length > 0 || labelsLoading) && (
              <div>
                <button
                  type="button"
                  onClick={() => setLabelsExpanded((v) => !v)}
                  className="flex items-center gap-2 w-full text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50 mb-2 hover:text-gray-700 dark:hover:text-white/70 transition-colors"
                >
                  <span
                    className={`transition-transform ${labelsExpanded ? 'rotate-90' : ''}`}
                    aria-hidden
                  >
                    ›
                  </span>
                  Labels
                  {labelsLoading && (
                    <span className="text-gray-400 dark:text-white/40 font-normal normal-case">(loading…)</span>
                  )}
                  {!labelsLoading && labels.length > 0 && (
                    <span className="text-gray-400 dark:text-white/40 font-normal normal-case">({labels.length})</span>
                  )}
                </button>
                {labelsExpanded && (
                  <>
                    {repoLabels.length > 0 && (
                      <input
                        type="search"
                        placeholder="Filter labels…"
                        value={labelFilter}
                        onChange={(e) => setLabelFilter(e.target.value)}
                        className="w-full mb-2 px-2.5 py-1.5 rounded-md text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                      />
                    )}
                    <div className="flex flex-wrap gap-2 max-h-[180px] overflow-y-auto">
                      {labelsLoading ? (
                        <div className="flex flex-wrap gap-2">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span
                              key={i}
                              className="h-6 w-16 rounded-md bg-white/10 animate-pulse"
                              aria-hidden
                            />
                          ))}
                        </div>
                      ) : filteredLabels.length === 0 ? (
                        <p className="text-xs text-gray-500 dark:text-white/40 py-2">
                          {labelFilter ? 'No labels match' : 'No labels'}
                        </p>
                      ) : (
                        filteredLabels.map((l) => {
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
                              ? 'border-gray-800 dark:border-white/80 ring-2 ring-gray-400 dark:ring-white/20'
                              : 'border-transparent hover:border-gray-500 dark:hover:border-white/40'
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
                    })
                    )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 px-5 py-3 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/10 shrink-0">
        <span className="text-xs text-gray-500 dark:text-white/40 hidden sm:inline">
          Ctrl+Enter to submit · Esc to cancel
        </span>
        <div className="flex gap-3 ml-auto">
        <button
          type="button"
          className="px-4 py-2.5 rounded-lg text-gray-700 dark:text-white/90 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors font-medium"
          onClick={handleClose}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="px-5 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-white shadow-lg shadow-blue-500/20"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating...
            </span>
          ) : (
            'Create issue'
          )}
        </button>
        </div>
      </div>
    </form>
  )
}
