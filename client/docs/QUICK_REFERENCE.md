# 🚀 Quick Reference Guide

## One-Page Cheat Sheet for the Refactored Architecture

---

## 📁 Folder Structure at a Glance

```
client/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Protected routes
│   │   └── workspace/
│   │       ├── page.tsx         # Server component
│   │       ├── loading.tsx      # Loading UI
│   │       └── error.tsx        # Error boundary
│   ├── (public)/                # Public routes
│   │   └── page.tsx             # Sign in
│   ├── actions/                 # Server actions
│   │   ├── auth.ts
│   │   ├── github.ts
│   │   └── issues.ts
│   └── layout.tsx               # Root layout
├── components/                   # React components
│   ├── auth/
│   ├── issues/
│   ├── workspace/
│   ├── ui/                      # shadcn/ui
│   └── providers/
├── lib/                         # Utilities
│   ├── types.ts                 # All types
│   ├── constants.ts             # All constants
│   ├── auth/
│   │   └── cookies.ts           # Server-side auth
│   └── utils/
│       ├── cn.ts                # Class names
│       └── date.ts              # Date formatting
├── hooks/                       # Custom hooks
├── styles/
│   └── globals.css
├── middleware.ts                # Auth middleware
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎯 When to Use What

### Server Components (Default)
```typescript
// ✅ Use for:
// - Layouts
// - Static content
// - Data fetching
// - SEO-critical pages

export default async function Page() {
  const data = await fetchData(); // Server-side
  return <ClientComponent data={data} />;
}
```

### Client Components
```typescript
'use client';

// ✅ Use for:
// - Interactive UI (forms, buttons)
// - React hooks (useState, useEffect)
// - Browser APIs (localStorage, window)
// - Event handlers

export function ClientComponent() {
  const [state, setState] = useState();
  return <button onClick={...}>Click</button>;
}
```

### Server Actions
```typescript
'use server';

// ✅ Use for:
// - Mutations (create, update, delete)
// - Secure operations
// - Database queries
// - API calls with tokens

export async function createIssue(data) {
  const token = await getAuthToken(); // Server-only
  // ... mutation logic
}
```

### API Routes
```typescript
// ✅ Use for:
// - Webhooks
// - External API proxying
// - File uploads
// - Third-party integrations

export async function POST(request: Request) {
  // ... handle request
}
```

---

## 🔑 Key Patterns

### Pattern 1: Server Page + Client Shell

```typescript
// app/(auth)/workspace/page.tsx (Server)
export default async function WorkspacePage() {
  const data = await fetchData(); // Server-side
  return <WorkspaceShell initialData={data} />;
}

// components/workspace/WorkspaceShell.tsx (Client)
'use client';
export function WorkspaceShell({ initialData }) {
  const [data, setData] = useState(initialData);
  // ... interactive logic
}
```

### Pattern 2: Server Action + Client Form

```typescript
// app/actions/issues.ts (Server)
'use server';
export async function createIssue(formData) {
  // ... server-side logic
  revalidateTag('issues');
}

// components/issues/CreateForm.tsx (Client)
'use client';
export function CreateForm() {
  async function handleSubmit(formData) {
    await createIssue(formData); // Call server action
  }
  return <form action={handleSubmit}>...</form>;
}
```

### Pattern 3: Middleware + Protected Route

```typescript
// middleware.ts
export function middleware(request) {
  if (!request.cookies.get('token')) {
    return NextResponse.redirect('/');
  }
}

// app/(auth)/workspace/page.tsx
export default async function WorkspacePage() {
  // Already authenticated by middleware
  return <Workspace />;
}
```

---

## 📝 Common Tasks

### Add a New Page

```bash
# 1. Create page file
touch app/(auth)/settings/page.tsx

# 2. Add loading state
touch app/(auth)/settings/loading.tsx

# 3. Add error boundary
touch app/(auth)/settings/error.tsx
```

```typescript
// app/(auth)/settings/page.tsx
export const metadata = {
  title: 'Settings',
};

export default async function SettingsPage() {
  return <SettingsContent />;
}
```

### Add a Server Action

```typescript
// app/actions/settings.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function updateSettings(data) {
  // ... update logic
  revalidatePath('/settings');
  return { success: true };
}
```

### Add a Client Component

```typescript
// components/settings/SettingsForm.tsx
'use client';

import { updateSettings } from '@/app/actions/settings';

export function SettingsForm() {
  async function handleSubmit(formData) {
    const result = await updateSettings(formData);
    if (result.success) {
      toast.success('Settings updated');
    }
  }
  
  return <form action={handleSubmit}>...</form>;
}
```

### Add Middleware Protection

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  const path = request.nextUrl.pathname;
  
  // Add new protected route
  if (path.startsWith('/settings') && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/workspace/:path*', '/settings/:path*'],
};
```

---

## 🔍 Import Patterns

### Correct Imports

```typescript
// ✅ Use @ alias for all imports
import { Button } from '@/components/ui/button';
import { createIssue } from '@/app/actions/issues';
import type { Issue } from '@/lib/types';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
```

### Incorrect Imports

```typescript
// ❌ Don't use relative paths
import { Button } from '../../../components/ui/button';

// ❌ Don't use src/ prefix
import { Button } from '@/src/components/ui/button';

// ❌ Don't import from old structure
import { Button } from '@/src/app/components/ui/button';
```

---

## 🎨 Styling Patterns

### Tailwind Classes

```typescript
// ✅ Use cn() utility for conditional classes
import { cn } from '@/lib/utils/cn';

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  variant === 'primary' && 'primary-classes'
)} />
```

### CSS Variables

```typescript
// ✅ Use CSS variables for theme colors
<div className="bg-primary text-primary-foreground" />

// ✅ Access in inline styles
<div style={{ color: 'var(--primary)' }} />
```

---

## 🔐 Authentication Patterns

### Server-Side Auth Check

```typescript
// ✅ In Server Components
import { getUserFromCookie } from '@/lib/auth/cookies';

export default async function Page() {
  const user = await getUserFromCookie();
  if (!user) redirect('/');
  return <Content user={user} />;
}
```

### Client-Side Auth Display

```typescript
// ✅ In Client Components (display only)
'use client';

export function UserMenu({ user }) {
  return (
    <DropdownMenu>
      <Avatar src={user.avatar_url} />
      {/* ... */}
    </DropdownMenu>
  );
}
```

### Sign Out

```typescript
// ✅ Use server action
'use client';
import { signOut } from '@/app/actions/auth';

export function SignOutButton() {
  return (
    <button onClick={() => signOut()}>
      Sign out
    </button>
  );
}
```

---

## 📊 Data Fetching Patterns

### Fetch on Server

```typescript
// ✅ Server Component
export default async function Page() {
  const data = await getRepositories(); // Cached automatically
  return <List data={data} />;
}
```

### Fetch on Client (when needed)

```typescript
// ✅ Client Component with useEffect
'use client';

export function DynamicList() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    async function load() {
      const result = await getRepositories();
      setData(result);
    }
    load();
  }, []);
  
  return <List data={data} />;
}
```

### Mutate with Server Action

```typescript
// ✅ Client Component calling server action
'use client';
import { createIssue } from '@/app/actions/issues';

export function CreateForm() {
  async function handleSubmit(formData) {
    const result = await createIssue(formData);
    if (result.success) {
      // ... handle success
    }
  }
  
  return <form action={handleSubmit}>...</form>;
}
```

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Using 'use client' Everywhere

```typescript
// ❌ BAD: Unnecessary client component
'use client';
export default function Page() {
  return <StaticContent />;
}

// ✅ GOOD: Server component by default
export default function Page() {
  return <StaticContent />;
}
```

### ❌ Mistake 2: Fetching on Client When Server Works

```typescript
// ❌ BAD: Client-side fetch
'use client';
export default function Page() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);
  return <List data={data} />;
}

// ✅ GOOD: Server-side fetch
export default async function Page() {
  const data = await getData();
  return <List data={data} />;
}
```

### ❌ Mistake 3: Exposing Tokens to Client

```typescript
// ❌ BAD: Token in client
'use client';
const token = localStorage.getItem('token');
fetch(url, { headers: { Authorization: `Bearer ${token}` } });

// ✅ GOOD: Token on server
'use server';
export async function getData() {
  const token = await getAuthToken(); // Server-only
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } });
}
```

### ❌ Mistake 4: Not Using Middleware

```typescript
// ❌ BAD: Client-side auth check
'use client';
useEffect(() => {
  if (!user) router.push('/');
}, []);

// ✅ GOOD: Middleware auth check
// middleware.ts
export function middleware(request) {
  if (!request.cookies.get('token')) {
    return NextResponse.redirect('/');
  }
}
```

---

## 🎯 Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run linter
npm run type-check       # Check TypeScript

# Analysis
npm run analyze          # Analyze bundle size

# Cleanup
rm -rf .next             # Clear Next.js cache
rm -rf node_modules      # Clear dependencies
npm install              # Reinstall dependencies
```

---

## 📚 File Templates

### New Page Template

```typescript
// app/(auth)/[feature]/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feature Name',
  description: 'Feature description',
};

export default async function FeaturePage() {
  // Fetch data on server
  const data = await fetchData();
  
  return <FeatureContent data={data} />;
}
```

### New Server Action Template

```typescript
// app/actions/[feature].ts
'use server';

import { revalidateTag } from 'next/cache';
import { getAuthToken } from '@/lib/auth/cookies';

export async function performAction(input: any) {
  try {
    const token = await getAuthToken();
    // ... action logic
    revalidateTag('feature');
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed' 
    };
  }
}
```

### New Client Component Template

```typescript
// components/[feature]/Component.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ComponentProps {
  initialData: any;
}

export function Component({ initialData }: ComponentProps) {
  const [data, setData] = useState(initialData);
  
  return (
    <div>
      {/* ... component content */}
    </div>
  );
}
```

---

## ✅ Quick Checklist

Before committing:

- [ ] All imports use `@/` alias
- [ ] No `'use client'` on server components
- [ ] Server actions have `'use server'`
- [ ] Types imported from `@/lib/types`
- [ ] Constants imported from `@/lib/constants`
- [ ] No tokens exposed to client
- [ ] Metadata added to pages
- [ ] Loading states added
- [ ] Error boundaries added
- [ ] TypeScript errors resolved

---

## 🔗 Quick Links

- [Full Refactoring Guide](./REFACTORING_GUIDE.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Configuration Updates](./CONFIGURATION_UPDATES.md)
- [Architecture Audit](./ARCHITECTURE_AUDIT.md)

---

**Print this page and keep it handy while refactoring!**
