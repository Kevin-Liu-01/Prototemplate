---
name: gt-lints
description: >-
  Every lint and gate that holds General Translation's design and copy rules,
  what each catches, where it runs and how to fix a failure: Prototemplate's
  line auditor, shell token lint, practices ratchet, picture lint, type lint,
  gt-ui oxlint copy and page check, and gt-cloud's oxlint plugins, email
  identity check and oxfmt. Also covers how a new rule becomes a lint and the
  gate hygiene that keeps a red gate from passing (chained gates, real exit
  codes, one browser gate at a time). Use before committing in either
  repository, when a lint or a build gate fails, or when Kevin asks for a new
  rule to be enforced.
metadata:
  title: Lints and gates
  areas: lints
  updated: 2026-10-08
  origin: prototemplate
---

# Lints and gates

Kevin's design and copy rules at General Translation (GT) are enforced by
lints in two repositories. gt-cloud (`generaltranslation/gt-cloud`) is GT's
product monorepo: the dashboard, the landing site, the API and the shared
UI in `packages/ui`. Prototemplate (`Kevin-Liu-01/Prototemplate`) is
Kevin's Next.js hub for GT design work: the brand, the deck, the docs and
these skills.

In Prototemplate the gates are Node scripts under `scripts/` and oxlint
with a copy of gt-cloud's gt-ui plugin, chained into `pnpm lint:all`; the
picture lint also runs before `next build`. In gt-cloud `pnpm lint` runs the
email identity check, oxlint with seven plugins and oxfmt, and CI runs it on
every pull request.

Paths are relative to a Prototemplate checkout (`$PROTOTEMPLATE`) or a
gt-cloud checkout (`$GT_CLOUD`), as each section names. Detail lives in
`references/line-auditor.md` (the line auditor) and
`references/gt-ui-rules.md` (every gt-ui rule, its scope in both
repositories, and gt-cloud's other plugins).

## 1. The principle

- A rule Kevin cares about gets a lint that fails on drift. On 2026-09-28
  he asked to "lint for this properly now ... lint for the correct inter,
  flag svgs, and other lints that make sense", and later that day to "make
  sure there's no rules that lead to two side rails". The result was
  fourteen new gt-ui rules in gt-cloud #5007 (icon tiers, the face and the
  flags, then eleven copy and layout laws) and three rail checks in
  Prototemplate's practices lint, with both codebases swept in the same
  changes. On 2026-10-05 he asked to enforce the correct Rasmus Inter, which
  started the type lint.
- Existing violations are ratcheted. The lint records today's count per
  file and fails only when a count rises, so a new violation fails the run
  while the recorded ones are fixed in their own changes.
- Every exemption is written in config with its reason: one comment per
  device in `ALLOW` in `lint-lines.mjs`, one comment per override block in
  Prototemplate's `.oxlintrc.json`, a reason after `--` on every
  `oxlint-disable` comment. An exemption without a reason is a defect.
- A gate never passes when it could not judge. `lint-lines.mjs` exits 2 on an
  HTTP error and, in shell mode, on a theme the page did not show or a state
  that did not open. The picture lint pins its standard by sha256.
- A geometric bug is linted from the render. The line auditor reads computed
  CSS in Chrome and the page check reads boxes, because source text cannot
  show where two borders meet.

## 2. Prototemplate gates

| Command | What it catches | Where it runs |
| --- | --- | --- |
| `pnpm lint:shell` | raw color literals in the shell layers | `lint:all` |
| `pnpm lint:practices` | button types, img alt, bare effects, `any`, quoted hex in TS, `!important`, the retired rail pair and its vocabulary | `lint:all` |
| `pnpm lint:lines:shell` | double lines, junctions, chrome borders outside the three roles, self-stacks, invisible seams | `lint:all`, against the dev server on 3005 |
| `pnpm lint:lines <url>` | doubles, junctions, self-stacks, invisible and missing seams over a whole page, with no border-role check | by hand |
| `pnpm lint:code` | the gt-ui copy and layout laws over the live surfaces | `lint:all` |
| `pnpm lint:pictures`, `pnpm test:pictures` | artifact pictures off the Blue Marble standard | `build` (the lint), `lint:all` (both) |
| `pnpm lint:type`, `pnpm lint:type:live`, `pnpm test:type` | families, stacks, features, weights, heading metrics, tracking and mono off the Inter tokens, in the source and (live) in the rendered pages | `build` (the static mode), `lint:all` (all three) |
| `pnpm lint:radius`, `pnpm lint:radius:live`, `pnpm test:radius` | a corner written outside the six `--pt-radius-<role>` tokens, a rounded shell or row, a square control, a chip off the chip corner, the token values unpinned, and (live) a computed corner off 0, 4, 5 and 6px or a picture showing past a rounded frame | `build` (the static mode), `lint:all` (all three) |
| `pnpm lint:heads`, `pnpm lint:heads:live`, `pnpm test:heads` | a book head without its props or with a page name not from `src/lib/page-names.ts`, a route restyling the shared head, band or dividers, a second hatch, a guide over a title, a space off its token, and (live) the head's structure, the title's clearance, the lead, the panel and its Updated day, the mast rule, the band's two rules and the dividers, measured at 1440 and 390 in both themes | `build` (the static mode), `lint:all` (all three) |
| `pnpm lint:updated`, `pnpm test:updated` | a stale `src/lib/updated.ts`: a commit touched a book page after the day the file records, a page's path list changed, a page missing or orphaned, a path that matches nothing, a client module importing the file | `build` (the check, skipped on a shallow clone or Vercel), `lint:all` (both); `pnpm build:updated --staged` before a commit |
| `pnpm lint:skills`, `pnpm test:skills` | a curated skill off its contract (frontmatter, Sources, em dashes, home paths, emails, a slug the wiki already holds, a missing README row), a stale `src/lib/skills.ts`, and the installer's behaviour | `lint:all` (both) |
| `pnpm check:pages` | overflow, clipping, errors, tap targets, invariants, layout shift, interactions, the presenter's titles, every deck slide, on phones, tablets and desktops | `--preset quick` by hand on touched pages each round, the full preset on the whole site before a release |
| `pnpm exec tsc --noEmit` | types | by hand, 3 to 5 minutes |

`pnpm lint:all` is
`pnpm lint:shell && pnpm lint:practices && pnpm lint:type && pnpm lint:radius && pnpm lint:heads && pnpm lint:skills && pnpm lint:updated && pnpm lint:lines:shell && pnpm lint:type:live && pnpm lint:radius:live && pnpm lint:heads:live && pnpm lint:code && pnpm lint:pictures && pnpm test:pictures && pnpm test:type && pnpm test:radius && pnpm test:heads && pnpm test:updated && pnpm test:skills`.
`pnpm build` is `node scripts/lint-pictures.mjs && node scripts/lint-type.mjs && node scripts/lint-radius.mjs && node scripts/lint-heads.mjs && node scripts/build-updated.mjs --check && next build`. The dev
server is `pnpm dev` (`next dev --turbopack --port 3005`); `lint:all` needs it
running because of the line audit.

### lint:shell

`scripts/lint-shell.mjs` reads `src/components/shell`,
`src/components/viewer`, `src/app/d/toolchain/sections/bento-motion.css` and
`src/app/d/toolchain/sections/Bento.tsx` and fails on any hex, `rgb()`,
`rgba()`, `hsl()` or `oklch()` literal. A custom property definition
(`--x: #fff`) is where a literal belongs and passes. A line that consumes
`var(--...)` passes unless a hex, `rgb()` or `rgba()` literal remains after
the `var()` calls are removed, so an `hsl()` or `oklch()` beside a `var()`
is not caught; read those lines yourself. Comment lines are skipped. The
marker `lint-shell: allow` on a line is for a token fallback read at runtime
and nothing else. Add a folder to `TARGETS` when it moves onto the shell
primitives.

### lint:practices

`scripts/lint-practices.mjs` scans `src/**/*.{ts,tsx,css}` for nine checks:
`button-missing-type`, `img-missing-alt`, `bare-useEffect` (outside
`use-mount-effect`), `any-type` (`: any`, `as any`), `raw-hex-in-tsx` (a
six-digit hex right after a quote, a backtick or an opening parenthesis in
TS or TSX), `important-in-css`, `outer-rail-pair` (a pseudo that pushes an
inline border pair outside its box, or a column widened past `--tc-rail`),
`rail-outer-token` (`--tc-rail-outer`) and `retired-rail-vocabulary`
("outer pair", "outer rail", "doubled outer", "doubled rails" on a line
that does not say "retire"). The vocabulary check also reads `DESIGN.md`,
`BRAND.md`, `ARCHITECTURE.md` and every `.md` under `docs/`, because the
docs are the part that recommends. The brand's two-stroke
connector is called "the thread" or "the doubled line", and the rule leaves
those words alone.

The ratchet compares per-file counts per check with
`scripts/lint-practices.baseline.json` and fails when a file's count rises.
Counts are kept per file because parallel sessions move lines all the time,
and a per-file count stays the same when a line moves. The three rail
checks have no baseline entries, so they stand at zero. On 2026-10-05 the
totals are 2 buttons without a type, 0 images without alt, 8 bare effects
against a baseline of 9 (the slack is
`src/app/present/viewer/Scoreboard.tsx`, recorded at 1 and now at 0), 3
`any`, 52 quoted hex values, 204 `!important` and 0 for each rail check.

- `node scripts/lint-practices.mjs --update-baseline` rewrites the baseline
  with every violation present at that moment, new ones included. Run it
  only after a cleanup lowered counts, and read the JSON diff before
  committing it.
- A baseline count above the real count lets a new violation into that file
  without a failure, so lower the baseline after a cleanup.
- When a file or a direction is deleted, prune its baseline entries in the
  same commit (`ARCHITECTURE.md`, `docs/SHIP-LOOP.md` section 3).

### lint:lines and lint:lines:shell

`scripts/lint-lines.mjs` is the line auditor. Shell mode (`--shell`) drives
twelve routes at 1440, 1280 and 390 in both themes through the rest state,
the list (`[`), the index panel (`R`), the search (`Cmd K`, skipped on
`/d/production` and `/deck`), and the grid (`G`) and book (`B`) on `/` and
`/deck`. It fails on a double (two owners, parallel, 1 to 4px apart), a
junction (two owners on one seam), a chrome border outside `--pt-hair`,
`--pt-hair-soft` and `--pt-edge` (ink only in an active state), a self-stack
120px or longer, and an invisible seam. Page mode
(`node scripts/lint-lines.mjs <url> --theme dark|light`) audits the whole
document of any URL at 1440 and 1280 in one theme, adds missing seams, skips
the border-role check and prints JSON.

- It needs the dev server on 3005 (`--base` to change). Page mode with no
  URL audits `http://localhost:3005/d/toolchain?chrome=0`.
- It cannot see SVG strokes or canvas, skips elements under a 3D transform
  or a mask, and never hovers. Figures are checked by eye at 2x crops of
  every junction.
- It launches `CHROME_PATH`, else the Chrome for Testing build
  playwright-core installs (`pnpm exec playwright-core install chromium`).
- A full run is 72 page loads with up to five states each. Use
  `--only /docs --width 1440 --theme dark --jobs 1` while fixing, then run
  the whole gate once.
- Exit 1 means findings and exit 2 means the run could not judge.
  `--report` prints the findings and drops both the findings' exit 1 and the
  exit 2 for a state that did not open, so a clean exit under `--report`
  proves nothing.

`references/line-auditor.md` holds the thresholds, the chrome scope, the
allow list with its reasons and how to add a route or a state.

### lint:code

`pnpm lint:code` runs `oxlint` 1.74.0 with `.oxlintrc.json`, which turns base
oxlint off and loads only the gt-ui plugin from
`scripts/oxlint-plugins/gt-ui.ts`, a copy of gt-cloud's
`tooling/oxlint-plugins/gt-ui.ts`. Thirteen rules run on `src/app/**`,
`src/components/**` and `src/lib/**`: `single-rail`, `no-em-dash`,
`no-eyebrow`, `no-heading-period`, `cta-title-case`, `mono-is-not-voice`,
`no-smooth-scroll`, `no-gif-mark`, `icon-tiers`, `inter-only`,
`no-raw-locale-flags`, `typed-text-var` and `no-hex-colors`. The archived
directions under `src/app/d/`, `deck/` and `public/` are ignored.

The exemptions carry their reasons as comments: the presenter's animated
paging, the principles slide's flag sprite, the three files that load the
nameplate's Fraunces and Space Grotesk and the presenter intro's faces, and
the generated `src/lib/skills.ts` and `src/lib/motion.ts`. On 2026-10-05 the
copy lags gt-cloud main by one change to `inter-only`, which now judges only
the first family of a `fontFamily` list. A dry run of main's plugin over
Prototemplate's `src` that day reported nothing, so the recopy needs no other
edit. When gt-cloud's plugin changes, copy the whole file, run
`pnpm lint:code` and settle what it finds in the same commit.

### lint:pictures and test:pictures

`scripts/lint-pictures.mjs` holds the dithered artifact pictures to
`docs/ARTIFACT-PICTURES.md` and `scripts/mood-tone/standard.json`: both
manifests (`deck/shots/tone`, `public/brand/mood`) against their grids by
sha256 and bytes, 8-bit gray JPEGs at the placement's size and under the cap,
the house tone settings, each grid's region stats inside its kind's window,
the plate registry, the deck mood slides and their credits, the transition
demo on /docs, the screen constants by declaration, the built
`public/brand-deck.html` and the grid files it names in
`public/deck-assets`, and the retired names. It prints `path: message`
lines and exits 1 on any problem. `STANDARD_SHA256` pins `standard.json`,
which is byte-identical to gt-cloud's
`apps/dashboard/scripts/mood-tone/standard.json` on the open branch
`k/artifact-picture-standard` (#5133); gt-cloud main has no copy yet. It
runs before `next build`, so a picture defect stops the build.

`pnpm test:pictures` (`node --test scripts/lint-pictures.test.mjs`) copies the
files the lint reads into a temporary folder, breaks one thing per test and
asserts the problem is reported, and asserts the repository passes. The
standard, the cutter and how to add a picture are in the `gt-dither` skill.

### The type lint

`scripts/lint-type.mjs` holds the site's type to the rsms InterVariable
through the tokens in `src/components/viewer/tokens.css`. It was written
on 2026-10-05, when Kevin asked to enforce the correct Rasmus Inter. The
static mode runs in `build` and `lint:all` (`pnpm lint:type`), the live
mode reads every shell route at 1440 and 390 (`pnpm lint:type:live`), and
`pnpm test:type` runs its tests. The script's header comment is the
authority; the type system it holds is in `gt-brand` (`references/type.md`).

- Usage: `node scripts/lint-type.mjs [--report] [--update-baseline] [--root <dir>]`.
  Static mode reads `src/**/*.{css,ts,tsx}` minus `ALLOW_FILES`, prints
  `file:line RULE message`, and exits 0 on a pass, 1 on failures and 2 on
  an infrastructure failure.
- Hard rules T1 to T9: every family reads a type token or `inherit`; no family
  is named Inter, InterVariable, Inter var, Inter Display or Lausanne, and no
  `@font-face` has a `local()` source; `src/lib/fonts.ts` binds `ptInter`, no
  binding is named after an installed family, and every other `localFont` sets
  `preload: false`; `font-feature-settings` reads `--pt-ff-text` or
  `--pt-ff-display`; no `font-variation-settings` and no `font-optical-sizing: none`;
  no weight above 500 outside the nameplate and the specimens; `h1` and
  `h2` rules take their size, line height and tracking from the `--pt-d*`
  tokens and never set a family or features; no positive tracking on Inter;
  mono only on code elements and the named `MONO` selectors.
- Ratchets R1 to R3 count literal px `font-size`, `letter-spacing` and
  `line-height` per file against the baseline. A rise fails, a drop asks
  for `--update-baseline`, and a missing baseline fails.
- The exceptions are named objects with reasons: `ALLOW_FILES` (the `/d/`
  directions, the shared components only directions mount, other sessions'
  folders, the presenter), `NAMEPLATE`, `GROTESK_LABELS`, `SPECIMENS` and
  `MONO`. The escape hatch is `/* lint-type: allow <reason> */` on the line
  or the line above, and an empty reason fails.

### lint:skills and test:skills

`pnpm lint:skills` (`build-skills.mjs --check`) fails a skill off the
contract its header lists (frontmatter, Sources, no em dash, no home-folder
path or email, no slug the wiki's runtime list holds, a README row) and a
stale `src/lib/skills.ts` or `skills/README.md`. `pnpm test:skills` tests the installer in
temporary folders.

### check:pages

`pnpm check:pages` (`scripts/pagecheck/`) loads every page on the dev server on the device table in `scripts/site-pages.mjs`, phones from 320 wide to the 3440 ultrawide, a phone or a tablet counts as a touch device at any width, and `--preset quick` is the everyday run. What each cell reads, the presenter walk, the deck slides, the inline layout-shift limit and the report are in `references/page-check.md`.

### tsc

`pnpm exec tsc --noEmit` takes 3 to 5 minutes. `tsconfig.json` includes
`**/*.ts` and excludes `node_modules` and `scripts/oxlint-plugins`, so the
plugin copy is never type-checked here and a `.ts` file under `skills/`
would be. Skill helpers are `.mjs`; a `.ts` file there needs `skills` added
to the exclude list.

## 3. gt-cloud gates

### pnpm lint

`pnpm lint` is
`node scripts/check-email-identities.mjs && oxlint --quiet . && oxfmt --check .`,
and `.github/workflows/ci.yml` runs it as "Run lint and format check".
`pnpm lint:fix` runs `oxlint --quiet --fix .`, `oxfmt .` and the email check.

- `--quiet` reports errors only, so a rule set to `warn` never fails CI
  (`gt-next/no-dynamic-jsx` on the dashboard, `no-explicit-any` outside the
  UI scope).
- The email identity check `git grep`s TypeScript and JavaScript for a GT
  sender address written into a `from`, `replyTo` or email-named
  assignment outside `packages/settings/src/email.ts`. Import the identity
  from that file.
- `lefthook.yml` runs `oxlint --fix` and `oxfmt` on staged files before a
  commit and restages them, when lefthook is installed in the checkout.

### oxlint and the gt-ui rules

`.oxlintrc.json` loads gt-ui, gt-next, gt-react, gt-db, gt-logging, gt-syntax
and sonarjs. The gt-ui rules run by scope:

- all UI (`apps/dashboard`, `apps/landing`, `packages/ui`): radius, sibling
  spacing, nested surfaces, thin fonts, no `useEffect`, no dynamic import,
  raw Tailwind colors, hardcoded black and white, explicit `unknown`, locale
  flags;
- landing and `packages/ui`: `inter-only`, `no-em-dash`, `typed-text-var`,
  `no-hex-colors`, `mono-is-not-voice`, `single-rail`, `no-smooth-scroll`,
  `no-heading-period`, `no-gif-mark`;
- landing only: `shared-cta`, `no-eyebrow`, `cta-title-case`;
- `icon-tiers` on landing and
  `packages/ui/src/components/{frame,layout,mobile,fumadocs,pricing,dialog,animated}`.

Outside the UI: `gt-db/no-raw-sql`, the four `gt-logging` rules on
`apps/api` and `packages/node/src`, `gt-syntax/prefer-while-true`,
`sonarjs/cognitive-complexity` at 50 and `typescript/consistent-type-imports`
everywhere. `references/gt-ui-rules.md` lists what each rule refuses, its fix
and every exempted file. The tests are in
`tooling/oxlint-plugins/gt-ui.test.ts`; run them with
`cd tooling/oxlint-plugins && pnpm test`.

### oxfmt

`.oxfmtrc.json` sets single quotes (JSX too), semicolons, two spaces, a print
width of 80, ES5 trailing commas, LF, preserved prose wrap and Tailwind class
sorting inside `clsx`, `cn` and `cva`. Its ignore list holds `.agents/**`,
the root markdown files, the landing's content and legal submodules, the
OpenAPI files and the generated Prisma and route files. A generated data
file that must not be reformatted goes into `ignorePatterns` in the same
pull request that adds it. CI fails a pull request on any unformatted file,
so run `pnpm exec oxfmt <changed files>` before pushing; a file missed that
way gets its own `style(...)` commit.

### Gates on open branches (2026-10-05)

- #5133 (`k/artifact-picture-standard`) adds
  `node scripts/check-artifact-pictures.mjs` (`pnpm check:artifact-pictures`)
  to `pnpm lint` and `pnpm lint:fix`, gt-cloud's counterpart of the picture
  lint.
- #4977 (`k/dashboard-shell-ia`) adds `gt-ui/no-theme-icons` to every UI
  folder (no Sun or Moon imports from Lucide or Heroicons; the theme switch
  draws the circle glyphs of the shared `ThemeToggle`) and turns
  `inter-only`, `no-em-dash`, `no-eyebrow`, `typed-text-var`,
  `no-hex-colors`, `mono-is-not-voice`, `no-smooth-scroll`,
  `no-heading-period`, `no-gif-mark` and `icon-tiers` on for all of
  `apps/dashboard`.
- #5029 (`k/dashboard-icon-tiers`) turns `icon-tiers` on for all of
  `apps/dashboard`.

Read the branch's `package.json` and `.oxlintrc.json` before judging a
finding there.

## 4. Writing a new lint

1. State the law in a header comment and cite its source: the `DESIGN.md`
   section, Kevin's dated words, or the brand questionnaire. The message a
   failure prints states the law and the fix, as the gt-ui messages do.
2. Export pure checkers so tests can import them (`lint-pictures.mjs`
   exports `lintPictures`, `bayer8` and `jpegFrame`; gt-ui exports
   `isEyebrowClassList` and its siblings).
3. Print `file:line rule message`. Exit 0 on a pass, 1 on findings and 2 when
   the lint could not judge. Offer `--report` to print without failing where
   a report is useful.
4. Write tests: one passing and one failing fixture per rule, and one test
   that the repository passes. Prototemplate uses `node --test` with fixture
   copies in a temporary folder; gt-cloud uses vitest plus one oxlint
   integration case under `apps/landing/src`.
5. Wire it where the others sit. In Prototemplate add a `package.json`
   script, chain it into `lint:all` with `&&`, and put a static lint into
   `build` before `next build`. In gt-cloud add the rule to gt-ui with an
   override in `.oxlintrc.json` scoped to the folders where the law holds,
   or chain a script into `pnpm lint`.
6. Write each exemption in config with its reason. Prototemplate's
   `.oxlintrc.json` takes a comment above the override; gt-cloud's carries
   none today, so the pull request body states each exempted file and why.
   Violations that cannot be fixed in the same change go into a ratchet
   baseline.
7. Sweep the codebase in the same change, so the rule lands at zero or at
   its baseline. #5007 fixed 22 em dashes and the CTA labels with its rules,
   and Prototemplate 8c989de rewrote the craft copy's em dashes and removed
   the outer rail pair with its checks.
8. Copy the rule to the other repository when it applies there. gt-ui.ts is
   copied whole into `$PROTOTEMPLATE/scripts/oxlint-plugins/gt-ui.ts` and the
   rule is enabled in `.oxlintrc.json`. `standard.json` and both sha256 pins
   change in both repositories in one round.
9. Update the documents that state the law in the same change: `DESIGN.md`,
   `docs/SHIP-LOOP.md`, gt-cloud's `.agents/skills/gt-landing`, and this
   skill.

## 5. Gate hygiene

- Chain gates with `&&`. On 2026-08-07 the one-liner
  `pnpm build > log; git add -A && git commit && git push` pushed a broken
  build because the `;` ignored the build's exit 1. Write
  `pnpm build > "$LOG" 2>&1 && git commit ...`.
- Never pipe a gated command. On 2026-08-11
  `pnpm build 2>&1 | tail -2 && git ...` pushed through a failing build,
  because zsh without `pipefail` returns `tail`'s status. Capture to a file
  and read the file, or `set -o pipefail` first.
- Capture the real exit code when reporting a gate:
  `pnpm build > "$LOG" 2>&1; echo $?`.
- Run the browser gates one at a time. `lint:lines:shell` failed once on
  2026-10-01 while page captures ran beside it, and a rerun passed.
- Before trusting a red browser gate, load one route by hand. A dev server
  that answers 500 (on 2026-10-05 a Turbopack worker timeout on
  `globals.css`) makes the line audit exit 2 on its first route; restart the
  server only if the session owns it.
- When `lint:all` is red on files the change does not touch, say which gate
  and whose files, and show that the change's own files are clean
  (`docs/SHIP-LOOP.md` section 0).
- The production build in a scratch worktree, the conflict-marker sweep and
  pathspec commits in a shared checkout are part of landing, in `gt-ship`
  section 8.

## 6. Fixing failures by class

| Failure | Fix |
| --- | --- |
| double line | keep the owner the ownership table in `DESIGN.md` section 2 names and delete the other border; add to `ALLOW` only a device that strokes twice on purpose, with its reason |
| junction | one owner keeps the seam and the other drops that side (`border-top: 0`): the sidebar's right edge owns sidebar and stage, the toolbar's bottom edge owns toolbar and stage, the index panel's left edge owns panel and stage |
| border role | structural lines and large surfaces draw `var(--pt-hair)`, rows draw `var(--pt-hair-soft)`, frames of images and tiles draw `var(--pt-edge)`; `--pt-ink` only on an active state |
| self-stack | `background-clip: padding-box` on the element |
| invisible seam | a fill or reveal close to the ground cannot show a line; draw a border in its role or change the fill |
| missing seam (page mode) | one horizontal rule across the column at the boundary, owned by one block |
| state did not apply (exit 2) | the key did not open the list, panel or search; fix the page or the driver |
| raw color in the shell | a token from `src/components/viewer/tokens.css`, or a new token defined at the root class |
| practices count rose | fix the new violation; lower the baseline after a cleanup and prune deleted files |
| gt-ui finding | the fix column in `references/gt-ui-rules.md`; a new control glyph goes into `CONTROL_LUCIDE_GLYPHS` |
| picture problem | recut through the cutter (`pnpm mood-tone <sources> --set deck\|plate --preview <dir>`) and commit grid and manifest together; never edit either by hand or add tone settings; a stale built deck needs `pnpm build:deck` |
| standard sha256 | change both repositories' `standard.json` and both pins in one round |
| page check defect | the `file:line` and fix in `REPORT.md`; a phone tap target grows to 44px |
| oxfmt | `pnpm exec oxfmt <files>` or `pnpm format:fix` |
| email identity | import the sender from `packages/settings/src/email.ts` |

## Review checklist

- [ ] Prototemplate: `pnpm lint:all` exits 0 with the dev server on 3005, or
      every red line is in files the change does not touch and is named.
- [ ] gt-cloud: `pnpm lint` exits 0 on the branch.
- [ ] No new `ALLOW` entry, override, disable comment or baseline rise
      without a written reason.
- [ ] A new rule has passing and failing tests, is wired into `lint:all` and
      `build` or `pnpm lint`, lands with the codebase swept, updates the
      documents that state the law, and is copied to the other repository
      where it applies.
- [ ] Gated commands are chained with `&&`, unpiped, and their exit codes
      are captured.
- [ ] The production build ran in a scratch worktree.
- [ ] SVG figures were checked by eye at 2x crops of their junctions.
- [ ] `pnpm check:pages --preset quick` on the touched pages shows zero
      defects and every interaction passing.
- [ ] `pnpm exec tsc --noEmit` passes.

## Related skills

GT skills beside it: `gt-ship` (the ship loop these gates serve, and the
scratch worktree build), `prototemplate` (the repository, its registries and
the routes each gate walks), `gt-brand` (the type system the type lint
holds), `gt-dither` (the picture standard the picture lint holds),
`gt-aesthetic` and `gt-components` (the line law and tokens the auditor
reads), `gt-diagrams` (the SVG figures the auditor cannot see), `gt-voice`
(the copy rules behind `no-em-dash`, `no-heading-period` and
`cta-title-case`), `gt-landing-pages` (gt-cloud's landing conventions). Wiki
skills it depends on: `agent-browser` (the visual check the auditor cannot
make).

## Sources

- Prototemplate: `package.json` (scripts); `scripts/lint-lines.mjs`;
  `scripts/lint-shell.mjs`; `scripts/lint-practices.mjs` and
  `scripts/lint-practices.baseline.json`; `scripts/lint-pictures.mjs` and
  `scripts/lint-pictures.test.mjs`; `.oxlintrc.json`;
  `scripts/oxlint-plugins/gt-ui.ts`; `scripts/pagecheck/README.md`;
  `docs/SHIP-LOOP.md` sections 0 to 4 and 7; `DESIGN.md` sections 2, 3, 7
  and 15; `docs/ARTIFACT-PICTURES.md` ("The lint"); `ARCHITECTURE.md`
  (the direction registry); commits 8c989de (2026-09-28), 946b1c9
  (2026-10-01), d0f6c7e and f8dfa8b (2026-10-05).
- gt-cloud (main): `package.json` (`lint`, `lint:fix`, `format`);
  `.oxlintrc.json`; `.oxfmtrc.json`; `lefthook.yml`;
  `.github/workflows/ci.yml`; `scripts/check-email-identities.mjs`;
  `tooling/oxlint-plugins/gt-ui.ts` and `gt-ui.test.ts`; #5007 (0cfb5844a,
  2026-09-29). Open branches, read 2026-10-05: `k/artifact-picture-standard`
  (#5133), `k/dashboard-shell-ia` (#4977), `k/dashboard-icon-tiers` (#5029).
- Prototemplate working tree, 2026-10-05: `scripts/lint-type.mjs` (its header
  comment and `ALLOW_FILES`), written in the type round; `tsconfig.json`.
- Claude memory notes: landing-icon-rule, ship-loop-hard-gates,
  page-check-system, dashboard-deck-grammar, artifact-picture-standard.
- Kevin's directives: 2026-09-28 ("lint for this properly now", the single
  rail), 2026-10-01 ("carry over the system of checking the pages into
  prototemplate"), 2026-10-05 (the artifact picture standard, the correct
  Rasmus Inter).
