# ADR-0012 — Dialog/Drawer responsive strategy via `useMediaQuery`

- **Date**: 2026-05-24
- **Status**: Accepted
- **Deciders**: project owner
- **Related**: Issue#3, Spec `docs/specs/fe-feature-spec.md` §2.4, §3.1

## Context

The category-selection UI must behave differently by viewport:
- **Mobile (< 768px)**: bottom-slide `Drawer`
- **Desktop (≥ 768px)**: centred modal `Dialog`

Both surfaces show the same chip-grid content. We need to decide how to architect this responsive split: a JS-driven `useMediaQuery` switch inside a single wrapper component, two completely independent components, or a purely CSS-based approach (single component, hidden/shown by media query).

## Decision

A single `CategoryDrawerDialog` wrapper component reads `useMediaQuery('(min-width: 768px)')` and renders either `<Dialog>` or `<Drawer>` based on the result. The chip-grid content is passed as `children` and shared between both.

## Options considered

### Option A — `useMediaQuery` switch (single wrapper)

- Pros: single source of truth for open/close state; content (`children`) written once; breakpoint logic co-located with the component; easy to test by mocking `useMediaQuery`; matches the pattern already described in the spec
- Cons: JS-driven means a brief flicker is theoretically possible on hydration (not an issue for a pure SPA); `useMediaQuery` must be written as a custom hook and tested
- Example/Reference: `const isDesktop = useMediaQuery('(min-width: 768px)'); return isDesktop ? <Dialog …> : <Drawer …>`

### Option B — Two independent components

- Pros: no conditional logic; each component is simpler
- Cons: state (`isOpen`) must be duplicated or lifted high; content duplicated or extracted to a third component; CSS hides one at a time anyway — same result as Option A but with more files; more test surface
- Example/Reference: `<CategoryDialog isOpen={open} …>` + `<CategoryDrawer isOpen={open} …>` + CSS `.md:hidden` / `.hidden.md:block`

### Option C — CSS-only (single component, show/hide via media query)

- Pros: no JS breakpoint check; no flicker
- Cons: **both Dialog and Drawer are rendered in the DOM simultaneously**; two focusable overlays = a11y disaster (screen readers see two modal regions); `aria-modal` + `inert` on the hidden one is fragile; animation differs between Dialog and Drawer requiring either duplicated keyframes or a complex single animation conditioned on screen width; not worth the complexity
- Example/Reference: `<div class="hidden md:block"><DialogImpl /></div><div class="md:hidden"><DrawerImpl /></div>`

## Why we picked A

1. **Single open/close state**: `CategoryDrawerDialog` is controlled by one `isOpen` prop; the parent (`SubRow`) doesn't need to know which variant is rendered.
2. **A11y correctness**: only one modal element is in the DOM at a time; no `inert` hacks needed.
3. **Children are written once**: the chip grid (`Chip × 17`) is passed as `children`, not duplicated. When content changes, one edit propagates to both breakpoints.

## Consequences

- Positive: clean API — `<CategoryDrawerDialog isOpen={open} onClose={…}>{chips}</CategoryDrawerDialog>`.
- Positive: `useMediaQuery` is a general-purpose hook reusable by future responsive features.
- Negative: JS breakpoint check means the initial render always picks one branch; if the SPA ever moves to SSR, `useMediaQuery` requires a server-safe default.
- Neutral: `useMediaQuery` must match the Tailwind `md:` breakpoint (`768px`); if the breakpoint token changes in ADR-0008, this hook's string must be updated in sync.

## Revisit when

- The app adds SSR (Next.js migration); then replace `useMediaQuery` with `use` + CSS containment to avoid hydration mismatch.
- A third overlay variant is needed (e.g., a side-sheet for tablet); at that point evaluate a ternary-based dispatch table instead of a boolean.

## How we'll know if this was right

- e2e suite: `CategoryDrawerDialog` renders `<Drawer>` at 375px viewport and `<Dialog>` at 1280px viewport.
- axe-core scan: zero "multiple modal regions" violations at both viewports.
- Zero "which component do I edit for the chip grid" questions in PR review comments.
