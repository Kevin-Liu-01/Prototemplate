# Marks in detail

This file backs section 5 of `gt-brand`: where each General Translation mark lives, which file to use, the logo and how it sits beside the name, how the speed set is generated, how the name is written in text, how a mark sits in an illustration, and where third-party logos come from. Paths are relative to `$PROTOTEMPLATE` unless they name `$GT_CLOUD`.

## The current mark

The logo, Axis and meridian behind, is General Translation's mark. Kevin moved every Prototemplate use of the doubled-line monogram to it on 2026-11-08 ("Swap everything"): the chrome mark, the inline word mark (retired the same day), the tab icon, the `/brand` figure, tiles and badge, the presenter, and the deck. Every use reads one drawing.

| source | what it is | use it for |
| --- | --- | --- |
| `LOGO` in `src/lib/logo.ts` | the logo as one path in currentColor with the nonzero fill rule, on the catalog's square `0 0 256 256`, with its drawn box `24.3 24.3 207.4 207.4` as `viewBox` | any vector use in the site: `GtMark` (the chrome mark), the `/brand` figure and badge, the docs demos; never redraw it |
| `pnpm build:logo` (`scripts/build/logo.mjs`) | writes every file below from `LOGO`; run `pnpm build:deck` after it | after any change to `LOGO` |
| the `#gt-mark` symbol in `deck/parts/head.html` | the logo on its drawn box | the deck's sidebar head and toolbar brand, the wordmark slot and every slide that draws the mark |
| `public/brand/gt-globe-logo.svg` | currentColor on the drawn box | masks: a CSS mask filled with currentColor, and the alpha masks of the diagrams |
| `public/brand/gt-globe-logo-light.svg`, `gt-globe-logo-dark.svg` | `#070707` and `#ffffff` on the 256 square | the `/brand` tiles and any page that needs the mark as a file |
| `public/brand/no-bg-gt-globe-logo-light.png`, `-dark.png` (1198 px), `-light-96`, `-dark-96` and `-dark-256` | transparent PNG masters at the sizes of the monogram masters | raster contexts: the presenter (the white 256 px file, inverted on paper) |
| `public/brand/gt-globe-logo-icon.svg`, `gt-globe-logo.ico` | the tab icon on the drawn box, ink, and white under a dark color scheme; the .ico holds 16, 32 and 48 px of the white logo on the ink ground, so a tab strip of either color shows it | `GT_ICONS` in `src/lib/seo/site.ts` on `/d` and `/present`, and the deck's head |

- `pnpm test:marks` holds the catalog file `public/marks/graticule/variations/axis-and-meridian-behind.svg`, the masters and the deck symbol to `LOGO`.
- The logo is round, so a box set by height is square. Beside the stacked name it follows the lockup rule below. It never sits inline in a sentence ("The name in running text" below).
- At 32 px the globe, the G and the T's stem all read. At 16 px the ring and the axis read and the inner ovals close up, so the favicon reads as a ringed globe (checked by eye on 2026-11-08).
- Prototemplate's own tab icons (`public/favicon.ico`, `apple-touch-icon.png`, `pt-mark.svg`) are the hub's mark, not General Translation's, and stay.

### The previous mark

The doubled-line GT monogram was the mark until 2026-11-08: every stroke of the G and the T was two parallel lines, the grammar of the doubled-line connector (DESIGN.md section 5). Its files stay at their URLs because other sites link to them: `public/brand/gt-logo-light.svg`, `gt-logo-dark.svg`, `gt-logo-light.png`, the `no-bg-gt-logo-*` PNGs and `public/marks/production/gt-mark.svg`. `/marks` keeps it as a past pick (`doubled-gt`) and in In production, since generaltranslation.com and the dashboard still draw it. Deck slides 16 to 23 keep it as history through the `#gt-monogram` symbol. Its outline was `REFERENCE_MARK` in `src/lib/marks.ts`; `git show a2966dec:src/lib/marks.ts` prints it.

## The logo and its state

Kevin chose the logo on 2026-11-06: Axis and meridian behind, a globe whose ring, meridian oval and latitude oval draw the G, with the T's stem, the polar axis, and the back meridian broken where they pass behind the oval's lower arc, the front of the equator, while the front meridian still meets it. Its state on hover, on sign-in and while loading is Oval globe, axis behind, the same globe without its meridian. Since 2026-11-08 it is the current mark above. The chrome mark has no hover state yet. The site's loading states run the loader, Meridian, then G, and a logo that is a link can draw its meridian back while the link is hovered or focused: both are `GtLogoMotion` (`src/components/brand/GtLogoMotion.tsx`), drawn with SVG and CSS alone on the logo's own path at rest, at the logo's weight throughout.

| what | where |
| --- | --- |
| the logo and its state as files | `public/marks/graticule/variations/axis-and-meridian-behind.svg` and `oval-axis-behind.svg`, canonical one-path files in `currentColor` that the catalog rows of both marks name (each is over the 8 KB `pnpm import:marks` allows, so neither is copied into `public/marks/dynamic`) |
| the catalog | `SHORTLIST` opens on the two, and each row carries `use: 'logo'` or `use: 'state'`; `pnpm test:marks` holds that order |
| how it was reached | the Progression section of `/marks/graticule`: Graticule GT, Graticule GT, heavy, Meridian globe, Meridian globe, axis behind, then the logo; and Oval globe, then Oval globe, axis behind |
| its hovers and its loader | the Hover and loading group of `/marks/graticule`: Meridian draws back, Meridians draw into the poles and Meridians fold into the bar each settle the logo into its state, and the loader, Meridian, then G, runs a line once round the meridian over the state, then the G's stroke once round the equator |
| the live hover and loader | `GtLogoMotion` in `src/components/brand/`, with `GtLogoMotion.css` and `GtLogoMotion.geometry.ts`, which `pnpm build:logo-motion` writes from `scripts/build/logo-motion.json` (never by hand); `/docs/components/marks` shows it and says how to copy it into gt-cloud |

### The mark beside the name

Beside the stacked name, "General" over "Translation", the globe is 1.1 times the span from the first line's cap top to the second line's baseline, which is 2.4627 cap heights, and it is centred on that span, so it overshoots the cap top and the baseline by the same 0.1231 cap height each. The gap from the globe's ink to the G is 0.5637 cap height.

The name is Katagami Text at weight 500, letter-spacing 0, with the font's GPOS kerning, drawn as outlines (Kevin, 2026-11-08: "remember the word mark of general translation text uses katagami text!"). Katagami is Kevin's open-source family (SIL Open Font License, katagami.kevinliu.studio). The two lines are flush left by ink, with 0.4627 cap height of white between the first baseline and the second cap line: the name's own word gap, the T's right side bearing, a word space and the G's left side bearing. At these numbers the lockup is 10.16 cap heights wide and 2.709 tall.

| source | what it is | use it for |
| --- | --- | --- |
| `pnpm build:lockup` (`scripts/build/lockup.py`) | instances Katagami Text at 500 from a Katagami checkout (`KATAGAMI_REPO`), kerns the two words and writes every file below from the font and `LOGO` | after any change to `LOGO` or the font; run `pnpm build:deck` after it |
| `public/brand/gt-globe-lockup.svg` | the lockup in currentColor, cropped to its ink | masks and inline use |
| `public/brand/gt-globe-lockup-light.svg`, `-dark.svg` | `#070707` and `#ffffff` | the `/brand` lockup tiles and any page that needs the lockup as a file |
| `public/brand/gt-globe-lockup.json` | the numbers: cap, word gap, span, the boxes, every letter's position and the kerning applied | `LOCKUP` in `src/lib/logo.ts` and the globe rows read the same numbers, and `pnpm test:marks` holds them together |
| the `#gt-lockup` symbol in `deck/parts/head.html` | the lockup on its ink box, 3.75 to 1 | the deck's title slide |
| `public/marks/graticule/rows/name.svg` | the name alone, its box from the globe's top to the name's foot | the globe rows on `/marks/graticule` |

- A round mark that only matches the height of flat-topped text looks shorter than the text, for the same reason round letters such as O overshoot the cap height and the baseline. At 1.0155 times the span the globe looked smaller than the two lines (Kevin, 2026-11-06), and at 1.1 it reads as the same height as the name without outweighing it, from a large lockup down to a 56px header, where the globe is 34.7px.
- The globe rows on `/marks/graticule` set the name at this size: `NAME_WIDTH` in `src/app/marks/graticule/content.ts` is the name's width in globes (2.5418), and the column in `graticule.css` carries the same number.
- Running copy never sets the name in Katagami. General Translation in a sentence is body copy in Inter.
- Measure the span on the name as set, in the face and weight it ships in, and size the globe from it; never size the globe to the name's line box.

## Rules for every General Translation mark

- **One ink.** Ink on paper, or paper on ink. No third color, no gradient, no shadow, no filter glow.
- **The dark surface inverts the drawn mark.** Use an alpha mask that takes the surface's ink, or a clean invert. `src/app/present/presenter.css` inverts the white PNG on paper with `filter: invert(1)`, which is the clean invert for a raster.
- **Illustrations seat marks as alpha masks** so the shape takes the surface's ink (the isometric family in DESIGN.md section 6 lays them in a face with `plane()` and `markPath()`).
- **Small sizes.** The mark must read at 16px (favicon), 32px (CLI banner), 64px (README header), 128px (npm page) and 256px (website), on paper and on ink (deck slide 25). Check a new placement at its real pixel size in both themes.
- **No gif.** A mark is drawn as an SVG, a canvas field or a component (`LocadexMark`). gt-ui `no-gif-mark` refuses a gif as a mark or a demo frame.
- **Films.** The gem smoke material may wrap a mark as a glass shape (`motion/kit/gem-shapes/gt-mark.png` and `gt-bar-monogram.png`, made by `node kit/gem-shapes/make.mjs` from the motion folder, which is local and untracked). That is the films' material exception in `motion/MOTION.md` and applies to films only (`gt-films`).

## Reviewing a new General Translation mark

These rules hold for any new General Translation mark, from an exploration round to a final pick. They come from Kevin's reviews of a round of General Translation marks drawn as a globe (2026-10-08 and 2026-10-09), the rules on rough rows and on context from his request of 2026-10-28, the rules on cuts and letters from his rulings of 2026-10-26 and 2026-10-30, and the small-size cut from the marks he kept in the 2026-10-28 round.

- **The G's top tail ends horizontal.** The G's top arc runs out into a straight horizontal segment, as in the doubled-line monogram, where it flattens into a stroke that runs into the T's bar. A diagonal, radial or hooked terminal is refused. Kevin, 2026-10-09, rejecting the third round: "make the top g tail end at a horizontal line".
- **Cuts and letters.** Every cut through the ring continues a stroke edge inside the mark or sits on the axis, and a mark whose cuts fall anywhere else is excluded everywhere (Kevin, 2026-10-26: "i hate the ones where the cuts are off placement"). Every mark carries both a G and a T (2026-10-30). The G's mouth stays small so the ring stays long.
- **The failure list.** Kevin rated the second round 5 out of 10 (2026-10-08). Every new mark refuses its first five causes, and the small-size cut below checks the last:
  - badge syndrome: a heavy outline circle with thin letters inside it;
  - one ellipse as the only depth cue;
  - a malformed G or a stick T;
  - stubs and tangencies where strokes meet;
  - grey tints in place of one ink;
  - a mark that collapses at 16px.
- **Rough rows first.** A mark round starts as rough sketches on one board: one idea per row, and each variant in a row moves one property (the stroke weight, the gap of a doubled line, where the G's arc stops, where a cut falls, the angle). Only the marks Kevin picks are rebuilt as clean SVG from geometry, each with a construction drawing. Kevin, 2026-10-27, on construction drawings: "dont need to do drawings for everything, just the good ones".
- **Reviewed in context before a pick.** Every candidate is shown on paper and on ink, at navigation size in one row with the logos of the localization products it is compared with (each from thesvg.org, as for every third-party logo), and beside the current mark at the same height. Its idea and its energy are judged at full size.
- **16 and 32 px are a separate cut.** A mark is checked at 16 and 32 px once Kevin picks it, and the small sizes above still apply to the pick. Softness at those sizes never ends a direction. In the 2026-10-28 round the marks Kevin kept had lost a judge's points to softness at 32 px.
- **Where the work lives.** Exploration marks stay as review pages until Kevin picks (`gt-explorations`). A pick enters the catalog in `src/lib/marks.ts` as a finished file under `public/marks` (next section), and is never redrawn by hand in the repository.

## The catalog and the shortlist

`src/lib/marks.ts` ends in one catalog that every surface reads: `CATALOG` (every mark as one row shape: id, name, family, file, the 16px drawing and the construction drawing where they exist, and the drawn box), `FAMILIES` (each family's name and one sentence, its anchor on `/marks`, and the day Kevin last worked on it), `SHORTLIST` (the chosen marks in page order) and `DYNAMIC_MARKS` (the marks from 2026-10-28 on). `/marks`, the marks plate on `/components` and `/docs/components/marks`, the `/brand` badge, the badge demo, the dither tiers plate and the home row read it, and none of them names a mark path of its own.

- **The shortlist.** Only marks Kevin chose, in the order of his verdicts, newest first: the logo leads, its state follows, and his other picks stay in their families. A mark joins only when Kevin says yes on one sheet beside the shortlist at 256, 64 and 32 px on paper and ink, is no weight, placement or cut variant of a shortlisted mark (the logo's state is the one exception), and keeps one ink with every cut on a stroke edge or an axis. Only Kevin removes one. Our own iterations stay local until he picks one. At most 16 marks. The logo and its state lead; after them, the next four marks are four distinct ideas (Kevin, 2026-11-08). On `/marks` the first mark takes a tile two wide and two rows tall.
- **The families.** A family takes the place of its best shortlisted mark on `/marks`; a family with none follows by the day Kevin last worked on it, newest first, and In production closes the page. A family opens with its lead on both grounds (`familyLead`: its best shortlisted mark), then its other shortlisted marks in the shortlist's order, the drawings it grew from (`opens`) and the rest (`dynamicFamily`), and a family left with no mark leaves the page.
- **Entering a mark.** `pnpm import:marks` copies finished SVGs into `public/marks/dynamic` from a manifest kept outside the repository, checks each with the mark checker (`src/lib/mark-file.ts`), writes the one canonical header (one path in `currentColor`, viewBox `0 0 256 256`, at most 8 KB) and prints the drawn box for the mark's row. The logo and its state are the one exception, named in the section on the logo above. `pnpm test:marks` (in `lint:static`) holds every row to its file.
- **Public names.** Every mark is a General Translation mark. Ids, names, notes, file headers and commit messages describe only the idea the mark draws; `pnpm test:marks` refuses generic words that name a mark's origin, and the private denylist of `pnpm lint:public` holds the specific ones.

## The name in running text

In running text the name is written out as General Translation (Kevin, 2026-11-08). A sentence never names the company with the letters GT and never sets the logo inline in place of the name. The inline mark that stood for the word from 2026-09-09 (`GtWord` on the site, `.gt-word` in the deck) was retired on 2026-11-08 and its code deleted.

- The logo stands alone: in the lockup, the header, the sidebar, the tab icon and a figure.
- "General Translation's" is the possessive. A heading that would run past two lines with the full name is reworded, never shortened to GT.
- The letters stay where they are not the name in a sentence: lowercase package and CLI names (`gt`, `gt-next`), code, URLs, file names, identifiers, hyphen-joined forms such as GT-format, letters inside a word such as GTM, a mark's own name (Graticule GT, the GT monogram) and the letters a mark draws.
- Quotes and mirrors keep their words: a quote (Kevin's words, the decisions log, the films' sources), and copy that mirrors generaltranslation.com word for word (the `/d` mirrors of the shipped site with their `GtLogoText` and the agent prompt's "General Translation (GT)", and the open-source grants callout's "GT platform credits" in the blog and Atlas, from gt-cloud #5598). A mirror changes when the shipped site changes.

## Locadex

- Files: `public/brand/locadex-mark.svg` (vector paths), `locadex-light-no-bg.svg` (a raster wrapper), `locadex-mark-dark.png` and `no-bg-locadex-logo-light.png`.
- gt-cloud draws it as `LocadexMark` in `$GT_CLOUD/packages/ui/src/components/icons/LocadexMark.tsx`.
- It follows the same rules: one color, inverted on ink, shown only where it has a function (deck slide 16).

## The speed set

On 2026-09-29 Kevin brought a race-type wordmark reference and chose seven marks in that register to show alongside the doubled-line monogram, the mark at the time: bar monogram, bar monogram lockup, plate, double cut, livery stack, bar monogram dithered and bar monogram in ASCII. Two marks from the earlier round, Two-way and Globe G, stay for comparison. The set appears on `/marks` (`src/app/marks/`, data in `src/lib/marks.ts`) and on deck slides 17 to 23. Deck slide 16 presents it as the September 2026 exploration beside the monogram. The logo chosen on 2026-11-06 is in the section on the logo above.

### The register

- **Wide letters.** Every letter is wider than it is tall: the monogram builds G and T from rectangles on a 120 unit cap, the plate sets GT in Orbitron Black, and the wordmarks set the name in Anybody at width 150.
- **A forward slant.** 12 degrees on the monogram family, 14 on the plate, the italic with a 22 degree slash on the livery stack. Double cut stands upright.
- **One cut.** One horizontal cut at mid cap height (8 units on the monogram's 120). Double cut carries two cuts at 40% and 60% of the cap height.
- **Speed bars.** Three bars of 20, 80 and 50 units lead into the G from the left, at the top arm, mid height and the bottom arm.
- **One color.** Every file is one color in `currentColor`: one path, or one masked group where the letters or the cuts are holes. The dither and the ASCII get their gray from the density of their cells.
- **Paper and ink.** The same file works positive and reversed with no redraw. The plate brings its own ground, because its letters and stripes are holes.

### The files and their sizes

| file under `public/marks` | kind | smallest use |
| --- | --- | --- |
| `bar-monogram.svg` | monogram, plain polygons in one path, no font, no mask | holds at 16px; the bars read as bars from 32px |
| `bar-monogram-lockup.svg` | the monogram over GENERAL TRANSLATION in Michroma | the name is an eighth of the lockup's height, so under about 96px use the monogram alone |
| `plate-inverted.svg` | GT cut out of a skewed plate with a hazard-striped end | avatars, badges, the CLI banner; the stripe reads from about 48px |
| `double-cut.svg` | GENERAL TRANSLATION in Anybody Black, upright, two cuts | headers, footers and sleeves; the cuts close below about 16px of cap height |
| `livery-stack.svg` | GENERAL over TRANSLATION in Anybody italics, a cut per line and one slash | large sizes only, about 48px and up |
| `bar-monogram-dithered.svg` | the monogram through the 8 by 8 Bayer screen, solid on the left third and falling to 0.18 density at the right edge; 240 by 59 cells | 59px and up, where a cell is one pixel |
| `bar-monogram-ascii.svg` and `.txt` | the same grid as 160 columns by 23 lines of `@` | a code block, a README or the CLI banner, in a monospace face only |

### Regenerating

1. Edit `scripts/build/speed-marks.mjs`. The geometry is data at the top of the script (`MONOGRAM_RECTS`, `SKEW`, `CUT`), and text becomes outlines through fontkit.
2. Run `pnpm build:marks`. It writes every file under `public/marks` and prints each size in bytes.
3. The deck inlines the marks by hand: paste each changed file's markup over the old markup in `deck/slides/17-speed-monogram.html` to `23-speed-ascii.html`, with an explicit width and height in px on the root that keeps the file's aspect. Then run `pnpm build:deck`.
4. If the presentation field changed, re-crop it for deck slide 73: `deck/shots/proto-marks-speed-light.jpg` and `proto-marks-speed-dark.jpg` are the field cropped from `/marks#presentation` at 1440 wide (memory note `speed-marks-set`). `gt-deck` covers the slide side of steps 3 and 4.

Never edit an SVG under `public/marks` by hand, and never redraw a mark inside a slide. The faces behind the set (Michroma 400, Orbitron 900, Anybody at width 150 in 900, 900 italic and 500 italic) are fetched into `public/fonts/google` by `scripts/build/fetch-google-faces.py` and exist only as outlines in the files; no page loads them.

## The dithered shimmer

The one sanctioned flourish on a mark is the Bayer specular shimmer, `DitheredMark` in `src/app/d/toolchain/diagrams/DitheredMark.tsx` (mirrored in `$GT_CLOUD/apps/landing/src/components/landing/shared/DitheredMark.tsx`). The mark keeps its alpha mask, and a band quantized by the 4 by 4 Bayer matrix sweeps through it by horizontal translate; under reduced motion or without JS the markup poses with the band mid-glyph. Its tiers, its counter-sheen and the driver are documented in `gt-diagrams` (`references/isometric.md` section 6), which owns the component.

## Third-party logos

Kevin's source for third-party brand marks is thesvg.org (the GLINCKER/thesvg catalogue, more than 7,400 marks).

- Catalogue: `https://thesvg.org/api/registry.json` (slug, title, aliases, categories, hex, license, url, variants).
- Files: `https://thesvg.org/icons/{slug}/{variant}.svg`, or `https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/{slug}/{variant}.svg`. Variants are usually default, mono, light, dark and wordmark.
- Inline the chosen file as a component. Never add `@thesvg/react` (84 MB unpacked) or the `thesvg` data package.
- In gt-cloud each mark is a default-exported `*Logo.tsx` in `$GT_CLOUD/packages/ui/src/components/icons/` drawn on the shared `BrandMark` root (`BrandMark.tsx`, which exports `BrandMarkProps`): `aria-hidden` unless a `title` is given, `variant` `brand` or `monochrome`, hex fills allowlisted per file for gt-ui `no-hex-colors`. Namespace any mask or filter ids with `useId`.
- Picks that read at 16px in both themes: `openai/light` in currentColor, `gemini/default`, `claude/default`, `grok/default` in currentColor, `deepseek/default`, `mistral/default`.
