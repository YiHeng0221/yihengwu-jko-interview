# syntax=docker/dockerfile:1.7
# Build context: repo root — docker build -f frontend/Dockerfile -t <image> .

FROM node:22.15-bookworm-slim AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json frontend/

RUN corepack enable && \
    cd frontend && pnpm install --frozen-lockfile

FROM node:22.15-bookworm-slim AS builder
WORKDIR /app

# Vite 在 build time 把 VITE_* env 嵌進 bundle
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY frontend/ ./frontend/

WORKDIR /app/frontend
RUN corepack enable && pnpm build

FROM nginx:1.27-alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf

COPY frontend/nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
