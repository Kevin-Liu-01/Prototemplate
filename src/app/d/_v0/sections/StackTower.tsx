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
  xy,
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
 * (two 1px strokes at constant gauge) runs the FULL height of the frame
 * at the plates' left — a static thread from the figure's top rule to
 * its bottom rule (founder: the rail spans the diagram, the plates tap
 * into it where they sit) — redrawn here in a full-frame overlay SVG
 * behind the slabs, never imported from DarkBand. The frame carries no
 * type: the plates' artwork identifies them and the copy rail names
 * them (founder: no words by the diagram). Each plate taps off the rail
 * with a small-radius corner leader that lands on its left vertex — a
 * quiet static tap an active plate lifts OFF, exactly as the original's
 * planes rose off theirs. The build's motion lives in the channel
 * BETWEEN the rail's two strokes: an accent fill extends and retracts
 * with the stack, which FullStack drives through RAIL_SCALE — between
 * the hairlines, never on them, so no stroke is ever drawn twice.
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

/** The accent channel's feet: a short stub below the bottom tap, up to the
    top tap — the BUILT stack's span, inside the full-height static rail. */
const RAIL_BOTTOM = tapY(0) + 10;
const RAIL_TOP = tapY(TOWER_LAYERS.length - 1);

/**
 * How much of the accent channel is filled when `count` slabs are built,
 * as a scaleY on the bottom-anchored fill. FullStack tweens between these
 * as the stack builds and retracts; the rail's strokes never move.
 */
export const RAIL_SCALE: readonly number[] = TOWER_LAYERS.map(
  (_, i) => (RAIL_BOTTOM - tapY(i)) / (RAIL_BOTTOM - RAIL_TOP)
);

/** The GSAP svgOrigin the channel fill scales from — its bottom end. */
export const RAIL_ORIGIN = `${RAIL_X} ${RAIL_BOTTOM}`;

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

/**
 * The Locadex mark lies flat in the agents plate's top face: a z = const
 * plane projects as the 2D affine map (x, y) → (cos30·x − cos30·y,
 * sin30·x + sin30·y − z), so one matrix() seats the masked mark in the
 * plane — the same technique the Locadex iso uses on its agent slab. The
 * mask makes the shape take the surface's ink instead of the asset's
 * baked-in fill.
 */
const MARK_HALF = 20;
const MARK_PLANE = `matrix(${ISO_COS30} ${ISO_SIN30} ${-ISO_COS30} ${ISO_SIN30} 0 ${-THICK})`;

function TopGlyph({ id }: { id: string }) {
  switch (id) {
    case 'code':
      /* source: a <T> block's rhythm — open, two indented lines, close */
      return (
        <>
          <path className='v0s-g-mark' d={markPath(-42, -27, 50, 5.5)} />
          <path className='v0s-g-mark' d={markPath(-30, -13, 38, 5.5)} />
          <path className='v0s-g-mark' d={markPath(-30, 1, 32, 5.5)} />
          <path className='v0s-g-mark' d={markPath(-42, 15, 24, 5.5)} />
        </>
      );
    case 'context':
      /* the two halves of a Context Group — glossary and directives —
         each chip carrying its own entry marks */
      return (
        <>
          <GlyphChip x={-38} y={-20} w={29} d={19} h={3} />
          <path className='v0s-g-mark' d={markPath(-33, -15, 15, 3.5, THICK + 3)} />
          <path className='v0s-g-mark' d={markPath(-33, -8, 19, 3.5, THICK + 3)} />
          <GlyphChip x={8} y={-20} w={29} d={19} h={3} />
          <path className='v0s-g-mark' d={markPath(13, -15, 17, 3.5, THICK + 3)} />
          <path className='v0s-g-mark' d={markPath(13, -8, 13, 3.5, THICK + 3)} />
        </>
      );
    case 'translations':
      /* the source string and its quiet sibling, and the delivered
         translation — the payload chip, the drawing's one accent */
      return (
        <>
          <path className='v0s-g-mark' d={markPath(-44, -27, 34, 5.5)} />
          <path className='v0s-g-mark-dim' d={markPath(-44, -14, 24, 5.5)} />
          <GlyphChip x={-15} y={-1} w={42} d={25} h={5} accent />
        </>
      );
    case 'agents':
      /* the Locadex mark, in the plate's own ink (founder: "show a
         locadex logo in the layer") */
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
      {/* the connective thread: the doubled rail, its accent channel, and
          the taps, one overlay SVG spanning the whole frame, behind every
          plate. The two strokes run the frame's FULL height and never
          move; only the channel between them and the taps animate. */}
      <svg className='v0s-railsvg' viewBox={`${VIEW_X} 0 ${VIEW_W} ${TOWER_H}`} aria-hidden>
        <line
          className='v0s-rail-line'
          x1={RAIL_X}
          y1={0}
          x2={RAIL_X}
          y2={TOWER_H}
          vectorEffect='non-scaling-stroke'
        />
        <line
          className='v0s-rail-line'
          x1={RAIL_X - RAIL_GAUGE}
          y1={0}
          x2={RAIL_X - RAIL_GAUGE}
          y2={TOWER_H}
          vectorEffect='non-scaling-stroke'
        />
        <rect
          className='v0s-rail-fill'
          data-rail-line
          x={RAIL_X - RAIL_GAUGE}
          y={RAIL_TOP}
          width={RAIL_GAUGE}
          height={RAIL_BOTTOM - RAIL_TOP}
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
