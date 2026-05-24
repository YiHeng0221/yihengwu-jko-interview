# ADR-0003 — React + Vite over Next.js

- **Date**: 2026-05-24
- **Status**: Accepted
- **Deciders**: project owner
- **Related**: Issue#2, docs/specs/fe-feature-spec.md

## Context

The project is a take-home interview delivering a charity-donation listing SPA. The FE has no SEO requirement, no SSR, and no ISR — it is a pure client-side app behind a static CDN or nginx. We need a fast dev loop, minimal framework overhead, and a clean separation between FE (static) and BE (Fastify).

## Decision

Use React 19 + Vite 6 as the FE stack instead of Next.js.

## Options considered

### Option A — Next.js (App Router)

- Pros: SSR/SSG out of the box; large ecosystem; file-based routing; well-known to interviewers
- Cons: forces server components mental model on a pure SPA; `next dev` cold-start is slow; produces mixed server/client code that complicates the clean FE/BE split; opinionated about data fetching in ways that conflict with TanStack Query
- Example/Reference: Next.js 14+ App Router

### Option B — React + Vite (chosen)

- Pros: minimal runtime overhead; sub-second HMR; zero opinion on routing (we bring React Router v7); trivial Docker image (`vite build` → `dist/` → nginx); aligns with TanStack Query data-fetching pattern; Vitest integrates natively
- Cons: no built-in SSR; need to wire routing ourselves
- Example/Reference: Vite 6 + React 19 + React Router v7

### Option C — Remix (React Router v7 full-stack)

- Pros: SSR + loaders + actions fit form-heavy apps
- Cons: overkill for a listing SPA; tighter BE coupling complicates deploy split (FE on CDN, BE on Railway)

## Why we picked B

1. The spec explicitly states "Pure SPA、無 SSR" — Next.js's value proposition is SSR/SSG, which adds complexity without benefit here.
2. Vite's dev loop (HMR < 200ms) outpaces `next dev` for a project this size.
3. Static `dist/` output deploys to nginx or any CDN independently of the Fastify BE — a cleaner architecture for Railway's two-service model.

## Consequences

- Positive: FE and BE are independently deployable Docker images; dev loop is fast; testing with Vitest requires no adapter.
- Negative: No built-in SSR; SEO-sensitive pages (if added later) would require a separate SSR strategy.
- Neutral: Locks us into Vite's build pipeline; switching to Turbopack later is non-trivial.

## Revisit when

- The product adds SEO-critical pages (e.g., charity detail pages indexed by Google).
- The team grows beyond 5 FE engineers and wants colocation of API routes with pages.

## How we'll know if this was right

- `vite build` completes in < 30s in CI.
- `vite dev` HMR < 200ms measured in browser DevTools.
- FE Docker image builds independently without the BE being present.
