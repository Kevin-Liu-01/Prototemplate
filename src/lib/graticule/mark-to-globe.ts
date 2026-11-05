/**
 * Mark to globe. The mark is the frame of a line globe in which its lines
 * line up as the G and the T. The mark opens into the language-picker
 * globe, the globe turns, and the lines fold back into the G and the T.
 * No pose is ever applied to the mark: each line moves only the way its own
 * family moves on a line globe, the ring never moves, and the far side is
 * never drawn.
 *
 * - The cuts close: each cut piece grows along its own circle until its
 *   line is whole.
 * - The oval straightens: the two halves of the horizontal oval flatten
 *   into the parallels at latitude beta north and south, their crowns fixed
 *   and their ends climbing the ring. The picture is now the language-picker
 *   globe.
 * - The globe turns two meridian spacings: the meridians flow left to right
 *   as one evenly spaced family, while the ring, the equator and the
 *   parallels hold still. No member is drawn past 61 degrees of longitude,
 *   so none runs beside the ring; between 61 and 47 a member grows out of
 *   the equator toward both poles on its way in, and draws back into it on
 *   its way out.
 * - The parallels bend back into the oval, and the cuts open into the mark.
 *
 * The cuts live in time, so the G and the T exist only while every line
 * sits on its rest circle and can never turn, foreshorten or mirror. Each
 * gap shuts where another line crosses it, so its last sliver closes under
 * that line's stroke; a gap with no crossing shuts in its middle.
 *
 * The 7.5 s loop, on the 0.5 s grid, every move on power2.inOut: the mark
 * (0 to 1.5 s), the cuts close (to 2 s), the oval straightens (to 2.5 s),
 * the globe turns (to 4 s), the parallels bend (to 4.5 s), the cuts open
 * (to 5 s), and the mark holds to 7.5 s, where the loop wraps.
 */
import type { Circle, Line, LineName, LinePaths, MarkId, Model, Pt } from './geometry';
import { arcPath, circle, clamp01, DEG, edgeAt, lineDir, model, OVERLAP, parts, polyPath, power2InOut, ringPath, SINK, smooth, zAt, zRoots } from './geometry';

/* ------------------------------------------------------------ the timeline */

type Span = readonly [number, number];
const BEATS = {
  close: [1.5, 2.0],
  straighten: [2.0, 2.5],
  turn: [2.5, 4.0],
  bend: [4.0, 4.5],
  open: [4.5, 5.0],
} as const satisfies Record<string, Span>;
/** The loop's length in seconds: the exact mark from 0 to 1.5 s and from 5 s to the wrap. */
export const DURATION = 7.5;
/** The turn ends on the picture it began on. */
const TURN_SPACINGS = 2;
/** Longitudes: nothing is drawn past the first, and a member is whole inside the second. */
const LIMB = [61, 47] as const;

const ramp = ([a, b]: Span, t: number) => power2InOut((t - a) / (b - a));
const upDown = (up: Span, down: Span, t: number) => (t < down[0] ? ramp(up, t) : 1 - ramp(down, t));

/** How far the cuts are closed (c) and the oval straightened (sigma), each 0 to 1, and how far the meridians have turned (psi, degrees). */
type Amounts = { readonly c: number; readonly sigma: number; readonly psi: number };

function amountsAt(t: number, mark: MarkId): Amounts {
  const T = ((t % DURATION) + DURATION) % DURATION;
  const beta = model(mark).beta;
  const c = upDown(BEATS.close, BEATS.open, T);
  const sigma = upDown(BEATS.straighten, BEATS.bend, T);
  const turning = T > BEATS.turn[0] && T < BEATS.turn[1];
  const psi = turning ? TURN_SPACINGS * beta * ramp(BEATS.turn, T) : 0;
  return { c, sigma, psi };
}

/* ------------------------------------------------------------ helpers */

/** Degrees two closing ends run past each other, so the closed line has no seam. */
const MARGIN = 1.0;
/**
 * Bezier pieces of at most 15 degrees, so a line drawn as one arc and as
 * several overlapping pieces gives the same pixels and the scene can change
 * from one drawing to the other unseen.
 */
const STEP = 15;

/** The part of a circle from t0 to t1 that faces the viewer (z >= 0), as path data with its own moves. */
function frontArc(cir: Circle, t0: number, t1: number): string {
  if (t1 - t0 < 1e-7) return '';
  const ts = [t0, ...zRoots(cir, t0, t1), t1];
  let d = '';
  for (let i = 0; i + 1 < ts.length; i++) {
    if (ts[i + 1] - ts[i] < 1e-7) continue;
    if (zAt(cir, (ts[i] + ts[i + 1]) / 2) >= 0) d += arcPath(cir, ts[i], ts[i + 1], true, STEP);
  }
  return d;
}

/** The stroke of one line from theta lo to hi on its loop, front side only. */
function loopArc(line: Line, lo: number, hi: number): string {
  let d = '';
  for (const [cir, t0, t1] of parts(line, lo, hi)) d += frontArc(cir, t0, t1);
  return d;
}

/** A cut wedge: the end's near corner at theta, the far edge followed from theta to far. */
function wedgePath(line: Line, theta: number, far: number, side: number, sgn: number, h: number): string {
  if (Math.abs(far - theta) < 1e-4) return '';
  const back = theta - sgn * OVERLAP;
  const n = Math.max(2, Math.ceil(Math.abs(far - theta) / 2));
  const pts: Pt[] = [edgeAt(line, back, sgn, -side, h), edgeAt(line, theta, sgn, -side, h)];
  for (let j = n; j >= 0; j--) pts.push(edgeAt(line, theta + ((far - theta) * j) / n, sgn, side, h));
  pts.push(edgeAt(line, back, sgn, side, h));
  return polyPath(pts);
}

/* ------------------------------------------------------------ where each cut closes */

/** Where the other lines cross each line at rest, in its own theta. */
function crossings(M: Model, line: LineName): number[] {
  const s = M.spec.s;
  const x0 = M.spec.x0;
  const R = M.R;
  // a meridian meets the latitude
  const tc = Math.atan(1 / s) / DEG;
  const xs = Math.asin(x0 / R) / DEG;
  const stemR = Math.sqrt(R * R - x0 * x0);
  if (line === 'meridian') return [tc, 90, 180 - tc, 180 + tc, 270, 360 - tc];
  if (line === 'latitude') {
    const u = Math.acos(-x0 / R) / DEG;
    return [tc, u, 180 - tc, 180 + tc, 360 - u, 360 - tc];
  }
  if (line === 'equator') return [-M.beta, xs, M.beta];
  return [-Math.asin((s * R) / stemR) / DEG, 0, Math.asin((s * R) / stemR) / DEG];
}

type Growth = { a: number; b: number };
const GROWTH = new Map<MarkId, ReadonlyMap<string, Growth>>();

/**
 * For each piece, how far (in degrees of its loop) each end grows when the
 * cuts are fully closed. The open lines (the equator, the stem) grow their
 * outer ends to the limb at -90. Two ends that face each other across a gap
 * meet where another line crosses the gap; a gap with no crossing shuts in
 * its middle. An end on the limb at a node (the latitude's start at 180)
 * stays put, and the free end opposite it crosses the whole gap, so no gap
 * shuts on the ring.
 */
function growth(M: Model): ReadonlyMap<string, Growth> {
  const cached = GROWTH.get(M.mark);
  if (cached) return cached;
  const g = new Map<string, Growth>();
  const of = (id: string) => {
    let made = g.get(id);
    if (!made) {
      made = { a: 0, b: 0 };
      g.set(id, made);
    }
    return made;
  };
  const LINE_ORDER: LineName[] = ['meridian', 'latitude', 'equator', 'stem'];
  for (const line of LINE_ORDER) {
    const ps = M.pieces.filter((p) => p.line === line);
    const loop = line === 'meridian' || line === 'latitude';
    const items = ps
      .map((p) => {
        const A = loop ? ((p.a.theta % 360) + 360) % 360 : p.a.theta;
        return { id: p.id, A, B: A + (p.b.theta - p.a.theta) };
      })
      .sort((x, y) => x.A - y.A);
    const cross = crossings(M, line);
    const crossAll = loop ? [...cross, ...cross.map((x) => x + 360)] : cross;
    for (const it of items) g.set(it.id, { a: 0, b: 0 });
    for (let i = 0; i < items.length; i++) {
      const cur = items[i];
      if (loop || i + 1 < items.length) {
        const nx = items[(i + 1) % items.length];
        const nA = nx.A + (i + 1 === items.length ? 360 : 0);
        const fixedStart = line === 'latitude' && Math.abs((nA % 360) - 180) < 1e-6;
        let meet = (cur.B + nA) / 2;
        const inside = crossAll.filter((x) => x > cur.B + 0.5 && x < nA - 0.5).sort((x, y) => Math.abs(x - meet) - Math.abs(y - meet));
        if (inside.length) meet = inside[0];
        if (fixedStart) meet = nA;
        of(cur.id).b = meet - cur.B + MARGIN;
        of(nx.id).a = fixedStart ? 0 : nA - meet + MARGIN;
      } else of(cur.id).b = Math.max(0, 90 - cur.B);
    }
    if (!loop) of(items[0].id).a = Math.max(0, items[0].A + 90);
  }
  GROWTH.set(M.mark, g);
  return g;
}

/* ------------------------------------------------------------ the fillets under the bar, scaled by k (1 at rest) */

/** The rest fillets with their size given directly: as the cuts close the stem runs on up through the bar, the T's junction becomes a crossing, and the fillets shrink to nothing. */
function fillets(M: Model, k: number): string {
  if (k < 0.01) return '';
  const h = M.weight / 2;
  const L = M.lines;
  const eq = L.equator;
  const st = L.stem;
  const thJ = M.fillet.barTheta;
  const du = lineDir(eq, thJ);
  const dv = lineDir(st, 0);
  const u = [du[0], du[1]];
  const v = [dv[0], dv[1]];
  const mSide = -u[1] * v[0] + u[0] * v[1] > 0 ? 1 : -1;
  let d = '';
  for (const { r: r0, dir, b0, dBar, s0, dStem } of M.fillet.sides) {
    if (r0 * k < 0.01) continue;
    const qSide = (-v[1] * u[0] + v[0] * u[1]) * dir > 0 ? 1 : -1;
    const q = [-v[1] * qSide, v[0] * qSide];
    const thB = thJ + b0;
    const thS = s0;
    const e1 = [dir * u[0], dir * u[1]];
    const cosg = Math.max(-0.999, Math.min(0.999, e1[0] * v[0] + e1[1] * v[1]));
    const gA = Math.acos(cosg);
    const stretch = k / Math.tan(gA / 2);
    const thT1 = thB + dBar * stretch;
    const thT2 = thS + dStem * stretch;
    const barEdge = (th: number, sink = SINK) => edgeAt(eq, th, 1, mSide, h - sink);
    const stemEdge = (th: number, sink = SINK) => edgeAt(st, th, 1, qSide, h - sink);
    const QB = barEdge(thB, 0);
    const QS = stemEdge(thS, 0);
    const T1 = barEdge(thT1, 0);
    const T2 = stemEdge(thT2, 0);
    const d1 = lineDir(eq, thT1);
    const d2 = lineDir(st, thT2);
    const lenB = Math.hypot(T1[0] - QB[0], T1[1] - QB[1]);
    const lenS = Math.hypot(T2[0] - QS[0], T2[1] - QS[1]);
    const kk = (4 / 3) * Math.tan((Math.PI - gA) / 4) * Math.tan(gA / 2);
    const C1 = [T1[0] - dir * d1[0] * kk * lenB, T1[1] - dir * d1[1] * kk * lenB];
    const C2 = [T2[0] - d2[0] * kk * lenS, T2[1] - d2[1] * kk * lenS];
    const PB = barEdge(thB);
    const PS = stemEdge(thS);
    const pts: Pt[] = [[(PB[0] + PS[0]) / 2 - SINK * q[0], (PB[1] + PS[1]) / 2 - SINK * q[1]]];
    for (let j = 1; j <= 4; j++) pts.push(barEdge(thB + ((thT1 - thB) * j) / 4));
    pts.push(T1);
    for (let j = 1; j <= 16; j++) {
      const s = j / 16;
      const w = 1 - s;
      pts.push([
        w * w * w * T1[0] + 3 * w * w * s * C1[0] + 3 * w * s * s * C2[0] + s * s * s * T2[0],
        w * w * w * T1[1] + 3 * w * w * s * C1[1] + 3 * w * s * s * C2[1] + s * s * s * T2[1],
      ]);
    }
    for (let j = 4; j >= 1; j--) pts.push(stemEdge(thS + ((thT2 - thS) * j) / 4));
    d += polyPath(pts);
  }
  return d;
}

const RINGS = new Map<MarkId, string>();
function ring(M: Model): string {
  const cached = RINGS.get(M.mark);
  if (cached) return cached;
  const made = ringPath(M.R, STEP);
  RINGS.set(M.mark, made);
  return made;
}

/* ------------------------------------------------------------ the mark with its cuts closed by c (0 is the mark) */

/** Every piece keeps its rest circle. Each end grows along its circle by c times its share of the gap, carrying its cut end with it; the cut's slant shortens to square as the end closes. */
function cutPicture(M: Model, c: number): LinePaths {
  const h = M.weight / 2;
  const G = growth(M);
  const L = M.lines;
  let stroke = ring(M);
  let fill = '';
  for (const p of M.pieces) {
    const line = L[p.line];
    const g = G.get(p.id) ?? { a: 0, b: 0 };
    const lo = p.a.theta - c * g.a;
    const hi = p.b.theta + c * g.b;
    stroke += loopArc(line, lo, hi);
    if (p.a.wedge) fill += wedgePath(line, lo, lo + (p.a.wedge.far - p.a.theta) * (1 - c), p.a.wedge.side, -1, h);
    if (p.b.wedge) fill += wedgePath(line, hi, hi + (p.b.wedge.far - p.b.theta) * (1 - c), p.b.wedge.side, 1, h);
  }
  fill += fillets(M, 1 - smooth(0, 0.6, c));
  return { stroke, fill };
}

/* ------------------------------------------------------------ the line globe: straightened by sigma, turned by psi */

/** The meridian at longitude lam, north pole (t = 0) to south pole (t = 180); with x0, the circle in the plane x0 off centre and parallel to it. */
function meridianCircle(M: Model, lam: number, x0: number): Circle {
  const sl = Math.sin(lam * DEG);
  const cl = Math.cos(lam * DEG);
  return circle([x0 * cl, 0, -x0 * sl], Math.sqrt(M.R * M.R - x0 * x0), [0, -1, 0], [sl, 0, cl]);
}

/**
 * Where a member between 61 and 47 degrees is drawn to: |y| <= Y, in two
 * power2.inOut steps: from 0 (under the equator's stroke) to the parallel
 * at beta, a rest with the ends under the parallels' strokes, then on to
 * R - h. v is the place in the window, 0 at 61 degrees and 1 at 47; the
 * steps are where the first step starts, where it ends, and where the
 * second starts.
 */
const LIMB_STEPS = [0.3, 0.65, 0.7] as const;
function limbLevel(M: Model, v: number): number {
  const h = M.weight / 2;
  const Yp = M.R * Math.sin(M.beta * DEG);
  const [s0, s1, s2] = LIMB_STEPS;
  if (v <= s0) return 0;
  if (v < s1) return Yp * power2InOut((v - s0) / (s1 - s0));
  if (v < s2) return Yp;
  return Yp + (M.R - h - Yp) * power2InOut((v - s2) / (1 - s2));
}

/**
 * A member of the meridian family at longitude lam. Inside 47 degrees it is
 * whole; past 61 nothing is drawn. Between the two it grows out of the
 * equator toward both poles, its two ends cut level, parallel to the
 * equator and the parallels, so each end slides under them flush.
 */
function memberPaths(M: Model, lam: number, x0: number): LinePaths {
  const a = Math.abs(lam);
  if (a >= LIMB[0]) return { stroke: '', fill: '' };
  const cir = meridianCircle(M, lam, x0);
  if (a <= LIMB[1]) return { stroke: arcPath(cir, 0, 180, true, STEP), fill: '' };
  const h = M.weight / 2;
  const Y = limbLevel(M, (LIMB[0] - a) / (LIMB[0] - LIMB[1]));
  if (Y < 1e-3) return { stroke: '', fill: '' };
  const line: Line = { loop: [cir] };
  const edgeY = (t: number, e: number) => edgeAt(line, t, 1, e, h)[1];
  // where each edge reaches the level y = -Y on the north half; both edges rise monotonically from the pole
  const meet = (e: number) => {
    let lo = 0;
    let hi = 90;
    for (let i = 0; i < 48; i++) {
      const m = (lo + hi) / 2;
      if (edgeY(m, e) + Y < 0) lo = m;
      else hi = m;
    }
    return (lo + hi) / 2;
  };
  const tp = meet(1);
  const tm = meet(-1);
  const eN = tp > tm ? 1 : -1;
  const tN = Math.max(tp, tm);
  const tF = Math.min(tp, tm);
  // the north end: the stroke runs square to the near corner, and a wedge carries the far edge on to the far corner
  const back = Math.min(90, tN + OVERLAP);
  const n = Math.max(2, Math.ceil(tN - tF));
  const pts: Pt[] = [edgeAt(line, back, 1, eN, h), edgeAt(line, tN, 1, eN, h)];
  for (let j = 0; j <= n; j++) pts.push(edgeAt(line, tF + ((tN - tF) * j) / n, 1, -eN, h));
  pts.push(edgeAt(line, back, 1, -eN, h));
  // the south end is the north end's mirror in the equator
  const south = pts.map((p) => [p[0], -p[1]]);
  return { stroke: arcPath(cir, tN, 180 - tN, true, STEP), fill: polyPath(pts) + polyPath(south) };
}

/**
 * The latitude's half (north: the upper arch) as the parallel at latitude
 * phi tipped by a about the left and right axis. At (phi, a) = (0, beta) it
 * is the mark's arch, at (beta, 0) the parallel at beta seen edge-on; on the
 * way the crown stays at its height and the ends ride the limb.
 */
function archCircle(M: Model, north: boolean, sigma: number): Circle {
  const b = M.beta;
  const phi = sigma * b * DEG;
  const a = (1 - sigma) * b * DEG;
  const y = north ? -1 : 1;
  return circle([0, y * M.R * Math.sin(phi) * Math.cos(a), -M.R * Math.sin(phi) * Math.sin(a)], M.R * Math.cos(phi), [-1, 0, 0], [0, y * Math.sin(a), Math.cos(a)]);
}

function globePicture(M: Model, sigma: number, psi: number): LinePaths {
  const b = M.beta;
  // jaw's stem slides onto the central meridian as the oval straightens
  const x0 = M.spec.x0 * (1 - sigma);
  let stroke = ring(M);
  let fill = '';
  // the meridians: the family k beta + psi. At psi = 0 the members k = -1, 0 and 1 are the oval's halves and the
  // central meridian, and k = -2 and 2 lie past 61 degrees, so they are not drawn
  for (let k = -6; k <= 6; k++) {
    const m = memberPaths(M, k * b + psi, k === 0 ? x0 : 0);
    stroke += m.stroke;
    fill += m.fill;
  }
  // the equator, and the oval's halves straightening into the parallels at beta north and south
  stroke += arcPath(circle([0, 0, 0], M.R, [0, 0, 1], [1, 0, 0]), -90, 90, true, STEP);
  for (const north of [true, false]) stroke += frontArc(archCircle(M, north, sigma), 0, 180);
  return { stroke, fill };
}

/**
 * The picture for any amounts of the three moves: c closes the cuts (0 the
 * mark, 1 whole lines); sigma straightens the oval once c is 1; psi turns
 * the meridians, in degrees, once sigma is 1. The picture repeats every
 * meridian spacing (beta), so psi can count on without bound.
 */
function picture(M: Model, { c, sigma, psi }: Amounts): LinePaths {
  const k = clamp01(c);
  const sg = k < 1 ? 0 : clamp01(sigma);
  const ps = sg < 1 ? 0 : ((psi % M.beta) + M.beta) % M.beta;
  return sg > 0 || ps > 0 ? globePicture(M, sg, ps) : cutPicture(M, k);
}

const STILLS = new Map<MarkId, LinePaths>();

/** The rest mark: every hold, and the designed still under reduced motion. */
export function still(mark: MarkId): LinePaths {
  const cached = STILLS.get(mark);
  if (cached) return cached;
  const made = cutPicture(model(mark), 0);
  STILLS.set(mark, made);
  return made;
}

/** The frame at t seconds, wrapped to the loop: a pure function of time. */
export function frameAt(t: number, mark: MarkId): LinePaths {
  const amounts = amountsAt(t, mark);
  // with every cut open the picture is the rest mark, whatever the other amounts
  if (amounts.c <= 0) return still(mark);
  return picture(model(mark), amounts);
}
