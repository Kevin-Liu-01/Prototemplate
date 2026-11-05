/**
 * Globe lean. The mark is a line globe made of two pencils of great circles
 * that share the ring as their outline.
 *
 * - The vertical pencil turns about the pole axis (y): the meridian oval's
 *   two sides at longitude +beta and -beta, and the stem at longitude 0
 *   (jaw's stem is the circle parallel to it, 1.812 units left). Every line
 *   in it runs from the north pole to the south pole, where it meets the
 *   ring.
 * - The horizontal pencil turns about the left-right axis (x): the
 *   latitude's upper half at inclination +beta, its lower half at -beta,
 *   and the bar (the equator) at 0. Every line in it runs from the left node
 *   to the right node.
 *
 * A tilt { x, y } in degrees turns each pencil about its own axis only: the
 * vertical pencil by x (the face turns right), the horizontal pencil by y
 * (the face turns up). A rotation about a pencil's axis maps the pencil
 * onto itself and fixes its two nodes, so the ring never moves, every line
 * keeps both of its ends where it meets the ring, and only its bow changes.
 * No line reaches face-on inside the reach, so nothing goes behind the
 * globe and no letter mirrors.
 *
 * The cuts live on the crossings. Each gap is defined against the line it
 * clears, as a distance from that line's centreline, and is solved again
 * every frame, so a gap rides its crossing at its rest width as both lines
 * bow. The G's free end keeps its rest clearance from the ring, and the V
 * notch and the fillets are built where the bar and the stem cross in the
 * current frame.
 *
 * The 7.5 s loop, on the 0.5 s grid: the exact mark (0 to 1 s), the face
 * turns down and the bar opens into a smile (1 to 2 s), a hold, the tilt
 * goes once round the mark's reach (2.5 to 5.5 s), a hold, both pencils
 * turn back to rest (6 to 7 s), and the exact mark again (7 to 7.5 s), where
 * the loop wraps. Heavy turns 12 degrees each way and jaw 5.25, and the
 * pitch stops where the G's flatter arc keeps 85 percent of its rise.
 */
import type { End, Field, Line, LineName, LinePaths, MarkId, Model, Pt } from './geometry';
import { arcPath, bisect, DEG, edgeAt, ellipseG, ellipseSdist, lineAt, lineDir, model, OVERLAP, parts, polyPath, power2InOut, ringPath, SINK, smooth, wedgeEnd } from './geometry';

/* ------------------------------------------------------------ the rest model */

type Rest = {
  readonly m: Model;
  readonly h: number;
  /** the radius of the G's free end's outer corner at rest, which every frame keeps: its clearance from the ring */
  readonly endRadius: number;
  /** the V notch's apex below the bar's centreline (jaw) */
  readonly yApex: number;
  readonly ring: string;
};

const cornerRadius = (line: Line, th: number, h: number) => Math.max(...[1, -1].map((e) => Math.hypot(...edgeAt(line, th, 1, e, h))));

const RESTS = new Map<MarkId, Rest>();

function rest(mark: MarkId): Rest {
  const cached = RESTS.get(mark);
  if (cached) return cached;
  const m = model(mark);
  const S = m.spec;
  const h = m.weight / 2;
  const endTheta = S.mark === 'heavy' ? S.endTheta : 360 + Math.acos(-S.xEnd / m.R) / DEG;
  const made: Rest = {
    m,
    h,
    endRadius: cornerRadius(m.lines.latitude, endTheta, h),
    yApex: S.mark === 'jaw' ? -h + S.notch.depth : 0,
    ring: ringPath(m.R),
  };
  RESTS.set(mark, made);
  return made;
}

/* ------------------------------------------------------------ the current frame's lines and fields */

type Matrix = readonly Pt[];
const rotX = (a: number): Matrix => {
  const c = Math.cos(a * DEG);
  const s = Math.sin(a * DEG);
  return [
    [1, 0, 0],
    [0, c, s],
    [0, -s, c],
  ];
};
const rotY = (a: number): Matrix => {
  const c = Math.cos(a * DEG);
  const s = Math.sin(a * DEG);
  return [
    [c, 0, s],
    [0, 1, 0],
    [-s, 0, c],
  ];
};
const apply = (M: Matrix, p: Pt) => [
  M[0][0] * p[0] + M[0][1] * p[1] + M[0][2] * p[2],
  M[1][0] * p[0] + M[1][1] * p[1] + M[1][2] * p[2],
  M[2][0] * p[0] + M[2][1] * p[1] + M[2][2] * p[2],
];
const turned = (M: Matrix, line: Line): Line => ({ loop: line.loop.map((c) => ({ C: apply(M, c.C), r: c.r, u: apply(M, c.u), v: apply(M, c.v) })) });

/** A tilt in degrees: x turns the vertical pencil (positive turns the face right), y the horizontal pencil (positive turns the face up). */
export type Tilt = { readonly x: number; readonly y: number };

type Fields = {
  /** the signed distance to the latitude, negative inside, and its implicit form */
  readonly sdLat: Field;
  readonly gLat: Field;
  /** the same for the meridian oval */
  readonly sdMer: Field;
  readonly gMer: Field;
  /** the distance below the bar along its normal, to first order */
  readonly dEq: Field;
  /** the distance right of the stem */
  readonly offStem: Field;
};
type Current = { readonly L: Record<LineName, Line>; readonly F: Fields; readonly tJ: number; readonly J: Pt; readonly thJ: number; readonly h: number };

function current(r: Rest, tilt: Tilt): Current {
  const tx = tilt.x || 0;
  const ty = tilt.y || 0;
  const { m, h } = r;
  const { R, beta, spec: S, lines } = m;
  const stemR = m.fillet.stemR;
  const vertical = rotY(tx);
  const horizontal = rotX(-ty);
  const L: Record<LineName, Line> = {
    meridian: turned(vertical, lines.meridian),
    latitude: turned(horizontal, lines.latitude),
    equator: turned(horizontal, lines.equator),
    stem: turned(vertical, lines.stem),
  };
  // each half of each oval is half of a centred, axis-aligned ellipse; its semi-axis across is R sin(angle)
  const bU = R * Math.sin((beta + ty) * DEG);
  const bD = R * Math.sin((beta - ty) * DEG);
  const aR = R * Math.sin((beta + tx) * DEG);
  const aL = R * Math.sin((beta - tx) * DEG);
  const sdU = ellipseSdist(R, bU);
  const sdD = ellipseSdist(R, bD);
  const sdR = ellipseSdist(aR, R);
  const sdLf = ellipseSdist(aL, R);
  const gU = ellipseG(R, bU);
  const gD = ellipseG(R, bD);
  const gR = ellipseG(aR, R);
  const gLf = ellipseG(aL, R);
  // the bar is the graph y = -sin(ty) sqrt(R^2 - x^2)
  const sy = Math.sin(ty * DEG);
  // the stem is the graph x = x0 cos(tx) + sin(tx) sqrt(rs^2 - y^2)
  const sx = Math.sin(tx * DEG);
  const cx0 = S.x0 * Math.cos(tx * DEG);
  const F: Fields = {
    sdLat: (p) => (p[1] <= 0 ? sdU(p) : sdD(p)),
    gLat: (p) => (p[1] <= 0 ? gU(p) : gD(p)),
    sdMer: (p) => (p[0] >= 0 ? sdR(p) : sdLf(p)),
    gMer: (p) => (p[0] >= 0 ? gR(p) : gLf(p)),
    dEq: (p) => {
      const x = Math.max(-R + 1e-6, Math.min(R - 1e-6, p[0]));
      const q = Math.sqrt(R * R - x * x);
      const de = (sy * x) / q;
      return (p[1] + sy * q) / Math.sqrt(1 + de * de);
    },
    offStem: (p) => {
      const y = Math.max(-stemR + 1e-6, Math.min(stemR - 1e-6, p[1]));
      const q = Math.sqrt(stemR * stemR - y * y);
      const ds = (-sx * y) / q;
      return (p[0] - cx0 - sx * q) / Math.sqrt(1 + ds * ds);
    },
  };
  // the junction: where the stem's centreline crosses the bar's, as a theta on each
  const tJ = bisect((t) => F.dEq(lineAt(L.stem, t)), -60, 60);
  const J = lineAt(L.stem, tJ);
  const thJ = Math.asin(J[0] / R) / DEG;
  return { L, F, tJ, J, thJ, h };
}

/* ------------------------------------------------------------ the ends, solved against the current frame */

/**
 * at: a square end at a fixed theta (only the nodes on the ring). join:
 * square, where the centreline crosses g = 0. ring: square, where the
 * outer corner reaches that radius (the G's free end). cut: the cut edge is
 * the curve F = 0, F < 0 on the piece's side, ending in a wedge.
 */
type LeanEnd =
  | { readonly kind: 'at'; readonly at: number }
  | { readonly kind: 'join'; readonly join: Field; readonly lo: number; readonly hi: number }
  | { readonly kind: 'ring'; readonly ring: number; readonly lo: number; readonly hi: number }
  | { readonly kind: 'cut'; readonly cut: Field; readonly seed: number };
const at = (theta: number): LeanEnd => ({ kind: 'at', at: theta });
const join = (g: Field, lo: number, hi: number): LeanEnd => ({ kind: 'join', join: g, lo, hi });
const cut = (F: Field, seed: number): LeanEnd => ({ kind: 'cut', cut: F, seed });

/** sgn is +1 at a piece's end and -1 at its start. A cut walks out from its seed a degree at a time to where its edge is crossed, then bisects. */
function solveEnd(line: Line, end: LeanEnd, sgn: number, h: number): End {
  if (end.kind === 'at') return { theta: end.at, wedge: null };
  if (end.kind === 'join') {
    const g = end.join;
    return { theta: bisect((th) => g(lineAt(line, th)), end.lo, end.hi, 48), wedge: null };
  }
  if (end.kind === 'ring') {
    const radius = end.ring;
    return { theta: bisect((th) => cornerRadius(line, th, h) - radius, end.lo, end.hi, 48), wedge: null };
  }
  const F = end.cut;
  // a piece holds a single crossing of each cut, and the seed is the point of the piece farthest inside both of its cuts
  const meet = (e: number) => {
    const Fn = (th: number) => F(edgeAt(line, th, sgn, e, h));
    let a = end.seed;
    let fa = Fn(a);
    if (fa > 0) throw new Error('graticule: a cut seed lies outside its piece');
    let b = a + sgn;
    let fb = Fn(b);
    let n = 0;
    while (fb <= 0) {
      a = b;
      fa = fb;
      b += sgn;
      fb = Fn(b);
      if (++n > 720) throw new Error('graticule: a cut never meets its line');
    }
    return bisect(Fn, a, b, 40, fa);
  };
  return wedgeEnd(meet(1), meet(-1), end.seed, sgn);
}

/** The theta in [lo, hi] where f is least: 24 samples, then a golden-section refinement around the best. */
function deepest(f: (t: number) => number, lo: number, hi: number): number {
  let best = lo;
  let fb = Infinity;
  for (let i = 0; i <= 24; i++) {
    const t = lo + ((hi - lo) * i) / 24;
    const v = f(t);
    if (v < fb) {
      fb = v;
      best = t;
    }
  }
  let a = Math.max(lo, best - (hi - lo) / 24);
  let b = Math.min(hi, best + (hi - lo) / 24);
  for (let k = 0; k < 30; k++) {
    const m1 = a + (b - a) * 0.382;
    const m2 = a + (b - a) * 0.618;
    if (f(m1) < f(m2)) b = m2;
    else a = m1;
  }
  return (a + b) / 2;
}

/* ------------------------------------------------------------ the pieces, solved against the current frame */

type PieceSpec = { line: LineName; a: LeanEnd; b: LeanEnd };

function pieceSpecs(r: Rest, cur: Current): PieceSpec[] {
  const { m, h } = r;
  const S = m.spec;
  const { F, L, J, thJ } = cur;
  const eqAtX = (x: number) => Math.asin(Math.max(-1, Math.min(1, x / m.R))) / DEG;
  const cross = (line: LineName, g: Field, lo: number, hi: number) => bisect((th) => g(lineAt(L[line], th)), lo, hi);
  if (S.mark === 'heavy') {
    const outL: Field = (p) => h + S.gap - F.sdLat(p);
    const outM: Field = (p) => h + S.gap - F.sdMer(p);
    return [
      { line: 'meridian', a: join(F.gLat, 90, 180), b: cut(outL, 361) },
      { line: 'latitude', a: cut(outM, 359), b: cut(outM, 361) },
      { line: 'latitude', a: join(F.gMer, 0, 90), b: { kind: 'ring', ring: r.endRadius, lo: 95, hi: 179.5 } },
      { line: 'latitude', a: at(180), b: join(F.gMer, 270, 360) },
      { line: 'equator', a: join(F.gMer, -90, 0), b: at(90) },
      { line: 'stem', a: join(F.dEq, -60, 60), b: at(90) },
    ];
  }
  const { depth, half } = S.notch;
  const outU: Field = (p) => h + S.gapUpper - F.sdLat(p);
  const outLow: Field = (p) => h + S.gapLower - F.sdLat(p);
  const stubTop: Field = (p) => F.sdLat(p) + h + S.gapStubTop;
  const stubFoot: Field = (p) => F.dEq(p) + h + S.gapStubFoot;
  const jawFoot: Field = (p) => F.sdLat(p) + h + S.gapLower;
  const stemLeft: Field = (p) => F.offStem(p) + h + S.latGapLeft;
  const stemRight: Field = (p) => h + S.latGapRight - F.offStem(p);
  // the V notch in the bar's top edge, in the frame of the bar at the junction: lx along the bar, ly down its normal
  const u = lineDir(L.equator, thJ);
  const n = [-u[1], u[0]];
  const loc = (p: Pt) => [(p[0] - J[0]) * u[0] + (p[1] - J[1]) * u[1], (p[0] - J[0]) * n[0] + (p[1] - J[1]) * n[1]];
  const notchL: Field = (p) => {
    const [lx, ly] = loc(p);
    return depth * (lx + half) - half * (ly + h);
  };
  const notchR: Field = (p) => {
    const [lx, ly] = loc(p);
    return depth * (half - lx) - half * (ly + h);
  };
  // seeds: the point of each piece farthest inside both of its cuts, found between the crossings that bound it
  const thUp = cross('meridian', F.gLat, 0, 90);
  const thEqM = cross('meridian', F.dEq, 20, 160);
  const stubWorst = (th: number) => {
    let worst = -Infinity;
    for (const e of [1, -1]) {
      const p = edgeAt(L.meridian, th, 1, e, h);
      worst = Math.max(worst, stubTop(p), stubFoot(p));
    }
    return worst;
  };
  const stubSeed = deepest(stubWorst, thUp, thEqM);
  // where the stem crosses the lower latitude
  const thStem = cross('latitude', F.offStem, 200, 340);
  const yApex = r.yApex;
  return [
    { line: 'meridian', a: cut(outU, 359), b: cut(outU, 361) },
    { line: 'meridian', a: join(F.gLat, 180, 270), b: join(F.gLat, 270, 360) },
    { line: 'meridian', a: join(F.gLat, 90, 180), b: cut(outLow, 181) },
    { line: 'meridian', a: cut(stubTop, stubSeed), b: cut(stubFoot, stubSeed) },
    { line: 'meridian', a: join(F.dEq, 20, 160), b: cut(jawFoot, thEqM + 0.5) },
    { line: 'latitude', a: cut(stemLeft, (thStem + 360) / 2), b: { kind: 'ring', ring: r.endRadius, lo: 455, hi: 539.5 } },
    { line: 'latitude', a: at(180), b: cut(stemRight, (thStem + 180) / 2) },
    { line: 'equator', a: join(F.gMer, -90, 0), b: cut(notchL, eqAtX(J[0] - half - 10)) },
    { line: 'equator', a: cut(notchR, eqAtX(J[0] + half + 10)), b: at(90) },
    { line: 'stem', a: yApex > 0 ? join((p) => F.dEq(p) - yApex, -60, 60) : join(F.dEq, -60, 60), b: at(90) },
  ];
}

/* ------------------------------------------------------------ the picture */

/** The fillets under the bar at the stem's top, built at the current junction. */
function fillets(r: Rest, cur: Current): string {
  const { L, h, tJ, thJ } = cur;
  const { sides, ku, kv } = r.m.fillet;
  const eq = L.equator;
  const st = L.stem;
  const du = lineDir(eq, thJ);
  const dv = lineDir(st, tJ);
  if (!(du[2] > 1e-6 && dv[2] > 1e-6)) return '';
  const u = [du[0], du[1]];
  const v = [dv[0], dv[1]];
  const cr = u[0] * v[1] - u[1] * v[0];
  // the fillets fade out as the two lines turn toward parallel or toward the viewer
  const fade = smooth(0.35, 0.6, Math.abs(cr)) * smooth(0.02, 0.1, Math.min(du[2] / ku, dv[2] / kv));
  const mSide = -u[1] * v[0] + u[0] * v[1] > 0 ? 1 : -1;
  let out = '';
  for (const { r: r0, dir, b0, dBar, s0, dStem } of sides) {
    const k = fade;
    if (r0 * k < 0.01) continue;
    const qSide = (-v[1] * u[0] + v[0] * u[1]) * dir > 0 ? 1 : -1;
    const q = [-v[1] * qSide, v[0] * qSide];
    const thB = thJ + b0;
    const thS = tJ + s0;
    const e1 = [dir * u[0], dir * u[1]];
    const cosg = Math.max(-0.999, Math.min(0.999, e1[0] * v[0] + e1[1] * v[1]));
    const g = Math.acos(cosg);
    // the tangent distance, against rest's r
    const stretch = k / Math.tan(g / 2);
    const thT1 = thB + dBar * stretch;
    const thT2 = thS + dStem * stretch;
    // the sides the fillet shares with the two strokes sit SINK inside them; the arc's two ends sit on the true edges
    const barEdge = (th: number, sink = SINK) => edgeAt(eq, th, 1, mSide, h - sink);
    const stemEdge = (th: number, sink = SINK) => edgeAt(st, th, 1, qSide, h - sink);
    const QB = barEdge(thB, 0);
    const QS = stemEdge(thS, 0);
    const T1 = barEdge(thT1, 0);
    const T2 = stemEdge(thT2, 0);
    const d1 = lineDir(eq, thT1);
    const d2 = lineDir(st, thT2);
    // the arc: tangent to the bar's edge at T1 and to the stem's edge at T2, a circular quarter at rest
    const lenB = Math.hypot(T1[0] - QB[0], T1[1] - QB[1]);
    const lenS = Math.hypot(T2[0] - QS[0], T2[1] - QS[1]);
    const kk = (4 / 3) * Math.tan((Math.PI - g) / 4) * Math.tan(g / 2);
    const C1 = [T1[0] - dir * d1[0] * kk * lenB, T1[1] - dir * d1[1] * kk * lenB];
    const C2 = [T2[0] - d2[0] * kk * lenS, T2[1] - d2[1] * kk * lenS];
    const PB = barEdge(thB);
    const PS = stemEdge(thS);
    const pts: Pt[] = [[(PB[0] + PS[0]) / 2 - SINK * q[0], (PB[1] + PS[1]) / 2 - SINK * q[1]]];
    for (let j = 1; j <= 4; j++) pts.push(barEdge(thB + ((thT1 - thB) * j) / 4));
    pts.push(T1);
    for (let j = 1; j <= 16; j++) {
      const t = j / 16;
      const s = 1 - t;
      pts.push([
        s * s * s * T1[0] + 3 * s * s * t * C1[0] + 3 * s * t * t * C2[0] + t * t * t * T2[0],
        s * s * s * T1[1] + 3 * s * s * t * C1[1] + 3 * s * t * t * C2[1] + t * t * t * T2[1],
      ]);
    }
    for (let j = 4; j >= 1; j--) pts.push(stemEdge(thS + ((thT2 - thS) * j) / 4));
    out += polyPath(pts);
  }
  return out;
}

function solvePicture(mark: MarkId, tilt: Tilt): LinePaths {
  const r = rest(mark);
  const cur = current(r, tilt);
  const { L, h } = cur;
  let stroke = r.ring;
  let fill = '';
  for (const p of pieceSpecs(r, cur)) {
    const line = L[p.line];
    const a = solveEnd(line, p.a, -1, h);
    const b = solveEnd(line, p.b, 1, h);
    if (b.theta > a.theta) {
      let first = true;
      for (const [cir, t0, t1] of parts(line, a.theta, b.theta)) {
        stroke += arcPath(cir, t0, t1, first);
        first = false;
      }
    }
    // the cut wedges: the near corner, then the far edge along the line to the far corner, reaching OVERLAP degrees
    // back into the stroke
    const ends: [End, number][] = [
      [a, -1],
      [b, 1],
    ];
    for (const [end, sgn] of ends) {
      if (!end.wedge) continue;
      const { far, side } = end.wedge;
      const back = end.theta - sgn * OVERLAP;
      const n = Math.max(2, Math.ceil(Math.abs(far - end.theta) / 2));
      const pts: Pt[] = [edgeAt(line, back, sgn, -side, h), edgeAt(line, end.theta, sgn, -side, h)];
      for (let j = n; j >= 0; j--) pts.push(edgeAt(line, end.theta + ((far - end.theta) * j) / n, sgn, side, h));
      pts.push(edgeAt(line, back, sgn, side, h));
      fill += polyPath(pts);
    }
  }
  fill += fillets(r, cur);
  return { stroke, fill };
}

const STILLS = new Map<MarkId, LinePaths>();

/** The mark at a tilt. A tilt of exactly zero is the rest mark, solved once and returned as the same strings every time. */
function picture(mark: MarkId, tilt: Tilt): LinePaths {
  const tx = tilt.x || 0;
  const ty = tilt.y || 0;
  if (tx === 0 && ty === 0) return still(mark);
  return solvePicture(mark, { x: tx, y: ty });
}

/** The rest mark: frame 0, and the designed still under reduced motion. */
export function still(mark: MarkId): LinePaths {
  const cached = STILLS.get(mark);
  if (cached) return cached;
  const made = solvePicture(mark, { x: 0, y: 0 });
  STILLS.set(mark, made);
  return made;
}

/* ------------------------------------------------------------ the reach */

/**
 * The pitch stops where the G's flatter arc keeps RISE of its rest rise: a
 * nod turns the horizontal pencil, and the latitude half on the far side of
 * the nod falls toward edge-on, its rise R sin(beta - pitch).
 */
const RISE = 0.85;
const pitchCap = (mark: MarkId) => {
  const b = model(mark).beta;
  return b - Math.asin(RISE * Math.sin(b * DEG)) / DEG;
};
/**
 * Each mark's reach, the same to the left as to the right: the largest turn
 * at which every piece keeps at least 0.6 of its rest length (heavy's left
 * latitude loop allows 12.3 degrees, jaw's stub under the G's free end
 * 5.25), and the pitch cap: 5.19 degrees for heavy and 5.07 for jaw.
 */
const REACH: Record<MarkId, { readonly turn: number; readonly pitch: number }> = {
  heavy: { turn: 12, pitch: pitchCap('heavy') },
  jaw: { turn: 5.25, pitch: pitchCap('jaw') },
};

/* ------------------------------------------------------------ the loop */

/** The loop's length in seconds. */
export const DURATION = 7.5;

/**
 * The loop's tilt at t seconds. The look-round runs along the reach ellipse
 * by its own angle phi, x = turn cos(phi) and y = pitch sin(phi), so each
 * axis swings like a pendulum and the pitch eases through zero as the face
 * passes each side.
 */
function tiltAt(t: number, mark: MarkId): Tilt {
  const T = ((t % DURATION) + DURATION) % DURATION;
  const round = T < 2.5 ? 0 : T < 5.5 ? power2InOut((T - 2.5) / 3) : 1;
  const phi = (270 + 360 * round) * DEG;
  const { turn, pitch } = REACH[mark];
  const amp = T < 1 || T >= 7 ? 0 : T < 2 ? power2InOut(T - 1) : T < 6 ? 1 : 1 - power2InOut(T - 6);
  if (amp === 0) return { x: 0, y: 0 };
  const x = turn * amp * Math.cos(phi);
  const y = pitch * amp * Math.sin(phi);
  return { x: Math.abs(x) < 1e-9 ? 0 : x, y: Math.abs(y) < 1e-9 ? 0 : y };
}

/** The frame at t seconds, wrapped to the loop: a pure function of time. */
export function frameAt(t: number, mark: MarkId): LinePaths {
  return picture(mark, tiltAt(t, mark));
}
