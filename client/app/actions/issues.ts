'use server';

/**
 * Server Actions for issue mutations
 * Create, update, and delete operations
 */

import { revalidateTag } from 'next/cache';
import { getAuthToken } from '@/lib/auth/cookies';
import { API_CONFIG } from '@/lib/constants';
import type { Issue, Label, CreateIssueInput, UpdateIssueInput } from '@/lib/types';

const { GITHUB_API, GITHUB_VERSION } = API_CONFIG;

/**
 * GitHub API fetch wrapper for mutations
 */
async function githubMutate(
  path: string,
  options: RequestInit
): Promise<Response> {
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
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `GitHub API error: ${response.status}`;
    try {
      const err = await response.json();
      if (err?.message) message = err.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response;
}

/**
 * Create a new issue
 */
export async function createIssue(
  input: CreateIssueInput
): Promise<{ success: boolean; issue?: Issue; error?: string }> {
  try {
    const { repository, title, body, labels } = input;
    
    const response = await githubMutate(
      `/repos/${repository.full_name}/issues`,
      {
        method: 'POST',
        body: JSON.stringify({
          title,
          body,
          labels: labels.map((l) => l.name),
        }),
      }
    );

    const data = await response.json();
    
    // Revalidate cache
    revalidateTag('github');
    
    return {
      success: true,
      issue: mapIssue(data, repository),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create issue',
    };
  }
}

/**
 * Update an existing issue
 */
export async function updateIssue(
  issue: Issue,
  updates: UpdateIssueInput
): Promise<{ success: boolean; issue?: Issue; error?: string }> {
  try {
    const { full_name } = issue.repository;
    const payload: any = {};
    
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.body !== undefined) payload.body = updates.body;
    if (updates.state !== undefined) payload.state = updates.state;
    if (updates.labels !== undefined) {
      payload.labels = updates.labels.map((l) => l.name);
    }

    const response = await githubMutate(
      `/repos/${full_name}/issues/${issue.number}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    
    // Revalidate cache
    revalidateTag('github');
    
    return {
      success: true,
      issue: mapIssue(data, issue.repository),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update issue',
    };
  }
}

/**
 * Helper to map GitHub API response to Issue type
 */
function mapIssue(data: any, repository: any): Issue {
  return {
    id: String(data.id),
    number: data.number,
    title: data.title,
    body: data.body || '',
    state: data.state,
    repository,
    labels: (data.labels || []).map((l: any) => ({
      id: String(l.id),
      name: l.name,
      color: l.color,
      description: l.description ?? undefined,
    })),
    assignees: (data.assignees || []).map((a: any) => ({
      id: String(a.id),
      login: a.login,
      avatar_url: a.avatar_url,
      name: a.name ?? undefined,
    })),
    created_at: data.created_at,
    updated_at: data.updated_at,
    html_url: data.html_url,
    linked_prs: [],
  };
}
