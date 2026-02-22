import { Repository, Issue, Label } from './types';

// Mock data generator
const COLORS = ['3b82f6', 'ef4444', '10b981', 'f59e0b', '8b5cf6', 'ec4899', '06b6d4', '84cc16'];

const LABEL_NAMES = [
  'bug', 'enhancement', 'documentation', 'help wanted', 
  'good first issue', 'wontfix', 'duplicate', 'invalid',
  'question', 'feature', 'priority: high', 'priority: low'
];

const SAMPLE_TITLES = [
  'Add support for dark mode in settings panel',
  'Fix memory leak in image upload component',
  'Improve performance of issue list rendering',
  'Add keyboard shortcuts for common actions',
  'Update documentation for API endpoints',
  'Refactor authentication flow',
  'Add unit tests for markdown parser',
  'Fix responsive layout on mobile devices',
  'Implement drag and drop for issue prioritization',
  'Add export functionality for issue reports',
  'Fix incorrect date formatting in timestamps',
  'Add filter by assignee feature',
  'Improve error messages in form validation',
  'Add pagination to repository list',
  'Fix broken links in README',
];

export function generateMockRepositories(count: number = 15): Repository[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `repo-${i + 1}`,
    name: ['react-app', 'api-service', 'web-platform', 'mobile-app', 'design-system', 'documentation', 'cli-tool', 'backend-service', 'frontend-lib', 'utils-package'][i % 10],
    full_name: `org/${['react-app', 'api-service', 'web-platform', 'mobile-app', 'design-system', 'documentation', 'cli-tool', 'backend-service', 'frontend-lib', 'utils-package'][i % 10]}`,
    owner: {
      login: 'org',
      avatar_url: `https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop&q=80`
    },
    private: i % 3 === 0,
    description: `A ${i % 2 === 0 ? 'modern' : 'powerful'} ${['application', 'service', 'platform', 'tool', 'library'][i % 5]} for developers`
  }));
}

export function generateMockLabels(count: number = 12): Label[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `label-${i + 1}`,
    name: LABEL_NAMES[i % LABEL_NAMES.length],
    color: COLORS[i % COLORS.length],
    description: `Label for ${LABEL_NAMES[i % LABEL_NAMES.length]}`
  }));
}

export function generateMockIssues(repos: Repository[], count: number = 50): Issue[] {
  const labels = generateMockLabels();
  
  return Array.from({ length: count }, (_, i) => {
    const repo = repos[i % repos.length];
    const issueLabels = labels.slice(0, Math.floor(Math.random() * 4) + 1);
    const assigneeCount = Math.floor(Math.random() * 3);
    
    return {
      id: `issue-${i + 1}`,
      number: 1000 + i,
      title: SAMPLE_TITLES[i % SAMPLE_TITLES.length],
      body: `## Description\n\nThis issue needs attention. ${Math.random() > 0.5 ? 'It affects multiple users.' : 'Priority should be evaluated.'}\n\n### Steps to reproduce\n1. Open the application\n2. Navigate to the affected section\n3. Observe the issue\n\n### Expected behavior\nThe feature should work as intended.\n\n### Actual behavior\nThe current behavior is not as expected.`,
      state: Math.random() > 0.3 ? 'open' : 'closed',
      repository: repo,
      labels: issueLabels,
      assignees: Array.from({ length: assigneeCount }, (_, j) => ({
        id: `user-${j + 1}`,
        login: ['alice', 'bob', 'charlie', 'diana', 'evan'][j % 5],
        avatar_url: `https://images.unsplash.com/photo-${1535713875002 + j * 100}-d1d0cf5c543e?w=100&h=100&fit=crop&q=80`,
        name: ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Evan Williams'][j % 5]
      })),
      created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      linked_prs: Math.random() > 0.7 ? [{
        id: `pr-${i + 1}`,
        number: 500 + i,
        title: `Fix: ${SAMPLE_TITLES[i % SAMPLE_TITLES.length]}`,
        state: ['open', 'closed', 'merged'][Math.floor(Math.random() * 3)] as any,
        html_url: `https://github.com/org/${repo.name}/pull/${500 + i}`
      }] : [],
      html_url: `https://github.com/org/${repo.name}/issues/${1000 + i}`
    };
  });
}

// In-memory storage for demo
let repositories = generateMockRepositories();
let issues = generateMockIssues(repositories);

export const mockApi = {
  getRepositories: async (): Promise<Repository[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return repositories;
  },

  getIssues: async (filters?: any, page: number = 1, perPage: number = 20): Promise<{ issues: Issue[], hasMore: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let filtered = [...issues];
    
    if (filters?.state && filters.state !== 'all') {
      filtered = filtered.filter(issue => issue.state === filters.state);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(issue => 
        issue.title.toLowerCase().includes(search) ||
        issue.body.toLowerCase().includes(search) ||
        issue.labels.some(l => l.name.toLowerCase().includes(search))
      );
    }
    
    if (filters?.repositories?.length > 0) {
      filtered = filtered.filter(issue => 
        filters.repositories.includes(issue.repository.id)
      );
    }
    
    if (filters?.labels?.length > 0) {
      filtered = filtered.filter(issue =>
        issue.labels.some(label => filters.labels.includes(label.name))
      );
    }
    
    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);
    
    return {
      issues: paginated,
      hasMore: filtered.length > start + perPage
    };
  },

  getIssue: async (id: string): Promise<Issue | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return issues.find(i => i.id === id) || null;
  },

  updateIssue: async (id: string, updates: Partial<Issue>): Promise<Issue> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = issues.findIndex(i => i.id === id);
    if (index !== -1) {
      issues[index] = { ...issues[index], ...updates, updated_at: new Date().toISOString() };
      return issues[index];
    }
    throw new Error('Issue not found');
  },

  createIssue: async (data: { title: string; body: string; repository: Repository; labels: Label[] }): Promise<Issue> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newIssue: Issue = {
      id: `issue-${Date.now()}`,
      number: issues.length + 1000,
      title: data.title,
      body: data.body,
      state: 'open',
      repository: data.repository,
      labels: data.labels,
      assignees: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      html_url: `https://github.com/org/${data.repository.name}/issues/${issues.length + 1000}`
    };
    issues.unshift(newIssue);
    return newIssue;
  },

  deleteIssue: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    issues = issues.filter(i => i.id !== id);
  },

  getLabels: async (): Promise<Label[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return generateMockLabels();
  }
};
