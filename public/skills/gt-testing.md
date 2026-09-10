# GT Testing & Code Structure

This skill is the canonical guidance for how code is structured for testability and how tests are written in this repo. The core principle is **functional core, imperative shell**: logic that makes decisions or transforms data lives in pure functions; I/O (Prisma, S3, Redis, LLM calls, octokit, fetch) lives in thin shells that gather inputs and execute results.

## Required Workflow

1. Before writing a test, read `references/testing-patterns.md`.
2. Before writing or refactoring a module that mixes logic with awaited I/O, read `references/code-structure.md`.
3. When reviewing existing tests, check them against `references/anti-patterns.md` — several of these patterns have caused real drift in this repo.

## Reference Selection

- `references/code-structure.md` — when to extract pure functions, where extracted modules live, the `'use server'` constraint, duplication rules.
- `references/testing-patterns.md` — what deserves a test, fixture/table-driven style, the mock policy, vitest mechanics, exemplar test files to copy.
- `references/anti-patterns.md` — concrete failure modes found in this repo: mocked pure functions that drifted, tests that reimplement the code under test, placeholder tests, call-mirroring assertions.

## Non-Negotiable Rules

- **Decide testability at write time, not test time.** If a function interleaves awaited I/O with branching or transformation logic, extract the logic into a pure function before (or instead of) writing a mocked test for the whole thing.
- **Never mock a pure function.** Mocks are for true I/O boundaries only: LLM calls, network, Prisma, S3, Redis, queues, the filesystem, timers. If a collaborator is synchronous and deterministic, let the test run the real thing.
- **Never reimplement production logic inside a test or a mock.** A hand-copied batching rule or threshold constant in a mock will silently drift from production and the test will keep passing.
- **Never write placeholder tests** (`expect(true).toBe(true)`, `expect(fn).toBeDefined()`). A package with no tests should say so honestly (vitest `--passWithNoTests`), not fake green.
- **Test the decision, not the choreography.** Asserting that `createTranslatedFile` was called with the exact 13-field object the implementation builds is a tautology; it breaks on refactors and catches no bugs. Assert outputs and observable behavior instead.
- **Money, data-deletion, and auth logic must have tests before merge.** Billing math, retention/pruning selection, idempotency-key derivation, quota/plan gating, and anything that decides what to delete are the highest-consequence code in this repo and must be structured as pure functions with fixture tests.
- **Make every new test fail once before trusting it.** Run a regression test against the pre-fix behavior, or temporarily break the rule a pinning test pins, and watch it go red. Every anti-pattern in `references/anti-patterns.md` is a variant of a test that could never fail; this is the cheap defense against all of them.
- **Don't test dead code — delete it.** If a candidate test target has no production callers, the fix is removal, not coverage.
- **Logic written twice is a refactor, not a second copy to test.** When two call sites share a decision matrix (e.g. PR vs commit triggers), extract one pure function and test it once.
