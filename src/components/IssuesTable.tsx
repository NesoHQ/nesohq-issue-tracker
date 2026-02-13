import type { GitHubIssue } from '../types/github'
import IssueRow from './IssueRow'

interface IssuesTableProps {
  issues: GitHubIssue[]
  selectedRepos: string[]
  onSelectIssue: (issue: { repo: string; number: number } | null) => void
  selectedIssue: { repo: string; number: number } | null
}

export default function IssuesTable({
  issues,
  onSelectIssue,
  selectedIssue,
}: IssuesTableProps) {
  return (
    <div className="issues-table-wrapper">
      <table className="issues-table">
        <thead>
          <tr>
            <th className="col-state">State</th>
            <th className="col-title">Title</th>
            <th className="col-repo">Repo</th>
            <th className="col-labels">Labels</th>
            <th className="col-assignee">Assignee</th>
            <th className="col-updated">Updated</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => {
            const repo =
              issue.repo_full_name ||
              (issue.repository_url
                ? issue.repository_url.replace(/^.*\/repos\//, '')
                : '')
            return (
              <IssueRow
                key={`${repo}-${issue.number}`}
                issue={issue}
                repo={repo}
                isSelected={
                  selectedIssue?.repo === repo &&
                  selectedIssue?.number === issue.number
                }
                onSelect={() => onSelectIssue({ repo, number: issue.number })}
              />
            )
          })}
        </tbody>
      </table>
      {issues.length === 0 && (
        <div className="issues-empty">No issues found</div>
      )}
    </div>
  )
}
