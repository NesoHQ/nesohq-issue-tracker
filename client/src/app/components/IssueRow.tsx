import { Issue, Label } from '../lib/types';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatRelativeDate, getContrastColor } from '../lib/utils';
import { Circle, CircleDot, GitPullRequest } from 'lucide-react';

interface IssueRowProps {
  issue: Issue;
  selected?: boolean;
  onClick: () => void;
}

export function IssueRow({ issue, selected, onClick }: IssueRowProps) {
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
              {issue.linked_prs && issue.linked_prs.length > 0 && (
                <Badge variant="outline" className="flex items-center gap-1 flex-shrink-0">
                  <GitPullRequest className="size-3" />
                  <span>{issue.linked_prs.length}</span>
                </Badge>
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
