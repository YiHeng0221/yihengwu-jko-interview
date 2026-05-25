# ADR-0021 — Migrate review/fix/implement workflows from self-hosted runners to ubuntu-latest

- **Date**: 2026-05-24
- **Status**: Accepted
- **Deciders**: project owner
- **Related**: [ADR-0020](./0020-dual-runner-split.md)（superseded），`docs/HARNESS-PITFALLS.md` §C7、§D3

## Context

ADR-0020 拆雙 self-hosted runner 解 queue 後，幾小時內又發現新坑：

1. **OAuth token 維護雙份**：兩顆 runner 各跑 claude CLI，token 各自綁定一份；每次重啟、token 過期、CLI 升級都要兩份同步，運維成本 = 2×。
2. **mac launchd `svc.sh start` 不穩**：實際使用時 runner 2 偶發 EXC_BAD_ACCESS 死掉、Token rotation 後 svc 沒重 load 等問題。
3. **私有 repo Actions 額度限制 → 公開 repo 解禁**：repo 在 demo 前已轉為 public，GitHub Actions free tier 對 public repo 是 **unlimited minutes on ubuntu-latest**。原本選 self-hosted 是為了「不燒 API quota」+「不燒 GitHub minutes」，但兩個前提都鬆動：
   - claude CLI 在 ubuntu 跑也吃 OAuth token（一樣不燒 API），只是 token 注入方式改成 env var
   - public repo Actions minutes 不算 quota

## Decision

把 `review.yml` / `ai-fix.yml` / `ai-implement.yml` / `ci.yml` / `e2e.yml` 全部 `runs-on` 切回 **`ubuntu-latest`**，下線兩顆 self-hosted runner。

OAuth token 透過 `secrets.CLAUDE_CODE_OAUTH_TOKEN`（已存在 repo secrets）注入到 workflow env，每個 job 開頭 `npm install -g @anthropic-ai/claude-code` 後即可用。

## Options considered

### Option A — Keep ADR-0020 dual self-hosted runner

- Pros: 不依賴 GitHub Actions 計費；已運行驗證過
- Cons: 雙份 token 維護成本、launchd 死掉風險、demo 期間若 runner 掛掉很尷尬

### Option B — Migrate to ubuntu-latest（採用）

- Pros: 不維護 runner / token 一份就好 / public repo unlimited minutes / 死了 GitHub 會自動重啟新 VM
- Cons: 每次 cold-start clone repo + npm install claude CLI 大概 1-2 min overhead
- Reference: HARNESS-PITFALLS §D3 「OAuth token 可以塞 env var」

### Option C — 混搭：review 用 ubuntu、fix/implement 用 self-hosted

- Pros: review 量大（多用 cloud），fix 量小（用本機可承受）
- Cons: 等於 ADR-0020 + 一顆 ubuntu，3 條 lane 維護成本更高

## Why we picked B

1. **Demo deadline 在即，運維風險 > throughput**：runner 死掉的損失 > cold-start 1 min。
2. **Cold-start 對 review/fix latency 影響可忽略**：review run 本來就要幾分鐘，多 1-2 min 不影響 user wait。
3. **Token 一份就好**：未來 token 過期只要更新一個 GitHub secret，不用 ssh 進 mac。

## Consequences

- **Positive**: 不依賴 mac 開機；token 一份；可橫向擴展 (matrix / parallel jobs free)
- **Negative**: 每 job 多 1-2 min cold-start；token 寫進 GitHub secrets（vs macOS keychain）必須 trust GitHub secrets 加密
- **Neutral**: 自家 mac 多了一份「不用、但保留」的 self-hosted runner config，可隨時切回

## Revisit when

- repo 改回 private 且 Actions free minutes 燒光
- 多 job 同時跑造成 OAuth token rate-limit（claude CLI 對 token 有 concurrency 限制）
- review/fix 對 cold-start latency 敏感（例如需要 sub-30s 觸發）

## How we'll know if this was right

- demo 期間 0 次「runner offline / job stuck queued」事件
- AI workflow 平均 wall-time 沒比 self-hosted 時代多 > 3 min
- OAuth token 更新只需動 1 個地方（GitHub secret）
