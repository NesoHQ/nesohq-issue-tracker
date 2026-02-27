# Next.js Migration Guide

This client has been migrated from Vite + React Router to Next.js App Router.

## What Changed

### Routing
- **Before**: React Router with `BrowserRouter`
- **After**: Next.js App Router with file-based routing
  - `/` → `app/page.tsx`
  - `/auth/callback` → `app/auth/callback/page.tsx`
  - `/workspace` → `app/workspace/page.tsx`

### Navigation
- **Before**: `window.location.href` and React Router hooks
- **After**: Next.js `useRouter()` from `next/navigation`

### Configuration
- **Before**: Vite config with proxy
- **After**: Next.js config with rewrites
- **Environment**: Use `NEXT_PUBLIC_API_URL` instead of runtime config

### Build System
- **Before**: Vite
- **After**: Next.js (Turbopack in dev, optimized production builds)

## Installation

```bash
cd client
npm install
```

## Development

```bash
npm run dev
```

The app will run on http://localhost:3000

## Environment Variables

Create a `.env.local` file:

```env
# Optional - defaults to http://localhost:3001 in development
NEXT_PUBLIC_API_URL=
```

## Building for Production

```bash
npm run build
npm start
```

## What Stayed the Same

- All UI components (Radix UI, shadcn/ui)
- All business logic and state management
- Authentication flow (OAuth with GitHub)
- API communication patterns
- Styling (Tailwind CSS)
- All existing features and functionality

## Notes

- The backend server remains unchanged
- API calls are proxied through Next.js rewrites in development
- Client-side authentication is preserved for compatibility
- All components use `'use client'` directive as they rely on browser APIs
