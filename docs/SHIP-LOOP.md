# Ship loop

The verify-and-ship procedure every round of work in Prototemplate runs
before it lands on `main`. Each check below must pass: the line audit, the
page check, the ratchets, the type checker, the captures and the gated
build.

## 0. Ground rules

- The dev server runs at `http://localhost:3005` in the shared checkout.
  A worktree runs its own server on another port, and `PT_BASE` points the
  live lints, the page check and the captures at it.
- A concurrent session may be editing the same worktree. Check
  `git status` before staging; commit only your own files. Expect the other
  session to absorb your changes into its commits. When that happens,
  verify by content, not by diff, and push the backup branch from HEAD.
- `pnpm lint:all` may be red on files you don't own; ship anyway when your
  own diff is clean under the checks below.

## 1. The line audit

```bash
node scripts/lint/lines.mjs http://localhost:3005/<page> --theme light
node scripts/lint/lines.mjs http://localhost:3005/<page> --theme dark
```

- Audits at 1440 and 1280; expects **zero** findings in all four classes
  (doubles, missing, selfStacks, invisibles) in both themes.
- The standing battery: `/`, `/docs`, the three singularity homes
  (`dossier`, `orbit`, `signal`) and every page the round touched.
- Deliberate devices live on the ALLOW list inside the script; add an owner
  there only for a sanctioned device, never to silence a real double.
- The auditor reconstructs lines from computed CSS and cannot see SVG
  strokes. Figures get verified by eye with 2× pixel crops of junctions.

## 2. The page check

```bash
pnpm check:pages --preset quick --pages <id>,<id>   # the round's touched pages
pnpm check:pages                                    # every page on every device, before a release
```

`scripts/check/pagecheck/` (its README explains the tool) loads every named
page on the dev server on the device table in `scripts/lib/site-pages.mjs`:
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

`scripts/lint/practices.mjs` counts button types, bare effects, any-types,
raw hex in TS/TSX (`'#xxxxxx'`-quoted; unquoted hex inside template CSS
snippets doesn't count), and `!important`. It refuses anything that adds to
`lint/practices.baseline.json`. When files are deleted, prune their baseline
entries in the same commit.

`scripts/lint/type.mjs` holds the type to DESIGN.md section 4 ("Book type"):
statically on every `pnpm build` and `pnpm lint:type` (family, stack,
next/font binding, features, weight, heading and tracking rules, plus a
per-file ratchet of literal sizes in `lint/type.baseline.json`), and
against the dev server with `pnpm lint:type:live` (the face Chrome
rendered, the computed features, tracking, optical size and weight).
`pnpm test:type` runs its tests; `--update-baseline` records a burn-down.

`scripts/lint/radius.mjs` holds the corners to DESIGN.md section 2
("Corners: rounded controls, square shells"): statically on every
`pnpm build` and `pnpm lint:radius` (every radius reads one of the six
`--pt-radius-<role>` tokens, shells and rows stay square, controls are
never square, chips read the chip corner, the token values are pinned),
and against the dev server with `pnpm lint:radius:live` (the computed
corners at 1440 and 390, the overlays on /brand and the toolbar's hover
boxes: square shells, round controls, a picture clipped by its frame).
A named exception carries `/* lint-radius: allow <reason> */`.
`pnpm test:radius` runs its tests.

`scripts/lint/heads.mjs` holds every book page to DESIGN.md section 4
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
browser pane pauses rAF, so shader canvases come out blank):

- Driver: the repository's `playwright-core`, launched against Chrome for
  Testing: `CHROME_PATH`, else the build playwright-core installs
  (`pnpm exec playwright-core install chromium`). `pnpm capture:pages`
  and `pnpm check:pages` launch it the same way.
- Dark shots: seed `localStorage['gt-theme'] = 'dark'` in an init script.
- Zoom junctions at `deviceScaleFactor: 2`+ and crop, because full-page shots hide
  1px defects.
- Scroll through the page first so IntersectionObserver-armed plates mount;
  wait out arm delays before shooting animated engines.

## 6. Commit and back up

- Commit only your files, by explicit path. Commits author as Kevin with
  his GitHub noreply address
  (`66856750+Kevin-Liu-01@users.noreply.github.com`) and end with the
  session's `Co-Authored-By:` trailer (decisions log, 2026-10-10).
- Run `pnpm build:updated --staged` after staging the change, and stage
  `src/lib/updated.ts` with it. `pnpm lint:updated` (in the build and
  `pnpm lint:all`) fails when a commit touched a book page and the file
  was not regenerated with it.
- Push the round to a branch of this repository from HEAD
  (`git push origin HEAD:<branch>`), so the work survives a wiped scratch
  folder or a reset checkout. Main takes only work Kevin approved
  (section 7).

## 7. Push to main

Prototemplate `main` is the only copy of this code. The public site,
www.prototemplate.com, deploys from it through the General Translation
team's Vercel project. gt-cloud's `apps/redesign` stopped being a copy on
2026-09-08, so nothing is copied in from another tree, and no
`rsync --delete` runs toward this repository: it would erase the routes
that exist only here.

Kevin decides what lands. Exploration and redesign rounds stay on a branch
or on the local dev server until he says to land them (decisions log,
2026-09-14). Approved work lands in this order:

```bash
git fetch origin && git log --oneline HEAD..origin/main   # other sessions push to main too: take their commits first
git grep -n '^<<<<<<< ' -- src docs deck skills scripts     # any hit stops the push
pnpm build > "$TMPDIR/pt-build.log" 2>&1 && git push origin HEAD:main || tail -40 "$TMPDIR/pt-build.log"
```

- The build gates the push with `&&`. A pipe such as `pnpm build | tail`
  returns `tail`'s exit code and lets a failed build through, which
  happened on 2026-08-07 and 2026-08-11. A flaky failure with a clean log
  gets one re-run before diagnosis.
- Commit with explicit paths, never `git add -A` or `git add .`: the shared
  checkout holds other sessions' files, including the untracked `motion/`
  folder.
- Push with `git push origin HEAD:main` when HEAD is a fast-forward of
  `origin/main`. Rewriting shared history needs Kevin.
- After the push, read the commit's deployment statuses on GitHub and the
  new build on www.prototemplate.com. A failed Preview is redeployed, never
  pushed again with an empty commit.
