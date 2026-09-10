# Agent Iteration Loop

How an agent should take work from implementation to validation to review to
follow-up. The loop is: **isolate -> understand -> implement -> clean ->
validate -> verify live -> review -> triage CI -> ship -> follow up.** Skip phases only for
genuinely trivial one-liners.

This skill is process, not domain. For *what* tools to use per task, defer to
`wiki/meta/capability-routing-map.md` and `SKILL-RESOLVER.md`. For *how* to
write the code, defer to the relevant `style/*` guide.

## Operating principles (apply throughout)

- **Be a surgeon, not a painter.** Smallest correct change. Deleting code beats
  adding it. Match the surrounding style.
- **Always be suspicious.** Never report green when it is not. Distinguish *your*
  failures from pre-existing/systemic ones and say which is which.
- **Empirical over assumed.** Reproduce before patching; verify mechanism claims
  by running them, not by reading config.
- **Never push without explicit approval. Never modify prod DB/infra. Never
  silently change growth/marketing-conversion or ad surfaces** — flag those as
  owner decisions instead.
- **Minimum diff, ASCII only, no em dashes** in code/comments/commits.

## Phase boundaries and session transitions

At the end of a meaningful phase, select the next context shape deliberately.
The commands differ by harness; the decision contract does not:

| Route | Select when | Required handoff state |
| --- | --- | --- |
| **Continue** | The next step is bounded and the current context still has enough useful attention. | Keep working; do not create ceremony. |
| **Fresh session** (`clear` where supported) | The next task is independent and current exploration is disposable. | First write any durable decision, artifact, or unresolved owner that must survive. |
| **Handoff** | The context matters and the recipient, harness, directory, project, or human changes. | Reference existing specs, commits, diffs, tests, and decisions; summarize only uncodified state. |
| **Delegate** | A bounded AFK branch can run independently while the parent retains synthesis and final proof. | Give scope, evidence inputs, output contract, stop condition, and authority; use only when delegation is authorized. |
| **Compact** | The same owner must continue and most current context remains relevant, but the session needs a smaller working set. | Preserve exact goals, decisions, frontier, changed artifacts, commands, proof, and blockers; omit dead exploration. |

Context preservation is not durable learning. Before discarding or compacting a
session, write lasting decisions and procedures to their canonical owners. A
handoff or summary may point to those owners but must not become a competing
copy. [Source: X/@mattpocockuk `2079879414297330146` visual decision tree;
X replies `2072339955020660754` and `2072340652797571568`, reviewed 2026-08-12]

## Phase 1 — Isolate

- Work in a **git worktree per task** off the right base, never on the main
  checkout: `git worktree add -b <type>/<topic> ../wt/<topic> origin/dev`.
- Stacked/dependent work branches from its dependency; independent work from dev.
- Before starting any long-running process, **read the terminals folder
  metadata** (`head -n 10 ~/.cursor/projects/*/terminals/*.txt`) and check ports
  to avoid duplicating a server already running.
- Call `SetActiveBranch` after creating/committing on a new branch.

## Phase 2 — Understand

- **Read before editing.** Open the files, trace the call graph, map the blast
  radius (who imports/consumes what you will change).
- For breadth, dispatch parallel **`explore` subagents** instead of serial greps;
  for needle lookups use Grep/Glob directly.
- If the blast radius is growing faster than expected, pause and report status
  before continuing. Small changes should stay small; large changes need a
  deliberate split, not silent scope creep.
- Respect precedent: working code encodes constraints you may not see. Learn them
  before changing them.

## Phase 3 — Implement

- Build only what has a real consumer now; no speculative abstractions.
- Reuse the existing path/helper before adding a new one.
- Keep functions < 70 lines, files < 500, nesting <= 3, args <= 5. If a name has
  "and", split it.

## Phase 4 — Clean

Run a separate behavior-preserving cleanup pass before verification. Re-read the
diff in context and remove duplication, dead branches, debug scaffolding,
needless abstractions, verbose names, and comments that only restate the code.
Prefer the repository's existing helper and local idiom over a new abstraction.

Cleanup does not mean "make the checks green." Do not mix it with feature
changes, formatter churn, test repair, or broad refactoring. If simplifying the
diff would change behavior or expand scope, leave it alone and record the
follow-up. Verification starts only after the cleanup diff is stable.

## Phase 5 — Validate (gradient, cheapest first)

Run the **most targeted check first**, then broaden:

```
typecheck (fast)  ->  lint (changed files)  ->  format --check
   ->  targeted unit/inline tests  ->  module tests  ->  build / full suite
```

- After substantive edits, run `ReadLints` and the project's typecheck/lint on
  the **files you touched**, not the whole repo.
- Add an **invariant test** for any new contract or anticipated change (e.g. a
  test that the parser tolerates a field the backend is about to drop).
- Under `exactOptionalPropertyTypes`, optional members are `foo?: T` (never
  `| undefined`); spread conditional keys (`...(x ? { x } : {})`).

## Phase 6 — Verify live (servers + browser)

- **Reuse a running dev server** if the terminals folder shows one on the port;
  otherwise start it (`block_until_ms: 0` for long-runners) and do one smoke read
  of its output to confirm it came up.
- Verify UI changes in a **real browser**, routed by test type
  (`wiki/meta/capability-routing-map.md`): browser-harness / agent-browser for agent-driven visual
  checks, Playwright for deterministic CI gates, Chrome DevTools MCP for computed
  styles. Screenshot the result and embed it for the user.
- For a **first-time-user beta readiness** lens (can a new user understand the
  flow and recover when it fails?), use the **beta-dx-walk** skill: it walks the
  critical journeys, logs friction as bugs, and returns a ship/hold verdict.
- **Process hygiene:** you own every process/browser you spawn. Tear down test
  runners, watchers, and pages when the task that needed them is done (see
  `cleanup-terminals-browsers`). Never kill the IDE, agent runtime, or shared MCP
  servers.

## Phase 7 — Review (use other skills)

- Run a fresh **review pass with subagents**, in parallel and read-only:
  `code-reviewer` for bugs/silent failures, `style-reviewer` for STYLE.md,
  `gstack-review` for production-grade depth, `gstack-design-review` /
  `web-design-guidelines` for UI usability and accessibility.
- For explicitly large orchestration work, use a planner/worker/verifier shape:
  the planner decomposes, workers make bounded edits, verifiers run the checks
  and feed failures back into the next worker. Do not invoke this fan-out
  autonomously for ordinary tasks.
- Run the relevant **doctor(s)** after large edit sessions (`doctor-enforcement`,
  `react-doctor`, project `scripts/doctor.ts`).
- **Resolve bot findings** (Bugbot / Greptile). For each, classify:
  - **Actionable & mine** -> fix, re-verify, push.
  - **Stale** (the file/prop was deleted/renamed since the bot ran) -> note it.
  - **Pre-existing / not mine** (original author's code, repo baseline) -> flag,
    do not silently absorb a large unrelated fix into a feature PR.
  - **Owner decision** (growth/marketing conversions, prod policy) -> flag with
    the owner, do not change unilaterally.

## Phase 8 — Triage CI honestly

When a check is red, find out *why* before claiming you can fix it:

- Pull the failing job log; identify the failing **step** (e.g. lint vs the
  actual test, "Environment bootstrap" vs a real assertion).
- Decide: **introduced by my diff** vs **pre-existing repo-wide** (warning-count
  caps, broken seeds, broken schema-convergence checks, baseline drift).
- Fix what is yours. For systemic failures, **say so plainly** and propose a
  separate repo-health PR; do not pretend a feature PR can turn them green, and
  do not pad the feature PR with unrelated repo fixes.

## Phase 9 — Ship

- **Small PRs:** target < 500 added lines, **one concern each**. Split large work
  (scratch branch for exploration, clean branch for the minimal diff) and stack
  dependent PRs. A migration ships separately from the UI that needs it.
- **Conventional commits**, terse, imperative, no "and", no AI attribution.
- The **PR body documents what shipped and why**, the decisions made and their
  rationale, the test plan actually run, and any deferred items with owners. It
  must match the final diff.
- Never push without explicit approval. Use `--force-with-lease`, never `--force`
  to protected branches. Do not use `git checkout` or `git restore`; for writes
  on another branch, create an isolated worktree instead of switching the shared
  checkout.

## Phase 10 — Follow up

- Post a comment documenting the hardening/decisions on each PR; resolve every
  open question you raised earlier rather than leaving it dangling.
- Surface blockers the user must decide (owner decisions, systemic CI) clearly,
  with a recommendation.
- Propose wiki updates when a non-obvious lesson, pattern, or postmortem emerges.

## Pre-ship checklist

```
- [ ] Worked in a worktree; reused/owned every server and browser; cleaned up
- [ ] Read the code + mapped blast radius before editing
- [ ] Minimal diff; matched surrounding style; added invariant tests
- [ ] typecheck + lint(changed) + format + targeted tests all green locally
- [ ] UI verified in a real browser (screenshot shared) when UI changed
- [ ] Review skills run; Bugbot/Greptile findings fixed or classified
- [ ] CI reds triaged: mine fixed, systemic ones reported (not absorbed)
- [ ] PR < 500 lines, one concern, conventional commit, body documents why
- [ ] No push without approval; no prod/growth/ad changes made unasked
- [ ] Open questions from the thread resolved or flagged with an owner
```
