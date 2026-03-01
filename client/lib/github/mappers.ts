import type {
  Assignee,
  Issue,
  Label,
  Repository,
  User,
} from '@/lib/types';

export interface GitHubRepositoryPayload {
  id?: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  private: boolean;
  description?: string | null;
}

export interface GitHubUserPayload {
  id?: number | string;
  login: string;
  avatar_url: string;
  name?: string | null;
  email?: string | null;
}

export interface GitHubLabelPayload {
  id: number | string;
  name: string;
  color: string;
  description?: string | null;
}

interface GitHubAssigneePayload {
  id: number | string;
  login: string;
  avatar_url: string;
  name?: string | null;
}

export interface GitHubIssuePayload {
  id: number | string;
  number: number;
  title: string;
  body?: string | null;
  state: 'open' | 'closed';
  pull_request?: {
    url?: string;
    html_url?: string;
  };
  repository?: GitHubRepositoryPayload;
  repository_url?: string;
  labels?: GitHubLabelPayload[];
  assignees?: GitHubAssigneePayload[];
  created_at: string;
  updated_at: string;
  html_url: string;
}

function toRepositoryFromUrl(repositoryUrl?: string): Repository {
  const match = (repositoryUrl ?? '').match(/\/repos\/(.+)$/);
  const fullName = match?.[1] ?? 'unknown/unknown';
  const [rawOwner, rawName] = fullName.split('/', 2);
  const owner = rawOwner || 'unknown';
  const name = rawName || 'unknown';

  return {
    id: fullName,
    name,
    full_name: fullName,
    owner: {
      login: owner,
      avatar_url: `https://github.com/${owner}.png`,
    },
    private: false,
  };
}

function mapGitHubAssignee(assignee: GitHubAssigneePayload): Assignee {
  return {
    id: String(assignee.id),
    login: assignee.login,
    avatar_url: assignee.avatar_url,
    name: assignee.name ?? undefined,
  };
}

export function mapGitHubLabel(label: GitHubLabelPayload): Label {
  return {
    id: String(label.id),
    name: label.name,
    color: label.color,
    description: label.description ?? undefined,
  };
}

export function mapGitHubRepository(repo: GitHubRepositoryPayload): Repository {
  return {
    id: repo.full_name,
    name: repo.name,
    full_name: repo.full_name,
    owner: {
      login: repo.owner.login,
      avatar_url: repo.owner.avatar_url,
    },
    private: repo.private,
    description: repo.description ?? undefined,
  };
}

export function mapGitHubUser(user: GitHubUserPayload): User {
  return {
    id: String(user.id ?? user.login),
    login: user.login,
    name: user.name ?? user.login,
    avatar_url: user.avatar_url,
    email: user.email ?? undefined,
  };
}

export function mapGitHubIssue(
  issue: GitHubIssuePayload,
  repositoryOverride?: Repository
): Issue {
  const repository = repositoryOverride
    ? repositoryOverride
    : issue.repository
      ? mapGitHubRepository(issue.repository)
      : toRepositoryFromUrl(issue.repository_url);

  return {
    id: String(issue.id),
    number: issue.number,
    title: issue.title,
    body: issue.body ?? '',
    state: issue.state,
    repository,
    labels: (issue.labels ?? []).map(mapGitHubLabel),
    assignees: (issue.assignees ?? []).map(mapGitHubAssignee),
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    html_url: issue.html_url,
  };
}
