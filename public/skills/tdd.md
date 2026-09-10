# TDD

Write behavior tests through public interfaces, then implement the smallest vertical
slice that turns the test green.

## Rule

No horizontal slicing. Do not write every test first and then all implementation.
Use one thin, demoable slice at a time:

1. choose the next behavior
2. write one red test at the highest honest seam
3. run it and show red
4. implement the smallest green path
5. refactor without changing behavior
6. repeat

## Good Tests

Good tests verify what the system does:

- public API, route, CLI, function, or UI surface
- real code paths
- stable behavior wording
- few mocks, only for true external boundaries

Bad tests verify implementation:

- private methods
- internal collaborators
- database state when the public interface is the contract
- mocks that only prove the test setup

Read `tests.md` when choosing the test seam or reviewing test quality. Read
`mocking.md` before adding mocks. Read `refactoring.md` after the green step when
deciding what to clean up.

## Slice Format

For each slice, record:

| Slice | Red test | Green change | Refactor | Proof |
| --- | --- | --- | --- | --- |

Mark slices:

- `AFK`: agent can implement and verify alone
- `HITL`: needs human product/taste/authority input

## Related Skills

- `tests` for general test writing.
- `diagnosing-bugs` for repro-first debugging.
- `agent-iteration-loop` for execution cadence.
- `no-sus-code-doctor` for pre-ship review.

Upstream: `github.com/mattpocock/skills/skills/engineering/tdd/SKILL.md`
at `5d78bd0903420f97c791f834201e550c765699f8`.
