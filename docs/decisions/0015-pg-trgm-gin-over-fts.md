# ADR-0015 — Postgres `pg_trgm` GIN over Full-Text Search for CJK Substring Search

- **Date**: 2026-05-24
- **Status**: Accepted
- **Deciders**: project owner
- **Related**: Issue#4, Spec `docs/specs/be-feature-spec.md` §4.1, §8

## Context

The `/charities` list endpoint accepts a `?q=` query parameter and must do substring search across `title` and `description` fields. The data is entirely in Traditional Chinese (zh-TW). The spec states:

> `?q=` 走 pg_trgm GIN index 對 title + description 做 `ILIKE '%q%'`（CJK 必通過）

We need to choose a Postgres text-search approach that:

1. Correctly returns results for partial CJK substrings (e.g., `?q=愛心` finds `愛心基金會`).
2. Performs well at the current data scale (≤ 1000 rows in demo; growth to ~10k rows not excluded).
3. Is straightforward to enable and maintain in a Postgres 16 / Railway environment.
4. Does not require a separate search service (Elasticsearch, Typesense, Meilisearch) given the demo-grade scale requirement.

We evaluated Postgres Full-Text Search (FTS), `pg_trgm` + GIN index, and `ILIKE` without an index.

## Decision

Use **`pg_trgm` extension with GIN indexes** on `title` and `description`, and query via `ILIKE '%q%'`.

## Options considered

### Option A — Postgres Full-Text Search (FTS) with `tsvector` / `tsquery`

- Pros: natively built into Postgres; supports ranking (`ts_rank`); `GIN` index on `tsvector` column is efficient; `pg_trgm` extension not required
- Cons: **CJK fundamental problem** — Postgres FTS tokenises text by whitespace and morphological rules; Chinese text has no word boundaries and the default `simple` or `chinese` dictionaries do not exist in standard Postgres; `to_tsvector('simple', '愛心基金會')` produces a single token for the entire string, meaning `?q=愛心` (a substring) does not match; requires either an external CJK dictionary or character n-gram workaround that effectively reinvents trigrams; poor developer ergonomics for CJK
- Example/Reference: Standard FTS is well-understood for English/Latin scripts; CJK requires PGroonga or a custom dictionary, neither available on Railway's managed Postgres

### Option B — `pg_trgm` GIN index + `ILIKE '%q%'`

- Pros: **`pg_trgm` breaks any string into 3-character trigrams independent of language** — Chinese characters are each one Unicode codepoint, so `愛心基` generates trigrams `  愛`, ` 愛心`, `愛心基`, etc.; `ILIKE '%q%'` with a GIN index is supported and indexed; no external dictionary or special tokeniser needed; available via `CREATE EXTENSION pg_trgm` (standard Postgres contrib module, available on Railway Postgres 16); handles 1–2 character queries gracefully (short queries may fall back to sequential scan but remain correct); easy to add via raw migration
- Cons: Trigram similarity threshold may miss results for very short queries (< 3 chars); GIN index is write-amplified (each row insert/update rebuilds trigram entries); `ILIKE` is case-insensitive but accent-sensitive by default in zh-TW (not a concern since Chinese has no accent)
- Example/Reference: `pg_trgm` is the standard Postgres extension for substring/fuzzy matching across multilingual text; recommended in the Postgres documentation for CJK substring search scenarios

### Option C — `ILIKE '%q%'` without index (sequential scan)

- Pros: zero setup — no extension, no GIN index; works correctly for CJK substring search
- Cons: `O(n)` full table scan on every search request; unacceptable above a few thousand rows; no acceptable path to optimisation without backfilling the index; explicitly rejected by the spec's requirement for a GIN index
- Example/Reference: Acceptable only for throwaway prototypes; the spec explicitly mandates the GIN index

## Why we picked B

1. CJK text has no whitespace word boundaries. Postgres FTS requires language-aware tokenisation; `pg_trgm` is language-agnostic and works correctly for Chinese by treating each Unicode codepoint as a character unit.
2. `pg_trgm` is a standard `contrib` extension (`CREATE EXTENSION IF NOT EXISTS pg_trgm`) — available on Railway Postgres 16 without any custom build or external service.
3. `ILIKE '%q%'` with a GIN index is both correct (returns all superstrings of the query) and efficient at demo + moderate production scale.
4. The spec already mandates this approach (§4.1); this ADR records the reasoning behind that mandate.

## Consequences

- Positive: Substring search works correctly for Traditional Chinese without an external search service.
- Positive: `CREATE EXTENSION pg_trgm` + two `CREATE INDEX CONCURRENTLY USING gin` statements are the entire setup — fits in one migration file.
- Negative: GIN indexes are larger on disk and slower to update than B-tree indexes; acceptable at demo scale (≤ 10k rows) but worth monitoring if the dataset grows by 10×.
- Negative: Queries shorter than 3 characters may not use the GIN index (Postgres planner may choose a seq scan); for this app `?q=` must be `≥ 1 char` per spec, and single/double-char searches are rare in practice.
- Neutral: Extension must be enabled before the migration runs; `docker-compose.yml` should preload `pg_trgm` in the Postgres image, and the migration SQL must include `CREATE EXTENSION IF NOT EXISTS pg_trgm`.

## Revisit when

- Dataset grows beyond ~100k rows and GIN index write amplification becomes a measurable bottleneck — then consider Meilisearch or Typesense as a sidecar search index.
- A future feature requires ranked relevance (not just substring match) — then FTS with a CJK dictionary (`zhparser` or PGroonga) becomes necessary.
- Railway's managed Postgres starts disabling `pg_trgm` (unlikely — it is a standard contrib module).

## How we'll know if this was right

- All search AC in e2e pass: `?q=愛心` returns records containing `愛心` in title or description; `?q=基金` returns matching records; `?q=zzz` returns `items: []`.
- `EXPLAIN ANALYZE` on a 1000-row dataset shows `Index Scan using gin_...` — not `Seq Scan` — for queries ≥ 3 chars.
- Search latency on Railway staging: p95 ≤ 200ms for any `?q=` request (measured in e2e smoke).
