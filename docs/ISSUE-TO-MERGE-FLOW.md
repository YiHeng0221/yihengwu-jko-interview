# Issue → Merge Flow（實際版）

> 本文件描述**真實會發生的事**，不是「設計上應該發生的事」。每一步標明「自動」或「人工」、以及怎麼驗證。
> 若實際運作跟本檔不一致 → bug；先以這份為準診斷。

---

## TL;DR

```
你開 issue（手動）
   ↓
你翻 label  status/human-review → status/ai-implement（手動）
   ↓ ⚙️ 自動 trigger
ai-implement.yml → runner 跑 impl agent
   ↓ 自動
impl 寫 code、push 到 feature/epic-<NN>-<lane>-issue-<NN> branch
   ↓ 自動（會卡）
gh pr create  ← ⚠️ 需 repo settings 允許 Actions create PR；目前 disabled
   ↓ 若沒 PR → 你手動補開
PR 開出
   ↓ ⚙️ 自動 trigger
ci.yml（stub）→ tag PR with ai-review label
   ↓ ⚙️ 自動 trigger via workflow_run chain
review.yml → 跑 /review first pass + /review --cross 第二段
   ↓ 自動
若 verdict=changes-requested → tag ai-fix label
   ↓ ⚠️ 不會自動 trigger ai-fix.yml（GITHUB_TOKEN loop guard）
你從 GitHub UI re-add ai-fix label OR 手動改（手動）
   ↓ ⚙️ trigger ai-fix.yml
ai-fix.yml → runner 跑 /fix-pr → patch + push → re-run ci → re-run review
   ↓
若 verdict=pass → label review/pass
   ↓ 你 review code 後（手動）
gh pr merge --squash --delete-branch
   ↓
push to main → 你的 deploy / e2e workflows trigger（如有）
```

---

## ⚙️ 真正會「自動」跑的事

| 觸發 | Workflow | 跑哪 | 做什麼 |
|------|---------|------|--------|
| Issue 加 `status/ai-implement` label（手動）| `ai-implement.yml` | self-hosted | spawn impl agent |
| Push 到 PR branch | `ci.yml` | GitHub-hosted | 跑 typecheck/lint/test/build + tag `ai-review` |
| `ci.yml` success | `review.yml`（chained via `workflow_run`）| self-hosted | first-pass + cross-agent review |
| Label `ai-fix` 加上 by **human**（從 UI / 你自己的 gh） | `ai-fix.yml` | self-hosted | spawn fix agent |
| Push 到 `main` | `deploy.yml`（你還沒寫）| 看你定義 | deploy |

## 🚫 不會「自動」跑的事（需要人工介入）

| 動作 | 為什麼 | 該怎麼做 |
|------|--------|---------|
| Issue 翻 label `human-review` → `ai-implement` | 設計上要 human gate | 你自己 `gh issue edit <N> --remove-label status/human-review --add-label status/ai-implement` 或 UI 點 |
| Auto-merge PR | 設計上 human 要 review code | `gh pr merge <N> --squash --delete-branch` |
| `Refs Issue#NN` 自動關 issue | GitHub 只 honor `Closes #NN` / `Fixes #NN` / `Resolves #NN` | 改 create-pr skill 把 `Refs Issue#NN` 改成 `Closes #NN`，或手動 `gh issue close <N>` |
| `ai-fix.yml` 自動跑 fix 當 review 標 `ai-fix` | **GITHUB_TOKEN loop guard**（review.yml 用 GITHUB_TOKEN 加 label → 不會 fire 另一個 workflow）| 從 GitHub UI 手動加 `ai-fix` label（user event 才會 fire），或用 PAT 在 review.yml |
| `gh pr create` 在 workflow 內成功 | 預設 repo setting "Allow GitHub Actions to create and approve pull requests" disabled | Settings → Actions → General → 啟用該選項；或 human 手動 `gh pr create` |
| Cross-agent 二審 | review.yml 現在有兩段，會自動跑 | （這條現在自動了，但要看實際 log 確認）|

## 🔍 怎麼**驗證每步真的跑了**

| 想驗的事 | 命令 |
|---------|------|
| issue 真的 trigger ai-implement | `gh run list --workflow ai-implement.yml --limit 3` |
| impl agent 真的 push 到 branch | `gh api repos/<owner>/<repo>/branches --jq '.[] \| .name'` 找 `feature/epic-...-issue-<N>` |
| PR 真的開出 | `gh pr list --search "issue:<N>"` |
| ci.yml 真的跑了 | `gh run list --workflow ci.yml --limit 3` |
| review.yml 真的跑了（不是 skipped） | `gh run list --workflow review.yml --limit 3 --json status,conclusion` |
| review **真的寫 RR** | `git log --all -- docs/REVIEWS.md` + 看是否有新 RR-NNN（每個 PR 應該都有對應一條）|
| ai-fix.yml 真的跑了（不是 skipped） | `gh run list --workflow ai-fix.yml --limit 3` — 若每筆 `conclusion=skipped` 表示沒被 ai-fix label 觸發；conclusion=success 才是真跑 |
| Demo 真的部署 | `curl https://<demo-url>/health` |

## 📌 已知 gap（HARNESS-PITFALLS 參考）

| gap | 章節 | 暫時 workaround |
|-----|------|-----------------|
| Loop guard（review 加 ai-fix → fix 不跑）| §C7 | 從 UI 加 `ai-fix` label |
| Actions create PR disabled | （新加）| Settings → Actions → General 開啟；或人工 `gh pr create` |
| /review skip RR write on small PRs | （已修補 in commits `cec8adb`）| 用新 workflow + 新 review.md（強制 RR）|
| Cross-agent 沒跑 | （已修補 in `cec8adb`）| review.yml 內鏈了 second pass |
| `Refs Issue#NN` 不自動關 issue | （新加）| 改 create-pr skill 改用 `Closes #NN`，或人工 close |

---

## 一次性的 setup（已完成 / 還沒完成）

| ✅ 已完成 | ⏳ 還沒做 |
|----------|----------|
| Repo 建立 | Settings → Actions → General → "Allow Actions to create PRs" |
| Labels 全部建好（44 顆）| Railway dashboard 連 BE/FE service 到 repo |
| Self-hosted runner 註冊 + launchd service | Postgres `pg_trgm` extension（migration 帶起來也可）|
| `RAILWAY_TOKEN` secret | 寫 `deploy.yml`（依 PaaS 自決）|
| `CLAUDE_CODE_OAUTH_TOKEN` secret + workflow 用 env | `manual-seed.yml`（Prisma seed）|
| `ci.yml` stub | 真正的 `ci.yml`（待 Phase 0 P0-13 動工）|

---

## 真實案例：本 repo Phase 0 第一波 7 個 issue 走過什麼路

1. 我 fire 7 個 label flip → 7 個 ai-implement.yml run 起來
2. 第一輪 7 個 **全 fail**（area/docs / area/infra 不在 lane allow-list）→ 修 workflow `AREA_TO_LANE` map + push + 重 fire → 7 個 again fail
3. 第二輪 fail 原因：claude CLI "Not logged in"（HOME override 影響 keychain）→ 加 `HOME: /Users/wuyiheng` env → 重 fire → 第三輪 fail
4. 第三輪 fail 原因：keychain 在 launchd subprocess 讀不到 → 加 `CLAUDE_CODE_OAUTH_TOKEN` env from secret → 重 fire → 第四輪 7 個全 success
5. 7 個 PR 開出 — **1 個（#6）沒開出 PR**：repo setting "Allow Actions to create PRs" disabled → 人工補開為 PR #23
6. ci.yml 跑 → review.yml chained → 都有 review comments，**但沒寫 RR**（首次發現的另一個 gap）
7. 4 個 verdict=pass（#18 #19 #20 #22 #23），2 個 verdict=changes-requested（#17 #21）有 🔴
8. RR-001 ~ RR-007 backfill + review.yml 加 second-pass + review.md 強制 RR — push 上 main
9. 解 3 個 README.md merge conflict（每 ADR PR 都加自己 row 到 index）
10. 修 #17 的 🔴（RAILWAY_STATIC_URL → RAILWAY_PUBLIC_DOMAIN）+ 修 #21 的 🔴（移除 --deny-warnings）
11. 一一 merge → 全 7 個進 main

**踩了 4 個原 harness 沒涵蓋的 gotcha**（area lane allow-list、HOME pin、CLAUDE_CODE_OAUTH_TOKEN、Actions create PR setting）。全部修補 + 寫進 HARNESS-PITFALLS。下次新 repo bootstrap 應該不會再踩。

---

## 重點原則

1. **「ai 跑了」 = workflow run conclusion=success + 有對應 artifact**（PR / comment / commit / RR）。光看 label 不準。
2. **每個自動 step 後驗一次**：開 issue → 看 ai-implement run → 看 branch → 看 PR → 看 ci → 看 review → 看 RR → 看 merge → 看 deploy。
3. **gap 寫進 HARNESS-PITFALLS**：當下發現 + 修補 + 沒辦法立刻修的 workaround 寫清楚。
