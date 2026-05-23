# Frontend Feature Spec

> **Per-project template**。每個專案在 Phase 0 / Phase 1 PM 階段填這份，記錄 FE 自身 stack + 結構 + 範圍。
> 每個欄位的選擇都應該對應一條 ADR（**沒 ADR 就不要寫死**）。
> Copy 到 `docs/specs/fe-feature-spec.md`，依專案填好。

---

## 1. Scope

本 FE 範圍：

- <一句話描述產品價值>
- <做什麼畫面 / 流程 / interaction>
- 明確 out of scope：<列出來避免歧義，例：登入、付款流程、admin route 等>

## 2. Stack 選擇（每項都應對應 ADR）

| Layer | 選擇 | 對應 ADR | Why |
|-------|------|---------|-----|
| **Framework** | <e.g. React / Vue / Svelte / SolidJS> | ADR-XXXX | <一句話> |
| **Build tool** | <e.g. Vite / Webpack / Turbopack / Rsbuild> | ADR-XXXX | <一句話> |
| **Routing** | <e.g. React Router v7 / TanStack Router / Next.js routing> | ADR-XXXX | <一句話> |
| **Styling** | <e.g. Tailwind v4 / vanilla-extract / CSS Modules / Linaria> | ADR-XXXX | <一句話> |
| **Data fetching** | <e.g. TanStack Query / SWR / RTK Query / native fetch + hook> | ADR-XXXX | <一句話> |
| **State management** | <e.g. context + hook / Zustand / Jotai / Redux> | ADR-XXXX | <一句話> |
| **Forms** | <e.g. react-hook-form / Formik / 自寫> | ADR-XXXX | <一句話> |
| **Schema / validation** | <e.g. Zod / Yup / Valibot> | ADR-XXXX | <一句話> |
| **UI primitives** | <自家設計系統 / Radix / MUI / Headless UI> | ADR-XXXX | <一句話> |
| **Storybook (if any)** | <e.g. Storybook 8 + Vite builder / Ladle> | ADR-XXXX | <一句話> |
| **Unit / component test** | <e.g. Vitest + RTL / Jest + RTL> | ADR-XXXX | <一句話> |
| **E2E test** | <e.g. Playwright / Cypress> | ADR-XXXX | <一句話> |
| **A11y scanner** | <e.g. axe-core inside e2e> | ADR-XXXX | <一句話> |
| **Lint / format** | <e.g. oxlint / ESLint flat config + Prettier / Biome> | ADR-XXXX | <一句話> |
| **Type generation** | <e.g. openapi-typescript / tRPC / 手寫 + drift CI> | ADR-XXXX | <一句話> |

## 3. 目錄結構

```
frontend/
├── src/
│   ├── lib/
│   │   ├── ui/              # 自家 primitives（Button / Input / Card / ...）
│   │   ├── layout/          # Page-level layout 元件
│   │   └── ...
│   ├── features/            # Feature-scoped 組合（一個 feature = 一個 folder）
│   │   └── <feature>/
│   │       ├── <Feature>.tsx
│   │       ├── use<Feature>.ts        # hooks
│   │       └── <apiName>DTO.ts        # boundary mapper (if applicable)
│   ├── routes.tsx
│   ├── main.tsx
│   └── ...
├── .storybook/              # (if applicable)
└── public/
```

## 4. Wire contract（FE/BE 邊界）

| 議題 | 決定 | 對應 ADR |
|------|------|---------|
| Wire format | <e.g. snake_case / camelCase> | ADR-XXXX |
| Mapper 位置 | <e.g. `<apiName>DTO.ts` per feature> | ADR-XXXX |
| Type generation | <e.g. openapi-typescript → `src/generated/`> | ADR-XXXX |
| Error envelope | <e.g. `{ error: 'code', issues: [] }`> | ADR-XXXX |

## 5. 規範性 conventions

- **元件命名**：PascalCase。
- **Hook 命名**：`use<Subject>`。
- **DTO 命名**：`<apiName>DTO.ts`（依 ADR）。
- **檔案組織**：features 內 colocated。一個 feature 從 page → hook → DTO → component 同 folder。
- **Hard Rule #16**：無 `as` / `any` / `unknown`（`catch (error)` 唯一例外）。
- **a11y**：每個 interactive element 有 `aria-label` 或 accessible name；focus ring 必須可見。

## 6. 衍生 ADR 清單

從本說明書產出的 ADR：

- [ ] ADR-XXXX <framework 選擇>
- [ ] ADR-XXXX <styling 選擇>
- [ ] ADR-XXXX <data fetching 選擇>
- [ ] ADR-XXXX <wire format & mapper 命名>
- [ ] ADR-XXXX <Storybook / 視覺 testing>
- [ ] ...

PM 階段把每個未寫的 ADR 開 issue（label `kind/chore` + `area/docs`），PR 進來時連結到本說明書。
