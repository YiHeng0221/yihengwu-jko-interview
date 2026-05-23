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
