.PHONY: up down migrate seed dev test lint typecheck build types ci-local

up:
	docker compose up -d

down:
	docker compose down

migrate:
	pnpm --filter backend exec prisma migrate dev

seed:
	@echo "Seed 走 manual workflow_dispatch（HARNESS-PITFALLS §C1）："
	@echo "  gh workflow run manual-seed.yml"

dev:
	pnpm -r --parallel --filter '!e2e' run dev

test:
	pnpm -r run test

lint:
	pnpm -r run lint

typecheck:
	pnpm -r run typecheck

build:
	pnpm -r run build

types:
	@if [ -d backend ]; then pnpm --filter backend run generate:openapi; fi
	@if [ -d frontend ]; then pnpm --filter frontend run generate:types; fi

ci-local: typecheck lint test build
	@if [ -d backend ]; then $(MAKE) types && git diff --exit-code; fi
	@echo "✅ ci-local: all checks passed"
