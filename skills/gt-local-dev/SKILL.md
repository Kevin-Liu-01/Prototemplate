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
  updated: 2026-10-10
  origin: prototemplate
  owner: O
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
| Prototemplate | http://localhost:3005 | `$PROTOTEMPLATE`, launch config `prototemplate-dev` | shared by several sessions: reuse it and never stop it, except to restart it when it has wedged (section 2, item 9; gt-ship section 8) |
| Dashboard dev environment | `http://dashboard-<id>.localhost:1355` | a worktree's dashboard environment, through the portless proxy | one short id per worktree (section 4) |
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
9. **The Prototemplate dev server has wedged.** Under load, with several agents compiling routes at once, `next dev` can leave `.next/dev/prerender-manifest.json` half written: every route then answers 500 with "Unexpected non-whitespace character after JSON" until a restart. After a large fast-forward of the shared checkout (47 commits on 2026-10-09) the 3005 server answered nothing. This is the one case where the shared 3005 server is restarted: stop its `next dev --port 3005` processes by PID, delete `.next/dev` (it had grown to 64 GB), and start the `prototemplate-dev` launch entry again. Tell the other sessions that use it. A cold image-optimizer request on a loaded server can also hang for 900 seconds or more and time out page-check cells; treat that as server state and retry once the load drops.

Stop a server with `kill $(lsof -ti tcp:<port> -sTCP:LISTEN)`. Without `-sTCP:LISTEN` the command also kills a browser connected to the port.

## 3. A new machine or worktree

Internal to gt-cloud: follow the Setup section of gt-cloud's `README.md` and the gt-dashboard skill in gt-cloud's `.agents/skills`. Kevin performs every sign-in and fills every credential; the agent runs the rest and verifies it by driving the real sign-in through to the dashboard.

## 4. Authenticated dashboard work

Internal to gt-cloud: the per-worktree environment, the `/dev/states` review gallery and the rules for real providers live in gt-cloud (`dev-infra/README.md` and the gt-dashboard skill). Run real providers or a public tunnel only after Kevin approves. For a look without any backend, Prototemplate's `/d/production/signin`, `onboarding`, `consent`, `device` and `cli` pages carry a copy of the gallery and its console, each taking `?state=`.

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

- Register every server you start: a named launch entry, or a line in your notes with its port, PID and folder. At the end of the session stop each one with the listen-only kill, and stop the dashboard environments you created with gt-cloud's own command (section 4). Remove the launch entries you added. Leave Kevin's servers, 3005 and other sessions' environments running (the onboarding session owns its own environment). On 2026-10-05 Kevin had to ask a session to stop a preview server it had left running, with "any other background processes you started".
- Remove scratch worktrees once their work is pushed (gt-ship section 1). Each costs about 6 GB.
- Test discreetly (gt-verify section 11). A command that opens a headed browser runs only when Kevin asks.
- Tools a session builds in its scratchpad can vanish at the date change or a reboot. Keep reusable ones in a repository or a durable folder outside the scratchpad.

## Review checklist

- [ ] Each server is reported with URL, port, branch, commit and folder.
- [ ] The server compiled the changed pages (a 200 with no `Module not found`) and serves the latest commit.
- [ ] One review server per app; the extra servers you started are stopped; no server of Kevin's or of another session was stopped.
- [ ] Port ownership was checked with `lsof` before any kill, and the kill was listen-only.
- [ ] Authenticated dashboard work followed gt-cloud's setup and the gt-dashboard skill (section 4).
- [ ] Real providers, `pnpm aws:login` and tunnels ran only after Kevin approved.
- [ ] Kevin's credentials stayed isolated: `XDG_STATE_HOME` in a scratch folder, and no sign-in as him.
- [ ] Kevin got the exact command or URL, and a warning when his worktree is behind the branch.
- [ ] Tests ran headless, and the servers and environments you started are stopped at the end.
- [ ] The shared 3005 server was restarted only when it had wedged (section 2, item 9), and the other sessions were told.

## Related skills

In this set: gt-website (landing worktrees, dev servers, build traps and deploys), gt-ship (worktrees, what stays out of a PR and Prototemplate's shared checkout), gt-aesthetic (local review and captures), gt-verify (verification and discreet testing), gt-reporting (how a server and its state reach Kevin) and gt-orchestration (ports and servers in multi-agent rounds). In gt-cloud: gt-dashboard and gt-landing. In Kevin's wiki: agent-browser and portless.

## Sources

`references/sources.md` cites each line added on 2026-10-10.

- gt-cloud at origin/main e17fce499 (2026-10-05): `README.md` (Setup, Development, Worktrees and environment profiles), the root `package.json` and `turbo.json` (`dev`, `listen`), the `dev` and `listen` scripts of each app, and `dev-infra/README.md`. The file-level detail behind sections 3 and 4 moved to gt-cloud's gt-dashboard skill on 2026-10-10.
- The primary gt-cloud checkout's untracked `.claude/launch.json`, read on 2026-10-05.
- gt-cloud branch `k/dashboard-dev-gallery` (ebb900124) and PR #5063 (merged 2026-10-02).
- generaltranslation/gt: `packages/cli/src/auth/credentialStore.ts`, `packages/cli/src/cli/base.ts` (`login --no-browser`) and `packages/next/src/errors/createErrors.ts` on main (a16ae03c6); `packages/cli/src/auth/callbackPage.ts` on `k/cli-login-callback-page` (PR #2341, open on 2026-10-05).
- Prototemplate main 2a8453c: `src/app/d/production/{signin,onboarding,consent,device,cli}/page.tsx`, `src/components/plate/`. The sibling skills gt-ship, gt-website, gt-aesthetic, gt-verify, gt-reporting and gt-orchestration as written in the working tree on 2026-10-05.
- Claude Code project memory for gt-cloud: `dashboard-local-dev.md`, `onboarding-funnel-testing.md`, `cli-callback-page.md`, `redesign-screenshot-harness.md`, `blog-graphics-pipeline-traps.md`, `pr-screenshots-and-gallery.md`, `prototemplate-plate-port.md`, `signin-field-transition.md`, `zsh-shell-traps.md`.
- Kevin's directives: he signs in and the agent does the rest (2026-07-20); setup verified by a real sign-in (2026-07-21); which branch 3001 serves (2026-08-07); one review server on 3001 (2026-08-11); the AWS login relaunched on his request (2026-08-11); an expired AWS login behind changes he could not see (2026-08-12); 3001 kept up and current (2026-08-15 to 2026-08-18); discreet testing (2026-09-25); the UI evaluated without fixing auth (2026-09-30); trying the CLI login himself (2026-10-02); stopping the servers a session left running (2026-10-05).
