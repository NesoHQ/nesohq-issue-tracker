import { useState, useEffect } from 'react';
import { Issue, Label } from '../lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { MarkdownEditor } from './MarkdownEditor';
import {
  CircleDot,
  Circle,
  GitPullRequest,
  ExternalLink,
  Edit2,
  Check,
  X as CloseIcon,
  Loader2,
} from 'lucide-react';
import { formatRelativeDate, getContrastColor } from '../lib/utils';
import { githubApi } from '../lib/github-api';
import { renderMarkdown } from '../lib/markdown';
import { toast } from 'sonner';

interface IssueDetailProps {
  issue: Issue;
  onClose: () => void;
  onUpdate: (issue: Issue) => void;
  onDelete: () => void;
}

export function IssueDetail({ issue, onClose, onUpdate, onDelete }: IssueDetailProps) {
  const [currentIssue, setCurrentIssue] = useState(issue);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingBody, setEditingBody] = useState(false);
  const [titleValue, setTitleValue] = useState(issue.title);
  const [bodyValue, setBodyValue] = useState(issue.body);
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setCurrentIssue(issue);
    setTitleValue(issue.title);
    setBodyValue(issue.body);
    setEditingTitle(false);
    setEditingBody(false);
  }, [issue]);

  useEffect(() => {
    githubApi
      .getLabels(currentIssue.repository.full_name)
      .then(setAvailableLabels)
      .catch(() => setAvailableLabels([]));
  }, [currentIssue.repository.full_name]);

  const handleUpdateTitle = async () => {
    if (titleValue.trim() === currentIssue.title) {
      setEditingTitle(false);
      return;
    }
    setUpdating(true);
    try {
      const updated = await githubApi.updateIssue(currentIssue, { title: titleValue.trim() });
      setCurrentIssue(updated);
      onUpdate(updated);
      setEditingTitle(false);
      toast.success('Title updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update title');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateBody = async () => {
    if (bodyValue === currentIssue.body) {
      setEditingBody(false);
      return;
    }
    setUpdating(true);
    try {
      const updated = await githubApi.updateIssue(currentIssue, { body: bodyValue });
      setCurrentIssue(updated);
      onUpdate(updated);
      setEditingBody(false);
      toast.success('Description updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update description');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleState = async () => {
    const newState = currentIssue.state === 'open' ? 'closed' : 'open';
    setUpdating(true);
    try {
      const updated = await githubApi.updateIssue(currentIssue, { state: newState });
      setCurrentIssue(updated);
      onUpdate(updated);
      toast.success(`Issue ${newState === 'open' ? 'reopened' : 'closed'}`);
      if (newState === 'closed') onDelete();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update state');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleLabel = async (label: Label) => {
    const hasLabel = currentIssue.labels.find((l) => l.id === label.id);
    const newLabels = hasLabel
      ? currentIssue.labels.filter((l) => l.id !== label.id)
      : [...currentIssue.labels, label];

    setUpdating(true);
    try {
      const updated = await githubApi.updateIssue(currentIssue, { labels: newLabels });
      setCurrentIssue(updated);
      onUpdate(updated);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update labels');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant={currentIssue.state === 'open' ? 'default' : 'secondary'}
            size="sm"
            onClick={handleToggleState}
            disabled={updating}
            className="gap-2"
          >
            {updating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : currentIssue.state === 'open' ? (
              <>
                <CircleDot className="size-4" />
                Close issue
              </>
            ) : (
              <>
                <Circle className="size-4" />
                Reopen issue
              </>
            )}
          </Button>
          <span className="text-sm text-muted-foreground">#{currentIssue.number}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(currentIssue.html_url, '_blank')}
            className="gap-2"
          >
            <ExternalLink className="size-4" />
            <span className="hidden sm:inline">Open in GitHub</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <CloseIcon className="size-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          {/* Title */}
          <div>
            {editingTitle ? (
              <div className="space-y-2">
                <Input
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateTitle();
                    if (e.key === 'Escape') {
                      setTitleValue(currentIssue.title);
                      setEditingTitle(false);
                    }
                  }}
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleUpdateTitle} disabled={updating}>
                    {updating ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setTitleValue(currentIssue.title);
                      setEditingTitle(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="group flex items-start gap-2">
                <h1 className="text-2xl font-semibold flex-1">{currentIssue.title}</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <Edit2 className="size-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <span>{currentIssue.repository.full_name}</span>
            <span>•</span>
            <span>Created {formatRelativeDate(currentIssue.created_at)}</span>
            <span>•</span>
            <span>Updated {formatRelativeDate(currentIssue.updated_at)}</span>
          </div>

          {/* Labels */}
          {availableLabels.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Labels</h3>
              <div className="flex flex-wrap gap-2">
                {availableLabels.map((label) => {
                  const isSelected = !!currentIssue.labels.find((l) => l.id === label.id);
                  const textColor =
                    getContrastColor(label.color) === 'dark' ? '#000000' : '#ffffff';
                  return (
                    <Badge
                      key={label.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      style={
                        isSelected
                          ? {
                              backgroundColor: `#${label.color}`,
                              color: textColor,
                              borderColor: `#${label.color}`,
                            }
                          : undefined
                      }
                      onClick={() => handleToggleLabel(label)}
                    >
                      {label.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Assignees */}
          {currentIssue.assignees.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Assignees</h3>
              <div className="flex flex-col gap-2">
                {currentIssue.assignees.map((assignee) => (
                  <div key={assignee.id} className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarImage src={assignee.avatar_url} alt={assignee.login} />
                      <AvatarFallback>{assignee.login[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{assignee.name || assignee.login}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linked PRs */}
          {currentIssue.linked_prs && currentIssue.linked_prs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Linked Pull Requests</h3>
              <div className="space-y-2">
                {currentIssue.linked_prs.map((pr) => (
                  <div
                    key={pr.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <GitPullRequest className="size-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <a
                        href={pr.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline"
                      >
                        #{pr.number} {pr.title}
                      </a>
                    </div>
                    <Badge
                      variant={pr.state === 'open' ? 'default' : pr.state === 'merged' ? 'secondary' : 'outline'}
                      className={pr.state === 'merged' ? 'bg-purple-600 text-white' : ''}
                    >
                      {pr.state}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Description</h3>
              {!editingBody && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingBody(true)}
                  className="h-7 text-xs gap-1"
                >
                  <Edit2 className="size-3" />
                  Edit
                </Button>
              )}
            </div>

            {editingBody ? (
              <div className="space-y-2">
                <MarkdownEditor
                  value={bodyValue}
                  onChange={setBodyValue}
                  placeholder="Add a description (supports markdown)"
                  minHeight="200px"
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleUpdateBody} disabled={updating}>
                    {updating ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setBodyValue(currentIssue.body);
                      setEditingBody(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-muted/30 min-h-[80px]">
                {currentIssue.body ? (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(currentIssue.body) }}
                  />
                ) : (
                  <p className="text-muted-foreground italic text-sm">No description provided</p>
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
