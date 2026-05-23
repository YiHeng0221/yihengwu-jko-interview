#!/usr/bin/env bash
# round-counter.sh — read/write the AI-FIX-STATE round counter from a PR body file.
# Used by ai-fix.yml. Standalone-runnable for local testing.
#
# Usage:
#   round-counter.sh read  <pr-body-file>          # prints current round (0 if absent)
#   round-counter.sh inc   <pr-body-file>          # increments and writes
#   round-counter.sh reset <pr-body-file>          # resets to 0

set -euo pipefail

MODE="${1:?mode: read|inc|reset}"
FILE="${2:?pr-body-file}"

STATE_REGEX='<!-- AI-FIX-STATE'
ROUND_REGEX='Round:[[:space:]]*([0-9]+)/3'

case "$MODE" in
  read)
    if grep -q "$STATE_REGEX" "$FILE"; then
      ROUND=$(grep -oE "$ROUND_REGEX" "$FILE" | head -1 | grep -oE '[0-9]+' | head -1)
      echo "${ROUND:-0}"
    else
      echo "0"
    fi
    ;;
  inc)
    CURRENT=$("$0" read "$FILE")
    NEXT=$((CURRENT + 1))
    NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    BLOCK="<!-- AI-FIX-STATE
Round: ${NEXT}/3
Last: ${NOW}
-->"
    if grep -q "$STATE_REGEX" "$FILE"; then
      # Replace existing block (portable across BSD/GNU sed via Python)
      python3 - "$FILE" "$BLOCK" <<'PY'
import re, sys, pathlib
path, block = sys.argv[1], sys.argv[2]
p = pathlib.Path(path)
new = re.sub(r'<!-- AI-FIX-STATE[\s\S]*?-->', block, p.read_text(), count=1)
p.write_text(new)
PY
    else
      printf "\n\n%s\n" "$BLOCK" >> "$FILE"
    fi
    echo "$NEXT"
    ;;
  reset)
    BLOCK="<!-- AI-FIX-STATE
Round: 0/3
Last: -
-->"
    python3 - "$FILE" "$BLOCK" <<'PY'
import re, sys, pathlib
path, block = sys.argv[1], sys.argv[2]
p = pathlib.Path(path)
text = p.read_text()
if re.search(r'<!-- AI-FIX-STATE[\s\S]*?-->', text):
    text = re.sub(r'<!-- AI-FIX-STATE[\s\S]*?-->', block, text, count=1)
else:
    text += "\n\n" + block + "\n"
p.write_text(text)
PY
    echo "0"
    ;;
  *)
    echo "Unknown mode: $MODE" >&2
    exit 2
    ;;
esac
