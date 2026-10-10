# The line auditor

`scripts/lint-lines.mjs` in Prototemplate renders pages in Chrome for Testing
through `playwright-core` and audits the hairlines the browser actually drew.
It enforces the line law of `DESIGN.md` section 2: every line is drawn
exactly once, and every border in chrome draws one of three tokens. Paths are
relative to `$PROTOTEMPLATE`.

## What it counts as a line

The audit walks every element under `body` and reconstructs lines from
computed CSS:

- a border side 1 to 2.5px wide, at least 24px long, in a visible color;
- an outline ring 1 to 2.5px wide, placed at its offset;
- a box-shadow with no offset, blur of 1.5px or less and a spread of 1 to
  2.5px, which is a border drawn by other means;
- a filled box 2.5px thick or less and longer than 24px;
- an exposed-ground strip: a box with a visible fill and 1 to 2.5px of
  padding on a side that has no border, which shows the ground as a line;
- an absolutely positioned `::before` or `::after` with a border or a thin
  fill, including its `translateX(-50%)` centering.

Each element is clamped to its nearest clipping ancestor first, and an edge
the clip removes is dropped, so the audit reads the geometry the page shows.
It skips elements inside `svg` or `canvas`, elements under a `matrix3d`
transform or a mask image, elements with `display: none` or
`visibility: hidden`, and elements at opacity 0.05 or less.

## The findings

| Finding | Rule | Gates |
| --- | --- | --- |
| double | two parallel lines from different owners 1 to 4px apart, overlapping 75% of the shorter line and at least 80px, both visible at two of three sample points | yes |
| junction | the same pair with a gap under 1px: two owners draw one seam and the alphas stack | yes |
| color | a border in chrome whose color matches none of `--pt-hair`, `--pt-hair-soft` or `--pt-edge`, or an ink border away from an active state, or an outline outside hair, soft, edge, ink and paper | yes, shell mode |
| self-stack | a translucent border (alpha under 0.95) over the element's own translucent fill (alpha 0.12 to 0.95) with no `background-clip: padding-box` | only when the edge is 120px or longer |
| invisible seam | an opaque fill with a 1 to 2.5px padding strip whose color is within 45 summed RGB steps of the body's ground | yes |
| missing seam | adjacent sections (`.tc-rail > section`, `[class*="-root"] > section`) or blocks (`.tc-row`, `.tc-hatch`, `.tc-band`, `.tc-delivery-band`) with no horizontal line within 3px of the boundary spanning half the column | yes, page mode only |

Same-owner pairs never count as doubles. A coincident pair where an opaque
fill between the two owners hides the lower stroke is skipped. The ink
border counts as a state when the element, its parent or its grandparent
matches `.is-on`, `.is-active`, `.is-editing`, `.is-solid`,
`[aria-pressed="true"]`, `[aria-current]`, `[aria-selected="true"]`,
`[aria-expanded="true"]` or `:focus-within`.

## Shell mode

`pnpm lint:lines:shell` is `node scripts/lint-lines.mjs --shell`. It drives
these routes against the dev server (default base `http://localhost:3005`):
`/`, `/docs`, `/brand`, `/compare`, `/archive/<first slug>`,
`/directions/<first slug>`, `/skills`, `/skills/<first slug>`, `/motion`,
`/motion/<first package>`, `/d/production` and `/deck`, the last one the
deck's own document. The first slugs come from the registries through
`firstSlug()`: `src/lib/archive.ts`, `src/lib/directions.ts`,
`src/lib/skills.ts` after `export const SKILLS`, and `src/lib/motion.ts` after
`export const MOTION_PACKAGE_SLUGS`. A registry that moves or renames that
anchor makes the run exit 2, so a change to a registry's shape updates
`shellRoutes()` in the same commit.

Each route runs at 1440, 1280 and 390 in dark and light, through the rest
state and then the states its row names: the list toggled with `[`, the
index panel with `R`, the search with `Cmd K`, and on `/` and `/deck` the
grid (`G`) and the book (`B`). The driver reads the document after every key
and records a state that did not apply. Chrome is every element under
`.pt-viewer`, `.pt-corner`, `.pt-corner-layer`, `.pt-help`, `.pt-toast`,
`.pt-preview` or any `pt-` class, outside the content roots `.stage`,
`.sheet-flow .sheet > *`, `.pt-page-body`, `.pt-root`, `.gv-article`,
`.ar-doc` and iframes. In the deck's document, chrome is everything outside
`.stage`, `.mini` and `.slide`, and the roles are read from the unprefixed
tokens (`--hair`, `--hair-soft`, `--edge`).

Flags: `--base <url>`, `--only <path fragment>`, `--width <px>`,
`--theme dark|light`, `--jobs <n>` (default 3 pages at once), `--json`
(print every audit), `--report` (print every audit and exit 0 on findings
and on states that did not apply; an HTTP error or a wrong theme still exits
2). A fast loop on one route is
`node scripts/lint-lines.mjs --shell --only /docs --width 1440 --theme dark --jobs 1`.

The browser is `CHROME_PATH`, else the Chrome for Testing build
playwright-core installs (`pnpm exec playwright-core install chromium`).

## Page mode

`node scripts/lint-lines.mjs <url> [<url> ...] [--theme dark|light]` audits
each URL at 1440 and 1280 in one theme over a 4200px tall viewport, waits for
network idle and 3 seconds, and prints JSON. Every positional URL is audited.
With no argument it audits `http://localhost:3005/d/toolchain?chrome=0`
on the Prototemplate dev server. Page mode adds the missing-seam check,
reads the whole document as content, and has no chrome, so the border-role
(color) check never runs and the theme is set but not verified.

## Exit codes

- 0: no gating finding.
- 1: at least one gating finding (unless `--report`).
- 2: the run could not judge: a URL with whitespace (a shell quoting
  accident), an HTTP status of 400 or more, a theme the page did not show,
  a state that did not apply (unless `--report`), `--only` matching no
  route, a bad `--jobs`, or a registry slug it could not find.

## The allow list

`ALLOW` at the top of the script names every deliberate multi-stroke device
by a class fragment, with the reason on the same line. As of 2026-10-05:

| Fragment | Device |
| --- | --- |
| `thread` | the doubled line of `DESIGN.md` section 5: one path stroked twice |
| `shell-rail` | the column's inner pair, one owner |
| `stack-rail`, `trace-rail` | the dark band's leader rails, drawn as the thread |
| `tcpv-def` | the toolchain pricing definitions' ruled term column |
| `tc-eg` | paper foundry's example plates, a frame inside a ruled cell |
| `tc-hatch` | the diagonal-hatch spacer |
| `lang-sw`, `lang-rm` | the sentence-width and re-measure instruments |
| `tc-tab-bar` | the active tab's accent on the tabs seam |
| `is-marquee`, `eh-chip`, `lg-card` | moving or masked devices whose parallel lines are transient |
| `tcb-term` | the band terminal's border plus offset outline |
| `sheet` | the viewer's sheet mat: hair border, 1px paper gap, hair-soft outline |
| `thumb-frame`, `page-frame` | the active thumbnail and book page frames: edge border plus offset ink outline |
| `pt-preview` | the hover preview card's mat |

`DESIGN.md` section 2 also names `pt-tile` (the sidebar's site tiles) as
allowed, and the script's list does not hold it. Add an entry only for a
device that draws its strokes on purpose, with the reason inline, and name it
in `DESIGN.md` in the same change.

## What it cannot see

- SVG strokes and canvas pixels. Figures, diagrams and the thread are checked
  by eye at 2x pixel crops of each junction (`docs/SHIP-LOOP.md` section 1).
- Hover. The driver never hovers, so the search pill's hover border
  (`DESIGN.md` section 15) is outside the audit.
- Anything under a 3D transform or a mask.

## Adding a route or a state

Add the route to `shellRoutes()` with its states, and add the route to the
list in `DESIGN.md` ("Line law for chrome") and in this file. A new state
needs a key the page answers, a branch in `auditShellRoute()` that presses
it, checks `probeState()` and records `unapplied` when the state did not
open, and a way back to the rest state.

## Sources

- Prototemplate: `scripts/lint-lines.mjs` (header comment, `ALLOW`,
  `SHELL_CHROME`, `auditDocument`, `shellRoutes`, `auditShellRoute`);
  `DESIGN.md` sections 2, 3 and 15; `docs/SHIP-LOOP.md` section 1.
- Kevin, round six of the viewer shell: "make the borders around these areas
  the proper border colors" (quoted in `DESIGN.md` section 2).
