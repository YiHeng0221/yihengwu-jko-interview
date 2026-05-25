# syntax=docker/dockerfile:1.7
# Multi-stage backend Dockerfile — Fastify + Prisma + Postgres
# Build context: repo root
#   docker build -f backend/Dockerfile -t <image> .
#
# 設計參考 allen-harness-test/templates/Dockerfile.backend：
# deps stage 只 copy backend 自己的 package.json + 帶 pnpm-workspace.yaml 給 root，
# 用 `cd backend && pnpm install` 只解 backend workspace 的依賴。這樣不會踩
# stub 其他 workspace 跟 lockfile 對不齊的雷。
# Image base: node:22-bookworm-slim — Prisma 需要 glibc + openssl，不能用 alpine。

# ─── Stage 1: deps ──────────────────────────────────────────────
FROM node:22-bookworm-slim AS deps
WORKDIR /app

# Prisma 6 install + generate 需要 openssl
RUN apt-get update && apt-get install -y --no-install-recommends \
      openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/

RUN corepack enable && \
    cd backend && pnpm install --frozen-lockfile

# ─── Stage 2: builder ───────────────────────────────────────────
FROM node:22-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
      openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
# Root 檔案：
#   - package.json + pnpm-workspace.yaml: corepack 讀 packageManager pin pnpm 版本
#   - tsconfig.base.json: backend/tsconfig.json extends 引用
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY backend/ ./backend/

WORKDIR /app/backend
RUN corepack enable && \
    pnpm prisma generate && \
    pnpm build

# ─── Stage 3: runner ────────────────────────────────────────────
FROM node:22-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
      openssl tini ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid 1001 --create-home nodejs

ENV NODE_ENV=production
ENV PORT=3001

# prisma CLI 裝 global，與 workspace symlink layout 解耦
# （pnpm 的 /app/node_modules + /app/backend/node_modules 多層 symlink
# 跨 multi-stage COPY 後容易斷裂，全域 CLI 比較可靠）
RUN npm install -g prisma@6.0.0

# 保留 workspace 兩層 node_modules：Node resolver 從 /app/backend 向上找 /app/node_modules
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
# Migrate then serve. Seeding 不在 CMD — 那是 one-time ops，走 manual-seed.yml workflow。
CMD ["sh", "-c", "prisma migrate deploy && node dist/server.js"]
