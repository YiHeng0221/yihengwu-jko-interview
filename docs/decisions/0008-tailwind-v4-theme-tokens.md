# ADR-0008 — Tailwind v4 `@theme` tokens over PostCSS pipeline

- **Date**: 2026-05-24
- **Status**: Accepted
- **Deciders**: project owner
- **Related**: Issue#3, Spec `docs/specs/fe-feature-spec.md` §6

## Context

We need a design-token system for the 街口公益 FE. Tailwind v4 ships a CSS-first `@theme` block that replaces the `tailwind.config.js` + PostCSS approach of v3. The question is whether to use the new v4 mechanism, stay on v3's pipeline, or manage tokens as raw CSS custom properties.

## Decision

Use Tailwind v4 with its native `@theme { … }` block as the single source of design tokens; no PostCSS config file, no `tailwind.config.js`.

## Options considered

### Option A — Tailwind v4 `@theme` (CSS-first)

- Pros: zero PostCSS config; tokens are plain CSS variables readable by any tooling; first-class Vite integration via `@tailwindcss/vite` plugin; co-located with the stylesheet, not split across a JS config
- Cons: v4 is newer; fewer community examples exist yet; breaking changes from v3 migration if we ever backport
- Example/Reference: `@theme { --color-brand: #e01e3c; }` in `src/styles/globals.css`

### Option B — Tailwind v3 + `tailwind.config.js` + PostCSS

- Pros: mature, vast ecosystem, every StackOverflow answer uses v3
- Cons: extra build step (PostCSS loader); config scattered between `tailwind.config.js` and CSS; Tailwind maintainers will EOL v3 once v4 stabilises
- Example/Reference: standard `tailwind.config.js` `theme.extend.colors` block

### Option C — Raw CSS custom properties (no Tailwind utility classes)

- Pros: framework-agnostic; zero dependency on Tailwind
- Cons: lose utility-class DX; lose responsive/state modifiers; far more handwritten CSS; doesn't fit the team's velocity target for a 7-day project

## Why we picked A

1. **No extra build step**: the Vite plugin handles everything; no `postcss.config.js` needed.
2. **Tokens are CSS variables**: `--color-brand` is consumable by both Tailwind utilities and inline `style` props without any transformation.
3. **Future-aligned**: Tailwind v4 is the strategic direction from the maintainers; building on v3 now means a migration mid-project later.

## Consequences

- Positive: simpler `frontend/` setup; one fewer config file.
- Positive: design-token values are visible directly in DevTools without a separate Storybook addon.
- Negative: v4 docs are still maturing; non-obvious edge cases (e.g., dark-mode `@variant`) require reading the v4 changelog.
- Neutral: locks `tailwindcss` at `^4.x`; downgrading to v3 would require a config rewrite.

## Revisit when

- Tailwind v4 is superseded by a v5 with another config-format change.
- A third-party UI library (e.g., shadcn v2) requires a `tailwind.config.js` that conflicts with the CSS-first approach.

## How we'll know if this was right

- Zero PostCSS-related CI failures by end of Phase 0.
- Design-token count in `globals.css` stays ≤ 30 variables; no ad-hoc hardcoded hex values in component files.
