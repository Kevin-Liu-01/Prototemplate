# Ship loop

The verify-and-ship procedure every round of work on `apps/redesign` runs
before it lands. Nothing ships on faith: the auditor, the type checker, the
camera, and the mirror build all get a vote.

## 0. Ground rules

- The dev server runs at `http://localhost:3005`.
- A concurrent session may be editing the same worktree. Check
  `git status` before staging; commit only your own files. Expect the other
  session to absorb your changes into its commits — when that happens,
  verify by content, not by diff, and push the backup branch from HEAD.
- `pnpm lint:all` may be red on files you don't own; ship anyway when your
  own diff is clean under the checks below.

## 1. The line audit

```bash
node scripts/lint-lines.mjs http://localhost:3005/<page> --theme light
node scripts/lint-lines.mjs http://localhost:3005/<page> --theme dark
```

- Audits at 1440 and 1280; expects **zero** findings in all four classes
  (doubles, missing, selfStacks, invisibles) in both themes.
- The standing battery: `/`, `/craft`, and the three singularity homes
  (`dossier`, `orbit`, `signal`) — plus every page the round touched.
- Deliberate devices live on the ALLOW list inside the script; add an owner
  there only for a sanctioned device, never to silence a real double.
- The auditor reconstructs lines from computed CSS — it cannot see SVG
  strokes. Figures get verified by eye with 2× pixel crops of junctions.

## 2. The page check

```bash
pnpm check:pages --preset quick --pages <id>,<id>   # the round's touched pages
pnpm check:pages                                    # every page on every device, before a release
```

`scripts/pagecheck/` (its README explains the tool) loads every named
page on the dev server on the device table in `scripts/site-pages.mjs`:
phones from 320x568 to 430x932 and on their sides, tablets from 768x1024
to 1366x1024 in both orientations, desktops from 1280x720 to the 3440x1440
ultrawide, Kevin's 1527x814 laptop and 1440x900 at 200% zoom. A phone or
a tablet is read as a touch device whatever its width. The quick preset
reads eight devices in dark and 1440x900 in light; the full preset every
device in dark and three in light. Each cell is read once the page's own
ready signal has fired and its layout holds still: horizontal overflow,
boxes past the viewport edge, text clipped mid-word, console errors and
failed resources, the theme applied, the tap targets' hit areas on touch
devices, the layout shift score, and the site invariants `hooks.mjs`
names (the 52px toolbar row, the stage rows, the sidebar column, the
deck's sheet, the docs contents grid, the gallery's tiles). The declared
interactions run in the same queue: the theme flip, the index panel and
the preview, the search, the deck's arrow key, every deck slide in its
sheet and the deck's grid and book, a docs contents link, the
presenter's dock, and the presenter walked slide by slide on every
device (each title visible, the "So I built 12" close beat and the grid
at 16 prototypes). It writes `.pagecheck/REPORT.md` with a page by device
grid and the run's timing.

- Thresholds: a tap target under 40px on a phone is a defect, 40 to 43 a
  note (44 is the target), a tablet's under 40 a note until Kevin decides
  on tablet touch sizing; a layout shift score over 0.1 is a defect and
  over 0.05 a note; an ellipsis truncation is a note, a clip without one
  a defect.
- Each defect row names the file and line to change (the rule declaring
  the element's class, the line rendering its text, or the line naming a
  missing file) and a fix written from the element's kind; a folder
  stands in when no line matched.
- Expects **zero** defects and every interaction passing; the run exits 1
  otherwise. Notes are read, not fixed on sight.
- A round's touched pages run the quick preset before shipping; the whole
  site runs the full preset before a release.
- Captures of the first screen live under `.pagecheck/shots/` (ignored by
  git), with the full page for a failing cell; `--sheets` adds a contact
  sheet per device for a quick look at every page.

## 3. The practices ratchet

`scripts/lint-practices.mjs` counts button types, bare effects, any-types,
raw hex in TS/TSX (`'#xxxxxx'`-quoted — unquoted hex inside template CSS
snippets doesn't count), and `!important`. It refuses anything that adds to
`lint-practices.baseline.json`. When files are deleted, prune their baseline
entries in the same commit.

`scripts/lint-type.mjs` holds the type to DESIGN.md section 4 ("Book type"):
statically on every `pnpm build` and `pnpm lint:type` (family, stack,
next/font binding, features, weight, heading and tracking rules, plus a
per-file ratchet of literal sizes in `lint-type.baseline.json`), and
against the dev server with `pnpm lint:type:live` (the face Chrome
rendered, the computed features, tracking, optical size and weight).
`pnpm test:type` runs its tests; `--update-baseline` records a burn-down.

`scripts/lint-radius.mjs` holds the corners to DESIGN.md section 2
("Corners: rounded controls, square shells"): statically on every
`pnpm build` and `pnpm lint:radius` (every radius reads one of the six
`--pt-radius-<role>` tokens, shells and rows stay square, controls are
never square, chips read the chip corner, the token values are pinned),
and against the dev server with `pnpm lint:radius:live` (the computed
corners at 1440 and 390, the overlays on /brand and the toolbar's hover
boxes: square shells, round controls, a picture clipped by its frame).
A named exception carries `/* lint-radius: allow <reason> */`.
`pnpm test:radius` runs its tests.

`scripts/lint-heads.mjs` holds every book page to DESIGN.md section 4
("The book page"): statically (`pnpm lint:heads`, in the build: BookHead's
props, page titles from `src/lib/page-names.ts`, no route restyling the
shared head, band or dividers, no second hatch, no guide over a title,
the spaces on their tokens), and against the dev server with
`pnpm lint:heads:live` (each head route at 1440 and 390 in both themes:
the structure, the title's clearance, the lead, the panel and its Updated
day, the mast rule, the band's two rules and the dividers, measured).
`pnpm test:heads` runs its tests.

## 4. Types

```bash
pnpm exec tsc -p tsconfig.json --noEmit
```

## 5. Film it

Screenshot every changed visual with the external harness (the in-app
browser pane pauses rAF — shader canvases come out blank):

- Driver: `playwright-core` from `scripts/node_modules`, launched against
  the Chrome for Testing binary.
- Dark shots: seed `localStorage['gt-theme'] = 'dark'` in an init script.
- Zoom junctions at `deviceScaleFactor: 2`+ and crop — full-page shots hide
  1px defects.
- Scroll through the page first so IntersectionObserver-armed plates mount;
  wait out arm delays before shooting animated engines.

## 6. Commit and back up

- Commit only your files;
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Run `pnpm build:updated --staged` after staging the change, and stage
  `src/lib/updated.ts` with it. `pnpm lint:updated` (in the build and
  `pnpm lint:all`) fails when a commit touched a book page and the file
  was not regenerated with it.
- Push a NEW backup branch each round from HEAD:
  `redesign/diagram-standard-v1<next-letter>`.

## 7. The mirror

Prototemplate `main` (`~/repos/Prototemplate`) is the primary repository.
The public site builds and deploys from it, and it carries routes that
`apps/redesign` does not have (`/docs`, `/brand`, `/deck`, `/compare`,
`/present`). Nothing is rsynced from `apps/redesign` into Prototemplate
with `--delete`: that command would erase every one of those routes.

Work that lands in Prototemplate `main` stays there. When a direction page
is still edited in `apps/redesign`, the changed files move into
Prototemplate one at a time, and the build is the gate:

```bash
cd ~/repos/Prototemplate
git checkout main && git pull --ff-only
cp <monorepo>/apps/redesign/src/app/d/<slug>/<file> src/app/d/<slug>/<file>   # only the files the round touched
pnpm build > /tmp/proto-build.log 2>&1; echo $?   # capture the REAL exit code
```

- The build must exit 0; `cmd | tail` reports tail's exit, so capture as
  above. A flaky exit-1 with a clean log warrants one re-run before
  diagnosing.
- Sanity-grep the route manifest for pages you added or deleted.
- Commit and push Prototemplate `main` ("push to main" always means this
  repo).
- To refresh `apps/redesign` from Prototemplate, copy in the other
  direction, again file by file. Root docs (`BRAND.md`, `DESIGN.md`,
  `ARCHITECTURE.md`, `README.md`, `docs/`) are edited in Prototemplate
  first and copied outward.
