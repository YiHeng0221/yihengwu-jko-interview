# ADR-0016 — Railway as deploy provider

- **Date**: 2026-05-24
- **Status**: Accepted
- **Deciders**: project owner
- **Related**: Issue#5, Epic#1 (Phase 0), `docs/specs/be-feature-spec.md`, `docs/specs/fe-feature-spec.md`

## Context

This project is a 7-day take-home interview demo: a Fastify 5 BE + React/Vite FE + Postgres 16 (with `pg_trgm` GIN index) stack that needs to be publicly accessible for grading. Requirements for the deploy provider:

1. Host **two Docker images** (BE + FE) as separate services from the same repo.
2. Provide a **managed Postgres 16** instance with `pg_trgm` extension preloaded (or at least installable via migration).
3. Support **GitHub-triggered auto-deploy** on push to `main`, plus a **`workflow_dispatch` hook** for the manual seed step (HARNESS-PITFALLS §C1).
4. Expose **public HTTPS URLs** for both services so CORS whitelisting and the post-deploy Playwright e2e run can target stable hostnames.
5. Stay within free / low-cost tier for a demo that will see < 100 req/day.
6. Minimal configuration overhead — the interview clock runs during setup.

## Decision

Use **Railway** as the sole deploy provider for both the BE service, the FE service, and the managed Postgres database.

## Options considered

### Option A — Railway

- Pros:
  - Single dashboard for BE service + FE service + Postgres in one project; zero cross-platform credential juggling.
  - Managed **Postgres 16** with `pg_trgm` available as a first-class plugin (one-click in dashboard or `railway add`).
  - Docker-native: accepts a `Dockerfile` path per service; no build-system lock-in.
  - Stable `*.up.railway.app` public HTTPS URLs per service — predictable for CORS config and e2e target.
  - `railway run` CLI wraps `workflow_dispatch`-equivalent for one-off scripts (manual seed) without exposing DB credentials in GitHub Secrets beyond `DATABASE_URL`.
  - Usage-based billing; demo traffic costs < $1/month; generous $5 free credit.
  - GitHub integration: push to `main` → auto-redeploy, no extra workflow step needed.
- Cons:
  - Newer platform (founded 2020); smaller ecosystem and community than Heroku/Render/Fly.
  - No built-in CDN for the FE static assets (nginx inside the container serves them); Vercel would be faster globally.
  - Horizontal scaling requires a paid plan; irrelevant for demo.
- Example/Reference: Used in prior experiments in this repo; ADR is formalising the existing choice.

### Option B — Vercel (FE) + Fly.io (BE) + Supabase (DB)

- Pros:
  - Vercel is best-in-class for React/Vite SPA delivery (global edge CDN, instant cache invalidation).
  - Fly.io has persistent volumes, global anycast, and strong container support.
  - Supabase provides Postgres 15/16 with extensions.
- Cons:
  - **Three platforms**, three sets of tokens, three dashboards — multiply the setup and debugging surface.
  - Supabase Postgres extensions require manual enabling via SQL or dashboard; `pg_trgm` is available but not default.
  - Fly.io requires `fly.toml`, secrets management via `flyctl secrets`, and a credit card for non-trivial workloads even under free tier limits.
  - CORS config requires knowing Vercel's deploy URL ahead of time (preview URLs are non-deterministic), making the BE CORS whitelist fragile.
  - Total DX overhead: ~3–4 hours of config vs. ~1 hour for Railway. Not justified for a 7-day demo.
- Example/Reference: Common split-stack production setup; overkill here.

### Option C — Render

- Pros:
  - Similar simplicity to Railway; supports Docker services + managed Postgres.
  - Free tier available.
- Cons:
  - **Free tier has 15-minute cold-start spindown** for web services; Fastify would 503 the first post-idle request. The post-deploy e2e Playwright run would intermittently fail without an explicit warm-up step.
  - Postgres free tier is limited to 90 days, after which it is deleted — unacceptable for a demo that may be revisited after submission.
  - Deploy pipeline is slower than Railway's (~4 min vs. ~2 min for a comparable image).
- Example/Reference: Render docs: "Free instances will spin down with inactivity."

## Why we picked A (Railway)

1. **Unified platform**: one project, one token, one dashboard for all three resources (BE, FE, Postgres) eliminates cross-platform coordination that would consume interview time.
2. **No cold starts**: Railway keeps services running (unlike Render free tier), which is required for the post-deploy Playwright + axe-core e2e run to pass reliably.
3. **`pg_trgm` available out of the box**: the GIN index migration (`CREATE EXTENSION IF NOT EXISTS pg_trgm`) runs cleanly on Railway's Postgres 16 without manual extension whitelisting.

## Consequences

- Positive: deterministic public URLs (`*.up.railway.app`) available immediately after first deploy; CORS whitelist is stable.
- Positive: `DATABASE_URL` injected as a Railway environment variable; Prisma picks it up without additional config.
- Negative: FE static assets are served by nginx inside the container rather than a CDN edge. For a demo < 100 req/day this is imperceptible.
- Negative: Railway's free credit ($5) will be exhausted after ~2–3 weeks of continuous idle; interviewer should not expect the demo to live forever post-submission.
- Neutral: Locks the deploy runbook (`docs/DEPLOY.md`) to Railway-specific CLI commands (`railway up`, `railway run`). Migrating to another provider later means rewriting the runbook but not the application code.

## Revisit when

- The project needs multi-region or edge delivery for real users (then split FE to Vercel + CDN).
- Postgres storage exceeds Railway's plan limits (currently 1 GB on Starter).
- The team adds a Go or Rust service that requires Fly.io's persistent volumes feature.

## How we'll know if this was right

- Post-deploy Playwright e2e against `RAILWAY_STATIC_URL/health` returns HTTP 200 within 30 s of deploy completing (no cold-start failures).
- `pg_trgm` GIN index migration applies cleanly in CI-triggered `prisma migrate deploy` with zero manual intervention.
- Total Railway config time (first deploy to green health check): < 1 hour wall-clock.
