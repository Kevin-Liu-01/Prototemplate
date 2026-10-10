# Isometric drawings

This file was a skill of its own (Isometric drawings) until 2026-10-10, when it merged into `gt-diagrams`; its sections keep their numbers, so "section 5" of the isometric family is section 5 here. It is the whole isometric family: read it before drawing, animating or reviewing any isometric figure for a GT page, slide, graphic or film.

General Translation (GT) builds the full stack for localization: i18n libraries, context-aware translation APIs, a CDN that serves translations, and Locadex, an AI agent that internationalizes a code repository and opens a pull request with the changes (BRAND.md section 9). Kevin is Kevin Liu at GT; his verdicts on the drawings are quoted below with their dates. GT draws every three-dimensional figure in one isometric family: one 30 degree projection, one light direction, one corner radius and one plate material, so drawings on the landing, in the deck and in the films read as one set. The geometry lives in one kit, `iso.ts`, which every React figure imports; the films repeat the same map in their own HTML. The Locadex isometric is the reference standard: it was the one element of the first v0 build that Kevin approved (2026-08-04).

Paths are relative to a Prototemplate checkout (`$PROTOTEMPLATE`, github.com/Kevin-Liu-01/Prototemplate, Kevin's design hub with the canon in DESIGN.md and BRAND.md) unless they name `$GT_CLOUD` (a checkout of github.com/generaltranslation/gt-cloud at origin/main, the monorepo whose `apps/landing` serves generaltranslation.com). Copyable code for every recipe below is in `isometric-recipes.md` beside this file.

Order of work for a new drawing:

1. If an existing drawing already shows the idea, mount it (section 8). New artwork is for new content only.
2. Lay out the plates in world units with the family's proportions (section 4) and one accent object.
3. Paint each solid with the extrusion recipe in the opaque material, in both themes (sections 2 and 3, recipes 1 to 3).
4. Lay every artifact and mark in its face with `plane()` (sections 4 and 5).
5. Add motion last, paused until on screen, with a designed still (sections 6 and 7).
6. Run the review checklist at the end of this file.

## 1. The projection

The map, with the camera at (+, +, +):

```
project(x, y, z) = [(x - y) * cos30, (x + y) * sin30 - z]
```

- On screen, +x runs down and to the right, +y runs down and to the left, and +z runs straight up.
- The three visible faces of any box are the top, the +y face (front left) and the +x face (front right).
- Units are viewBox units. `ISO_COS30 = 0.8660254037844387`, `ISO_SIN30 = 0.5`, `ISO_RADIUS = 2.4`.
- A translation along world y moves a point by the constant screen vector (-cos30, +sin30) per unit, so a sweep along y is one x and y tween.
- The kit exists twice: `src/app/d/toolchain/diagrams/iso.ts` in Prototemplate and `$GT_CLOUD/apps/landing/src/components/landing/shared/iso.ts`. They match function for function (the gt-cloud copy is reformatted by its formatter). Change both together.

| export | returns |
| --- | --- |
| `project(x, y, z)` | the screen point `Pt` |
| `depth(x, y, z)` | `x + y + z`; positive is the near half of an object. The kit's comment names the edge globe as its user, but no drawing in either repository imports it today |
| `isoCircle(r, z)` | `{ rx, ry, cy }` for an SVG ellipse: a ground-plane circle of radius r at height z |
| `xy`, `polyline`, `segment` | path strings, coordinates rounded to 0.01 |
| `IsoBox` | `{ x, y, z, w, d, h }`, occupying x to x+w, y to y+d, z to z+h |
| `topFace`, `leftFace`, `rightFace` | the four projected corners of the top, the +y face and the +x face |
| `silhouette(box)` | the hexagonal outer edge |
| `frontEdge(box)` | the one interior vertical edge that the silhouette and the top contour do not draw |
| `roundedPolygon(points, r)` | a closed path rounded in screen space at `ISO_RADIUS`; the radius is clamped to half of each adjoining edge so a thin slab keeps its side faces |
| `plane(z, ox, oy)` | `matrix(cos30 sin30 -cos30 sin30 sx sy)`: places flat art drawn in plan coordinates into the z plane, anchored at plan (ox, oy) |
| `markPath(x, y, w, d, z, r)` | a flat rounded rectangle lying in a z plane: content bars, chip seats, sign bars |
| `IsoPrism` | `{ points, z, h }`: a convex plan polygon extruded from z to z+h, points wound like the box corners |
| `prismTop`, `prismFaces`, `prismSilhouette`, `prismFrontEdges` | the prism's top ring, its visible side faces with their shade, its outer edge and its interior verticals |

A prism side face is visible when the outward normal of plan edge a to b, (by - ay, ax - bx), has a positive x + y sum. It shades `right` when the normal leans toward +x and `left` when it leans toward +y.

The components in `IsoSolid.tsx` build on the kit: `IsoSlab` (a box with three faces, silhouette, top contour and front edge; `tone` is ink, soft, hair, accent or none; `faces={false}` leaves a wireframe), `IsoPlane` (a flat card), `IsoWire` (a polyline through world points) and `IsoArrow` (a flat arrowhead pointing along +x). `IsoFrame.tsx` wraps them in the shared 240 by 180 viewBox (`ISO_VIEW_W`, `ISO_VIEW_H`), which fixes the relative scale of the family. Its `strokeWidth` (default 1.2) sets `--iso-sw`, `accent` switches the accent on or off, and `title` gives the drawing `role='img'`; without a title the drawing is `aria-hidden`.

The same map can be reached from a flat drawing: rotate it 45 degrees, scale y by tan 30 (0.577) and scale the whole by the square root of 1.5. At full strength that matrix equals `project()` at z = 0, and the designing-docs film interpolates all three with one tilt dial (section 7). A hand-written `scale(1 0.5) rotate(45)` is the 2:1 dimetric squash. Its y to x ratio is 0.5 where the 30 degree face needs 0.577, so a mark placed that way lies flatter than the face under it. The deck's iso slide (`deck/slides/35-iso.html`) places its GT mark that way. Use `plane()`.

## 2. Light and tone

Light comes from the upper left, always. Exactly three faces show. The top carries the least ink, the +y face (left) more and the +x face (right) the most. Nothing in the family lights a solid from another side, and accent faces keep the same order.

| material | where | top | left (+y) | right (+x) |
| --- | --- | --- | --- | --- |
| line family, translucent | `iso.css` `.iso-face-*`, `IsoSlab` | currentColor 4% | 9% | 15% |
| line family on ink | the kit plate (`craft.css`), over an ink hull | white 4% | 9% | 15% |
| line family, accent faces | `iso.css` | accent 11% | 18% | 27% |
| opaque plate, dark | the tower and the Locadex iso | `#151515` | `#0d0d0d` | `#090909`, hull `#090909` |
| opaque plate, dark, hot or lifted | the same | `#1b1b1b` | `#131313` | `#0e0e0e` |
| opaque plate, light | the tower (`fullstack.css`) | `#f7f6f4` | `#edebe8` | `#e3e1dd`, hull `#e3e1dd` |
| opaque plate, light | the Locadex iso: `#070707` mixed into `--tc-panel` | 5% | 9% | 14%, hull 14% |
| opaque plate, paper | the pricing platform: ink mixed into paper | 6% | 16% | 28% |

Other tones in `iso.css`: content marks on a face 26%, the soft stroke 55%, the hair stroke 30% at 0.82 of the stroke width, and the accent stroke at 1.15 of it. The accent comes from `--iso-accent`. Set it from the page accent (`#2f5ce0` on paper, `#86a8ff` on the dark band). The `#3f6dfa` fallback in `iso.css` is a different blue.

The percentages are amounts of ink. On paper they make the top the lightest face. With light ink on a dark ground the same amounts make the top the darkest face and the right face the brightest: the kit plate fills white at 0.04, 0.09 and 0.15 over ink (`src/app/craft/craft.css`), and the docs film fills its side faces with Bayer tones of 0.3 (left) and 0.56 (right) over navy. The opaque dark material of the tower and the Locadex iso sets luminance by value and keeps the top lightest in both themes. When you extend a drawing, use its material, and check the face order in both themes.

On paper the dark plates convert. The Locadex plate reads `--tc-panel`, its white hairlines become `#070707` at the same alphas, and the accent becomes the page's `--tc-accent` (`#2f5ce0`), because `#86a8ff` loses its contrast on white. The light block in `locadex.css` records the direction behind it: on light, no black boxes.

Build new plates from the opaque material. The frosted glass plates (`tc-stack-iso.tsx`, `GovernedColumn.tsx`, `toolchain/locadex/LocadexIso.tsx`: a near-opaque hull under a diagonal white sheen gradient) came first. BRAND.md section 9 lists glassmorphism under Avoid, and the tower and the Locadex iso use opaque plates with no sheen.

## 3. The extrusion recipe

Each solid paints in this order, and each line is drawn once:

1. The hull: `roundedPolygon(silhouette(box))` with an opaque fill. It hides whatever sits behind it and below it.
2. The face fills: `leftFace`, `rightFace` and `topFace`, each through `roundedPolygon`.
3. The hairlines, 1px with `vector-effect: non-scaling-stroke`: the rim (the hull path stroked), the front edge (`segment` over `frontEdge(box)`) and the top contour (the top face path stroked).

For a prism, the hull is `prismSilhouette`, the faces come from `prismFaces` with their shade, and the interior verticals come from `prismFrontEdges` (`src/app/craft/IsoDemo.tsx`).

- Paint back to front and bottom to top. The Locadex module grid paints its back row first so the small extrusions overlap cleanly.
- A chip (a small extrusion sitting on a face) draws its hull with its own 0.6 hairline and a lighter top face, with no separate side fills (`GlyphChip` in `StackTower.tsx`, `Chip` in `Locadex.tsx`).
- Thin diff slats take radius 1.2; at the family radius they read as capsules.
- A leader that meets a plate is drawn before the hull in the same SVG and runs 2 units past the vertex, so the hull covers its end and the joint has no gap. It lands on the left vertex at mid-edge height (z = THICK / 2), because the rounding removes the corner itself (`TAP_Y` in `StackTower.tsx`).
- When a plate must change its stacking with state, give each plate its own absolutely positioned HTML element (the tower's `.v0s-slab`) and set its CSS z-index from the timeline. Inside one SVG the paint order is fixed by the document.
- `pnpm lint:lines` reads lines from computed CSS and cannot see SVG strokes. Check every junction of a figure by eye at 2x pixel crops (DESIGN.md section 2).

## 4. Proportions, depth and the accent

One corner radius serves the family: `ISO_RADIUS = 2.4`. The overrides in shipped code are on small parts only: diff slats 1.2 (1 on the pricing platform), sign bars 0.4 and `IsoArrow` 1.2. The deck's iso slide (`deck/slides/35-iso.html`) says the family uses square corners and draws its plate with sharp polygons, and BRAND.md section 9 lists "no rounded corners" in its direction line, while every shipped drawing rounds at 2.4. Follow the code and DESIGN.md section 6 until Kevin settles the difference.

A plate is about 4 percent of its footprint thick, with about 40 percent of the footprint as air between stacked plates.

| drawing | footprint | thickness | air between plates |
| --- | --- | --- | --- |
| stack tower | 104 | 4.2 (4.0%) | 42 (40%) |
| toolchain stack | 84 | 3.2 | 34 |
| governed column | 86, base plate 110 | 3.2 | 34 |
| toolchain Locadex run | 84 | 3.2 | 38 |
| pricing platform | 104 | 4.2 | 38 |
| Locadex iso | repository 76, output 64, agent slab 44 hovering at z 54 | 3, 3 and 7 | |
| kit plate | 104, chips 26 and 34 | 4.2, chips 4 to 7 | |

Depth comes from per-plate stroke alpha. Group opacity carries no depth in this family. With d = i / (n - 1), 0 at the bottom plate and 1 at the top:

- the tower: rim alpha 0.12 + 0.08 d, top edge alpha 0.24 + 0.24 d, front edge 0.08. On paper the strokes turn to ink at those alphas plus 0.16 (rim) and 0.10 (edge), with the front edge at 0.14.
- the glass family: rim 0.14 + 0.1 d, top edge 0.32 + 0.3 d.
- the Locadex iso, set by role: repository 0.13 and 0.28, output plate 0.16 and 0.36, agent slab 0.20 and 0.48 (the agent, the drawing's subject, is the brightest).

Pass the alphas as inline custom properties (`--v0s-rim-a`, `--v0s-edge-a`, `--ldx-rim-a`, `--ldx-edge-a`) and keep the paint in CSS. The pricing board's `is-dim` (opacity 0.32) is a selection state and carries no depth.

Each drawing has one accent object: the merged pull request chip (Locadex iso), the payload chip on the translations plate (tower), the delivered-string chip on the runtime plate (toolchain stack), the live v214 chip (governed column) and the +38 bar (toolchain Locadex run). The shipped drawings also use the accent hue for light and motion: the scan beam, the wire pulses, the rail fill and the hot plate's top edge. The Locadex iso once warmed its mark to the accent as the beam passed under it; Kevin read it as flashing, so the mark now holds its resting ink.

Artwork on faces:

- Everything on a face lies in the face's plane through `plane()`: glyph strokes, icons, wires and marks. Kevin asked that the tags sit on the layers and never turn toward the viewer (quoted in `StackTower.tsx`).
- Strokes inside a `plane()` group keep `vectorEffect='non-scaling-stroke'` so they stay 1px.
- Short glyphs read at chip scale (`<T>`, `en` and `ja` at 6.5px mono on the pricing platform). Words do not. The enterprise round of 2026-08-11 named its context keys in the stage label instead.
- Put each face's artifact in the front band that the plate above leaves visible, and push slabs to the base's edges so a mark on the base stays visible (pricing round, 2026-08-11).
- Labels beside a drawing are sans at 9 to 10 user units, filled at about 0.6 alpha, with leaders at 0.14. Mono appears only on numbers (`+38 −6` in the Locadex chip reading). The `.iso-label` class in `iso.css` is a 9px mono default from the earlier family, used only by the unmounted `SdkStack.tsx`; set labels in sans. At the 720px cut, size labels by their effective size: the Locadex frame renders at about 0.89x at 390px wide, so 9 becomes 10.5. The tower carries no type, and the copy beside it names the plates (Kevin: no words by the diagram).

## 5. Seating marks

Brand marks render as alpha masks so the shape takes the surface's ink (BRAND.md section 4). A logo image laid over a face in screen space is the defect this rule prevents; the sign-in round of 2026-08-11 replaced one with a mask in the face.

The static seat, as on the Locadex slab:

1. A `<mask maskUnits='userSpaceOnUse' style={{ maskType: 'alpha' }}>` holding an `<image>` of the asset. Mask coordinates resolve in the user space of the element that uses the mask, so write them in the same plan coordinates as the rect.
2. A `<rect>` filled from a CSS class (a token or the plate's ink step) with `mask='url(#id)'`, inside `<g transform={plane(z, ox, oy)}>`.
3. The theme changes the fill. The asset's own color never shows.

The shimmer seat moves `plane()` inside the mask and keeps the rects in screen space (section 6).

Assets in `public/brand/` (Prototemplate and the gt-cloud landing carry the same files):

- `locadex-mark.svg` for large seats. Its viewBox is 500 square and the drawn glyph spans 199 by 222 of it, so size the image box from the glyph: `markHalf = glyphWidth * (500 / 199) / 2`. The tower seats a 28-unit glyph in a 70-unit image box. The Locadex slab's image box is 32 units, so its glyph is about 13 units wide.
- `no-bg-locadex-logo-light.png` for small seats (a 16-unit image box on the pricing platform). The SVG's ring geometry breaks at small sizes.
- `no-bg-gt-logo-light.png` for the GT mark. The mask reads alpha only, so the light or dark variant makes no difference. `gt-logo-light.svg` may carry a ground; keep it out of masks.
- Third-party marks: render the icon component white inside the mask (the GitHub mark on the repository's front-left module is `SiGithub` at a half size of 4.6).

Placement:

- The Locadex mark goes on the Locadex slab (Kevin, 2026-08-04: the animation "should have the locadex logo on it"). On the tower's top plate it sits on a raised 36-unit square chip at the face's top left, with a 28-unit glyph and 12 plan units of face between the chip and the left edge.
- One glyph per chip. The GitHub module carries the mark and skips its content bar.
- One exception ships today: the tower's dashboard chip places `no-bg-gt-logo-light-96.png` and `no-bg-gt-logo-dark-96.png` in `plane()` as two images that CSS toggles by theme (`.v0s-dash-mark.is-light` and `.is-dark`). New work uses the mask.

## 6. The shimmer

`DitheredMark` (`src/app/d/toolchain/diagrams/DitheredMark.tsx`, mirrored in `$GT_CLOUD/apps/landing/src/components/landing/shared/DitheredMark.tsx`) renders a mark as masked ink with a Bayer-dithered highlight band sweeping through it. It is the one animated effect a mark may carry: no GIF and no filter glow (BRAND.md section 4).

- The band is five nested clip windows, from the center outward, each over a static rect filled with one coverage tier of the 4 by 4 Bayer matrix (`BAYER4`, the glyph field's matrix). `SHINE_TIERS` gives coverage and width: 16 and 7, 10 and 12, 6 and 18, 3 and 26, 1 and 36. Each window contains the previous one and ordered dither nests by construction, so the overlap composes the ramp exactly. The glint fill is opaque, so a cell covered twice never brightens.
- The cells stay still and the windows move. The windows are pre-rotated 60 degree paths moved by a pure horizontal translate. A `rotate()` window failed: GSAP's SVG origin compensation shifted the whole sweep about 180 units off the mark.
- Two bands share each tier's clip path: the primary and a counter-sheen at 0.62 of its width, parked at the sweep's start. The driver runs the counter-sheen half a lap behind.
- `plane()` sits inside the mask, so the masked rects and the dither cells live in screen space and stay square. `shapeRendering='crispEdges'` keeps the cells 1-bit at any zoom. The cell is 1.05 units by default, about 1.9px at the tower's resting width (Kevin asked for smaller dots), and a pattern tile is four cells.

Props: `id` (a unique prefix, since SVG ids are document-global), `href` or `maskContent`, `plane`, `markHalf`, `cover` (the screen-space rect the ink and the shimmer span: project the glyph's plan corners and pad them by a few units), `maskBox` (default -120, -80, 240, 160; it must contain the cover), `cell`, `tiers`, `inkClassName`, `glintClassName`, `shineClassName` and `stripeData` (the two attributes the driver queries, default `data-ldx-stripe` and `data-ldx-stripe2`).

The driver: `shineTravel(cover)` returns two x positions, `from` and `to`, where the widest window sits just clear of the cover before it enters and just clear after it leaves, with 4 units of margin, measured along the band's normal (a window at 60 degrees moves only cos 60 along its normal per unit of x). Tween both stripe sets from `from` to `to` with `ease: 'none'`, `repeat: -1`, created paused, at about 56 units per second, and start the counter-sheen with `.time(lap / 2)`. Every pass enters clear of the mark, crosses all of it and leaves past its right edge (Kevin, tower round 10: "make it cross the whole locadex all the way to the right"). Without JS or under reduced motion the markup is the still: the primary band mid-glyph and the counter-sheen clear of it.

The tower's tones: resting ink white at 0.3, the shimmer group at 0.5 opacity and the glint `#e9edf2`. On the hot plate the ink takes the accent, the shimmer goes to full opacity and the glint mixes 70% white with the accent.

## 7. Animating iso

The motion rules of DESIGN.md section 9 apply. Every loop is created paused. A ScrollTrigger or an IntersectionObserver plays it only while its section is on screen, and only while its plate exists. Multi-phase choreography lives on one timeline. `prefers-reduced-motion` skips setup, and the markup pose is the still.

**The tower build** (`src/app/d/_v0/sections/FullStack.tsx`):

- The whole build is one paused story timeline, and scroll maps to story time. One scrubbed dial (`scrub: 0.35`) spans the read, and a piecewise map converts it, anchored on each beat's lock-in. A beat locks in when the center of its copy block reaches the 55% read line, measured on the copy from flow geometry. The copy highlight uses a separate 80% line (DESIGN.md section 14).
- Each gap between lock-ins holds the standing pose until 0.5 of the gap, builds the next plate, and stands locked from 0.82. The last gap (the crest, where the rail runs to the top) uses 0.12 and 0.95.
- Per beat: the previous hot plate settles to y 0 (0.35 s, power2.out). The new plate starts 12 + 64 px above its seat (32 on the mobile stage) at zero alpha, rides above every plate while it falls, and lands at its hot lift of 12 px with full alpha (0.5 s, power2.out). The rail rises its leg (1.0 s power2.out for the first, 0.45 s power2.in after). The leader's bend draws from -101 to 0 as the leg lands. Every z-index change is a `set` inside the timeline, so a rewind restores it.
- Scrolling back plays the same story backwards. The figure is CSS sticky and no JS moves it (Kevin: "the diagram keeps moving down as i scroll past agents, which is wrong").
- Reduced motion, and windows narrow and short enough for the one-column flow, get the static pose: the full stack, the first beat lit and lifted, every leader drawn, the shimmer parked and the beam hidden.

**The tower's top plate** (the agents plate, called the capstone in the code; full size again after Kevin's "make the top layer the same size as the other"):

- the Locadex mark with the shimmer on its raised chip;
- four accent glints on the top contour itself: dashes of the edge path with `pathLength` 1000 and `strokeDasharray='110 140'`, a 7 s lap from offset 180 to -820;
- the scan beam: a translucent trapezoid (accent at 10% fill, 34% edges, 78% landing line) hung from the plate's underside to the translations plate, in its own overlay SVG between those two slabs. `beamAt(t)` re-projects the four corners for t from -1 to 1, because a leaning quad cannot be a translated constant. The aperture (half width 26) sways 16 units in y under the plate while the landing (half width 40) sways 30 across the plate below, 2.5 s, sine.inOut, yoyo. The top edge rises 9 units above the plate's underside, hidden by the hull, so the 12 px lift never opens a gap;
- the diff hunk, scrubbed by scroll: each write wire draws out of the mark's chip before its slat lands, 0.8 timeline seconds apart.

**The Locadex iso** uses the same beam at 3.6 s, sine.inOut, yoyo. Its top edge sways 14 units so it stays under the 22-unit half width of the slab (Kevin: "the scanner is going beyond the locadex square"), while the landing sways 28 and spreads to a half width of 34 over the module chips.

**Plates that separate and settle.** The toolchain stack, the toolchain Locadex run and the governed column raise one plate on hover or focus, ink its leader and caption, and draw its doubled top edge: the top contour inset by a constant world margin (3.4 or 2.4 units), which projects to a constant screen gap.

**Dash rules** for iso motion (gt-motion section 7 holds the full list of dash traps):

- Pass `autoRound: false` on every dash-offset tween. GSAP integer-rounds px CSS properties, which froze a dash for about four frames and then jumped it a whole unit. A dash that loops (the glints, the context waves) also normalizes `pathLength` to 1000 so one unit is sub-pixel; the draw-on taps keep `pathLength` 100.
- Park a draw-on at -101 or 101 with `strokeDasharray='100 200'`. At exactly 100 a dash edge sits on the path's end and Chromium bleeds a sub-pixel fleck.
- The park sign picks the end the draw grows from. A negative offset inks the path's end first, and a positive offset inks its start first (checked in headless Chromium on 2026-10-05: on a 100-unit path, offset -75 inks the last 25 units and +75 the first 25). The tower's taps run plate to rail and park at -101, so they draw out of the rail into the plate; the capstone's write wires run chip to row and park at 101, so they draw out of the chip.
- Under `vector-effect: non-scaling-stroke` Chromium computes dashes in screen space and ignores `pathLength`. A dash that must measure a fraction of a path (the Locadex progress ring) uses user units with neither.

**The designing-docs film bridge** (`motion/films/blog-designing-docs/index.html`, the bridge block; `motion/` is local and owned by the films work, so read it only. A clone without `motion/` can watch the bridge in the committed cut `public/media/designing-docs-film.mp4`, and recipe 9 holds its matrix). Kevin (2026-10-02): "bring back the isometric view that transitions into more in the designing docs film, no need to replace anything". Round 7d shipped it on 2026-10-03:

- One camera move runs from the word "capture" to line 3's first word. The page is line 3's page in its flat frame pixels, carried by one matrix: a 45 degree turn, y scaled by tan 30 and the whole scaled by the square root of 1.5, each multiplied by one tilt dial, so the flat page and the iso view are the same drawing.
- Its layers lift apart as plates: the content column at z 0, the contents rail at 110, the sidebar at 210 and the header at 330 (frame px, plates 34 px thick). They step up toward the back so no plate hides the content column's cards. Dashed drop lines (`2 4`) run from each lifted corner to where it stood.
- The top face is navy. The left and right faces are Bayer tones of 0.3 and 0.56 of the blue on screen-anchored patterns (a 24 px tile of 8 by 8 cells at 3 px), so the cells stay square and only their outline foreshortens.
- Timing is a monotone cubic with zero speed at both ends: rise 1.45 s, hold 0.45 s at the iso view, flatten 1.86 s (the page is at its largest as it lands). The turn finishes by 0.93 of the move, so the end is scale and position only, and the page lands pixel-exact on scene 3's first frame.
- The content ink is the lit thumbnail's `#86a8ff` through the iso view and returns to the page's `#2f5ce0` as the page lies flat.

Review motion in a real browser or a Playwright capture. The in-app browser pane pauses requestAnimationFrame, so loops and shaders stand still there.

## 8. References to copy

| reference | where | what to copy |
| --- | --- | --- |
| Locadex iso | `src/app/d/_v0/sections/Locadex.tsx` and `locadex.css` (route `/d/singularity-dossier`; the production copy is in `src/app/d/production/sections/`); `$GT_CLOUD/apps/landing/src/components/landing/sections/locadex/Locadex.tsx` | the reference standard: the repository plate with a 3 by 3 module grid, the agent slab hovering with the Locadex mark and the leaning scan beam, and the output plate with signed diff slats and the upright merged chip, in both themes |
| stack tower | `src/app/d/_v0/sections/StackTower.tsx`, `FullStack.tsx` and `fullstack.css`; `$GT_CLOUD/apps/landing/src/components/landing/sections/fullstack/` | four opaque plates with one artifact per face, the rail and its leaders, the scroll build, and the top plate's shimmer, glints, beam and diff hunk |
| governed column | `src/app/d/toolchain/enterprise/GovernedColumn.tsx` (route `/d/toolchain/enterprise`; gt-cloud main no longer carries it) | the composition: the organization plates (glossary, style directives, scoped access) sit on top, the review plates under them and a wider delivery base at the bottom, so the stacking order shows that what ships sits under every organization decision; a caption ledger grouped by tier and wired by doubled leaders drawn in an HTML overlay measured off anchors; and a rest state with the review gate lit. Its plates are glass; build them opaque |
| pricing platform | `$GT_CLOUD/apps/landing/src/components/pages/pricing/PricingStackDiagram.tsx` and `pricing-page.css` | four full-footprint plates with station numbers (01 to 04) lying in each top face by its left corner, one artifact per face in the front band, seated `<T>`, `en` and `ja`, the small Locadex mask, and the is-hot and is-dim selection. The file is unmounted since gt-cloud #5007 removed its section on 2026-09-29. Kevin's verdict on the 2026-08-11 pricing round: "nothing redeeming but the isometrics" |
| kit plate | `src/app/craft/IsoDemo.tsx`, shown at `/docs#iso` (`/craft` redirects to `/docs`) | the minimum recipe: one slab, two box chips and one hexagonal prism |
| docs film bridge | `motion/films/blog-designing-docs/index.html`; the cut is `public/media/designing-docs-film.mp4` | flat to iso and back in one matrix; plates that lift apart and settle |

The toolchain stack (`src/app/d/toolchain/diagrams/tc-stack-iso.tsx`, route `/d/toolchain`) and the toolchain Locadex run (`src/app/d/toolchain/locadex/LocadexIso.tsx`, route `/d/toolchain/locadex`) are earlier glass siblings. Copy their glyph vocabulary (code lines, a prompt chevron, diff gutters, points of presence, the check) and leave their material.

## Review checklist

- [ ] Every point goes through `project()` or `plane()`. No hand-written skew, `scale(1 0.5)` or CSS 3D transform.
- [ ] Three faces, lit from the upper left: the top carries the least ink, the +y face more, the +x face the most. The order holds in both themes in the drawing's own material.
- [ ] Each solid paints hull, faces, then rim, front edge and top contour, each line once at 1px with non-scaling stroke.
- [ ] `ISO_RADIUS` everywhere except diff slats, sign bars and arrowheads.
- [ ] Plates near 4% of the footprint thick with near 40% air between them.
- [ ] Depth comes from per-plate stroke alpha. No group opacity is used for depth.
- [ ] One accent object, with `--iso-accent` set from the page accent.
- [ ] Every mark is an alpha mask filled from a token inside `plane()`, from the right asset for its size, and the Locadex mark sits on the Locadex slab.
- [ ] Artwork lies in its face, no words are seated at chip scale, and each artifact sits in the front band the plate above leaves visible.
- [ ] Labels are sans with mono only on numbers, and their effective size is checked at 390px.
- [ ] Plates are opaque with no frost sheen.
- [ ] The shimmer has a unique id, a cover padded around the projected glyph, travel from `shineTravel`, and a counter-sheen half a lap behind.
- [ ] Loops are created paused, play only on screen, and reduced motion gets a designed still.
- [ ] Junctions are checked at 2x crops in both themes at 1440 and 390 wide, and motion is checked in a real browser.
- [ ] The two copies of the kit still match.

## Related skills

GT skills in this set: `gt-diagrams` (this file's skill: the doubled-line connector and flat diagrams), `gt-dither` (the Bayer language and its engines), `gt-motion` (GSAP and scroll rules), `gt-films` (the HyperFrames films), `gt-brand` (marks, color, the accent) and `gt-lints` (the line auditor). General skills in Kevin's wiki that this one depends on: `create-graphics`, `design-engineering-polish`, `hyperframes-animation`, `hyperframes-keyframes` and `gt-verify` (the browser checks).

## Sources

The dated provenance of this file is in `sources.md` beside it ("Isometric drawings").
