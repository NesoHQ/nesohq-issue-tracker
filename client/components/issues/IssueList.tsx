'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Issue } from '@/lib/types';
import { IssueRow } from './IssueRow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Plus, AlertCircle } from 'lucide-react';
import { getIssues, getLinkedPRsForIssues } from '@/app/actions/github';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UI_CONFIG } from '@/lib/constants';
import { getErrorMessage, reportClientError } from '@/lib/telemetry';
import { toast } from 'sonner';

interface IssueListProps {
  selectedRepo: string | null;
  selectedIssueId?: string | undefined;
  onIssueSelect: (issue: Issue) => void;
  onCreateClick: () => void;
  patchIssue?: Issue | undefined;
}

export function IssueList({
  selectedRepo,
  selectedIssueId,
  onIssueSelect,
  onCreateClick,
  patchIssue,
}: IssueListProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<'all' | 'open' | 'closed'>('open');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [linkedPrWarning, setLinkedPrWarning] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const issuesRequestRef = useRef(0);
  const prBatchRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), UI_CONFIG.DEBOUNCE_DELAY);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  useEffect(() => {
    prBatchRef.current++;
    loadIssues(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRepo, debouncedSearch, stateFilter]);

  useEffect(() => {
    if (!patchIssue) return;
    setIssues((prev) => prev.map((i) => (i.id === patchIssue.id ? patchIssue : i)));
  }, [patchIssue]);

  const fetchLinkedPRsForIssues = useCallback(async (batch: Issue[]) => {
    const batchId = ++prBatchRef.current;
    setLinkedPrWarning(null);

    let failedRepos = 0;
    const issuesByRepo = new Map<string, Issue[]>();
    batch.forEach((issue) => {
      const existing = issuesByRepo.get(issue.repository.full_name);
      if (existing) {
        existing.push(issue);
      } else {
        issuesByRepo.set(issue.repository.full_name, [issue]);
      }
    });

    for (const [repoFullName, repoIssues] of issuesByRepo) {
      if (prBatchRef.current !== batchId) return;

      try {
        const prMap = await getLinkedPRsForIssues(
          repoFullName,
          repoIssues.map((issue) => issue.number)
        );

        if (prBatchRef.current !== batchId) return;

        const targetIds = new Set(repoIssues.map((issue) => issue.id));
        setIssues((prev) =>
          prev.map((item) => {
            if (!targetIds.has(item.id)) return item;
            return { ...item, linked_prs: prMap[item.number] ?? [] };
          })
        );
      } catch (error) {
        if (prBatchRef.current !== batchId) return;
        failedRepos += 1;
        reportClientError({
          component: 'IssueList',
          action: 'load_linked_prs_batch',
          error,
          metadata: {
            repo: repoFullName,
            issueCount: repoIssues.length,
          },
        });
      }
    }

    if (failedRepos > 0 && prBatchRef.current === batchId) {
      setLinkedPrWarning(`Linked pull requests could not be loaded for ${failedRepos} repository group(s).`);
    }
  }, []);

  const loadIssues = async (reset = false) => {
    const requestId = ++issuesRequestRef.current;

    if (reset) {
      setLoading(true);
      setPage(1);
      setLoadError(null);
      setLoadMoreError(null);
      setLinkedPrWarning(null);
    } else {
      setLoadingMore(true);
      setLoadMoreError(null);
    }

    try {
      const currentPage = reset ? 1 : page;
      const result = await getIssues(selectedRepo, stateFilter, debouncedSearch, currentPage, 30);
      if (issuesRequestRef.current !== requestId) return;

      if (reset) {
        setIssues(result.issues);
      } else {
        setIssues((prev) => {
          const seen = new Set(prev.map((i) => i.id));
          return [...prev, ...result.issues.filter((i) => !seen.has(i.id))];
        });
      }

      setHasMore(result.hasMore);
      if (!reset) setPage((prev) => prev + 1);

      fetchLinkedPRsForIssues(result.issues);
    } catch (error) {
      if (issuesRequestRef.current !== requestId) return;
      const message = getErrorMessage(error, 'Failed to load issues');
      reportClientError({
        component: 'IssueList',
        action: 'load_issues',
        error,
        metadata: {
          repo: selectedRepo ?? 'all',
          search: debouncedSearch || '(empty)',
          stateFilter,
          page: reset ? 1 : page,
          reset,
        },
      });

      if (reset) {
        setLoadError(message);
      } else {
        setLoadMoreError(message);
        toast.error('Could not load more issues. Please try again.');
      }
    } finally {
      if (issuesRequestRef.current !== requestId) return;
      setLoading(false);
      setLoadingMore(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 space-y-4 bg-background">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Issues {!loading && `(${issues.length}${hasMore ? '+' : ''})`}
          </h2>
          <Button onClick={onCreateClick} size="sm" className="gap-2" disabled={!selectedRepo}>
            <Plus className="size-4" />
            New Issue
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={stateFilter} onValueChange={(value: 'all' | 'open' | 'closed') => setStateFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedRepo && (
          <div className="text-xs text-muted-foreground truncate">{selectedRepo}</div>
        )}
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : loadError ? (
          <div className="px-4 py-8">
            <div className="max-w-md mx-auto border border-destructive/30 rounded-lg bg-destructive/5 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold">Couldn&apos;t load issues</h3>
                  <p className="text-sm text-muted-foreground">{loadError}</p>
                </div>
              </div>
              <Button onClick={() => loadIssues(true)} size="sm">
                Retry
              </Button>
            </div>
          </div>
        ) : issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="size-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No issues found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {!selectedRepo
                ? 'Select a repository from the sidebar to view its issues'
                : 'Try adjusting your filters or search query'}
            </p>
          </div>
        ) : (
          <div>
            {linkedPrWarning && (
              <div className="px-4 pt-4">
                <div className="border rounded-lg p-3 bg-muted/40 text-sm text-muted-foreground">
                  {linkedPrWarning}
                </div>
              </div>
            )}
            {issues.map((issue) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                selected={issue.id === selectedIssueId}
                onSelect={onIssueSelect}
              />
            ))}
            {hasMore && (
              <div className="p-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => !loadingMore && hasMore && loadIssues(false)}
                  disabled={loadingMore}
                  className="gap-2"
                >
                  {loadingMore && <Loader2 className="size-4 animate-spin" />}
                  Load more
                </Button>
              </div>
            )}
            {loadMoreError && (
              <div className="px-4 pb-4">
                <div className="max-w-md mx-auto border border-destructive/30 rounded-lg bg-destructive/5 p-3 text-sm">
                  <p className="text-destructive font-medium">Couldn&apos;t load more issues</p>
                  <p className="text-muted-foreground">{loadMoreError}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
