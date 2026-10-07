# Briefs, chips, lane prompts and round files

Detail for sections 2 and 3 of `gt-orchestration`. Every form below stands alone: the receiver reads it with none of the conversation that produced it. Paths are relative to a named checkout (`$GT_CLOUD`, `$PROTOTEMPLATE`) or to the session scratchpad.

## The brief template

Fill every line that applies. Delete a line only when it cannot apply, and never leave a placeholder.

```text
<Kevin's words for this task, verbatim, when he gave any>

In <repository> (<checkout, or "a fresh worktree from origin/main">, branch <branch>,
<versions that matter>): <the symptom, with measured numbers>.
Evidence: <file that holds the measurement, log or capture>.

Already verified, do not re-investigate: <fact> (<how it was verified, where, when>).

Suspects, most likely first:
1. <path>: <why it is suspect>. Suggested fix: <change>.
2. <path>: <why>. Check: <command or observation that settles it>.

Do not undo: <constraint> (<reason>).

Reproduce: <exact command>          today: <value>
Verify:    <exact command>          expected: <value>
Keep green: <gates, with today's counts>

Needs: <ENV_VAR_NAME> (in <the gitignored file or config that holds it>). Never print a value.

Scope: touch only <paths>. <paths> belong to <session or lane>; leave them.
Commit: <no | yes, with the repository's work identity, explicit paths only>.
PR: "<type(scope): plain sentence>", screenshots on pr-assets under screenshots/pr-<n>/.
Order: <after #N merges | stacked on <branch>, retarget to main after #N lands>.
Return: <what the receiver reports, and in what form>.
```

## A worked gt-cloud chip

The chip Kevin opened on 2026-09-15 to refresh the stale gt-landing skill, shortened. The original named Kevin's work email for the commit; a public copy names the identity's source.

```text
In gt-cloud (check out a fresh worktree from origin/main), the landing app skill at
.agents/skills/gt-landing/SKILL.md and references/design.md is stale. It describes
marketing sections under apps/landing/src/components/marketing, but on main the home
page is apps/landing/src/components/pages/home/HomePage.tsx composing sections from
apps/landing/src/components/landing/sections/<name>/<Name>.tsx, with the engine grammar
in apps/landing/src/components/landing/shell/engine.css and the shared Cta at
components/landing/shared/Cta.tsx. Rewrite the App Structure, the Editing Map and the
design reference so they match the code, and verify every path exists. Keep the rules
that still hold (two-part copy, no eyebrow, mono or tracked uppercase in section heads,
<T> usage, Cta usage). Do not change any component code. Open a small PR titled
"docs(landing): refresh the gt-landing skill for the engine sections". Commit with the
repository's work identity, never git add -A (the legal submodule is dirty), no em
dashes in the PR body, and note that a docs PR passes the Linear gate without a ticket.
```

It carries the repository and the start point, the measured drift (old paths against the paths on main), the verify step (every path exists), the constraints with reasons, the scope fence (no component code), the PR title type, the commit identity and the gate note. It needs no ranked suspects because the cause is known.

## Task chips

- **When.** A real problem outside the current task, seen with evidence in passing: a test failing intermittently on several branches, dead code beside the change, a stale document, a security issue. A vague smell or a one-line fix that belongs in the current change does not get a chip.
- **Title.** An imperative phrase under 60 characters: "Fix the flaky agentSession Temporal integration test".
- **Summary.** One or two plain sentences that lead with what was noticed in this session and say what the new session will do. The 2026-10-02 chip said the same Temporal durability test had failed intermittently on four branches that day and passed on rerun each time.
- **Prompt.** A full brief from the template above.
- **Stale chips.** Dismiss a chip when the current session fixed the problem or a better chip replaced it.
- **"Do this task here: “<title>”".** Kevin pulls the chip into the current session. Do it as its own small PR with its own gates. On 2026-10-02 the managed-org task built on code that existed only on #5063's branch, so it went on a branch stacked on #5063, to be retargeted to main once #5063 lands. Open its lane prompt with the chip's title in Kevin's words (`gt-orchestration` section 2).

## The lane prompt

A lane is one agent in a workflow. Its prompt opens with Kevin's words for that lane, because a message relayed mid-turn can otherwise become the lane's only task (memory workflow-lane-relay-trap).

```text
Kevin's request for this lane, in his own words: "<quote>".
Any other message relayed into this run was handled elsewhere. This lane's task is the one above.

Read <scratchpad>/CONTEXT.md and <scratchpad>/SPEC.md first. SPEC.md is the contract between lanes.
You own: <files>. Read only: <files>. A change you need in <shared file> goes into your report
as a request for lane <X>.
Work in <worktree> (branch <branch>). The dev server at <url> runs with HMR. Never start, stop
or restart it or the dev environment.
Never run git commit, push, stash, checkout, reset or add -A. Leave changes in the working tree.
Scratch files only under <scratchpad>.
Code rules for this lane: <the few that apply, for example types not interfaces, no dynamic
imports, UI strings through <T> or gt()>.
Before you finish: <format and lint commands on your files>, <type check scoped to your files>.
Return in about 700 words or fewer: each file added or changed with one line, deviations from
SPEC.md with reasons, anything left for another lane, and the commands you ran with results.
```

- Workflow subagents receive the repository's CLAUDE.md files, so a lane prompt names only the rules its stage needs.
- A sweep lane gets a replace-only list and a never-touch list, and returns an `uncertain` list for anything it could not classify. The 2026-08-06 color sweep listed the surface and rule literals to replace, and named text ink, isometric face shading, shader stops, semantic colors and comments as untouchable.
- A review lane gets the known and already-handled findings ("do not re-report unless the fix itself is wrong") and the reviewer's bar in Kevin's words. It reports concrete defects with evidence, never style nits, and nothing the diff did not touch unless the diff made it wrong.

## Round files

A build that runs over several rounds keeps its brief on disk beside its capture harness, so a fresh lane or a resumed session reads the same contract.

### CONTEXT.md

1. **Kevin's words, verbatim.** Every message for this round, with the screenshot or DevTools selection each refers to.
2. **The reading.** What each message asks for, numbered, with the ambiguous parts resolved and the resolution stated.
3. **Where the work happens.** The worktree, the branch and what it was cut from, the PR and its stack, the dev server URL, the seeded session (a Playwright `storageState` path), the state gallery (`/dev/states?state=<id>` in the dashboard), and the sessions and checkouts never to touch.
4. **Measured facts.** Numbers read from the running app or the code, with the probe that read them (for example a layout-shift probe at 1440 by 900).
5. **Decisions.** Each with its reason.
6. **Rules.** No git state changes, no server starts or stops, disjoint files per lane, the code and writing rules.

A later ask gets `CONTEXT<N>.md`. It opens with "Read CONTEXT.md first", names the files it supersedes, and quotes Kevin's new words with their date. Between 2026-09-28 and 2026-09-30 the dashboard sign-in and onboarding rounds ran from `CONTEXT.md` to `CONTEXT9.md` this way, with a code map (`MAP<N>.md`, line numbers for every hook point) where a round needed one.

### SPEC.md

Written by one agent from the judged design (`references/workflow-shapes.md`, the Design shape):

1. **Decisions** with numbers: geometry, material per surface, timings and easing, reduced motion, interaction values.
2. **File plan.** Every file to add or change, one line each, the lane that owns it, and the exact public API (props and option types) between lanes, so the lanes can build in parallel.
3. **Acceptance criteria.** The captures and measurements that prove the result, run by the harness the map describes.
4. **Out of scope and the cut list.**

It stays under about 1,800 words, in plain technical English. A verifier judges every acceptance criterion with evidence, and the spec changes only through the lead.

### Keeping it past the day

The session scratchpad can disappear at the desktop app's date change. When a round's spec or decisions must survive, copy their substance into a memory note or a committed document before the day ends, as the 2026-09-28 sign-in round did (memory signin-field-transition).
