# GitHub Issues - Notion-style Frontend

A Notion-like web frontend to manage GitHub issues across multiple repositories using the GitHub REST API. Edit issues in the UI and changes sync to GitHub in real time.

## Features

- **Sign in with GitHub** via OAuth
- **Multi-repo workspace** - select multiple repositories and view issues in one place
- **Notion-like table** - Title, Repo, State, Labels, Assignee, Updated columns
- **Inline editing** - double-click to edit title and description in the detail panel
- **Create issues** - new issue modal with repo, title, body, labels, assignees
- **Filters** - by state (open/closed/all), search, labels, assignees
- **Optimistic updates** - changes appear immediately, roll back on error

## Setup

### 1. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set:
   - **Application name**: GitHub Issues (or any name)
   - **Homepage URL**: `http://localhost:5173` (or your app URL)
   - **Authorization callback URL**: `http://localhost:5173/auth/callback`
4. Copy the **Client ID** and generate a **Client Secret**

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

### 3. Install and run

```bash
npm install
npm run dev:all
```

This starts:
- **Vite dev server** on http://localhost:5173 (frontend)
- **Auth server** on http://localhost:3001 (OAuth token exchange)

Or run separately:

```bash
# Terminal 1 - frontend
npm run dev

# Terminal 2 - auth server (required for sign-in)
npm run dev:server
```

### 4. Sign in and use

1. Open http://localhost:5173
2. Click "Sign in with GitHub"
3. Authorize the app
4. Select repositories from the sidebar
5. View, edit, and create issues

## Project structure

```
src/
  components/     # AppShell, TopBar, RepoSelectorSidebar, IssuesTable, etc.
  contexts/      # AuthContext, ToastContext
  hooks/         # useIssues, useRepoMetadata
  lib/           # githubClient, auth, api
  pages/         # SignInPage, WorkspacePage, AuthCallbackPage
  store/         # workspaceStore, issuesStore (Zustand)
  types/         # GitHub API types
server/
  index.ts       # Express auth server for OAuth token exchange
```

## Tech stack

- React 19 + TypeScript
- Vite
- React Router
- Zustand
- GitHub REST API
