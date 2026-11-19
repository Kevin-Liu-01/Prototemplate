import type { GT_LOGO_ARMILLARY } from './GtLogoArmillary.geometry';

/**
 * The logo read as lines on a sphere, the model both turning loaders share
 * (GtLogoArmillary, and GtLogoAscii's generator, scripts/build/logo-ascii.mjs).
 * Its only import is a type, so Node's type stripping loads it in the tests
 * and the generators; the lap's numbers come in as an argument. The ring is the
 * sphere's outline seen face on; the meridian is a ring of radius 96.2566
 * turned 57.81 degrees about the polar (vertical) axis, so it projects to the
 * logo's meridian oval (rx 51.2808); the latitude is a ring of radius 96.2524
 * turned 57.93 degrees about the node (horizontal) axis, so it projects to
 * the latitude oval (ry 51.1104). The stem and the bar lie on those two
 * rings' edge-on circles. Numbers are src/lib/logo-construction.json's
 * motion block, in the logo's 256 unit square, y down.
 *
 * `from` and `to` are the stretch of each ring the logo draws: the meridian
 * from 128.22 to 412.38 degrees (0 at the north pole, clockwise on screen),
 * which leaves out its stretch through the right node where the bar runs,
 * and the latitude from 180 to 496.47 degrees (0 at the left node, 90 at the
 * top, 180 at the right node), which leaves out the G's mouth. The ASCII
 * loader turns those stretches rigidly; the armillary turns whole rings.
 */

const DEG = Math.PI / 180;

/** The ring, the meridian and the latitude: centres, radii, rest angles and the stretch each draws. */
export const SPHERE = {
  centre: [128, 128] as const,
  /** the line weight of the logo, every line */
  weight: 13.2021,
  /** the outer ring's centre line, the sphere's outline */
  ring: 97.099,
  meridian: {
    cx: 127.746,
    cy: 127.5756,
    r: 96.2566,
    /** degrees from the picture plane at rest: acos(51.2808 / 96.2566) */
    rest: Math.acos(51.2808 / 96.2566) / DEG,
    from: 128.22,
    to: 412.38,
  },
  latitude: {
    cx: 127.1509,
    cy: 127.9993,
    r: 96.2524,
    /** degrees from the picture plane at rest: acos(51.1104 / 96.2524) */
    rest: Math.acos(51.1104 / 96.2524) / DEG,
    from: 180,
    to: 496.47,
  },
  /** the gap a line leaves where another passes over it, the mean of the construction's six gaps */
  gap: 5.75,
} as const;

/** A point on a ring: x and y in the 256 unit square, z towards the viewer from the ring's centre plane. */
export type SpherePoint = { x: number; y: number; z: number };

/**
 * A point of the meridian at angle `t` (degrees, 0 at the north pole,
 * clockwise on screen) with the ring turned `a` degrees about the polar
 * axis. At rest its left half faces the viewer (z above 0).
 */
export function meridianPoint(t: number, a: number): SpherePoint {
  const m = SPHERE.meridian;
  const s = Math.sin(t * DEG);
  return { x: m.cx + m.r * s * Math.cos(a * DEG), y: m.cy - m.r * Math.cos(t * DEG), z: -m.r * s * Math.sin(a * DEG) };
}

/**
 * A point of the latitude at angle `t` (degrees, 0 at the left node, 90 at
 * the top) with the ring turned `g` degrees about the node axis. At rest
 * its top half faces the viewer (z above 0).
 */
export function latitudePoint(t: number, g: number): SpherePoint {
  const l = SPHERE.latitude;
  const s = Math.sin(t * DEG);
  return { x: l.cx - l.r * Math.cos(t * DEG), y: l.cy - l.r * s * Math.cos(g * DEG), z: l.r * s * Math.sin(g * DEG) };
}

/** Every `step` degrees of a ring's drawn stretch, its last point included. */
export function stretch(from: number, to: number, step: number, at: (t: number) => SpherePoint): SpherePoint[] {
  const n = Math.max(1, Math.ceil((to - from) / step));
  return Array.from({ length: n + 1 }, (_, i) => at(from + ((to - from) * i) / n));
}

/** Ease in and out, zero speed at both ends: 0 to 1 as u runs 0 to 1. */
export function easeInOut(u: number): number {
  const v = Math.min(1, Math.max(0, u));
  return v * v * v * (v * (6 * v - 15) + 10);
}

/**
 * The armillary loader's frames as a pure function of time, shared by the
 * component, its tests and the docs. A lap is 3.5 s on the 0.5 s beat grid
 * (GtLogoArmillary.geometry.ts, from scripts/build/logo-motion.json):
 *
 * - rest, 0.5 s: the still logo, LOGO.d itself;
 * - open, 0.5 s: GtLogoMotion's loader layers draw the meridian back along
 *   its oval (the hover's course) and the G back from its tip round the
 *   equator into the right node, and land on the stand: the ring, the bar
 *   from its free end and the stem whole;
 * - swing, 2 s: two whole rings at the logo's weight grow out of their
 *   hinges (the meridian out of both poles, the latitude out of both nodes)
 *   as dashes 0 long at the hinge, whole after `grow` seconds, while the
 *   meridian turns a full turn about the polar axis and the latitude a half
 *   turn about the node axis, both easing in and out; in the last `grow`
 *   seconds they shrink back into their hinges. The stand never moves;
 * - close, 0.5 s: open run backward, landing on LOGO.d.
 *
 * Every seam is the logo, the stand, or a dash 0 long, so no hand-off moves
 * a pixel. Over and under follow the logo's own crossings: the meridian
 * passes over everything wherever it faces the viewer and under everything
 * wherever it faces away, and the latitude passes over the bar and the stem
 * and under the meridian's near half. The line underneath is cut by the line
 * on top widened by the logo's gap each side. Near its hinges a ring lies in
 * the sphere's outline, where the logo runs the bar and the stem into the
 * ring, so it cuts them only where it stands DEEP out of the outline. The
 * outer ring is never cut.
 */

/** The lap's numbers, GtLogoArmillary.geometry.ts. */
export type ArmillaryGeometry = typeof GT_LOGO_ARMILLARY;

/** A dash: its length and its start along its path, in the logo's units. */
export type Dash = { len: number; off: number };

/** GtLogoMotion's loader channels in one frame. */
export type ArmillaryChannels = { meridian: Dash; under: Dash; fill: Dash; head: Dash };

/** The swing's rings in one frame, as path data. */
export type ArmillaryRings = {
  /** the meridian's stretches facing the viewer */
  meridianFront: string;
  /** the meridian's stretches facing away */
  meridianBack: string;
  /** the latitude */
  latitude: string;
  /** the stretches that cut the bar and the stem (the meridian's near half and the latitude, away from the outline) */
  standCut: string;
};

export type ArmillaryFrame = {
  phase: 'rest' | 'open' | 'swing' | 'close';
  /** progress through the phase, 0 to 1 */
  x: number;
  /** the loader layers' channels; null on the rest beat, where the component draws LOGO.d */
  channels: ArmillaryChannels | null;
  /** the rings; null outside the swing */
  rings: ArmillaryRings | null;
};

/** Degrees between the points of a drawn ring. */
const STEP = 2;
/** Degrees past whole a growing ring aims for, so its halves close at the nodes with speed (armillaryReach). */
const CLOSE = 6;
/** How far out of the sphere's outline, as a share of the radius, a ring must stand to cut the bar or the stem. */
const DEEP = 0.3;

const f = (v: number) => Math.round(v * 1000) / 1000;

/** A channel's dash at Open progress x, between its stops. */
function at(stops: readonly (readonly number[])[], x: number): Dash {
  if (x <= stops[0][0]) return { len: stops[0][1], off: stops[0][2] };
  for (let i = 1; i < stops.length; i++) {
    const [x1, l1, o1] = stops[i];
    if (x <= x1) {
      const [x0, l0, o0] = stops[i - 1];
      const k = x1 > x0 ? (x - x0) / (x1 - x0) : 1;
      return { len: l0 + (l1 - l0) * k, off: o0 + (o1 - o0) * k };
    }
  }
  const last = stops[stops.length - 1];
  return { len: last[1], off: last[2] };
}

/** The loader layers' channels at Open progress x (Close is 1 - x). */
export function armillaryChannels(A: ArmillaryGeometry, x: number): ArmillaryChannels {
  return { meridian: at(A.open.meridian, x), under: at(A.open.under, x), fill: at(A.open.fill, x), head: at(A.open.head, x) };
}

/**
 * Polylines through the points, split into runs where `keep` holds. A
 * closed ring (`closed`, the whole ring with no point repeated) is read
 * round from a point `keep` drops, so a run over the loop's start stays one
 * run, and a ring `keep` holds whole is one closed path: two butt ends
 * meeting on one point, or overlapping, leave an antialiased seam, a
 * hairline across a cut in the bar.
 */
function runs(points: readonly (SpherePoint | null)[], keep: (p: SpherePoint) => boolean, closed = false): string {
  let list = points;
  if (closed) {
    const k = points.findIndex((p) => !p || !keep(p));
    if (k < 0) return points.map((p, i) => `${i ? 'L' : 'M'}${f((p as SpherePoint).x)} ${f((p as SpherePoint).y)}`).join('') + 'Z';
    list = [...points.slice(k), ...points.slice(0, k)];
  }
  let d = '';
  let open = false;
  for (const p of list) {
    if (p && keep(p)) {
      d += `${open ? 'L' : 'M'}${f(p.x)} ${f(p.y)}`;
      open = true;
    } else {
      open = false;
    }
  }
  return d;
}

/** Each ring's angle at swing progress u, 0 to 1. */
export function armillaryAngles(A: ArmillaryGeometry, u: number): { meridian: number; latitude: number } {
  const e = easeInOut(u);
  return { meridian: SPHERE.meridian.rest + A.turns.meridian * e, latitude: SPHERE.latitude.rest + A.turns.latitude * e };
}

/**
 * How far each ring has grown out of its hinges at swing progress u, in
 * degrees either side of each hinge (90 is whole). The ease aims CLOSE
 * degrees past whole and stops at whole, so the two halves meet at the
 * nodes with speed: eased all the way to 90, they crept together for
 * several frames, and the cut they make through the bar stood open by a
 * pixel or less, a hairline of the bar across the cut.
 */
export function armillaryReach(A: ArmillaryGeometry, u: number): number {
  const g = A.grow / A.beats.swing;
  if (u <= 0 || u >= 1) return 0;
  if (u < g) return Math.min(90, (90 + CLOSE) * easeInOut(u / g));
  if (u > 1 - g) return Math.min(90, (90 + CLOSE) * easeInOut((1 - u) / g));
  return 90;
}

/**
 * The ring's points every STEP degrees, null where it has not grown: within
 * `reach` of either hinge (0 and 180). A whole ring is the loop from -90
 * round to just short of 270 with no point repeated, read as closed.
 */
function grown(reach: number, point: (t: number) => SpherePoint): { points: (SpherePoint | null)[]; closed: boolean } {
  const out: (SpherePoint | null)[] = [];
  if (reach <= 0) return { points: out, closed: false };
  if (reach >= 90) {
    const n = Math.ceil(360 / STEP);
    for (let i = 0; i < n; i++) out.push(point(-90 + (360 * i) / n));
    return { points: out, closed: true };
  }
  for (const hinge of [0, 180]) {
    const n = Math.max(1, Math.ceil((2 * reach) / STEP));
    for (let i = 0; i <= n; i++) out.push(point(hinge - reach + (2 * reach * i) / n));
    out.push(null);
  }
  return { points: out, closed: false };
}

/** The rings at swing progress u. */
export function armillaryRings(A: ArmillaryGeometry, u: number): ArmillaryRings {
  const a = armillaryAngles(A, u);
  const reach = armillaryReach(A, u);
  const m = SPHERE.meridian;
  const l = SPHERE.latitude;
  const meridian = grown(reach, (t) => meridianPoint(t, a.meridian));
  const latitude = grown(reach, (t) => latitudePoint(t, a.latitude));
  const mer = (keep: (p: SpherePoint) => boolean) => runs(meridian.points, keep, meridian.closed);
  const lat = (keep: (p: SpherePoint) => boolean) => runs(latitude.points, keep, latitude.closed);
  return {
    meridianFront: mer((p) => p.z >= 0),
    meridianBack: mer((p) => p.z <= 0),
    latitude: lat(() => true),
    standCut: mer((p) => p.z >= DEEP * m.r) + lat((p) => Math.abs(p.z) >= DEEP * l.r),
  };
}

/** One lap in seconds. */
export function armillaryLap(A: ArmillaryGeometry): number {
  return A.beats.rest + A.beats.open + A.beats.swing + A.beats.close;
}

/** The frame `t` seconds into the lap. */
export function armillaryFrame(A: ArmillaryGeometry, t: number): ArmillaryFrame {
  const lap = armillaryLap(A);
  const s = ((t % lap) + lap) % lap;
  const { rest, open, swing } = A.beats;
  if (s < rest) return { phase: 'rest', x: s / rest, channels: null, rings: null };
  if (s <= rest + open) {
    const x = (s - rest) / open;
    return { phase: 'open', x, channels: armillaryChannels(A, x), rings: null };
  }
  if (s < rest + open + swing) {
    const x = (s - rest - open) / swing;
    return { phase: 'swing', x, channels: armillaryChannels(A, 1), rings: armillaryRings(A, x) };
  }
  const x = Math.min(1, (s - rest - open - swing) / A.beats.close);
  return { phase: 'close', x, channels: armillaryChannels(A, 1 - x), rings: null };
}
