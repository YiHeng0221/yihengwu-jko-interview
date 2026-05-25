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
    useradd --system --uid 1001 --gid 1001 --shell /sbin/nologin nodejs

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=nodejs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/backend/prisma ./backend/prisma
COPY --from=builder --chown=nodejs:nodejs /app/backend/package.json ./backend/package.json

# 用 backend/node_modules/.bin/prisma（版本跟 backend/package.json 同步），
# 不再裝 global prisma 避免版本漂移
ENV PATH="/app/backend/node_modules/.bin:${PATH}"

WORKDIR /app/backend
USER nodejs
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||'3001')+'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["/usr/bin/tini", "--"]
# DATABASE_URL guard — 沒設 DB 時跳過 migrate，讓 image 仍能 serve /health
# (CI smoke test / 本機無 DB 起動 use case)
CMD ["sh", "-c", "if [ -n \"$DATABASE_URL\" ]; then prisma migrate deploy; fi && node dist/server.js"]
