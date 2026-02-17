import { create } from 'zustand'
import type { GitHubRepository } from '../types/github'

interface WorkspaceState {
  selectedRepos: string[]
  availableRepos: GitHubRepository[]
  setAvailableRepos: (repos: GitHubRepository[]) => void
  toggleRepo: (fullName: string) => void
  setSelectedRepos: (fullNames: string[]) => void
  isRepoSelected: (fullName: string) => boolean
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  selectedRepos: [],
  availableRepos: [],

  setAvailableRepos: (repos) =>
    set({
      availableRepos: repos.filter((r) => r.has_issues),
    }),

  toggleRepo: (fullName) =>
    set((state) => {
      const selected = state.selectedRepos.includes(fullName)
        ? state.selectedRepos.filter((r) => r !== fullName)
        : [...state.selectedRepos, fullName]
      return { selectedRepos: selected }
    }),

  setSelectedRepos: (fullNames) => set({ selectedRepos: fullNames }),

  isRepoSelected: (fullName) => get().selectedRepos.includes(fullName),
}))
