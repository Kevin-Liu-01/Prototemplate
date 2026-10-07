# Measures of the references

These are the numbers of the references Kevin judges against, read from the source files on 2026-10-05. Match them before inventing a value, and read the live file again when a number here looks stale: the files win.

## How to measure

1. Open the reference and the new surface at the same width and theme. Prototemplate's dev server runs on port 3005 (`pnpm dev`, launch config `prototemplate-dev`). `/deck` frames `/brand-deck.html`, so measure the deck at `/brand-deck.html` itself. The Dossier is `/d/singularity-dossier`. gt-cloud's landing and dashboard run on their own dev servers (see gt-cloud's `.agents/skills/gt-landing` and `gt-dashboard`).
2. Read the computed values of the matching element: font size, line height, weight, tracking, feature list, color token, padding and gaps. DevTools' computed panel works for one element.
3. For heads and leads, run the script on both pages with the same flags and compare the rows:

   ```bash
   node skills/gt-aesthetic/scripts/measure-type.mjs http://localhost:3005/brand-deck.html --storage gt-deck-mode=book --sel ".book-head h1, .book-head p"
   node skills/gt-aesthetic/scripts/measure-type.mjs http://localhost:3005/motion
   ```

   It prints size, weight, line height, tracking, line count, characters per full line and contrast at 1440 and 390 in both themes, and flags what the review standard calls a defect.
4. Read lines and junctions at `deviceScaleFactor: 2` crops. A full-page capture hides a 1px double.

## Tokens

From `$PROTOTEMPLATE/deck/parts/head.html`. The shell mirrors them as `--pt-*` in `src/components/viewer/tokens.css`, and gt-cloud's dashboard plate as the deck's own names in `apps/dashboard/src/app/brand-tokens.css`, where light titanium is the darker `#6e737c`.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--paper` | `#ffffff` | `#070707` | the ground |
| `--ink` | `#070707` | `#f2f2f0` | content text, active state, focus |
| `--ink-2` | `#3a3d44` | `#b9bcc3` | secondary text, leads |
| `--titanium` | `#8a8f98` | `#8a8f98` | captions, counters, keys |
| `--hair` | ink at 18% | ink at 22% | structural lines |
| `--hair-soft` | ink at 9% | ink at 10% | row lines |
| `--plate` | ink at 3.5% | ink at 5% | the one second surface |
| `--cross` | ink at 38% | white at 34% | registration crosses on the sheet frame |
| `--edge` (`--pt-edge` in the shell) | ink at 62% | ink at 55% | frames of pictures and captures only |
| code panel | `#101010` | `#101010` | code in white monospace |

## Contrast

Computed with the WCAG formula on 2026-10-05.

| Text | On | Ratio |
| --- | --- | --- |
| ink `#070707` | paper `#ffffff` | 20.14 |
| ink `#f2f2f0` | paper `#070707` | 17.97 |
| ink-2 `#3a3d44` | `#ffffff` | 10.88 |
| ink-2 `#b9bcc3` | `#070707` | 10.59 |
| titanium `#8a8f98` | `#ffffff` | 3.25 |
| titanium `#8a8f98` | `#070707` | 6.20 |
| dashboard light titanium `#6e737c` | `#ffffff` | 4.77 |
| GT blue `#2f5ce0` | `#ffffff` | 5.63 |
| GT blue dark lift `#86a8ff` | `#070707` | 8.69 |

Titanium at `#8a8f98` fails the 4.5:1 floor for text under 24px in the light theme. The dashboard plate sets light titanium to `#6e737c` for its 13px captions and keys. On any other light surface, text a reader needs is set in ink-2.

## The deck sheet

The slide is 1600 by 900. Rails sit 56px in from each edge, the slide is inset 57px and padded 72px top and bottom and 80px left and right, which leaves about 1326 by 642.

| Element | Size / line height | Weight | Tracking | Color |
| --- | --- | --- | --- | --- |
| `h1` | 88 / 1.02 | 500 | -0.025em, cv11 ss01, balance | ink |
| `.big` | 72 / 1.06 | 500 | -0.025em | ink |
| `h2` | 44 / 1.1, 18px below | 500 | -0.025em | ink |
| `.lead` | 26 / 1.45 | 400 | 0 | ink |
| `p` | 22 / 1.5, 18px between paragraphs | 400 | 0 | ink |
| `.rows` | 20 / 1.45 | 400, key `b` 500 | key -0.01em | ink |
| `.plain` rows | 24 / 1.4 | 500 | -0.01em | ink |
| `.cap` | 15 / 1.45 | 400 | 0 | titanium |
| SVG labels | 20 (`.sm` 18), `.lab` 26 | 400, `.lab` 500 | `.lab` -0.01em | ink-2, `.lab` ink |
| `.counter` | 13 | 400 | +0.02em, tabular | titanium |

Text under 15px on the sheet is a defect. Measures: `.max` 32ch and `.max-p` 56ch.

Layout gaps: `.split` 56px between head and body; `.cols` 72px between columns (5fr/7fr, `.even` 1fr/1fr, `.wide-right` 4fr/8fr); `.stack` 22px; `.pair` 28px with 12px to the caption; `.rows` 16px block padding, 32px column gap, key column 240px (`.narrow` 180px); `.plain` rows 12px block padding.

Row lines on the sheet: `.rows` draws a `--hair` rule above the table and under each row. `.plain` draws `--hair` above the list, `--hair-soft` under each row and `--hair` under the last. Screenshots carry a 1px `--hair` border on the `--plate` ground.

## The deck's book view

The book view is the reference for a page head on Prototemplate (`.book-head` in `head.html`).

| Element | Value |
| --- | --- |
| page column | max 1280px, padding 44px 56px 120px, 36px between blocks |
| head grid | title column and a right meta column, 32px gap, aligned to the end |
| title `h1` | 44 / 1.04, weight 500, -0.025em; 32px under 900px wide |
| lead `p` | 15.5 / 1.5, ink-2, 14px above, max-width 62ch |
| meta | 13 / 1.5, titanium, right aligned, no wrap |
| head rule | 26px under the head, 1px `--hair` (the structural role) |
| contents rows | 14px weight 500 -0.01em, 9px block padding, `--hair-soft` rules, 4 columns (2 under 900px) |
| section head | 128px number column, 28px gap, 30px above, `h2` 32 / 1.05 |
| page number | 24px weight 500 -0.02em tabular over a 12.5px titanium label |

`max-width: 62ch` is about 83 to 86 Inter characters, because `1ch` is the width of Inter's zero (about 0.63em). The deck's own lead measured 84 characters a line and four lines at 1440 on 2026-10-05. A lead that should read in two or three lines at 60 to 70 characters needs a measure in em (about 30em), which is what the shell's `--pt-measure-lead` sets.

## The deck viewer chrome

| Element | Value |
| --- | --- |
| toolbar row | 52px, `--hair` bottom rule |
| sidebar | 208px, `--hair` right rule (the shell widens it to 256px in thumbnail density) |
| icon buttons | 32px square, 16px glyph, border only on hover and `.is-on` |
| index panel | 460px |
| scrollbar | 4px gutter, 2px thumb that widens to 4px on hover, no track rule |
| motion | 120 to 220ms (`--pt-dur-*` in the shell's `tokens.css`); things move by transform and opacity, the sidebar column's width is the one exception, hover colors and borders change over 120ms, and reduced motion sets every duration to 0 |

## The dashboard plate

From `$GT_CLOUD/apps/dashboard/src/app/brand-tokens.css` on origin/main (the classes and the plate tokens) and Kevin's ladder and rhythm round of 2026-09-28 (the field gaps, the card facts and the app rows, which have no token).

| Element | Value |
| --- | --- |
| page heading `.typo-page-heading` | 30 / 1.08, weight 500, -0.025em, cv11 ss01, balance |
| lede `.typo-lede` | 15 / 1.55, ink-2 |
| key `.typo-key` | 13 / 1.45, weight 500, titanium, 0 tracking |
| caption `.typo-caption` | 13 / 1.45, +0.01em, titanium |
| card facts | 12px, ink-2, +0.01em (13px read as too large, 2026-09-28) |
| buttons and labels | -0.006em |
| inputs and primary buttons | 44px tall, 15px text on onboarding and auth |
| column padding | 48px top and bottom (32 and 24 under 880px tall) |
| mark to heading | 40px (30 under 880px tall), `--plate-mark-gap` |
| heading to lede | 26px (16 under 880px tall), `--plate-heading-gap`, the mark gap less the step counter's 14px, so the heading sits as far above its lede as below the counter's rule |
| between sections | 40px (24 under 880px tall), `--plate-section-gap` |
| between questions | 16px (12 under 880px tall) |
| between fields | 28px; 10px under a label |
| sidebar rows | 40px |
| ledger cells | 14px |
| weight cap | h1 to h4, `b`, `strong`, `.font-semibold` and `.font-bold` compute 500 |
| shadows | every shadow utility is `none` on a plate page |
| plate frame | `--plate-edge` 56vw and the column `clamp(464px, 31vw, 640px)` from 1200px wide, equal `--plate-pad` on both sides |

## The landing hero's field

The measure of strength for any field on a product surface. On gt-cloud origin/main the hero draws the studio's bayer-8x8 preset through `createStudioField` (`$GT_CLOUD/apps/landing/src/lib/studio-field.ts`, mounted by `components/landing/shared/HeroField.tsx`). The composite: an isolated host cell (`.tc-hero-cell` in `engine.css`), the canvas screen-blended at opacity 0.55 under a horizontal mask (0.72 at both edges, 0.12 at the middle, in `hero-terminal.css`), and in the light theme `filter: invert(1) hue-rotate(180deg) brightness(1.07) saturate(1.15)` (`v0-pages.css`) so the clouds print pale blue on paper. Kevin approved this field on 2026-09-25 ("as tasteful as our dither shader in hero of landing").

The dashboard copy of the field (`packages/ui/src/lib/studio-field.ts`, mounted by `FieldGround` with the mask faint on the plate's side) lives on the branch `k/dashboard-shell-ia` and has not reached main. On main the plate pages draw `FieldStack` (`apps/dashboard/src/components/brand/FieldStack.tsx`): the dithered globe on sign-in and one artifact picture per onboarding step, from `packages/ui/src/lib/dither.ts` and `picture-field.ts`, the pictures at 0.62 opacity in dark and 0.7 in light. `gt-dither` owns the engines.

## Artifact pictures

The Blue Marble standard (`$PROTOTEMPLATE/docs/ARTIFACT-PICTURES.md`, `scripts/mood-tone/standard.json`): an 8x8 Bayer screen at 1 CSS px cells, white at 0.62 over `#070707` in dark and `#070707` at 0.7 over white in light, tone floor 10. Per picture only the crop, the channel, the polarity and the kind are chosen; the levels are solved. A mood plate in the deck carries the title at 44px, one or two sentences and a credit; a plate in the dashboard holds two lines at most.

## Mobile

- Under 720px the landing's type and spacing come from the `--tcm-*` ladder (DESIGN.md section 12): h2 2.25rem/1.18, h3 1.375rem/1.3, lead 17/1.55, body 16/1.6, small 14/1.55. Mobile has its own ladder and its own layout decisions.
- No copy within 20px of a hairline (DESIGN.md section 12, the box-air standard).
- Tap targets: 44px is the target and under 40px is a defect (`scripts/pagecheck`).
- Kevin's laptop viewport is 1527 by 814, so a plate page compresses under 880px tall and is checked at that size.
