# Lean Harness

> 一個 **stack-agnostic** 的 AI 開發 harness — 提供流程、agent personas、PR / review / fix loop、label taxonomy。
> **不假設 tech stack**。你的專案決定用什麼語言 / framework / lint / deploy provider。

## What's in this harness

```
.claude/
├── agents/       # 6 個 agent persona（PM / impl / reviewer / ai-fix / orchestrator / qa）
├── commands/     # 3 slash commands（/review · /fix-pr · /implement-issue）
├── skills/       # github create-pr skill
├── hooks/        # pre-bash · scan-secrets · verify-ac
└── scripts/      # round-counter.sh

.github/
├── workflows/    # ai-fix.yml · ai-implement.yml · review.yml（agent-driven CI on self-hosted runner）
├── ISSUE_TEMPLATE/
└── PULL_REQUEST_TEMPLATE.md

docs/
├── HARNESS-PITFALLS.md   # 從實戰學到的踩坑紀錄（無關 stack）
├── RUNNER-PITFALLS.md    # self-hosted runner 設定坑
├── REQUIREMENTS.md       # AC tracker template
├── RISKS.md              # Risk register template
├── SCALING.md            # Scaling notes template
├── TESTING.md            # Testing strategy template
├── REVIEWS.md            # Cross-agent review log (RR-NNN)
├── specs/                # PM 產出的 spec 放這
├── decisions/            # ADRs（含 0001/0002 — harness 自己的 process ADR）
└── prompts/              # 代表性 AI 對話 log

templates/
├── adr-template.md
├── spec-template.md
├── review-template.md
├── fe-feature-spec.template.md      # 每個專案 copy → docs/specs/fe-feature-spec.md，記錄 FE stack 拍板
└── be-feature-spec.template.md      # 每個專案 copy → docs/specs/be-feature-spec.md，記錄 BE stack 拍板

scripts/
└── setup-labels.sh       # 一鍵建好 35+ 顆 label
```

## What's **NOT** in this harness

故意拿掉、由各專案自決：

- ❌ Tech stack（FE framework / BE framework / DB / lint / test runner）
- ❌ `package.json` / `pnpm-workspace.yaml` / `tsconfig.base.json` / `.npmrc` / `.nvmrc`
- ❌ Lint config（`.oxlintrc.json` / `.eslintrc` / ...）
- ❌ Build config（`vite.config.ts` / `webpack.config.js` / ...）
- ❌ Docker / `docker-compose.yml`
- ❌ Deploy workflow（Railway / Vercel / Fly / AWS specific）
- ❌ `Makefile` 跟 dev-command alias
- ❌ Project-specific ADRs（每個專案自己寫 ADR-0003+）

每個專案啟動時，PM agent 第一步是寫 **`docs/specs/0001-<feature>.md`** + **`docs/decisions/0003-stack-choice.md`** 之類的 ADR 決定 stack，然後 impl agent 才開始 bootstrap。

## 使用流程

```bash
# 1. 從本 harness 啟動新專案
gh repo create your-project --private --template <你的 harness repo>
cd your-project

# 2. 一鍵建 label
./scripts/setup-labels.sh

# 3. 設定必要 secret（依照你選的 deploy provider）
gh secret set <PROVIDER>_TOKEN

# 4. PM phase：產 spec + ADR + 1 epic + N children
#    （走 .claude/agents/pm.md 的 process）

# 5. Human 看 tasks.html，拍板，flip status/ai-implement label
# 6. ai-implement.yml fires → impl agent 動工 → PR 出
# 7. ci.yml（你自己 bootstrap 的，名稱必為 "ci"） → review.yml 自動 chained
# 8. review verdict pass → human merge
```

## Self-hosted runner

review / ai-fix / ai-implement 設計成跑在 **self-hosted runner**，用 user 的 Claude Code CLI（吃 Claude Max 訂閱），不燒 API 額度。

設定步驟見 `docs/RUNNER-PITFALLS.md`。Runner label = `[self-hosted, allen-mac]`（或你自己改）。

## ⚠️ 動工前必讀

`docs/HARNESS-PITFALLS.md` — 20+ 條從實戰學到的坑。**每個從本 harness 啟動的新專案都會踩同一坑**（除非你先讀過）。

## License

MIT（內部使用 OK，外發前再決定）。
