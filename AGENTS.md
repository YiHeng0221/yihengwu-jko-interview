# Agent Guidelines

> Entry point for all AI agents. Read this before doing anything else.

---

## 🚨 第一次幫新專案動工的 agent — 多讀一份

`docs/HARNESS-PITFALLS.md` — 從前期實戰踩到的 20+ 個坑。**不讀的代價**：seed 流程 churn 多個 PR、env config 擋掉 demo、必要 label 不存在卡住 workflow ⋯ 都有過。

---

## Hard Rules (non-negotiable)

1. **Every PR maps to a GitHub issue, every issue has Acceptance Criteria** (Given/When/Then).
2. **Schema-first**：把資料 contract 寫死才動 handler / UI。Schema 是 single source of truth — BE validate / API doc generation / FE types 都從它生。具體用什麼 schema 工具（Zod / io-ts / TypeBox / Pydantic / ...）由專案 ADR 決定。
3. **AC is the shared language**：QA 從 AC 寫 e2e；FE/BE 對著 AC 實作；reviewer 對 AC 驗收。
4. **CI must pass before AI review**（typecheck / lint / unit test / build — 由專案 ci 工作流定義）。便宜的 validator 先跑。
5. **AI Fix Loop is capped at 3 rounds**。Round 4+ → label `human-review` + `agent/human-needed`，停 automation。
6. **Cross-agent review on substantive PRs**：第二個 AI agent（如可能用不同 model family）做 fresh-context 二審。記錄到 `docs/REVIEWS.md` 的 `RR-NNN`。
7. **Producer cannot review**：寫 code 的 agent 不能 approve 自己的 PR。
8. **No silent decisions**：任何架構 fork 都要列出 ≥ 2 options + tradeoffs，等 human 拍板。
9. **Conventional Commits required**：`<type>(<scope>): <subject>`。Footer 必填 `Refs Issue#NN`。
10. **Never commit secrets**、never `git push --force`、never `--no-verify`。Branch protection 強制。
11. **PR size ≤ 800 lines diff**。大過此就拆。**偏好 ≤ 500 hand-written**。
12. **Never modify**：`.github/`、`.claude/agents/`、`**/migrations/**`、`.env*` 沒有 explicit issue 不能改。
13. **Every finding must include `file_path:line_number`** + 建議 patch。
14. **Production-grade from day one**：index、pagination、rate-limit、compression、structured logs。
15. **a11y is part of "done"**：每個 e2e 含 a11y 掃描通過。
16. **Type narrowing at boundaries — never `as` / `any` / `unknown` as an escape hatch.**

    Positive form：
    - **External data**（network / env / URL params / localStorage / `JSON.parse`）一律過 schema parse 才往內流。Schema output 是 inward 的 concrete type。
    - **Generics** 加 constraints：`<T extends DomainEntity>`，不是 `<T>`、永遠不是 `any`。
    - **Polymorphic flows** 用 discriminated union + exhaustive switch + `assertNever(x)`，不要 `value as Foo`。
    - **Test assertions** 用 type predicate（`is X`）或具體 `expect(...).toHaveProperty(...)`，不要 `as unknown as string`。

    `unknown` 唯一允許的位置：**`catch (error)`**。TS 4.4+ 強制 catch clause 是 `unknown`。**下一行必須立刻 narrowing**（`instanceof Error` / schema parse / type predicate），不可 propagate。

---

## Review architecture — self-hosted runner + local Claude Code

不燒雲端 API 額度。流程跑在 **self-hosted GitHub Actions runner**，用本機 Claude Code CLI（吃 user 訂閱）。

```
PR push
  │
  ▼
[ ci.yml on GitHub-hosted runner ]  ← 由專案 bootstrap 自己寫；名稱必為 "ci"（contract）
  ├─ typecheck / lint / test / build / secret scan
  └─ on success → gh pr edit --add-label ai-review
                         │
                         ▼
[ review.yml on self-hosted runner ]  ← 本 harness 提供
  ├─ trigger: workflow_run of "ci" completed (success)
  ├─ checkout PR head
  └─ run: claude -p "/review <PR#>"
         · 3-lens findings (correctness / security / architecture)
         · post inline comments via gh api
         · append RR-NNN to docs/REVIEWS.md
         · set label review/pass OR ai-fix per verdict

If verdict = changes-requested → label ai-fix → [ ai-fix.yml ]
  ├─ guard: round counter (cap at 3)
  └─ run: claude -p "/fix-pr <PR#>"
         · classify each 🔴 finding (must-fix vs disagree-with-reason)
         · patch + commit + push
         · increment round counter
         · remove ai-fix → re-triggers ci → re-triggers review
```

**Cross-agent / second-pass review**：跑 `claude -p "/review <PR#> --cross"`。二審必須 **fresh context**（不看一審 output）才能找盲區。

**Cap**：3 round。Round 4 → `human-review` + `agent/human-needed`，automation halt。

**Why**：zero API cost、full project context loaded、no GitHub App churn、push-based。

---

## What I expect you to do

- 從每個 feature 的 issue AC 開始讀
- 用 task tracker 規劃 — max 5 steps
- AC 可測時走 TDD：先寫 failing test
- 每個 commit footer 必含 `Refs Issue#NN`
- PR body 含 `## AC traceability` + `## Self-check log`（走 `.claude/skills/github/references/create-pr.md`）
- 遇到 fork → 列 2-3 options 停下、不要自己拍板
- domain-specific 不確定 → 問人，不要猜

---

## What I don't want

- Premature abstraction. 三行類似程式可接受。
- 解釋 *what* 的 comment。只解釋 *why*。
- 用 `.skip` / `as any` 繞過 typecheck / test。
- Self-review。
- Silent fallback。失敗就 escalate。
- 留 "TODO" 在 ship code 沒有對應 tracking issue。

---

## AI Fix Loop — round counter

`ai-fix.yml` 工作流：

1. Trigger on `ai-fix` label。
2. 讀 PR 上 review comments（`gh api`）。
3. 讀 `scripts/round-counter.sh` → current round（沒有就 1）。
4. `round > 3`：移除 `ai-fix`、加 `human-review` + `agent/human-needed`、留言、停。
5. 否則：classify 每個 comment 是 `must-fix` 還是 `disagree-with-reason`。
6. must-fix → patch、commit as `review-fix/pr<N>-round-<R>: <subject>`。
7. disagree → 留 polite pushback with evidence。
8. Push → re-review trigger → round +1。

Round counter 放 PR description 的 fenced block：

```
<!-- AI-FIX-STATE
Round: 2/3
Last: 2026-05-20T10:23:45Z
-->
```

---

## Project context — 每個專案要 fill in

新專案 bootstrap 時，在 repo 內 `docs/PROJECT-CONTEXT.md` 或 `CLAUDE.md` 內補：

```markdown
## Project context

- Domain: <一句話描述本專案是什麼>
- Tech stack: <FE / BE / DB / lint / test / build 列出來，每項對應 ADR>
- Deployment: <provider + 服務拓樸>
- Demo URL: <fill after first deploy>
- Spec source: <設計檔 / brief 連結>
- Acceptance criteria source: docs/REQUIREMENTS.md
```

Stack 必須由 ADR 拍板，**不可由 impl agent 在程式裡偷渡**（違反 Rule #8）。

---

## How to disagree with a Hard Rule

1. 不要靜默 bypass。
2. 開 issue label `kind/exception-request`。
3. 寫進 `docs/exceptions/<date>-<reason>.md`。
4. 等 human approval 才動。
