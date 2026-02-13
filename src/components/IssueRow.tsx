import type { GitHubIssue } from '../types/github'

interface IssueRowProps {
  issue: GitHubIssue
  repo: string
  isSelected: boolean
  onSelect: () => void
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function IssueRow({
  issue,
  repo,
  isSelected,
  onSelect,
}: IssueRowProps) {
  return (
    <tr
      className={`issue-row ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <td className="col-state">
        <span className={`state-badge state-${issue.state}`}>{issue.state}</span>
      </td>
      <td className="col-title">
        <span className="issue-title">#{issue.number} {issue.title}</span>
      </td>
      <td className="col-repo">
        <span className="repo-name">{repo}</span>
      </td>
      <td className="col-labels">
        <div className="labels-list">
          {issue.labels.slice(0, 3).map((l) => (
            <span
              key={l.id}
              className="label-badge"
              style={{ backgroundColor: `#${l.color}` }}
            >
              {l.name}
            </span>
          ))}
          {issue.labels.length > 3 && (
            <span className="label-more">+{issue.labels.length - 3}</span>
          )}
        </div>
      </td>
      <td className="col-assignee">
        {issue.assignees.length > 0 ? (
          <div className="assignees">
            {issue.assignees.slice(0, 2).map((a) => (
              <img
                key={a.id}
                src={a.avatar_url}
                alt={a.login}
                className="assignee-avatar"
                title={a.login}
              />
            ))}
            {issue.assignees.length > 2 && (
              <span className="assignee-more">+{issue.assignees.length - 2}</span>
            )}
          </div>
        ) : (
          <span className="no-assignee">—</span>
        )}
      </td>
      <td className="col-updated">
        <span className="updated-at">{formatDate(issue.updated_at)}</span>
      </td>
    </tr>
  )
}
