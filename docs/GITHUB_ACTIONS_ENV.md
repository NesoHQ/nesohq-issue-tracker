# GitHub Actions Environment Configuration

## Problem Solved
The OAuth redirect was going to `localhost:3000` because the server wasn't receiving the correct `GH_REDIRECT_URI` environment variable.

## Root Cause
Environment variable name mismatch:
- Server code expects: `GH_REDIRECT_URI`
- You were using: `GITHUB_REDIRECT_URI`

## Required GitHub Configuration

### Secrets (Encrypted)
```
GH_CLIENT_ID=Ov23liWFBY2V44492XIc
GH_CLIENT_SECRET=dfbbb128f1f780f9b92196752e7017c7e1f8cc51
```

### Variables (Plain Text)
```
NEXT_PUBLIC_API_URL=https://tracker-api.nesohq.org
GH_REDIRECT_URI=https://tracker.nesohq.org/auth/callback
CORS_ORIGIN=https://tracker.nesohq.org
```

## Action Required

⚠️ **You need to rename your GitHub Variable:**

1. Go to: Settings → Secrets and variables → Actions → Variables
2. Delete the variable named `GITHUB_REDIRECT_URI`
3. Create a new variable named `GH_REDIRECT_URI` with value: `https://tracker.nesohq.org/auth/callback`

## Files Updated
- ✅ `server/.env` - Fixed variable name
- ✅ `server/.env.example` - Updated example
- ✅ `server/Dockerfile` - Updated build arg name
- ✅ `.github/workflows/docker-build.yaml` - Updated to use correct variable name

## Testing Locally
```bash
cd server
docker build \
  --build-arg GH_CLIENT_ID=Ov23liWFBY2V44492XIc \
  --build-arg GH_CLIENT_SECRET=dfbbb128f1f780f9b92196752e7017c7e1f8cc51 \
  --build-arg GH_REDIRECT_URI=https://tracker.nesohq.org/auth/callback \
  --build-arg CORS_ORIGIN=https://tracker.nesohq.org \
  -t server-test .

docker run -p 3001:3001 server-test

# Test the config endpoint
curl http://localhost:3001/api/auth/config
# Should return: {"client_id":"...","redirect_uri":"https://tracker.nesohq.org/auth/callback"}
```
