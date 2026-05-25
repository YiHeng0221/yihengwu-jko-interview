# syntax=docker/dockerfile:1.7
# Multi-stage frontend Dockerfile — React + Vite + nginx
# Build context: repo root
#   docker build -f frontend/Dockerfile -t <image> .
#
# 設計參考 allen-harness-test/templates/Dockerfile.frontend：
# 在 deps stage 只 copy 自己 workspace 的 package.json + 帶 pnpm-workspace.yaml
# 給 root，然後 `cd frontend && pnpm install`。這樣 pnpm 只解 frontend workspace
# 的依賴，不會踩到「stub 其他 workspace package.json 跟 lockfile 對不齊」的雷。

# ─── Stage 1: deps ──────────────────────────────────────────────
FROM node:22.15-bookworm-slim AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json frontend/

RUN corepack enable && \
    cd frontend && pnpm install --frozen-lockfile

# ─── Stage 2: builder ───────────────────────────────────────────
FROM node:22.15-bookworm-slim AS builder
WORKDIR /app

# Vite 在 build time 把 VITE_* env 嵌進 bundle
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
# Root 檔案：
#   - package.json + pnpm-workspace.yaml: corepack 讀 packageManager pin pnpm 版本
#   - tsconfig.base.json: frontend/tsconfig.json extends 引用
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY frontend/ ./frontend/

WORKDIR /app/frontend
RUN corepack enable && pnpm build
# → 產出 /app/frontend/dist

# ─── Stage 3: runner ──────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf

COPY frontend/nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
