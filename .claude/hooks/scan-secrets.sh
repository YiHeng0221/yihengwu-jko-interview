#!/usr/bin/env bash
# scan-secrets.sh — runs after every Write/Edit
# Checks the touched file for obvious secret patterns. Not a full secret scanner —
# that's gitleaks's job in CI. This is the canary at the keyboard.

set -euo pipefail

FILE="${CLAUDE_TOOL_FILE_PATH:-}"
if [[ -z "$FILE" || ! -f "$FILE" ]]; then
  exit 0
fi

# Skip binary files
file "$FILE" | grep -q "text" || exit 0

# Skip .env.example explicitly — it's meant to contain placeholders
case "$FILE" in
  *.env.example|*.env.sample) exit 0 ;;
esac

# Patterns that almost always indicate a real secret
declare -a PATTERNS=(
  'sk-(ant|proj)-[A-Za-z0-9_-]{20,}'           # Anthropic / OpenAI tokens
  'AKIA[0-9A-Z]{16}'                           # AWS access key
  'AIza[0-9A-Za-z_-]{35}'                      # Google API key
  'ghp_[A-Za-z0-9]{36}'                        # GitHub PAT
  'glpat-[A-Za-z0-9_-]{20}'                    # GitLab PAT
  'xox[abp]-[A-Za-z0-9-]{10,}'                 # Slack tokens
  '-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY' # Private keys
)

HIT=0
for pat in "${PATTERNS[@]}"; do
  if grep -E -- "$pat" "$FILE" > /dev/null; then
    echo "⚠️  Possible secret in $FILE matching /$pat/" >&2
    HIT=1
  fi
done

if [[ "$HIT" == "1" ]]; then
  echo "⚠️  scan-secrets: review $FILE before committing." >&2
  # Warn-only, don't block — gitleaks will hard-block at commit time
fi

exit 0
