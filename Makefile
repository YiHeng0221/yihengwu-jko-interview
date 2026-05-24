.PHONY: up down migrate seed dev test lint typecheck build ci-local

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

ci-local: typecheck lint test build
	@echo "✅ ci-local: all checks passed"
