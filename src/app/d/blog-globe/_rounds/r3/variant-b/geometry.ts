/* Variant B's drawing as SVG path data: the coastlines (baked from the
   shared land mask in coasts.ts), a 10° graticule, the route between the
   five stops and the cities, projected for any camera and seen through a
   round lens ZOOM times closer than the whole globe. Pure, so the server
   draws the first stop and the engine redraws the same frame on every
   tick. */
import {
  greatCircle,
  type GlobeCamera,
  type LatLon,
} from '@/app/d/blog-globe/_rounds/r3/ortho';
import { STOPS } from '@/app/d/blog-globe/_rounds/r3/stops';
import type { GlobeDisc } from '@/app/d/blog-globe/_rounds/r3/targets';
import { coastRings } from '@/app/d/blog-globe/_rounds/r3/variant-b/coasts';

const RAD = Math.PI / 180;

/** The SVG's square viewBox and the lens inside it, a round window on the globe. */
export const VIEW = 300;
const CX = VIEW / 2;
const CY = VIEW / 2;
const LENS = 148;

/** How much closer than the whole globe the lens sits: the globe's radius is ZOOM lenses, so the lens shows a cap 2 asin(1 / ZOOM) across (47° at 2.5) and the 14° hop from Alexandria to Baghdad crosses most of it. */
export const ZOOM = 2.5;
const R = LENS * ZOOM;

/** The depth (the cosine of a point's angle from the point faced) at the lens's edge, where every line is cut. */
const EDGE = Math.sqrt(1 - 1 / ZOOM ** 2);

/** A city can be clicked while its whole mark, 8 units each way, sits inside the lens: the depth past which it does. */
export const CITY_DEPTH = Math.sqrt(1 - ((LENS - 8) / R) ** 2);

/** One line on the earth as unit vectors, x y z per point. */
type Line = Float64Array;

function toLine(points: readonly LatLon[]): Line {
  const out = new Float64Array(points.length * 3);
  points.forEach(({ lat, lon }, i) => {
    const c = Math.cos(lat * RAD);
    out[i * 3] = c * Math.cos(lon * RAD);
    out[i * 3 + 1] = c * Math.sin(lon * RAD);
    out[i * 3 + 2] = Math.sin(lat * RAD);
  });
  return out;
}

/* ---------- graticule and route ---------- */

const range = (from: number, to: number, by: number) =>
  Array.from(
    { length: Math.round((to - from) / by) + 1 },
    (_, i) => from + i * by
  );

/** Every 10°, sampled every degree so a line stays round through the lens; meridians stop at 80° so they never meet in a starburst at the pole. */
function graticule(): LatLon[][] {
  return [
    ...range(-80, 80, 10).map((lat) =>
      range(-180, 180, 1).map((lon) => ({ lat, lon }))
    ),
    ...range(-180, 170, 10).map((lon) =>
      range(-80, 80, 1).map((lat) => ({ lat, lon }))
    ),
  ];
}

/** Central angle between two places, radians. */
export function angle(a: LatLon, b: LatLon): number {
  const cos =
    Math.sin(a.lat * RAD) * Math.sin(b.lat * RAD) +
    Math.cos(a.lat * RAD) *
      Math.cos(b.lat * RAD) *
      Math.cos((b.lon - a.lon) * RAD);
  return Math.acos(Math.max(-1, Math.min(1, cos)));
}

type Earth = {
  coasts: Line[];
  grid: Line[];
  /** The route's legs, stop i to stop i + 1, sampled about every degree. */
  legs: Line[];
  /** Each leg's samples as cumulative route length, radians from Alexandria. */
  legAt: Float64Array[];
  cities: Line;
};

let earth: Earth | null = null;

/** Built once per page, on first use. */
function getEarth(): Earth {
  if (earth) return earth;
  const legs: Line[] = [];
  const legAt: Float64Array[] = [];
  let length = 0;
  STOPS.slice(1).forEach((stop, i) => {
    const from = STOPS[i]!;
    const theta = angle(from, stop);
    const points = greatCircle(from, stop, Math.max(2, Math.ceil(theta / RAD)));
    legs.push(toLine(points));
    legAt.push(
      Float64Array.from(
        points,
        (_, j) => length + (theta * j) / (points.length - 1)
      )
    );
    length += theta;
  });
  earth = {
    coasts: coastRings().map(toLine),
    grid: graticule().map(toLine),
    legs,
    legAt,
    cities: toLine(STOPS),
  };
  return earth;
}

/** Route length at each stop, radians from Alexandria along the great circles. */
export const ROUTE_AT: readonly number[] = STOPS.reduce<number[]>(
  (at, stop, i) => [
    ...at,
    i === 0 ? 0 : (at[i - 1] ?? 0) + angle(STOPS[i - 1]!, stop),
  ],
  []
);

/** How far along the timeline a route length reaches, in stops: 0 at Alexandria, 4 at Beijing. */
export function stopsAlong(length: number): number {
  const last = ROUTE_AT.length - 1;
  for (let i = 0; i < last; i += 1) {
    const end = ROUTE_AT[i + 1]!;
    if (length <= end) {
      const start = ROUTE_AT[i]!;
      return i + Math.max(0, (length - start) / (end - start));
    }
  }
  return last;
}

/* ---------- the frame ---------- */

/** What the globe shows: the camera, and how much of the route is drawn (radians from Alexandria). */
export type Pose = GlobeCamera & { route: number };

export type Frame = {
  grid: string;
  coast: string;
  route: string;
  /** Each stop's place on the disc, in STOPS order; hidden on the far side. */
  cities: { x: number; y: number; near: boolean }[];
};

/** A tenth of a unit as path text, leading zero dropped: 26 is '2.6', -3 is '-.3'. */
const tenths = (n: number) => `${n / 10}`.replace(/^(-?)0\./, '$1.');

/** Points closer than this to the last one drawn are skipped, in viewBox units. */
const MIN_STEP = 1.5;

type Camera = { sx: number; cx: number; sy: number; cy: number };

/**
 * Writes the runs of a line inside the lens, up to sample `to` (fractional
 * for a route mid-draw), as path data. A run that crosses the lens's edge
 * is cut where it meets it, so lines end on the circle and not short of it.
 */
function trace(line: Line, cam: Camera, to = line.length / 3 - 1): string {
  const last = Math.floor(to);
  let d = '';
  let px = 0;
  let py = 0;
  let pz = 0;
  let open = false;
  // the pen, in tenths of a unit: moves are absolute, lines relative to it
  let penX = 0;
  let penY = 0;
  const moveTo = (x: number, y: number) => {
    penX = Math.round((CX + R * x) * 10);
    penY = Math.round((CY - R * y) * 10);
    d += `M${tenths(penX)} ${tenths(penY)}`;
  };
  const lineTo = (x: number, y: number, force: boolean) => {
    const dx = Math.round((CX + R * x) * 10) - penX;
    const dy = Math.round((CY - R * y) * 10) - penY;
    if (Math.hypot(dx, dy) < (force ? 1 : MIN_STEP * 10)) return;
    const b = tenths(dy);
    d += `l${tenths(dx)}${b.startsWith('-') ? '' : ' '}${b}`;
    penX += dx;
    penY += dy;
  };
  const steps = to > last ? last + 1 : last;
  for (let i = 0; i <= steps; i += 1) {
    let X = line[i * 3]!;
    let Y = line[i * 3 + 1]!;
    let Z = line[i * 3 + 2]!;
    if (i > last) {
      // the fractional tip of a route being drawn
      const f = to - last;
      X = line[last * 3]! + (X - line[last * 3]!) * f;
      Y = line[last * 3 + 1]! + (Y - line[last * 3 + 1]!) * f;
      Z = line[last * 3 + 2]! + (Z - line[last * 3 + 2]!) * f;
    }
    const along = X * cam.cx + Y * cam.sx;
    const x = Y * cam.cx - X * cam.sx;
    const y = cam.cy * Z - cam.sy * along;
    const z = cam.sy * Z + cam.cy * along;
    const near = z > EDGE;
    if (i > 0 && near !== open) {
      // the crossing of the lens's edge, pushed out onto its circle
      const t = (pz - EDGE) / (pz - z);
      const hx = px + (x - px) * t;
      const hy = py + (y - py) * t;
      const h = (Math.hypot(hx, hy) || 1) * ZOOM;
      if (near) moveTo(hx / h, hy / h);
      else lineTo(hx / h, hy / h, true);
    }
    if (near) {
      if (!open && i === 0) moveTo(x, y);
      else lineTo(x, y, i === steps);
    }
    open = near;
    px = x;
    py = y;
    pz = z;
  }
  return d;
}

function camera({ lat0, lon0 }: GlobeCamera): Camera {
  return {
    sx: Math.sin(lon0 * RAD),
    cx: Math.cos(lon0 * RAD),
    sy: Math.sin(lat0 * RAD),
    cy: Math.cos(lat0 * RAD),
  };
}

/** The route as far as `pose.route` reaches, seen from the pose's camera. */
export function drawRoute(pose: Pose): string {
  const { legs, legAt } = getEarth();
  const cam = camera(pose);
  let d = '';
  legs.forEach((leg, i) => {
    const at = legAt[i]!;
    const start = at[0]!;
    if (pose.route <= start) return;
    const end = at[at.length - 1]!;
    const to =
      pose.route >= end
        ? at.length - 1
        : ((pose.route - start) / (end - start)) * (at.length - 1);
    d += trace(leg, cam, to);
  });
  return d;
}

/** The five cities for one pose, in viewBox units to a tenth, and whether each faces the reader (the lens clips the marks it reaches past): the drawing's city marks, without tracing the rest of the frame. */
export function citiesAt(pose: Pose): Frame['cities'] {
  const { cities } = getEarth();
  const cam = camera(pose);
  return STOPS.map((_, i) => {
    const X = cities[i * 3]!;
    const Y = cities[i * 3 + 1]!;
    const Z = cities[i * 3 + 2]!;
    const along = X * cam.cx + Y * cam.sx;
    return {
      x: Math.round((CX + R * (Y * cam.cx - X * cam.sx)) * 10) / 10,
      y: Math.round((CY - R * (cam.cy * Z - cam.sy * along)) * 10) / 10,
      near: cam.sy * Z + cam.cy * along > 0,
    };
  });
}

/** The whole drawing for one pose. */
export function drawFrame(pose: Pose): Frame {
  const { coasts, grid } = getEarth();
  const cam = camera(pose);
  return {
    grid: grid.map((line) => trace(line, cam)).join(''),
    coast: coasts.map((line) => trace(line, cam)).join(''),
    route: drawRoute(pose),
    cities: citiesAt(pose),
  };
}

/** The pose that rests on stop `i`: its city faces the reader and the route reaches it. */
export function poseAt(i: number): Pose {
  const stop = STOPS[i] ?? STOPS[0];
  return { lat0: stop.lat, lon0: stop.lon, route: ROUTE_AT[i] ?? 0 };
}

/** The lens, in viewBox units. */
export const DISC = { cx: CX, cy: CY, r: LENS } as const;

/** The whole globe in CSS px for a drawing `width` px wide, most of it outside the lens: the SVG scales its square viewBox to its box, so the city targets (targets.ts) land on the drawn cities. */
export function discAt(width: number): GlobeDisc {
  const scale = width / VIEW;
  return { cx: CX * scale, cy: CY * scale, radius: R * scale };
}
