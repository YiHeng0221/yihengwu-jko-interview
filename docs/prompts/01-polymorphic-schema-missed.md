# Prompt 01 — Polymorphic schema 漏網事件

- **Date**: 2026-05-25
- **Agent**: claude-opus-4-7
- **Context**: Phase 1 收尾時 user 截圖比對：CAMPAIGN / MERCHANDISE card 只有 title，其他欄位（orgName / tags / banner / price）全 null。要找出為什麼。
- **Outcome**: 一支 migration + Zod schema 補齊 polymorphic 欄位，蹲完整 BE/FE/DB/seed/test 對齊。後續多 category 也同 pattern 二次補完。

## Conversation summary

User 一句話「捐款專案、義賣商品這兩個都只有 title 跑出來」就把問題推到我這邊。我第一反應是檢查 BE wire schema：

```bash
grep -n "banner\|org_name\|tags" backend/src/lib/schemas.ts backend/src/lib/toWire.ts
# (no output)
```

**0 個 match**。意思是 BE schema、wire mapper、DB schema 都**沒有這些欄位**。但 FE Card 元件用了 `item.orgName` / `item.bannerImageUrl` — 不是 typecheck 過了嗎？

翻 FE DTO 才發現：之前的 issue #120 PM 寫了 polymorphic schema 提議（schema-first option A），但只開了 **FE-only PR #124**（Card 元件 + DTO mapper），對應的 **BE schema migration 從來沒 ship**。FE typecheck 過是因為 DTO mapper 把它們標 `.nullable().optional()` → 全部 fallback `null`。

AI（我）原本要直接動 BE，但 user 之前的 feedback 是「一張票一件事，schema 改要分支獨立」，所以拉了一條：

```
fix/polymorphic-fields-seed-picsum
├─ prisma schema 加 5 個 polymorphic 欄位（option A）
├─ migration 20260525071500_add_polymorphic_fields
├─ Zod CharityWireSchema 對應加
├─ charityToWire mapper 帶上
├─ seed-data.ts 重寫（順帶把 30 → 90 筆 / Lorem Picsum）
├─ 3 個既有 BE test fixture 補新欄位
└─ openapi.json regen
```

實際跑 migration + reseed 270 筆完，再打 production smoke test — 還是 500。因為 Railway BE 跑舊 code（compile 對舊 column）。要等 PR merge → redeploy 才會恢復。**這個時間差是預期的**，要在 PR body 寫清楚 deploy state，免得 user 看到 500 panic。

收尾發現 AI review 抓到 `frontend/src/features/search/dto/searchListDTO.ts` 是**第二個 DTO**（PR #105 開的搜尋專用 DTO）— 我這支 PR 對 `category_code` 改了 list DTO 但漏了 search DTO，造成 search 結果裡的 categoryCode 永遠靠 `.catch('CHILD_CARE')` fallback。AI review 一下就抓到，再補一個 commit。

## Lessons / takeaways

- ✅ **Schema-first 真的會擋住這種漏網**：FE typecheck 過不代表資料對；FE DTO 寬鬆的 `.nullable().optional()` 是設計 bug，掩蓋掉 BE 漏欄位。如果 FE DTO 用嚴格 schema（required → optional 必須 explicit），第一個渲染週期就會炸，不用 user 用肉眼比對截圖才發現。
- ❌ **PM 切票時應該把同 spec 的 BE migration 跟 FE 元件綁在同個 epic**：PR #124 只動 FE 不該允許 merge，PM 應該開 BE schema ticket + FE Card ticket 為兄弟 issue，互相 block。
- ✅ **AI cross-agent review 又一次救了 PR**：searchListDTO 第二份對齊靠人類肉眼一定看不到，cross-agent 不同 lens 才會抓。
- 🔁 **「一個資料模型多份 DTO」是異味**：應該未來 refactor 把 search 結果直接用 charitiesListDTO，DRY-out。已開 issue 但 deadline 來不及做。

## Artifacts

- Migration: `backend/prisma/migrations/20260525071500_add_polymorphic_fields/migration.sql`
- PR: [#138](https://github.com/YiHeng0221/yihengwu-jko-interview/pull/138)
- Follow-up（category_codes 多值）: [#148](https://github.com/YiHeng0221/yihengwu-jko-interview/pull/148)
- Spec: `docs/specs/be-feature-spec.md` §3.1（option A 決策說明）
