# Frontend Feature Spec — 街口公益捐款列表

> 從 `allen-harness-test` 實際開發內容抽出的 FE 介面 + component 清單。下一輪正式 repo 拿這份為基礎、產對應 ADR + 開 issue。

---

## 1. Scope / 範圍

復刻街口 App「所有捐款項目」列表頁。Pure SPA、無 SSR、無金流。

覆蓋 4 個畫面 + 類別 Drawer/Dialog 切換：

1. 列表（公益團體 / 捐款專案 / 義賣商品 三 tab）
2. Tab 切換（含 URL `?category=` 同步、refresh 保持）
3. 搜尋 overlay（白底 search bar 介於 header 下、tabs 上）
4. 搜尋無結果 empty state
5. 類別選單 — Mobile drawer / Desktop centered dialog

**Out of scope**：真實金流、登入、Detail page 導頁、Filter chip 真實 filter 邏輯、SSR、i18n（除 zh-TW）

---

## 2. 介面 Layout

### 2.1 整體結構

```
┌────────────────────────────────────────────┐
│ Header (44px, 紅底, sticky)                  │  ← TopBar
│   ← icon · 標題置中「所有捐款項目」              │
├────────────────────────────────────────────┤
│ Tabs (sticky)                                │  ← TabBar
│   公益團體 │ 捐款專案 │ 義賣商品                  │
│   active 紅字 + 紅底線                          │
├────────────────────────────────────────────┤
│ 子列 (sticky, justify-between)                │  ← SubRow
│   [全部 ▾]                              [🔍]   │
├────────────────────────────────────────────┤
│ ▼ 列表內容（捲動區）                            │
│ ┌─────────────────────────────────────────┐ │
│ │ [icon]  Title                              │ │  ← CharityCard
│ │         Description (truncate)             │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ [icon]  Title                              │ │  × 10 個 default
│ │         Description                        │ │
│ └─────────────────────────────────────────┘ │
│ ...                                          │
│         ❤️ 愛心沒有底線                          │  ← EndMarker (load 完所有)
└────────────────────────────────────────────┘
```

### 2.2 Sticky 行為

**上方三層 (44 + 48 + 48 = 140px)** 全部 `position: sticky; top: 0`，由 `StickyHeaderStack` wrapper 內部依序疊。捲動時整塊黏住、僅列表內容滾動。

### 2.3 搜尋 overlay 模式（取代子列）

點 🔍 → search 模式啟動：

```
┌────────────────────────────────────────────┐
│ Header (44px, sticky)                        │  ← 保留
├────────────────────────────────────────────┤
│ 白底 search bar (sticky)                      │  ← 介於 header 下、tabs 上
│   [🔍 autofocus input] [✕]    [取消]           │
├────────────────────────────────────────────┤
│ Tabs (sticky)                                │  ← 保留
├────────────────────────────────────────────┤
│ ▼ 搜尋結果 / Empty state                       │
└────────────────────────────────────────────┘
```

關閉時：search bar 收起、子列回原位、list state 保留。

### 2.4 類別選單

點子列「全部 ▾」按鈕 →

- **Mobile (`< 768px`)**：drawer 從底部 slide-up，3-column chip grid（17 個 chip）
- **Desktop (`≥ 768px`)**：置中 modal dialog，相同內容

兩者共用 `<Dialog>` / `<Drawer>` 通用 component，內容（chip grid）以 children 傳入。

---

## 3. Component 清單

### 3.1 UI primitives（`src/ui/*/`）

| Component | 職責 | 用在 |
|-----------|------|------|
| `Button` | 通用按鈕（primary / secondary / ghost variants）| 各處 |
| `IconButton` | 純 icon 按鈕含 `aria-label` | Header 返回、子列搜尋 icon、Drawer/Dialog 關閉 |
| `Spinner` | Loading 動畫 | 搜尋過程、cold start |
| `Card` | 列表卡片（icon + title + description）| Charity 列表 |
| `Skeleton` | 卡片形 shimmer 動畫 | 載入中 × 10 |
| `TabBar` | 多 tab 切換器（紅底線 active）| 上方 tabs |
| `SearchInput` | 含 🔍 icon + 清除 ✕ 的 pill 輸入框 | 搜尋 overlay |
| `EmptyState` | 圖示 + 主標 + 副標 + optional action | 搜尋無結果 |
| `ErrorState` | 整頁錯誤 UI + retry button | 5xx / 4xx-non-401 |
| `EndMarker` | 「愛心沒有底線」分隔線 | 列表結尾 |
| `Chip` 🆕 | label / active / onClick | 類別選單內 |
| `Dialog` 🆕 | 通用 modal（overlay + close + Esc + children）| 桌機類別選單 |
| `Drawer` 🆕 | 從底部 slide-up（同 Dialog 介面）| 手機類別選單 |

> 🆕 = 下一輪正式 repo 才新增（`allen-harness-test` 實驗 repo 還沒做的）

### 3.2 Layout（`src/components/layout/`）

| Component | 職責 |
|-----------|------|
| `TopBar` | 44px 紅底 header（left icon + 置中標題） |
| `StickyHeaderStack` 🆕 | 包子層、垂直疊、全部 sticky top:0 |
| `SubRow` 🆕 | 子列 flex justify-between（左：類別 button + caret / 右：搜尋 icon） |

### 3.3 Hooks（`src/hooks/`）

| Hook | 職責 |
|------|------|
| `useDebounce` | 300ms search debounce |
| `useIntersection` | 列表底部偵測 → 觸發下一頁 |
| `useOnline` | `navigator.onLine` + `visibilitychange` → offline banner |

### 3.4 Features（`src/features/charities/`）

| File | 職責 |
|------|------|
| `CharityListPage.tsx` | 主頁面組合（TopBar + StickyHeaderStack[TabBar + SubRow] + List） |
| `useCharityList.ts` | TanStack Query `useInfiniteQuery`；吃 `tab` + `q` 參數；負責 cursor pagination |
| `dto/charitiesListDTO.ts` | snake_case API response → camelCase TS object（依 `<apiName>DTO.ts` 命名）|
| `dto/charityDetailDTO.ts` | 同上 for detail（雖無 detail page，型別仍要為 contract 留位）|

### 3.5 Search feature（下一輪新增）

| File | 職責 |
|------|------|
| `features/search/SearchOverlay.tsx` 🆕 | 搜尋 overlay 容器（白底 search bar + result list） |
| `features/search/useSearch.ts` 🆕 | useDebounce + AbortController 競態處理 + 觸發 search API |

### 3.6 Category feature（下一輪新增）

| File | 職責 |
|------|------|
| `features/category/CategoryDrawerDialog.tsx` 🆕 | `useMediaQuery` 切 Dialog/Drawer，內容傳 `<Chip>` × N grid |
| `features/category/useCategories.ts` 🆕 | TanStack Query `useQuery` wrap `/categories`，staleTime 無限長 |
| `features/category/dto/categoriesDTO.ts` 🆕 | snake_case → camelCase mapper |

### 3.7 Error / a11y / online

| File | 職責 |
|------|------|
| `components/ErrorBoundary.tsx` | 接 5xx / 4xx-non-401 → 顯示 `ErrorState` |
| `components/OfflineBanner.tsx` | `useOnline` 偵測；offline 顯示頂部橫條 |

### 3.8 Lib helpers（`src/lib/`）

| File | 職責 |
|------|------|
| `api-client.ts` | fetch wrapper + AbortSignal 串接 + error envelope parse |
| `env.ts` | `import.meta.env` Zod parse + 裸 hostname `.transform()` 補 `https://` |
| `case.ts` | snake_case ↔ camelCase 通用 helper |
| `cn.ts` | className 組合（clsx-lite）|
| `a11y.ts` | 鍵盤 focus helper |

---

## 4. Interaction 細節

| 場景 | 行為 |
|------|------|
| 列表打開 | 2 秒內前 10 張卡片可見（已 render，非 skeleton） |
| 列表載入中 | 顯示 10 個 card-shape skeleton |
| 滾到底 | `useIntersection` 觸發 → 下一頁 10 張 append（不閃、不重、不漏） |
| 抵達結尾 | API 回 `next_cursor: null` → 顯示 `EndMarker` |
| Tab 點擊 | 立刻重載該類別、URL `?category=ORG\|CAMPAIGN\|MERCHANDISE` 同步 |
| Tab refresh | 從 URL 讀回對應 tab |
| 點搜尋 🔍 | 搜尋 overlay 開、Input autofocus |
| 輸入文字 | 300ms debounce → 觸發 search API（前次 request abort） |
| 搜尋有結果 | 結果替換列表 |
| 搜尋無結果 | 顯示 `EmptyState` |
| 清空搜尋框 | 回到分類列表狀態 |
| 點「取消」 / Esc | 收起 overlay、子列回位、list 保留 |
| 點「全部 ▾」 | mobile drawer / desktop dialog 開啟 |
| 點 chip | 子列按鈕文字改為該類別、Drawer/Dialog 關（MVP 不實作真實 filter）|
| Drawer/Dialog 關閉 | overlay click / close icon / Esc 三路 |
| 5xx / 4xx-non-401 | 整頁顯示 ErrorState + retry |
| offline | 頂部 banner「目前離線」、保留 cached list |

---

## 5. 規範性 conventions

- **元件命名**：PascalCase；一個 component = 一個 folder（`<Name>/<Name>.tsx` + `<Name>.test.tsx` + `index.ts`）
- **Hook 命名**：`use<Subject>`，獨立檔案
- **DTO 命名**：`<apiName>DTO.ts`（依 ADR-0007）
- **檔案組織**：features 內 colocated；page → hook → DTO → component 同 folder
- **Hard Rule #16**：無 `as` / `any` / `unknown`（`catch (error)` 唯一例外）
- **a11y**：每個 interactive element 有 `aria-label` / accessible name；focus ring 必須可見；Tab 巡覽順序 = top-bar → tab×3 → 子列 → card×N

---

## 6. Stack 摘要（詳細請看 §7 ADR 清單）

- React 19 + Vite 6 + TS 5.7
- React Router v7（data router）
- Tailwind v4（`@theme` CSS-first tokens）
- TanStack Query v5（infinite + cache + retry + abort）
- Zod 3.24（boundary parse）
- 自家 UI primitives（MUI-like）
- Storybook 8 + Vite builder 🆕
- Vitest 3 + React Testing Library
- Playwright + axe-core
- oxlint 1.x

---

## 7. 衍生 ADR 清單（必寫）

| ADR | 主題 | 狀態 |
|-----|------|------|
| ADR-0003 | React + Vite over Next.js | ✅ 已有，可 cherry-pick |
| ADR-0004 | Zod single source of truth | ✅ 已有，可 cherry-pick |
| ADR-0005 | Cursor-based pagination | ✅ 已有，可 cherry-pick |
| ADR-0006 | oxlint over ESLint | ✅ 已有，可 cherry-pick |
| ADR-0007 | snake_case wire + `<apiName>DTO.ts` mapper | ✅ 已有，可 cherry-pick |
| ADR-0008 | Tailwind v4 `@theme` tokens（不走 PostCSS pipeline）| 🆕 需新寫 |
| ADR-0009 | TanStack Query 為唯一 data layer（不引入 Redux/SWR/Zustand）| 🆕 需新寫 |
| ADR-0010 | 自家 UI primitives over MUI/Headless | 🆕 需新寫 |
| ADR-0011 | Storybook 8 + Vite builder | 🆕 需新寫 |
| ADR-0012 | Dialog/Drawer responsive 策略（`useMediaQuery` 切換）| 🆕 需新寫 |

> ✅ = `allen-harness-test/docs/decisions/` 內有現成檔案、內容幾乎不用改可直接搬
> 🆕 = 沒有現成 ADR、下一輪 PM 要新開 issue 寫
