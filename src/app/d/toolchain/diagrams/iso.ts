/**
 * Projection kit for the `toolchain` illustration family.
 *
 * Every object in the set is drawn through this one 30° axonometric
 * projection, with one corner radius and one light direction, so ten separate
 * drawings read as a family.
 *
 * How the axes land on screen: +x runs down-right, +y runs down-left, +z runs
 * straight up. That puts the camera at (+,+,+), so the three visible faces of
 * any box are the top, the +y face (front-left) and the +x face (front-right)
 * — shaded light, mid, dark in that order. Nothing in the family may light a
 * solid from another direction.
 */

export const ISO_COS30 = 0.8660254037844387;
export const ISO_SIN30 = 0.5;

/** The one corner radius the whole family rounds to, in viewBox units. */
export const ISO_RADIUS = 2.4;

/** A point in screen space, after projection. */
export type Pt = readonly [number, number];

/** World point → screen point. */
export function project(x: number, y: number, z = 0): Pt {
  return [(x - y) * ISO_COS30, (x + y) * ISO_SIN30 - z];
}

/**
 * How near the camera a world point sits. Only the sign matters in practice:
 * positive is the front half of an object, negative the back half, which is
 * what lets the globe draw its far wires quieter than its near ones.
 */
export function depth(x: number, y: number, z = 0): number {
  return x + y + z;
}

/** Radius `r` circle in the ground plane at height `z`, as an SVG ellipse. */
export function isoCircle(r: number, z = 0): { rx: number; ry: number; cy: number } {
  return { rx: r * ISO_COS30 * Math.SQRT2, ry: r * ISO_SIN30 * Math.SQRT2, cy: -z };
}

const round = (v: number): number => Math.round(v * 100) / 100;

/** One point as SVG path coordinates. */
export function xy(p: Pt): string {
  return `${round(p[0])} ${round(p[1])}`;
}

export function polyline(points: readonly Pt[], close = false): string {
  if (points.length === 0) return '';
  const body = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xy(p)}`).join('');
  return close ? `${body}Z` : body;
}

export function segment(a: Pt, b: Pt): string {
  return `M${xy(a)}L${xy(b)}`;
}

function at(points: readonly Pt[], i: number): Pt {
  const n = points.length;
  return points[((i % n) + n) % n] ?? [0, 0];
}

function distance(a: Pt, b: Pt): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

function along(from: Pt, to: Pt, d: number): Pt {
  const len = distance(from, to);
  if (len === 0) return from;
  const t = d / len;
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
}

/**
 * Closed polygon with rounded corners, rounded in *screen* space so a radius
 * looks identical on a top face and on a side face. The radius is clamped to
 * half of each adjoining edge, which is what keeps the family's thin slabs
 * from collapsing at their 3-unit-tall side faces.
 */
export function roundedPolygon(points: readonly Pt[], r: number = ISO_RADIUS): string {
  const n = points.length;
  if (n < 3) return polyline(points, true);
  const parts: string[] = [];
  for (let i = 0; i < n; i += 1) {
    const prev = at(points, i - 1);
    const cur = at(points, i);
    const next = at(points, i + 1);
    const enter = along(cur, prev, Math.min(r, distance(cur, prev) / 2));
    const exit = along(cur, next, Math.min(r, distance(cur, next) / 2));
    parts.push(`${i === 0 ? 'M' : 'L'}${xy(enter)}Q${xy(cur)} ${xy(exit)}`);
  }
  return `${parts.join('')}Z`;
}

/** An axis-aligned box in world space, occupying x..x+w, y..y+d, z..z+h. */
export type IsoBox = {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
};

/** The four projected corners of a box's top face, back corner first. */
export function topFace(box: IsoBox): Pt[] {
  const { x, y, z, w, d, h } = box;
  return [project(x, y, z + h), project(x + w, y, z + h), project(x + w, y + d, z + h), project(x, y + d, z + h)];
}

/** The +y face — the front-left one, lit mid. */
export function leftFace(box: IsoBox): Pt[] {
  const { x, y, z, w, d, h } = box;
  return [project(x, y + d, z + h), project(x + w, y + d, z + h), project(x + w, y + d, z), project(x, y + d, z)];
}

/** The +x face — the front-right one, the darkest of the three. */
export function rightFace(box: IsoBox): Pt[] {
  const { x, y, z, w, d, h } = box;
  return [project(x + w, y, z + h), project(x + w, y + d, z + h), project(x + w, y + d, z), project(x + w, y, z)];
}

/** The hexagonal outer edge of a box. */
export function silhouette(box: IsoBox): Pt[] {
  const { x, y, z, w, d, h } = box;
  return [
    project(x, y, z + h),
    project(x + w, y, z + h),
    project(x + w, y, z),
    project(x + w, y + d, z),
    project(x, y + d, z),
    project(x, y + d, z + h),
  ];
}

/** The one interior edge a silhouette plus a top face don't already draw. */
export function frontEdge(box: IsoBox): [Pt, Pt] {
  const { x, y, z, w, d, h } = box;
  return [project(x + w, y + d, z + h), project(x + w, y + d, z)];
}

/* ---------------------------------------------------------------------------
   Flat art in a surface — the seat every consumer used to hand-copy.
--------------------------------------------------------------------------- */

/** A plan-space point: world ground coordinates, before projection —
    distinct from screen `Pt`. */
export type Pt2 = readonly [number, number];

/**
 * Seats flat 2D artwork in the z = const plane, anchored at plan (ox, oy):
 * a z-plane projects as the affine map (x, y) → (cos30·x − cos30·y,
 * sin30·x + sin30·y − z), so one matrix() carries whole drawings — glyph
 * strokes, wire curves, masked brand marks — into the surface. Strokes
 * inside the group stay 1px via vectorEffect; everything else is drawn in
 * plane coordinates and lands foreshortened like the face itself.
 */
export function plane(z: number, ox = 0, oy = 0): string {
  const [sx, sy] = project(ox, oy, z);
  return `matrix(${ISO_COS30} ${ISO_SIN30} ${-ISO_COS30} ${ISO_SIN30} ${sx} ${sy})`;
}

/** A flat rounded rectangle lying in a z = const plane — content bars,
    chip seats, mark plinths. */
export function markPath(x: number, y: number, w: number, d: number, z = 0, r?: number): string {
  const quad: Pt[] = [
    project(x, y, z),
    project(x + w, y, z),
    project(x + w, y + d, z),
    project(x, y + d, z),
  ];
  return roundedPolygon(quad, r);
}

/* ---------------------------------------------------------------------------
   Arbitrary prisms — any convex plan polygon, extruded like a box.
   Points follow the box corners' winding ((x,y) → (x+w,y) → (x+w,y+d) →
   (x,y+d)): the outward normal of edge a→b is (by−ay, ax−bx), and a side
   face is visible exactly when that normal has a positive x+y component
   (the camera sits at (+,+,+)). The three-tone law holds: a visible face
   shades 'right' (darkest) when its normal leans +x, 'left' (mid) when
   it leans +y.
--------------------------------------------------------------------------- */

/** A convex plan polygon extruded z..z+h. */
export type IsoPrism = {
  points: readonly Pt2[];
  z: number;
  h: number;
};

type PrismFace = { pts: Pt[]; shade: 'left' | 'right' };

/** Whether plan edge a→b faces the camera. */
function edgeVisible(a: Pt2, b: Pt2): boolean {
  const nx = b[1] - a[1];
  const ny = a[0] - b[0];
  return nx + ny > 0;
}

/** The projected top ring, in plan order. */
export function prismTop(p: IsoPrism): Pt[] {
  return p.points.map(([x, y]) => project(x, y, p.z + p.h));
}

/** The visible side faces, each with its tone per the three-tone law. */
export function prismFaces(p: IsoPrism): PrismFace[] {
  const { points, z, h } = p;
  const faces: PrismFace[] = [];
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    if (!a || !b || !edgeVisible(a, b)) continue;
    const nx = b[1] - a[1];
    const ny = a[0] - b[0];
    faces.push({
      pts: [
        project(a[0], a[1], z + h),
        project(b[0], b[1], z + h),
        project(b[0], b[1], z),
        project(a[0], a[1], z),
      ],
      shade: nx > ny ? 'right' : 'left',
    });
  }
  return faces;
}

/** The visible run of side edges as [start, end] vertex indices, or null
    when no side faces the camera (a flat-on view). */
function visibleRun(points: readonly Pt2[]): [number, number] | null {
  const n = points.length;
  let start = -1;
  for (let i = 0; i < n; i += 1) {
    const prevA = points[(i + n - 1) % n];
    const prevB = points[i];
    const a = points[i];
    const b = points[(i + 1) % n];
    if (!prevA || !prevB || !a || !b) continue;
    if (!edgeVisible(prevA, prevB) && edgeVisible(a, b)) {
      start = i;
      break;
    }
  }
  if (start < 0) return null;
  let end = start;
  for (let i = 0; i < n; i += 1) {
    const a = points[(start + i) % n];
    const b = points[(start + i + 1) % n];
    if (a && b && edgeVisible(a, b)) end = (start + i + 1) % n;
    else break;
  }
  return [start, end];
}

/** The prism's outer edge — the box hexagon, generalized: the top ring
    around the hidden side, the bottom ring under the visible faces. */
export function prismSilhouette(p: IsoPrism): Pt[] {
  const { points, z, h } = p;
  const n = points.length;
  const run = visibleRun(points);
  if (!run) return prismTop(p);
  const [start, end] = run;
  const ring: Pt[] = [];
  /* top ring from the run's end vertex, the long way round, to its start */
  for (let i = end; ; i = (i + 1) % n) {
    const v = points[i];
    if (v) ring.push(project(v[0], v[1], z + h));
    if (i === start) break;
  }
  /* bottom ring forward under the visible faces, back to the end vertex */
  for (let i = start; ; i = (i + 1) % n) {
    const v = points[i];
    if (v) ring.push(project(v[0], v[1], z));
    if (i === end) break;
  }
  return ring;
}

/** The interior vertical edges between adjacent visible faces — the
    box's one front edge, generalized. */
export function prismFrontEdges(p: IsoPrism): [Pt, Pt][] {
  const { points, z, h } = p;
  const n = points.length;
  const run = visibleRun(points);
  if (!run) return [];
  const [start, end] = run;
  const edges: [Pt, Pt][] = [];
  for (let i = (start + 1) % n; i !== end; i = (i + 1) % n) {
    const v = points[i];
    if (v) edges.push([project(v[0], v[1], z + h), project(v[0], v[1], z)]);
  }
  return edges;
}
