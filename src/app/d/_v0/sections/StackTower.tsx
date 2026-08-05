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
 * The stack still BUILDS as the story advances, and each top face carries
 * its section's artifact: the <T> code block, the context chips, the
 * translated strings with the accent payload chip, and the Locadex mark
 * mask-rendered in the plate's ink.
 *
 * The original's connective thread is ported: a doubled vertical rail
 * (two 1px strokes at constant gauge) runs the COMPLETE height of the
 * figure CELL — top rule to bottom rule of the column (founder: "the
 * rail is still not reaching complete top and bottom") — drawn by
 * FullStack as a cell-spanning element (.v0s-cellrail) behind this
 * sticky figure, because no frame-bound SVG can outlive its own box.
 * The frame carries no type: the plates' artwork identifies them and
 * the copy rail names them (founder: no words by the diagram). What
 * lives in THIS drawing's overlay is the rail's moving matter — the
 * parts that must ride the plates as the figure travels the cell: each
 * plate's small-radius corner leader, tapping off the rail's x to the
 * plate's left vertex (a quiet static tap an active plate lifts OFF,
 * exactly as the original's planes rose off theirs), and the accent
 * CHANNEL between the rail's two strokes — a fill that extends and
 * retracts with the build, which FullStack drives through RAIL_SCALE —
 * between the hairlines, never on them, so no stroke is ever drawn
 * twice. fullstack.css re-derives the rail x in cell space from
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

const BOX: IsoBox = { x: -HALF, y: -HALF, z: 0, w: SIZE, d: SIZE, h: THICK };

const HULL = roundedPolygon(silhouette(BOX));
const TOP = roundedPolygon(topFace(BOX));
const LEFT = roundedPolygon(leftFace(BOX));
const RIGHT = roundedPolygon(rightFace(BOX));
const [FRONT_A, FRONT_B] = frontEdge(BOX);
const FRONT = segment(FRONT_A, FRONT_B);

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

/* ---- the rail and its taps, in frame coordinates ------------------------
   The overlay SVG spans the whole tower (viewBox y: 0..TOWER_H), so a
   slab-local y maps to frame y = row·STEP + (y − VIEW_Y). */

/** Every plate's left vertex projects to this x. */
const VERTEX_X = -(SIZE * ISO_COS30);
/** The doubled rail's inner line, left of the plates. */
const RAIL_X = VERTEX_X - 22;
/** The two rail strokes' spacing — in the denser frame this renders at the
    original composition's ~3.6px gauge (the units grew when LEAD shrank). */
const RAIL_GAUGE = 1.85;
/** The corner radius each leader turns with as it peels off the rail. */
const CORNER = 6;

/** Frame y of slab i's tap line — the plate's top-left vertex. */
function tapY(i: number): number {
  const row = TOWER_LAYERS.length - 1 - i;
  return row * STEP + HALF + PAD;
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

/** One tap: up the rail, a small-radius corner, then out to the vertex. */
function tapPath(y: number): string {
  return `M${RAIL_X} ${y + CORNER}Q${RAIL_X} ${y} ${RAIL_X + CORNER} ${y}L${VERTEX_X - 1} ${y}`;
}

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
 * hot accent edge. FullStack loops the dash while the plate is built.
 */
const ORBIT_D = roundedPolygon(
  topFace({ x: -HALF + 8, y: -HALF + 8, z: 0, w: SIZE - 16, d: SIZE - 16, h: THICK })
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

/** The Locadex mark's half-size, and its seat in the top face (the mask
    makes the shape take the surface's ink instead of the asset's fill —
    the same technique the Locadex iso uses on its agent slab). */
const MARK_HALF = 20;
const MARK_PLANE = plane(THICK);

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
      /* the Locadex mark in the plate's own ink, and the scan energy:
         an accent trace orbiting the layer round and round (founder
         round), on its own inset ring */
      return (
        <>
          <defs>
            <mask
              id='v0s-agents-mark'
              maskUnits='userSpaceOnUse'
              x={-MARK_HALF}
              y={-MARK_HALF}
              width={MARK_HALF * 2}
              height={MARK_HALF * 2}
              style={{ maskType: 'alpha' }}
            >
              <image
                href='/brand/locadex-mark.svg'
                x={-MARK_HALF}
                y={-MARK_HALF}
                width={MARK_HALF * 2}
                height={MARK_HALF * 2}
              />
            </mask>
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
          <g transform={MARK_PLANE}>
            <rect
              className='v0s-g-ldx'
              x={-MARK_HALF}
              y={-MARK_HALF}
              width={MARK_HALF * 2}
              height={MARK_HALF * 2}
              mask='url(#v0s-agents-mark)'
            />
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
      {/* the rail's moving matter, one overlay SVG spanning the frame,
          behind every plate: the accent channel and the leaders, which
          must ride the plates. The rail's two full-height strokes live
          OUTSIDE this drawing — FullStack's .v0s-cellrail spans the
          whole figure cell at the same x. */}
      <svg className='v0s-railsvg' viewBox={`${VIEW_X} 0 ${VIEW_W} ${TOWER_H}`} aria-hidden>
        <rect
          className='v0s-rail-fill'
          data-rail-line
          x={RAIL_X - RAIL_GAUGE}
          y={RAIL_TOP}
          width={RAIL_GAUGE}
          height={RAIL_FOOT - RAIL_TOP}
        />
        {TOWER_LAYERS.map((layer, i) => (
          <path
            key={layer.id}
            className={born.has(i) ? 'v0s-leader is-hot' : 'v0s-leader'}
            data-rail-tap={i}
            d={tapPath(tapY(i))}
            vectorEffect='non-scaling-stroke'
          />
        ))}
      </svg>

      {TOWER_LAYERS.map((layer, i) => {
        const row = TOWER_LAYERS.length - 1 - i;
        const d = depthAt(i);
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
              {/* the opaque hull — this is what occludes the tower below —
                  then the three face fills keeping the family's upper-left
                  light, then the hairlines, each drawn once */}
              <path className='v0s-hull' d={HULL} />
              <path className='v0s-left' d={LEFT} />
              <path className='v0s-right' d={RIGHT} />
              <path className='v0s-top' d={TOP} />
              <path className='v0s-rim' d={HULL} vectorEffect='non-scaling-stroke' />
              <path className='v0s-front' d={FRONT} vectorEffect='non-scaling-stroke' />
              <path className='v0s-edge' d={TOP} vectorEffect='non-scaling-stroke' />
              <TopGlyph id={layer.id} />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
