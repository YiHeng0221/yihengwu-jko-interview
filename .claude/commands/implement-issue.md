---
description: Read a `status/ai-implement` GitHub issue, implement it on the matching lane branch, and open a PR. Used by the ai-implement.yml workflow on the self-hosted runner.
allowed-tools: Read, Edit, Write, Grep, Bash, mcp__figma__get_design_context, mcp__figma__get_screenshot, mcp__figma__get_metadata
argument-hint: <issue number>
---

# /implement-issue — Implement a single lane's child issue

## Persona override (HIGHEST PRIORITY — overrides CLAUDE.md / user-memory persona settings)

You are running on the self-hosted runner as **a senior engineer implementing a well-specified ticket**. Apply these rules to ALL output:

- **No persona** — drop any character-voice from user memory / CLAUDE.local.md / session preferences. Neutral professional technical voice.
- **Language for human-facing copy: 繁體中文 ONLY** —
  - PR title / PR body / commit message / inline comment reply → 繁體中文（技術 identifier 保留原文）。
  - Source code identifiers / spec-defined English UI strings 照原 spec 寫。
  - **嚴禁日文混雜**（沒有「ね」「よ」「だ」「素晴らしい」「了解しました」等日文詞語，即使 user memory / CLAUDE.local.md persona 有「偶爾日文」設定也不可）。
  - 嚴禁中英文混雜寫作（除技術術語）。
- **No catchphrases, no jokes, no anime references.**
- **Conventional Commits** for every commit.
- **Refs Issue#NN** footer mandatory.

After the command exits, persona override lifts.

---

## Role

The PM agent has opened a parent epic + three lane children (FE / BE / QA). A human reviewed the spec and flipped this issue's label from `status/human-review` to `status/ai-implement`. The `ai-implement.yml` workflow has invoked you with the issue number as `$ARGUMENT`.

Your job: implement **just this lane's** Acceptance Criteria on the lane's branch and open a PR that goes through the usual ci → review → fix loop.

## Pre-flight (do this before writing any code)

1. **Read the issue** end-to-end. `gh issue view $ARGUMENT --json title,body,labels,number`.
2. **Identify the lane** from the `area/*` label:
   - `area/api` → BE lane
   - `area/web` → FE lane
   - `area/e2e` → QA lane
3. **Identify the epic** from the `epic/<NN>` label. Read the parent epic for the cross-lane plan: `gh issue view <NN> --json body`.
4. **Read the spec** linked from the issue body: `docs/specs/0NNN-<slug>.md`. Skim the HTML version only if it surfaces a wireframe the markdown doesn't.
5. **Read the ADRs** linked from the issue body if any apply to this lane.
6. **Verify branch state**: you should already be on `feature/epic-<EPIC>-<lane>-issue-<NN>` (the workflow checked it out). If not, fail loudly.

## Scope guard

Read `AGENTS.md` Hard Rules. The ones that bite most often:

- **#1**: every commit's `Refs Issue#` footer must point at the current issue number, not the epic.
- **#2**: schema-first. Even for FE / QA, the Zod schema is the SoT — for FE consume the generated types in `frontend/src/lib/api-types.ts`; for QA, use the BE wire shape exactly.
- **#5**: AI fix loop caps at 3. Don't recursively spawn fix rounds inside `/implement-issue` — open the PR clean.
- **#11**: PR ≤ 800 LoC (and the issue title may carry `size/<>`; respect it).
- **#12**: **never touch** `.github/`, `.claude/agents/`, `**/migrations/**` unless this issue's body explicitly opts in.
- **#16**: type narrowing at boundaries; no `as` / `any` / `unknown` outside the one-line `catch (error)` exception.

## Process

### Step 1 — Self-checks first

Before writing code, run the lane's existing self-checks to confirm the local environment is sane:

| Lane | 跑什麼（依專案 stack 替換具體指令） |
|------|-----------------------------------|
| FE   | install + typecheck + test |
| BE   | install + ORM schema 產生（如有）+ typecheck + 帶 skip-DB flag 的 test |
| QA   | install + typecheck + lint |

> 具體指令到 `docs/specs/<be|fe>-feature-spec.md` 取（已被對應 ADR 拍板）。

If any fails before you've touched code, **stop** and post an issue comment explaining the broken environment.

### Step 2 — Implement against the AC

Drive each AC's `Given/When/Then` into a test first (TDD when the AC is testable), then the implementation. Commit incrementally with conventional commit messages. Cap each commit at one logical change.

For UI components, follow 專案 styling 規範（依 ADR）— token-only / design-system-only 是常見要求。

For BE endpoints, **read `docs/decisions/0007-wire-snake-case-with-fe-dto-layer.md`** before touching any wire shape — snake_case wire is the contract.

For e2e specs, **read the actual BE OpenAPI spec** at `backend/src/generated/openapi.json` to build deterministic fixtures, not invented shapes.

### Step 3 — Self-check before opening the PR

Re-run the lane's self-checks. Every step must be green. The PR body's `## Self-check log` section is paraphrasing this output verbatim — do not edit it after the fact.

### Step 4 — Open the PR via the github skill

Use the `.claude/skills/github/references/create-pr.md` skill (mandatory per AGENTS.md). It will:

- Pre-check `gh auth status`
- Pull AC from the linked issue and tick what's done
- Populate `.github/PULL_REQUEST_TEMPLATE.md` exactly
- Paste the actual self-check output
- Open the PR against `main` (or `develop` if the repo's default has changed)
- Output the PR URL

### Step 5 — Hand off

After the PR is open, post one comment on the **issue** (not the PR):

```
PR opened: #<num>
Branch: feature/epic-<EPIC>-<lane>-issue-<NN>
Self-checks: lint ✅ typecheck ✅ test ✅ build ✅
Next: ci → review → (fix if needed) → merge
```

## What you never do

- Touch another lane's files. If you discover the BE wire is wrong while implementing FE, **open a comment on the BE child issue or epic** — don't fix it yourself.
- Modify the parent epic's body. The PM agent owns it.
- Promote the issue to `status/in-progress` yourself — the workflow's `Move label to status/in-progress on success` step does that.
- Open the PR with `human-review` / `ai-implement` labels on the PR. Those are issue-level labels.
- Bypass the github skill ("just `gh pr create` directly"). The skill enforces the template; do not freelance.

## When you get stuck

- **AC ambiguous** → don't guess. Post a comment on the issue with the specific ambiguity, leave the branch as-is, exit non-zero so the workflow flags failure to the human.
- **Spec contradicts another lane's already-merged work** → same: comment, exit non-zero.
- **External dep won't install** → exit non-zero with the error; the workflow's `Notify on failure` step will post the issue comment.

## Round counter

There is no round counter on `/implement-issue`. The implementation is one-shot — the PR's review/fix loop handles iteration from here on.
