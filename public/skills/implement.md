# Implement

Implement the work described by the PRD, issue, or ticket. Keep the change scoped to that unit.

## Process

1. Read the PRD/issue and identify the exact done criteria.
2. Inspect the repo's `AGENTS.md`, nearest `SKILL.md`, and any `docs/agents/*.md` created by `setup-kevin-engineering-flow`.
3. Use `/domain-modeling` if terms are ambiguous.
4. Use `/codebase-design` before introducing or moving module seams.
5. Use `/tdd` where possible at pre-agreed seams.
6. Run typecheck and focused tests regularly; run the broadest honest check before finishing.
7. Run the local review gate: `no-sus-code-doctor`, then `autoreview` or `gstack-review` when appropriate.

## Output

- Implemented change.
- Commands run and results.
- Remaining risk or skipped checks.
- Commit only if Kevin explicitly asked for a commit or the current workflow already requires one.

Upstream: `github.com/mattpocock/skills/skills/engineering/implement/SKILL.md` at `5d78bd0903420f97c791f834201e550c765699f8`.
