# The page check

`pnpm check:pages` (`scripts/pagecheck/`, its README explains it) loads every
page on the dev server on the device table in `scripts/site-pages.mjs`
(phones from 320 wide and on their sides, tablets in both orientations,
laptops, desktops to the 3440 ultrawide, 1440x900 at 200% zoom). A phone or
a tablet is a touch device whatever its width. `--preset quick` reads eight
devices in dark and 1440x900 in light; the default full preset reads every
device in dark and three in light. Each cell waits for the page's own ready
signal and a still layout, not a fixed time. The declared interactions run
in the same queue of four jobs, among them the presenter walked slide by
slide on every device and every deck slide checked inside its sheet. It
writes `.pagecheck/REPORT.md` with each defect's page, device, theme,
`file:line` and a proposed fix, a page by device grid, the presenter's and
the deck's tables and the run's timing, and exits 1 on any defect or failed
interaction.

- Defects: horizontal overflow, a box past the viewport edge, text clipped
  mid-word, a console error or failed resource outside the allowlist, the
  theme not applied, a phone tap target whose hit area is under 40px on its
  smaller side, a layout shift score over 0.1, a site invariant from
  `hooks.mjs` that did not hold, a page that failed to load.
- Notes, read and fixed only when asked: phone tap targets of 40 to 43px
  (44 is the target), a tablet's targets under 40 (Kevin has not decided on
  tablet touch sizing), a layout shift over 0.05, ellipsis truncations,
  console messages the allowlist absorbed.
- Fast forms: `--preset quick --pages gallery,docs`, `--pages present
  --viewports 390x844,1440x900 --themes dark`, `--no-interactions`,
  `--interactions present-walk`, `--report-only` to rebuild the report from
  a finished run. `CHROME_PATH` names the browser when it is not at the
  default path.
- Performance budgets are not judged: the dev server compiles on demand and
  the live site sends headless Chrome to the Vercel checkpoint, so the
  paints and the blocking time are readings.
