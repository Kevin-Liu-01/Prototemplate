/**
 * The line globe both graticule marks are drawn on. Graticule GT, heavy and
 * Graticule jaw, thicker are read as lines on one sphere: the ring is its
 * outline, and the meridians, the latitude, the equator and the stem are
 * circles on it. Every cut is a gap along a circle, solved against the line
 * it clears. The three line animations (language-turn.ts, globe-lean.ts,
 * mark-to-globe.ts) build their frames from this model, and each returns SVG
 * path data: a stroke drawn at REST_WEIGHT with butt caps and round joins,
 * and a fill, both in currentColor.
 *
 * Units are the mark's: viewBox 0 0 256 256, y down, the ring's outer edge
 * 207.4 across, centred on (128, 128). At rest the body frame is the view
 * frame: x right, y down, z toward the viewer, and the picture is the
 * orthographic view down z. Every function here is pure, and the model is
 * cached per mark.
 */
import { REST_WEIGHT } from './line-loop';

export const DEG = Math.PI / 180;
const CENTRE = 128;
/** The ring's outer radius: 207.4 / 2. */
const OUTER = 103.7;
/** Degrees a cut wedge reaches back into its stroke, so the stroke's square end and the wedge overlap instead of sharing an edge. */
export const OVERLAP = 0.4;
/** Units a fillet's shared sides sit inside the strokes, so no antialiasing seam shows along them. */
export const SINK = 0.5;

export const MARK_IDS = ['heavy', 'jaw'] as const;
export type MarkId = (typeof MARK_IDS)[number];

/** One frame: path data to stroke at REST_WEIGHT (butt caps, round joins, no fill) and path data to fill (nonzero). */
export type LinePaths = { readonly stroke: string; readonly fill: string };

/** A point or a vector in two or three dimensions; a field reads its first two entries. */
export type Pt = readonly number[];
/** A field on the picture plane: a signed distance, or an implicit curve that is 0 on the line. */
export type Field = (p: Pt) => number;
/** A circle on the sphere: C + r (u cos t + v sin t), t in degrees, u and v orthonormal. */
export type Circle = { readonly C: Pt; readonly r: number; readonly u: Pt; readonly v: Pt };
/**
 * A line: one circle, or two half circles joined into one loop. With two,
 * loop parameter theta in [0, 180] is the first circle's t and [180, 360]
 * the second's, so the loop runs on through 360 and wraps.
 */
export type Line = { readonly loop: readonly Circle[] };
export type LineName = 'meridian' | 'latitude' | 'equator' | 'stem';

/* ------------------------------------------------------------ the two marks' measures */

type HeavySpec = {
  readonly mark: 'heavy';
  readonly R: number;
  readonly w: number;
  readonly s: number;
  readonly x0: number;
  /** the G's free end on the upper latitude */
  readonly endTheta: number;
  readonly gap: number;
  readonly fillets: readonly number[];
};
type JawSpec = {
  readonly mark: 'jaw';
  readonly R: number;
  readonly w: number;
  readonly s: number;
  readonly x0: number;
  /** the G's free end, as a rest x */
  readonly xEnd: number;
  readonly gapUpper: number;
  readonly gapLower: number;
  readonly gapStubTop: number;
  readonly gapStubFoot: number;
  readonly latGapLeft: number;
  readonly latGapRight: number;
  readonly notch: { readonly depth: number; readonly half: number };
  readonly fillets: readonly number[];
};
/**
 * A mark's measures. R is the sphere's radius at the lines' centres, s the
 * sine of beta (the angle of the oval's halves and of the latitude), and x0
 * the stem's offset from the central meridian. Each measure is a ratio of
 * R (centrelines) or of the line weight w (gaps, notch, fillets), so at
 * REST_WEIGHT every value equals the one the mark's drawing uses, and R
 * keeps the ring's outer edge at OUTER for any weight.
 */
export type Spec = HeavySpec | JawSpec;

/** Units per source pixel at Graticule jaw's own drawing weight (3.02 px). */
const JAW_K = 207.4 / 87.94;

function spec(mark: MarkId, w: number): Spec {
  const R = OUTER - w / 2;
  if (mark === 'heavy') {
    // the drawing's source px: R 39.189, w 4.776, short semi-axis 20.644, gap 2.4, fillet 4.797, free end at -36.557
    const q = w / 4.776;
    return { mark, R, w, s: 20.644 / 39.189, x0: 0, endTheta: 180 - 36.557, gap: 2.4 * q, fillets: [4.797 * q, 4.797 * q] };
  }
  // every gap, the notch and both fillets widen with the weight; the right stub's two gaps keep their widths at
  // REST_WEIGHT and scale with the weight from there
  const q = w / 3.02;
  const qs = (w / REST_WEIGHT) * JAW_K;
  return {
    mark,
    R,
    w,
    s: 21.99 / 42.46,
    x0: R * (-0.787 / 42.46),
    xEnd: R * (29.563 / 42.46),
    gapUpper: 2.4 * q,
    gapLower: 3.19 * q,
    gapStubTop: 3.79 * qs,
    gapStubFoot: 3.41 * qs,
    latGapLeft: 2.95 * q,
    latGapRight: 3.18 * q,
    notch: { depth: 1.875 * q, half: 3.6 * q },
    fillets: [3.15 * q, 3.48 * q],
  };
}

/* ------------------------------------------------------------ circles on the sphere */

export const circle = (C: Pt, r: number, u: Pt, v: Pt): Circle => ({ C, r, u, v });

function makeLines(S: Spec): Record<LineName, Line> {
  const { R, s, x0 } = S;
  const c = Math.sqrt(1 - s * s);
  const O = [0, 0, 0];
  return {
    // two meridians at longitude +beta (theta 0 to 180, north pole to south pole) and -beta (180 to 360, back up)
    meridian: { loop: [circle(O, R, [0, -1, 0], [s, 0, c]), circle(O, R, [0, -1, 0], [s, 0, -c])] },
    // two great circles inclined beta to the equator about the left-right axis: the upper one's front half from the
    // left node over the top to the right node (0 to 180), the lower one's front half back underneath (180 to 360)
    latitude: { loop: [circle(O, R, [-1, 0, 0], [0, -s, c]), circle(O, R, [-1, 0, 0], [0, -s, -c])] },
    // the equator, edge-on at rest: theta is longitude, 0 at the front, 90 at the right limb
    equator: { loop: [circle(O, R, [0, 0, 1], [1, 0, 0])] },
    // the stem: the circle in the plane x = x0, parallel to the central meridian (x0 = 0 for heavy, where it is the
    // central meridian), edge-on at rest: theta 0 on the equator at the front, 90 at the bottom of the limb
    stem: { loop: [circle([x0, 0, 0], Math.sqrt(R * R - x0 * x0), [0, 0, 1], [0, 1, 0])] },
  };
}

/** The circle that holds theta on a line. */
export function circleAt(line: Line, theta: number): Circle {
  return line.loop.length === 1 ? line.loop[0] : line.loop[((Math.floor(theta / 180) % 2) + 2) % 2];
}

/** The offset of the parameter of the circle that holds theta: the circle's t is theta less this. */
export function circleOffset(line: Line, theta: number): number {
  return line.loop.length === 1 ? 0 : 360 * Math.floor(theta / 360);
}

/** The circle that holds theta on a line, and the offset of its parameter. */
function segAt(line: Line, theta: number): [Circle, number] {
  return [circleAt(line, theta), circleOffset(line, theta)];
}

/** [a, b] split where the loop changes circle; each part is [circle, t0, t1]. */
export function parts(line: Line, a: number, b: number): [Circle, number, number][] {
  if (line.loop.length === 1) return [[line.loop[0], a, b]];
  const out: [Circle, number, number][] = [];
  for (let t = a; t < b - 1e-9; ) {
    const next = Math.min(b, (Math.floor(t / 180 + 1e-9) + 1) * 180);
    const [cir, off] = segAt(line, (t + next) / 2);
    out.push([cir, t - off, next - off]);
    t = next;
  }
  return out;
}

function pointOn(cir: Circle, t: number): number[] {
  const ct = Math.cos(t * DEG);
  const st = Math.sin(t * DEG);
  const { C, r, u, v } = cir;
  return [C[0] + r * (u[0] * ct + v[0] * st), C[1] + r * (u[1] * ct + v[1] * st), C[2] + r * (u[2] * ct + v[2] * st)];
}

/** The unit tangent in 3D, toward increasing t. */
function tangentOn(cir: Circle, t: number): number[] {
  const ct = Math.cos(t * DEG);
  const st = Math.sin(t * DEG);
  const { u, v } = cir;
  return [-u[0] * st + v[0] * ct, -u[1] * st + v[1] * ct, -u[2] * st + v[2] * ct];
}

export function lineAt(line: Line, th: number): number[] {
  const [c, off] = segAt(line, th);
  return pointOn(c, th - off);
}

/** The projected tangent toward increasing theta: [unit x, unit y, length], the length being the foreshortening (0 to 1). */
export function lineDir(line: Line, th: number): number[] {
  const [c, off] = segAt(line, th);
  const d = tangentOn(c, th - off);
  const l = Math.hypot(d[0], d[1]);
  return l > 1e-9 ? [d[0] / l, d[1] / l, l] : [0, 0, 0];
}

/** A point on one edge of a line's stroke: e = +1 or -1 times h along rot90 of the outward tangent (sgn times forward). */
export function edgeAt(line: Line, th: number, sgn: number, e: number, h: number): number[] {
  const p = lineAt(line, th);
  const d = lineDir(line, th);
  return [p[0] - e * h * sgn * d[1], p[1] + e * h * sgn * d[0]];
}

/* ------------------------------------------------------------ fields in 2D (centred, y down) */

/** The implicit form of the centred, axis-aligned ellipse with semi-axes a (x) and b (y): negative inside. */
export const ellipseG =
  (a: number, b: number): Field =>
  (p) =>
    (p[0] * p[0]) / (a * a) + (p[1] * p[1]) / (b * b) - 1;

/**
 * The signed distance to the centred, axis-aligned ellipse with semi-axes a
 * (x) and b (y), negative inside: the nearest point by six fixed-point
 * steps on the evolute. Over the disc it agrees with a search of 240
 * samples refined by 48 ternary steps to 1e-13 units, at a tenth of the
 * cost.
 */
export function ellipseSdist(a: number, b: number): Field {
  const k = a * a - b * b;
  const g = ellipseG(a, b);
  return (p) => {
    const px = Math.abs(p[0]);
    const py = Math.abs(p[1]);
    let tx = 0.7071067811865476;
    let ty = 0.7071067811865476;
    for (let i = 0; i < 6; i++) {
      const ex = (k * tx * tx * tx) / a;
      const ey = (-k * ty * ty * ty) / b;
      const rx = a * tx - ex;
      const ry = b * ty - ey;
      const qx = px - ex;
      const qy = py - ey;
      const r = Math.hypot(rx, ry);
      const q = Math.hypot(qx, qy) || 1e-12;
      tx = Math.min(1, Math.max(0, ((qx * r) / q + ex) / a));
      ty = Math.min(1, Math.max(0, ((qy * r) / q + ey) / b));
      const t = Math.hypot(tx, ty);
      tx /= t;
      ty /= t;
    }
    const d = Math.hypot(px - a * tx, py - b * ty);
    return g(p) < 0 ? -d : d;
  };
}

/** The root of f in [lo, hi] by n halvings; f changes sign across the bracket. fLo, when a caller has it, is f(lo). */
export function bisect(f: (x: number) => number, lo: number, hi: number, n = 60, fLo?: number): number {
  let flo = fLo ?? f(lo);
  for (let k = 0; k < n; k++) {
    const m = (lo + hi) / 2;
    const fm = f(m);
    if (fm * flo > 0) {
      lo = m;
      flo = fm;
    } else hi = m;
  }
  return (lo + hi) / 2;
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** Smoothstep of x across [e0, e1]. */
export function smooth(e0: number, e1: number, x: number): number {
  const k = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return k * k * (3 - 2 * k);
}
/** The gt-motion eases, each clamped to [0, 1]: power2.inOut for a move, power2.out for an arrival. */
export function power2InOut(x: number): number {
  const k = clamp01(x);
  return k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
}
export const power2Out = (x: number) => 1 - (1 - clamp01(x)) ** 2;

/* ------------------------------------------------------------ the ends of a piece */

/** A solved end: where its stroke ends square, and the wedge that carries a cut's far edge on past it. */
export type End = { readonly theta: number; readonly wedge: { readonly far: number; readonly side: number } | null };
/**
 * An end as specified. at: a square end at a fixed theta. join: square,
 * where the centreline crosses the other line's centreline g = 0, inside
 * that line's stroke. cut: the cut edge is the curve F = 0, F < 0 on the
 * piece's side; the stroke ends square where its near edge meets the cut,
 * and a wedge carries the far edge on to where it meets the cut.
 */
type EndSpec =
  | { readonly kind: 'at'; readonly at: number }
  | { readonly kind: 'join'; readonly join: Field; readonly bracket: readonly [number, number] }
  | { readonly kind: 'cut'; readonly cut: Field; readonly seed: number };
const atEnd = (at: number): EndSpec => ({ kind: 'at', at });
const joinEnd = (join: Field, lo: number, hi: number): EndSpec => ({ kind: 'join', join, bracket: [lo, hi] });
const cutEnd = (cut: Field, seed: number): EndSpec => ({ kind: 'cut', cut, seed });

/** The near corner and the far corner of a cut end, as an End: sgn is +1 at a piece's end and -1 at its start. */
export function wedgeEnd(tp: number, tm: number, seed: number, sgn: number): End {
  const nearSide = (tp - seed) * sgn < (tm - seed) * sgn ? 1 : -1;
  const theta = nearSide === 1 ? tp : tm;
  const far = nearSide === 1 ? tm : tp;
  return { theta, wedge: Math.abs(far - theta) > 1e-6 ? { far, side: -nearSide } : null };
}

/** Solves an end at rest: a cut walks out from its seed a quarter degree at a time, then bisects. */
function solveEnd(line: Line, end: EndSpec, sgn: number, h: number): End {
  if (end.kind === 'at') return { theta: end.at, wedge: null };
  if (end.kind === 'join') {
    const g = end.join;
    return { theta: bisect((th) => g(lineAt(line, th)), end.bracket[0], end.bracket[1]), wedge: null };
  }
  const cut = end.cut;
  const meet = (e: number) => {
    const F = (th: number) => cut(edgeAt(line, th, sgn, e, h));
    let a = end.seed;
    let fa = F(a);
    if (fa > 0) throw new Error('graticule: a cut seed lies outside its piece');
    let b = a + 0.25 * sgn;
    let fb = F(b);
    let n = 0;
    while (fb <= 0) {
      a = b;
      fa = fb;
      b += 0.25 * sgn;
      fb = F(b);
      if (++n > 2880) throw new Error('graticule: a cut never meets its line');
    }
    return bisect(F, a, b, 60, fa);
  };
  return wedgeEnd(meet(1), meet(-1), end.seed, sgn);
}

/* ------------------------------------------------------------ the pieces of each mark at rest */

export type Piece = { readonly id: string; readonly line: LineName; readonly a: End; readonly b: End };
type PieceSpec = { id: string; line: LineName; a: EndSpec; b: EndSpec };

function pieceSpecs(S: Spec, lines: Record<LineName, Line>): PieceSpec[] {
  const { R, s, w } = S;
  const h = w / 2;
  const A = s * R;
  const beta = Math.asin(s) / DEG;
  const gL = ellipseG(R, A);
  const gM = ellipseG(A, R);
  const sdL = ellipseSdist(R, A);
  const sdM = ellipseSdist(A, R);
  // the equator's theta at a rest x
  const eqAtX = (x: number) => Math.asin(x / R) / DEG;
  if (S.mark === 'heavy') {
    const outL: Field = (p) => h + S.gap - sdL(p);
    const outM: Field = (p) => h + S.gap - sdM(p);
    return [
      // the meridian: from the lower latitude on the right, down through the south pole, up the left side, over the
      // north pole and down the right to a gap above the upper latitude
      { id: 'meridian', line: 'meridian', a: joinEnd(gL, 90, 180), b: cutEnd(outL, 361) },
      // the latitude's left loop, a gap clear of the left meridian at both ends
      { id: 'latitude.left', line: 'latitude', a: cutEnd(outM, 359), b: cutEnd(outM, 361) },
      // the upper latitude from the left meridian to the G's free end, cut square; the lower from the ring back to it
      { id: 'latitude.upper', line: 'latitude', a: joinEnd(gM, 0, 90), b: atEnd(S.endTheta) },
      { id: 'latitude.lower', line: 'latitude', a: atEnd(180), b: joinEnd(gM, 270, 360) },
      { id: 'equator', line: 'equator', a: atEnd(-beta), b: atEnd(90) },
      { id: 'stem', line: 'stem', a: atEnd(0), b: atEnd(90) },
    ];
  }
  const { x0 } = S;
  const { depth, half } = S.notch;
  const outU: Field = (p) => h + S.gapUpper - sdL(p);
  const outLow: Field = (p) => h + S.gapLower - sdL(p);
  const stubTop: Field = (p) => sdL(p) + h + S.gapStubTop;
  const stubFoot: Field = (p) => p[1] + h + S.gapStubFoot;
  const jawFoot: Field = (p) => sdL(p) + h + S.gapLower;
  const cutL = x0 - h - S.latGapLeft;
  const cutR = x0 + h + S.latGapRight;
  // the V notch in the equator's top edge over the stem: each half of the equator ends on one side of the V, cut
  // through the line's whole width; the two halves overlap under the V's apex, so together they leave only the V
  const notchL: Field = (p) => depth * (p[0] - (x0 - half)) - half * (p[1] + h);
  const notchR: Field = (p) => depth * (x0 + half - p[0]) - half * (p[1] + h);
  const yApex = -h + depth;
  const stemR = lines.stem.loop[0].r;
  const thEnd = Math.acos(-S.xEnd / R) / DEG;
  return [
    // the meridian: the top arc over the north pole, both ends a gap above the upper latitude
    { id: 'meridian.top', line: 'meridian', a: cutEnd(outU, 359), b: cutEnd(outU, 361) },
    // the left side between the latitudes, joined to both
    { id: 'meridian.left', line: 'meridian', a: joinEnd(gL, 180, 270), b: joinEnd(gL, 270, 360) },
    // from the lower latitude on the right, through the south pole, to a gap below the lower latitude on the left
    { id: 'meridian.bottom', line: 'meridian', a: joinEnd(gL, 90, 180), b: cutEnd(outLow, 181) },
    // the right stub under the G's free end: a gap below the upper latitude, a level gap above the equator
    { id: 'meridian.stub', line: 'meridian', a: cutEnd(stubTop, 77), b: cutEnd(stubFoot, 77) },
    // the jaw, hanging from the equator to a gap above the lower latitude
    { id: 'meridian.jaw', line: 'meridian', a: atEnd(90), b: cutEnd(jawFoot, 92) },
    // the latitude: from the gap left of the stem, under and round the left node, over the top to the free end
    { id: 'latitude.main', line: 'latitude', a: cutEnd((p) => p[0] - cutL, 300), b: atEnd(360 + thEnd) },
    // from the right node to the gap right of the stem
    { id: 'latitude.right', line: 'latitude', a: atEnd(180), b: cutEnd((p) => cutR - p[0], 200) },
    { id: 'equator.left', line: 'equator', a: atEnd(-beta), b: cutEnd(notchL, eqAtX(x0 - half - 10)) },
    { id: 'equator.right', line: 'equator', a: cutEnd(notchR, eqAtX(x0 + half + 10)), b: atEnd(90) },
    // the stem starts under the V's apex when the apex is below the equator's centreline
    { id: 'stem', line: 'stem', a: atEnd(yApex > 0 ? Math.asin(yApex / stemR) / DEG : 0), b: atEnd(90) },
  ];
}

/* ------------------------------------------------------------ the model, cached per mark */

/**
 * A fillet side under the equator at the stem's top: its radius at rest,
 * its side (-1 left, +1 right), and the theta it spans along each line from
 * where its corner sits at rest, measured at rest.
 */
export type FilletSide = { readonly r: number; readonly dir: number; readonly b0: number; readonly dBar: number; readonly s0: number; readonly dStem: number };
export type Model = {
  readonly mark: MarkId;
  readonly weight: number;
  readonly spec: Spec;
  readonly lines: Record<LineName, Line>;
  /** every piece of the rest mark but the ring, in drawing order */
  readonly pieces: readonly Piece[];
  readonly fillet: { readonly sides: readonly FilletSide[]; readonly barTheta: number; readonly stemR: number; readonly ku: number; readonly kv: number };
  readonly R: number;
  /** degrees: the angle of the oval's halves and of the latitude, and the meridian spacing */
  readonly beta: number;
};

const MODELS = new Map<MarkId, Model>();

/** The rest mark as lines on the sphere, at REST_WEIGHT. */
export function model(mark: MarkId): Model {
  const cached = MODELS.get(mark);
  if (cached) return cached;
  const weight = REST_WEIGHT;
  const S = spec(mark, weight);
  const lines = makeLines(S);
  const h = weight / 2;
  const pieces = pieceSpecs(S, lines).map((p) => {
    const line = lines[p.line];
    return { id: p.id, line: p.line, a: solveEnd(line, p.a, -1, h), b: solveEnd(line, p.b, 1, h) };
  });
  // the fillets under the equator at the stem's top: concave quarter circles at rest, one radius per side
  const stem = lines.stem.loop[0];
  const R = S.R;
  const x0 = S.x0;
  const rs = stem.r;
  const aS = (y: number) => Math.asin(y / rs) / DEG;
  const thJ = Math.asin(x0 / R) / DEG;
  const aE = (x: number) => Math.asin(x / R) / DEG;
  const sides = S.fillets.map((r, i) => {
    const dir = i === 0 ? -1 : 1;
    // theta on the equator where this side of the stem meets its lower edge (b0) and where the arc meets it (dBar on
    // from there); theta on the stem where the equator's lower edge meets it (s0) and where the arc meets it
    return { r, dir, b0: aE(x0 + dir * h) - thJ, dBar: aE(x0 + dir * (h + r)) - aE(x0 + dir * h), s0: aS(h), dStem: aS(h + r) - aS(h) };
  });
  const made: Model = {
    mark,
    weight,
    spec: S,
    lines,
    pieces,
    fillet: { sides, barTheta: thJ, stemR: rs, ku: lineDir(lines.equator, thJ)[2], kv: lineDir(lines.stem, 0)[2] },
    R,
    beta: Math.asin(S.s) / DEG,
  };
  MODELS.set(mark, made);
  return made;
}

/* ------------------------------------------------------------ the far side */

/** The parameters in (t0, t1) where z crosses 0 on a circle: where it passes behind the limb. */
export function zRoots(cir: Circle, t0: number, t1: number): number[] {
  const a = cir.r * cir.u[2];
  const b = cir.r * cir.v[2];
  const rho = Math.hypot(a, b);
  const out: number[] = [];
  if (rho < 1e-9) return out;
  const q = -cir.C[2] / rho;
  if (q <= -1 || q >= 1) return out;
  const phi = Math.atan2(b, a) / DEG;
  const d = Math.acos(q) / DEG;
  for (const base of [phi - d, phi + d]) {
    for (let k = Math.ceil((t0 - base) / 360); base + 360 * k < t1; k++) {
      const t = base + 360 * k;
      if (t > t0 + 1e-7 && t < t1 - 1e-7) out.push(t);
    }
  }
  return out.sort((x, y) => x - y);
}

export const zAt = (cir: Circle, t: number) => cir.C[2] + cir.r * (cir.u[2] * Math.cos(t * DEG) + cir.v[2] * Math.sin(t * DEG));

/* ------------------------------------------------------------ path data */

/** A number in the path data: two decimals, and never -0. */
function f2(n: number): string {
  const v = Math.round(n * 100) / 100;
  return Object.is(v, -0) ? '0' : String(v);
}
/** A centred coordinate written in the 256 unit square. */
const at = (x: number) => f2(CENTRE + x);

/**
 * Bezier pieces of a circle from t0 to t1, at most `step` degrees each. The
 * orthographic projection of a cubic arc is the cubic of the projected
 * control points, so the drawn curve is the projected circle to 0.03 units
 * at 90 degree steps.
 */
export function arcPath(cir: Circle, t0: number, t1: number, move: boolean, step = 90): string {
  const n = Math.max(1, Math.ceil(Math.abs(t1 - t0) / step - 1e-9));
  const dt = (t1 - t0) / n;
  const k = (4 / 3) * Math.tan((dt * DEG) / 4) * cir.r;
  let p = pointOn(cir, t0);
  let d = move ? `M${at(p[0])} ${at(p[1])}` : '';
  for (let i = 1; i <= n; i++) {
    const ta = t0 + dt * (i - 1);
    const tb = t0 + dt * i;
    const q = pointOn(cir, tb);
    const Ta = tangentOn(cir, ta);
    const Tb = tangentOn(cir, tb);
    d += `C${at(p[0] + k * Ta[0])} ${at(p[1] + k * Ta[1])} ${at(q[0] - k * Tb[0])} ${at(q[1] - k * Tb[1])} ${at(q[0])} ${at(q[1])}`;
    p = q;
  }
  return d;
}

/** The ring, the one outline every frame draws: a closed circle at the lines' radius from twelve o'clock, clockwise. */
export const ringPath = (R: number, step = 90) => arcPath(circle([0, 0, 0], R, [0, -1, 0], [1, 0, 0]), 0, 360, true, step) + 'Z';

/**
 * A filled polygon as path data. Every filled piece winds the same way, so
 * pieces that overlap (the two halves of the notch) add under the nonzero
 * rule instead of cancelling.
 */
export function polyPath(pts: readonly Pt[]): string {
  if (pts.length < 3) return '';
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    area += p[0] * q[1] - q[0] * p[1];
  }
  if (Math.abs(area) < 1e-6) return '';
  const o = area < 0 ? pts.slice().reverse() : pts;
  return o.map((p, i) => `${i ? 'L' : 'M'}${at(p[0])} ${at(p[1])}`).join('') + 'Z';
}
