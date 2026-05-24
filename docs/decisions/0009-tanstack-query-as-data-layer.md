# ADR-0009 — TanStack Query as the sole client-side data layer

- **Date**: 2026-05-24
- **Status**: Accepted
- **Deciders**: project owner
- **Related**: Issue#3, Spec `docs/specs/fe-feature-spec.md` §6, §3.4

## Context

The app requires:
- Cursor-based infinite scroll (`useInfiniteQuery`)
- Per-tab query isolation with URL-param-driven cache keys
- Search debounce + request cancellation (`AbortController`)
- Stale-while-revalidate for category list (effectively infinite `staleTime`)
- Offline detection + cache retention

These needs push us toward a full server-state library. The alternatives are Redux Toolkit Query (RTK-Q), SWR, Zustand manual fetch slices, or a plain `useEffect` + `useState` approach.

## Decision

Adopt **TanStack Query v5** as the only data-fetching and server-state layer. No Redux, no SWR, no Zustand for remote data.

## Options considered

### Option A — TanStack Query v5

- Pros: best-in-class `useInfiniteQuery` with cursor-pagination support; built-in AbortSignal threading; fine-grained `staleTime` / `gcTime` per query; query-key factory pattern keeps cache deterministic; devtools available
- Cons: adds a dependency (~13KB gzip); slightly steeper learning curve than raw `fetch`
- Example/Reference: `useInfiniteQuery({ queryKey: ['charities', tab, q], queryFn: fetchPage })`

### Option B — SWR

- Pros: lighter (~4KB); simpler API for single-page queries
- Cons: `useSWRInfinite` is clunkier than `useInfiniteQuery`; no built-in `AbortSignal` threading; devtools less capable; Vercel-driven maintenance creates vendor uncertainty
- Example/Reference: `useSWRInfinite((index, prev) => …)`

### Option C — Redux Toolkit Query (RTK-Q)

- Pros: great if the project already uses Redux for UI state; co-located endpoint definitions
- Cons: significant boilerplate (store setup, slices, middleware); we have **no** global UI state that justifies Redux; bundle adds ~30KB; overkill for a read-heavy SPA with no optimistic mutations
- Example/Reference: `createApi({ baseQuery, endpoints })` setup

### Option D — Plain `useEffect` + `useState`

- Pros: zero dependency; no abstraction to learn
- Cons: reinvents caching, deduplication, loading/error states, cancellation, and pagination — every feature has to be written from scratch; high bug surface for a 7-day project

## Why we picked A

1. `useInfiniteQuery` natively models cursor pagination (ADR-0005 requires it); no workaround needed.
2. AbortSignal is threaded automatically — satisfies the "前次 request abort" requirement in `useSearch`.
3. Query key arrays provide a deterministic, testable cache namespace: `['charities', tab, q]` is easy to assert in unit tests.

## Consequences

- Positive: infinite scroll, search cancel, and stale-category-cache all covered without custom logic.
- Positive: devtools (`@tanstack/react-query-devtools`) speed up local debugging.
- Negative: `QueryClientProvider` must wrap the entire app; test files need a `QueryClient` wrapper utility.
- Neutral: commits to `@tanstack/react-query` v5 API; v6 will likely have breaking changes.

## Revisit when

- We add WebSocket/Server-Sent Events for real-time donation counts; at that point evaluate TanStack Query's streaming support vs a dedicated subscription layer.
- Bundle-size budget for the FE drops below 150KB gzip; measure TanStack Query's share first before swapping.

## How we'll know if this was right

- Zero `useEffect`-based data-fetching code in the codebase (all fetch goes through TQ query functions).
- Infinite scroll and search-abort both work correctly in the Phase 1 e2e suite.
- No stale-category-list bugs reported in the 24-hour post-merge window.
