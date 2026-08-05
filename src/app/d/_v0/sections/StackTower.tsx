import type { CSSProperties } from 'react';

import {
  ISO_COS30,
  ISO_SIN30,
  frontEdge,
  leftFace,
  polyline,
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
 * one projection, just a smaller rhombus. The stack still BUILDS as the
 * story advances (round 10 reversed round 9's always-visible ghosts:
 * the layers stack one on top of the other as the beats advance, and
 * scroll-back tears them down in reverse), and each top face carries
 * its section's artifact: the <T> code block, the context chips, the
 * translated strings with the accent payload chip, and the Locadex
 * mark mask-rendered in the plate's ink under a Bayer-dithered
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
 * because no frame-bound SVG can outlive its own box. The build's
 * accent FILL covers that track exactly — same x, same gauge — and
 * extends and retracts with the build (FullStack drives it through
 * RAIL_SCALE), so there is never a second vertical: one line, blue
 * where the stack has built, rest-ink above. The frame carries no
 * type: the plates' artwork identifies them and the copy rail names
 * them (founder: no words by the diagram).
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
 * order, the build, and the lift; this file owns only the drawing. All
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

/** The agents plate's footprint: FULL SIZE again (founder round-trip —
    round 9 stepped it down ~13% as a "capstone"; the latest round undoes
    that: "make the top layer the same size as the other"). Same plan
    center, same z seat, same thickness; everything downstream is
    CAP_SIZE-derived, so the face composition just gains plan room. */
const CAP_SIZE = SIZE;
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
 * How much of the accent channel is filled when `count` slabs are built,
 * as a scaleY on the foot-anchored fill. FullStack tweens between these
 * as the stack builds and retracts (and rises from 0 — the empty rail —
 * on beat 01's lock-in); the rail's strokes never move.
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
  'M-36 -26C-18 -26 -13 -6 7 -6',
  'M-36 0C-24 0 -14 0 7 0',
  'M-36 26C-18 26 -13 6 7 6',
];

/** The code plate's wrap boundary: a flat rounded enclosure spanning the
    air between the two bracket chips (their inner edges sit at ±22),
    holding the three code bars — the block the <T> pair owns. The glint
    that rides it loops in FullStack ([data-code-wrap]). */
const WRAP_BOX =
  'M-16.5 -12.5H14.5A3 3 0 0 1 17.5 -9.5V10.5A3 3 0 0 1 14.5 13.5H-16.5A3 3 0 0 1 -19.5 10.5V-9.5A3 3 0 0 1 -16.5 -12.5Z';

/* ---- the layers' identity glyphs (founder: "use more icons and
   examples — terminology, voice, and style … and the translate icon"):
   the beat tags' own lucide forms, inlined as raw geometry (ISC;
   lucide-react ships these exact nodes) so they can lie IN the chip
   tops through the plane transform like every other face mark — never
   a screen-space icon floating over an iso drawing. Each is a 24-box,
   scaled to its chip by ChipIcon below. */
const ICON_BOOK = [
  'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20',
] as const;
const ICON_VOICE = [
  'M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2',
] as const;
const ICON_STYLE = [
  'M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z',
] as const;
const ICON_STYLE_DOTS: readonly (readonly [number, number])[] = [
  [13.5, 6.5],
  [17.5, 10.5],
  [6.5, 12.5],
  [8.5, 7.5],
];
const ICON_LANGS = [
  'm5 8 6 6',
  'm4 14 6-6 2-3',
  'M2 5h12',
  'M7 2h1',
  'm22 22-5-10-5 10',
  'M14 18h6',
] as const;

/** A lucide form lying in a chip's top face: the 24-box is centered on
    (cx, cy) in plan coords at plane z, scaled to s plan units per icon
    unit — the strokes stay screen-gauge via non-scaling-stroke. */
function ChipIcon({
  z,
  cx,
  cy,
  s,
  paths,
  dots,
}: {
  z: number;
  cx: number;
  cy: number;
  s: number;
  paths: readonly string[];
  dots?: readonly (readonly [number, number])[];
}) {
  return (
    <g transform={`${plane(z, cx, cy)} scale(${s}) translate(-12 -12)`}>
      {paths.map((d) => (
        <path key={d} className='v0s-g-icon' d={d} vectorEffect='non-scaling-stroke' />
      ))}
      {dots?.map(([x, y]) => (
        <circle key={`${x}:${y}`} className='v0s-g-icon-dot' cx={x} cy={y} r={1.3} />
      ))}
    </g>
  );
}

/** Translations' fan: source string out to its three locale runs. */
const FAN_WIRES: readonly string[] = [
  'M-12 -25C-2 -25 -10 -12 2 -12',
  'M-12 -25C-4 -25 -12 3.5 2 3.5',
  'M-12 -25C-2 -25 -12 18.5 2 18.5',
];

/* ---- the diff slat gauge ---------------------------------------------------
   The Locadex iso's diff hunk device (Locadex.tsx DIFF_ROWS), ported
   compactly: thin extruded slats, a del hunk over an add hunk, ragged
   widths, each signed +/− in its margin. The tower carries ONE hunk — the
   capstone's (the CAP_DIFF block below): the diff story concentrates at
   the top plate (founder round: the top layer's diffs take the signs, the
   bottom layer's hunk leaves), so the code plate reads as source only —
   brackets and code bands, no add/del semantics. */
const DIFF_STEP = 5.5;
const DIFF_GAP = 4;
const DIFF_D = 3;
const DIFF_H = 1.4;
const SIGN_ARM = 1.7;
const SIGN_T = 0.55;

/**
 * The agents plate's scan energy: accent glints riding the top face's
 * OWN contour — zero inset, the exact path the plate's edge hairline
 * strokes (founder: "make the lines ... closer to its edges, just about
 * touching so its like light going around the edge instead of two
 * worms", then "for the top 4 lines, make them right on the edges").
 * The glints are dash segments OF the edge path itself (CAP_PLATE.top
 * below), so at any zoom the glint and the edge are ONE line — the
 * light IS the edge, resting and hot alike; hot, the accent contour
 * simply brightens under them. FullStack loops the dashes whenever the
 * plate is built and the band is on screen.
 */
const ORBIT_D = CAP_PLATE.top;

/* ---- the capstone's own diffs: the agent's work, scrubbed by scroll ------
   Founder addendum: "make locadex on teh top left side in a raised square
   as well, and then a bunch of diffs being generated as we scroll on it."
   The slat device above, seated across the capstone face CLEAR of the
   mark's chip (rows at plan x ≥ 12, signs at ≥ 5.8, vs the chip's
   ≤ 4), del hunk over add hunk, ragged. FullStack SCRUBS their reveal
   to scroll — beat 04's lock-in through the band's rest view — so the
   hunk grows as the reader travels the dwell and regenerates in reverse
   on the way back. Every row is SIGNED in its margin (founder round: the
   top layer's diffs take the pluses and minuses — the tower's whole diff
   story lives on this plate now), the sign column riding the air between
   the chip and the hunk. */
const CAP_DIFF_ROWS: readonly { w: number; tone: 'add' | 'del' }[] = [
  { w: 16, tone: 'del' },
  { w: 21, tone: 'del' },
  { w: 13, tone: 'del' },
  { w: 19, tone: 'del' },
  { w: 18, tone: 'add' },
  { w: 12, tone: 'add' },
  { w: 20, tone: 'add' },
  { w: 15, tone: 'add' },
  { w: 22, tone: 'add' },
  { w: 14, tone: 'add' },
];
const CAP_DIFF_X = 14;
const CAP_DIFF_Y0 = -28;
/** The sign column's center, the code hunk's old rhythm kept: 4.5 plan
    units left of the rows' start — a clear 11-unit channel now separates
    the chip's edge (plan x = −4) from the signs, and the write wires
    below live in that air. */
const CAP_SIGN_CX = CAP_DIFF_X - 4.5;

/** The write wires' shared origin: just off the chip's right edge, on
    the face — each wire fans from here to its row's margin, and
    FullStack draws wire i as slat i arrives (the agent writing it). */
const WIRE_X0 = -3;

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

/** The Locadex mark's seat: a RAISED SQUARE CHIP at the top-left of the
    capstone's face (founder addendum: "make locadex on teh top left side
    in a raised square" — superseding the earlier smaller-centered-mark
    round), the iso repository's GitHub-chip grammar at capstone scale:
    the tower's own GlyphChip extrusion, with the mask-mark lying in the
    CHIP'S top face and taking the surface's ink. The asset's 500²
    viewBox pads its glyph — the drawn form spans only 199×222 of it —
    so the seat is sized from the GLYPH: a 28-plan-unit visible mark
    inside the 36-unit chip (4-unit margins; founder rounds: the mark
    grows again — 26/18 → 32/24 → 36/28 — and the full-size plate seats
    it at 12 plan units clear of the left edge, an 11-unit channel of
    bare face between chip and signs for the write wires), which the
    padding inflates to a ~70-unit image box the mask crops back. The
    LDX cover below and everything the shimmer derives from it follow
    this seat; move or resize the chip and they recompute. */
const CAP_CHIP_X = -40;
const CAP_CHIP_Y = -18;
const CAP_CHIP_SIZE = 36;
const MARK_GLYPH_W = 28;
const MARK_HALF = (MARK_GLYPH_W * (500 / 199)) / 2;
/** The mark lies in the chip's top face, anchored at the chip's center. */
const MARK_PLANE = plane(THICK + CHIP_H, CAP_CHIP_X + CAP_CHIP_SIZE / 2, CAP_CHIP_Y + CAP_CHIP_SIZE / 2);

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
   clipPath is the UNION of both windows — so a band is crossing the
   glyph through most of the lap and the metal reads alive, never a
   texture between rests. FullStack slides the windows SHINE_FROM →
   SHINE_TO (derived below so every pass fully enters, crosses ALL of
   the mark, and exits past its right edge before restarting), gated
   like the orbit to the agents plate being built and on screen;
   without JS or with reduced motion the markup poses — the windows'
   own pre-rotated 60° geometry, parallel to the plate's projected +y
   edges — leave the primary band catching light mid-glyph as a still,
   the counter-sheen parked clear. */

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

/** The masked rects' screen-space cover: the 28-unit glyph on the chip's
    top face (chip center plan (-22, 0) on the full-size plate, glyph
    v-half 15.6 from the asset's 199×222 form) projects to x
    [-44.7, 6.6], y [-33.5, -3.9]; these bounds pad that, and the mask
    crops the rest back to the mark. The shimmer's travel derives from
    these below, so it breathes with the mark's seat and size. */
const LDX_X = -48;
const LDX_Y = -37;
const LDX_W = 58;
const LDX_H = 37;

/* The sweep's endpoints, DERIVED from the masked cover and the band's
   own rotated geometry (founder round 10: "make it cross the whole
   locadex all the way to the right and then we can restart it — rn it
   gets cut off"). A window rotated 60° from vertical has unit normal
   n = (cos60, sin60); translating its center by x moves it only
   x·cos60 along that normal — HALF the horizontal distance — so a
   fixed ±96 stopped while the widest fringe still lay across the mark.
   The band has fully cleared the cover only when its normal span
   [x·nx − w/2, x·nx + w/2] sits past the cover's own projection onto
   n, so the endpoints are that inequality solved for x, one tier
   half-width plus a breath of margin beyond each edge — at any plate
   or cover size, never clipped. FullStack slides the windows
   SHINE_FROM → SHINE_TO at constant speed and restarts only after the
   full exit; the counter-sheen rides the same path half a lap behind. */
const SHINE_NX = Math.cos(Math.PI / 3);
const SHINE_NY = Math.sin(Math.PI / 3);
const SHINE_W_MAX = Math.max(...SHINE_TIERS.map((tier) => tier.width));
const SHINE_PAD = 4;
/** The cover's extent along the band normal (corners at (LDX_X, LDX_Y)
    and (LDX_X + LDX_W, LDX_Y + LDX_H) are the extremes: nx, ny > 0). */
const SHINE_N_MIN = SHINE_NX * LDX_X + SHINE_NY * LDX_Y;
const SHINE_N_MAX = SHINE_NX * (LDX_X + LDX_W) + SHINE_NY * (LDX_Y + LDX_H);
export const SHINE_FROM = (SHINE_N_MIN - SHINE_W_MAX / 2 - SHINE_PAD) / SHINE_NX;
export const SHINE_TO = (SHINE_N_MAX + SHINE_W_MAX / 2 + SHINE_PAD) / SHINE_NX;

/** The window's half-length along its own axis. Horizontal translation
    also SLIDES the finite window along that axis (by x·sin60), so a
    fixed 110 ran out at the travel's ends — the band's tip visibly
    shortened off the mark's upper corner before it had exited (the
    other half of the founder's cut-off). Sized so the window still
    spans the whole cover diagonal at both endpoints. */
const SHINE_HALF_LEN = Math.ceil(
  SHINE_NY * Math.max(Math.abs(SHINE_FROM), Math.abs(SHINE_TO)) +
    SHINE_NY * (LDX_W / 2) +
    SHINE_NX * Math.max(Math.abs(LDX_Y), Math.abs(LDX_Y + LDX_H)) +
    SHINE_PAD
);

/** One window: a PRE-ROTATED rectangle path centered on the origin —
    `width` across the band normal, 2·SHINE_HALF_LEN along the band
    axis. The 60° set lives in the geometry itself, not in a transform:
    a rotate()-based window proved origin-fragile (GSAP's SVG origin
    compensation shifted the whole sweep ~180 units off the mark, a
    different amount per tier), so the loop is a PURE horizontal
    translate that no origin math can bend. */
function shineWindow(width: number): string {
  const nx = SHINE_NX * (width / 2);
  const ny = SHINE_NY * (width / 2);
  const ax = -SHINE_NY * SHINE_HALF_LEN;
  const ay = SHINE_NX * SHINE_HALF_LEN;
  const pts: readonly Pt[] = [
    [nx + ax, ny + ay],
    [nx - ax, ny - ay],
    [-nx - ax, -ny - ay],
    [-nx + ax, -ny + ay],
  ];
  return polyline(pts, true);
}

/* ---- the agents scan beam --------------------------------------------------
   The Locadex iso's sweep device (Locadex.tsx, v0-ldx-beam), ported to the
   tower for the agents beat (founder: "when we get to this layer, we can
   have it start 'scanning' the below layer to suggest how locadex actually
   works"): a vertical light sheet hanging from the capstone's underside
   down to the TRANSLATIONS plate's top face — a translucent quad, 1px edge
   strokes, and a brighter landing line — drawn at y = 0 and swept along
   world +y by FullStack (a world-y translation projects to the constant
   screen vector (−cos30, +sin30) per unit, so the pass is one x/y tween).

   The sheet lives in its OWN frame-spanning overlay (the beamsvg below),
   not in the agents slab's SVG, for two reasons: paint order — the beam
   must sit BETWEEN the translations slab and the capstone (fullstack.css
   seats the overlay at the capstone's RESTING z and lets the capstone win
   by DOM order; the hot capstone rides far above) — and the LIFT: the hot
   capstone rises 12 screen px, and a beam riding that transform would
   shear its landing line off the plate below. Instead the sheet stands in
   the tower's static frame and its top edge OVERSHOOTS the capstone's
   resting underside by BEAM_TOP_Z world units — more than the lift comes
   to at any figure width (12px ≈ 6.6 units at 392px, ≈ 7.8 at the
   one-column 330) — with the overshoot buried behind the opaque hull, so
   the visible beam always reads seamlessly hung from the capstone,
   lifted or not (verified against the hull silhouette at both sweep
   extremes). The floor sits exactly in the translations top-face plane,
   one STEP below the capstone's seat. */

/** The sheet's half-width along world x — inside the capstone's ±45
    footprint, wide enough to read as a working scan of the plate below. */
const BEAM_HALF = 34;
/** The top edge's overshoot above the capstone's resting underside. */
const BEAM_TOP_Z = 9;
/** The translations plate's top face, in the capstone's local z. */
const BEAM_FLOOR_Z = THICK - STEP;
const beamTL = project(-BEAM_HALF, 0, BEAM_TOP_Z);
const beamTR = project(BEAM_HALF, 0, BEAM_TOP_Z);
const beamBR = project(BEAM_HALF, 0, BEAM_FLOOR_Z);
const beamBL = project(-BEAM_HALF, 0, BEAM_FLOOR_Z);
const BEAM_QUAD = polyline([beamTL, beamTR, beamBR, beamBL], true);
const BEAM_EDGE_L = segment(beamTL, beamBL);
const BEAM_EDGE_R = segment(beamTR, beamBR);
const BEAM_LAND = segment(beamBL, beamBR);

/** Sweep amplitude in world y (founder: "make it go up and down a little
    more than it currently is" — up from the first pass's ±19): the beam's
    ±34 × ±27 footprint stays inside the capstone's ±45 underside and
    lands inside the translations plate's ±52 top face at both extremes,
    and the top edge's overshoot stays buried behind the lifted hull at
    both ends of the pass (checked against the silhouette's four bottom
    edges — the sheet never pokes past the capstone's rim). */
const BEAM_SWEEP_Y = 27;
export const BEAM_SWEEP_DX = BEAM_SWEEP_Y * ISO_COS30;
export const BEAM_SWEEP_DY = BEAM_SWEEP_Y * ISO_SIN30;

/** The beam's seat in the frame overlay: the capstone row's slab-local
    frame, derived by id so a reordering never strands the sheet. */
const BEAM_ROW = TOWER_LAYERS.length - 1 - TOWER_LAYERS.findIndex((layer) => layer.id === 'agents');
const BEAM_FRAME_TY = BEAM_ROW * STEP - VIEW_Y;

function TopGlyph({ id }: { id: string }) {
  switch (id) {
    case 'code':
      /* source: the raised bracket pair — '<' and '/>' each on its own
         slab, drawn large enough to READ as brackets (founder round),
         lying flush in the chip tops — wrapping three lines of code
         between them: the <T> block grammar with real bracket forms.
         The wrap is now EXPLICIT (founder: the layers speak like the
         diffs do): a hairline boundary encloses the code block between
         the brackets, the wrapped line inside tints to the accent, and
         an accent glint rides the boundary — wrap it and it ships. */
      return (
        <>
          <g transform={plane(THICK)}>
            <path className='v0s-wrap-box' d={WRAP_BOX} vectorEffect='non-scaling-stroke' />
            <path
              className='v0s-wrap-glint'
              data-code-wrap
              d={WRAP_BOX}
              pathLength={1000}
              strokeDasharray='130 870'
              strokeDashoffset={210}
              vectorEffect='non-scaling-stroke'
            />
          </g>
          <path className='v0s-g-mark' d={markPath(-16, -9, 30, 5)} />
          <path className='v0s-g-mark is-wrap' d={markPath(-16, -1.5, 22, 5)} />
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
          {/* the three sources made CONCRETE (founder: "more icons and
              examples for terminology, voice, and style"): each wire now
              emerges from under a raised mini-chip carrying its lucide
              form — the book (terminology), the waveform (voice), the
              palette (style) — the beats' own icon language, lying in
              the chip tops like every other face mark */}
          <GlyphChip x={-40} y={-34} w={20} d={16} h={2.5} />
          <GlyphChip x={-40} y={-8} w={20} d={16} h={2.5} />
          <GlyphChip x={-40} y={18} w={20} d={16} h={2.5} />
          <ChipIcon z={THICK + 2.5} cx={-30} cy={-26} s={0.55} paths={ICON_BOOK} />
          <ChipIcon z={THICK + 2.5} cx={-30} cy={0} s={0.55} paths={ICON_VOICE} />
          <ChipIcon
            z={THICK + 2.5}
            cx={-30}
            cy={26}
            s={0.55}
            paths={ICON_STYLE}
            dots={ICON_STYLE_DOTS}
          />
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
          {/* the translate mark itself (founder: "the translate icon"):
              the Languages form on its own raised chip, leading the
              source string into the fan */}
          <GlyphChip x={-42} y={-40} w={22} d={22} h={CHIP_H} />
          <ChipIcon z={CHIP_TOP} cx={-31} cy={-29} s={0.68} paths={ICON_LANGS} />
          <path className='v0s-g-mark' d={markPath(-19, -27.75, 7, 5.5)} />
          <g transform={plane(THICK)}>
            {FAN_WIRES.map((d) => (
              <path key={d} className='v0s-fan-wire' d={d} vectorEffect='non-scaling-stroke' />
            ))}
            {/* delivery as MOTION (founder: the layers speak like the
                diffs do): accent pulses ride the fan from the source
                string out to every locale run — the context waves'
                grammar, pointed the other way */}
            {FAN_WIRES.map((d) => (
              <path
                key={`pulse:${d}`}
                className='v0s-ctx-wave'
                data-fan-pulse
                d={d}
                pathLength={1000}
                strokeDasharray='160 840'
                strokeDashoffset={580}
                vectorEffect='non-scaling-stroke'
              />
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
      /* the Locadex mark riding its raised chip at the face's top-left,
         in the surface's ink under the dithered specular sweep (the
         shimmer block above); the capstone's own diff hunk across the
         rest of the face, scrubbed in by scroll (CAP_DIFF block); and
         the scan energy: accent glints circling ON the top face's edge
         contour itself (the ORBIT block — light wrapping the plate's
         edge, per the founder's addenda) */
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
            {/* the bands: per tier, the UNION of two pre-rotated window
                paths (shineWindow — the 60° set is baked into the
                geometry, parallel to the plate's projected +y edges) —
                the primary and the slimmer counter-sheen FullStack rides
                half a lap behind it. The markup poses are the
                reduced-motion and no-JS still: primary mid-glyph,
                counter-sheen parked clear at the sweep's start. */}
            {SHINE_TIERS.map(({ cover, width }) => (
              <clipPath key={cover} id={`v0s-ldx-w${cover}`} clipPathUnits='userSpaceOnUse'>
                <path data-ldx-stripe d={shineWindow(width)} />
                <path
                  data-ldx-stripe2
                  d={shineWindow(width * 0.62)}
                  transform={`translate(${SHINE_FROM} 0)`}
                />
              </clipPath>
            ))}
          </defs>
          {/* the ring is normalized to 1000 pathLength units, deliberately
              long: the trace's motion is a dash-offset, and offsets that
              quantize (GSAP integer-rounds px-unit CSS props by default)
              step the dash a whole unit at a time — at 100 units that was
              ~6px of rendered jump every few frames; at 1000 a unit is
              sub-pixel, and FullStack's loop opts out of the rounding too.
              FOUR glints per lap ('110 140' repeats four times over the
              1000), one per top-face edge, ON the contour itself (the
              founder: "for the top 4 lines, make them right on the
              edges"); the parked offset 180 centers each dash mid-edge,
              and the loop's −1000 travel is four whole pattern periods,
              so it still wraps seamlessly. */}
          <path
            className='v0s-orbit'
            data-agent-orbit
            d={ORBIT_D}
            pathLength={1000}
            strokeDasharray='110 140'
            strokeDashoffset={180}
            vectorEffect='non-scaling-stroke'
          />
          {/* the mark's raised square chip, top-left of the face */}
          <GlyphChip x={CAP_CHIP_X} y={CAP_CHIP_Y} w={CAP_CHIP_SIZE} d={CAP_CHIP_SIZE} h={CHIP_H} />
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
          {/* the write wires: one hairline per diff, fanning from the
              mark's chip across the face to each row's margin — FullStack
              draws wire i just before slat i lands ([data-cap-wire]), so
              the agent visibly WRITES each line (founder). Parked fully
              undrawn (offset = dasharray) for no-JS and reduced motion. */}
          {CAP_DIFF_ROWS.map(({ tone }, i) => {
            const y = CAP_DIFF_Y0 + i * DIFF_STEP + (tone === 'add' ? DIFF_GAP : 0);
            const cy = y + DIFF_D / 2;
            return (
              <path
                key={`cwire-${i}`}
                className='v0s-diff-wire'
                data-cap-wire={i}
                d={segment(
                  project(WIRE_X0, 0, THICK),
                  project(CAP_SIGN_CX - SIGN_ARM - 1, cy, THICK)
                )}
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={100}
              />
            );
          })}
          {/* the agent's ongoing work: the capstone hunk, scrubbed in by
              scroll (FullStack drives [data-cap-diff]; hidden at rest),
              each row signed +/− in its margin (the CAP_DIFF block) */}
          {CAP_DIFF_ROWS.map(({ w, tone }, i) => {
            const y = CAP_DIFF_Y0 + i * DIFF_STEP + (tone === 'add' ? DIFF_GAP : 0);
            const cy = y + DIFF_D / 2;
            const box: IsoBox = { x: CAP_DIFF_X, y, z: THICK, w, d: DIFF_D, h: DIFF_H };
            const sign =
              markPath(CAP_SIGN_CX - SIGN_ARM, cy - SIGN_T, SIGN_ARM * 2, SIGN_T * 2) +
              (tone === 'add'
                ? ` ${markPath(CAP_SIGN_CX - SIGN_T, cy - SIGN_ARM, SIGN_T * 2, SIGN_ARM * 2)}`
                : '');
            return (
              <g key={`cdiff-${i}`} className={`v0s-diff is-${tone}`} data-cap-diff={i}>
                <path className='v0s-diff-sign' d={sign} />
                <path className='v0s-diff-hull' d={roundedPolygon(silhouette(box), 1.2)} />
                <path className='v0s-diff-top' d={roundedPolygon(topFace(box), 1.2)} />
              </g>
            );
          })}
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

      {/* the agents scan beam's own seated layer (the beam block above):
          one frame-spanning overlay BETWEEN the translations slab and the
          capstone — fullstack.css gives it the capstone's resting z and
          the capstone, mounted after it, wins the tie; FullStack fades it
          in and sweeps it only while the agents beat is hot. The outer g
          seats the sheet in the capstone's row; the inner g is the sweep
          target, so GSAP's transform never disturbs the seat. */}
      <svg className='v0s-beamsvg' viewBox={`${VIEW_X} 0 ${VIEW_W} ${TOWER_H}`} aria-hidden>
        <g className='v0s-scan' data-agents-scan transform={`translate(0 ${BEAM_FRAME_TY})`}>
          <g data-agents-sweep>
            <path className='v0s-beam' d={BEAM_QUAD} />
            <path className='v0s-beam-edge' d={BEAM_EDGE_L} vectorEffect='non-scaling-stroke' />
            <path className='v0s-beam-edge' d={BEAM_EDGE_R} vectorEffect='non-scaling-stroke' />
            <path className='v0s-beam-land' d={BEAM_LAND} vectorEffect='non-scaling-stroke' />
          </g>
        </g>
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
