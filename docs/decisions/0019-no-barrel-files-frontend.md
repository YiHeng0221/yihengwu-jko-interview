# ADR-0019 — No barrel files (`index.ts` / `index.tsx`) in frontend

- **Date**: 2026-05-24
- **Status**: Accepted
- **Deciders**: project owner
- **Related**: Spec `docs/specs/fe-feature-spec.md` §6, ADR-0010 (custom UI primitives), ADR-0011 (Storybook 8)

## Context

Frontend codebase（`frontend/src/`）會大量出現「同名資料夾 + 內含實作」的結構，例如：

```
frontend/src/lib/ui/Button/
  Button.tsx
  Button.stories.tsx
  Button.test.tsx
```

業界常見做法是再加一個 `index.tsx`（barrel file）re-export `Button`，讓 consumer 寫 `import { Button } from '@/lib/ui/Button'` 而不是 `from '@/lib/ui/Button/Button'`。但這層 indirection 對中型 React + Vite 專案的開發體驗實際是負分。

## Decision

**禁止寫 `index.ts` / `index.tsx` barrel re-export 檔**。所有 component / hook / lib import 都**直接指向具體檔案**：

```ts
// ✅ Correct
import { Button } from '@/lib/ui/Button/Button'
import { useCharityList } from '@/lib/hooks/useCharityList/useCharityList'

// ❌ Forbidden
import { Button } from '@/lib/ui/Button'
import { useCharityList } from '@/lib/hooks/useCharityList'
```

例外：第三方 npm package 自己附 `index` 不在此 ADR 約束範圍內。

## Rationale

### 1. 避免循環依賴

多個模組透過 barrel 互相引用時，容易產生隱藏的循環依賴。Barrel 把整個資料夾打包成單一入口 → A 引 `barrel`、B 也在 barrel 裡 → 就算 A 只需要 C，依賴 graph 也會把整包牽連進來。直接指向具體檔讓依賴關係明確、可追蹤。

### 2. 改善 tree-shaking 與打包體積

Barrel 把整個資料夾的 export 集中。即使只 import 一個函式，打包工具（特別是設定不完善時）可能無法精準 tree-shake 未使用 code → bundle 變大。直接 import 具體檔讓打包工具能準確判斷實際使用範圍。

### 3. 加快 build + dev server 啟動

大型專案特別明顯。Import barrel 時，Vite / Webpack / TypeScript 編譯器往往需要解析整個 barrel 涉及的所有 module，即使只用到一小部分 → 拖慢冷啟動 / HMR / 型別檢查。Vite 官方文件也曾標註 barrel file 是 perf anti-pattern。

### 4. IDE 跳轉更精準

「Go to Definition」直接跳到實作檔，不需先跳 barrel 再轉一手。Auto-import 建議也更直接（IDE 顯示 `from './Button/Button'` 而非曖昧的 `from './Button'`）。

## Implications

- **目錄結構**：`frontend/src/lib/ui/<Name>/` 內含 `<Name>.tsx` + `<Name>.test.tsx` + `<Name>.stories.tsx`，**無 `index.tsx`**
- **Import 路徑**：稍長一點點（`Button/Button` 比 `Button` 多 7 char）— 換來上面四項好處，值得
- **Review 規範**：reviewer 看到 `frontend/**/index.ts(x)` 視為違反 ADR，要求改寫
- **Lint**：可考慮後續加 oxlint rule 阻擋（如果 oxlint 有相關 rule；沒有就靠 review）
- **遷移路徑**：本 ADR 開立時 codebase 還沒寫 component，零遷移成本

## Status notes

- 2026-05-24 — Accepted（FE-01 PR #79 開立後拍板，之後 FE-02..FE-13 primitives + pages 皆遵循）
