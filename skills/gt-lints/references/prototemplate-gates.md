# Prototemplate gates in detail

`SKILL.md` section 2 points here: what each Prototemplate gate reads, how it decides, its flags and exit codes, and its traps. Moved from `SKILL.md` on 2026-10-10, unchanged; the script header of each gate is the authority.

## lint:shell

`scripts/lint/shell.mjs` reads `src/components/shell`,
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

## lint:practices

`scripts/lint/practices.mjs` scans `src/**/*.{ts,tsx,css}` for nine checks:
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
`scripts/lint/practices.baseline.json` and fails when a file's count rises.
Counts are kept per file because parallel sessions move lines all the time,
and a per-file count stays the same when a line moves. The three rail
checks have no baseline entries, so they stand at zero. On 2026-10-05 the
totals are 2 buttons without a type, 0 images without alt, 8 bare effects
against a baseline of 9 (the slack is
`src/app/present/viewer/Scoreboard.tsx`, recorded at 1 and now at 0), 3
`any`, 52 quoted hex values, 204 `!important` and 0 for each rail check.

- `node scripts/lint/practices.mjs --update-baseline` rewrites the baseline
  with every violation present at that moment, new ones included. Run it
  only after a cleanup lowered counts, and read the JSON diff before
  committing it.
- A baseline count above the real count lets a new violation into that file
  without a failure, so lower the baseline after a cleanup.
- When a file or a direction is deleted, prune its baseline entries in the
  same commit (`ARCHITECTURE.md`, `docs/SHIP-LOOP.md` section 3).

## lint:lines and lint:lines:shell

`scripts/lint/lines.mjs` is the line auditor. Shell mode (`--shell`) drives
twelve routes at 1440, 1280 and 390 in both themes through the rest state,
the list (`[`), the index panel (`R`), the search (`Cmd K`, skipped on
`/d/production` and `/deck`), and the grid (`G`) and book (`B`) on `/` and
`/deck`. It fails on a double (two owners, parallel, 1 to 4px apart), a
junction (two owners on one seam), a chrome border outside `--pt-hair`,
`--pt-hair-soft` and `--pt-edge` (ink only in an active state), a self-stack
120px or longer, and an invisible seam. Page mode
(`node scripts/lint/lines.mjs <url> --theme dark|light`) audits the whole
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

## lint:code

`pnpm lint:code` runs `oxlint` 1.74.0 with `.oxlintrc.json`, which turns base
oxlint off and loads only the gt-ui plugin from
`scripts/lint/oxlint-plugins/gt-ui.ts`, a copy of gt-cloud's
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

## lint:pictures and test:pictures

`scripts/lint/pictures.mjs` holds the dithered artifact pictures to
`docs/ARTIFACT-PICTURES.md` and `scripts/media/mood-tone/standard.json`: both
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
`k/artifact-picture-standard` (#5133, open on 2026-10-10); gt-cloud main has no copy yet. It
runs before `next build`, so a picture defect stops the build.

`pnpm test:pictures` (`node --test scripts/lint/pictures.test.mjs`) copies the
files the lint reads into a temporary folder, breaks one thing per test and
asserts the problem is reported, and asserts the repository passes. The
standard, the cutter and how to add a picture are in the `gt-dither` skill.

## The type lint

`scripts/lint/type.mjs` holds the site's type to the rsms InterVariable
through the tokens in `src/components/viewer/tokens.css`. It was written
on 2026-10-05, when Kevin asked to enforce the correct Rasmus Inter. The
static mode runs in `build` and `lint:all` (`pnpm lint:type`), the live
mode reads every shell route at 1440 and 390 (`pnpm lint:type:live`), and
`pnpm test:type` runs its tests. The script's header comment is the
authority; the type system it holds is in `gt-brand` (`references/type.md`).

- Usage: `node scripts/lint/type.mjs [--report] [--update-baseline] [--root <dir>]`.
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

## lint:skills and test:skills

`pnpm lint:skills` (`build/skills.mjs --check`) fails a skill off the
contract its header lists (frontmatter, Sources, no em dash, no home-folder
path or email, no slug the wiki's runtime list holds, a README row) and a
stale `src/lib/skills.ts` or `skills/README.md`. `pnpm test:skills` tests the installer in
temporary folders.

## check:pages

`pnpm check:pages` (`scripts/check/pagecheck/`) loads every page on the dev server on the device table in `scripts/lib/site-pages.mjs`, phones from 320 wide to the 3440 ultrawide, a phone or a tablet counts as a touch device at any width, and `--preset quick` is the everyday run. What each cell reads, the presenter walk, the deck slides, the inline layout-shift limit and the report are in `references/page-check.md`.

## tsc

`pnpm exec tsc --noEmit` takes 3 to 5 minutes. `tsconfig.json` includes
`**/*.ts` and excludes `node_modules` and `scripts/lint/oxlint-plugins`, so the
plugin copy is never type-checked here and a `.ts` file under `skills/`
would be. Skill helpers are `.mjs`; a `.ts` file there needs `skills` added
to the exclude list.
