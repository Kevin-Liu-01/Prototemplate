# The page check

`pnpm check:pages` walks every page of this site on the running dev
server on a table of phones, tablets and desktops in both themes, and
writes a report of what did not hold. It is the system that verified the
dashboard's plate pages, carried over as a tool of this repository.

## The devices

`scripts/site-pages.mjs` holds the one device table every browser tool
reads (`DEVICES`). Each row is a size and a kind:

| kind | devices |
| --- | --- |
| phone | 320x568, 360x800, 375x667, 390x844, 393x852, 412x915, 430x932, and on its side 844x390 and 932x430 |
| tablet | 768x1024, 820x1180, 1024x1366, and on their sides 1024x768, 1180x820, 1366x1024 |
| desktop | 720x450@2x (1440x900 at 200% zoom), 1280x720, 1280x800, 1366x768, 1440x900, 1527x814 (Kevin's laptop), 1536x864, 1920x1080, 2560x1440, 3440x1440 |

The kind decides touch, not the width. A phone or a tablet is a touch
device in either orientation: its context gets `isMobile` and `hasTouch`
(so the page reads `pointer: coarse`) and its tap targets are read. A
desktop has a mouse.

Two presets (`PRESETS`):

- `quick`, the round's check on its touched pages: 320x568, 390x844,
  844x390, 820x1180, 1366x768, 1440x900, 1920x1080 and 3440x1440 in dark,
  and 1440x900 in light.
- `full`, the default and the check before a release: every device in
  dark, and 390x844, 1440x900 and 1920x1080 in light. Light changes
  colors more than layout, and a missing `-light` picture shows only as a
  console 404 in light.

## What it reads

Per (page, device, theme) cell, once the page is ready:

- horizontal overflow: `scrollWidth` against `innerWidth`
- boxes past the left or right viewport edge, after every clipping
  ancestor has cut them (a marquee inside an overflow hidden box does not
  count)
- text clipped by an overflow hidden or clip ancestor; sr-only text is
  marked and left out, an ellipsis truncation is marked and becomes a note
- the document height, the first h1 and its box
- the theme as the root carries it: `html[data-theme]` and the dark class
- on a touch device every tap target inside the main region and the
  shell: buttons, links with an href, inputs, role button or combobox.
  On screen a target's size is its hit area: how far past each edge of its
  box a tap through its center still lands on it (`elementFromPoint`, to
  a quarter pixel), so a 32px drawing with a 40px `::after` reads 40. Off
  screen the box stands in
- the layout shift score (Web Vitals windows), the largest contentful
  paint and the blocking time of long tasks, from observers the context
  installs before the page's first byte (`context.mjs`)
- the boxes of the named landmarks (the toolbar, the sidebar, the stage,
  the progress line, the index panel, the docs contents, the presenter
  dock, `main`), which the report compares across pages per device
- the site's own reads (`hooks.mjs`): the shell's data attributes, the
  docs contents grid's column count, the anatomy wall's tiles past the
  edge, and the deck's sheet inside the viewport with its scale
- console errors, page errors and failed resources, against an allowlist

Every element reading (a box past the edge, a clipped text, a tap target)
names the element (`tag#id.class.class`), its text and `within`, the
nearest ancestor that carries a class, so the report can place a bare
link by its row. Then a capture of the first screen under `shots/`, one
JSON line in `shards/<job>.jsonl` and one line on the console. A failing
cell also gets the full page (`-full.png`, cut at ten screens).

### When a page is ready

The reads start once the page's ready selector (`pages.mjs`) has matched
with a box, in the page or in one of its frames: the shell stamps
`.pt-viewer[data-settled]` one frame after it boots, the blog mounts
`.blog-root`, the presenter `.pr-root`, and the deck's `#sheet` gets its
box (`/deck` serves the built deck as the page). Then the check waits two
frames and for the layout (the document's size, the h1, the landmarks, the
ready element) to hold still for 300ms, at most `settleMs` (3000ms). A
cell takes as long as its page needs, not a fixed wait.

### The interactions

Declared in `interactions.mjs`, in dark, each with a capture before and
after and its readings in `interactions/results.json`:

- `theme-flip`, `index-preview`, `search`, `docs-toc`, `sidebar-rails`,
  `present-controls` and `deck-advance`, on what the shell code says each
  control does (the file's head names each)
- `present-walk`, on every dark device of the run: presses j through the
  presenter's slides and checks each slide's title is on screen with
  nothing painted over it, the "So I built 12" close beat and the
  prototypes grid showing the presenter's count (16), the grid's cards
  clear of the dock from 1280 wide, no chrome box over another, and no
  horizontal overflow. `hooks.mjs` `PRESENTER` names the stops
- `deck-slides`, once: every slide of the deck, opened by its hash, keeps
  every element inside the 1600x900 sheet
- `deck-modes`, at 390x844 and 1440x900: the deck's grid and book views
  lay out inside the viewport with no overflow, nothing past the edge and
  no clipped text

## Running it

The dev server must be running at the base (`pnpm dev`, port 3005). Then:

```bash
pnpm check:pages --preset quick --pages gallery,docs   # a round's touched pages
pnpm check:pages                                       # the full preset, every page, before a release
pnpm check:pages --pages present --viewports 390x844,1440x900 --themes dark
pnpm check:pages --interactions present-walk --pages present --preset quick
pnpm check:pages --no-interactions --jobs 2 --out /tmp/pagecheck
pnpm check:pages --report-only                         # REPORT.md again from a finished run's files
```

Flags:

- `--preset quick|full` (default full) picks the devices; `--viewports
  name,...` (or `--devices`) names devices instead, read in every theme
  of `--themes` (a `WxH` outside the table is a desktop with a mouse)
- `--themes dark,light`, `--pages id,id`, `--base URL` (default
  `http://localhost:3005`)
- `--jobs N` (default 4, `--shards` is the old name): contexts of one
  browser working through one queue of every cell and every interaction
  run, so even one page's cells run side by side. Keep it at 4 or under on
  a loaded machine; the dev server's compiles are the bottleneck
- `--no-interactions`, or `--interactions id,id` for some of them
- `--full-shots`: the full page for every cell, not only a failing one
- `--cls-trace`: for every dark cell whose shift score passed 0.05, the
  page again with 6s of 50ms box samples (`cls.mjs`), to explain the shift
- `--sheets`: a contact sheet per device for 390x844, 1440x900 and
  1920x1080 (dark), an HTML montage of the captures rendered in the
  browser, so no image library is needed
- `--no-warm`: skip the warm-up. By default every route is requested
  once, one at a time, before the cells, so the dev server compiles it
  outside the timed cells. Two first compiles at once once corrupted the
  dev server's `.next/dev/prerender-manifest.json` (every route then
  answered 500 until a restart), so the warm-up never overlaps them
- `--out DIR` (default `.pagecheck/`, ignored by git)
- `--report-only` (no browser: folds the shards and the interaction
  results already under the out dir into a new REPORT.md; its pages,
  devices and themes come from the flags when given and otherwise from
  the rows)
- `--pages-module path`, `--hooks-module path`

`CHROME_PATH` names the Chrome for Testing binary when it is not the
build playwright-core installs (`pnpm exec playwright-core install chromium`). A cell whose navigation fails (an aborted load, a
closed target) is tried once more in a fresh context.

The run exits 1 when any defect is found or any interaction fails, 0
otherwise, and its last line names `REPORT.md` and the wall time.

## Reading the report

`REPORT.md` carries, in order:

1. The run: when it started, the wall time (and how much of it warmed the
   routes), the jobs, the preset, and the load average at the start and
   the end (`uptime`), so a slow run can be told from a slow machine.
2. Defects: page, device, theme, what, where in the code, the proposed
   fix. The file column reads `file:line` and what found the line:
   `locate.mjs` indexes the source once per report and returns the
   stylesheet line declaring the element's class (a rule on the element
   itself before a descendant rule), the component line rendering its
   text or id, the rule of the nearest classed ancestor for a bare link,
   or, for a failed request, the lines that name the path or build its
   folder. Hits are ranked by the page's `source` folders (`pages.mjs`)
   above the shared components and libraries; the first source folder
   stands in when no line matches. The fix is written from what the
   element is: a field, a dot or glyph, an icon square, a text link, a
   wide control.
3. Notes: readings worth a look that are not failures.
4. Pages by device: a grid of every page against every device and theme,
   each cell `ok`, `FAIL` or `error` with its time in seconds.
5. Pass counts per device: cells, pass, fail, error, checks, checkFails.
6. The site invariants' readings per device across pages.
7. Layout shifts and paints per page: the worst shift score with its
   device and sources, the largest paint's range, the most blocking time.
8. The interactions with their readings.
9. The presenter by device: each slide's title, the close beat and the
   grid on every device the walk ran on.
10. The deck slides: every slide with an element past the sheet.
11. The contact sheets.

Rows are folded: one row per page and finding, naming the devices and
themes it was read on and counting the cells. A tap target is one row per
element and page, keyed on the element and its text, with every box it
was read at listed, so a link that wraps at one width is still one row.
A missing picture is one row across the themes: the path is shown
without its `-dark` or `-light` suffix.

`cells.jsonl` holds every cell's full reads for anything the report does
not print; each line's `shot` names its capture. `run.json` holds the
run's timing.

### What counts as a defect

- horizontal overflow, a box past the viewport edge, text clipped
  mid-word
- a console error, page error or failed resource outside the allowlist
- the theme not applied
- a tap target under 40px on its smaller side on a phone
- a layout shift score over 0.1 (the Web Vitals limit)
- a site invariant that did not hold (`hooks.mjs` names each with where
  it comes from)
- a page that failed to load
- a failed interaction

### What is a note

- a tap target of 40 to 43px on a phone (44 is the target)
- a tablet's tap target under 40px: tablets are read as touch devices,
  and whether they get the phone's touch sizing is Kevin's decision, so
  their small targets are notes until he makes it
- a layout shift score over 0.05
- a text truncated with an ellipsis
- console messages the allowlist absorbed
- a capture that failed (the cell keeps its reads)

### Not measured

Performance budgets (a largest paint, a blocking time or a byte count
per route that fails the run) need a production server: the dev server
compiles on demand and ships unminified code, and the live site sends
headless Chrome to the Vercel security checkpoint. The paints and the
blocking time are printed as readings only.

## Adding to it

- A page: add a row to `siteRoutes()` in `scripts/site-pages.mjs` with
  `check` in its `tools` (and `capture`, `lines` or `live` for the other
  tools that should walk it). Use the id `src/lib/surfaces.ts` uses for
  the same route, so the capture and the index panel's preview name it
  the same way. `source` lists the folders the page's code lives in (a
  folder, a file, or `folder/*` for a folder's own files), in the order
  the where column should prefer them. A first slug comes from its
  registry through `firstSlug`. A page that is not on the shell gets its
  ready selector in `pages.mjs`.
- A device: add a row to `DEVICES` in `scripts/site-pages.mjs`, and to a
  preset if the quick check should read it.
- A landmark: add `name: selector` to `LANDMARKS` in `hooks.mjs`; the
  probe returns its box per cell and the ready wait watches it.
- An invariant: write its judgement in `judge()` in `hooks.mjs` (a
  boolean under `judge`, its readings under `info`), name it in the
  file's head comment with where it comes from (DESIGN.md, BRAND.md, the
  shell code), and give `where()` its file and fix (`locateClass` and
  `locateText` from `locate.mjs` turn a class or a text into a
  `file:line`). The report prints `info` beside a failure and in the
  invariants table.
- An interaction: add `{ id, pages, devices, run }` to `INTERACTIONS` in
  `interactions.mjs`; `run(page, cell)` returns `{ pass, ...readings }`.
  Read what the code says the control does and assert that.
- A presenter slide: add its stop to `PRESENTER.stops` in `hooks.mjs`
  with the selector of the title it should land on.
- A console message that is the environment and never the page: extend
  `CONSOLE_ALLOW` in `hooks.mjs`.
- A region clipped by design (a marquee, a scroll-driven track): add its
  selector to `SKIP` in `hooks.mjs` with the reason in the comment.

## Pointing it at another site

`--base` names the server; `--pages-module` a module exporting
`pages()` with the same shape as `pages.mjs`; `--hooks-module` a module
exporting `LANDMARKS`, `SKIP`, `TAP_SCOPE`, `CONSOLE_ALLOW`,
`siteReads`, `judge` and `where` with the same shapes as `hooks.mjs`.
The interactions are this site's. The theme door (`scripts/site-pages.mjs`
`seedTheme`, the `gt-theme` localStorage key) is this site's; another
site with another key needs its own context setup in `context.mjs`.
`locate.mjs` indexes `src/`, `deck/parts` and `content/` under the
repository root; another layout changes `SOURCE_DIRS` there.

## Files

- `pagecheck.mjs`: the runner and CLI: the warm-up, the queue, the ready
  wait, one cell
- `pages.mjs`: this site's pages, from the shared route list, with each
  page's ready selector
- `probes.mjs`: the generic in-page read, the vitals summary and their
  judgements
- `hooks.mjs`: this site's landmarks, skip list, extra reads, invariants,
  the presenter's stops, and the where column's file lines and fixes
- `locate.mjs`: the source index behind the where column (classes in
  stylesheets, className uses, text lines, asset paths)
- `context.mjs`: one browser context per cell (the device, the theme, the
  vitals observers), the error collector and its parser
- `cls.mjs`: the layout-shift trace (`--cls-trace`)
- `interactions.mjs`: the declared interactions and their runner
- `report.mjs`: cells.jsonl, REPORT.md and the contact sheets
- `../site-pages.mjs`: the routes, the devices, the Chrome path and the
  theme door, shared with every browser tool in `scripts/`
