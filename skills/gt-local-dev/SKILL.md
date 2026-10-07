---
name: gt-local-dev
description: >-
  How General Translation apps run locally so Kevin can review and try
  them: the review servers and their ports (the gt-cloud landing on 3001,
  Prototemplate on 3005, the dashboard environment on 1355), the order of
  checks when he cannot see a change, the per-worktree dashboard dev
  environment with a seeded session, the /dev/states gallery and the
  Stripe stand-in, real providers only with his approval, a CLI login he
  can try without touching his credentials, and keeping servers current
  and few. Use when starting, restarting or debugging a local server for
  GT work, when Kevin asks to see or try something locally, or when
  setting up a new machine or worktree.
metadata:
  title: Review servers and local environments
  areas: workflow, website
  updated: 2026-10-05
  origin: prototemplate
---

# Review servers and local environments

Kevin reviews General Translation (GT) work in a running app. This skill records how those apps run on his machine: which server serves what, how to find out why a change does not show, how to run the dashboard with a signed-in session and no live integrations, and how to let him try a build himself without touching his accounts.

Most of these apps live in gt-cloud, GT's private product monorepo on turbo and pnpm. It holds the dashboard (dash.generaltranslation.com), the landing site with the docs and blog (generaltranslation.com), the API, Locadex, the admin app and the shared packages. Prototemplate is Kevin's public hub for GT's design canon, and `generaltranslation/gt` holds the open-source libraries and the `gt` CLI.

`$GT_CLOUD` is a gt-cloud checkout (`~/gt/gt-cloud` on Kevin's machine), `$PROTOTEMPLATE` a Prototemplate checkout (`~/repos/Prototemplate`), `$GT` a checkout of the public `generaltranslation/gt` repository (`~/gt/gt`) and `<scratch>` the session's scratchpad. The landing's worktree steps, build traps and caches belong to gt-website section 2, worktree creation and removal to gt-ship section 1, and page captures to gt-aesthetic. gt-cloud's `README.md`, `dev-infra/README.md` and setup scripts own their tools, and this skill points to them.

## 1. Review servers

As of 2026-10-05:

| Server | URL | Serves | Rule |
| --- | --- | --- | --- |
| gt-cloud landing under review | http://localhost:3001 | the worktree of the branch Kevin is reviewing | Kevin's review server: up, on that branch, at its latest commit |
| Prototemplate | http://localhost:3005 | `$PROTOTEMPLATE`, launch config `prototemplate-dev` | shared by several sessions: reuse it and never stop it (gt-ship section 8) |
| Dashboard dev environment | `http://dashboard-<id>.localhost:1355` | a worktree's `pnpm dev-env`, through the portless proxy | one short id per worktree (section 4) |
| Other worktree servers | 3011 to 3031 and 3080 so far | one launch entry per worktree | a port far from the defaults |

- Restart 3001 the moment Kevin asks ("make sure localhost 3001 is up", Kevin, 2026-08-17). When a review spans several open PRs, 3001 has served a preview branch that merges their tips (`k/preview-restart`, an octopus merge of the landing page branches, 2026-08-11). Name the PR heads such a branch holds.
- The named entries live in the primary checkout's `.claude/launch.json` (untracked, local to Kevin's machine). On 2026-10-05 its `preview-landing` entry still serves 3001 from the August preview worktree; point it at the branch under review before starting it. Entries reuse ports: 3000 appears three times, and 3005, 3011, 3015 and 3016 twice each. Check the port before every start. For Prototemplate, start `prototemplate-dev`. The older `prototemplate` entry, also listed on 3005, runs `pnpm start`, which serves a production build with `next start`.
- A landing worktree's own `pnpm dev` always binds 3001, so every other landing worktree runs `next dev --port <port>` from its launch entry (gt-website section 2).
- gt-cloud's defaults collide with the review servers. A root `pnpm dev` (`turbo watch dev listen`) starts every app: the dashboard on 3000, the landing on 3001, admin on 3002, Locadex on 3003 and the API on 10000. It also starts the `listen` tasks, which run the Stripe CLI webhook forwarder and the GitHub webhook proxy. The launch entry named `dev` runs this from the primary checkout, so a process on 3000 is often that full-repo run. Never run a root `pnpm dev` while 3001 is a review server.
- Check who owns a port before stopping anything:

  ```sh
  pid=$(lsof -nP -tiTCP:3001 -sTCP:LISTEN | head -1)
  lsof -a -p "$pid" -d cwd -Fn | sed -n 's/^n//p'   # the app folder it serves
  ps -o pid,lstart,command -p "$pid"
  git -C <that folder> branch --show-current; git -C <that folder> log -1 --format='%h %s'
  ```

  The shell is zsh: unquoted variables do not split, so loop over ports as an explicit list (`for p in 3001 3011 3013; do ...; done`), and brace a variable before a colon (`"${b}:apps/..."`).
- Report each server as URL, port, branch, commit and folder: "localhost:3001 serves `k/<topic>` at `abc1234` from `~/gt/gt-cloud-wt-<topic>`; /en-US/pricing compiled and returns 200." Kevin asks for this when it is missing ("localhost 3001 is our gt cloud branch right?", 2026-08-07). gt-reporting holds the rest of the report.
- Confirm it compiled before saying a change is ready. The first request to a route compiles it, and the landing root answers 307 to the locale path, so fetch a real page and read both its status and its body:

  ```sh
  curl -sL -o <scratch>/page.html -w '%{http_code}\n' http://localhost:3001/en-US/<page>
  grep -c 'Module not found\|Build Error' <scratch>/page.html
  ```

  A 200 with a count of 0 passes. Read the server log for the same two strings.
- Keep one review server per app and stop the extra servers you started: "cancel all our other servers we made for this just do localhost 3001" (Kevin, 2026-08-11). Never stop a server Kevin owns, the shared 3005 server, or another session's environment.

## 2. "I can't see the change"

First establish which surface he is looking at. A merged change missing from generaltranslation.com is a deploy question (gt-website section 8). For localhost, check in this order:

1. **The server crashed.** `lsof -nP -iTCP:<port> -sTCP:LISTEN` prints nothing. Restart it from its launch entry. At the desktop app's date change the servers a session started can die, and so can the scratch files beside them (memory `blog-graphics-pipeline-traps`).
2. **It serves the wrong worktree or branch.** Read the process's folder, branch and commit (section 1). A change made in another worktree reaches the server only after it is committed and merged into the served tree.
3. **The AWS login expired.** A dashboard that runs with the root `.env` reads its auth secrets from AWS Secrets Manager. Once the login lapses, every route answers 500 with `Secret <NAME> not found in local environment or AWS Secrets Manager`, as on 2026-08-12 when Kevin could not see his changes. Ask him to run `pnpm aws:login`, then restart the server. The dev environment under `--no-root-env` (section 4) needs no AWS login.
4. **A package moved without its export, or a package build is stale.** On 2026-08-16, 3001 failed with `Module not found: Can't resolve '@generaltranslation/ui/components/pricing/PricingHelpTooltip'`: the preview tree took `apps/landing` from the PR branch without the `packages/ui` change that created the component. The next error came from a stale `dist/`. The apps read `packages/ui` from source, while `packages/settings`, `node` and `clients` resolve from their builds and need `pnpm --dir packages/<name> build` (or `pnpm turbo run build --filter='<app>^...'`) after their sources change.
5. **A dependency is missing after a merge.** Reinstall with `pnpm install --frozen-lockfile` and restart (gt-website section 2).
6. **A cache is stale.** `next dev` keeps old `_next/image` variants, and Tailwind keeps its candidate cache. Stop the server, `rm -rf .next` in the app, start again (gt-website section 2).
7. **Two `next dev` processes share one `.next`.** Every route answers 404 after a restart. Stop, kill the strays, `rm -rf apps/<app>/.next`, start again. Next 16 also refuses a second `next dev` while `.next/dev/lock` is held, so a stray blocks the restart.
8. **Kevin's browser holds old assets.** A private window rules them out (gt-verify section 6).

Stop a server with `kill $(lsof -ti tcp:<port> -sTCP:LISTEN)`. Without `-sTCP:LISTEN` the command also kills a browser connected to the port.

## 3. A new machine or worktree

- A new machine follows the Setup section of gt-cloud's `README.md` and the onboarding guide it links. `quick-install.sh` is sourced so the toolchain loads into the same shell, and `pnpm aws:configure` runs once per machine. In a new worktree, `source ./worktree-setup.sh` installs the toolchain and dependencies, starts the infrastructure, loads the `main` env profile that `pnpm env:save main` stored, and builds the workspace. Kevin performs every sign-in and fills every credential; the agent runs the rest and verifies it ("just log in to everything u need me to log in in now", Kevin, 2026-07-20).
- A development `GT_API_KEY` makes a production `next build` fail by design: gt-next's `withGTConfig` throws "Production builds cannot use a development API key". The packages still build, and the apps run in development, which accepts the key.
- The magic-link email does not arrive locally. The send goes through Resend and never throws, so the page says to check your email either way. With the root `.env`, sign in with Google. In the dev environment the seeded session is the way in (section 4).
- Verify setup by driving the real sign-in through to the dashboard. On 2026-07-21 the sign-in page loaded and Kevin still could not sign in. Confirm that the editor extensions in `.vscode/extensions.json` (oxc and TypeScript Native Preview) are installed; he asked for that check by name.
- A fresh worktree: gt-ship section 1 creates it and gt-website section 2 builds the landing. For any other app, run `pnpm install --frozen-lockfile` and `pnpm turbo run build --filter='<app>^...'` before `next dev`; without the build the dashboard dies with `Module not found ... settings/isBusinessEmail.js`. Authenticated dashboard work uses section 4, which brings its own infrastructure.

## 4. Authenticated dashboard work

### The per-worktree environment

`dev-infra/` (README there) gives a worktree its own Postgres, Redis, SeaweedFS S3, LocalStack and Temporal in the Docker Compose project `gt-dev-<id>`. It migrates, seeds a user, an organization, a project and a session, and writes a Playwright storage state. Docker must be running.

```sh
cd <worktree>
pnpm install --frozen-lockfile
pnpm --dir dev-infra exec playwright install chromium   # once per machine
pnpm dev-env up <id>
pnpm dev-env seed <id> --no-root-env
pnpm dev-env start <id> --services dashboard --no-root-env
pnpm dev-env status <id>   # URLs and the storage-state path
```

- Always pass a short explicit id of a few letters (`onb`, `swp` and `fld` have been used). The default id is the worktree folder name, up to 39 characters, plus an 8-character hash, and the seed writes ids such as `usr_test_<id>` into `varchar(40)` columns, so a default id fails with "value too long for type character varying(40)".
- `--no-root-env` keeps outbound integrations inert. `dev-env` blanks every key that the root and app env files set, and `buildHermeticProviderDefaults` in `config.ts` fills placeholder provider values. The Slack, CRM and email hooks then do nothing, and Google and GitHub sign-in cannot complete, so the seeded session is the way in. Without the flag the environment inherits the root `.env` provider credentials.
- The dashboard serves at `http://dashboard-<id>.localhost:1355`, and `dev-infra/state/<id>/storage-state.json` signs Playwright in (gt-aesthetic for captures). `seed.json` beside it holds fixture credentials; never print it.
- A restart takes 5 to 8 minutes, because turbo builds every dependency first. Run `pnpm dev-env stop <id>` before `start`, which otherwise refuses with "already running". `down` keeps the data and `destroy` deletes it. Seeding again deletes the fixture user with its memberships and sessions, then creates it and a new session.
- The environment's Postgres container sometimes restarts on its own ("Consistent recovery state has not been yet reached"). Wait for it to settle and rerun.
- `--services dashboard` leaves the API down. A CLI login against the environment needs only the dashboard.

### The /dev/states gallery

- Where it lives (2026-10-05): release PR #5063 removed the gallery, `/dev/session`, the stand-in and the `STRIPE_API_HOST` hook from main, because review galleries and other verification instruments stay out of release PRs (gt-ship section 3). They live on branch `k/dashboard-dev-gallery` (ebb900124, 2026-10-01, no PR, 46 commits behind main). To use them, check that branch out in its own worktree and merge `origin/main` locally. Never carry these files into a PR branch.
- `/dev/states?state=<id>` mounts every auth-adjacent state in the order a user meets them: the sign-in page, the mail page, each onboarding step with its variants, the dashboard after it, then the CLI login (consent, the 127.0.0.1 callback page, the device code and the CLI wizard). A draggable console in the lower right pages through them with the arrow keys and can mark the seeded account's onboarding complete or reset it. The list is `apps/dashboard/src/lib/dev/devStates.ts`, and a new state in a flow gets an entry there.
- `/dev/session` signs a cookie-less browser in from the storage state. It answers only in development, with `DEV_ENV_ID` set and on a loopback host. Everywhere else it answers 404, and that includes requests through a tunnel.
- The Stripe client (`packages/clients/src/stripe/index.ts`) honours `STRIPE_API_HOST`, `STRIPE_API_PORT` and `STRIPE_API_PROTOCOL` outside production, and dev-infra runs a stand-in (`dev-infra/stripe-stand-in.mjs`) that creates customers and setup intents. `config.ts` sets the three values only under `--no-root-env`, and an environment created before the stand-in needs `pnpm dev-env up <id>` once. Stripe.js in the browser holds a placeholder key, so the payment states render a static replica of Stripe's form (`BillingFormPreview.tsx`) and the card funnels stay in unit tests.
- When Kevin only needs to evaluate the UI, make the state render and leave auth alone: "i just need to evaluate the UI" (Kevin, 2026-09-30). That day the payment state failed because the fixture organization had no Stripe customer; the fixture gained one, and the form replica followed.
- Locally the disposable-email list (read from S3) is missing, so every address counts as a weak signal and the website field is required. `acme.com` and GT's own domains are rejected; use an invented domain such as `funnelcorp.io`. Signing out deletes the seeded session, and seeding again restores it.
- For a look without any backend, Prototemplate's Shipped section carries a copy of the gallery and its console at `/d/production/signin`, `onboarding`, `consent`, `device` and `cli` on 3005, each taking `?state=` (Prototemplate main b56e64c, 2026-10-01). The dashboard stays the source.

### Real providers

- Real providers are Google sign-in, AWS secrets, Stripe and email. A run against them needs `pnpm aws:login`, which opens a browser sign-in that Kevin completes, and a seed and start without `--no-root-env`. Run it only after he approves, as on 2026-08-11 when he asked for the login to be relaunched, and tell him first which integrations will be live.
- A tunnel (`pnpm tunnel`, dev-infra README) puts an environment on a public URL. Open one only when Kevin asks, and turn it off afterwards.

## 5. Letting Kevin try it

- Hand him a running build and the exact command or URL, deep-linked to the state he asked about.
- The CLI login from a PR head runs from a scratch worktree with his credentials left alone (gt#2341, 2026-10-02):

  ```sh
  git -C $GT fetch origin <branch>
  git -C $GT worktree add --detach <scratch>/gt-<pr> origin/<branch>
  cd <scratch>/gt-<pr> && pnpm install --frozen-lockfile && pnpm exec turbo run build --filter=gt...
  mkdir -p <scratch>/gt-<pr>-state
  # the command Kevin runs:
  XDG_STATE_HOME=<scratch>/gt-<pr>-state node <scratch>/gt-<pr>/packages/cli/bin/main.js login
  ```

  The CLI keeps its sign-in state under `$XDG_STATE_HOME` (default `~/.local/state`), so the scratch folder leaves his real `gt` login as it is. Leave out `--no-browser`, because that sign-in path never opens the browser page the PR changed.
- To show the callback page's states without a login, render them from the branch's `packages/cli/src/auth/callbackPage.ts` and serve them on 127.0.0.1 with its `CALLBACK_PAGE_CSP` header, so a policy error shows locally as it would from the CLI (memory `cli-callback-page`; on 2026-10-02 at http://127.0.0.1:3341 with `/signed-in`, `/denied` and `/failed`). Write previews to the scratchpad. A session that wrote them into the primary checkout's `.claude` folder had to move them out.
- The in-app browser pane blocks clipboard writes. Test a copy button in Chrome, and tell Kevin to open the page there.
- Warn him when his local worktree is behind a rebased branch. `git -C <his worktree> rev-list --left-right --count HEAD...origin/<branch>` prints ahead and behind; on 2026-10-02 his `gt-wt-login` worktree was 11 ahead and 23 behind after a rebase. Tell him not to push from it, and give him `git reset --hard origin/<branch>` to run there himself.

## 6. Housekeeping

- Register every server you start: a named launch entry, or a line in your notes with its port, PID and folder. At the end of the session stop each one with the listen-only kill, and stop (`pnpm dev-env stop` or `down`) the environments you created. Remove the launch entries you added. Leave Kevin's servers, 3005 and other sessions' environments running (`onb` belongs to the onboarding session). On 2026-10-05 Kevin had to ask a session to stop a preview server it had left running, with "any other background processes you started".
- Remove scratch worktrees once their work is pushed (gt-ship section 1). Each costs about 6 GB.
- Test discreetly (gt-verify section 11). `pnpm dev-env open` opens a headed browser, so use it only when Kevin asks.
- Tools a session builds in its scratchpad can vanish at the date change. Keep reusable ones in a repository or a durable folder (the funnel runner's copy lives in `~/gt/gt-tools/onboarding-funnels/`).

## Review checklist

- [ ] Each server is reported with URL, port, branch, commit and folder.
- [ ] The server compiled the changed pages (a 200 with no `Module not found`) and serves the latest commit.
- [ ] One review server per app; the extra servers you started are stopped; no server of Kevin's or of another session was stopped.
- [ ] Port ownership was checked with `lsof` before any kill, and the kill was listen-only.
- [ ] The dev-env id is a few letters, and `seed` and `start` ran with `--no-root-env`.
- [ ] Real providers, `pnpm aws:login` and tunnels ran only after Kevin approved.
- [ ] Kevin's credentials stayed isolated: `XDG_STATE_HOME` in a scratch folder, and no sign-in as him.
- [ ] Kevin got the exact command or URL, and a warning when his worktree is behind the branch.
- [ ] Tests ran headless, and the servers and environments you started are stopped at the end.

## Related skills

In this set: gt-website (landing worktrees, dev servers, build traps and deploys), gt-ship (worktrees, what stays out of a PR and Prototemplate's shared checkout), gt-aesthetic (local review and captures), gt-verify (verification and discreet testing), gt-reporting (how a server and its state reach Kevin) and gt-orchestration (ports and servers in multi-agent rounds). In gt-cloud: gt-dashboard and gt-landing. In Kevin's wiki: agent-browser and portless.

## Sources

- gt-cloud at origin/main e17fce499 (2026-10-05): `README.md` (Setup, Development, Worktrees and environment profiles), `quick-install.sh`, `setup.sh`, `worktree-setup.sh`, `package.json` (`dev`, `dev-env`, `tunnel`, `aws:configure`, `aws:login`, `env:*`), `turbo.json` (`dev`, `listen`), `.vscode/extensions.json`, the `dev` and `listen` scripts in `apps/{dashboard,landing,admin,locadex,api}/package.json`, `dev-infra/README.md`, `dev-infra/config.ts` (`buildDefaultEnvironmentId`, `buildHermeticProviderDefaults`), `dev-infra/docker-compose.yml`, `dev-infra/cli.ts` (`readDotEnvFiles`), `dev-infra/state.ts`, `dev-infra/__tests__/config.test.ts`, `seed/config.ts`, `seed/fixtures/createUserFixture.ts`, `packages/clients/src/secrets.ts`, `packages/node/src/integrations/resend/sendEmail.ts` (`sendMagicLinkEmail`).
- The primary gt-cloud checkout's untracked `.claude/launch.json`, read on 2026-10-05.
- gt-cloud branch `k/dashboard-dev-gallery` (ebb900124): `apps/dashboard/src/app/[locale]/dev/states/page.tsx`, `apps/dashboard/src/app/[locale]/dev/session/route.ts`, `apps/dashboard/src/lib/dev/devStates.ts`, `apps/dashboard/src/components/dev/BillingFormPreview.tsx`, `packages/clients/src/stripe/index.ts`, `dev-infra/stripe-stand-in.mjs`, `dev-infra/config.ts`; PR #5063 (merged 2026-10-02).
- generaltranslation/gt: `packages/cli/src/auth/credentialStore.ts`, `packages/cli/src/cli/base.ts` (`login --no-browser`) and `packages/next/src/errors/createErrors.ts` on main (a16ae03c6); `packages/cli/src/auth/callbackPage.ts` on `k/cli-login-callback-page` (PR #2341, open on 2026-10-05).
- Prototemplate main 2a8453c: `src/app/d/production/{signin,onboarding,consent,device,cli}/page.tsx`, `src/components/plate/`. The sibling skills gt-ship, gt-website, gt-aesthetic, gt-verify, gt-reporting and gt-orchestration as written in the working tree on 2026-10-05.
- Claude Code project memory for gt-cloud: `dashboard-local-dev.md`, `onboarding-funnel-testing.md`, `cli-callback-page.md`, `redesign-screenshot-harness.md`, `blog-graphics-pipeline-traps.md`, `pr-screenshots-and-gallery.md`, `prototemplate-plate-port.md`, `signin-field-transition.md`, `zsh-shell-traps.md`.
- Kevin's directives: he signs in and the agent does the rest (2026-07-20); setup verified by a real sign-in (2026-07-21); which branch 3001 serves (2026-08-07); one review server on 3001 (2026-08-11); the AWS login relaunched on his request (2026-08-11); an expired AWS login behind changes he could not see (2026-08-12); 3001 kept up and current (2026-08-15 to 2026-08-18); discreet testing (2026-09-25); the UI evaluated without fixing auth (2026-09-30); trying the CLI login himself (2026-10-02); stopping the servers a session left running (2026-10-05).
