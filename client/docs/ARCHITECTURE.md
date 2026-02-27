# Architecture Overview

## Before (Vite + React Router)

```
client/
├── src/
│   ├── main.tsx                    # Entry point
│   ├── app/
│   │   ├── App.tsx                 # Router setup
│   │   ├── components/             # React components
│   │   └── lib/                    # Utilities
│   └── styles/                     # CSS files
├── public/                         # Static assets
├── index.html                      # HTML template
├── vite.config.ts                  # Vite config
└── package.json

Flow: index.html → main.tsx → App.tsx (BrowserRouter) → Components
Dev Server: http://localhost:5173
Build: Vite
```

## After (Next.js App Router)

```
client/
├── app/
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Home route (/)
│   ├── auth/
│   │   └── callback/
│   │       └── page.tsx            # /auth/callback
│   └── workspace/
│       └── page.tsx                # /workspace
├── src/
│   └── app/
│       ├── components/             # React components (unchanged)
│       └── lib/                    # Utilities (unchanged)
├── public/                         # Static assets (unchanged)
├── next.config.ts                  # Next.js config
└── package.json

Flow: Next.js → app/layout.tsx → app/page.tsx → Components
Dev Server: http://localhost:3000
Build: Next.js (Turbopack)
```

## Routing Comparison

### Before (React Router)
```tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<SignIn />} />
    <Route path="/auth/callback" element={<OAuthCallback />} />
    <Route path="/workspace" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
  </Routes>
</BrowserRouter>
```

### After (Next.js)
```
app/
├── page.tsx                    → /
├── auth/callback/page.tsx      → /auth/callback
└── workspace/page.tsx          → /workspace
```

## Navigation Comparison

### Before
```tsx
// Redirect
window.location.href = '/workspace';

// Navigate
import { useNavigate } from 'react-router';
const navigate = useNavigate();
navigate('/workspace');
```

### After
```tsx
// Redirect (external)
window.location.href = 'https://github.com/...';

// Navigate (internal)
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/workspace');
```

## API Communication

### Before (Vite Proxy)
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```

### After (Next.js Rewrites)
```typescript
// next.config.ts
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:3001/api/:path*',
    },
  ];
}
```

## Environment Variables

### Before
```javascript
// public/config.js
window.APP_CONFIG = {
  apiBaseUrl: "",
};

// Usage
const url = window.APP_CONFIG?.apiBaseUrl;
```

### After
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001

# Usage
const url = process.env.NEXT_PUBLIC_API_URL;
```

## Build & Deploy

### Before
```bash
# Development
npm run dev          # Vite dev server on :5173

# Production
npm run build        # Creates dist/
npm run preview      # Preview production build
```

### After
```bash
# Development
npm run dev          # Next.js dev server on :3000

# Production
npm run build        # Creates .next/
npm start            # Runs production server
```

## Component Changes

### Minimal Changes Required

Most components work as-is, just need 'use client' directive:

```tsx
'use client';  // Add this line

import { useState } from 'react';

export function MyComponent() {
  // Component code unchanged
}
```

### Why 'use client'?

Components need this directive when they:
- Use React hooks (useState, useEffect, etc.)
- Access browser APIs (localStorage, window, etc.)
- Use event handlers (onClick, onChange, etc.)

## Data Flow

### Authentication Flow (Unchanged)
```
1. User clicks "Sign in with GitHub"
2. Redirect to GitHub OAuth
3. GitHub redirects to /auth/callback?code=...
4. Exchange code for token
5. Store token in localStorage
6. Redirect to /workspace
```

### API Calls (Unchanged)
```
Component → lib/github-api.ts → Backend API → GitHub API
                ↓
         localStorage (token)
```

## Performance Benefits

### Automatic Optimizations
- Code splitting per route
- Image optimization (if using next/image)
- Font optimization
- Automatic static optimization
- Better caching strategies

### Bundle Size
- Smaller initial bundle
- Route-based code splitting
- Tree shaking improvements

## Migration Impact

### Zero Impact
- ✅ All UI components
- ✅ All business logic
- ✅ Authentication flow
- ✅ API communication
- ✅ Styling and themes
- ✅ Backend server

### Changed
- 🔄 Build system (Vite → Next.js)
- 🔄 Routing (React Router → App Router)
- 🔄 Dev server port (5173 → 3000)
- 🔄 Navigation hooks

### Improved
- ⚡ Build performance
- ⚡ Dev server speed
- ⚡ Production optimizations
- ⚡ Code splitting
