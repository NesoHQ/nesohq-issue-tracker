# Troubleshooting

This page lists common runtime issues and practical fixes.

## OAuth Not Configured

### Symptom

- Sign-in fails
- `/api/auth/config` returns `OAuth not configured`

### Cause

- Missing `GH_CLIENT_ID` or `GH_CLIENT_SECRET` in `server/.env`

### Fix

1. Set `GH_CLIENT_ID` and `GH_CLIENT_SECRET`.
2. Restart the server.

## OAuth Callback or Redirect URI Errors

### Symptom

- Authentication fails after GitHub redirect
- Error mentions redirect URI mismatch

### Cause

- `GH_REDIRECT_URI` does not match GitHub OAuth app callback URL exactly

### Fix

1. Set the same callback URL in:
   - GitHub OAuth app settings
   - `server/.env` as `GH_REDIRECT_URI`
2. Use `http://localhost:3000/auth/callback` for local development.

## CORS Errors on `/api/auth/exchange`

### Symptom

- Browser blocks request with CORS policy error

### Cause

- Frontend origin not present in `CORS_ORIGIN`

### Fix

1. Set `CORS_ORIGIN=http://localhost:3000` (or deployed frontend origin).
2. Restart server.

## "Could not resolve to an Issue with the number ..."

### Symptom

- Linked pull requests fail to load for some entries

### Cause

- A pull request number was treated as an issue number

### Current Mitigation

- Issue fetch filters out PR objects.
- Linked PR GraphQL query uses `issueOrPullRequest` and ignores non-issue nodes.

## "Session expired. Please sign in again."

### Symptom

- Workspace redirects to sign-in unexpectedly

### Cause

- Missing or expired auth token cookie
- Invalid GitHub token

### Fix

1. Sign out and sign in again.
2. Confirm cookies are enabled in browser.
3. Verify token has required scope (`read:user repo`).

## API Returned HTML Instead of JSON

### Symptom

- Client error:
  - `API returned HTML instead of JSON. Check /config.js -> APP_CONFIG.apiBaseUrl or the /api dev proxy.`

### Cause

- API base URL points to a non-API host/path

### Fix

1. Verify `client/public/config.js` (`window.APP_CONFIG.apiBaseUrl`).
2. Verify `NEXT_PUBLIC_API_URL`.
3. Verify Next rewrite in `client/next.config.ts`.

## Linked PR Status Appears Delayed

### Symptom

- Recent PR link updates are not immediately visible

### Cause

- Read cache revalidation window (default 60s)

### Fix

1. Wait for cache window.
2. Refresh the page.
3. Trigger issue mutation (which calls `revalidateTag('github')`) if needed.

