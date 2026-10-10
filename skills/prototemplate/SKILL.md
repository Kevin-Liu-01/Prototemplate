---
name: prototemplate
description: >-
  How to work in Prototemplate, Kevin's hub and wiki for General Translation
  work: what each route holds, the repository map, the viewer shell and its
  props, the registries that move together (surfaces, search index, docs,
  sitemap, llms.txt, captures), the chrome and sidebar rules, the book page
  standard, adding a page, a document, a handbook document or a skill, the
  build scripts, the shared checkout and its session lanes, the gates and
  landing, keeping the hub current with gt-cloud, and the curated skills
  with their contract and install. Use when changing anything in the
  Prototemplate repository, when adding a route, document or skill to it, or
  when building on it from another project.
metadata:
  title: Working in Prototemplate
  areas: website, components
  updated: 2026-10-10
  origin: prototemplate
  owner: P
---

# Working in Prototemplate

General Translation (GT) is a localization platform for developers. Prototemplate is Kevin Liu's hub for his GT work and the wiki of how he does it: a Next.js 16 site kept at github.com/Kevin-Liu-01/Prototemplate and served at www.prototemplate.com. It serves the brand book, the design canon, the brand deck, the design lab, the marks, the films, the graphics and the curated GT skills as live pages. On 2026-10-05 Kevin said he should be able to "use it anywhere and build on top of it", so that it "acts as a wiki / repository of how i do work at GT".

Paths are relative to a Prototemplate checkout (`$PROTOTEMPLATE`; `git clone https://github.com/Kevin-Liu-01/Prototemplate`, then `pnpm install`, `pnpm run doctor` and `pnpm dev`). `AGENTS.md` at the root is the agent entry point and `docs/handbook/` holds the working handbook. The references hold the detail: `references/hub.md` (every route and document, the repository map), `references/shell.md` (the shell's props and data shapes), `references/chrome.md` (the book page and the chrome rules), `references/registries.md`, `references/adding.md` (the checklists file by file), `references/porting.md`, `references/build-scripts.md`, `references/skills.md` (the skills contract) and `references/sources.md`. `pnpm lint:registries` reports the registries a change has missed.

## 1. What the hub holds

The routes are `/` (the design lab), `/brand`, `/docs` and `/docs/<slug>`, `/deck`, `/skills` and `/skills/<slug>`, `/handbook`, `/marks`, `/blog`, `/graphics`, `/motion`, `/compare`, `/present`, `/directions/<slug>`, `/archive/<slug>`, `/d/<slug>` (the directions, self-contained) and `/d/production/...` (the shipped site page for page, with the dashboard's sign-in and onboarding states). The canon documents are `AGENTS.md`, `docs/handbook/`, `BRAND.md`, `DESIGN.md`, `ARCHITECTURE.md`, `docs/SHIP-LOOP.md`, `docs/GRAPHICS.md`, `docs/ARTIFACT-PICTURES.md`, `docs/LIBRARIES.md` and `deck/DECK-GRAMMAR.md`; `motion/MOTION.md` is kept by the Videos session and untracked. `references/hub.md` gives each route's contents and source files.

- Prototemplate `main` is the primary repository, and canon is edited there first. Files move from gt-cloud's older `apps/redesign` copy one at a time, and no `rsync --delete` ever runs toward Prototemplate, because it would erase the routes that exist only here (`docs/SHIP-LOOP.md` section 7).
- Prose in the repository drifts from the code (ports, skill names and counts all drifted by 2026-10-05). Trust `package.json` and the registries, and fix the prose in the change that finds the drift.

### Keeping the hub current

Prototemplate is the living reference of GT work only while every deliverable reaches it.

1. **Same round.** Every GT design deliverable lands here in the round it is made: rules (as documents, deck slides or lints), graphics, covers, OpenGraph cards, contact sheets, posts, films (through the Videos session), logos, banners, promos, the page-check system, and the sign-in and onboarding system in the Shipped group. Kevin still reviews it on localhost first (section 9).
2. **Grouped by item.** A collection page shows every version of one image (dark, light, cover, social card, sheet) in one place, in the same viewer layout as the other collections (2026-09-18).
3. **The production mirror.** `/d/production` rebuilds each gt-cloud page one to one, renders it natively and never links out to generaltranslation.com. After gt-cloud PRs merge, diff main and port their fixes here (`references/porting.md`). Remove mirror pages Kevin calls wrong, and bring in the pages he built.
4. **Both copies.** When an app exists in two copies (the one Kevin views and the one that ships), fix both and say which copies changed (2026-08-14).
5. **The shared remote.** Fetch and rebase onto origin before pushing; an overlay that discards commits already on HEAD is a defect (2026-08-27). Confirm the Vercel build after every push and fix a failed one at once (`gt-ship` section 8).
6. **The narrative.** The gallery tells the redesign in order: the directions explored, the survivors, the three full site concepts, then the shipped production site as the outcome, with the earlier pages still viewable (2026-08-26).
7. **Brand directives** update `/brand` and BRAND.md and leave the business facts alone. The brand agency questionnaire's confidential answers stay off the site.

## 2. The repository map

`references/hub.md` draws the map: `src/app/` (one folder per route), `src/app/d/` (the directions, with `d/toolchain` as the source the forks import), `src/components/{viewer,shared,shell,plate}`, `src/lib/` (registries, generated data, engines), `scripts/{lib,lint,check,build,skills,media}`, `deck/`, `graphics/`, `content/`, `motion/` (untracked, the Videos session's), `skills/<slug>/` (the canonical copy of each skill), `public/` and `docs/`.

- `next.config.ts` sets `typescript.ignoreBuildErrors: true`, so `pnpm build` never type-checks. `tsc` is a gate of its own.
- `next.config.ts` also holds the `/deck` rewrite, the cache headers for public files, the permanent redirects and `outputFileTracingExcludes` for the prerendered routes that read files through computed paths. A route that turns dynamic must stop reading an excluded path.
- `tsconfig.json` includes `**/*.ts`, so a `.ts` file under `skills/` would be type-checked. Skill helpers are `.mjs`, `.py`, `.sh` or `.js`.
- `src/app/d/**` holds self-contained explorations with their own type and colors, and the shell's rules do not reach it. The type lint skips the files its `ALLOW_FILES` list names.

## 3. The viewer shell

`ViewerShell` (`src/components/viewer/ViewerShell.tsx`) frames every route except `/deck`, `/present`, `/blog` and the `/d/` pages. Kevin made the deck's viewer the frame for the whole site on 2026-09-08 ("i really love our deck's navigation and basic interface"). The shell owns the state and draws the chrome: the sidebar, the 52px toolbar, the stage, the index panel, the search, the help card, the toast, the progress line and the one hover preview. The route renders the stage content as children. `references/shell.md` explains every prop and data shape, and `references/chrome.md` holds the detail of the rules below.

- A link to `/deck` loads it as a document (`src/lib/document-routes.ts`), since a router navigation would fetch the whole deck twice.
- **The book page.** Every page with a book head renders one structure (DESIGN.md section 4): `BookHead` draws the title from `PAGE_NAMES`, a lead of one to three lines, the panel (Updated from the generated `src/lib/updated.ts`, then three facts), then the one hatch band, and sections open with a `.pt-book-sec` divider. The server page calls `requireUpdated('<route>')`, and a new route needs its paths in `scripts/build/updated.mjs`. `pnpm lint:heads` and `pnpm lint:heads:live` hold the structure (Kevin, 2026-10-06: "standardize our presentation more").
- The theme is `html[data-theme]`, dark when unset, stamped before first paint. Dark mode is a token remap, and no shell stylesheet reads `prefers-color-scheme`.
- `src/components/viewer/tokens.css` is the one token file.
- Shell code runs mount work in `useMountEffect` and dependency work in `useLayoutWork`; `pnpm lint:practices` fails a new bare `useEffect` and any GSAP import under `src/components/viewer`. Shell code mirrors state into refs for listeners and animates transform and opacity only. Every `.pt-*` class is global, so grep a name before using it.

`gt-components` lists each shell component with its role.

## 4. Registries that move together

A page, a document or a skill appears in several hand-kept lists, and a change updates every list that names it in the same commit: `src/lib/surfaces.ts`, `src/lib/search-index.ts` (with `DOC_HEADINGS`, `HANDBOOK_HEADINGS` and `DECK_SLIDES`), the `DOCS` and `HANDBOOK` registries, `src/lib/page-names.ts`, `scripts/build/updated.mjs`, `src/app/docs/links.ts`, `src/lib/directions.ts`, `src/lib/archive.ts`, `src/app/sitemap.ts`, `public/llms.txt`, the metadata in `src/app/layout.tsx`, and `siteRoutes()` in `scripts/lib/site-pages.mjs`. `references/registries.md` gives what each holds and who reads it.

- `src/lib/skills.ts` and `src/lib/motion.ts` are generated. Edit their sources and rerun `pnpm build:skills` or `pnpm build:motion`.
- Every browser tool finds a first slug by regex in the generated and registry files. A generator that changes its output shape breaks every browser gate.
- The heading tables are snapshots: a document that gains or renames an h2 updates its table in the same change.
- `pnpm lint:registries` checks the headings, the route lists, the first-slug regexes and the skill contract. It exits 1 on a hard failure and prints the softer gaps as notes.

## 5. Chrome rules

Chrome is everything the shell draws around content. The rules are `DESIGN.md` sections 2, 15 and 16 and the values in `tokens.css`; `references/chrome.md` holds each rule in full, `gt-aesthetic` the taste behind them and `gt-lints` the lints that enforce them.

- **Type.** One face, the rsms InterVariable v4.1, self-hosted and subset, read through the type tokens (`--pt-text`, `--pt-ff-text`, `--pt-ff-display`, `--pt-d1` to `--pt-d3`). Weights stop at 500. A stylesheet declares no family, feature list or display size of its own, and `pnpm lint:type` holds it (Kevin, 2026-10-05: "the CORRECT RASMUS INTER").
- **Corners.** Rounded controls, square shells (Kevin, 2026-10-05: "boxes only for ui shells"): shells take `--pt-radius-shell`; controls 6px, a flush inner part 5px, chips 4px and cards 6px. `pnpm lint:radius` holds it, and Present's 8px is the one named exception.
- **Color.** Chrome draws colors from `tokens.css` only; `pnpm lint:shell` refuses literals in `src/components/viewer` and `src/components/shell`.
- **Icons.** Heroicons 20 solid, inlined in `src/components/viewer/icons.tsx` at 16px in `currentColor`. The theme button's ◐ and ◑ are the one exception. No Lucide, no other glyph icons, no icon font.
- **Scrollbars.** `.pt-scroll` is the only scrollbar.
- **Lines.** Every rule is 1px, drawn once, in one of three roles: structural (`--pt-hair`), row (`--pt-hair-soft`) and frame (`--pt-edge`). `--pt-ink` colors a border only in a state. Where two bordered parts touch, the junction table in DESIGN.md section 2 names the one owner (Kevin, 2026-09-08: "verify no double borders ... this is key to our identity").
- **The five exceptions** of DESIGN.md section 15 (the search pill's hover border, the ⌘K chip's ground, the Present button, the mark's rainbow core, the sidebar nameplate) stay as they are, and no other element takes their values.
- **The sidebar.** Every row is a link to a page; route sections nest under their page row through `ShellSection.under`; the current page is always marked with `aria-current="page"`. Full titles wrap to two lines with no ellipsis.

## 6. Adding a page, a document or a skill

`references/adding.md` gives each list file by file, along with directions, shipped pages, films and stills.

- **A page** needs the route's `page.tsx` and viewer, a row in `PAGES` or `KNOWLEDGE` of `surfaces.ts`, `PAGE_ICON` in `Sidebar.tsx` and `search-index.ts`, `PAGE_KEYWORDS`, `under` on its sections, a sitemap line, lines in `llms.txt` and the README, a row in `siteRoutes()` of `scripts/lib/site-pages.mjs` tagged with the tools that walk it, then `pnpm capture:pages --only <id>` and `pnpm build:thumbs`.
- **A document** needs the file, a `DOCS` entry, its h2s in `DOC_HEADINGS`, lines in `llms.txt` and the README's "Read first" table, and a `docs-<slug>` capture. Its links resolve through `src/app/docs/links.ts`.
- **A handbook document** needs `docs/handbook/<slug>.md`, a `HANDBOOK` entry in `src/app/handbook/registry.ts`, its h2s in `HANDBOOK_HEADINGS`, its row in `docs/handbook/README.md` and AGENTS.md's handbook list, a line in `llms.txt`, and a `handbook-<slug>` capture.
- **A page with a book head** follows DESIGN.md section 4 (The book page): its `PAGE_NAMES` entry, `BookHead` with three facts, `requireUpdated` from the server page, an entry in `scripts/build/updated.mjs`, its route in `lint/heads.mjs`' live list, then `pnpm build:updated`.
- **A skill** needs `skills/<slug>/SKILL.md` written to the contract in section 10, then `pnpm build:skills`, then the installer's dry run and its run.
- **A page ported from gt-cloud** follows `references/porting.md`: one root class, stylesheets as rescoped mirrors, every addition in one compatibility sheet, sections through one transform, and the copy recorded in `scripts/lint/copies.json`.
- Every addition ends with `pnpm lint:registries` and the gates in section 9.

## 7. Build scripts

`references/build-scripts.md` gives each command with what it reads and writes, and `docs/TOOLS.md` lists every script.

- The generated outputs are committed (`src/lib/skills.ts`, `src/lib/motion.ts`, `public/brand-deck.html`, `public/deck-assets`, `public/shots`, `public/marks`), so the site builds without `motion/` or any other checkout. Generated files change only through their scripts.
- `build:motion` only reads `motion/`. It throws before writing when a brief's or a script's shape changes or a web copy differs from the pinned cut, and it lists a newer cut as in review until Kevin approves it (`--pin <slug>`).
- `scripts/build/skills.mjs` reads only `skills/`, so it runs in any clone. Its header comment lists the contract it checks.
- The browser scripts launch Chrome for Testing through `playwright-core` (`pnpm exec playwright-core install chromium`), read `CHROME_PATH` first, and take their base URL from `PT_BASE` (default `http://localhost:3005`).
- The Google faces are self-hosted, because Turbopack's Google font loader failed builds at random (fixed here on 2026-09-24).

## 8. The shared checkout

On Kevin's machine `$PROTOTEMPLATE` is one working tree that several Claude sessions use at once, and each session keeps to its lane. A fresh clone elsewhere has no other sessions, but the staging rules below still apply. Kevin, 2026-10-03: "the videos one should be making them, and this one is just for prototemplate work".

- On 2026-10-05 the Videos session owns `motion/`, which is untracked. The onboarding and dashboard session works in `deck/`, `src/components/plate`, `src/app/craft` and `public/brand/mood`, and it pushes main from its own worktree. The Prototemplate session does the site work. A request that belongs to another lane goes to that session by name (ListAgents, then SendMessage).
- Read `git status --short` before and after the work, and stage only the change's own paths. Never run `git add -A` or `git add .`: on 2026-10-01 commit b56e64c swept 229 files of `motion/` onto origin/main.
- Never run `git checkout <commit> -- <file>` on a path another session may hold edits in, and never rewrite shared main without Kevin.
- Never stop or restart the dev server on 3005, and never build in the shared `.next`. Next 16 refuses a second `next dev` for the same checkout (`.next/dev/lock`). A lane or worktree runs its own server on its own port.
- **The one exception: a wedged 3005 server.** Under load, with several agents compiling routes at once, `next dev` can leave `.next/dev/prerender-manifest.json` half written, and every route then answers 500 ("Unexpected non-whitespace character after JSON"). After a large fast-forward (47 commits on 2026-10-09) the server answered nothing. Restart it: stop its `next dev --port 3005` processes by PID, delete `.next/dev` (it had grown to 64 GB), start the `prototemplate-dev` launch entry, and tell the sessions that use it. A cold image-optimizer request on a loaded server can hang for 900 seconds or more; that is server state, so retry once the load drops.
- Bring the shared checkout up to date with `git merge --ff-only origin/main`; the untracked `motion/` folder is unaffected.
- `gt-ship` section 8 gives the commit steps: the fetch of `origin/main`, the conflict-marker sweep and the pathspec commit.

## 9. Gates and landing

`gt-lints` explains each gate, and `gt-ship` section 8 holds the build commands, the push and the deploy checks.

1. `pnpm exec tsc --noEmit`, which takes 3 to 5 minutes.
2. `pnpm lint:all`, which runs `pnpm lint:static` (every static lint and test, `lint:registries`, `lint:public`, `lint:copies`, `lint:tools` and `test:skill-scripts` among them) and then the browser audits against the dev server at `PT_BASE` (default 3005: `lint:lines:shell`, `lint:type:live`, `lint:radius:live`, `lint:heads:live`); `package.json` holds the exact chain. It takes about 25 minutes. Run the browser gates one at a time, because a parallel capture made `lint:lines:shell` fail on 2026-10-01.
3. `pnpm check:pages --preset quick --pages <ids>` on the touched routes (phones, a tablet, laptops, desktops and the ultrawide), with zero defects and every interaction passing.
4. A look at both themes at 1440 and 390 wide, with 2x crops of every junction a figure draws, because the line audit cannot see SVG strokes.
5. `pnpm build` in a scratch worktree, gated with `&&` and never piped.

Kevin reviews on http://localhost:3005 first. New explorations and redesign rounds stay uncommitted or on a branch until he says to land them ("I should be reviewing them locally", 2026-09-14). When he says to land, push the committed HEAD he reviewed (`git push origin HEAD:main`). The working tree holds other sessions' edits, so never commit it whole. Every push builds on two Vercel projects: the General Translation team project serves www.prototemplate.com, and Kevin's personal project serves prototemplate.vercel.app.

## 10. The skills

The curated GT skills live in `skills/<slug>/`, one canonical copy each, chosen by use (Kevin, 2026-10-05: "we only need to show and store the ones weve actually been using and updating ... dont just smash a bunch of thigns in there"). `skills/README.md`, written by `pnpm build:skills`, lists them by area. `references/skills.md` holds the full contract, the install and the other skill homes; `pnpm build:skills` checks it.

- **Frontmatter.** Agent Skills fields only: `name` (the folder's slug), `description` (what it covers, then "Use when", at most 1024 characters), and string `metadata`: `title` (the h1, no leading "The"), `areas` (from the fixed set; the first files it on /skills), `updated`, `origin: prototemplate` and `owner` (`P`, `V` or `O`, the session lane that keeps it and reviews every diff to it).
- **Body.** An h1 equal to the title and two or three sentences, the sections, a Review checklist where the skill governs reviewable output, a Related skills line, and `## Sources` last as a short pointer to `references/sources.md`, where every added line cites its memory note, transcript or inventory row and its date. The body stays under 24,000 bytes: detail moves to `references/`, and trimming moves a rule and never deletes it. Every skill is written to gt-voice, holds no keys, email addresses, personal details, company numbers or machine paths, and names paths relative to a named checkout.
- **Supporting files** are `.md`, `.mjs`, `.json`, `.py`, `.sh`, `.txt` or `.js`, served raw. A script is self-contained, with a header that gives its purpose, usage, `Requires:` and `Last real run:` (a date and session, or `none (kept for: <trigger>)`), and an offline test that `pnpm test:skill-scripts` runs.
- **Kept by use.** `pnpm skills:usage` counts loads; thirty days after distribution a skill with no loads and a script still at `none` are cut unless Kevin keeps them by name.
- **Install.** `pnpm skills:install` links or copies the set into a project (`--project <dir>`, dry run first); this repository's `.claude/skills` and `.agents/skills` hold relative links. It never runs against Kevin's home folder without asking him. A new slug is checked against the wiki's runtime list and gt-cloud's `.agents/skills` first, so an install never shadows another skill.

## Review checklist

- [ ] Every registry in section 4 that names the change was updated in the same commit, and `pnpm lint:registries` exits 0 or fails only on findings that predate the change.
- [ ] Every new route section sets `under`, no page shows its sections as a separate group, and `aria-current="page"` sits only on the current row and the page row the reader is inside.
- [ ] A page with a book head follows the book page standard, its paths are in `build/updated.mjs`, and `lint:heads` and `lint:updated` pass.
- [ ] Chrome stays in the tokens: Inter at 500 or less through the type tokens, corners from the radius tokens (square shells, rounded controls), colors from `tokens.css`, borders in the three roles with one owner per junction, and Heroicons 20 solid from `icons.tsx`.
- [ ] Generated files changed only through their scripts.
- [ ] Prose that states a count, a port or a path matches the code.
- [ ] Only the change's own paths are staged, and `motion/` and the other lanes' paths are untouched.
- [ ] tsc, `lint:all`, `check:pages --preset quick` on the touched routes, both themes at 1440 and 390, and the scratch worktree build all pass.
- [ ] Kevin reviewed the change on localhost before it reached main.
- [ ] A new or changed skill passes the contract in section 10: its owner, a body under 24,000 bytes, every added line cited in `references/sources.md`, and a header and offline test for each script.
- [ ] The shared 3005 server was restarted only when it had wedged (section 8), and the other sessions were told.

## Related skills

GT skills: `gt-components` (each shell component), `gt-aesthetic` (the taste behind the chrome), `gt-lints` (every gate), `gt-ship` (landing and deploys), `gt-deck` (the deck the shell came from), `gt-graphics`, `gt-dither`, `gt-motion` and `gt-films` (what /graphics and /motion show), and `gt-voice` (every word on the site and in the skills). Wiki skills: `agent-browser` (the visual check in both themes and at phone width).

## Sources

`references/sources.md` lists the Prototemplate files, gt-cloud branches, memory notes and Kevin's dated directives behind each section, and cites every line added on 2026-10-10.
