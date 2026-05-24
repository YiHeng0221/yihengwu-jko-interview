# Phase 0 Retrospective

> 記錄 Phase 0（DevOps + Workspace Bootstrap）的 pipeline 煙霧測試結果與回顧。
> 對應 Epic #1 / Issue #16（P0-15 Smoke）。

---

## Smoke 測試概要

**測試 PR**：Issue #16 本身（feature/epic-1-infra-issue-16）— README typo fix（5→6 agent count）

| 步驟 | 狀態 | 備註 |
|------|------|------|
| ci.yml 跑 | ✅ | stub smoke check（no package.json → no-op + success） |
| review.yml chained via workflow_run | ✅ | 7 個 Phase 0 PR 均自動 chain |
| review comment 出現 | ✅ | inline comments 寫入每個 PR；RR-001~007 backfilled to REVIEWS.md |
| human merge | ✅ | 7 個 PR 全 merged to main（#17~#23） |
| deploy 自動觸發 | ⏳ | deploy.yml 尚未 merge（PR #30 open）；待 Phase 0 完全收尾後驗 |
| demo URL `/health` 200 | ⏳ | 依賴 deploy chain + BE workspace（PR #24）merge 後才能驗 |

**已驗的 7 個 Phase 0 PRs**：

| PR | 標題 | 最終 verdict | 備註 |
|----|------|-------------|------|
| #17 | ADR-0016 Railway | pass | 修 RAILWAY_STATIC_URL → RAILWAY_PUBLIC_DOMAIN 後 merge |
| #18 | ADRs 0003-0007 | pass | 首次無 🔴 |
| #19 | FE ADRs 0008-0012 | pass | 首次無 🔴 |
| #20 | BE ADRs 0013-0018 | pass | 首次無 🔴 |
| #21 | oxlint config | pass | 修 --deny-warnings flag 後 merge |
| #22 | docker-compose | pass | 首次無 🔴 |
| #23 | root scaffold | pass | 手動補開 PR（Actions create PR 設定坑） |

---

## What worked（5 行）

1. **ci → review chain 全自動**：所有 PR push 後 ci.yml 跑完 → workflow_run 觸發 review.yml，零人工干預，7/7 成功。
2. **Single-pass sonnet review 有實質產出**：每個 PR 都拿到 inline comment，首週 🔴 2 個（ADR typo、oxlint flag）均指到真實問題。
3. **BOT_PAT 跨 workflow label 機制可用**：review.yml 用 BOT_PAT 加 `ai-fix` label 後，ai-fix.yml 正常被 user-event trigger；loop guard 正確阻止 bot 自循環。
4. **setup-labels.sh 44 顆 label 一鍵到位**：跑一次後整個 pipeline 的 label-based routing 全可用，無 label-missing 退出。
5. **self-hosted runner + CLAUDE_CODE_OAUTH_TOKEN 穩定**：7 個 ai-implement run 在第 4 輪全部 success，Claude Code CLI 呼叫無掉線。

---

## What was bumpy（5 行）

1. **AREA_TO_LANE 缺 area/infra + area/docs**：ai-implement.yml 的 lane mapping 沒涵蓋這兩個 area，第 1～2 輪 7 個 issue 全 fail，修 workflow 後重 fire 才過，共 4 輪重試。
2. **launchd HOME 覆寫破壞 keychain**：runner 服務的 HOME 設定導致 Claude Code 找不到 keychain token，要改用 `CLAUDE_CODE_OAUTH_TOKEN` env from secret，RUNNER-PITFALLS.md 事前未涵蓋此坑。
3. **"Allow Actions to create PRs" repo 設定預設關閉**：issue #6（P0-05）的 PR 沒被自動開出，要人工補 `gh pr create`（PR #23），浪費一輪 debug 時間。
4. **GITHUB_TOKEN loop guard 阻斷 ai-fix 自動化**：review.yml 用 GITHUB_TOKEN 加 label 時 GitHub 不觸發後續 workflow；必須 BOT_PAT 才能讓 ai-fix.yml fire，不是直覺設計，踩了才發現。
5. **Cross-agent 第二輪 review 未跑 + RR 未寫**：初版 review.yml 沒鏈 second-pass，前 7 個 PR 都缺 RR entry，要 backfill RR-001~007 並修 review.yml 才補齊。

---

## 行動項（下個 session 追蹤）

- [ ] 驗 deploy.yml 上線後 push to main 是否自動 trigger Railway deploy
- [ ] 驗 BE workspace merge 後 `/health` endpoint 回 200
- [ ] 把本 retro「bumpy」5 條全部寫進 HARNESS-PITFALLS 對應章節（部分已在 ISSUE-TO-MERGE-FLOW.md 記錄）

---

## 參考 Runs

- ci.yml last 10 runs：全 success（見 `gh run list --workflow ci.yml --limit 10`）
- review.yml last 10 runs：全 success（見 `gh run list --workflow review.yml --limit 10`）
- 7 個 Phase 0 PR merged at：2026-05-24T03:11~06:27 UTC

Refs Issue#16
