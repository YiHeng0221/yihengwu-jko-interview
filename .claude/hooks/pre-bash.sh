#!/usr/bin/env bash
# pre-bash.sh — runs before every Bash tool invocation
# Blocks dangerous commands defensively. Settings.json already denies these,
# but this hook gives a clearer error message and catches creative variants.

set -euo pipefail

CMD="${CLAUDE_TOOL_INPUT:-}"
if [[ -z "$CMD" ]]; then
  # Some Claude Code versions pass the command differently — try stdin
  CMD="$(cat || true)"
fi

block() {
  echo "🚫 BLOCKED: $1" >&2
  echo "   command: $CMD" >&2
  exit 1
}

# Destructive recursive removal
echo "$CMD" | grep -Eq 'rm[[:space:]]+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)' && \
  block "rm -rf detected. Use targeted deletion or 'git clean -dfX'."

# Force push variants
echo "$CMD" | grep -Eq 'git[[:space:]]+push[[:space:]]+(.*[[:space:]]+)?(-f|--force|--force-with-lease)' && \
  block "git push --force is disabled. If you really need it, open an exception-request issue."

# Skip hooks bypass
echo "$CMD" | grep -Eq '(--no-verify|--no-gpg-sign|-c[[:space:]]+commit\.gpgsign=false)' && \
  block "Hook/signing bypass detected. Fix the underlying issue instead."

# Hard reset against published commits
echo "$CMD" | grep -Eq 'git[[:space:]]+reset[[:space:]]+--hard' && {
  echo "⚠️  git reset --hard requested. Continuing — but verify you're not nuking other work." >&2
}

# Operations on protected paths
echo "$CMD" | grep -Eq '(rm|mv)[[:space:]]+.*\.(env|env\.[a-z]+)([[:space:]]|$)' && \
  block "Operation on .env* is blocked. Edit via your shell directly if needed."

exit 0
