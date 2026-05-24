# ADR-0010 — Custom UI primitives over MUI or Headless-UI

- **Date**: 2026-05-24
- **Status**: Accepted
- **Deciders**: project owner
- **Related**: Issue#3, Spec `docs/specs/fe-feature-spec.md` §3.1

## Context

The 街口公益 UI is pixel-specific: 44px sticky header in brand red, tab bar with a red underline, bottom-slide Drawer, and a centered Dialog. The component spec (`fe-feature-spec.md` §3.1) lists 13 primitives. We need to decide whether to build them from scratch, adopt a full component library like MUI, or use behaviour-only primitives (Headless UI / Radix).

## Decision

Build and own all UI primitives in `frontend/src/ui/*/`. No MUI, no Radix, no shadcn; Tailwind utility classes only.

## Options considered

### Option A — Custom primitives (Tailwind-only)

- Pros: exact pixel control over every token; no third-party style overrides to fight; smaller bundle (only the components we actually use); Storybook stories document our own API surface; accessibility handled explicitly per component
- Cons: more upfront authoring work (~13 components); no pre-built a11y wiring (must write `aria-*`, `role`, focus trap by hand)
- Example/Reference: `src/ui/Button/Button.tsx` with `variant` prop + Tailwind classes from ADR-0008 tokens

### Option B — Material UI (MUI v6)

- Pros: battle-tested a11y; rich component set; great TypeScript support
- Cons: ~80KB gzip baseline; opinionated `sx` prop / emotion CSS-in-JS conflicts with Tailwind v4; customising to match 街口 brand requires deep theme overrides; bundle includes components we won't use; design tokens live in MUI theme, not our Tailwind `@theme`
- Example/Reference: `<Button variant="contained" sx={{ bgcolor: 'brand.main' }}>…</Button>`

### Option C — Headless UI / Radix UI (behaviour-only)

- Pros: a11y + keyboard nav provided free; composable; no style opinions
- Cons: still a dependency (~20KB for Radix Dialog alone); Radix's prop model sometimes conflicts with custom animation needs (e.g., Drawer slide-up timing); adds an extra abstraction layer between our component and the DOM; for a 13-component set, the overhead per component roughly equals writing it from scratch anyway
- Example/Reference: `<Dialog.Root>` + `<Dialog.Content>` + custom styling

## Why we picked A

1. **Design pixel-perfect control**: the spec calls for exact `44px` heights, brand-red `#e01e3c`, and a custom bottom-slide Drawer animation that Headless UI doesn't provide out of the box.
2. **Token alignment**: ADR-0008 puts tokens in a CSS `@theme` block; custom components consume those tokens directly via Tailwind utilities without any extra theme-bridge layer.
3. **Bundle efficiency**: a set of 13 focused components will be ~5–10KB gzip total, versus a full library at 80KB+ baseline.

## Consequences

- Positive: complete design and a11y control; Storybook stories document the exact component API we own.
- Negative: we must implement focus-trap for Dialog/Drawer ourselves; keyboard nav for `TabBar` requires explicit `role="tablist"` + `aria-selected` wiring.
- Neutral: any future developer must read our Storybook rather than the MUI docs.

## Revisit when

- The component count exceeds 30 and maintenance cost exceeds the bundle/customisation savings of a library.
- A11y audit finds > 2 focus-management bugs that a headless library would have prevented.

## How we'll know if this was right

- axe-core scan in Phase 1 e2e: zero a11y violations on `Button`, `Dialog`, `Drawer`, `TabBar`.
- Bundle size `frontend/dist/`: total JS ≤ 200KB gzip.
- Zero "can't override MUI style" comments in PR reviews.
