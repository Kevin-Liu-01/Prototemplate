# Numbers

This page collects the numbers that General Translation (GT) design and engineering work in Prototemplate depends on, grouped by area. Each row gives the value, the reason for it, the token or constant that carries it, the lint or gate that holds it, and the page that explains it. The explanation lives on the linked page and the value lives in its source file, so a change starts in those two places and this row follows. [Traps and fixes](traps.md) indexes the failures behind many of these numbers in the same way.

`tokens.css` is `src/components/viewer/tokens.css`, and every other path is relative to the root of the Prototemplate repository. A value in brackets applies under 900px wide and on a phone on its side. In the Held by column a `pnpm` command names the lint or gate, with its rule where the lint numbers its rules, and Review means that no lint holds the value, so a person or a critic checks it on the render. Every value was read from its source on 2026-10-21.

## Type

The site sets one face, the self-hosted rsms InterVariable 4.1, with an optical-size axis from 14 to 32 and a weight axis from 100 to 900.

| Value | Reason | Token or constant | Held by | Explained in |
| --- | --- | --- | --- | --- |
| 44px at line height 1.04 and -0.025em (32px) | The page title sits in Inter's Display design, which starts at 32px. | `--pt-d1`, `--pt-d1-lh`, `--pt-d1-track` in `tokens.css` | `pnpm lint:type` T7; `pnpm lint:type:live` L3 | [Design system: book type](../../DESIGN.md#book-type) |
| 32px at 1.05 and -0.025em (26px at 1.15) | A section title is the second step of the display ladder. | `--pt-d2`, `--pt-d2-lh`, `--pt-d2-track` in `tokens.css` | `pnpm lint:type` T7; `pnpm lint:type:live` L3 | [Design system: book type](../../DESIGN.md#book-type) |
| 24px at 1.25 and -0.02em (21px) | An h2 in prose and a record's title track less at a smaller size. | `--pt-d3`, `--pt-d3-lh`, `--pt-d3-track` in `tokens.css` | `pnpm lint:type` T7; `pnpm lint:type:live` L3 | [Type: tracking by role](https://www.prototemplate.com/docs/craft/type#tracking-by-role) |
| 18px at 1.35 | An h3 and a row's title take this step at weight 500 and -0.01em. | `--pt-t-title` in `tokens.css` | `pnpm lint:type` R1 ratchets literal sizes | [Design system: book type](../../DESIGN.md#book-type) |
| 17px at 1.55 | A head's lead takes this step, and one lead line, 26.35px, is also the panel's row pitch. | `--pt-t-lead`, `--pt-t-lead-lh` in `tokens.css` | `pnpm lint:heads:live` H5 | [Pages: the book page's numbers](https://www.prototemplate.com/docs/pages#the-book-pages-numbers) |
| 16px at 1.6 | Prose, notes and section leads take the body step. | `--pt-t-body` in `tokens.css` | `pnpm lint:type` R1 | [Design system: book type](../../DESIGN.md#book-type) |
| 14px at 1.55, 13px at 1.5 and 12.5px | Table cells and contents links take the small step, captions and table heads the meta step, and group labels in chrome the group step. | `--pt-t-small`, `--pt-t-meta`, `--pt-t-group` in `tokens.css` | `pnpm lint:type` R1 | [Design system: book type](../../DESIGN.md#book-type) |
| -0.01em and -0.005em | Labels at 13 to 18px and group labels at 12 to 12.5px are set at weight 500, which tightens with size. | `--pt-track-label`, `--pt-track-group` in `tokens.css` | `pnpm lint:type` R2 ratchets literal tracking | [Type: tracking by role](https://www.prototemplate.com/docs/craft/type#tracking-by-role) |
| 0 at weight 400, and nothing positive | Running text is never tracked, and positive tracking on Inter is a defect at every size. | The comment under the text ladder in `tokens.css` | `pnpm lint:type` T8; `pnpm lint:type:live` L3 | [Type: tracking by role](https://www.prototemplate.com/docs/craft/type#tracking-by-role) |
| 500 at most | The brand stops at 500, and the browser's `bolder` computes `b` and `strong` to 700. | `--pt-w-display`, `--pt-w-strong` and the `:is(b, strong)` base rule in `tokens.css` | `pnpm lint:type` T6; `pnpm lint:type:live` L5 | [Type: weight and stack traps](https://www.prototemplate.com/docs/craft/type#weight-and-stack-traps) |
| opsz equal to the font size, clamped to 14 to 32 | With `font-optical-sizing: auto` the browser follows the size, so the Display design starts at 32px and the axis tightens spacing by itself. | No token; `font-variation-settings` is never written | `pnpm lint:type` T5; `pnpm lint:type:live` L4 | [Type: optical size](https://www.prototemplate.com/docs/craft/type#optical-size) |
| 398.55px against 380.81px | A 44px line tracked -0.025em measures the first without `calt` named and the second with it, because Chrome drops contextual alternates under letter-spacing. | `--pt-ff-text` and `--pt-ff-display` in `tokens.css` | `pnpm lint:type` T4; `pnpm lint:type:live` L2 and L7 | [Type: contextual alternates under letter-spacing](https://www.prototemplate.com/docs/craft/type#contextual-alternates-under-letter-spacing) |
| 32em for body text and 30em for a lead | Inter prose averages about 0.45em a character, so both hold about 66 characters a line. | `--pt-measure`, `--pt-measure-lead` in `tokens.css` | `skills/gt-aesthetic/scripts/measure-type.mjs --strict` exits 1 past 75 characters; `pnpm lint:type:live` L8 | [Type: measure](https://www.prototemplate.com/docs/craft/type#measure) |
| 83 to 86 characters in `62ch` at 17px | The `ch` unit is the width of a zero, about 0.63em in Inter, so a measure in `ch` holds far more text than its number suggests. | None; measures are set in em | `measure-type.mjs --strict` | [Type: measure](https://www.prototemplate.com/docs/craft/type#measure) |
| 1 to 3 lead lines at 1440 (6 at 390), 200 characters at most | A head's lead reads in two or three lines. | `--pt-measure-lead` in `tokens.css`; `H4` in `scripts/lint/heads.mjs` | `pnpm lint:heads:live` H4 | [Pages: the book page](https://www.prototemplate.com/docs/pages#the-book-page) |
| 352,240 and 112,748 bytes | The full roman file is the subsets' source, and its latin subset is the only Inter file every route preloads. | `public/fonts/InterVariable.woff2`; `ptInter` in `src/lib/fonts.ts` | `pnpm lint:type` T3 | [Type: subsets and glyph names](https://www.prototemplate.com/docs/craft/type#subsets-and-glyph-names) |
| 107.89% | next/font's fallback face is `local("Arial")` at this `size-adjust`, and Arial draws Hebrew and Arabic before any face listed after Inter. | next/font's `ptInter Fallback` | Review | [Type: scripts and the Arial fallback](https://www.prototemplate.com/docs/craft/type#scripts-and-the-arial-fallback) |
| 0.8638em and 0.728em | The baseline sits 0.8638em below the top of a line-height-1 box, and the cap height is 1490 of 2048 units, so display type is seated by its ink. | None; Inter's own metrics | Review | [Type: seating display type](https://www.prototemplate.com/docs/craft/type#seating-display-type) |

## Corners

Controls are rounded and shells are square. Kevin's toolbar of 2026-10-05 set the values.

| Value | Reason | Token or constant | Held by | Explained in |
| --- | --- | --- | --- | --- |
| 0 | The viewer frame, the sidebar, the toolbar bar, the reading column, the book head, the dividers and full-width rows hold the interface, so they are square. | `--pt-radius-shell` in `tokens.css` | `pnpm lint:radius`; `pnpm lint:radius:live` | [Design system: corners](../../DESIGN.md#corners-rounded-controls-square-shells) |
| 6px | Buttons, fields, segmented groups and the sidebar's pills are things a reader presses or types into. | `--pt-radius-control` in `tokens.css` | `pnpm lint:radius`; `pnpm lint:radius:live` | [Design system: corners](../../DESIGN.md#corners-rounded-controls-square-shells) |
| 5px | A part flush inside a control's 1px border stays concentric with it. | `--pt-radius-inner` in `tokens.css` | `pnpm lint:radius` | [Design system: corners](../../DESIGN.md#corners-rounded-controls-square-shells) |
| 4px | Key caps, chips, tags, inline code and a control set 2 to 7px inside a field take the chip corner. | `--pt-radius-chip` in `tokens.css` | `pnpm lint:radius`; `pnpm lint:radius:live` | [Design system: corners](../../DESIGN.md#corners-rounded-controls-square-shells) |
| 6px | Cards, tiles, thumbnails, figures and popovers are objects a reader looks at. | `--pt-radius-card` in `tokens.css` | `pnpm lint:radius`; `pnpm lint:radius:live` | [Design system: corners](../../DESIGN.md#corners-rounded-controls-square-shells) |
| 50% | Dots and avatars on a square box take a full round. | `--pt-radius-round` in `tokens.css` | `pnpm lint:radius:live` | [Docs site traps: the full round corner](https://www.prototemplate.com/docs/engineering/docs-traps#the-full-round-corner) |
| The role's radius minus 1 to 3px | A part 1 to 3px inside a rounded box takes the concentric radius. | `calc(var(--pt-radius-<role>) - npx)`, `TOKEN_FORM` in `scripts/lint/radius.mjs` | `pnpm lint:radius` | [Design system: corners](../../DESIGN.md#corners-rounded-controls-square-shells) |
| 8px | Present's solid button is the one named exception, a chrome request of Kevin's. | `EXCEPTIONS` in `scripts/lint/radius.mjs` | `pnpm lint:radius` K3 and L3 | [Design system: chrome exceptions](../../DESIGN.md#15-chrome-exceptions-kevin-asked-for) |
| 33,554,400px | Chrome computes Tailwind 4's `rounded-full`, `calc(infinity * 1px)`, to this value, so the radius lint reports it as an illegal corner. | None; a square box takes `--pt-radius-round` | `pnpm lint:radius:live` | [Docs site traps: the full round corner](https://www.prototemplate.com/docs/engineering/docs-traps#the-full-round-corner) |

## Lines

Every line is drawn once by one owner. In the shell's chrome every rule is 1px in one of three roles, so a line's weight says what it divides.

| Value | Reason | Token or constant | Held by | Explained in |
| --- | --- | --- | --- | --- |
| Ink at 0.18 in light, 242 at 0.22 in dark | The structural role draws large surfaces and the lines that divide the shell. | `--pt-hair` in `tokens.css` | `pnpm lint:lines:shell` | [Design system: line law for chrome](../../DESIGN.md#line-law-for-chrome) |
| Ink at 0.09 in light, 242 at 0.1 in dark | The row role draws list rows, panel rows and the sidebar's rail. | `--pt-hair-soft` in `tokens.css` | `pnpm lint:lines:shell` | [Design system: line law for chrome](../../DESIGN.md#line-law-for-chrome) |
| Ink at 0.62 in light, 242 at 0.55 in dark | The frame role is the darkest line in chrome, because it holds a picture in place against the paper. | `--pt-edge` in `tokens.css` | `pnpm lint:lines:shell` | [Design system: line law for chrome](../../DESIGN.md#line-law-for-chrome) |
| 59 and 99 in dark, 210 and 174 in light | One and two stacked strokes of `--pt-hair` composite to these greys, so a seam's grey counts its strokes. | `--pt-hair` in `tokens.css` | `skills/gt-verify/scripts/probe.mjs --scan` | [Lines and seams: reading a seam by its grey](https://www.prototemplate.com/docs/craft/lines#reading-a-seam-by-its-grey) |
| 4 device pixels at 2x | Two touching 1px rules of an opaque hairline keep one grey and show as a run twice as wide. | `--tc-hair` on the GT landing | `probe.mjs --dsf 2` | [Lines and seams: reading a seam by its grey](https://www.prototemplate.com/docs/craft/lines#reading-a-seam-by-its-grey) |
| 1 to 2.5px wide and over 24px long | The line auditor counts a border side, an outline, a border-like shadow, a thin fill or an exposed-ground strip in this range as a line. | Thresholds in `scripts/lint/lines.mjs` | `pnpm lint:lines`; `pnpm lint:lines:shell` | [Lines and seams: the line auditor's thresholds](https://www.prototemplate.com/docs/craft/lines#the-line-auditors-thresholds) |
| 1 to 4px apart, overlapping 75% of the shorter line and 80px | Two parallel lines from different owners this close read as one doubled line. | `scripts/lint/lines.mjs` | `pnpm lint:lines` | [Lines and seams: the line auditor's thresholds](https://www.prototemplate.com/docs/craft/lines#the-line-auditors-thresholds) |
| Under 1px apart | Two owners draw one seam and their alphas stack, which the auditor reports as a junction. | `scripts/lint/lines.mjs` | `pnpm lint:lines` | [Gates: what the line auditor counts](https://www.prototemplate.com/docs/gates#what-the-line-auditor-counts) |
| Within 45 summed RGB steps of the ground | A strip this close to the page's ground is an invisible seam. | `scripts/lint/lines.mjs` | `pnpm lint:lines` | [Gates: what the line auditor counts](https://www.prototemplate.com/docs/gates#what-the-line-auditor-counts) |
| Fill alpha 0.12 to 0.95 on an edge of 120px or longer | A self-stack fails only at this size, so chips and small controls are reported without failing. | `scripts/lint/lines.mjs` | `pnpm lint:lines` | [Lines and seams: self-stacks and stacked grounds](https://www.prototemplate.com/docs/craft/lines#self-stacks-and-stacked-grounds) |
| Opacity 0.05 or less | The auditor skips such elements, with SVG and canvas subtrees, so those are read by eye at 2x crops. | `scripts/lint/lines.mjs` | Review of 2x crops | [Lines and seams: the line auditor's thresholds](https://www.prototemplate.com/docs/craft/lines#the-line-auditors-thresholds) |
| 100vmax | A book's rules paint as a border image outset this far past both ends, so they run across the stage while the element keeps the column's layout. | `--pt-bleed-top`, `--pt-bleed-bottom`, `--pt-bleed-block` in `tokens.css` | `pnpm lint:heads:live` H6; the practices lint's `border-image-none` | [Lines and seams: rules that run the full width](https://www.prototemplate.com/docs/craft/lines#rules-that-run-the-full-width) |
| 1104px | The GT landing's original pages ran `max-w-[1120px] px-2`, so their side lines were 1104px apart, and a 1100px rail doubled every hairline by 2px a side. | `--tc-rail` in gt-cloud's landing engine | The practices lint's retired-rail checks | [Lines and seams: rails drawn as borders](https://www.prototemplate.com/docs/craft/lines#rails-drawn-as-borders) |
| 9px arms hanging 5px past the rail, at 0.38 in light and 0.34 in dark | A registration cross marks where a section seam meets the rail, and the page root takes `overflow-x: clip` for its arms. | `--cross-ink` in gt-cloud's landing engine | Review | [Lines and seams: registration crosses and horizontal clipping](https://www.prototemplate.com/docs/craft/lines#registration-crosses-and-horizontal-clipping) |

## The book page

Every page with a book head renders one structure, and every space in it is a token.

| Value | Reason | Token or constant | Held by | Explained in |
| --- | --- | --- | --- | --- |
| 44px (24px) | The title sits this far under the stage's top, nothing is drawn in that space, and no line crosses a title. | `--pt-title-clear` in `tokens.css` | `pnpm lint:heads` S6; `pnpm lint:heads:live` H3 | [Pages: the book page's numbers](https://www.prototemplate.com/docs/pages#the-book-pages-numbers) |
| 14px | This space separates the title's box from the lead's box. | `--pt-head-gap` in `tokens.css` | `pnpm lint:heads` S6 | [Pages: the book page's numbers](https://www.prototemplate.com/docs/pages#the-book-pages-numbers) |
| 56px | This gap separates the lead's column from the panel. | `--pt-head-col-gap` in `tokens.css` | `pnpm lint:heads` S6 | [Pages: the book page's numbers](https://www.prototemplate.com/docs/pages#the-book-pages-numbers) |
| 304px | The panel's column fits its longest value, a date with its hint such as "Sep 10, 2026 4 weeks ago", which measures 168px. | `--pt-head-panel` in `tokens.css` | `pnpm lint:heads` S6; `pnpm lint:heads:live` H5 | [Badges and heads: the head's numbers](https://www.prototemplate.com/docs/components/heads#the-heads-numbers) |
| 26.35px | One lead line sets the panel's row pitch, so every fact sits on a lead baseline. | `--pt-row` in `tokens.css` | `pnpm lint:heads:live` H5 | [Pages: the book page's numbers](https://www.prototemplate.com/docs/pages#the-book-pages-numbers) |
| 26px | The mast's rule sits this far under the taller of the lead and the panel. | `--pt-head-rule-pad` in `tokens.css` | `pnpm lint:heads:live` H6 | [Pages: the book page's numbers](https://www.prototemplate.com/docs/pages#the-book-pages-numbers) |
| 42px | The hatch band measures this with both of its rules, and its 1px diagonal repeats every 7px. | `--pt-band-h`, `--pt-hatch` in `tokens.css` | `pnpm lint:heads` S3; `pnpm lint:heads:live` H7 | [Design system: sanctioned devices](../../DESIGN.md#sanctioned-devices) |
| 48px (40px) | A rule sits this far under the block above it. | `--pt-sec-over` in `tokens.css` | `pnpm lint:heads:live` H7 | [Pages: the book page's numbers](https://www.prototemplate.com/docs/pages#the-book-pages-numbers) |
| 30px | An h2's box sits this far under its rule. | `--pt-sec-pad` in `tokens.css` | `pnpm lint:heads:live` H3 | [Pages: the book page's numbers](https://www.prototemplate.com/docs/pages#the-book-pages-numbers) |
| 32px (24px) and 56px (16px) | Blocks in a book column sit this far apart, and the column takes this side padding. | `--pt-book-gap`, `--pt-col-pad-x` in `tokens.css` | `pnpm lint:heads` S6 | [Pages: the book page's numbers](https://www.prototemplate.com/docs/pages#the-book-pages-numbers) |
| 193.16px | At 1440 a one-line title's mast rule sits this far below the title's top on every page; the panel's four rows set it. | `H9_GAP` in `scripts/lint/heads.mjs` | `pnpm lint:heads:live` H9 | [Pages: the book page's numbers](https://www.prototemplate.com/docs/pages#the-book-pages-numbers) |
| 35.5px at 1440 and 79px at 390 | Every section's h2 sits the same distance under its rule. | `scripts/lint/heads.mjs` | `pnpm lint:heads:live` H8 | [Pages: the book page's numbers](https://www.prototemplate.com/docs/pages#the-book-pages-numbers) |
| 52px, and 208px or 256px | The toolbar is 52px tall, and the sidebar is 208px wide in outline density and 256px with thumbnails. | `--pt-bar-h`, `--pt-sb-w` in `tokens.css`; `ViewerShell.css` | Review | [Pages: the viewer shell](https://www.prototemplate.com/docs/pages#the-viewer-shell) |

## Motion

Bounce, elastic and back overshoot are not used, and every number here has a reduced-motion still.

| Value | Reason | Token or constant | Held by | Explained in |
| --- | --- | --- | --- | --- |
| 0.5s | Film arrivals and scene changes land on this beat grid. | The film kit's beat grid; `skills/gt-motion/SKILL.md` | Review | [SVG lines in motion: timing numbers](https://www.prototemplate.com/docs/craft/svg-motion#timing-numbers) |
| (words / 3) + 1s | A sentence holds this long after it has fully arrived, so it can be read. | `skills/gt-motion/SKILL.md` | Review | [SVG lines in motion: timing numbers](https://www.prototemplate.com/docs/craft/svg-motion#timing-numbers) |
| 40 to 90ms | Staggers run in reading direction at this spacing. | `skills/gt-motion/SKILL.md` | Review | [SVG lines in motion: timing numbers](https://www.prototemplate.com/docs/craft/svg-motion#timing-numbers) |
| 0.62s with a 0.055s stagger, from 16px down | The GT landing reveals its content with this tween. | gt-cloud's `reveal.ts` | Review | [SVG lines in motion: timing numbers](https://www.prototemplate.com/docs/craft/svg-motion#timing-numbers) |
| 180ms `ease-out` from 4px down | Rows on the dashboard's sign-in and onboarding plates reveal with this tween. | gt-cloud's `brand-tokens.css` | Review | [SVG lines in motion: timing numbers](https://www.prototemplate.com/docs/craft/svg-motion#timing-numbers) |
| 120 to 220ms, 0 under reduced motion | The shell's chrome transitions run in this range, from a button's colour to the sidebar column. | `--pt-dur-fast` to `--pt-dur-sb` in `tokens.css` | Review | [SVG lines in motion: timing numbers](https://www.prototemplate.com/docs/craft/svg-motion#timing-numbers) |
| 350ms and 150ms | A dithered resolve and a dithered step take these times, halved from 700 and 300ms on Kevin's request of 2026-09-29. | `RESOLVE_MS`, `STEP_MS` in `src/app/craft/TransitionDemo.tsx` | Review | [Dither in practice: transitions on one grid](https://www.prototemplate.com/docs/craft/dither#transitions-on-one-grid) |
| 240ms `ease-out` | A field's first paint is a keyframe fade, because a CSS transition never runs on the first frame. | gt-cloud's `brand-field-picture-in` keyframe | Review | [SVG lines in motion: transitions at first paint](https://www.prototemplate.com/docs/craft/svg-motion#transitions-at-first-paint) |
| 0.25s or more | An assembly moves one group at a time and rests this long between groups. | `skills/gt-motion/SKILL.md` | Review | [SVG lines in motion: timing numbers](https://www.prototemplate.com/docs/craft/svg-motion#timing-numbers) |
| 0.7s `power2.inOut`, requests debounced 0.25s, none under 720px | The moving type law allows one width tween per cycle, and phones found it slow, so the em pins to the column there. | `skills/gt-motion/SKILL.md` | Review | [SVG lines in motion: moving type](https://www.prototemplate.com/docs/craft/svg-motion#moving-type) |
| Scale 1.00 to 1.04 over a scene | A camera drift is allowed on a picture or a field, and type holds still. | `skills/gt-motion/SKILL.md` | Review | [SVG lines in motion: timing numbers](https://www.prototemplate.com/docs/craft/svg-motion#timing-numbers) |
| 30 fps | The CPU dither loop runs at this rate by default, which keeps the main thread free. | `src/lib/dither.ts` | Review | [Dither and the studio field: what a field costs](https://www.prototemplate.com/docs/components/dither#what-a-field-costs) |

## SVG lines

| Value | Reason | Token or constant | Held by | Explained in |
| --- | --- | --- | --- | --- |
| `'100 200'` parked at +101 or -101 | The gap keeps every dash edge clear of both ends, and the sign picks the end a draw-on grows from: + from the first point, - from the last. | The draw-on tweens; `skills/gt-motion/references/traps.md` | Review of 2x crops | [SVG lines in motion: the sign of the parked offset](https://www.prototemplate.com/docs/craft/svg-motion#the-sign-of-the-parked-offset) |
| `pathLength` 1000 | GSAP integer-rounds pixel CSS properties, so a looping dash on 1000 units moves by sub-pixel steps. | `autoRound: false` on every dash tween | Review | [SVG lines in motion: rounding, cached paths and empty paths](https://www.prototemplate.com/docs/craft/svg-motion#rounding-cached-paths-and-empty-paths) |
| About 100ms early | A capture synced to a GSAP state polls a CSS variable and fires early, so its own latency lands it inside the state. | The capture harness | Review | [SVG lines in motion: GSAP from outside the page](https://www.prototemplate.com/docs/craft/svg-motion#gsap-from-outside-the-page) |
| 22 units for 20.1px | Labels in an 800-unit viewBox that renders at 0.914 are set after the scale. | `skills/gt-diagrams/SKILL.md` | `skills/gt-diagrams/scripts/figure-check.mjs` | [SVG lines in motion: drawing under a stretched viewBox](https://www.prototemplate.com/docs/craft/svg-motion#drawing-under-a-stretched-viewbox) |
| `y1="70.5"` | A 1px line at 1:1 sits on a half-pixel coordinate to fill one row of device pixels. | `skills/gt-diagrams/SKILL.md` | Review of 2x crops | [SVG lines in motion: drawing under a stretched viewBox](https://www.prototemplate.com/docs/craft/svg-motion#drawing-under-a-stretched-viewbox) |
| `-8 214 1213 771`, aspect about 1.573 | The GT monogram symbol carries this viewBox, so an svg that copies it draws the mark 214 units too high; the referencing svg takes only a width and height, such as 132 by 84. | `#gt-mark` in `deck/parts/head.html`; `src/lib/marks.ts` | Review | [SVG lines in motion: symbols and masks](https://www.prototemplate.com/docs/craft/svg-motion#symbols-and-masks) |

## Isometric drawings

| Value | Reason | Token or constant | Held by | Explained in |
| --- | --- | --- | --- | --- |
| 30 degrees, tan 30 (0.577) and the square root of 1.5 | Flat art reaches the iso plane by a 45 degree turn, y scaled by 0.577 and the whole scaled by the square root of 1.5. A 2:1 squash scales y by 0.5 and lies flatter than the face under it. | `project()` and `plane()` in `src/app/d/toolchain/diagrams/iso.ts` | Review | [Isometric drawings: numbers and traps](https://www.prototemplate.com/docs/components/iso#numbers-and-traps) |
| 2.4, and 1.2 on diff slats | One corner radius serves the family; at 2.4 a thin slat reads as a capsule. | `ISO_RADIUS` in `iso.ts` | Review | [Isometric drawings: numbers and traps](https://www.prototemplate.com/docs/components/iso#numbers-and-traps) |
| About 4% of the footprint thick, about 40% air between plates | Shared proportions make separate drawings read as one set. | `skills/gt-diagrams/references/isometric.md` | The gt-diagrams review checklist | [Isometric drawings: numbers and traps](https://www.prototemplate.com/docs/components/iso#numbers-and-traps) |
| Rim 0.12 + 0.08 d, top edge 0.24 + 0.24 d, front edge 0.08 | Depth comes from each plate's stroke alpha, where d runs from 0 at the bottom plate to 1 at the top. | `skills/gt-diagrams/references/isometric.md` | Review | [Isometric drawings: numbers and traps](https://www.prototemplate.com/docs/components/iso#numbers-and-traps) |
| 240 by 180 | The shared viewBox fixes the relative scale of the family. | `ISO_VIEW_W`, `ISO_VIEW_H` in `src/app/d/toolchain/diagrams/IsoFrame.tsx` | Review | [Isometric drawings: the kit](https://www.prototemplate.com/docs/components/iso#the-kit) |

## Dither

| Value | Reason | Token or constant | Held by | Explained in |
| --- | --- | --- | --- | --- |
| 8 by 8 Bayer, 65 levels | A constant tone k/64 lights exactly k cells of every tile, and a cell is lit when its tone exceeds (m + 0.5) / 64. | `BAYER_8` in `src/lib/dither.ts` | Review | [Dither in practice: ordered dither](https://www.prototemplate.com/docs/craft/dither#ordered-dither) |
| 1, 2, 3, 4 and 6 CSS px cells | The cell grows with the use: photographs, the sign-in globe, full-bleed fields and every film, an animated burst, then small stills. From 8px a screen reads as pixel art. | `scale` on the CPU loop; `skills/gt-dither/SKILL.md` | Review | [Dither in practice: cells are screen pixels](https://www.prototemplate.com/docs/craft/dither#cells-are-screen-pixels) |
| `min(devicePixelRatio, 2)` | The GPU studio field computes cells from device pixels, and a dpr of 1 upscaled blurs them together. | `dpr` in `src/lib/studio-field.ts` | Review | [Dither in practice: cells are screen pixels](https://www.prototemplate.com/docs/craft/dither#cells-are-screen-pixels) |
| Opacity 0.55 in screen blend, mask 0.72 at the edges to 0.12 at the centre | The landing hero's material is the strongest a product surface may carry. | Studio preset 02, `bayer-8x8`; `skills/gt-dither/SKILL.md` | Review | [Dither in practice: material strength](https://www.prototemplate.com/docs/craft/dither#material-strength) |
| Mean tone 0.361, standard deviation 0.342 | Every dithered photograph is cut to the Blue Marble's own statistics, accepted from 0.30 to 0.42 and 0.28 to 0.44. | `scripts/media/mood-tone/standard.json` | `node scripts/lint/pictures.mjs` | [Dither in practice: the picture standard](https://www.prototemplate.com/docs/craft/dither#the-picture-standard) |
| Gamma 1.2, 0.5% autocontrast, no blur | These settings are fixed for every picture, since a blur of sigma 3 erased the Rosetta Stone's inscriptions. | `scripts/media/mood-tone/standard.json` | `node scripts/lint/pictures.mjs` | [Artifact pictures: the tone grid](../ARTIFACT-PICTURES.md#3-the-tone-grid-is-the-blue-marbles) |
| JPEG quality 82, 75 over 573,440 bytes | The byte cap keeps every grid under 560KB. | `scripts/media/mood-tone/standard.json` | `node scripts/lint/pictures.mjs` | [Dither in practice: the picture standard](https://www.prototemplate.com/docs/craft/dither#the-picture-standard) |
| 144k cells at `scale` 3: 0.8 to 15.1ms a frame | The CPU loop's cost is linear in cells, and halving the cell size quadruples it, so a full-bleed field never animates at `scale` 1 (1.3 million calls). | The field functions in `src/lib/dither.ts` | Review | [Dither and the studio field: what a field costs](https://www.prototemplate.com/docs/components/dither#what-a-field-costs) |
| A disc 1.7 times the stack's height, its limb five sevenths along the ramp | The onboarding earth sits under the thick part of the field's ramp, where the first placement left it under the thin start. | `src/components/plate/brand/moodPictures.ts` | Review | [Dither in practice: placing a picture on a field](https://www.prototemplate.com/docs/craft/dither#placing-a-picture-on-a-field) |

## Interface

| Value | Reason | Token or constant | Held by | Explained in |
| --- | --- | --- | --- | --- |
| 44px target, under 40px a defect | A phone tap target aims at 44px, and the page check fails one under 40px and notes 40 to 43px. | `TAP_DEFECT_UNDER`, `TAP_NOTE_UNDER` in `scripts/check/pagecheck/probes.mjs` | `pnpm check:pages` | [Interface details: tap targets that keep the look](https://www.prototemplate.com/docs/craft/interface-details#tap-targets-that-keep-the-look) |
| 0.001 per layout-shift entry | An entry within 500ms of an input stays out of the CLS score and is still a jump a reader sees. | `SHIFT_FLOOR` in `scripts/check/pagecheck/cls.mjs` | `pnpm check:pages --cls-trace` | [Interface details: layout shifts](https://www.prototemplate.com/docs/craft/interface-details#layout-shifts) |
| CLS over 0.1 fails, over 0.05 is a note | The first is the Web Vitals limit, and the second is a margin under it. | `CLS_DEFECT`, `CLS_NOTE` in `scripts/check/pagecheck/probes.mjs` | `pnpm check:pages` | [Proving a visual change: the stress matrix](https://www.prototemplate.com/docs/engineering/verification#the-stress-matrix) |
| 4.5:1 for text under 24px | Titanium `#8a8f98` on white is 3.25, so light captions take `#6e737c` at 4.77 or ink-2. | `--pt-titanium`, `--pt-ink-2` in `tokens.css` | Review; `measure-type.mjs` | [Interface details: contrast](https://www.prototemplate.com/docs/craft/interface-details#contrast) |
| About 1.6s | A copy control holds its check this long, announced to screen readers, and its label never changes. | `InstallField` in `src/components/viewer/InstallField.tsx` | Review | [Interface details: the copy control](https://www.prototemplate.com/docs/craft/interface-details#the-copy-control) |
| 350ms and 4.5s | A carousel drops a command within 350ms of the last one, and autoplays every 4.5s until hover, focus or reduced motion stops it. | The blog carousel in gt-cloud; `skills/gt-website/references/blog.md` | Review | [Interface details: carousels and galleries](https://www.prototemplate.com/docs/craft/interface-details#carousels-and-galleries) |
| 16px or larger | Inputs below the `md` breakpoint stay at this size so iOS does not zoom on focus. | `skills/gt-components/SKILL.md` | Review | [Interface details: third-party widgets and the site's theme](https://www.prototemplate.com/docs/craft/interface-details#third-party-widgets-and-the-sites-theme) |

## The deck

| Value | Reason | Token or constant | Held by | Explained in |
| --- | --- | --- | --- | --- |
| 1600 by 900 | Every slide is drawn on one sheet that scales to the window. | `deck/DECK-GRAMMAR.md` | `node shoot-slide.mjs` prints any element past the sheet | [The brand deck: the sheet and the grammar](https://www.prototemplate.com/docs/deck#the-sheet-and-the-grammar) |
| 56px | The viewer draws the rails and rules this far in from each edge, and a slide never redraws them. | `deck/DECK-GRAMMAR.md` | Review | [The brand deck: the sheet and the grammar](https://www.prototemplate.com/docs/deck#the-sheet-and-the-grammar) |
| h1 88px, h2 44px, `.big` 72px, `p` 22px, `.lead` 26px | The deck sets its type at these sizes on the sheet. | The shared styles in `deck/parts/` | Review | [The brand deck: the sheet and the grammar](https://www.prototemplate.com/docs/deck#the-sheet-and-the-grammar) |
| 15px for text, 18px for SVG labels | Text under 15px on the sheet is a defect, and an SVG label is never under 18px. | `.cap` and `.sm` in `deck/DECK-GRAMMAR.md` | Review | [Writing: slides and cards](https://www.prototemplate.com/docs/craft/writing#slides-and-cards) |
| 256px or 208px | The deck viewer's slide list takes these widths with thumbnails and in outline density. | `--sb-w` in `deck/parts/head.html` | Review | [The brand deck: the viewer](https://www.prototemplate.com/docs/deck#the-viewer) |

## Graphics

| Value | Reason | Token or constant | Held by | Explained in |
| --- | --- | --- | --- | --- |
| 3 to 5x | Product captures are taken at this scale, lossless, so crops stay sharp after zoom. | `SHOTS` in `graphics/build/gen-lib.js`; `graphics/shots/hi/` | Review | [Graphics pipeline: the files](../GRAPHICS.md#the-files) |
| 26px after zoom-to-fit | No text on the 1600px stage is smaller than a label chip once the composition is fitted. | `MIN_TEXT` in `graphics/build/gen-lib.js` | `pnpm graphics:audit` | [Graphics pipeline: sizing](../GRAPHICS.md#sizing) |
| About 700 CSS px, 0.44x | A blog column shows the 1600px stage at this scale, so every label is sized for it. | The 1600px `stage` in `graphics/build/gen-lib.js` | `pnpm graphics:audit` | [Graphics pipeline: sizing](../GRAPHICS.md#sizing) |
| 3840 wide webp at quality 95; OG 2400 by 1260 | The exports serve a dense `deviceSizes` ladder through next/image. | `graphics/build/export-blog.py` | Review | [Graphics pipeline: sizing](../GRAPHICS.md#sizing) |
| 712px | The blog globe figure is laid out at this review column before it scales. | `src/components/blog-globe/blog-globe.css` | Review | [The blog globe figure: measurements](https://www.prototemplate.com/docs/components/blog-globe#measurements) |

## Films

| Value | Reason | Token or constant | Held by | Explained in |
| --- | --- | --- | --- | --- |
| -16 LUFS within 0.5, true peak at or under -1 dBTP | A film meets these loudness targets, and the renderer lowers a track whose true peak passes -1 dBTP to -1.5 dBTP. | `skills/gt-films/references/sound.md` | `ffmpeg -af ebur128=peak=true` | [Films: the mix and its traps](https://www.prototemplate.com/docs/craft/films#the-mix-and-its-traps) |
| About -26 LUFS under speech, -20 LUFS alone | The music bed's duck is about 6dB in loudness terms. | `skills/gt-films/references/sound.md` | Review | [Films: the mix and its traps](https://www.prototemplate.com/docs/craft/films#the-mix-and-its-traps) |
| 0.1s of silence; a -9dB shelf at 100Hz | A clip at full level from its first sample bumps, and sub-bass downbeats made the AAC encoder overshoot by up to 2.6dB. | `skills/gt-films/references/sound.md` | Review | [Films: the mix and its traps](https://www.prototemplate.com/docs/craft/films#the-mix-and-its-traps) |
| 2.60 words a second | The narrator speaks at this rate, scripts are planned on it, and a take is never sped up. | `skills/gt-films/references/sound.md` | Review | [Films: speech synthesis](https://www.prototemplate.com/docs/craft/films#speech-synthesis) |
| 640 by 360 | A film plays at this size on a phone, so every thin line is checked there. | `skills/gt-films/SKILL.md` | The film critic | [Films: thin lines over a dithered ground](https://www.prototemplate.com/docs/craft/films#thin-lines-over-a-dithered-ground) |
| 3px cells, 8 by 8 Bayer | Every GT film uses one screen, set on 2026-10-08. | `skills/gt-films/SKILL.md` | The film critic | [Dither in practice: cells are screen pixels](https://www.prototemplate.com/docs/craft/dither#cells-are-screen-pixels) |
| 5 GiB free, 8 GiB for several workers | A render with several workers writes every frame before it encodes. | `skills/gt-films/references/kit.md` | Review | [Films: frames, probes and disks](https://www.prototemplate.com/docs/craft/films#frames-probes-and-disks) |
| The stakes in 6 to 8s; about two picture events a second | A film states its stakes early and moves one thing at a time. | `skills/gt-films/SKILL.md` | The film critic | [Films: pacing and scripts](https://www.prototemplate.com/docs/craft/films#pacing-and-scripts) |

## Skills

| Value | Reason | Token or constant | Held by | Explained in |
| --- | --- | --- | --- | --- |
| 1024 characters | A skill's description says what it covers and when to use it within the length agents load. | `MAX_DESCRIPTION` in `scripts/build/skills.mjs` | `pnpm lint:skills` | [Skills: the contract](https://www.prototemplate.com/docs/skills#the-contract) |
| 24,000 bytes | A SKILL.md body stays under this budget, and detail moves to `references/` without deleting a rule. | `BUDGET` in `scripts/build/skills.mjs`; exemptions with reasons and expiry dates in `scripts/build/skills.budget.json` | `pnpm lint:skills` | [Skills: the contract](https://www.prototemplate.com/docs/skills#the-contract) |
| 30 days | A skill with no loads thirty days after distribution is cut unless Kevin keeps it by name. | `DAYS` in `scripts/skills/usage.mjs` | `pnpm skills:usage` | [Skills: kept by use](https://www.prototemplate.com/docs/skills#kept-by-use) |

## Docs and SEO

| Value | Reason | Token or constant | Held by | Explained in |
| --- | --- | --- | --- | --- |
| 50 to 160 characters | A description of this length shows whole in a search snippet. | `DESCRIPTION_MIN`, `DESCRIPTION_MAX` in `scripts/lint/seo.mjs` | `pnpm lint:seo`; `pnpm lint:registries` | [The SEO system: what one call writes](https://www.prototemplate.com/docs/seo#what-one-call-writes) |
| 60 characters | A title drops its section, then the site name, when it passes this length. | `TITLE_MAX` in `src/lib/seo/route.ts` | `pnpm lint:seo` | [The SEO system: what one call writes](https://www.prototemplate.com/docs/seo#what-one-call-writes) |
| 1200 by 630 | The social card is cached for a year, because it is a pure function of its query. | `src/app/og/route.tsx`; `OG_VERSION` | `pnpm lint:seo:live` | [The SEO system: the social card](https://www.prototemplate.com/docs/seo#the-social-card) |
| Two segments under `/docs` | The Markdown twin rewrites cover docs URLs this deep, so a deeper folder needs a third rule. | `TWIN_REWRITES` in `next.config.ts` | `pnpm lint:seo:live` | [The SEO system: why the twins are prerendered](https://www.prototemplate.com/docs/seo#why-the-twins-are-prerendered) |
| `tokenizeTimeLimit: 0` | Shiki's default 500ms limit leaves part of a line plain on a loaded build machine, so two builds differ. | `source.config.ts` | Review of a production build | [Docs site traps: code highlighting across builds](https://www.prototemplate.com/docs/engineering/docs-traps#code-highlighting-across-builds) |
| `next` 16.2.12 | Next.js 16.3 holds memory for every prerendered page, and a 7,117-page build died at page 1,779. | `package.json` | Review | [Docs site traps: prerender memory on Next.js 16.3](https://www.prototemplate.com/docs/engineering/docs-traps#prerender-memory-on-nextjs-163) |

## Engines

| Value | Reason | Token or constant | Held by | Explained in |
| --- | --- | --- | --- | --- |
| About 16 live WebGL contexts | Past this budget Chrome's `getContext` returns null and a field draws black with no error. | One engine per module in `src/lib/studio-field.ts`, `horizon-field.ts` and `prismatic-field.ts` | Review; the frame probe's `gl` column | [Canvas and WebGL engines: the context budget](https://www.prototemplate.com/docs/engineering/engines#the-context-budget) |
| 1 context per engine module, 0 created by a probe | The context survives every `destroy()`, and a probe that calls `getContext` exhausts the budget it counts. | The same modules | Review | [The component library: the numbers behind it](https://www.prototemplate.com/docs/components#the-numbers-behind-it) |
| 180px | A lazy plate mounts its engine when it first comes this close to the viewport. | `rootMargin: '180px'` in `src/components/docs/demos/hooks.ts` | Review | [The component library: the numbers behind it](https://www.prototemplate.com/docs/components#the-numbers-behind-it) |
| 2.5s warmup, windows of 120 frames, gaps over 900ms skipped | The glyph rain judges its quality tier from measured frame time, because a tier chosen by window width gave weak hardware the heaviest one. | `GOV_WARMUP_MS`, `GOV_WINDOW`, `GOV_GAP_MS` in `src/lib/glyph-field.ts` | The frame probe's `--cpu 12` | [Canvas and WebGL engines: quality from measured frame time](https://www.prototemplate.com/docs/engineering/engines#quality-from-measured-frame-time) |
| 35% of frames over 22ms | The trip counts slow frames, because a median missed throttled hardware that ran over budget on 34% of its frames. | `GOV_TRIP`, `GOV_BUDGET_MS` in `src/lib/glyph-field.ts` | The frame probe's `--cpu 12` | [Canvas and WebGL engines: quality from measured frame time](https://www.prototemplate.com/docs/engineering/engines#quality-from-measured-frame-time) |
| Pixel-ratio cap 2 to 1.25, then 560 of 1,280 glyphs | The governor's two tiers only step down, so it never oscillates. | `DPR_CAP`, `DPR_CAP_NARROW`, `NARROW_POOL`, `POOL` in `src/lib/glyph-field.ts` | Review | [Canvas and WebGL engines: quality from measured frame time](https://www.prototemplate.com/docs/engineering/engines#quality-from-measured-frame-time) |
| About 1,000ms of every second | An engine that resized its one GL canvas to each field reallocated it twice a frame, so the canvas now only grows. | The blit in `src/lib/prismatic-field.ts` | Review | [Canvas and WebGL engines: a shared canvas that only grows](https://www.prototemplate.com/docs/engineering/engines#a-shared-canvas-that-only-grows) |
| 12 live pages, 1.3 GB and about 950ms of every second | A gallery that froze each preview still paid this, so previews are stills until hover. | `src/app/present/viewer/LazyFrame.tsx`; the rAF gate in `src/app/layout.tsx` | Review | [Canvas and WebGL engines: galleries of live previews](https://www.prototemplate.com/docs/engineering/engines#galleries-of-live-previews) |
| 6.5KB to 4.4KB | Comments inside a GLSL template literal ship to every visitor, so they move to a TypeScript comment. | The horizon shader in `src/lib/horizon-field.ts` | Pixel diff of a deterministic frame | [Canvas and WebGL engines: shader source weight](https://www.prototemplate.com/docs/engineering/engines#shader-source-weight) |
| 5 fps against 56 fps | A seam drag ran at these rates over 27,800 SVG nodes and over one canvas, at 4x CPU throttle. | `--seam-cut` on the reveal seam | Review | [Lottie on canvas: before and after](https://www.prototemplate.com/docs/engineering/lottie#before-and-after) |

## Gates

| Value | Reason | Token or constant | Held by | Explained in |
| --- | --- | --- | --- | --- |
| 0, 1 and 2 | Every lint exits 0 on a pass, 1 on findings and 2 when it could not judge, so a missing server stops a chain as a finding does. | Each script under `scripts/lint/` | Every gate | [Gates: exit codes](https://www.prototemplate.com/docs/gates#exit-codes) |
| 3 to 5 minutes | `pnpm exec tsc --noEmit` is a gate of its own, because `next build` never type-checks here. | `typescript.ignoreBuildErrors` in `next.config.ts` | The type check | [Gates: the type check](https://www.prototemplate.com/docs/gates#the-type-check) |
| About 25 minutes | `pnpm lint:all` runs every static lint, then the browser audits one at a time. | `package.json`; `skills/prototemplate/SKILL.md` | `pnpm lint:all` | [Gates: the gates, in order](https://www.prototemplate.com/docs/gates#the-gates-in-order) |
| One browser gate at a time | A parallel capture made `pnpm lint:lines:shell` fail on correct pages on 2026-10-01. | `siteRoutes()` in `scripts/lib/site-pages.mjs` | Every browser gate | [Gates: browser gates run one at a time](https://www.prototemplate.com/docs/gates#browser-gates-run-one-at-a-time) |
| Per file | A ratchet counts findings per file, so a line another session moves never reads as a new finding. | `scripts/lint/*.baseline.json` | `--update-baseline` after a cleanup | [Gates: ratchets](https://www.prototemplate.com/docs/gates#ratchets) |
| HTTP 400 or more exits 2 | A 404 page audits at about one line and would pass. | `scripts/lint/lines.mjs` | `pnpm lint:lines` | [Lines and seams: the line auditor's thresholds](https://www.prototemplate.com/docs/craft/lines#the-line-auditors-thresholds) |
| Five rows read by regex | The route list finds the first skill, motion package, archive entry and exploration and the newest post in data files, so a generator's output shape is load-bearing. | `firstSlug()` in `scripts/lib/site-pages.mjs` | `pnpm lint:registries` check 3 | [Scripts: first slugs read by regex](https://www.prototemplate.com/docs/scripts#first-slugs-read-by-regex) |

## Dev servers and the machine

| Value | Reason | Token or constant | Held by | Explained in |
| --- | --- | --- | --- | --- |
| Port 3005 | The shared dev server runs here, and every other worktree runs its own server on its own port. | `pnpm dev`; `PT_BASE` in the browser gates | Review | [Get started: run the site](https://www.prototemplate.com/docs/get-started#run-the-site) |
| 64 GB | A long-running shared server's `.next/dev` grew this large, so the restart deletes it. | `.next/dev` | Review | [Dev servers and builds: failure modes of next dev](https://www.prototemplate.com/docs/engineering/dev-servers#failure-modes-of-next-dev) |
| 900s or more | A cold image request on a loaded dev server hangs this long and times out a page check. | The image optimizer of `next dev` | Review | [Dev servers and builds: failure modes of next dev](https://www.prototemplate.com/docs/engineering/dev-servers#failure-modes-of-next-dev) |
| 2,880 minutes | gt-cloud's pnpm refuses any version published in the last two days, so `pnpm add` can fail on an unrelated dependency. | `minimumReleaseAge` in gt-cloud's `pnpm-workspace.yaml` | pnpm itself | [Dev servers and builds: a minimum release age for dependencies](https://www.prototemplate.com/docs/engineering/dev-servers#a-minimum-release-age-for-dependencies) |
| Two hours, and about 90 minutes | Claude Code stops a background shell task at two hours, so a job that may run past 90 minutes starts detached and writes its own process id. | `skills/gt-orchestration/references/harness-traps.md` | Review | [Agents on one machine: long commands](shared-machine.md#long-commands) |
| 128GB | The workstation ran out of application memory twice on 2026-10-12, so each heavy job is gated on its own memory estimate. | `headroom can-start --gb <n>` | Review | [Agents on one machine: memory and disk](shared-machine.md#memory-and-disk) |

## Pull requests and workflows

| Value | Reason | Token or constant | Held by | Explained in |
| --- | --- | --- | --- | --- |
| 420 to 900 CSS px wide, 620px tall at most, 24px of padding | A before and after crop is readable in a pull request body, where full-page captures render as strips. | `skills/gt-ship/references/pr-body.md` | Review | [Pull requests and CI: size and shape](pull-requests.md#size-and-shape) |
| 5/5 on the head commit | A gt-cloud pull request waits for this Greptile score, with every bot thread answered and resolved. | `skills/gt-ship/references/review-loop.md` | Review | [Pull requests and CI: review bots](pull-requests.md#review-bots) |
| 4096MB | The dashboard's type check outgrew Node's default 2GB heap in CI. | `--max-old-space-size` in gt-cloud's build | CI | [Pull requests and CI: CI signals that mislead](pull-requests.md#ci-signals-that-mislead) |
| About 1,800 words in, about 700 words out | A build fan-out starts from a spec of this size, and a build lane reports in this many words. | `skills/gt-orchestration/references/briefs.md` | Review | [Agent workflows: workflow shapes](workflows.md#workflow-shapes) |
| Three refuters, two of three to stand | A critical or major finding stands only when at least two refuters fail to refute it. | `skills/gt-orchestration/SKILL.md` | Review | [Agent workflows: refuting findings](workflows.md#refuting-findings) |
| 8.5 of 10 per dimension, 90 of 100 overall | A fresh critic scores quality work against a named reference, in every view. | `skills/gt-orchestration/references/convergence.md` | The critic | [Agent workflows: kinds of check](workflows.md#kinds-of-check) |
| 35 of 50 | A draft whose humanizer score on five axes totals less goes back for another revision. | `skills/gt-voice/SKILL.md` | Review | [Writing: the humanizer pass](https://www.prototemplate.com/docs/craft/writing#the-humanizer-pass) |

## Sources

- Prototemplate, read on 2026-10-21: `src/components/viewer/tokens.css`; `DESIGN.md` sections 2, 4 and 15; `deck/DECK-GRAMMAR.md`; `docs/GRAPHICS.md`; `scripts/lint/type.mjs`, `radius.mjs`, `lines.mjs`, `heads.mjs` and `seo.mjs`; `scripts/check/pagecheck/probes.mjs` and `cls.mjs`; `scripts/build/skills.mjs` and `scripts/skills/usage.mjs`; `src/lib/glyph-field.ts`, `studio-field.ts`, `prismatic-field.ts`, `dither.ts`, `fonts.ts` and `seo/route.ts`; `src/components/docs/demos/hooks.ts`; `src/app/craft/TransitionDemo.tsx`; `src/app/d/toolchain/diagrams/iso.ts` and `IsoFrame.tsx`; `graphics/build/gen-lib.js`; `scripts/media/mood-tone/standard.json`; `package.json`; the files in `public/fonts/`.
- The curated skills, read on 2026-10-21: `gt-brand` (`references/type.md`), `gt-motion` (section 2 and `references/traps.md`), `gt-diagrams` (`references/isometric.md`), `gt-dither` (`references/engines.md`, `references/pictures.md`), `gt-films` (`references/sound.md`, `references/kit.md`), `gt-performance` (`references/webgl-lifecycles.md`), `gt-website`, `gt-ship`, `gt-orchestration`, `gt-voice`, `gt-aesthetic` and `prototemplate`.
- The docs pages each row links to, which hold the measurements with their dates.
