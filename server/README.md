# Server

Express auth server for OAuth token exchange.

## Structure

```
server/
├── index.ts           # Entry point – starts the server
├── app.ts             # Express app setup (middleware, routes)
├── config/            # Configuration
│   └── index.ts       # Env vars, paths, helpers
├── constants/         # App constants
│   └── index.ts       # GitHub API URLs
├── routes/            # API routes
│   ├── index.ts       # Mounts all routes under /api
│   └── auth.routes.ts # POST /api/auth/exchange
└── services/          # Business logic / external APIs
    ├── index.ts
    └── github.service.ts # OAuth token exchange, fetch user
```

## Adding a New Route

1. Create `routes/your-feature.routes.ts` with a Router
2. Export the router as default
3. In `routes/index.ts`, add: `router.use('/your-feature', yourFeatureRoutes)`

## Adding a New Service

1. Create `services/your-service.ts` with your logic
2. Export from `services/index.ts`
3. Use in route handlers
