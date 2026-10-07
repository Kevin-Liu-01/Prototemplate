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
  updated: 2026-10-05
  origin: prototemplate
---

# Running agent fleets and long autonomous runs

Kevin Liu runs much of his General Translation (GT) work through many agents at once: Workflow lanes inside one session, task chips spun off for later, and long runs that go for hours while he is away. This skill gives the procedure for that work: how to split it, how to brief each agent, how to judge what comes back, and how to keep it going through usage limits, restarts and changes of owner. Peer sessions that Kevin opens himself follow `docs/handbook/multi-session-playbook.md`, git lanes and worktrees follow `gt-ship` section 1, and proof of done follows `gt-verify`.

Paths are relative to a Prototemplate checkout (`$PROTOTEMPLATE`) unless they name gt-cloud (`$GT_CLOUD`). `docs/handbook/glossary.md` defines lane, chip and handoff. `references/briefs.md` holds the brief template, a worked gt-cloud chip, the lane prompt and the round files. `references/workflow-shapes.md` holds the phase shapes gt-cloud workflows used from August to October 2026, their schemas, a review skeleton and the resume recipe. `references/handoffs.md` holds the handoff, the hard stop record and the resume report. `references/campaigns.md` holds the campaign proposal, the stop question and the heartbeat prompt.

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

Quality work converges through a separate harsh critic that scores the work against a named reference.

1. **Name the exemplar and the bar in the brief.** `gt-aesthetic` section 1 names the reference for each surface: the brand deck for product surfaces, the Dossier for the site, and the Blue Marble for dithered pictures. In July 2026 the references were live sites. Kevin, 2026-07-30: "remember the bar is generaltranslation.com and resend.com. literally rereview and continuously score yourself until it look sright". For a set, the bar is the best item Kevin has accepted.
2. **Capture both at the same geometry.** The work and the reference share the viewport, theme, camera and crop, side by side. Reset to the same viewport or camera presets after every edit, so before and after stay comparable.
3. **A fresh critic scores blind.** The critic did not build the work, is told to be harsh, and is not told which image is the work. It writes concrete mismatch notes before it scores, cites what the reference does that the work does not, keeps the lower score when unsure, and judges the worst item as harshly as the best.
4. **Refiners fix only the named gaps.**
5. **Repeat until the bar holds everywhere.** Prefer a number per view and per dimension, and state it in the brief. The July GT diagram rounds used 8.5 of 10 from the rubric in `docs/research/DESIGN_STANDARD.md` section 8, and `gt-explorations` section 6 holds that rubric and its composites for design rounds. Kevin's own long loops used 8.5 of 10 per dimension, 90 of 100 overall and in every view, and "until 100" for research loops (July to September 2026).
6. **Close the ways to game the score.**
   - The bar ends the loop. A cap on rounds is a budget stop, and the report lists the gaps still open.
   - One strong view or component never averages away a weak one.
   - The builder never scores its own work. A lane's "pass" counts only with its captures.
   - The reference is checked first: it renders, it is the right variant, and it is complete. A rubric's anchor composites live in the repository (`docs/composites/`), because a scratchpad path disappears.
   - Work from the worst item upward, so showcase items cannot hide failures, and run the whole set. A sample proves nothing about the items it skipped.
   - When a shared base changes, rerun every item built on it.
   - Kevin's note outranks a critic's pass. An item he called wrong stays open until he says otherwise (`gt-films` section 9).
7. **Change the method when scores stop rising.** Measure the references and rebuild from the measurements. `gt-films` holds the same rule for films: when a move fails twice, change the idea.
8. **Say which kind of check passed.** A structural audit (loads, hierarchy, dimensions) read 91 of 91 while 0 of 72 items passed a visual bar of 90 in every view (2026-07-30). Report each kind of check on its own line, and call a structural pass structural (`gt-verify`).

## 5. Long autonomous runs

- **Write the orchestration prompt first.** Kevin opened the first GT site redesign round with: "your goal here is just to set up the prompt that will go for hours building this and spinning up subagents that evaluate" (2026-07-28). The prompt is saved as a file the run reads back.
- **Research first.** Read Kevin's wiki and X bookmarks for lessons and examples (2026-07-28: "read through our entire wiki and x bookmarks to learn lessons about design"), then online best practice and tools. Picture the end state, draw the system diagram, build it fully, and loop until every objective is verified. Kevin, 2026-08-01: "scope out and imagine the end state ... and then build that out fully".
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
  3. Resume each agent with its original brief and a line on what it already did. A Workflow run resumes with `Workflow({ scriptPath, resumeFromRunId })`, which returns cached results for the unchanged prefix of agent calls.
  4. Fold in every order Kevin gave while the agents were down.
  5. Report what resumed, what was already done and what is left (`references/handoffs.md`).
- **State lives on disk.** Plans, lane specs, round files and outputs live in files, so a bare "continue" after a restart or a compaction needs no new brief. On Kevin's desktop app the session scratchpad and the dev servers have died at the date change (memory blog-graphics-pipeline-traps). A spec that must outlive the day goes into the repository or a memory note, as the 2026-09-28 sign-in spec did (memory signin-field-transition).
- **Remote compute.** Long jobs on shared or remote machines run inside `tmux` with checkpoints, because a cluster shutdown loses unsaved work.

## 7. Paid model campaigns and heartbeats

- **The proposal.** Before a run that pays for model calls, propose the grid, a per-run cap and a total cap on estimated spend, a fixed trial count and a no-retry rule, with the recommended option first. The proposal says that the cap can stop the study early, and nothing runs until Kevin approves it. Kevin, 2026-10-05: "Run the 96-run comparison, capped at $25".
- **Pilot, then bulk.** A small pilot runs first and is verified (archives, traces, grades and costs) before the approved remainder launches, once.
- **Stops.** A stop is diagnosed read-only. The continuation runs as a new, separately labelled campaign that keeps every prior record and cost reservation inside the original allowance, after Kevin approves it.
- **One worker under a lock.** One worker owns a long collection and holds its lock file. Nothing starts a second collector.
- **Infrastructure failures are defects.** A timeout or a dropped connection gets fixed, and the campaign continues. Kevin, 2026-10-05: "why do we have timeout failrues, fix this and continnue until its done".
- **Small samples never name a winner.** A campaign of single attempts reports its limits and makes no ranking claim.
- **Hosted runs cost money too.** The whole check matrix runs locally, and hosted runs are narrowed to what only a deployment can show. On 2026-09-15 Kevin asked for git preview deployments of the landing to be turned off because they were "running up a lot of costs" (`gt-website`).
- **Heartbeats.** A heartbeat (a Codex automation, a `/loop` or a scheduled task) checks a long run read-only: process ownership, the manifest and the summary. It stays quiet when nothing changed. It never starts a duplicate, retries a cell or relaxes a limit. It speaks on completion, on failure, or when Kevin must decide, and at the terminal boundary it runs the verifier. `references/campaigns.md` has the prompt.

## 8. Handoffs

A handoff records an unfinished state for the next owner and makes no completion claim. When an earlier headline pass missed Kevin's standard, the handoff says so first. It holds:

- the stopped state and the baseline commit (the fetched `origin/main` SHA, to be fetched again before integration);
- how to start from fresh main: a fresh worktree from `origin/main` for gt-cloud (`gt-ship` section 1), or `git status`, `git switch main`, `git fetch`, `git pull --ff-only` after preserving the owner's dirty changes in a repository worked on main;
- every raw input Kevin supplied: URLs, dropped files copied to a durable path, and recovered drops. Kevin, 2026-07-29: "include all of the urls esp user drops recovered and to implement everything in there.";
- the asset and code map, with the generated outputs that are never edited by hand and the command that regenerates each;
- ownership rules: which checkouts and files belong to other sessions, and any shared checkout that is unsafe to work in;
- constraints with their reasons, and the verification already done with its date, marked not to be redone;
- environment gotchas (ports, servers that were not running at the handoff check, shell traps);
- the priority queue and the open threads, numbered;
- the line that a push is not deployment proof, with the check that proves a deploy (`gt-ship` section 8 for Prototemplate, `gt-verify` for production);
- the authority it grants. A handoff grants no new push, merge or comment authority (the wiki `handoff` template; 2026-08-11).

The receiver's first reply follows the Output block of the wiki `handoff` template. The 2026-08-11 gt-cloud stack handoff put it as "Start with independent review findings and a recommendation." A compact state matrix follows (branch or PR, clean or dirty, ancestry, CI, remaining proof, risk). The receiver re-checks live repository, PR and CI state before changing anything, and it never discards, resets or stashes existing work. Work that runs over days keeps its state in committed repository files, where any session can read it. `references/handoffs.md` has the template and the hard stop record.

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

- Prototemplate: `docs/research/DESIGN_STANDARD.md` section 8; `skills/gt-ship/SKILL.md` sections 1, 2, 3 and 8; `skills/gt-aesthetic/SKILL.md` section 1 and "Rules of the loop"; `skills/gt-films/SKILL.md` (the judge and section 9); `skills/prototemplate/SKILL.md` section 10; all read 2026-10-05.
- gt-cloud Workflow scripts from Claude Code sessions, read 2026-10-05: `gt-color-template-sweep` (2026-08-06), `review-pr-4887-inter-only` (2026-09-19), `signin-field-design` and `signin-field-build` (2026-09-29), `managed-org-atomic` (2026-10-02), `verify-5091-alias` (2026-10-03), and the round files `CONTEXT.md` to `CONTEXT9.md` (2026-09-28 to 2026-09-30).
- Handoffs Kevin pasted to agents: the gt-cloud landing and dashboard stack (2026-08-11, written to the wiki `handoff` template), and three from personal projects whose method only is kept (2026-07-30, 2026-09-11, 2026-10-02). Two task chips: the gt-landing skill refresh (2026-09-15) and the flaky Temporal test (2026-10-02).
- Claude memory (gt-cloud project): workflow-lane-relay-trap.md, redesign-v0-verdict.md, turboslide-ship-two-lessons.md, turboslide-pipeline-cost-rules.md, scratch-worktree-disk.md, session-lanes-prototemplate.md, blog-graphics-pipeline-traps.md, signin-field-transition.md.
- Kevin's wiki (github.com/Kevin-Liu-01/Kevin-Wiki): skills/productivity/handoff, skills/productivity/loopy, skills/productivity/agent-iteration-loop, skills/engineering/improve. The harness's `workflow-authoring` skill (resume, dead agents, worktree isolation).
- The 2026-10-05 mining round's synthesis of Kevin's messages from 2026-07-20 to 2026-10-05: A1, A9, B1 to B7, C5 and H7.
- Kevin's directives: full specs from the strongest model (2026-07-21); all waves (2026-07-24); the hours-long prompt and research first (2026-07-28); handoff inputs (2026-07-29); the named bar (2026-07-30); the end state (2026-08-01); no new spawns (2026-08-06); all updates (2026-09-09); git preview costs (2026-09-15); fast and linear (2026-09-21); Do this task here (2026-10-02); the capped campaign, timeouts and codifying prompts (2026-10-05).
