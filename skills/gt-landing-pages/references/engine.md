# The landing engine: tokens and recipes

The values below are read from gt-cloud's `apps/landing/src/components/landing/shell/engine.css` and `landing/home/v0-pages.css` at origin/main on 2026-10-05, with Prototemplate's `src/app/d/toolchain/styles.css` noted where it differs. Read the files before relying on a number; the files win when they disagree with this page.

## Tokens on `.toolchain-root`

gt-cloud binds surfaces and lines to the shared `@generaltranslation/ui` tokens (`--color-background`, `--color-border`, `--color-border-strong`, `--color-card`), which already flip per theme. Prototemplate's prototypes state literal titanium alphas instead.

| token | light (gt-cloud) | dark (gt-cloud) | Prototemplate light |
| --- | --- | --- | --- |
| `--tc-paper`, `--tc-sunk`, `--tc-white` | `var(--color-background)` | `var(--color-background)` | `#ffffff` |
| `--tc-card` | `var(--color-card)` | `var(--color-background)` | `#ffffff` |
| `--tc-ink` | `#070707` | `#ffffff` | `#070707` |
| `--tc-ink-2` | `rgba(7, 7, 7, 0.63)` | `rgba(255, 255, 255, 0.66)` | same as gt-cloud |
| `--tc-ink-3` | `rgba(7, 7, 7, 0.45)` | `rgba(255, 255, 255, 0.48)` | same as gt-cloud |
| `--tc-ink-4` | `rgba(7, 7, 7, 0.27)` | `rgba(255, 255, 255, 0.3)` | same as gt-cloud |
| `--tc-hair` | `var(--color-border)` | `var(--color-border)` | `rgba(138, 143, 152, 0.26)` |
| `--tc-hair-2` | `--color-border` mixed 58% | `--color-border` mixed 72% | `rgba(138, 143, 152, 0.15)` |
| `--tc-hair-band` | `var(--color-border)` | `var(--tc-hair)` | `rgba(138, 143, 152, 0.34)` |
| `--tc-accent` | `#2f5ce0` | `#2f5ce0` | `#2f5ce0` |
| `--tc-dark` | `hsl(240 10% 3.9%)` | `var(--color-background)` | `#070707` |
| `--tc-panel` | `hsl(240 10% 3.9%)` | `var(--color-background)` | `#101010` |
| `--tc-panel-dim` | `rgba(255, 255, 255, 0.5)` (the AA floor on the panel) | same | same |
| `--tc-hatch` | `rgba(7, 7, 7, 0.085)` | `rgba(255, 255, 255, 0.07)` | `rgba(7, 7, 7, 0.085)` |
| `--tc-negative` | `#f0524f` (the blog hit list's X marks) | same | absent |
| `--tc-card-pad` | `clamp(17px, 1.9vw, 21px)` | same | same |
| `--tc-gut` | `clamp(20px, 3.1vw, 36px)` | same | same |
| `--tc-rail` | `1104px` | same | `1170px` |
| `--tc-sans` | `var(--font-sans), 'Inter', system-ui, sans-serif` | same | `var(--font-inter), ...` |
| `--tc-disp` | `var(--tc-sans)` | same | the same stack as `--tc-sans` |
| `--tc-mono` | `ui-monospace, 'SF Mono', Menlo, Consolas, monospace` | same | same |
| `--thread-gauge`, `--thread-gap` | `1.5px`, `3px` | same | same |

On `sgdh-root` pages in light, `landing/home/v0-pages.css` re-binds the panel family so panels become white plates: `--tc-panel: #ffffff`, `--tc-panel-ink: rgba(7, 7, 7, 0.88)`, `--tc-panel-dim: rgba(7, 7, 7, 0.58)` (the AA floor on white, about 4.8:1), `--tc-panel-faint: rgba(7, 7, 7, 0.3)`, `--tc-panel-rule: rgba(7, 7, 7, 0.12)`. The same block turns `.tc-band.tcb` to `--tc-paper` and sets its `--tc-hair-band` to `var(--tc-hair)`.

`--tc-rail` is 1104px in gt-cloud because the original pages' mains run `max-w-[1120px] px-2`, so their side lines land 1104px apart, and the rail, the footer and the shared navbar seat on those same edges. At 1100px every hairline doubled against the old sections by 2px a side.

Tailwind reaches the tokens through `apps/landing/src/app/globals.css`: `text-tc-ink`, `text-tc-ink-2`, `text-tc-ink-3`, `border-tc-hair`, `bg-tc-card`, `px-tc-gut`, `font-tc-mono` and the rest of the `tc-*` family.

## Type metrics

```css
.toolchain-root h1, .toolchain-root h2, .toolchain-root h3, .toolchain-root h4 {
  font-family: var(--tc-disp);
  font-weight: 500;
  line-height: 1.06;
  letter-spacing: -0.028em;
  margin: 0;
}
.toolchain-root p { margin: 0; }

.toolchain-root .tc-head { padding: clamp(54px, 6.4vw, 82px) var(--tc-gut) clamp(28px, 3.2vw, 38px); }
.toolchain-root .tc-head h2 { font-size: clamp(1.62rem, 2.5vw, 2.2rem); max-width: 22ch; }
.toolchain-root .tc-head p { margin-top: 13px; max-width: 60ch; font-size: 15px; line-height: 1.62; color: var(--tc-ink-2); }
```

These rules are unlayered, so they beat any Tailwind utility on the same element. On `sgdh-root` pages, `v0-pages.css` lifts the h2's 22ch cap and sets `white-space: nowrap` from 760px.

## Button faces

| class | height | padding | type |
| --- | --- | --- | --- |
| `.tc-btn` (md) | 38px | `0 17px` | 13.5px, weight 500, `letter-spacing: -0.005em` |
| `.tc-btn-sm` | 32px | `0 13px` | 12.5px |
| `.tc-btn-lg` | 44px | `0 20px` | 14px |
| under 720px: `.tc-btn` | 44px | | 15px |
| under 720px: `.tc-btn-sm` | 38px | | 13.5px |

- Every face: `border-radius: 6px`, a 1px border, `background-clip: padding-box` (a hair border over a hair fill would composite darker than the page's other hairlines).
- `.tc-btn-solid`: ink ground, `#f5f5f3` text; dark flips to a white ground with `#101010` text. On `sgdh-root` pages the ground holds on hover.
- `.tc-btn-line`: `--tc-hair` border, transparent ground; hover takes a 28% ink border and a 3% ink ground.
- `.tc-btn-onink`: white face for an ink ground, the same in both themes in the engine. `.tc-btn-onink-line`: 24% white border over a 42% ink ground with `backdrop-filter: blur(8px)`. The careers and 404 sheets re-key the faces they use for light, where their heroes are paper.
- `.tc-cta-ring::before`: `inset: -2px`, `border-radius: 8px`, `linear-gradient(90deg, #db2777, #2563eb, #9333ea, #16a34a)`, `filter: blur(4px)`, opacity 0.6, rising to 0.9 on hover and focus-within. The ringed button gets a 7px gap for its arrow.

## Hatch spacer

Two rules in `engine.css`, joined here (the `position` and `z-index` pair sits in its own block near the end of the file):

```css
.toolchain-root .tc-hatch {
  height: clamp(28px, 3.4vw, 40px);       /* 40px under 720px */
  border-top: 1px solid var(--tc-hair);
  border-bottom: 1px solid var(--tc-hair);
  background: repeating-linear-gradient(45deg, var(--tc-hatch) 0 1px, transparent 1px 8px);
  position: relative;
  z-index: 2;
}
```

The home's `.v0-hatch` uses the same height (36px under 720px), `border-block: 1px solid var(--tc-hair)` and the same gradient. Its neighbors yield: `.tc-sec:has(+ .v0-hatch)` drops `border-bottom`; `.v0-hatch:has(+ .tc-band)` and `.v0-hatch:has(+ .v0-dep)` drop the hatch's bottom edge; `.tcb + .v0-hatch` and `.v0-dep + .v0-hatch` drop its top edge.

## Registration cross

```css
.tc-rail > .tc-sec { position: relative; }
.tc-rail > .tc-sec::after {
  content: '';
  position: absolute;
  left: -5px; right: -5px; bottom: -5px;
  height: 9px;
  z-index: 2;
  pointer-events: none;
  --cross-ink: rgba(10, 11, 13, 0.38);      /* dark: rgba(255, 255, 255, 0.34) */
  background:
    linear-gradient(var(--cross-ink), var(--cross-ink)) 4px 0 / 1px 9px no-repeat,
    linear-gradient(var(--cross-ink), var(--cross-ink)) 0 4px / 9px 1px no-repeat,
    linear-gradient(var(--cross-ink), var(--cross-ink)) calc(100% - 4px) 0 / 1px 9px no-repeat,
    linear-gradient(var(--cross-ink), var(--cross-ink)) 100% 4px / 9px 1px no-repeat;
}
```

The rules are scoped to the home roots (`.toolchain-root:is(.sgdh-root, ...)`; in gt-cloud, every `sgdh-root` page), which also set `overflow-x: clip`. The section after a full-bleed band paints its top pair with the same recipe on `::before` at `top: -5px`.

## Framed rows

```css
.toolchain-root .tc-row:has(> .tc-cell.is-framed) {
  background: var(--tc-hair);
  border-top: 0;
  padding: 1px 0;
}
.toolchain-root .tc-row:has(> .tc-cell.is-framed) + .tc-row:has(> .tc-cell.is-framed) { padding-top: 0; }
.toolchain-root .tc-hatch + .tc-row:has(> .tc-cell.is-framed) { padding-top: 0; }
.toolchain-root .tc-cell.is-framed > .tc-card {
  padding: var(--tc-card-pad);
  border: 0;
  border-radius: 12px;                     /* 0 on sgdh-root pages */
  background: var(--tc-card);
}
```

`BentoRow` renders `tc-row shell-row grid gap-px bg-(--tc-hair)` and collapses to one column below the lg breakpoint, where the same gaps carry the stacked seams. `eqHeads` (on by default) aligns every cell head in a row to one height through `--shell-head-h`.

## The mobile ladder

Declared on `.toolchain-root` in the late `@media (max-width: 720px)` block of `engine.css` (DESIGN.md section 12 holds the same table).

| slot | value |
| --- | --- |
| `--tcm-h2` / `--tcm-h2-lh` | 2.25rem / 1.18 |
| `--tcm-h3` / `--tcm-h3-lh` | 1.375rem / 1.3 |
| `--tcm-h4` / `--tcm-h4-lh` | 1.125rem / 1.35 |
| `--tcm-lead` / `--tcm-lead-lh` | 17px / 1.55 |
| `--tcm-body` / `--tcm-body-lh` | 16px / 1.6 |
| `--tcm-small` / `--tcm-small-lh` | 14px / 1.55 |
| `--tcm-kick` | 13px |
| `--tcm-quote` / `--tcm-quote-lh` | 22px / 1.4 |
| `--tcm-head-pt` / `--tcm-head-pb` | 72px / 36px |
| `--tcm-gap-h2` / `--tcm-gap-h3` | 18px / 14px |
| `--tcm-cell-pad` | 28px |
| `--tcm-box-pt` / `--tcm-box-pb` / `--tcm-box-gap` | 36px / 38px / 28px |
| `--tc-card-pad` (restated) | 20px |

Consumers read `var(--tcm-h2, 36px)`, `var(--tcm-lead, 17px)` and so on. The box gap is card-scoped (`.tc-card > .shell-cell-head { margin-bottom: var(--tcm-box-gap, 28px) }`) because cells are flex columns whose margins never collapse.

## Breakpoints in use

- `engine.css` media queries: 1120px, 1023px, 900px, 860px (the nav links hide), 759px, 720px (the ladder), 620px (the hero buttons fill the column).
- Utilities: `max-[881px]:` is the engine's 880px wide and narrow cut, used by the Deploy band; `max-[640px]:` and `max-[560px]:` appear in single components.
- Heads on `sgdh-root` pages go one line from 760px.
- The scroll story's stage: `(max-width: 1020px) and (min-height: 500px)`, with a short-window variant at `max-height: 639px`.

## The scroll story's stage tokens

From `sections/fullstack/fullstack.css`:

```css
@media (max-width: 1020px) and (min-height: 500px) {
  .toolchain-root .tcb.v0-stack.is-stage {
    --v0sm-top: 59px;                                    /* the sticky nav's 58px bar and its hairline */
    --v0sm-stage-h: calc(100dvh - var(--v0sm-top));      /* reach */
    --v0sm-stage-h-stable: calc(100svh - var(--v0sm-top)); /* layout */
    --v0sm-bar-gap: calc(var(--v0sm-stage-h) - var(--v0sm-stage-h-stable));
    --v0sm-tw: calc((0.55 * var(--v0sm-stage-h-stable) - 56px) * 0.8538);
  }
}
```

`0.8538` is `StackTower`'s view width over its tower height (214.133 / 250.8); change them together. The rails' lower reach is `bottom: calc(-1 * var(--v0sm-bar-gap))`.

From `sections/fullstack/FullStack.tsx`: `const READ_LINE = 0.55;` and `const HIGHLIGHT_LINE = 0.8;`, measured per beat by `measureAt(k, line)` from the copy block's center and the previous beat's flow bottom.
