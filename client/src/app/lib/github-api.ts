import { authService } from './auth';
import { Repository, Issue, Label } from './types';

const GITHUB_API = 'https://api.github.com';

async function ghFetch(path: string, options?: RequestInit): Promise<Response> {
  const token = authService.getAccessToken();
  return fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options?.headers ?? {}),
    },
  });
}

async function ghJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await ghFetch(path, options);

  if (res.status === 401) {
    authService.signOut();
    window.location.href = '/';
    throw new Error('Session expired. Please sign in again.');
  }

  if (!res.ok) {
    let message = `GitHub API error: ${res.status}`;
    try {
      const err = await res.json();
      if (err?.message) message = err.message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

function repoFromFullName(fullName: string): Repository {
  const [owner, name] = fullName.split('/');
  return {
    id: fullName,
    name,
    full_name: fullName,
    owner: { login: owner, avatar_url: `https://github.com/${owner}.png` },
    private: false,
  };
}

function mapRepository(r: Record<string, unknown>): Repository {
  const owner = r.owner as { login: string; avatar_url: string };
  return {
    id: r.full_name as string,
    name: r.name as string,
    full_name: r.full_name as string,
    owner: { login: owner.login, avatar_url: owner.avatar_url },
    private: r.private as boolean,
    description: (r.description as string | null) ?? undefined,
  };
}

function mapLabel(l: Record<string, unknown>): Label {
  return {
    id: String(l.id),
    name: l.name as string,
    color: l.color as string,
    description: (l.description as string | null) ?? undefined,
  };
}

function mapIssue(i: Record<string, unknown>, repo?: Repository): Issue {
  let repository = repo;

  if (!repository) {
    const repoUrl = (i.repository_url as string) || '';
    const match = repoUrl.match(/\/repos\/(.+)$/);
    if (match) {
      repository = repoFromFullName(match[1]);
    }
  }

  if (!repository) {
    repository = repoFromFullName('unknown/unknown');
  }

  const rawAssignees = (i.assignees as Record<string, unknown>[]) ?? [];
  const rawLabels = (i.labels as Record<string, unknown>[]) ?? [];

  return {
    id: String(i.id),
    number: i.number as number,
    title: i.title as string,
    body: (i.body as string) || '',
    state: i.state as 'open' | 'closed',
    repository,
    labels: rawLabels.map(mapLabel),
    assignees: rawAssignees.map((a) => ({
      id: String(a.id),
      login: a.login as string,
      avatar_url: a.avatar_url as string,
      name: (a.name as string | null) ?? undefined,
    })),
    created_at: i.created_at as string,
    updated_at: i.updated_at as string,
    html_url: i.html_url as string,
    linked_prs: [],
  };
}

export const githubApi = {
  async getRepositories(): Promise<Repository[]> {
    const data = await ghJson<Record<string, unknown>[]>(
      '/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member'
    );
    return data.map(mapRepository);
  },

  async getIssues(
    repoFullName: string | null,
    state: 'open' | 'closed' | 'all' = 'open',
    search = '',
    page = 1,
    perPage = 30
  ): Promise<{ issues: Issue[]; hasMore: boolean }> {
    if (search.trim()) {
      let q = `is:issue ${search.trim()}`;
      if (repoFullName) q += ` repo:${repoFullName}`;
      if (state !== 'all') q += ` is:${state}`;

      const result = await ghJson<{ items: Record<string, unknown>[]; total_count: number }>(
        `/search/issues?q=${encodeURIComponent(q)}&per_page=${perPage}&page=${page}&sort=updated`
      );
      return {
        issues: result.items.map((i) => mapIssue(i)),
        hasMore: result.total_count > page * perPage,
      };
    }

    if (repoFullName) {
      const repo = repoFromFullName(repoFullName);
      const data = await ghJson<Record<string, unknown>[]>(
        `/repos/${repoFullName}/issues?state=${state}&per_page=${perPage}&page=${page}&sort=updated`
      );
      return {
        issues: data.map((i) => mapIssue(i, repo)),
        hasMore: data.length === perPage,
      };
    }

    // No repo selected — user's issues across all repos
    const data = await ghJson<Record<string, unknown>[]>(
      `/issues?state=${state}&filter=all&per_page=${perPage}&page=${page}&sort=updated`
    );
    return {
      issues: data.map((i) => mapIssue(i)),
      hasMore: data.length === perPage,
    };
  },

  async updateIssue(
    issue: Issue,
    updates: { title?: string; body?: string; state?: 'open' | 'closed'; labels?: Label[] }
  ): Promise<Issue> {
    const { full_name } = issue.repository;
    const payload: Record<string, unknown> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.body !== undefined) payload.body = updates.body;
    if (updates.state !== undefined) payload.state = updates.state;
    if (updates.labels !== undefined) payload.labels = updates.labels.map((l) => l.name);

    const data = await ghJson<Record<string, unknown>>(
      `/repos/${full_name}/issues/${issue.number}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    return mapIssue(data, issue.repository);
  },

  async createIssue(data: {
    title: string;
    body: string;
    repository: Repository;
    labels: Label[];
  }): Promise<Issue> {
    const { full_name } = data.repository;
    const result = await ghJson<Record<string, unknown>>(
      `/repos/${full_name}/issues`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          body: data.body,
          labels: data.labels.map((l) => l.name),
        }),
      }
    );
    return mapIssue(result, data.repository);
  },

  async getLabels(repoFullName: string): Promise<Label[]> {
    const data = await ghJson<Record<string, unknown>[]>(
      `/repos/${repoFullName}/labels?per_page=100`
    );
    return data.map(mapLabel);
  },

  async getLinkedPRs(repoFullName: string, issueNumber: number): Promise<import('./types').PullRequest[]> {
    const events = await ghJson<Record<string, unknown>[]>(
      `/repos/${repoFullName}/issues/${issueNumber}/timeline?per_page=100`
    );

    const prs: import('./types').PullRequest[] = [];
    const seen = new Set<number>();

    for (const event of events) {
      if (event.event !== 'cross-referenced') continue;
      const source = event.source as Record<string, unknown> | undefined;
      if (!source || source.type !== 'issue') continue;
      const sourceIssue = source.issue as Record<string, unknown> | undefined;
      if (!sourceIssue || !sourceIssue.pull_request) continue;

      const prNum = sourceIssue.number as number;
      if (seen.has(prNum)) continue;
      seen.add(prNum);

      const rawPr = sourceIssue.pull_request as Record<string, unknown>;
      const isMerged = !!rawPr.merged_at;

      prs.push({
        id: String(sourceIssue.id),
        number: prNum,
        title: sourceIssue.title as string,
        state: isMerged ? 'merged' : (sourceIssue.state as 'open' | 'closed'),
        html_url: sourceIssue.html_url as string,
      });
    }

    return prs;
  },
};
