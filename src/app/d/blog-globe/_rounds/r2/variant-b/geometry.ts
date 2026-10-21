/* Variant B's drawing as SVG path data: the coastlines (baked from the
   shared land mask in coasts.ts), a 30° graticule, the route between the
   five stops and the cities, projected for any camera. Pure, so the server
   draws the first stop and the engine redraws the same frame on every
   tick. */
import {
  greatCircle,
  type GlobeCamera,
  type LatLon,
} from '@/app/d/blog-globe/_rounds/r2/ortho';
import { STOPS } from '@/app/d/blog-globe/_rounds/r2/stops';
import type { GlobeDisc } from '@/app/d/blog-globe/_rounds/r2/targets';
import { coastRings } from '@/app/d/blog-globe/_rounds/r2/variant-b/coasts';

const RAD = Math.PI / 180;

/** The SVG's square viewBox and the disc inside it, leaving room for the route's doubled line at the limb. */
export const VIEW = 320;
const CX = VIEW / 2;
const CY = VIEW / 2;
const R = 148;

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

/** Meridians stop at 75° so they never meet in a starburst at the pole. */
function graticule(): LatLon[][] {
  return [
    ...[-60, -30, 0, 30, 60].map((lat) =>
      range(-180, 180, 3).map((lon) => ({ lat, lon }))
    ),
    ...range(-180, 150, 30).map((lon) =>
      range(-75, 75, 3).map((lat) => ({ lat, lon }))
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
 * Writes the near-side runs of a line, up to sample `to` (fractional for a
 * route mid-draw), as path data. A run that crosses the horizon is cut
 * where it meets the limb, so lines end on the circle and not short of it.
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
    const near = z > 0;
    if (i > 0 && near !== open) {
      // the horizon crossing, pushed out onto the limb
      const t = pz / (pz - z);
      const hx = px + (x - px) * t;
      const hy = py + (y - py) * t;
      const h = Math.hypot(hx, hy) || 1;
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

/** The five cities for one pose, in viewBox units to a tenth, and whether each faces the reader: the drawing's city marks, without tracing the rest of the frame. */
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

export const DISC = { cx: CX, cy: CY, r: R } as const;

/** The drawn disc in CSS px for a drawing `width` px wide: the SVG scales its square viewBox to its box, so the city targets (targets.ts) land on the drawn cities. */
export function discAt(width: number): GlobeDisc {
  const scale = width / VIEW;
  return { cx: CX * scale, cy: CY * scale, radius: R * scale };
}
