# Paid campaigns and heartbeats

Detail for section 7 of `gt-orchestration`. The forms come from model comparison campaigns Kevin approved in October 2026 (a personal project; the method transfers to any GT work that pays per model call, such as choosing a model for an assist feature) and from the cost rules in the gt-cloud memory notes. Spend caps are estimates of model spend, and the account a cost lands on is checked before the run.

## The proposal

Ask one question with the recommended option first. A proposal holds:

- the grid: models by tasks by conditions, and the count of fresh runs it makes;
- the per-run cap and the total cap on estimated spend, described as a hard ceiling that can stop the study early;
- the fixed trial count per cell and the no-retry rule;
- what a stop does: the worker halts and the session diagnoses read-only.

The proposal Kevin approved on 2026-10-05 read, in substance: four models by six tasks by four modes, 96 fresh runs, a $25 estimated-spend cap and no retries, with the note that the cap can stop the study before all runs finish. His answer: "Run the 96-run comparison, capped at $25".

## A project without a spend cap

Spend caps are set per project. A project may lift its API spend caps on Kevin's explicit order, and the order applies to that project alone. Such a project still keeps a high cap as a stop against a runaway loop, logs every paid call, and reports the exact dollars per unit of output in its ledger and results. Kevin gave this order for one research project on 2026-10-08, to get the best pipeline the measurements support. Every other paid run follows the proposal above.

## Pilot, then bulk

1. Freeze the plan: the worker, its helpers and the grid file are not edited after approval.
2. Run a pilot of a few cells. Verify every record: the archive hashes, the traces, the initial state, the grades and the costs, including reservations.
3. Write the pilot review. Admission is about evidence quality, so a pilot can pass with failed trials as long as every record is sound.
4. Launch the approved remainder once, under one worker that holds the run's lock file.
5. At the terminal boundary run the verifier, which writes the verified summary, the accounting export and a receipt.

## The stop question

A stop is diagnosed read-only, and the continuation needs Kevin's approval as its own labelled campaign. The questions he answered in October 2026 followed one form:

```text
The campaign stopped at <n>/<total> on <cause> without <the missing receipt>.
May I run <only the remaining cells | a fixed policy> as a separately labelled
continuation, keeping every existing result and cost reservation? <How a single failure
is handled from now on.> No retries, unchanged grading, and the total stays within the
original <allowance>.
```

A timeout or a dropped connection is a defect in the harness. Fix it (a longer request deadline, a receipt for a truncated output) before the continuation runs. Kevin, 2026-10-05: "why do we have timeout failrues, fix this and continnue until its done".

## Reporting a campaign

- Report coverage as cells done of cells planned, with the spend and the reservations.
- Keep every prior campaign's records unchanged and say which campaign each number comes from.
- Single attempts per cell support no winner and no general ranking. State the limits (one attempt, missing receipts, tool differences between modes) beside the results.

## The heartbeat prompt

A heartbeat wakes on a schedule (a Codex automation, a `/loop` or a scheduled task) and receives the same prompt each time. The prompt stands alone:

```text
Finish <the approved run> in <repository>. Read <AGENTS.md>, <the campaign document> and
<its frozen plan file> first. Kevin approved <grid>, a <cap> estimated-spend ceiling and
no retries. The pilot is verified: <counts and cost>. The worker runs as PID <pid> and
owns <lock file>.

Check process ownership, the manifest and the summary read-only. Leave a healthy worker
running and stay quiet when nothing changed or nothing needs action. Never start a
duplicate collector, retry or replace a cell, edit the frozen plan, worker or helpers,
reset accounting, relax a limit, or touch a closed collection.

At the terminal boundary run <verifier command>. If the run stopped below <total>,
diagnose read-only and report the coverage and the action needed. Never restart it
automatically. Speak only on completion, on failure, or when Kevin must decide.
```

## Hosted gates and previews

Model calls are one cost; hosted checks are another.

- The whole check matrix runs on the local tier. Hosted runs are narrowed to what only a deployment can show (CDN behaviour, access rules, production storage).
- One preview deployment per round, built from the merged tree and reused by fixers and the verifier unless a source file changed.
- A documentation-only push runs the smoke check alone.
- Git preview deployments for the gt-cloud landing are off: on 2026-09-15 Kevin asked for a PR to stop them because they were "running up a lot of costs" (`gt-website`).
- A paid service proposed for a design is challenged with the free alternatives and their numbers first (memory turboslide-pipeline-cost-rules).
