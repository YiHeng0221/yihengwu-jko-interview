# ADR-0014 — Prisma over Drizzle / Kysely

- **Date**: 2026-05-24
- **Status**: Accepted
- **Deciders**: project owner
- **Related**: Issue#4, Spec `docs/specs/be-feature-spec.md` §3, §7

## Context

The backend needs a Postgres ORM / query builder that:

1. Supports TypeScript-strict type safety end-to-end (no `any` casts at DB boundaries, per Hard Rule #16).
2. Integrates smoothly with the existing Zod-as-SoT approach — generated types should be composable with Zod schemas.
3. Provides schema migration tooling (`migrate dev` + `migrate deploy`) that supports the two-step migration workflow required by the spec (§8: `--create-only` → hand-review SQL → apply).
4. Handles `pg_trgm` raw SQL easily via escape hatch (GIN index and `ILIKE` queries are not expressible in standard ORM DSL).
5. Runs reliably under Node 22 in a Railway production environment.

We evaluated Prisma 6, Drizzle ORM, and Kysely.

## Decision

Adopt **Prisma 6** as the ORM and migration tool.

## Options considered

### Option A — Prisma 6

- Pros: schema-first (`schema.prisma` DSL) generates TypeScript client types automatically; `prisma migrate` covers the two-step workflow natively (`--create-only` + manual SQL review + `migrate deploy`); `$queryRaw` and `$executeRaw` provide clean escape hatches for `pg_trgm` raw SQL; Prisma Accelerate/Data Proxy available if connection pooling becomes an issue on Railway; strong IDE support; well-documented
- Cons: Prisma schema DSL is a separate language from TypeScript; ORM abstraction can hide N+1 queries from inattentive developers; generated client is large; slower cold-start than Drizzle due to binary engine (mitigated by Prisma 6's Rust-based lightweight engine)
- Example/Reference: Prisma 6 ships a Rust query engine replacing the Node.js binary, reducing cold-start from ~500ms to ~50ms

### Option B — Drizzle ORM

- Pros: TypeScript-native schema definition (no separate DSL); extremely thin runtime; fast cold starts; composable with Zod via `drizzle-zod`; growing adoption in 2025
- Cons: migration tooling (`drizzle-kit`) is less mature than `prisma migrate`; `--create-only` equivalent is less polished; type inference becomes complex for deep joins; raw SQL escape hatch exists but is less ergonomic than Prisma's `$queryRaw`; fewer production case studies at our scale
- Example/Reference: Good for new TypeScript projects that want schema in code; migration tooling needs validation

### Option C — Kysely

- Pros: SQL-first query builder with excellent TypeScript inference; zero abstraction over raw SQL; very fast; type-safe even for `pg_trgm` queries
- Cons: not an ORM — no schema migration tooling at all (requires a separate migration tool like `pgmigrate` or `db-migrate`); no `schema.prisma`-equivalent SSOT; two-step migration workflow requires manual orchestration; more boilerplate for basic CRUD
- Example/Reference: Excellent for teams who want full SQL control; the missing migration story is a gap for this project

## Why we picked A

1. Prisma's `schema.prisma` provides a single, auditable schema file that documents the DB model — useful for code review and interviewer grading.
2. `prisma migrate dev --create-only` + SQL hand-review maps exactly to the two-step migration workflow in the spec (§8), and `prisma migrate deploy` is safe for Railway CD.
3. `$queryRaw` cleanly handles the `pg_trgm` `ILIKE '%q%'` queries required for CJK search without fighting the ORM abstraction.
4. The Prisma 6 Rust engine mitigates the historical cold-start concern; Railway deploys are not edge-zero-ms and 5s SLA has headroom.

## Consequences

- Positive: Schema changes are auditable diffs in `prisma/schema.prisma`; no need to reconstruct DB shape from TypeScript definitions.
- Positive: `prisma migrate deploy` is a safe, idempotent operation compatible with Railway's deploy hooks.
- Negative: Prisma schema DSL is not TypeScript; developers must maintain two mental models (`.prisma` DSL + TypeScript types).
- Negative: Heavy ORM abstraction means aggregate queries or complex `JOIN`s may require falling back to `$queryRaw`, losing type safety unless manually annotated.
- Neutral: `prisma generate` must run as part of the build step; CI must cache `~/.prisma` to avoid repeat downloads.

## Revisit when

- We add a second service (e.g., Go backend) that cannot consume Prisma client — then a shared Zod-derived schema or OpenAPI contract becomes necessary.
- Drizzle's migration tooling matures to match Prisma's (likely ~mid 2026); at that point, Drizzle's TypeScript-native schema becomes more attractive.
- Prisma's generated client size or cold-start becomes a blocking issue on Railway free tier.

## How we'll know if this was right

- `prisma migrate deploy` in the Railway deploy hook: zero incidents in Phase 0–1.
- `$queryRaw` for `pg_trgm` searches: all search AC pass in e2e without type-cast workarounds.
- Zero "N+1 queries" issues in the charity list endpoint (verified by reviewing the generated SQL in Prisma's `DEBUG=prisma:query` mode during development).
