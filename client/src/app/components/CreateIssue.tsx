import { useState, useEffect } from 'react';
import { Issue, Label, Repository } from '../lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label as LabelComponent } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MarkdownEditor } from './MarkdownEditor';
import { Badge } from './ui/badge';
import { X, Loader2 } from 'lucide-react';
import { githubApi } from '../lib/github-api';
import { toast } from 'sonner';

interface CreateIssueProps {
  repositories: Repository[];
  defaultRepoFullName?: string | null;
  onClose: () => void;
  onSuccess: (issue: Issue) => void;
}

const DRAFT_KEY = 'issue_draft';

export function CreateIssue({ repositories, defaultRepoFullName, onClose, onSuccess }: CreateIssueProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(
    () => repositories.find((r) => r.full_name === defaultRepoFullName) ?? null
  );
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([]);
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [labelsLoading, setLabelsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Restore draft on mount; sidebar selection takes priority over saved draft repo
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setTitle(parsed.title || '');
        setBody(parsed.body || '');
        // Only restore draft repo when no sidebar repo is active
        if (!defaultRepoFullName && parsed.repoFullName) {
          const repo = repositories.find((r) => r.full_name === parsed.repoFullName);
          if (repo) setSelectedRepo(repo);
        }
        toast.info('Draft restored');
      } catch {
        // ignore malformed draft
      }
    }
  }, [repositories]);

  // Fetch labels whenever selected repo changes
  useEffect(() => {
    setSelectedLabels([]);
    if (!selectedRepo) {
      setAvailableLabels([]);
      return;
    }
    setLabelsLoading(true);
    githubApi
      .getLabels(selectedRepo.full_name)
      .then(setAvailableLabels)
      .catch(() => setAvailableLabels([]))
      .finally(() => setLabelsLoading(false));
  }, [selectedRepo]);

  // Auto-save draft
  useEffect(() => {
    if (title || body) {
      setHasUnsavedChanges(true);
      const timer = setTimeout(() => {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ title, body, repoFullName: selectedRepo?.full_name })
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [title, body, selectedRepo]);

  // Warn before unload with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!selectedRepo) {
      toast.error('Please select a repository');
      return;
    }

    setLoading(true);
    try {
      const issue = await githubApi.createIssue({
        title: title.trim(),
        body: body.trim(),
        repository: selectedRepo,
        labels: selectedLabels,
      });
      localStorage.removeItem(DRAFT_KEY);
      toast.success('Issue created successfully');
      onSuccess(issue);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create issue');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (hasUnsavedChanges && !confirm('Discard unsaved changes?')) return;
    localStorage.removeItem(DRAFT_KEY);
    onClose();
  };

  const toggleLabel = (label: Label) => {
    if (selectedLabels.find((l) => l.id === label.id)) {
      setSelectedLabels(selectedLabels.filter((l) => l.id !== label.id));
    } else {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit(e as unknown as React.FormEvent);
    if (e.key === 'Escape') handleDiscard();
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Create New Issue</h2>
        <Button variant="ghost" size="sm" onClick={handleDiscard}>
          <X className="size-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex-1 overflow-auto">
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          {/* Title */}
          <div className="space-y-2">
            <LabelComponent htmlFor="title">
              Title <span className="text-destructive">*</span>
            </LabelComponent>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              maxLength={256}
              autoFocus
            />
            <div className="text-xs text-muted-foreground text-right">{title.length}/256</div>
          </div>

          {/* Repository */}
          <div className="space-y-2">
            <LabelComponent htmlFor="repository">
              Repository <span className="text-destructive">*</span>
            </LabelComponent>
            <Select
              value={selectedRepo?.full_name}
              onValueChange={(fullName) => {
                const repo = repositories.find((r) => r.full_name === fullName);
                if (repo) setSelectedRepo(repo);
              }}
            >
              <SelectTrigger id="repository">
                <SelectValue placeholder="Select a repository" />
              </SelectTrigger>
              <SelectContent>
                {repositories.map((repo) => (
                  <SelectItem key={repo.full_name} value={repo.full_name}>
                    {repo.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Labels */}
          {selectedRepo && (
            <div className="space-y-2">
              <LabelComponent>Labels</LabelComponent>
              {labelsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading labels…
                </div>
              ) : availableLabels.length === 0 ? (
                <p className="text-sm text-muted-foreground">No labels found in this repository</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableLabels.map((label) => {
                    const isSelected = !!selectedLabels.find((l) => l.id === label.id);
                    return (
                      <Badge
                        key={label.id}
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        style={
                          isSelected
                            ? {
                                backgroundColor: `#${label.color}`,
                                borderColor: `#${label.color}`,
                              }
                            : undefined
                        }
                        onClick={() => toggleLabel(label)}
                      >
                        {label.name}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <LabelComponent htmlFor="body">Description</LabelComponent>
            <MarkdownEditor
              value={body}
              onChange={setBody}
              placeholder="Add a detailed description… (supports markdown)"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘/Ctrl</kbd> +{' '}
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to submit
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={handleDiscard}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !title.trim() || !selectedRepo}>
                {loading && <Loader2 className="size-4 animate-spin mr-2" />}
                Create Issue
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
