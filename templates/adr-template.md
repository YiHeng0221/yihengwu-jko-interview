# ADR-NNNN — <short title in imperative voice>

- **Date**: YYYY-MM-DD
- **Status**: Proposed | Accepted | Superseded by ADR-MMMM
- **Deciders**: <who chose>
- **Related**: Issue#NN, Spec docs/specs/0NNN-<slug>.md

## Context

What's the situation? Quote the constraint that forced this decision (interview brief, performance target, dependency).

## Decision

State the choice in one sentence.

## Options considered

### Option A — <name>
- Pros: …
- Cons: …
- Example/Reference: …

### Option B — <name>
- Pros: …
- Cons: …
- Example/Reference: …

### Option C — <name> (if applicable)
- Pros: …
- Cons: …

## Why we picked X

1–3 bullets covering the deciding factor.

## Consequences

- Positive: <e.g., "FE/BE types stay in sync via codegen">
- Negative: <e.g., "Adds a `make types` step to the dev loop">
- Neutral: <e.g., "Locks us into Zod; switching to io-ts later means rewriting schemas">

## Revisit when

A concrete trigger that would make us reopen this decision. Examples:
- "We add a second backend (Go), making schema-sharing harder"
- "Bundle size of generated types exceeds 50KB"
- "Codegen step adds > 5s to the dev loop"

## How we'll know if this was right

Measurable signal (avoid vague phrasings like "team likes it"):
- Type-mismatch bugs in PR review: target = 0 per week
- Codegen drift CI failures: target = 0 (or warn-only) after week 1
