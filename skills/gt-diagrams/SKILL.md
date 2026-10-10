---
name: gt-diagrams
description: >-
  How General Translation diagrams are drawn: when a diagram earns its place,
  the existing diagram components to mount first, inline SVG with ink, mid and
  hairline strokes, label sizes per surface, the doubled-line connector and its
  pulse, crossings and straight taps, theme-safe fills, and the check at 2x
  crops. Use when drawing a flow, an architecture, a stack, a before and after
  or a timeline for a page, a slide, a post graphic or a film, or when
  reviewing a figure's junctions and labels.
metadata:
  title: Drawing diagrams
  areas: diagrams
  updated: 2026-10-06
  origin: prototemplate
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

| content | mount | file under `src/app/d/toolchain/diagrams/` |
| --- | --- | --- |
| source file to translated locale files | TranslationFlow | `TranslationFlow.tsx` |
| locale prefixes, localized paths, detection order | LocaleRouting | `LocaleRouting.tsx` |
| text expansion and layout width | SentenceWidth, ExpansionBars | `lang/` |
| one string, two meanings, context decides | ContextResolve | `lang/ContextResolve.tsx` |
| plural rules | PluralForms | `lang/PluralForms.tsx` |
| right to left layout | RtlMirror | `lang/RtlMirror.tsx` |
| writing systems, one term in every locale | ScriptSampler, WordMorph | `lang/` |
| glossary, live translation, previews, detection hook | GlossarySurface and the other surfaces | `surface/` |
| delivery from the edge | EdgeGlobe | `EdgeGlobe.tsx` |
| the full stack | TcStackIso | `tc-stack-iso.tsx` |
| context inheritance | TcCtxLayers (unmounted) | `tc-ctx-layers.tsx` |
| the SDKs | SdkLedger; SdkStack (unmounted) | `SdkLedger.tsx`, `SdkStack.tsx` |
| a number, a benchmark | StatRow; BenchmarkBars (unmounted) | `StatRow.tsx`, `BenchmarkBars.tsx` |
| a locale's name anywhere | LocaleTag | `../components/LocaleTag.tsx` |
| any connector | DoubledLine | `src/components/shared/diagrams/DoubledLine.tsx` |
| isometric objects | IsoFrame, IsoSolid, `iso.ts` | see gt-isometric |

No route in Prototemplate mounts the rows marked unmounted, nor TcStackTrace or the TcMini set. Read them as reference drawings and check them against sections 3 to 6 before mounting one: TcCtxLayers draws its thread as two separate paths and ends it in a 14 by 11 arrowhead, which breaks both rules. Five directions keep forked copies of the `lang/` or `surface/` set under `src/app/d/<direction>/diagrams/`; change the toolchain original.

The components also run live on `/docs`, in the deck and in gt-cloud.

- **The build log on `/docs`** (the readme's last sections; `/craft` redirects there). The libraries section mounts the DoubledLine plate (`src/app/craft/ThreadsDemo.tsx`), the iso plate and EdgeGlobe. `RailFigure.tsx` and `CornerFigure.tsx` draw the ownership law and the border crosses. `docs/LIBRARIES.md` indexes every instrument.
- **The deck.** The slide files `30-lines.html` (line rules), `31-doubled-line.html`, `33-diagrams.html` (the diagram grammar and four examples), `35-iso.html` and `76-line-law.html` (the line law in chrome) in `deck/slides/`. They are slides 30, 31, 33, 35 and 74: a file's number prefix is its sort key, and past slide 35 it no longer equals the slide's position. Start a new slide diagram from their markup.
- **gt-cloud.** The landing app carries ports (StackTower, Locadex, ContextResolve, EdgeGlobe, SentenceWidth, PricingStackDiagram, EnterpriseContextFork) with the same thread tokens in `apps/landing/src/components/landing/shell/engine.css`. gt-cloud's `.agents/skills/gt-landing` is their code map.

`references/components.md` lists every component with what it shows and where its accent goes.

## 3. Strokes and fills

The deck's grammar (`deck/DECK-GRAMMAR.md`, Diagrams; slide 33) states the rules for every surface:

- **Three stroke roles.** On the deck: `class="ink"` (ink), `class="mid"` (`--ink-2`, the body text tone) and `class="hair"` (`--hair`). On a page the root's semantic layer gives the same three, for example `--tc-ink`, `--tc-ink-2` and `--tc-hair` on the toolchain root.
- **Weights.** `stroke-width` 1 or 1.5. Square caps, no rounded joins. A 1px line at a 1:1 scale sits on a half-pixel coordinate (`y1="70.5"`) so it fills one row of device pixels.
- **Fills from tokens.** `var(--ink)`, `var(--paper)` and `var(--plate)` on the deck; the root's tokens on a page; `currentColor` with `fill-opacity` steps for faces. In a live component under `src/app`, `src/components` or `src/lib`, gt-ui's `no-hex-colors` rule (`pnpm lint:code`) fails a hex in a `style` prop or a Tailwind utility, but a hex written as an SVG attribute (`stroke='#2f5ce0'`) passes it, so review catches that case. Any raw color in `src/components/shell` or `src/components/viewer` fails `pnpm lint:shell`. The directions under `src/app/d` are outside both lints, and that includes the toolchain diagrams. Their dark code panels use literal whites because the panel stays dark in both themes.
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
| deck | No accent on text, lines or fills. The four semantic hues appear on icons only. | DECK-GRAMMAR.md, Color |
| film | One accent per film, spent as an edge: one pulse on a thread, one active row, one lit word. The round directions at the top of the brief override this: since round 4 a film's palette is its gem smoke material (the fuma-nama pulse is fire). | `motion/MOTION.md`, Color and Round 4 |
| blog graphic | Red for what was removed, blue for the page and what replaced it. | `docs/GRAPHICS.md` |

When a page's accent budget is spent, emphasis is ink weight or an ink underline, as on LocaleRouting's localized pathname.

## 4. Labels

- Labels are horizontal and sit at least 12px clear of any line.
- Labels are Inter at 400 or 500; the graphics toolchain's 600 label chips are the one documented exception. Mono is for real code, file paths, commands and locale codes. BRAND.md keeps small mono labels in technical diagrams as an instrument and avoids them where possible; the deck uses no mono outside its `.panel`. The shared DiagramFrame set's 9.5px mono text predates this rule.
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

Dashes and draw-ons carry their own traps (DESIGN.md section 9; gt-motion section 7 and its `references/traps.md` hold the full list). The ones that decide how a diagram is built:

- Chromium measures dash patterns in screen pixels under `non-scaling-stroke` and ignores `pathLength` there. A progress arc drops both and writes the dash in user units: `stroke-dasharray: calc(var(--dial) * <perimeter/100>px) <perimeter>px`.
- A single traveling dash (dasharray equal to the path length, animated offset) tiles into several dashes on a scaled SVG under `non-scaling-stroke`. Move a pulse as geometry, or translate a short `<line>` in user units. The Locadex connector pulses keep a `pathLength` dash and drop `non-scaling-stroke` from the pulse paths, which holds because that SVG scales uniformly (`src/app/d/production/sections/Locadex.tsx`).
- Dashes clip at the end of a closed subpath and never wrap the loop. Start the path where the arc starts, or use a period equal to the perimeter (`dasharray d (L - d)`).
- A draw-on parked at a positive offset reveals from the path's first point, and one parked at a negative offset reveals from its last point. StackTower's taps start at the plate and park at -101, so they draw out of the rail; the extra unit keeps a dash edge off the path's end, where Chromium's rounding left a 2px accent fleck at exactly -100 (the comment above the `story` timeline in `src/app/d/_v0/sections/FullStack.tsx`). The `svg-dash-gotchas` note states the reverse; the code and a headless Chromium check (offset 50 inks the first half of a 100-unit path, -50 the last half) agree with this rule. When a draw-on runs backwards, read the first point of `d` before touching the timing.
- Cache the source `d` (`el.dataset.traceD`) before an animation rewrites it, and guard an empty path: `getPointAtLength` throws on one (Kevin, 2026-07-30).

## 8. Themes

- **Tokens and currentColor.** Every color resolves from a token or `currentColor`, so dark mode is a token remap and the drawing needs no second version (DESIGN.md section 1). IsoFrame and the toolchain family take no color props; a page themes the whole family from one ancestor.
- **The same geometry in both themes.** A dark version that lands a pixel away from the light one is a layout shift (Kevin, 2026-09-18). `figure-check.mjs` fails a figure whose box or label count differs between themes.
- **Cores follow the theme.** Pass `core` a token that remaps with the ground; a literal paper core shows as a white stripe in the dark theme.
- **Marks as alpha masks.** A brand mark is never laid over a drawing as a flat logo. Seat it through a `<mask style={{ maskType: 'alpha' }}>` holding the mark's image (`public/brand/no-bg-gt-logo-light.png`; `gt-logo-light.svg` may carry a background), with a `currentColor` or token-filled rect drawn through the mask, so the mark takes the surface's ink in both themes. gt-isometric section 5 has the construction, the asset for each size and the seat inside a `plane()` face. The Locadex diagram carries the Locadex mark and is never a gif (Kevin, 2026-08-04), and gt-ui's `no-gif-mark` rule fails a gif used as a mark. The deck pastes marks as currentColor markup from `public/marks` and never redraws them.
- **Engines re-resolve ink** on a `data-theme` flip (DESIGN.md section 11).
- **Dark twins.** A screenshot in the deck carries a `data-dark` twin where one exists in `deck/shots/`, and otherwise keeps a 1px `--hair` border. Blog covers ship in a dark and a light version at the same framing.
- **Skins repaint tokens.** A light skin can repaint a dark panel token (gt-cloud's sgdh light skin paints `--tc-panel` white), so check every dark plate in the light theme.

## 9. Checking

`scripts/lint/lines.mjs` reconstructs lines from computed CSS and returns early for any element inside an `svg` or a `canvas`. A figure's strokes, junctions and crossings are therefore checked by eye at 2x crops of the junctions in both themes (DESIGN.md section 2).

`scripts/figure-check.mjs` in this skill does the capture and the checks a script can make. It needs `playwright-core` (a Prototemplate dependency) and a Chromium (the Playwright build, or installed Chrome through `--chrome` or `CHROME_PATH`), and runs from the Prototemplate root. A copy of the skill outside a Prototemplate checkout needs `playwright-core` installed where it runs, and `deck-page.mjs` then takes `--deck <path to deck/>`. Crops are `x,y,w,h` in CSS px from the figure's top left corner:

```bash
# the DoubledLine plate on /docs, with a 2x crop of the merge where the two forks join the trunk
node skills/gt-diagrams/scripts/figure-check.mjs http://localhost:3005/docs \
  --selector .ptc-threads --crop 350,105,90,70 --out /tmp/gt-fig

# the same figure on a phone
node skills/gt-diagrams/scripts/figure-check.mjs http://localhost:3005/docs \
  --selector .ptc-threads --width 390 --height 844 --out /tmp/gt-fig-390

# a deck slide: assemble the deck with its fonts, then open slide 30 in present mode,
# where CSS px are sheet px, with a crop of the first border cross
node skills/gt-diagrams/scripts/deck-page.mjs /tmp/gt-deck.html
node skills/gt-diagrams/scripts/figure-check.mjs "file:///tmp/gt-deck.html#30" \
  --selector '#stage .slide.is-on svg.dia' --width 1600 --height 900 --press p --min 18 \
  --crop 430,40,40,40 --out /tmp/gt-fig-deck
```

It writes the figure and each crop at 2x for light and dark, prints each SVG's viewBox and rendered scale, and fails on a label under `--min`, a label that is rotated, skewed or stretched, a stroke in a stretched viewBox without `non-scaling-stroke`, a dash that relies on `pathLength` under `non-scaling-stroke`, and geometry that differs between themes. It warns on curves in a stretched viewBox. It cannot judge a junction; read the crops.

Read each crop at full size and check:

- each merge and fork: one clean pair, no third stroke, no stripe where the core misses the ground;
- each crossing: a border cross on the intersection, or no crossing;
- each leader meeting a hull: no gap and no anti-aliased seam;
- each label: 12px clear of every line;
- the still: reduced motion shows the complete composition with the accent where it belongs.

The surface's own gates run too: `node deck/shoot-slide.mjs <n>` for a slide (both themes, with an overflow report; it loads `playwright-core` from a gt-cloud worktree path and a Chromium path on Kevin's machine, so on another machine use `deck-page.mjs` with `figure-check.mjs`), `pnpm graphics:audit` for a blog graphic, `pnpm check:pages` for the route, and `pnpm lint:lines:shell` for the chrome around the figure.

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

Related skills: create-graphics (choosing a route for a figure outside these surfaces), agent-browser (captures and live checks), design-engineering-polish (the final visual pass), hyperframes-animation and hyperframes-keyframes (diagrams that move in a film), animated-component-libraries (before hand-building a chart or interaction). In this set: gt-isometric (isometric objects and seated marks), gt-dither (Bayer grounds behind a figure), gt-deck (slide layout), gt-graphics (blog graphics), gt-motion (lines in motion and the full dash traps) and gt-films (diagrams in a film), gt-lints (the line law and its auditor), gt-voice (label and caption copy). The wiki's diagram-to-html is not used for GT work: its Nacelle type, 700 weights and uppercase labels conflict with the brand's type rules (Inter at 400 and 500, sentence case).

## Sources

- Prototemplate: `DESIGN.md` sections 1 (the four-color system), 2 (the line law, crossings, the auditor's blind spot for SVG), 3 (the rails), 5 (the doubled line), 6 (the isometric family), 8 (the moving type law), 9 (motion discipline, the dash gotchas), 11 (engine lifecycle).
- Prototemplate: `deck/DECK-GRAMMAR.md` (Type, Color, Diagrams, Dark mode, What a defect is); `deck/slides/30-lines.html`, `31-doubled-line.html`, `33-diagrams.html`, `35-iso.html`, `76-line-law.html`; `deck/parts/head.html` (`svg.dia` rules, `--cross`); `deck/shoot-slide.mjs`.
- Prototemplate: `src/components/shared/diagrams/DoubledLine.tsx`, `DiagramFrame.tsx`, `diagrams.css`, `src/components/shared/FeatureBento.tsx`.
- Prototemplate: commit 04d8410 (2026-07-31, the TranslationFlow pulse moves from the accent to the page ink); `.oxlintrc.json` and `scripts/lint/oxlint-plugins/gt-ui.ts` (`no-hex-colors`, `no-gif-mark`); `scripts/lint/shell.mjs` (`TARGETS`).
- Prototemplate: `src/app/d/toolchain/diagrams/TranslationFlow.tsx`, `LocaleRouting.tsx`, `flow.css` (`.tf-pulse` in `--tc-ink`), `lang/lang.css` (`.lang-cr-pulse` in `--lang-accent`), `EdgeGlobe.tsx`, `SdkStack.tsx`, `SdkLedger.tsx`, `StatRow.tsx`, `IsoFrame.tsx`, `IsoSolid.tsx`, `tc-ctx-layers.tsx`, `tc-stack-iso.tsx`, `lang/*.tsx`, `surface/*.tsx`; `src/app/d/toolchain/styles.css` (`--thread-*`, the accent's six places); `src/app/d/_v0/sections/StackTower.tsx` (taps, buried leader ends, founder notes) and `FullStack.tsx` (the taps' -101 park); `src/app/d/production/sections/Locadex.tsx` (seated marks, the pulses without `non-scaling-stroke`) and `Global.tsx` (`GlobeAtmosphere`).
- Prototemplate: `src/app/craft/ThreadsDemo.tsx`, `CraftArticle.tsx`, `libraries.ts`, `craft.css`; `docs/LIBRARIES.md`; `docs/GRAPHICS.md` (Sizing); `graphics/build/gen-lib.js` (`MIN_TEXT`, `line`, `elbow`); `scripts/lint/lines.mjs` (`ALLOW`, the SVG skip); `BRAND.md` sections 6 and 9 (mono as an instrument voice, the avoid list).
- Prototemplate: `motion/MOTION.md` (Round 4 direction, Color, Type, Line), `motion/films/blog-fuma-nama/index.html` (`doubledH`), `motion/films/blog-designing-docs/index.html` (`F.doubled`, the casing); local and untracked, owned by the Videos session.
- gt-cloud: `apps/landing/src/components/landing/shell/engine.css` (`--thread-*`); `.agents/skills/gt-landing/SKILL.md` and `references/design.md` (the landing's diagram files).
- wiki: `skills/engineering/create-graphics/SKILL.md`; `skills/misc/diagram-to-html/SKILL.md`.
- Session notes: svg-dash-gotchas (2026-08-05 and 2026-08-11; its park-direction bullet is inverted, see section 7), k-pages-restart-round (2026-08-11), redesign-v0-verdict (2026-08-04), blog-graphics-pipeline-traps (2026-09-18 to 2026-09-24), explorations-stay-local.
- In this set: gt-isometric section 5 (seating marks), gt-motion section 7 and `references/traps.md` (dash traps).
- Kevin, 2026-07-29 (the doubled line in diagrams); Kevin, 2026-07-30 (the bar is generaltranslation.com and resend.com; the empty-path error); Kevin, 2026-08-04 (mount the existing components; Locadex carries its mark and is never a gif); Kevin, 2026-08-05 and 2026-08-11 (no invented content); Kevin, 2026-08-06 (overlapped lines as the named antipattern, the hatch spacer, border crosses); Kevin, 2026-08-11 (restart the landing diagrams); Kevin, 2026-08-12 (numbered boxes joined to the GT layer by doubled lines); Kevin, 2026-09-09 (a dedicated diagrams slide in the brand deck); Kevin, 2026-09-18 (dark and light diagrams must line up).
