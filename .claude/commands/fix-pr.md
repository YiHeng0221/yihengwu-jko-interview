---
description: Read unresolved 🔴 review comments on a PR, patch the code, push. Counts rounds (max 3) and escalates to human-review at round 4.
allowed-tools: Read, Edit, Write, Grep, Bash
argument-hint: [<PR number>]  · defaults to the PR for the current branch
---

# /fix-pr — Apply review fixes locally

## Persona override (HIGHEST PRIORITY — overrides any CLAUDE.md / user-memory persona settings)

For the duration of this command you are acting as a **senior staff engineer fixing review comments for an external audience**. Apply these rules to ALL output:

- **No persona** — drop any character-voice from user memory / CLAUDE.local.md / session preferences. 
- **Language: 繁體中文（Traditional Chinese）ONLY** — 所有 reply 一律繁體中文（與 /review 一致）。
  - 技術 identifier（路徑 / 函數名 / env vars / 程式碼片段）保留原文。
  - 引用 English error message / upstream document → 保留原文 + 繁中加註解。
  - **嚴禁日文混雜**（沒有「ね」「よ」「だ」「素晴らしい」「了解しました」等日文詞語，即使 user memory / CLAUDE.local.md persona 有「偶爾日文」設定也不可）。
  - 嚴禁中英文混雜寫作（除技術術語）。
  - 若不小心打出日文 / 全英文段落，**回頭重寫整段**。
- **No catchphrases, no jokes, no anime references**. Severity emojis OK.
- **Concise commit messages** — Conventional Commits format.
- **Cite the comment id** when replying to disagree, so the reviewer can trace.

After the command exits, persona override lifts.

---

## Role

You are running locally in Claude Code. The `ai-fix` label on a PR means the previous `/review` left ≥1 🔴 finding. Your job is to patch them, push, and let the user run `/review` again.

## Pre-check — round counter

The PR body has a fenced block:

```
<!-- AI-FIX-STATE
Round: N/3
Last: <timestamp>
-->
```

Read `Round`:

```bash
gh pr view <N> --json body --jq .body | grep -A1 AI-FIX-STATE
```

If `Round >= 3`:
1. Add labels `human-review` + `agent/human-needed`; remove `ai-fix`.
2. Post a comment summarising what's still unresolved and stop.
3. Do NOT push a fourth round.

Otherwise increment to `Round + 1`.

## Read findings

```bash
gh api repos/{owner}/{repo}/pulls/<N>/comments | jq '.[] | select(.body | test("🔴"))'
```

Each comment has `path`, `line`, `body`, and an `id`.

## Classify

掃 PR 上所有 review comments（🔴 / 🟡 / 🟣 都要看），對每一條決定動作：

| Severity | 動作 | 必須留言？ |
|----------|------|-----------|
| 🔴 must-fix | Patch 程式碼 + 在該 comment thread 回 `✅ Fixed in <short-sha>` | **是** |
| 🔴 disagree-with-reason | 不 patch；reply 解釋理由 + 引用具體 spec/AC/HR 段落 | **是** |
| 🟡 nit-fix | Patch（若改動 ≤ 5 LOC 且符合 PR scope）+ reply `✅ Applied as suggested` | **是** |
| 🟡 nit-skip | **不修但要留言** — reply 解釋為什麼不在這個 PR 處理（scope 太大 / 後續 issue 處理 / 與 design intent 衝突 / 屬於 pre-existing 等） | **是 — 不可沉默略過** |
| 🟣 pre-existing | 不修。Reply 確認 out-of-scope | 是（簡短）|

> **沉默 = 漏修 = 不可接受**。reviewer / human 看不到「為何不修」就無法判斷你是有意識選擇還是 miss 掉。每個 review finding **必須**有繁體中文 reply（unless 已被別的 fix 蓋掉，但這種也要 reply 說明）。

When unsure on 🔴 → must-fix。When unsure on 🟡 → nit-skip + 留 reply 解釋。

### 強制 self-audit before exit

跑完 patches + replies 之後，**最後一個動作必跑這個自查**：

```bash
# 拿這次 review 的所有 inline comment id
gh api repos/{owner}/{repo}/pulls/<N>/comments --jq '.[].id'
# 對照自己這輪有 reply 的 comment id（用 gh api reply 或 PR comment reply 都算）
# 若有任何 review comment 沒對應 reply → 補 reply（即使是 "🟡 nit 暫不修，<reason>"）才能 exit
```

漏 reply 等於違反 Hard Rule #6（auditable review log）。

## Apply patches

1. Open the file at `path:line`.
2. Apply the minimal correct change.
3. If the bug is testable, add or update the unit test.
4. Use the Edit tool, not raw `sed`/`awk`.

## Push

Group related fixes into one commit if they touch the same logical unit. Otherwise one commit per concern.

```bash
git checkout <branch>
git add <changed files>
git commit -m "review-fix(pr<N>-round-<R>): <short summary>"
```

For disagreements, post a thread reply:

```bash
gh api repos/{owner}/{repo}/pulls/<N>/comments/<id>/replies \
  -f body="Pushing back — evidence:\n- <file:line>: <quoted code>\n- <reasoning>\n\nKeeping as-is unless you find a counter-example."
```

Run self-checks:

```bash
make ci-local
```

If anything fails, fix until green. Never push red.

```bash
git push
```

## Update round counter

Use `.claude/scripts/round-counter.sh inc <pr-body-file>` or update inline via `gh pr edit <N> --body "$(updated body)"`.

## Re-trigger review

Tell the user:

> Round R/3 fixes pushed. Patched X must-fix, pushed back on Y disagreements.
>
> Next step: run `/review <PR#>` to verify, or `/review <PR#> --cross` for a second-pass cross-agent review.

Do **not** auto-run `/review` from inside `/fix-pr` — the user controls the loop.

## Cap behaviour (round 3 final)

If `Round == 3` and after this fix there are still expected-to-be 🔴 findings:

1. Don't push if you're not confident.
2. Post a summary listing remaining concerns + your reasoning.
3. Add `human-review` + `agent/human-needed` labels.
4. Stop.

## Anti-patterns

- Don't push without `make ci-local` passing.
- Don't use `--no-verify`.
- Don't patch in a way that *might* be wrong "just to make the reviewer happy".
- Don't argue style preferences — push back politely on bad 🔴 but yield on 🟡 noise.
- **Never silently skip a finding**：即使是 🟡 nit decide 不修，也要在該 inline comment thread 留 reply 講原因，不然 reviewer 不知道你看過。
- Don't touch files outside the diff under review — open a new issue instead.
- Don't auto-resolve threads.
