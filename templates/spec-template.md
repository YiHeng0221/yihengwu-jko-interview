# Spec NNNN — <feature name>

- **Date**: YYYY-MM-DD
- **Status**: Draft | Approved | Shipped
- **Owner**: <person>
- **Brief reference**: <link or section of interview brief>
- **Figma**: <URL>
- **Related ADRs**: ADR-0NNN, ADR-0MMM

## 1. Background

Why does this feature exist? What problem does it solve for the user (not the team)? Quote the brief verbatim if helpful.

## 2. Goals

- Goal 1
- Goal 2

## 3. Non-goals

What we're explicitly **not** doing. Examples:
- Multi-language search (zh-TW only for v1)
- Mobile app (web only)

## 4. User stories

### US-1 — <story title>

**As** <persona>, **I want to** <action>, **so that** <outcome>.

**Acceptance criteria** (Given / When / Then):

- **Given** the list is loaded, **when** I scroll to the bottom, **then** the next 10 items load within 500 ms.
- **Given** the list is loading, **when** I scroll, **then** no duplicate or skipped items appear.
- **Given** the network fails mid-scroll, **when** the request returns 500, **then** I see a retry CTA.

### US-2 — <story title>

…

## 5. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| …    | high/med/low | high/med/low | … |

Cross-reference rows here with `docs/RISKS.md` entries as needed.

## 6. Dependencies

- <BE endpoint / service / library 依賴>
- <Schema / validator 依賴>
- <設計檔 component 依賴（如有）>

## 7. Out of scope

讀者可能誤以為在 scope 但實際不是的事。

## 8. Open questions

- Q1: <尚未拍板的細節 1>
- Q2: <尚未拍板的細節 2>

Approval 前要 resolve 完。Shipped spec 不可留 open Q。

## 9. AC traceability

開 issue 後，把 AC mirror 到 `docs/REQUIREMENTS.md`：

| AC | Issue | PR | E2E test | Status |
|----|-------|----|----|--------|
| US-1 AC-1 | #N | #M | `<spec>.spec.ts` | ⬜ |
