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

# Accept build arguments for environment variables
ARG GH_CLIENT_ID
ARG GH_CLIENT_SECRET
ARG GH_REDIRECT_URI
ARG CORS_ORIGIN

# Set them as environment variables
ENV GH_CLIENT_ID=$GH_CLIENT_ID
ENV GH_CLIENT_SECRET=$GH_CLIENT_SECRET
ENV GH_REDIRECT_URI=$GH_REDIRECT_URI
ENV CORS_ORIGIN=$CORS_ORIGIN

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 appuser

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN chown -R appuser:nodejs /app
USER appuser

EXPOSE 3001
ENV PORT=3001

CMD ["node_modules/.bin/tsx", "index.ts"]
