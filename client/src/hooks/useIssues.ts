import { useEffect, useCallback, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  listRepoIssues,
  listRepoLabels,
  listRepoCollaborators,
} from '../lib/githubClient'
import { useIssuesStore } from '../store/issuesStore'

export function useIssues(selectedRepos: string[]) {
  const { token } = useAuth()
  const {
    setIssues,
    setLoading,
    setError,
    setHasMore,
    setPage,
    pageByRepo,
  } = useIssuesStore()

  const loadIssues = useCallback(
    async (append = false) => {
      if (!token || selectedRepos.length === 0) return
      setLoading(true)
      setError(null)

      try {
        await Promise.all(
          selectedRepos.map(async (repo) => {
            const page = append ? (pageByRepo[repo] || 1) : 1
            const { issues, hasMore: more } = await listRepoIssues(token, repo, {
              state: 'all',
              per_page: 50,
              page,
              sort: 'updated',
              direction: 'desc',
            })
            setIssues(repo, issues, append)
            setHasMore(repo, more)
            setPage(repo, page)
          })
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load issues')
      } finally {
        setLoading(false)
      }
    },
    [
      token,
      selectedRepos,
      pageByRepo,
      setIssues,
      setLoading,
      setError,
      setHasMore,
      setPage,
    ]
  )

  useEffect(() => {
    loadIssues(false)
  }, [token, selectedRepos.join(',')])

  const loadMore = useCallback(() => {
    selectedRepos.forEach((repo) => {
      const nextPage = (pageByRepo[repo] || 1) + 1
      setPage(repo, nextPage)
    })
    loadIssues(true)
  }, [selectedRepos, pageByRepo, setPage, loadIssues])

  return { loadIssues, loadMore }
}

export function useRepoMetadata(repo: string | null) {
  const { token } = useAuth()
  const [labels, setLabels] = useState<Awaited<ReturnType<typeof listRepoLabels>>>([])
  const [collaborators, setCollaborators] = useState<Awaited<ReturnType<typeof listRepoCollaborators>>>([])

  useEffect(() => {
    if (!token || !repo) return
    Promise.all([
      listRepoLabels(token, repo),
      listRepoCollaborators(token, repo),
    ]).then(([l, c]) => {
      setLabels(l)
      setCollaborators(c)
    })
  }, [token, repo])

  return { labels, collaborators }
}
