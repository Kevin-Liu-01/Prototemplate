# The Design System

The canon for every page in `apps/redesign` — the laws the sixteen directions
run on, distilled from the founder rounds. The `/craft` page is the living
version of this document, with the diagrams drawn and the engines running;
this file is the reference you read before touching a page.

---

## 1. The four-color system

Four absolute colors, declared once in `src/app/globals.css`:

| token | value | name |
| --- | --- | --- |
| `--color-ink` | `#070707` | ink |
| `--color-ink-raised` | `#101010` | raised ink |
| `--color-titanium` | `#8a8f98` | titanium |
| `--color-paper` | `#ffffff` | paper |

- Structural color everywhere derives from these plus alpha: every text step
  is ink or white at some alpha, every hairline is titanium at some alpha,
  every hatch is a thin ink or white veil.
- **Each page adds exactly one spectral accent** (toolchain: `#2f5ce0`;
  its dark-band lift: `#86a8ff`). One bright white. An accent is a
  controlled edge, never a wash.
- Pages never touch the raw values. Each root class (`.pt-root`,
  `.toolchain-root`, fork roots) publishes a **semantic layer** — surfaces,
  ink steps (`-2/-3/-4`), hairlines (`--*-hair`, `--*-hair-2`), hatch — and
  everything downstream reads those.
- **Dark mode is a token remap, nothing else**: under `[data-theme='dark']
  <root>` the paper family collapses onto ink, ink flips to white, and
  hairline alphas rise so a 1px seam survives between two ink surfaces.
  One surface family in the dark, the way light mode is one white.
- The second surface: light diagrams sit on exactly one sanctioned second
  surface (`--tc-plate`), mirroring the ink / raised-ink pair dark mode
  runs on. `--tc-panel` (`#101010`) is the one dark artifact surface for
  code, config, and diffs.

## 2. The line law

Structure comes from hairlines, and **every line is drawn exactly once**.
The auditor (`scripts/lint-lines.mjs`) enforces it mechanically — see
`docs/SHIP-LOOP.md`. Four defect classes:

1. **Doubled lines** — two parallel strokes from different owners within
   4px, including coincident strokes that composite darker than either.
2. **Missing seams** — section and row junctions no rule closes.
3. **Self-stacks** — a translucent border over the element's own translucent
   background. Fix: `background-clip: padding-box`, everywhere.
4. **Invisible seams** — rules that exist geometrically but sit within a few
   RGB steps of the surface they cross.

### Ownership

- Exactly one thing draws the page rails for any section — a rails wrapper,
  or the section's own full-bleed pair. Never both.
- The row owns every structural line; cells never draw borders that parallel
  a row seam. Framed cells expose the ground through a **1px padding reveal**
  instead of a border — the ground is the seam.
- **Flush at the rail**: where a row meets a line that already exists, the
  cell sits flush and that side's reveal is dropped. A reveal never runs
  beside a rail; a border never runs beside a seam.

### The named antipattern

The overlap: two owners each drawing a real line along the same edge,
compositing into a band darker and thicker than any line the system allows.
The auditor cannot see SVG strokes — reconstructed lines come from computed
CSS — so figures must be checked by eye at 2× pixel crops of the junctions.

### Sanctioned devices

- **The diagonal-hatch spacer** owns a section boundary once: one hairline
  under a 45° hatch band —
  `border-bottom: 1px solid var(--pt-hair)` over
  `repeating-linear-gradient(-45deg, transparent 0 6px, var(--pt-hatch) 6px 7px)`.
- **Border crosses**: where two hairlines must legitimately cross, a small
  plus seated exactly on the intersection (ink, 1px, non-scaling) declares
  the crossing deliberate — the one ornament a junction is allowed.
- **The doubled line** is the one sanctioned double — one owner, one path,
  stroked twice (see §5). The auditor's allow list holds deliberate devices
  by name; everything else stays strict.
- **The sheet mat** is the one sanctioned doubled line in chrome: the viewer
  shell draws its sheet ring as a 1px `--pt-edge` border on `.sheet`, a 1px
  paper gap from the padding of `.sheet-mat`, and a 1px `--pt-hair-soft`
  outline on the mat, with no shadow. The active thumbnail frame and the
  active book page frame carry the same border plus offset outline. The
  auditor allows them under `sheet`, `thumb-frame` and `page-frame`.

### Line law for chrome

Chrome is everything the viewer shell draws around content: the toolbar,
the sidebar, the index panel, the search, the sheet ring, the grid, the
book frame, the help card, the direction corner, and the standalone deck
viewer's own chrome. Every rule in chrome is 1px, drawn once, in one of
three roles, and this is part of the identity: a page reads as
Prototemplate because its lines are single and their weights mean
something.

The three roles, and only three:

| role | token | draws |
| --- | --- | --- |
| structural | `--pt-hair` | large surfaces and the lines that divide the shell: the sheet ring (fixed and flow), the search card, the index panel's left edge, the toolbar bottom, the sidebar right edge, group headers, the book head's rule, the segmented control, the field boxes at rest |
| row | `--pt-hair-soft` | list rows, search results, panel rows, the book head's meta table rows, the help card's table rows, the sheet mat's outer ring, the progress track |
| frame | `--pt-edge` | frames of images and tiles only: thumbnails, the book's page frames, the grid tiles, the 96x54 and 64x36 captures, the hover preview's frame, and the help card |

The weights carry meaning. A frame at 0.62 alpha is the darkest line in
chrome because it holds a picture in place: the eye must find the edge of
a capture against the paper around it. A large surface (the sheet, a card,
a panel, a head) is not a picture; it is the paper itself, so its edge is
the structural hairline, and its mat ring (where it has one) steps down
again to the row weight. A sheet drawn in the frame weight reads as a
boxed image, which is the bug Kevin named in round six ("make the borders
around these areas the proper border colors"). The help card is the one
card that keeps the frame weight: it floats over a scrim, where the
hairline would vanish.

Nothing in chrome sets a border color from any other token or literal.
`--pt-ink` appears on a border only as a state: a pressed button
(`.is-on`), the active thumbnail or page frame (`.is-active`), the count
while it is being edited, the solid call to action, and a field while it
holds focus. Group headers, book heads and table headings draw `--pt-hair`,
never ink. Outlines are rings: the three roles, ink for focus and active
rings, paper for a ring on an ink plate.

Where two bordered components touch, exactly one draws the line:

| junction | owner | the other side |
| --- | --- | --- |
| sidebar and stage | the sidebar's right edge | the main region draws no left edge |
| toolbar and stage | the toolbar's bottom edge | the stage, the hint row and the index panel draw no top edge |
| index panel and stage | the panel's left edge | the sheet ring runs under the panel; the panel covers the progress track while open |
| group header and its first row | the header's bottom edge | the first row draws no top rule |
| last row of a group and what follows | the last row's bottom edge | the next header carries no top rule |
| sheet mat and its content | the mat's ring (hair border, paper gap, hair-soft outline) | content draws no outer border |
| book head and its contents | the head's bottom rule (`--pt-hair`) | the contents grid draws no top rule; its rows draw their own bottom rules |
| book head and its meta table | the table's rows draw `--pt-hair-soft` under themselves | the table draws no outer frame; the head's rule closes it |
| tile and its shot | the tile's frame | the shot draws no border |
| segmented control and its options | the control's outer border | options draw only the dividers between them; the last draws none |
| stacked corner buttons | the upper button's bottom edge | the lower button's top edge is transparent at rest |
| sidebar head and toolbar | each owns its own side of the vertical seam | the two bottom rules meet at the sidebar's edge and never overlap |

The auditor enforces this from computed CSS. `pnpm lint:lines:shell` walks
`/`, `/docs`, `/brand`, `/compare`, `/archive/<first slug>`, `/d/production`
and `/deck` (the iframe's document) at 1440, 1280 and 390 in both themes
against the dev server on port 3005, with the list toggled, the index panel
open, the search open, and the grid and book modes on `/` and `/deck`. It
fails on any doubled line (two owners within 4px), any junction (two owners
coincident on one seam), and any border color in chrome outside the three
roles. `pnpm lint:all` runs it. The allow list in `scripts/lint-lines.mjs`
names every sanctioned multi-stroke device with its reason inline; for
chrome those are the sheet mat (`sheet`: a hair border, a paper gap, a
hair-soft outline), the active frames (`thumb-frame`, `page-frame`, the
sidebar's site tiles as `pt-tile`) and the hover preview's mat
(`pt-preview`).

Scroll regions belong to the same law: one thin scrollbar everywhere in
chrome, a 4px gutter with no track rule and a 2px thumb in `--pt-thumb`
that widens to 4px on hover, owned by `.pt-scroll` in
`src/components/viewer/tokens.css` and mirrored by the deck's `.scroll`
rule. No scroll region draws a rule beside its thumb.

### Corners

The corner notches on hero cards are not drawn — they are the ground showing
through, so a corner can never disagree with the seam that meets it.

## 3. The rails

The page's spine is a ruled column with doubled rails: the inner pair drawn
once by the column's own `border-inline`, the outer pair by one wrapper
pseudo at ±10px (`--tc-rail-outer: 18px` accounts for the padding-box
inset). A band's inner pair is drawn exactly once by its own `-in` column —
a coincident second stroke stacks alphas and reads as a different color.

## 4. Typography and voices

- Three voices: the serif face for brand moments, the grotesk for labels
  (11px, `letter-spacing: 0.06em`), the mono for numbers and tokens only.
- Hairline-boxed code blocks; figcaptions under figures; one type scale per
  page. Labels never shout; the active element is the only color.

## 5. The doubled line (thread grammar)

The brand's connector: **one SVG path stroked twice** — a full-gauge ink
stroke under a narrower surface-colored core (`stroke-width: gap`), carving
two parallel hairline threads at a constant gap along any curve. Tokens:
`--thread-gauge: 1.5px`, `--thread-gap: 3px`.

- All three roles carry `vector-effect: non-scaling-stroke`.
- The core's stroke must match the actual surface behind the diagram, or the
  carve reads as a painted stripe.
- Layer order is load-bearing: threads first, pulses next, cores last. Draw
  a later sandwich over an earlier one and the junction re-carves into one
  clean pair — merges cost zero parallel-curve math.
- The live pulse is a third copy of the same path in accent at full sandwich
  gauge, between threads and cores — carved into two accent hairlines, never
  a filled band. The traveling window is **real geometry** (a sub-polyline
  rewritten per tick), never `stroke-dasharray` — dash distances drift under
  anisotropic stretch.
- **Two-tone** (one white thread, one gray): clip the white copy to a
  half-plane closed along the same center path — the split seam lies inside
  the carve. Componentized as
  `src/components/shared/diagrams/DoubledLine.tsx`. Offset clones collapse
  on curves; concentric restrokes only make symmetric rings.

## 6. The isometric family

One 30° axonometric map for every iso drawing
(`src/app/d/toolchain/diagrams/iso.ts`):
`project(x, y, z) = [(x−y)·cos30, (x+y)·sin30 − z]`, camera at (+,+,+).

- **Light from the upper left, always**: exactly three faces visible, shaded
  top 4% / left 9% / right 15% (currentColor mixes; accent faces keep the
  same order). Reordering is forbidden.
- The extrusion recipe: opaque hull from `roundedPolygon(silhouette(...))`
  (the occluder), then right/left/top face fills, then hairlines — rim, top
  contour, and the interior front edge(s) the silhouette doesn't draw.
- `IsoPrism` extrudes any convex plan polygon under the same visibility and
  tone law; `plane(z, ox, oy)` seats whole flat drawings into a surface with
  one matrix; `markPath()` lays rounded bars in a face; brand marks render
  as alpha masks so the shape takes the surface's ink.
- One corner radius family-wide (`ISO_RADIUS = 2.4`); plate thickness ≈4% of
  footprint, air between stacked plates ≈40%; depth cues live in per-plate
  stroke alphas, never group opacity; each drawing spends its accent on
  exactly one element.
- The mark shimmer is `DitheredMark` (§7's 1-bit language as a specular
  band): nested Bayer coverage tiers windowed by pre-rotated 60° clip paths,
  swept by pure horizontal translate — `rotate()` windows are GSAP-origin
  fragile.

## 7. The 1-bit language (Bayer dither)

Density ramps render as ordered dither, never alpha veils.

- The 4×4 matrix (`[0,8,2,10 / 12,4,14,6 / 3,11,1,9 / 15,7,13,5]`) and the
  8×8 (an exact permutation of 0..63 — 65 tonally linear levels) are the
  house screens.
- Coverage tiers **nest by construction** — every tier's lit cells are a
  subset of the next — so non-overlapping regions filled with different
  tiers compose exact ramps, and opaque glint ink means doubled cells never
  brighten.
- Cells are square screen pixels: transforms that would foreshorten them
  (a plane seat) go **inside** the alpha mask; `crispEdges` keeps cells
  1-bit at any zoom; CSS upscales with `image-rendering: pixelated`.
- Engines: `src/lib/dither.ts` (CPU, any scalar field, 1 device px per cell)
  and `src/lib/studio-field.ts` (GPU, the authentic `BAYER_PRESETS` roster of
  ten variants, one shared GL context, switch by remount).

## 8. The moving type law

- The morphing unit is **one shaped text node** — never per-character spans,
  which break Arabic joining and Devanagari matras. `lang` + `dir` on the
  node; `unicode-bidi: isolate` on the container.
- Width is measured from a hidden probe carrying the word's own lang/dir —
  never a sum of per-character boxes — cached, device-pixel snapped, and the
  container's width is the **only layout-affecting property that animates**,
  one continuous tween per cycle. Re-measure on resize and `fonts.ready`.
- One clock per page: the component never runs a timer; the host drives it
  (the dossier's locale belt, a craft plate's interval). Engine:
  `src/components/shared/EverySentence.tsx`.
- Locale pills render through one component (`LocaleTag`): flag first
  (fixed 15×11 SVG print), code in the host's mono on the baseline; the host
  supplies the box.

## 9. Motion discipline

- Every loop is created paused; ScrollTrigger (or an IntersectionObserver)
  plays/pauses it while the section is on screen; multi-phase choreography
  lives on ONE timeline so phases can never drift.
- `prefers-reduced-motion` short-circuits setup entirely; the markup pose IS
  the still (static accent pair, parked seam cut, single dither frame).
- Dash gotchas: normalize `pathLength` to 1000 (GSAP integer-rounds
  offsets); dashes clip at a subpath's end rather than wrapping closed
  loops; Chromium computes dash patterns in screen space under
  non-scaling-stroke and ignores `pathLength` there — rings that dash use
  raw user units with neither.
- Cache a path's source `d` (`el.dataset.traceD`) before an animation blanks
  it per tick — a re-run would otherwise trace an emptied path.
- Leader joints overshoot into opaque hulls so joints are gapless; leaning
  shapes (scan beams) are re-projected per phase (`beamAt(t)`), never a
  translated constant.

## 10. The seam (slide-to-reveal)

Both layers full-width and pinned; the handle writes one CSS var
(`--seam-cut`) and the top layer clips to it — content never travels with
the handle. State lives in the var: drags cause zero re-renders, GSAP tweens
drive the same dial, the keyboard path re-reads the live computed value.
The handle is the **dossier refit**: a 64px transparent hitbox, solid
two-tone threads with the payload's ink filling the run, and a 16×40
rectangular grip tab — the light surface wears the dark chip, the dark
surface the light chip. Component:
`src/app/d/toolchain/sections/RevealSeam.tsx` (host CSS supplies the skin).

## 11. Engine lifecycle

Every canvas/GL engine follows one contract: mount lazily (an
IntersectionObserver arms the plate), pause offscreen and on hidden tabs by
its own observer, render exactly one still under reduced motion, and
`destroy()` releases everything the instance owns (shared GL contexts
persist for the session by design). Ink re-resolves on `data-theme` flips.
Where an engine has quality tiers, quality follows **measured** frame cost,
not just the window: glyph-field's frame-time governor ratchets a slow
device down the phone cut's own ladder (lean device-pixel cap, then the
lean pool), down only, with pool cuts applied at idle.

## 12. The mobile type ladder

Under 720px, type and spacing are **one token ladder, not per-rule
values** — `--tcm-*` slots declared on `.toolchain-root` in the engine's
LATE 720px block (`src/app/d/toolchain/styles.css`), consumed by every
floor below:

| slot | value |
| --- | --- |
| `--tcm-h2` / `-h2-lh` | 2.25rem / 1.18 |
| `--tcm-h3` / `-h3-lh` | 1.375rem / 1.3 |
| `--tcm-h4` / `-h4-lh` | 1.125rem / 1.35 |
| `--tcm-lead` / `-lead-lh` | 17px / 1.55 |
| `--tcm-body` / `-body-lh` | 16px / 1.6 |
| `--tcm-small` / `-small-lh` | 14px / 1.55 |
| `--tcm-kick` | 13px |
| `--tcm-quote` / `-quote-lh` | 22px / 1.4 |
| `--tcm-head-pt` / `-head-pb` | 72px / 36px |
| `--tcm-gap-h2` / `--tcm-gap-h3` | 18px / 14px |
| `--tcm-cell-pad` | 28px |
| `--tcm-box-pt` / `-box-pb` / `-box-gap` | 36px / 38px / 28px |

- **The px-fallback consumption law**: every consumer reads
  `var(--tcm-X, <px fallback>)` with the slot's canonical value as the
  fallback — a rule the ladder doesn't reach (a 721–900px cut, a fork that
  hasn't declared it) degrades to the same number, never to unstyled. New
  mobile rules never hardcode a size the ladder has a slot for.
- **Unlayered engine beats utilities**: the engine's plain CSS is
  unlayered and Tailwind utilities live in a `@layer`, so engine floors
  outrank utility metrics (the box-gap rule beats a head's `max-lg:mb-6`).
  Heading and paragraph metrics therefore live in engine CSS, never in
  page utilities.
- **The late block**: the ladder and its floors sit in the engine's LAST
  720px block because several base rules they override appear after the
  earlier 720px block — same-specificity declarations only win by
  following them. New mobile floors go there, not in the early block.
- **The sg cut outranks the engine**: `v0-pages.css`'s mobile cut
  (`.toolchain-root:is(.sgdh-root, …)`) carries higher specificity than
  any engine floor, so it must consume the same tokens — an engine-only
  raise silently fails to render on the singularity homes. Change one,
  change both.

### The box-air standard

Boxed cells — framed cards, bento plates, stacked dark-band cells —
breathe alike on mobile: block padding `--tcm-box-pt`/`--tcm-box-pb`
(36/38), and `--tcm-box-gap` (28px) between a box's head and its
artifact. The gap is card-scoped (`.tc-card > .shell-cell-head`) on
purpose: cells are flex columns, margins never collapse, so an unscoped
head margin would stack onto the copy cells' own body margins. The seam
floor rides alongside: copy never sits within 20px of a hairline
(`--tc-card-pad: 20px`; the trust lead's 20px bottom pad).

## 13. The svh/dvh law

A mobile stage measures the viewport twice, and the two units never
trade jobs:

- **Reach is dvh.** Whatever must touch the true screen bottom — the
  stage's rails, the text zone — sizes from `100dvh`, the real viewport
  with browser chrome collapse included.
- **Layout is svh.** Any height that participates in layout rides
  `100svh`, the stable viewport: a dvh layout height grows the document
  on every chrome toggle and jitters the scroll under it.
- The difference is a token — the stack stage's `--v0sm-bar-gap`
  (`dvh − svh`, 0 while the URL bar shows) — and only overhangs (the
  rails' lower reach) spend it. Anything SIZED from the stage derives
  from the stable var, or it breathes with the URL bar.

## 14. The two read lines

The stack story runs on two ladders of scroll anchors, measured per beat
and re-anchored on every ScrollTrigger refresh
(`src/app/d/_v0/sections/FullStack.tsx`):

- **The read line (55%) is structural.** A beat LOCKS IN when its COPY
  BLOCK's center takes the 55% line — the same line the sticky figure's
  seat centers the tower on, and, for the finale, its pin-engage. The
  tower's build clock and the capstone scrub both key on it. Anchors are
  measured on the copy itself, from FLOW geometry (the sticky finale's
  own rect would read the stuck pose on a mid-dwell refresh) — never on
  the beat window's top, which runs nearly half a viewport ahead of the
  copy and fires every arrival early.
- **The highlight line (80%) is the spotlight's alone.** A beat's copy
  lights as its center rises through the 80% line — just after entering
  the screen, while the arriving layer is still mid-build beside it.

One scrubbed dial spans the whole read; a piecewise map (measured
lock-ins in, story time out) HOLDS the clock while a row is being read
and spends each gap hold → build → lock, so a layer stands locked before
its own copy takes the line.

## 15. Chrome exceptions Kevin asked for

The shell's chrome is Inter only, weight 500 or less, radius 0, one
hairline per rule, colors from `src/components/viewer/tokens.css` and
borders in the three roles of section 2. Kevin's round six directives
override those rules for exactly four elements. Each exception is listed
here with its owner file so nothing else reaches for it, and so the next
sweep does not "fix" it back.

| element | exception | owner |
| --- | --- | --- |
| Search pill (toolbar) | `border-radius: 6px` on the 32px `--pt-hair` field; hover border `--pt-ink-2`, a fourth border color in chrome (the rest state stays in the `hair` role, which is what the line auditor reads) | `Toolbar.css`, `.pt-toolbar .pt-search-btn` |
| Search key chip | `kbd.pt-search-kbd`: `border-radius: 4px`, ground `--pt-hair-soft`, 11px weight 500 titanium; reads ⌘K, and `Ctrl K` on Windows and Linux (`Search.tsx` swaps the text after mount from the user agent) | `Toolbar.css`, `Search.tsx` |
| Present | the one `.is-solid` button: `border-radius: 8px`, 14px sides, the label first and the 12px play glyph after it (`flex-direction: row-reverse`, so ToolButton keeps one markup), hover drops the ink ground for ink text in the ink frame, the old `.pt-nav-present` from 430e3c7 | `ToolButton.css`, `.pt-ib.is-solid`; `Toolbar.tsx` passes `solid` |
| Prototemplate mark | the rainbow core: five chroma stops (`#4b3bff`, `#00b3ff`, `#27d17e`, `#ffc53b`, `#ff3b6b`, display-p3 where supported) declared as `--pt-mark-c1` to `--pt-mark-c5` on `.pt-mark`, the one color in chrome outside the site icons; hovering the head link (or any `a` or `.pt-mark-host` around the mark) fades the hatched paper fill in over the core, opacity only, over `--pt-dur-enter` (200ms, 0 under reduced motion). The markup is the old nav's span with four `i.pt-mark-line` and `i.pt-mark-fill` | `PtMark.tsx`, `PtMark.css` |
| Sidebar nameplate | the name beside the mark on every Prototemplate route is `span.pt-brand-word` with `b.pt-face-serif` `proto` in Fraunces 600 and `b.pt-face-grot` `template` in Space Grotesk 500 at 14.5px, two faces outside Inter and a weight above 500; the fonts load from `src/lib/brand-fonts.ts` with their variable classes on the span, so `/docs` and `/brand` carry them too. The deck keeps its Inter title beside the GT mark | `Sidebar.tsx` (head), `Sidebar.css` (head rules) |

Everything else in chrome keeps the rules above: every other toolbar
button is square, the palette card and the index panel are radius 0, and
no other element carries a chroma or a face outside Inter.
