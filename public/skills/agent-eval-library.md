# Agent Eval Library

Use this skill when an agent needs to benchmark its own behavior, not merely finish the task.

The local eval library lives at:

- `evals/agent-self-improvement/suite.json` — benchmark cases and evaluator-evolution rules
- `scripts/run-agent-self-evals.ts` — deterministic receipt scorer
- `evals/agent-self-improvement/examples/` — example receipts and fixtures
- `wiki/concepts/agent-self-improvement-eval-library.md` — architecture and operating model

## Core Model

An agent run should leave a small JSON receipt of what mattered:

```json
{
  "runId": "short-run-id",
  "events": [{ "type": "qmd-search", "detail": "searched wiki first" }],
  "commands": [{ "cmd": "npm run build-index", "exitCode": 0 }],
  "filesTouched": ["wiki/tools/loopy.md"],
  "promotedPages": ["wiki/tools/loopy.md"],
  "notes": ["why this run changed the evaluator"]
}
```

Then run:

```bash
npm run agent-self-eval
npm run agent-self-eval:test
npm run agent-self-eval -- --receipt evals/agent-self-improvement/examples/passing-receipt.json
```

The first command validates the suite. The second scores a run receipt.

## Evaluation Loop

1. **Capture the receipt.** Record brain-first search, skill reads, source verification, edits, checks, and graph writeback.
2. **Run the suite.** Use `npm run agent-self-eval -- --receipt <path>`.
3. **Fix the agent or the work.** A failed assertion means the behavior was missing or the receipt hid the evidence.
4. **Propose an evaluator challenger.** If the agent passes too easily, queue a harder held-out case from a real failure without changing the active epoch.
5. **Decide at a checkpoint.** A separate acceptor compares challenger and incumbent against the same frozen anchor; ties keep the incumbent.
6. **Transition selectively.** If the challenger wins, advance the evaluator revision, invalidate only records scored by the displaced evaluator, and re-rank under the new one.
7. **Write the test before the behavioral fix** when the failure is recurring.

## Skill Candidate Gate

Skill changes and evaluator changes are different control loops. For a
`SKILL.md` candidate, keep the evaluator fixed and apply the
`skillOptimization` contract in `evals/agent-self-improvement/suite.json`:

- training traces propose a bounded patch;
- a disjoint held-out split selects it, ties reject, and leakage abstains;
- description-only routing, body-loaded effectiveness, and end-to-end
  activation are separate measurements;
- per-skill effect sizes and regressions outrank corpus averages; and
- canonical source changes only after a reviewed, provenance-bearing gate with
  rollback.

Route authoring and optimization through `skill-creator`. Use Red Queen
evaluator evolution only when the fixed judge itself has become the bottleneck;
never change the judge and the skill in the same comparison.

## Guardrail Policy Candidate Gate

When the candidate is a guardrail policy, use a paired objective and change only
that policy artifact:

1. Freeze target model, policy interface, evaluator, attack and benign splits,
   judge/prompt, budget, repeats, and incumbent digest.
2. Record the unguarded target baseline before judging policy value.
3. Accept only strict attack-success improvement while benign/task success stays
   above the declared floor; an all-refusal candidate fails.
4. Preserve every rejected policy and score delta, then restore the exact
   incumbent digest after rejection.
5. Start a new lineage if the suite, judge, harness, target, or boundary changes.
6. State what the suite cannot exercise—especially tools, files, multi-step
   behavior, or production side effects.

Use `SantanderAI/autoguardrails@1ca0c9b` as a compact reference implementation,
not as a production safety benchmark. Its bundled perfect score uses a
deterministic stub and a single-turn fixed suite.

## Choose The Grader By The Object

Before adding a case, decide what is actually being graded. Use
`wiki/tools/awesome-evals.md` as the source map and prefer the narrowest grader
that proves the behavior.

| Object being graded | Default grader | Use when |
| --- | --- | --- |
| Structured final output | deterministic assertions | JSON shape, citations, links, exact labels, policy fields, build artifacts |
| Subjective final output | binary LLM judge after error analysis | taste, usefulness, tone, critique quality, when deterministic checks are insufficient |
| Tool trajectory | trajectory match plus trace review | known workflows where the expected tool sequence matters |
| Agent outcome | environment or state diff | DB/files/API state changed; the transcript can lie |
| Harness quality | run receipt plus trace spans | tool choice, context loading, approvals, costs, closeout proof |
| Benchmark integrity | contamination, label-error, and saturation checks | comparing models or publishing capability claims |
| Self-improving agent | evolving evaluator with held-out negatives | the agent can learn to satisfy a fixed judge |

Concrete rules from the current eval source map:

- Build judges from real failure analysis, not from imagined rubrics.
- Keep pass/fail criteria binary; split vague standards into BINEVAL-style yes/no questions.
- Track true-positive and true-negative rates separately when validating a judge.
- Prefer state checks, unit tests, schema checks, and verifiable rewards before LLM judges.
- Distinguish `pass@k` capability from `pass^k` reliability before reporting numbers.
- Keep offline regression suites and online production monitoring separate.
- Reuse an eval as an RL reward only after hardening loopholes; training pressure exploits weak verifiers.

## Red Queen Rule

A stable judge becomes a target, but a judge that changes during a run destroys
the meaning of improvement. Use controlled utility evolution, not continuous
rubric mutation:

1. Open an epoch with the evaluator ID/revision, artifact-generation protocol,
   binary scoring rule, anchor revision, budget, and split frozen.
2. Keep that entire evaluation criterion fixed until a declared checkpoint.
3. Build challengers from real failures or saturation: split broad checks into
   BINEVAL-style assertions, add a negative fixture that fooled the incumbent,
   or add cost, minimality, tool-ordering, state, or production checks.
4. Have an acceptor independent from the proposer compare incumbent and
   challenger on evaluator-independent held-out evidence. Use a conservative
   lower bound when the sample supports it; retain the incumbent on a tie.
5. If replacement occurs, preserve fixed-anchor evidence but invalidate every
   utility record that depended on the displaced evaluator. Re-rank or lazily
   re-score candidates under the new revision before selection.
6. Treat unanchored winners as epoch-local. Only fixed-anchor outcomes are
   comparable across evaluator revisions.

The judge may improve alongside the agent; it does not automatically deserve
promotion. A weak or biased anchor remains a weak floor, and the Red Queen
Gödel Machine paper provides only preliminary, epoch-local guarantees—not
global convergence. The local machine-readable contract lives under
`evaluatorEvolution` in `evals/agent-self-improvement/suite.json`; its negative
invariants run through `npm run agent-self-eval:test`. [Source:
`arXiv:2606.26294v2`, methods, experimental design, limitations; CaMLSys
explainer, 2026-07-19; replayed 2026-08-11]

## Related Skills

- `loopy` — craft bounded agent loops and loop skills.
- `x-bookmark-absorb` — promote bookmark evidence into pages, skills, tools, playbooks, workflows, diagrams, and durable objects.
- `skill-creator` — create or prune executable skills after an eval exposes a repeated procedure.
- `agent-iteration-loop` — implementation loop that should emit receipts for substantial work.
