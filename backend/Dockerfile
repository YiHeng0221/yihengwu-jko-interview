# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: deps — install all workspace dependencies (cached layer)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS deps

# openssl is required by Prisma engine detection at install/generate time
RUN apt-get update -qq \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable pnpm
WORKDIR /repo

# Copy workspace manifests + lockfile first for better layer caching
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/package.json

# Stub other workspace packages so pnpm workspace resolution succeeds
# even when frontend/ and e2e/ are not present in the build context
RUN mkdir -p frontend e2e \
    && printf '{"name":"@yihengwu-jko/frontend","version":"0.0.0","private":true}\n' > frontend/package.json \
    && printf '{"name":"@yihengwu-jko/e2e","version":"0.0.0","private":true}\n' > e2e/package.json

RUN pnpm install --frozen-lockfile

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: build — generate Prisma client + compile TypeScript
# ─────────────────────────────────────────────────────────────────────────────
FROM deps AS build

# Copy root tsconfig required by backend/tsconfig.json "extends"
COPY tsconfig.base.json ./
COPY backend/tsconfig.json backend/tsconfig.build.json ./backend/
COPY backend/src ./backend/src
COPY backend/prisma ./backend/prisma

# Generate Prisma client (updates @prisma/client with schema-derived types)
RUN pnpm --filter @yihengwu-jko/backend exec prisma generate

# Compile TypeScript → dist/
RUN pnpm --filter @yihengwu-jko/backend run build

# Create standalone deployment: resolves all pnpm symlinks → real files,
# includes only production dependencies
RUN pnpm --filter @yihengwu-jko/backend deploy --prod /standalone

# pnpm deploy copies package.json + node_modules, not the compiled output
# or the Prisma schema — add them manually
RUN cp -r backend/dist /standalone/dist \
    && cp -r backend/prisma /standalone/prisma

# prisma CLI is a devDep but is needed for `migrate deploy` at startup.
# With shamefully-hoist=false, prisma lives in backend/node_modules (not root).
# Use -rL to follow pnpm symlinks so real files (not dangling links) are copied.
RUN cp -rL /repo/backend/node_modules/prisma /standalone/node_modules/prisma \
    && mkdir -p /standalone/node_modules/.bin \
    && printf '#!/bin/sh\nexec node "$(dirname "$0")/../prisma/build/index.js" "$@"\n' \
        > /standalone/node_modules/.bin/prisma \
    && chmod +x /standalone/node_modules/.bin/prisma

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3: runner — minimal production image
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runner

# tini: proper PID-1 / SIGTERM forwarding for Node inside Docker
RUN apt-get update -qq \
    && apt-get install -y --no-install-recommends tini \
    && rm -rf /var/lib/apt/lists/*

# Non-root user for security
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs --shell /bin/false nodejs

WORKDIR /app

# Copy the standalone deployment (real files, no pnpm symlinks)
COPY --from=build --chown=nodejs:nodejs /standalone ./

ENV NODE_ENV=production
# Default port; override via -e PORT=... or Railway's injected $PORT
ENV PORT=3001
ENV HOST=0.0.0.0

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||'3001')+'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

USER nodejs

ENTRYPOINT ["/usr/bin/tini", "--"]
# Run prisma migrate deploy only when DATABASE_URL is set,
# so the image can still serve /health in tests without a live DB.
CMD ["sh", "-c", "if [ -n \"$DATABASE_URL\" ]; then node_modules/.bin/prisma migrate deploy; fi && node dist/server.js"]
