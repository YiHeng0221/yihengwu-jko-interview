#!/usr/bin/env bash
# scripts/setup-labels.sh
# 一鍵建好本 harness 用到的全部 GitHub labels（idempotent — 已存在的會 skip）。
#
# 使用：
#   ./scripts/setup-labels.sh                            # 用目前 gh 認證的預設 repo
#   ./scripts/setup-labels.sh owner/repo                 # 指定 repo
#
# 設計：
# - 不假設 GitHub 預設 label 已被刪。
# - 顏色 / 描述跟 allen-harness-test 對齊，符合 CLAUDE.md §Labels 跟 docs/HARNESS-WORKFLOW.html 的描述。
# - 任何 label create 失敗（已存在）會被吞掉，不擋後續。
set -euo pipefail

REPO="${1:-}"
REPO_FLAG=""
if [ -n "$REPO" ]; then
  REPO_FLAG="--repo $REPO"
fi

create() {
  local name="$1" color="$2" desc="$3"
  if gh label create "$name" --color "$color" --description "$desc" $REPO_FLAG 2>/dev/null; then
    echo "  ✓ created  $name"
  else
    # already exists — update colour/description to stay in sync
    if gh label edit "$name" --color "$color" --description "$desc" $REPO_FLAG 2>/dev/null; then
      echo "  ↻ updated  $name"
    else
      echo "  ⚠ skipped  $name (race or perms)"
    fi
  fi
}

echo "Setting up labels${REPO:+ on $REPO}…"

# kind/  — 類型
create "kind/feature"            "0E8A16" "New feature"
create "kind/bug"                "D73A4A" "Defect"
create "kind/chore"              "BFDADC" "Maintenance"
create "kind/exception-request"  "FBCA04" "Hard-rule exception"
create "kind/epic"               "5319E7" "Parent issue grouping FE/BE/QA child tickets"

# area/  — 影響範圍
create "area/web"   "0969DA" "Frontend React"
create "area/api"   "1A7F37" "Backend Fastify/Prisma"
create "area/db"    "6F42C1" "Postgres schema / migrations"
create "area/e2e"   "9A6700" "Playwright + a11y"
create "area/infra" "0E4F9D" "CI/CD, runner, deploy"
create "area/docs"  "0075CA" "Specs/ADR/prompts/README"

# status/  — 進度狀態
create "status/ready"          "0075CA" "Ready to start"
create "status/human-review"   "FBCA04" "Awaiting human review before agent picks up"
create "status/ai-implement"   "0E8A16" "Human approved; ai-implement.yml may spawn agent"
create "status/in-progress"    "FBCA04" "Currently being worked"
create "status/blocked"        "B60205" "Blocked"
create "status/done"           "C5DEF5" "Completed"

# agent/  — 誰能動
create "agent/auto"          "1D76DB" "Eligible for AI implementation"
create "agent/human-needed"  "B60205" "Requires human action"
create "agent/co-op"         "FBCA04" "Human + AI pair"

# risk/  — 是否需要 ADR
create "risk/low"   "C5DEF5" "No ADR needed"
create "risk/med"   "FBCA04" "May warrant an ADR"
create "risk/high"  "D93F0B" "ADR required"

# size/  — 預估 hand-written LOC
create "size/xs"  "E1E4E8" "<50 lines"
create "size/s"   "B0BEC5" "<200 lines"
create "size/m"   "C5DEF5" "<500 lines"
create "size/l"   "1D76DB" "<800 lines"

# severity/  — bug 等級
create "severity/low"       "C5DEF5" "Cosmetic / minor"
create "severity/med"       "FBCA04" "Functional impact, no workaround"
create "severity/high"      "D93F0B" "Major path broken"
create "severity/critical"  "B60205" "Outage / data loss"

# review pipeline labels
create "ai-review"     "0E8A16" "Self-hosted runner picks up to run /review"
create "review/pass"   "1A7F37" "Reviewer-orchestrator gave green light"
create "ai-fix"        "0E8A16" "AI fix loop should patch findings"
create "human-review"  "FBCA04" "AI fix loop exhausted (>3 rounds)"

echo "Done."
echo "Verify with: gh label list ${REPO:+--repo $REPO} --limit 60"
