---
name: gt-diagrams
description: >-
  How General Translation diagrams are drawn: when a diagram earns its place,
  the existing diagram components to mount first, inline SVG with ink, mid and
  hairline strokes, label sizes per surface, the doubled-line connector and its
  pulse, crossings and straight taps, theme-safe fills, and the check at 2x
  crops; and the isometric family: the 30 degree projection in iso.ts, light
  from the upper left, the extrusion recipe, one accent object, marks seated
  as alpha masks, the DitheredMark shimmer, the build and scan animations
  and the reference drawings such as the Locadex iso. Use when drawing a
  flow, an architecture, a stack, a before and after, a timeline or an
  isometric figure for a page, a slide, a post graphic or a film, or when
  reviewing a figure's junctions and labels.
metadata:
  title: Drawing diagrams
  areas: diagrams, isometry
  updated: 2026-10-10
  origin: prototemplate
  owner: P
---

# Drawing diagrams
A General Translation (GT) diagram follows one grammar on every surface: the Prototemplate site, the landing app, the brand deck, blog graphics and the films. Pages and slides draw it as inline SVG; the blog graphics are HTML pages and some films draw on a canvas. It mounts a drawn component before it draws anything new, links objects with the doubled line, and is read by eye at 2x in both themes, because the line auditor skips everything inside an SVG. Paths are relative to a Prototemplate checkout (`$PROTOTEMPLATE`, github.com/Kevin-Liu-01/Prototemplate, Kevin's design hub with the canon in DESIGN.md and BRAND.md) unless they name `$GT_CLOUD` (a checkout of github.com/generaltranslation/gt-cloud at origin/main, whose `apps/landing` serves generaltranslation.com).

## 1. When a diagram earns its place

A diagram earns its place when it shows a relationship the text alone does not: a flow of three to six steps, a before and after pair, a scale or an axis, a stacked layer model, a grid or a ladder, or a timeline (`deck/DECK-GRAMMAR.md`, Diagrams). A clean list of statements stays a list, set as ruled rows. Boxes that restate a list with no relationship drawn between them fail review.

- **The real artifact.** Draw the actual file, the actual strings, the actual URLs and widths the browser measured. TranslationFlow shows the real `app/page.tsx` and the three JSON files the config writes; SentenceWidth lays out and measures each locale; SdkLedger replaced a plate stack that drew slabs where the package names belonged. Grey bars or squiggles in place of text fail review.
- **Nothing invented.** Every object is something the product does or ships. Kevin rejected invented quotes and product vignettes on the enterprise page (Kevin, 2026-08-05; 2026-08-11). Content comes from the current generaltranslation.com page.
- **One connected drawing.** The enterprise diagram rebuilt on 2026-08-11 is one machine: a ground rail with a traveling pulse, overlapping source plates, the GT mark seated in the core deck and a delivery pile (k-pages-restart-round). Kevin's verdict that day was that enterprise "has better diagrams". Separate vignettes placed side by side do not show a relationship.
- **Few words inside.** The copy beside the figure names its parts. The stack tower carries no type; its copy rail names the plates (founder note in `src/app/d/_v0/sections/StackTower.tsx`). Text seated in an isometric face at chip scale is never legible, so the enterprise diagram's three context keys stay bare and a stage label names them.
- **A complete still.** The composition is whole before the first frame, so any frame is a correct screenshot. WordMorph prints every translation at all times; ExpansionBars holds its accent on German while the reading marker moves. The markup pose is the reduced-motion still (DESIGN.md section 9).
- **Glyphs that identify.** An icon in a diagram names a thing: a server on a point of presence, a user, a file on the route (EdgeGlobe). StatRow dropped its ornamental glyphs; the number is the figure.

Kevin measures diagrams against generaltranslation.com and resend.com (Kevin, 2026-07-30). On 2026-08-11 he restarted the landing diagrams: "these diagrams are so bad. i literally want you to restart these". Build one exemplar, get his sign-off on its grammar, then repeat it (redesign-v0-verdict). Explorations stay on localhost until he has reviewed them.

## 2. Reuse first

Mount an existing component when the content matches. The redesign's Figma mocks were screenshots of these components (Kevin, 2026-08-04). A new drawing is for new content only, seated inside a framed cell.

The lookup from content to component (translation flow, locale routing, text expansion, context, plurals, right to left, writing systems, the glossary and preview surfaces, delivery from the edge, the full stack, context inheritance, the SDKs, numbers, locale names, connectors and isometric objects) opens `references/components.md`. Every file is under `src/app/d/toolchain/diagrams/`; the connector is `src/components/shared/diagrams/DoubledLine.tsx`, and isometric objects are section 10.

No route in Prototemplate mounts the rows marked unmounted, nor TcStackTrace or the TcMini set. Read them as reference drawings and check them against sections 3 to 6 before mounting one: TcCtxLayers draws its thread as two separate paths and ends it in a 14 by 11 arrowhead, which breaks both rules. Five directions keep forked copies of the `lang/` or `surface/` set under `src/app/d/<direction>/diagrams/`; change the toolchain original.

The components also run live on `/docs` (the build log, with the DoubledLine and iso plates), in the deck (slides 30, 31, 33, 35 and 74; start a new slide diagram from their markup) and in gt-cloud's landing ports; the files are in `references/components.md` ("Where the components run live").

`references/components.md` lists every component with what it shows and where its accent goes.

## 3. Strokes and fills

The deck's grammar (`deck/DECK-GRAMMAR.md`, Diagrams; slide 33) states the rules for every surface:

- **Three stroke roles.** On the deck: `class="ink"` (ink), `class="mid"` (`--ink-2`, the body text tone) and `class="hair"` (`--hair`). On a page the root's semantic layer gives the same three, for example `--tc-ink`, `--tc-ink-2` and `--tc-hair` on the toolchain root.
- **Weights.** `stroke-width` 1 or 1.5. Square caps, no rounded joins. A 1px line at a 1:1 scale sits on a half-pixel coordinate (`y1="70.5"`) so it fills one row of device pixels.
- **Fills from tokens.** `var(--ink)`, `var(--paper)` and `var(--plate)` on the deck; the root's tokens on a page; `currentColor` with `fill-opacity` steps for faces. A hex written as an SVG attribute passes `no-hex-colors`, so review catches it; which lint covers which folder is in `references/color.md`.
- **Non-scaling strokes.** Every stroke in an SVG that scales with its column carries `vector-effect: non-scaling-stroke`, so a 1px line stays 1px.
- **Markers.** A value on a scale or a step on a flow is an 11px filled square in ink. Arrowheads are never drawn: direction comes from reading order, a marker or a short perpendicular tick (slide 33). `DECK-GRAMMAR.md` tolerates a filled triangle up to 8px, and older toolchain drawings carry arrowheads (a 14 by 11 triangle in `tc-ctx-layers.tsx`, `IsoArrow` in `IsoSolid.tsx`); slide 33 states the stricter rule, and new drawings follow it.
- **Two kinds of line.** Links between objects use the doubled connector. Flows, axes and scales use a single 1px line (slide 33).
- **Depth in ink.** Depth is a stroke alpha set on each element. Group opacity is never used for depth (DESIGN.md section 6). EdgeGlobe states depth once: near arcs at the regular weight, far arcs as dashed hairlines, the limb as the strongest neutral line, no fills.
- **Leaders.** A leader runs node, elbow, horizontal run, and the leaders fan outward so no two cross (EdgeGlobe). SdkStack is the reference for leaders out to labels.
- **Structure only.** Registration crosses and hairline grids may appear inside a diagram as structure. No glass panels, glows, shadows, rounded boxes or gradients other than dither density (BRAND.md, the avoid list; `docs/GRAPHICS.md`).

Each surface spends the accent differently.

| surface | accent rule | source |
| --- | --- | --- |
| site page | One spectral accent per page (`#2f5ce0` on paper, `#86a8ff` on the dark band), spent by each drawing on exactly one element. On the toolchain page the accent's six places are all diagram states. | DESIGN.md sections 1 and 6; `src/app/d/toolchain/styles.css` |
| deck | No accent on text, lineEach surface spends the accent differently: one element per drawing on a site page, none on text, lines or fills in the deck, one edge at a time in a film (whose palette since round 4 is its material), and red for removed with blue for the replacement in a blog graphic (`references/color.md`). s in technical diagrams as an instrument and avoids them where possible; the deck uses no mono outside its `.panel`. The shared DiagramFrame set's 9.5px mono text predates this rule.
- Labels follow gt-voice: sentence case, proper nouns capitalized, product tokens in their exact form and never as the first word, no trailing period, no eyebrow above the figure, no title inside a blog graphic.
- A non-Latin label is one text node with `lang` and `dir` (DESIGN.md section 8).

Label sizes and floors differ by surface.

| surface | label sizes | floor |
| --- | --- | --- |
| deck sheet, 1600 by 900 | 20px in `--ink-2` (`svg.dia text`), 26px in ink at weight 500 (`.lab`) | 18px (`.sm`); any text under 15px on the sheet is a defect |
| blog graphic, 1600 by 900 stage shown at 0.44x in the article column | label chips 28px Inter 600; measurement labels 28px Geist Mono on a backing pill | 26px after zoom-to-fit (`MIN_TEXT` in `graphics/build/gen-lib.js`, held by `pnpm graphics:audit`) |
| film, 1920 by 1080 | the deck ladder at 1920 in `motion/kit/tokens.css` (`.t-cap` 18 to `.t-display` 106) | 18px |
| page | the page's own type tokens | the page's smallest label token, at the narrowest width the figure renders (check 390) |

Size after scale. A viewBox that does not render 1:1 scales its text with it. Compute the rendered scale and size the text so it lands on the target. Slide 31's 800-unit viewBox renders at 0.914 in its column, so its labels are set at 22px and land at 20.1px; the slide records that in a comment beside the rule. `scripts/figure-check.mjs` in this skill prints every label's rendered size. In a blog graphic a composition wider than 90% of the frame is scaled down with its labels, so the fix for a small label is a narrower composition.

## 5. The doubled line

The doubled line is the brand's connector. It is one path stroked twice: a full-width stroke in ink, then a narrower stroke in the surface color on top, which leaves two parallel threads at a constant gap along any curve (DESIGN.md section 5). Kevin asked for it in diagrams on 2026-07-29 ("the double line 'adidas' like aesthetic of gt").

- **Tokens.** `--thread-gauge: 1.5px` per thread, `--thread-gap: 3px` between them. The thread layer is 6px wide and the core is 3px. Use the tokens; do not invent gauges.
- **One component.** `DoubledLine` (`src/components/shared/diagrams/DoubledLine.tsx`) takes `d`, `core` (required), `gauge`, `gap`, `ink`, `inkB` with `splitD`, and children for the pulse. In markup the same three layers are classes, as in `.tf-thread`, `.tf-pulse` and `.tf-core` in `src/app/d/toolchain/diagrams/flow.css`.
- **The core matches the ground.** `core` is the actual surface behind the drawing (`var(--tc-plate)`, `var(--tc-panel)`, `var(--color-ink)`). A core in another color shows as a painted stripe.
- **Layer order.** Threads first, pulses next, cores last. A later three-layer group drawn over an earlier one paints the junction back into one clean pair, so a fork or merge needs no offset-curve math. Draw the trunk last.
- **One trunk at an edge.** A fan-out leaves its panel as exactly two threads, then splits at a drawn junction (TranslationFlow).
- **The pulse.** A third copy of the path at the full width, between the threads and the core, so the core splits it into two hairlines. Its color is the drawing's emphasis: the accent where the pulse is the drawing's one accent element (ContextResolve), and the page's full ink where the accent is spent elsewhere. TranslationFlow's pulse has been ink since 2026-07-31 (commit 04d8410, "per the four-color law"), although DESIGN.md section 5, slide 31 and the file's own header still say accent. It moves as real geometry: the path is sampled once and the pulse's `d` is rewritten to the slice under the window on each tick. It never moves by `stroke-dasharray`, which drifts under a stretched viewBox. It ships hidden in CSS, and under reduced motion it never starts.
- **Two-tone.** One white thread and one gray: clip the white copy to `splitD`, the same center path closed off one side of the viewBox. The seam lies inside the core's gap on every bend.
- **Links between objects.** The doubled line connects objects. It is never drawn as a second page rail beside the column's pair (DESIGN.md section 3). Kevin's brief for the pricing page's full stack section is the pattern: the numbered boxes 01 to 04 sit around the drawing, each joined to its square on the GT layer by a doubled line (Kevin, 2026-08-12).
- **Video scale.** The films draw a 7px thread layer under a 3px core at 1920 on whole-pixel rows, and lay a casing in the ground color under a line that crosses dither or smoke.

`references/doubled-line.md` has the code, the pulse helpers and their timing, the two-tone recipe, the sizes per surface and the auditor's allow list for doubled lines drawn in CSS.

## 6. Junctions

Every line has one owner (DESIGN.md section 2).

- **One stroke per edge.** Where two shapes share an edge, one draws it. A row draws its seams and the cells inside it draw none (deck slide 30: cell borders put two lines at every seam). Two owners on one edge composite into a band darker and thicker than any line the system allows. DESIGN.md names this overlap as the antipattern the line law exists to prevent (Kevin, 2026-08-06).
- **Crossings.** Where two hairlines must cross, a small plus sits exactly on the intersection and declares it deliberate. It is the only ornament a junction may carry. DESIGN.md draws it in ink at 1px with `non-scaling-stroke`; slide 30 draws a 15-unit plus at `stroke-width` 1.5 in ink; the sheet's corner crosses are 11px in `--cross`.
- **Merges.** Doubled lines merge by draw order (section 5). Never draw two parallel strokes from two paths to fake a pair.
- **Leaders meet their objects gaplessly.** A leader's end runs past the vertex it meets and is buried under the opaque hull drawn after it in the same SVG (+2 units in StackTower), so no anti-aliased seam shows where the rounding recedes (DESIGN.md section 9).
- **Taps move with their plates.** A tap lives inside its plate's own SVG, so it moves with the plate through every lift and glide (founder note in StackTower.tsx: the lines must stay on the layers).
- **Straight taps.** Connectors that join a rail or a card are straight runs with one elbow (section 7).

## 7. Geometry under stretch

`preserveAspectRatio="none"` lets a connector strip fill a fluid column; TranslationFlow's fork is a 72 by 260 viewBox stretched between two panels. Under that stretch:

- strokes hold their width only with `vector-effect: non-scaling-stroke`;
- straight segments stay straight, and curves warp because their control points stretch with the box;
- circles become ellipses, and text distorts.

So a stretched SVG holds straight taps and no text. The sign-in workflow diagram replaced its quadratic connectors with straight taps for this reason (k-pages-restart-round, 2026-08-11). TranslationFlow's fork predates that round and still bends its branches with cubic curves; `figure-check.mjs` warns on each one, and a new stretched strip uses straight taps. Labels for a stretched strip live in HTML beside it. Under 620px TranslationFlow hides the fork and stacks its panels; a figure that cannot hold its shape on a phone reflows and is never squashed.

Dashes and draw-ons carry their own traps (DESIGN.md section 9; gt-motion section 7). The ones that decide how a diagram is built are in `references/dashes.md`: `pathLength` is ignored under `non-scaling-stroke` in Chromium, a traveling dash tiles on a scaled SVG, dashes clip at the end of a closed subpath, the sign of a parked offset sets which end a draw-on reveals from, and the source `d` is cached and an empty path guarded before an animation rewrites it.

## 8. Themes

- **Tokens and currentColor.** Every color resolves from a token or `currentColor`, so dark mode is a token remap and the drawing needs no second version (DESIGN.md section 1). IsoFrame and the toolchain family take no color props; a page themes the whole family from one ancestor.
- **The same geometry in both themes.** A dark version that lands a pixel away from the light one is a layout shift (Kevin, 2026-09-18). `figure-check.mjs` fails a figure whose box or label count differs between themes.
- **Cores follow the theme.** Pass `core` a token that remaps with the ground; a literal paper core shows as a white stripe in the dark theme.
- **Marks as alpha masks.** A brand mark is never laid over a drawing as a flat logo. Seat it through a `<mask style={{ maskType: 'alpha' }}>` holding the mark's image (`public/brand/no-bg-gt-logo-light.png`; `gt-logo-light.svg` may carry a background), with a `currentColor` or token-filled rect drawn through the mask, so the mark takes the surface's ink in both themes. `references/isometric.md` section 5 has the construction, the asset for each size and the seat inside a `plane()` face. The Locadex diagram carries the Locadex mark and is never a gif (Kevin, 2026-08-04), and gt-ui's `no-gif-mark` rule fails a gif used as a mark. The deck pastes marks as currentColor markup from `public/marks` and never redraws them.
- **Engines re-resolve ink** on a `data-theme` flip (DESIGN.md section 11).
- **Dark twins.** A screenshot in the deck carries a `data-dark` twin where one exists in `deck/shots/`, and otherwise keeps a 1px `--hair` border. Blog covers ship in a dark and a light version at the same framing.
- **Skins repaint tokens.** A light skin can repaint a dark panel token (gt-cloud's sgdh light skin paints `--tc-panel` white), so check every dark plate in the light theme.

## 9. Checking

The line auditor (`scripts/lint/lines.mjs`) returns early for any element inside an `svg` or a `canvas`, so a figure's strokes, junctions and crossings are checked by eye at 2x crops in both themes (DESIGN.md section 2). `scripts/figure-check.mjs` in this skill captures the figure and its crops at 2x in light and dark, prints each SVG's viewBox and scale, and fails on a label under `--min`, a distorted label, a stroke in a stretched viewBox without `non-scaling-stroke`, a `pathLength` dash under `non-scaling-stroke`, and geometry that differs between themes; `scripts/deck-page.mjs` assembles the deck for a slide check. It cannot judge a junction: read every crop for one clean pair at each merge and fork, a border cross at each crossing, no seam where a leader meets a hull, 12px clear around each label, and a complete still under reduced motion. The commands, the crop syntax and the surface gates (`deck/shoot-slide.mjs`, `pnpm graphics:audit`, `pnpm check:pages`, `pnpm lint:lines:shell`) are in `references/checking.md`.

## 10. Isometric drawings

GT draws every three-dimensional figure in one isometric family: one 30 degree projection (`iso.ts`, which every React figure imports), light from the upper left with fixed face tones (4, 9 and 15 percent), the extrusion recipe (opaque hull, face fills, hairlines), `IsoPrism` and `plane()`, one corner radius, plate thickness and air, depth by per-plate stroke alpha, one accent object per drawing, brand marks seated as alpha masks, the `DitheredMark` Bayer shimmer, and the build and scan animations. The Locadex isometric is the reference standard: it was the one element of the first v0 build that Kevin approved (2026-08-04).

`references/isometric.md` holds the family in full, with its section numbers kept (1 the projection, 2 light and tone, 3 the extrusion recipe, 4 proportions, depth and the accent, 5 seating marks, 6 the shimmer, 7 animating iso, 8 the reference drawings to copy) and its own review checklist; `references/isometric-recipes.md` holds the copyable code. Read both before drawing, animating or reviewing any isometric figure, follow the order of work at the top of `references/isometric.md` (mount an existing drawing first; plates in world units with one accent; the extrusion recipe in the opaque material in both themes; artifacts and marks laid in their faces with `plane()`; motion last, paused until on screen, with a designed still), and run its checklist as well as the one below.

## Review checklist

- [ ] The diagram shows a relationship the text does not; a list stayed a list.
- [ ] An existing component was mounted where the content matched; any new drawing holds new content and sits in a framed cell.
- [ ] Every object is the real artifact (files, strings, URLs, measured widths); nothing is invented or drawn as a stand-in.
- [ ] Strokes are 1 or 1.5 in the three roles, `non-scaling-stroke` where the SVG scales, square caps, no rounded joins.
- [ ] Fills and strokes come from tokens or `currentColor`; no raw hex in a page component, including SVG attributes the lint does not read.
- [ ] No arrowheads; markers are 11px ink squares or short ticks.
- [ ] Links between objects are doubled lines at the thread tokens with a core that matches the ground; flows, axes and scales are single 1px lines.
- [ ] Layer order is threads, pulses, cores; every merge reads as one pair.
- [ ] The pulse is the accent only where it is the drawing's one accent element, and ink otherwise; it moves as geometry, starts hidden, and never runs under reduced motion.
- [ ] Each line has one owner; crossings carry a border cross; leaders bury their ends under the hull.
- [ ] A stretched SVG holds straight taps and no text.
- [ ] No dash relies on `pathLength` under `non-scaling-stroke`.
- [ ] Labels are horizontal, 12px clear of lines, Inter, at or above the surface's floor after scale.
- [ ] The accent follows the surface's rule and sits on one element.
- [ ] Marks are seated as alpha masks; no flat logo, no gif.
- [ ] Geometry is identical in both themes; `figure-check.mjs` passes and its 2x junction crops were read in light and dark.
- [ ] The surface's own gate passed (shoot-slide, graphics audit, page check).

Related skills: create-graphics (choosing a route for a figure outside these surfaces), design-engineering-polish (the final visual pass), hyperframes-animation and hyperframes-keyframes (diagrams that move in a film), animated-component-libraries (before hand-building a chart or interaction). In this set: gt-verify (captures and live checks), gt-dither (Bayer grounds behind a figure), gt-deck (slide layout), gt-graphics (blog graphics), gt-motion (lines in motion and the full dash traps) and gt-films (diagrams in a film), gt-lints (the line law and its auditor), gt-voice (label and caption copy). The wiki's diagram-to-html is not used for GT work: its Nacelle type, 700 weights and uppercase labels conflict with the brand's type rules (Inter at 400 and 500, sentence case).

## Sources

Dated provenance for every rule is in `references/sources.md`, the isometric family's included: DESIGN.md and BRAND.md, the components and the kit, the deck slides, the gt-cloud ports, and Kevin's dated directives.
