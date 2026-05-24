# ADR-0017 — `categoryCode` as String over Postgres Enum

- **Date**: 2026-05-24
- **Status**: Accepted
- **Deciders**: project owner
- **Related**: Issue#4, Spec `docs/specs/be-feature-spec.md` §3.1, §3.2

## Context

The `Charity` model has a `categoryCode` field that stores which of the 17 category chips a charity belongs to (e.g., `CHILD_CARE`, `ELDER_CARE`, `ENV_PROTECTION`). The source of truth for valid values is `backend/src/lib/categories.ts`.

We must choose a Postgres storage type for this field:

1. **Postgres enum type** (`CREATE TYPE category_code AS ENUM (...)`) — enforced at the DB level.
2. **Plain `VARCHAR` / `TEXT` string** — enforced at the application layer via Zod + TypeScript `as const`.

The spec §3.1 already documents this reasoning; this ADR formalises the decision.

## Decision

Store `categoryCode` as a **plain `String` column** (Postgres `TEXT`) with a TypeScript `as const` constant + Zod discriminated union enforcing valid values at the application boundary.

## Options considered

### Option A — Postgres enum type

- Pros: DB-level constraint — invalid category codes are impossible to insert even if the application layer is bypassed; `EXPLAIN` output is slightly more readable; enum values are indexed efficiently
- Cons: **Adding or renaming a category requires `ALTER TYPE category_code ADD VALUE '...'`** — this DDL acquires a brief exclusive lock; in Postgres 12+, adding a value is `NOT IN TRANSACTION` and cannot be rolled back if the migration fails mid-way; removing a value is not natively supported (`ALTER TYPE ... DROP VALUE` does not exist in Postgres 16); the migration must be applied before the code that uses the new value is deployed, creating a strict deploy ordering requirement; Prisma represents enums as Prisma `enum` type which generates TypeScript unions, but any change requires regenerating the Prisma client; for a 17-category constant that may grow or change labels, this DDL friction is disproportionate
- Example/Reference: Postgres enum `ADD VALUE` lock is brief (milliseconds) but `DROP VALUE` requires `CREATE TYPE ... AS ENUM (...)` with a new name and column type migration — a two-step process

### Option B — String column + `as const` TypeScript constant

- Pros: **Adding a new category is a one-line change** to `backend/src/lib/categories.ts` — no DDL migration; the `CATEGORIES` constant is the single source of truth for both the `/categories` endpoint and the Zod schema used to validate `categoryCode` in inbound charities; a plain string `TEXT` column can have a `@@index([categoryCode])` B-tree index that performs equivalently to an enum index at this scale; `isCategoryCode` typeguard + Zod schema enforce the constraint at the application boundary; Prisma treats it as `String` with no special handling
- Cons: DB itself does not reject invalid category codes — a direct SQL `INSERT` bypassing the application can insert garbage; the contract is only enforced in application code, not at the DB level
- Example/Reference: Common pattern for enumerated string columns where the set of values is application-owned and expected to change (e.g., status codes, tags, role names in most SaaS apps)

## Why we picked B

1. The category list (17 chips) is a product-owned constant that will grow or change labels without a DB migration. Keeping it in TypeScript means a one-line change; a Postgres enum requires a DDL migration with the `ADD VALUE` footgun.
2. Type safety is preserved via `as const` + Zod schema — the application layer enforces the constraint for all production write paths, and the `isCategoryCode` typeguard provides runtime narrowing.
3. The `@@index([categoryCode])` B-tree index on a `TEXT` column is functionally equivalent to an enum index at the data scale of this project.
4. The spec §3.1 explicitly documents this rationale and it is the source-of-truth decision; this ADR preserves the reasoning for future maintainers.

## Consequences

- Positive: Category additions or label renames require only a code change, not a DB migration with lock risk.
- Positive: `backend/src/lib/categories.ts` is the single source of truth for both the `/categories` HTTP endpoint and the Prisma schema's `categoryCode` values.
- Negative: The DB will not reject invalid `categoryCode` values inserted by direct SQL — an integration test or DB-level `CHECK` constraint can be added as a future hardening step if needed.
- Neutral: Zod schema for `categoryCode` must be kept in sync with `CATEGORIES as const` — this is enforced by deriving the Zod schema from the constant (`z.enum(CATEGORIES.map(c => c.code) as [string, ...string[]])`), so drift is a compile error.

## Revisit when

- The category set stabilises and is guaranteed not to change for a long-lived production system — at that point, promoting to a Postgres enum provides DB-level enforcement.
- We add a DB admin UI or direct SQL writes that bypass the application layer — then a DB `CHECK` constraint (simpler than an enum) becomes necessary.

## How we'll know if this was right

- Adding a new category code during Phase 1 or Phase 2 requires no DB migration — confirmed by reviewing the git diff.
- Zero `categoryCode` validation errors in production logs that originate from DB-level rejections.
- TypeScript compilation fails immediately if `CATEGORIES` constant is updated but the Zod schema is not regenerated.
