# Quick Start Guide

Get the Next.js client up and running in 3 steps:

## 1. Install

```bash
cd client
npm install
```

## 2. Configure (Optional)

Create `.env.local` if you need a custom API URL:

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
```

If you skip this, the app will use Next.js rewrites to proxy to `http://localhost:3001` automatically.

## 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## That's it! 🎉

The app should now be running. Make sure your backend server is also running on port 3001.

## Common Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Lint
npm run lint
```

## Need Help?

- See [UPGRADE_STEPS.md](./UPGRADE_STEPS.md) for detailed setup
- See [MIGRATION.md](./MIGRATION.md) for migration details
- Check [README.md](./README.md) for full documentation
