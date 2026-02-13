import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspaceStore } from '../store/workspaceStore'
import CreateIssueForm from '../components/CreateIssueForm'

export default function CreateIssuePage() {
  const navigate = useNavigate()
  const { selectedRepos } = useWorkspaceStore()
  const [hasDraft, setHasDraft] = useState(false)

  useEffect(() => {
    if (selectedRepos.length === 0) {
      navigate('/', { replace: true })
    }
  }, [selectedRepos.length, navigate])

  const handleBack = useCallback(() => {
    if (hasDraft && !window.confirm('Discard draft? Your content will be lost.')) {
      return
    }
    navigate('/')
  }, [hasDraft, navigate])

  if (selectedRepos.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-sm"
            aria-label="Back to issues"
          >
            <span aria-hidden>←</span>
            Back
          </button>
          <h1 className="m-0 text-lg font-semibold text-gray-900 dark:text-white/95">Create new issue</h1>
        </div>
      </div>
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 min-w-0 flex flex-col min-h-0 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/15 overflow-hidden">
          <CreateIssueForm
            selectedRepos={selectedRepos}
            onClose={() => navigate('/')}
            onDraftChange={setHasDraft}
            editorMinHeight={400}
          />
        </div>
      </div>
    </div>
  )
}
