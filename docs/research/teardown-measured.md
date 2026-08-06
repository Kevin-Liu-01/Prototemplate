# viteplus.dev + oxc.rs — measured teardown

Values below were read from `getComputedStyle` on the live sites, not estimated. Treat them as
authoritative.

## The headline finding: one design system, inverted

viteplus.dev and oxc.rs are **the same system in two modes**. Every type value is identical; only
the base flips. viteplus's heading colour is literally oxc's page background.

|                | viteplus.dev (main) | oxc.rs (product)   |
|----------------|---------------------|--------------------|
| page background| `#FFFFFF`           | `#16171D`          |
| body text      | `#000000`           | `#FFFFFF`          |
| heading colour | `#16171D`           | `#FFFFFF`          |

This is why "main page like viteplus, product pages like oxlint" is coherent rather than two
briefs: build ONE frame, run the marketing page in light mode and product pages in dark mode.

## Type scale — identical on both

Display face is a custom **"APK Protocol"**, always at **weight 500**. Not semibold, not bold,
never heavy. Restraint is enforced at the weight level, which is why the pages read as calm even
at 60px. Body is **Inter 16px**.

| role | size | line-height | tracking | notes |
|------|------|-------------|----------|-------|
| H1 (hero) | 60px | 67.2px (1.12) | **-3px** (-0.05em) | very tight |
| H2 (section) | 48px | 48px (1.00) | -1.2px (-0.025em) | leading equals size |
| H4 (cell/product heading) | 30px | 36px (1.2) | normal | tracking relaxes as size drops |
| body | 16px | — | — | Inter |

The pattern: **tracking tightens as size grows, leading compresses toward 1.0 at display sizes.**
Our Switzer equivalent should follow the same curve — tight negative tracking at 60px, none at 30px.

## Palette

- Ink `#16171D` · Paper `#FFFFFF`
- Rules: `#E5E4E7` in light mode, `#3B3440` in dark mode
- Muted text: `#867E8E` (by far the most used, 92 elements) and `#98989F`
- Deep panel: `#14121A` (slightly darker than page ink, for terminal/code surfaces)
- Accent, oxc: `#32F3E9` cyan — appears on only 28 elements across the whole page. Restraint is
  the rule, not the exception.
- Translucent border variant `oklab(0.337 0.015 -0.017 / 0.3)` at radius 4px is the single most
  common bordered element (22 instances) — the chips and inline code blocks.

## The structural trick worth stealing: partial borders

Grid cells do **not** each carry a full box. The measured border patterns are partial and
radius-0:

```
1px/1px/0px/1px   top + right + left, no bottom     (10 instances)
0px/1px/0px/0px   right only                         (8)
0px/1px/0px/1px   right + left                       (5)
0px/0px/1px/0px   bottom only                        (4)
```

Adjacent cells therefore **share a single hairline** instead of stacking two. This is what makes
the grid read as one ruled sheet rather than a tray of cards, and it is the detail most likely to
be missed when rebuilding. Radius stays **0px on grid cells**; 4px appears only on small interior
objects (chips, buttons, code panels), and 8px only on the terminal window's top corners
(`8px 8px 0 0`).

## Grid

Container 1440px, content 1438–1440px. Recurring child widths: **719/720** (halves), **639/599**
(thirds and a narrower two-up), **401** (quarter). So a 1440 field split into halves and thirds
with a hairline between — not a 12-column token system.

Terminal/code surface measured at 992×527 with `28px 32px` padding, background `#111111`, radius
`8px 8px 0px 0px` — it sits flush to the bottom of its cell.

## What this means for GT

1. Build one frame, two modes. Marketing light, product dark.
2. Cap display weight at 500 and let size plus negative tracking do the work.
3. Use partial borders so the page is a ruled sheet. Radius 0 on cells.
4. One accent, and hold it to roughly two dozen appearances on a long page.
5. Muted grey `#867E8E`-equivalent carries most secondary text; it is the workhorse, not the ink.
6. Cell widths come from halving and thirding a 1440 field, so any bento must resolve to those
   fractions rather than arbitrary spans.
