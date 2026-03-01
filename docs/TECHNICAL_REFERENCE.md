# Technical Reference

## Repository Layout

### `client/` (Next.js)

- `app/`:
  - route segments (`(public)`, `(auth)`)
  - server actions under `app/actions`
  - auth callback and session reset routes
- `components/`:
  - `auth/`: sign-in and OAuth callback UI
  - `workspace/`: shell, header, repo sidebar
  - `issues/`: list, detail, row, create form, markdown editor
  - `ui/`: shared primitives
- `lib/`:
  - auth helpers, GitHub wrappers, mappers, constants, telemetry, types
- `middleware.ts`: route-level auth guard

### `server/` (Express OAuth)

- `routes/auth.routes.ts`: auth config and code exchange endpoints
- `services/github.service.ts`: calls GitHub OAuth and user APIs
- `config/index.ts`: env loading and config parsing
- `app.ts`: middleware stack (helmet, cors, rate-limit)
- `index.ts`: server bootstrap

## Important API Endpoints

### Internal (Express OAuth service)

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/auth/config` | Returns OAuth client config to frontend |
| `POST` | `/api/auth/exchange` | Exchanges auth code for GitHub token and user |

### External (GitHub API usage)

| API | Endpoint | Used For |
| --- | --- | --- |
| REST | `/user` | Validate session + fetch user identity |
| REST | `/user/repos` | Fetch accessible repositories |
| REST | `/repos/{owner}/{repo}/issues` | List/create/update issues |
| REST | `/repos/{owner}/{repo}/labels` | Fetch repository labels |
| REST | `/search/issues` | Search issues globally or per repo |
| GraphQL | `/graphql` | Fetch linked pull requests for issues |

## Key Data Types

Defined in `client/lib/types.ts`:

- `User`
- `Repository`
- `Issue`
- `Label`
- `Assignee`
- `PullRequest`

GitHub payloads are normalized in `client/lib/github/mappers.ts`.

## State Management Patterns

- Component-local state with React hooks
- Request race prevention via request IDs in refs
- Batched linked PR loading in issue list per repository
- Parent-child patching pattern: `WorkspaceShell` passes `patchIssue` to list

## Auth and Session Details

- Token cookie key: `github_access_token`
- Cookie is `httpOnly`, `sameSite=lax`, path `/`, 1-week max age
- Middleware redirects unauthenticated `/workspace` requests to session reset route

## Config Resolution

Frontend API base URL resolution order:

1. `window.APP_CONFIG.apiBaseUrl` from `client/public/config.js`
2. `NEXT_PUBLIC_API_URL`
3. Empty string for same-origin relative path (works with Next rewrites)

## Current Observability

- Client error reporting utility in `client/lib/telemetry.ts`
- Supports console warnings in development
- Supports optional beacon/fetch transport via `NEXT_PUBLIC_TELEMETRY_ENDPOINT`
