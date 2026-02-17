# GitHub Issues - Notion-style Frontend

A Notion-like web frontend to manage GitHub issues across multiple repositories using the GitHub REST API. Edit issues in the UI and changes sync to GitHub in real time.

## Features

- **Sign in with GitHub** via OAuth
- **Multi-repo workspace** - select multiple repositories and view issues in one place
- **Expandable sidebar** - collapsible repositories list with scrollable repo selection
- **Notion-like table** - Title, Repo, State, Labels, Assignee, Updated columns
- **Inline editing** - double-click to edit title and description in the detail panel
- **Create issues** - new issue modal with repo, title, body, and colored label chips
- **Filters** - by state (open/closed/all), search
- **Optimistic updates** - changes appear immediately, roll back on error

Assignees are managed on GitHub; the app displays them but does not edit them.

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
# Option A: One .env at the root (both apps read from it)
cp .env.example .env

# Option B: Separate .env per app
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Edit the `.env` file(s):

```
# client/.env
VITE_GITHUB_CLIENT_ID=your_client_id

# server/.env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

### 3. Install and run

```bash
# Install dependencies for both client and server
npm run install:all

# Run both together (from the root)
npm run dev
```

This starts:
- **Vite dev server** on http://localhost:5173 (frontend)
- **Express API server** on http://localhost:3001 (OAuth + uploads)

Or run each app independently from its own folder:

```bash
# Terminal 1 – frontend (from client/)
cd client
npm install
npm run dev

# Terminal 2 – server (from server/)
cd server
npm install
npm run dev
```

> **Deploying separately?** Set `VITE_API_URL` in the client to point to
> the server's URL (e.g. `VITE_API_URL=https://api.example.com`), and set
> `CORS_ORIGIN` in the server to the client's origin.

### 4. Sign in and use

1. Open http://localhost:5173
2. Click "Sign in with GitHub"
3. Authorize the app
4. Select repositories from the sidebar
5. View, edit, and create issues

## Project structure

```
├── client/              # React + Vite frontend (standalone)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── components/  # AppShell, TopBar, RepoSelectorSidebar, IssuesTable, etc.
│       ├── contexts/    # AuthContext, ThemeContext, ToastContext
│       ├── hooks/       # useIssues
│       ├── lib/         # githubClient, auth, api
│       ├── pages/       # SignInPage, WorkspacePage, AuthCallbackPage
│       ├── store/       # workspaceStore, issuesStore (Zustand)
│       └── types/       # GitHub API types
│
├── server/              # Express API server (standalone)
│   ├── package.json
│   ├── tsconfig.json
│   ├── index.ts         # Entry point
│   ├── app.ts           # Express app setup
│   ├── config/          # Env vars, paths
│   ├── constants/       # URLs, limits
│   ├── middleware/       # Multer upload
│   ├── routes/          # /api/auth, /api/upload
│   └── services/        # GitHub OAuth service
│
└── package.json         # Root orchestrator (runs both via concurrently)
```

## Tech stack

- React 19 + TypeScript
- Vite
- React Router
- Zustand
- Tailwind CSS
- GitHub REST API
