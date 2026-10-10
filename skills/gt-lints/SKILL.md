---
name: gt-lints
description: >-
  Every lint and gate that holds General Translation's design and copy rules,
  what each catches, where it runs and how to fix a failure: Prototemplate's
  line auditor, shell token lint, practices ratchet, picture lint, type lint,
  gt-ui oxlint copy, the public scan (lint:public), the copies manifest
  (lint:copies), the registries check (lint:registries), the tools index
  (lint:tools) and page check, and gt-cloud's oxlint plugins, email
  identity check and oxfmt. Also covers how a new rule becomes a lint and the
  gate hygiene that keeps a red gate from passing (chained gates, real exit
  codes, one browser gate at a time). Use before committing in either
  repository, when a lint or a build gate fails, or when Kevin asks for a new
  rule to be enforced.
metadata:
  title: Lints and gates
  areas: lints
  updated: 2026-10-10
  origin: prototemplate
  owner: P
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
  device in `ALLOW` in `lint/lines.mjs`, one comment per override block in
  Prototemplate's `.oxlintrc.json`, a reason after `--` on every
  `oxlint-disable` comment. An exemption without a reason is a defect.
- A gate never passes when it could not judge. `lint/lines.mjs` exits 2 on an
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
| `pnpm lint:registries` | drift between the registries a page, document or skill must appear in: doc and handbook headings against the search tables, `surfaces.ts` rows against the sitemap, `llms.txt`, `siteRoutes`, the icon maps and the WebP thumbnails, the first-slug regexes the browser gates read, and each skill's contract | `lint:static` |
| `pnpm lint:tools` | a stale `docs/TOOLS.md`, the index of every pnpm command and bundled skill script that `/docs/tools` serves (`pnpm build:tools` rewrites it; skipped with a printed line under `VERCEL` or with no `.git`) | `lint:static` |
| `pnpm lint:copies`, `pnpm test:copies` | a copy off its record in `scripts/lint/copies.json`: a `pin` (gt-cloud is the source) whose sha256 changed, a `source` or `fork` path that is gone, and two identical code files no entry covers | `lint:static` (both) |
| `pnpm lint:public`, `pnpm test:public` | what must never be public in this public repository: key shapes (never printed, always fail), machine paths (a home folder or the system temp folder, spelled out in the script's header) and the terms of the private list at `PT_DENYLIST` (skipped under `VERCEL` or `CI`); every finding fails, with no baseline since 2026-10-10 | `build` (`--keys` only), `lint:static` (both), the pre-push hook (it stops the push) |
| `pnpm test:skill-scripts` | the offline test beside every script a skill bundles | `lint:static` |
| `pnpm exec tsc --noEmit` | types | by hand, 3 to 5 minutes |

`pnpm lint:all` is `pnpm lint:static` followed by the four live gates (`lint:lines:shell`, `lint:type:live`, `lint:radius:live`, `lint:heads:live`). `pnpm lint:static` chains every static lint and test: shell, practices, type, radius, heads, skills, registries, updated, tools, copies, public and code, then the picture, type, radius, heads, updated, skills, copies and public tests and `test:skill-scripts`; `package.json` is the authority for its order. `pnpm build` runs `public.mjs --keys`, the picture, type, radius and heads lints and `build/updated.mjs --check`, then `next build`. `pnpm gen:all` rewrites every generated file a lint checks. The dev
server is `pnpm dev` (`next dev --turbopack --port 3005`); `lint:all` needs it
running because of the line audit.

### Each gate in detail

`references/prototemplate-gates.md` holds each gate's reads, flags, exit codes and traps: `lint:shell` (the `lint-shell: allow` marker is for a runtime token fallback only, and an `hsl()` or `oklch()` beside a `var()` is not caught), `lint:practices` (the per-file ratchet; `--update-baseline` only after a cleanup, with the JSON diff read, and pruned entries in the same commit as a deletion), the line auditor (exit 1 is findings, exit 2 means it could not judge, and a clean exit under `--report` proves nothing), `lint:code` (copy gt-cloud's whole plugin when it changes and settle the findings in the same commit), the picture lint, the type lint (the script header is the authority), `lint:skills`, `check:pages` and `tsc`. The new gates' headers are their authority too: `scripts/lint/public.mjs`, `scripts/lint/copies.mjs`, `scripts/lint/registries.mjs`, `scripts/build/tools.mjs` and `scripts/skills/script-tests.mjs`.

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

### Gates on open branches

Each fact below holds only on its branch, tagged with the pull request's state as read on 2026-10-10 (`gh pr view <n>`); read the state again before relying on one, and move the fact into the sections above once the pull request merges.

- #5133 (`k/artifact-picture-standard`, open on 2026-10-10) adds
  `node scripts/check-artifact-pictures.mjs` (`pnpm check:artifact-pictures`)
  to `pnpm lint` and `pnpm lint:fix`, gt-cloud's counterpart of the picture
  lint.
- #4977 (`k/dashboard-shell-ia`, open on 2026-10-10) adds `gt-ui/no-theme-icons` to every UI
  folder (no Sun or Moon imports from Lucide or Heroicons; the theme switch
  draws the circle glyphs of the shared `ThemeToggle`) and turns
  `inter-only`, `no-em-dash`, `no-eyebrow`, `typed-text-var`,
  `no-hex-colors`, `mono-is-not-voice`, `no-smooth-scroll`,
  `no-heading-period`, `no-gif-mark` and `icon-tiers` on for all of
  `apps/dashboard`.
- #5029 (`k/dashboard-icon-tiers`, open on 2026-10-10) turns `icon-tiers` on for all of
  `apps/dashboard`.

Read the branch's `package.json` and `.oxlintrc.json` before judging a
finding there.

## 4. Writing a new lint

1. State the law in a header comment and cite its source: the `DESIGN.md`
   section, Kevin's dated words, or the brand questionnaire. The message a
   failure prints states the law and the fix, as the gt-ui messages do.
2. Export pure checkers so tests can import them (`lint/pictures.mjs`
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
   copied whole into `$PROTOTEMPLATE/scripts/lint/oxlint-plugins/gt-ui.ts` and the
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
`cta-title-case`), `gt-landing-pages` (gt-cloud's landing conventions),
`gt-verify` (the visual check the auditor cannot make, in a real browser).

## Sources

Dated provenance for every rule is in `references/sources.md`: the lint scripts and their headers, `package.json`, the gt-cloud plugins and CI, and Kevin's dated directives.
