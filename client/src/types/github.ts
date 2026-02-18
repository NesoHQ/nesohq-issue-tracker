export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  html_url?: string
  type?: string
}

export interface GitHubLabel {
  id: number
  name: string
  color: string
  description: string | null
}

export interface GitHubMilestone {
  id: number
  number: number
  title: string
  state: 'open' | 'closed'
  description: string | null
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  owner: GitHubUser
  private: boolean
  html_url: string
  description: string | null
  has_issues: boolean
}

export interface GitHubIssue {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  user: GitHubUser
  labels: GitHubLabel[]
  assignees: GitHubUser[]
  assignee: GitHubUser | null
  milestone: GitHubMilestone | null
  repository_url?: string
  repo_full_name?: string
  html_url: string
  created_at: string
  updated_at: string
  closed_at: string | null
  pull_request?: { url: string; html_url: string }
}

export interface GitHubLinkedPullRequest {
  id: number
  number: number
  title: string
  html_url: string
  state: 'open' | 'closed'
}

export interface ListIssuesParams {
  state?: 'open' | 'closed' | 'all'
  labels?: string
  sort?: 'created' | 'updated' | 'comments'
  direction?: 'asc' | 'desc'
  since?: string
  per_page?: number
  page?: number
}

export interface UpdateIssueParams {
  title?: string
  body?: string | null
  state?: 'open' | 'closed'
  assignees?: string[]
  labels?: string[]
  milestone?: number | null
}

export interface CreateIssueParams {
  title: string
  body?: string | null
  assignees?: string[]
  labels?: string[]
  milestone?: number | null
}
