'use server';

/**
 * Server Actions for GitHub API interactions
 * Provides server-side data fetching with automatic caching
 */

import { cache } from 'react';
import { API_CONFIG } from '@/lib/constants';
import type { Repository, Issue, Label, PullRequest, User } from '@/lib/types';
import {
  mapGitHubIssue,
  mapGitHubLabel,
  mapGitHubRepository,
  mapGitHubUser,
  type GitHubIssuePayload,
  type GitHubLabelPayload,
  type GitHubRepositoryPayload,
  type GitHubUserPayload,
} from '@/lib/github/mappers';
import { githubReadJson } from '@/lib/github/server';

const { DEFAULT_PER_PAGE } = API_CONFIG;

/**
 * Get user's repositories
 * Cached and deduplicated across components
 */
export const getRepositories = cache(async (): Promise<Repository[]> => {
  const data = await githubReadJson<GitHubRepositoryPayload[]>(
    '/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member'
  );

  return data.map(mapGitHubRepository);
});

/**
 * Get authenticated GitHub user from access token
 * This is the source of truth for identity in the workspace.
 */
export async function getAuthenticatedUser(): Promise<User> {
  const user = await githubReadJson<GitHubUserPayload>('/user');
  return mapGitHubUser(user);
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
  interface GitHubSearchIssuesPayload {
    items?: GitHubIssuePayload[];
  }

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

  const data = await githubReadJson<GitHubIssuePayload[] | GitHubSearchIssuesPayload>(path);

  const items = Array.isArray(data) ? data : data.items ?? [];
  
  return {
    issues: items.map((item) => mapGitHubIssue(item)),
    hasMore: items.length === perPage,
  };
}

/**
 * Get labels for a repository
 */
export const getLabels = cache(async (repoFullName: string): Promise<Label[]> => {
  const data = await githubReadJson<GitHubLabelPayload[]>(`/repos/${repoFullName}/labels?per_page=100`);

  return data.map(mapGitHubLabel);
});

/**
 * Get linked pull requests for an issue
 */
export async function getLinkedPRs(
  repoFullName: string,
  issueNumber: number
): Promise<PullRequest[]> {
  interface GitHubIssueTimelineEvent {
    event?: string;
    source?: {
      type?: string;
      issue?: {
        id: number | string;
        number: number;
        title: string;
        state: 'open' | 'closed';
        html_url: string;
        pull_request?: {
          merged_at?: string | null;
        };
      };
    };
  }

  const events = await githubReadJson<GitHubIssueTimelineEvent[]>(
    `/repos/${repoFullName}/issues/${issueNumber}/timeline?per_page=100`
  );

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
