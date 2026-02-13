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
    <div className="flex-1 overflow-auto rounded-lg border border-white/10">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="text-left py-3 px-4 bg-black/20 font-semibold text-white/70">State</th>
            <th className="text-left py-3 px-4 bg-black/20 font-semibold text-white/70">Title</th>
            <th className="text-left py-3 px-4 bg-black/20 font-semibold text-white/70">Repo</th>
            <th className="text-left py-3 px-4 bg-black/20 font-semibold text-white/70">Labels</th>
            <th className="text-left py-3 px-4 bg-black/20 font-semibold text-white/70">Assignee</th>
            <th className="text-left py-3 px-4 bg-black/20 font-semibold text-white/70">Updated</th>
          </tr>
        </thead>
        <tbody>
          {issues.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-white/50">
                No issues found
              </td>
            </tr>
          ) : (
          issues.map((issue) => {
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
          })
          )}
        </tbody>
      </table>
    </div>
  )
}
