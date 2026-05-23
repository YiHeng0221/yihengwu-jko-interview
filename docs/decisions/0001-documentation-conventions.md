# ADR-0001 — Documentation conventions

- **Date**: 2026-05-20
- **Status**: Accepted
- **Deciders**: project owner
- **Related**: README, AGENTS.md

## Context

A 7-day take-home interview that scores AI usage transparency. We want a docs/ tree that fills naturally as the project progresses, rather than being retrofitted on submission day.

## Decision

Documentation lives in `docs/`, with these specific homes:

- `docs/specs/0NNN-<slug>.md` — feature specs (4-digit, 3-digit also acceptable for ≤ 999)
- `docs/decisions/0NNN-<slug>.md` — ADRs (3-digit)
- `docs/prompts/0N-<topic>.md` — representative AI conversations (2-digit, target 2–5)
- `docs/REQUIREMENTS.md` — running AC tracker
- `docs/TESTING.md` — testing strategy + manual acceptance script
- `docs/SCALING.md` — implemented + deferred performance plays
- `docs/RISKS.md` — risk register
- `docs/DEPLOY.md` — runbook
- `docs/REVIEWS.md` — cross-agent review log
- `docs/TECH-CHOICES.md` — selected stack + rationale

## Options considered

### Option A — Free-form docs

- Pros: lowest friction
- Cons: reviewers can't find what they need; impossible to grade depth at submission time

### Option B — Conventions above

- Pros: predictable shape; reviewers find what they need by path alone
- Cons: scaffolding overhead day 1

### Option C — Notion/Linear external

- Pros: rich formatting
- Cons: not auditable from the repo; interviewer would have to switch tools

## Why we picked B

The grading rubric explicitly rewards visible decision-making (ADRs + prompts). Co-locating with code means every PR can reference docs by path, every reviewer can cite docs in inline comments, and the submission is self-contained.

## Consequences

- Positive: any future maintainer (or interviewer) can navigate without a guide.
- Negative: a small bookkeeping tax (ADR per non-obvious choice, RR entry per substantive PR).
- Neutral: locks file naming conventions; renames require updating cross-references.

## Revisit when

- The project outgrows a single repo (then specs/decisions move with the service that owns them).
- ADR count exceeds ~30 (then introduce indexing in `decisions/README.md`).

## How we'll know if this was right

- Submission-day audit: every AC traces from `REQUIREMENTS.md` → spec → issue → PR → e2e test.
- Reviewer (human + AI) friction: zero "where do I find X" comments after day 2.
