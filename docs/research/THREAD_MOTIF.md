# THREAD MOTIF — the double-line brand system (founder-requested, NOT YET BUILT)

Status: specified from the founder's direction and reference on 2026-07-29; no direction
implements it yet. This is the first design task for whoever picks the work up.

## The reference (Noxtua brand sheet, supplied by the founder)

A legal-AI brand built the way GT's should be: the logo mark is **decomposed into named stroke
crops** — "Wisdom Owl" (the V-curve), "Security Shield" (the sweeping side stroke), "Connection
Bridge" (the arc) — and each crop is then **enlarged far past the frame** as standalone art.
Three poster applications show the range: the same stroke as a flat two-tone graphic, as a
grain-textured ribbon, and as photographed dark metal. One geometry, many materials. The mark is
never shown whole in the art; a single stroke carries the whole brand.

## Why it fits GT better than it fits Noxtua

The GT mark is drawn with **doubled contour lines** — every stroke is two parallel lines
travelling together (the "adidas-like" quality the founder named), plus the concentric signal
arcs on the G. Two parallel lines is not just a style for a translation company; it is the
product: **source and translation, running side by side, never merging, always in step.**

## The system

### 1. Named stroke crops (do exactly what Noxtua did)
Extract from `/brand/no-bg-gt-logo-dark.png` (1198×1198) and rebuild as clean SVG paths, then
name them. Candidates, pending inspection of the actual curves:
- **The Signal** — the concentric arcs on the G's left (already reads as broadcast/translation)
- **The Gate** — the G's outer double-contour sweep
- **The Crossbar** — the T's junction, two lines meeting a perpendicular pair
Each crop becomes a reusable asset rendered at enormous scale, cropped by the frame, in any of
the family's materials: flat tone-on-tone, 1-bit Bayer dither (HALFTONE), measured line-art with
control points (CALIPER), or the prismatic field masked *inside* the stroke (dark directions).

### 2. The two threads (the founder's "one thread of two threads going through everything")
A continuous **pair of parallel hairlines** runs the length of the page as a single path —
entering at the hero, travelling down the ruled column, passing THROUGH each module and becoming
part of its diagram, then continuing:
- In the hero: the two threads ARE the baseline the headline sits on; one thread carries the
  English line, the other carries the translation beneath it.
- Between modules: they run as a quiet double rule down a gutter, replacing plain dividers where
  they pass (they may also travel the diagonal spacer bands).
- In the Locadex module: one thread enters the PR diff as the removed line, the other exits as
  the added line.
- In the story: the pellet/ingestion paths are the threads.
- In context groups: the threads fan out into group connectors and re-join.
- At the footer: the two threads converge into the actual GT mark — the only place the whole
  logo appears in the art. The page IS the logo, unrolled.
- The threads maintain constant gauge (stroke width and gap) everywhere — that constancy is what
  makes them read as one object. Implement as one SVG path pair per module with shared CSS
  custom properties (--thread-gauge, --thread-gap, --thread-ink); scroll-draw with DrawSVG only
  where a module already animates.

### 3. Rules
- The doubled line is the brand's line. Any diagram stroke that can be doubled should be.
- Crops are always oversized and cropped by their container, never shown small and whole.
- One material per surface: flat, dithered, measured, or light-filled — never mixed in one crop.
- The two threads never merge, never cross carelessly, and never appear as three.

## Where it lands first
- REFLOW's hero (threads as the measuring baselines under re-flowing text)
- HALFTONE's trust band (a dithered Signal crop behind the six logos)
- The Locadex product page hero (a Gate crop in dark metal, oxc-style)
- The review tool's empty state (threads as the patch-cables between module cards)
