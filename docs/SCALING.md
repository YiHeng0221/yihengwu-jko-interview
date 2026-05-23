# Scaling & Performance

> 紀錄專案做了什麼、deferred 什麼、deferred 的 trigger condition 是什麼。

## ✅ Implemented (day-one)

| Play | Why | Where |
|------|-----|-------|
| <例：cursor pagination> | <為什麼選這個 > | <檔案路徑> |

## 🟡 Deferred — with trigger conditions

| Play | Trigger | Notes |
|------|---------|-------|
| <例：distributed rate-limit> | <什麼條件觸發要做> | <實作 hint> |

## Anti-pattern register

紀錄專案中應避免的 anti-pattern：

- <例：別把 cache invalidation 寫進 deploy chain — 走 ops workflow>

## Notes

- 沒做的事要寫進 deferred，**不要靜默跳過**
- 真實做的東西要附 file path，方便 reviewer trace
- 不要編造 perf 數字；要不就量、不然就標 "estimate"
