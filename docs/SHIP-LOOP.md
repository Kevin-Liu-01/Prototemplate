# The Ship Loop

The verify-and-ship procedure every round of work on `apps/redesign` runs
before it lands. Nothing ships on faith: the auditor, the type checker, the
camera, and the mirror build all get a vote.

## 0. Ground rules

- The dev server runs at `http://localhost:3006`.
- A concurrent session may be editing the same worktree. Check
  `git status` before staging; commit only your own files. Expect the other
  session to absorb your changes into its commits — when that happens,
  verify by content, not by diff, and push the backup branch from HEAD.
- `pnpm lint:all` may be red on files you don't own; ship anyway when your
  own diff is clean under the checks below.

## 1. The line audit

```bash
node scripts/lint-lines.mjs http://localhost:3006/<page> --theme light
node scripts/lint-lines.mjs http://localhost:3006/<page> --theme dark
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
pnpm check:pages --pages <id>,<id>            # the round's touched pages
pnpm check:pages                              # the whole site, before a release
```

`scripts/pagecheck/` (its README explains the tool) loads every named
page on the dev server at ten viewports (360x800, 390x844, 430x932,
768x1024, 1024x768, 1280x720, 1440x900, 1527x814, 1920x1080, 2560x1440)
in both themes and reads each cell: horizontal overflow, boxes past the
viewport edge, text clipped mid-word, console errors and failed
resources, the theme applied, the phone tap targets and the site
invariants `hooks.mjs` names (the 52px toolbar row, the stage rows, the
sidebar column, the deck's sheet, the docs contents grid, the gallery's
tiles). It then runs a layout-shift observer on every page at four
viewports, the declared interactions (the theme flip, the index panel and
the preview, the search, the deck's arrow key, a docs contents link, the
presenter's dock) with before and after captures, and writes
`.pagecheck/REPORT.md`.

- Thresholds: a tap target under 40px on its smaller side is a defect, 40
  to 43 a note (44 is the target); a layout-shift entry over 0.001 is
  listed with its sources; an ellipsis truncation is a note, a clip
  without one a defect.
- Each defect row names the file and line to change (the rule declaring
  the element's class, the line rendering its text, or the line naming a
  missing file) and a fix written from the element's kind; a folder
  stands in when no line matched.
- Expects **zero** defects and every interaction passing; the run exits 1
  otherwise. Notes are read, not fixed on sight.
- A round's touched pages run it in both themes at the ten viewports
  before shipping; the whole site runs before a release.
- Captures live under `.pagecheck/shots/` (ignored by git); `--sheets`
  adds a contact sheet per viewport for a quick look at every page.

## 3. The practices ratchet

`scripts/lint-practices.mjs` counts button types, bare effects, any-types,
raw hex in TS/TSX (`'#xxxxxx'`-quoted — unquoted hex inside template CSS
snippets doesn't count), and `!important`. It refuses anything that adds to
`lint-practices.baseline.json`. When files are deleted, prune their baseline
entries in the same commit.

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
