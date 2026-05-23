# Backend Feature Spec

> **Per-project template**。每個專案在 Phase 0 / Phase 1 PM 階段填這份，記錄 BE 自身 stack + 結構 + 範圍。
> 每個欄位的選擇都應該對應一條 ADR（**沒 ADR 就不要寫死**）。
> Copy 到 `docs/specs/be-feature-spec.md`，依專案填好。

---

## 1. Scope

本 BE 範圍：

- <一句話描述提供哪些能力 / endpoint groups>
- 明確 out of scope：<例：auth / payment / admin API / 等>

## 2. Stack 選擇（每項都應對應 ADR）

| Layer | 選擇 | 對應 ADR | Why |
|-------|------|---------|-----|
| **Language / runtime** | <e.g. Node 22 + TS / Bun / Deno / Go / Python> | ADR-XXXX | <一句話> |
| **HTTP framework** | <e.g. Fastify / Express / Hono / Elysia / Gin / FastAPI> | ADR-XXXX | <一句話> |
| **DB** | <e.g. Postgres 16 + pg_trgm / MySQL / SQLite + Litestream / Mongo> | ADR-XXXX | <一句話> |
| **ORM / query builder** | <e.g. Prisma / Drizzle / Kysely / SQLAlchemy / GORM> | ADR-XXXX | <一句話> |
| **Schema / validation** | <e.g. Zod / TypeBox / valibot / Pydantic> | ADR-XXXX | <一句話> |
| **API doc generation** | <e.g. @fastify/swagger / FastAPI auto / 手寫 OpenAPI> | ADR-XXXX | <一句話> |
| **Auth** | <e.g. none / JWT / session cookie / OAuth provider> | ADR-XXXX | <一句話> |
| **Logging** | <e.g. Pino structured / Bunyan / 自寫> | ADR-XXXX | <一句話> |
| **Rate limit** | <e.g. @fastify/rate-limit in-memory / Redis store / none> | ADR-XXXX | <一句話> |
| **Compression** | <e.g. @fastify/compress brotli + gzip> | ADR-XXXX | <一句話> |
| **CORS** | <e.g. @fastify/cors with whitelist> | ADR-XXXX | <一句話> |
| **Request-id** | <e.g. plugin 反射 + auto-gen cuid / nanoid> | ADR-XXXX | <一句話> |
| **Unit / integration test** | <e.g. Vitest + app.inject() / Jest + supertest> | ADR-XXXX | <一句話> |
| **Lint / format** | <e.g. oxlint / Biome / ESLint + Prettier> | ADR-XXXX | <一句話> |
| **Container** | <e.g. multi-stage Dockerfile node 22 bookworm-slim> | ADR-XXXX | <一句話> |
| **Deploy provider** | <e.g. Railway / Fly / Vercel functions / AWS Lambda> | ADR-XXXX | <一句話> |

## 3. 目錄結構

```
backend/
├── prisma/                  # (或對應 ORM 的 schema/migrations folder)
│   ├── schema.prisma
│   ├── migrations/
│   ├── seed.ts
│   └── seed-data.ts
├── src/
│   ├── lib/                 # cursor.ts / categories.ts / toWire.ts / domain primitives
│   ├── plugins/             # request-id / zod-validation / cors / rate-limit
│   ├── routes/              # 一個 endpoint group 一個檔
│   ├── schemas/             # Zod schemas (or whatever validator) — single source of truth
│   ├── app.ts               # Fastify app 組裝
│   └── server.ts            # 啟動 entrypoint
└── test/
```

## 4. API contract

| 議題 | 決定 | 對應 ADR |
|------|------|---------|
| Wire format | <snake_case / camelCase> | ADR-XXXX |
| Pagination | <cursor / offset / page-token> | ADR-XXXX |
| Error envelope | <`{ error: 'code', issues: [] }`> | ADR-XXXX |
| Request id | <reflect `x-request-id` + auto-gen if absent> | ADR-XXXX |
| `/health` shape | <`{ status: 'ok', ts }`> | ADR-XXXX |

## 5. 規範性 conventions

- **Endpoint 命名**：REST 慣例（`/charities`、`/charities/:id`）— resource plural、kebab-case 多字段。
- **Validation 必過 schema**：所有 inbound payload / query / params 跑 schema parse；不過 schema 直接 `as` 是 Hard Rule #16 違反。
- **DB index**：Production-grade from day one（Hard Rule #14）— 列表 / search column 必加 index，不留 sequential scan。
- **Migration**：用 ORM 的 `--create-only` flag 產 SQL，然後手 review、確認 raw SQL 對（特別是 extension / GIN index 這類 ORM 不會自動帶的）。
- **Seed**：seed.ts 走 deterministic（不用 `Math.random`），seed-data 抽到獨立檔，由 `workflow_dispatch` 手動觸發 — **絕不**塞 Dockerfile CMD（見 HARNESS-PITFALLS §C1）。

## 6. 衍生 ADR 清單

從本說明書產出的 ADR：

- [ ] ADR-XXXX <language / framework>
- [ ] ADR-XXXX <DB + ORM>
- [ ] ADR-XXXX <wire format>
- [ ] ADR-XXXX <pagination strategy>
- [ ] ADR-XXXX <auth>
- [ ] ADR-XXXX <deploy provider>
- [ ] ...

PM 階段把每個未寫的 ADR 開 issue（label `kind/chore` + `area/docs`），PR 進來時連結到本說明書。
