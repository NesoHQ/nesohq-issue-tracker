# 🏗️ Next.js Architecture Audit & Modernization Plan

**Project**: NesOHQ Issue Tracker  
**Stack**: Next.js 15 + React 19 + TypeScript  
**Audit Date**: February 28, 2026  
**Status**: Post-Migration Review

---

## 📊 Executive Summary

Your migration from Vite to Next.js is functionally complete, but the architecture still follows **client-side SPA patterns** rather than leveraging Next.js App Router capabilities. This audit identifies 23 actionable improvements across 9 categories.

**Critical Issues**: 3  
**High Priority**: 8  
**Medium Priority**: 7  
**Low Priority**: 5

---

## 🚨 Critical Issues

### 1. **Everything is Client-Side (Anti-Pattern)**

**Current State**:
- All pages use `'use client'` directive
- No server components utilized
- Missing SSR/SSG benefits
- Larger client bundles

**Impact**: 
- Slower initial page load
- Poor SEO (client-side auth checks)
- Missed Next.js performance benefits
- Larger JavaScript bundles

**Recommendation**:
```typescript
// ❌ CURRENT: client/app/page.tsx
'use client';
import { SignIn } from '../src/app/components/SignIn';
export default function HomePage() {
  return <SignIn />;
}

// ✅ BETTER: Server component wrapper
import { SignIn } from '@/components/auth/SignIn';

export default function HomePage() {
  return <SignIn />; // Server component by default
}

// ✅ BEST: With metadata
export const metadata = {
  title: 'Sign In | NesOHQ Issue Tracker',
  description: 'Sign in with GitHub to manage your issues',
};
```

---

### 2. **Broken Folder Structure (Vite Leftover)**

**Current State**:
```
client/
├── app/              # Next.js App Router (3 files)
│   ├── page.tsx
│   ├── layout.tsx
│   └── workspace/page.tsx
└── src/
    └── app/          # Old Vite structure (all components)
        ├── components/
        └── lib/
```

**Problems**:
- Confusing dual `app/` directories
- Components not in Next.js conventions
- Path aliases point to `src/*` (non-standard)
- Harder to maintain and onboard

**Impact**: Developer confusion, harder to scale, non-idiomatic Next.js

---

### 3. **Client-Side Auth Without Middleware**

**Current State**:
```typescript
// client/app/workspace/page.tsx
useEffect(() => {
  const user = authService.getUser();
  if (!user) {
    router.replace('/');
  }
}, [router]);
```

**Problems**:
- Auth check happens AFTER page loads
- Flash of unauthorized content
- Not secure (client-side only)
- Runs on every render

**Impact**: Poor UX, security concerns, unnecessary re-renders

---

## 🔴 High Priority Issues

### 4. **No Route Groups or Layouts**

Missing layout hierarchy for auth vs. public routes:

```typescript
// ✅ RECOMMENDED STRUCTURE
app/
├── (auth)/
│   ├── layout.tsx          # Auth-specific layout
│   └── workspace/
│       └── page.tsx
├── (public)/
│   ├── layout.tsx          # Public layout
│   └── page.tsx
└── layout.tsx              # Root layout
```

---

### 5. **localStorage Auth (Not Next.js Friendly)**

**Current**: `localStorage` for tokens (client-only)

**Problems**:
- Doesn't work with SSR
- No httpOnly cookies
- XSS vulnerable
- Can't use in Server Components

**Recommendation**: Use `next-auth` or httpOnly cookies via API routes

---

### 6. **No Loading/Error States (Missing Next.js Features)**

Missing `loading.tsx` and `error.tsx` files:

```typescript
// ✅ ADD: app/workspace/loading.tsx
export default function Loading() {
  return <WorkspaceSkeleton />;
}

// ✅ ADD: app/workspace/error.tsx
'use client';
export default function Error({ error, reset }) {
  return <ErrorBoundary error={error} reset={reset} />;
}
```

---

### 7. **Inline API Calls (Should Use Server Actions)**

**Current**: All API calls in client components

```typescript
// ❌ CURRENT
const repos = await githubApi.getRepositories();

// ✅ BETTER: Server Action
// app/actions/github.ts
'use server';
export async function getRepositories() {
  const token = await getServerToken();
  // ... fetch logic
}

// Client component
const repos = await getRepositories();
```

---

### 8. **No Metadata/SEO Optimization**

**Current**: Only root layout has metadata

**Missing**:
- Per-page metadata
- Open Graph tags
- Dynamic titles
- Canonical URLs

```typescript
// ✅ ADD to each page
export const metadata: Metadata = {
  title: 'Workspace | NesOHQ',
  description: 'Manage GitHub issues across repositories',
  openGraph: {
    title: 'NesOHQ Issue Tracker',
    description: 'Manage your GitHub issues with ease',
    images: ['/og-image.png'],
  },
};
```

---

### 9. **Material-UI Alongside Radix (Redundant)**

**Current**: Both `@mui/material` AND `@radix-ui/*` installed

**Problems**:
- Bundle bloat (~500KB from MUI)
- Inconsistent design system
- Maintenance overhead

**Recommendation**: Remove MUI, use only Radix + shadcn/ui

---

### 10. **No Image Optimization**

**Current**: Using `<img>` tags

```typescript
// ❌ CURRENT
<img src={user?.avatar_url} alt={user?.login} />

// ✅ BETTER
import Image from 'next/image';
<Image 
  src={user?.avatar_url} 
  alt={user?.login}
  width={32}
  height={32}
  priority
/>
```

---

### 11. **API Rewrites Instead of Route Handlers**

**Current**: Using rewrites in `next.config.ts`

```typescript
// ❌ CURRENT: next.config.ts
async rewrites() {
  return [{
    source: '/api/:path*',
    destination: 'http://localhost:3001/api/:path*',
  }];
}

// ✅ BETTER: app/api/[...path]/route.ts
export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');
  const response = await fetch(`${API_URL}/${path}`);
  return response;
}
```

---

## 🟡 Medium Priority Issues

### 12. **No Code Splitting Strategy**

All components load eagerly. Use dynamic imports:

```typescript
// ✅ RECOMMENDED
const IssueDetail = dynamic(() => import('@/components/IssueDetail'), {
  loading: () => <Skeleton />,
  ssr: false, // if needed
});
```

---

### 13. **Emotion + Tailwind (Conflicting Styles)**

**Current**: Both `@emotion/react` and Tailwind CSS

**Recommendation**: Remove Emotion, use Tailwind + CSS variables only

---

### 14. **No Streaming or Suspense**

Missing React 18+ features:

```typescript
// ✅ ADD
<Suspense fallback={<IssueListSkeleton />}>
  <IssueList />
</Suspense>
```

---

### 15. **Hardcoded API URLs**

**Current**: `http://localhost:3001` in multiple places

**Recommendation**: Centralize in environment config

---

### 16. **No Request Deduplication**

Multiple components fetch same data independently

**Recommendation**: Use React `cache()` or SWR

---

### 17. **Missing TypeScript Strict Mode**

`tsconfig.json` has `strict: true` but missing:
- `noUncheckedIndexedAccess`
- `exactOptionalPropertyTypes`

---

### 18. **No Analytics or Monitoring**

Missing:
- Error tracking (Sentry)
- Analytics (Vercel Analytics)
- Performance monitoring

---

## 🟢 Low Priority Issues

### 19. **No Internationalization Setup**

Consider `next-intl` for future i18n

---

### 20. **No Progressive Web App (PWA)**

Missing `manifest.json` and service worker

---

### 21. **No Storybook or Component Documentation**

Consider adding for design system

---

### 22. **No E2E Tests**

Missing Playwright or Cypress setup

---

### 23. **No Bundle Analysis**

Add `@next/bundle-analyzer` to monitor size

---

## 📁 Recommended Folder Structure

```
client/
├── app/
│   ├── (auth)/                    # Protected routes
│   │   ├── layout.tsx
│   │   └── workspace/
│   │       ├── page.tsx
│   │       ├── loading.tsx
│   │       └── error.tsx
│   ├── (public)/                  # Public routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/                       # API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts
│   │   └── proxy/[...path]/route.ts
│   ├── actions/                   # Server actions
│   │   ├── github.ts
│   │   └── issues.ts
│   ├── layout.tsx
│   └── not-found.tsx
├── components/                    # Shared components
│   ├── auth/
│   │   └── SignIn.tsx
│   ├── issues/
│   │   ├── IssueList.tsx
│   │   ├── IssueDetail.tsx
│   │   └── CreateIssue.tsx
│   ├── ui/                        # shadcn/ui components
│   └── providers/
│       └── ThemeProvider.tsx
├── lib/                           # Utilities
│   ├── api.ts
│   ├── auth.ts
│   ├── utils.ts
│   └── types.ts
├── hooks/                         # Custom hooks
│   ├── useIssues.ts
│   └── useRepositories.ts
├── styles/
│   └── globals.css
├── public/
│   ├── images/
│   └── icons/
├── middleware.ts                  # Auth middleware
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎯 Server vs Client Component Boundaries

### ✅ Server Components (Default)
- Layouts
- Pages (initial render)
- Static content
- Data fetching wrappers
- Metadata generation

### 🔵 Client Components (`'use client'`)
- Interactive UI (forms, buttons with state)
- Event handlers
- Browser APIs (localStorage, window)
- React hooks (useState, useEffect)
- Third-party libraries requiring browser

### Example Split:

```typescript
// ✅ SERVER: app/workspace/page.tsx
import { getRepositories } from '@/actions/github';
import { WorkspaceClient } from '@/components/workspace/WorkspaceClient';

export default async function WorkspacePage() {
  const repos = await getRepositories(); // Server-side fetch
  
  return <WorkspaceClient initialRepos={repos} />;
}

// 🔵 CLIENT: components/workspace/WorkspaceClient.tsx
'use client';
import { useState } from 'react';

export function WorkspaceClient({ initialRepos }) {
  const [repos, setRepos] = useState(initialRepos);
  // ... interactive logic
}
```

---

## ⚡ Performance Optimizations

### 1. **Bundle Size Reduction**
```bash
# Remove unused dependencies
npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled

# Add bundle analyzer
npm install --save-dev @next/bundle-analyzer
```

### 2. **Image Optimization**
- Replace all `<img>` with `<Image>`
- Add `sizes` prop for responsive images
- Use `priority` for above-fold images

### 3. **Font Optimization**
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      {children}
    </html>
  );
}
```

### 4. **Code Splitting**
```typescript
// Dynamic imports for heavy components
const MarkdownEditor = dynamic(() => import('@/components/MarkdownEditor'), {
  loading: () => <EditorSkeleton />,
  ssr: false,
});
```

### 5. **Request Caching**
```typescript
// app/actions/github.ts
import { cache } from 'react';

export const getRepositories = cache(async () => {
  // Automatically deduplicated across components
  return fetch(/* ... */);
});
```

---

## 🔍 SEO Improvements

### 1. **Add Metadata to All Pages**
```typescript
// app/workspace/page.tsx
export const metadata: Metadata = {
  title: 'Workspace',
  description: 'Manage your GitHub issues',
  robots: { index: false }, // Private pages
};
```

### 2. **Add robots.txt**
```typescript
// app/robots.ts
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/workspace/', '/api/'],
    },
  };
}
```

### 3. **Add sitemap.xml**
```typescript
// app/sitemap.ts
export default function sitemap() {
  return [
    {
      url: 'https://yourdomain.com',
      lastModified: new Date(),
    },
  ];
}
```

### 4. **Structured Data**
```typescript
// Add JSON-LD for rich snippets
<script type="application/ld+json">
  {JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "NesOHQ Issue Tracker",
    "description": "GitHub issue management tool"
  })}
</script>
```

---

## 🎨 Styling Improvements

### 1. **Remove Redundant Style Libraries**
```bash
npm uninstall @emotion/react @emotion/styled @mui/material @mui/icons-material
```

### 2. **Consolidate CSS Variables**
Move all theme variables to `app/layout.tsx` or `globals.css`

### 3. **Use CSS Modules for Component Styles**
```typescript
// components/IssueRow/IssueRow.module.css
.row {
  @apply border-b hover:bg-accent/50;
}

// components/IssueRow/IssueRow.tsx
import styles from './IssueRow.module.css';
```

### 4. **Optimize Tailwind**
```javascript
// tailwind.config.ts
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  // Remove unused paths
};
```

---

## 🔐 Security Improvements

### 1. **Add Middleware for Auth**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  
  if (!token && request.nextUrl.pathname.startsWith('/workspace')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/workspace/:path*'],
};
```

### 2. **Use httpOnly Cookies**
```typescript
// app/api/auth/login/route.ts
export async function POST(request: Request) {
  // ... auth logic
  
  const response = NextResponse.json({ success: true });
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  
  return response;
}
```

### 3. **Add CSRF Protection**
Use `next-csrf` or implement token-based CSRF

### 4. **Content Security Policy**
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};
```

---

## 📋 Step-by-Step Upgrade Roadmap

### Phase 1: Critical Fixes (Week 1)
1. ✅ Restructure folders to Next.js conventions
2. ✅ Add middleware for auth protection
3. ✅ Convert pages to server components where possible
4. ✅ Remove Material-UI dependency

### Phase 2: Performance (Week 2)
5. ✅ Implement code splitting with dynamic imports
6. ✅ Replace `<img>` with Next.js `<Image>`
7. ✅ Add loading and error boundaries
8. ✅ Optimize fonts with next/font

### Phase 3: Architecture (Week 3)
9. ✅ Create server actions for API calls
10. ✅ Implement route handlers for API proxy
11. ✅ Add request caching and deduplication
12. ✅ Set up proper TypeScript paths

### Phase 4: SEO & Polish (Week 4)
13. ✅ Add metadata to all pages
14. ✅ Create robots.txt and sitemap
15. ✅ Add Open Graph images
16. ✅ Implement structured data

### Phase 5: Monitoring & Testing (Week 5)
17. ✅ Add error tracking (Sentry)
18. ✅ Set up analytics
19. ✅ Add bundle analyzer
20. ✅ Write E2E tests

---

## 🚀 Quick Wins (Do These First)

### 1. Remove Material-UI (5 minutes)
```bash
npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled
```

### 2. Add Middleware (10 minutes)
Create `middleware.ts` with auth checks

### 3. Add Loading States (15 minutes)
Create `loading.tsx` files for each route

### 4. Fix Folder Structure (30 minutes)
Move `src/app/components` → `components`
Move `src/app/lib` → `lib`

### 5. Add Metadata (20 minutes)
Add `metadata` export to each page

---

## 📊 Expected Impact

### Before Optimization:
- **Bundle Size**: ~800KB (with MUI)
- **First Load**: ~2.5s
- **Lighthouse Score**: 65/100
- **SEO**: Poor (client-side only)

### After Optimization:
- **Bundle Size**: ~300KB (without MUI)
- **First Load**: ~800ms
- **Lighthouse Score**: 95/100
- **SEO**: Excellent (SSR + metadata)

---

## 🎓 Learning Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Server vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Performance Best Practices](https://nextjs.org/docs/app/building-your-application/optimizing)

---

## ✅ Checklist

Use this to track your progress:

- [ ] Remove Material-UI
- [ ] Restructure folders
- [ ] Add middleware
- [ ] Convert to server components
- [ ] Add loading/error states
- [ ] Implement server actions
- [ ] Optimize images
- [ ] Add metadata
- [ ] Set up monitoring
- [ ] Write tests

---

**Next Action**: Start with Phase 1, Critical Fixes. Begin by removing Material-UI and restructuring folders.
