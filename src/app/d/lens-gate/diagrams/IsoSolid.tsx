import {
  frontEdge,
  ISO_RADIUS,
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
} from './iso';

/**
 * The two solids the whole family is built from. Keeping every extrusion and
 * every plane in here is what guarantees that stroke weight, corner radius and
 * face shading never drift between drawings.
 */

export type IsoTone = 'ink' | 'soft' | 'hair' | 'accent' | 'none';
export type IsoFill = 'top' | 'left' | 'right' | 'mark' | 'accent' | 'accentMid' | 'accentLow' | 'none';

const TONE_CLASS: Record<IsoTone, string> = {
  ink: 'iso-line',
  soft: 'iso-soft',
  hair: 'iso-hair',
  accent: 'iso-accent',
  none: '',
};

const FILL_CLASS: Record<IsoFill, string> = {
  top: 'iso-face-top',
  left: 'iso-face-left',
  right: 'iso-face-right',
  mark: 'iso-face-mark',
  accent: 'iso-face-accent',
  accentMid: 'iso-face-accent-mid',
  accentLow: 'iso-face-accent-low',
  none: 'iso-face-none',
};

export type IsoSlabProps = IsoBox & {
  r?: number;
  /** Stroke used for the silhouette and the top face. */
  tone?: IsoTone;
  /** Suppress the three translucent faces and leave a pure wireframe. */
  faces?: boolean;
};

/** An extruded box: three shaded faces, a hexagonal silhouette, one front edge. */
export function IsoSlab({ x, y, z, w, d, h, r = ISO_RADIUS, tone = 'ink', faces = true }: IsoSlabProps) {
  const box: IsoBox = { x, y, z, w, d, h };
  const stroke = TONE_CLASS[tone];
  const hot = tone === 'accent';
  const [edgeA, edgeB] = frontEdge(box);

  return (
    <g>
      {faces ? (
        <>
          <path className={hot ? FILL_CLASS.accentLow : FILL_CLASS.right} d={roundedPolygon(rightFace(box), r)} />
          <path className={hot ? FILL_CLASS.accentMid : FILL_CLASS.left} d={roundedPolygon(leftFace(box), r)} />
          <path className={hot ? FILL_CLASS.accent : FILL_CLASS.top} d={roundedPolygon(topFace(box), r)} />
        </>
      ) : null}
      {stroke ? (
        <>
          <path className={stroke} d={roundedPolygon(silhouette(box), r)} />
          <path className={stroke} d={roundedPolygon(topFace(box), r)} />
          <path className={stroke} d={segment(edgeA, edgeB)} />
        </>
      ) : null}
    </g>
  );
}

export type IsoPlaneProps = {
  x: number;
  y: number;
  z?: number;
  w: number;
  d: number;
  r?: number;
  tone?: IsoTone;
  fill?: IsoFill;
};

/** A flat plane in the ground plane at height `z` — cards, rule lines, viewports. */
export function IsoPlane({ x, y, z = 0, w, d, r = ISO_RADIUS, tone = 'none', fill = 'none' }: IsoPlaneProps) {
  const quad: Pt[] = [project(x, y, z), project(x + w, y, z), project(x + w, y + d, z), project(x, y + d, z)];
  const path = roundedPolygon(quad, r);
  const stroke = TONE_CLASS[tone];

  return (
    <>
      {fill === 'none' ? null : <path className={FILL_CLASS[fill]} d={path} />}
      {stroke ? <path className={stroke} d={path} /> : null}
    </>
  );
}

export type IsoWireProps = {
  /** World points, in order. */
  points: readonly (readonly [number, number, number])[];
  tone?: IsoTone;
  close?: boolean;
};

/** A path through world space — request paths, lattice edges, branch wires. */
export function IsoWire({ points, tone = 'hair', close = false }: IsoWireProps) {
  const stroke = TONE_CLASS[tone];
  if (!stroke) return null;
  const projected = points.map(([x, y, z]) => project(x, y, z));
  return <path className={stroke} d={polyline(projected, close)} />;
}

export type IsoArrowProps = {
  /** Tip of the arrow, in world space. */
  x: number;
  y: number;
  z?: number;
  /** Length back along +x from the tip. */
  size?: number;
  fill?: IsoFill;
};

/** A flat arrowhead lying in the ground plane, pointing along +x. */
export function IsoArrow({ x, y, z = 0, size = 7, fill = 'mark' }: IsoArrowProps) {
  const half = size * 0.78;
  const quad: Pt[] = [project(x, y, z), project(x - size, y - half, z), project(x - size, y + half, z)];
  return <path className={FILL_CLASS[fill]} d={roundedPolygon(quad, 1.2)} />;
}
