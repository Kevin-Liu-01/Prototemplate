# Parity review across an upgrade

Detail for section 6 of `gt-verify` ("Compare the whole page set across an upgrade"). A parity review answers one question for a change that touches every page at once, such as a framework or library upgrade, a layout rewrite or a routing change: what differs between the reference build and the change, route by route, and is each difference meant. The method below is the one the docs parity review of gt-cloud #5217 (the docs after a Fumadocs upgrade, 2026-10-07) followed over 475 page fetches per side.

## Sides

- **Before:** the reference. For an upgrade, the last commit before the upgrade stack; for a fix of an upgrade that already shipped, the same commit, so the review shows whether the fix restores it.
- **After:** the head of the PR under review.
- **Main:** production, read as a third side when a difference may have shipped already. A difference that production also shows came from earlier work and is labelled that way.

Run Before and After as two dev servers or two production builds from two worktrees, on two ports, with the same content and the same submodule pins. A production build is better for timing and code highlighting: a dev server highlights code nondeterministically, so dev-mode colour differences on both sides are noise.

## Route list

Write the routes to check into a text file, one path per line (`compare-signatures.py` reads it). Cover:

- every page in the default locale (from the sitemap or the docs source, never from a dev server's prerender manifest, which a running dev server rewrites and can leave truncated);
- a sample of pages in several locales;
- each variant a cookie selects, as `path<TAB>cookie=value` lines;
- the machine files: `llms.txt` and its family, the sitemap, `robots.txt`, `rss.xml`, OpenAPI files and the markdown twins.

## Scripts

| Script | What it does |
| --- | --- |
| `scripts/page-signature.py` | reads the structural signature of one server-rendered page |
| `scripts/compare-signatures.py` | fetches the route list from Before and After and reports every structural difference, route by route |
| `scripts/row-diff.py` | compares Before and After screenshots row by row: it aligns rows first (SequenceMatcher over row hashes) so an inserted band does not mark everything below it changed, counts a pixel as changed above 16 in any channel, writes a side-by-side crop per changed block, and reads a second Before capture as the noise pair |

## Structure, then behaviour

1. **Fetch and compare the structure.**

   ```sh
   python3 skills/gt-verify/scripts/compare-signatures.py fetch \
     --before http://localhost:3051 --after http://localhost:3052 \
     --routes <scratch>/routes.txt --dir <scratch>/parity
   python3 skills/gt-verify/scripts/compare-signatures.py compare --dir <scratch>/parity
   ```

   `compare` prints how many routes differ in each field and writes `report/diffs.json`. Read the counts first: a field that differs on every route is one cause, and a field that differs on a few routes is usually several. A difference the change adds on purpose to every page (a new button on every heading) goes in with `--ignore-button` so it does not hide the rest.
2. **Machine files byte for byte.** Compare the agent files and the sitemap with `cmp` or `diff`; when the sorted lines match and the files do not, only the order changed, which is still a finding for an index whose order means something.
3. **What the structure cannot see:** chrome geometry at several widths (`probe.mjs` on the sidebar, the table of contents and the h1 at 390, 768, 1000, 1280, 1440 and 1920), keyboard order (the first Tab stops on both sides), scroll-spy, anchor landing, search, theme and locale switching, back and forward without an intermediate shell, layout shift, axe counts per page and mode, and the JavaScript each page downloads (scripts and bytes, cold cache). Visual crops at 1440 dark and 390 light for a sample of pages, compared with `row-diff.py` (below) after the capture timing noise is removed. Name the shots `before--<key>.png`, `fix--<key>.png` and `before2--<key>.png`; `gt-performance`'s `pixel-diff.mjs capture` writes one shot per call.

   ```sh
   python3 skills/gt-verify/scripts/row-diff.py <scratch>/shots <scratch>/row-diff [filter]
   ```
4. **Read the served bytes** where they can differ unseen: a dark screenshot showed two code blocks as identical while their served token spans differed.

## Verdicts

Every difference gets one label:

| Label | Meaning |
| --- | --- |
| introduced by the change | After has it, Before does not, and production does not |
| inherited | After and production have it; it came from earlier work and the change neither causes nor fixes it |
| kept on purpose | the change means it; confirm it with the change's author and list its side effects |
| pre-existing | Before has it too |
| no fix needed | a real difference that is harmless (record why) |

## The report

1. **Verdict** first: whether the change is safe to merge, what it introduces, and what is still open from earlier work, with the severity of each.
2. **Regressions still open,** most severe first. Each one has: where (routes, widths, themes), Before, After, Main, the evidence files, the cause (file and line), and the fix in a few lines.
3. **Other differences, no fix needed,** each with its reason.
4. **Kept on purpose,** each confirmed and with its side effects.
5. **Checked and at parity:** the counts that held (routes at 200, head tags, headings, anchors with broken fragment links counted, sidebar and TOC links, locales, variants, agent files, search, sitemap, visual, geometry, behaviour, accessibility).
6. **Pre-existing issues** found on the way.

Keep the evidence in one folder per question (one probe per suspected regression), and name the folder in the report. The report goes to the PR's author and to Kevin through `gt-reporting`.

## Lessons from the 2026-10-07 review

- A difference that production also shows is not the PR's; reading production as the third side split the findings into what the PR causes and what it only fails to fix.
- A dev server's prerender manifest is rewritten while it serves and was read truncated; take the route list from the source or the sitemap.
- Count the client code per page: an upgrade made every docs page download a component used by 24 of them, which no structural diff shows.
- Read the server HTML before hydration for values a client swaps in later (a sample host that read `example.com` until hydration).
- Order changes in machine indexes are findings when the order carries meaning (an index that should start with each section's entry page).
