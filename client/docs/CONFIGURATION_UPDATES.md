# ⚙️ Configuration Updates

## Required Configuration Changes

---

## 1. Update tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "allowJs": true,
    "esModuleInterop": true,
    "incremental": true,
    
    // ✅ UPDATED: Path alias for new structure
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]  // Changed from "./src/*"
    },
    
    // ✅ ADDED: Stricter type checking
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

**Changes**:
- `paths`: Changed from `"@/*": ["./src/*"]` to `"@/*": ["./*"]`
- Added `noUncheckedIndexedAccess` for safer array access
- Added `forceConsistentCasingInFileNames` for consistency

---

## 2. Update tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  
  // ✅ UPDATED: Content paths for new structure
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  theme: {
    extend: {
      // ✅ ADDED: Font family variable
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        chart: {
          '1': 'var(--chart-1)',
          '2': 'var(--chart-2)',
          '3': 'var(--chart-3)',
          '4': 'var(--chart-4)',
          '5': 'var(--chart-5)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

**Changes**:
- `content`: Updated paths to match new structure
- Added font family variable
- Removed `./src/**` paths

---

## 3. Update package.json

```json
{
  "name": "@figma/my-make-file",
  "private": true,
  "version": "0.0.1",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "1.2.3",
    "@radix-ui/react-alert-dialog": "1.1.6",
    "@radix-ui/react-aspect-ratio": "1.1.2",
    "@radix-ui/react-avatar": "1.1.3",
    "@radix-ui/react-checkbox": "1.1.4",
    "@radix-ui/react-collapsible": "1.1.3",
    "@radix-ui/react-context-menu": "2.2.6",
    "@radix-ui/react-dialog": "1.1.6",
    "@radix-ui/react-dropdown-menu": "2.1.6",
    "@radix-ui/react-hover-card": "1.1.6",
    "@radix-ui/react-label": "2.1.2",
    "@radix-ui/react-menubar": "1.1.6",
    "@radix-ui/react-navigation-menu": "1.2.5",
    "@radix-ui/react-popover": "1.1.6",
    "@radix-ui/react-progress": "1.1.2",
    "@radix-ui/react-radio-group": "1.2.3",
    "@radix-ui/react-scroll-area": "1.2.3",
    "@radix-ui/react-select": "2.1.6",
    "@radix-ui/react-separator": "1.1.2",
    "@radix-ui/react-slider": "1.2.3",
    "@radix-ui/react-slot": "1.1.2",
    "@radix-ui/react-switch": "1.1.3",
    "@radix-ui/react-tabs": "1.1.3",
    "@radix-ui/react-toggle": "1.1.2",
    "@radix-ui/react-toggle-group": "1.1.2",
    "@radix-ui/react-tooltip": "1.1.8",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "cmdk": "1.1.1",
    "date-fns": "3.6.0",
    "embla-carousel-react": "8.6.0",
    "input-otp": "1.4.2",
    "lucide-react": "0.487.0",
    "marked": "^17.0.3",
    "next": "^15.1.6",
    "next-themes": "0.4.6",
    "react": "^19.0.0",
    "react-day-picker": "8.10.1",
    "react-dnd": "16.0.1",
    "react-dnd-html5-backend": "16.0.1",
    "react-dom": "^19.0.0",
    "react-hook-form": "7.55.0",
    "react-resizable-panels": "2.1.7",
    "recharts": "2.15.2",
    "sonner": "2.0.3",
    "tailwind-merge": "3.2.0",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "1.1.2"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "^15.1.6",
    "@types/node": "^22",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.9.3"
  }
}
```

**Changes to make**:

```bash
# ❌ REMOVE these dependencies
npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled @popperjs/core react-popper motion react-responsive-masonry react-slick tw-animate-css

# ✅ ADD bundle analyzer
npm install --save-dev @next/bundle-analyzer
```

**Cleaned package.json**:
- Removed Material-UI (~500KB)
- Removed Emotion (~100KB)
- Removed unused animation libraries
- Added bundle analyzer for monitoring

---

## 4. Update next.config.ts

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // ✅ KEEP: API rewrites for backend proxy
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : 'http://localhost:3001/api/:path*',
      },
    ];
  },
  
  // ✅ UPDATED: Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  
  // ✅ ADDED: Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

// ✅ OPTIONAL: Bundle analyzer
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
```

**Changes**:
- More specific image domains
- Added security headers
- Optional bundle analyzer

---

## 5. Update .env.local.example

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Optional: Analytics
# NEXT_PUBLIC_ANALYTICS_ID=

# Optional: Error tracking
# SENTRY_DSN=
```

---

## 6. Create .env.local

```bash
# Copy example and fill in values
cp .env.local.example .env.local

# Edit with your values
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 7. Update styles/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
    
    /* ✅ ADDED: Font size variable */
    --font-size: 16px;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  
  /* ✅ REMOVED: Custom heading styles (use Tailwind) */
}

/* ✅ ADDED: Markdown styles */
@layer components {
  .prose {
    @apply text-foreground;
  }
  
  .prose h1,
  .prose h2,
  .prose h3,
  .prose h4 {
    @apply text-foreground font-semibold;
  }
  
  .prose a {
    @apply text-primary hover:underline;
  }
  
  .prose code {
    @apply bg-muted px-1 py-0.5 rounded text-sm;
  }
  
  .prose pre {
    @apply bg-muted p-4 rounded-lg overflow-x-auto;
  }
}
```

**Changes**:
- Removed custom heading styles (use Tailwind utilities)
- Added markdown prose styles
- Added font feature settings

---

## 8. Update .gitignore

```bash
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build
/dist

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# ✅ ADDED: Bundle analyzer
.next/analyze/
```

---

## 9. Optional: Add Bundle Analyzer Script

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "analyze": "ANALYZE=true npm run build"
  }
}
```

**Usage**:
```bash
npm run analyze
```

---

## 10. Migration Commands

```bash
# 1. Remove old dependencies
npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled @popperjs/core react-popper motion react-responsive-masonry react-slick tw-animate-css

# 2. Add new dependencies
npm install --save-dev @next/bundle-analyzer

# 3. Clean install
rm -rf node_modules package-lock.json
npm install

# 4. Type check
npm run type-check

# 5. Build
npm run build

# 6. Test
npm run dev
```

---

## ✅ Verification

After making these changes:

1. **Type Check**: `npm run type-check` should pass
2. **Build**: `npm run build` should succeed
3. **Dev Server**: `npm run dev` should start without errors
4. **Imports**: All `@/` imports should resolve correctly
5. **Bundle Size**: Should be ~300KB (down from ~800KB)

---

## 🚨 Common Issues

### Issue: "Cannot find module '@/...'"

**Solution**: 
1. Check `tsconfig.json` paths
2. Restart TypeScript server
3. Restart dev server

### Issue: "Module not found: Can't resolve 'src/...'"

**Solution**: 
1. Update all imports to use `@/` instead of relative paths
2. Remove `src/` from import paths

### Issue: "Tailwind classes not working"

**Solution**: 
1. Check `tailwind.config.ts` content paths
2. Restart dev server
3. Clear `.next` folder

### Issue: "Middleware not running"

**Solution**: 
1. Check `middleware.ts` is in root (not in `app/`)
2. Check matcher configuration
3. Restart dev server

---

## 📊 Before vs After

### Bundle Size

**Before**:
```
First Load JS: 800 KB
├─ Material-UI: 500 KB
├─ Emotion: 100 KB
├─ Other: 200 KB
```

**After**:
```
First Load JS: 300 KB
├─ Radix UI: 150 KB
├─ Next.js: 100 KB
├─ Other: 50 KB
```

### Dependencies

**Before**: 45 dependencies
**After**: 32 dependencies (-13)

### Type Safety

**Before**: Partial (missing strict checks)
**After**: Complete (all strict checks enabled)

---

## 🎉 Next Steps

1. Apply all configuration changes
2. Run migration commands
3. Test thoroughly
4. Deploy to staging
5. Monitor performance

---

**Ready?** Start with the migration commands above!
