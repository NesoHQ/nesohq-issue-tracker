import { create } from 'zustand'
import type { GitHubIssue } from '../types/github'

interface IssuesState {
  issues: GitHubIssue[]
  issuesByRepo: Record<string, GitHubIssue[]>
  loading: boolean
  error: string | null
  hasMore: Record<string, boolean>
  pageByRepo: Record<string, number>

  setIssues: (repo: string, issues: GitHubIssue[], append?: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setHasMore: (repo: string, hasMore: boolean) => void
  setPage: (repo: string, page: number) => void
  updateIssueLocally: (repo: string, issueNumber: number, updates: Partial<GitHubIssue>) => void
  removeIssueLocally: (repo: string, issueNumber: number) => void
  addIssue: (repo: string, issue: GitHubIssue) => void
  clearIssues: () => void

  getFilteredIssues: (repos: string[], filters: IssueFilters) => GitHubIssue[]
}

export interface IssueFilters {
  state: 'open' | 'closed' | 'all'
  search: string
  labelFilter: string | null
  assigneeFilter: string | null
}

export const useIssuesStore = create<IssuesState>((set, get) => ({
  issues: [],
  issuesByRepo: {},
  loading: false,
  error: null,
  hasMore: {},
  pageByRepo: {},

  setIssues: (repo, issues, append) =>
    set((state) => {
      const existing = state.issuesByRepo[repo] || []
      const next = append ? [...existing, ...issues] : issues
      const byRepo = { ...state.issuesByRepo, [repo]: next }
      const all = Object.values(byRepo).flat()
      return {
        issuesByRepo: byRepo,
        issues: all,
      }
    }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  setHasMore: (repo, hasMore) =>
    set((state) => ({
      hasMore: { ...state.hasMore, [repo]: hasMore },
    })),

  setPage: (repo, page) =>
    set((state) => ({
      pageByRepo: { ...state.pageByRepo, [repo]: page },
    })),

  updateIssueLocally: (repo, issueNumber, updates) =>
    set((state) => {
      const repoIssues = state.issuesByRepo[repo] || []
      const idx = repoIssues.findIndex((i) => i.number === issueNumber)
      if (idx < 0) return state
      const updated = [...repoIssues]
      updated[idx] = { ...updated[idx], ...updates }
      const byRepo = { ...state.issuesByRepo, [repo]: updated }
      const all = Object.values(byRepo).flat()
      return { issuesByRepo: byRepo, issues: all }
    }),

  removeIssueLocally: (repo, issueNumber) =>
    set((state) => {
      const repoIssues = state.issuesByRepo[repo] || []
      const nextRepoIssues = repoIssues.filter((i) => i.number !== issueNumber)
      if (nextRepoIssues.length === repoIssues.length) return state
      const byRepo = { ...state.issuesByRepo, [repo]: nextRepoIssues }
      const all = Object.values(byRepo).flat()
      return { issuesByRepo: byRepo, issues: all }
    }),

  addIssue: (repo, issue) =>
    set((state) => {
      const withRepo = { ...issue, repo_full_name: repo }
      const repoIssues = [withRepo, ...(state.issuesByRepo[repo] || [])]
      const byRepo = { ...state.issuesByRepo, [repo]: repoIssues }
      const all = Object.values(byRepo).flat()
      return { issuesByRepo: byRepo, issues: all }
    }),

  clearIssues: () =>
    set({
      issues: [],
      issuesByRepo: {},
      hasMore: {},
      pageByRepo: {},
    }),

  getFilteredIssues: (repos, filters) => {
    const { issuesByRepo } = get()
    const issues = repos.flatMap((r) => issuesByRepo[r] || [])
    let filtered = issues

    if (filters.state !== 'all') {
      filtered = filtered.filter((i) => i.state === filters.state)
    }
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.body && i.body.toLowerCase().includes(q))
      )
    }
    if (filters.labelFilter) {
      filtered = filtered.filter((i) =>
        i.labels.some((l) => l.name === filters.labelFilter)
      )
    }
    if (filters.assigneeFilter) {
      filtered = filtered.filter((i) =>
        i.assignees.some((a) => a.login === filters.assigneeFilter)
      )
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
  },
}))
