# GT brand deck: grammar and working rules

The deck is a single self-contained HTML file. Source lives in this directory:

- `parts/head.html`: tokens, slide CSS, viewer CSS, viewer markup up to the stage. Do not edit unless told to.
- `slides/NN-slug.html`: one file per slide, in order. Each file is exactly one `<section class="slide"><div class="in"> ... </div></section>` preceded by an HTML comment naming the slide. Edit only your assigned slide files.
- `parts/tail.html`: closing markup, surfaces panel, help, script. Do not edit.
- `node shoot-slide.mjs 8 15` renders slides 8 and 15 to `preview/s08-light.jpg`, `preview/s08-dark.jpg`, and so on, and prints any element that overflows the 1600x900 sheet. Safe to run concurrently. Look at both themes after every edit.
- `shots/` holds the screenshots and images that slides reference with `src="shots/name.jpg"` and optional `data-dark="shots/name-dark.jpg"`. The build inlines them later. Do not add new image files; use inline SVG for any new visual.

## The sheet

- 1600 x 900. Two vertical rails at 56px from the left and right edges, two horizontal rules at 56px from the top and bottom, registration crosses where they meet. These are drawn by the viewer; a slide never redraws them.
- `.slide` is inset 57px on every side and padded 72px top and bottom, 80px left and right. The usable area is therefore about 1326 x 642. Nothing may leave the sheet. Text must not touch the rails or rules.
- The wordmark sits at the bottom left, the slide counter at the bottom right, both inside the bottom margin. Leave them alone.

## Type

- Everything is set in Inter (`--display` and `--text` both resolve to Inter). Headings use weight 500 at most. Never bold beyond 500 for display text; `<b>` inside rows and scales is weight 500.
- Sizes: `h1` 88px, `h2` 44px, `.big` 72px, `p` 22px at line-height 1.5, `.lead` 26px, `.cap` 15px in titanium, `.rows` 20px. SVG labels: 20px in `--ink-2` minimum, `.lab` 26px in ink; never smaller than 18px (`.sm`). Text below 15px on the sheet is a defect.
- Headings have no trailing period. Sentences in body copy do. Headings are plain nouns or plain statements, sentence case.
- Copy register: straight technical English. No metaphors, no "X, not Y" contrast pairs, no fragment rhythm, no noun-phrase-with-comma-tail headings, no em dashes, no exclamation marks, no eyebrow labels above headings. Full sentences even in captions. Title Case only for button labels.
- Switzer exists only inside the type specimen slide (15) to show the site's display face. Nowhere else.

## Color

- Light: paper `#ffffff`, ink `#070707`, ink-2 `#3a3d44`, titanium `#8a8f98`, hairlines at 18% and 9% ink, plate at 3.5% ink. Dark is a token remap (paper `#070707`, ink `#f2f2f0`). Use only the CSS variables `--paper`, `--ink`, `--ink-2`, `--titanium`, `--hair`, `--hair-soft`, `--plate`, `--cross`, `--edge`. Never hard-code a color except inside the swatch and code-panel rules that already exist.
- No accent color on text, lines, or fills anywhere in the deck. The brand accent is only ever shown as an outlined, labeled swatch.
- Semantic color appears only on icons: green for done or passing, amber for open or in review, red for excluded or rejected, GT blue for GT itself; text and lines stay monochrome. The four hues (`#12a37a`, `#f0a020`, `#e5484d`, `#2f5ce0`) are the same in both themes.
- Code sits on the `#101010` panel (`.panel`) in white monospace. Nothing else uses monospace.

## Layout classes (already defined in head.html)

- `.center` centered block. `.left-mid` left, vertically centered. `.split` head above body with a 56px gap; `.split > .body` fills and centers its content. `.cols` two columns 5fr/7fr with 72px gap, `.cols.even` 1fr/1fr, `.cols.wide-right` 4fr/8fr. `.stack` vertical flex with 22px gap.
- `.rows` ruled key/value table, `--key` sets the key column (default 240px), `.rows.tight` 14px padding, `.rows.narrow` 180px key. Two lines per value at most.
- `.pair` two figures side by side with captions. `.shot` bordered screenshot, `.shot.fit` fits its box. `.shot-wrap` centers a shot in the remaining space.
- `.scales` / `.scale` slider rows (150px label, track, 150px label). `.spec` type specimen. `.lang` multilingual grid. `.ladder` type ladder. `.swatches` / `.swatch` color plates. `.plain` ruled statement list (`.no` strikes a line through). `.refs` two-column reference list. `.say` two quoted registers.
- Lists are ruled rows, never bullets. No cards with shadows, no rounded corners, no gradients, no icons from icon fonts.
- Icons are Heroicons 20 solid from the sprite in `parts/head.html`, written as `<svg class="ic ok" aria-hidden="true"><use href="#i-check-circle"/></svg>` with `ok`, `warn`, `no`, or `info` for the four semantic colors and no color class for a monochrome category glyph. An icon sits only in a key cell (`.rows > div > b`) or at the start of a `.plain` row, never inside a body sentence: 20px on 20px rows, 24px on 24px display lists, one gap before the label, and a key that wraps keeps its second line under the label. `.ic.ext` is the 16px titanium external glyph that follows a link in a table. A glyph missing from the sprite is added as a `<symbol id="i-name" viewBox="0 0 20 20">` from heroicons `optimized/20/solid`.

## Diagrams

- Inline `<svg class="dia" viewBox="0 0 W H">`, width 100%, `overflow: visible`. Strokes: `class="ink"` (1px ink), `class="mid"` (ink-2), `class="hair"` (hairline); use `stroke-width="1"` or `1.5`, square caps, no rounded joins. Fills only `var(--ink)`, `var(--paper)`, `var(--plate)`. No arrowheads with filled triangles larger than 8px; prefer a short perpendicular tick or a small filled square marker (the deck uses 11px squares on the scales).
- Labels are `<text>` in the same SVG at 20px (`--ink-2`) or `.lab` 26px (ink). Keep labels horizontal. Give every label at least 12px of clearance from a line.
- Registration crosses and hairline grids may appear inside diagrams as structure; nothing decorative.
- Good subjects: flows with three to six steps, a before/after pair, a scale or axis, a stacked layer model, a grid or ladder, a timeline. Bad subjects: anything that restates a list in boxes with no relationship shown.
- A diagram earns its place only when it shows a relationship the text alone does not. If a slide is a clean list of five statements, leave it as a list.

## Slide scoped CSS

If a slide needs a rule that head.html does not have, put a `<style>` element as the first child inside that slide's `<section>` and scope every selector with a unique class you add to the section, for example `<section class="slide s08">` and `.s08 .track { ... }`. Never write unscoped rules.

## Dark mode

- Every slide is checked in both themes. Screenshots used as `<img>` should have a `data-dark` twin where one exists in `shots/`; otherwise they keep a 1px `--hair` border so a light screenshot reads as a plate on the dark ground.
- Canvas dithers redraw per theme automatically.

## What a defect is

Overflow past the sheet or into the margins; text under 15px; a label crossing a line; misaligned columns; a slider marker or chart mark that does not match its value; contradictory numbers between slides; a screenshot that is stretched or cropped through content; unequal gaps in a pair; low contrast in either theme; empty half-slides where the content sits in one column and the other is blank for no reason; sentence-case violations; heading periods; comma-tail headings; metaphors.
