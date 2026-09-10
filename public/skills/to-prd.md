# To PRD

Synthesize what has already been discussed. Do not restart the interview unless a
load-bearing requirement is missing.

## First Move

1. Read the current conversation context, linked docs, and any prototype findings.
2. Search for an existing PRD/spec/plan to update.
3. Choose an output location:
   - app repo: `docs/prd/<slug>.md`, `docs/specs/<slug>.md`, or the repo's existing convention
   - `kevin-wiki`: `plans/<slug>.md` or `wiki/inbox/prds/<slug>.md`
   - issue tracker: only if Kevin explicitly wants GitHub/Linear writes

## PRD Shape

```markdown
# <Feature / Product>

## Problem

## Solution

## User Stories

## Implementation Decisions

## Testing Decisions

## Out Of Scope

## Open Questions

## Timeline
```

Use product language, not stale file-path predictions. Include code snippets only when a
prototype produced a precise decision that prose would blur.

## Testing Decision

Name the highest honest seam for proof: API route, CLI, UI flow, public function,
integration test, or browser check.

## Related Skills

- `grill-with-docs` before PRD when alignment is still fuzzy.
- `prototype` when a PRD question needs evidence.
- `to-issues` after PRD when it is ready to execute.

Upstream: `github.com/mattpocock/skills/skills/engineering/to-spec/SKILL.md`
at `84fdeffd12f2ee307994d1eb6feb48173b6e0502` (MIT), adapted to Kevin's local-first authority model.
