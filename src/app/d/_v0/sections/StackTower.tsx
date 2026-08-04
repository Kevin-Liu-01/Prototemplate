import type { CSSProperties } from 'react';

import {
  ISO_COS30,
  ISO_SIN30,
  frontEdge,
  leftFace,
  rightFace,
  roundedPolygon,
  segment,
  silhouette,
  topFace,
  type IsoBox,
} from '@/app/d/toolchain/diagrams/iso';

/**
 * The stack tower — the full-stack band's drawing, rebuilt solid (founder
 * directive: "make each one solid ... make them more 3d with labels for each
 * layer"). Seven opaque extruded slabs on the family's 30° axis, stacked
 * tight so the side faces read as one ribbed tower; each slab's front-left
 * face carries its system identifier in mono, seated in the face's own plane
 * the way the Locadex mark rides its slab. Every slab is the same extrusion,
 * so the geometry is computed once at module scope and mounted seven times.
 *
 * Each slab is its own absolutely-seated HTML element rather than a group in
 * one SVG: the scroll spotlight must put the active slab ABOVE its
 * neighbours (founder: "when we're on each it should be highest z index"),
 * and z-index is an HTML privilege SVG paint order doesn't grant. FullStack
 * owns the spotlight — the is-hot class, the stacking order, and the lift;
 * this file owns only the drawing. All paint lives in fullstack.css.
 */

export type TowerLayer = {
  /** Stable id, shared with the copy rail's beat→slab map. */
  id: string;
  /** The mono identifier printed on the slab's front-left face. */
  label: string;
};

/** Bottom slab first — the stack builds up from the codebase. */
export const TOWER_LAYERS: readonly TowerLayer[] = [
  { id: 'app-code', label: 'app-code' },
  { id: 'gt-cli', label: 'gt-cli' },
  { id: 'locadex', label: 'locadex' },
  { id: 'context', label: 'context' },
  { id: 'review', label: 'review' },
  { id: 'edge-cdn', label: 'edge-cdn' },
  { id: 'runtime', label: 'runtime' },
];

/* ---- the one extrusion every slab mounts ------------------------------- */

/** Footprint, plate thickness, and the air between plates, in world units.
    The plates are deliberately chunky — thickness a fifth of the footprint —
    so the side faces are tall enough to carry their labels and the stacked
    ribs read as one tower, the reference proportions. */
const SIZE = 92;
const HALF = SIZE / 2;
const THICK = 20;
const GAP = 8;
const STEP = THICK + GAP;

const BOX: IsoBox = { x: -HALF, y: -HALF, z: 0, w: SIZE, d: SIZE, h: THICK };

const HULL = roundedPolygon(silhouette(BOX));
const TOP = roundedPolygon(topFace(BOX));
const LEFT = roundedPolygon(leftFace(BOX));
const RIGHT = roundedPolygon(rightFace(BOX));
const [FRONT_A, FRONT_B] = frontEdge(BOX);
const FRONT = segment(FRONT_A, FRONT_B);

/** Slab viewBox: the silhouette plus stroke air on every side. */
const PAD = 2;
const VIEW_X = -(SIZE * ISO_COS30 + PAD);
const VIEW_Y = -(HALF + THICK + PAD);
const VIEW_W = 2 * (SIZE * ISO_COS30 + PAD);
const VIEW_H = SIZE + THICK + PAD * 2;

/** The tower's frame: slab i sits (count − 1 − i) STEPs below the top slab. */
const TOWER_H = (TOWER_LAYERS.length - 1) * STEP + VIEW_H;

/**
 * The front-left face is the plane y = HALF; a point (x, HALF, z) projects
 * to ((x − HALF)·cos30, (x + HALF)·sin30 − z), so one matrix() seats the
 * label in the face — baseline sloping down-left-to-right with the face,
 * glyph verticals staying vertical, exactly like paint on the plate's side.
 */
const FACE_PLANE = `matrix(${ISO_COS30} ${ISO_SIN30} 0 1 ${-HALF * ISO_COS30} ${HALF * ISO_SIN30})`;

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
      {TOWER_LAYERS.map((layer, i) => {
        const row = TOWER_LAYERS.length - 1 - i;
        return (
          <div
            key={layer.id}
            className={born.has(i) ? 'v0s-slab is-hot' : 'v0s-slab'}
            data-tower-slab={i}
            style={{ top: `${((row * STEP) / TOWER_H) * 100}%`, zIndex: i + 1 }}
          >
            <svg viewBox={`${VIEW_X} ${VIEW_Y} ${VIEW_W} ${VIEW_H}`} aria-hidden>
              {/* the opaque hull first — this is what occludes the tower
                  below — then the three face fills keeping the family's
                  upper-left light, then the hairlines, each drawn once */}
              <path className='v0s-hull' d={HULL} />
              <path className='v0s-left' d={LEFT} />
              <path className='v0s-right' d={RIGHT} />
              <path className='v0s-top' d={TOP} />
              <path className='v0s-rim' d={HULL} vectorEffect='non-scaling-stroke' />
              <path className='v0s-front' d={FRONT} vectorEffect='non-scaling-stroke' />
              <path className='v0s-edge' d={TOP} vectorEffect='non-scaling-stroke' />
              <g transform={FACE_PLANE}>
                <text
                  className='v0s-label'
                  x={0}
                  y={-THICK / 2}
                  textAnchor='middle'
                  dominantBaseline='central'
                >
                  {layer.label}
                </text>
              </g>
            </svg>
          </div>
        );
      })}
    </div>
  );
}
