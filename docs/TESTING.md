# Testing Strategy

> 不是 stub。本檔是 "done" 的一部分。每個專案依自家 stack 填具體工具。

## What we test, where

| Layer | Tool | Covers |
|-------|------|--------|
| Pure functions | <unit test tool>| <例：cursor encoding、debounce timing、formatter> |
| API handlers | <test tool + inject 方式>| Route validation、status codes、pagination 邊界、auth headers |
| FE components | <test tool + DOM testing lib>| Controlled inputs、cleanup、infinite-scroll trigger |
| E2E user flows | <e2e tool>| Happy path + edge states across FE+BE+DB |
| Accessibility | <a11y scanner inside e2e>| 每個 UI page 過 `wcag2a` + `wcag2aa` |

## Test-case prioritisation (A / B / C)

| Tier | Criterion | Coverage target |
|------|-----------|-----------------|
| **A — Critical** | Core happy path、auth、不可逆 action | 100% |
| **B — Important** | Empty/error state、pagination 邊界、filter interaction | ≥ 80% |
| **C — Edge** | 稀有 boundary（debounce + cancel race、network 504、malformed cursor） | Time permitting |

時間緊就跳 C，A + B 不能省。

## Manual acceptance script

部署上 staging 後人工跑一次：

### Flow A — <主流程描述>

```
1. <step 1>
2. <step 2>
3. <expected outcome>
```

### Flow B — <次要流程描述>

```
1. <step 1>
...
```

> Manual script 跑過再 release / 交件。
