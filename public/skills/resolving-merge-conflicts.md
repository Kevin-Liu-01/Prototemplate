# Resolving Merge Conflicts

1. **See the current state** of the merge/rebase. Run `git status -sb`, inspect conflict markers, and read the conflicting files.

2. **Find the primary sources** for each conflict. Understand deeply why each change was made, and what the original intent was. Read the commit messages, check the PRs, check original issues/tickets.

3. **Resolve each hunk.** Preserve both intents where possible. Where incompatible, pick the one matching the merge's stated goal and note the trade-off. Do **not** invent new behaviour.

4. Discover the project's **automated checks** and run them — typically typecheck, then tests, then format. Fix anything the merge broke.

5. **Finish the merge/rebase.** Stage the resolved files. If rebasing, continue the rebase process until all commits are rebased. If a merge commit is required, commit only when the user requested that workflow or the repo's merge operation requires it.

## Guardrails

- Do not use `git reset --hard`, `git checkout --`, `git restore`, `git clean`, or conflict abort commands unless Kevin explicitly requests them.
- Do not hide unrelated dirty work with a stash. Work with the current tree.
- If a conflict cannot be resolved without choosing product behavior, stop and ask.

Upstream: `github.com/mattpocock/skills/skills/engineering/resolving-merge-conflicts/SKILL.md` at `5d78bd0903420f97c791f834201e550c765699f8`.
