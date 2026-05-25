# Project Context — yihengwu-jko-interview

> 街口公益捐款列表 SPA 復刻 + AI-driven 開發 harness。7-day take-home interview submission（2026-05-25 24:00 deadline）。

## What this repo is

- **Domain**: 街口支付 App「所有捐款項目」頁面 replica
- **Surface**: 3-tab list（ORG / CAMPAIGN / MERCHANDISE，各 90 筆），cursor infinite scroll，CJK 搜尋，類別 chip 過濾
- **Stack**: Fastify 5 + Prisma 6 + Postgres / React 19 + Vite 6 + Tailwind v4 / Playwright + axe-core / Railway deploy
- **AI workflow**: PM → impl → review → ai-fix → human merge，跑在 ubuntu-latest GH Actions

## Read these files when relevant

| Topic | File |
|-------|------|
| Hard rules（commit / PR / size / etc.）| `AGENTS.md` |
| Pipeline phases | `PIPELINE.md` |
| **Harness 踩坑紀錄（必讀）** | `docs/HARNESS-PITFALLS.md` |
| Self-hosted runner gotchas（歷史，現用 ubuntu）| `docs/RUNNER-PITFALLS.md` |
| Cross-agent review log | `docs/REVIEWS.md` |
| All 22 ADRs | `docs/decisions/` |
| Feature specs | `docs/specs/be-feature-spec.md` · `docs/specs/fe-feature-spec.md` |
| Phase 1 retro | `docs/RETRO-PHASE-1.md` |
| Demo walkthrough | `docs/DEMO.md` |

## Where things live

```
backend/                Fastify + Prisma + Zod single source of truth
  src/lib/schemas.ts    Zod source-of-truth（FE 對齊）
  src/lib/toWire.ts     camelCase → snake_case mapper
  prisma/seed-data.ts   270 deterministic items（Lorem Picsum）
frontend/               React 19 + Vite 6 + Tailwind v4
  src/features/         charities / search / category
  src/lib/ui/           Card / Button / Chip / Drawer / Dialog / icons
  src/styles/theme.css  @theme CSS-first tokens
e2e/                    Playwright + axe-core
docs/specs/             feature specs
docs/decisions/         ADRs 0001-0022
docs/prompts/           代表性 AI 對話
.claude/agents/         6 個 agent persona
.github/workflows/      ci · review · ai-fix · ai-implement · deploy · e2e
```

## Naming（contract，不可改）

- **Branch**: `feature/epic-<NN>-<lane>-issue-<NN>` lane ∈ {fe, be, qa, infra, docs}
- **Commit**: Conventional Commits，footer 必填 `Refs Issue#NN`
- **Spec**: `docs/specs/<slug>.md`
- **ADR**: `docs/decisions/0NNN-<slug>.md`
- **Prompt log**: `docs/prompts/0N-<topic>.md`
- **Cross-agent review entry**: `RR-NNN` in `docs/REVIEWS.md`

## Operating rules

1. 動工前先讀對應 issue 的 AC，不確定就停
2. 開 PR 前必跑 self-check：`pnpm typecheck && pnpm test && pnpm lint`
3. 所有 GitHub 操作走 `gh` CLI
4. Issue 有 `agent/human-needed` → 不改 code、留 comment
5. PR 有 `human-review` → 不 auto-fix、等 human
6. 看到自己 lane 外的問題 → 開新 issue 不要 inline fix
7. 不要編造數字（perf / scale / cost）。要就量、不然就標 "estimate"
8. **Submission docs 不引用其他 repo**（spec 第一稿曾誤引用 lean-harness 開發 repo，後清掉）

## Polymorphic data model（避免再踩同坑）

`Charity` model 用 **option A**：所有 tab 共用一個 model，per-tab 欄位全 nullable：

| Field | ORG | CAMPAIGN | MERCHANDISE |
|-------|-----|----------|-------------|
| `logoUrl` | ✅ 120×120 square | — | — |
| `bannerImageUrl` | — | ✅ 640×360 | — |
| `productImageUrl` | — | — | ✅ 400×300 |
| `orgName` | — | ✅ 紅小字 | ✅ 灰字 |
| `tags` | — | ✅ from categoryCodes | — |
| `priceNtd` | — | — | ✅ NTD currency |
| `categoryCodes` | ✅ array | ✅ array | ✅ array |
| `amountGoal` | nullable | ✅ | ✅ |

**Why option A**：early seed bug — schema 沒這些欄位但 Card UI 用了 → CAMPAIGN/MERCHANDISE 卡只渲染 title。一支 migration 補齊（schema-first + Zod single source of truth 才不會再漏網）。

## CSP（demo-grade）

`frontend/nginx.conf` 設：

```
default-src 'self';
script-src 'self';
connect-src 'self' https:;
img-src 'self' data: https:;
object-src 'none';
base-uri 'self';
```

`https:` 在 img-src + connect-src 是 demo 期間的放寬（picsum CDN 切換、Railway BE 域名 build-time 未知）。Demo 後可收緊為精準 whitelist + CSP-report-only 監控 violation。

## Success criteria for a feature

- Issue closed
- PR merged with 1 human approval
- E2E pass against staging（含 a11y check）
- ADR entry exists for any architectural choice
- Prompt log captures the most non-obvious AI conversation for that feature
- No bug issue opens within 24 hours

## Model selection

- Heavy reasoning（architect / security review）: **Opus**
- Standard impl / single-lens review: **Sonnet**
- Light parsing / label routing: **Haiku**
