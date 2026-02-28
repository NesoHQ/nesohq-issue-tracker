/**
 * Shared TypeScript types for the application
 * Centralized type definitions for better maintainability
 */

export interface User {
  id: string;
  login: string;
  name: string;
  avatar_url: string;
  email?: string;
}

export interface Repository {
  id: string;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  private: boolean;
  description?: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface Assignee {
  id: string;
  login: string;
  avatar_url: string;
  name?: string;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  html_url: string;
}

export interface Issue {
  id: string;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  repository: Repository;
  labels: Label[];
  assignees: Assignee[];
  created_at: string;
  updated_at: string;
  html_url: string;
  linked_prs?: PullRequest[];
}

export interface IssueFilters {
  state: 'all' | 'open' | 'closed';
  search: string;
  repositories: string[];
  labels: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  page: number;
}

// API Response types
export interface AuthConfigResponse {
  client_id: string;
  redirect_uri?: string | null;
}

export interface AuthExchangeResponse {
  access_token: string;
  user: {
    login: string;
    avatar_url: string;
    name: string;
  };
}

// Form types
export interface CreateIssueInput {
  title: string;
  body: string;
  repository: Repository;
  labels: Label[];
}

export interface UpdateIssueInput {
  title?: string;
  body?: string;
  state?: 'open' | 'closed';
  labels?: Label[];
}
