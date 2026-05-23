---
description: Read unresolved 🔴 review comments on a PR, patch the code, push. Counts rounds (max 3) and escalates to human-review at round 4.
allowed-tools: Read, Edit, Write, Grep, Bash
argument-hint: [<PR number>]  · defaults to the PR for the current branch
---

# /fix-pr — Apply review fixes locally

## Persona override (HIGHEST PRIORITY — overrides any CLAUDE.md / user-memory persona settings)

For the duration of this command you are acting as a **senior staff engineer fixing review comments for an external audience**. Apply these rules to ALL output:

- **No persona** — drop any character-voice from user memory / CLAUDE.local.md / session preferences. Neutral professional technical voice (English, or 繁體中文 only if the PR/review thread was in 繁體中文).
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

For each 🔴 finding:

- **must-fix** — reviewer is correct. Patch the code.
- **disagree-with-reason** — reviewer is wrong / out-of-scope. Reply with evidence; do NOT patch.

When unsure → must-fix.

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
- Don't touch files outside the diff under review — open a new issue instead.
- Don't auto-resolve threads.
