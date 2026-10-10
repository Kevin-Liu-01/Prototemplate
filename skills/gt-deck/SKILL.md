---
name: gt-deck
description: >-
  How the General Translation brand deck in Prototemplate's deck/ folder is
  built and edited: the 1600 by 900 sheet, the Inter type sizes and color
  tokens, the layout classes, icons from the Heroicons 20 solid sprite,
  diagrams, openers and mood slides as artifact pictures, the speed mark
  slides, slide-scoped CSS, both themes, the build and shoot scripts, the
  registries a new slide touches, what counts as a defect, and how any GT
  presentation's story is written. Use when adding or editing a slide,
  rebuilding or checking the deck, reviewing a slide lane's work, writing
  another GT presentation, or borrowing the deck's grammar for another
  surface.
metadata:
  title: Brand deck
  areas: aesthetic, graphics
  updated: 2026-10-08
  origin: prototemplate
---

# Brand deck

The brand deck is the General Translation identity in 93 slides. Its source is the `deck/` folder of the Prototemplate repository, and `pnpm build:deck` turns it into one viewer page, with its pictures as files beside it, that prototemplate.com/deck serves. Kevin judges product surfaces against it (2026-09-25) and had Prototemplate's viewer shell built from its viewer (2026-09-08), so every slide meets the grammar below in both themes before it ships.

Paths are relative to a Prototemplate checkout (`$PROTOTEMPLATE`). The two scripts in `scripts/` read that checkout: from its root they need no flag, and from an installed copy of this skill they take `--root <checkout>` or the `PROTOTEMPLATE` variable. The deck's own written grammar is `deck/DECK-GRAMMAR.md`; this skill distils it with the head CSS, the scripts and Kevin's directives. Detail lives in `references/full-picture-slides.md` and `references/viewer-and-build.md`.

## 1. Files and ownership

| Path | Holds | Who edits it |
| --- | --- | --- |
| `deck/parts/head.html` | the tokens, the slide and viewer CSS, the icon sprite, the GT mark symbol, the viewer markup up to the stage | locked unless the brief says otherwise |
| `deck/parts/tail.html` | `SECTIONS`, the surfaces panel, the help card, the viewer script, the mood picture engine | locked unless the brief says otherwise |
| `deck/slides/NN-slug.html` | one slide per file | the lane assigned that slide |
| `deck/shots/` | captures, crops and opener images; `thumb/` for the surfaces panel; `tone/` for the mood grids and `manifest.json`; `OPENERS.md` and `DETAILS.md` | a round assigned pictures |
| `deck/fonts/deck-fonts.css` | the inlined Inter | nobody without a type decision |
| `deck/DECK-GRAMMAR.md` | the grammar agents read before touching a slide | the deck owner |
| `deck/shoot-slide.mjs`, `deck/assemble.mjs` | the shooter, and the assembler it shares with the build (`SLIDE_COUNT`) | the deck owner |
| `scripts/build/deck.mjs` | the build to `public/brand-deck.html` and its pictures under `public/deck-assets` | the deck owner |
| `deck/preview/`, `deck/tmp/` | renders and temp files, gitignored | anyone |

- A slide file is exactly one `<section class="slide ..."><div class="in"> ... </div></section>` preceded by an HTML comment that names the slide. It carries no `<script>`; the build refuses one.
- The checkout is often shared, and another session may own `deck/` and push to main from its own worktree. Read `git status` and `git log -- deck/` first, edit only the slides you were assigned, stage files by name, and leave `head.html`, `tail.html` and the registries in section 12 to the integrator unless the brief hands them to you.
- The build, the shooter and the assembler read only file names that match `^\d\d-.*\.html$`, in sorted order. A slide's number everywhere (the counter, the hash, `shoot-slide.mjs`, `SECTIONS`, `DECK_SLIDES`) is its position in that order. The prefixes 37 and 54 have been unused since two mood slides were retired on 2026-10-05, so after slide 36 the prefix runs ahead of the position: `38-motion.html` is slide 37 and `95-closing.html` is slide 93.
- A new slide takes a free two-digit prefix that sorts it into place. An interim name such as `12a-slide.html` does not match the pattern: the shooter skips it silently and the build fails its count. When no prefix is free, renumber the files after the insertion point. A prefix past 99 needs the pattern changed in the build, the shooter, the assembler and `check-deck.mjs`.

## 2. The sheet

- The sheet is 1600 by 900 px. The viewer scales it to the window, so nothing in a slide depends on the window size.
- The viewer draws two vertical rails 56 px in from the left and right edges, two horizontal rules 56 px in from the top and bottom, and an 11 px registration cross where they meet, in `--hair` with the crosses in `--cross`. A slide never draws them.
- `.slide` is inset 57 px on every side and padded 72 px top and bottom and 80 px left and right. The usable area inside `.in` is 1326 by 642 px, from x 137 to 1463 and y 129 to 771 on the stage.
- Nothing may leave the sheet, and text must not touch a rail or a rule.
- The wordmark (the GT mark at 28 by 18, bottom left) and the counter (13 px titanium, bottom right) sit in the bottom margin. Leave them alone. Full-picture slides put solid paper chips under them.

## 3. Type

- Inter is the only typeface (Kevin, 2026-09-09: "replace all switzer with inter, dont really need switzer anymore"). `--display` and `--text` both resolve to `'Inter'`, which `deck/fonts/deck-fonts.css` registers as the rsms InterVariable roman, the same file as `public/fonts/InterVariable.woff2`, at weights 100 to 900. `body` sets `font-optical-sizing: auto`, so large headings take the display optical size from the font's opsz axis.
- No italic face is inlined. Do not set italic or `<em>` on the sheet; the browser would slant the roman.
- `h1`, `h2` and `.big` share one rule in `head.html`: weight 500, `letter-spacing: -0.025em`, `text-wrap: balance`, `font-feature-settings: 'cv11', 'ss01'`. Slide CSS does not restate the features or the tracking. No other rule sets `font-feature-settings`; the counter, the swatch values and the viewer's numbers take tabular figures through `font-variant-numeric: tabular-nums`.
- Weight 500 is the ceiling for display text and for `<b>`, and running text is 400 (BRAND.md section 6). The one exception is the specimen on the Typography slide (`27-type.html`), which shows Inter from 300 to 800 as samples.

| Element | Size | Line height | Notes |
| --- | --- | --- | --- |
| `h1` | 88 px | 1.02 | title slides |
| `h2` | 44 px | 1.1 | the slide heading, 18 px below it |
| `.big` | 72 px | 1.06 | opener titles and single statements |
| `p` | 22 px | 1.5 | 18 px between paragraphs |
| `.lead` | 26 px | 1.45 | an opening paragraph |
| `.cap` | 15 px | 1.45 | captions and credits, titanium |
| `.rows > div` | 20 px | 1.45 | keys in `<b>` at 500 and -0.01em |
| `.plain` | 24 px | 1.4 | display list at 500 and -0.01em |
| `.pair figcaption` | 16 px | 1.45 | ink-2 |
| `.scale` labels | 18 px | | ink-2 |
| `svg.dia text` | 20 px | | ink-2 |
| `svg.dia .lab` | 26 px | | ink, 500, -0.01em |
| `svg.dia .sm` | 18 px | | the SVG floor |
| `.panel` | 17 px | 1.7 | monospace on the code panel |

- Text under 15 px on the sheet is a defect, and SVG text is never under 18 px. Apart from the viewer's own counter at 13 px, the only sheet text `head.html` sets under 15 px is the `small` notes in `.lang` (Scripts) and `.ladder` (Type scale) at 14 px; do not copy them.
- Measures: `.max` is 32ch and `.max-p` 56ch. `.muted` sets ink-2.

Copy on the sheet follows the deck's register, and gt-voice holds the full writing rules:

- Headings are plain nouns or plain statements in sentence case with no trailing period. Proper nouns keep their capitals (General Translation, Prototemplate, Glyphfield, Locadex), and product tokens keep their exact form (gt-next, gt, npx, CLI, API) and never start a heading. A heading names the thing; a domain such as prototemplate.com goes in the body. Title Case appears only on buttons.
- Body copy is full sentences with periods, captions included. No metaphors, no "X, not Y" pairs, no fragment rhythm, no headings with a comma tail, no em dashes, no exclamation marks, no eyebrow labels above headings.
- Every standalone GT in rendered copy is the mark (Kevin, 2026-09-09: "replace any mention of GT in text with logo"): `<span class="gt-word"><svg aria-hidden="true"><use href="#gt-mark"/></svg><span class="sr">GT</span></span>`. Package names, code, URLs, attributes and document titles keep the letters.
- The `#gt-mark` symbol carries its own viewBox (`-8 214 1213 771`). Reference it from an `<svg>` that has a width and height in the mark's aspect (about 1.573, for example 132 by 84) and no viewBox. Copying the symbol's viewBox onto the outer svg renders the mark 214 units too high and cuts off its top.

## 4. Color

| Token | Light | Dark |
| --- | --- | --- |
| `--paper` | `#ffffff` | `#070707` |
| `--ink` | `#070707` | `#f2f2f0` |
| `--ink-2` | `#3a3d44` | `#b9bcc3` |
| `--titanium` | `#8a8f98` | `#8a8f98` |
| `--hair` | ink at 18% | `#f2f2f0` at 22% |
| `--hair-soft` | ink at 9% | `#f2f2f0` at 10% |
| `--plate` | ink at 3.5% | `#f2f2f0` at 5% |
| `--cross` | ink at 38% | white at 34% |
| `--edge` | ink at 62% | `#f2f2f0` at 55% |

- Slides use only these variables. On the sheet, hard-coded colors exist only in the `.swatch`, `.panel` and `.ic` hue rules in `head.html`, and in the reference-logo plates on The name (`15-naming.html`), which `check-deck.mjs` reports as warnings.
- No accent color on text, lines or fills anywhere in the deck. The brand accent appears only as an outlined, labeled swatch on the Color slide.
- Semantic color lives only on icons: `.ic.ok` green `#12a37a` for done or passing, `.ic.warn` amber `#f0a020` for open or in review, `.ic.no` red `#e5484d` for excluded or rejected, `.ic.info` GT blue `#2f5ce0` for GT itself. The four hues are the same in both themes, and text and lines stay monochrome. Kevin asked for them on 2026-09-09: "use more colorful stuff like green check marks or other icons across tables and other kind of sparse, just text slides".
- Code sits on `.panel`: `#101010` in both themes, white monospace, with a `--hair` border in dark. Nothing else on the sheet uses monospace. The ASCII monogram on slide 23 draws its @ characters in a monospace stack because it is a pasted mark.
- `--mood-ink` and `--mood-opacity` belong to the artifact picture standard. `scripts/lint/pictures.mjs` holds their values, so a slide never sets them.

## 5. Layout classes

All are defined in `head.html`; check there before writing slide CSS.

| Class | What it does |
| --- | --- |
| `.center` | a centered block over the whole content box |
| `.left-mid` | left aligned, vertically centered |
| `.split` | `.head` above `.body` with a 56 px gap; `.body` fills the rest and centers its content (`.body.end` aligns it to the bottom) |
| `.cols` | two columns at 5fr and 7fr with a 72 px gap, centered vertically; `.cols.even` is 1fr and 1fr, `.cols.wide-right` 4fr and 8fr |
| `.stack` | a vertical flex with a 22 px gap |
| `.rows` | a ruled key and value table; `--key` sets the key column (default 240 px, `.rows.narrow` 180 px), `.rows.tight` pads 14 px; two lines per value at most |
| `.plain` | a ruled list of statements at 24 px; `.no` strikes a line through in titanium |
| `.pair` | two figures side by side with captions and a 28 px gap |
| `.shot`, `.shot.fit`, `.shot-wrap` | a bordered screenshot, one that fits its box, and a wrapper that centers one in the space left |
| `.scales`, `.scale` | slider rows: a 150 px label, a hairline track with an 11 px ink marker, a 150 px label |
| `.spec`, `.lang`, `.ladder` | the type specimen, the multilingual grid and the type ladder |
| `.swatches`, `.swatch` | color plates, the only place the deck shows more than two tones |
| `.refs` | a two-column reference list |
| `.say` | two quoted registers side by side (defined, unused on 2026-10-05) |

- Lists are ruled rows. The deck has no bullets.
- No cards with shadows, no rounded corners, no gradients, no icon fonts.
- Columns align, gaps in a pair are equal, and a slide never leaves one column empty while the content crowds the other.

## 6. Icons

- Icons are Heroicons 20 solid from the sprite in `head.html` (63 glyphs on 2026-10-05), written as `<svg class="ic ok" aria-hidden="true"><use href="#i-check-circle"/></svg>`. Use `ok`, `warn`, `no` or `info` for the four hues, or no color class for a monochrome category glyph.
- An icon sits only in a key cell (`.rows > div > b`, or the key cell of a slide's own ruled table) or at the start of a `.plain` row. An icon inside a sentence is a defect. It is 20 px on 20 px rows with 10 px before the label, and 24 px on 24 px display lists with 12 px. A key that wraps keeps its second line under the label; the hanging indent in `head.html` does this.
- `.ic.ext` is the 16 px titanium external glyph (`#i-arrow-top-right-on-square`) that follows a link in a table.
- To add a glyph, run `node skills/gt-deck/scripts/heroicon-symbol.mjs <name>`. It prints the `<symbol id="i-name" viewBox="0 0 20 20">` from `@heroicons/react` 20 solid in the checkout, or reports that the sprite already has it.
  - A lane allowed to edit `head.html` adds the symbol to the sprite.
  - A lane that is not defines it in its own slide inside `<svg width="0" height="0" style="position:absolute" aria-hidden="true">`, with a comment saying it waits for the sprite, as `93-fixed-points.html` does for `i-lock-closed`. When the sprite gains the glyph, delete the slide's copy; the script names such copies. Symbol ids are global across the assembled deck.

## 7. Diagrams

- A diagram earns its place only when it shows a relationship the text alone does not. A slide of five clean statements stays a list, and a diagram that restates a list in boxes is a defect.
- Draw inline: `<svg class="dia" viewBox="0 0 W H">`, width 100%, `overflow: visible`. Size the viewBox to the width it renders at where you can, so 20 px labels and 1 px strokes stay 20 px and 1 px on the sheet; the Diagrams slide draws its four examples in 300-unit boxes at 300 px.
- Strokes take `class="ink"`, `"mid"` (ink-2) or `"hair"`, at `stroke-width` 1 or 1.5, with square caps and no rounded joins.
- Fills are `var(--ink)`, `var(--paper)` or `var(--plate)`. Isometric faces are ink at fill-opacity 0.04 on top, 0.09 on the left and 0.15 on the right, lit from the upper left.
- Labels are `<text>` in the same SVG at 20 px in ink-2, or `.lab` at 26 px in ink at weight 500, with `.sm` at 18 px as the floor. They stay horizontal and 12 px clear of any line.
- An 11 px filled ink square marks a value on a scale or a step on a flow. Draw no arrowheads: direction comes from reading order, a marker or a short perpendicular tick. DECK-GRAMMAR.md still allows a filled triangle up to 8 px, the Diagrams slide states the stricter rule, and no slide draws one.
- Links between objects use the doubled connector, and flows, axes and scales use one 1 px line. Registration crosses and hairline grids may appear inside a diagram where they carry its structure; a decorative one is a defect.
- Good subjects: a flow of three to six steps, a before and after pair, a scale or axis, a stacked layer model, a grid or ladder, a timeline.
- gt-diagrams holds the doubled connector's construction and the wider diagram method, and gt-isometric the 30 degree projection.

## 8. Pictures

- A slide lane adds no image files. A new visual is inline SVG. New captures, crops and pictures come from a round that is assigned them, through the pipelines recorded in `deck/shots/OPENERS.md` and `docs/ARTIFACT-PICTURES.md`.
- A screenshot names its light file in `src` and its dark twin in `data-dark`, for example `<img class="shot" src="shots/<name>-light.jpg" data-dark="shots/<name>-dark.jpg" alt="...">`. Page twins are `site-<page>-{light,dark}.jpg`, 1440 wide from 2x captures. Detail crops are `detail-<name>-{light,dark}.jpg` at native 2x pixels. `proto-*` and `glyph-*` files are Prototemplate and Glyphfield captures. A screenshot is never stretched or cropped through content, and it keeps its 1 px `--hair` border.
- Section openers (eight) are two-tone shader dithers or gem smoke renders behind a lower-left plate: the section name in `.big`, one sentence that starts "This section covers", and a credit.
- Mood slides (ten) are artifact pictures. Each is a tone grid on a `<canvas class="mood-img" data-tone="...">`, screened live by the viewer at 1 CSS px cells, behind a lower-right plate with the picture's title at 44 px, one or two sentences on why it is in the deck, and the credit.
- A mood slide follows a dense content slide, and at least one content slide separates it from the next opener.
- The ramp on the Dither slide is a `canvas.dither` that the viewer redraws per theme at 2 px cells.
- `references/full-picture-slides.md` has the markup, the plate geometry, the credit formats, the image rules and the steps for adding a mood picture.

## 9. Speed marks

Slides 17 to 23 present the seven race-type marks Kevin chose on 2026-09-29. Each slide pastes its file from `public/marks`, and The lockup also pastes `bar-monogram.svg` at 375, 187 and 94 px on a paper and an ink ground:

| Slide | File |
| --- | --- |
| 17 The bar monogram | `bar-monogram.svg` |
| 18 The lockup | `bar-monogram-lockup.svg` |
| 19 The plate | `plate-inverted.svg` |
| 20 Double cut | `double-cut.svg` |
| 21 Livery stack | `livery-stack.svg` |
| 22 The dithered monogram | `bar-monogram-dithered.svg` |
| 23 The monogram in ASCII | `bar-monogram-ascii.svg` |

- Paste the file's `<svg>` whole and add `width` and `height` in px before `xmlns`, keeping the viewBox's aspect. The monogram is 1100 by 282 for its 499.6 by 128 viewBox. The files fill with currentColor, so a mark takes the slide's ink in both themes.
- A mark is never redrawn or edited by hand in a slide. To change one, edit `scripts/build/speed-marks.mjs`, run `pnpm build:marks`, paste the new markup over the old, re-crop the marks page capture for Skills and marks (slide 71, `deck/shots/proto-marks-speed-*.jpg`), and rebuild the deck.
- `check-deck.mjs` fails when any mark pasted on these slides differs from every file in `public/marks`, and warns when a size breaks the file's aspect.

## 10. Slide-scoped CSS

- A rule that `head.html` lacks goes in a `<style>` that is the first child of the slide's `<section>`. Every selector starts with a class you add to that section: `<section class="slide s08">`, then `.s08 .track { ... }`. An unscoped rule reaches every slide and every thumbnail.
- A rule meant for the stage copy only, such as the openers' paper chips, starts `#stage > .<class>`, because the thumbnails clone slides without the viewer chrome.
- The scope class is a name. It does not track the slide's position, and renumbering never renames it (`.s19a` is the Diagrams slide at position 33). Search the slides for a class before you take it.
- Openers share one `.s-opener` block and mood slides one `.s-mood` block, repeated in each file. Keep the copies identical; `check-deck.mjs` warns on a copy that drifts.
- Slide CSS uses the tokens and obeys the 15 px floor. It does not restate the heading rule, the features or the tracking. The thumbnails drop every `id`, so style by class.
- `check-deck.mjs` fails on any selector that does not start with a class on its section.

## 11. Both themes

- Check every slide in light and dark. Dark is a token remap, so a slide built only from the tokens follows it.
- An `<img>` that shows a page or a crop takes a `data-dark` twin when one exists in `shots/`. Without one it keeps its 1 px `--hair` border, so a light capture reads as a plate on the dark ground.
- The deck opens dark when no theme is stored and never reads `prefers-color-scheme`. The D key and the site's theme button flip it. The viewer then swaps every `data-dark` image and redraws the dither ramps and the mood canvases.
- Look in dark for an ink swatch or plate that vanishes into the ground, a hard-coded color, a light capture without its border, and titanium text that loses contrast.
- `references/viewer-and-build.md` has the theme mechanics.

## 12. Build and check

```sh
node deck/shoot-slide.mjs 8 15                        # positions 8 and 15, light and dark, into deck/preview
node deck/shoot-slide.mjs all                         # every slide
node skills/gt-deck/scripts/check-deck.mjs --titles   # registries, structure, scoping, marks; writes nothing
pnpm build:deck                                       # public/brand-deck.html, public/deck-assets and public/shots/deck
pnpm lint:pictures                                    # the mood grids, slides and the built deck's grids
pnpm lint:lines:shell                                 # the line audit, /deck included, against the dev server on 3005
node scripts/lint/lines.mjs --shell --only /deck --width 1440 --theme dark   # the deck alone, about 45 s
```

- Shoot after every edit and look at both JPEGs. The shooter prints elements that overflow the sheet and any page error; it does not see a label on a line, text touching a rail, or an empty half-slide.
- Run `check-deck.mjs` before a commit. It exits 1 on an error.
- Commit `public/brand-deck.html` and `public/deck-assets/` with the slides. The page is the file `/deck` serves, `pnpm build` runs `lint/pictures.mjs` against it and its grid files, and the line audit reads it.
- `references/viewer-and-build.md` covers the build's image files and lazy loading, its macOS and Pillow requirements, the `deck/tmp/shots` symlink, the shooter's Chromium path, and the size-limited artifact copy.

When a slide is added, removed, retitled or moved, these places restate it:

| Place | What changes |
| --- | --- |
| `deck/assemble.mjs` | `SLIDE_COUNT` |
| `deck/parts/head.html` | the `#bar-total` count in the toolbar |
| `deck/parts/tail.html` | `SECTIONS`: each opener's position and the section's name |
| `src/lib/search-index.ts` | `DECK_SLIDES`, the titles in order as the viewer reads them (the first `h1`, `h2` or `.big`), and the two comments that state the count |
| `src/app/brand/page.tsx` | the "93-slide slideshow" sentence |
| `README.md` | the `/deck` route line (it read 52 on 2026-10-05) |
| `public/llms.txt` | the Deck line (it read 52 on 2026-10-05) |
| `deck/shots/OPENERS.md` | the opener or mood entry and a history line |
| the section's opener | its "This section covers" sentence |

`check-deck.mjs` verifies the first six rows and the OPENERS.md entries, and warns on a stale count in README.md or llms.txt. `--titles` prints every slide's position, file, kind and title, in the order `DECK_SLIDES` takes them. A mood picture also touches `scripts/media/mood-tone` and the files listed in `docs/ARTIFACT-PICTURES.md` under "Adding a picture".

## 13. What a defect is

- Overflow past the sheet, or text in the margins or touching a rail or rule.
- Text under 15 px on the sheet, or SVG text under 18 px.
- A label crossing a line, or closer than 12 px to one.
- Misaligned columns, unequal gaps in a pair, or an empty half-slide.
- A slider marker or chart mark that does not match its value, or numbers that contradict another slide.
- A screenshot that is stretched or cropped through content, or a light capture on the dark ground without its border.
- Low contrast in either theme.
- Color on text or lines, an accent outside the swatch, monospace outside `.panel`, bullets, shadows, rounded corners or gradients.
- An icon inside a sentence, or an icon from outside the sprite's set.
- A heading with a period, a comma tail, Title Case, or a product token as its first word; a metaphor, an "X, not Y" pair, an em dash or an exclamation mark in the copy.
- A picture's lit cells under its plate, two full-picture slides in a row, or a mood picture with plain English prose on it.
- An unscoped rule, a hand-edited speed mark, or a registry in section 12 that disagrees with the slides.

## Writing a presentation

These rules hold for any GT presentation, the brand deck included. Kevin set them as how presentations are written for people (2026-07-29 and 2026-10-05).

1. **Plan in text first.** Write the narrative as text, and each slide's text with a description of its diagram, before building slides.
2. **Each slide stands alone.** A reader understands it in isolation and from first principles. It has a reason to exist and connects to the slide before it. Kevin, 2026-10-05: "slides have to propelry tie into each other and have a reason for existing".
3. **Introduce before relying.** An idea (testing several models, a metric, a term) is introduced before a slide depends on it. Jargon labels and derivations left unexplained read as rookie mistakes.
4. **Open with the approach.** Start with how the brief was approached, then how the scope grew.
5. **Go back when the old style read better.** If an earlier presentation style read better, return to it. Keep openers Kevin liked as separate slides: the dither-on-shader openers stayed beside the photo openers (2026-09-09).
6. **The viewer.** A presentation runs in a real viewer: a sidebar of every slide, present mode on its own screen, centered slides at every window size. `references/viewer-and-build.md` (What Kevin expects of a viewer) lists the rest.

## Borrowing the grammar for another surface

Kevin judged the first dashboard, onboarding and auth pass against the deck on 2026-09-25: "this is bad, it does not feel like our style and is too busy, not intuitive, kerning needs to be adjusted, no ugly border lines, it needs to follow the principles of contrast better ... check this out: prototemplate.vercel.app/deck". The corrective grammar took these from `head.html`:

- the tokens in section 4, with the dark theme as a remap;
- the type ladder with tracking on Inter's curve: headings at -0.025em with cv11 and ss01, smaller headings closer to zero, running text at 0, and small counters slightly positive;
- weight 500 as the ceiling;
- one rule per seam and ruled rows, with no boxed tiles, shadows, chevrons or eyebrow labels.

The rails, the rules and the registration crosses belong to the 1600 by 900 sheet; crosses floating in the app were among what read as wrong in that pass. Icons and dither material follow the host repository. gt-cloud's gt-ui lint accepts only Heroicons 24 solid and 16 solid for meaning and Lucide for controls (`tooling/oxlint-plugins/gt-ui.ts`), so the deck's 20 solid sprite stays in the deck, and the dashboard's dither comes from the landing hero's studio field. gt-aesthetic holds Kevin's verdicts across surfaces.

## Review checklist

- [ ] Only the assigned slide files changed, or the brief named the shared files.
- [ ] Each slide file is one `<section class="slide ...">` with its name comment, a scoped `<style>` if any, and no `<script>`.
- [ ] Type uses the head classes; nothing under 15 px; no weight above 500 outside the Typography specimen; no italic; no restated features or tracking.
- [ ] Color comes from the tokens; semantic hues appear only on icons; code sits on `.panel`.
- [ ] Lists are ruled rows; icons sit only in key cells or at the start of `.plain` rows.
- [ ] A diagram shows a relationship, follows section 7, and keeps labels horizontal and 12 px clear.
- [ ] No new image files outside an assigned picture round; screenshots carry `data-dark` twins or their border.
- [ ] Copy reads as plain technical English: sentence-case headings without periods, full sentences, the GT word as the mark.
- [ ] `node deck/shoot-slide.mjs N` shows no overflow and no page error, and both JPEGs were looked at.
- [ ] `node skills/gt-deck/scripts/check-deck.mjs` exits 0, with every registry in section 12 updated for an added, moved or retitled slide.
- [ ] `pnpm build:deck` ran, `public/brand-deck.html` and `public/deck-assets/` are staged with the slides, and `pnpm lint:pictures` passes.
- [ ] A new presentation was planned in text first, each slide stands alone and ties to the one before it, and every idea is introduced before a slide relies on it.

## Related skills

gt-voice (the writing rules the copy follows), gt-diagrams and gt-isometric (diagram construction), gt-dither and gt-graphics (the Bayer screen and the artifact picture standard behind the mood slides), gt-brand (the identity the deck presents, and the Inter rules for every other surface), gt-aesthetic (Kevin's verdicts across surfaces), gt-lints (the line audit and the picture lint), prototemplate (the repository and its shell). From the wiki: agent-browser for driving the viewer in a browser, create-graphics, design-engineering-polish.

## Sources

- Prototemplate: `deck/DECK-GRAMMAR.md`; `deck/parts/head.html` (tokens, type, layout classes, sprite, `.gt-word`); `deck/parts/tail.html` (`SECTIONS`, `titleOf`, `cloneSlide`, the mood engine, the theme); `deck/shoot-slide.mjs`; `deck/assemble.mjs`; `scripts/build/deck.mjs`; `deck/shots/OPENERS.md`; `deck/ROUND-5.md`; `deck/fonts/deck-fonts.css`; `src/lib/search-index.ts` (`DECK_SLIDES`); `next.config.ts` (the `/deck` rewrite); `src/app/brand/page.tsx`; `README.md` and `public/llms.txt` (the /deck lines); `docs/ARTIFACT-PICTURES.md`; `BRAND.md` section 6; `DESIGN.md` sections 2 ("Line law for chrome"), 6 and 7; `deck/slides/17-speed-monogram.html` to `23-speed-ascii.html`, `27-type.html`, `33-diagrams.html`, `93-fixed-points.html`; `scripts/lint/lines.mjs` (the `--shell` audit of /deck).
- gt-cloud: `tooling/oxlint-plugins/gt-ui.ts` (the Heroicons sets the icon tiers accept).
- Memory notes: `gt-brand-deck`, `speed-marks-set`, `prototemplate-interface-system`, `dashboard-deck-grammar`, `artifact-picture-standard`.
- Kevin's presentation rules: 2026-07-29 and 2026-10-05 (plan in text, each slide stands alone, introduce before relying; the 2026-10-05 rules came from a personal-project deck and Kevin framed them as how presentations are written), 2026-09-08 and 2026-09-09 (the viewer: "make this much better like a real presentation viewer with a sidebar of all slides", "the present screenn should be separate", centered slides, the openers).
- Kevin's directives: 2026-09-08 (the deck as a minimal black and white slideshow in the brand font, and the viewer as the interface for Prototemplate); 2026-09-09 (semantic icons, the GT word as the mark, Inter only, full-picture slides, the openers on better images); 2026-09-25 (the dashboard judged against the deck); 2026-09-29 (the speed mark set); 2026-10-05 (no plain English prose on artifact pictures).
