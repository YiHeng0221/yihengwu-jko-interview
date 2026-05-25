# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: builder — install dependencies + vite build
# Build context: repo root
#   docker build -f frontend/Dockerfile -t <image> .
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22.15-bookworm-slim AS builder

RUN corepack enable pnpm
WORKDIR /repo

# 為了讓 pnpm install --frozen-lockfile 通過 lockfile 對齊檢查，
# 必須 copy 全部 workspace 的 package.json（不只 frontend）。
# 之前 stub 出空 package.json 會跟 lockfile 已記錄的 dependencies 對不上
# 而 fail ERR_PNPM_OUTDATED_LOCKFILE。只 copy manifest，source code 不複製，
# 仍然保留「per-service Dockerfile」的隔離效益。
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
COPY e2e/package.json ./e2e/package.json

RUN pnpm install --frozen-lockfile

# Copy source files after deps are cached
COPY tsconfig.base.json ./
COPY frontend/ ./frontend/

RUN pnpm --filter frontend run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: runner — nginx:alpine serves the static dist/
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf

COPY frontend/nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=builder /repo/frontend/dist /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
