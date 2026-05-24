# Cross-Agent Review Log

> Every PR with substantive logic gets a cross-agent review entry below.
> Format: `RR-NNN` (zero-padded, never reused).

## Why this exists

Single-pass AI review has correlated blind spots. A second reviewer with a fresh context catches what the first missed, and a public log of disagreements makes the decision trail auditable.

## How entries get added

1. `review.yml` runs first-pass AI review on every non-draft PR.
2. `cross-agent-review` job runs a second model with a **fresh context** — it does not see the first reviewer's reasoning.
3. The second reviewer appends an entry below and commits as `docs(review): RR-NNN cross-agent`.
4. When a PR goes through multiple `ai-fix` rounds, append `### Round 2`, `### Round 3` subsections to the same RR entry — don't open a new RR.

## Format

```markdown
## RR-NNN — <PR title>
- PR: #<num>
- Date: <YYYY-MM-DD>
- Reviewer (first): <model name>
- Reviewer (cross-agent): <model name>
- Verdict: pass | changes-requested | human-needed
- Findings: 🔴×N · 🟡×N · 🟣×N
- Cross-agent agreement: full | partial | divergent

### Key concerns
- <one line per concern>

### Disagreements between reviewers
- <file:line> — first reviewer said X, second reviewer said Y. Resolution: ...

### Round history
- Round 1: <date> — <verdict>
- Round 2: <date> — <verdict>
- Round 3: <date> — <verdict, or human-needed escalation>
```

## Entries

<!-- Insert new RR-NNN entries below. Most recent at the top. -->

## RR-011 — feat(web): P1-FE-04 Tabs + EmptyState + ErrorState + EndMarker primitives
- PR: #85
- Date: 2026-05-25
- Reviewer (first): local Claude Code (claude-opus-4-7)
- Reviewer (cross-agent): pending
- Verdict: changes-requested
- Findings: 🔴×3 · 🟡×5 · 🟣×1
- Round: 1 of 3

### Key concerns
- `frontend/src/lib/ui/Tabs/Tabs.tsx:40` — Roving tabindex 未完成：onChange 觸發後 focus 被瀏覽器拋回 <body>，違反 WAI-ARIA APG Tabs Pattern；測試未覆蓋 focus 移轉。🔴
- `frontend/src/lib/ui/Tabs/Tabs.tsx:32` — Home / End 鍵盤 key 未實作，違反 APG SHOULD 與 fe-feature-spec.md §5 a11y AC。🔴
- `frontend/src/lib/ui/ErrorState/ErrorState.tsx:24` — role=alert 包住整個 ErrorState（含 retry button），AT 會 assertive 打斷但無 focus 落點，retry 行動不可達。🔴
- `frontend/src/lib/ui/Tabs/Tabs.tsx:64` — aria-controls 指向 tabpanel-${value} 但 panel 不存在，axe aria-valid-attr-value 會 fail。🟡
- `frontend/src/lib/ui/Tabs/Tabs.tsx:29` — activeIndex === -1 無 defensive 處理，非法 value 時 UI 靜默。🟡
- `frontend/src/lib/ui/ErrorState/ErrorState.tsx:39` — retryLabel !== null 無法區分 null 與 undefined，default 啟動條件與意圖落差。🟡
- `frontend/src/lib/ui/EndMarker/EndMarker.tsx:19` — ❤ emoji 經 user 拍板移除（spec mock 重複裝飾）。🟡 → resolved
- `frontend/src/lib/ui/Tabs/Tabs.tsx` — ...rest spread 僅承載 aria-label，可讀性下降；建議顯式取 prop。🟡
- `docs/specs/fe-feature-spec.md:194` — spec 仍寫 index.ts，與 ADR-0019 衝突；本 PR 不阻塞但需另開 issue 修。🟣

### Round history
- Round 1: 2026-05-25 — changes-requested（焦點 a11y：3 條 🔴 圍繞鍵盤 / 螢幕閱讀器互動完整性）

---

## RR-010 — fix(skills): 嚴禁日文混雜 — review / fix-pr / implement-issue 全 ZH-TW only
- PR: #96
- Date: 2026-05-24
- Reviewer: local Claude Code (first pass, claude-sonnet-4-6)
- Verdict: pass
- Findings: 🔴×0 · 🟡×1 · 🟣×0
- Round: 1 of 3

### Key concerns
- `.claude/commands/implement-issue.md:18` — 缺少「若不小心打出日文 / 全英文段落，**回頭重寫整段**」自我修正規則，與 `fix-pr.md` 及 `review.md` 的語言 directive 不對稱（🟡 Nit）

---

## RR-009 — docs(review): RR-008 review round 2 for PR #28
- PR: #34
- Date: 2026-05-25
- Reviewer (first): local Claude Code (claude-sonnet-4-6)
- Reviewer (cross-agent): n/a
- Verdict: pass
- Findings: 🔴×0 · 🟡×2 · 🟣×0
- Cross-agent agreement: n/a

### Key concerns
- `docs/REVIEWS.md:48` — `Reviewer:` 欄位不符模板，應拆分為 `Reviewer (first):` / `Reviewer (cross-agent):` / `Cross-agent agreement:`，與 RR-001~007 格式不一致。🟡（已由 `e913349` 修復）
- `docs/REVIEWS.md:57` — Round 1 findings 缺 `🔴×N·🟡×N` 計數與 Key concerns 條列，audit trail 完整性不對稱。🟡（已由 `e913349` 修復）

### Round 2 (2026-05-25)
- Verdict: pass
- Findings: 🔴×0 · 🟡×1 · 🟣×0
- What changed since round 1: `e913349` 補入 Reviewer 欄位拆分 + `### Round 1 findings（backfill）` sub-section
- `docs/REVIEWS.md:51` — `Findings:` header 僅記錄 Round 2 計數（🔴×1·🟡×0）；補入 backfill 後 Round 1（🔴×1·🟡×3）未反映於 header，讀者會低估此 RR 總 finding 數。🟡 non-blocking

### Round history
- Round 1: 2026-05-25 — pass（🔴×0·🟡×2；兩條 nit 均由 `e913349` 修復）
- Round 2: 2026-05-25 — pass（🔴×0·🟡×1；Findings header 語意落差，non-blocking）

---

## RR-008 — chore(infra): add frontend multi-stage Dockerfile + nginx.conf (P0-12)
- PR: #28
- Date: 2026-05-24
- Reviewer (first): local Claude Code (claude-sonnet-4-6)
- Reviewer (cross-agent): n/a（single-pass round 2）
- Verdict: changes-requested
- Findings: 🔴×1 · 🟡×0 · 🟣×0
- Round: 2 of 3
- Cross-agent agreement: n/a

### Key concerns
- `frontend/nginx.conf:27` — nginx `add_header` 不繼承：location /assets/ 與 = /index.html 定義了自己的 add_header，導致 server 層安全標頭（X-Content-Type-Options、X-Frame-Options、Referrer-Policy）在這兩個 location 的回應中消失，Round 1 修補失效。🔴

### Round 1 findings（backfill）
- Findings: 🔴×1 · 🟡×3 · 🟣×0
- `frontend/nginx.conf:6` — 缺少基線安全標頭（X-Content-Type-Options、X-Frame-Options、Referrer-Policy）。🔴
- `frontend/.dockerignore:19` — `.git/` 未排除 build context，影響建構速度。🟡
- `frontend/Dockerfile` — `nginx:alpine` 未釘定具體版本，reproducibility 受損。🟡
- `frontend/nginx.conf:46` — 未啟用 gzip 壓縮。🟡

### Round history
- Round 1: 2026-05-24 — changes-requested → ai-fix applied (security headers, gzip, .git exclusion, image version pinning)
- Round 2: 2026-05-24 — changes-requested (nginx add_header inheritance bug found)
- Round 3: 2026-05-25 — **pass** (round 1/2 🔴 全部 fix；後續 ai-fix 還補 CSP / .dockerignore 位置 / Dockerfile stub 警示注釋 等)

### Round 3 (2026-05-25)
- Reviewer: local Claude Code (claude-opus-4-7, via `/review`)
- Verdict: **pass** ✅
- Findings: 🔴×0 · 🟡×2 · 🟣×0
- What changed since round 2: nginx add_header 在 location /assets/ 與 = /index.html 重複宣告（修好繼承斷裂）；CSP 完整化（連 connect-src / base-uri / default-src）；.dockerignore 從 frontend/ 搬到 repo root（解決 Docker build context 不讀 sub-dir .dockerignore 的問題）；Dockerfile stub 加上同步警示注釋；HEALTHCHECK + image version pin 完整保留

### Round 3 nit findings（不 blocker）
- `frontend/nginx.conf:3` — `server_tokens off;` 未設定，nginx 預設 `Server: nginx/1.27.x` 暴露版本。🟡
- `frontend/Dockerfile:21` — stub `backend/package.json` 寫 `name: "backend"`，但真實 package 名為 `@yihengwu-jko/backend`。目前 pnpm 用路徑 key 不靠 name 比對所以能 build，但若未來 frontend 用 `workspace:*` 引用 backend 會踩雷。🟡
- PR: #23（Issue#6 / P0-05）
- Date: 2026-05-24
- Reviewer (first): local Claude Code（claude-opus-4-7, via `/review`）
- Reviewer (cross-agent): **未跑**（review.yml workflow 沒鏈第二段；backfill 寫入時間點此 gap 已修補，見 commit message）
- Verdict: pass
- Findings: 🔴×0 · 🟡×1 · 🟣×0（首段三大概念面均 0🔴）
- Cross-agent agreement: n/a（單審）

### Key concerns
- `Makefile:10` — `prisma migrate dev` 是 dev-only 指令，缺少 `migrate-deploy` target；prod 部署容易誤用。🟡
- `tsconfig.base.json:10` — `"noEmit": true` 設在 base；backend 若未 override，tsc 靜默不輸出 JS，runtime 錯誤訊息不直觀。🟣
- `Makefile:31` vs `package.json:16` — 兩個 CI 入口（`make ci-local` / `pnpm run ci`）定義重複，後續容易 drift。🟣

### Round history
- Round 1: 2026-05-24 — pass（self-check 未跑因 workspaces 尚不存在，預期狀態）

---

## RR-006 — chore(infra): add docker-compose.yml + .env.example for local Postgres 16 dev
- PR: #22（Issue#8 / P0-07）
- Date: 2026-05-24
- Reviewer (first): local Claude Code（claude-opus-4-7, via `/review`）
- Reviewer (cross-agent): 未跑（同 RR-007 gap）
- Verdict: pass
- Findings: 🔴×0 · 🟡×1 · 🟣×1
- Cross-agent agreement: n/a

### Key concerns
- `docker-compose.yml:8` — `POSTGRES_PASSWORD` hardcode；建議改為 `${POSTGRES_PASSWORD:-postgres}` 以支援環境覆寫。🟡
- PR 標題 `chore(infra)` 與 git commit `feat(infra)` Conventional Commit 類型不一致。🟣
- 正向：`.gitignore` 已正確排除 `.env`、`healthcheck` 設定合理、`init.sql` idempotent。

### Round history
- Round 1: 2026-05-24 — pass

---

## RR-005 — chore(repo): add oxlint config (.oxlintrc.json) + root lint script
- PR: #21（Issue#7 / P0-06）
- Date: 2026-05-24
- Reviewer (first): local Claude Code（claude-opus-4-7, via `/review`）
- Reviewer (cross-agent): 未跑（同 RR-007 gap）
- Verdict: changes-requested
- Findings: 🔴×1 · 🟡×0 · 🟣×2
- Cross-agent agreement: n/a

### Key concerns
- `package.json:6` — `--deny-warnings` 使 `no-console: "warn"` 實際等同 `error`，與 PR description 及 Issue#7 AC 描述的「warn（非阻斷）」語意矛盾。🔴 **blocker**
- `package.json` — `oxlint` 未列入 `devDependencies`，CI 依賴全域安裝（隱性前提，需在 P0-05 追蹤補齊）。🟣
- `.oxlintrc.json:2` — `$schema` 指向 `main` 分支，應鎖版本 tag。🟣

### Round history
- Round 1: 2026-05-24 — changes-requested → 進 ai-fix loop（受 GITHUB_TOKEN loop guard 影響，需 human 手動觸發 fix；見 HARNESS-PITFALLS §C7）

---

## RR-004 — docs(adr): add BE ADRs 0013-0015, 0017-0018（Fastify/Prisma/pg_trgm/categoryCode/OpenAPI）
- PR: #20（Issue#4 / P0-03）
- Date: 2026-05-24
- Reviewer (first): local Claude Code（claude-opus-4-7, via `/review`）
- Reviewer (cross-agent): 未跑（同 RR-007 gap）
- Verdict: pass
- Findings: 🔴×0 · 🟡×2 · 🟣×3
- Cross-agent agreement: n/a

### Key concerns
- `0017:60` — 「Zod schema not regenerated」措辭與衍生機制矛盾，misleading for implementers。🟡
- `0015:59` — 1–2 字元 query 走 seq scan 是確定性行為、非「may」；規模增長時有 perf cliff。🟡
- `0018:68` — `SKIP_DB=true` guard 實作位置未明確，多 plugin 場景有漏掉風險。🟣

### Round history
- Round 1: 2026-05-24 — pass（AC Issue#4 全覆蓋；Nits 均為文件精確度問題，不擋 merge）

---

## RR-003 — docs(adr): add FE ADRs 0008-0012（Tailwind v4 / TanStack Query / Custom UI / Storybook / Dialog-Drawer）
- PR: #19（Issue#3 / P0-02）
- Date: 2026-05-24
- Reviewer (first): local Claude Code（claude-opus-4-7, via `/review`）
- Reviewer (cross-agent): 未跑（同 RR-007 gap）
- Verdict: pass
- Findings: 🔴×0 · 🟡×0 · 🟣×3
- Cross-agent agreement: n/a

### Key concerns
- `0009-tanstack-query-as-data-layer.md:50` — ADR-0005 交叉引用為懸空指標（ADR-0005 尚未合入此 repo）。🟣
- `0012-dialog-drawer-responsive-strategy.md:51` — Breakpoint `768px` 耦合僅靠文字說明、ADR-0008 未定義具名 token，缺乏可執行的防護。🟣
- `docs/decisions/README.md:19` — P0-01 前置說明文字在 cherry-pick 完成後若未清理將成為誤導性噪音。🟣

### Round history
- Round 1: 2026-05-24 — pass

---

## RR-002 — docs(decisions): cherry-pick ADRs 0003-0007（React+Vite / Zod / cursor / oxlint / snake_case wire）
- PR: #18（Issue#2 / P0-01）
- Date: 2026-05-24
- Reviewer (first): local Claude Code（claude-opus-4-7, via `/review`）
- Reviewer (cross-agent): 未跑（同 RR-007 gap）
- Verdict: pass
- Findings: 🔴×0 · 🟡×1 · 🟣×2
- Cross-agent agreement: n/a

### Key concerns
- `0005-cursor-pagination.md:38` — Prisma index 缺少 `id` 欄位；cursor tiebreaker 的排序穩定性未保障。🟡
- `0004-zod-single-source-of-truth.md:47` — HR#16 括弧說明少列 `unknown`，與 AGENTS.md 原文不符。🟣
- `0003-react-vite-over-nextjs.md:30` — React Router v7 與 Remix 已合併，Option C 命名讓讀者誤以為是不同 library。🟣
- 註：PR body 自查清單對 HR#16 引用錯誤，但 commit 進來的 ADR-0004 引用正確，不阻塞 merge。

### Round history
- Round 1: 2026-05-24 — pass

---

## RR-001 — docs(adr): add ADR-0016 Railway as deploy provider
- PR: #17（Issue#5 / P0-04）— 全 repo 第一個走完 ai-implement → ci → review chain 的 PR
- Date: 2026-05-23
- Reviewer (first): local Claude Code（claude-opus-4-7, via `/review`）
- Reviewer (cross-agent): 未跑（同 RR-007 gap）
- Verdict: changes-requested
- Findings: 🔴×1 · 🟡×1 · 🟣×2
- Cross-agent agreement: n/a

### Key concerns
- `0016-railway-as-deploy-provider.md:88` — `RAILWAY_STATIC_URL` 不是 Railway 標準內建變數，正確應為 `RAILWAY_PUBLIC_DOMAIN`；後續 e2e 腳本若照此引用將因變數為空而靜默失敗。🔴 **blocker**
- `0016-railway-as-deploy-provider.md:29` — 將 PostgreSQL extension (`pg_trgm`) 描述為 Railway 平台的 "first-class plugin"，與第 70 行自身描述矛盾，術語不精確。🟡
- `docs/decisions/README.md:11` — ADR 編號從 0002 直接跳至 0016，README 自述「0003 起是 architectural ADR」，但跳號原因未說明，索引可讀性低。🟣

### Round history
- Round 1: 2026-05-23 — changes-requested → 進 ai-fix loop（受 GITHUB_TOKEN loop guard 影響，需 human 手動觸發 fix）

---

> **本批 RR-001 ~ RR-007 為 backfill**：原本 `review.yml` workflow 只跑 first pass、沒鏈第二段 cross-agent；且首段 AI 在 ADR/config 類「文件型」PR 上自動跳過 RR 寫入步驟，導致 audit trail 漏記。本 commit 一次補回 7 條 RR、並同步修補 `review.yml` + `.claude/commands/review.md` 強制每個 PR 都寫 RR + 跑 `--cross`。Cross-agent 二審回補留待 Phase 0 之後資源穩定再批次跑（不阻塞 Phase 0 merge）。

<!--
## RR-000 — Example template (delete on first real entry)
- PR: #0
- Date: 2026-05-20
- Reviewer (first): claude-opus-4-7
- Reviewer (cross-agent): claude-sonnet-4-6
- Verdict: pass
- Findings: 🔴×0 · 🟡×2 · 🟣×0
- Cross-agent agreement: full

### Key concerns
- None blocking.

### Disagreements between reviewers
- None.

### Round history
- Round 1: 2026-05-20 — pass
-->
