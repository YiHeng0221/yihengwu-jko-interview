#!/usr/bin/env bash
# Pre-check that gh CLI is authenticated and the repo has a remote.
# Invoked by the github skill before any PR-creation step.
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "❌ gh CLI not installed. Install: https://cli.github.com/"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "❌ gh CLI not authenticated. Run: gh auth login"
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "❌ No 'origin' remote configured. Run: git remote add origin <url>"
  exit 1
fi

echo "✅ gh authenticated · origin remote present"
