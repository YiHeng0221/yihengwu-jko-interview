# Risks Register

> Live, dated。更新 entry 不刪歷史（用 strikethrough + note 標 retired）。

## Format

每條 row：

- **ID** — `R-NNN` stable，永不複用
- **Status** — `realised` / `mitigated` / `accepted` / `monitoring` / `retired`
- **Owner** — 誰盯著
- **Mitigation** — 做了什麼或計畫做什麼

## Active risks

| ID | Risk | Status | Owner | Mitigation |
|----|------|--------|-------|------------|
| R-001 | <風險描述>| <status> | <owner> | <mitigation> |

<!-- 範例維度可考慮：
  - 資料層（schema 漂移 / migration drop index / collation 不符）
  - 安全（trust proxy / secret leak / rate-limit bypass）
  - Cold start / hibernation / 部署環境差異
  - AI agent 行為（fix loop oscillation / silent fallback）
  - 跨 agent 共識（reviewer disagree / RR escalation）
  - i18n / a11y regression
-->

## Retired risks

(把 status 改 retired 後保留在這個 section，方便回溯)
