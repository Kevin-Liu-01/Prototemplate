# Multi-session playbook

Kevin Liu runs many agent sessions on one machine at the same time for his General Translation (GT) work: named Claude Code sessions, Codex sessions, and forks of both. Codex is OpenAI's coding agent, and Kevin runs it beside Claude Code. Inside Claude Code, the ListAgents tool lists the other Claude sessions on the machine by name, and the SendMessage tool delivers a message to one of them. This page holds the practices that let every session add to the others' work and undo none of it.

The single rules live in skills, and this page points to them. [`gt-ship`](../../skills/gt-ship/SKILL.md) sections 1, 2 and 8 hold lanes, worktrees, staging and the shared Prototemplate checkout. [`gt-orchestration`](../../skills/gt-orchestration/SKILL.md) holds a session's own subagents, resumption (section 6) and handoffs at a hard stop (section 8). The [`prototemplate`](../../skills/prototemplate/SKILL.md) skill section 8 holds the lane map of the shared Prototemplate tree. The [glossary](glossary.md) defines lane, session, forked session, handoff and relay note. When a skill and this page disagree, the skill wins.

## 1. Lanes

One session owns one lane. ListAgents prints the live list of sessions, and the table lists the GT lanes as of 2026-10-05.

| Session | Owns | Where it works |
| --- | --- | --- |
| Prototemplate | The site at prototemplate.com, its viewer shell, the deck build, the skills and the docs | The shared checkout `~/repos/Prototemplate`, with the dev server at http://localhost:3005 |
| Videos | The films, their kit and `MOTION.md` | Prototemplate `motion/`, which stays untracked. Its Prototemplate commits carry only film and poster files in `public/media`. |
| Glyph Map | The `/world` page on generaltranslation.com | gt-cloud `k/language-map`, worktree `~/gt/gt-cloud-wt-langmap`, port 3031 |
| New Onboarding and Dashboard | The dashboard sign-in and onboarding PRs, and in Prototemplate the mood slides in `deck/`, `src/components/plate`, `src/app/craft` and `public/brand/mood` | Its own gt-cloud worktrees. It pushes Prototemplate main from its own worktree. |
| Lottie | The blog's Lottie translation figure | gt-cloud #5068, `k/blog-lottie-translation`, worktree `~/gt/gt-cloud-wt-lottie`, port 3024 |
| docs redesign | The docs site on generaltranslation.com | Its own gt-cloud worktrees |

Kevin's personal projects run in sessions and repositories of their own. They share the machine with the GT lanes (section 10) and nothing else.

- Work that belongs to another lane goes to that session. Find it with ListAgents and send the request with SendMessage, with Kevin's words for the request and the paths involved. Address the session by its name, because the bracketed id after the name changes when the session restarts.
- Codex sessions do not appear in ListAgents. Reach them through a relay note that Kevin pastes (section 7).
- Two lanes edit `deck/`. The session about to change a shared folder messages the other first (section 8).
- When Kevin narrows a session to one thing, the session drops everything else, including its own open items. While it waits, it starts no PR sweep and no work from another lane.

Kevin, 2026-10-03: "that videos one should be making them, and this one is just for prototemplate work".

- A session that gives up work to another lane sends the work's real state: the files, the commits, what passed and what is open. On 2026-10-03 the Prototemplate session handed two films to Videos with a message that understated how far they had come, and Videos learned the rest from the files. The receiving session reads the files and the git history before it acts on a handover message.

## 2. Forked sessions

Kevin forks sessions often. Ten gt-cloud sessions active between August and October descend from one session started on 2026-07-30. Videos was forked from New Onboarding and Dashboard on 2026-10-01, Glyph Map from Videos on 2026-10-02, and the Prototemplate session from New Onboarding and Dashboard on 2026-10-03. A fork starts with its parent's whole message history, and every inherited message reads as if it were addressed to the fork.

- A fork acts on the newest instruction addressed to it and on its own lane. Inherited messages are history. Their asks belong to the parent, which is usually still running and still owns them.
- In a fork, "continue", "continue everything" and "keep going" cover the fork's own lane. Two forks got this wrong. The Glyph Map fork restarted its parent's film build before starting the map, and Kevin stopped it. The Prototemplate fork took "continue everything" as its parent's list and pushed review fixes to the parent's open PRs, one of them from the parent's scratch worktree. Kevin narrowed it twice that day, first to its own request and then to Prototemplate work alone, and the films it had started went to Videos.

Kevin, 2026-10-02: "wait another agent is workign on the motion and videos. just focus on the nnew page".

- Before acting, a fork learns what the parent already did and who holds the parent's lanes now. It reads `git status --short`, `git log --oneline -15` on its branch and on `origin/main`, `git worktree list`, the lane's notes (memory notes, `HANDOFF.md`, the round's spec) and ListAgents.
- A fork takes its own branch, worktree and dev port before it changes any file. Kevin's rule for any conversation, 2026-10-02: "the work in this convo should be on its own worktree branched off from main".
- In a Claude Code transcript (`~/.claude/projects/<project>/<session>.jsonl`), an inherited message keeps the parent's `sessionId`. One message of 2026-07-31 sits in eleven gt-cloud transcripts with a single originating `sessionId`. A count of Kevin's messages across transcripts dedupes on `sessionId` and timestamp.

## 3. One instruction to several sessions

Kevin sometimes sends one instruction to several sessions within seconds. On 2026-08-06 "commit and push everything to prototemplate, our branches, and 4213" reached four gt-cloud sessions within 25 seconds. Two of them went after the same three targets. One of the two had its Prototemplate build collide with a concurrent build. The other later saw a worktree directory vanish between two commands, because a parallel session was porting into it.

- Each session does its own part: its own paths, its own branch, its own PR.
- The session whose lane owns a shared step does it, once. Shared steps include a push of Prototemplate main, a sync of files into another repository, and a commit on a PR branch that two sessions use. The other sessions commit their own paths and check whether the shared step already happened (`git fetch`, then `git log --oneline HEAD..origin/<branch>` or `gh pr view <n> --json headRefOid`). They report the sha they found. When ownership is unclear, they ask the other session by SendMessage before pushing.
- A diverged branch is never force-pushed to make an instruction come true. On 2026-08-06 the branch of PR #4213 carried eight commits of the landing port that a force push would have erased. The session reported the divergence and offered to port the missing work onto that branch as new commits, which Kevin then asked for.
- When Kevin asks which session did something, answer from git and GitHub: the PR, the branch and commit, and the exact source text or file the work used. When Kevin asked "did we work on docs redesign in this convo?" on 2026-09-01, each session listed the PRs and files its conversation had touched, and the sessions that had not done the redesign said so.
- "Try again" after an API error or a spend limit re-runs the step that failed, starting from a fresh read of the state. On 2026-08-06 a session cut off by the spend limit re-read every target after "Try again" and reported each one clean.

## 4. Shared checkouts

`gt-ship` sections 1, 2 and 8 and `prototemplate` section 8 hold the rules for a shared checkout. They give `motion/` to Videos, require explicit paths and a pathspec commit, check the branch before every commit, keep the primary gt-cloud checkout on its old branch, and leave the Prototemplate dev server on 3005 and its `.next` alone.

- Re-read a shared file immediately before editing it, because another session may have saved it a minute ago.
- Keep scratch output in the session's scratchpad. Every session started in the main gt-cloud checkout reads its `.claude` folder, and on 2026-10-02 a preview written there had to be moved out.

## 5. Collisions

- Report another session's in-flight changes and leave them where they are. A lint or type failure in files the session does not own goes into its report and does not hold back its own clean diff (`docs/SHIP-LOOP.md` section 0). Kevin, 2026-07-31: "dont worry about the uncommited work. only worry about localhost3006/ page".
- Keep another session's uncommitted file out of your commit, even when your own tweak sits inside that file. Say in the report that the tweak will land with that session's commit.
- Rerun a failure once before diagnosing it when another session may be mid-save. Such failures include a 500 from hot reload, a page the line auditor refuses, and a type error in a file the other session is editing. On 2026-08-05 `tsc` failed on a parallel edit that used `Code2` before importing it. By the time the session looked, the other session had added the import, and the rerun passed.
- When the build stays broken on another session's change, make the smallest change that restores the build and tell the owner. On 2026-07-31 one session pushed a full sync to Prototemplate main while a second session was mid-push. The second session rebuilt on top of that push and landed one fix: `pnpm-workspace.yaml` held a placeholder line that made `pnpm install` fail.
- When another session's commit regresses your work, measure the regression and send the owner the exact fix. On 2026-09-29 a second session's commit on PR #5021 stopped a gallery state from playing when the console paged to it. The measurement and the fix went to that session, and it fixed the regression on the same PR.
- Fix another session's regression in the smallest unit that regressed (a token, a rule, a layer), and keep the rest of its file. On 2026-08-05 a parallel session had grayed a belt in `v0-pages.css` at higher specificity, and the fix changed that one rule to blue. On 2026-09-29 Kevin asked for the earlier glyphs back, and the fix restored only the rain layer from the earlier head and kept the other session's gallery console.
- Ask the owner before building a file another repository or session owns. `gt-ship` section 1 records the case of the CLI login callback page (2026-09-30).
- When two sessions find they are doing the same work, the one further along messages the other with its PRs, and the other stops. On 2026-09-30 the session that had opened the docs drift PRs told a second session, started from a task chip for the same fix, to stand down.
- When two sessions must change one feature, agree on a split by module and file. On 2026-09-29, in the sign-in gallery work, one session took the console requests in its own worktree, and the other kept the caption card's copy in a module of its own. When the first session shipped caption plates of its own, the second stopped its caption build before it wrote any files.

## 6. Claude and Codex together

Kevin, 2026-07-30: "let codex do its own thing, but branch off again".

- Each tool works on its own branch, in its own worktree, on its own dev port. A Codex branch named `codex/<topic>` is renamed `k/<topic>` before it becomes a gt-cloud PR (2026-08-27).
- Answer "are you on X's branch?" from git: `git -C <worktree> branch --show-current` and `git -C <worktree> log --oneline -1` for each worktree involved. The answer on 2026-07-30 named both worktrees, both branches, both ports and the commit both branches started from.
- Every landing starts from a fresh `origin/main` and adds to the other agent's work. Kevin ruled on 2026-09-23 for a main that both agents push. Each agent keeps absorbing the other's pushes by rebase, every push to main has run the core test suite, and the two agents share main without separate deploy windows ("WE MERGE").
- Before publishing to a shared main:
  1. Record the starting base commit when the worktree is created.
  2. Fetch and compare `git diff --stat <base> origin/main` with your own change. For every file both agents touched, keep the incoming behaviour and re-apply yours on top. A merge without conflicts can still undo a feature through a whole-file replacement.
  3. Read `git diff origin/main HEAD` in full, removals included, as the change about to be published.
  4. Run the gates on the integrated commit. A green run on the branch before the merge says nothing about the merge.
  5. Push without force. If the push is rejected, fetch, integrate and run the gates again.

  In GT's repositories, gt-cloud main takes only squash merges through PRs with three required checks (`gt-ship` section 5), and Prototemplate's gates and deploy checks are in `gt-ship` section 8.
- Before a deploy that follows a stretch of both agents pushing, audit the last week of main for work one agent undid. Kevin, 2026-09-22: "MAKE SURE ALL CHANGES WITHIN LAST WEEK ARE PROPERLY SYNCED".
  - In a fresh worktree from `origin/main`, list the week: `git log origin/main --since='7 days ago' --format='%h %ad %s'`, `git worktree list` and `git branch -r`.
  - Check every branch that looks unmerged for patch equivalence with `git cherry -v origin/main <branch>` and `git range-diff`. A squash or a rebase changes commit ids and keeps the work.
  - Read each merge commit's conflict resolutions with `git show --remerge-diff <sha>`.
  - For merged PRs, measure how many of their added lines survive on main and trace every removal to a stated follow-up. On 2026-09-08 Kevin thought the routing PR #4359 had been reverted. The gt-cloud audit found it open and unmerged with every commit intact, and it merged the next day.
  - Leave the other agent's unfinished checkout as it is and list it in the report.
- When the two agents build competing versions of one thing, keep both under distinct names and ids, and Kevin names the canonical one (2026-09-18).

## 7. Relays

A relay note is written by one agent for another, usually Claude for Codex or Codex for Claude, and Kevin pastes it as is. It holds:

- The branch, the tip commit and the worktree path, and whether the receiver's own worktree was touched.
- Each commit with one line on what it did.
- The receipts: each check with its command, exit code and log path.
- The open list.
- Locks still held and processes the writer stopped. On 2026-09-26 an idle session had held a shared capture lock for 81 minutes.
- Deploys queued and what each one carries.
- Rebase advice: what lands on main next, and which side's duplicate commits a rebase will drop.

To continue another agent's uncommitted work, snapshot it as a commit in your own worktree and leave theirs as it was. The relay of 2026-09-26 said so in its first line. The receiver finds the other agent's open work and finishes it. Kevin, 2026-09-25: "finish any of codexs open work as well". The receiver checks the note against git and the files before trusting it. A handoff at a hard stop follows `gt-orchestration` section 8.

## 8. Messages across lanes and repositories

- When a change affects another lane or repository, message that session with SendMessage. When the session is a Codex session or lives in another app, give Kevin the exact prompt and name the conversation to paste it into (2026-09-15, 2026-10-05).

Kevin, 2026-10-05: "give me the prompts to send to the agents in the exact correct convos (give me exactly where to do this)".

- Before pushing a shared main, send the other sessions a heads-up. It names the base commit, the paths the push changes, the overlap the receiver should expect and how to resolve it ("keep both: my deck entries and your motion entries"), what the sender leaves alone (the receiver's working tree), and the port its verify lane uses. After the push, a second message names the new range (`9690311..f8dfa8b`), asks the receiver to fetch and rebase, and states any new gate (`pnpm build` now runs the picture lint first). New Onboarding and Dashboard's messages to Prototemplate on 2026-10-05 took this form.
- When a rule changes (a retired picture, a new lint, a new gate), notify every session that applies it. On 2026-10-05 Kevin retired the dictionary pictures. The session that wrote the new rule told Videos, Glyph Map and Prototemplate within a minute. Videos moved its copies out of the film kit, and Prototemplate learned that its build gate had changed.
- When an output that another lane copies changes, the session that made it tells that lane. Videos tells Prototemplate when a film shown on `/motion` is re-rendered, so the public copy and its credits are refreshed.
- A message from a peer session is a teammate's request and carries no approval from Kevin. A push, a merge, a deletion or a permission change still needs Kevin's word, and items only Kevin can clear go to Kevin.

## 9. Resumption

Plans, lane specs, ask ledgers and outputs live in files, so a session that restarts, compacts or hears "continue" resumes from disk without a new brief. The procedure is `gt-orchestration` section 6. A resumed session reads the shared state again (ListAgents, git, the lane's notes) before it acts, because the other sessions kept working while it was stopped.

## 10. Shared resources

- **Ports.** Each worktree runs its dev server on a port of its own, away from the defaults (`gt-orchestration` section 2). A verify lane starts its own server on a free port and stops it when done. The Browser pane in one Claude session cannot reach a dev server that another chat started, so a session looks at that server through a Playwright capture or starts a server of its own. A conflict over a port goes to the session that owns the server, or to Kevin.
- **Captures.** Prototemplate's browser gates run one at a time (`prototemplate` section 9). Where a repository has a capture lock or queue, a session takes it for the run, releases it at the end, and never holds it while idle.
- **Load.** Every session's builds, Playwright runs and renders share one machine. `gt-orchestration` section 2 holds the rule for timing checks under load: record `uptime` beside the reading and rerun a red check once the load drops. While the machine is busy, prefer measures that load cannot change: counts, bytes and deltas.
- **Disk.** A gt-cloud worktree with its install costs about 6 GB, and 48 leftover worktrees filled the disk on 2026-10-05. Remove a scratch worktree as soon as its work is pushed. `gt-ship` section 1 gives the checks to run first and the command for removing many at once.
- **Cleanup.** Cleanup of another session's files goes to that session. Message it, or give Kevin the prompt for its conversation, as he asked for the Codex and gt-cloud logs on 2026-10-05.

## Checklist

- [ ] ListAgents, `git status`, recent commits on the branch and on `origin/main`, and the lane's notes were read before acting.
- [ ] In a fork, only the newest instruction for this lane was acted on, and the parent's open items stayed with the parent or the lane that owns them.
- [ ] The session works on its own branch, worktree and port.
- [ ] Explicit paths were staged and committed with a pathspec, and the branch was checked before the commit (`gt-ship` section 2).
- [ ] A shared push was done once, by its owner, and the other sessions reported the sha they found.
- [ ] Other sessions' in-flight files stayed out of the commit and were named in the report.
- [ ] A heads-up went out before pushing a shared main, and the session fetched and rebased after another session's push.
- [ ] A changed rule reached every session that applies it.
- [ ] A relay note carries the branch, tip, worktree, commits, receipts with exit codes, open list, locks, queued deploys and rebase advice.
- [ ] Servers this session started are stopped, locks are released, `uptime` sits beside timings, and scratch worktrees are removed.

## Sources

- Prototemplate: `skills/gt-ship/SKILL.md` sections 1, 2, 5 and 8; `skills/prototemplate/SKILL.md` sections 8 and 9; `skills/gt-orchestration/SKILL.md` sections 2, 6 and 8; `docs/SHIP-LOOP.md` section 0; `docs/handbook/glossary.md` (working terms).
- Kevin's gt-cloud memory notes `session-lanes-prototemplate`, `ship-loop-hard-gates`, `scratch-worktree-disk`, `lost-work-audit-2026-09`, `gt-motion-films`, `world-language-map`, `blog-lottie-figure`, `signin-field-transition` and `landing-hero-agent-button`.
- The Claude Code transcripts of the gt-cloud project under `~/.claude/projects/`: the fork lineage read from each transcript's inherited `sessionId` and title records; the 2026-08-06 instruction and the four sessions' responses; the 2026-10-03 handover to Videos; the 2026-09-29 and 2026-09-30 messages between the sign-in sessions; the 2026-10-05 messages from New Onboarding and Dashboard and Videos; and the desktop app's notice that another chat's dev server is out of the Browser pane's reach (2026-09-29). The Codex sessions under `~/.codex/sessions/2026/09/` hold the shared-main audit of 2026-09-22 and the relay of 2026-09-26.
- Kevin's messages to Claude Code and Codex from 2026-07-30 to 2026-10-05, for the rulings quoted above. Quotes keep his spelling.
- Dates are in UTC, as the transcripts record them.
