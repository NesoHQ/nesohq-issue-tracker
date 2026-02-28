'use server';

/**
 * Server Actions for GitHub API interactions
 * Provides server-side data fetching with automatic caching
 */

import { cache } from 'react';
import { getAuthToken } from '@/lib/auth/cookies';
import { API_CONFIG } from '@/lib/constants';
import type { Repository, Issue, Label, PullRequest, User } from '@/lib/types';

const { GITHUB_API, GITHUB_VERSION, DEFAULT_PER_PAGE } = API_CONFIG;

/**
 * GitHub API fetch wrapper with authentication
 */
async function githubFetch(path: string, options?: RequestInit): Promise<Response> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': GITHUB_VERSION,
      ...(options?.headers ?? {}),
    },
    next: {
      revalidate: 60, // Cache for 60 seconds
      tags: ['github'],
    },
  });

  if (response.status === 401) {
    throw new Error('Session expired. Please sign in again.');
  }

  if (!response.ok) {
    let message = `GitHub API error: ${response.status}`;
    try {
      const err = await response.json();
      if (err?.message) message = err.message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  return response;
}

/**
 * Get user's repositories
 * Cached and deduplicated across components
 */
export const getRepositories = cache(async (): Promise<Repository[]> => {
  const response = await githubFetch(
    '/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member'
  );
  
  const data = await response.json();
  
  return data.map((r: any) => ({
    id: r.full_name,
    name: r.name,
    full_name: r.full_name,
    owner: {
      login: r.owner.login,
      avatar_url: r.owner.avatar_url,
    },
    private: r.private,
    description: r.description ?? undefined,
  }));
});

/**
 * Get authenticated GitHub user from access token
 * This is the source of truth for identity in the workspace.
 */
export async function getAuthenticatedUser(): Promise<User> {
  const response = await githubFetch('/user');
  const user = await response.json();

  return {
    id: String(user.id ?? user.login),
    login: user.login,
    name: user.name ?? user.login,
    avatar_url: user.avatar_url,
    email: user.email ?? undefined,
  };
}

/**
 * Get issues for a repository or user
 */
export async function getIssues(
  repoFullName: string | null,
  state: 'open' | 'closed' | 'all' = 'open',
  search = '',
  page = 1,
  perPage = DEFAULT_PER_PAGE
): Promise<{ issues: Issue[]; hasMore: boolean }> {
  let path: string;
  
  if (search.trim()) {
    let q = `is:issue ${search.trim()}`;
    if (repoFullName) q += ` repo:${repoFullName}`;
    if (state !== 'all') q += ` is:${state}`;
    
    path = `/search/issues?q=${encodeURIComponent(q)}&per_page=${perPage}&page=${page}&sort=updated`;
  } else if (repoFullName) {
    path = `/repos/${repoFullName}/issues?state=${state}&per_page=${perPage}&page=${page}&sort=updated`;
  } else {
    path = `/issues?state=${state}&filter=all&per_page=${perPage}&page=${page}&sort=updated`;
  }

  const response = await githubFetch(path);
  const data = await response.json();
  
  const items = Array.isArray(data) ? data : data.items || [];
  
  return {
    issues: items.map(mapIssue),
    hasMore: items.length === perPage,
  };
}

/**
 * Get labels for a repository
 */
export const getLabels = cache(async (repoFullName: string): Promise<Label[]> => {
  const response = await githubFetch(`/repos/${repoFullName}/labels?per_page=100`);
  const data = await response.json();
  
  return data.map((l: any) => ({
    id: String(l.id),
    name: l.name,
    color: l.color,
    description: l.description ?? undefined,
  }));
});

/**
 * Get linked pull requests for an issue
 */
export async function getLinkedPRs(
  repoFullName: string,
  issueNumber: number
): Promise<PullRequest[]> {
  const response = await githubFetch(
    `/repos/${repoFullName}/issues/${issueNumber}/timeline?per_page=100`
  );
  const events = await response.json();

  const prs: PullRequest[] = [];
  const seen = new Set<number>();

  for (const event of events) {
    if (event.event !== 'cross-referenced') continue;
    const source = event.source;
    if (!source || source.type !== 'issue') continue;
    const sourceIssue = source.issue;
    if (!sourceIssue || !sourceIssue.pull_request) continue;

    const prNum = sourceIssue.number;
    if (seen.has(prNum)) continue;
    seen.add(prNum);

    const isMerged = !!sourceIssue.pull_request.merged_at;

    prs.push({
      id: String(sourceIssue.id),
      number: prNum,
      title: sourceIssue.title,
      state: isMerged ? 'merged' : sourceIssue.state,
      html_url: sourceIssue.html_url,
    });
  }

  return prs;
}

/**
 * Helper to map GitHub API issue to our Issue type
 */
function mapIssue(i: any): Issue {
  let repository;
  
  if (i.repository) {
    repository = {
      id: i.repository.full_name,
      name: i.repository.name,
      full_name: i.repository.full_name,
      owner: {
        login: i.repository.owner.login,
        avatar_url: i.repository.owner.avatar_url,
      },
      private: i.repository.private,
    };
  } else {
    const repoUrl = i.repository_url || '';
    const match = repoUrl.match(/\/repos\/(.+)$/);
    const fullName = match ? match[1] : 'unknown/unknown';
    const [owner, name] = fullName.split('/');
    
    repository = {
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

  return {
    id: String(i.id),
    number: i.number,
    title: i.title,
    body: i.body || '',
    state: i.state,
    repository,
    labels: (i.labels || []).map((l: any) => ({
      id: String(l.id),
      name: l.name,
      color: l.color,
      description: l.description ?? undefined,
    })),
    assignees: (i.assignees || []).map((a: any) => ({
      id: String(a.id),
      login: a.login,
      avatar_url: a.avatar_url,
      name: a.name ?? undefined,
    })),
    created_at: i.created_at,
    updated_at: i.updated_at,
    html_url: i.html_url,
    linked_prs: [],
  };
}
