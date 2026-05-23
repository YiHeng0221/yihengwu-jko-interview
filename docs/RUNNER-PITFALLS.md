# Self-hosted Runner Pitfalls

> Record of every wrong turn we hit while bringing up the local AI review pipeline (PoC PR #17, 2026-05-20). Read this **before** setting up the equivalent on another machine.

---

## 1. `svc.sh install` / `svc.sh start` must NOT be run with `sudo` on macOS

**Symptom**: copying instructions from the GitHub Actions runner docs (which were written with Linux in mind) suggested `sudo ./svc.sh install`. macOS errors out with `Must not run with sudo`.

**Cause**: macOS uses a **user-level launchd** (`LaunchAgent`), not a system-level `LaunchDaemon`. Running with sudo would try to install at `/Library/LaunchDaemons/` and break.

**Fix**:
```bash
cd ~/actions-runner
./svc.sh install      # no sudo
./svc.sh start        # no sudo
./svc.sh status       # no sudo
```

LaunchAgent lands at `~/Library/LaunchAgents/actions.runner.<owner>-<repo>.<runner-name>.plist`.

---

## 2. `actions/setup-node@v4` with `cache: pnpm` fails when there is no lockfile

**Symptom**: very first PR (before Phase 0 scaffolds the monorepo) failed CI with:

```
Dependencies lock file is not found in /home/runner/work/...
Supported file patterns: pnpm-lock.yaml
```

**Cause**: `cache: pnpm` strictly requires `pnpm-lock.yaml`. Putting `if:` guards on the later `pnpm install` steps doesn't help — the cache step runs unconditionally.

**Fix**: split into a **preflight** job that detects whether `pnpm-workspace.yaml` + `pnpm-lock.yaml` exist, and make the `quality` job depend on `preflight.outputs.has_workspace == 'true'`. Skipped jobs don't run setup-node at all.

```yaml
jobs:
  preflight:
    runs-on: ubuntu-latest
    outputs:
      has_workspace: ${{ steps.detect.outputs.has_workspace }}
    steps:
      - uses: actions/checkout@v4
      - id: detect
        run: |
          if [ -f pnpm-workspace.yaml ] && [ -f pnpm-lock.yaml ]; then
            echo "has_workspace=true" >> $GITHUB_OUTPUT
          else
            echo "has_workspace=false" >> $GITHUB_OUTPUT
          fi

  quality:
    needs: preflight
    if: needs.preflight.outputs.has_workspace == 'true'
    runs-on: ubuntu-latest
    # …
```

The downstream `tag-for-review` job then accepts `skipped` as equivalent to pass:

```yaml
tag-for-review:
  needs: [preflight, quality, pr-size, secret-scan]
  if: |
    always() &&
    needs.preflight.result == 'success' &&
    (needs.quality.result == 'success' || needs.quality.result == 'skipped') &&
    needs.pr-size.result == 'success' &&
    needs.secret-scan.result == 'success'
```

---

## 3. Duplicate `if:` key on a job → "workflow file issue"

**Symptom**: CI fails instantly (within seconds) with conclusion `failure` and message *"This run likely failed because of a workflow file issue."* No useful logs.

**Cause**: I had two `if:` keys on the same job:

```yaml
  tag-for-review:
    if: github.event_name == 'pull_request' && !github.event.pull_request.draft   # ← first
    needs: [quality, pr-size, secret-scan]
    if: |                                                                          # ← second
      always() && ...
```

YAML duplicate keys are invalid. GitHub Actions doesn't surface a precise parser error; it just fails the run with a vague message.

**Fix**: merge into one `if:` block.

---

## 4. `GITHUB_TOKEN`-added labels do NOT trigger other workflows

**Symptom**: `ci.yml` runs `gh pr edit --add-label ai-review` successfully, but `review.yml` (configured with `on: pull_request: types: [labeled]`) never starts.

**Cause**: documented loop guard ([GitHub docs](https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication)):

> When you use the repository's GITHUB_TOKEN to perform tasks, events triggered by the GITHUB_TOKEN, with the exception of `workflow_dispatch` and `repository_dispatch`, will not create a new workflow run.

**Fix**: chain via `workflow_run` instead.

```yaml
# review.yml
on:
  workflow_run:
    workflows: [ci]
    types: [completed]
  workflow_dispatch:           # also keep this for manual re-trigger
    inputs:
      pr_number:
        required: true
```

Inside the job, gate on `github.event.workflow_run.conclusion == 'success'` and pull the PR number from `github.event.workflow_run.pull_requests[0].number`. Keep the `ai-review` label as a *human-visible status indicator* + a job-level filter (reject runs where the PR lacks it).

**Alternative**: use a Personal Access Token instead of `GITHUB_TOKEN` to add the label. Avoided here to keep zero secret-rotation overhead.

---

## 5. `workflow_run` only triggers from workflow files on the **default branch**

**Symptom**: I committed the new `review.yml` (with `workflow_run` trigger) to the PR branch. CI on that PR succeeded, but no review job ran. Even after re-pushing, no trigger.

**Cause**: documented constraint:

> A workflow run is only triggered when the workflow file is on the default branch.

So `workflow_run` reads the version of `review.yml` that exists on `main`. The PR branch's version is irrelevant for triggering.

**Fix**: push the workflow change directly to `main` (or merge it via a PR) BEFORE testing on a separate feature branch. After the file is on `main`, subsequent CI runs from any PR trigger correctly.

This is also why most workflow-file changes can't be tested in isolation on a feature branch — they need to ship to `main` first.

---

## 6. Concurrency group keys collide across triggers

**Discovered by `/review` reviewing its own workflow** (PoC PR #17, RR-001):

```yaml
concurrency:
  group: review-${{ github.event.workflow_run.head_branch || github.event.inputs.pr_number }}
```

`head_branch` (string like `feature/foo`) and `pr_number` (numeric string like `17`) live in the same namespace, so a branch literally named `"17"` would collide with PR 17. Fix: prefix with the source:

```yaml
group: review-${{ github.event_name }}-${{ github.event.workflow_run.head_branch || github.event.inputs.pr_number }}
```

Filed as nit, not blocking — but a real edge case.

---

## 7. `${{ toJson(github.event) }}` inside a single-quoted heredoc is unsafe

```bash
PR=$(jq -r '.workflow_run.pull_requests[0].number' <<< '${{ toJson(github.event) }}')
```

The expansion happens in YAML before the shell sees it. A single quote inside the event payload silently breaks the heredoc and `jq` reads partial JSON. Use an env var:

```yaml
env:
  EVENT_JSON: ${{ toJson(github.event) }}
run: |
  PR=$(jq -r '.workflow_run.pull_requests[0].number' <<< "$EVENT_JSON")
```

Found by `/review` on itself. 🤝

---

## 8. macOS Keychain inaccessible from launchd background process

**Symptom**: `claude -p "/review …"` in the runner step fails with:

```
Not logged in · Please run /login
```

From an interactive terminal, the same command works fine (`claude auth status` shows `Max subscription, OAuth via claude.ai`).

**Cause**: launchd-spawned processes don't have a GUI session attached, so they can't reach `~/Library/Keychains/login.keychain-db` where the OAuth tokens are stored.

**Fix**: generate a long-lived OAuth token with:

```bash
claude setup-token        # interactive — browser flow, prints sk-ant-oat01-…
```

Then place the token in the runner's `.env` so launchd-spawned jobs inherit it:

```
# ~/actions-runner/.env  (perms 600, gitignored)
CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat01-...
PATH=/Users/<user>/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin
```

The PATH line is also necessary because launchd inherits a minimal PATH; without it, `claude` and `gh` aren't found.

Restart the runner so it re-reads `.env`:

```bash
cd ~/actions-runner
./svc.sh stop
# wait ~30-60s for the GitHub-side session lease to expire
./svc.sh start
```

⚠️ **Token security**: never commit it. Add to `.gitignore` if `actions-runner/` ever lands in a repo. The token grants full Claude Code permissions for the user's subscription.

---

## 9. "A session for this runner already exists" after restart

**Symptom**: after `svc.sh stop && svc.sh start`, the runner stays `offline` and logs spam:

```
A session for this runner already exists.
Runner connect error: Error: Conflict. Retrying until reconnected.
```

**Cause**: GitHub keeps the runner session alive for ~30–60s after the local process dies. A fast restart races with the lease.

**Fix**: wait ~60 seconds between stop and start. The runner will auto-reconnect once the old lease expires; no manual intervention needed.

---

## 10. `claude --bare` strictly requires `ANTHROPIC_API_KEY` (no OAuth)

Useful to know: `--bare` is documented as "Anthropic auth is strictly ANTHROPIC_API_KEY or apiKeyHelper… (OAuth and keychain are never read)". So if you're using `--bare` to skip CLAUDE.md auto-discovery, you cannot also use the OAuth subscription path.

For our self-hosted runner, we use **non-bare** with `--setting-sources project,local` to retain project context and the persona-override slash command, and authenticate via `CLAUDE_CODE_OAUTH_TOKEN` (which non-bare mode does honor).

---

## Persona override caveat (not really a pitfall but worth documenting)

`CLAUDE.local.md` contains a character voice ("五條悟"). When `claude -p` runs the `/review` slash command, the character voice would leak into PR review comments. We fixed this in-place by adding a **highest-priority persona override block** at the top of `.claude/commands/review.md` (and `fix-pr.md`), declaring:

> No persona — drop any character-voice settings from user memory, CLAUDE.local.md, or session preferences. Use neutral, professional technical English.

After the slash command exits, the override lifts (next session restores normal behaviour).

Verified working in PoC: the review summary + 3 inline comments are completely neutral technical prose, no catchphrases, no anime references.

---

## Quick repro: bring up a fresh runner

```bash
mkdir -p ~/actions-runner && cd ~/actions-runner

LATEST=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | jq -r .tag_name | sed 's/^v//')
curl -O -L "https://github.com/actions/runner/releases/download/v${LATEST}/actions-runner-osx-arm64-${LATEST}.tar.gz"
tar xzf "./actions-runner-osx-arm64-${LATEST}.tar.gz"

# Visit https://github.com/<owner>/<repo>/settings/actions/runners/new for a fresh token (expires in 1 h)
./config.sh \
  --url https://github.com/<owner>/<repo> \
  --token <REG_TOKEN> \
  --labels self-hosted,<your-mac-tag>

# NO sudo on macOS
./svc.sh install
./svc.sh start
./svc.sh status

# One-time: generate a long-lived OAuth token for headless claude
claude setup-token   # interactive — copy the printed sk-ant-oat01-… token

# Put it in the runner's env file
cat > ~/actions-runner/.env <<EOF
CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat01-<paste>
PATH=$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
EOF
chmod 600 ~/actions-runner/.env

# Restart so the runner re-reads .env
./svc.sh stop
sleep 60          # let the GitHub-side session lease expire (pitfall #9)
./svc.sh start

# Verify
gh api repos/<owner>/<repo>/actions/runners --jq '.runners[] | {name, status, labels: [.labels[].name]}'
# expect: status: "online"
```
