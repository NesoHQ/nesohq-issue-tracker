# NesOHQ Issue Tracker - Client

A Next.js application for managing GitHub issues across multiple repositories.

## Quick Start

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Documentation

Project documentation is in the shared root [`docs/`](../docs/) folder:

- **[Docs Home](../docs/README.md)**
- **[Quick Start](../docs/QUICKSTART.md)**
- **[Product Guide](../docs/PRODUCT_GUIDE.md)**
- **[Architecture](../docs/ARCHITECTURE.md)**
- **[Technical Reference](../docs/TECHNICAL_REFERENCE.md)**
- **[Engineering Practices](../docs/ENGINEERING_PRACTICES.md)**
- **[Troubleshooting](../docs/TROUBLESHOOTING.md)**

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
