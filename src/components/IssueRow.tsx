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
      className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 ${isSelected ? 'bg-blue-100 dark:bg-blue-500/15' : ''}`}
      onClick={onSelect}
    >
      <td className="py-2.5 px-4 border-t border-gray-100 dark:border-white/[0.06]">
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
            issue.state === 'open'
              ? 'bg-green-500/20 text-green-500'
              : 'bg-gray-500/30 text-gray-400'
          }`}
        >
          {issue.state}
        </span>
      </td>
      <td className="py-2.5 px-4 border-t border-gray-100 dark:border-white/[0.06]">
        <span className="font-medium">#{issue.number} {issue.title}</span>
      </td>
      <td className="py-2.5 px-4 border-t border-gray-100 dark:border-white/[0.06]">
        <span className="text-xs text-gray-500 dark:text-white/60">{repo}</span>
      </td>
      <td className="py-2.5 px-4 border-t border-gray-100 dark:border-white/[0.06]">
        <div className="flex flex-wrap gap-1">
          {issue.labels.slice(0, 3).map((l) => (
            <span
              key={l.id}
              className="px-1.5 py-0.5 rounded text-[0.7rem] text-black"
              style={{ backgroundColor: `#${l.color}` }}
            >
              {l.name}
            </span>
          ))}
          {issue.labels.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-white/50">+{issue.labels.length - 3}</span>
          )}
        </div>
      </td>
      <td className="py-2.5 px-4 border-t border-gray-100 dark:border-white/[0.06]">
        {issue.assignees.length > 0 ? (
          <div className="flex items-center gap-1">
            {issue.assignees.slice(0, 2).map((a) => (
              <img
                key={a.id}
                src={a.avatar_url}
                alt={a.login}
                className="w-5 h-5 rounded-full"
                title={a.login}
              />
            ))}
            {issue.assignees.length > 2 && (
              <span>+{issue.assignees.length - 2}</span>
            )}
          </div>
        ) : (
          <span>—</span>
        )}
      </td>
      <td className="py-2.5 px-4 border-t border-gray-100 dark:border-white/[0.06]">
        <span className="text-xs text-gray-500 dark:text-white/50">{formatDate(issue.updated_at)}</span>
      </td>
    </tr>
  )
}
