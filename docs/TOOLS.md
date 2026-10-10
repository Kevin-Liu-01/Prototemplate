# Tools

Every command this repository runs, by `pnpm <name>` (`pnpm run doctor`, since a bare `pnpm doctor` is a command of pnpm itself), and the scripts the skills bundle. Skills, documents and the `/skills` install line name these commands, never a script path, so a script can move without breaking them. Run any script with `--help` for its full usage.

This file is written by `pnpm build:tools` from `package.json` and the opening comment of each file a command runs; `pnpm lint:tools` fails while it is stale. To change a line, edit that comment, or `DESCRIBE` in `scripts/build/tools.mjs` for a command that runs no file of its own.

## Site

| Command | What it does | Runs |
| --- | --- | --- |
| `pnpm build` | Runs the key-shape scan and the static lints that guard a deploy, checks src/lib/updated.ts, then builds the site with next build. | `node scripts/lint/public.mjs --keys && node scripts/lint/...` |
| `pnpm dev` | Starts the dev server on port 3005. | `next dev --turbopack --port 3005` |
| `pnpm start` | Serves the production build. | `next start` |

## Setup

| Command | What it does | Runs |
| --- | --- | --- |
| `pnpm run doctor` | Checks that this machine can run the repository's tools from a fresh clone. | `scripts/doctor.mjs` |

## Lints

| Command | What it does | Runs |
| --- | --- | --- |
| `pnpm lint:all` | Runs lint:static, then the live lints against PT_BASE (default http://localhost:3005). | `pnpm lint:static && pnpm lint:lines:shell && pnpm lint:ty...` |
| `pnpm lint:code` | Runs oxlint with the gt-ui plugin (scripts/lint/oxlint-plugins/gt-ui.ts) over the live surfaces under src/. | `oxlint` |
| `pnpm lint:copies` | Holds every copy in this repository to its record in scripts/lint/copies.json. | `scripts/lint/copies.mjs` |
| `pnpm lint:heads` | Holds every book page to one structure (DESIGN.md section 4, The book page): BookHead renders the front matter (the mast with the title, the lead and the panel, one rule, the note, the contents and the hatch band), every section opens with the shared divider, and every space ... | `scripts/lint/heads.mjs` |
| `pnpm lint:heads:live` | Holds every book page to one structure (DESIGN.md section 4, The book page): BookHead renders the front matter (the mast with the title, the lead and the panel, one rule, the note, the contents and the hatch band), every section opens with the shared divider, and every space ... | `scripts/lint/heads.mjs --live` |
| `pnpm lint:lines` | Renders the pages it is given and audits the hairlines they draw: doubled lines from two owners, missing seams between sections and two owners on one seam. | `scripts/lint/lines.mjs` |
| `pnpm lint:lines:shell` | Audits the shell routes at PT_BASE the same way, and holds every chrome border to its three line tokens. | `scripts/lint/lines.mjs --shell` |
| `pnpm lint:pictures` | Holds the artifact pictures to the standard (docs/ARTIFACT-PICTURES.md, scripts/media/mood-tone/standard.json). | `scripts/lint/pictures.mjs` |
| `pnpm lint:practices` | Practice lint with a ratchet: every check counts its violations and records their locations in scripts/lint/practices.baseline.json. | `scripts/lint/practices.mjs` |
| `pnpm lint:public` | Scans the checkout for what must never be public: key shapes, machine paths and the terms on a private denylist. | `scripts/lint/public.mjs` |
| `pnpm lint:radius` | Holds the site's corners to one law: rounded controls, square shells (DESIGN.md section 2, Corners). | `scripts/lint/radius.mjs` |
| `pnpm lint:radius:live` | Holds the site's corners to one law: rounded controls, square shells (DESIGN.md section 2, Corners). | `scripts/lint/radius.mjs --live` |
| `pnpm lint:registries` | Reports drift between the registries a Prototemplate page, document or skill has to appear in. | `scripts/lint/registries.mjs` |
| `pnpm lint:shell` | Token discipline for the shell layer: no raw color literals, every stroke and fill must draw a token (var(--shell-*), var(--tc-*), or a local custom property defined at a root class). | `scripts/lint/shell.mjs` |
| `pnpm lint:skills` | Builds src/lib/skills.ts, the typed registry behind /skills, /skills/<slug> and the raw files under /skills/<slug>/, from the curated skills in this repository: skills/<slug>/SKILL.md and the supporting files beside it. | `scripts/build/skills.mjs --check` |
| `pnpm lint:static` | Runs every lint and test that needs no running server; the gate CI and each lane run. | `pnpm lint:shell && pnpm lint:practices && pnpm lint:type ...` |
| `pnpm lint:tools` | Builds docs/TOOLS.md, the index /docs/tools serves: every pnpm command in package.json with the first sentence of the opening comment of the file it runs, grouped by its prefix, then every script a skill bundles (skills/<slug>/scripts/) and the environment the tools read. | `scripts/build/tools.mjs --check` |
| `pnpm lint:type` | Holds the site's type to one system: the rsms InterVariable through the tokens in src/components/viewer/tokens.css (DESIGN.md section 4, "Book type"; BRAND.md section 6). | `scripts/lint/type.mjs` |
| `pnpm lint:type:live` | Holds the site's type to one system: the rsms InterVariable through the tokens in src/components/viewer/tokens.css (DESIGN.md section 4, "Book type"; BRAND.md section 6). | `scripts/lint/type.mjs --live` |
| `pnpm lint:updated` | Builds src/lib/updated.ts: the date each page with a book head last changed, shown in the Updated row of the head's panel (DESIGN.md section 4, The book page). | `scripts/build/updated.mjs --check` |

## Tests

| Command | What it does | Runs |
| --- | --- | --- |
| `pnpm test:copies` | Tests for scripts/lint/copies.mjs: node --test scripts/lint/copies.test.mjs (pnpm test:copies). | `scripts/lint/copies.test.mjs` |
| `pnpm test:heads` | Tests for scripts/lint/heads.mjs: a passing and a failing fixture per static rule, and each live judge fed recorded geometry (the judges are pure functions over what collectHead measures, so no browser runs here). | `scripts/lint/heads.test.mjs` |
| `pnpm test:pictures` | Tests for scripts/lint/pictures.mjs: the repository passes, and each kind of defect in a fixture copy of the picture files is reported. | `scripts/lint/pictures.test.mjs` |
| `pnpm test:public` | Tests for scripts/lint/public.mjs: node --test scripts/lint/public.test.mjs (pnpm test:public). | `scripts/lint/public.test.mjs` |
| `pnpm test:radius` | Tests for scripts/lint/radius.mjs: a passing and a failing string per static rule, the live judges over recorded corners, and the repository. | `scripts/lint/radius.test.mjs` |
| `pnpm test:skill-scripts` | Runs the offline test of every script a skill bundles: each skills/<slug>/scripts/<name>.test.mjs with node --test, <name>.test.py with python3 and <name>.test.sh with sh, from the checkout root. | `scripts/skills/script-tests.mjs` |
| `pnpm test:skills` | Tests for scripts/skills/install.mjs: node --test scripts/skills/install.test.mjs (pnpm test:skills). | `scripts/skills/install.test.mjs scripts/skills/script-tes...` |
| `pnpm test:type` | Tests for scripts/lint/type.mjs: the repository passes, and each rule reports its defect in a fixture string and passes the fixed string. | `scripts/lint/type.test.mjs` |
| `pnpm test:updated` | Tests for scripts/build/updated.mjs, each in a throwaway git repository with two pages, so nothing here reads or writes the checkout. | `scripts/build/updated.test.mjs` |

## Checks and captures

| Command | What it does | Runs |
| --- | --- | --- |
| `pnpm capture:pages` | Captures the first fold of every page the index panel and the sidebar preview (directive 8.6) against the running dev server, in both themes, into public/shots/pages/<id>-light.jpg and <id>-dark.jpg, where <id> is the surface id in src/lib/surfaces.ts. | `scripts/check/capture-pages.mjs` |
| `pnpm check:pages` | The page check: one line of automatic reads and a capture of the first screen per (page, device, theme) cell on the running site, the declared interactions with before and after captures, and REPORT.md with the defects, the notes, a page by device grid, the presenter's and the ... | `scripts/check/pagecheck/pagecheck.mjs` |

## Generators

| Command | What it does | Runs |
| --- | --- | --- |
| `pnpm build:deck` | Builds public/brand-deck.html, the standalone brand deck viewer, from the deck source checked in at deck/. | `scripts/build/deck.mjs` |
| `pnpm build:inter` | Split the rsms InterVariable roman and italic into unicode-range subsets (pnpm build:inter; needs fonttools and brotli). | `scripts/build/subset-inter.py` |
| `pnpm build:marks` | Builds the speed marks under public/marks: the race-type set for General Translation (wide letters, a forward slant, one horizontal cut through the letters, speed bars into the first letter), every file one color in currentColor with a tight viewBox, so the marks page inlines ... | `scripts/build/speed-marks.mjs` |
| `pnpm build:motion` | Builds src/lib/motion.ts, the typed data behind /motion and /motion/<slug>, and public/motion/<slug>.md, the research package each translation-series page renders, from the motion folder: the roster in motion/MOTION.md (its "## The films" section, one "### <slug>: <title> ... | `scripts/build/motion.mjs` |
| `pnpm build:skills` | Builds src/lib/skills.ts, the typed registry behind /skills, /skills/<slug> and the raw files under /skills/<slug>/, from the curated skills in this repository: skills/<slug>/SKILL.md and the supporting files beside it. | `scripts/build/skills.mjs` |
| `pnpm build:thumbs` | Builds the preview thumbnails the preview layer reads (directive 8.6): public/shots/thumb/<stem>.webp and <stem>-dark.webp at 640x360 (the 320x180 card at 2x), cut from the 1440-wide exhibit captures under public/shots. | `scripts/build/thumbs.mjs` |
| `pnpm build:tools` | Builds docs/TOOLS.md, the index /docs/tools serves: every pnpm command in package.json with the first sentence of the opening comment of the file it runs, grouped by its prefix, then every script a skill bundles (skills/<slug>/scripts/) and the environment the tools read. | `scripts/build/tools.mjs` |
| `pnpm build:updated` | Builds src/lib/updated.ts: the date each page with a book head last changed, shown in the Updated row of the head's panel (DESIGN.md section 4, The book page). | `scripts/build/updated.mjs` |
| `pnpm gen:all` | Runs every generator in write mode. | `scripts/build/gen-all.mjs` |
| `pnpm mood-tone` | Cuts the artifact pictures' tone grids to the house standard and writes the manifest the lint reads (docs/ARTIFACT-PICTURES.md). | `scripts/media/mood-tone/mood-tone.mjs` |

## Skills

| Command | What it does | Runs |
| --- | --- | --- |
| `pnpm skills:install` | Installs Prototemplate's curated skills (skills/<slug>/, the canonical copy) into any project or agent home, so Claude Code, Codex and other agents load them there. | `scripts/skills/install.mjs` |
| `pnpm skills:stale` | Counts how often each skill loaded in Claude Code sessions on this machine. | `scripts/skills/usage.mjs --stale` |
| `pnpm skills:usage` | Counts how often each skill loaded in Claude Code sessions on this machine. | `scripts/skills/usage.mjs` |

## Graphics

| Command | What it does | Runs |
| --- | --- | --- |
| `pnpm graphics:audit` | Audit the generated visuals in a real browser: every visible text must be at least MIN_TEXT px on the 1600px stage after zoom-to-fit (declared size × fit scale), and content boxes should not overlap. | `graphics/build/audit.js` |
| `pnpm graphics:export` | Export the rendered visuals for the gt-cloud blog post. | `graphics/build/export-blog.py` |
| `pnpm graphics:gen` | Writes the illustration pages from graphics/build/manifest.json. | `graphics/build/gen-visuals.js` |
| `pnpm graphics:render` | Renders the illustrations through agent-browser (docs/GRAPHICS.md). | `graphics/build/render.sh` |
| `pnpm graphics:serve` | Serves graphics/ on port 8765 for the illustration toolchain (docs/GRAPHICS.md). | `graphics/serve/server.js graphics` |

## Skill scripts

Each skill carries the scripts its procedure calls, self-contained so an installed copy runs on its own. Run one from a checkout with `node skills/<slug>/scripts/<file>`; `pnpm test:skill-scripts` runs their offline tests.

| Skill | Script | What it does |
| --- | --- | --- |
| `gt-aesthetic` | `measure-type.mjs` | measure-type.mjs: reads the type of a page's headings and leads the way Kevin reviews it, at each width and theme, and flags what the gt-aesthetic review standard calls a defect. |
| `gt-deck` | `check-deck.mjs` | Reads the brand deck's source in a Prototemplate checkout and reports where the slide files and the places that restate them disagree. |
| `gt-deck` | `heroicon-symbol.mjs` | Prints the sprite <symbol> for one or more Heroicons 20 solid glyphs, in the form deck/parts/head.html uses, read from the @heroicons/react package in a Prototemplate checkout. |
| `gt-diagrams` | `deck-page.mjs` | Writes the brand deck as one HTML file with its fonts inlined, assembled the way deck/shoot-slide.mjs assembles it (parts/head.html, every slide in order, parts/tail.html, deck/fonts/deck-fonts.css in place of <!--FONTS-->), so figure-check.mjs can open one slide in present mode ... |
| `gt-diagrams` | `figure-check.mjs` | Captures one figure at 2x device pixels in the light and dark themes and reports the SVG facts the line auditor cannot see, because scripts/lint/lines.mjs skips every element inside an svg or a canvas: - labels whose rendered size is under the surface's floor (--min); - labels ... |
| `gt-explorations` | `distinct-set.mjs` | distinct-set.mjs: checks that a set of options actually differ before Kevin sees them. |
| `gt-films` | `frames.mjs` | Extracts a critic's frames from a render by frame index. |
| `gt-films` | `measure-render.mjs` | Measures a General Translation film render against the motion brief's delivery targets (motion/MOTION.md, "Sound" and "What each film delivers"): H.264 at 1920 x 1080, 60 fps for a final (30 for a draft), AAC audio as long as the video, integrated loudness near -16 LUFS and a ... |
| `gt-films` | `scan.mjs` | The critic's whole-film scan (skills/gt-films/references/critic.md). |
| `gt-orchestration` | `replay-edits.py` | Rebuild files from the Write and Edit calls recorded in agent transcripts. |
| `gt-performance` | `frame-probe.mjs` | frame-probe.mjs: measures how smoothly a page animates, the way the gt-performance skill asks for before and after numbers. |
| `gt-performance` | `pixel-diff.mjs` | pixel-diff.mjs: proves that a performance change left the picture alone. |
| `gt-reporting` | `pr-slate.mjs` | Drafts Kevin's PR slate: every open PR he authored in gt-cloud, gt and content, sorted into the groups the slate uses, with the full link, the purpose (the title without its type), the line counts and the facts that put it in its group. |
| `gt-ship` | `contact-sheet.py` | contact-sheet.py: lays labelled screenshots out on one PNG grid, for a review page or a PR comment that has to show many states at once (gt-ship section 4). |
| `gt-ship` | `patch-body.py` | patch-body.py: replaces one marked section of a PR body (the screenshots, by default) and leaves every other byte of the body as it was, the bot summaries included (gt-ship section 4). |
| `gt-ship` | `pr-assets.sh` | pr-assets.sh: uploads PR screenshots to the repository's pr-assets orphan branch under screenshots/pr-<n>/ and prints the link for each file, without touching the checkout's index, working tree or branch (gt-ship section 4, references/pr-body.md "Where the images live"). |
| `gt-ship` | `pr-bots.mjs` | Reads one PR's review state through the GitHub CLI and reports what still stands between it and a merge: the title policy, the bot summaries and the commit each one reviewed, the unresolved and unanswered review threads, and the checks. |
| `gt-ship` | `pr-size.mjs` | Groups a branch's diff by kind so every large group in a PR can be justified before it is pushed. |
| `gt-verify` | `compare-signatures.py` | compare-signatures.py: fetches the same routes from two servers and reports every structural difference between the two renders, page by page (gt-verify references/parity-review.md). |
| `gt-verify` | `page-signature.py` | page-signature.py: reads the structural signature of one server-rendered page, the unit a parity review compares (gt-verify references/parity-review.md). |
| `gt-verify` | `probe.mjs` | probe.mjs: measures what renders at one spot of a page, the way a fix is verified before it is reported as done (gt-verify sections 1 and 4). |
| `gt-verify` | `row-diff.py` | row-diff.py: compares before and after screenshots of the same pages row by row and writes a side-by-side crop of every changed block (gt-verify references/parity-review.md). |
| `gt-verify` | `stress.mjs` | stress.mjs: walks a scroll story or an animated section through the stress matrix of gt-verify section 3 at several viewports and writes the readings and the captures a reviewer looks at. |
| `gt-website` | `routing-matrix.sh` | routing-matrix.sh: checks generaltranslation.com's routing cases (real pages, near-miss corrections, section fallbacks, locale prefixes) by the status and redirect target each path answers, so a routing change is gated before it ships (gt-website section 4). |

## Environment

Each tool reads its setting from a flag first, then the variable, then the default. No tracked file names a machine path.

| Variable | What it sets | Default |
| --- | --- | --- |
| `PT_BASE` | The base URL for the live lints, the page check and the captures; CAPTURE_BASE and REDESIGN_BASE are older names for it. | `http://localhost:3005` |
| `CHROME_PATH` | The Chrome for Testing binary the browser tools launch. | playwright-core's `chromium.executablePath()` |
| `GT_CLOUD` | A gt-cloud checkout, for the tools that compare with it (lint:copies notes). | none |
| `MOTION_DIR` | The motion folder build:motion reads. | `<repo>/motion` |
| `PT_DENYLIST` | The private term list lint:public reads; skipped under VERCEL or CI. | none |
