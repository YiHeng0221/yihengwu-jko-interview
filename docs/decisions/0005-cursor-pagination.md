# ADR-0005 — Cursor-based pagination over offset pagination

- **Date**: 2026-05-24
- **Status**: Accepted
- **Deciders**: project owner
- **Related**: Issue#2, docs/specs/be-feature-spec.md

## Context

The FE charity list uses infinite-scroll: as the user scrolls down, the next page is appended in-place. The list is sorted by `created_at DESC`. We need a pagination strategy that handles infinite-scroll cleanly and is stable under concurrent inserts.

## Decision

Use cursor-based pagination: the server returns a `next_cursor` opaque token (base64url-encoded `{created_at, id}`); the client passes it back as `?cursor=` to fetch the next page.

## Options considered

### Option A — Offset pagination (`?page=N` or `?offset=N`)

- Pros: simple to implement; easy to jump to arbitrary pages
- Cons: items slip between pages when new rows are inserted between requests (page N+1 may repeat items from page N); `OFFSET N` causes the DB to scan and discard N rows — performance degrades at large offsets; FE infinite scroll rarely needs page-jump, making arbitrary-page support wasted
- Example/Reference: standard REST pagination

### Option B — Cursor pagination (chosen)

- Pros: stable under concurrent inserts (cursor encodes `created_at + id`, so the window never shifts); no row scan overhead — query uses `WHERE (created_at, id) < (cursor_at, cursor_id)` with the existing composite index; aligns with TanStack Query's `useInfiniteQuery` `getNextPageParam` API; `next_cursor: null` gives FE a clean "end of list" signal
- Cons: no random-access (can't jump to page 7); cursor is opaque to the client
- Example/Reference: Relay-style cursor pagination; Prisma cursor pagination docs

### Option C — Keyset pagination with link headers

- Pros: standard hypermedia approach
- Cons: requires extra `Link:` header parsing on FE; no added value over Option B for this use case

## Why we picked B

1. The FE uses infinite-scroll with TanStack Query `useInfiniteQuery` — cursor pagination is the natural fit; `getNextPageParam` returns `next_cursor` directly.
2. The `@@index([tab, createdAt(sort: Desc)])` composite index on `Charity` makes cursor queries efficient even as the dataset grows.
3. Stable paging under concurrent inserts eliminates a whole class of "duplicate item" or "skipped item" bugs in the demo.

## Consequences

- Positive: DB query complexity is O(1) regardless of page depth; no duplicate/skip bugs under inserts.
- Negative: No random-access pagination UI; the cursor token is opaque (clients must treat it as a black box).
- Neutral: Cursor encoding (base64url of `{created_at, id}`) must be stable — changing the encoding is a breaking API change.

## Revisit when

- A product requirement appears for "jump to page N" or "go back to previous page" navigation.
- The dataset is replaced by a search engine (e.g., Typesense) that has its own pagination primitives.

## How we'll know if this was right

- Infinite scroll in the demo shows no duplicate items across 3+ pages under concurrent inserts.
- DB `EXPLAIN ANALYZE` on the cursor query shows index scan, not seq scan.
- `next_cursor: null` reliably shows the `EndMarker` component on the last page.
