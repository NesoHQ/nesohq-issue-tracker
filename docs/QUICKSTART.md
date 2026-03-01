# Quickstart

This guide gets the full stack running locally:

- Next.js frontend (`client`, port `3000`)
- Express OAuth service (`server`, port `3001`)

## Prerequisites

- Node.js `22.x`
- npm `10+`
- A GitHub OAuth App (for login flow)

## 1. Configure Environment Variables

### Server

Copy the template:

```bash
cp server/.env.example server/.env
```

Set required values in `server/.env`:

- `GH_CLIENT_ID`
- `GH_CLIENT_SECRET`

Optional but recommended:

- `GH_REDIRECT_URI=http://localhost:3000/auth/callback`
- `CORS_ORIGIN=http://localhost:3000`

### Client

Copy the template:

```bash
cp client/.env.local.example client/.env.local
```

Set:

- `NEXT_PUBLIC_API_URL=http://localhost:3001`

## 2. Install Dependencies

```bash
cd server && npm install
cd ../client && npm install
```

## 3. Start Services

Run in two terminals:

Terminal 1:

```bash
cd server
npm run dev
```

Terminal 2:

```bash
cd client
npm run dev
```

Open: `http://localhost:3000`

## 4. Smoke Test Checklist

1. Home page renders sign-in UI.
2. Click `Sign in with GitHub`.
3. OAuth callback returns to `/auth/callback`.
4. You are redirected to `/workspace`.
5. Repositories and issues load.
6. Create or edit an issue to verify write path.

## 5. Docker container run on local machine

1. server
   - `docker build --no-cache --network=host -t nesohq-server:local ./server`
   - `docker run --rm --env-file server/.env -p 3001:3001 nesohq-server:local`

2. client
   - `docker build --no-cache --network=host -t nesohq-client:local --build-arg NEXT_PUBLIC_API_URL=http://localhost:3001 ./client`
   - `docker run --rm -p 3000:3000 --name nesohq-client nesohq-client:local`

## Common Setup Notes

- If sign-in fails immediately, verify `GH_CLIENT_ID` and `GH_CLIENT_SECRET`.
- If callback fails, verify OAuth app callback URL and `GH_REDIRECT_URI` alignment.
- If `/api` calls fail with CORS errors, set `CORS_ORIGIN` to frontend origin.
- `client/public/config.js` can override API base URL at runtime for deployed builds.
