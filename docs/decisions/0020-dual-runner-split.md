# ADR-0020 — Split self-hosted runner: review vs fix lanes

- **Date**: 2026-05-24
- **Status**: Superseded by [ADR-0021](./0021-migrate-to-ubuntu-latest-runners.md) on 2026-05-24
- **Deciders**: project owner
- **Related**: ADR-0002 cross-agent review，`docs/HARNESS-PITFALLS.md` §C7

## Context

Phase 1 wave 1 fire 16 個 ai-implement issues 後，self-hosted runner queue 一度堆到 ~25 個 job（review × 多 + ai-fix × 多 + ai-implement × 多）。單顆 runner = serial FIFO → 一個 ai-fix round 排 1.5–2 hr 才會跑到，user feedback 等不及。

Runner CPU / RAM / OAuth token 都還算夠 — 瓶頸只是 worker 數量 = 1。

## Decision

把 self-hosted runner 拆成**兩條 lane**：

| Runner | Labels | 跑哪些 workflow |
|--------|--------|----------------|
| `allen-mac-yihengwu`（原） | `self-hosted, allen-mac, runner-review` | `review.yml` |
| `allen-mac-yihengwu-2`（新） | `self-hosted, runner-fix` | `ai-fix.yml`, `ai-implement.yml` |

Workflow `runs-on` 改成精準 label：
- `review.yml`: `[self-hosted, runner-review]`
- `ai-fix.yml`: `[self-hosted, runner-fix]`
- `ai-implement.yml`: `[self-hosted, runner-fix]`

兩顆 runner 在同台 mac 上跑（launchd service `actions.runner.YiHeng0221-yihengwu-jko-interview.allen-mac-yihengwu-2`）。

## 為何這樣分

1. **review** vs **fix/implement** 是不同職責：
   - review = 看 PR 留 inline comment，**唯讀**，不改 code，不 push
   - fix / implement = 真的改 code 並 push commit
2. **review 的需求量遠大於 fix**：每個 PR 都至少 review 一次（可能多次），fix 只有 🔴 finding 才觸發。實際 queue 統計也是 review 佔多數。
3. **lane 互不阻塞**：原本 ai-fix 排在 review 後面要等好幾小時。拆 lane 之後 ai-fix 不再被 review backlog block。

## Options considered

### Option A — 兩顆 runner，按職責 split（採用）

- Pros: 簡單、容易理解、不需要動 workflow 結構
- Cons: 兩顆 runner 都要維護 OAuth token / claude CLI 工具鏈

### Option B — 兩顆 runner，按 lane (FE / BE) split

- Pros: lane affinity 友善（FE PR 都在同顆 runner 跑）
- Cons: lane workload 不對稱（BE 數量遠大於 FE）— 容易某顆 runner 空閒

### Option C — review.yml 跑 ubuntu-latest（外包 GitHub-hosted）

- Pros: 完全不佔自家 runner
- Cons: review.yml 也要呼叫 claude CLI → 需要把 OAuth token 用 env var 注入 ubuntu，沒有 macOS keychain 約束（HARNESS-PITFALLS §D3）— 雖然可行但每次 cold-start clone full repo 比較慢

### Option D — 加 ubuntu-latest runner 多 1 顆

- 等同 C，extra deploy 麻煩。pass。

## Why we picked A

職責分離乾淨、實作成本低、queue throughput 立刻翻倍、不需要動 workflow 結構之外的東西。Future 若 lane 又塞滿，可以再 fork 出 runner-review-2 / runner-fix-2，水平擴。

## Consequences

- **Positive**: review queue 跟 fix queue 互不阻塞；fix round 等待時間從 1.5 hr 降到 ~跟自身 queue 長度成正比
- **Negative**: 兩顆 runner 都要保持 OAuth token + 工具鏈一致（升級 claude CLI 要做兩次）
- **Neutral**: ai-implement 跟 ai-fix 共享 runner-fix lane（同樣是「改 code」職責）

## Runner 設置紀錄

第二顆 runner 設置流程：

```bash
mkdir -p ~/actions-runner-yihengwu-2
cd ~/actions-runner-yihengwu-2
tar xzf ~/actions-runner/actions-runner-osx-arm64-2.334.0.tar.gz  # reuse package
./config.sh --url https://github.com/YiHeng0221/yihengwu-jko-interview \
  --token <REGISTRATION_TOKEN> --name allen-mac-yihengwu-2 \
  --labels runner-fix --work _work --unattended
./svc.sh install
./svc.sh start
```

第一顆 runner 補 `runner-review` label：

```bash
echo '{"labels":["runner-review"]}' | gh api -X POST \
  repos/YiHeng0221/yihengwu-jko-interview/actions/runners/2/labels --input -
```

## Status notes

- 2026-05-24 — Accepted；runner 2 上線 17:59；workflow 切換進 main 後立刻生效
- 2026-05-24 — **Superseded**：晚間發現公開 repo + GitHub Actions free minutes 足以 cover demo 期所有 review/fix/implement workload，雙 self-hosted runner 反而引入 OAuth token 雙份維護成本 + mac launchd 不穩風險。所有 workflow `runs-on` 改回 `ubuntu-latest`。見 [ADR-0021](./0021-migrate-to-ubuntu-latest-runners.md)。
