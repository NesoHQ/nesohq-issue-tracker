# NesOHQ Issue Tracker - Client

A Next.js application for managing GitHub issues across multiple repositories.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Radix UI, shadcn/ui
- **Styling**: Tailwind CSS
- **Authentication**: GitHub OAuth
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Backend server running (see `../server`)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file (optional):

```env
# API Base URL - defaults to http://localhost:3001 in development
NEXT_PUBLIC_API_URL=
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Features

- Multi-repository issue management
- GitHub OAuth authentication
- Rich markdown editor with live preview
- Advanced filtering and search
- Image uploads and clipboard paste
- Draft autosave
- Dark mode support
- Responsive design

## Project Structure

```
client/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home/Sign-in page
│   ├── auth/callback/       # OAuth callback
│   └── workspace/           # Main workspace
├── src/
│   └── app/
│       ├── components/      # React components
│       ├── lib/            # Utilities and API clients
│       └── styles/         # Global styles
├── public/                  # Static assets
└── next.config.ts          # Next.js configuration
```

## API Integration

The client communicates with the backend server via:
- Next.js rewrites (development)
- Direct API calls (production with NEXT_PUBLIC_API_URL)

## Migration Notes

This project was migrated from Vite to Next.js. See [MIGRATION.md](./MIGRATION.md) for details.
