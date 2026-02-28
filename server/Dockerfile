FROM node:22-alpine AS base

# Install dependencies
# All deps (including devDependencies) are required because tsx is a devDependency
# but is needed to run TypeScript at runtime.
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 appuser

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN chown -R appuser:nodejs /app
USER appuser

EXPOSE 3001
ENV PORT=3001

CMD ["node_modules/.bin/tsx", "index.ts"]
