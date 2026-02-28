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
import { githubJson, githubReadJson } from '@/lib/github/server';

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
 * Fetch linked pull requests for many issues in one GraphQL request.
 * This removes N+1 timeline requests in the issue list.
 */
export async function getLinkedPRsForIssues(
  repoFullName: string,
  issueNumbers: number[]
): Promise<Record<number, PullRequest[]>> {
  interface GraphQLLinkedPullRequest {
    __typename: 'PullRequest';
    id: string;
    number: number;
    title: string;
    url: string;
    state: 'OPEN' | 'CLOSED' | 'MERGED';
    mergedAt?: string | null;
  }

  interface GraphQLCrossReferencedNode {
    source?: GraphQLLinkedPullRequest | { __typename: string } | null;
  }

  interface GraphQLIssueNode {
    number: number;
    timelineItems?: {
      nodes?: Array<GraphQLCrossReferencedNode | null>;
    };
  }

  interface GraphQLLinkedPrsResponse {
    data?: {
      repository?: Record<string, GraphQLIssueNode | null> | null;
    };
    errors?: Array<{ message?: string }>;
  }

  const isPullRequestSource = (
    source: GraphQLCrossReferencedNode['source']
  ): source is GraphQLLinkedPullRequest => {
    return source?.__typename === 'PullRequest';
  };

  const uniqueIssueNumbers = [...new Set(issueNumbers)]
    .filter((n) => Number.isInteger(n) && n > 0);
  const fallback = Object.fromEntries(
    uniqueIssueNumbers.map((issueNumber) => [issueNumber, [] as PullRequest[]])
  );
  if (uniqueIssueNumbers.length === 0) return fallback;

  const [owner, name] = repoFullName.split('/', 2);
  if (!owner || !name) return fallback;

  const aliases = uniqueIssueNumbers.map((_, index) => `issue_${index}`);
  const issueSelections = uniqueIssueNumbers
    .map((issueNumber, index) => `
      ${aliases[index]}: issue(number: ${issueNumber}) {
        number
        timelineItems(first: 100, itemTypes: [CROSS_REFERENCED_EVENT]) {
          nodes {
            ... on CrossReferencedEvent {
              source {
                __typename
                ... on PullRequest {
                  id
                  number
                  title
                  url
                  state
                  mergedAt
                }
              }
            }
          }
        }
      }
    `)
    .join('\n');

  const query = `
    query LinkedPullRequests($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        ${issueSelections}
      }
    }
  `;

  const payload = await githubJson<GraphQLLinkedPrsResponse>('/graphql', {
    method: 'POST',
    body: {
      query,
      variables: { owner, name },
    },
    cacheMode: 'read',
    revalidate: 60,
    tags: ['github'],
  });

  if (payload.errors?.length) {
    const message = payload.errors
      .map((err) => err.message)
      .filter(Boolean)
      .join('; ') || 'Failed to fetch linked pull requests';
    throw new Error(message);
  }

  const repositoryNode = payload.data?.repository;
  if (!repositoryNode) return fallback;

  const result: Record<number, PullRequest[]> = { ...fallback };
  aliases.forEach((alias, index) => {
    const issueNumber = uniqueIssueNumbers[index];
    if (!issueNumber) return;

    const issueNode = repositoryNode[alias];
    if (!issueNode) return;

    const prs: PullRequest[] = [];
    const seen = new Set<number>();
    const nodes = issueNode.timelineItems?.nodes ?? [];

    nodes.forEach((node) => {
      const source = node?.source;
      if (!isPullRequestSource(source)) return;

      const prNumber = source.number;
      if (seen.has(prNumber)) return;
      seen.add(prNumber);

      const prState: PullRequest['state'] =
        source.mergedAt || source.state === 'MERGED'
          ? 'merged'
          : source.state === 'OPEN'
            ? 'open'
            : 'closed';

      prs.push({
        id: String(source.id),
        number: prNumber,
        title: source.title,
        state: prState,
        html_url: source.url,
      });
    });

    result[issueNumber] = prs;
  });

  return result;
}

/**
 * Get linked pull requests for a single issue.
 */
export async function getLinkedPRs(
  repoFullName: string,
  issueNumber: number
): Promise<PullRequest[]> {
  const result = await getLinkedPRsForIssues(repoFullName, [issueNumber]);
  return result[issueNumber] ?? [];
}
