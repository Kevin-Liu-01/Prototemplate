# Triage

Move messy incoming work into a clear state machine. Read first; write labels/comments
only after the target tracker and permissions are confirmed.

## Inputs

- GitHub issues / PRs
- Linear issues
- local issue markdown
- support reports
- QA notes

## State Machine

Use repo-specific labels when configured. Otherwise map to:

- `needs-info`: cannot proceed without more data
- `repro-needed`: report is plausible but unverified
- `bug`: verified defect
- `feature`: requested capability
- `task`: maintenance/internal work
- `duplicate`: already represented elsewhere
- `wontfix`: out of scope after explicit rationale
- `agent-ready`: enough context, proof, and acceptance criteria for an agent

## Triage Pass

For each item:

1. Read the report and linked artifacts.
2. Search for duplicates.
3. Verify the claim when practical.
4. Identify missing information.
5. Assign category and state.
6. Write a brief that another agent can execute.

## External pull-request consolidation

When several external PRs appear to address the same symptom, do not triage
them independently first. Cluster by the underlying fix, subsystem, affected
tests, and compatibility boundary. Similar titles are a lead, not proof; inspect
the actual diffs.

For each cluster:

1. Identify the smallest technically correct base or salvageable combination.
2. Record every contributor and which code, diagnosis, test, or reproduction
   they supplied.
3. Recommend one landing path: select one PR, ask one author to consolidate, or
   create an owner-authored salvage that preserves credit.
4. Show the dry-run plan, including which sibling PRs would close and the exact
   credit/comment language.
5. Only after explicit approval, land or request the consolidated change, verify
   it, credit all material contributors, and close siblings as superseded.

Never close a competing PR merely because another opened first or has a cleaner
description. The unit of triage is the underlying fix and its proof.

## Brief Format

```markdown
Summary:
Evidence:
Reproduction / verification:
Likely owner:
Recommended label/state:
Agent-ready next step:
Blocked on:
```

## Safety

Do not close, label, or comment on external trackers without permission. Provide a dry-run
table first unless Kevin explicitly asks for live mutation.

## References

- Read `AGENT-BRIEF.md` when turning a messy report into a handoff-ready issue.
- Read `OUT-OF-SCOPE.md` before closing an enhancement as `wontfix` or deduplicating rejected requests.

## Related Skills

- `to-issues` when a plan needs new tickets.
- `gh-address-comments` for PR review comments.
- `recent-code-bugfix` for recent regression hunting.
- `diagnosing-bugs` when verification requires a repro loop.

Upstream: `github.com/mattpocock/skills/skills/engineering/triage/SKILL.md`
at `5d78bd0903420f97c791f834201e550c765699f8`.
