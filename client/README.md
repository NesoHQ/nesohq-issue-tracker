# NesOHQ Issue Tracker - Client

A Next.js application for managing GitHub issues across multiple repositories.

## Quick Start

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Documentation

All documentation has been moved to the [`docs/`](./docs/) folder:

- **[Quick Start Guide](./docs/QUICKSTART.md)** - Get up and running in 3 steps
- **[README](./docs/README.md)** - Full project documentation
- **[Migration Guide](./docs/MIGRATION.md)** - Vite to Next.js migration details
- **[Upgrade Steps](./docs/UPGRADE_STEPS.md)** - Step-by-step upgrade instructions
- **[Architecture Overview](./docs/ARCHITECTURE.md)** - Before/after architecture comparison
- **[Migration Summary](./docs/MIGRATION_SUMMARY.md)** - Technical migration details
- **[Migration Complete](./docs/MIGRATION_COMPLETE.md)** - Migration completion checklist
- **[Verification Checklist](./docs/VERIFICATION_CHECKLIST.md)** - Testing checklist

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Radix UI / shadcn/ui

## Features

- Multi-repository issue management
- GitHub OAuth authentication
- Rich markdown editor
- Dark mode support
- Responsive design

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run linter
```

## Backend

Make sure the backend server is running on port 3001. See `../server` for details.
