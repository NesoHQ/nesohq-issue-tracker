import { useState } from 'react';
import { Repository } from '../lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Search, X, Lock, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

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
  className
}: RepositorySidebarProps) {
  const [search, setSearch] = useState('');

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(search.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRepoClick = (repoId: string) => {
    if (selectedRepo === repoId) {
      onSelectionChange(null);
    } else {
      onSelectionChange(repoId);
    }
  };

  const clearSelection = () => {
    onSelectionChange(null);
  };

  return (
    <div className={cn("flex flex-col h-full border-r bg-sidebar", className)}>
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sidebar-foreground">Repositories</h3>
          {selectedRepo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="h-7 text-xs"
            >
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
          {filteredRepos.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No repositories found
            </div>
          ) : (
            filteredRepos.map((repo) => (
              <div
                key={repo.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-sidebar-accent transition-colors",
                  selectedRepo === repo.id && "bg-sidebar-accent ring-2 ring-sidebar-ring"
                )}
                onClick={() => handleRepoClick(repo.id)}
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate text-sidebar-foreground">
                      {repo.name}
                    </span>
                    {repo.private ? (
                      <Lock className="size-3 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <Globe className="size-3 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {repo.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}