---
name: gt-orchestration
description: >-
  How General Translation work runs across many agents and over long
  autonomous runs: when to fan out and when to stay linear, the spec before a
  build fan-out, lanes that own files, lane prompts that open with Kevin's
  words, the self-contained brief for a subagent, a task chip or another
  session, critic-scored convergence against a named reference, adversarial
  verification of findings, keeping going and resuming dead agents,
  heartbeats and spend caps for paid model campaigns, corrective handoffs,
  and closing a round. Use when planning or running a workflow, spawning
  subagents or task chips, writing a brief or handoff for another agent, or
  resuming work after an interruption.
metadata:
  title: Running agent fleets and long autonomous runs
  areas: workflow
  updated: 2026-10-10
  origin: prototemplate
  owner: P
---

# Running agent fleets and long autonomous runs

Kevin Liu runs much of his General Translation (GT) work through many agents at once: Workflow lanes inside one session, task chips spun off for later, and long runs that go for hours while he is away. This skill gives the procedure for that work: how to split it, how to brief each agent, how to judge what comes back, and how to keep it going through usage limits, restarts and changes of owner. Peer sessions that Kevin opens himself follow `docs/handbook/multi-session-playbook.md`, git lanes and worktrees follow `gt-ship` section 1, and proof of done follows `gt-verify`.

Paths are relative to a Prototemplate checkout (`$PROTOTEMPLATE`) unless they name gt-cloud (`$GT_CLOUD`). `docs/handbook/glossary.md` defines lane, chip and handoff. The references hold the detail: `briefs.md` (brief template, worked chip, lane prompt, round files), `workflow-shapes.md` (phase shapes, schemas, a review skeleton, resume) with `examples/` (four reduced scripts), `convergence.md` (the critic loop), `handoffs.md` (handoff, resume file, hard stop, resume report), `campaigns.md` (proposal, uncapped project, stop question, heartbeat), `harness-traps.md` (reboots, pattern kills, hanging commands, the guard line) and `sources.md` (the date of every rule). `scripts/replay-edits.py` rebuilds lost files from transcripts.

## 1. Fan out or stay linear

- **Fan out separable work only.** Work splits when its parts touch disjoint files or answer independent questions: one agent per file group in a token sweep (2026-08-06), five lenses over one PR diff (#4887, 2026-09-19), two build lanes against one spec (2026-09-29).
- **Do a small linear task directly.** A one-file fix, a question, a follow-up on one PR, or a chain where each step needs the previous result runs in the current session. Kevin, 2026-09-21: "why are you using a bunch of subagents? this should be fast and linear".
- **One exemplar before a full set.** On 2026-08-04 seven landing sections fanned out on an unconfirmed reading of the Figma mocks, and Kevin kept one of them (memory redesign-v0-verdict). Build one item, get his sign-off on its grammar, then replicate it (`gt-aesthetic`, "Rules of the loop").
- **Kevin controls the fan-out.** "No new spawns" means the agents in flight finish, their work is committed and pushed, and nothing new starts. Kevin, 2026-08-06: "let them finish, but onc etheyre done, theyre done, commit and push, and no new spawns". "Make a new subagent for X" opens one more lane for that ownership area beside the lanes already running.
- **A spec comes before a build fan-out.** Kevin wants the strongest available model "for the planning and writing out full specs" (2026-07-21). In gt-cloud the spec comes out of a Map, Design, Judge, Spec workflow. Readers map the code with measured facts, three designers take different angles, a taste judge and an engineering judge score the designs, and one agent writes `SPEC.md` from the winner with the grafts. The spec holds the decisions with numbers, a file plan that gives each lane its files and the exact public API between lanes, the acceptance criteria as captures and measurements, and a cut list, in about 1,800 words or fewer (`references/workflow-shapes.md`).
- **Scale to the ask.** A quick check gets a few agents and one verifier per finding. Kevin's "fully", "every single" and "literally all" get more finders, three refuters per finding and a synthesis stage (`docs/handbook/operating-principles.md` section 15). A workflow that bounds its coverage (top N, a sample, no retries) logs what it left out. The harness's `workflow-authoring` skill holds the general patterns.

## 2. Lanes and ownership

- **Each lane owns named files.** The spec's file plan names every file once. A file two lanes need has one owner, and the other lane writes the change it needs there as a request in its report. Builders write new files where they can and re-read a shared file immediately before each edit.
- **Lanes leave git and servers to the lead.** In gt-cloud workflows a lane never runs a git command that changes state (commit, push, stash, checkout, reset, `add -A`), never starts, stops or restarts a server or the dev environment, and writes scratch files only under the session scratchpad. The lead reads each diff and commits by explicit path (`gt-ship` section 2). When two lanes must edit the same paths in parallel, each runs with `isolation: 'worktree'`, which costs a fresh worktree per agent.
- **Kevin's notes during a run.** Record each new note verbatim as a task. Route it to the agent that owns the file, or queue it until that agent releases the file. Fix a note on a file no lane owns inline at once. The ask ledger in `gt-reporting` carries every note to the final report.
- **Every lane prompt opens with Kevin's words.** When Kevin sends an unrelated message in the turn that launches a workflow, its lanes can take that message as their only task. On 2026-09-30 a lane built nothing and verified an unrelated title instead (memory workflow-lane-relay-trap), and on 2026-10-02 the `managed-org-atomic` workflow for a task chip built nothing for the same reason. Start each prompt with "Kevin's request for this lane, in his own words:" and the quote, then state that any other relayed message was handled elsewhere. Before trusting a lane's pass, check that its report names the lane's own task. When a workflow fails this way, build the task directly in the session.
- **Ports.** Each worktree and dev server gets its own port range away from the defaults, written into the round's CONTEXT file. Prototemplate's review server holds 3005 and the gt-cloud landing review server 3001 (`gt-local-dev`). One round gave its lanes 4461 to 4465, the integrator 4468 and the verifier 4469.
- **Machine load.** Lanes on one machine share its CPU. When a timing check reads red while other lanes run, rerun it once the load drops and record `uptime` beside the reading (memory turboslide-ship-two-lessons).
- **Lane reports.** A build lane returns in about 700 words or fewer: each file added or changed with one line, deviations from the spec with reasons, anything left for another lane, and the commands it ran with their results. A sweep or review lane returns a schema with a `checked` list (what it inspected and found clean) and an `uncertain` list. The 2026-08-06 color sweep told its lanes to leave any value they could not classify and report it, because a missed replacement costs one more pass while a wrong one flattens a drawing.

## 3. The brief

A brief stands alone, because its receiver has none of the conversation. The rule covers a subagent, a task chip and another session. A brief holds:

1. The repository, the checkout or worktree, the branch, and the versions that matter.
2. The symptom with measured numbers, and the file that holds the evidence.
3. What is already verified, marked "do not re-investigate", with how it was verified.
4. Ranked suspects with file paths, and the suggested fix.
5. Constraints that must not be undone, each with its reason. A fix that moved a secret out of a request URL stays, and the brief says why.
6. The exact repro and verify commands, the before and after values, and the gates that must stay green with today's counts.
7. Environment needs by variable name and file location only. A value never enters a brief.
8. Scope fences (files another session owns), the commit identity, the PR title type, the screenshot branch (`pr-assets`), whether to commit at all, and the dependency order ("after #N merges").

`references/briefs.md` has the template, a worked gt-cloud chip and the lane prompt.

- **Task chips.** Spawn a chip for a real out-of-scope problem seen in passing. Its summary says what was noticed and where, and its prompt is a full brief. On 2026-10-02 a chip came from one Temporal integration test failing intermittently on four branches in one day.
- **"Do this task here".** When Kevin answers a chip with "Do this task here: “<title>”", do it in the current session as its own small PR with its own gates (2026-10-02). When the task builds on code that exists only on an open PR's branch, stack the new branch on that branch and retarget it to main once that PR lands.
- **Round files.** A build that runs over several rounds keeps its brief on disk. The September 2026 dashboard rounds wrote `CONTEXT.md` and `SPEC.md` beside a capture harness, then one `CONTEXT<N>.md` for each later ask. Each file opens with Kevin's words verbatim, then the reading of them, where the work lands (worktree, branch, PR, dev URL, seeded session), measured facts, decisions and rules. It names the earlier files to read first and the ones it supersedes.
- **Prompts for another machine.** For an agent in another harness or on another machine, write a clipboard prompt with the wiki `handoff` skill. It uses portable anchors (repository, PR URLs, branch names, commands) in place of local paths.

## 4. Critic-scored convergence

Quality work converges through a separate harsh critic that scores the work against a named reference. `references/convergence.md` holds the loop with its examples and numbers.

1. **Name the exemplar and the bar in the brief.** `gt-aesthetic` section 1 names the reference for each surface. For a set, the bar is the best item Kevin has accepted.
2. **Capture both at the same geometry**: viewport, theme, camera and crop, side by side, reset to the same presets after every edit.
3. **A fresh critic scores blind.** It did not build the work, is told to be harsh, writes concrete mismatch notes before it scores, keeps the lower score when unsure, and judges the worst item as harshly as the best.
4. **Refiners fix only the named gaps, and the loop repeats until the bar holds everywhere**, stated as a number per view and per dimension (8.5 of 10 per dimension, 90 of 100 overall and in every view; `gt-explorations` section 6 holds the design rubric).
5. **No gaming.** The bar ends the loop, and a cap on rounds is a budget stop whose report lists the open gaps. One strong view never averages away a weak one. The builder never scores its own work, and a lane's pass counts only with its captures. The reference is checked first, and its composites live in the repository (`docs/composites/`). Work from the worst item upward over the whole set, rerun every item when a shared base changes, and keep an item Kevin called wrong open until he says otherwise.
6. **Change the method when scores stop rising**: measure the references and rebuild from the measurements.
7. **Say which kind of check passed.** Report each kind on its own line and call a structural pass structural (`gt-verify`): on 2026-07-30 a structural audit read 91 of 91 while 0 of 72 items passed the visual bar.

## 5. Long autonomous runs

- **Write the orchestration prompt first**, as Kevin asked for the first GT site redesign round (2026-07-28), and save it as a file the run reads back.
- **Research first.** Read Kevin's wiki and X bookmarks for lessons and examples (2026-07-28), then online best practice and tools. Picture the end state, draw the system diagram, build it fully, and loop until every objective is verified (2026-08-01).
- **Cheapest, most wanted phase first.** On 2026-07-29 a run of about 45 agents put its blind judge first, because the previous run had died on usage credits before its judge ran. If the budget runs out mid-run, the result Kevin is waiting for already exists.
- **Judge after the builders land.** While builders still rewrite the work, a verdict goes stale within the hour. Stage the judge to start when the build lanes commit.
- **Evaluators are fresh and own one lens each.** An evaluator has no memory of the build and checks the build's claims itself, with its own drive test or measurement. Lenses that worked: visuals, the whole set judged item by item, interaction and dead affordances, measured performance at device scale factors 1 and 2, code architecture, and completeness against everything Kevin asked for in the session.
- **Adversarial verification.** Every critical and major finding goes to refuters whose default stance is "wrong or stale". The gt-cloud form uses three refuters per finding with distinct lenses (correctness on the pinned head, reproduction, necessity of the fix), and a finding stands when at least two of the three fail to refute it. A verifier pins the tree it read (the commit, or a hash of the uncommitted diff) and checks a regression claim against main before blaming the round.
- **The verdict.** It ranks the confirmed findings with exact fixes, lists what was checked and found clean, separates what blocks from what can follow, keeps a refuted-findings appendix whose items are never raised again, and rewrites the honest status section of the README or the PR body so stale claims leave.
- **Hard limits up front.** The prompt states which credentials exist (by variable name), which deploy targets and accounts the run may touch, what only Kevin can do, and what the run may spend. Every result not verified live carries that label.

## 6. Keep going and resume

- **Run every wave to completion.** A plan with several waves runs without pausing for permission between waves, and the hard items get done and reported with the rest. Kevin, 2026-07-24: "keep going until all waves are done". Kevin, 2026-09-09: "can we just do all of our updates? why are you holding back".
- **"Continue" covers every open lane.** "Continue", "continue all" and "keep going please, alll approvd" (2026-10-01) resume every open lane and every unfinished item in the session, and the report names each one.
- **When agents die.** Usage limits, outages and app quits stop agents mid-edit.
  1. Check the tree: `git status --short`, the type check or build of each touched package, and a sweep for conflict markers and half-written files.
  2. Read what each dead agent left: its partial report, its diff and its notes. On 2026-07-29 three lanes died on one session limit, and one had already written a complete diagnosis.
  3. Resume each agent with its original brief and a line on what it already did. A Workflow run resumes with `Workflow({ scriptPath, resumeFromRunId })` and byte-identical `args`, which returns cached results for the unchanged prefix of agent calls. New information goes only into the prompt of one unfinished agent.
  4. Fold in every order Kevin gave while the agents were down.
  5. Report what resumed, what was already done and what is left (`references/handoffs.md`).
- **State lives on disk.** Plans, lane specs, round files and outputs live in files, so a bare "continue" after a restart or a compaction needs no new brief. On Kevin's desktop app the session scratchpad and the dev servers have died at the date change (memory blog-graphics-pipeline-traps), and a reboot empties the scratchpad and stops every process (2026-10-07; `references/harness-traps.md` lists what survives). A spec that must outlive the day goes into the repository or a memory note, as the 2026-09-28 sign-in spec did (memory signin-field-transition).
- **The guard line.** Every workflow agent prompt carries the guard text in `references/harness-traps.md`: Kevin's messages go to the orchestrating session, and the agent keeps working. On 2026-10-09 a "status report" message reached running agents, and the workflow ended early with reports in place of work.
- **When Kevin leaves mid-run**, write a resume file at a durable path (`RESUME.md`) with each run id, worktree, port and decision, and a one-line memory note pointing to it (`references/handoffs.md`).
- **Lost files.** A file lost with a scratchpad or an overwritten uncommitted route is rebuilt from the Write and Edit calls in the transcripts: `python3 scripts/replay-edits.py <transcript.jsonl> --match <path part> --out <dir>` (`--list` first; `--revert` rebuilds the state before an agent's edits). It prints counts only and writes only under `--out`.
- **Remote compute.** Long jobs on shared or remote machines run inside `tmux` with checkpoints, because a cluster shutdown loses unsaved work.

## 7. Paid model campaigns and heartbeats

`references/campaigns.md` holds the proposal, the stop question and the heartbeat prompt.

- **The proposal.** Before a run that pays for model calls, propose the grid, a per-run cap and a total cap on estimated spend, a fixed trial count and a no-retry rule, with the recommended option first, and say that the cap can stop the study early. Nothing runs until Kevin approves it. Kevin, 2026-10-05: "Run the 96-run comparison, capped at $25".
- **Pilot, then bulk.** A verified pilot runs first. The approved remainder launches once, under one worker that holds the run's lock file, and nothing starts a second collector.
- **Stops.** A stop is diagnosed read-only. The continuation is a new, separately labelled campaign that keeps every prior record and cost reservation inside the original allowance, after Kevin approves it.
- **Infrastructure failures are defects.** A timeout or a dropped connection gets fixed, and the campaign continues (2026-10-05).
- **Small samples never name a winner.** A campaign of single attempts reports its limits and makes no ranking claim.
- **A project without a cap.** A project may lift its API spend caps on Kevin's explicit order, for that project alone. It keeps a high cap as a runaway-loop stop and still logs and reports every dollar (2026-10-08; `references/campaigns.md`).
- **Hosted runs cost money too.** The whole check matrix runs locally, and hosted runs are narrowed to what only a deployment can show (2026-09-15; `gt-website`).
- **Heartbeats.** A heartbeat (a Codex automation, a `/loop` or a scheduled task) checks a long run read-only and stays quiet when nothing changed. It never starts a duplicate, retries a cell or relaxes a limit. It speaks on completion, on failure, or when Kevin must decide, and at the terminal boundary it runs the verifier.

## 8. Handoffs

A handoff records an unfinished state for the next owner and makes no completion claim. When an earlier headline pass missed Kevin's standard, the handoff says so first. It holds the stopped state and the baseline commit (the fetched `origin/main` SHA), how to start from fresh main, every raw input Kevin supplied with a durable path, the asset and code map with the generated outputs and their commands, ownership rules, constraints with their reasons, the verification already done, environment gotchas, the numbered priority queue, the line that a push is not deployment proof with the check that proves a deploy, and the authority it grants, which is never a new push, merge or comment authority (the wiki `handoff` template; 2026-08-11). `references/handoffs.md` has the template, the resume file and the hard stop record.

The receiver's first reply opens with independent review findings and a recommendation ("Start with independent review findings and a recommendation.", 2026-08-11), then a compact state matrix. It re-checks live repository, PR and CI state before changing anything, and it never discards, resets or stashes existing work. Work that runs over days keeps its state in committed repository files.

## 9. Closing a round

- **Commit per lane and ship one lane at a time.** Each lane's work lands as its own commit or PR by explicit path (`gt-ship` sections 2 and 3). Lanes reach main one at a time in merge order, each through its gates before the next, so a red names one change. A check that reads red twice is a stop: fix forward or revert.
- **Clean up.** Remove scratch worktrees once their work is pushed (`gt-ship` section 1; 48 left over filled the disk on 2026-10-05). Stop the servers and background jobs you started, and leave Kevin's and other sessions' servers running.
- **Leave the state current.** Update the round file, the memory notes and the handoff if work remains, and make every PR body match what shipped.
- **Report.** State each item in exact words with the ask ledger (`gt-reporting`).
- **Codify what worked.** Prompts that worked go into a skill or a document, a standard goes into a lint (`gt-lints`), and generation parameters are saved as code or JSON beside the asset. Kevin, 2026-10-05: "create docs and skills for audio creation and generation, what prompts worked and how u structured it". The rule sits in `docs/handbook/operating-principles.md` section 16.

## Review checklist

- [ ] The fan-out was justified: separable parts, one approved exemplar before a full set, and Kevin's spawn orders followed.
- [ ] A build fan-out had a spec with a file plan, the API between lanes and acceptance criteria.
- [ ] Every lane prompt opened with Kevin's words and said other relayed messages were handled elsewhere, and every lane report named its own task.
- [ ] Each lane owned its files and its port range, ran no git command that changes state, and started no server.
- [ ] Every brief, chip and lane prompt carried the eight fields of section 3 that apply to it, with environment needs by name only.
- [ ] The critic bar named its reference and a number per view and dimension; the critic was fresh and blind; no way of gaming the score in section 4 was used; each kind of check was reported on its own.
- [ ] Critical and major findings survived adversarial verification, and refuted findings sit in an appendix.
- [ ] After every interruption a resume report listed each lane resumed, what was already done and what is left.
- [ ] Paid runs had Kevin's approval of the grid, the caps, the trial count and the no-retry rule, and heartbeats stayed read-only.
- [ ] The handoff holds every part of section 8, and its receiver opened with review findings.
- [ ] Scratch worktrees are removed, started servers are stopped, and the round file and memory notes are current.

## Related skills

Prototemplate: `gt-ship` (lanes, worktrees, commits and landing), `gt-verify` (kinds of proof and done), `gt-reporting` (the ask ledger, state per item, decision lists), `gt-explorations` (design rounds), `gt-aesthetic` (the references and the review loop), `gt-films` (directors, judge and critics for films), `gt-local-dev` (review servers and the dev environment), `gt-lints`. Handbook: `docs/handbook/multi-session-playbook.md` (peer sessions, broadcasts, Claude and Codex on one main, relay notes) and `docs/handbook/operating-principles.md`. Wiki: `agent-iteration-loop` (one agent's implement and verify loop), `handoff` (clipboard prompts), `loopy` (bounded loops), `improve` (read-only plans for other agents), `agent-eval-library`. Harness: `workflow-authoring` (the Workflow script API).

## Sources

`references/sources.md` lists the Prototemplate files, the gt-cloud workflow scripts, the handoffs, the memory notes and Kevin's dated directives behind each section, and the provenance of the 2026-10-10 additions.
