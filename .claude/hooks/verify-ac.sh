#!/usr/bin/env bash
# verify-ac.sh — pre-PR check: PR body must contain Acceptance Criteria checklist.
# Wire this into a local git pre-push hook OR run manually before `gh pr create`.

set -euo pipefail

PR_BODY_FILE="${1:-.git/PR_BODY.md}"

if [[ ! -f "$PR_BODY_FILE" ]]; then
  echo "❌ PR body file not found: $PR_BODY_FILE" >&2
  exit 1
fi

# Required sections
declare -a REQUIRED=(
  "## Acceptance Criteria checklist"
  "## Self-check log"
  "Refs Issue#"
)

MISSING=()
for s in "${REQUIRED[@]}"; do
  if ! grep -q -- "$s" "$PR_BODY_FILE"; then
    MISSING+=("$s")
  fi
done

if (( ${#MISSING[@]} > 0 )); then
  echo "❌ PR body is missing required sections:" >&2
  for s in "${MISSING[@]}"; do echo "   - $s" >&2; done
  echo "Use .github/PULL_REQUEST_TEMPLATE.md as the starting point." >&2
  exit 1
fi

# AC checklist must have at least one checked or unchecked item
if ! grep -Eq '^- \[[ x]\]' "$PR_BODY_FILE"; then
  echo "❌ AC checklist has no items. Add at least one '- [ ] AC' line." >&2
  exit 1
fi

echo "✅ PR body satisfies AC contract"
exit 0
