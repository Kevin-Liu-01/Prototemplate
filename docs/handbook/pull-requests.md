# Pull requests and CI

General Translation (GT) keeps its product and its website in gt-cloud, a private monorepo on GitHub. gt-cloud squash-merges pull requests, requires three checks on main (`Validate PR title and Linear issue`, `check-planning-files` and `run-tests`), and is reviewed by bots and by people. Kevin Liu's product and site work lands there as small pull requests, each from its own worktree. Each section below gives a rule for that work, the case that set it, the fix and the skill that holds the procedure. The facts are gt-cloud's as of October 2026, and the methods apply to any GitHub repository with CI and review bots.

## CI signals that mislead

Read a pull request's checks only after its merge conflicts are resolved, and list the branch's runs before blaming the latest push. GitHub runs no `pull_request` workflows while a pull request conflicts with its base, and each push cancels the run in flight, so the checks on the head can describe another commit or none.

| Signal | Cause | Fix |
| --- | --- | --- |
| Checks are stale, cancelled or missing | The branch conflicts with its base (`mergeStateStatus: DIRTY`), so no `pull_request` workflow ran | Merge or rebase first, then read the checks |
| A red e2e on the latest push | The first run to finish reports every commit since the last green one; on 2026-09-29 a red e2e came from a commit five pushes earlier | List the runs and find the first red one |
| The build dies in "Running TypeScript" | The dashboard's type check outgrew Node's default 2GB heap | Raise `--max-old-space-size`; the build has run with 4096 since 2026-09-29 |
| A Playwright strict-mode violation | `getByText(..., { exact: true })` across the page also matches the label inside a closed `<details>` | Scope text lookups inside a `getByTestId` locator |
| `mergeStateStatus: BLOCKED` with every check green | The code-owner review is missing | Request the code-owner review |

```sh
gh pr view <n> --json mergeStateStatus,headRefOid
gh run list --branch <branch> --workflow "CI - Run Tests"   # a trail of cancelled runs hides the first red
```

A required aggregate check fails when any job under it fails. `run-tests` aggregates lint, build, the unit test shards, validate, integration, e2e and db, so a red e2e blocks the merge although e2e is not a required check itself. [gt-ship](../../skills/gt-ship/SKILL.md) section 5 and [review-loop.md](../../skills/gt-ship/references/review-loop.md) hold the check list and what trips each job.

## Review bots

Before acting on a bot's finding, compare the commit it reviewed with the pull request's head. Two review bots on gt-cloud write their summaries into the pull request body between HTML comment markers, and they rerun on different triggers.

| Bot | Reruns | Re-trigger | Reviewed commit |
| --- | --- | --- | --- |
| Greptile | On open only | Comment `@greptile review again` (`@greptile review` the first time); about 4 to 5 minutes | `Last reviewed commit` in its summary |
| Cursor Bugbot | On every push | Comment `bugbot run` | Named in its summary |

Bots review a new pull request within about a minute. On 2026-09-24 a force push a minute after opening refreshed Bugbot and left Greptile's summary describing a diff that no longer existed. An edit to the body right after a force push can also restore Bugbot's stale summary. The bar on gt-cloud is Greptile at 5/5 on the head commit with every bot thread answered and resolved.

- Rewrite only the part of the body above the first bot marker, and keep every bot block byte for byte.
- Classify each finding before acting on it: mine and real (fix, push, reply with the sha, resolve), stale (reply with the commit that removed the code, resolve), not mine (say so and leave it to its owner), or an owner's decision (ask).
- A risk label from an approval bot is a label and needs no reply.
- Reply on each thread with the fixing commit, then resolve it. A thread resolved without a reply still reads as unanswered to a human reviewer.

```sh
gh api graphql \
  -f query='mutation($id:ID!,$body:String!){addPullRequestReviewThreadReply(input:{pullRequestReviewThreadId:$id,body:$body}){comment{url}}}' \
  -F id=PRRT_xxx -f body='Fixed in abc1234: the query is bounded to 100 rows.'
gh api graphql \
  -f query='mutation($id:ID!){resolveReviewThread(input:{threadId:$id}){thread{isResolved}}}' \
  -F id=PRRT_xxx
node skills/gt-ship/scripts/pr-bots.mjs <n>   # exits 0 at 5/5 on the head, no open thread, no conflict, checks green
```

[gt-ship](../../skills/gt-ship/SKILL.md) sections 4 and 5 and [review-loop.md](../../skills/gt-ship/references/review-loop.md) hold the loop, and the [quality bar](quality-bar.md) holds its rows for pull requests.

## Size and shape

A reviewer reads a pull request's line count first. Group the diff by kind before pushing, and justify each large group in the body or cut it. On 2026-10-02 Kevin sent back a release pull request for a redesigned onboarding flow because of its size.

| Part of the release pull request | Size |
| --- | --- |
| The whole pull request | 39.5k lines |
| A record-and-replay parity suite | 24k lines |
| Pretty-printed recorded JSON inside that suite | 18k lines |
| Comments | 20% of the added product lines |
| Tests | 1.2 test lines per product line |

- Verification instruments (recorded fixtures, record-and-replay suites, harnesses, capture scripts, review galleries) live on their own branch or in the scratchpad.
- Each behaviour is tested once, with targeted assertions added to the existing test file.
- A comment says why in one or two lines.
- A pull request carries one concern, and an unrelated repair gets its own.
- Planning Markdown stays out: `check-planning-files` fails on an added Markdown file that reads as a plan.

```sh
node skills/gt-ship/scripts/pr-size.mjs                                # origin/main...HEAD, grouped by kind
node skills/gt-ship/scripts/pr-size.mjs --base origin/<branch below>   # in a stack
node scripts/check-plan-files.mjs --base origin/main                   # in gt-cloud, before pushing
```

Screenshots go in with the first push and are refreshed after every visible change, as before and after crops. Full-page captures in a two-column table render as strips that nobody can read.

| Crop rule | Value |
| --- | --- |
| Clip | The changed elements' bounding boxes plus 24px of padding |
| Width | 420 to 900 CSS px |
| Height | 620 CSS px at most |
| Pairing | The same clip on main and on the branch |
| Layout | `\| Before (main) \| After (this branch) \|` for crops up to 640px wide; wider crops stack full width |
| Themes | Both, where the change has a theme |

[gt-ship](../../skills/gt-ship/SKILL.md) sections 3 and 4 and [pr-body.md](../../skills/gt-ship/references/pr-body.md) hold the size audit and the body's shape.

## Parity for a redesigned flow

A redesign of a sign-in or onboarding flow keeps every tracking call and backend side effect that production has, and the proof is a diff of recorded side effects. A reviewer's list of intended changes proves nothing: one audit called an organization audit event preserved while a later fix had already dropped a field from the event's scope.

1. Record production at the module boundaries for each scenario, in a detached worktree of main.
2. Replay the same scenarios on the release and record the same boundaries.
3. Diff the two ledgers, and run the diff again after every fix.

```sh
git fetch origin
git worktree add --detach ../parity-main origin/main   # production's code, for the recording
```

Additions are allowed only for stricter authorization checks and new recovery paths, and the body lists each one. When parity would mean reporting a step the redesign removed, ask the owner of the flow and fake no event. The record-and-replay suite, the 24k lines above, stays on its own branch. [gt-ship](../../skills/gt-ship/SKILL.md) section 7 holds the gate, and the [decisions log](decisions.md) holds the ruling of 2026-10-02.

## Lints and ratchets

A rule that matters gets a lint that fails on drift, and the lint's design follows from how many sessions edit the code at once.

- A ratchet counts violations per file. Parallel sessions move lines all the time, and a per-file count stays the same when a line moves.
- A baseline above the real count lets a new violation into that file without a failure, so the baseline is lowered after every cleanup.
- A clean exit under `--report` proves nothing, because `--report` drops the failing exit codes.
- A gate never passes when it could not judge: it exits 2 on an HTTP error, a missing file or a state that did not open.
- Every exemption carries its reason in config.

Every Prototemplate lint prints `file:line rule message` and exits 0, 1 or 2, and the [Gates](https://www.prototemplate.com/docs/gates) page of the docs lists them. [gt-lints](../../skills/gt-lints/SKILL.md) sections 1, 4 and 5 and [prototemplate-gates.md](../../skills/gt-lints/references/prototemplate-gates.md) hold the contract.

## Git on shared trees

Before reporting a push, prove it from the remote. When several sessions share a worktree, its branch, its files and its tracking refs can change between two commands.

| Trap | What happened | Fix |
| --- | --- | --- |
| A fast-forward across a `.gitignore` change | It overwrote ignored files at newly tracked paths with no warning (2026-10-10) | Copy the ignored originals aside before the fast-forward |
| A rebuild of history | 32 shell scripts were committed at mode 100644, and lanes that ran them directly failed (2026-10-10) | `git update-index --chmod=+x <files>`, then commit |
| A lease against a stale tracking ref | A force push erased a collaborator's five commits (2026-08-26) | Fetch first, then lease against the sha you expect |
| GitHub's update-branch button | It creates a merge commit on the remote and turns auto-merge off; a force push turns it off too | `git pull --rebase` before the next push, then `gh pr merge --auto` again |
| Two sessions in one worktree | One switched the branch, and two commits meant for a pull request never reached it (2026-09-28) | Check the branch before each commit, and compare the pull request's head with `HEAD` before reporting |
| A listing cut with `head -8` | It hid an existing test file, and a write meant for a new file replaced seven tests | Prove a file is new with `git ls-tree` and `test -f`, and never cut an existence check |

```sh
git fetch origin && git log --oneline HEAD..origin/<branch>              # a collaborator's commits
git push --force-with-lease=<branch>:<expected sha> origin HEAD:<branch>
git branch --show-current                                              # before every commit
gh pr view <n> --json headRefName,headRefOid && git rev-parse HEAD       # before saying "pushed"
git ls-tree origin/main -- <path>; test -f <path> && echo exists         # before writing a "new" file
```

[gt-ship](../../skills/gt-ship/SKILL.md) sections 1 and 2 hold the commit and push rules, and the [multi-session playbook](multi-session-playbook.md) holds the rules for branches that two agents push.

## Sources

- Prototemplate, read on 2026-10-21: `skills/gt-ship/SKILL.md` sections 1 to 7, `skills/gt-ship/references/review-loop.md` and `pr-body.md`, `skills/gt-ship/scripts/pr-size.mjs` and `pr-bots.mjs`; `skills/gt-lints/SKILL.md` sections 1, 4 and 5 and `references/prototemplate-gates.md`; `docs/handbook/quality-bar.md` (Pull requests); `docs/handbook/decisions.md` (2026-10-02).
- gt-cloud's CI workflows, rulesets and review bot behaviour, as `review-loop.md` records them from origin/main on 2026-10-05.
- Kevin's private agent notes on the review bots, pull request size, crops in pull request bodies, the parity gate and the history rebuild of 2026-10-10, dated 2026-08-26 to 2026-10-10.
