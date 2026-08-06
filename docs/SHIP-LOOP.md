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

## 2. The practices ratchet

`scripts/lint-practices.mjs` counts button types, bare effects, any-types,
raw hex in TS/TSX (`'#xxxxxx'`-quoted — unquoted hex inside template CSS
snippets doesn't count), and `!important`. It refuses anything that adds to
`lint-practices.baseline.json`. When files are deleted, prune their baseline
entries in the same commit.

## 3. Types

```bash
pnpm exec tsc -p tsconfig.json --noEmit
```

## 4. Film it

Screenshot every changed visual with the external harness (the in-app
browser pane pauses rAF — shader canvases come out blank):

- Driver: `playwright-core` from `scripts/node_modules`, launched against
  the Chrome for Testing binary.
- Dark shots: seed `localStorage['gt-theme'] = 'dark'` in an init script.
- Zoom junctions at `deviceScaleFactor: 2`+ and crop — full-page shots hide
  1px defects.
- Scroll through the page first so IntersectionObserver-armed plates mount;
  wait out arm delays before shooting animated engines.

## 5. Commit and back up

- Commit only your files;
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Push a NEW backup branch each round from HEAD:
  `redesign/diagram-standard-v1<next-letter>`.

## 6. Mirror to Prototemplate

```bash
rsync -a --delete --exclude '/app/review' src/ ~/repos/Prototemplate/src/
rsync -a --delete public/ ~/repos/Prototemplate/public/
rsync -a DESIGN.md ARCHITECTURE.md README.md docs/ ~/repos/Prototemplate/  # docs ride along
cd ~/repos/Prototemplate
pnpm build > /tmp/proto-build.log 2>&1; echo $?   # capture the REAL exit code
```

- The build must exit 0; `cmd | tail` reports tail's exit, so capture as
  above. A flaky exit-1 with a clean log warrants one re-run before
  diagnosing.
- Sanity-grep the route manifest for pages you added or deleted.
- Commit and push Prototemplate `main` ("push to main" always means this
  repo).
