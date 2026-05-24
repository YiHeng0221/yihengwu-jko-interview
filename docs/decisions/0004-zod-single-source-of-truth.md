# ADR-0004 — Zod as single source of truth for schemas

- **Date**: 2026-05-24
- **Status**: Accepted
- **Deciders**: project owner
- **Related**: Issue#2, docs/specs/be-feature-spec.md, docs/specs/fe-feature-spec.md

## Context

The project has a Fastify BE and a React FE. Both need to agree on the wire shape of API responses. Without a single source of truth, TS types drift between layers, causing silent runtime bugs. The BE also needs runtime validation of inbound request payloads (query params, body). We need one tool that covers: runtime validation, TypeScript type inference, and OpenAPI schema generation.

## Decision

Zod 3.x is the single source of truth for all schemas. It is used for: inbound request validation on the BE (via `fastify-type-provider-zod`), OpenAPI spec generation (same plugin), and FE boundary parsing of API responses.

## Options considered

### Option A — Zod (chosen)

- Pros: runtime validation + TS inference from one `.parse()` call; `fastify-type-provider-zod` generates OpenAPI spec automatically; `.transform()` enables snake→camel mapping without duplicating types; large ecosystem; no codegen step needed for FE to consume types
- Cons: larger bundle than `io-ts`; `z.infer<>` can produce verbose TS output for complex schemas
- Example/Reference: `fastify-type-provider-zod` + `@fastify/swagger`

### Option B — io-ts

- Pros: more theoretically pure (functional codec); smaller bundle
- Cons: steeper learning curve (fp-ts dependency); no maintained Fastify adapter; sparse OpenAPI tooling
- Example/Reference: gcanti/io-ts

### Option C — JSON Schema + `ajv` (Fastify default)

- Pros: Fastify's built-in validation; fast at runtime
- Cons: no TS type inference from schemas (must duplicate types); OpenAPI generation needs separate tool; FE still needs a separate validation library

## Why we picked A

1. One schema definition drives validation, TypeScript types, and OpenAPI — zero drift by construction.
2. `fastify-type-provider-zod` has first-class Fastify 5 support; we avoid the JSON Schema double-maintenance trap.
3. `.transform()` handles the snake_case → camelCase boundary cleanly (see ADR-0007) inside the same schema definition.

## Consequences

- Positive: FE/BE types stay in sync via the emitted `/openapi.json`; inbound bugs surface at the Zod boundary before hitting business logic.
- Negative: Zod bundle weight (~13KB gzip) appears in FE output; switching to a different validator later means rewriting all schemas.
- Neutral: Every new endpoint requires a Zod schema; this is intentional and enforced by Hard Rule #16 (no `as`/`any`).

## Revisit when

- A second BE language (e.g., Go) is introduced, making Zod schemas non-portable.
- Zod v4 introduces breaking changes that require mass migration.
- Bundle size of Zod in the FE exceeds 50KB gzip.

## How we'll know if this was right

- Type-mismatch bugs caught in PR review: target = 0 per week after week 1.
- OpenAPI drift CI failures: target = 0 (schema committed, compared on every CI run).
- `catch (error)` is the only place `unknown` appears in the codebase (Hard Rule #16 compliance).
