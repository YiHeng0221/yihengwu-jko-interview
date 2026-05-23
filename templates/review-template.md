# Review Entry Template

Append to `docs/REVIEWS.md` after each cross-agent review pass.

```markdown
## RR-NNN — <PR title>
- PR: #<num>
- Date: YYYY-MM-DD
- Reviewer (first): <model>
- Reviewer (cross-agent): <model>
- Verdict: pass | changes-requested | human-needed
- Findings: 🔴×N · 🟡×N · 🟣×N
- Cross-agent agreement: full | partial | divergent

### Key concerns
- <one line>
- <one line>

### Disagreements between reviewers
- <file:line> — first said X, second said Y. Resolution: <how it landed>

### Round history
- Round 1: YYYY-MM-DD — pass | changes-requested
- Round 2: YYYY-MM-DD — pass | changes-requested
- Round 3: YYYY-MM-DD — pass | changes-requested | human-needed
```

## Notes for the second reviewer

- Read the diff *first*, before reading the first reviewer's findings.
- Take note of anything the first reviewer missed — that's where cross-agent value comes from.
- If you agree on everything, say so ("Cross-agent agreement: full"). That's still useful.
- If you disagree, be specific: file:line + concrete counter-argument. Don't say "I think it's fine" — say "spec.md:L34 supports this layering".
- Don't re-litigate style. 🟡 disagreements are not worth a back-and-forth.
