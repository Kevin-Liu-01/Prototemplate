# Handoffs, hard stops and resume reports

Detail for sections 6 and 8 of `gt-orchestration`. The structure comes from handoffs Kevin pasted to agents: the gt-cloud landing and dashboard stack (2026-08-11), and three from personal projects whose method transfers (2026-07-30, 2026-09-11, 2026-10-02). Relay notes between Claude and Codex on one main are in `docs/handbook/multi-session-playbook.md`.

## The corrective handoff

A handoff records an unfinished state. When an earlier pass reported success that Kevin rejected, the first paragraph says so and names the check that misled: a structural audit at 91 of 91 beside 0 of 72 visual passes was the 2026-07-30 case. Write it to a file in the repository (or the scratchpad when Kevin asks for it pasted), in these sections:

1. **Title and date.** What the next owner must finish, and the date it was written.
2. **Status.** One paragraph: what is done, what is not, and which earlier claim is wrong.
3. **Start from fresh main.** The baseline commit and the fetched `origin/main` SHA. For gt-cloud, a fresh worktree from `origin/main` (`gt-ship` section 1); the primary checkout keeps old uncommitted work and never switches branch. For a repository worked on main:

   ```sh
   git status --short --branch
   git switch main
   git fetch origin
   git pull --ff-only origin main
   git rev-parse HEAD
   ```

   If the tree is dirty, inspect and preserve the owner's changes before pulling. Never develop from a stale worktree or an old served bundle.
4. **Every raw input Kevin supplied.** URLs, dropped files and recovered drops, each with a durable path. A temporary macOS clipboard or screenshot path disappears, so copy the file into the repository's evidence folder and give that path. Kevin, 2026-07-29: "include all of the urls esp user drops recovered and to implement everything in there."
5. **The asset and code map.** Where each piece lives, which outputs are generated (never edited by hand) and the command that regenerates each, and the licensing constraint on any asset.
6. **Ownership and working rules.** The files and checkouts other sessions own, a shared checkout marked unsafe when it holds others' dirty state, and the rules to keep (scope, writing, code style).
7. **What is wrong, and the target.** Kevin's current direction in his words, the reference and the numeric bar, and the work order (worst items first).
8. **Verification done.** Each check with its command, result and date, marked not to be redone. Coverage that was emulated or not rerun at the handoff says so.
9. **Gates before each commit.** The exact commands.
10. **Environment gotchas.** Ports, servers that were not running at the handoff check, shell traps (memory zsh-shell-traps), credentials by variable name only.
11. **Priority queue and open threads.** Numbered, with the decisions still Kevin's.
12. **Release proof.** A push is not deployment proof. Name the check that proves a release: the served deployment's commit equals the released SHA, and the pages are inspected in a browser (`gt-ship` section 8 for Prototemplate).
13. **Authority.** What the receiver may do without asking. A handoff grants no new push, merge, close, label or comment authority by itself (2026-08-11).
14. **Definition of done.** The conditions, each checkable, and the line that remaining failures are reported plainly until every condition holds.

## The resume file

When Kevin leaves while work runs ("save all progress so i can resume when i get home", 2026-10-09), write a resume file before he goes and leave the runs going:

- the file sits at a durable path outside the scratchpad: `RESUME.md` at the root of the project, or one file in the work folder when several projects run;
- per running workflow: its run id, its script, its worktree and branch, and its notes folder;
- the launch entries and ports to restart after a reboot;
- every decision Kevin made that the runs depend on, in his words;
- the resume steps: restart the servers, then `Workflow({ scriptPath, resumeFromRunId })` with byte-identical `args` (`references/harness-traps.md`);
- a one-line memory note that points to the file, so a bare "resume" or "continue" reads it first.

Work that runs over days keeps its state in committed repository files, where any session can read it.

## The hard stop record

When Kevin says "stop all work" or "stop and give me everything", halt every lane at once and write the stop at the top of the handoff:

- the processes this session owned and stopped (servers, browsers, captures, test runs);
- the processes of other worktrees and sessions that were left running on purpose;
- that nothing was staged, committed, pushed, deployed, reset, cleaned, stashed or deleted after the stop;
- the fetched `origin/main` SHA, to be fetched again before integration;
- the line that no edits, tests, captures, commits, pushes or worktree cleanups resume until Kevin says to continue.

Then give Kevin the paths, links and the complete and incomplete items in the reply itself (`gt-reporting`).

## The receiver's first output

The gt-cloud stack handoff of 2026-08-11 told the receiver: "Start with independent review findings and a recommendation." That line and the authority line come from the Output block of the wiki `handoff` template, and the 2026-08-11 handoff added the state matrix. The receiver's first reply holds, in order:

1. Review findings: stale claims, hidden risks, accidental scope growth, and anything that should stop the work.
2. A recommendation, including whether a smaller or safer continuation exists.
3. A compact state matrix: branch or PR, clean or dirty, ancestry and mergeability, CI, remaining proof, risk.
4. The proposed continuation plan.

Before any change it re-checks live repository, PR and CI state, and it never discards, resets, restores, cleans, stashes or drops existing work. It reports unverified behaviour, manual gates still open, and external actions awaiting approval.

## The resume report

After agents die and resume, or after a bare "continue" on a new day, report per lane:

| Lane | Brief | State when it stopped | Resumed as | Left |
| --- | --- | --- | --- | --- |
| `<name>` | `<file or chip title>` | `<last commit, diff or report; "nothing written">` | `<same brief plus what it did>` | `<items>` |

Under the table: the tree check (status, type check or build, conflict markers), the orders Kevin gave while the agents were down and where each went, and the lanes not resumed with the reason (finished, superseded, or waiting on Kevin).
