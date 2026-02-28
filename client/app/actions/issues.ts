'use server';

/**
 * Server Actions for issue mutations
 * Create, update, and delete operations
 */

import { revalidateTag } from 'next/cache';
import type { Issue, CreateIssueInput, UpdateIssueInput } from '@/lib/types';
import {
  mapGitHubIssue,
  type GitHubIssuePayload,
} from '@/lib/github/mappers';
import { githubWriteJson } from '@/lib/github/server';

/**
 * Create a new issue
 */
export async function createIssue(
  input: CreateIssueInput
): Promise<{ success: boolean; issue?: Issue; error?: string }> {
  try {
    const { repository, title, body, labels } = input;
    
    const data = await githubWriteJson<GitHubIssuePayload>(
      `/repos/${repository.full_name}/issues`,
      {
        method: 'POST',
        body: {
          title,
          body,
          labels: labels.map((l) => l.name),
        },
      }
    );
    
    // Revalidate cache
    revalidateTag('github');
    
    return {
      success: true,
      issue: mapGitHubIssue(data, repository),
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
    const payload: {
      title?: string;
      body?: string;
      state?: 'open' | 'closed';
      labels?: string[];
    } = {};
    
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.body !== undefined) payload.body = updates.body;
    if (updates.state !== undefined) payload.state = updates.state;
    if (updates.labels !== undefined) {
      payload.labels = updates.labels.map((l) => l.name);
    }

    const data = await githubWriteJson<GitHubIssuePayload>(
      `/repos/${full_name}/issues/${issue.number}`,
      {
        method: 'PATCH',
        body: payload,
      }
    );
    
    // Revalidate cache
    revalidateTag('github');
    
    return {
      success: true,
      issue: mapGitHubIssue(data, issue.repository),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update issue',
    };
  }
}
