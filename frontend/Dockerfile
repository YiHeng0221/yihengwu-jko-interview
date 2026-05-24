# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: builder — install dependencies + vite build
# Build context: repo root
#   docker build -f frontend/Dockerfile -t <image> .
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22.15-bookworm-slim AS builder

RUN corepack enable pnpm
WORKDIR /repo

# Copy workspace manifests + lockfile first for better layer caching
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY frontend/package.json ./frontend/package.json

# Stub other workspace packages so pnpm workspace resolution succeeds
# even when backend/ and e2e/ are not present in the build context
RUN mkdir -p backend e2e \
    && printf '{"name":"backend","version":"0.0.0","private":true}\n' > backend/package.json \
    && printf '{"name":"e2e","version":"0.0.0","private":true}\n' > e2e/package.json

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

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
