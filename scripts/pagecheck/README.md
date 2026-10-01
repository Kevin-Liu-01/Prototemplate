# The page check

`pnpm check:pages` walks every page of this site on the running dev
server, at ten viewports in both themes, and writes a report of what did
not hold. It is the system that verified the dashboard's plate pages,
carried over as a tool of this repository.

## What it reads

Per (page, viewport, theme) cell, after the page has loaded and settled:

- horizontal overflow: `scrollWidth` against `innerWidth`
- boxes past the left or right viewport edge, after every clipping
  ancestor has cut them (a marquee inside an overflow hidden box does not
  count)
- text clipped by an overflow hidden or clip ancestor; sr-only text is
  marked and left out, an ellipsis truncation is marked and becomes a note
- the document height, the first h1 and its box
- the theme as the root carries it: `html[data-theme]` and the dark class
- on phones (under 768px) every tap target inside the main region and the
  shell: buttons, links with an href, inputs, role button or combobox,
  with the smaller side of their box
- the boxes of the named landmarks (the toolbar, the sidebar, the stage,
  the progress line, the index panel, the docs contents, the deck frame,
  the presenter dock, `main`), which the report compares across pages per
  viewport
- the site's own reads (`hooks.mjs`): the shell's data attributes, the
  docs contents grid's column count, the anatomy wall's tiles past the
  edge, and the deck's sheet inside its frame
- console errors, page errors and failed resources, against an allowlist

Every element reading (a box past the edge, a clipped text, a tap target)
names the element (`tag#id.class.class`), its text and `within`, the
nearest ancestor that carries a class, so the report can place a bare
link by its row. Then a full-page PNG under `shots/`, one JSON line in
`shards/<n>.jsonl` and one line on the console.

Beyond the cells:

- a layout-shift run (`cls.mjs`) for every page at 390x844, 1024x768,
  1440x900 and 1920x1080 in dark: a `PerformanceObserver` on
  `layout-shift` installed before navigation, 6s of box samples every
  50ms, the entries over 0.001 with their sources, an end capture
- the declared interactions (`interactions.mjs`) at 390x844 and 1440x900
  in dark, each with a before and an after capture and its readings in
  `interactions/results.json`
- with `--sheets`, a contact sheet per viewport for 390x844, 1440x900 and
  1920x1080 (dark): an HTML montage of the captures rendered in the
  browser and screenshotted, so no image library is needed

## Running it

The dev server must be running at the base (`pnpm dev`, port 3005). Then:

```bash
pnpm check:pages                                   # everything, under .pagecheck/
pnpm check:pages --pages gallery,docs --viewports 1440x900 --themes dark
pnpm check:pages --no-cls --no-interactions        # the cells alone
pnpm check:pages --sheets                          # with the contact sheets
pnpm check:pages --shards 2 --out /tmp/pagecheck   # fewer parallel contexts, elsewhere
pnpm check:pages --report-only                     # REPORT.md again from a finished run's files
```

Flags: `--base URL` (default `http://localhost:3005`), `--pages id,id`,
`--viewports WxH,...`, `--themes dark,light`, `--shards N` (default 3,
the pages dealt round robin into parallel contexts of one browser),
`--out DIR` (default `.pagecheck/`, ignored by git), `--no-cls`,
`--no-interactions`, `--sheets`, `--report-only` (no browser: folds the
shards, the layout-shift files and the interaction results already under
the out dir into a new REPORT.md, for a report change or a second read;
its pages, viewports and themes come from the flags when given and
otherwise from the rows, so a slice run rebuilds with its own counts),
`--pages-module path`, `--hooks-module path`. `CHROME_PATH` names the
Chrome for Testing binary when it is not at the default install path.

The run exits 1 when any defect is found or any interaction fails, 0
otherwise, and its last line names `REPORT.md`.

## Reading the report

`REPORT.md` carries, in order:

1. Defects: page, viewport, theme, what, where in the code, the proposed
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
2. Notes: readings worth a look that are not failures.
3. Pass counts per viewport: cells, pass, fail, error, checks, checkFails.
4. The site invariants' readings per viewport across pages.
5. The layout-shift runs.
6. The interactions with their readings.
7. The contact sheets.

Rows are folded: one row per page and finding, naming the viewports and
themes it was read on and counting the cells. A tap target is one row per
element and page, keyed on the element and its text, with every box it
was read at listed, so a link that wraps at one width is still one row.
A missing picture is one row across the themes: the path is shown
without its `-dark` or `-light` suffix.

`cells.jsonl` holds every cell's full reads for anything the report does
not print; each line's `shot` names its PNG.

### What counts as a defect

- horizontal overflow, a box past the viewport edge, text clipped
  mid-word
- a console error, page error or failed resource outside the allowlist
- the theme not applied
- a tap target under 40px on its smaller side on a phone
- a site invariant that did not hold (`hooks.mjs` names each with where
  it comes from)
- a page that failed to load

### What is a note

- a tap target of 40 to 43px (44 is the target)
- a text truncated with an ellipsis
- console messages the allowlist absorbed

## Adding to it

- A page: add `{ id, path, source, settleMs?, hide?, phoneOnly?,
  desktopOnly? }` to `pages.mjs`. Use the id `scripts/capture-pages.mjs`
  and `src/lib/surfaces.ts` use for the same route, so the PNG and the
  index panel's preview name it the same way. `source` lists the folders
  the page's code lives in (a folder, a file, or `folder/*` for a
  folder's own files), in the order the where column should prefer them.
  A first slug comes from its registry through `firstSlug` in
  `scripts/site-pages.mjs`.
- A landmark: add `name: selector` to `LANDMARKS` in `hooks.mjs`; the
  probe returns its box per cell and the layout-shift run samples it.
- An invariant: write its judgement in `judge()` in `hooks.mjs` (a
  boolean under `judge`, its readings under `info`), name it in the
  file's head comment with where it comes from (DESIGN.md, BRAND.md, the
  shell code), and give `where()` its file and fix (`locateClass` and
  `locateText` from `locate.mjs` turn a class or a text into a
  `file:line`). The report prints `info` beside a failure and in the
  invariants table.
- An interaction: add `{ id, pages, viewports, run }` to `INTERACTIONS`
  in `interactions.mjs`; `run(page, cell)` returns `{ pass, ...readings }`.
  Read what the code says the control does and assert that.
- A console message that is the environment and never the page: extend
  `CONSOLE_ALLOW` in `hooks.mjs`.
- A region clipped by design (a marquee, a scroll-driven track): add its
  selector to `SKIP` in `hooks.mjs` with the reason in the comment.

## Pointing it at another site

`--base` names the server; `--pages-module` a module exporting
`pages()` with the same shape as `pages.mjs`; `--hooks-module` a module
exporting `LANDMARKS`, `SKIP`, `TAP_SCOPE`, `CONSOLE_ALLOW`,
`siteReads`, `judge` and `where` with the same shapes as `hooks.mjs`.
The theme door (`scripts/site-pages.mjs` `seedTheme`, the `gt-theme`
localStorage key) is this site's; another site with another key needs
its own context setup in `context.mjs`. `locate.mjs` indexes `src/`,
`deck/parts` and `content/` under the repository root; another layout
changes `SOURCE_DIRS` there.

## Files

- `pagecheck.mjs`: the runner and CLI
- `pages.mjs`: this site's page list with each page's source folders
- `probes.mjs`: the generic in-page read and its judgements
- `hooks.mjs`: this site's landmarks, skip list, extra reads, invariants,
  and the where column's file lines and fixes
- `locate.mjs`: the source index behind the where column (classes in
  stylesheets, className uses, text lines, asset paths)
- `context.mjs`: one browser context per cell (viewport, theme, phone
  flags), the error collector and its parser
- `cls.mjs`: the layout-shift run
- `interactions.mjs`: the declared interactions and their runner
- `report.mjs`: cells.jsonl, REPORT.md and the contact sheets
- `../site-pages.mjs`: page discovery, the theme door and the Chrome
  path, shared with `scripts/capture-pages.mjs`
