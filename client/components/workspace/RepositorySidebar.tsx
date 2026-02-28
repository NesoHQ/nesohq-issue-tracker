'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import type { Repository } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, Lock, Globe, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';

const PINS_KEY = 'pinned-repos';

function loadPins(): Set<string> {
  try {
    const raw = localStorage.getItem(PINS_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function savePins(pins: Set<string>) {
  localStorage.setItem(PINS_KEY, JSON.stringify([...pins]));
}

interface RepositorySidebarProps {
  repositories: Repository[];
  selectedRepo: string | null;
  onSelectionChange: (repoId: string | null) => void;
  className?: string;
}

export function RepositorySidebar({
  repositories,
  selectedRepo,
  onSelectionChange,
  className,
}: RepositorySidebarProps) {
  const [search, setSearch] = useState('');
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(loadPins);

  const togglePin = useCallback((e: React.MouseEvent, repoId: string) => {
    e.stopPropagation();
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(repoId)) {
        next.delete(repoId);
      } else {
        next.add(repoId);
      }
      savePins(next);
      return next;
    });
  }, []);

  const handleRepoClick = useCallback((repoId: string) => {
    onSelectionChange(selectedRepo === repoId ? null : repoId);
  }, [onSelectionChange, selectedRepo]);

  const filtered = useMemo(
    () =>
      repositories.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.full_name.toLowerCase().includes(search.toLowerCase())
      ),
    [repositories, search]
  );

  const pinned = useMemo(() => filtered.filter((r) => pinnedIds.has(r.id)), [filtered, pinnedIds]);
  const others = useMemo(() => filtered.filter((r) => !pinnedIds.has(r.id)), [filtered, pinnedIds]);

  return (
    <div className={cn('flex flex-col h-full border-r bg-sidebar', className)}>
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sidebar-foreground">Repositories</h3>
          {selectedRepo && (
            <Button variant="ghost" size="sm" onClick={() => onSelectionChange(null)} className="h-7 text-xs">
              Clear
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 bg-sidebar-accent"
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearch('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No repositories found</div>
          ) : (
            <>
              {pinned.length > 0 && (
                <>
                  <p className="px-2 pt-1 pb-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pinned</p>
                  {pinned.map((repo) => (
                    <RepoRow key={repo.id} repo={repo} selected={selectedRepo === repo.id} pinned onClick={handleRepoClick} onTogglePin={togglePin} />
                  ))}
                  {others.length > 0 && (
                    <p className="px-2 pt-3 pb-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">All</p>
                  )}
                </>
              )}
              {others.map((repo) => (
                <RepoRow key={repo.id} repo={repo} selected={selectedRepo === repo.id} pinned={false} onClick={handleRepoClick} onTogglePin={togglePin} />
              ))}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface RepoRowProps {
  repo: Repository;
  selected: boolean;
  pinned: boolean;
  onClick: (id: string) => void;
  onTogglePin: (e: React.MouseEvent, id: string) => void;
}

const RepoRow = memo(function RepoRow({ repo, selected, pinned, onClick, onTogglePin }: RepoRowProps) {
  return (
    <div
      className={cn(
        'group flex items-start gap-2 p-3 rounded-lg cursor-pointer hover:bg-sidebar-accent transition-colors',
        selected && 'bg-sidebar-accent ring-2 ring-sidebar-ring'
      )}
      onClick={() => onClick(repo.id)}
    >
      <div className="flex-1 w-5 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate text-sidebar-foreground">{repo.name}</span>
          {repo.private ? (
            <Lock className="size-3 text-muted-foreground flex-shrink-0" />
          ) : (
            <Globe className="size-3 text-muted-foreground flex-shrink-0" />
          )}
        </div>
        {repo.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{repo.description}</p>
        )}
      </div>
      <button
        onClick={(e) => onTogglePin(e, repo.id)}
        title={pinned ? 'Unpin repository' : 'Pin repository'}
        className={cn(
          'flex-shrink-0 mt-0.5 p-1 rounded transition-all',
          pinned
            ? 'text-amber-500 hover:text-amber-600 opacity-100'
            : 'text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground'
        )}
      >
        <Pin className={cn('size-3.5', pinned && 'fill-amber-500')} />
      </button>
    </div>
  );
});
