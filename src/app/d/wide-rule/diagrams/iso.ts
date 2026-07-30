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
