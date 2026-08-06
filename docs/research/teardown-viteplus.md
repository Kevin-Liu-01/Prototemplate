# Forensic teardown — viteplus.dev

**Method.** Raw HTML (93,739 B), the single stylesheet (`/assets/style.D9sn6NCP.css`, 219,599 B),
the theme bundle (`theme.BPzp1d_6.js`, 336,942 B) and `framework.DrK6JUm_.js` were fetched with
curl and read directly. All layout/type numbers below are **measured** via `getComputedStyle` /
`getBoundingClientRect` in a real Chromium at **1512 × 900**, not inferred. Fetched 2026-07-29;
`x-hosted-by: void.cloud`.

**Stack.** VitePress `v2.0.0-alpha.17` + Vue SFCs + Tailwind v4 (utilities compiled into one
sheet, with a hand-written `@layer marketing` on top) + Reka UI (`[role=tablist]`,
`data-reka-collection-item`) + **Rive** (WASM vector-animation runtime) for three canvases.
`theme-color` is `#7474FB`. Page is 8,568 px tall at 1512 wide.

---

## 1. Page skeleton

Everything on the page is a `.wrapper`. There are **24 `.wrapper` instances**; the class is the
entire layout system.

```css
.wrapper{ margin-inline:auto; position:relative; overflow-x:clip;
          border-color:var(--color-stroke) }
@media(min-width:48rem){                     /* ≥768px */
  .wrapper{ border-left:1px solid; border-right:1px solid;
            max-width:calc(100vw - 2rem) }   /* 16px gutter each side */
}
@media(min-width:90rem){ .wrapper{ max-width:90rem } }   /* hard cap 1440px */
[data-theme=dark] .wrapper{ border-color:var(--color-nickel) }
```

- **Max content width: 1440 px** (90rem). Measured 1440.0 px at a 1512 px viewport.
- **Gutters: 16 px** each side from 768 px up to 1440 px viewport (`calc(100vw - 2rem)`); above
  1440 px the column is centred and the gutter grows (measured 30.5 / 41.5 px at 1512 — the 11 px
  asymmetry is the scrollbar). **Below 768 px there are no side rules at all** and content is
  edge-to-edge.
- **Side rules are real borders on the container** — `border-left` / `border-right: 1px solid
  #e5e4e7` on `.wrapper` itself. Not pseudo-elements, not a background gradient.
- **Section divisions are `border-top: 1px` on each section**, which is itself a `.wrapper`. So the
  horizontal rule and the two vertical rules meet exactly, because they are the same 1 px border on
  nested boxes of identical width.
- **Internal cell dividers are Tailwind v4 `divide-x` / `divide-y`**, which compile to
  `border-right: 1px` / `border-bottom: 1px` on *every child except the last* (verified: cells 1–2
  of the three-across have `border-right: 1px #e5e4e7`, cell 3 has `0px`). No gaps, no gutters
  inside grids.
- **The tick marks.** The signature detail. `.wrapper--ticks::before/::after` (and the standalone
  `.tick-left` / `.tick-right`) are **CSS triangles**: 10 × 10 px, made of 5 px borders, three sides
  transparent, `border-left-color:#e5e4e7` (before) / `border-right-color` (after), positioned
  `absolute; top:-5px; left:0` and `right:0`. They straddle the horizontal rule at both ends of the
  column, so a divider reads as a *drawn measurement*, not a CSS border. Applied selectively — 8 of
  the ~20 dividers get ticks, not all of them. There is also a **0-height `.wrapper` with
  `tick-left tick-right` immediately under the header** whose only job is to place two ticks on the
  header's bottom rule.

**Vertical rhythm: there are no vertical margins anywhere between sections.** Rhythm is produced
entirely by (a) fixed section heights and (b) one uniform cell padding. Measured band heights,
top to bottom:

| # | band | height |
|---|---|---|
| 1 | header (`px-6 py-5`, `border-b`) | 81 |
| 2 | tick spacer | 0 |
| 3 | hero copy (`pt-14 pb-6`, no border-top) | 409 |
| 4 | hero visual (`h-[40rem]`) | 640 |
| 5 | Getting started (2-col) | 278 |
| 6 | three-across (`lg:h-80`) | 320 |
| 7 | trust 2×2 (rows 623 + 566) | 1190 |
| 8 | **dark band** `#features` | **2811** |
| 8a | · dark intro (`sm:h-[22rem]`) | 352 |
| 8b | · hairline + ticks | 1 |
| 8c | · sticky tab bar | 53 |
| 8d | · 5 feature rows | 493, 481, 493, 481, 457 |
| 9 | "Fullstack? No problem." (`sm:h-80`, **no border-top**) | 320 |
| 10 | fullstack 2-col | 346 |
| 11 | ticked spacer (`sm:h-30`) | 120 |
| 12 | Rive masthead canvas (full-bleed, no rules) | ~652 |
| 13 | footer OSS band (`sm:py-30 px-10`) | 445 |
| 14 | footer CTA band (image-backed) | 434 |
| 15 | footer link farm (`md:px-24 pt-16 pb-40`) | 461 |
| 16 | copyright bar (`py-5 md:px-24`) | 61 |

The recurring heights are **320 (h-80) and 352 (22rem) for text-only interstitials, 640 (40rem) for
the hero visual, 480 (min-h-30rem) for feature rows, 120 (h-30) for the pure spacer.** Padding
inside every cell is **40 px (`p-10`) on desktop, 20–24 px (`p-5` / `px-5 py-6`) on mobile** — with
essentially no exceptions. Two outliers: the footer link farm uses `px-24` (96 px) and the OSS band
`px-10` + `md:pl-15` (60 px).

The header is **`position: relative`, not sticky** (its parent is `.home-header`, `z-50`). The only
sticky element on the page is the feature tab bar.

---

## 2. Every distinct cell / shell type, in order

Fourteen shells. What varies is exactly three things: **padding (40 / 0), background (none / flat /
image), and whether the inner object is inset or bleeds.** Radius is almost never used on cells —
only on objects *inside* them.

**S1 — Header bar.** `.wrapper`, full span, `px-6 py-5` (24 / 20 px), `bg-white`, `border-b 1px
stroke`, 81 px. Wordmark left; nav (Guide / Config / Resources ˅) at `gap-10`; right cluster =
search button (beige fill, radius 8, `⌘K` kbd) + 4 social glyphs at `gap-4`. Two ticks sit on its
bottom rule via the 0-height wrapper below it.

**S2 — Hero copy block.** `.wrapper`, **no border-top**, transparent, `pt-14 pb-6` (56 / 24),
inner column `w-full sm:w-2xl` (=**672 px max**) centred, `gap-10` between the text stack and the
button row, `gap-4` inside the text stack. Contents: 36 px logo mark, h1, subhead, fine-print line,
then three buttons at `gap-5`. Full column span.

**S3 — Full-bleed image band with a bleeding window (the hero visual).** `.wrapper border-t
h-[40rem] bg-wine terminal-background bg-cover bg-top flex justify-center pt-28 overflow-clip`.
Background bleeds to the column edges (not past them — the side rules still contain it). The
terminal window is a child, `w-[62rem]` (**992 px fixed**), `self-stretch` so it runs from 112 px
below the band top to past the band's bottom edge and is **clipped by `overflow-clip`** — it has
`rounded-tl-lg rounded-tr-lg` (8 px top corners only) precisely because the bottom is never seen.
Full column span.

**S4 — Split row, 0.9 / 1.1 (Getting started).** `grid lg:grid-cols-[0.9fr_1.1fr]`, measured
**647 / 791 px**, divider `border-right 1px`. Left cell: `p-10`, `flex-col gap-4 justify-center` —
mono kicker → h4 → body (`max-w-[28rem]`) → fine print with an underlined link
(`underline decoration-stroke underline-offset-4`). Right cell: `p-10 grid gap-4` holding two
**install cards**: `rounded-xl` (12), `bg-primary` (#16171d) — *dark objects inside a white cell* —
`p-5`, `outline 1px rgba(255,255,255,.1)`, `hover:bg-[#1a1a1a]`, containing a mono uppercase 12 px
label, the command in mono white, and a bordered "Copy" button (`border-white/12`, radius 6).

**S5 — Three-across feature strip.** `grid grid-rows-3 lg:grid-rows-1 lg:grid-cols-3 lg:h-80`;
cells **479 px** each, `p-10`, `flex-col justify-between` so the logo/chip row is pinned to the
bottom of a 320 px cell. Text block is height-locked on mobile (`h-30 lg:h-auto`) so the three
chip rows align. Chips are `<code>` elements (see §3). Cell 3 uses `.stacked-blocks`: 56 px
(`sm:size-14`) `rounded-xl` tiles with **`outline: 3px #fff; outline-offset: -3px`** (an inner
white ring that punches the tile out of the page) on `#f9f8f5`, overlapped `-8px`, each rotating
±5° and lifting 4 px on hover, followed by a plain "+ 20 more".

**S6 — 2 × 2 quadrant (trust / performance).** `wrapper--ticks grid lg:grid-cols-2 divide-x
divide-y`; 719 px columns, rows 623 + 566, every cell `p-10 flex-col gap-3`. Four *different*
payloads under one shell:
- (a) h5 + body + a **stat ladder**: three rows, each = 96 px logo + two stat pairs, separated by
  `::before` hairlines (`absolute; width:1px; height:48px; background:#e5e4e7`) — i.e. **vertical
  rules drawn as pseudo-elements inside the cell**, distinct from the layout borders. Numbers are
  Inter 500 20 px; captions 18 px grey `leading-tight`.
- (b) h5 + body with three **coloured `<span>` phrases** + a Rive canvas (`w-full mt-10`).
- (c) h5 + a **disc bullet list** (`list-disc pl-3 gap-2 marker:text-ruby`) + a Rive canvas.
- (d) h5 + body + a flat PNG diagram (`w-full`).

**S7 — Dark full-bleed pivot band.** `<section id="features" data-theme="dark" class="bg-primary">`
wrapping five sub-shells. Not a `.wrapper` itself — it paints `#16171d` edge-to-edge across the
whole viewport, and the nested `.wrapper`s re-draw their rules in `--color-nickel` because
`[data-theme=dark] .wrapper{border-color:var(--color-nickel)}`. **This is the only theme switch on
the page and it is one attribute.**

**S8 — Centred text interstitial.** `.wrapper border-t px-5 sm:px-10 h-70 sm:h-[22rem] flex-col
justify-center gap-6 text-center items-center`. h2 white + `max-w-md` (448 px) subhead at
`text-white/70`. 352 px of near-empty space; the same shell recurs light (S12) at 320 px, left-aligned.

**S9 — Sticky tab bar.** `.wrapper sticky top-0 border-b bg-primary z-10 overflow-hidden`, 53 px.
`ul` is `sm:grid sm:grid-cols-5 divide-x divide-nickel` — five equal cells, hairline-separated,
each an anchor to `#feature-*`, KH Teka Mono 14 px `tracking-tight`, `py-4`, white when active /
`#867e8e` otherwise, `transition-colors 200ms`. The indicator is an absolutely-positioned
`h-0.5 bg-white` (**2 px**) bar at `bottom-0` whose `left`/`width` are set inline by JS
(observed `left:0px; width:163px`), `transition-all 300ms cubic-bezier(0,0,.2,1)`. On mobile it
becomes a horizontal scroller with `scrollbar-hide`.

**S10 — Feature row: copy left / full-bleed visual right (×5).** `grid md:grid-cols-2 divide-x
divide-nickel`, 719 / 719. Left cell `p-10 flex-col justify-between gap-15` (60 px):
mono kicker → h4 white → body `text-white/70 max-w-[25rem]` → checkmark list; pinned at the bottom,
a **"Powered by" chip**: `px-3 py-1.5 bg-slate rounded` (4 px) containing "Powered by" in mono
14 px grey + 20 × 12 px logo + name. Right cell has **`padding: 0`** and
`min-h-[22rem] sm:min-h-[30rem]` (352 → **480 px**); inside it a coloured plate fills the cell
(`bg-vite` = flat `#b39aff`, or `bg-oxc` / `bg-vitest` / `bg-viteplus` / `bg-rolldown` =
`background-size:cover` JPEGs) with `pl-10` and `overflow-clip`, and on that plate a **code panel**:
`bg-slate` (#14121a), `px-5 py-6`, `outline 1px rgba(255,255,255,.2) outline-offset 2px`,
**`border-radius: 4px 0 0 4px`** — left corners only, deliberately squared on the right — and
`mr-10`, measured 639 px wide. The visual **bleeds to the column's right rule**; the copy cell never
does.

**S11 — Feature row variant: tabbed terminal.** Same S10 shell, but the code panel holds a
transcript player plus a **segmented control**: `.run-step-picker` = `w-fit`, `p-1`,
`border 1px rgba(255,255,255,.1)`, `bg-[#111]`, `rounded-md`, `margin: .9rem auto 0`, four Reka
tab buttons (mono 14 px, radius 4, active = white fill + `#16171d` text, `transition 75ms`).

**S12 — Left-aligned text interstitial (light).** `.wrapper px-5 sm:px-10 h-70 sm:h-80 flex-col
justify-center gap-5`, h3 + `max-w-md` body. **No `border-top`** — it inherits the dark band's own
edge as its rule.

**S13 — Asymmetric nested grid (fullstack).** `wrapper--ticks grid sm:grid-cols-2 divide-x`.
Left cell: **`bg-beige/50`** (the only tinted surface on the page — `#f4f3ec` at 50 %), `p-10`,
`justify-between`, h6 + `max-w-[18rem]` body + PNG diagram (`mt-11`). Right cell: `padding 0`,
subdivided into a `p-10` text row and a **4-across logo strip** (`grid grid-cols-2 sm:grid-cols-4
divide-x`, `sm:h-[4.5rem]` = 72 px, each logo `max-w-20 max-h-10 object-contain`, most inlined as
`data:image/svg+xml`), then a **`bg-nitro` image-backed sub-cell** (`px-10 pt-7 justify-end gap-5`)
with a 48 px icon, a white h6, and a full-width SVG. So one 346 px row contains 1 + 1 + 4 + 1 cells.

**S14 — Full-bleed canvas, no shell.** `.wrapper md:border-none mt-10 md:mt-0` — a wrapper that
**explicitly removes its own side rules** so the Rive masthead runs the full 1440 px with nothing
drawn around it. The only place the ruled frame is deliberately dropped.

**Footer shells.** (i) OSS band: ticked, `sm:py-30 px-10`, `md:flex-row justify-between gap-20`,
h3 + body + `.button` on the left, a 176 px-tall "by VoidZero" PNG on the right. (ii) **CTA band**:
`relative` with an `<img class="absolute inset-0 w-full h-full object-cover z-0">` behind a
`z-10 w-full sm:w-2xl` centred column (`py-30`) — h2 + `.button--white`, plus an **empty `<p>`**
that ships with no text. (iii) Link farm: ticked, `md:px-24 pt-16 pb-40`, two columns of mono
uppercase 12 px headings ("Company", "Social") over 16 px links at `gap-3`. (iv) Copyright bar:
ticked, `py-5 md:px-24`, 61 px, 14 px text.

---

## 3. Type scale

Three families, all self-hosted woff2, **no italics, no weights above 600**:

- **Display / UI: `"APK Protocol"`** — a proprietary geometric grotesk. Only **500** and **600**
  are shipped (`APK-Protocol-Medium.woff2`, `APK-Protocol-Semi-Bold.woff2`). Every `h1`–`h6` is
  weight **500**. 600 is never used in the marketing layer.
- **Body: `Inter`** (variable subsets, roman + italic, latin/greek/cyrillic/vietnamese).
- **Mono: `"KH Teka Mono"`** — 400 and 500 only.

Note the trap: `.marketing-layout` re-declares `--font-sans: "APK Protocol"`, so anything that
*explicitly* sets `font-family: var(--font-sans)` inside it (the nav links) gets the display face,
while inherited body text stays Inter. **The nav is APK Protocol 16/24 at weight 400** — the display
face doing UI duty. Measured, not guessed.

| Role | Family / weight | Size → | Line-height | Letter-spacing | Colour |
|---|---|---|---|---|---|
| Display h1 | APK 500 | 36 → 48 (≥640) → **60** (≥768) | **67.2 px** (4.2rem, ratio 1.12) | **−3 px** (−0.05em) | `#16171d`, `text-balance` |
| Section h2 | APK 500 | 30 → **48** (≥768) | 48 (1.0) | −1.2 px (−0.025em) | primary / white |
| h3 | APK 500 | 24 → **40** (≥768) | 53.3 | −1 px | primary |
| Cell head h4 | APK 500 | 20 → **30** | 36 (1.2) | normal | primary / white |
| Cell head h5 | APK 500 | 18 → **24** | **28** | normal | primary |
| Cell head h6 | APK 500 | 16 → **20** | 28 | normal | primary |
| Body p / li | Inter 400 | 16 → **18** (≥768) | **28** | normal | `#867e8e` |
| Small label | KH Teka Mono 400 | **12** | 16 | **+0.3 px** (`tracking-wide`), `uppercase` | `#867e8e` |
| Checklist item | Inter 400 | 16 | 24 | **−0.4 px** (`tracking-tight`) | `#fff` |
| Tab label | KH Teka Mono 400 | 14 | 20 | −0.35 px | white / grey |
| Terminal body | KH Teka Mono 400 | 14 | **24** (1.5rem, set explicitly) | normal | white/grey/tinted |
| Inline `code` | KH Teka Mono 400 | **16** | 24 | normal | `#110033` |
| Stat number | Inter **500** | 16 → 20 | 28 | normal | `#16171d` |
| Button | Inter 500 | 16 | 22.4 | normal | primary / white |

Tracking is applied **only where it earns its keep**: hard negative on the two largest sizes
(−0.05em on h1, −0.025em on h2/h3), *zero* on h4–h6, slightly negative on 16 px checklist items and
14 px mono, slightly positive on the 12 px uppercase mono label. `text-wrap: balance` is set on
every heading; body copy gets `text-pretty` or `text-balance` per cell.

**Where colour enters a heading.** Exactly one place: the h1. Not via a span — the whole `h1`
carries `.shine-text`, a `background-clip:text` gradient
`linear-gradient(110deg, #16171d 0 40%, #6254fe 48% 52%, #16171d 60% 100%)` at `background-size:
400% 100%`, animated once from `background-position:100% 0` to `35% 0` over **5 s ease-in-out,
forwards**. The animation is a light sweep across the headline, and because it *ends* at 35 % the
violet band comes to rest on the last two words — so **"the Web" is permanently violet as a
by-product of the sweep's final position.** One declaration buys both the shimmer and the accent
word. Everywhere else, emphasis inside body copy is `<span class="text-primary">` — i.e.
"40× faster builds", "~50× to ~100× faster linting", "up to 30× faster formatting" are simply
*darker*, not coloured, against grey body text.

---

## 4. Colour

Full palette (`@layer theme`) — 16 tokens, and the marketing page uses about seven of them:

| token | hex | where it is allowed |
|---|---|---|
| `--color-white` | `#fff` | page background, dark-band text |
| `--color-primary` | `#16171d` | all heading text; **the dark band**; install-card fill |
| `--color-grey` | `#867e8e` | all body copy, all mono labels, inactive tabs |
| `--color-nickel` | `#3b3440` | rules **inside dark**; hero subhead only |
| `--color-stroke` | `#e5e4e7` | every rule, tick and hairline in light |
| `--color-beige` | `#f4f3ec` | one cell at 50 % opacity; search-button fill |
| `--color-slate` | `#14121a` | code-panel fill inside feature visuals |
| `--color-wine` | `#140033` | hero band fallback under the JPEG |
| `--color-vite` | `#b39aff` | one flat plate; dark-band `code` text |
| `--color-ruby` | `#863bff` | **list bullet markers only** |
| `--color-zest` | `#22ff73` | terminal `✓` glyphs |
| `--color-aqua` | `#32f3e9` | dark-band `code` text (oxc rows) |
| `--color-fire` | `#f50` | terminal warning tone (unused on this page) |
| `--color-space` | `#110033` | inline `code` text in light cells |
| `--color-electric` / `--color-midnight` | `#6c3bff` / `#0c0912` | not used in the marketing layer |

**Page background is pure `#fff`.** There is essentially **no surface fill system** — cells are
transparent and separated by rules. The only tinted light surface on the entire page is one cell at
`bg-beige/50`. Everything that needs to read as a "surface" is instead a *dark object on white*
(install cards `#16171d` radius 12) or a *dark object on a coloured plate* (code panels `#14121a`).

**Rules: `#e5e4e7` at full opacity, 1 px, never a translucent black.** In dark contexts:
`#3b3440`. On dark objects the ring is translucent white instead — `rgba(255,255,255,.30)` for the
hero terminal, `.20` for feature code panels, `.10` for install cards and the segmented control,
`.12`→`.25` on hover for the Copy button. So the whole page has exactly two rule idioms: **opaque
grey hairline in light, translucent white hairline on dark.**

Text levels: heading `#16171d` → body `#867e8e` → (dark band) heading `#fff` → body
`rgba(255,255,255,.70)` → mono label `#867e8e` at both polarities. Only three steps, and the mono
label shares the body colour rather than getting a fourth tone.

**The accent.** `--color-ruby #863bff` (violet) is used in exactly **one** place: as the
`marker:` colour of the three disc bullets in "Focus on shipping, not tooling". The violet in the
h1 is a *different* value (`#6254fe`, hard-coded in the shine gradient), and the violet in the
imagery is photographic. There is **no accent-coloured button, link, badge, underline, icon or
border anywhere on the page.** The `.button--primary` reads as accented but its colour comes from a
JPEG.

**The dark band.** `<section id="features" data-theme="dark" class="bg-primary">` sits at
y = 2918 → 5729 (**2811 px, 33 % of the page**), starting immediately after the four-quadrant trust
grid and ending before "Fullstack? No problem.". It contains: the "Everything you need in one tool"
centred intro (352 px), a 1 px ticked hairline, the sticky 53 px tab bar, and the five feature rows
(dev & build / check / test / run / pack). A **second** dark region is the footer (`<footer
class="bg-primary" data-theme="dark">`, 1401 px) — so the page is light → dark → light → dark.

---

## 5. The hero visual

**It is a JPEG.** `terminal-background.DXvDA53U.jpg`, **2160 × 960, 406 KB**, applied as
`background-image` with `background-position: top; background-size: cover` on the 640 px band, over
a `bg-wine #140033` fallback. No canvas, no video, no CSS gradient, no SVG. Content: a **prismatic
radial burst** — a white-hot core just above centre throwing hundreds of fine, heavily grained
violet-to-indigo rays outward, with a few pale aqua streaks crossing them. It is deliberately
*noisy*: the grain is coarse enough to read as film/dither rather than a smooth gradient, which is
what keeps a 2160 px-wide flat image from looking like a stock blur.

**The same texture family is reused five ways**, which is the single biggest economy on the page:
- hero band — `terminal-background.jpg` (2160 × 960)
- feature visual plates — `oxc.jpg` (1280 × 594, aqua/teal streaks), `vitest.jpg` (960 × 960),
  `viteplus.jpg` (1280 × 1078, violet streaks with green flecks), `rolldown.jpg` (1280 × 1080),
  `nitro.jpg` (1282 × 482) — each the *same* anisotropic streak texture recoloured to the
  powering project's hue. The dev & build row is the exception: a **flat** `#b39aff`.
- footer CTA — `footer-background.jpg` (2560 × 800), the burst seen from below.
- primary button ring — `primary-button-background.jpg` (**314 × 92**, 56 KB), a crop of the same
  streaks (five variants exist, switched by `:root[data-variant]`).

**How the terminal is composited.** It is not an image and not a screenshot — it is **live DOM**:

```html
<section class="wrapper border-t h-[40rem] bg-wine terminal-background bg-cover bg-top
                flex justify-center pt-28 overflow-clip">
  <div class="self-stretch px-4 sm:px-8 py-5 sm:py-7 bg-[#111] rounded-tl-lg rounded-tr-lg
              w-[62rem] outline-1 outline-offset-[3px] outline-white/30
              transition-transform duration-1000 translate-y-24"
       style="transition-timing-function:cubic-bezier(0.16,1,0.3,1)"> …
```

Measured: **992 × 527 px**, fill `#111` (a hair lighter than `--color-primary`), padding
**28 / 32 px**, radius **8 8 0 0**, and — the detail that does the work — **`outline: 1px
rgba(255,255,255,.3)` with `outline-offset: 3px`**, i.e. a hairline ring floating 3 px *away* from
the panel, so the window looks like it is sitting in a lit box rather than having a border. It is
`self-stretch` inside a `flex` band with `pt-28`, so it starts 112 px down and its bottom is
**clipped by `overflow-clip`** at the band edge — hence rounding only the top corners. Inside: a
mono 14/24 transcript and a floating pill tab bar (`absolute bottom-6 left-1/2 -translate-x-1/2
p-1 rounded-md border-white/10`).

---

## 6. Motion

Not a static site, but the motion is narrow, purposeful and almost entirely **one-shot**. Nothing
parallaxes, nothing scroll-scrubs, nothing loops except two ambient details.

**Entrances (IntersectionObserver, fire once, then `disconnect()`):**
- Hero terminal: `threshold 0.2` → `translate-y-24` → `translate-y-0`,
  `transition-transform 1000ms cubic-bezier(0.16, 1, 0.3, 1)` (expo-out). Its pill tab bar rides in
  separately: `translate-y-12` → `0`, **700 ms, `delay-300`**, same easing. A 96 px rise over a
  full second — slow and expensive-feeling.
- The three Rive canvases: `threshold 0.1` → `.play()`. Autoplay is off until then.
- `FeatureRunTerminal`: `threshold 0.35` before it will even mount its transcript.

**The terminal transcripts** (`TerminalTranscript`, the most-engineered thing on the page):
1. The prompt line types **character by character at 18 ms/char** (`setTimeout(…, 18 * i)`).
2. A caret shows while typing: `.terminal-cursor`, a 0.62 × 1.05 rem white block, radius 2,
   `animation: .95s step-end infinite terminal-blink` (opacity 1 → 0 at 49 %).
3. Output lines then reveal on a stagger of **`lineDelay × (i+1)`** — **220 ms** in the hero,
   **180 ms** in the run section — each via `<TransitionGroup name="terminal-line">`:
   `transition: opacity .22s, transform .22s`, from `opacity:0; translateY(.35rem)`.
4. After the last line, `completionDelay` (**900 ms** for `create`, **1100 ms** for dev/check/test/
   build, **1200 ms** in run) fires `complete`, and autoplay advances to the next tab after a
   further **1500 ms** (hero) / **2400 ms** (run). Five hero transcripts cycle: `create`, `dev`,
   `check`, `test`, `build`; four run states: Cold Cache / Full Replay / Partial Replay /
   Full Rebuild.
5. **Any user tab click permanently kills autoplay** (hero) — the handler clears the timer and sets
   the flag false, never re-armed.

**Ambient loops (only two):**
- `.button--primary::before`: the streak JPEG at `background-size: 150% 150%` with
  `animation: move-background 16s ease-in-out infinite` (background-position 40 % 40 % ↔ 60 % 60 %),
  inset `-3px`, radius `calc(.5rem + 3px)` = 11 px, under an `::after` of solid `#16171d` at
  inset 0 radius 8 — producing a **3 px iridescent ring that drifts for 16 s** around a dark
  button. Hover: `::before` gets `brightness(130%)` + `scale(1.0125, 1.025)` while `::after`
  *shrinks* to `scale(.98,.96)`, so the ring visibly thickens; the button itself scales 105 %.
- The blinking terminal caret.

**Hovers** (all cheap, all short): `.button` → `scale 105%` + a small shadow, default 150 ms;
`.stacked-blocks` tiles → `translateY(-4px)` plus alternating `rotate(∓5deg)`, 200 ms; install
cards → `bg-[#1a1a1a]`; tab bar → `transition-colors 200ms`, segmented control → **75 ms**.

**Sticky:** the 53 px feature tab bar (`sticky top-0 z-10`) with a 2 px white underline animated by
`transition-all 300ms cubic-bezier(0,0,.2,1)` on JS-set `left`/`width`.

**Honest caveats.** `prefers-reduced-motion` is honoured in exactly **one** component
(`FeatureRunTerminal` — it disables autoplay and renders the transcript instantly). The **hero**
terminal, the 5 s headline shine and the 16 s button loop ignore it. The h1 shine plays once on load
regardless of viewport. Easing vocabulary is tiny: `cubic-bezier(0.16,1,0.3,1)` for entrances,
`ease-out` for the underline, Tailwind's default `cubic-bezier(.4,0,.2,1)` at 150 ms for everything
else.

---

## 7. Copy patterns

**Headline.** Article + abstract noun + prepositional scope, no verb, no product name:
"The Unified Toolchain for the Web". Subhead is the *concrete* counterpart in one sentence,
imperative, naming the three nouns the headline abstracted: "Manage your runtime, package manager,
and frontend stack with one tool." Then a third, smaller, non-marketing line of pure fact:
"Free and open source under the MIT license."

**The heading → subhead contract is consistent everywhere:** heading is a claim of ≤ 6 words;
subhead is exactly one sentence that either quantifies it or names the mechanism, capped at
`max-w-[25rem]`–`max-w-md` (400–448 px) so it never exceeds ~two lines.

| heading | subhead does |
|---|---|
| "A trusted stack to standardize on" | names the mechanism ("built on established open source industry standards…") |
| "Stay fast at scale" | quantifies (40× / ~50–100× / 30×) |
| "Everything you need in one tool" | restates as capability ("unifies your entire web development workflow into a single, powerful command-line interface") |
| "Blazingly fast builds" | benefit + consequence ("Stay in the flow and keep CI fast.") |
| "Fullstack? No problem." | scopes ("from SPAs to fullstack meta frameworks") |

**Two-level naming of features.** Every feature row carries a **mono uppercase kicker that is the
literal command** — `VITE+ DEV & BUILD`, `VITE+ CHECK`, `VITE+ TEST`, `VITE+ RUN`, `VITE+ PACK` —
above a **human h4** — "Blazingly fast builds", "Format, lint, and type-check in one pass",
"Testing made simple", "Vite Task for monorepos and scripts", "Library packaging with best
practices baked in". The tab bar then uses only the bare verb: `dev & build / check / test / run /
pack`. So the same feature has three names at three altitudes: command, promise, verb.

**Section headings phrase benefits as instructions to the reader**, not as product properties:
"Stay fast at scale", "Focus on shipping, not tooling", "A trusted stack to standardize on". The
X-not-Y construction appears once.

**Two distinct list conventions, deliberately not interchangeable:**
- **Checkmark list** (`.checkmark-list`, dark band only) — `gap-3` (12 px), `padding-left: 32px`,
  marker is an inline-SVG data-URI: a 20 px circle stroked `#3b3440` at 0.5 px with two white 1.2 px
  arcs and a bevelled white tick. Items are **feature facts, and each embeds a `<code>` chip**:
  "Always instant `Hot Module Replacement (HMR)`", "750+ `ESLint` compatible rules",
  "`vp check --fix` auto-fixes where possible". Fragments, no terminal punctuation, and one item per
  list is allowed to trail off with an ellipsis ("Coverage reports, snapshot tests, type tests,
  visual regression tests…").
- **Disc bullet list** (light, once) — `list-disc marker:text-ruby`, three items, **business**
  outcomes rather than features: "Stop wasting time on tooling maintenance", "Improve cross-team
  developer mobility", "Standardize best practices for humans and AI-assisted workflows".

**Code as a typographic element.** Bare `<code>` is used as a *chip* — 1 px `#e5e4e7` outline,
radius 4, `2px 6px` padding, mono 16 px, `#110033` — and appears in three roles: as inline nouns in
prose (`vp help`, `package.json`, `tsgo`), as **content in its own right** (the `pnpm npm yarn bun`
row, the `vp env / vp install / vp dev / vp check / vp build / vp run` row — six chips *are* the
cell's payload), and inside checklist items where it is recoloured per project (vite `#b39aff`,
oxc `#32f3e9`, vitest `#22ff73`, DTS `#6CA1DB`) on a `bg-nickel/50` fill.

**Buttons.** Three labels total on the page, all sentence case, all 2–4 words, no exclamation, no
"Free": **"Get started"** (primary, used twice — hero and final CTA), **"Read the Beta
Announcement"**, **"Copy Prompt"** (with clipboard glyph), **"Contribute"**, and per-card **"Copy"**.
Attribution is a fixed phrase repeated as a chip in every feature row — "Powered by" + logo + name —
never in prose. Numbers are always concrete and never rounded up ("147m+", "81.8k", "421ms", "88ms,
16 threads", "1.24s saved", "750+"). Closing CTA is the only sentence on the page addressed to a
team: "Take your team's productivity to the next level with Vite+".

---

## 8. What makes it feel expensive

**The four decisions doing the most work.**

1. **One 1440 px ruled column, and *every* box is the same box.** 24 instances of a single
   `.wrapper` class carry the max-width, the 1 px side borders, and `overflow-x: clip`. Because the
   sides, the section dividers and the in-grid dividers are all *the same 1 px `#e5e4e7` border*
   on nested boxes of identical width, every line on the page meets every other line exactly. There
   is no alignment work left to get wrong, and no second layout system to drift out of sync. The
   whole page reads as one drawn grid rather than a stack of components.

2. **Zero vertical margins; rhythm is fixed section heights + one padding value.** No section has
   `margin-block`. Interstitials are locked to 320 / 352 px, feature rows to a 480 px `min-height`,
   the hero to 640, the spacer to 120 — and *every* content cell is `p-10` (40 px) on desktop,
   `p-5` on mobile, with almost no exceptions. Uniform padding across 20+ cells is what makes a
   dense page feel calm, and it means the ratio of ink to air is identical everywhere.

3. **Restraint at the top of the type scale, and one accent that is genuinely rare.** The largest
   thing on the page is 60 px at **weight 500** — a *medium* display face, never bold — with hard
   optical tracking (−0.05em) and `text-wrap: balance`. Body copy is a different family (Inter) at a
   single size (18/28) in a single grey. And the accent hue appears exactly once as a *bullet
   marker*: no accent button, link, badge, border or icon anywhere. All the chroma on the page is
   quarantined into photography and one animated headline sweep, so the frame stays achromatic and
   the imagery gets to be loud.

4. **The dark band as a structural pivot, switched by one attribute.** A 2811 px `#16171d` region —
   a third of the page — turns on with `data-theme="dark"`, and `[data-theme=dark] .wrapper` swaps
   every rule from `#e5e4e7` to `#3b3440` automatically. Inside it, the layout is *identical* (same
   wrapper, same 40 px padding, same divide-x), so the band reads as the same document seen under
   different light rather than a different design. It also solves an editorial problem: the five
   feature rows are the densest content, and putting them in one dark block prevents ten alternating
   light/dark cells.

**The three cheapest tricks worth stealing.**

1. **The tick triangles.** `content:""` + 5 px transparent borders + `border-left-color` = a 10 × 10
   triangle at `top:-5px; left:0` / `right:0` on any ruled container. Ten lines of CSS, applied
   selectively to ~8 of 20 dividers, and it converts a plain border into something that looks like a
   drafting mark. Highest ratio of perceived craft to effort on the entire site.
2. **`outline` + `outline-offset` instead of `border` for every panel ring.** `outline-1
   outline-offset-[3px] outline-white/30` on the hero terminal, `offset-2 white/20` on feature code
   panels, `white/10` on install cards, and `outline: 3px #fff; outline-offset: -3px` on the
   stacked logo tiles (an *inner* white ring). Because outlines don't affect layout, you get a
   floating hairline halo — the "lit box" look — for free, and it never shifts a grid.
3. **One texture, six uses.** A single grainy prismatic-streak image family is recoloured per
   project and reused as the hero band, the five feature plates, the footer CTA, and — cropped to
   **314 × 92** — as an animated 3 px ring around the primary button (`::before` inset −3px with a
   16 s `background-position` drift, masked by an `::after` of solid `#16171d`). The button looks
   custom-lit; it is a 56 KB JPEG. Runner-up: **asymmetric radius as a bleed signal** — code panels
   are `border-radius: 4px 0 0 4px` and the hero window is `8px 8px 0 0`, so squared corners always
   mean "this continues past the edge".

**Two things to steal with your eyes open.** The three "diagrams" (supply-chain checklist, meta-
framework hub-and-spoke, Nitro strip) are **flat PNG/SVG exports with the copy baked into the
image** — unselectable, unsearchable, and for GT, **untranslatable**. And the only genuinely
programmatic graphics are three Rive files behind a 719 KB WASM runtime
(`1280_x_580_vite__masthead.riv` 294 KB, `514_x_246_focus_on_shipping_v2.riv` 475 KB,
`561_x_273_stay_fast_at_scale.riv` 68 KB) — about **1.6 MB for three animations**, gated behind
`IntersectionObserver` but still a heavy dependency for what are essentially three charts. The
masthead canvas is also mis-sized in practice: its width/height attributes get rewritten by
`resizeDrawingSurfaceToCanvas`, and the resulting aspect-ratio was measured driving a **1440 ×
1523 px** block on first paint before settling. Also note one piece of dead CSS shipping in
production: `.cta-background` carries a base64 data-URI that decodes to the ASCII string
"PLACEHOLDER - Replace with actual cta-background.jpg…" — the class is referenced nowhere in the
HTML (the real CTA band uses an `<img>` instead), so it never renders, but it is proof the sheet is
not audited.

---

## Appendix — numbers to build against

```
column      max-width 1440px (90rem); gutter 16px (768–1440px); no rules <768px
rules       1px #e5e4e7 (light) / #3b3440 (dark); side = border-l/r on .wrapper;
            section = border-t on .wrapper; cells = divide-x/y → border-r/b on :not(:last-child)
ticks       10×10 CSS triangle, 5px borders, top:-5px, left:0 / right:0
padding     cells 40px desktop / 20–24px mobile; footer link farm 96px
heights     640 hero · 352 & 320 interstitials · 480 min feature row · 320 three-across ·
            120 spacer · 81 header · 53 tab bar · 61 copyright
radius      8 buttons & hero window (top only) · 12 install cards & logo tiles ·
            6 segmented control & Copy button · 4 code chips, "Powered by" chips,
            code panels (left corners only)
type        APK Protocol 500 @ 60/67.2/−0.05em → 48/48/−0.025em → 40 → 30 → 24 → 20
            Inter 400 @ 18/28 body · Inter 500 @ 16 buttons, 20 stats
            KH Teka Mono @ 12/16 +0.3px uppercase labels · 14 tabs · 14/24 terminal · 16 code
motion      entrance 1000ms cubic-bezier(0.16,1,0.3,1) (+700ms delay-300 for the pill bar)
            typing 18ms/char · line stagger 180–220ms · line fade .22s from translateY(.35rem)
            completion 900–1200ms · autoplay gap 1500ms (hero) / 2400ms (run)
            underline 300ms cubic-bezier(0,0,.2,1) · hovers 75–200ms · button ring loop 16s
            headline shine 5s ease-in-out once forwards
accent      #863bff — bullet markers only. #6254fe — h1 shine gradient only.
```
