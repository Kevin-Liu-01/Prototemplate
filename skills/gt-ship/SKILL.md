---
name: gt-ship
description: >-
  How General Translation work moves from a worktree to main: one session
  per lane and one worktree per branch, the commit identity gt-cloud's
  deploys require, staging by explicit path, PR size discipline, the PR body
  with before and after crops, the review bots and required checks, Linear
  and reviewer requests, stacked PRs, the parity gate for onboarding and
  auth, and Prototemplate's rules for a shared checkout, local review and
  its Vercel deploys. Use when committing, opening, describing or updating
  a PR, answering Greptile or Bugbot, restacking after a merge, or landing
  work in gt-cloud or Prototemplate.
metadata:
  title: Branches, PRs and landing
  areas: workflow, lints
  updated: 2026-10-06
  origin: prototemplate
---

# Branches, PRs and landing

Kevin Liu (GitHub `Kevin-Liu-01`) lands General Translation (GT) work
through two repositories with different rules.
github.com/generaltranslation/gt-cloud is the private monorepo of the
product and the website; it squash-merges, requires three checks, is
reviewed by three bots, and takes small PRs from `k/<topic>` worktrees.
github.com/Kevin-Liu-01/Prototemplate is public and Kevin's own; it takes
commits on main after he has reviewed the work on localhost.

`$GT_CLOUD` is a gt-cloud checkout (`~/gt/gt-cloud` on Kevin's machine) and
`$PROTOTEMPLATE` a Prototemplate checkout (`~/repos/Prototemplate`). The PR
body and its screenshots are detailed in
[references/pr-body.md](references/pr-body.md); the bots, the checks and
Linear in [references/review-loop.md](references/review-loop.md); the work
around a PR (approval, grouping, release hygiene, closing, teammates,
upstream, cleanup) in [references/beyond-the-pr.md](references/beyond-the-pr.md). Two
read-only scripts sit in `scripts/`: `pr-size.mjs` groups a branch's diff,
and `pr-bots.mjs` reads a PR's review state. The commands below call them
at `$PROTOTEMPLATE/skills/gt-ship/scripts/`; an installed copy of this
skill carries the same files in its own `scripts/` folder.

## 1. Lanes and worktrees

- **One session per lane.** Kevin runs several named sessions at once
  (Videos, Prototemplate, Turboslide and others). "the videos one should be
  making them, and this one is just for prototemplate work" (Kevin,
  2026-10-03). Work that belongs to another session goes to it: find it with
  ListAgents and send the request by name with SendMessage. A session Kevin
  scoped to one job stays on it and does not drift into PR sweeps.
- **Ask before building another owner's file.** When a page's source lives
  in another repository or session (the CLI's loopback callback page lives
  in github.com/generaltranslation/gt), ask its owner first. On 2026-09-30 a second
  session started that page while its owner was already changing it.
- **Prototemplate ownership, as of 2026-10-05.** `motion/` belongs to the
  Videos session and is untracked in the shared checkout: never stage, edit
  or delete it. The onboarding and dashboard session works in `deck/`,
  `src/components/plate`, `src/app/craft` and `public/brand/mood`, and pushes
  main from its own worktree. The `prototemplate` skill (section 8) keeps
  the full lane map.
- **One worktree per branch.** Start gt-cloud work with
  `git -C $GT_CLOUD fetch origin`, then
  `git -C $GT_CLOUD worktree add -b k/<topic> <path> origin/main` and
  `pnpm install --frozen-lockfile --prefer-offline` in the new worktree.
  Kevin's branches are named `k/<topic>`. On Kevin's machine the primary
  gt-cloud checkout sits on `codex/website-redesign` with old uncommitted
  work; leave it as it is and never switch its branch. Read gt-cloud facts
  from `origin/main` or a fresh worktree, never from that checkout.
- **The branch can change under you.** Two sessions shared the onboarding
  worktree and each switched it between the branches of #4980 and #5021; two
  commits meant for one PR never reached it. Check `git branch --show-current`
  before every commit. Before reporting a push, compare
  `gh pr view <n> --json headRefName,headRefOid` with the current branch and
  `git rev-parse HEAD`. When HEAD descends from the PR head, repair with
  `git branch -f <pr-branch> HEAD && git switch <pr-branch> && git push origin <pr-branch>`.
- **Never push from another session's worktree.** `gt-cloud-wt-docs` and
  `gt-cloud-wt-docs-main` hold stale local copies of `k/docs-locale-switch-rewrite`
  and `k/docs-perf`.
- **Scratch worktrees cost about 6 GB each** with `node_modules`. On
  2026-10-05 a session's scratchpad held 259 GB, most of it 48 leftover
  gt-cloud worktrees, the Mac was down to 27 GB free, and Kevin had to ask
  for the cleanup. Use one per lane or per stack, and remove it as soon as
  its work is pushed:
  1. `git -C <wt> status --short` prints nothing.
  2. `git -C <wt> branch -r --contains HEAD` names a remote branch, or
     `git -C <wt> cherry origin/main` shows no `+` lines.
  3. `git worktree remove <wt>`, then `git worktree prune`.

  For many at once, pass the paths that passed both checks to
  `xargs -P 6 -n 1 git worktree remove --force --force` in the background
  (`git worktree remove` takes one path per call).
  `apps/admin/src/routeTree.gen.ts` rewrites itself during type checks;
  restore it in your own worktree and never count it as work.

## 2. Commits

- **Identity.** gt-cloud's repository config sets Kevin's General
  Translation work identity, and it covers every worktree. gt-cloud's
  Vercel deployments refuse Kevin's commits made under his personal email;
  on 2026-08-26 seven PR commits had to be rewritten. Never set that identity with `--global`: Prototemplate
  and other repositories keep the global one. Check with
  `git log -1 --format='%an <%ae>'` against `git config user.email`, and fix
  a wrong author with `git commit --amend --reset-author` before pushing.
- **The Claude trailer.** Both rulesets on gt-cloud main set
  `require_extra_approval_for_unattributed_changes` (read 2026-10-05). A
  `Co-Authored-By` trailer for Claude adds an author GitHub cannot attribute,
  and the PR then needs a second human approval. The October 2026 branches
  carry the trailer. When Kevin wants a PR merged on one approval, reword
  the commits without it and push with a lease; standing approvals survive
  because `dismiss_stale_reviews_on_push` is off (Kevin, #4795, 2026-09-11).
  The squash commit on main is the PR title with its number, plus a
  `Co-authored-by` line for each co-author on the branch's commits.
- **Stage explicit paths and commit with a pathspec.** Other sessions stage
  into a shared index, and a bare `git commit` publishes all of it (their
  half-done deletions rode into a landing commit on 2026-08-07):

  ```sh
  git status --short
  git add src/app/skills/page.tsx skills/gt-ship
  git commit -F <scratch>/msg.txt -- src/app/skills/page.tsx skills/gt-ship
  git status --short
  ```

  Never run `git add -A` or `git add .` in a shared tree: Prototemplate's
  b56e64c swept 229 files (92 MB) of `motion/` onto main (2026-10-01). Never
  run `git checkout <commit> -- <file>` or `git restore` on a file another
  live session may be editing.
- **Prove a file is new before writing it.** Run
  `git ls-tree origin/main -- <path>` and `test -f <path>`, and never cut the
  listing with `head`. On #4703 a write to
  `apps/landing/__tests__/proxy.test.ts` replaced seven attribution tests
  because a truncated listing hid the file; Greptile caught it. Extend an
  existing file.
- **Messages.** A conventional subject with a plain sentence after the
  scope: `style(landing): hero buttons side by side on phones`,
  `perf(docs): turn off sidebar prefetch and warm rows on intent`. Write the
  message to a file and pass `-F`. zsh feeds heredocs on one `&&` chain in
  operator order, and once put a script into a pushed message (#4689).
- **Force pushes.** `git fetch` first and read
  `git log --oneline HEAD..origin/<branch>` for a collaborator's commits.
  Then push with an explicit lease,
  `git push --force-with-lease=<branch>:<expected sha> origin HEAD:<branch>`.
  A lease against a stale tracking ref erased a collaborator's five commits
  on 2026-08-26. gt-cloud main refuses force pushes.
- **Format before pushing.** The root `pnpm lint` ends in `oxfmt --check .`,
  which the app lint scripts skip, so run `pnpm exec oxfmt <changed files>`.
  The lint rules themselves are in `gt-lints`.

## 3. PR shape

Kevin reads a PR's line count first, and so do the reviewers: "why are
there dashboard css additions in 5063? and why is it so many lines?"
(Kevin, 2026-10-01), then "why is 5063 39.5k lines? fix this."
(Kevin, 2026-10-02).

- **Measure before pushing.** From the branch's worktree:

  ```sh
  git fetch origin
  node $PROTOTEMPLATE/skills/gt-ship/scripts/pr-size.mjs                 # origin/main...HEAD
  node $PROTOTEMPLATE/skills/gt-ship/scripts/pr-size.mjs --base origin/<branch below>   # in a stack
  ```

  It runs `git diff --numstat` over the range, groups the files as product,
  tests, fixtures, scripts, assets, docs, lockfile and generated, and prints
  the comment share of added product code, the test lines per product
  line, the largest files and a note per group a reviewer will ask about.
  Justify every large group in the body, or cut it.
- **Verification instruments stay out.** Recorded fixtures, record and
  replay suites, harnesses, capture scripts, contact sheets and review
  galleries live on their own branch (`k/onboarding-parity-suite`) or in
  the scratchpad. #5063 carried 24k lines of parity suite, 18k of them
  pretty-printed recorded JSON. A review gallery Kevin asks for lives
  outside the PR: the sign-in and onboarding states run in Prototemplate at
  `/d/production/signin?state=<id>`.
- **Comments say why, in one or two lines.** Comments were 20% of #5063's
  added product lines.
- **Each behaviour is tested once.** #5063 ran 1.2 test lines per product
  line. Add targeted assertions to the existing test file.
- **One concern per PR.** An unrelated repair goes to its own PR with its
  own reviewer.
- **No planning Markdown.** The required `check-planning-files` check fails
  on a new Markdown file that reads as a plan; specs and context files stay
  in the scratchpad. Run `node scripts/check-plan-files.mjs --base origin/main`.
- **A lockfile change** brings the security team in as a required code
  owner, so name the dependency change in the body.
- **Titles** are conventional commits: `type(scope): sentence`, with the
  app as scope (`landing`, `dashboard`, `docs`, `blog`). The allowed types
  are `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`,
  `revert`, `style` and `test`. A `feat` PR needs a linked Linear issue;
  the other types pass without one. The title becomes the squash commit's
  subject on main.
- **Kevin decides the grouping,** and an unready dashboard feature ships
  behind a feature flag or not at all (`references/beyond-the-pr.md`).

## 4. The PR body

Full rules, an example and the upload commands are in
[references/pr-body.md](references/pr-body.md).

- A two-sentence summary, then **What to look at** grouped by surface with
  that surface's crops, then short sections for lints, parity, dependencies
  and **Checks** with counts. Under about 500 words, written to `gt-voice`.
- Screenshots go in from the first push and are refreshed after every
  visible change: "add the screenshots of this to the pr the whole time"
  (Kevin, 2026-09-25).
- Crop to the changed elements: their bounding boxes plus 24 px,
  420 to 900 CSS px wide, at most 620 tall, the same clip on main and the
  branch, in a `| Before (main) | After (this branch) |` table with one bold
  caption line. Both themes where the change has a theme.
- Images go on gt-cloud's `pr-assets` orphan branch under
  `screenshots/pr-<n>/` and are linked with `blob/pr-assets/...?raw=true`.
- The Devin, Cursor and Greptile blocks inside the body stay byte for byte.
  Rewrite only the part above the first bot marker
  (`<!-- devin-review-badge-begin -->`, `<!-- CURSOR_SUMMARY -->` or
  `<!-- greptile_comment -->`), through `gh pr view <n> --json body` and
  `gh pr edit <n> --body-file`. A body can hold markers of its own above
  them, such as `<!-- screenshots-begin -->`.
- Check every claim against the code and the images before publishing.

## 5. Review bots and checks

Commands and the full check list are in
[references/review-loop.md](references/review-loop.md).

- **Greptile** writes its score into the body and does not rerun on every
  push here. Re-trigger with `@greptile review` the first time and
  `@greptile review again` after; it takes about five minutes. The target
  is 5/5 on the head commit with every Greptile thread resolved.
- **Cursor Bugbot** reruns on every push; `bugbot run` re-triggers it.
  Devin and the Cursor Approval Agent comment on open; the Approval Agent's
  risk label needs no reply.
- **Answer, then resolve.** Reply on each bot thread with the fixing sha
  through `addPullRequestReviewThreadReply`, then call `resolveReviewThread`.
  A thread resolved without a reply still reads as unanswered.
- **Read the state with the script:**

  ```sh
  node $PROTOTEMPLATE/skills/gt-ship/scripts/pr-bots.mjs <n>
  ```

  It prints the title type, each bot summary with the commit it reviewed
  against the head, the unresolved and unanswered threads with their ids,
  and the standing run of each required check. It exits 0 only when
  Greptile reads 5/5 on the head, no bot thread is open, the branch has no
  conflict with its base and the three required checks are present and
  green.
- **Required checks** on gt-cloud main: `Validate PR title and Linear issue`,
  `check-planning-files` and `run-tests`. `run-tests` aggregates `lint`,
  `build`, the four `unit_tests` shards, `validate`, `integration`, `e2e`
  and `db` (ci.yml on main, 2026-10-05). `mergeStateStatus: BLOCKED` with
  every check green means the code-owner review is missing; `DIRTY` means
  the branch conflicts with its base.
- **Cancelled runs hide older breakage.** Each push cancels the run in
  flight, so a red can come from a commit several pushes back:
  `gh run list --branch <branch> --workflow "CI - Run Tests"`.
- **The content repository** (`generaltranslation/content`) has no Greptile
  and no Bugbot; a score there cannot be reached.
- **Reviewers.** Request them on GitHub (`gh pr edit <n> --add-reviewer <login>`)
  so Linear notifies them through its Slack app; review requests in Slack
  stopped with the team announcement of 2026-09-08. Kevin chooses who
  reviews, so ask him first; `APPROVAL_POLICY.md` is the routing table.
- **Kevin merges.** An agent merges a PR only when Kevin says so in the
  session.

## 6. Stacks

Stack PRs that share files, so the same conflicts are resolved once: the
2026-10-05 dashboard PRs shared up to 37 files with each other.

- **Order.** The bottom PR is based on main; each PR above is based on the
  branch below it. Every PR above the bottom opens its body with
  `Stacked on #<n>. Merge that first.`
- **Native stacks.** "i meant use the actual pr stack feature" (Kevin,
  2026-10-05). Link a chain with the `github/gh-stack` extension from any
  checkout whose origin is gt-cloud:

  ```sh
  gh stack link --base main <bottom> <next> <top>    # PR numbers, bottom first
  gh stack link <stack-number> <pr>                  # adds a PR to the top of a stack
  gh stack merge <stack-number | pr-number>          # merges every PR up to that one, all or nothing
  ```

  Pass PR numbers for PRs that exist: a branch argument is pushed first and
  gets a new PR if it has none. A native stack merges atomically, so it
  needs no restack between merges. `gh stack merge` asks for confirmation
  only in an interactive terminal; from an agent's shell it merges at once,
  so run it only when Kevin says to merge (section 5).
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
- **Body edits race Bugbot.** An edit right after a force push can restore
  Bugbot's stale summary; read the body again and comment `bugbot run`.

## 7. The parity gate

"i also really really want to emphasize that we need the new onboarding to
keep all the tracking and backend stuff that the old onboarding did"
(Kevin, 2026-10-02). Parity with production is a release gate for any
onboarding or auth redesign.

- **What must match production:** PostHog event names and properties; the
  ad conversions for Google, Meta, Reddit and OpenAI; audit-log payloads
  (type, actor, resource, scope, description, and whether the write fails
  closed or open); the signup Slack pager; Attio qualification; product
  emails; Stripe calls; cookies, redirects and localization.
- **Allowed additions:** stricter authorization checks and new recovery
  paths. List each one in the PR body.
- **A step that no longer exists:** when parity would mean reporting a UI
  step the redesign removed, ask Kevin. Never fake an event.
- **Proof.** Record production at the module boundaries for each scenario in
  a detached `origin/main` worktree, replay the same scenarios on the
  release, and diff the two ledgers. Re-run the diff after every fix: the
  first audit of #5063 called the organization audit event preserved, and a
  later fix dropped `projectId` from its scope. A reviewer's list of
  intended changes is not evidence.
- **What ships:** only targeted assertions in existing tests for effects
  nothing else pins. The record and replay suite stays on
  `k/onboarding-parity-suite` and in the scratchpad (section 3).

## 8. Prototemplate

- **The repository.** github.com/Kevin-Liu-01/Prototemplate, public. One
  working tree at `$PROTOTEMPLATE` is shared by several sessions. The dev
  server runs at http://localhost:3005 (launch config `prototemplate-dev`)
  with hot reload; reuse it and never stop it.
- **Explorations stay local until Kevin says to land them.** "wait what
  they're on main? they shouldn't be pushed, I should be reviewing them
  locally" (Kevin, 2026-09-14). Main deploys www.prototemplate.com, the
  reference that basement.studio, the agency building GT's visual
  identity, sees. Landing is his call per round.
  When he says to land, push the committed HEAD he reviewed; the working
  tree holds other sessions' edits, so never commit it blind. Never rewrite
  shared main history to undo a mistake without Kevin.
- **Before committing:** `git fetch origin main` and
  `git log --oneline HEAD..origin/main`. Other sessions push main from
  their own worktrees; bring their commits in first. Sweep for conflict
  markers and stop on any hit:
  `grep -rln '^<<<<<<< ' src docs deck scripts skills`. Kevin's own GitHub
  Desktop operations left markers in a shared tree mid-round on 2026-08-07.
- **Gates:** the list in `prototemplate` section 9 (tsc, `pnpm lint:all`,
  `check:pages` on the touched pages, both themes at 1440 and 390, the
  build). What each gate checks is in `gt-lints`.
- **The build gate runs in a scratch worktree.** The dev server owns the
  shared `.next`, so never build there:

  ```sh
  git -C $PROTOTEMPLATE worktree add --detach <scratch>/proto-build HEAD
  # copy in the uncommitted files the change needs, path by path
  cd <scratch>/proto-build
  pnpm install --frozen-lockfile --prefer-offline
  pnpm build > <scratch>/proto-build.log 2>&1 && echo BUILD_OK || tail -40 <scratch>/proto-build.log
  ```

  `pnpm build` runs the picture lint before `next build`. The gate is `&&`:
  a `;` pushed a broken build to main on 2026-08-07, and
  `pnpm build | tail` did it again on 2026-08-11, because a pipeline's exit
  status is the last command's. `next start` can serve a stale `.next`
  after a rebuild; delete `.next` in the scratch tree before diagnosing.
  Remove the scratch worktree afterwards. `gt-lints` section 5 holds the
  same gate hygiene for every gated command.
- **Commit** with explicit paths (`src/`, `public/`, `docs/`, `deck/`,
  `scripts/`, `skills/`) and a pathspec. `motion/` is never staged.
- **Two Vercel projects build every push:** the team project
  `general-translation/prototemplate` (www.prototemplate.com) and Kevin's
  personal project (prototemplate.vercel.app), each with a Production
  deployment for main and a Preview for any other branch. A red "push
  failed" can come from any of the four. GitHub shows one deployment per
  commit with one status per project: the team's URL ends in
  `-general-translation.vercel.app`, the personal one's in
  `-kl01s-projects.vercel.app`.
- **After pushing main,** read the deployment statuses and the live asset
  stamp:

  ```sh
  sha=$(git rev-parse HEAD)
  gh api "repos/Kevin-Liu-01/Prototemplate/deployments?sha=$sha" --jq '.[] | "\(.id) \(.environment)"'
  gh api repos/Kevin-Liu-01/Prototemplate/deployments/<id>/statuses --jq '.[] | "\(.state) \(.environment_url)"'
  curl -s https://www.prototemplate.com/ | grep -oE 'dpl_[A-Za-z0-9]+' | sort -u
  vercel inspect <the -general-translation.vercel.app url> --scope general-translation
  ```

  The chunk URLs on www carry `?dpl=<deployment id>`. The longest id the
  grep prints must equal the `id` that `vercel inspect` prints for the team
  deployment of your commit, and that deployment's Aliases list
  https://www.prototemplate.com. `vercel inspect` has kept running after
  printing; stop it once the id is out. Check www.prototemplate.com itself:
  the personal alias belongs to the other project and can serve a
  different build.
- **When a build fails:** a blocked build shows as UNKNOWN in `vercel ls`,
  and `vercel api /v13/deployments/<id> --scope general-translation` gives
  `readyStateReason` and `errorMessage`. Retry a flaky preview with
  `vercel redeploy <failed url> --scope general-translation`, which posts
  fresh statuses. An empty commit is never the retry. Google faces are self
  hosted under `public/fonts/google` because Turbopack's Google loader
  failed builds at random (vercel/next.js#99114); a new face goes into the
  `WANT` table of `scripts/fetch-google-faces.py` and loads through
  `next/font/local`. If a team build reports "Only repositories in
  github.com/generaltranslation are allowed", the git-source policy that
  froze the site from 2026-09-01 to mid-September is back; tell Kevin.
- **Never run `vercel --prod` on the team scope** unless Kevin says so.

## Review checklist

- [ ] The work belongs to this session's lane; no other session's paths
      were touched (`motion/` in Prototemplate).
- [ ] `git branch --show-current` equals the PR's `headRefName`, and after
      the push `headRefOid` equals HEAD.
- [ ] gt-cloud commits carry the repository's work identity; the Claude
      trailer matches the approvals Kevin wants.
- [ ] Explicit paths staged, pathspec commit, `git status` read before and
      after.
- [ ] Every file written as new was proven absent on `origin/main`.
- [ ] `pr-size.mjs` read and every large group justified; no fixtures,
      harnesses, galleries or planning Markdown in the diff.
- [ ] Comments are one or two lines; each behaviour is tested once.
- [ ] Conventional title; a `feat` PR is linked to a Linear issue.
- [ ] Body: two-sentence summary, What to look at with crops on
      `pr-assets`, Checks with counts, bot blocks byte for byte.
- [ ] `pr-bots.mjs` exits 0 (Greptile 5/5 on the head, no open bot
      thread, no conflict, required checks green) and lists no unanswered
      bot thread; the cancelled CI runs on the branch were read.
- [ ] Reviewers requested on GitHub, only those Kevin chose.
- [ ] In a stack: the base is the branch below, the first body line names
      it, and the range-diff shows each commit preserved.
- [ ] Onboarding or auth: the parity ledgers match and every addition is
      listed.
- [ ] Grouped as Kevin asked; no dev code in the release, unready
      dashboard features flagged, a close only for a change on main, and
      the overlap check run (`references/beyond-the-pr.md`).
- [ ] Prototemplate: Kevin said to land; origin/main fetched and merged;
      marker sweep clean; tsc, `lint:all` and `check:pages` pass; the
      build gate passed with `&&` in a scratch worktree; deployment
      statuses green; www's `dpl` stamp equals the team deployment.
- [ ] Scratch worktrees removed and pruned.

## Related skills

Prototemplate: `gt-voice` (commit and PR prose), `gt-lints` (the gates in
both repositories), `gt-graphics` (capture recipes for PR screenshots),
`gt-reporting` (the PR slate), `gt-verify` (done means deployed),
`prototemplate` (the repository and its viewer). Wiki:
`agent-iteration-loop` (the general implement, verify, review loop),
`agent-browser`, `linear`, `split-to-prs`, `resolving-merge-conflicts`,
`gh-address-comments`. gt-cloud: `pr-desc`, `gt-testing`.

## Sources

- gt-cloud at origin/main e17fce499 (2026-10-05):
  .agents/skills/pr-desc/SKILL.md; .github/workflows/pr-policy.yml,
  ci.yml and check-planning-files.yml; scripts/check-plan-files.mjs and
  plan-file-detector.mjs; package.json (`lint`); .github/CODEOWNERS;
  APPROVAL_POLICY.md.
- gt-cloud on GitHub, read 2026-10-05: the rulesets "Protect Main",
  "Require Review (with bypass)", "CI: Require tests to pass" and "Disable
  Force Pushes"; repository settings (squash merges only with the PR title
  as subject, branches deleted on merge); the `pr-assets` branch; PRs
  #4703, #4707, #4815, #5021, #5029, #5054, #5063, #5095 and #5133 (bodies,
  commit authors, check runs); the `github/gh-stack` v0.2.0 help for `link`
  and `merge`.
- Prototemplate: docs/SHIP-LOOP.md (sections 1 to 4 and 7); ARCHITECTURE.md
  ("The mirror"); package.json (`build`, `lint:all`, `check:pages`);
  scripts/lint-lines.mjs and scripts/pagecheck/pagecheck.mjs (the 3005
  default); public/fonts/google/README.md; GitHub deployments of
  Kevin-Liu-01/Prototemplate, `vercel inspect` of the team deployment and
  www.prototemplate.com, read 2026-10-05.
- Kevin's wiki (`~/repos/Kevin-Wiki`, live copy `~/repos/Kevin-Wiki-v3`):
  skills/productivity/agent-iteration-loop/SKILL.md.
- Claude memory (gt-cloud project): pr-size-discipline.md,
  pr-bot-review-loop.md, pr-screenshots-and-gallery.md,
  gt-commit-identity.md, pr-stacks-2026-10.md, onboarding-parity-rule.md,
  explorations-stay-local.md, prototemplate-deploy-policy.md,
  ship-loop-hard-gates.md, scratch-worktree-disk.md,
  session-lanes-prototemplate.md, lost-work-audit-2026-09.md,
  signin-field-transition.md, prototemplate-plate-port.md,
  landing-deploy-failures.md, zsh-shell-traps.md, basement-engagement.md.
- Kevin's directives: commit on approval (2026-08-02); grouping and the
  feature-flag rule (2026-09-03); the work identity (2026-08-26);
  explorations stay local (2026-09-14); one approval without the trailer (#4795, 2026-09-11);
  screenshots in the PR the whole time (2026-09-25); the readable PR page
  (#5007, 2026-09-28); the size of #5063 (2026-10-01 and 2026-10-02);
  onboarding parity (2026-10-02); one session per lane (2026-10-03);
  stacks and the native stack feature (2026-10-05).
