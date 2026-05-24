# ADR-0006 — oxlint over ESLint

- **Date**: 2026-05-24
- **Status**: Accepted
- **Deciders**: project owner
- **Related**: Issue#2, docs/specs/fe-feature-spec.md, docs/specs/be-feature-spec.md

## Context

The monorepo has FE (React + Vite) and BE (Fastify) TypeScript workspaces. Linting runs on every CI push and on every developer's save. ESLint 9 with the flat config system still has slow cold-start and plugin compatibility issues across the ecosystem. We need a linter that is fast enough to run on every file-save in the dev loop without introducing latency.

## Decision

Use oxlint 1.x as the primary linter for both FE and BE workspaces. A single `.oxlintrc.json` at the root configures all rules.

## Options considered

### Option A — ESLint 9 (flat config)

- Pros: massive rule ecosystem; community standard; TypeScript support via `typescript-eslint`; plugin for React hooks, accessibility, import order
- Cons: 10–30× slower than oxlint on cold start; flat config migration broke many plugins in 2024–2025; `typescript-eslint` type-aware rules require a full `tsc` pass, adding further latency; requires per-workspace config duplication
- Example/Reference: ESLint 9 + `@typescript-eslint/eslint-plugin`

### Option B — oxlint (chosen)

- Pros: written in Rust; < 1s lint on the entire monorepo; covers the rules we use most (no-unused-vars, no-any, react-hooks, import/no-cycle); zero config needed for basic correctness rules; single `.oxlintrc.json` at root works across workspaces; integrates with CI in one command (`pnpm -r oxlint`)
- Cons: smaller rule set than ESLint — some specialized plugins (e.g., `eslint-plugin-jsx-a11y`) have no oxlint equivalent yet; rules that depend on full type information are limited
- Example/Reference: oxc-project/oxlint

### Option C — Biome

- Pros: also Rust-based; includes formatter (replaces Prettier too); growing ecosystem
- Cons: formatter opinions conflict with team Prettier usage; fewer linting rules than oxlint at this time; less mature TS-specific rules

## Why we picked B

1. Speed matters in a demo/interview context: instant lint feedback on save keeps the dev loop tight; ESLint's cold start on a monorepo often exceeds 10s.
2. The rules we need (no-unused-vars, no-any, react-hooks rules, no-console) are all present in oxlint's stable rule set.
3. Single `.oxlintrc.json` at root eliminates per-workspace config drift.

## Consequences

- Positive: Lint step in CI completes in < 2s; no developer waits on lint before getting feedback.
- Negative: Some ESLint plugins (jsx-a11y, import/order advanced) have no oxlint equivalent — a11y checks are delegated to Playwright + axe-core in e2e tests instead.
- Neutral: If a specialized ESLint rule is needed later, we can layer ESLint on top of oxlint as a secondary pass for that specific rule only.

## Revisit when

- oxlint adds first-class `jsx-a11y` rule support (then we can consolidate a11y checks).
- The project needs type-aware ESLint rules (e.g., `@typescript-eslint/no-floating-promises`) that oxlint cannot replicate.
- oxlint 2.x introduces breaking changes to `.oxlintrc.json`.

## How we'll know if this was right

- CI lint step completes in < 2s (measured in GitHub Actions timing).
- Zero lint-suppression comments (`// eslint-disable`) appear in new code.
- Developer feedback: no complaints about "waiting on lint" in PR review comments.
