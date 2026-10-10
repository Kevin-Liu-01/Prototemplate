# Stacks built by hand

Detail for section 6 of `gt-ship`, moved out of `SKILL.md` on 2026-10-10 to
keep the skill under its size budget. A native stack (`gh stack`, section
6) needs none of this; these steps are for a chain of PRs linked only by
their base branches.

- **Building a chain by hand.** One worktree for the whole stack. For each
  PR, bottom first: list its own commits (`git log --oneline <old base>..<branch>`),
  move them with `git rebase --onto <branch below> <old base point> <branch>`,
  or merge the branch below when the branch holds someone else's commits.
  On a conflict, keep everything the lower PR has and re-apply the upper
  PR's intent; record each conflict in the commit or merge message. Then
  check `git range-diff <old base>..<old head> <new base>..<new head>` and
  that `gh pr diff <n> --name-only` lists only the PR's own files. Push with
  a lease and set the base with `gh pr edit <n> --base <branch below>`.
- **After a squash merge of the bottom** (manual chains). GitHub deletes the
  merged branch and retargets the next PR to main, but that branch still
  holds the old bottom commits and its diff shows them again. Run
  `git rebase --onto origin/main <old bottom head> <branch>` and push with a
  lease. Where a branch has others' commits, merge `origin/main` into it
  instead (conflicts land in files the stack changed; keep the branch's
  version when it is the base's final tree plus additions), then merge it
  down the rest of the stack in order. When main brought a lockfile change,
  run `pnpm install` and build the dependencies before type checking.
