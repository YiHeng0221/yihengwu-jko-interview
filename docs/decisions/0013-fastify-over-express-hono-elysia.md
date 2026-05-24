# ADR-0013 — Fastify over Express / Hono / Elysia

- **Date**: 2026-05-24
- **Status**: Accepted
- **Deciders**: project owner
- **Related**: Issue#4, Spec `docs/specs/be-feature-spec.md` §9

## Context

We need a Node.js HTTP framework for the `街口公益` donation-list backend. The framework must:

1. Support TypeScript-native schema validation integrated with Zod (to keep Zod as the single source of truth per ADR-0004).
2. Auto-generate OpenAPI specs from route schemas without a separate annotation pass (ADR-0018 dependency).
3. Meet the `cold-start ≤ 5s` SLA stated in the spec (§2, `/health` requirement).
4. Run on Node 22 LTS in a Railway deploy environment with minimal setup overhead.

We evaluated Express 4/5, Fastify 5, Hono 4, and Elysia 1.x.

## Decision

Adopt **Fastify 5** with `fastify-type-provider-zod` as the HTTP framework.

## Options considered

### Option A — Express 4 / 5

- Pros: most ecosystem adoption; every middleware imaginable exists; stable, well-understood
- Cons: no built-in schema validation → Zod must be wired manually and OpenAPI generation requires a separate tool (`express-zod-api` or `tsoa`); noticeably slower throughput than Fastify under benchmark conditions; TypeScript support is retrofit rather than native
- Example/Reference: Used in the majority of Node tutorials, but our Zod+OpenAPI requirement makes it more complex here

### Option B — Fastify 5

- Pros: first-class JSON schema validation pipeline; `fastify-type-provider-zod` bridges Zod directly into Fastify's validation + serialisation + OpenAPI emit; measurably faster than Express (Fastify benchmarks show ~2×); `@fastify/swagger` generates `openapi.json` from route schemas automatically; plugin lifecycle is deterministic (`fastify-plugin` encapsulation); mature ecosystem (`cors`, `helmet`, `compress`, `rate-limit` all have first-party plugins)
- Cons: lifecycle model (`onRequest`/`preHandler`/etc.) has a learning curve; plugin loading order matters more than in Express; v5 breaking changes from v4 (minor for a greenfield project)
- Example/Reference: `fastify-type-provider-zod` maintained by Fastify core; widely adopted in production Node services as of 2025

### Option C — Hono 4

- Pros: ultra-thin, runs on edge runtimes (Cloudflare Workers, Deno); very fast cold starts; good TypeScript ergonomics
- Cons: `@hono/zod-openapi` is narrower than Fastify's swagger integration; Railway deploy does not benefit from edge-runtime capabilities; smaller plugin ecosystem for `helmet`/`compress`/`rate-limit` equivalents; less production mileage for full Node.js server workloads
- Example/Reference: Excellent for edge/serverless; overkill mismatch for a Railway Node server

### Option D — Elysia 1.x (Bun-native)

- Pros: blazing performance; elegant TypeScript DX; built-in Eden treaty type-safe client
- Cons: requires Bun runtime, not Node; Railway deploy on Bun is non-standard and adds ops risk; ecosystem for production plugins (`rate-limit`, structured logs, etc.) is less mature than Fastify's; team (AI agent) has less Bun-specific debugging surface
- Example/Reference: Impressive benchmarks, but Bun-only is a hard constraint blocker

## Why we picked B

1. `fastify-type-provider-zod` directly solves the Zod-as-SoT requirement: one schema drives validation, serialisation, and OpenAPI — no annotation duplication.
2. `@fastify/swagger` + `@fastify/swagger-ui` emit `/openapi.json` from the route schemas at startup, satisfying ADR-0018's drift-CI requirement with zero extra tooling.
3. First-party plugins (`@fastify/cors`, `@fastify/helmet`, `@fastify/compress`, `@fastify/rate-limit`) cover every cross-cutting requirement in §6 of the spec, keeping the dependency surface predictable.

## Consequences

- Positive: Zod schemas are the single source of truth for validation, serialisation, and OpenAPI — no annotation drift possible.
- Positive: Cold starts stay well under 5s (Fastify boots in < 100ms on Node 22 with our plugin set).
- Negative: Fastify's plugin lifecycle must be learned; incorrect `await register()` ordering causes silent bugs.
- Neutral: Locks us into Fastify v5 semver; a major version upgrade would require reviewing plugin compatibility.

## Revisit when

- We need to run the backend on a Cloudflare Worker or Deno Deploy (then Hono or Hono+Zod becomes the right call).
- The plugin ecosystem for rate-limit or observability forces us to build custom middleware that Hono/Elysia provide out-of-the-box.
- Fastify v6 ships with breaking changes that require non-trivial migration work.

## How we'll know if this was right

- Zero Zod/OpenAPI annotation divergence incidents after week 1.
- `/health` cold-start latency on Railway staging ≤ 5s (measured in `e2e.yml` smoke run).
- No "missing plugin" issues blocking feature work during Phase 1.
