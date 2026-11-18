/**
 * The logo read as lines on a sphere, the model both turning loaders share
 * (GtLogoArmillary, and GtLogoAscii's generator, scripts/build/logo-ascii.mjs).
 * It has no imports, so Node's type stripping loads it in the tests and the
 * generator. The ring is the
 * sphere's outline seen face on; the meridian is a ring of radius 96.2566
 * turned 57.81 degrees about the polar (vertical) axis, so it projects to the
 * logo's meridian oval (rx 51.2808); the latitude is a ring of radius 96.2524
 * turned 57.93 degrees about the node (horizontal) axis, so it projects to
 * the latitude oval (ry 51.1104). The stem and the bar lie on those two
 * rings' edge-on circles. Numbers are src/lib/logo-construction.json's
 * motion block, in the logo's 256 unit square, y down.
 *
 * Each ring keeps the logo's own opening as it turns: the meridian is drawn
 * from 128.22 to 412.38 degrees (0 at the north pole, clockwise on screen),
 * which leaves out its stretch through the right node where the bar runs,
 * and the latitude from 180 to 496.47 degrees (0 at the left node, 90 at the
 * top, 180 at the right node), which leaves out the G's mouth between its tip
 * and the right node. A turn is rigid, so the openings turn with
 * their rings.
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
 * component, its tests and the docs. A lap is 3.5 s on the 0.5 s beat grid:
 *
 * - rest, 1.0 s: the still logo, LOGO.d itself;
 * - swing, 2.5 s: the meridian turns once about the polar axis and the
 *   latitude once about the node axis the other way, both easing in and
 *   out, while the ring, the bar and the stem hold still. Each ring keeps
 *   the logo's opening as it turns (the model above).
 *
 * Over and under follow the logo's own crossings: the meridian passes over
 * everything wherever it faces the viewer and under everything wherever it
 * faces away, and the latitude passes over the bar and the stem and under
 * the meridian's near half. The line underneath is cut by the line on top
 * widened by the logo's gap each side. The ring is never cut.
 *
 * At both ends of the swing the turn is a whole number of turns, so the
 * frame's lines lie on the logo's own; the component draws LOGO.d itself
 * whenever `moving` is false, so a host that swaps the resting loader for
 * the still logo changes no pixel.
 */

/** The beats in seconds. */
export const ARMILLARY_BEATS = { rest: 1, swing: 2.5 } as const;

/** One lap in seconds. */
export const ARMILLARY_LAP = ARMILLARY_BEATS.rest + ARMILLARY_BEATS.swing;

/** How far each ring turns in one swing, in degrees: the meridian forward, the latitude back. */
export const ARMILLARY_TURN = { meridian: 360, latitude: -360 } as const;

/** Degrees between the points of a drawn ring. */
const STEP = 2;

export type ArmillaryFrame = {
  /** false on the rest beat, where the component draws LOGO.d */
  moving: boolean;
  /** the swing's progress, 0 to 1 */
  u: number;
  /** the meridian's stretches facing the viewer, as path data */
  meridianFront: string;
  /** the meridian's stretches facing away */
  meridianBack: string;
  /** the latitude */
  latitude: string;
  /** the stretches that cut the bar and the stem: the meridian's near half and the latitude, each away from where it meets the ring (DEEP) */
  standCut: string;
};

/**
 * How far from the sphere's outline, as a share of the radius towards the
 * viewer, a ring must be to cut the bar or the stem. Where the meridian
 * reaches its poles and the latitude its nodes, the ring lies in the
 * outline, where the logo runs the bar and the stem whole into the ring.
 */
const DEEP = 0.3;

const f = (v: number) => Math.round(v * 1000) / 1000;

/** Polylines through the points, split into runs where `keep` holds. */
function runs(points: readonly SpherePoint[], keep: (p: SpherePoint) => boolean): string {
  let d = '';
  let open = false;
  for (const p of points) {
    if (keep(p)) {
      d += `${open ? 'L' : 'M'}${f(p.x)} ${f(p.y)}`;
      open = true;
    } else {
      open = false;
    }
  }
  return d;
}

/** The swing's progress at `u`, 0 to 1, as each ring's angle. */
export function armillaryAngles(u: number): { meridian: number; latitude: number } {
  const e = easeInOut(u);
  return {
    meridian: SPHERE.meridian.rest + ARMILLARY_TURN.meridian * e,
    latitude: SPHERE.latitude.rest + ARMILLARY_TURN.latitude * e,
  };
}

/** The lines at swing progress `u`. */
export function armillaryAt(u: number): ArmillaryFrame {
  const moving = u > 0 && u < 1;
  const a = armillaryAngles(u);
  const m = SPHERE.meridian;
  const l = SPHERE.latitude;
  const meridian = stretch(m.from, m.to, STEP, (t) => meridianPoint(t, a.meridian));
  const latitude = stretch(l.from, l.to, STEP, (t) => latitudePoint(t, a.latitude));
  return {
    moving,
    u,
    meridianFront: runs(meridian, (p) => p.z >= 0),
    meridianBack: runs(meridian, (p) => p.z <= 0),
    latitude: runs(latitude, () => true),
    standCut:
      runs(meridian, (p) => p.z >= DEEP * m.r) + runs(latitude, (p) => Math.abs(p.z) >= DEEP * l.r),
  };
}

/** The frame `t` seconds into the loop. */
export function armillaryFrame(t: number): ArmillaryFrame {
  const s = ((t % ARMILLARY_LAP) + ARMILLARY_LAP) % ARMILLARY_LAP;
  return armillaryAt(s <= ARMILLARY_BEATS.rest ? 0 : (s - ARMILLARY_BEATS.rest) / ARMILLARY_BEATS.swing);
}

/**
 * The meridian and the latitude where the logo draws them, as path data:
 * through the swing the still logo shows everywhere but in these bands,
 * where the bar and the stem are drawn whole and the turning rings take
 * over (the stand).
 */
export const ARMILLARY_REST_LINES: string = (() => {
  const m = SPHERE.meridian;
  const l = SPHERE.latitude;
  const meridian = stretch(m.from, m.to, STEP, (t) => meridianPoint(t, m.rest));
  const latitude = stretch(l.from, l.to, STEP, (t) => latitudePoint(t, l.rest));
  return runs(meridian, () => true) + runs(latitude, () => true);
})();
