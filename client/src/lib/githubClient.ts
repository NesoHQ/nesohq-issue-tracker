import type {
  GitHubRepository,
  GitHubIssue,
  GitHubLabel,
  GitHubUser,
  GitHubMilestone,
  GitHubLinkedPullRequest,
  ListIssuesParams,
  UpdateIssueParams,
  CreateIssueParams,
} from '../types/github'

const GITHUB_API = 'https://api.github.com'

export class GitHubApiError extends Error {
  status: number
  response?: unknown
  constructor(message: string, status: number, response?: unknown) {
    super(message)
    this.name = 'GitHubApiError'
    this.status = status
    this.response = response
  }
}

async function request<T>(
  url: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    let body: unknown
    try {
      body = await res.json()
    } catch {
      body = await res.text()
    }
    throw new GitHubApiError(
      (body as { message?: string })?.message || res.statusText,
      res.status,
      body
    )
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

function parseRepoFullName(repo: string): [owner: string, repoName: string] {
  const [owner, repoName] = repo.split('/')
  if (!owner || !repoName) throw new Error(`Invalid repo: ${repo}`)
  return [owner, repoName]
}

interface IssueTimelineSourceIssue {
  id?: number
  number?: number
  title?: string
  html_url?: string
  state?: 'open' | 'closed'
  pull_request?: { url?: string; html_url?: string }
}

interface GitHubIssueTimelineEvent {
  event?: string
  source?: {
    issue?: IssueTimelineSourceIssue
  }
}

export async function listUserRepos(
  token: string,
  params?: { per_page?: number; page?: number; sort?: string }
): Promise<GitHubRepository[]> {
  const qs = new URLSearchParams()
  if (params?.per_page) qs.set('per_page', String(params.per_page))
  if (params?.page) qs.set('page', String(params.page))
  if (params?.sort) qs.set('sort', params.sort)
  const url = `${GITHUB_API}/user/repos?${qs}`
  return request<GitHubRepository[]>(url, token)
}

export async function listRepoIssues(
  token: string,
  repoFullName: string,
  params?: ListIssuesParams
): Promise<{ issues: GitHubIssue[]; hasMore: boolean }> {
  const [owner, repo] = parseRepoFullName(repoFullName)
  const qs = new URLSearchParams()
  qs.set('state', params?.state ?? 'all')
  qs.set('per_page', String(params?.per_page ?? 50))
  if (params?.page) qs.set('page', String(params.page))
  if (params?.labels) qs.set('labels', params.labels)
  if (params?.sort) qs.set('sort', params.sort)
  if (params?.direction) qs.set('direction', params.direction)
  if (params?.since) qs.set('since', params.since)

  const url = `${GITHUB_API}/repos/${owner}/${repo}/issues?${qs}`
  const issues = await request<GitHubIssue[]>(url, token)

  const issuesOnly = issues.filter((i) => !i.pull_request)
  const hasMore = issues.length === (params?.per_page ?? 50)

  return {
    issues: issuesOnly.map((i) => ({
      ...i,
      repo_full_name: repoFullName,
    })),
    hasMore,
  }
}

export async function getIssue(
  token: string,
  repoFullName: string,
  issueNumber: number
): Promise<GitHubIssue> {
  const [owner, repo] = parseRepoFullName(repoFullName)
  const url = `${GITHUB_API}/repos/${owner}/${repo}/issues/${issueNumber}`
  return request<GitHubIssue>(url, token)
}

export async function updateIssue(
  token: string,
  repoFullName: string,
  issueNumber: number,
  params: UpdateIssueParams
): Promise<GitHubIssue> {
  const [owner, repo] = parseRepoFullName(repoFullName)
  const url = `${GITHUB_API}/repos/${owner}/${repo}/issues/${issueNumber}`
  return request<GitHubIssue>(url, token, {
    method: 'PATCH',
    body: JSON.stringify(params),
  })
}

export async function deleteIssue(
  token: string,
  repoFullName: string,
  issueNumber: number
): Promise<void> {
  const [owner, repo] = parseRepoFullName(repoFullName)
  const url = `${GITHUB_API}/repos/${owner}/${repo}/issues/${issueNumber}`
  return request<void>(url, token, {
    method: 'DELETE',
  })
}

export async function createIssue(
  token: string,
  repoFullName: string,
  params: CreateIssueParams
): Promise<GitHubIssue> {
  const [owner, repo] = parseRepoFullName(repoFullName)
  const url = `${GITHUB_API}/repos/${owner}/${repo}/issues`
  return request<GitHubIssue>(url, token, {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export async function listRepoLabels(
  token: string,
  repoFullName: string
): Promise<GitHubLabel[]> {
  const [owner, repo] = parseRepoFullName(repoFullName)
  const url = `${GITHUB_API}/repos/${owner}/${repo}/labels?per_page=100`
  return request<GitHubLabel[]>(url, token)
}

export async function listRepoCollaborators(
  token: string,
  repoFullName: string
): Promise<GitHubUser[]> {
  const [owner, repo] = parseRepoFullName(repoFullName)
  const url = `${GITHUB_API}/repos/${owner}/${repo}/collaborators?per_page=100`
  return request<GitHubUser[]>(url, token)
}

export async function listRepoMilestones(
  token: string,
  repoFullName: string,
  state: 'open' | 'closed' | 'all' = 'open'
): Promise<GitHubMilestone[]> {
  const [owner, repo] = parseRepoFullName(repoFullName)
  const url = `${GITHUB_API}/repos/${owner}/${repo}/milestones?state=${state}&per_page=100`
  return request<GitHubMilestone[]>(url, token)
}

export async function listIssueLinkedPullRequests(
  token: string,
  repoFullName: string,
  issueNumber: number
): Promise<GitHubLinkedPullRequest[]> {
  const [owner, repo] = parseRepoFullName(repoFullName)
  const url = `${GITHUB_API}/repos/${owner}/${repo}/issues/${issueNumber}/timeline?per_page=100`
  const events = await request<GitHubIssueTimelineEvent[]>(url, token)

  const byId = new Map<number, GitHubLinkedPullRequest>()
  for (const event of events) {
    if (event.event !== 'cross-referenced') continue
    const sourceIssue = event.source?.issue
    if (!sourceIssue?.pull_request) continue
    if (
      typeof sourceIssue.id !== 'number' ||
      typeof sourceIssue.number !== 'number' ||
      typeof sourceIssue.title !== 'string' ||
      typeof sourceIssue.html_url !== 'string'
    ) {
      continue
    }
    byId.set(sourceIssue.id, {
      id: sourceIssue.id,
      number: sourceIssue.number,
      title: sourceIssue.title,
      html_url: sourceIssue.html_url,
      state: sourceIssue.state === 'closed' ? 'closed' : 'open',
    })
  }

  return Array.from(byId.values())
}
