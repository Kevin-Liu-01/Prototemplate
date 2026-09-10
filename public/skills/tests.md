# Tests

A good test states the property the system must preserve. It should read like a
small piece of design documentation with executable consequences.

## Start With The Invariant

When something breaks, the natural sequence is: reproduce the bug, write the
failing test, patch the code, ship. That produces tests that describe what
broke once, not what must always be true.

Before writing a test, answer:

```text
What system property was violated?
```

Write the test for that property, not for the incident that revealed the bug.

Good names:

```text
invariant_failed_operation_does_not_change_visible_state
invariant_retry_does_not_duplicate_side_effects
invariant_transfer_is_atomic_to_observers
design_unrecognized_state_returns_error_not_panic
```

Weak names:

```text
test_issue_123_repro
test_timeout_case
test_special_case
```

## Naming

The test name is a contract. It should be readable as a sentence that could
appear in an architecture doc.

- `invariant_*`: A property that must always hold. This is the default prefix.
- `design_*`: An intentional policy decision that could reasonably go another way.
- No prefix is needed for trivial pure-function tests such as round trips or
  math helpers.

Bad:

```text
test_setenv_rejection_continues_session
run_once_continues_after_per_workspace_status_patch_failure
test_list_excludes_image_version_from_response
```

Good:

```text
invariant_session_survives_guest_env_rejection
invariant_single_workspace_failure_does_not_block_node_reconciliation
invariant_internal_fields_are_not_exposed_in_public_api
```

## Choose The Smallest Honest Layer

- Pure logic: use a unit test.
- State transitions: use a model or property test.
- Interface contracts: test the real boundary.
- User-visible behavior: use an integration or end-to-end test.
- Race, lifetime, or ordering properties: force the contested path, then run
  the appropriate stress or sanitizer pass.

Smallest honest means the test can fail for the bug class you care about. A
helper test is not enough when the bug is in boundary ordering. An end-to-end
test is too expensive when the property is a pure merge rule.

## Generalize The Body

The test body should exercise the general case, not only the specific trigger
that found the bug.

Bad:

```text
Send a 409 Conflict response, assert the loop continues.
```

Good:

```text
Send any per-workspace error for workspace A, assert workspace B still reconciles.
```

If a specific error matters, keep the invariant name and put the concrete
scenario in a short comment inside the test body. The name stays stable; the
implementation detail stays local.

## Make The Test Hard To Misread

- Name the invariant in the test name.
- Keep one reason to fail per test.
- Assert externally visible behavior when possible.
- Use realistic fakes. A fake that always returns success is not a model.
- Prefer table cases for boring variation.
- Prefer a tiny reference model for range maps, state machines, and overlays.
- Delete duplicates that prove the same property at the same layer.

When a bug exposes an unrealistic fake, fix the default fake behavior instead
of adding a one-off fake. The fake should be a small model of reality, not a
mock that returns success for everything.

Failure output should be terse and useful:

```text
FAIL  failed operation visibility (got changed, want unchanged)
```

## Prove The Test Earns Its Keep

For a bug fix, run the new test before the fix when feasible. Report how many
tests were red before the fix and which command makes them green after.

When changing tests, report:

- tests added and tests removed
- the invariant each new test covers
- red-before-fix results, if available
- final command output summary

## Use Coverage As A Map

Coverage does not prove correctness. Use it to find unvisited code, then write
tests for the missing behavior.

Fuzzing is useful when the input space is large and hand-written examples miss
cases. Property tests are useful when a simple model can say what every result
must look like.

## Litmus Tests

Before committing a test, ask:

1. Could this test name appear in an architecture doc?
2. Would this test have caught the bug if it existed before the bug was introduced?
3. If internals are refactored but external behavior stays the same, does the test pass?
4. Does the test name contain an HTTP status code, error message, or internal function name?

If the answer to 4 is yes, elevate the name to the invariant.

<!-- auto-promoted from skills/engineering/dedalus-tests by sync-dedalus on 2026-06-13; review & generalize any Dedalus-specific references. -->

<!-- folded-skills:auto:start -->
## Folded Skill References

These former standalone skills are bundled here as references to keep the runtime list compact. Load only the reference that matches the user's exact product, framework, or failure mode.

| Former skill | Reference | Description |
| --- | --- | --- |
| `dedalus-tests` | [`references/skills/dedalus-tests/SKILL.md`](references/skills/dedalus-tests/SKILL.md) | Write tests that prove the right invariant at the smallest honest layer. Use when adding, reviewing, deleting, or refactoring tests; choosing test boundaries; turning bug reproductions into invariant tests; or deciding whether coverage, fuzzing, property tests, unit tests, integration tests, or end-to-end tests are appropriate. |
<!-- folded-skills:auto:end -->
