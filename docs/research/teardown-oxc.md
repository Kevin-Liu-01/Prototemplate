# Forensic teardown — oxc.rs (and the Oxlint pages inside it)

Reference target for General Translation product pages. Locadex is the first.

**Method.** Every number below was read off the shipped artefacts, not eyeballed:
`https://oxc.rs/` HTML (140 KB), the compiled stylesheet `/assets/style.D7bCMHgV.css`
(241 KB, Tailwind v4 `@theme` + custom classes), the page component chunk
`/assets/index.md.6P7bpMxJ.lean.js` (contains the readable Vue source for `Hero`,
`FeatureToolbar`, `PerformanceBar`, `FeatureParser`, `FeatureMinifier`, `RiveAnimation`),
the four row screenshots and two `.riv` animations (embedded WebP payloads extracted and
viewed), plus live `getComputedStyle`/`getBoundingClientRect` measurements at 1800×1000,
1440×900 and 390×844 in dark mode. Local copies: `scratchpad/oxc/`.

Stack: VitePress + Vue + Tailwind v4 + Reka UI, one stylesheet shared with **viteplus.dev**,
accent swapped by a `data-variant` attribute on `:root`. Both sites are the same design system.

---

## 0. The one-sentence summary

A single ruled column, 1440 px wide, closed on the left and right by 1 px hairlines, cut into
bands by 1 px top borders; six product rows inside it, each a 50/50 split of a fixed copy
skeleton against a right-hand visual that is *deliberately different every row*; one mono
sticky index bar with a 2 px white underline; one accent hue (aqua `#32f3e9`) allowed in five
places and nowhere else. All containment comes from the page grid. There is not a single
nested card, border-box, or drop shadow in the content area.

---

## 1. Page skeleton

### 1.1 Root

```html
<div class="marketing-layout" data-theme="dark" data-variant="oxc">
```

`data-theme="dark"` is **hardcoded in the markup**. The marketing shell cannot be lightened by
the site's theme toggle; only the docs shell responds. A complete light token set exists and
goes unused on the marketing pages.

```css
.marketing-layout          { background: var(--color-white);   color: var(--color-primary); }
.marketing-layout[data-theme=dark] { background: var(--color-primary); color: var(--color-white); }
```

### 1.2 The column: one class does all of it

Every band on the page — header, hero, statement, tool bar, each product row, sponsor wall,
footer — is a `.wrapper`.

```css
.wrapper { margin-inline: auto; position: relative; overflow-x: clip;
           border-color: var(--color-stroke); }           /* nickel in dark */
@media (width >= 48rem) {                                  /* 768px */
  .wrapper { border-left: 1px; border-right: 1px;
             max-width: calc(100vw - 2rem); } }
@media (width >= 90rem) {                                  /* 1440px */
  .wrapper { max-width: 90rem; } }                         /* 1440px */
```

Measured behaviour:

| viewport | column width | gutter each side | vertical side rules |
|---|---|---|---|
| 390 | 390 (`max-width: none`) | 0 | **absent** |
| 1440 | 1429 (= 1440 − scrollbar) | ~0 | present, at the screen edge |
| 1800 | **1440** | 175 / 186 measured | present, ~180 px in from each edge |

So the two vertical hairlines are literally the `.wrapper`'s own `border-left` /
`border-right`. Below 768 px they switch off and the page goes edge-to-edge. Rule colour is
`--color-stroke #e5e4e7` in light and `--color-nickel #3b3440` in dark (measured
`rgb(59, 52, 64)`).

### 1.3 How each band is bounded

Every band declares **`border-t: 1px` only**. No band has a bottom border; the next band's top
border serves. The result is one continuous ladder of hairlines from the header to the copyright
line, all in nickel, with no doubling and no gaps.

Inside a product row the two cells are **not** divided — measured `border-left-width: 0px` on
the second cell. Only the hero adds `divide-x`, so the hero is the one band with a centre rule.
Consequence: the split rows read as one wide cell containing two zones, and the hero reads as
two facing panels. That is the entire hierarchy signal.

### 1.4 Tick marks (the chapter joints)

```css
.wrapper--ticks::before, .tick-left::before {
  content:""; width:0; height:0; position:absolute; top:-5px; left:0;
  border:5px solid transparent; border-left-color: var(--color-nickel); }
.wrapper--ticks::after,  .tick-right::after {
  content:""; ... top:-5px; right:0;
  border:5px solid transparent; border-right-color: var(--color-nickel); }
```

Two 5 px solid CSS triangles at the top corners of a band, pointing inward, sitting exactly on
the hairline (`top:-5px` centres them on it). They look like ruler ticks or a caliper closing
on the column.

Used **six times on a ~6000 px page**, only at chapter joints:

1. a zero-height rule directly under the header — `<div class="wrapper relative h-0 tick-left tick-right">`
2. the hero band
3. a 1 px rule immediately above the sticky tool bar
4. the sponsor CTA band
5. the footer link band
6. the footer legal strip

**Never on the six product rows.** That restraint is the whole point: ticks mark where a
chapter starts, not where a row starts.

### 1.5 Header and announcement strip

- Announcement strip: `hidden md:block`, `h-10` (40 px), full-bleed background image at
  `brightness-60`, 20 px logo, `text-xs font-mono uppercase tracking-wide` label
  ("Announcing Type-Aware Linting Stable"), an arrow chip, a dismiss `✕` at `right-2`.
- Header: `header.wrapper px-6 py-5`, **81 px** measured, `position: relative` — it does **not**
  stick. Bottom hairline. Nav links are `font-heading` (APK Protocol) 16 px; two flyout groups
  (Tools, Resources); a `⌘K` search button; four social glyphs.

Because the header scrolls away, the tool bar's `top: 0` parks it flush against the viewport top.

### 1.6 Spacing rhythm (measured)

| band | vertical padding |
|---|---|
| statement band ("Foundation of Modern JavaScript Tooling") | `py-14` 56 → `sm:py-28` **112** |
| product row | none on the section; cells carry `px-5 py-6` → `md:p-10` **40** |
| sponsor CTA | `py-14` 56 → `sm:py-30` **120** |
| footer links | `pt-10/16` → `pb-16/40` (**160** bottom on desktop) |
| footer legal | `py-5` **20** |
| tool bar | `py-4` on the anchors → **53 px** total (52 + 1 px rule) |

Inside a product row's copy cell: `gap-15` **60** between blocks, `gap-5` **20** inside the copy
stack, `gap-3` **12** between checkmarks, `mt-6` **24** extra above the button (so 44 px total
below the list). Benchmark cell: title `mb-10` **40**, bars `gap-6` **24**, footnote `mt-10` **40**.

The whole page runs on `4 · n`, dominated by 20 and 40: `12 / 20 / 24 / 40 / 56 / 60 / 64 / 80 / 100 / 112 / 120 / 160`.

Measured band heights at a 1440 column: hero 623, statement 321, tool bar 53, rows
470 / 476 / 459 / 474 / 519 / 415, sponsor CTA 445, sponsor wall 566, footer CTA 442, footer
links 541, legal 61. Rows are ~460–520 px — height comes from content, never from a fixed value.

---

## 2. The tool/framework tab bar

Component `FeatureToolbar`. Six hardcoded entries mapping to the six section ids:

```js
[{id:'feature-linter',label:'linter'}, {…'formatter'}, {…'parser'},
 {…'transformer'}, {…'resolver'}, {…'minifier'}]
```

### 2.1 Shell

```html
<section class="wrapper sticky top-0 border-b bg-primary z-10 overflow-hidden">
  <ul class="w-full sm:grid sm:grid-cols-6 flex items-center divide-x divide-nickel
             relative overflow-x-auto scrollbar-hide
             touch-none sm:touch-auto select-none sm:select-auto">
    <div class="absolute bottom-0 h-0.5 bg-white transition-all duration-300 ease-out"
         style="left:0px; width:99px"></div>
    <li class="flex-shrink-0"><a class="text-white h-full text-sm font-mono tracking-tight
        py-4 px-6 sm:px-0 flex justify-center gap-1.5 transition-colors duration-200
        whitespace-nowrap" href="#feature-linter"><span>linter</span></a></li>
    …
```

Measured: 53 px tall, `position: sticky`, `top: 0`, `z-index: 10`, background **opaque**
`rgb(22,23,29)`, bottom border `1px rgb(59,52,64)`.

### 2.2 Layout ≥ 640 px

`ul` becomes `grid-cols-6`; measured
`grid-template-columns: 237.83px 237.84px 237.83px 237.84px 237.84px 237.83px` at a 1429 column.
Each `li` except the last carries `border-right: 1px #3b3440` (Tailwind v4 `divide-x` compiles
to `> :not(:last-child)` + border-right — verified by measurement). So the bar is **six equal
ruled cells**, continuing the page's rule language rather than introducing a new one. Anchors
are `sm:px-0` + `justify-center`, so labels sit dead centre in each cell.

### 2.3 Layout < 640 px (measured at 390)

`ul` reverts to `flex` with `overflow-x: auto` + `scrollbar-hide` + `touch-none select-none`.
Tabs become content-width with `px-6`: measured 98 / 123 / 98 / 140 / 115 / 115 px,
`scrollWidth 693` against `clientWidth 390`. The 1 px dividers stay. Because `touch-action` is
`none`, **the user cannot swipe the strip** — it is scrolled only by the component, which
centres the active tab as the page scrolls:

```js
ul.scrollTo({ left: a.offsetLeft - ul.clientWidth/2 + a.offsetWidth/2, behavior:'smooth' })
```

### 2.4 Indicator treatment

A 2 px pure-white bar pinned to `bottom: 0`, absolutely positioned inside the `ul`, driven by
inline `left` / `width` from the active anchor's `offsetLeft` / `offsetWidth`. It therefore
**slides and resizes** to the exact cell it marks. Measured transition:
`all 0.3s cubic-bezier(0, 0, 0.2, 1)`.

Type: `text-sm font-mono tracking-tight` → KH Teka Mono 14 px, letter-spacing −0.35 px,
`whitespace-nowrap`, single lowercase words. Active `#fff`, inactive `#867e8e`,
`transition-colors 200ms`. That is the entire state vocabulary: colour + underline. No pill,
no background, no border, no weight change.

### 2.5 What swaps beneath it — nothing

All six `section#feature-*` elements are in the DOM simultaneously (verified in the served
HTML). The bar is **a sticky table of contents with scroll-spy**, not a tab panel. Nothing
mounts, unmounts, or crossfades. This is the single most transferable decision on the page: it
gets the affordance of tabs with none of the state, and the page stays linkable, scrollable and
printable.

Click handler (paraphrased from the shipped source):

```js
e.preventDefault();
const barH = e.currentTarget.closest('section')?.offsetHeight || 0;   // 53
const target = el.getBoundingClientRect().top + scrollY - barH;        // land flush under the bar
// hand-rolled easeInOutCubic over 800ms via requestAnimationFrame
```

Scroll-spy (passive listener, rAF-coalesced):

```js
for (const s of sections) if (s.top <= 200 && s.bottom > 200) { next = s.id; break; }
// plus: within 100px of document bottom → force the last tab
```

A scan line **200 px below the viewport top** decides the active row. First match wins, so
ordering is deterministic.

### 2.6 Measured defect — do not copy this part

The indicator geometry is only recomputed on active-change and on `resize`, seeded by a
`setTimeout(…, 100)` at mount. On a cold desktop load the underline measured
`left: 0px; width: 99px` while the cell it was marking was **238 px** — 99 px is the *flex-mode*
width (`px-6` + "linter" at 14 px mono), i.e. it captured a pre-CSS/pre-hydration layout and
never corrected. After a resize to 390 px it read `left: 479px; width: 240px`, also wrong. A
`ResizeObserver` on the `ul`, or a CSS-only indicator, removes the whole failure mode.

---

## 3. The repeating product row

```html
<section id="feature-linter" class="wrapper grid md:grid-cols-2">   <!-- + border-t from row 2 on -->
  <div class="px-5 py-6 md:p-10 flex flex-col justify-center gap-15"> … copy … </div>
  <div class="flex flex-col"> … visual … </div>
</section>
```

Two equal cells (719 px each at a 1440 column), no centre rule, `justify-center` so short copy
sits optically centred against a tall visual. Below 768 px it collapses to one column
(measured `grid-template-columns: 390px`), copy first, cell padding `24px 20px`.

### 3.1 Anatomy, in order

**1 — micro-label (eyebrow).** `span.text-grey text-xs font-mono uppercase tracking-wide`
→ KH Teka Mono 12 / 16, letter-spacing +0.3 px, `#867e8e`. It names the **category**, not the
product: `Linter`, `Formatter`, `Parser`, `Transformer`, `Resolver`, `Minifier`.

**2 — heading.** `h4` → APK Protocol, weight **500**, **30 px / 36 px**, tracking `normal`,
white (mobile 20 / 28). Six values:

| row | h4 |
|---|---|
| linter | `Oxlint: ESLint-compatible linter` |
| formatter | `Oxfmt: Prettier-compatible formatter` |
| parser | `oxc-parser` |
| transformer | `oxc-transform` |
| resolver | `oxc-resolver` |
| minifier | `oxc-minify` |

Branded tools get `<Name>: <incumbent>-compatible <category>`. Unbranded libraries get their
npm package name, bare.

**3 — one-line subhead.** `p.text-white/70 text-base max-w-[25rem]` → Inter 16 / 24, white at
70 %, capped at **400 px**. A benefit, no terminal period, ≤ 60 characters:

- "Catch bugs before they make it to production" (44)
- "Enforce consistent code styles" (30)
- "The foundation for advanced transformations and compilations" (60)
- "Transpile source code at the speed of thought" (45)
- "Node.js-compatible CJS and ESM module resolution" (48)
- "Compress and optimize" (21)

**4 — checkmark list.** `ul.checkmark-list`, 2–4 items, `gap: 12px`; each `li` has
`padding-left: 32px`, Inter 16 / 24, letter-spacing −0.4 px, and is **full white** — brighter
than the subhead above it, because these are the claims.

The bullet is not a tick glyph. It is a 20 × 20 inline SVG data-URI:

```
circle r=9 stroke #3b3440 stroke-width .5           ← hairline nickel ring
path stroke #fff stroke-width 1.2  (two 9r arcs)    ← white arc on the LEFT and RIGHT only
path stroke #fff stroke-width 1.2 stroke-linejoin=bevel  ← the check, bevel joins
```

A **broken** ring: nickel hairline all the way round, white only on the two side arcs, gaps at
top and bottom. Bevel (not round) joins on the check. It reads as a machined part.

Inline code chips inside the list items:

```css
code.mx-1 bg-nickel/50 text-aqua   /* + .marketing-layout code */
font: KH Teka Mono 16/24;  color: #32f3e9;  background: #3b3440 @50%;
outline: 1px #867e8e;  border-radius: 4px;  padding: 2px 6px;  margin: 0 4px;  height: 23px
```

(In light mode the chip text is `--color-space #110033` and the outline is `--color-stroke`.)

Chips carry incumbent and API names only: `ESLint`, `tsgo`, `Prettier`, `Biome`, `SWC`,
`enhanced-resolve`, `.js(x)`, `.ts(x)`, `TypeScript`, `JSX`.

The claim shapes, in the order they appear across rows: **number-first comparative → scale fact
→ capability → ecosystem**.

- "50~100x faster than `ESLint`" · "800+ rules and growing" · "True type-aware Linting powered by `tsgo`" · "Support for `ESLint` JS Plugins"
- "30x faster than `Prettier`" · "3x faster than `Biome`" · "Tailwind class sorting support"
- "3x faster than `SWC`" · "Parses `.js(x)` and `.ts(x)`" · "Passes all Test262 stage4 tests"
- "`TypeScript` & `JSX`" · "Syntax lowering to ES2015" · "Isolated Declarations DTS Emit" · "React Fast Refresh, styled-components, and more"
- "Behavior alignment with `enhanced-resolve`" · "28x faster than `enhanced-resolve`" · "Highly customizable"
- "Dead code elimination" · "Syntax shortening & whitespace removal" · "Variable name mangling"

Every item is a fragment. No verbs where a number will do.

**5 — small outline button.** `a.button w-fit mt-6`:

```css
.button { display:inline-flex; gap:8px; border-radius:8px; padding:8px 16px;
          font-weight:500; outline:1px solid var(--color-stroke); background:#fff; color:#16171d }
[data-theme=dark] .button { background: transparent; outline-color: var(--color-nickel);
                            color: #fff }
[data-theme=dark] .button:hover { background:#fff; color:#16171d }
.button:hover { scale: 1.05; box-shadow: 0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a }
```

Measured 38 × 129 px, Inter 500 16 px. **The label is "Usage Guide" on all six rows**, linking
to `/docs/guide/usage/<tool>`. Never "Learn more". The page is an index into documentation, not
a funnel.

(The hero's `.button--primary` is the one exception in the system: transparent fill over a
`::before` at `inset: -3px` carrying `primary-button-background.jpg`, `border-radius:
calc(.5rem + 3px)`, a 16 s `move-background` keyframe loop and `brightness(130%)` on hover, with
a `::after` at `inset: 0` filled `--color-primary` to punch the centre out. An animated gradient
ring, used exactly once on the page.)

### 3.2 The right-hand visual, row by row — six treatments, no two adjacent alike

Measured at a 1440 column (719 px cells):

**Row 1 · linter — code screenshot on a textured backdrop, bleeding right.**
`div.card-bg h-full overflow-clip flex justify-end items-center py-20 px-5 md:pl-10 md:pr-0`
→ padding `80px 0 80px 40px`; image **679 × 310**, 40 px of texture on its left, **0 px on the
right — flush to the column's right hairline**.
`.card-bg { background-image: url(oxc-feature-background.jpg); background-size: cover }` — a
1280 × 880 grainy aqua/teal field crossed by diagonal light streaks (motion-blurred rays).
The PNG (1193 × 544) is a rounded dark terminal with its own pale frame, showing a real Oxlint
diagnostic: `⚠ eslint(no-unsafe-optional-chaining)`, a cyan `packages/…/parse.spec.ts:2520:15`
path, box-drawing gutter, line numbers with the offending `2521` in magenta, a magenta underline
under the expression, a cyan `help:` line — and then the money lines:
**"Found 195 warnings and 0 errors." / "Finished in 45ms on 680 files with 88 rules using 10 threads."**

**Row 2 · formatter — the same panel geometry, no backdrop, masked into nothing.**
Plain `#16171d` cell, identical `80 / 0 / 80 / 40` padding, image 679 × 315. The `img` itself
carries:

```css
mask-image: linear-gradient(to bottom, black 50%, transparent),
            linear-gradient(to right,  black 50%, transparent);
mask-composite: intersect;
```

so the panel **dissolves toward the bottom-right** rather than ending. Content is a unified git
diff (`index b186f67..180d196 100644`, `--- a/hello.ts`, `@@ -1,6 +1,9 @@`, magenta `-` lines,
green `+` lines).

**Row 3 · parser — benchmark chart, no chrome at all.** `flex flex-col justify-center px-5
md:px-10 py-5 md:py-10`. See §4.

**Row 4 · transformer — code panel inset on the textured backdrop.**
`div.card-bg … py-5 md:py-10 px-5 md:px-25` → padding `40px 100px`; image **519 × 393** with
**100 px of texture on each side**. Inset, not bleeding — the opposite of row 1 despite sharing
the backdrop. The PNG is a composed shot: a small dark `npm ⌄ | npm i oxc-transform` install
chip floating top-left, over a larger rounded dark code panel with a light 2 px frame showing
the `transform('test.ts', 'class A<T> {}', { typescript: { declaration: true } })` call.

**Row 5 · resolver — inset terminal panel, no backdrop.**
`h-full overflow-clip flex justify-end items-center py-16 px-5 md:px-10` → padding `64px 40px`;
image **639 × 390**, 40 px each side. A real `pnpm install` session:
`~/projects/oxc-resolver`, `❯ pnpm install`, `preResolution: Hydrating content-addressable
store.`, `Packages: +3`, `+ oxc-resolver 11.9.0`, **"Done in 2.4s"**.

**Row 6 · minifier — a small dimensional object, in motion, edge to edge.**
`div.flex flex-col py-10` → a Rive canvas authored at **560 × 260**, rendered `w-full`
(measured **719 × 334**), 40 px above, **0 px horizontal padding** — it spans the full cell.
Payload (extracted from `560_x_260_minifier.riv`): the OXC glyph as an aqua-gradient anchor mark
plus a 482 × 204 aqua ray-burst texture. Same `RiveAnimation` component runs the hero
(`640_x_630_oxc masthead_.riv`, 640 × 630), whose payload is the logo lozenge — a dark rounded
rhombus with a thin aqua outline, an aqua glyph and two white swoosh arcs — plus **six 228 × 38
white mono strips reading `/linter`, `/formatter`, `/parser`, `/transformer`, `/resolver`,
`/minifier`**: the masthead cycles the tool names.

Playback discipline (from source): `autoplay: false`; an `IntersectionObserver` at
`threshold: 0.1` fires `play()` **once** and never again; a separate `mobileSrc` below a 768 px
breakpoint; teardown on unmount; an optional `hover` animation only above the breakpoint.

**The pattern:** `texture + bleed → plain + fade → data → texture + inset → plain + inset →
motion`. Two of six carry the accent texture; two of six carry no chrome whatsoever. No
adjacent pair repeats. Nothing is centred except row 4's inset panel.

---

## 4. Benchmark / data presentation

Component `PerformanceBar`, built on Reka UI `ProgressRoot` / `ProgressIndicator` so the markup
is a real `role="progressbar"` with `aria-valuemin/max`.

```js
[{ name:'OXC',   percentage: 20,  time:'26.3ms', isPrimary: true },
 { name:'SWC',   percentage: 65,  time:'84.1ms' },
 { name:'Biome', percentage: 100, time:'130.1ms' }]
```

### 4.1 Geometry

- Row: `flex items-center w-full gap-3` → **12 px** between label, track and value.
- **Label:** left, fixed gutter `w-24` (96) → `md:w-36` (**144 px**), `shrink-0`,
  `font-mono text-xs uppercase tracking-wide` (12 / 16, +0.3 px). So every bar starts at the
  same x — the labels form a column, not a ragged edge.
- **Track:** `w-full h-6` → **24 px** tall (a `h-3` / 12 px variant exists via `large={false}`),
  `bg-slate #14121a`, `rounded-xs` = **2 px** radius, `overflow-hidden`.
- **Fill:** `h-full rounded-xs`, width set inline as a percentage,
  `transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]` (easeInOutCubic).
- Rows separated by `gap-6` = **24 px**.

### 4.2 Scale and units

Percentages are **time normalised to the slowest competitor**: Biome 130.1 ms = 100 %,
SWC 84.1 ms = 65 %, OXC 26.3 ms = 20 %. Longer bar = worse. The winner is therefore the
**shortest** bar; the chart reads "less is less". Units are always `ms`, one decimal, and the
value is prefixed with a slash: **`/ 26.3ms`**, right of the track, `shrink-0`, same 12 px mono
uppercase as the label.

### 4.3 How the winning bar is emphasised — three signals, no fourth

1. Fill = `bg-wine #140033` **plus** `background-image: url(oxc-feature-background.jpg);
   background-position: center; background-size: cover` — the aqua texture *is* the win state.
   Losing fills are flat `bg-grey #867e8e`.
2. Label colour `#fff` vs `#867e8e`.
3. Value colour `#fff` vs `#867e8e`.

No badge, no "fastest" word, no crown, no icon, no bold. The single boolean `isPrimary` drives
all three.

### 4.4 Frame

- Title above: a plain `p.text-white font-medium mb-10` (40 px below) —
  "Parser Benchmark for Oxc, Swc and Biome". **Not** a heading element, so it does not compete
  with the row's `h4` in the other cell.
- Footnote below: `p.text-xs mt-10` (40 px above), inheriting `--color-grey` —
  "Parsing typescript.js on Macbook Pro M3 Max | **Source**", the link going to
  `github.com/oxc-project/bench-javascript-parser-written-in-rust`.
  Workload, machine and provenance in one 12 px line.

---

## 5. Type scale and colour, as measured

### 5.1 Three fonts, three jobs, no overlap

```css
--font-heading: "APK Protocol", sans-serif;   /* every h1–h6 */
--font-sans:    Inter, sans-serif;            /* every sentence */
--font-mono:    "KH Teka Mono", monospace;    /* every label, tab, code chip, number, unit */
```

Editorial → APK Protocol. Read-as-prose → Inter. Labelled or measured → mono. Nothing crosses.

### 5.2 Scale (`.marketing-layout`, measured dark at ≥ 1440)

| element | mobile | ≥ 640 | ≥ 768 | weight | tracking |
|---|---|---|---|---|---|
| `h1` | 36 | 48 | **60 / 67.2** | 500 | **−3 px** (−0.05em) |
| `h2` | 30 | — | **48 / 48** | 500 | −1.2 px (−0.025em) |
| `h3` | 24 | — | **40** (2.5rem) | 500 | −0.025em |
| `h4` (product row) | 20 / 28 | — | **30 / 36** | 500 | **normal** |
| `h5` | 18 | — | 24 / 28 | 500 | normal |
| `h6` | 16 | — | 20 / 28 | 500 | normal |
| `p`, `li` | 16 / 24 | — | 18 / 28 | 400 | — |
| row subhead (`text-base`) | 16 / 24 | | 16 / 24 | 400 | normal |
| checkmark `li` | 16 / 24 | | 16 / 24 | 400 | −0.4 px |
| micro-label / bar label / footnote | **12 / 16** | | | 400 | **+0.3 px**, uppercase |
| tab | **14** | | | 400 | −0.35 px |

Two facts worth stealing outright: **every heading is weight 500** — there is no 600 or 700
anywhere in the marketing type — and **negative tracking is applied only above 30 px**, scaling
with size (−0.05em at 60, −0.025em at 48 and 40, 0 at 30). Body `p`/`li` default to
`--color-grey`; only white-forced text is a claim.

### 5.3 Palette (compiled `@theme` block, verbatim)

```
--color-white    #fff        --color-primary  #16171d   ← page ground
--color-beige    #f4f3ec     --color-nickel   #3b3440   ← every hairline; chip bg at 50%
--color-grey     #867e8e     ← labels, inactive tabs, body text
--color-stroke   #e5e4e7     ← light-mode hairline
--color-midnight #0c0912     --color-slate    #14121a   ← bar track, --vp-c-bg-alt
--color-wine     #140033     ← winning-bar base under the texture
--color-electric #6c3bff     --color-vite     #b39aff   ← Vite+ variant accent
--color-space    #110033     ← light-mode inline code text
--color-zest     #22ff73     --color-aqua     #32f3e9   ← oxc accent
```

### 5.4 The accent and its restraint

```css
:root                                  { --color-brand: var(--color-electric) }  /* #6c3bff */
:root[data-theme=dark]                 { --color-brand: var(--color-vite) }      /* #b39aff */
:root[data-variant=oxc]                { --color-brand: #0d6a73 }                /* light */
:root[data-theme=dark][data-variant=oxc]{ --color-brand: var(--color-aqua) }     /* #32f3e9 */
```

One stylesheet, two products, accent swapped by an attribute on `:root`. oxc's aqua is a deep
teal `#0d6a73` in light and `#32f3e9` in dark, so contrast survives both grounds.

On the whole marketing page aqua appears in exactly **five** places:

1. inline code chips in the checkmark lists
2. the `(Beta)` / `(Alpha)` status words
3. the animated gradient ring of the single primary button
4. the two `card-bg` panels + the footer CTA + the announcement strip (all the same texture jpeg)
5. the winning benchmark bar's fill texture

Headings, body copy, rules, buttons, tabs and the underline indicator are **white / grey /
nickel only**. The accent never touches a heading, a body sentence, a border, or a button label.

### 5.5 Dark-mode base values

| role | dark | light |
|---|---|---|
| ground | `#16171d` | `#fff` |
| alt surface / code block | `#14121a` | `#f4f3ec` |
| hairline / divider | `#3b3440` | `#e5e4e7` |
| primary text | `#fff` | `#16171d` |
| secondary text | `rgba(255,255,255,.7)` | — |
| muted / label | `#867e8e` | `#867e8e` (both) |
| accent | `#32f3e9` | `#0d6a73` |

Elevation is achieved with `#14121a` against `#16171d` — a 2-value delta — plus a 1 px `#3b3440`
line. There are **no shadows** in the content area at all; the only `box-shadow` in the
marketing CSS is the button's hover lift.

### 5.6 The Oxlint docs shell, for reference

The Oxlint pages are ordinary VitePress docs (`/docs/guide/usage/linter`), not marketing pages,
and they *do* honour the theme toggle.

```
--vp-layout-max-width: 90rem (1440px)   --vp-sidebar-width: 272px
.content-container { max-width: 688px }              /* with sidebar */
.VPDoc:not(.has-sidebar) .content { max-width: 752 → 784px }
.aside { max-width: 256px; padding-left: 32px }      /* outline */
.aside-container { width: 224px; border-left: 1px solid var(--vp-c-divider); position: sticky }
--vp-nav-height: 82px                    .VPDoc { padding: 48px 32px 128px }
.vp-doc h1 { 32/40, ls −.02em }
.vp-doc h2 { 24/32, weight 600, ls −.02em; border-top: 1px solid divider;
              margin: 48px 0 16px; padding-top: 24px }
```

`.vp-doc h2` getting a top hairline plus 48 px above / 16 px below is the same
hairline-separated-band logic as the marketing page, applied to prose. The docs are the only
place weight 600 appears.

---

## 6. How a product is introduced vs how a feature is listed

### 6.1 Introducing a product

The three-line opening is fixed and every row obeys it:

```
CATEGORY  (STATUS)            ← 12px mono uppercase grey; the class of thing
Name: incumbent-compatible category   ← 30px/500 white; what it replaces
One line of benefit, no period, ≤60 chars   ← 16px Inter white/70, capped 400px
```

The category word appears twice — once as the eyebrow, once at the end of the heading
("Linter" → "Oxlint: ESLint-compatible **linter**"). It reads as deliberate, not redundant: the
eyebrow is the slot, the heading is the occupant. Products with no consumer brand skip the
naming move entirely and use the npm package name (`oxc-parser`). Nothing is ever called a
"solution", "platform" or "engine".

The docs page extends the same voice: Oxlint opens with a pronunciation gloss
("/oʊ-ɛks-lɪnt/"), then a section literally titled **"Choosing a JavaScript linter"** that says
when *not* to use it and names the alternative by name ("choose Vite+ … Stay on ESLint only if
you still depend on unsupported edge-case plugin behavior"). Naming competitors — in chips on
the marketing page, in prose in the docs — is the confidence move that carries the whole tone.

### 6.2 Listing a feature

2–4 fragments, ordered **speed → scale → capability → ecosystem**, each one line at 400 px+,
each led by the number when there is one, with the compared thing in a code chip. The chip does
two jobs simultaneously: it types the claim as technical, and it visually subordinates the
competitor's name to the multiplier in front of it. There is no icon per feature, no sub-copy,
no expand/collapse, no "and much more" — the fourth item, when it exists, is the catch-all
("React Fast Refresh, styled-components, and more").

### 6.3 Marking beta/alpha without shouting

```html
<span class="text-grey text-xs font-mono uppercase tracking-wide">
  Formatter <span class="text-aqua">(Beta)</span>
</span>
```

The status word is a **child of the eyebrow span**. It inherits 12 px, mono, uppercase and the
+0.3 px tracking; the *only* changed property is colour. Rendered: `FORMATTER (BETA)` /
`MINIFIER (ALPHA)`.

- In parentheses — grammatically parenthetical, visually parenthetical.
- At the smallest type size on the page, in the calmest position.
- No pill, no chip shell, no border, no background, no amber/yellow, no exclamation, no tooltip.
- The row is otherwise **byte-for-byte the same shape** as the stable rows: same anatomy, same
  30 px heading, same checkmark claims, same "Usage Guide" button, same right-hand visual budget
  (the Beta formatter gets the masked-diff treatment; the Alpha minifier gets the animation).

Beta is presented as a fact about the release train, not a warning about the software. Nothing
is gated, greyed, or apologised for. Note also that the Alpha minifier's claim list is the only
one with *no* comparative number in it — the honesty is in what is absent, not in a disclaimer.

---

## 7. What a GT product page should copy — and what it should not

### 7.1 Copy

1. **The `.wrapper` system.** One class: `margin-inline:auto`, side hairlines from 768 px,
   `max-width: calc(100vw - 2rem)` then a 1440 cap, `overflow-x: clip`. Every band uses it;
   every band declares `border-t` only. That single decision produces the entire ruled-column
   look, is ~10 lines of CSS, and makes it structurally impossible to mis-space a section.
2. **Tick marks at chapter joints only.** The 5 px triangle pair at `top:-5px` on the band's two
   corners. Six uses on a 6000 px page. Use them for: under-nav rule, hero, above the index bar,
   the pricing/CTA band, the footer. Never on the repeating rows.
3. **The sticky mono index bar with a resizing 2 px underline, over a plain anchored stack.**
   Tabs' affordance, zero tab state; every row stays linkable and printable. Locadex's six:
   `setup`, `context`, `agents`, `review`, `ship`, `dashboard`. Six equal ruled cells ≥ 640 px,
   auto-scrolling strip below. 53 px tall, opaque ground, `top: 0`.
4. **The row skeleton, verbatim.** 12 px mono grey eyebrow → 30 px/500 product line → one 16 px
   benefit line capped at 400 px → 2–4 checkmarks with the broken-ring bullet and code chips →
   one 38 px outline button with the *same label on every row*. Copy is written into a fixed
   frame, so writing the page is filling six slots, not designing six sections.
5. **Number-first claim fragments with the compared thing in a chip.** GT's equivalents:
   "`<T>` wrapping with zero config", "40+ locales from one `gt.config.json`", "2 minutes from
   `npx locadex init` to first PR", "drop-in for `next-intl`", "0 strings extracted by hand".
   Chips for `gt-next`, `gt-react`, `next-intl`, `i18next`, `.po`, `.xliff`.
6. **Right-hand cells that deliberately differ, with a stated budget:** of six rows, exactly two
   carry the accent texture, two carry no chrome at all (pure data / pure motion), and no
   adjacent pair repeats a treatment. Write that rule down before building, or the rows converge.
7. **Real output as the visual.** The linter row's "Finished in 45ms on 680 files with 88 rules
   using 10 threads." is the strongest single element on oxc.rs, and it is a screenshot of a
   terminal. GT's equivalents are real and available: a `locadex` run log with a PR URL, a real
   `git diff` showing `<T>` wrapping appear, a real GitHub PR page. Screenshot the product;
   don't illustrate it.
8. **The bar-chart spec, wholesale:** 24 px track, 2 px radius, `#14121a` ground, fixed 96/144 px
   label gutter so all bars share an x-origin, `/ value` right-aligned in 12 px mono, winner
   emphasised by exactly three signals (textured fill + white label + white value), and machine,
   workload and a `Source` link in one 12 px footnote. Keep the `role="progressbar"` markup.
9. **Status in parentheses inside the eyebrow, accent-coloured, same size, nothing else changed.**
   Locadex ships fast; it will have beta features. This is the pattern.
10. **Three fonts with three jobs; all headings at weight 500; negative tracking only above 30 px.**
    GT has a mono and a grotesque already — assign them and never let them cross.
11. **Accent as an attribute.** `:root[data-variant=locadex]` / `[data-variant=dashboard]` over
    one shared stylesheet, so the product pages, the docs and the app share every rule and swap
    one hue. This is how oxc.rs and viteplus.dev are the same codebase.
12. **"Usage Guide" as the row CTA** — one label, one destination class, repeated six times.
    A product page that indexes documentation converts developers better than one that funnels.
13. **No nested cards, no shadows.** Containment comes from the page grid; elevation is a 2-value
    ground delta plus a 1 px line. The cell *is* the card.

### 7.2 Do not copy

1. **Pinning the page dark** (`data-theme="dark"` hardcoded). oxc's audience lives in a
   terminal; localisation buyers include marketing, docs and product people, and GT's own
   dashboard is not a terminal. Build light-first and let the token pairs carry it
   (`#fff`/`#16171d` ground, `#e5e4e7`/`#3b3440` hairline, `#867e8e` muted in both). Note that
   oxc *already ships* the full light set and simply never uses it — do the opposite.
2. **The aqua grain-and-rays texture.** It is a literal speed metaphor (motion-blurred light).
   On a localisation product it is decoration, and it fights text wherever it appears. If a
   textured accent panel is wanted, make the field carry information: sampled glyphs across
   scripts, a language grid, a Bayer-dithered word, sentence-length bars. Same visual role,
   actual content.
3. **Benchmarks as the default proof.** oxc's product *is* the number, so a ms bar chart is the
   product demo. Locadex's proof is coverage, correctness and throughput. Reuse the bar geometry,
   change the axis: locales shipped, strings covered, PRs merged, review passes avoided,
   time-to-first-PR. **And watch the polarity:** oxc's chart is "shortest bar wins" because the
   quantity is time. For "more locales is better" the winner must be the *longest* bar, or the
   emphasis has to move — a reader who has seen one convention will misread the other in a glance.
4. **Six sibling rows of identical weight.** oxc genuinely has six peer tools. Locadex is one
   product with features of unequal importance. Six identical rows and a six-across bar would
   flatten a real hierarchy. Use 4–5 rows and let one break the split — full-bleed, or
   three-across — so the page has a spine.
5. **The imperative indicator.** Measured broken on cold load (99 px underline in a 238 px cell)
   and after resize. Drive it from a `ResizeObserver` on the list, or from CSS.
6. **`touch-action: none` on the mobile tab strip.** It removes a swipe users expect in order to
   protect an auto-scroll animation. Keep `overflow-x: auto` and let people drag.
7. **The 800 ms hand-rolled `requestAnimationFrame` scroll.** `scroll-behavior: smooth` plus
   `scroll-margin-top: <bar height>` on each section is two CSS lines, honours
   `prefers-reduced-motion`, and does not fight the browser's own anchor handling.
8. **`justify-end` + `md:pr-0` bleed on the first two rows.** It reads as "a window into a larger
   surface" only because the screenshot has its own rounded frame baked into the bitmap. With a
   live DOM mock or an SVG diagram it will read as a layout bug. Make the row-4/5 inset geometry
   (40–100 px of breathing room on both sides) the default and bleed at most once, on purpose.
9. **Rive + a WASM runtime to animate a logo.** Two `.riv` files plus `rive.wasm` are spent on a
   mark that spins and six words that cycle — both trivially achievable in CSS/SVG. If GT pays a
   runtime cost, it must buy demonstration: characters becoming other characters, `<T>` closing
   around a string, an agent opening a PR. Keep oxc's *playback* discipline though —
   `autoplay: false`, `IntersectionObserver` at `threshold: 0.1`, play once, separate mobile
   asset, teardown on unmount.
10. **The sponsor / backer wall** (566 px of logos plus ~30 avatar tiles). An OSS-funding
    artefact. GT's equivalent slot should be customers *with a claim attached*, or nothing.
11. **The dismissible announcement strip and the pronunciation gloss.** OSS-culture furniture.
    Harmless, but they buy a commercial product page nothing and cost 40 px above the fold.
12. **Buttons that `scale(1.05)` on hover with a soft shadow**, in a design otherwise built from
    1 px rules and 2 px radii. It is the one bouncy element on the page and the one that dates.
    Keep the outline button and the invert-on-hover; drop the scale and the shadow.
13. **"OXC" / "SWC" / "Biome" as bare uppercase mono labels** in the chart. Fine among compilers;
    on a page comparing GT to named commercial vendors, an unlabelled axis of competitor names in
    12 px mono reads as sniping. Label the axis, or use the row's own claim as the caption.
