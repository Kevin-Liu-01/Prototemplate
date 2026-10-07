# Review bots, checks and Linear on gt-cloud

Detail for section 5 of `gt-ship`. Facts were read from
`generaltranslation/gt-cloud` on 2026-10-05 unless a line gives another date.
Commands run from a gt-cloud checkout with `gh` signed in.

## Who reviews

| Reviewer | Where it writes | Runs | Re-trigger |
| --- | --- | --- | --- |
| Greptile (`greptile-apps`) | a summary block in the PR body with `Confidence Score: N/5` and `Last reviewed commit`, plus review threads | on open; not on every push here | comment `@greptile review` (first run) or `@greptile review again`; about 4 to 5 minutes |
| Cursor Bugbot (`cursor`) | a summary block in the PR body naming the reviewed commit, plus review threads | on every push | comment `bugbot run` |
| Devin (`devin-ai-integration`) | a badge block in the body, sometimes threads | on open | none needed |
| Cursor Approval Agent | a review labelled with a risk level | on open | none |
| Cursor Security Agent | a check run | on open | none |

- Bots review a new PR within about a minute of opening. A force push a
  minute later refreshes Bugbot and leaves Greptile's summary describing the
  old diff. Compare the commit in each summary with the PR head before
  trusting a finding: `scripts/pr-bots.mjs` prints both.
- Greptile enforces repository rules beyond style: database readers live in
  `packages/node`, and queries must be bounded.
- The Approval Agent's "Risk: high, non-blocking, not approved" is a risk
  label. It needs no reply.
- `generaltranslation/content` has no Greptile and no Bugbot (only the Cursor
  Approval Agent), so a Greptile score there cannot be reached. Its "Check for
  unsafe patterns" job runs four validators and `npm test`;
  `validate:reference-links` requires every inline-code CLI command in prose
  (such as `gt login`) to link to its page under
  `/docs/cli/reference/commands/`. Code fences are exempt.

## The loop to 5 of 5

1. Push the fix. Bugbot reruns on its own.
2. Reply on each Greptile or Bugbot thread with the commit that fixes it, then
   resolve the thread. A thread resolved with no reply still reads as
   unanswered to a reviewer.
3. Comment `@greptile review again` and wait about five minutes.
4. Run `node $PROTOTEMPLATE/skills/gt-ship/scripts/pr-bots.mjs <n>`. Repeat
   until it reads 5/5 on the head commit with no unresolved bot thread and
   prints `ready for review`.

Classify every finding before acting on it:

- **Mine and real**: fix, push, reply with the sha, resolve.
- **Stale**: the code it names is gone or rewritten. Reply with the commit that
  removed it, resolve.
- **Not mine**: older code the PR did not touch. Reply saying so and leave the
  fix for its owner; a feature PR does not absorb unrelated repairs.
- **Owner decision**: growth surfaces, tracking, pricing, production policy.
  Ask Kevin.

Reply and resolve through GraphQL. Thread ids (`PRRT_...`) come from
`pr-bots.mjs` or from `pullRequest.reviewThreads(first: 100)`:

```sh
gh api graphql \
  -f query='mutation($id:ID!,$body:String!){addPullRequestReviewThreadReply(input:{pullRequestReviewThreadId:$id,body:$body}){comment{url}}}' \
  -F id=PRRT_xxx -f body='Fixed in abc1234: the query is bounded to 100 rows.'

gh api graphql \
  -f query='mutation($id:ID!){resolveReviewThread(input:{threadId:$id}){thread{isResolved}}}' \
  -F id=PRRT_xxx
```

## Required checks

The ruleset "CI: Require tests to pass" requires three checks on main, with
`strict_required_status_checks_policy` off, so a branch behind main still
merges:

- **`Validate PR title and Linear issue`** (`.github/workflows/pr-policy.yml`).
  The title must be a conventional commit with one of the types `build`,
  `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`,
  `style`, `test`. Only a `feat` PR also needs a linked Linear issue. The
  check asks Linear for attachments on the PR's URL, retrying for about 30
  seconds, so the link can come from a Linear branch name, the issue key in
  the title, a magic word in the body (`Fixes GEN-123`), or attaching the PR
  from Linear's side. It runs again on every body edit, and each run cancels
  the one in flight.
- **`check-planning-files`** (`scripts/check-plan-files.mjs` with
  `scripts/plan-file-detector.mjs`). It scores every Markdown file the PR
  adds, copies or renames. A file fails when it carries a planning identity
  (plan, planning, roadmap or backlog in its name or first heading, or a
  `Status: draft` style line) and scores 4 or more with the other signals:
  a root-level path, two or more execution headings (Next steps,
  Verification, Open questions), two or more unchecked boxes, a PR or branch
  reference. `SKILL.md` and files under `.agents/skills`, `.claude/skills`,
  `.codex/skills` and `.cursor/skills` are exempt; `.plan-file-ignore`
  lists deliberate exceptions. Run it before pushing:
  `node scripts/check-plan-files.mjs --base origin/main`.
- **`run-tests`**, the aggregator of the "CI - Run Tests" workflow. It fails
  when `lint`, `build`, any of the four `unit_tests` shards, `validate`,
  `integration`, `e2e` or `db` fails, so a red e2e blocks the merge although
  e2e is not listed itself. (The jobs were split this way by #5080 on
  2026-10-01; earlier notes name a single `test_validate` job.)

What the jobs run, and what trips them:

- `lint` runs the root `pnpm lint`:
  `node scripts/check-email-identities.mjs && node scripts/check-agent-skills.mjs && oxlint --quiet . && oxfmt --check .`,
  then the root script tests (`pnpm exec vitest run scripts/__tests__`).
  An app's own lint script skips `oxfmt`, so format new and changed files
  with `pnpm exec oxfmt <files>` before pushing. The identities check fails
  on a hardcoded GT address in `from`, `replyTo` or an `*EMAIL*` variable;
  import them from `@generaltranslation/settings/email.js`. The agent
  skills check (#5145, 2026-10-05) validates the SKILL.md files under
  `.agents/skills` and `.claude/skills`, so a PR that edits a gt-cloud skill
  runs it locally first.
- CI checkouts have no docs content: setup-ci initializes only the legal
  submodule. Landing code that reads `apps/landing/content` at build or in
  tests must tolerate the folder being absent (return null, `skipIf` on
  `existsSync`); a throw there reds build, test_validate and run-tests
  together (#5049).
- `e2e` builds the services with `turbo run build:ci`; the dashboard's
  `next build --turbopack` runs with `--max-old-space-size=4096` since #5007
  (2026-09-29), because its type check had outgrown Node's default 2 GB
  heap and died in "Running TypeScript". A type graph that keeps growing
  can reach that ceiling again; the job log names the heap error.
- Playwright's `getByText(..., { exact: true })` across the page throws a
  strict-mode violation once the label also appears inside a closed
  `<details>`. Scope e2e text lookups inside a `getByTestId` locator.
- Each push cancels the CI run in flight, so the first run to finish reports
  every commit since the last green one. Before blaming the latest push for
  a red, list the branch's runs:
  `gh run list --branch <branch> --workflow "CI - Run Tests"`.
- A PR whose `mergeStateStatus` is `DIRTY` conflicts with its base. GitHub
  does not run `pull_request` workflows (CI and `check-planning-files`)
  while a PR has a merge conflict, so the checks on its head can be stale,
  cancelled or missing. Merge or rebase first, then read them.
- `Locadex / i18n` comes from the Locadex staging GitHub App. It is not
  required and reports its own failures.

`mergeStateStatus: BLOCKED` with every check green means the code-owner
review is missing.

## Reviews and Linear

- Review coordination moved to Linear (team announcement, 2026-09-08). Do not
  ask for reviews in Slack; the PR channel is for urgent PRs and P0s only.
- Request reviewers on GitHub (`gh pr edit <n> --add-reviewer <login>`).
  Linear picks the request up through the PR's linked issue and notifies the
  reviewer through its Slack app, so every PR, `fix` included, carries an
  issue before a reviewer is requested.
- Kevin decides who reviews. Ask him before requesting anyone.
  `APPROVAL_POLICY.md` at the gt-cloud root is the routing table he and the
  team use: at most two reviewers, never the author, the most specific
  ownership area first; schema, migration, infrastructure, auth and
  shared-API changes go to the architecture owner and are never approved
  automatically; onboarding, analytics, ad attribution and email go to the
  GTM and operations owner. Kevin owns product design and UI, so his own
  PRs route to an adjacent owner.
- The ruleset "Require Review (with bypass)" asks for one approving review
  and code-owner review. `.github/CODEOWNERS` gives everything to the
  product and infra teams, migrations, the Prisma schema, `infra/` and
  `.github/` to infra, and `pnpm-lock.yaml`, `pnpm-workspace.yaml` and
  `.npmrc` to the security team. A lockfile change therefore also waits on a
  security owner. The team requests GitHub adds from CODEOWNERS show as
  pending reviews; an approval from an owning team's member settles them.
- The Linear MCP connector needs Kevin's authorization in a session, and no
  Linear API key is on the machine. Chrome is not signed in to Linear and an
  agent never signs in. Without the connector, ask Kevin to attach the PR
  from Linear's side, which he has done for the docs and routing PRs.

## Sources

- gt-cloud at origin/main e17fce499 (2026-10-05):
  .github/workflows/pr-policy.yml, .github/workflows/ci.yml (and its
  history: #5007, #5073, #5080, #5145),
  .github/workflows/check-planning-files.yml, scripts/check-plan-files.mjs,
  scripts/plan-file-detector.mjs, scripts/check-email-identities.mjs,
  scripts/check-agent-skills.mjs, package.json (`lint`), .github/CODEOWNERS,
  APPROVAL_POLICY.md.
- GitHub rulesets of generaltranslation/gt-cloud ("Protect Main", "Require
  Review (with bypass)", "CI: Require tests to pass"), and the check runs
  and reviews on #5063, #5095 and #5133, read 2026-10-05. GitHub's Actions
  documentation for the `pull_request` event (no runs while a merge
  conflict stands).
- Claude memory: pr-bot-review-loop.md (2026-09-04 to 2026-10-02),
  pr-stacks-2026-10.md.
- wiki: skills/productivity/agent-iteration-loop/SKILL.md (phases 7 and 8,
  finding classes).
