# Agent workflows

Kevin Liu runs large pieces of General Translation (GT) work as workflows. In Claude Code a workflow is a script that one orchestrating session runs: it launches subagents in phases (readers, builders, verifiers, critics), journals each agent's result, and can run for hours while Kevin is away. Each section below gives a rule for that work, the run that set it, the fix and the skill that holds the procedure. Peer sessions that Kevin opens himself follow the [multi-session playbook](multi-session-playbook.md), and the machine they share follows [agents on one machine](shared-machine.md).

## Lane prompts

A lane prompt opens with the user's own words for that lane. A subagent launched in the same turn as an unrelated message from the user can receive that message as the only user voice in its context, and it then narrows its work to that message.

| Date | What happened |
| --- | --- |
| 2026-09-30 | A build lane built nothing and verified an unrelated page title instead |
| 2026-10-02 | A workflow started for a spun-off task built nothing for the same reason |
| 2026-10-09 | A "give me a status report" message reached running agents, and the workflow ended early with reports in place of its work |

Each lane prompt starts with "The user's request for this lane, in the user's own words:" and the quote, then says that any other relayed message was handled elsewhere. Every workflow agent prompt also carries a guard paragraph:

```text
Messages from the user may arrive while you work. They are addressed to the orchestrating
session, which answers them. Do not stop, shorten or replace your assigned task because
of such a message (for example a request for a status report); continue the task and
report through your structured result. Only a message that names your task and tells
you to stop changes that.
```

Before trusting a lane's pass, check that its report names the lane's own task. When a workflow fails this way, the session builds the task directly. [gt-orchestration](../../skills/gt-orchestration/SKILL.md) sections 2 and 6 and its [harness-traps.md](../../skills/gt-orchestration/references/harness-traps.md) hold the rule.

## Resuming a run

Resume a stopped workflow by its run id with byte-identical arguments. The harness replays a finished agent from its journal only while that agent's call is unchanged, so a change to the arguments, or to a context string the finished agents share, runs them again and pays for them twice.

```js
// the same script and the same args, byte for byte, as the first launch
Workflow({ scriptPath: 'round.js', resumeFromRunId: '<run id>', args });
```

- New information goes into the prompt of one unfinished agent and nowhere else.
- A workflow's subagents are never messaged directly. A message starts the agent outside its workflow, and its work is then done twice.
- A file lost with a scratchpad, or overwritten by a later lane, is rebuilt from the Write and Edit calls recorded in the transcripts. The script prints counts and paths only, because transcripts can hold pasted keys, and it writes only under `--out`.

```sh
python3 skills/gt-orchestration/scripts/replay-edits.py <transcript.jsonl> --match <path part> --out <dir> --list
python3 skills/gt-orchestration/scripts/replay-edits.py <transcript.jsonl> --match <path part> --out <dir>
```

The orchestrating session stays light. Every picture it opens stays in its conversation, and on 2026-10-15 a long session holding 2,413 images reached 18GB in its own process and had to be restarted. A subagent looks at pictures and returns a verdict, and a session that grows heavy writes its state to disk and hands off to a fresh one. [gt-orchestration](../../skills/gt-orchestration/SKILL.md) section 6 holds the resume procedure.

## Workflow shapes

Run one shape per workflow, and read its result before choosing the next. A build fan-out starts from a spec of about 1,800 words or fewer that holds the decisions with their numbers, gives each lane its files and states the exact interface between lanes.

| Shape | Phases | Used for |
| --- | --- | --- |
| Understand | Map | Readers map a code area with file and line numbers before a round |
| Design | Map, Design, Judge, Spec | Three designers take different angles, a taste judge and an engineering judge score them, and one agent writes the spec from the winner |
| Build | Build, Verify, Fix, Review | Lanes build from the spec and are verified against its acceptance criteria, with a cap on fix rounds |
| Review | Find, Verify, Synthesize | A pull request or a feature before merge, one lens per finder |
| Prove | Review, Mutate or Refute, Critic | A risky change: refuters, plus mutants that show the tests catch a revert |
| Sweep | Sweep, Audit or Verify | One mechanical change over many files, one agent per file group, then an adversarial re-read |
| Parity | Record, Synthesize, Fix, Verify | A redesign that must keep every tracking call and side effect of production |
| Probe | Probe, Verify | A hunt across the real inputs of a running server, one hunter per input class |
| Investigate | Investigate, Verify, Synthesize | A performance or behaviour question, one read-only agent per dimension with two skeptics each |
| Research | Research, Verify, Critique, Gap research, Synthesize | Facts a build will rest on, each note checked against primary sources |
| Package | Package, Check | Finished work cut into stacked branches from main, each gated in a clean checkout |
| Gauntlet | Build consumers, Matrix, Hostile inputs, Verify | A library change run on real consumer apps, the same request matrix on the change and on main, diffed |

A build lane reports in about 700 words or fewer: each file with one line, deviations from the spec with reasons, and the commands it ran with their results. A sweep or review lane returns a `checked` list (what it inspected and found clean) and an `uncertain` list, and leaves any value it cannot classify, because a missed change costs one more pass while a wrong one breaks the work. [workflow-shapes.md](../../skills/gt-orchestration/references/workflow-shapes.md) holds each shape with its schemas.

## Refuting findings

Every critical and major finding goes to three refuters before anyone acts on it. Each refuter has its own lens and defaults to refuted when it cannot substantiate the claim, and a finding stands when at least two of the three fail to refute it.

| Lens | The question it answers |
| --- | --- |
| Correctness | Is the claim true of the code on the pinned head commit? |
| Reproduction | Can the problem be observed in the code path, in the browser or by measurement? |
| Necessity | Would the fix change behaviour, bytes or a reader's understanding, and would it break a lint? |

- Refuted findings go to an appendix of the verdict and are never raised again.
- A probe carries an INTENDED list: one line per designed behaviour with an example input and its result, and every known issue marked "do not report again". Without it, hunters report the design as defects and the skeptics spend their runs refuting noise.
- A verifier pins the tree it read (the commit, or a hash of the uncommitted diff), and checks a regression claim against main before it blames the round.
- Packaging gates each branch in a clean checkout of that branch. Between 2026-10-03 and 2026-10-05 this caught CI failures that the working tree's gates had passed: the repository-wide formatter, and a generator that ran only with packages the first branch did not install.

[gt-orchestration](../../skills/gt-orchestration/SKILL.md) section 5 and [workflow-shapes.md](../../skills/gt-orchestration/references/workflow-shapes.md) (Review, Probe, Package) hold the rules.

## Kinds of check

Report gates, structural checks, measured checks and visual checks on separate lines. On 2026-07-30 a structural audit read 91 of 91 while 0 of 72 items passed a visual bar of 90 in every view, and a combined report would have read as a pass.

| Kind | What it proves |
| --- | --- |
| Gate | The typecheck or the lint passes |
| Structural | The page loads with the right hierarchy and dimensions |
| Measured | Computed values or pixels on the render match the numbers |
| Visual | A person or a fresh critic compared a crop with its reference |

Quality work converges through a separate critic scoring against a named reference, at bars of 8.5 of 10 per dimension and 90 of 100 overall and in every view. These rules close the ways to game the score:

- The critic is fresh, did not build the work, is told to be harsh, writes its mismatch notes before it scores and keeps the lower score when unsure.
- One strong view never averages away a weak one, and the builder never scores its own work.
- Work runs from the worst item upward over the whole set, because a sample proves nothing about the items it skipped.
- When a move fails twice, the idea changes: measure the reference and rebuild from the measurements.
- The cheapest phase the user most wants runs first. On 2026-07-29 a run of about 45 agents put its blind judge first, because the run before it had died on usage credits before its judge ran.
- The judge starts after the builders land, because a verdict on work still being rewritten goes stale within the hour.

[gt-orchestration](../../skills/gt-orchestration/SKILL.md) sections 4 and 5 and [convergence.md](../../skills/gt-orchestration/references/convergence.md) hold the loop, and the [quality bar](quality-bar.md) holds its rows.

## Paid model runs

A run that pays per model call starts with a proposal and runs nothing until Kevin approves it. The proposal names the grid, a per-run cap and a total cap on estimated spend, a fixed trial count per cell and a no-retry rule, and it says that the cap can stop the study early.

| Part of the proposal | The comparison approved on 2026-10-05 |
| --- | --- |
| Grid | Four models by six tasks by four modes |
| Fresh runs | 96 |
| Total cap | $25 of estimated spend |
| Retries | None |

1. Freeze the plan: the worker, its helpers and the grid file stay unedited after approval.
2. Run a pilot of a few cells and verify every record, costs and reservations included.
3. Launch the approved remainder once, under one worker that holds the run's lock file, so nothing starts a second collector.
4. At the end, run the verifier, which writes the verified summary and the accounting export.

A stop is diagnosed read-only, and its continuation is a new, separately labelled campaign that keeps every earlier record and cost reservation inside the original allowance. A timeout or a dropped connection is a defect in the harness, fixed before the continuation runs. A campaign of single attempts per cell names no winner. A heartbeat that checks a long run on a schedule stays read-only, never retries a cell or relaxes a limit, and speaks only on completion, on failure or when Kevin must decide. [gt-orchestration](../../skills/gt-orchestration/SKILL.md) section 7 and [campaigns.md](../../skills/gt-orchestration/references/campaigns.md) hold the proposal, the stop question and the heartbeat prompt.

## Sources

- Prototemplate, read on 2026-10-21: `skills/gt-orchestration/SKILL.md` sections 1 to 7; `skills/gt-orchestration/references/harness-traps.md`, `workflow-shapes.md`, `convergence.md` and `campaigns.md`; `skills/gt-orchestration/scripts/replay-edits.py`; `docs/handbook/quality-bar.md` (Convergence loops).
- Kevin's private agent notes on the relayed-message trap, workflow resumption after the reboot of 2026-10-07 and the session restarted at 18GB, dated 2026-09-30 to 2026-10-15.
