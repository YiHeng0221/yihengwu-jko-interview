# Representative AI Prompts

> 2–5 curated AI conversations from the project's development. The goal is for an interviewer (or future maintainer) to understand *how you wielded AI*, not just *that you did*.

## What to capture

Pick prompts where the **AI got something wrong** or where **you steered it back** after a bad first answer. Those are the conversations that show judgement.

Anti-patterns (don't capture these):
- AI generated boilerplate and you accepted it as-is — boring, not illuminating
- A one-shot success — doesn't show any judgement
- Long, low-signal back-and-forth — trim it

Good captures:
- AI proposed solution A; you pushed for B; you ended up at C (better than both)
- AI introduced a bug; cross-agent reviewer caught it; you applied the fix
- AI hallucinated an API; you grounded it with docs; the corrected version shipped
- AI hit a wall; you reframed the problem; AI then unblocked

## Format

Each prompt log is `0N-<topic>.md`:

```markdown
# Prompt 0N — <topic>

- **Date**: YYYY-MM-DD
- **Agent**: claude-opus-4-7 / claude-sonnet-4-6 / codex-cli / ...
- **Context**: 1–2 sentences on what we were trying to do.
- **Outcome**: What shipped.

## Conversation summary

A 5–10 line narrative of how the conversation went. Pull quotes when they're notable; paraphrase the rest.

## Lessons / takeaways

- What worked
- What didn't
- What you'd do differently next time

## Artifacts

Links / file paths to the resulting commits, PRs, ADRs.
```

## Index

<!-- 每個專案 append 自己的 prompt log 到這。範例：

| # | Topic | Date |
|---|-------|------|
| 01 | <topic>（→ ADR-XXXX 或 retro action item） | YYYY-MM-DD |

-->

(無 entries — 新專案啟動後填入)

## Privacy

Strip:
- Internal URLs
- API keys / tokens (the secret scanner should catch these but check manually)
- Personal information unless this is your own personal project

Keep:
- Specific reasoning, technical details, model names, dates
