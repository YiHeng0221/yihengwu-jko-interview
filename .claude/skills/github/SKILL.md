# GitHub Skill

Route to the correct reference based on user intent.

## Routing

| Intent | Reference |
|--------|-----------|
| Open or update a pull request | Read `references/create-pr.md` and follow it |

## Pre-check (ALWAYS run first)

Before any GitHub operation, verify `gh` CLI is authenticated:

```bash
gh auth status
```

If that fails, tell the user to run `gh auth login` and STOP. Do not try to work around it.

## How to Route

1. If the user (or an upstream agent) wants to **open** / **create** / **submit** a PR, **update** an existing PR's description, or finalise a "ready to ship" branch → `create-pr.md`
2. Until additional references exist, every other GitHub intent (closing issues, reviewing PRs, etc.) is handled by `gh` directly without a skill.
