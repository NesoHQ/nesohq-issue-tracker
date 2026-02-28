# 🔄 Production-Ready Refactoring Plan

## 📁 New Folder Structure

```
client/
├── app/                                    # Next.js App Router
│   ├── (auth)/                            # Protected routes group
│   │   ├── layout.tsx                     # Auth layout with sidebar
│   │   └── workspace/
│   │       ├── page.tsx                   # Server component wrapper
│   │       ├── loading.tsx                # Loading UI
│   │       └── error.tsx                  # Error boundary
│   ├── (public)/                          # Public routes group
│   │   ├── layout.tsx                     # Public layout
│   │   └── page.tsx                       # Sign in page
│   ├── api/                               # API routes
│   │   ├── auth/
│   │   │   ├── config/route.ts           # OAuth config
│   │   │   └── exchange/route.ts         # Token exchange
│   │   └── github/
│   │       ├── repositories/route.ts      # Proxy to GitHub
│   │       └── issues/route.ts            # Proxy to GitHub
│   ├── actions/                           # Server actions
│   │   ├── auth.ts                        # Auth actions
│   │   ├── github.ts                      # GitHub API actions
│   │   └── issues.ts                      # Issue CRUD actions
│   ├── layout.tsx                         # Root layout
│   ├── not-found.tsx                      # 404 page
│   ├── robots.ts                          # SEO robots
│   └── sitemap.ts                         # SEO sitemap
│
├── components/                            # Shared components
│   ├── auth/
│   │   ├── SignInForm.tsx                # Client form component
│   │   └── SignInHero.tsx                # Server component
│   ├── issues/
│   │   ├── IssueList.tsx                 # Client component
│   │   ├── IssueListItem.tsx             # Client component
│   │   ├── IssueDetail.tsx               # Client component
│   │   ├── IssueFilters.tsx              # Client component
│   │   └── CreateIssueForm.tsx           # Client component
│   ├── workspace/
│   │   ├── WorkspaceShell.tsx            # Client layout
│   │   ├── WorkspaceHeader.tsx           # Client component
│   │   └── RepositorySidebar.tsx         # Client component
│   ├── ui/                                # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ... (existing)
│   ├── providers/
│   │   ├── ThemeProvider.tsx             # Theme context
│   │   └── QueryProvider.tsx             # React Query (optional)
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── ErrorMessage.tsx
│       └── EmptyState.tsx
│
├── lib/                                   # Utilities & configs
│   ├── api/
│   │   ├── client.ts                     # API client factory
│   │   └── endpoints.ts                  # API endpoint constants
│   ├── auth/
│   │   ├── session.ts                    # Server-side session
│   │   └── cookies.ts                    # Cookie helpers
│   ├── github/
│   │   ├── api.ts                        # GitHub API wrapper
│   │   └── types.ts                      # GitHub types
│   ├── utils/
│   │   ├── cn.ts                         # Class name utility
│   │   ├── date.ts                       # Date formatting
│   │   └── validation.ts                 # Zod schemas
│   ├── constants.ts                       # App constants
│   └── types.ts                           # Shared types
│
├── hooks/                                 # Custom React hooks
│   ├── useIssues.ts                      # Issue data hook
│   ├── useRepositories.ts                # Repository hook
│   ├── useDebounce.ts                    # Debounce hook
│   └── useLocalStorage.ts                # Local storage hook
│
├── styles/
│   └── globals.css                        # Global styles
│
├── public/
│   ├── images/
│   └── icons/
│
├── middleware.ts                          # Auth middleware
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 🎯 Key Architectural Changes

### 1. Route Groups for Layout Separation
- `(auth)` - Protected routes with workspace layout
- `(public)` - Public routes with minimal layout
- Parentheses prevent route segments in URL

### 2. Server-First Architecture
- Pages are server components by default
- Client components only where needed
- Server actions for mutations
- API routes for external proxying

### 3. Feature-Based Organization
- Components grouped by feature (auth, issues, workspace)
- Shared UI components in `ui/`
- Business logic in `lib/` and `actions/`

### 4. Clear Separation of Concerns
- **app/**: Routing and page composition
- **components/**: Presentational components
- **lib/**: Business logic and utilities
- **hooks/**: Reusable stateful logic
- **actions/**: Server-side mutations

### 5. Type Safety
- Centralized types in `lib/types.ts`
- Zod schemas for validation
- Strict TypeScript configuration

## 📝 Migration Steps

### Step 1: Remove Material-UI
### Step 2: Create new folder structure
### Step 3: Implement middleware
### Step 4: Refactor components
### Step 5: Add server actions
### Step 6: Update imports
### Step 7: Test thoroughly
