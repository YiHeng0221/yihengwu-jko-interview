# Harness Pitfalls

> 本文件紀錄使用本 harness 開新專案時實測踩到的坑。**每條都對應 scaffold 已預先解掉的東西**或**新 repo 必須留意的事**。
> 給未來的人類 + agent：開新專案前讀過一遍，可省一輪 retry。
> **不寫具體 stack / ADR / repo 名稱**。若需要參照「實際發生的版本」，到對應 project repo 的 retro / RR 看。

---

## A — Scaffold 完整性（bootstrap 階段最常被漏的東西）

### A1. Root infra files 必須由 ADR 拍板過、然後 impl agent 才生

本 harness **故意不帶**任何 stack-specific 的 root config（沒有 `package.json` / `pnpm-workspace.yaml` / `tsconfig.base.json` / `.oxlintrc.json` / lock files / Dockerfile / docker-compose）。

新專案 bootstrap **必走的順序**：

1. PM 寫 ADR-0003+ 拍板 stack
2. impl agent 拿 ADR 為 source of truth 生對應 config files
3. PR 進來時 reviewer 檢查 ADR ↔ config 對得起來

如果跳步驟（impl agent 在沒 ADR 的情況下自己生 lint config / framework choice）→ 違反 Hard Rule #8（no silent decisions），容易選錯工具，後面要重做。

### A2. Process ADR vs Architectural ADR 分清楚

- **Process ADR**（`docs/decisions/0001-documentation-conventions.md` / `0002-cross-agent-review.md`）— 是 **harness 自身**的決策，每個從 harness 啟動的專案都繼承
- **Architectural ADR**（`0003+`）— **由各專案自己決定**，記錄這次選的 stack / tooling / patterns

不要把 architectural ADR 留在 lean-harness 內。

### A3. Label taxonomy 必須一鍵建好

`scripts/setup-labels.sh` 是 idempotent、一鍵 setup 35+ 顆 label。**新 repo 第一步必跑**，不然：

- 任何「PR 加 `ai-review` label」的 step 會 exit 1（label 不存在）
- impl agent flip `status/ai-implement` 也找不到 label
- 整條 review pipeline 停擺

### A4. PR template / create-pr skill 走 team 預設語言

本 harness 預設 PR template + create-pr skill 用 **繁體中文** + 強制 sections。如果 team 預設語言不同，bootstrap 後**第一件事**改 `.github/PULL_REQUEST_TEMPLATE.md` + `.claude/skills/github/references/create-pr.md`。

否則 impl agent 預設用該 template，每個 PR 都要 retrofit。

---

## B — Agent 協作（多 agent 平行幹活的衝突）

### B1. 多 agent 撞共用檔

FE 的 entry / router / shared 整合層（`App.tsx` / `routes` / `main.tsx` / 各 feature `index.ts` 之類）— 多個 impl agent 平行寫同一 lane 時都會想動這些檔。

**Rule**：FE 整 lane 的 entry / router / 整合層**只能由「FE 統籌」這一張 issue 管**。其他 FE 子票只管自己的元件、不碰 entry。

> 真實案例：N 個 FE impl agent 各自寫 own 版本的 entry + 主資料 hook + 主 card → 後續開 reconciliation PR 收拾。

### B2. Branch 必須含 issue number

Branch 命名：`feature/epic-<NN>-<lane>-issue-<NN>`，**最後的 `-issue-<NN>` 必填**。

否則：N 個 agent 平行做同一 lane → 都 push 到 `feature/epic-<NN>-<lane>` → 互蓋。

`.claude/agents/impl.md` + `.github/workflows/ai-implement.yml` 已強制這個格式。

### B3. Worktree 不可共用

N 個 lane 平行的話，各自一個 worktree：

```
~/work/epic-1-be/
~/work/epic-1-fe/
~/work/epic-1-qa/
```

不要共用 `~/work/<repo>/` 一個目錄 — `git checkout` 會打架。

---

## C — Process gotchas

### C1. 一次性 ops 不能塞進 deploy chain

DB seed、admin user 建立、cache warming、migration backfill 等**一次性、需要外部資料**的動作，**絕不要**塞 Dockerfile CMD 或 deploy 工作流。

實測 churn 過多 PR 全失敗 — 例如 seed 流程被嘗試了：
- 從 GH runner 跑 CLI 連 service internal hostname → unreachable
- container CMD 用實驗性 node flag → runtime 版本不支援
- container CMD 跑 npm bin 路徑 → child shell 缺 PATH
- container CMD 直接吃 tsx → 仍失敗

**最終解法**：開一個 `workflow_dispatch` workflow（`.github/workflows/manual-seed.yml` 或類似），用 deploy provider 的 CLI 抓 **public** connection URL 跑一次性 script。手動觸發，不在 deploy chain。

### C2. env 設定對 URL/Host 用 transform、不要嚴格 refine

如果 FE 的 env schema 對 hostname/URL 用嚴格 `.refine()` 驗 protocol，**會擋掉很多 PaaS 注入的裸 hostname**（沒 `https://` prefix）→ 白畫面。

**解法**：用 `.transform()` 在裸 hostname 前面自動補 `https://`。

```ts
ApiBaseUrl: z.string().transform(v =>
  /^https?:\/\//.test(v) ? v : `https://${v}`
)
```

### C3. Lockfile drift 從 runner 自動 install

Self-hosted runner 跑 dep install 後 commit lockfile 時，**有時會把 macOS / 特定 arch 專屬的 native binary 寫進 prod dependencies**。

**解法**：runner 上 install 一律加 frozen-lockfile flag，不允許更新。Lockfile 更新只能由 human 在本機產 + commit。

### C4. AI Fix Loop 必須 cap 3 輪

PR body 內存 HTML comment：

```html
<!-- AI-FIX-STATE
Round: 0/3
Last: -
-->
```

每輪 `ai-fix.yml` 觸發時 `scripts/round-counter.sh` +1。第 4 輪 → 加 `human-review` label，停 automation。

> 為什麼：實測 round 4+ 通常是 reviewer 跟 fixer 在 ping-pong 對小細節。停下來讓人介入比繼續 churn 划算。

### C5. Reviewer 必須 fresh context 不能看一審結果

跨 agent 二審的價值在於「fresh context 找一審盲區」。如果二審看到一審 comments，會跟著一審的 framing 走 → 失去獨立性。

`review.yml` 內 cross-agent job 必須開新 Claude session、只給 PR diff + issue body，不帶一審 output。

### C6. Workflow 觸發 vs runner 連線狀態

`ai-implement.yml` trigger 是 `issues: labeled`。若 label 翻了但 runner 離線（或還沒註冊），workflow run 會 queue 在那邊。

**監控**：開新 repo 第一週每天 `gh run list --status queued` 看一下。
**修正**：runner 上線後 queued run 會自動接上；若不要這個 run（例：已在 session 內手動完成）→ `gh run cancel <id>`。

---

## D — Deploy / Infra（PaaS 通用坑）

### D1. Internal vs public service URL

多數 PaaS（Railway / Fly / Render / ...）提供兩種 service-to-service URL：

- **Internal hostname**（如 `xxx.internal:port`）— 只能從同 PaaS project 內連
- **Public URL / TCP proxy** — 外部可連，通常另一個 port

GH Actions runner 在外部，跑 seed / migration / smoke test 要用 **public**，不能用 internal。

### D2. Deploy 後必驗 health

連 repo + deploy 完，**必跑** `curl https://<service-url>/health` 才算 smoke green。
有時 image build 過但 entrypoint 跑不起來（runtime 缺 library / version 不對）— health 200 才是真的 OK。

### D3. Self-hosted runner 註冊綁特定 repo

個人 GitHub 帳號的 runner **只能綁一個 repo**（不像 org runner 可共用）。
要在多 repo 跑：**多開 runner instance**，各自設定指向不同 repo。同台機器可以同時跑多個 runner，互不影響。

詳見 `docs/RUNNER-PITFALLS.md`。

---

## E — PM scope sizing

### E1. 一張票一件事 ≠ 全部拆成 30 行 ticket

「one ticket one thing」原則沒錯，但顆粒度要看「value delivered」，不是「LOC count」。

⚠️ **過度拆**：

```
[web] Button primitive + story            ← 30 LOC, 5 min impl
[web] IconButton primitive + story        ← 30 LOC, 5 min impl
[web] Spinner primitive + story           ← 25 LOC, 5 min impl
…(× 30 個 trivial primitive tickets)
```

→ PR overhead > 實作時間。Review / merge / track 整體 throughput 反而變差。

✅ **合理拆**：

```
[web] UI primitives — Button/IconButton/Spinner（3 顆同類，共一個 stories 檔）
[web] Chip primitive（feature-critical，獨立追蹤）
[web] Dialog + Drawer 通用 component（commonly stuck-together）
[web] <FeatureName>Page（包 page + hook + DTO）
```

→ 約 8-12 個 FE children 是合理 scale。

**Rule of thumb**：

| 子票顆粒 | LOC | 適合場景 |
|---------|-----|---------|
| 太細 ❌ | < 50 | 單一 trivial primitive、可組合的小 utility |
| 合理 ✅ | 100-300 | 一個 feature page + 對應 hook + DTO；或 3-4 同類 primitives 同 PR |
| 偏大 ⚠️ | 300-500 | 整個 lane 的 reconciliation；多 feature 整合 |
| 太大 ❌ | > 500 | 必拆 |

> 真實案例：曾經把 Phase 1 拆成 86 張 trivial primitive ticket，PR overhead 遠超實作時間，user 看完直接喊「太可怕了」決定整 repo 砍掉重來。

### E2. PM 拆票要有 audit trail，不需要每張都實作

完整拆票的價值在於「**scope 完整可見**」。但實際 deadline 下：

- **必做 ticket**：subset that produces a working demo URL
- **其他保持 open 當 backlog**，audit trail 仍完整
- 提交時可以說：「Phase 1 規劃 N children，本 deadline 下 implement 了 M 個，剩 backlog 在 issue tracker」

### E3. PM 必須產視覺草稿（如有 UI），不丟給 FE 第一個 PR 做

如果是 UI 專案：`docs/specs/0NNN-<slug>.preview.html` — **PM 階段就要產出**（單檔靜態 HTML 即可），**連結內嵌 FE 子票 issue body**。

> 真實案例：第一版規劃把「FE 第一個 PR 是 preview.html」當 gate，user 糾正 → preview 是 PM 產出物。

### E4. PM 拆票之前要先有 spec md/html

順序：

```
brief → spec md → spec html → preview html (UI 才有) → tasks html → epic + children
                                                          ↑ tasks.html 是給 human 拍板的 dry-run
                                                            確認 OK 才開 issue
```

跳步驟（例：沒 tasks.html dry-run 就開 issue）→ 開了 issue 又要關，浪費時間。

---

## F — Session / 流程管理

### F1. 砍 session 之前先 dump 學到的東西

如果 session 變太亂（context overflow / 方向走偏），要砍掉重來時：

1. **先**把本 session 學到的東西寫進對應位置（這份檔案、AGENTS.md hard rules、agent 定義內的 anti-pattern 提醒）
2. **再**砍 session

否則下一個 session 又會踩同樣的坑。

### F2. lean-harness 應該是個 git repo

純 local 目錄 → 沒 diff 看不到歷史 → 升級 harness 時容易遺漏。

建議：

```bash
cd <lean-harness 路徑>
git init && git add -A && git commit -m "lean-harness vN"
gh repo create <你的 org>/lean-harness --private --source=. --push
gh api repos/<owner>/lean-harness --method PATCH -f is_template=true
```

之後新專案 bootstrap 走：

```bash
gh repo create <owner>/<new-project> --private --template <owner>/lean-harness
```

template repo 功能自動拷貝 scaffold，乾淨。

### F3. Secret / Token 不過聊天 channel

`<PROVIDER>_TOKEN` / API key 等：

- ✅ 在 user 自己終端機跑 `gh secret set ... --body -` 貼進 stdin
- ❌ 貼進 chat 給 agent 設

若不得已貼了 → demo 結束務必 revoke + 重產（**寫進 retro 行動項**）。

### F4. Discord / 外部通訊 必走 tool，不靠 text output

agent 的 text output 不會自動進 Discord / Slack / 等通訊軟體。要通知 user 必跑對應 tool（如 `mcp__plugin_discord_discord__reply`）。

> 真實案例：早期 session agent 以為「我寫了就會傳給 user」，結果 user 在 Discord 看不到任何更新。

---

## 維護本文件

每次發現新坑 → 加一條進來，並對應更新：

- `.claude/agents/<agent>.md` 的 anti-pattern 區塊
- `AGENTS.md` 若是 hard rule 等級的
- 對應 scaffold 內已 hard-coded 解掉的東西 → 在條目末尾加「✅ scaffold 已預防」

**不要寫具體 ADR / project / domain 名字**。若需要追真實案例，到 project repo 的 retro 找。

歡迎 PR — 每個踩坑都是給未來的人一份禮物。
