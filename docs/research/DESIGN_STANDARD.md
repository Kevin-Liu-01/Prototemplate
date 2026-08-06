# DESIGN STANDARD — diagrams and artistry (the bar every cell is judged against)

Status: derived 2026-07-29 by literal side-by-side comparison of our `toolchain` build against
generaltranslation.com, resend.com, viteplus.dev and oxc.rs. All values below are either measured
from the references (`teardown-measured.md`, `teardown-oxc.md`, `teardown-viteplus.md`) or
measured from the comparison composites. Nothing is estimated.

The composites this standard is anchored to (READ them before building; every rubric anchor
points at one):

- `/private/tmp/claude-501/-Users-kevinliu-gt-gt-cloud/0472faa4-f4b6-46f0-9054-5f30d7a23b3e/scratchpad/shots/diag/standard/c1-code-surface.png` — ours d02 vs resend d02 vs oxc d02
- `/private/tmp/claude-501/-Users-kevinliu-gt-gt-cloud/0472faa4-f4b6-46f0-9054-5f30d7a23b3e/scratchpad/shots/diag/standard/c2-data-diagrams.png` — ours d03 vs oxc d04
- `/private/tmp/claude-501/-Users-kevinliu-gt-gt-cloud/0472faa4-f4b6-46f0-9054-5f30d7a23b3e/scratchpad/shots/diag/standard/c3-three-across.png` — ours d04 vs viteplus d02
- `/private/tmp/claude-501/-Users-kevinliu-gt-gt-cloud/0472faa4-f4b6-46f0-9054-5f30d7a23b3e/scratchpad/shots/diag/standard/c4-fullbleed-material.png` — ours d05 vs oxc d06
- `/private/tmp/claude-501/-Users-kevinliu-gt-gt-cloud/0472faa4-f4b6-46f0-9054-5f30d7a23b3e/scratchpad/shots/diag/standard/c5-globe-vs-objects.png` — ours d06 vs viteplus d04 vs resend d04
- `/private/tmp/claude-501/-Users-kevinliu-gt-gt-cloud/0472faa4-f4b6-46f0-9054-5f30d7a23b3e/scratchpad/shots/diag/standard/c6-vs-current-site.png` — ours d08 vs generaltranslation.com d03
- `/private/tmp/claude-501/-Users-kevinliu-gt-gt-cloud/0472faa4-f4b6-46f0-9054-5f30d7a23b3e/scratchpad/shots/diag/standard/c7-hero-terminal.png` — ours d00 vs viteplus d01 vs resend d02

---

## 0. DIAGNOSIS — why ours read as "not good at all" (confirmed with pixels)

**0.1 No surface mass.** On every reference, the section's artifact sits on a surface with its
own tone — resend's black SDK panel, oxc's `#14121A` diff panel or saturated prismatic field,
viteplus's `#111` terminal on a photographed light plate. On ours, everything between the hero
terminal and the footer is white-on-white: the code window in c1 is a *pale* panel on paper, and
every diagram is hairline marks on paper. Measured: the oxc benchmark zone is a 100%-toned dark
panel carrying 12.6% high-contrast marks; our SentenceWidth diagram zone is 97% blank paper with
**2.0%** high-contrast marks; our globe cell is 94% modal white. The page has mass at d00 and
never again. (Evidence: c1, c2, c4.)

**0.2 Under-filled cells — one artifact floating in whitespace.** Confirmed in its worst form in
c2: "Every locale is a different length" promises *four* languages and renders **one** small
Japanese button; the right two-thirds of the cell is empty except a faint dashed guide. c5: the
Delivery globe carries exactly one datum ("fra · 12 ms") in a 925×745 cell. The bounding box is
not the failure (faint full-width ruler ticks stretch it to 97% width) — the fill inside the box
is: our marks are 2–3.6% of the zone against oxc's 12.6%-on-dark. Whitespace reads as leftover,
not composed.

**0.3 Hairlines too faint to structure a cell.** Our diagram guides and connectors sit at the
rule color (~`#E0DDD5` measured off the shot, Δ≈27/255 from paper) and are used *as drawing
strokes* — the Context fork's connectors, the SentenceWidth ruler, the stats icons all nearly
vanish. The references use that value only for structure (cell rules) and draw artifacts in ink
or white on dark. (Evidence: c2 left vs right, c3.)

**0.4 Strokes and labels undersized relative to container.** Our in-diagram labels run 9–10px
mono muted (`context="file"`, `fra · 12 ms`, stat icon captions); reference artifact text is
14px mono at 1.5 line height (viteplus terminal body 14/24 measured; oxc diff 14+). Our
isometric routing cubes are ~20px objects annotating a 900px cell. (Evidence: c3, c5.)

**0.5 Abstract placeholders where references show the real thing.** The Translation cell draws
grey slabs with squiggle lines standing for "files" (c4); the story browser is a wireframe with
numbered chips over an empty frame (c6). oxc shows a real eslint error with file path and line
numbers, a real unified diff with hunk headers, a real pnpm transcript; the *current*
generaltranslation.com already shows a real browser with real locale tabs and a real five-step
agent workflow. Information-per-pixel is far below both the bar and the site being replaced.

**0.6 What already passes.** The hero terminal (dark, real transcript — c7), ExpansionBars (real
per-locale data, one accent bar — c2), the Terminology six-locale list, the writing-system
specimen, and gt.config.json are directionally right: they are real artifacts. They fail only on
mass, stroke weight, and fill. The fix is a standard, not a purge.

---

## 1. DENSITY — the artifact spans the cell; whitespace is composed margin

Hard rules, checkable on any screenshot:

1. **Span.** The artifact's bounding box covers **≥ 85% of the cell's content width** and
   **≥ 60% of its content height** (content box = inside the inner card padding). Margin exists
   only as the artifact's own composed margin, equal on opposing sides. A small object may not
   float centered in a large cell; scale it, multiply it, or shrink the cell.
2. **Mass.** Within the artifact zone, at least ONE of:
   - a toned panel (dark `#14121A`/`#111111`, dithered field, or second-surface fill) covering
     **≥ 60%** of the zone, or
   - high-contrast marks (|Δ| > 80/255 against the local background) covering **≥ 8%** of the
     zone's pixels.
   Measured anchors: oxc benchmark zone 12.6% marks on a toned panel (pass twice over); our
   SentenceWidth zone 2.0% on paper (double fail).
3. **Information floor.** A diagram shows a real artifact at real volume — never one datum:
   - a list/table diagram shows **≥ 5 real rows**;
   - a diff shows **≥ 6 lines** with its hunk header, a terminal **≥ 6 lines** of transcript;
   - a comparison (SentenceWidth) shows **≥ 3 locales simultaneously**, each with its measured
     delta;
   - a map/topology (globe, routing) labels **≥ 4 nodes** with real values.
4. **The artefact law (from MODULES_PLAN, now global).** Every string, locale code, filename,
   JSON key, timing and diff line exists in the product. Translated strings come from
   `/Users/kevinliu/gt/gt/examples/next-ssg/public/_gt/{es,ja,de,fr,zh}.json` or are generated by
   running the product. No glyph soup, no grey-slab stand-ins, no squiggle-line "text". If a
   surface can show the real thing, illustration of the thing is prohibited.
5. **Information-per-pixel rule of thumb.** Stand at arm's length: if the cell could be redrawn
   from memory in under ten seconds, it is under-filled. Concretely, a content cell carries at
   least as much real text/data as its heading + supporting copy carries — the visual is the
   heavier half of the cell, never the lighter.

## 2. STROKE & LABEL SYSTEM

Three stroke weights, fixed page-wide (CSS px; never render below 1 physical px):

| role | weight | color | use |
|---|---|---|---|
| hairline | 1px | rule `#E5E4E7` light / `#3B3440` dark | structure ONLY: cell rules, extension lines, rulers, guides |
| regular | 1.5px | ink `#16171D` / white on dark | the drawing stroke: every line-art contour, connector, bar outline |
| emphasis | 2px | ink or accent | active-state underline, the dimension line being read, the thread pair |

- **Hairlines never draw the artifact.** If a mark carries meaning, it is regular or emphasis.
  If it is scaffolding, it is hairline. (This single rule fixes diagnosis 0.3.)
- **The doubled line is the brand's line (THREAD_MOTIF, mandatory).** Any structural stroke that
  can be doubled is doubled: two parallel lines at **constant gauge** — stroke 1.5px, gap 3px —
  defined once as `--thread-gauge / --thread-gap / --thread-ink` and reused verbatim in every
  module. The two threads are source and translation: they never merge, never cross carelessly,
  never appear as three. They enter at the hero baseline, run gutters and diagonal spacers,
  become the removed/added lines of the Locadex diff, fan into context-group connectors, and
  converge into the GT mark only at the footer. Named stroke crops (Signal, Gate, Crossbar) are
  always oversized and cropped by their container, never shown small and whole.
- **Labels.** All in-diagram text is mono (Geist Mono). Floor **11px**, target **12px** for
  annotations, **14/24** for artifact body text (code, transcripts, diffs — the measured
  reference value). Locale codes lowercase (`de`, `ja`); values in ink at 400–500; contextual
  captions muted `#867E8E`. No uppercase ornamental labels — uppercase appears only where the
  artifact itself is uppercase.
- **Measurement annotation (the CALIPER vocabulary).** A dimension is drawn as: hairline
  extension lines from the measured edges → a regular-weight dimension line with end ticks
  (4–5px, the oxc tick is a 5px triangle) → a mono value label in ink (`+35%`, `−24% vs en`,
  `12 ms`). Guides never darker than rule color; values never lighter than ink. Each measured
  diagram states its unit once. Bezier control points render as 3px squares on the curve;
  sidebearing bands as hairline-bounded muted fills. Chapter-joint ticks (the 5px triangle pair
  sitting on a band's top rule) are used at most six times per page, as oxc does.

## 3. MATERIALS — exactly four, one per surface

1. **Flat tone-on-tone.** Solid fills from the surface ramp only (paper `#FFFFFF`, mat, beige
   `#F4F3EC`, slate `#14121A`, terminal `#111111`, ink `#16171D`). No CSS gradients.
2. **1-bit Bayer dither** — rendered by `src/lib/dither.ts`, the sanctioned texture engine.
   `scale` 3–4 for halftone fields (144k–81k cells full-bleed), 8+ only for deliberate chunky
   marks. Ink-on-paper or paper-on-ink; no greys except dithered ones. Animate only fields that
   cost ≤ ~8ms/frame per the module's own budget table; `radialBurst` animates at scale 4+ or
   ships static.
3. **Measured line-art.** Regular-weight ink contours + CALIPER annotations + control points on
   paper or mat. This is the only material drawn with strokes.
4. **Prismatic light** — dark surfaces only. `vendor/prismatic-field.js` (the founder's exact
   shader), masked *inside* a stroke crop, panel, or full-bleed band; dimmed under content via
   `exposureScale`; composed around per AESTHETIC_ADDENDUM 2b (content aligns to the light's
   axes; the dark center is where content sits). Never under paper-white sections. When strongly
   visible it *is* the page's accent moment.

Rules of application: **one material per surface, never mixed in one crop.** Light-mode pages
use 1–3; dark-mode pages use 1, 3, 4. Material 2 is the light pages' only texture; material 4 is
the dark pages' only color. A cell that needs "richness" gets a material, not an ornament.

## 4. SURFACES

- **The nested-frame mat (V10 signature, required on content-bearing cells).** Outer cell: 1px
  hairline, radius 5px, `padding: 2px`, mat surface one step off paper. Inner card: radius 2px,
  padding 20–24px, own surface. The 2px reveal runs unbroken around the content. NEVER on
  text-only cells — the framed/unframed contrast is the device.
- **Inset panel.** A bordered artifact panel inside a padded cell: dark `#14121A` at radius
  2–4px for code/diff/JSON (the measured oxc `rounded-xs` panel), or paper with hairline ring
  for UI mocks. On dark plates the ring is `outline: 1px rgba(255,255,255,.25); outline-offset:
  2px` (hero) or `.20` (feature panels) — the measured viteplus ring.
- **Full-bleed visual cell.** Zero padding; the material runs to the cell edges; the artifact
  panel floats on it. Light mode: dithered field; dark mode: prismatic field. A panel that
  continues past a cell edge squares the corners on that side only (`border-radius: 4px 0 0
  4px`, the measured viteplus trick).
- **Dark terminal panel.** `#111111`, padding **28px 32px**, radius **8px 8px 0 0**, sits flush
  to the bottom of its cell; body mono **14/24**; states shown with type weight and hairlines,
  never colored pills.
- **Partial borders — the grid reads as one sheet.** Grid cells carry `border-top: 1px` only
  (plus left/right only at the column's outer edges); adjacent cells share a single hairline;
  no cell carries a full box; **radius 0 on grid cells**, 4px only on chips/buttons/small code
  objects, 8px only on terminal top corners. Two stacked hairlines anywhere is a defect.
- **Surface cadence (fixes diagnosis 0.1).** Every full-viewport scroll position between the
  hero and the footer shows **at least one toned artifact surface** (dark panel, dithered field,
  beige second surface, or — dark pages — prismatic band). Check d00–d12: a depth that is all
  paper fails.

## 5. COLOR

Measured palette, closed set:

- Ink `#16171D` · Paper `#FFFFFF` · Rules `#E5E4E7` (light) / `#3B3440` (dark)
- Muted `#867E8E` — the workhorse for secondary text; it is never the artifact's ink
- Deep panel `#14121A` · Terminal `#111111` · Second surface `#F4F3EC` (LEDGER)
- **One accent per direction**, at oxc-level restraint: oxc's aqua appears in ~28 DOM elements
  but exactly **five places** on the page; viteplus's violet in **one**. Hard cap: the accent
  appears in **≤ 6 places per page**, at most **one element per diagram** (the winning bar, the
  active locale, the added line). The accent never touches a heading, body sentence, border, or
  button label.
- **The founder's bans (ITERATION_SPEC §G, verbatim law).** No eyebrows/kickers above headings.
  No fake instrument chrome (`DWG NO.`, `SCALE 1:1`, sheet borders, registration marks). No
  green dots, colored status pills, or badges — state is type weight, strikethrough, hairlines.
  No decorative gradients, rainbow fills, gradient borders, or colored glows — the only
  sanctioned color-as-light is the prismatic field and pure white speculars. No ornamental
  icons, count chips, or `[01]` index marks. Every section is header+subheader or
  header+content. No grid/dot/graph-paper backgrounds behind content (bounded diagonal spacer
  bands between sections are required and exempt).

## 6. TYPE IN DIAGRAMS

- **Switzer** (display, headings incl. in-cell headings): weight cap **500** everywhere. The
  measured tracking curve: 60px → -0.05em, leading 1.12; 48px → -0.025em, leading 1.00; 30px →
  normal tracking, leading 1.2. Tracking tightens as size grows; leading compresses toward 1.0.
- **Inter** (body, UI copy, diagram captions): 16px body, 14px captions, muted for support.
- **Geist Mono** (every artifact string): code/diff/transcript 14/24; annotations 12; floor 11.
  Inline code chips: 1px outline `#867E8E`-tone, radius 4, padding 2px 6px (the measured
  most-common bordered object on the references).
- Values may carry weight 500; nothing in a diagram is bolder.
- Real translations, always — correct strings in each script, bidi-resolved, never placeholder
  glyphs. `prefers-reduced-motion` freezes every animated diagram at its canonical still, and
  the still must carry the whole argument (the still-frame law).

## 7. VARIATIONS — one standard, many dresses

A direction changes **material and accent. It never changes density, the stroke system, surface
grammar, or the information rules.** The same module in two directions shows the same real data
at the same fill — dressed differently.

| direction | material emphasis | accent | its expression of the standard |
|---|---|---|---|
| **HALFTONE** | Bayer dither (mat. 2) dominates; every non-type visual is a dithered field | none — achromatic | mass comes from dithered fields; a dithered Signal crop behind the trust band |
| **CALIPER** | measured line-art (mat. 3) dominates | sage band `#DCE6DA` + `#4F6B4B` hairline | mass comes from annotation density: metric guides, control points, sidebearing bands over real letterforms and real UI |
| **REFLOW** | flat + line-art; live DOM re-measure (FLIP) | GT blue `#458DFF` / `#6BA5FF` | the threads are the measuring baselines; deltas annotated per §2 |
| **LEDGER** | flat tone-on-tone; second surface `#F4F3EC` | none | every diagram is a table; the invariant column is the diagram; ≥5 real rows per §1 |
| **REDLINE** | flat; real artifacts only | two diff hues, gutters only | terminals, unified diffs, PR pages, generated JSON — line for line, at 14/24 |
| **Expressive dark family** | Resend machined base + prismatic (mat. 1+4) | the prismatic field itself | near-black `#08–#0d` washed with slow light bands; machined-graphite objects with bright hairline edges; the shader is the composition's armature (AESTHETIC_ADDENDUM 2b); light appears at meaning-charged moments only |

In every one of the six, the two threads run at the same gauge, the nested frame reveals the
same 2px, the diff shows the same six lines, and the accent obeys the same ≤6-places cap.

## 8. THE SCORING RUBRIC (0–10, applied by the convergence critics)

Procedure: the critic shoots the route (`shoot-route.mjs`), builds a composite against the
named reference section with `compare.py`, READS it, and scores. Judgment is against the pixels
in the composite, never memory.

- **0–2 — placeholder.** Abstract stand-ins, empty cells, glyph soup. Fails §1.4.
- **3–4 — our current state.** Real content exists but floats small on paper; hairlines used as
  drawing strokes; labels under 11px; no toned surface in the viewport. Anchors: ours in
  `c1-code-surface.png`, the SentenceWidth cell in `c2-data-diagrams.png`, the globe in
  `c5-globe-vs-objects.png`.
- **5–6 — filled but flat.** Passes density span+mass and the information floor; stroke system
  correct; but material monotony (all paper or all slate), accent misused, or annotation
  vocabulary missing. The composite reads "same species, cheaper."
- **7 — passes every hard rule** in §1–§6. Side-by-side, ours holds the same weight class; a
  designer can still pick the reference in under five seconds (usually on material richness).
- **8.5 — the bar: in a blind side-by-side with the reference, a designer hesitates.** Equal
  surface mass, equal information-per-pixel, threads present at constant gauge, the artifact
  real down to its hunk headers. Target anchors: the right-hand panels of
  `c1-code-surface.png` (resend) and `c2-data-diagrams.png` (oxc) — ours must sit beside those
  and cause hesitation.
- **9–10 — the reference blinks first.** The diagram teaches something true about localization
  in one still (a real German string breaking a real layout, a real context tag splitting one
  word into two translations) with craft the references don't have. 10 is reserved for a still
  the founder would frame.

Any single hard-rule violation in §1–§6 caps the score at 6, regardless of beauty.

## Brand marks (founder directive, added mid-run)

- **Locadex**: always the REAL Locadex mark — `/brand/no-bg-locadex-logo-light.png` (or
  `/brand/locadex-light-no-bg.svg`) — the doubled-line lambda. Never a generic robot, sparkle,
  or cursor icon standing in for the agent. On dark surfaces apply `filter: invert(1)` if no
  dark variant exists. Applies to every agent chip, Locadex cell, and PR attribution.
- **GT**: the real mark (`/brand/no-bg-gt-logo-dark.png` on dark, `-light` on light), never the
  literal text "GT" where the brand is being invoked.

## Slide-to-reveal (founder directive, added mid-run)

The draggable code-reveal divider is a house mechanic, not a one-off: wherever a rendered
component or preview UI is shown (the hero terminal's preview state INCLUDED — the gt-translate
preview cards get these), a slider lets the viewer drag between the rendered result and what
produced it — the `<T>` source or the served `_gt/[locale].json` payload.

FOUNDER-CORRECTED AESTHETIC (supersedes any earlier "metallic handle" wording):
- **No chrome.** No metallic handle, no shiny grip, no skeuomorphic knob. The divider is the
  house doubled hairline at constant gauge in the surface's own ink.
- **Nothing exposed outside the box.** The divider and its grip live entirely INSIDE the
  component's bounds — no handle poking past the card edge, no protruding tabs, no overflow.
  The grip is minimal: a short thickening of the divider or a small contained notch at
  mid-height, discovered on hover/drag rather than shouting.
- Pointer-driven, ~70% result / 30% source default, static mid-position under reduced motion,
  cursor: col-resize on hover as the only affordance beyond the notch.
