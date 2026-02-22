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

export interface User {
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
  assignees: User[];
  created_at: string;
  updated_at: string;
  linked_prs?: PullRequest[];
  html_url: string;
}

export interface IssueFilters {
  state?: 'open' | 'closed' | 'all';
  search?: string;
  labels?: string[];
  assignees?: string[];
  repositories?: string[];
}
