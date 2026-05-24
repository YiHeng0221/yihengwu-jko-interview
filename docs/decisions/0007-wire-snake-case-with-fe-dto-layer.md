# ADR-0007 — snake_case wire format + FE DTO mapper layer

- **Date**: 2026-05-24
- **Status**: Accepted
- **Deciders**: project owner
- **Related**: Issue#2, docs/specs/be-feature-spec.md, docs/specs/fe-feature-spec.md

## Context

The BE is a Node/Fastify API that serialises JSON. The FE is a React SPA that consumes this JSON. Two naming conventions exist: `snake_case` (Postgres columns, HTTP APIs, Python/Go convention) and `camelCase` (JavaScript/TypeScript convention). We need a clear, enforced rule for which convention appears on the wire and which appears inside FE code, with no ambiguity at the boundary.

## Decision

The HTTP wire format is **snake_case** (e.g., `next_cursor`, `category_code`, `logo_url`). The FE converts to **camelCase** in a dedicated DTO mapper file named `<apiName>DTO.ts` located alongside the feature that consumes it. The BE never produces camelCase JSON; the FE never uses snake_case identifiers past the DTO boundary.

## Options considered

### Option A — camelCase wire format

- Pros: FE can use API response directly without mapping; aligns with JS conventions
- Cons: violates HTTP API conventions (most public APIs, OpenAPI samples, and Postgres column names use snake_case); makes it harder to share the API with non-JS clients; Prisma returns snake_case by default for columns
- Example/Reference: Some Node-only APIs do this; creates friction when adding a Go or Python service

### Option B — snake_case wire + FE DTO mapper (chosen)

- Pros: wire format is language-neutral; BE and DB stay in their natural case convention (snake_case); FE keeps idiomatic camelCase throughout; the DTO mapper is the explicit, testable boundary where the shape is validated (Zod `.transform()`); DTO filenames are discoverable by naming convention (`<apiName>DTO.ts`)
- Cons: an extra file per API resource; mapper must be kept in sync with the BE schema (but OpenAPI + type drift CI catches regressions)
- Example/Reference: `frontend/src/features/charities/dto/charitiesListDTO.ts`

### Option C — No convention (ad hoc per endpoint)

- Pros: zero upfront decision overhead
- Cons: half the codebase uses snake_case, half uses camelCase; impossible to enforce without a linter rule; leads to subtle bugs when a new developer adds a field

## Why we picked B

1. snake_case on the wire is the lowest-common-denominator for future clients (mobile apps, partner integrations, curl-based testing) — they all expect it from a REST JSON API.
2. The DTO layer makes the BE → FE type boundary explicit and testable: `z.transform()` in the DTO schema catches field renames at Zod parse time, not at render time.
3. `<apiName>DTO.ts` naming convention makes the mapper discoverable: any developer seeing `charitiesListDTO.ts` immediately knows its purpose and location.

## Consequences

- Positive: BE and FE can evolve independently; wire format is stable even if internal FE naming changes; DTO is the single place to fix a field rename.
- Negative: Each new endpoint requires a DTO file (low overhead, but a discipline tax); developers unfamiliar with the convention may bypass the DTO and read snake_case fields directly.
- Neutral: The `case.ts` lib helper (`snakeToCamel`) is shared across all DTOs to avoid duplicating the transform logic.

## Revisit when

- A codegen tool (e.g., `openapi-typescript`) can generate both wire types and camelCase FE types from the OpenAPI spec automatically — then the manual DTO mapper becomes redundant.
- A second non-JS client (Go app, mobile) consumes the API and has a different wire convention preference.

## How we'll know if this was right

- Zero `snake_case` identifiers appear in FE component code outside `dto/` files (verifiable by a grep in CI).
- Field-rename bugs surface at Zod parse in tests, not in production UI renders.
- New team members find the DTO file within 30 seconds by naming convention alone.
