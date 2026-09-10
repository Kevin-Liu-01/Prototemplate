# To Issues

Convert a plan into tracer-bullet issues: thin vertical slices through every relevant
layer, each independently demoable.

## First Move

1. Read the PRD/spec/plan in full.
2. Identify the user-visible capabilities and the proof seam.
3. Search existing issues/plans to avoid duplicates.
4. Choose output:
   - GitHub/Linear only when Kevin explicitly wants writes
   - otherwise `plans/issues/<slug>.md` or repo-local `docs/issues/<slug>.md`

## Slice Rules

- Prefer many thin issues over a few thick ones.
- Avoid horizontal tickets like "write all tests" or "build backend".
- Each issue must include its own proof.
- Give every issue explicit blocking edges. The execution frontier is the set of open issues whose blockers
  are complete; reject dependency cycles before publishing.
- Mark `AFK` when an agent can execute without human input.
- Mark `HITL` when product, taste, credentialed, or irreversible judgment is needed.

Wide mechanical refactors are the exception to ordinary vertical slicing. Use **expand–migrate–contract**:
add the new form without breaking the old one, migrate callers in independently green batches, then remove
the old form only after every batch. If no batch can remain green by itself, use an integration branch and a
final integrate-and-verify issue rather than pretending each partial migration is deployable.

## Issue Template

```markdown
## <Issue Title>

Type: AFK | HITL

Outcome:
Scope:
Out of scope:
Implementation notes:
Proof:
Dependencies:
Status: ready-for-agent | blocked
```

## Related Skills

- `to-prd` for the spec source.
- `wayfinder` when the decisions are not yet clear enough to become implementation issues.
- `tdd` for implementing each slice.
- `agent-iteration-loop` for execution.
- `issue` when creating a GitHub issue is explicitly requested.

Upstream: `github.com/mattpocock/skills/skills/engineering/to-tickets/SKILL.md`
at `84fdeffd12f2ee307994d1eb6feb48173b6e0502` (MIT), adapted to Kevin's local-first authority model.
