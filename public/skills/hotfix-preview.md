# hotfix-preview

## When to use

A fix is on `dev` and needs to reach `preview` (and then prod) immediately.
The full `/promote` flow creates a changelog PR that needs review and merge.
This skill skips the PR and cherry-picks directly.

## Rules

- The commit must already exist on `dev`. Do not cherry-pick unmerged work.
- Cherry-pick creates a new SHA on `preview`. The original SHA stays on `dev`.
  Both branches contain the same diff; history diverges by one merge-base commit.
  This is fine — `/promote` reconciles them on the next full promotion.
- Never force-push `preview` or `dev`.

## Task

```bash
set -euo pipefail

REMOTE="${REMOTE:-upstream}"
git fetch "$REMOTE" dev preview
SHA="${1:-$(git rev-parse "$REMOTE/dev")}"

# Validate the commit exists on dev
if ! git merge-base --is-ancestor "$SHA" "$REMOTE/dev"; then
  echo "error: $SHA is not on $REMOTE/dev" >&2
  exit 1
fi

# Cherry-pick onto preview in an isolated temporary worktree.
# Do not switch the caller's checkout; shared agent worktrees may contain
# unrelated uncommitted work or running dev servers.
WT="$(mktemp -d "${TMPDIR:-/tmp}/hotfix-preview.XXXXXX")"
git worktree add --detach "$WT" "$REMOTE/preview"

if ! git -C "$WT" cherry-pick "$SHA"; then
  echo "error: cherry-pick conflicted; worktree kept at $WT for resolution" >&2
  exit 1
fi

NEW_SHA="$(git -C "$WT" log -1 --format='%h')"
NEW_SUBJECT="$(git -C "$WT" log -1 --format='%s')"
git -C "$WT" push "$REMOTE" HEAD:preview
git worktree remove "$WT"

# Show result
echo ""
echo "Cherry-picked $(git rev-parse --short "$SHA") onto preview as $NEW_SHA — $NEW_SUBJECT"
```

<!-- folded-skills:auto:start -->
## Folded Skill References

These former standalone skills are bundled here as references to keep the runtime list compact. Load only the reference that matches the user's exact product, framework, or failure mode.

| Former skill | Reference | Description |
| --- | --- | --- |
| `claude-hotfix-preview` | [`references/skills/claude-hotfix-preview/SKILL.md`](references/skills/claude-hotfix-preview/SKILL.md) | Cherry-pick a commit from dev onto preview without a PR. Use for urgent fixes that can't wait for a full promote cycle. |
| `dedalus-hotfix-preview` | [`references/skills/dedalus-hotfix-preview/SKILL.md`](references/skills/dedalus-hotfix-preview/SKILL.md) | Cherry-pick a commit from dev onto preview without a PR. Use for urgent fixes that can't wait for a full promote cycle. |
<!-- folded-skills:auto:end -->
