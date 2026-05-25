# Demo Walkthrough — 5 分鐘 demo

## URLs

| Surface | URL |
|---------|-----|
| Web | https://yihengwu-jko-interview-frontend.up.railway.app |
| API | https://yihengwu-jko-interview-backend.up.railway.app |
| Swagger UI | https://yihengwu-jko-interview-backend.up.railway.app/docs |
| OpenAPI JSON | https://yihengwu-jko-interview-backend.up.railway.app/openapi.json |
| Health | https://yihengwu-jko-interview-backend.up.railway.app/health |

> 第一次打開 web 大約 1-2 秒（Railway free tier cold-start）。

## 5-min flow

### 1. 列表開頁（~30s）

開 [web URL](https://yihengwu-jko-interview-frontend.up.railway.app)：

- TopBar 紅底 + 「所有捐款項目」標題置中
- Tabs：公益團體 / 捐款專案 / 義賣商品；active 為粗黑大字 + 紅 floating indicator（2px height，4px radius）
- SubRow：左「全部 ▾」灰底按鈕，右搜尋 icon
- 列表：~10 張 ORG card skeleton 載入，再 fade 成實 card（icon 圓角 4px + title + description）
- 滾到底 → 自動觸發下一頁（intersection observer）

### 2. Tab 切換（~30s）

點「捐款專案」：

- Tab indicator 平滑滑動到該位置
- 列表瞬間切到 CAMPAIGN layout（banner 16:9 + 紅色小字 orgName + 粗 title + 紅色 tag icon + 灰色 categories.join('・')）
- URL `?category=CAMPAIGN` 同步（refresh 後保留）

點「義賣商品」：

- 列表變 2-col grid layout（product image 4:3 + 商品名稱 + 灰字 orgName + 紅 bold `NTD 1,500`）

### 3. 搜尋（~60s）

點右上搜尋 🔍：

- SubRow 收起，**搜尋 bar 出現在 TopBar 與 Tabs 之間**（spec 對齊）
- 白底外框 + 灰色填色 input + 藍字「取消」按鈕（iOS 風格 `#007aff`）
- Input autofocus，placeholder「請輸入關鍵字」
- 打「愛」→ 300ms debounce → API fetch（前次 request abort）
- 顯示帶「愛」的 items；切 tab 同時過濾（只看當前 tab）
- 清空 input → 回到全列表
- 點「取消」或 Esc → 收起 search overlay，回原狀態

### 4. 類別 chip drawer（~60s）

點左下「全部 ▾」：

- Mobile（< 768px）：drawer 從底部 slide-up 250ms ease-out
- Desktop（≥ 768px）：置中 modal dialog
- 標題「選擇類別」置中、右上 X 關閉
- 16 個 chip（含「全部」）3-column grid，gap-3
- 點某 chip：
  - 不選紅字紅 border 白底（active），其餘灰底黑字
  - **立刻 API refetch**（`?category_code=ELDER_CARE`），列表變動
  - **drawer 不關**（spec：保持開讓 user 繼續切換）
- 列表只剩該 category 的 items

### 5. a11y + 鍵盤巡覽（~30s）

關 drawer，按 Tab：

- Focus 巡覽：TopBar 返回 → 三個 tab → 類別 button → 搜尋 button → 第一張 card
- 每個 interactive 都有 visible focus ring（紅色 ring + offset）
- 開 chrome devtools accessibility tab：所有 button 有 accessible name、aria-selected/aria-pressed 正確、role 標籤齊

### 6. API（~30s）

開 [Swagger UI](https://yihengwu-jko-interview-backend.up.railway.app/docs)：

- 看 `/charities` schema：tabs / category / category_code / q / cursor / limit
- 看 polymorphic CharityWire shape（banner_image_url / org_name / tags / product_image_url / price_ntd）
- 點 Try it out → `?q=愛 &category=ORG` → 看 response、`x-request-id` header

### 7. AI workflow（~60s，optional）

```bash
gh pr list --state merged --limit 10 --search "is:pr is:merged"
gh issue list --state closed --limit 20
gh label list | grep -E "kind/|status/|epic/"
```

帶 reviewer 看：

- ~30 個 closed issues + ~40 merged PRs（單張 PR 平均 ≤ 500 LoC）
- PR comment 內 AI review 的 🔴/🟡/🟣 inline findings
- ai-fix.yml round 1/2/3 commits
- `docs/REVIEWS.md` 內 RR-NNN 跨-agent review log
- 22 個 ADRs 收齊（含 superseded 標記）

## 後續觀察點

| 觀察 | 預期 |
|------|------|
| Cold start（FE / BE 都閒置 > 30 min） | 第一次 request ~1-2s，之後 < 200ms |
| 270 charities × 3 tabs × infinite scroll | 滾到底沒有重複、沒有漏 |
| pg_trgm GIN CJK search | 「愛」/「兒少」/「環境」都打中 |
| Lighthouse mobile | Performance ≥ 90、Accessibility = 100 estimate |

## Known caveats

- Railway free tier cold-start：閒置幾分鐘後第一次 request 可能 1-2 秒
- Lorem Picsum 圖偶爾 fastly CDN 慢，CSP 已放寬為 `https:` 容錯
- Detail page 故意未做（spec out-of-scope，contract 已留 `GET /charities/:id`）
- Donation flow 未做（spec out-of-scope）
