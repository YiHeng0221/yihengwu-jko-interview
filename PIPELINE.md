# Pipeline

> 從 brief 到 demo 的 5 階段流程。**stack-agnostic**：本檔不指定具體工具，每個專案在 ADR 拍板自家的 stack。

## 一張圖看懂

```
┌──────────────────────────────────────────────────────────────┐
│                       Human (你)                              │
│  · 給需求  · 拍板架構決策 (ADR)  · 按 merge button             │
└─────────────┬───────────────────────────────────┬─────────────┘
              │                                   ▲
              ▼                                   │
  ┌─────────────────────┐                         │
  │ PM agent            │ ← brief + 設計（如有）  │
  │ • spec md + html    │                         │
  │ • preview html (UI) │                         │
  │ • epic + N 子票     │                         │
  │ • tasks.html        │ ─→ Human dry-run 拍板  ─┘
  └─────────────────────┘
              │
              ▼  status/ai-implement label flip 觸發
   ┌─────────┴────────┬─────────────┐
   ▼                  ▼             ▼
 [BE impl]        [FE impl]      [QA impl]
   │                  │             │
   └─────────┬────────┴─────────────┘
             ▼
       gh pr create（走 create-pr skill）
             │
             ▼
      [ci]（專案自寫；工作流名必為 "ci"）
             │
             ▼  workflow_run chained
      [review.yml on self-hosted runner]
       3-lens findings + cross-agent 二審 + RR-NNN
             │
        verdict?
       ┌────┴─────┐
       ▼          ▼
   review/pass  ai-fix
       │          │
       │          ▼
       │   [ai-fix.yml]  cap 3 rounds
       │          │
       │     ┌────┴──────┐
       │     pass        round>3
       │     │           │
       │     │           ▼
       │     │       human-review (escalate)
       │     ▼
       └─→ Human merge
             │
             ▼
       deploy chain（由專案 deploy.yml 提供）
             │
             ▼
       Post-deploy E2E（如有）
             │
             ▼
       demo URL 上線
```

## 5 階段

### Phase 0 — One-time infra

每個專案最開始要做：

- Monorepo / repo 結構決定（由 PM ADR-0003+ 拍板）
- GitHub Actions：本 harness 提供 `review.yml` / `ai-fix.yml` / `ai-implement.yml`；專案要自己加 `ci.yml`（工作流 name 必為 `ci`）+ `deploy.yml`（依 PaaS）
- Branch protection：required checks = `ci`、`review/pass` label、1 human approval
- Deploy infra（依專案 ADR 拍板的 PaaS）
- Initialize `docs/`：REQUIREMENTS / TESTING / SCALING / RISKS / REVIEWS / decisions / prompts
- 寫 ADR-0003+ 拍板 stack（FE framework / BE framework / DB / lint / test / deploy provider 各一條）
- 跑 `./scripts/setup-labels.sh` 建好 35+ 顆 label
- 設必要 secret（PaaS token、etc.）

> Process ADR-0001/0002 從 harness 繼承，不必重寫。

Phase 0 完成後，每個 feature 走 Phase 1-4 不再回頭碰 CI/CD infra。

### Phase 1 — Planning (PM agent)

PM agent 讀 brief（+ 設計檔 如有），拆 spec → epic + N children。

- `docs/specs/0NNN-<slug>.md` — spec md（Background / Goals / Non-goals / User Stories / AC / Risks / Dependencies）
- `docs/specs/0NNN-<slug>.html` — 同內容 HTML 版（human reviewer 用）
- `docs/specs/0NNN-<slug>.preview.html` — 視覺草稿（如有 UI）
- `docs/specs/0NNN-<slug>.tasks.html` — task breakdown dry-run（**human 拍板才 `gh issue create`**）
- 每個 user story → 對應 N 個 issue（含 AC + labels `area/<lane>` / `risk/` / `size/` / `epic/<NN>`）
- 任何 architectural fork → 列 2-3 options + tradeoffs，**等 human 拍板再寫 ADR**

Output：approved spec + N issues ready，全部 label = `status/human-review`。

### Phase 2 — Parallel implementation

Human 把對應 issue 翻成 `status/ai-implement` → `ai-implement.yml` 觸發 → runner 啟動對應 lane 的 impl agent。

Lane 平行：BE / FE / QA 各自 worktree、各自 branch（`feature/epic-<NN>-<lane>-issue-<NN>`）。

- **QA**：從 AC 設計 test cases（Critical / Important / Edge）。**不等 impl** — 測試描述「想要的行為」。
- **Impl**：schema-first。先寫 contract schema → BE handler + FE component 對著 schema 來 → 跑 type generation → 補 unit test。

Push 到 lane branch。

### Phase 3 — Review pipeline

PR 開出 → cascade：

1. **CI**（cheap、mechanical）— 由專案 `ci.yml` 定義（typecheck / lint / test / build / size check / secret scan）
2. ci pass → 自動加 `ai-review` label
3. **AI Review**（一審 + 二審）on self-hosted runner：
   - 3 lens：correctness / security / architecture
   - findings 用 `🔴 / 🟡 / 🟣` 標 severity，含 `file_path:line_number`
   - Cross-agent 二審（fresh context）：append `### Round N` 到對應 RR entry
4. **Verdict**：
   - 0 🔴 → `review/pass` → human approve → merge
   - ≥1 🔴 → `ai-fix` → round counter +1
5. **AI Fix Loop**（cap 3 rounds）：
   - 分類每個 finding：`must-fix` vs `disagree-with-reason`
   - must-fix → patch + commit `review-fix/pr<N>-round-<R>: <subject>`
   - disagree → 留 polite pushback + 證據
6. **Round 4** → 拿掉 `ai-fix`、加 `human-review` + `agent/human-needed`，停 automation。

### Phase 4 — Deploy + post-deploy E2E

Merge `main` → chain：

1. `deploy.yml`（專案自寫，依 PaaS）→ deploy service(s)
2. `e2e.yml`（如專案有 e2e）→ 對 deployed URL 跑 e2e + a11y check
3. **Pass** → 在 commit 留 demo URL comment、release notes + Prompt log entry
4. **Fail** → QA agent 開 `kind/bug` issue（severity 標好、含 screenshot/video/console log）→ 回 Phase 2

> Production deploy 通常 human-triggered（take-home interview 的 demo URL 即 prod URL）。

---

## Integrity properties

| Property | How it's guaranteed |
|----------|--------------------|
| Schema/code never drift | 專案 ci 自帶 type generation drift check |
| Every feature traces to spec | Commit footer `Refs Issue#NN` + AC checklist in PR |
| AI usage auditable | `docs/REVIEWS.md` + `docs/prompts/` + README AI 使用聲明 |
| Reviewer independence | Cross-agent review + producer-cannot-review |
| Fix loop terminates | Hard cap 3 rounds → `human-review` |
| a11y is part of "done" | 每個 e2e 含 axe-core 之類掃描 |
| Decisions 有 trail | ADR for every non-obvious choice |

---

## Time budget（參考 — 各專案自調）

7-day take-home：

| Day | Phase | Output |
|-----|-------|--------|
| 1 | Phase 0 + Phase 1（第一片）| 專案 scaffold 完整、demo URL alive、ADR-0001-0002 + 首批 architectural ADR、首個 spec |
| 2-3 | Phase 2-4 第一片 | 第一個 feature 端到端 shipped |
| 4 | Phase 2-4 第二片 | 補強功能（例：search / filter）|
| 5 | Phase 2-4 第三片 | Performance pass |
| 6 | Hardening + a11y polish + bundle analysis | All gates green |
| 7 | README polish + Prompt log 整理 + 最終 demo 驗收 | Submission ready |

跑短可砍最末片改成補 docs（RISKS / SCALING）— documentation depth 在 interview review 下比半完成的 feature 更有價值。
