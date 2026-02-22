import { useState, useEffect, useRef } from 'react';
import { Issue } from '../lib/types';
import { IssueRow } from './IssueRow';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Loader2, Plus } from 'lucide-react';
import { githubApi } from '../lib/github-api';
import { ScrollArea } from './ui/scroll-area';

interface IssueListProps {
  selectedRepo: string | null;
  selectedIssueId?: string;
  onIssueSelect: (issue: Issue) => void;
  onCreateClick: () => void;
}

export function IssueList({
  selectedRepo,
  selectedIssueId,
  onIssueSelect,
  onCreateClick,
}: IssueListProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<'all' | 'open' | 'closed'>('open');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input 500 ms to avoid hammering GitHub API
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  useEffect(() => {
    loadIssues(true);
  }, [selectedRepo, debouncedSearch, stateFilter]);

  const loadIssues = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }

    try {
      const currentPage = reset ? 1 : page;
      const result = await githubApi.getIssues(
        selectedRepo,
        stateFilter,
        debouncedSearch,
        currentPage,
        30
      );

      if (reset) {
        setIssues(result.issues);
      } else {
        setIssues((prev) => [...prev, ...result.issues]);
      }

      setHasMore(result.hasMore);
      if (!reset) {
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Failed to load issues:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadIssues(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
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
          <div className="text-xs text-muted-foreground truncate">
            {selectedRepo}
          </div>
        )}
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
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
            {issues.map((issue) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                selected={issue.id === selectedIssueId}
                onClick={() => onIssueSelect(issue)}
              />
            ))}

            {hasMore && (
              <div className="p-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="gap-2"
                >
                  {loadingMore && <Loader2 className="size-4 animate-spin" />}
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
