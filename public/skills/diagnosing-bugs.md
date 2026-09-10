# Diagnosing Bugs

The skill is the feedback loop. Do not jump from symptom to theory until there is a
red-capable command that exercises the user's actual bug.

## Phase 1 - Build A Tight Loop

Prefer, in order:

1. failing test at the seam that reaches the bug
2. HTTP/curl script against a running server
3. CLI invocation with fixture input and expected output
4. Playwright/browser script for UI bugs
5. replayed trace, HAR, payload, event log, or fixture
6. throwaway harness around the smallest subsystem
7. property/fuzz loop for intermittent wrong output
8. bisection or differential loop

Completion criterion:

- one command exists
- it can go red on this exact bug
- it is deterministic or has a high pinned reproduction rate
- it is fast enough to run repeatedly
- it is agent-runnable

If no loop is possible, stop and ask for a trace, log, access, or permission to add
temporary instrumentation.

## Phase 2 - Reproduce And Minimize

Run the loop. Confirm it fails for the user's symptom. Then remove inputs, config,
steps, and callers one at a time until every remaining part is load-bearing.

## Phase 3 - Hypothesize

Write 3-5 ranked hypotheses. Each must predict what would change if it were true.
Show the list briefly; proceed if the user is AFK.

## Phase 4 - Instrument

Change one variable at a time. Prefer debugger/REPL over logs. If logging, tag every
temporary line with a unique prefix and remove it before finishing.

## Phase 5 - Fix And Lock

Turn the minimized repro into a regression test when a correct seam exists. If no
correct seam exists, document that as an architecture finding and consider
`codebase-design`.

## Phase 6 - Closeout

Before declaring done:

- original repro is green
- regression test passes or missing seam is documented
- temporary instrumentation is removed
- the correct hypothesis is stated in the final notes

## Related Skills

- `tdd` when the bug can be fixed test-first.
- `counterfactual` when expected behavior needs formal comparison.
- `recent-code-bugfix` when the bug likely came from recent commits.
- `webapp-testing` for browser-visible bugs.

Upstream: `github.com/mattpocock/skills/skills/engineering/diagnosing-bugs/SKILL.md`
at `5d78bd0903420f97c791f834201e550c765699f8`.
