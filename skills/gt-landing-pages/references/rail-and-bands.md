# Rail and bands

`SKILL.md` points here: the rail, the bands, the hatch spacers, the registration crosses and the rule that the row owns every seam, with the classes and files that hold each. Moved from `SKILL.md` on 2026-10-10, unchanged.

## The column

The page is one ruled column. `.tc-rail` (the column wrapper on the home, pricing, enterprise, careers, contact, blog, legal, supported locales and report card pages, and around the footer in `SiteFooterMount.tsx`) is `min(var(--tc-rail), 100%)` wide and draws the column's two lines once with `border-inline: 1px solid var(--tc-hair)`. A border rounds to whole device pixels at any zoom, which a background-filled box does not, so the rail is a border.

- A band inside the wrapper (`<section className='tc-sec v0-<slug>'>`) draws no side rails. `.tc-sec` draws only its bottom rule, and the last section draws none.
- A full-bleed band (the feature bands `.tc-band.tcb`, the close band `.v0-dep`) spans the viewport and draws its own inner pair once, at the column edges, from its `-in` column. On the home these bands are children of `main.tc-rail` that break out with `margin-inline: calc(50% - 50vw)` (`fullstack.css`, `context.css`, `Deploy.tsx`); on Prototemplate's `/d/toolchain` the band sits at page level. `Deploy.tsx` is the model: the `v0-dep-in` column carries `w-[min(var(--tc-rail),100%)] border-x border-x-[var(--tc-hair-band)]`. The band never adds a pair beside the column.
- In dark, `--tc-hair-band` aliases `--tc-hair`, so the rail runs one color through bands and wrapped sections. Prototemplate's toolchain engine gives light bands a stronger line (`--tc-hair-band` 0.34 against `--tc-hair` 0.26), because a line on ink needs more alpha than a line on paper to look equal. In gt-cloud both resolve to `--color-border` in light, and the `sgdh-root` light skin restates `--tc-hair-band: var(--tc-hair)` on its paper bands.
- The outer pair at plus or minus 10px is retired: `.tc-rail::before`, `.tc-nav-in::before`, `.tc-band::after`, the `--tc-rail-outer` token and gt-cloud's `Rails` component were deleted in gt-cloud #5007 (Kevin, 2026-09-28: "make sure there's no rules that lead to two side rails"). gt-landing's App Structure list still names `Rails`; the export is gone from `shell/Bento.tsx`. Prototemplate keeps a `Rails` in `src/components/shell/Bento.tsx` that draws the single pair for a full-bleed band outside a wrapper.
- Call the column's lines "the page's rail pair, drawn once". The brand's two-hairline connector is "the doubled line" or "the thread". The words "outer pair", "outer rail" and "doubled rails" fail Prototemplate's `retired-rail-vocabulary` check.

### Hatch spacers

- Home bands are separated by `<div aria-hidden className='v0-hatch' />` in `HomePage.tsx`. Rows inside one section are separated by `.tc-hatch`. Both are a `clamp(28px, 3.4vw, 40px)` strip with a 1px `--tc-hair` rule on each edge over a 45 degree hatch in `--tc-hatch`. Under 720px `.tc-hatch` is 40px and `.v0-hatch` 36px.
- The hatch owns both of its edges. The section before it drops its bottom rule (`.tc-sec:has(+ .v0-hatch)`), and next to a full-bleed band the band's own border stands and the hatch drops that edge.
- `.tc-hatch` carries `position: relative; z-index: 2`, because reveal tweens leave transforms on the framed cards above it and their stacking contexts would paint over its top rule.

### Registration crosses

- On `sgdh-root` pages, each `.tc-rail > .tc-sec::after` paints a cross at both bottom corners where the seam meets the rail: 9px arms, 1px thick, hanging 5px past the rail, in `--cross-ink` (`rgba(10, 11, 13, 0.38)` light, `rgba(255, 255, 255, 0.34)` dark). The next section's top corners are the same points, so one pseudo per seam is enough.
- The full-bleed bands (`.tcb`, `.v0-dep`) clip their own pseudos, so the section after a band paints its own top pair with `::before`. Bands draw no crosses.
- The arms reach past the rail, so the page root sets `overflow-x: clip`. `overflow: hidden` would make a scroll container and stop the sticky figures further down the page.

### The row owns every seam

- Grids of cells are `BentoRow` and `BentoCell` from `apps/landing/src/components/landing/shell/Bento.tsx`. The row is a grid with `gap-px` over a `--tc-hair` background, so the 1px gaps are the seams. Cells have no border props.
- A framed cell (`BentoCell framed`, which always adds `.is-framed`) shows the row's hairline background through a 1px reveal: the framed row sets `padding: 1px 0`, its sides yield to the rail, and where two framed rows meet only the first keeps its strip. A framed cell without the class collects the gap seam and a border-top, which is a 2px double line.
- Flush at the rail: where a row meets a line that already exists, the cell sits flush and drops that side's reveal. No reveal runs beside a rail, and no border runs beside a seam.
- A translucent background under a translucent border composites darker than every other hairline (the self-stack). Clip it with `background-clip: padding-box`. Two stacked translucent grounds do the same, so cells stay transparent and the row paints the one background.
- Every structural line runs rail to rail and top to bottom. There are no floating bordered cards and no heads floating in whitespace; a head sits in a ruled `tc-head` or in the cell's own head zone (`.shell-cell-head`).
- On `sgdh-root` pages, structural surfaces are square: the hero card, the terminal window, framed cell cards and band art mats take `border-radius: 0`. Controls keep small radii (buttons 6px).
