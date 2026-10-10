# Around the PR

Detail for section 3 of `gt-ship`. These rules cover the work around a pull
request: when to commit, who decides how changes are grouped, what a release
may carry, when a PR is closed, how to build on a teammate's or an upstream
branch, and the cleanup after landing. They come from Kevin's messages
between 2026-07-29 and 2026-10-05. Sections 5 and 8 of the skill still hold:
an agent merges only when Kevin says so, and Prototemplate lands only on his
approval through the `&&` build gate.

## 1. Commit on approval

- When Kevin approves a change ("perfect well done ... commit and push",
  2026-08-02), commit and push it at once to every target he named.
- When he picks a favourite among variants, put his verdict in the commit
  message.
- Before a big new task, confirm that the tree is clean and pushed.

## 2. Kevin's personal repositories

- The loop in his own repositories is commit, push main, deploy, then verify
  production.
- When Kevin says so, a slow optional suite may trail the push. Write the
  incomplete check down and fix its failures in a follow-up (2026-10-02).
- This loop never relaxes Prototemplate's land-on-approval rule and its
  `&&` build gate (section 8), or gt-cloud's PR flow.

## 3. Grouping is Kevin's call

- Kevin decides whether a change goes on the same PR, a new PR, one big PR
  or a stack: "keep this on the same pr" (2026-09-03), "group it all into a
  big pr" (2026-09-14).
- Split out a change a stakeholder objected to, so it does not block the
  rest.
- Remove an unrelated page that a sweep turned up.
- A tweak after a merge goes in a new small PR.
- A redesign PR removes as little from main as it can and follows main's
  file conventions (2026-08-07).

## 4. Release hygiene

- A release PR ships no galleries, stand-ins, test-only hooks, dev routes or
  temporary testing code. Kevin, 2026-10-01: "this should have been
  onbvious". Section 3 of the skill keeps verification instruments on their
  own branch.
- No npm package is added for one feature when existing code does the job
  ("do we use cheerio anywhere?", 2026-08-28).
- A dashboard feature that is not ready or not announced ships behind a
  feature flag or not at all. It is never live by default. A teammate's
  review of 2026-09-03 asked for an immediate flag or removal of a page that
  had shipped without one. gt-cloud reads flags with `isFeatureEnabled` in
  `packages/node/src/database/featureFlags/` and manages them in the admin
  app.

## 5. Closing a PR

- Close a PR only when its change is already on main. The closing comment
  names the merged PR that carries the change, and the branch stays.
- Obsolete, partly shipped or rewrite-needed PRs stay open and go to Kevin
  (2026-10-02: "only delete prs that are already in the codebase").
- The PR slate that lists close candidates is in `gt-reporting` section 5.

## 6. Before merging over recent work

- Check a teammate's content PR, a third-party PR or a bot's data-loss
  warning against the code, so nothing already landed is undone (content#517
  on 2026-09-07; a Devin comment on #4825 on 2026-09-15).
- For suspected lost work:
  1. Find the PR and check whether it merged, was reverted or never merged.
  2. Identify the change that undid it.
  3. Inventory other lost commits with `git cherry -v origin/main <branch>`
     and the unpushed local branches.

  The audit of 2026-09-08 found the routing PR #4359 open with every commit
  intact, and it merged the next day.
- **Line survival** tells whether merged work was clobbered. For each of
  the author's merged PRs, count the share of its added lines that still
  exist verbatim on main, then trace every removed line to a stated
  follow-up or a later PR. On 2026-09-08 Kevin's seven PRs read 91 to 100
  percent, and every removal traced to a stated follow-up; the same pass
  found another PR that had deleted two teammates' pages, restored 1 h 44 min
  later.

## 7. Simplicity in the bot sweep

- Verify each finding before changing code ("is this an actual issue",
  2026-08-24).
- Answer a speculative finding about a rare case with a reason instead of
  code.
- Keep the simplest correct design. #5091 grew `createManagedOrg` from 179
  to 417 lines while chasing low-probability findings and was cut back, with
  the title and body leading with the problem (2026-10-02).
- A tiny UI change that sets off a wave of bot warnings has grown past its
  scope (2026-09-12).

## 8. Teammates' branches

- Pull before every edit on a teammate's branch.
- Their PR keeps its scope plus fixes to its own defects. A larger change of
  yours goes in a PR stacked above it, with GitHub's real base branch
  (2026-08-27; section 6 of the skill).
- Never replace a colleague's assets. Pull them from their branch
  (2026-09-03).

## 9. Upstream open source

- Open one clean PR per fix or feature, each branched from upstream's latest
  main.
- Write it in Kevin's PR voice (`gt-voice`, Code comments, commits and PR
  descriptions), with screenshots carrying the story.
- Fix a review bot's comment only where it is legitimate (2026-10-03,
  2026-10-05).

## 10. Values that do not exist yet

When a feature needs an external value that is not published yet, such as
the id of an announcement post, ship a sensible interim and prepare the swap
PR separately. Keep the interim out of the content repository (2026-08-18:
"use a random gt tweet for now").

## 11. Merging on relayed approval

When Kevin relays the CEO's approval and says to merge, merge the round and
gate or comment out an unfinished page instead of holding the release
(2026-08-16: "everything is APPROVED so we can merge"). Section 5 of the
skill still holds: an agent merges only when Kevin says so.

## 12. After landing

- Delete the old code path a migration replaced.
- Classify each lane branch as landed, equivalent or carrying unlanded
  commits, then close the landed ones.
- Done means deployed and serving (`gt-verify` section 7).

## 13. Where a change ships

- A landing change ships to its gt-cloud PR branch. After the merge, its
  fixes are ported to the Prototemplate mirror (`prototemplate` section 1,
  Keeping the hub current).
- The PR slate format is in `gt-reporting`.

## 14. Cutting a release from a stack

When Kevin wants part of a stack out first as one PR against main
(#5063 on 2026-09-30: the onboarding release cut from a four-PR stack whose
shell PR stayed open):

1. Build the tree without touching a branch:
   `git merge-tree --write-tree --merge-base=<branch below the part> origin/main <top of the part>`.
   Parse its `CONFLICT` lines with Python, the tool the 2026-09-30 cut
   settled on: the modify/delete lines end in "left in tree.".
2. In a fresh worktree from `origin/main`, `git read-tree --reset -u <tree>`.
   Resolve each conflict toward the part being released, then add, file by
   file, the foundations it needs from the branches below (a stylesheet
   import, a toggle component, one dependency).
3. Keep the install frozen. Add only the lockfile importer lines the
   change needs; a non-frozen install rewrote about 200 unrelated lines.
4. Run every gate on the cut before opening the PR (types in each package,
   lint, format, tests, a production build), then the release hygiene of
   section 4 and, for onboarding or auth, the parity gate (`gt-ship`
   section 7).
5. The stacked PRs stay open as history until the release merges; then
   close each one naming the release PR (section 5). A PR stacked on the
   cut part rebases onto main after the merge.

## Sources

- Kevin's messages to Claude Code and Codex from 2026-07-29 to 2026-10-05,
  quoted with his spelling: commit on approval (2026-08-02), grouping
  (2026-09-03 and 2026-09-14), release hygiene (2026-08-28, 2026-10-01),
  closing PRs (2026-10-02), the bot sweep (2026-08-24, 2026-09-12,
  2026-10-02), teammates' branches (2026-08-27, 2026-09-03), upstream PRs
  (2026-10-03, 2026-10-05), the interim value (2026-08-18), the relayed
  approval (2026-08-16) and the personal-repository loop (2026-10-02).
- gt-cloud: `packages/node/src/database/featureFlags/isFeatureEnabled.ts`
  and `apps/admin/src/components/featureFlags/` at origin/main e17fce499
  (2026-10-05); PRs #4359, #4825 and #5091; content#517.
- Claude memory notes for gt-cloud: lost-work-audit-2026-09,
  recordly-pr-style, pr-stacks-2026-10, signin-field-transition (the
  release cut, added 2026-10-10).
- `docs/handbook/decisions.md` (the feature-flag and PR-closing rulings).
