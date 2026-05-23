# ADR-0002 — Cross-agent code review

- **Date**: 2026-05-20
- **Status**: Accepted
- **Deciders**: project owner
- **Related**: `AGENTS.md` (Hard Rules 6, 7), `docs/REVIEWS.md`, `.github/workflows/review.yml`, `.github/workflows/ai-fix.yml`

## Context

Single-pass AI review tends to share blind spots with the implementer (especially when both are the same model family). We want independent verification before code lands, plus an auditable record of where the two reviewers agreed and disagreed.

## Decision

Every non-draft PR goes through two AI review passes:

1. **First-pass review** — `claude-opus-4-7` with the full Three-Lens rubric (correctness / security / architecture). Leaves inline comments with severity tags and a `VERDICT:` line.
2. **Cross-agent review** — `claude-sonnet-4-6` with a **fresh context** (it does not see the first reviewer's reasoning). Reads the diff, leaves its own comments, and appends an `RR-NNN` entry to `docs/REVIEWS.md` noting agreement/disagreement with the first reviewer.

If 🔴 findings remain after both passes, the PR is labelled `ai-fix` and the `ai-fix` agent attempts a patch. Hard cap at 3 rounds; round 4 escalates to `human-review`.

## Options considered

### Option A — Single AI reviewer

- Pros: simplest, fastest
- Cons: no independent verification; if the reviewer has a blind spot, nobody catches it

### Option B — Two AI reviewers, both opus (same family)

- Pros: independent contexts
- Cons: same model family ≈ correlated blind spots; only marginally better than A

### Option C — Two AI reviewers, opus + sonnet (different families if available, e.g., Codex)

- Pros: maximum independence; different model families have uncorrelated blind spots
- Cons: 2× review cost per PR; needs careful prompt to prevent the second reviewer from echoing the first

### Option D — AI + mandatory human reviewer

- Pros: highest assurance
- Cons: gates the loop on human availability; for a 7-day solo project, this is impractical

## Why we picked C

- Independent contexts make blind-spot catches measurable: when reviewer 2 flags something reviewer 1 missed, that's a real verification win.
- Cost is acceptable (sonnet for the second pass, not opus).
- The `RR-NNN` log creates a public artefact that a grading reviewer can read directly — auditable AI usage is the bonus criterion.
- Human approval is still required to merge (Hard Rule 7), so C + human ≈ option D without the latency.

## Consequences

- Positive: independent verification catches more bugs; auditable log differentiates the submission.
- Positive: cross-agent disagreements become learning artefacts (`docs/prompts/` can extract them).
- Negative: every PR now needs two AI passes (~2× review minutes on Anthropic API).
- Negative: `docs/REVIEWS.md` requires discipline to append correctly — automated via `review.yml`.
- Neutral: cap of 3 fix rounds is a design tradeoff. Lower = more human work; higher = more wasted AI cycles.

## Revisit when

- Codex CLI becomes integration-friendly with GitHub Actions; swap second reviewer to Codex for true cross-family review.
- A different AI model family (Gemini, GPT-5) ships a code-review action with parity to Claude's; consider rotating to reduce correlated blind spots.
- Review minutes become a cost concern (unlikely under interview scope).

## How we'll know if this was right

- Submission-day audit: ≥ 1 `RR-NNN` entry documents a disagreement where the second reviewer caught something the first missed.
- Zero PRs hit the 3-round cap without warranting it.
- Reviewer comments make it into the prompt log as a representative conversation.
