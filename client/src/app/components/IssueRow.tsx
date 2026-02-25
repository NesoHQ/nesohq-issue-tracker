import { Issue, Label, PullRequest } from '../lib/types';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { formatRelativeDate, getContrastColor } from '../lib/utils';
import { Circle, CircleDot, GitPullRequest, GitMerge, GitPullRequestClosed } from 'lucide-react';

interface IssueRowProps {
  issue: Issue;
  selected?: boolean;
  onClick: () => void;
}

function prBadgeProps(prs: PullRequest[]) {
  const open = prs.filter((p) => p.state === 'open').length;
  const merged = prs.filter((p) => p.state === 'merged').length;
  const closed = prs.filter((p) => p.state === 'closed').length;

  const parts: string[] = [];
  if (open) parts.push(`${open} open`);
  if (merged) parts.push(`${merged} merged`);
  if (closed) parts.push(`${closed} closed`);
  const tooltip = parts.join(' · ');

  if (open > 0) {
    return { icon: GitPullRequest, color: 'text-green-600', borderColor: 'border-green-500/50', tooltip };
  }
  if (merged > 0) {
    return { icon: GitMerge, color: 'text-purple-500', borderColor: 'border-purple-500/50', tooltip };
  }
  return { icon: GitPullRequestClosed, color: 'text-muted-foreground', borderColor: 'border-border', tooltip };
}

export function IssueRow({ issue, selected, onClick }: IssueRowProps) {
  const prs = issue.linked_prs ?? [];
  const badge = prs.length > 0 ? prBadgeProps(prs) : null;

  return (
    <div
      className={`
        border-b cursor-pointer hover:bg-accent/50 transition-colors
        ${selected ? 'bg-accent' : ''}
      `}
      onClick={onClick}
    >
      <div className="px-6 py-4">
        <div className="flex items-start gap-4">
          {/* State icon */}
          <div className="pt-1">
            {issue.state === 'open' ? (
              <CircleDot className="size-5 text-green-600" />
            ) : (
              <Circle className="size-5 text-purple-600" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <h4 className="font-medium leading-snug">{issue.title}</h4>
              {badge && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-1 flex-shrink-0 ${badge.borderColor}`}
                      >
                        <badge.icon className={`size-3 ${badge.color}`} />
                        <span className={`text-xs ${badge.color}`}>{prs.length}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p className="text-xs">{badge.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              <span>#{issue.number}</span>
              <span>•</span>
              <span>{issue.repository.name}</span>
              <span>•</span>
              <span>{formatRelativeDate(issue.updated_at)}</span>
            </div>

            {/* Labels and assignees */}
            <div className="flex items-center gap-3 flex-wrap">
              {issue.labels.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {issue.labels.map((label) => (
                    <LabelBadge key={label.id} label={label} />
                  ))}
                </div>
              )}

              {issue.assignees.length > 0 && (
                <div className="flex items-center -space-x-2">
                  {issue.assignees.slice(0, 3).map((assignee) => (
                    <Avatar key={assignee.id} className="size-6 border-2 border-background">
                      <AvatarImage src={assignee.avatar_url} alt={assignee.login} />
                      <AvatarFallback className="text-xs">
                        {assignee.login[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {issue.assignees.length > 3 && (
                    <div className="size-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        +{issue.assignees.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LabelBadge({ label }: { label: Label }) {
  const textColor = getContrastColor(label.color) === 'dark' ? '#000000' : '#ffffff';
  
  return (
    <Badge
      variant="secondary"
      style={{
        backgroundColor: `#${label.color}`,
        color: textColor,
      }}
      className="text-xs font-normal"
    >
      {label.name}
    </Badge>
  );
}
