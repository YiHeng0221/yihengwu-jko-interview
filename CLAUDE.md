# Project Context (auto-loaded)

> 本檔被 Claude Code 在這個 repo 的每個 session 自動讀取。保持精簡。
> 這份是 **lean-harness（scaffold）自身**的 CLAUDE.md — 從 harness 啟動的專案會自己改寫 / 補上 project-specific 內容。

## What this repo is

`lean-harness` 是一個 **stack-agnostic AI 開發 harness**：
- 提供 agent personas / workflows / labels / PR conventions / AI-fix loop
- **不假設**任何 tech stack — 每個專案自己決定 + 寫 ADR

新專案從 lean-harness 啟動之後，要：
1. 改寫此檔 → 描述自家專案的 domain / stack
2. 寫 ADR-0003+ 拍板 stack（FE framework / BE framework / DB / lint / test / deploy provider 各一條）
3. PM phase 開 epic + children

## Read these files when relevant

| Topic | File |
|-------|------|
| Hard rules | `AGENTS.md` |
| Pipeline phases | `PIPELINE.md` |
| **Harness 整體踩坑紀錄（必讀）** | **`docs/HARNESS-PITFALLS.md`** |
| Self-hosted runner gotchas | `docs/RUNNER-PITFALLS.md` |
| Cross-agent review log | `docs/REVIEWS.md` |
| Process ADRs（harness 自己的）| `docs/decisions/0001` / `0002` |
| Templates | `templates/` |

## Where things live

```
docs/specs/         ← 各 feature 的 approved spec（PM 階段產出）
docs/decisions/     ← ADRs（harness 0001/0002 + 各專案 0003+）
docs/prompts/       ← 代表性 AI 對話 log
docs/REVIEWS.md     ← Cross-agent review log
.claude/agents/     ← 6 個 agent persona
.claude/hooks/      ← Safety scripts
.github/workflows/  ← review.yml / ai-fix.yml / ai-implement.yml
templates/          ← spec / ADR / review 等 starter template
scripts/            ← setup-labels.sh 等 harness utility
```

## Naming（contract，不可改）

- **Branch**: `feature/epic-<NN>-<lane>-issue-<NN>`，lane ∈ {fe, be, qa, infra, docs}
- **Commit**: Conventional Commits，footer 必填 `Refs Issue#NN`
- **Spec**: `docs/specs/0NNN-<slug>.md`（3-digit）
- **ADR**: `docs/decisions/0NNN-<slug>.md`（3-digit）
- **Prompt log**: `docs/prompts/0N-<topic>.md`（2-digit，target 2–5 個）
- **Cross-agent review entry**: `RR-NNN`（3-digit）in `docs/REVIEWS.md`

## Labels（一鍵建立）

```bash
./scripts/setup-labels.sh                       # 用目前預設 repo
./scripts/setup-labels.sh owner/repo            # 指定 repo
```

家族：`kind/` · `area/` · `status/` · `agent/` · `risk/` · `size/` · `severity/` · `ai-review` · `review/pass` · `ai-fix` · `human-review` · `epic/<NN>` · `phase/<N>`

詳見 `scripts/setup-labels.sh`。

## Model selection

- Heavy reasoning (architect / security review): **Opus**
- Standard impl / single-lens review: **Sonnet**
- Light parsing / release notes / label routing: **Haiku**

## Operating rules

1. 動工前先讀對應 issue 的 AC，不確定就停。
2. 開 PR 前必跑 self-check（依專案定義；至少 typecheck + lint + test）。
3. 所有 GitHub 操作走 `gh` CLI。
4. Issue 有 `agent/human-needed` → 不改 code、留 comment。
5. PR 有 `human-review` → 不 auto-fix、等 human。
6. 看到自己 lane 外的問題 → 開新 issue 不要 inline fix。
7. 不要編造數字（perf / scale / cost）。要就量、不然就標 "estimate"。

## Success criteria for a feature

- Issue closed
- PR merged with 1 human approval
- E2E pass against staging（含 a11y check）
- ADR entry exists for any architectural choice
- Prompt log captures the most non-obvious AI conversation for that feature
- No bug issue opens within 24 hours
