# 街口公益捐款列表 · JKO Charity List Replica

> 街口支付 App 「所有捐款項目」頁面的 SPA 復刻 — 公益團體 / 捐款專案 / 義賣商品 三 tab 列表、cursor 無限滾動、CJK 子字串搜尋、類別 chip 過濾。
> 7-day take-home interview submission · 2026-05-18 → 2026-05-25

## Demo

| Surface | URL |
|---------|-----|
| Web app | https://yihengwu-jko-interview-frontend.up.railway.app |
| API | https://yihengwu-jko-interview-backend.up.railway.app |
| Swagger UI | https://yihengwu-jko-interview-backend.up.railway.app/docs |
| Health | https://yihengwu-jko-interview-backend.up.railway.app/health |

詳細 demo 操作流程見 [`docs/DEMO.md`](docs/DEMO.md)。

## Stack

| Layer | Choice | ADR |
|-------|--------|-----|
| FE framework | React 19 + Vite 6 + TypeScript 5.7 | [ADR-0003](docs/decisions/0003-react-vite-over-nextjs.md) |
| FE styling | Tailwind v4 `@theme` CSS-first tokens | [ADR-0008](docs/decisions/0008-tailwind-v4-theme-tokens.md) |
| FE data layer | TanStack Query v5（infinite + cursor）| [ADR-0009](docs/decisions/0009-tanstack-query-as-data-layer.md) |
| FE UI primitives | 自家寫的 Button / Card / Tabs / Drawer / Dialog（不引 MUI/Headless） | [ADR-0010](docs/decisions/0010-custom-ui-primitives.md) |
| FE testing | Vitest + React Testing Library | — |
| FE catalog | Storybook 8 + Vite builder | [ADR-0011](docs/decisions/0011-storybook-8-vite-builder.md) |
| FE lint | oxlint over ESLint | [ADR-0006](docs/decisions/0006-oxlint-over-eslint.md) |
| BE framework | Fastify 5 + `fastify-type-provider-zod` | [ADR-0013](docs/decisions/0013-fastify-over-express-hono-elysia.md) |
| BE schema | Zod single source of truth → OpenAPI auto-emit | [ADR-0004](docs/decisions/0004-zod-single-source-of-truth.md) · [ADR-0018](docs/decisions/0018-openapi-auto-emit-and-drift-ci.md) |
| DB | Postgres 16 + pg_trgm GIN（CJK substring）| [ADR-0014](docs/decisions/0014-prisma-over-drizzle-kysely.md) · [ADR-0015](docs/decisions/0015-pg-trgm-gin-over-fts.md) |
| Pagination | Cursor-based（`{created_at, id}` base64url）| [ADR-0005](docs/decisions/0005-cursor-pagination.md) |
| Wire format | snake_case + FE DTO mapper layer | [ADR-0007](docs/decisions/0007-wire-snake-case-with-fe-dto-layer.md) |
| Deploy | Railway（Docker per-workspace pattern）| [ADR-0016](docs/decisions/0016-railway-as-deploy-provider.md) |
| E2E | Playwright + axe-core a11y | — |
| CI runners | ubuntu-latest（public repo unlimited minutes）| [ADR-0021](docs/decisions/0021-migrate-to-ubuntu-latest-runners.md) |

所有 ADR：[`docs/decisions/`](docs/decisions/)

## 本機跑

```bash
# 1. clone + install
git clone https://github.com/YiHeng0221/yihengwu-jko-interview.git
cd yihengwu-jko-interview
pnpm install

# 2. 起 Postgres（docker compose 或本機 Postgres 16）
docker compose up -d postgres

# 3. backend: migrate + seed + dev server
cd backend
cp .env.example .env  # 改 DATABASE_URL 指向本機
pnpm prisma migrate deploy
pnpm tsx prisma/seed.ts  # seeds 270 charities（90 × 3 tabs）
pnpm dev  # http://localhost:3001

# 4. frontend dev server（另一個 terminal）
cd frontend
pnpm dev  # http://localhost:5173
```

## Architecture

```
yihengwu-jko-interview/
├── backend/                Fastify + Prisma + Zod
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/     init + add_polymorphic_fields + category_codes_array
│   │   └── seed-data.ts    270 deterministic items, Lorem Picsum images
│   └── src/
│       ├── lib/
│       │   ├── schemas.ts  Zod single-source-of-truth
│       │   ├── toWire.ts   camelCase → snake_case mapper
│       │   ├── cursor.ts   base64url cursor codec
│       │   └── prisma.ts
│       ├── routes/         charities + categories + health
│       ├── plugins/        observability / swagger / cors / helmet / compression / rate-limit
│       └── generated/openapi.json  自動產出，commit 進 repo
├── frontend/               React + Vite + Tailwind v4
│   ├── nginx.conf          prod 用，含 CSP headers
│   └── src/
│       ├── features/
│       │   ├── charities/  CharityListPage + useCharityList + dto
│       │   ├── category/   CategoryDrawerDialog（mobile drawer + desktop dialog）
│       │   └── search/     SearchBar + SearchResults + useSearch
│       ├── hooks/          useDebounce / useIntersection / useMediaQuery / useOnline
│       ├── lib/
│       │   ├── layout/     TopBar + Tabs + SubRow + StickyHeaderStack
│       │   ├── ui/         Card / Button / Chip / Drawer / Dialog / icons/
│       │   └── env.ts      Zod-validated import.meta.env
│       └── styles/theme.css  Tailwind v4 @theme tokens（街口紅 / radius / spacing）
├── e2e/                    Playwright + axe-core
├── docs/
│   ├── decisions/          22 ADRs
│   ├── specs/              fe-feature-spec + be-feature-spec
│   ├── prompts/            代表性 AI 對話 log
│   ├── REVIEWS.md          cross-agent review entries (RR-NNN)
│   ├── HARNESS-PITFALLS.md AI-開發框架本身踩過的坑
│   ├── DEMO.md             5-min demo walkthrough
│   └── RETRO-PHASE-1.md    Phase 1 retrospective
└── .github/workflows/      ci · review · ai-fix · ai-implement · deploy · e2e · manual-seed
```

## 功能涵蓋

- ✅ 三 tab：公益團體 / 捐款專案 / 義賣商品（各 90 筆）
- ✅ Cursor 無限滾動 + Skeleton loading
- ✅ Polymorphic Card：每 tab 不同 layout（ORG icon+text、CAMPAIGN banner+tags、MERCHANDISE grid+price）
- ✅ Tab 切換 sticky URL + `?category=` 同步
- ✅ Tab 切換有 floating indicator 動畫
- ✅ 搜尋 overlay（白底 SearchBar 介於 TopBar 與 Tabs 之間）+ 300ms debounce + AbortController
- ✅ 搜尋按 tab 過濾（不會跨 tab）
- ✅ 類別 chip drawer（mobile）/ dialog（desktop）→ slide-up 動畫
- ✅ 類別 chip 點擊立刻 refetch（`?category_code=`）+ drawer 不自動關
- ✅ a11y：所有 interactive 有 aria-label、focus ring、Tab 巡覽順序、aria-pressed/aria-selected
- ✅ Error / Empty / Offline state
- ✅ ErrorBoundary 接 5xx/4xx-non-401
- ✅ `x-request-id` reflect + auto-gen，Pino structured logs
- ✅ pg_trgm GIN index for CJK substring search
- ❌ Detail page（contract 保留但 UI out-of-scope）
- ❌ 真實金流 / 登入（spec 明示 out-of-scope）

## 怎麼開發出來的（AI workflow）

整個專案在 **AI-driven harness** 上跑：

```
docs/specs (PM 寫)
    ↓
GitHub issue（status/human-review → status/ai-implement）
    ↓
.github/workflows/ai-implement.yml
    ↓
Claude Code Action 跑 impl agent → 開 PR
    ↓
.github/workflows/review.yml（chained CI 後觸發）
    ↓
review agent 留 inline comment（lens：correctness / security / arch）
    ↓
🔴 finding → ai-fix.yml 自動修；🟡/🟣 → human 看了再決定
    ↓
human merge（最終 gate）
```

**Agent personas**（`.claude/agents/`）：

| Persona | Job |
|---------|-----|
| `pm` | Read brief + Figma → write spec + epic + child issues |
| `impl` | Read issue AC → write code, commit, push, open PR |
| `reviewer` | Read PR diff → inline-comment 🔴/🟡/🟣 findings |
| `ai-fix` | Read review comments → apply 🔴 fixes, push commit |
| `qa` | Read spec → write Playwright + axe-core tests |
| `orchestrator` | Coordinate above when multi-step is needed |

**Hard rules**（`AGENTS.md`）：

- 一張票 = 一件事（不切碎成 80 個 trivial PR）
- 每張 PR ≤ 800 lines diff（user policy 拉到 ≤ 500）
- 3-round AI-fix 上限（防無限 loop）
- ADR 必寫：任何「兩個合理 alternatives 且選錯成本高」的決策
- `--no-verify` / 跳 CI 一律禁
- Conventional Commits + Refs Issue#NN footer

**Labels**（`scripts/setup-labels.sh`）：

`kind/` · `area/` · `status/` · `agent/` · `risk/` · `size/` · `severity/` · `epic/<NN>` · `phase/<N>`

詳細流程 + 22 個 ADR + 踩坑紀錄見 [`docs/HARNESS-PITFALLS.md`](docs/HARNESS-PITFALLS.md) + [`PIPELINE.md`](PIPELINE.md)。

## 代表性 AI 對話

挑了 3 個代表性對話放在 [`docs/prompts/`](docs/prompts/)：

1. [polymorphic schema 漏網事件](docs/prompts/01-polymorphic-schema-missed.md) — 為什麼 Card UI 改了但拿不到資料
2. [Railway Dockerfile 偏執修法](docs/prompts/02-railway-dockerfile-pnpm-workspace.md) — 雙 Docker 工作區的 lockfile 戰爭
3. [CSP img-src 漸進放寬](docs/prompts/03-csp-img-src-progressive.md) — 從精準 whitelist 到 https: wildcard

## License

MIT（personal interview submission，請勿商用）。
