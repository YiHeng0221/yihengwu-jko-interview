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

## RR-008 — chore(infra): add frontend multi-stage Dockerfile + nginx.conf (P0-12)
- PR: #28
- Date: 2026-05-24
- Reviewer: local Claude Code (second pass)
- Verdict: changes-requested
- Findings: 🔴×1 · 🟡×0 · 🟣×0
- Round: 2 of 3

### Key concerns
- `frontend/nginx.conf:27` — nginx `add_header` 不繼承：location /assets/ 與 = /index.html 定義了自己的 add_header，導致 server 層安全標頭（X-Content-Type-Options、X-Frame-Options、Referrer-Policy）在這兩個 location 的回應中消失，Round 1 修補失效。🔴

### Round history
- Round 1: 2026-05-24 — changes-requested → ai-fix applied (security headers, gzip, .git exclusion, image version pinning)
- Round 2: 2026-05-24 — changes-requested (nginx add_header inheritance bug found)

---

## RR-007 — chore(repo): add root scaffold files (pnpm workspace + tsconfig.base + Makefile)
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
