# ADR-0011 — Storybook 8 with Vite builder for component development

- **Date**: 2026-05-24
- **Status**: Accepted
- **Deciders**: project owner
- **Related**: Issue#3, Spec `docs/specs/fe-feature-spec.md` §6, ADR-0010

## Context

ADR-0010 commits us to custom UI primitives. Without a component workbench, developing primitives in isolation is slow (requires wiring each into the full app). We need a tool for:
- Isolated component development (no server / no router dependency)
- Visual regression reference
- A11y addon to catch issues early
- Interactive prop controls for design review

Candidates are Storybook 8, Ladle, and Histoire.

## Decision

Adopt **Storybook 8** with the `@storybook/builder-vite` plugin. Stories co-located with components (`<Name>/<Name>.stories.tsx`).

## Options considered

### Option A — Storybook 8 + Vite builder

- Pros: industry standard; largest ecosystem of addons (a11y, interactions, viewport); Vite builder gives fast HMR comparable to the app itself; v8 drops the old Webpack builder by default; strong TypeScript CSF3 story format; play functions enable interaction tests runnable in CI
- Cons: heavier install than alternatives (~30 deps); `storybook` binary adds to dev startup time; occasional addon version conflicts during major upgrades
- Example/Reference: `@storybook/react-vite` + `@storybook/addon-a11y` + `@storybook/addon-interactions`

### Option B — Ladle

- Pros: extremely lightweight (~5 deps); Vite-native; fast startup
- Cons: no a11y addon; no interactions/play functions; very small community; missing features we'd need to recreate (viewport switching, docs pages); not well-suited for submission-day design review
- Example/Reference: `@ladle/react` with `*.stories.tsx`

### Option C — Histoire

- Pros: Vue-first but supports React; clean UI
- Cons: React support is secondary; smaller community than Storybook; addon ecosystem much thinner; a11y tooling not mature for React
- Example/Reference: `histoire` + `@histoire/plugin-react`

### Option D — No workbench (develop in-app)

- Pros: zero setup
- Cons: every component must be wired into the router/context to test visually; slow iteration; no design-review artefact; harder to catch a11y issues early

## Why we picked A

1. **A11y addon** (`@storybook/addon-a11y`) runs axe-core per story; catches focus-trap and `aria-*` issues before e2e.
2. **Play functions** let us write interaction tests (e.g., "open Dialog, press Esc, assert closed") that run in both Storybook and Vitest via `@storybook/test`.
3. **Submission artefact**: a running Storybook at a deploy URL is a concrete demo for the interviewer beyond the feature itself.

## Consequences

- Positive: isolated component development; a11y issues surfaced per-story before integration.
- Positive: Storybook stories double as visual documentation for the 13 custom primitives.
- Negative: adds `storybook dev` as a separate dev process; `pnpm storybook` must be documented in `Makefile`.
- Neutral: story format (CSF3) is stable but a Storybook v9 may introduce new story API; budget a migration if/when that lands.

## Revisit when

- Ladle ships a first-class a11y addon that matches `addon-a11y`.
- Storybook v9 makes breaking changes to CSF3; evaluate migration cost vs. staying on v8.
- Storybook startup time exceeds 30s on CI (then explore Turbopack builder).

## How we'll know if this was right

- Every custom primitive from ADR-0010 has at least one story.
- `storybook build` produces a static bundle deployable to a review URL.
- `@storybook/addon-a11y` reports 0 violations per story in Phase 1.
