# Architecture Decision Records

> ADRs capture *why* we made a non-obvious choice. They are dated, numbered, immutable once Accepted, and superseded explicitly when revised.

## Index

| # | Title | Status | Date |
|---|-------|--------|------|
| 0001 | [Documentation conventions](0001-documentation-conventions.md) | Accepted | — |
| 0002 | [Cross-agent code review](0002-cross-agent-review.md) | Accepted | — |
| 0003 | [React + Vite over Next.js](0003-react-vite-over-nextjs.md) | Accepted | 2026-05-24 |
| 0004 | [Zod as single source of truth for schemas](0004-zod-single-source-of-truth.md) | Accepted | 2026-05-24 |
| 0005 | [Cursor-based pagination over offset](0005-cursor-pagination.md) | Accepted | 2026-05-24 |
| 0006 | [oxlint over ESLint](0006-oxlint-over-eslint.md) | Accepted | 2026-05-24 |
| 0007 | [snake_case wire + FE DTO mapper layer](0007-wire-snake-case-with-fe-dto-layer.md) | Accepted | 2026-05-24 |
| 0016 | [Railway as deploy provider](0016-railway-as-deploy-provider.md) | Accepted | 2026-05-24 |
| 0013 | [Fastify over Express / Hono / Elysia](0013-fastify-over-express-hono-elysia.md) | Accepted | 2026-05-24 |
| 0014 | [Prisma over Drizzle / Kysely](0014-prisma-over-drizzle-kysely.md) | Accepted | 2026-05-24 |
| 0015 | [pg_trgm GIN over FTS for CJK substring search](0015-pg-trgm-gin-over-fts.md) | Accepted | 2026-05-24 |
| 0017 | [categoryCode as String over Postgres enum](0017-category-code-string-over-pg-enum.md) | Accepted | 2026-05-24 |
| 0018 | [OpenAPI auto-emit and drift CI](0018-openapi-auto-emit-and-drift-ci.md) | Accepted | 2026-05-24 |
| 0008 | [Tailwind v4 `@theme` tokens](0008-tailwind-v4-theme-tokens.md) | Accepted | 2026-05-24 |
| 0009 | [TanStack Query as data layer](0009-tanstack-query-as-data-layer.md) | Accepted | 2026-05-24 |
| 0010 | [Custom UI primitives](0010-custom-ui-primitives.md) | Accepted | 2026-05-24 |
| 0011 | [Storybook 8 + Vite builder](0011-storybook-8-vite-builder.md) | Accepted | 2026-05-24 |
| 0012 | [Dialog/Drawer responsive strategy](0012-dialog-drawer-responsive-strategy.md) | Accepted | 2026-05-24 |
| 0019 | [No barrel files in frontend](0019-no-barrel-files-frontend.md) | Accepted | 2026-05-24 |
| 0020 | [Split self-hosted runner: review vs fix lanes](0020-dual-runner-split.md) | Superseded by 0021 | 2026-05-24 |
| 0021 | [Migrate to ubuntu-latest runners](0021-migrate-to-ubuntu-latest-runners.md) | Accepted | 2026-05-24 |

> **0001 / 0002 是 harness 的 process ADR**，所有專案繼承。
> **0003 起是 architectural ADR**，**由各專案自己寫**（記錄選的 stack / tooling / patterns 為什麼）。

<!-- Each project: append your 0003+ entries above this comment, sorted by number. -->

## When to write an ADR

不寫 ADR 的情況：日常選擇（檔案命名 / Conventional Commits / 哪邊放 types）。

**要**寫 ADR 的情況：

- 一個選擇有 ≥ 2 合理 alternatives 且選錯成本高（DB engine / ORM / pagination strategy / auth mechanism / state management / lint tool）
- 加 / 換 dependency
- 取捨某個 performance trade-off（加 index / 改 compression algo）
- 引入 workflow rule（cross-agent review / 3-round fix cap）

## Numbering

- 三位數 zero-padded：`0001`、`0042`
- `0001` 跟 `0002` 保留給 process ADR（documentation、review），feature ADR 從 `0003` 起跳

## Status lifecycle

- **Proposed** — 草稿、等 human approve
- **Accepted** — landed，binding 直到 superseded
- **Superseded by ADR-NNNN** — 保留歷史；連結的 ADR 取代它
- **Deprecated** — 不再 enforce 但還沒被取代（少見）

## Naming

`0NNN-<kebab-case-slug>.md`，slug 用 imperative（"add"、"replace"、"adopt"）或 noun phrase（"pagination strategy"）。

從 `templates/adr-template.md` 開頭。
