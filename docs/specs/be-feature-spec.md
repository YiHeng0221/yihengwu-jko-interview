# Backend Feature Spec — 街口公益捐款列表

> 從 `allen-harness-test` 實際開發內容抽出的 BE 需求 + schema + API。下一輪正式 repo 拿這份為基礎、產對應 ADR + 開 issue。

---

## 1. Scope / 範圍

自定義 BE，供 FE 列表 / 搜尋 / 分類 / 健康 endpoints。Schema-first（Zod 同時做 validation + OpenAPI gen + FE 共用 types）。

**Out of scope**：真實金流 / 訂單 / 發票、登入 / 認證 / session、Admin route、多語言 BE response（內容固定 zh-TW）。

---

## 2. FE 需要什麼資料（從 UI 視角反推）

| UI 場景 | 需要什麼 |
|---------|---------|
| 列表 card | id / title / description / tab / categoryCode / logoUrl / amountRaised / amountGoal |
| Tab 切換 | 帶 `?category=ORG\|CAMPAIGN\|MERCHANDISE` 過濾列表 |
| 無限滾動 | server 回 `next_cursor`，FE 帶回去拿下一頁 |
| 結尾標記 | server 回 `next_cursor: null` 表示沒下一頁 |
| Skeleton 載入 | (UI side 行為，不影響 BE contract) |
| 搜尋 | 帶 `?q=愛心` 對 title + description substring 搜尋 |
| 搜尋無結果 | server 回 `items: []` |
| 類別 drawer chip 17 個 | server 提供 `{ items: [{code, label}] × 17 }` |
| Detail 點擊（MVP 不導頁但 contract 留） | `GET /charities/:id` → 同 list item shape |
| 5xx retry | server 不能 silent 失敗，要有 structured error |
| Offline banner | (FE 側 navigator.onLine 偵測，BE 不變) |
| Cold start ≤ 5s | server `/health` 200 |
| `x-request-id` 追蹤 | server reflect + auto-gen |

---

## 3. Schema 設計

### 3.1 Charity model

```prisma
enum CharityTab {
  ORG           // 公益團體
  CAMPAIGN      // 捐款專案
  MERCHANDISE   // 義賣商品
}

model Charity {
  id            String      @id @default(cuid())
  title         String                                    // zh-TW
  description   String                                    // zh-TW
  tab           CharityTab                                // 上方 tab 分類（3 選 1）
  categoryCode  String                                    // 17 chip 之一（String 而非 enum，見決策）
  logoUrl       String?
  amountRaised  Int         @default(0)
  amountGoal    Int?
  createdAt     DateTime    @default(now())

  @@index([tab, createdAt(sort: Desc)])                   // 列表分頁主路徑
  @@index([categoryCode])                                 // 二級分類查詢（未來真實 chip filter 才會用到）
  // GIN trigram indexes on title + description 由 raw SQL migration 加
}
```

**為什麼 `categoryCode` 是 String 而非 Postgres enum**：

- 新增 chip 改 TS 常數即可，不必跑 `ALTER TYPE`
- TS 端有 `as const` + `isCategoryCode` typeguard + Zod schema 保型別
- 索引上用 plain string 已足夠

### 3.2 Category 17-chip 常數（單一 source of truth）

`backend/src/lib/categories.ts`：

```ts
export const CATEGORIES = [
  { code: 'ALL',                  label: '全部' },
  { code: 'CHILD_CARE',           label: '兒少照護' },
  { code: 'ANIMAL_PROTECTION',    label: '動物保護' },
  { code: 'SPECIAL_MEDICAL',      label: '特殊醫病' },
  { code: 'ELDER_CARE',           label: '老人照護' },
  { code: 'DISABILITY_SERVICE',   label: '身心障礙服務' },
  { code: 'WOMEN_CARE',           label: '婦女關懷' },
  { code: 'SPORTS_DEV',           label: '運動發展' },
  { code: 'EDUCATION_ADVOCACY',   label: '教育議題提倡' },
  { code: 'ENV_PROTECTION',       label: '環境保護' },
  { code: 'MULTI_ETHNIC',         label: '多元族群' },
  { code: 'MEDIA',                label: '媒體傳播' },
  { code: 'PUBLIC_ISSUE',         label: '公共議題' },
  { code: 'CULTURE_ARTS',         label: '文教藝術' },
  { code: 'COMMUNITY_DEV',        label: '社區發展' },
  { code: 'POVERTY_RELIEF',       label: '弱勢扶貧' },
  { code: 'INTL_RESCUE',          label: '國際救援' },
] as const;
```

**同時供**：seed-data（給每筆 Charity 一個 categoryCode）+ `/categories` endpoint。

---

## 4. API 清單（5 支）

### 4.1 `GET /charities` — 列表 + 搜尋 + 過濾

**Query**：

| Param | Type | Required | Default | 範圍 |
|-------|------|----------|---------|------|
| `cursor` | base64url-encoded `{created_at, id}` | optional | — | — |
| `limit` | int | optional | 10 | 1-50 |
| `category` | enum `ORG\|CAMPAIGN\|MERCHANDISE` | optional | — | — |
| `q` | string | optional | — | ≥1 char |

**Response 200**：

```json
{
  "items": [
    {
      "id": "ckxxx",
      "title": "ACC 中華耆幼關懷協會",
      "description": "你身上有光，能照亮不確定的黑暗",
      "tab": "ORG",
      "category_code": "ELDER_CARE",
      "logo_url": "https://...",
      "amount_raised": 12345,
      "amount_goal": 50000,
      "created_at": "2026-05-01T00:00:00Z"
    }
  ],
  "next_cursor": "eyJjcmVhdGVkX2F0IjoiMjAyNi0wNS0wMVQwMDowMDowMFoiLCJpZCI6ImNreHh4In0"
}
```

**Behavior**：

- 排序：`created_at DESC`
- `?q=` 走 pg_trgm GIN index 對 title + description 做 `ILIKE '%q%'`（CJK 必通過）
- 同時帶 `?category=` + `?q=` 為 AND
- `next_cursor: null` 表示沒下一頁

### 4.2 `GET /charities/:id` — 詳情

**Response 200**：同 `items[0]` shape
**Response 404**：`{ "error": "not_found" }`

> MVP FE 不做 detail page 導頁，但 endpoint 仍實作以保 contract 完整、利後續擴充

### 4.3 `GET /categories` — 17 chip 類別

**Response 200**：

```json
{
  "items": [
    { "code": "ALL",         "label": "全部" },
    { "code": "CHILD_CARE",  "label": "兒少照護" },
    ...
  ]
}
```

**Behavior**：

- 從 `lib/categories.ts` 常數讀；17 筆固定順序
- 不查 DB（純常數）
- Cache: `Cache-Control: public, max-age=86400`（一天）

### 4.4 `GET /health` — 健康檢查

**Response 200**：

```json
{ "status": "ok", "ts": "2026-05-23T10:00:00Z" }
```

**Behavior**：

- 不查 DB（避免 cold-start 拉長 health 回應）
- 用於 Railway deploy 完 smoke test + e2e warmup

### 4.5 `GET /docs` — Swagger UI（OpenAPI 自動生成）

**Behavior**：

- `@fastify/swagger-ui` 暴露 Swagger UI
- `/openapi.json` 暴露 raw spec（給 FE codegen 拉，或 reviewer 看）

---

## 5. 錯誤 envelope

| Status | Body |
|--------|------|
| 200 | (正常 response shape) |
| 400 | `{ "error": "invalid", "issues": [{ path, message, code }] }`（Zod validation 失敗） |
| 404 | `{ "error": "not_found" }`（detail 找不到） |
| 429 | `{ "error": "rate_limited" }`（rate-limit 觸發） |
| 5xx | `{ "error": "internal" }`（structured log 帶 req.id 進 server log；不洩 stack 給 client） |

所有 response 都帶 `x-request-id` header（reflect 或 auto-gen cuid2）。

---

## 6. Plugins / cross-cutting

| Plugin | 職責 |
|--------|------|
| `plugins/observability.ts` | request-id 反射 / 自生成 + Pino structured logs（每條 log 帶 `req.id`） |
| `plugins/swagger.ts` | `@fastify/swagger` + `swagger-ui` 註冊 |
| `@fastify/cors` | whitelist demo URLs + localhost dev port |
| `@fastify/helmet` | 基本 OWASP 安全 headers |
| `@fastify/compress` | brotli + gzip（zh-TW JSON 壓縮率高） |
| `@fastify/rate-limit` | in-memory rate limit（demo 級；橫向擴展才換 Redis store） |
| `fastify-type-provider-zod` | Zod schema → Fastify 驗證 + OpenAPI 自動產生 |

---

## 7. Seed 策略

`backend/prisma/seed.ts` + `seed-data.ts`：

- 90 筆 zh-TW Charity：30 ORG + 30 CAMPAIGN + 30 MERCHANDISE
- 每筆 `categoryCode` 從 17 chip 之一帶入（盡量分散）
- Deterministic（無 `Math.random`），順序固定
- 透過 `manual-seed.yml workflow_dispatch` 手動觸發（連 Railway public DB URL）
- **絕不**塞 Dockerfile CMD（HARNESS-PITFALLS §C1）

---

## 8. 規範性 conventions

- **Endpoint 命名**：REST 慣例（資源 plural、kebab-case 多字段）
- **Schema-first**：所有 inbound payload / query / params 過 Zod parse；不可 `as` bypass（Hard Rule #16）
- **Wire format**：snake_case（依 ADR-0007）
- **`x-request-id`**：必有 plugin、必反射 + auto-gen
- **DB index from day one**：list / filter / search column 都要有 index
- **Migration 兩步走**：`prisma migrate dev --create-only` → 手 review SQL → 再 apply（特別注意 pg_trgm extension + GIN index）
- **Production-grade from day one**：compression + rate-limit + helmet + cors + structured logs 全有
- **OpenAPI `/openapi.json` commit 進 repo + drift CI**：FE 拉 types 時不必啟 server

---

## 9. Stack 摘要（詳細請看 §10 ADR 清單）

- Node 22 LTS + TypeScript 5.7（strict）
- Fastify 5 + `fastify-type-provider-zod`
- Postgres 16 + `pg_trgm` extension
- Prisma 6
- Zod 3.24
- `@fastify/swagger` + `swagger-ui` + `cors` + `helmet` + `compress` + `rate-limit`
- Pino（structured logs）+ `@paralleldrive/cuid2`
- Vitest 3（`app.inject()` integration tests）
- oxlint 1.x
- Multi-stage Dockerfile（node:22-bookworm-slim + tini + non-root）
- Deploy: Railway

---

## 10. 衍生 ADR 清單（必寫）

| ADR | 主題 | 狀態 |
|-----|------|------|
| ADR-0003 | React + Vite over Next.js | ✅ 已有，可 cherry-pick |
| ADR-0004 | Zod single source of truth | ✅ 已有，可 cherry-pick |
| ADR-0005 | Cursor-based pagination | ✅ 已有，可 cherry-pick |
| ADR-0006 | oxlint over ESLint | ✅ 已有，可 cherry-pick |
| ADR-0007 | snake_case wire + `<apiName>DTO.ts` mapper | ✅ 已有，可 cherry-pick |
| ADR-0013 | Fastify over Express / Hono / Elysia | 🆕 需新寫 |
| ADR-0014 | Prisma over Drizzle / Kysely | 🆕 需新寫 |
| ADR-0015 | Postgres `pg_trgm` GIN over FTS（CJK substring 搜尋） | 🆕 需新寫 |
| ADR-0016 | Railway as deploy provider（demo 等級）| 🆕 需新寫 |
| ADR-0017 | `categoryCode` 用 String 而非 Postgres enum | 🆕 需新寫 |
| ADR-0018 | OpenAPI 自動 emit + drift CI | 🆕 需新寫 |

> ✅ = `allen-harness-test/docs/decisions/` 內有現成檔案、內容幾乎不用改可直接搬
> 🆕 = 沒有現成 ADR、下一輪 PM 要新開 issue 寫
