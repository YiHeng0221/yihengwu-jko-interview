# Phase 1 Retrospective — yihengwu-jko-interview

- **Period**: 2026-05-18 → 2026-05-25（7 days）
- **Scope**: 街口公益捐款列表 SPA replica MVP
- **Epic**: [#33](https://github.com/YiHeng0221/yihengwu-jko-interview/issues/33)（含 後續 Phase 1.1 polish）

## Metrics（最終）

| | Count |
|---|---|
| Closed issues | 53 |
| Merged PRs | 78 |
| ADRs written | 22（含 0001-0002 process, 0003-0021 stack/feature, 0022 conditional）|
| Specs | 2（fe-feature-spec.md + be-feature-spec.md）|
| Avg PR diff | ~ 200-400 LoC（cap at 500 hand-written，800 with codegen / fixtures）|
| AI-fix rounds triggered | ~12 rounds（每 PR cap 3，多數 1-round pass）|
| Cross-agent review entries (RR-NNN) | 18+ |
| Test suite | BE 66 / FE 225 / E2E 2（smoke + axe）|

> 數字是 estimate；精準看 `gh pr list --state merged` + `docs/REVIEWS.md`。

## 走對的

### 1. Schema-first + Zod single source of truth（ADR-0004）

`backend/src/lib/schemas.ts` 寫一次，BE Fastify validation + OpenAPI emit + FE 共用 type 都吃同一個。Schema 換欄位時 TS 編譯立刻喊話，FE/BE 不會偷偷 drift。整個 Phase 1 沒有發生過「FE 拿到的 shape 跟 BE 寫的不一樣」這種事 — 除了 polymorphic 漏網事件，那個是因為 schema 根本沒寫該欄位（option A nullable design 第一輪沒落地）。

### 2. AI cross-agent review loop（ADR-0002）

`review.yml` 在每個 PR 跑 reviewer agent，留 inline 🔴/🟡/🟣 findings。3 個典型救援：

- PR #103 cascading TS errors — review 抓到 generic 漏 `<>`，3 個錯一起修
- PR #112 advisory drift mode 是錯方向 — review 提示走精準 commit-per-PR
- PR #148 searchListDTO 漏網 — review 抓到 second DTO drift（polymorphic schema 漏網事件）

human review 必須留 final approval 但 ~70% findings 在 AI review 階段就解了。

### 3. 自家 UI primitives（ADR-0010）

不引 MUI / Headless UI，自己寫 Button / Card / Chip / Drawer / Dialog / Tabs / Input / Icon / Skeleton / Spinner / EmptyState / ErrorState / EndMarker / SubRow / StickyHeaderStack / TopBar。**Trade-off**：多寫一些 LoC（大概多 400 行），換來 bundle size 小、樣式 100% 對齊街口 spec、a11y 自己 own、token 系統乾淨。

a11y 跑 axe-core full ruleset → list/search/drawer 三個 view state 都 0 critical / 0 serious violations（手動）。

### 4. PM 切票顆粒（記憶內 `feedback_pm_scope_sizing`）

Phase 1 wave 1 第一刀切了 ~33 個 issues，跑完發現實際工作量集中在 8-12 張 epic-level 票，其他都 trivial 一票 < 30 LoC。Phase 1.1 polish 把切票顆粒拉回「8-12 個 lane children、每張 100-300 LOC」。寫進 `docs/HARNESS-PITFALLS.md` §E1。

### 5. Per-workspace Dockerfile

pnpm workspace + Docker 的 idiom 是 `cd backend && pnpm install`，不要 `pnpm install --filter`。第一次踩 3 個錯解法後 user 指路看 reference repo 才解。

## 走錯 / 拖累的

### 1. 跑 self-hosted runner（ADR-0020 → 0021）

Phase 1 中後期試圖把雙 self-hosted runner 拆 review / fix lane，跑了 ~3 小時發現 OAuth token 維護成本 2×、macOS launchd 不穩。最後改 ubuntu-latest。**前期不該動這個**，public repo 的 Actions minutes 無限，self-hosted 沒有 ROI 在 demo 階段。

### 2. polymorphic schema 只 ship FE（polymorphic schema 漏網事件）

PR #124 動 FE Card 元件，BE schema 對應的 migration / Zod schema / seed 都沒一起 ship。FE DTO 寬鬆的 `.nullable().optional()` 把 BE 漏網欄位掩蓋掉，user 用肉眼比對截圖才發現。**根因**：PM 切票時 FE Card 跟 BE schema 沒 cross-link 成 sibling issues。Action item A1。

### 3. 第二份 DTO 漂移

`frontend/src/features/search/dto/searchListDTO.ts` 跟 `charitiesListDTO.ts` 都解析 `/charities` 回應，但分開維護 → schema 改一次要兩個檔都改。PR #148 第一輪只改 list DTO 漏掉 search DTO，AI review 抓到。**理想**：search 直接吃 charitiesListDTO（已開 issue #149 follow-up）。

### 4. CSP 精準 whitelist 不夠魯棒

Lorem Picsum 圖在 Phase 1 polish 階段加入，CSP `img-src` 第一次用精準 whitelist 還是被 user 看到 blocked。Wildcard 在 nginx config 不知為何被吃掉 + picsum CDN trail 可能變動。第二輪改 `img-src 'self' data: https:` 解決。**Lesson**：demo 階段 CSP 該防 inline script / base-uri hijack，不是 image origin。

### 5. UI polish 重複輪迴

`#129` UI polish 票一張累積到 15 點 modifications（drawer 樣式 + chip / radius / SearchBar 位置 / placeholder / chevron / 字距 / 字行距）。理由是 PM 階段沒拿 Figma reference 對照 → 切實實作後 user 一條一條挑出來。**Action item A2**：未來 PM 階段要產出 visual reference 截圖加進 spec，不然這種 polish round 會永遠跑下去。

## Action items（Phase 2 內外）

| ID | Action | Owner | Status |
|----|--------|-------|--------|
| A1 | PM 切票要 cross-link FE 元件 + BE schema 為兄弟 issue | PM agent | open（已記入 session memory：`feedback_pm_scope_sizing`） |
| A2 | PM 階段要把 visual reference 截圖嵌進 spec | PM agent | open |
| A3 | searchListDTO 收斂到 charitiesListDTO（issue #149） | impl agent | open |
| A4 | CSP report-only mode 蒐 violation report（post-demo） | infra | parked |
| A5 | `docs/HARNESS-PITFALLS.md` 新增「polymorphic schema option A 必須 cross-lane ship」 | docs | open |
| A6 | Cross-agent review 在 multi-DTO drift 場景特別關注 | reviewer agent | open（已在 polymorphic schema 漏網事件 紀錄） |
| A7 | E2E 4 條 happy path（list / search / category drawer / a11y full scan）補完 | qa agent | **deferred — 時間限制未完成**。工具鍊已 wire（playwright.config + smoke spec + e2e.yml workflow），手動 QA 走 docs/DEMO.md 步驟。|

## 給未來 Phase / 同類專案的建議

1. **Phase 0：先 spec、再 stack、最後 issue**。Phase 1 一邊寫 ADR 一邊 ship，有幾個 ADR 是事後補（ADR-0019 no-barrel 規則是 PR #88 reviewer 提出才追認），下次 spec 一次到位。
2. **「一張票一件事」要先用 tasks.html dry-run 拍板**。Phase 1 wave 1 開了 33 票，半數 trivial。Phase 1.1 polish 走 8 票回到比較舒服的工作量。
3. **AI review 是低成本高保險**。每張 PR 都跑一次，~5% 的 PR 會被 catch 一個 🔴 finding。換算 ROI 很高。
4. **Schema-first 不是「BE 寫一份」就好**。FE DTO 要對應嚴格（required → optional 必須 explicit），不要無腦 `.nullable().optional()`。
5. **Demo deploy 用 Docker per-workspace + ubuntu-latest CI**，不要過早最佳化基礎建設。

## Linked artifacts

- Specs: [`docs/specs/`](specs/)
- ADRs: [`docs/decisions/`](decisions/)
- Cross-agent reviews: [`docs/REVIEWS.md`](REVIEWS.md)
- Harness pitfalls: [`docs/HARNESS-PITFALLS.md`](HARNESS-PITFALLS.md)
- Prompt logs: [`docs/prompts/`](prompts/)
- Demo flow: [`docs/DEMO.md`](DEMO.md)
