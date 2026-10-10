# Prototemplate: landing and deploys

Detail for section 8 of `gt-ship`: how work lands on Prototemplate and how
its two Vercel projects are read after a push. Moved out of `SKILL.md` on
2026-10-10 to keep the skill under its size budget; every rule still holds.

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
  `-general-translation.vercel.app`, and the personal one's ends in the
  personal team's slug.
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
  `WANT` table of `scripts/build/fetch-google-faces.py` and loads through
  `next/font/local`. If a team build reports "Only repositories in
  github.com/generaltranslation are allowed", the git-source policy that
  froze the site from 2026-09-01 to mid-September is back; tell Kevin.
- **Never run `vercel --prod` on the team scope** unless Kevin says so.
- **Which Vercel account.** "My Vercel bill" or "my Vercel account" means
  Kevin's personal team. The GT team (`general-translation`) is a shared
  company account: read it for an FYI and change nothing there, settings
  included, unless Kevin names it. On 2026-09-14 he stopped a change to GT
  project settings the moment it started. Large findings on the GT team,
  such as build-minute burn, go to him as an FYI.
