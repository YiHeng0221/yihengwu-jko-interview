# syntax=docker/dockerfile:1.7
# Build context: repo root — docker build -f backend/Dockerfile -t <image> .
# Image base: node:22-bookworm-slim — Prisma 需要 glibc + openssl，不能用 alpine。

FROM node:22-bookworm-slim AS deps
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
      openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/

RUN corepack enable && \
    cd backend && pnpm install --frozen-lockfile

FROM node:22-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
      openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY backend/ ./backend/

WORKDIR /app/backend
RUN corepack enable && \
    pnpm prisma generate && \
    pnpm build

FROM node:22-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
      openssl tini ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid 1001 --create-home nodejs

ENV NODE_ENV=production
ENV PORT=3001

# prisma CLI 裝 global，避開 pnpm workspace symlink 跨 multi-stage COPY 斷裂
RUN npm install -g prisma@6.0.0

COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=nodejs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/backend/prisma ./backend/prisma
COPY --from=builder --chown=nodejs:nodejs /app/backend/package.json ./backend/package.json

WORKDIR /app/backend
USER nodejs
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||'3001')+'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["sh", "-c", "prisma migrate deploy && node dist/server.js"]
