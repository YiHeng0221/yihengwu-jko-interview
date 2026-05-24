# ADR-0018 — OpenAPI Auto-Emit and Drift CI

- **Date**: 2026-05-24
- **Status**: Accepted
- **Deciders**: project owner
- **Related**: Issue#4, Spec `docs/specs/be-feature-spec.md` §4.5, §8, §9; ADR-0004, ADR-0013

## Context

The frontend consumes the backend API. We need TypeScript types on the FE that accurately reflect the wire shape. Options range from hand-written interfaces to generated types from an OpenAPI spec.

We also need to choose when and how the OpenAPI spec (`openapi.json`) is generated:

1. **Manually maintained** — developers write and update `openapi.json` by hand alongside code changes.
2. **Generated at runtime** — the running Fastify server exposes `/openapi.json`; the FE dev must start the BE to regenerate types.
3. **Generated at build time + committed** — `openapi.json` is emitted by a script that boots Fastify without a DB and writes the spec to `backend/src/generated/openapi.json`; the file is committed and CI enforces no drift.

The spec §8 explicitly states: `OpenAPI /openapi.json commit 進 repo + drift CI：FE 拉 types 時不必啟 server`.

## Decision

Emit `openapi.json` at build time via a headless Fastify boot script, commit the file at `backend/src/generated/openapi.json`, and add a CI step that regenerates and diffs the file — failing the build on any drift.

## Options considered

### Option A — Hand-written and maintained `openapi.json`

- Pros: no tooling dependency; readable, explicit spec
- Cons: manual sync between route schemas and spec is error-prone; the spec diverges silently from the implementation; reviewers cannot trust the spec; violates ADR-0004's Zod-as-SoT principle (two sources of truth)
- Example/Reference: Common failure mode in teams that start with Swagger annotations and stop updating them

### Option B — Generated at runtime only (FE polls running BE)

- Pros: always reflects the live server; no committed file to go stale
- Cons: FE developer must start the BE and Postgres locally to regenerate types; breaks CI if BE cannot start without a DB; FE codegen step is not reproducible without a running server; the spec explicitly rules this out
- Example/Reference: Some setups use `docker-compose up` to generate types — adds significant CI complexity

### Option C — Generated at build time + committed + drift CI (chosen)

- Pros: **FE can regenerate types from the committed `openapi.json` without starting the BE** (`openapi-ts` or `typed-openapi` reads the file directly); the committed file is auditable in PRs (reviewers see the contract change in the diff); the drift CI step (`scripts/check-openapi-drift.sh`) catches any discrepancy between the committed spec and what Fastify actually serves; no runtime DB dependency for spec generation (headless boot skips DB connection); aligns with ADR-0004 (Zod schemas drive both validation and OpenAPI)
- Cons: an extra `generate-openapi` script must run and the commit must be updated on every route change; developers who forget to regenerate get a CI failure (which is the intended behaviour); the generated file adds some noise to `git diff` on schema changes

### Option D — External API-first tooling (e.g., `typespec`, `Zod to OpenAPI` CLI separate from Fastify)

- Pros: separation of spec authoring from implementation
- Cons: adds another tool to learn and maintain; `fastify-type-provider-zod` already generates the spec from Zod schemas automatically; a second tool is redundant and creates divergence risk
- Example/Reference: TypeSpec is excellent for large multi-team APIs; overkill for a single-service demo

## Why we picked C

1. `fastify-type-provider-zod` + `@fastify/swagger` already emit the OpenAPI spec from Zod route schemas at startup — zero extra annotation required. Option C merely adds a commit step.
2. FE type generation (`openapi-ts` or equivalent) reads a static JSON file; no running server or DB needed in CI or local dev.
3. Drift CI is a single-step script: `npm run generate:openapi && git diff --exit-code backend/src/generated/openapi.json`. If a developer adds a route without regenerating, CI fails immediately — not at FE compile time or at runtime.
4. The committed `openapi.json` is a human-readable contract change visible in every PR diff, making BE API changes explicitly reviewable.

## Implementation notes

- **Boot script**: `backend/scripts/generate-openapi.ts` — builds the Fastify app with `SKIP_DB=true`, calls `app.ready()`, reads `app.swagger()`, writes to `backend/src/generated/openapi.json`, then exits. No real DB connection needed.
- **CI step** in `ci.yml`: after `build`, run `npm run generate:openapi -w backend && git diff --exit-code backend/src/generated/openapi.json`.
- **FE codegen**: `npm run generate:types -w frontend` reads `../backend/src/generated/openapi.json` and writes `frontend/src/lib/api-types.ts`.
- **Developer workflow**: after changing a route schema, run `make types` (root Makefile target) to regenerate both `openapi.json` and `api-types.ts` in one step.

## Consequences

- Positive: FE types are always derived from the actual Fastify route schemas — type drift between FE and BE is caught in CI before it reaches review.
- Positive: `openapi.json` is auditable in PR diffs — reviewers see API contract changes explicitly.
- Negative: Every route schema change requires running `make types` and committing the updated `openapi.json`; forgetting triggers a CI failure (this is intentional).
- Neutral: The `SKIP_DB=true` guard in the Fastify app must be implemented correctly — if any route handler or plugin initialises a DB connection unconditionally, the boot script will fail.

## Revisit when

- The BE splits into multiple services — then a separate API gateway or contract-first tool (TypeSpec) becomes more appropriate.
- `openapi.json` file size exceeds ~500KB and becomes a meaningful PR noise source — then a checksum-based drift check replaces the full file diff.
- FE adopts a tRPC or GraphQL transport — then OpenAPI becomes unnecessary.

## How we'll know if this was right

- CI `types-drift` step: zero false-positive failures after week 1 (i.e., the script is reliable).
- FE codegen: `frontend/src/lib/api-types.ts` is always in sync with the BE without manual effort — confirmed by zero "type mismatch between FE and BE" bugs in PR review during Phase 1.
- Developer experience: `make types` regenerates both files in < 10s, measured on the dev machine.
