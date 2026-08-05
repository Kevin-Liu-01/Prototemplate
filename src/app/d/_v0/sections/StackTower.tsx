import type { CSSProperties } from 'react';

import {
  ISO_COS30,
  ISO_SIN30,
  frontEdge,
  leftFace,
  project,
  rightFace,
  roundedPolygon,
  segment,
  silhouette,
  topFace,
  type IsoBox,
  type Pt,
} from '@/app/d/toolchain/diagrams/iso';

/**
 * The stack tower — the full-stack band's drawing, back in the ORIGINAL
 * toolchain stack's flat-plate format (founder: "revert the stack to this
 * flatter format with our newer enhanced decorations"): four thin solid
 * plates at the original's gauge — thickness ~4% of the footprint, air
 * between plates ~40% — one per beat of the copy rail, physical order
 * equal to beat order: code, context, translations, agents, bottom up.
 * The agents plate steps its footprint down ~13% (founder round 9: the
 * top layer reads as the CAPSTONE) — same plan center, same seat, the
 * one projection, just a smaller rhombus. All four plates are PRESENT
 * AT ALL TIMES now (founder round 9: the build-in/out choreography is
 * no longer the scroll behavior): the draw — rail rising, bends curling
 * off the tip, plates settling in sequence — plays ONCE as the tower
 * first scrolls into view (FullStack's entrance), and from then on the
 * beats only move the spotlight. Non-hot plates hold a ghost presence
 * (fullstack.css dims their fills, rims, and artwork to roughly a third
 * of the hot voice); the hot plate keeps the full treatment. Each top
 * face carries its section's artifact: the <T> code block, the context
 * chips, the translated strings with the accent payload chip, and the
 * Locadex mark mask-rendered in the plate's ink under a Bayer-dithered
 * specular sweep (the shimmer block below).
 *
 * The original's connective thread is ported as ONE blue rail
 * (founder: "align the lines to the actual layers … same size as our
 * blue rail line and actually meeting the blue rail line"): a single
 * accent line of constant gauge (RAIL_GAUGE) whose quiet full-height
 * track — the same gauge, in rest ink — runs the COMPLETE height of
 * the figure CELL, top rule to bottom rule (founder: "the rail is
 * still not reaching complete top and bottom"), drawn by FullStack as
 * a cell-spanning element (.v0s-cellrail) behind this sticky figure,
 * because no frame-bound SVG can outlive its own box. The entrance's
 * accent FILL covers that track exactly — same x, same gauge — rising
 * once from the rail's foot to the top plate's tap (FullStack drives
 * it through RAIL_SCALE) and holding for good, so there is never a
 * second vertical: one line, blue where the circuit is lit, rest-ink
 * above. The frame carries no type: the plates' artwork identifies
 * them and the copy rail names them (founder: no words by the diagram).
 *
 * Each plate's small-radius corner leader is part of the SAME drawing
 * system: rail gauge, rail ink (opaque, so where it lies on the fill
 * the two are pixel-identical — nothing ever reads drawn twice), and
 * the rail's exact x, elbowing out to land on the plate's left VERTEX
 * — the mid-edge apex where the rounded hull actually peaks, its butt
 * end buried under the opaque hull so the meet is gapless. The taps
 * live IN their slabs' own SVGs now, not the overlay, so a tap rides
 * its plate through every lift, drop, and glide (founder: the lines
 * must stay on the layers); the stub below the elbow runs long enough
 * down the rail that even a lifted plate's leader still roots in the
 * fill. The capstone's own vertex sits nearer the center, so its
 * leader simply runs ~12 units further out from the same rail seat.
 * fullstack.css re-derives the rail x in cell space from
 * RAIL_X / RAIL_GAUGE / VIEW_W; change those numbers together.
 *
 * Each slab is its own absolutely-seated HTML element rather than a group
 * in one SVG: the scroll spotlight must put the active slab ABOVE its
 * neighbours, and z-index is an HTML privilege SVG paint order doesn't
 * grant. FullStack owns the spotlight — the is-hot classes, the stacking
 * order, the entrance, and the lift; this file owns only the drawing. All
 * constant paint lives in fullstack.css; the per-plate depth stepping of
 * the stroke voice rides two custom properties, the way the original
 * stepped its rim and edge brightness by depth.
 */

export type TowerLayer = {
  /** Stable id, shared with the copy rail's beat→slab map. */
  id: string;
};

/** Bottom slab first — the stack builds up from the codebase. */
export const TOWER_LAYERS: readonly TowerLayer[] = [
  { id: 'code' },
  { id: 'context' },
  { id: 'translations' },
  { id: 'agents' },
];

/* ---- the one plate every slab mounts ------------------------------------ */

/** Footprint, plate thickness, and the air between plates, in world units —
    the ORIGINAL stack's proportions (84/3.2/34), scaled to this footprint. */
const SIZE = 104;
const HALF = SIZE / 2;
const THICK = 4.2;
const GAP = 42;
const STEP = THICK + GAP;

/** The agents plate's stepped-down footprint, ~13% under SIZE: the top
    plate reads as the stack's CAPSTONE (founder round 9). Same plan
    center, same z seat, same thickness — only the rhombus shrinks; the
    frame, the rows, and the rail all stay SIZE-derived so nothing else
    in the composition moves. */
const CAP_SIZE = 90;
const CAP_HALF = CAP_SIZE / 2;

/** Slab viewBox: the silhouette plus stroke air, plus the rail margin on
    the left — the doubled rail and its leaders live there, in the overlay.
    No caption column anymore (the labels are gone), so the margin is only
    the rail's own air and the drawing spends the width on the plates. */
const PAD = 2;
const LEAD = 30;
const VIEW_X = -(SIZE * ISO_COS30 + PAD + LEAD);
const VIEW_Y = -(HALF + THICK + PAD);
const VIEW_W = 2 * (SIZE * ISO_COS30 + PAD) + LEAD;
const VIEW_H = SIZE + THICK + PAD * 2;

/** The tower's frame: slab i sits (count − 1 − i) STEPs below the top slab. */
const TOWER_H = (TOWER_LAYERS.length - 1) * STEP + VIEW_H;

/* ---- the rail and its taps ------------------------------------------------
   The channel overlay SVG spans the whole tower (viewBox y: 0..TOWER_H), so
   a slab-local y maps to frame y = row·STEP + (y − VIEW_Y). The taps
   themselves are slab-local (they ride their plates). */

/** The BASE plate's left vertex projects to this x — the rail keeps its
    seat off the full footprint; the capstone's nearer vertex just earns
    a longer run (plateGeo below). */
const VERTEX_X = -(SIZE * ISO_COS30);
/** The rail line's right edge, left of the plates. */
const RAIL_X = VERTEX_X - 22;
/** The rail's gauge — in the denser frame this renders at the original
    composition's ~3.4px weight (the units grew when LEAD shrank). The taps
    stroke at this same gauge: one line system, rail and leaders alike. */
const RAIL_GAUGE = 1.85;
/** The rail line's center x — the taps' spring line, so a tap's stroke
    covers the rail's span exactly. */
const RAIL_CX = RAIL_X - RAIL_GAUGE / 2;
/** The corner radius each leader turns with as it peels off the rail. */
const CORNER = 6;

/**
 * The junction's slab-local y: the plate's left VERTEX. The hull rounds its
 * corners (radius clamped to half the 4.2-unit left edge), so the drawing's
 * actual leftmost point is the left edge's MIDPOINT, z = THICK/2 — not the
 * top-left corner, which the rounding has already cut away. Landing the run
 * anywhere else reads as missing the plate (founder: "align the lines to
 * the actual layers").
 */
const TAP_Y = -THICK / 2;

/** Frame y of slab i's tap junction, at the plate's resting seat — what the
    accent channel's build stops are derived from. */
function tapY(i: number): number {
  const row = TOWER_LAYERS.length - 1 - i;
  return row * STEP + (TAP_Y - VIEW_Y);
}

/** The tap span the channel threads: bottom tap's stub to the top tap. */
const RAIL_BOTTOM = tapY(0) + 10;
const RAIL_TOP = tapY(TOWER_LAYERS.length - 1);

/** The channel's reach BELOW the frame: beat 01's arrival is DRAWN — the
    accent rises from the rail's bottom end (the figure cell's bottom rule,
    however far beneath the traveling sticky figure it sits) up to the code
    plate's tap. The overlay overflows its box on purpose and the clipping
    cell crops the fill at the exact edge where .v0s-cellrail's strokes end,
    so the rise and the build channel are ONE rect — no seam where the rise
    ends and the channel begins. 2200 units × the one-column tower's
    lowest px-per-unit still outreaches the tallest runway (three
    920px-capped beats plus the fixed last beat). */
const RAIL_DROP = 2200;
const RAIL_FOOT = RAIL_BOTTOM + RAIL_DROP;

/**
 * The fill's scaleY when the tip stands at slab i's tap, on the
 * foot-anchored fill. Since founder round 9 the fill neither extends nor
 * retracts with the beats: FullStack's one-time ENTRANCE rises through
 * these stops — tipAt() inverts them to the moment the tip passes each
 * tap, so the bends draw as the blue arrives — and then the fill holds
 * at the last stop for good; the rail's strokes never move.
 */
export const RAIL_SCALE: readonly number[] = TOWER_LAYERS.map(
  (_, i) => (RAIL_FOOT - tapY(i)) / (RAIL_FOOT - RAIL_TOP)
);

/** The GSAP svgOrigin the channel fill scales from — its bottom end. */
export const RAIL_ORIGIN = `${RAIL_X} ${RAIL_FOOT}`;

/** How far below the elbow the stub runs down the rail. Long enough that a
    hot plate's 12px lift (≈7.8 units at the one-column width) never pulls
    the stub's foot off the accent fill — the lifted leader visibly extends
    the blue rail up to its plate instead of detaching from it. */
const TAP_STUB = 14;

/* ---- the plate geometry, once per footprint -------------------------------
   Two footprints share the one drawing system: the base plate and the
   agents capstone. Everything derives from the size — hull, the three lit
   faces, the front edge, and the rail tap. The tap's grammar is unchanged:
   its run STARTS at the plate and ENDS down the rail, because the tap
   draws itself out of the layer (founder: "animate it coming out of the
   layer going into the rail") — a dash-offset run from the buried butt
   end, out through the elbow, into the rail's fill; pathLength is
   normalized to 100 in the markup, so FullStack's draw targets are
   percentages of the tap. The run ends PAST the plate's OWN left vertex
   (+2, buried under the opaque hull drawn after it in the same SVG), so
   tap and plate meet with no anti-aliasing seam where the rounding
   recedes — the capstone's leader lands on the capstone's vertex, never
   on the base footprint's. */
type PlateGeo = {
  hull: string;
  top: string;
  left: string;
  right: string;
  front: string;
  tap: string;
};

function plateGeo(size: number): PlateGeo {
  const half = size / 2;
  const box: IsoBox = { x: -half, y: -half, z: 0, w: size, d: size, h: THICK };
  const [frontA, frontB] = frontEdge(box);
  const run = -(size * ISO_COS30) + 2;
  return {
    hull: roundedPolygon(silhouette(box)),
    top: roundedPolygon(topFace(box)),
    left: roundedPolygon(leftFace(box)),
    right: roundedPolygon(rightFace(box)),
    front: segment(frontA, frontB),
    tap: `M${run} ${TAP_Y}L${RAIL_CX + CORNER} ${TAP_Y}Q${RAIL_CX} ${TAP_Y} ${RAIL_CX} ${TAP_Y + CORNER}L${RAIL_CX} ${TAP_Y + TAP_STUB}`,
  };
}

const BASE_PLATE = plateGeo(SIZE);
const CAP_PLATE = plateGeo(CAP_SIZE);

/* ---- the top-face artifacts, one strong drawing per beat ---------------- */

/** A flat rounded rectangle lying in a z = const plane (top face default). */
function markPath(x: number, y: number, w: number, d: number, z = THICK): string {
  const quad: Pt[] = [
    project(x, y, z),
    project(x + w, y, z),
    project(x + w, y + d, z),
    project(x, y + d, z),
  ];
  return roundedPolygon(quad);
}

/**
 * Seats flat 2D artwork in the z = const plane, anchored at plan (ox, oy):
 * a z-plane projects as the affine map (x, y) → (cos30·x − cos30·y,
 * sin30·x + sin30·y − z), so one matrix() carries whole drawings — glyph
 * strokes, wire curves, the masked Locadex mark — into the surface.
 * Strokes inside the group stay 1px via vectorEffect; everything else is
 * drawn in plane coordinates and lands foreshortened like the face itself.
 */
function plane(z: number, ox = 0, oy = 0): string {
  const [sx, sy] = project(ox, oy, z);
  return `matrix(${ISO_COS30} ${ISO_SIN30} ${-ISO_COS30} ${ISO_SIN30} ${sx} ${sy})`;
}

/** The chips' gauge, and where art drawn on a chip's top face sits. */
const CHIP_H = 3.5;
const CHIP_TOP = THICK + CHIP_H;

/* The bracket glyphs are STROKED (a filled chevron under the foreshortening
   reads as an arrow button, a stroked one as a bracket) and lie FLUSH in
   their chip's top face (founder: the tags sit ON the layers, never
   billboarded at the viewer): each group is seated with the same face-plane
   matrix that carries the Locadex mark, so the baseline runs the plate's
   +x edge and the stems foreshorten with the surface. Proportions are
   plane-true — the frame is no longer anisotropic — and the forms run
   larger than the old upright type so the flattened glyphs stay legible
   (the mark proves the plane can carry a form). Strokes stay screen-gauge
   via vectorEffect, the wires' voice a step heavier. */

/** A '<' (dir −1) or '>' (dir 1) bracket, in face-plane units. */
function chevron(cx: number, cy: number, dir: 1 | -1, h = 15, d = 8): string {
  const tip = cx + (d / 2) * dir;
  const back = cx - (d / 2) * dir;
  return `M${back} ${cy - h / 2}L${tip} ${cy}L${back} ${cy + h / 2}`;
}

/** The '/' of the closing bracket. */
function slash(cx: number, cy: number, h = 15, lean = 5.2): string {
  return `M${cx + lean / 2} ${cy - h / 2}L${cx - lean / 2} ${cy + h / 2}`;
}

/** The 'T' of the <T>: bar and stem, two strokes in one path. */
function tee(cx: number, cy: number, h = 13): string {
  const bw = h * 0.38;
  return `M${cx - bw} ${cy - h / 2}L${cx + bw} ${cy - h / 2}M${cx} ${cy - h / 2}L${cx} ${cy + h / 2}`;
}

/**
 * Context's three incoming threads — glossary, tone, directives — flowing
 * into the <T> chip's seat, in plane coordinates. Each wire is drawn twice:
 * a static hairline, and an accent wave riding it (a dash segment FullStack
 * loops along the path while the plate is built; a resting segment without
 * JS or with reduced motion).
 */
const CTX_WIRES: readonly string[] = [
  'M-44 -26C-22 -26 -14 -6 7 -6',
  'M-44 0C-28 0 -16 0 7 0',
  'M-44 26C-22 26 -14 6 7 6',
];

/** Translations' fan: source string out to its three locale runs. */
const FAN_WIRES: readonly string[] = [
  'M-12 -25C-2 -25 -10 -12 2 -12',
  'M-12 -25C-4 -25 -12 3.5 2 3.5',
  'M-12 -25C-2 -25 -12 18.5 2 18.5',
];

/**
 * The agents plate's scan energy: an accent trace orbiting the top face on
 * a ring inset from the rim — its own geometry, so it never doubles the
 * hot accent edge. Inset from the CAPSTONE footprint, since that is the
 * face it rides. FullStack loops the dash whenever the band is on screen.
 */
const ORBIT_D = roundedPolygon(
  topFace({ x: -CAP_HALF + 8, y: -CAP_HALF + 8, z: 0, w: CAP_SIZE - 16, d: CAP_SIZE - 16, h: THICK })
);

type GlyphChipProps = {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  /** The one accent artifact: the delivered translation. */
  accent?: boolean;
};

/** A miniature extrusion resting on the top face. */
function GlyphChip({ x, y, w, d, h, accent }: GlyphChipProps) {
  const box: IsoBox = { x, y, z: THICK, w, d, h };
  return (
    <g className={accent ? 'v0s-g-chip is-accent' : 'v0s-g-chip'}>
      <path className='v0s-g-chip-hull' d={roundedPolygon(silhouette(box))} />
      <path className='v0s-g-chip-top' d={roundedPolygon(topFace(box))} />
    </g>
  );
}

/** The Locadex mark's seat in the top face (the mask makes the shape take
    the surface's ink instead of the asset's fill — the same technique the
    Locadex iso uses on its agent slab), sized to OWN the face (founder:
    much larger, not a small centered glyph). The asset's 500² viewBox pads
    its glyph — the drawn form spans only 199×222 of it — so the seat is
    sized from the GLYPH, not the file: a 54-plan-unit visible mark (~60%
    of the 90-unit capstone face, glyph corners still ~10 units inside the
    orbit ring's ±37 inset), which the padding inflates to a ~136-unit
    image box. The mask's alpha crops everything back to the glyph. The
    asset is an SVG, so the scale costs no crispness. */
const MARK_GLYPH_W = 54;
const MARK_HALF = (MARK_GLYPH_W * (500 / 199)) / 2;
const MARK_PLANE = plane(THICK);

/* ---- the mark's dithered shimmer ------------------------------------------
   Founder round 9: "a special animated shader, like the dithers, to make
   it look even cooler or metallic." The mark keeps its alpha mask; what
   sweeps through it is a specular band QUANTIZED by the house 4×4 ordered
   Bayer matrix (glyph-field's 1-bit falloffs are the reference: density
   ramps render as dither, never as alpha veils). The band is five NESTED
   clip windows riding together — a solid core out to a 1/16 fringe — each
   windowing a static rect filled with that coverage tier's Bayer pattern.
   Ordered dithering nests by construction (every tier's lit cells are a
   subset of the next tier's), so the overlap composes exactly the ramp,
   and because the glint ink is opaque the doubled cells never brighten.
   The mark's plane transform moved INSIDE the mask so all of this lives
   in slab screen space: the dither cells stay square screen cells (~1.9px
   at the resting width — founder: "each dot smaller") instead of
   foreshortened rhombi, and crispEdges keeps them 1-bit under zoom.
   TWO bands ride the loop (founder: "more animated than static"): the
   primary and a slimmer counter-sheen half a lap behind — each tier's
   clipPath is the UNION of both windows — so some stretch of the glyph
   is catching light through nearly the whole ~3.4s pass and the metal
   reads alive, never a texture between rests. FullStack slides the
   windows between ±SHINE_SWEEP, gated to the band being on screen;
   without JS or with reduced motion the markup poses — rotate(60),
   parallel to the plate's projected +y edges — leave the primary band
   catching light mid-glyph as a still, the counter-sheen parked clear. */

/** Ordered 4×4 Bayer matrix — glyph-field's, verbatim. */
const BAYER4: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** Dither cell edge, in drawing units: ~1.9 screen px at the figure's
    392px resting width, ~1.6 at the one-column 330 (founder round:
    "each dot smaller" — stepped down from the first pass's ~2.6px;
    crispEdges pixel-snaps them, so they stay 1-bit at 1x and 2x alike,
    never a grey mush). */
const GLINT_CELL = 1.05;
const GLINT_TILE = GLINT_CELL * 4;

/** One pattern tile at coverage k/16: every cell whose Bayer threshold
    sits under k, as one path of squares. */
function bayerTile(k: number): string {
  const cells: string[] = [];
  BAYER4.forEach((row, y) => {
    row.forEach((threshold, x) => {
      if (threshold < k) {
        cells.push(
          `M${x * GLINT_CELL} ${y * GLINT_CELL}h${GLINT_CELL}v${GLINT_CELL}h${-GLINT_CELL}Z`
        );
      }
    });
  });
  return cells.join('');
}

/** The band's tiers, center-out: clip-window width (drawing units) and
    Bayer coverage. Each window CONTAINS the previous, so the union is the
    ordered-dither falloff — solid where every tier lands, sparse at the
    fringe. */
const SHINE_TIERS: readonly { cover: number; width: number }[] = [
  { cover: 16, width: 7 },
  { cover: 10, width: 12 },
  { cover: 6, width: 18 },
  { cover: 3, width: 26 },
  { cover: 1, width: 36 },
];

/** The sweep's half-travel, in drawing units. The glyph spans ±47 and
    the widest window's horizontal footprint adds ±36, so past ~±83 the
    band has fully cleared — every pass rests dark for a breath before
    the next catch. FullStack slides the windows -SHINE_SWEEP →
    +SHINE_SWEEP, rotating about each window's CENTER (GSAP's SVG
    default is the bbox corner, which would swing the band off-glyph). */
export const SHINE_SWEEP = 96;

/** The masked rects' screen-space cover: the capstone glyph projects to
    ±46.8 × [-31.2, 22.8]; these bounds pad that, and the mask crops the
    rest back to the mark. */
const LDX_X = -52;
const LDX_Y = -38;
const LDX_W = 104;
const LDX_H = 66;

function TopGlyph({ id }: { id: string }) {
  switch (id) {
    case 'code':
      /* source: the raised bracket pair — '<' and '/>' each on its own
         slab, drawn large enough to READ as brackets (founder round),
         lying flush in the chip tops — wrapping three lines of code
         between them: the <T> block grammar with real bracket forms */
      return (
        <>
          <path className='v0s-g-mark' d={markPath(-16, -9, 30, 5)} />
          <path className='v0s-g-mark' d={markPath(-16, -1.5, 22, 5)} />
          <path className='v0s-g-mark' d={markPath(-16, 6, 26, 5)} />
          <GlyphChip x={-46} y={-12} w={24} d={24} h={CHIP_H} />
          <GlyphChip x={22} y={-12} w={24} d={24} h={CHIP_H} />
          <g transform={plane(CHIP_TOP, -34, 0)}>
            <path className='v0s-g-glyph' d={chevron(0, 0, -1)} vectorEffect='non-scaling-stroke' />
          </g>
          <g transform={plane(CHIP_TOP, 34, 0)}>
            <path className='v0s-g-glyph' d={slash(-4.6, 0)} vectorEffect='non-scaling-stroke' />
            <path className='v0s-g-glyph' d={chevron(5, 0, 1)} vectorEffect='non-scaling-stroke' />
          </g>
        </>
      );
    case 'context':
      /* the context flowing IN: three threads — glossary, tone,
         directives — converge on a raised <T> chip, accent waves
         rippling along them (founder round) */
      return (
        <>
          <g transform={plane(THICK)}>
            {CTX_WIRES.map((d) => (
              <path key={d} className='v0s-ctx-wire' d={d} vectorEffect='non-scaling-stroke' />
            ))}
            {/* pathLength 1000, not 100: dash motion lives on this scale,
                and a coarser one leaves each offset step a visible fraction
                of the wire — at 1000 even a whole-unit step is sub-pixel,
                so the ride reads continuous (see the orbit's note) */}
            {CTX_WIRES.map((d) => (
              <path
                key={`wave:${d}`}
                className='v0s-ctx-wave'
                data-ctx-wave
                d={d}
                pathLength={1000}
                strokeDasharray='160 840'
                strokeDashoffset={580}
                vectorEffect='non-scaling-stroke'
              />
            ))}
          </g>
          <GlyphChip x={6} y={-12} w={34} d={24} h={CHIP_H} />
          {/* open tracking, on purpose: flush type shears its neighbours
              toward each other, so anything tighter fuses the three forms */}
          <g transform={plane(CHIP_TOP, 23, 0)}>
            <path
              className='v0s-g-glyph'
              d={chevron(-11, 0, -1, 12, 6.5)}
              vectorEffect='non-scaling-stroke'
            />
            <path className='v0s-g-glyph' d={tee(0, 0, 12)} vectorEffect='non-scaling-stroke' />
            <path
              className='v0s-g-glyph'
              d={chevron(11, 0, 1, 12, 6.5)}
              vectorEffect='non-scaling-stroke'
            />
          </g>
        </>
      );
    case 'translations':
      /* translation OUT, at a glance: the source string fans to three
         locale runs — a Latin-ish bar, the delivered payload (the
         drawing's one accent, raised), and a block-script run */
      return (
        <>
          <path className='v0s-g-mark' d={markPath(-42, -28, 30, 5.5)} />
          <g transform={plane(THICK)}>
            {FAN_WIRES.map((d) => (
              <path key={d} className='v0s-fan-wire' d={d} vectorEffect='non-scaling-stroke' />
            ))}
          </g>
          <path className='v0s-g-mark' d={markPath(3, -15, 26, 5.5)} />
          <GlyphChip x={3} y={-2} w={32} d={11} h={4} accent />
          <path className='v0s-g-mark' d={markPath(3, 15, 9, 7)} />
          <path className='v0s-g-mark' d={markPath(15, 15, 9, 7)} />
          <path className='v0s-g-mark' d={markPath(27, 15, 9, 7)} />
        </>
      );
    case 'agents':
      /* the Locadex mark in the plate's own ink under the dithered
         specular sweep (the shimmer block above), and the scan energy:
         an accent trace orbiting the layer round and round (founder
         round), on its own inset ring */
      return (
        <>
          <defs>
            {/* the glyph's alpha mask. The face-plane transform lives
                INSIDE the mask now, so the masked rects — the resting
                ink and the shimmer tiers — sit in slab screen space and
                the Bayer cells stay square screen pixels. */}
            <mask
              id='v0s-agents-mark'
              maskUnits='userSpaceOnUse'
              x={-120}
              y={-80}
              width={240}
              height={160}
              style={{ maskType: 'alpha' }}
            >
              <g transform={MARK_PLANE}>
                <image
                  href='/brand/locadex-mark.svg'
                  x={-MARK_HALF}
                  y={-MARK_HALF}
                  width={MARK_HALF * 2}
                  height={MARK_HALF * 2}
                />
              </g>
            </mask>
            {SHINE_TIERS.map(({ cover }) => (
              <pattern
                key={cover}
                id={`v0s-ldx-b${cover}`}
                patternUnits='userSpaceOnUse'
                width={GLINT_TILE}
                height={GLINT_TILE}
              >
                <path className='v0s-ldx-glint' d={bayerTile(cover)} shapeRendering='crispEdges' />
              </pattern>
            ))}
            {/* the bands: per tier, the UNION of two origin-centered
                window rects rotated 60° (parallel to the plate's
                projected +y edges) — the primary and the slimmer
                counter-sheen FullStack rides half a lap behind it. The
                markup poses are the reduced-motion and no-JS still:
                primary mid-glyph, counter-sheen parked off it. */}
            {SHINE_TIERS.map(({ cover, width }) => (
              <clipPath key={cover} id={`v0s-ldx-w${cover}`} clipPathUnits='userSpaceOnUse'>
                <rect
                  data-ldx-stripe
                  x={-width / 2}
                  y={-110}
                  width={width}
                  height={220}
                  transform='rotate(60)'
                />
                <rect
                  data-ldx-stripe2
                  x={-(width * 0.62) / 2}
                  y={-110}
                  width={width * 0.62}
                  height={220}
                  transform={`translate(${-SHINE_SWEEP} 0) rotate(60)`}
                />
              </clipPath>
            ))}
          </defs>
          {/* the ring is normalized to 1000 pathLength units, deliberately
              long: the trace's motion is a dash-offset, and offsets that
              quantize (GSAP integer-rounds px-unit CSS props by default)
              step the dash a whole unit at a time — at 100 units that was
              ~6px of rendered jump every few frames; at 1000 a unit is
              sub-pixel, and FullStack's loop opts out of the rounding too */}
          <path
            className='v0s-orbit'
            data-agent-orbit
            d={ORBIT_D}
            pathLength={1000}
            strokeDasharray='120 880'
            strokeDashoffset={300}
            vectorEffect='non-scaling-stroke'
          />
          <rect
            className='v0s-g-ldx'
            x={LDX_X}
            y={LDX_Y}
            width={LDX_W}
            height={LDX_H}
            mask='url(#v0s-agents-mark)'
          />
          {/* the shimmer: static Bayer-tier fills, windowed by the moving
              band — cells never move, the light does (glyph-field's rule:
              the screen is fixed, the ramp travels) */}
          <g className='v0s-ldx-shine' mask='url(#v0s-agents-mark)'>
            {SHINE_TIERS.map(({ cover }) => (
              <rect
                key={cover}
                x={LDX_X}
                y={LDX_Y}
                width={LDX_W}
                height={LDX_H}
                fill={`url(#v0s-ldx-b${cover})`}
                clipPath={`url(#v0s-ldx-w${cover})`}
              />
            ))}
          </g>
        </>
      );
    default:
      return null;
  }
}

/** Custom properties are legal inline styles but absent from CSSProperties. */
type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

/** Depth cue, spent on the strokes: 0 at the bottom plate, 1 at the top. */
function depthAt(i: number): number {
  return i / (TOWER_LAYERS.length - 1);
}

type StackTowerProps = {
  className?: string;
  /** Accessible name. Without one the drawing is decorative and hidden. */
  title?: string;
  /** Slab indices born hot, so the resting frame matches the first beat. */
  hot?: readonly number[];
};

export default function StackTower({ className, title, hot }: StackTowerProps) {
  const frame: CSSProperties = { aspectRatio: `${VIEW_W} / ${TOWER_H}` };
  const born = new Set(hot ?? []);
  return (
    <div
      className={['v0-stack-tower', className].filter(Boolean).join(' ')}
      style={frame}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {/* the rail's accent fill, one overlay SVG spanning the frame,
          behind every plate: it covers the cell-height track (FullStack's
          .v0s-cellrail — same x, same gauge) up to the newest plate's tap,
          so the one rail line reads blue as far as the stack has built.
          The taps are NOT here: they live in their slabs' own SVGs below,
          so each one rides its plate. */}
      <svg className='v0s-railsvg' viewBox={`${VIEW_X} 0 ${VIEW_W} ${TOWER_H}`} aria-hidden>
        <rect
          className='v0s-rail-fill'
          data-rail-line
          x={RAIL_X - RAIL_GAUGE}
          y={RAIL_TOP}
          width={RAIL_GAUGE}
          height={RAIL_FOOT - RAIL_TOP}
        />
      </svg>

      {TOWER_LAYERS.map((layer, i) => {
        const row = TOWER_LAYERS.length - 1 - i;
        const d = depthAt(i);
        const geo = layer.id === 'agents' ? CAP_PLATE : BASE_PLATE;
        const voice: StyleVars = {
          top: `${((row * STEP) / TOWER_H) * 100}%`,
          zIndex: i + 1,
          /* the original's stroke voice: rim and top edge brighten with
             depth, so the stack reads front-lit from above */
          '--v0s-rim-a': (0.12 + 0.08 * d).toFixed(3),
          '--v0s-edge-a': (0.24 + 0.24 * d).toFixed(3),
        };
        return (
          <div
            key={layer.id}
            className={born.has(i) ? 'v0s-slab is-hot' : 'v0s-slab'}
            data-tower-slab={i}
            style={voice}
          >
            <svg viewBox={`${VIEW_X} ${VIEW_Y} ${VIEW_W} ${VIEW_H}`} aria-hidden>
              {/* the plate's rail tap FIRST — under the hull, so its
                  overshot end disappears into the plate — and IN the slab,
                  so it tracks the plate through every lift and drop;
                  gauge in drawing units, the rail's own, never px */}
              <path
                className={born.has(i) ? 'v0s-leader is-hot' : 'v0s-leader'}
                data-rail-tap={i}
                d={geo.tap}
                strokeWidth={RAIL_GAUGE}
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={0}
              />
              {/* the opaque hull — this is what occludes the tower below —
                  then the three face fills keeping the family's upper-left
                  light, then the hairlines, each drawn once */}
              <path className='v0s-hull' d={geo.hull} />
              <path className='v0s-left' d={geo.left} />
              <path className='v0s-right' d={geo.right} />
              <path className='v0s-top' d={geo.top} />
              <path className='v0s-rim' d={geo.hull} vectorEffect='non-scaling-stroke' />
              <path className='v0s-front' d={geo.front} vectorEffect='non-scaling-stroke' />
              <path className='v0s-edge' d={geo.top} vectorEffect='non-scaling-stroke' />
              <TopGlyph id={layer.id} />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
