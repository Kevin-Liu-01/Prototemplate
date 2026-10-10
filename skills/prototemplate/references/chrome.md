# The shell's page standard and chrome rules

Detail for sections 3 and 5 of `prototemplate`, moved from SKILL.md on 2026-10-10 with no rule removed. The rules are `DESIGN.md` sections 2, 4, 15 and 16 and the values in `src/components/viewer/tokens.css`; `references/shell.md` gives the shell's props and data shapes.

## The viewer shell

`ViewerShell` (`src/components/viewer/ViewerShell.tsx`) frames every route except `/deck`, `/present`, `/blog` and the `/d/` pages. `/deck` is the standalone deck itself, which keeps its own viewer, the one the shell was modeled on. A link to it from the shell loads it as a document (`src/lib/document-routes.ts`), since a router navigation would fetch the whole deck twice. Kevin made the deck's viewer the frame for the whole site on 2026-09-08 ("i really love our deck's navigation and basic interface"). The shell owns the state and draws the chrome: the sidebar, the 52px toolbar, the stage, the index panel, the search, the help card, the toast, the progress line and the one hover preview. The route renders the stage content as children.

- The props are `id`, `title`, `mark`, `count`, `sections`, `active`, `modes` (the first is the default), `surfaces`, `thumb`, `keys` (`paged`, `flow` or a function of the mode), `noun`, `toolbarSlot`, `modeLabels`, `renderSub`, `siteMap`, `onSelect`, `onCurrentPage`, `countLabel` and `children`. `references/shell.md` explains each one.
- The data shapes live in `src/lib/shell-data.ts`: `ShellSection` (`id`, `label`, `items`, `paged`, `under`, `short`) and `ShellItem` (`id`, `n`, `title`, `short`, `href`, `inPlace`, `url`, `shot`, `desc`, `surface`, `mark`).
- The stage is a `Sheet` (`fixed`, a scaled 16:9 stage, or `flow`, a 1280px scrolling page), a `BookView` (a head, a contents grid and a page per item), or the grid, which the shell mounts itself.
- **The book page.** Every page with a book head renders one structure (DESIGN.md section 4, The book page). `BookHead` (`src/components/viewer/BookView.tsx`) draws the whole front matter: the title from `PAGE_NAMES` (`src/lib/page-names.ts`) or a record's own title, a lead of one to three lines, the panel (Updated from the generated `src/lib/updated.ts`, then three facts, or one fact and the install field, each with a Heroicons 20 solid glyph), an optional note and contents, then the one hatch band. Sections are `section.pt-book-part` opened by a `.pt-book-sec` divider with a `Section n` gutter note. The server `page.tsx` calls `requireUpdated('<route>')` and passes the entry down; a new route needs its paths in `scripts/build/updated.mjs`. `pnpm lint:heads` and `pnpm lint:heads:live` hold the structure. Kevin, 2026-10-06: "standardize our presentation more".
- `usePtShell()` gives route code the state and the actions (`select`, `step`, `setMode`, `say`). `select` writes the item's id into the hash.
- The theme is `html[data-theme]`, read from `localStorage['gt-theme']`, dark when unset, and stamped before first paint by the boot script in `src/app/layout.tsx`. Dark mode is a token remap under `:root[data-theme='dark']`. No shell stylesheet reads `prefers-color-scheme`; the `themeColor` meta in `layout.tsx` is its one use outside the plate.
- `src/components/viewer/tokens.css` is the one token file. It holds the colors (`--pt-paper`, `--pt-ink`, `--pt-ink-2`, `--pt-titanium`, `--pt-hair`, `--pt-hair-soft`, `--pt-edge`, `--pt-plate`, `--pt-thumb`, `--pt-site-*`), the sizes (`--pt-bar-h` 52px, `--pt-sb-w` 208px, `--pt-panel-w` 460px), the corners (`--pt-radius-shell`, `-control`, `-inner`, `-chip`, `-card`, `-round`), the book page's spaces (`--pt-title-clear`, `--pt-head-gap`, `--pt-head-rule-pad`, `--pt-book-gap`, `--pt-sec-over`, `--pt-sec-pad`, `--pt-band-h`), the type (`--pt-text`, `--pt-display`, `--pt-mono`, `--pt-ff-text`, `--pt-ff-display`, `--pt-w-*`, the display steps `--pt-d1` to `--pt-d3`, the text steps `--pt-t-*`, `--pt-measure`), the motion durations (`--pt-dur-*`, 0ms under reduced motion) and `.pt-scroll`, the one scrollbar.
- Code inside the shell runs mount work in `useMountEffect` (`src/lib/use-mount-effect.ts`) and dependency work in `useLayoutWork` (`src/lib/use-layout-work.ts`) with `dependencies`, a layout effect with useGSAP's cleanup timing and no GSAP, so GSAP loads only on the routes that tween. The practices ratchet (`pnpm lint:practices`) fails a new bare `useEffect` and any GSAP import under `src/components/viewer`. Shell code mirrors state into refs for listeners and animates transform and opacity only. Every `.pt-*` class is global, so grep a name before using it.

`gt-components` lists each shell component with its role. This skill covers how a route uses them.

## Chrome rules

Chrome is everything the shell draws around content. The rules are `DESIGN.md` sections 2, 15 and 16 and the values in `tokens.css`. `gt-aesthetic` holds the taste behind them, and `gt-lints` holds the lints that enforce them.

- **Type.** The one face is the rsms InterVariable v4.1, self-hosted in `public/fonts/` and cut into unicode-range subsets in `public/fonts/inter` by `scripts/build/subset-inter.py` (`pnpm build:inter`). The roman's latin subset is bound in `src/lib/fonts.ts` as `ptInter`, so its family name matches no installed Inter, and published as `--font-inter`. Only that subset is preloaded: the other subsets and the italic are plain `@font-face` rules in the `ptInter` family in `src/app/inter-subsets.css`, and every other `localFont` call (the /d faces, the presenter's) sets `preload: false`. Weights stop at 500. A stylesheet reads the type tokens (`--pt-text`, `--pt-ff-text`, `--pt-ff-display`, `--pt-d1` to `--pt-d3`) and declares no family, feature list or display size of its own. `pnpm lint:type` (`scripts/lint/type.mjs`, added in the 2026-10-05 round) holds that outside its `ALLOW_FILES` list, and `pnpm build` and `pnpm lint:all` run it. On 2026-10-05 Kevin asked to enforce "the CORRECT RASMUS INTER".
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
