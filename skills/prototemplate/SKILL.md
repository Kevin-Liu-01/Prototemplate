---
name: prototemplate
description: >-
  How to work in Prototemplate, Kevin's hub and wiki for General Translation
  work: what each route holds, the repository map, the viewer shell and its
  props, the registries that move together (surfaces, search index, docs,
  sitemap, llms.txt, captures), the chrome and sidebar rules, the book page
  standard, adding a page, a document, a handbook document or a skill, the
  build scripts, the shared checkout and its session lanes, the gates and
  landing, keeping the hub current with gt-cloud, and the curated skills
  with their contract and install. Use when changing anything in the
  Prototemplate repository, when adding a route, document or skill to it, or
  when building on it from another project.
metadata:
  title: Working in Prototemplate
  areas: website, components
  updated: 2026-10-06
  origin: prototemplate
---

# Working in Prototemplate

General Translation (GT) is a localization platform for developers. Prototemplate is Kevin Liu's hub for his GT work and the wiki of how he does it: a Next.js 16 site kept at github.com/Kevin-Liu-01/Prototemplate and served at www.prototemplate.com. It serves the brand book, the design canon, the brand deck, the design lab, the marks, the films, the graphics and the curated GT skills as live pages. On 2026-10-05 Kevin said he should be able to "use it anywhere and build on top of it", so that it "acts as a wiki / repository of how i do work at GT".

Paths are relative to a Prototemplate checkout (`$PROTOTEMPLATE`; `git clone https://github.com/Kevin-Liu-01/Prototemplate`, then `pnpm install` and `pnpm dev`). `AGENTS.md` at the root is the agent entry point and `docs/handbook/` holds the working handbook. `references/shell.md` gives the shell's props and data shapes, `references/adding.md` gives the checklists file by file, and `scripts/check-registries.mjs` reports the registries a change has missed.

## 1. What the hub holds

| route | holds | source |
| --- | --- | --- |
| `/` | the design lab: every direction as an article (Book), one live exhibit at a time (Live) or a grid, with the anatomy wall and the capabilities ledger | `src/app/page.tsx`, `src/app/GalleryViewer.tsx`, `src/lib/directions.ts` |
| `/brand` | the brand book in ten sections | `src/app/brand/`, `brand-sections.ts`, `BRAND.md` |
| `/docs`, `/docs/<slug>` | the repository documents as one book, with the build log under the readme; `/craft` redirects here | `src/app/docs/registry.ts`, `src/app/craft/CraftArticle.tsx` |
| `/deck` | the brand deck in its own viewer, framed from `public/brand-deck.html` | `deck/`, `pnpm build:deck` |
| `/skills`, `/skills/<slug>` | the curated GT skills by area, each page with its body, files and install line; the raw files at `/skills/<slug>/SKILL.md` and `/skills/index.json` | `skills/<slug>/`, the generated `src/lib/skills.ts`, `src/app/skills/` |
| `/handbook`, `/handbook/<slug>` | the handbook as one book: operating principles, the quality bar, the multi-session playbook, the product map, the glossary and the decisions log, opened by its readme | `docs/handbook/`, `src/app/handbook/registry.ts`, rendered by the docs shell (`src/app/docs/DocsShell.tsx`) |
| `/marks` | the GT mark explorations: the speed set of seven and the two survivors of the earlier round | `src/lib/marks.ts`, `public/marks/`, `pnpm build:marks` |
| `/blog`, `/blog/<slug>` | the docs-redesign series as published, outside the shell | `content/blog/`, `src/lib/blog.ts` |
| `/graphics` | every illustration of the series, by area | `graphics/build/manifest.json`, `src/lib/graphics.ts` |
| `/motion`, `/motion/<slug>` | the film roster and each research package of the translation series, with each published cut's contact sheet and script | the generated `src/lib/motion.ts`, `public/motion/<slug>.md`, `public/motion/published.json`, `public/motion/sheets` and `public/motion/scripts` |
| `/compare` | two directions side by side in scroll-synced same-origin frames | `src/app/compare/` |
| `/present` | the full-screen presenter with its own chrome | `src/app/present/` |
| `/directions/<slug>` | each site and exploration on the shell: the summary, the captures and a live frame | `src/app/directions/` |
| `/archive/<slug>` | each retired direction as a full-page capture, with the commit that last held its code | `src/lib/archive.ts` |
| `/d/<slug>` | the directions themselves, self-contained, with their own type; `DirectionCorner` floats over them and `?chrome=0` hides it | `src/app/d/` |
| `/d/production/...` | the shipped site rebuilt page for page, with the dashboard's sign-in and onboarding states (`signin`, `onboarding`, `consent`, `device`, `cli`; `?state=<id>` opens a state) | `src/app/d/production/`, `src/components/plate/` |

There is no `/archive` index page; the Archive row opens the first retired version.

| document | holds |
| --- | --- |
| `AGENTS.md` | the agent entry point: what the hub is, the house rules, where the skills and the handbook are, and how to import them (`CLAUDE.md` points to it) |
| `docs/handbook/` | how Kevin works at GT: the operating principles, the multi-session playbook, the quality bar, the product map, the glossary and the decisions log, indexed by its `README.md` |
| `BRAND.md` | the identity canon: the name, the idea, the character and voice, the mark, color, type, language as material |
| `DESIGN.md` | the visual canon; sections 2 (the line law and its chrome rules), 15 (the chrome exceptions) and 16 (the sidebar's rows) govern the shell |
| `ARCHITECTURE.md` | the code map: the direction registry, the toolchain source and fork rescoping, the instruments, the gallery pipeline |
| `docs/SHIP-LOOP.md` | the verify and ship procedure |
| `docs/GRAPHICS.md`, `docs/ARTIFACT-PICTURES.md`, `docs/LIBRARIES.md` | the graphics pipeline, the picture standard, the instruments index |
| `deck/DECK-GRAMMAR.md` | the deck's grammar |
| `motion/MOTION.md` | the films' brief and roster, kept by the Videos session and untracked |

Prototemplate `main` is the primary repository, and canon is edited there first. gt-cloud's `apps/redesign`, on gt-cloud's `redesign/diagram-standard` branch, is the older copy of the direction pages. Files move between the two one at a time, and no `rsync --delete` ever runs toward Prototemplate, because it would erase the routes that exist only here (`docs/SHIP-LOOP.md` section 7).

Prose in the repository drifts from the code. On 2026-10-05 `README.md` and `docs/SHIP-LOOP.md` sections 0 and 1 named port 3006, which was `apps/redesign`'s port. `README.md` and `ARCHITECTURE.md` named `.agents/skills/gt-redesign` and the `redesign-*` skills, which no longer exist. `README.md` and `public/llms.txt` said seventeen directions and 52 slides while `DIRECTIONS` held 27 entries and `deck/slides` held 93 files. Trust `package.json` and the registries, and fix the prose in the change that finds the drift.

### Keeping the hub current

Prototemplate is the living reference of GT work only while every deliverable reaches it.

1. **Same round.** Every GT design deliverable lands in Prototemplate in the round it is made: new rules (as documents, deck slides or lints), graphics, covers, OpenGraph cards, contact sheets, posts, films (through the Videos session), logos, banners and promos, the page-check system, and the sign-in and onboarding system in the Shipped group (2026-08-14, 2026-08-19, 2026-09-18, 2026-10-01). Kevin still reviews it on localhost first (section 9).
2. **Grouped by item.** A collection page shows every version of one image (dark, light, cover, social card, sheet) in one place, in the same viewer layout as the other collections (2026-09-18).
3. **The production mirror.** `/d/production` rebuilds each gt-cloud page one to one and renders it natively, with no link out to generaltranslation.com (2026-08-24, 2026-08-25). After gt-cloud PRs merge, diff main and port their fixes here so the two never drift (2026-08-10). Remove mirror pages Kevin calls wrong and bring in the pages he built (2026-09-09: "remove these terrible pages").
4. **Both copies.** When an app exists in two copies (the copy Kevin views and the copy that ships), apply the fix to both and say which copies changed (2026-08-14: "doesnt look right on prototemplate lol fix it on proto").
5. **The shared remote.** Fetch and rebase onto origin before pushing. An overlay that discards commits already on HEAD is a defect (2026-08-27: "wait on prototeamplte i think you forgot to rebase"). Confirm the Vercel build after every push and fix a failed one at once (2026-09-24; `gt-ship` section 8).
6. **The narrative.** The gallery tells the redesign in order: the directions explored, the ones that survived review, the three full site concepts, then the shipped production site as the outcome, with the earlier pages still viewable (2026-08-26: "wait this is not the control ... yes its the outcome").
7. **Brand directives** update `/brand` and BRAND.md and leave the business facts alone. The brand agency questionnaire's confidential answers stay off the site.

## 2. The repository map

```
src/app/                 one folder per route: page.tsx (server) and a client viewer
src/app/d/               the directions; d/toolchain is the source the forks import,
                         d/_v0 holds the shared v0 sections, d/production the shipped site
src/components/viewer/   the shell: ViewerShell, Toolbar, Sidebar, Sheet, BookView,
                         Search, IndexPanel, PreviewLayer, icons.tsx, tokens.css
src/components/shared/   instruments used across pages (EverySentence, StudioField,
                         PrismaticField, diagrams/DoubledLine)
src/components/shell/    the bento primitives
src/components/plate/    the port of the dashboard's sign-in and onboarding pages
src/lib/                 registries (surfaces, search-index, shell-data, directions,
                         archive, marks, graphics), generated data (skills.ts,
                         motion.ts), engines (dither, studio-field, glyph-field,
                         horizon-field, prismatic-field), fonts.ts, brand-fonts.ts,
                         use-mount-effect.ts
scripts/                 build, capture and lint scripts, pagecheck/, oxlint-plugins/
deck/                    the deck source: parts/head.html, slides/NN-*.html, parts/tail.html
graphics/                the blog illustration toolchain
content/                 the blog posts and their authors
motion/                  the films, untracked, owned by the Videos session
skills/<slug>/           the curated GT skills, the canonical copy
public/                  fonts/, shots/, marks/, media/, brand-deck.html, llms.txt,
                         skills/, motion/
docs/                    the documents, with handbook/, harness/, research/ and reference/
AGENTS.md, CLAUDE.md     the agent entry point and its pointer
```

- `next.config.ts` sets `typescript.ignoreBuildErrors: true`, so `pnpm build` never type-checks. `tsc` is a gate of its own.
- `tsconfig.json` includes `**/*.ts`, so a `.ts` file under `skills/` would be type-checked. Skill helpers are `.mjs`.
- `src/app/d/**` holds self-contained explorations with their own type and colors. The shell's rules do not reach it. The type lint also skips the files its `ALLOW_FILES` list names: `/d/`, `/present` (a type specimen), the plate, the craft demos, `src/components/try` and the shared components only the directions mount.

## 3. The viewer shell

`ViewerShell` (`src/components/viewer/ViewerShell.tsx`) frames every route except `/deck`, `/present`, `/blog` and the `/d/` pages. `/deck` frames the standalone deck, which keeps its own viewer, the one the shell was modeled on. Kevin made the deck's viewer the frame for the whole site on 2026-09-08 ("i really love our deck's navigation and basic interface"). The shell owns the state and draws the chrome: the sidebar, the 52px toolbar, the stage, the index panel, the search, the help card, the toast, the progress line and the one hover preview. The route renders the stage content as children.

- The props are `id`, `title`, `mark`, `count`, `sections`, `active`, `modes` (the first is the default), `surfaces`, `thumb`, `keys` (`paged`, `flow` or a function of the mode), `noun`, `toolbarSlot`, `modeLabels`, `renderSub`, `siteMap`, `onSelect`, `onCurrentPage`, `countLabel` and `children`. `references/shell.md` explains each one.
- The data shapes live in `src/lib/shell-data.ts`: `ShellSection` (`id`, `label`, `items`, `paged`, `under`, `short`) and `ShellItem` (`id`, `n`, `title`, `short`, `href`, `inPlace`, `url`, `shot`, `desc`, `surface`, `mark`).
- The stage is a `Sheet` (`fixed`, a scaled 16:9 stage, or `flow`, a 1280px scrolling page), a `BookView` (a head, a contents grid and a page per item), or the grid, which the shell mounts itself.
- **The book page.** Every page with a book head renders one structure (DESIGN.md section 4, The book page). `BookHead` (`src/components/viewer/BookView.tsx`) draws the whole front matter: the title from `PAGE_NAMES` (`src/lib/page-names.ts`) or a record's own title, a lead of one to three lines, the panel (Updated from the generated `src/lib/updated.ts`, then three facts, or one fact and the install field, each with a Heroicons 20 solid glyph), an optional note and contents, then the one hatch band. Sections are `section.pt-book-part` opened by a `.pt-book-sec` divider with a `Section n` gutter note. The server `page.tsx` calls `requireUpdated('<route>')` and passes the entry down; a new route needs its paths in `scripts/build-updated.mjs`. `pnpm lint:heads` and `pnpm lint:heads:live` hold the structure. Kevin, 2026-10-06: "standardize our presentation more".
- `usePtShell()` gives route code the state and the actions (`select`, `step`, `setMode`, `say`). `select` writes the item's id into the hash.
- The theme is `html[data-theme]`, read from `localStorage['gt-theme']`, dark when unset, and stamped before first paint by the boot script in `src/app/layout.tsx`. Dark mode is a token remap under `:root[data-theme='dark']`. No shell stylesheet reads `prefers-color-scheme`; the `themeColor` meta in `layout.tsx` is its one use outside the plate.
- `src/components/viewer/tokens.css` is the one token file. It holds the colors (`--pt-paper`, `--pt-ink`, `--pt-ink-2`, `--pt-titanium`, `--pt-hair`, `--pt-hair-soft`, `--pt-edge`, `--pt-plate`, `--pt-thumb`, `--pt-site-*`), the sizes (`--pt-bar-h` 52px, `--pt-sb-w` 208px, `--pt-panel-w` 460px), the corners (`--pt-radius-shell`, `-control`, `-inner`, `-chip`, `-card`, `-round`), the book page's spaces (`--pt-title-clear`, `--pt-head-gap`, `--pt-head-rule-pad`, `--pt-book-gap`, `--pt-sec-over`, `--pt-sec-pad`, `--pt-band-h`), the type (`--pt-text`, `--pt-display`, `--pt-mono`, `--pt-ff-text`, `--pt-ff-display`, `--pt-w-*`, the display steps `--pt-d1` to `--pt-d3`, the text steps `--pt-t-*`, `--pt-measure`), the motion durations (`--pt-dur-*`, 0ms under reduced motion) and `.pt-scroll`, the one scrollbar.
- Code inside the shell runs mount work in `useMountEffect` (`src/lib/use-mount-effect.ts`) and dependency work in `useGSAP` with `dependencies`. The practices ratchet (`pnpm lint:practices`) fails a new bare `useEffect`. Shell code mirrors state into refs for listeners and animates transform and opacity only. Every `.pt-*` class is global, so grep a name before using it.

`gt-components` lists each shell component with its role. This skill covers how a route uses them.

## 4. Registries that move together

A page, a document or a skill appears in several hand-kept lists. A change updates every list that names it in the same commit.

| registry | holds | read by |
| --- | --- | --- |
| `src/lib/surfaces.ts` | every place on the site (`SITE_SURFACES`: Pages, Knowledge, Shipped, Documents, Sites, Explorations, Archive, Libraries, Brand sections) and every public place the brand is live (`PUBLIC_SURFACES`); the id is also the thumbnail stem | the sidebar's site map, the index panel, the preview layer, the search |
| `src/lib/search-index.ts` | the Cmd K list: the surfaces, a row per skill, per film and per handbook document, `DOC_HEADINGS` and `HANDBOOK_HEADINGS` (every h2 of every document), `DECK_SLIDES` (the 93 slide titles), `PAGE_ICON`, `PAGE_KEYWORDS`, `EMPTY_PER_GROUP` | `Search.tsx` |
| `src/app/docs/registry.ts` (`DOCS`) and `src/app/handbook/registry.ts` (`HANDBOOK`) | the documents /docs serves and the handbook documents /handbook serves: slug, file, title, blurb | the two book routes, the Documents rows, the search's Handbook rows, the sitemap, `capture-pages.mjs`, `build-updated.mjs` |
| `src/lib/page-names.ts` (`PAGE_NAMES`) | each page's plain name and its short sidebar label | the book heads, the window titles, the Pages and Knowledge rows |
| `scripts/build-updated.mjs` (`pages()`) | the paths whose last commit dates each book head | `pnpm build:updated` writes `src/lib/updated.ts`; `pnpm lint:updated` and the build check it |
| `src/app/docs/links.ts` (`DOC_ROUTES`, `siteHref`) | where a repository path opens on the site, built from both registries | the docs renderer, the skill pages |
| `src/lib/directions.ts` (`DIRECTIONS`) | every direction | the gallery, the presenter, the sitemap, `/directions`, the Sites and Explorations rows |
| `src/lib/archive.ts` (`ARCHIVE`) | the retired directions | `/archive/<slug>`, the sitemap, the Archive rows |
| `src/app/sitemap.ts` | a static list of routes plus loops over the registries | crawlers |
| `public/llms.txt` | the hub described for agents, written by hand | agents |
| `src/app/layout.tsx` | the site description, the keywords and the Open Graph text | every page's metadata |
| `scripts/capture-pages.mjs` (`routes` in `targets()`) | the routes shot for the previews | `public/shots/pages`, then `pnpm build:thumbs` |
| `scripts/pagecheck/pages.mjs`, `scripts/lint-lines.mjs` (`shellRoutes()`) | the routes each gate walks | `pnpm check:pages`, `pnpm lint:lines:shell` |

- `src/lib/skills.ts` and `src/lib/motion.ts` are generated. Edit their sources and rerun `pnpm build:skills` or `pnpm build:motion`.
- `lint-lines.mjs` and `pagecheck/pages.mjs` find a first slug by regex: `id: '` after `export const SKILLS` in `skills.ts`, the first quoted string after `export const MOTION_PACKAGE_SLUGS` in `motion.ts` and `entry('` in `archive.ts`. For the direction, `lint-lines.mjs` takes the first `slug: '` in `directions.ts`, and `pages.mjs` takes the first `DIRECTIONS` entry without `site: true` (`firstExplorationSlug` in `scripts/site-pages.mjs`). `pages.mjs` also reads the first `slug: '` after `export const DOCS` and the newest post in `content/blog`. A generator that changes its output shape breaks both gates.
- `DOC_HEADINGS`, `HANDBOOK_HEADINGS` and `DECK_SLIDES` are snapshots. A document that gains or renames an h2 updates its table in the same change; `check-registries.mjs` reports the drift.
- The live domain is www.prototemplate.com. `SITE_URL` in `layout.tsx` and `sitemap.ts` still names prototemplate.vercel.app, which is the personal project's alias, and every link in `llms.txt` names it too.

`node skills/prototemplate/scripts/check-registries.mjs` checks the headings, the route lists, the first-slug regexes and the skill contract. It exits 1 on a hard failure and prints the softer gaps as notes.

## 5. Chrome rules

Chrome is everything the shell draws around content. The rules are `DESIGN.md` sections 2, 15 and 16 and the values in `tokens.css`. `gt-aesthetic` holds the taste behind them, and `gt-lints` holds the lints that enforce them.

- **Type.** The one face is the rsms InterVariable v4.1, self-hosted in `public/fonts/` and bound in `src/lib/fonts.ts` as `ptInter`, so its family name matches no installed Inter. It is published as `--font-inter`. Only the roman is preloaded: the italic is a plain `@font-face` in the `ptInter` family in `src/app/globals.css`, and every other `localFont` call (the /d faces, the presenter's) sets `preload: false`. Weights stop at 500. A stylesheet reads the type tokens (`--pt-text`, `--pt-ff-text`, `--pt-ff-display`, `--pt-d1` to `--pt-d3`) and declares no family, feature list or display size of its own. `pnpm lint:type` (`scripts/lint-type.mjs`, added in the 2026-10-05 round) holds that outside its `ALLOW_FILES` list, and `pnpm build` and `pnpm lint:all` run it. On 2026-10-05 Kevin asked to enforce "the CORRECT RASMUS INTER".
- **Corners.** Rounded controls, square shells (DESIGN.md section 2, Corners; Kevin, 2026-10-05: "boxes only for ui shells"). The frame, the sidebar column, the toolbar bar, the sheet, the index panel's column, the book head, the rules and the bands are square (`--pt-radius-shell`). Buttons, fields and segmented groups take `--pt-radius-control` (6px), a part flush inside one `--pt-radius-inner` (5px), chips and key caps `--pt-radius-chip` (4px), and cards, tiles, thumbnails and popovers `--pt-radius-card` (6px). `pnpm lint:radius` and `pnpm lint:radius:live` hold it, and Present's 8px is the one named exception.
- **Color.** Chrome draws colors from `tokens.css` only. `pnpm lint:shell` refuses literals in `src/components/viewer` and `src/components/shell`.
- **Icons.** Chrome draws Heroicons 20 solid, inlined as paths in `src/components/viewer/icons.tsx` at 16px in `currentColor`. The theme button's text glyphs ◐ and ◑ are the one exception. Chrome uses no Lucide, no other Unicode glyph icons and no icon font. gt-cloud uses other tiers (Heroicons 24 and 16 solid for meaning, Lucide for controls; see `gt-components`), and each repository keeps its own set.
- **Scrollbars.** `.pt-scroll` is the only scrollbar: a 4px gutter and a 2px `--pt-thumb` thumb that widens to 4px under the pointer.

### Lines

Every rule in chrome is 1px, drawn once, in one of three roles. Kevin, 2026-09-08: "make border colors proper and correct, verify no double borders ... this is key to our identity".

| role | token | draws |
| --- | --- | --- |
| structural | `--pt-hair` | the sheet ring, the toolbar's bottom, the sidebar's right edge, the index panel's left edge, the book head's rule, the hatch band's two rules, the section dividers, the field boxes at rest |
| row | `--pt-hair-soft` | list rows, search results, the book head's panel rows, the sheet mat's outer ring |
| frame | `--pt-edge` | frames of pictures and tiles, and the help card |

`--pt-ink` colors a border only in a state: a pressed button, an active frame, the count while it is edited, the solid call to action, or a focused field. Where two bordered parts touch, the junction table in DESIGN.md section 2 names the one owner. The sidebar's right edge owns the seam between sidebar and stage, the toolbar's bottom edge owns the seam between toolbar and stage, and a group header draws no rule.

### The five exceptions

Kevin asked for five elements to step outside these rules in round six (DESIGN.md section 15). They are the search pill's hover border, the ⌘K key chip's ground, the Present button (the one solid button, with 8px corners and the label first), the Prototemplate mark's rainbow core, and the sidebar nameplate with `proto` in Fraunces 600 and `template` in Space Grotesk 500 at 14.5px from `src/lib/brand-fonts.ts`. No other element takes these values, and a cleanup sweep keeps the five as they are.

### The sidebar

DESIGN.md section 16 sets three rules for the list in column one.

1. Every row is a link to a page. The shell selects in place only an item with no address of its own, an `inPlace` item, or the item of the page the reader is on.
2. Route sections nest under their page row through `ShellSection.under`. On 2026-10-05 Kevin saw /brand's ten sections in a separate "Sections" group and asked for them "actually under that section", under the Brand row. Every page with sections works the same way.
3. The current page is always marked. The current row is the one with the longest path covering the pathname. It carries `aria-current="page"`, and so does the page row the reader is inside (Skills on `/skills/<slug>`). A marked row that is a reading position on another page, or an item with no address of its own, carries `aria-current="true"` (`linkAttrs` in `Sidebar.tsx`).

The same round asked for full titles that wrap to two lines with no ellipsis (`short` holds a shorter name for a long title), a clear current state, folds that follow the current page, correct keyboard and aria behaviour, and no identical icon repeated on every sub-row.

## 6. Adding a page, a document or a skill

`references/adding.md` gives each list file by file, along with directions, shipped pages, films and stills.

- **A page** needs the route's `page.tsx` and viewer, a row in `PAGES` or `KNOWLEDGE` of `surfaces.ts`, `PAGE_ICON` in `Sidebar.tsx` and `search-index.ts`, `PAGE_KEYWORDS`, `under` on its sections, a sitemap line, lines in `llms.txt` and the README, an entry in the capture routes followed by `pnpm capture:pages --only <id>` and `pnpm build:thumbs`, and entries in `pagecheck/pages.mjs` and `lint-lines.mjs`.
- **A document** needs the file, a `DOCS` entry, its h2s in `DOC_HEADINGS`, lines in `llms.txt` and the README's "Read first" table, and a `docs-<slug>` capture. Its links resolve through `src/app/docs/links.ts`.
- **A handbook document** needs `docs/handbook/<slug>.md`, a `HANDBOOK` entry in `src/app/handbook/registry.ts`, its h2s in `HANDBOOK_HEADINGS`, its row in `docs/handbook/README.md` and AGENTS.md's handbook list, a line in `llms.txt`, and a `handbook-<slug>` capture.
- **A page with a book head** follows DESIGN.md section 4 (The book page): its `PAGE_NAMES` entry, `BookHead` with three facts, `requireUpdated` from the server page, an entry in `scripts/build-updated.mjs`, its route in `lint-heads.mjs`' live list, then `pnpm build:updated`.
- **A skill** needs `skills/<slug>/SKILL.md` written to the contract in section 10, then `pnpm build:skills`, then the installer's dry run and its run.
- Every addition ends with `node skills/prototemplate/scripts/check-registries.mjs` and the gates in section 9.

## 7. Build scripts

| command | reads | writes |
| --- | --- | --- |
| `pnpm dev` | the source | `next dev --turbopack --port 3005`, started from the launch config `prototemplate-dev` |
| `pnpm build` | the source | the picture, type, radius and heads lints, the `build:updated` check, then `next build` |
| `pnpm build:updated` | `git log` over each book head's paths (`--staged` for a commit) | `src/lib/updated.ts`; `pnpm lint:updated` (`--check`) fails while it is stale against HEAD |
| `pnpm build:deck` | `deck/parts`, `deck/slides`, `deck/fonts`, `deck/shots` | `public/brand-deck.html` with every image inlined, and `public/shots/deck` |
| `pnpm build:marks` | the faces in `public/fonts/google`, through fontkit | the speed marks in `public/marks`, one color in `currentColor` |
| `pnpm build:thumbs` | `public/shots/{light,dark,archive,pages}` | 640 by 360 JPEGs in `public/shots/thumb`, through `sips` on macOS |
| `pnpm build:skills` | `skills/<slug>/SKILL.md` and the files beside it, nothing outside the checkout | `src/lib/skills.ts` and `skills/README.md`, after checking the contract (section 10); `pnpm lint:skills` (`--check`) fails while either is stale |
| `pnpm build:motion` | `motion/MOTION.md`, `motion/films/<slug>/BRIEF.md`, the published cuts pinned in `public/motion/published.json` and their records in `motion/out` | `src/lib/motion.ts`, `public/motion/<slug>.md`, and each published cut's credits, contact sheet and script in `public/motion` |
| `pnpm capture:pages` | the dev server, or generaltranslation.com with `--live` | `public/shots/pages/<id>-{light,dark}.jpg` at 1440 by 900 |
| `pnpm check:pages` | the dev server | `.pagecheck/REPORT.md` |
| `pnpm graphics:serve`, `:gen`, `:render`, `:export`, `:audit` | `graphics/` | the illustrations (`gt-graphics`) |
| `pnpm mood-tone <sources dir>` | source pictures, with `--set deck` (the default) or `--set plate` | the tone grids in `deck/shots/tone` or `public/brand/mood` (`gt-dither`) |
| `python3 scripts/fetch-google-faces.py` | Google Fonts | `public/fonts/google` and its `MANIFEST.json` |

- The generated outputs are committed (`src/lib/skills.ts`, `src/lib/motion.ts`, `public/brand-deck.html`, `public/shots`, `public/marks`), so the site builds without `motion/` or any other checkout.
- `build:motion` only reads `motion/`. It throws before writing when a brief's or a script's shape changes or a web copy differs from the cut `public/motion/published.json` pins, so the last generated files stay intact. It publishes a film's credits, sheet and script only from the folder whose render is the pinned cut, and lists a newer cut as in review (`--pin <slug>` pins a new web copy once Kevin approves it).
- `scripts/build-skills.mjs` reads only `skills/`, so it runs in any clone. Its header comment lists the contract it checks.
- The browser scripts launch Chrome for Testing through `playwright-core` and default to the build in Kevin's Playwright cache. Every one of them (`capture:pages`, `check:pages`, `lint:lines`, and the live modes of `lint:type`, `lint:radius` and `lint:heads`) reads `CHROME_PATH` first, so on another machine set it to a local Chrome for Testing.
- The Google faces are self-hosted because Turbopack's Google font loader failed builds at random (vercel/next.js#99114, fixed here on 2026-09-24).

## 8. The shared checkout

On Kevin's machine `$PROTOTEMPLATE` is one working tree that several Claude sessions use at once, and each session keeps to its lane. A fresh clone elsewhere has no other sessions, but the staging rules below still apply. Kevin, 2026-10-03: "the videos one should be making them, and this one is just for prototemplate work".

- On 2026-10-05 the Videos session owns `motion/`, which is untracked. The onboarding and dashboard session works in `deck/`, `src/components/plate`, `src/app/craft` and `public/brand/mood`, and it pushes main from its own worktree. The Prototemplate session does the site work. A request that belongs to another lane goes to that session by name (ListAgents, then SendMessage).
- Read `git status --short` before and after the work, and stage only the change's own paths. Never run `git add -A` or `git add .`: on 2026-10-01 commit b56e64c swept 229 files of `motion/` onto origin/main.
- Never run `git checkout <commit> -- <file>` on a path another session may hold edits in, and never rewrite shared main without Kevin.
- Never stop or restart the dev server on 3005, and never build in the shared `.next`. Next 16 refuses a second `next dev` for the same checkout (`.next/dev/lock`).
- `gt-ship` section 8 gives the commit steps: the fetch of `origin/main`, the conflict-marker sweep and the pathspec commit.

## 9. Gates and landing

`gt-lints` explains each gate, and `gt-ship` section 8 holds the build commands, the push and the deploy checks.

1. `pnpm exec tsc --noEmit`, which takes 3 to 5 minutes.
2. `pnpm lint:all`, which chains the static lints (`lint:shell`, `lint:practices`, `lint:type`, `lint:radius`, `lint:heads`, `lint:skills`, `lint:updated`, `lint:code`, `lint:pictures`), the browser audits against the dev server on 3005 (`lint:lines:shell`, `lint:type:live`, `lint:radius:live`, `lint:heads:live`) and the lint tests; `package.json` holds the exact chain. It takes about 25 minutes. Run the browser gates one at a time, because a parallel capture made `lint:lines:shell` fail on 2026-10-01.
3. `pnpm check:pages --pages <ids>` on the touched routes, with zero defects and every interaction passing.
4. A look at both themes at 1440 and 390 wide, with 2x crops of every junction a figure draws, because the line audit cannot see SVG strokes.
5. `pnpm build` in a scratch worktree, gated with `&&` and never piped.

Kevin reviews on http://localhost:3005 first. New explorations and redesign rounds stay uncommitted or on a branch until he says to land them ("I should be reviewing them locally", 2026-09-14). When he says to land, push the committed HEAD he reviewed (`git push origin HEAD:main`). The working tree holds other sessions' edits, so never commit it whole. Every push builds on two Vercel projects: the General Translation team project serves www.prototemplate.com, and Kevin's personal project serves prototemplate.vercel.app.

## 10. The skills

The curated GT skills live in `skills/<slug>/`. Each folder holds `SKILL.md`, and may hold `references/*.md` for detail loaded on demand, `scripts/*.mjs` and `assets/`. Kevin, 2026-10-05: "we only need to show and store the ones weve actually been using and updating ... dont just smash a bunch of thigns in there". The set was chosen from evidence: Skill calls, SKILL.md reads and edits from July to October 2026, and Kevin's prompts by area.

The set is the 22 folders under `skills/`: gt-voice, gt-website, prototemplate, gt-performance, gt-landing-pages, gt-aesthetic, gt-brand, gt-deck, gt-explorations, gt-lints, gt-motion, gt-graphics, gt-dither, gt-films, gt-diagrams, gt-isometric, gt-components, and in workflow gt-local-dev, gt-verify, gt-ship, gt-reporting and gt-orchestration. Sixteen were chosen from that evidence on 2026-10-05; the six workflow and process skills came from mining Kevin's messages from July to October the same day. `skills/README.md`, written by `pnpm build:skills`, lists them by area.

### The frontmatter

The frontmatter uses Agent Skills fields only, so Claude Code, Codex and other loaders accept it.

```yaml
---
name: gt-voice
description: >-
  <what it covers, then 'Use when ...'; at most 1024 characters, about 600>
metadata:
  title: Voice and the humanizer
  areas: voice
  updated: 2026-10-05
  origin: prototemplate
---
```

- The slug, the folder and `name` are one string of lowercase letters, digits and hyphens, and it is never `index`.
- `metadata` values are strings. `areas` is a comma-separated list from the fixed set voice, website, landing, aesthetic, lints, motion, graphics, videos, diagrams, isometry, components, workflow: Kevin's eleven areas in his order, then workflow for how the work moves (servers, proof, landing, reports, lanes). The first entry places the skill on /skills. `origin: prototemplate` marks the folders the installer owns.

### The body

- It opens with an h1 equal to `metadata.title` and two or three sentences, then the sections, a Review checklist where the skill governs reviewable output, a Related skills line, and Sources last.
- Paths are relative to a named checkout (`$PROTOTEMPLATE`, `$GT_CLOUD`) and never to a home folder. Sources cite repository-qualified paths and Kevin's dated directives.
- The repository is public, so a skill holds no keys or key file contents, no email addresses, no personal details and no company numbers.
- `SKILL.md` stays under 500 lines, with the detail in `references/`. Every skill is written to gt-voice: no em dashes, no metaphors, no "X, not Y", no signposts.
- Supporting files are `.md`, `.mjs` or `.json`.
- The skill page renders the body with the docs parser (`src/app/skills/[slug]/body.ts`). Headings below h3 read as h3. A link into the skill's own folder, or a code span that names one of its files exactly (`references/type.md`), becomes a link to the raw file the site serves at `/skills/<slug>/<file>`; a link to `../<other-skill>/SKILL.md` opens that skill's page; and a code span or link naming a document the site renders (`docs/handbook/quality-bar.md`, `DESIGN.md`) opens that document's route. `README.md` and `AGENTS.md` in a code span stay text, because skills also name other repositories' files by those names.

### Installing

- `skills/<slug>/` is the one copy. `scripts/install-skills.mjs` links or copies it into a project's `.claude/skills` and `.agents/skills` (`--project <dir>`, codex on request), the home directory's (`--user`) or one named folder (`--into <dir>`), with `--dry-run` first. Its header comment is the authority for its flags, and README.md's Skills section gives the commands. Never run it against Kevin's home folder without asking him; on his machine `~/.claude/skills` and `~/.agents/skills` link into the wiki's runtime list, and `--user` refuses there for that reason.
- This repository's `.claude/skills` and `.agents/skills` hold relative links to `../../skills/<slug>`, made by `node scripts/install-skills.mjs --project .`; rerun it after adding a skill. The six folders `.agents/skills` held from 2026-09-18 were folded into the set on 2026-10-05: blog-graphics-pipeline, docs-source-capture, glyphfield-headless-export, stop-motion-ui-capture and gt-docs-visual-tokens into `gt-graphics` and its references, and gt-blog-mdx-components into the blog section of `gt-website`.
- The `skills` CLI (`npx skills add <owner>/<repo> --skill <slug>`) reads a root `skills/` folder, which would install one skill without a checkout. It is untested on this repository, so try it before the README documents it.

### The other skill homes

- Kevin's wiki is the source of his general skills: the humanizer, kevin-voice, create-graphics, design-engineering-polish, agent-browser and the hyperframes skills. It lives at github.com/Kevin-Liu-01/Kevin-Wiki and is projected into `~/.claude/skills` and `~/.agents/skills`. Prototemplate work never edits it. A GT skill names the wiki skills it depends on in its Related skills line.
- gt-cloud's `.agents/skills` stay authoritative for gt-cloud's code maps. On origin/main they include gt-landing, gt-ui, gt-dashboard, glyphfield and code-comments, and artifact-pictures is on the branch `k/artifact-picture-standard`. A GT skill points to them and copies none of their file maps.
- No slug in the set exists in `~/.claude/skills`, `~/.agents/skills` or gt-cloud's `.agents/skills`, so an install never shadows a wiki or gt-cloud skill. A new slug is checked against all three homes first.

### Using the hub from another project

`AGENTS.md` and README.md's "Import this into another project" section give the steps.

- Copy `skills/`, `scripts/install-skills.mjs`, `AGENTS.md`, `BRAND.md`, `DESIGN.md` and `docs/handbook/` into the project at the same paths, then run the copied installer there with `--project .` (dry run first). Every relative link between the skills, the canon and the handbook keeps working. On Kevin's machine a project can instead link to this checkout (`--project <dir>` from here).
- Link the canon by its address on the site (www.prototemplate.com/docs/design, /docs/brand, /skills/<slug>), so a reader in another repository reads the current version.
- `pnpm check:pages --base <url> --pages-module <file>`, run in `$PROTOTEMPLATE`, checks another site. The module exports `pages()` in the shape of `scripts/pagecheck/pages.mjs`, and `--hooks-module` adds that site's invariants (`scripts/pagecheck/README.md`). Both paths resolve against the Prototemplate checkout, so pass absolute paths.
- `node scripts/lint-lines.mjs <url> --theme dark` audits the lines of any page at 1440 and 1280 (with no URL it audits `http://localhost:3005/d/toolchain`). Section 7 gives its Chrome path.
- `LICENSE` reserves all rights to General Translation, Inc. The repository is public to read, and reuse of its code, writing or designs outside a GitHub fork needs written permission. Third-party fonts, icons and adapted skills keep their own licenses.

## Review checklist

- [ ] Every registry in section 4 that names the change was updated in the same commit, and `check-registries.mjs` exits 0 or fails only on findings that predate the change.
- [ ] Every new route section sets `under`, no page shows its sections as a separate group, and `aria-current="page"` sits only on the current row and the page row the reader is inside.
- [ ] A page with a book head follows the book page standard, its paths are in `build-updated.mjs`, and `lint:heads` and `lint:updated` pass.
- [ ] Chrome stays in the tokens: Inter at 500 or less through the type tokens, corners from the radius tokens (square shells, rounded controls), colors from `tokens.css`, borders in the three roles with one owner per junction, and Heroicons 20 solid from `icons.tsx`.
- [ ] Generated files changed only through their scripts.
- [ ] Prose that states a count, a port or a path matches the code.
- [ ] Only the change's own paths are staged, and `motion/` and the other lanes' paths are untouched.
- [ ] tsc, `lint:all`, `check:pages` on the touched routes, both themes at 1440 and 390, and the scratch worktree build all pass.
- [ ] Kevin reviewed the change on localhost before it reached main.
- [ ] A new or changed skill passes the contract in section 10.

## Related skills

GT skills: `gt-components` (each shell component), `gt-aesthetic` (the taste behind the chrome), `gt-lints` (every gate), `gt-ship` (landing and deploys), `gt-deck` (the deck the shell came from), `gt-graphics`, `gt-dither`, `gt-motion` and `gt-films` (what /graphics and /motion show), and `gt-voice` (every word on the site and in the skills). Wiki skills: `agent-browser` (the visual check in both themes and at phone width).

## Sources

- Prototemplate: `README.md`; `ARCHITECTURE.md`; `DESIGN.md` sections 2, 4, 15 and 16; `docs/SHIP-LOOP.md` sections 0 to 7; `package.json`; `next.config.ts`; `tsconfig.json`; `.claude/launch.json`; `src/app/layout.tsx`; `src/app/sitemap.ts`; `public/llms.txt`; `src/components/viewer/ViewerShell.tsx`, `Sidebar.tsx`, `BookView.tsx`, `Sheet.tsx`, `useShellKeys.ts`, `icons.tsx` and `tokens.css`; `src/lib/shell-data.ts`, `surfaces.ts`, `search-index.ts`, `fonts.ts` and `brand-fonts.ts`; `src/app/docs/registry.ts` and `markdown.tsx`; `src/app/skills/model.ts` and `[slug]/body.ts`; `src/app/brand/brand-sections.ts`; `scripts/site-pages.mjs`, `capture-pages.mjs`, `build-skills.mjs`, `build-motion.mjs`, `build-deck.mjs`, `build-thumbs.mjs`, `build-speed-marks.mjs`, `lint-lines.mjs` (`shellRoutes()`, `EXEC`), `lint-type.mjs` (`ALLOW_FILES`), `pagecheck/pages.mjs` and `pagecheck/pagecheck.mjs`; `graphics/README.md`; `LICENSE`; all read 2026-10-05 on `speed-marks` at 2a8453c with the round's uncommitted changes.
- The 2026-10-05 round: the specification for the page heads, the one Inter and the sidebar nesting, the skills storage plan, and the skills evidence (Skill calls, SKILL.md reads and edits, and prompts by area, July 5 to October 5).
- gt-cloud: the branches `redesign/diagram-standard` (`apps/redesign`) and `k/artifact-picture-standard`, and `.agents/skills` on origin/main, read 2026-10-05.
- Claude memory notes: prototemplate-interface-system, prototemplate-deploy-policy, explorations-stay-local, session-lanes-prototemplate, ship-loop-hard-gates, prototemplate-hub-skills, prototemplate-plate-port, page-check-system, redesign-presenter-app, plain-technical-english, sentence-order-rules.
- The 2026-10-05 and 2026-10-06 head rounds: page names, the head's panel, the radius law and the book page standard (DESIGN.md sections 2 and 4, `scripts/lint-radius.mjs`, `scripts/lint-heads.mjs`, `scripts/build-updated.mjs`).
- Keeping the hub current: Kevin's messages of 2026-08-04, 2026-08-10, 2026-08-14, 2026-08-19, 2026-08-24 to 2026-08-27, 2026-09-09, 2026-09-18, 2026-09-24 and 2026-10-01.
- Kevin's directives: 2026-09-08 (the deck's viewer as the frame for the site; border colors and no double borders); 2026-09-09 (the Pages order; the presenter without Signal); 2026-09-14 (explorations reviewed locally); 2026-10-03 (one session per lane); 2026-10-05 (Prototemplate as his hub and wiki, the curated skills, the correct Rasmus Inter, sections under their page row, rounded controls in square shells); 2026-10-06 (one book page on every route).
- Incidents: 2026-08-07 and 2026-08-11 (broken builds pushed through a `;` and a pipe); 2026-10-01 (b56e64c swept `motion/` onto main).
