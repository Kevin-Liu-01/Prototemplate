# Prototype

A prototype is throwaway code that answers one question. Keep the answer; delete or
quarantine the code.

## Pick A Branch

**LOGIC prototype**: use for state machines, business rules, scheduling, pricing,
authorization, parsing, or data flow. Build a tiny CLI/script/harness that can be run
with fixture inputs.

**UI prototype**: use for interaction, layout, motion, density, or taste. Build several
radically different variants behind a local-only toggle such as `?variant=a`, a demo
route, or a floating dev control.

Read `LOGIC.md` for the terminal/state-machine prototype branch. Read `UI.md` for the
multi-variant browser prototype branch.

## Guardrails

- State the single question before writing code.
- Put prototypes under `prototypes/`, `experiments/`, `app/prototypes/`, or a clearly
  local demo route.
- Do not let prototype code become production by inertia.
- Record the answer in a PRD, ADR, issue, or notes file.
- Remove or quarantine prototype code before shipping unless Kevin explicitly promotes it.

## Output

```markdown
## Prototype Result

Question:
Answer:
Variants tried:
Evidence:
Decision captured in:
What to delete:
```

## Related Skills

- `grill-with-docs` to discover which question deserves prototyping.
- `to-prd` to absorb the answer into a product spec.
- `frontend-design` / `web-design-engineer` for production UI after the prototype.

Upstream: `github.com/mattpocock/skills/skills/engineering/prototype/SKILL.md`
at `5d78bd0903420f97c791f834201e550c765699f8`.
