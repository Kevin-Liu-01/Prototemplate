/**
 * Language globe turn. The mark is one frame of a line globe that turns
 * about its pole. The ring, the equator bar and the latitude ellipse never
 * move. Only the meridians move: an evenly spaced family flows across the
 * face from the left limb to the right, and at every whole step of the flow
 * three of its members stand where the mark's oval and stem stand, so that
 * frame is the exact mark.
 *
 * The family. Member g stands at flow position s = g + p, where p is the
 * flow phase. Its phase angle is 30 s degrees, so twelve members are evenly
 * spaced round the sphere in phase. Its longitude is that angle plus a
 * small odd warp, lam = psi + a sin(2 psi), which puts s = -1, 0 and 1
 * exactly on the mark's left meridian, its stem and its right meridian.
 * Jaw's stem is the circle in the plane x = -1.812; its member eases from
 * that plane at s = 0 to a true meridian at s = +-1.
 *
 * The cuts live in the view, at the slots, and open and close in time.
 * Every cut is a relation between a meridian and a still line (a gap above
 * or below the latitude, a join at the bar, a level gap above the bar, a
 * hole cut into the latitude beside a meridian), so every gap closes at its
 * still line. A line end that moves always passes a still line flush: near
 * the latitude its face lies along the latitude, near the bar along the
 * bar, and elsewhere it is cut square, or along the ring's radius for a
 * meridian near the limb.
 *
 * The limbs. A meridian near the limb would lie on the ring and thicken it
 * into a crescent, so no member is drawn past 53 degrees from the front. In
 * a language switch the mark's right meridian draws back into the poles
 * and a new meridian unfolds out of the bar on the left, inside the close.
 * In the loader, which never stops, a member unfolds out of the bar on the
 * left while its mirror folds back into it on the right.
 *
 * The 10 s loop, on the 0.5 s grid: the mark held (0 to 1 s), a language
 * switch (1 to 3 s), the mark (3 to 4 s), a second switch (4 to 6 s), the
 * mark (6 to 7 s), then the loader (7 to 10 s), which turns three spacings,
 * lands at 9.5 s and opens into the mark by 10 s, where the loop wraps.
 */
import type { Field, Line, LinePaths, MarkId, Model, Pt, Spec } from './geometry';
import { arcPath, bisect, clamp01, DEG, ellipseG, ellipseSdist, lineAt, lineDir, model, OVERLAP, parts, polyPath, power2InOut, power2Out, ringPath, SINK } from './geometry';
import { REST_WEIGHT } from './line-loop';

/** Degrees two closing ends overshoot their meeting point, so they overlap and merge without a seam. */
const MEET = 0.5;

const over = (x: number, a: number, b: number) => power2InOut((x - a) / (b - a));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/* ------------------------------------------------------------ the mark's measures */

type Setup = {
  readonly mark: MarkId;
  readonly m: Model;
  readonly S: Spec;
  readonly R: number;
  readonly h: number;
  readonly A: number;
  /** a in lam = psi + a sin(2 psi) */
  readonly warp: number;
  /** the latitude ellipse: its signed distance and its implicit form */
  readonly sdL: Field;
  readonly gL: Field;
  readonly lat: Line;
  /** the G's free end on the latitude */
  readonly latEnd: number;
  /** the bar's left end at rest, on the left meridian; it runs out to the left limb as the cuts shut */
  readonly barLeft: number;
  readonly ring: string;
};

const SETUP = new Map<MarkId, Setup>();

function setup(mark: MarkId): Setup {
  const cached = SETUP.get(mark);
  if (cached) return cached;
  const m = model(mark);
  const S = m.spec;
  const R = m.R;
  const A = S.s * R;
  const main = m.pieces.find((p) => p.id === 'latitude.main');
  const made: Setup = {
    mark,
    m,
    S,
    R,
    h: REST_WEIGHT / 2,
    A,
    warp: (m.beta - 30) / Math.sin(60 * DEG),
    sdL: ellipseSdist(R, A),
    gL: ellipseG(R, A),
    lat: m.lines.latitude,
    latEnd: S.mark === 'heavy' ? 360 + S.endTheta : main ? main.b.theta : NaN,
    barLeft: -A,
    ring: ringPath(R),
  };
  SETUP.set(mark, made);
  return made;
}

/* ------------------------------------------------------------ 2D helpers on a line */

const P2 = (line: Line, t: number): number[] => {
  const p = lineAt(line, t);
  return [p[0], p[1]];
};
function dir2(line: Line, t: number): number[] {
  const d = lineDir(line, t);
  if (d[2] > 1e-7) return [d[0], d[1]];
  const a = P2(line, t - 0.01);
  const b = P2(line, t + 0.01);
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
}
/** A point on edge e (+1 or -1) of a line's stroke: e h along rot90 of the forward tangent. */
function edge(line: Line, t: number, e: number, h: number): number[] {
  const p = P2(line, t);
  const d = dir2(line, t);
  return [p[0] - e * h * d[1], p[1] + e * h * d[0]];
}

/** An end: the pair of thetas where its cut meets the stroke's two edges, tp on edge +1 and tm on edge -1. A square end has tp = tm. */
type Tip = { tp: number; tm: number };
const sq = (t: number): Tip => ({ tp: t, tm: t });
const mid = (end: Tip) => (end.tp + end.tm) / 2;

/** Where each edge of the line meets F = 0, going from anchor (F <= 0 there) in direction sgn; near, when given, is a closer start tried first. */
function cutTip(line: Line, F: Field, anchor: number, sgn: number, h: number, near: number | null = null): Tip | null {
  const meet = (e: number) => {
    const f = (t: number) => F(edge(line, t, e, h));
    let a = anchor;
    let fa = near != null ? f(near) : NaN;
    if (near != null && fa <= 0) a = near;
    else {
      fa = f(a);
      if (!(fa <= 0)) return null;
    }
    for (let n = 0; n < 200; n++) {
      const b = a + 2 * sgn;
      const fb = f(b);
      if (fb > 0) return bisect(f, a, b, 32, fa);
      a = b;
      fa = fb;
    }
    return null;
  };
  const tp = meet(1);
  const tm = meet(-1);
  return tp == null || tm == null ? null : { tp, tm };
}

/* ------------------------------------------------------------ the meridian family */

type Member = { readonly s: number; readonly lam: number; readonly rho: number; readonly line: Line };

/** The longitude of flow position s: -1, 0 and 1 are the left meridian, the stem and the right meridian of the mark. */
function longitude(G: Setup, s: number): number {
  const psi = 30 * s;
  return psi + G.warp * Math.sin(2 * psi * DEG);
}

function member(G: Setup, s: number): Member {
  const lam = longitude(G, s);
  const d = G.mark === 'jaw' && Math.abs(s) < 1 ? G.S.x0 * Math.cos((Math.PI * s) / 2) ** 2 : 0;
  const sl = Math.sin(lam * DEG);
  const cl = Math.cos(lam * DEG);
  const rho = Math.sqrt(G.R * G.R - d * d);
  // t = 0 at the top (the north pole for a meridian), 90 on the equator, 180 at the bottom
  const cir = { C: [d * cl, 0, -d * sl], r: rho, u: [0, -1, 0], v: [sl, 0, cl] };
  return { s, lam, rho, line: { loop: [cir] } };
}

/* ------------------------------------------------------------ a moving line end, flush with what it crosses */

/** Units: the free field's weight is that of a band this far away. */
const FREE_REACH = 12;

type EndField = { w: number; square: true } | { w: number; square: false; phi: Field; target: number };

/**
 * An end on a member at centreline theta tc. Its face is the level line
 * through the centre point of a blend of three fields: the latitude's
 * offsets (so the face lies along the latitude near it), the bar's level
 * lines (along the bar near it), and away from both a free field: square to
 * the member, or along the ring's radius for a member near the limb, so an
 * end that runs into a pole meets the ring square to it. The weights rise
 * as the inverse square of the distance to each band's edge, so inside a
 * band the face is that band's own and the end slides in and out flush.
 */
function fieldEnd(G: Setup, M: Member, tc: number): Tip {
  const { h, sdL } = G;
  const L = M.line;
  const P = P2(L, tc);
  const al = Math.abs(M.lam);
  const fields: EndField[] = [];
  const sdP = sdL(P);
  const dL = Math.max(0, Math.abs(sdP) - h);
  const dB = Math.max(0, Math.abs(P[1]) - h);
  fields.push({ w: 1 / (dL * dL + 0.01), square: false, phi: sdL, target: sdP });
  fields.push({ w: 1 / (dB * dB + 0.01), square: false, phi: (p) => p[1], target: P[1] });
  const kr = Math.min(1, Math.max(0, (al - 30) / 10));
  const wf = 1 / (FREE_REACH * FREE_REACH);
  if (kr < 1) fields.push({ w: wf * (1 - kr), square: true });
  if (kr > 0) {
    const polar: Field = (p) => Math.atan2(Math.abs(p[0]), -p[1]);
    fields.push({ w: wf * kr, square: false, phi: polar, target: polar(P) });
  }
  let W = 0;
  let dp = 0;
  let dm = 0;
  for (const f of fields) {
    if (f.square) {
      W += f.w;
      dp += f.w * 0;
      dm += f.w * 0;
      continue;
    }
    const { phi, target } = f;
    const a = rootAlong((t) => phi(edge(L, t, 1, h)) - target, tc);
    const b = rootAlong((t) => phi(edge(L, t, -1, h)) - target, tc);
    if (a == null || b == null) continue;
    W += f.w;
    dp += f.w * (a - tc);
    dm += f.w * (b - tc);
  }
  return W > 0 ? { tp: tc + dp / W, tm: tc + dm / W } : sq(tc);
}

/** The root of f nearest t0 within 30 degrees, or null: half-degree steps out on both sides in turn, then a bisection. */
function rootAlong(f: (t: number) => number, t0: number): number | null {
  const f0 = f(t0);
  if (Math.abs(f0) < 1e-9) return t0;
  // f at the last step taken on each side
  let up = f0;
  let down = f0;
  for (let n = 1; n <= 60; n++) {
    const a = t0 + 0.5 * (n - 1);
    const b = t0 + 0.5 * n;
    const fb = f(b);
    if (up * fb <= 0) return bisect(f, a, b, 40, up);
    up = fb;
    const c = t0 + -1 * 0.5 * (n - 1);
    const d = t0 + -1 * 0.5 * n;
    const fd = f(d);
    if (down * fd <= 0) return bisect(f, c, d, 40, down);
    down = fd;
  }
  return null;
}

/**
 * The theta k of the way from t0 to t1 along the member as drawn, by length
 * in the picture, so an end moves at the pace its ease gives it everywhere,
 * also near a pole, where theta turns fast and the picture hardly moves.
 */
function alongT(M: Member, t0: number, t1: number, k: number): number {
  if (k <= 0) return t0;
  if (k >= 1) return t1;
  const n = 48;
  const len = [0];
  let prev = P2(M.line, t0);
  for (let i = 1; i <= n; i++) {
    const q = P2(M.line, mix(t0, t1, i / n));
    len.push(len[i - 1] + Math.hypot(q[0] - prev[0], q[1] - prev[1]));
    prev = q;
  }
  const want = k * len[n];
  let i = 1;
  while (i < n && len[i] < want) i++;
  const f = len[i] > len[i - 1] ? (want - len[i - 1]) / (len[i] - len[i - 1]) : 0;
  return mix(t0, t1, (i - 1 + f) / n);
}

/**
 * An end that moves from its rest relation (k = 0) to theta tTo (k = 1). Its
 * centre moves along the member, its face is the field's, and the
 * difference between the rest cut and the field's face there fades out, so
 * k = 0 is exact.
 */
function movedEnd(G: Setup, M: Member, rest: Tip, tTo: number, k: number): Tip {
  if (k <= 0) return rest;
  const tr = mid(rest);
  const f = fieldEnd(G, M, alongT(M, tr, tTo, k));
  const fr = fieldEnd(G, M, tr);
  const c = 1 - k;
  return { tp: f.tp + c * (rest.tp - fr.tp), tm: f.tm + c * (rest.tm - fr.tm) };
}

/* ------------------------------------------------------------ the relations a member's ends take */

/**
 * N and S: the poles. E: the bar's centreline, or a level below it (under
 * the notch's apex). jU and jL: the upper and lower latitude's centreline.
 * gUo and gUi: a gap above and below the upper latitude. gEo: a level gap
 * above the bar. gLi and gLo: a gap above and below the lower latitude.
 */
type Rel = 'N' | 'S' | 'E' | 'jU' | 'jL' | 'gUo' | 'gUi' | 'gEo' | 'gLi' | 'gLo';

/** The relations, solved for the member where it stands now, each at most once. */
function relations(G: Setup, M: Member): (name: Rel, yE: number) => Tip {
  const { h, S, sdL, gL } = G;
  const L = M.line;
  const crossings = new Map<number, number>();
  const tips = new Map<Rel, Tip | null>();
  const tAtY = (y: number) => Math.acos(Math.max(-1, Math.min(1, -y / M.rho))) / DEG;
  // where the member meets the latitude, searched from t0
  const cross = (t0: number, t1: number) => {
    const hit = crossings.get(t0);
    if (hit !== undefined) return hit;
    const made = bisect((t) => gL(P2(L, t)), t0, t1, 40);
    crossings.set(t0, made);
    return made;
  };
  const gap =
    S.mark === 'jaw'
      ? { uo: S.gapUpper, ui: S.gapStubTop, eo: S.gapStubFoot, li: S.gapLower, lo: S.gapLower }
      : { uo: S.gap, ui: NaN, eo: NaN, li: NaN, lo: NaN };
  const solve = (name: Rel): Tip | null => {
    switch (name) {
      case 'gUo':
        return cutTip(L, (p) => h + gap.uo - sdL(p), 0, 1, h, Math.max(0, cross(0, 90) - 24));
      case 'gUi':
        return cutTip(L, (p) => sdL(p) + h + gap.ui, 90, -1, h);
      case 'gEo':
        return cutTip(L, (p) => p[1] + h + gap.eo, 0, 1, h, tAtY(-(h + gap.eo) - 16));
      case 'gLi':
        return cutTip(L, (p) => sdL(p) + h + gap.li, 90, 1, h);
      default:
        return cutTip(L, (p) => h + gap.lo - sdL(p), 180, -1, h, Math.min(180, cross(90, 180) + 24));
    }
  };
  return (name, yE) => {
    switch (name) {
      case 'N':
        return sq(0);
      case 'S':
        return sq(180);
      case 'E':
        return sq(tAtY(yE));
      case 'jU':
        return sq(cross(0, 90));
      case 'jL':
        return sq(cross(90, 180));
    }
    let tip = tips.get(name);
    if (tip === undefined) {
      tip = solve(name);
      tips.set(name, tip);
    }
    if (!tip) throw new Error(`graticule: the ${name} cut never meets its member`);
    return tip;
  };
}

/* ------------------------------------------------------------ the slots */

type Pattern = {
  /** pieces of the member's circle between relations */
  readonly pieces: readonly (readonly [Rel, Rel])[];
  /** the gap before each piece but a first piece from the pole, which closes at a still line; N is the stem's top */
  readonly gaps: readonly Rel[];
  readonly holes?: 'both' | 'lower';
  readonly fillet?: boolean;
  readonly notch?: boolean;
};

/**
 * A member standing on a slot draws that slot's pattern of the mark: slot
 * -1 is the left meridian, 0 the stem and 1 the right meridian.
 */
const PATTERNS: Record<MarkId, ReadonlyMap<number, Pattern>> = {
  heavy: new Map<number, Pattern>([
    // the left meridian, whole; the latitude cut beside it
    [-1, { pieces: [['N', 'S']], gaps: [], holes: 'both' }],
    // the stem, from the bar to the south pole
    [0, { pieces: [['E', 'S']], gaps: ['N'], fillet: true }],
    // the right meridian, open through the G's mouth
    [1, { pieces: [['N', 'gUo'], ['jL', 'S']], gaps: ['E'] }],
  ]),
  jaw: new Map<number, Pattern>([
    [-1, { pieces: [['N', 'gUo'], ['jU', 'jL'], ['gLo', 'S']], gaps: ['jU', 'jL'] }],
    [0, { pieces: [['E', 'S']], gaps: ['N'], fillet: true, notch: true, holes: 'lower' }],
    [1, { pieces: [['N', 'gUo'], ['gUi', 'gEo'], ['E', 'gLi'], ['jL', 'S']], gaps: ['jU', 'E', 'jL'] }],
  ]),
};

/** Each cut group's closedness, from 0 (the mark's cut) to 1 (shut). */
type Closedness = { readonly junction: number; readonly holes: number; readonly gaps: number; readonly stem: number };
const SHUT: Closedness = { junction: 1, holes: 1, gaps: 1, stem: 1 };

type Piece = { a: Tip; b: Tip };
type Hole = { cross: 'both' | 'lower'; k: number };
type SlotState = { M: Member; pieces: Piece[]; holes: Hole[]; notch: number; fillet: number };

function slotState(G: Setup, M: Member, P: Pattern, c: Closedness, retract: number): SlotState {
  const out: SlotState = { M, pieces: [], holes: [], notch: 0, fillet: 0 };
  const r = relations(G, M);
  const kJ = 1 - power2InOut(c.junction);
  const kH = 1 - power2InOut(c.holes);
  let yE = 0;
  if (P.notch && G.S.mark === 'jaw') {
    out.notch = kJ;
    yE = Math.max(0, -G.h + G.S.notch.depth * kJ);
  }
  if (P.fillet) out.fillet = kJ;
  if (P.holes) out.holes.push({ cross: P.holes, k: kH });
  const rel = (name: Rel) => r(name, yE);
  const meetT = (name: Rel) => (name === 'N' ? 0 : name === 'S' ? 180 : mid(rel(name)));
  const closing = (name: Rel) => (name === 'N' ? c.stem : c.gaps);
  const ps: Piece[] = P.pieces.map(([a, b]) => ({ a: rel(a), b: rel(b) }));
  if (retract > 0) {
    // the member leaves: each piece draws back into the pole it hangs from, or into the bar if it hangs from neither
    const e = power2InOut(retract);
    const tE = mid(rel('E'));
    P.pieces.forEach(([an, bn], i) => {
      const pc = ps[i];
      if (an === 'N') pc.b = movedEnd(G, M, pc.b, 0, e);
      else if (bn === 'S') pc.a = movedEnd(G, M, pc.a, 180, e);
      else {
        pc.a = an === 'E' ? pc.a : movedEnd(G, M, pc.a, tE, e);
        pc.b = movedEnd(G, M, pc.b, tE, e);
      }
      if (mid(pc.b) - mid(pc.a) > 0.05) out.pieces.push(pc);
    });
    return out;
  }
  let gi = 0;
  if (P.pieces[0][0] !== 'N') {
    const g = P.gaps[gi++];
    ps[0].a = movedEnd(G, M, ps[0].a, meetT(g), power2InOut(closing(g)));
  }
  const merged = [ps[0]];
  for (let i = 1; i < ps.length; i++) {
    const g = P.gaps[gi++];
    const m = meetT(g);
    const e = power2InOut(closing(g));
    const prev = merged[merged.length - 1];
    const b = movedEnd(G, M, prev.b, m + MEET, e);
    const a = movedEnd(G, M, ps[i].a, m - MEET, e);
    // the ends have met: one piece
    if (Math.min(b.tp, b.tm) >= Math.max(a.tp, a.tm)) prev.b = ps[i].b;
    else {
      prev.b = b;
      merged.push({ a, b: ps[i].b });
    }
  }
  out.pieces = merged;
  return out;
}

/**
 * A member's extent d, from 0 (none) to 1 (pole to pole): the part of it
 * within d of its length from the equator to each pole, its two ends moving
 * flush out of the bar and on to the poles.
 */
function clipToExtent(G: Setup, st: SlotState, d: number) {
  if (d >= 1) return;
  if (d <= 1e-4) {
    st.pieces = [];
    return;
  }
  const M = st.M;
  const tN = alongT(M, 90, 0, d);
  const tS = alongT(M, 90, 180, d);
  const eN = fieldEnd(G, M, tN);
  const eS = fieldEnd(G, M, tS);
  const keep: Piece[] = [];
  for (const p of st.pieces) {
    const a = mid(p.a) < tN ? eN : p.a;
    const b = mid(p.b) > tS ? eS : p.b;
    if (mid(b) > mid(a) + 1e-6) keep.push({ a, b });
  }
  st.pieces = keep;
}

/* ------------------------------------------------------------ drawing a piece */

type Out = { stroke: string; fill: string };

/** A piece on a line from end a to end b: the stroke square between the inner corners, and a wedge that carries the far edge on to each far corner. */
function drawPiece(line: Line, a: Tip, b: Tip, h: number, out: Out) {
  const aIn = Math.max(a.tp, a.tm);
  const aFar = Math.min(a.tp, a.tm);
  const bIn = Math.min(b.tp, b.tm);
  const bFar = Math.max(b.tp, b.tm);
  if (aFar >= bFar) return;
  if (bIn > aIn + 1e-6) {
    let first = true;
    for (const [cir, t0, t1] of parts(line, aIn, bIn)) {
      out.stroke += arcPath(cir, t0, t1, first);
      first = false;
    }
  }
  const ends: [number, number, number, number][] = [
    [aIn, aFar, -1, a.tp > a.tm ? 1 : -1],
    [bIn, bFar, 1, b.tp < b.tm ? 1 : -1],
  ];
  for (const [near, far, sgn, nearE] of ends) {
    if (Math.abs(far - near) < 1e-6) continue;
    const back = near - sgn * OVERLAP;
    const farE = -nearE;
    const n = Math.max(2, Math.ceil(Math.abs(far - near) / 2));
    const pts: Pt[] = [edge(line, back, nearE, h), edge(line, near, nearE, h)];
    for (let j = n; j >= 0; j--) pts.push(edge(line, near + ((far - near) * j) / n, farE, h));
    pts.push(edge(line, back, farE, h));
    out.fill += polyPath(pts);
  }
}

/* ------------------------------------------------------------ the latitude, with the holes members cut into it */

type CutHole = { thc: number; end: Tip; start: Tip };

function latitudeHoles(G: Setup, states: readonly SlotState[]): CutHole[] {
  const { h, lat, gL, S } = G;
  const holes: CutHole[] = [];
  for (const st of states) {
    for (const hole of st.holes) {
      if (hole.k <= 1e-4) continue;
      const L = st.M.line;
      const which: ('upper' | 'lower')[] = hole.cross === 'both' ? ['upper', 'lower'] : [hole.cross];
      for (const w of which) {
        const tc = w === 'upper' ? bisect((t) => gL(P2(L, t)), 0, 90) : bisect((t) => gL(P2(L, t)), 90, 180);
        const c = P2(L, tc);
        const d = dir2(L, tc);
        let n = [-d[1], d[0]];
        // offsets measured toward +x
        if (n[0] < 0) n = [-n[0], -n[1]];
        // the gap on each side, opened by k; a side with no gap sits SINK inside the meridian's stroke
        const side = (g: number) => h - SINK + (g + SINK) * hole.k;
        let lo: number;
        let hi: number;
        if (S.mark === 'heavy') {
          // the outer side only: the member is left of centre
          lo = -side(S.gap);
          hi = -(h - SINK);
        } else {
          lo = -side(S.latGapLeft);
          hi = side(S.latGapRight);
        }
        // the crossing on the latitude loop: under the bottom is theta 180 to 360, over the top 360 to 540
        const o = (t: number) => n[0] * (P2(lat, t)[0] - c[0]) + n[1] * (P2(lat, t)[1] - c[1]);
        const [b0, b1] = w === 'upper' ? [360, 540] : [180, 360];
        const thc = nearestOn(lat, c, b0, b1);
        const slope = Math.sign(o(thc + 0.01) - o(thc - 0.01)) || 1;
        const corners = (oc: number): Tip => {
          const root = (e: number) => {
            const f = (t: number) => {
              const p = edge(lat, t, e, h);
              return n[0] * (p[0] - c[0]) + n[1] * (p[1] - c[1]) - oc;
            };
            return rootNear(f, thc, slope * Math.sign(oc || 1));
          };
          return { tp: root(1), tm: root(-1) };
        };
        // going toward increasing theta the line meets the larger offset first if offsets fall along it
        const [first, second] = slope < 0 ? [hi, lo] : [lo, hi];
        holes.push({ thc, end: corners(first), start: corners(second) });
      }
    }
  }
  return holes.sort((x, y) => x.thc - y.thc);
}

/** The theta in [a, b] where a line passes nearest the point c (a member's crossing with the latitude). */
function nearestOn(line: Line, c: Pt, a: number, b: number): number {
  const d2 = (t: number) => {
    const p = P2(line, t);
    return (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2;
  };
  let bt = a;
  let bd = Infinity;
  for (let t = a; t <= b; t += 1) {
    const d = d2(t);
    if (d < bd) {
      bd = d;
      bt = t;
    }
  }
  let lo = bt - 1;
  let hi = bt + 1;
  for (let k = 0; k < 60; k++) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    if (d2(m1) < d2(m2)) hi = m2;
    else lo = m1;
  }
  return (lo + hi) / 2;
}

function rootNear(f: (t: number) => number, t0: number, dirHint: number): number {
  const f0 = f(t0);
  for (const sgn of [dirHint, -dirHint]) {
    let a = t0;
    let fa = f0;
    for (let n = 1; n <= 120; n++) {
      const b = t0 + sgn * 0.5 * n;
      const fb = f(b);
      if (fa * fb <= 0) return bisect(f, a, b, 50);
      a = b;
      fa = fb;
    }
  }
  return t0;
}

/* ------------------------------------------------------------ the bar, its notch and the fillets */

/** The bar, filled so its notch can travel; whole runs its left end out to the left limb. */
function barPath(G: Setup, notch: { k: number; x: number } | null, whole: number): string {
  const { h, R, S } = G;
  const x0 = mix(G.barLeft, -R, whole);
  const pts: Pt[] = [[x0, -h]];
  if (notch && notch.k > 1e-4 && S.mark === 'jaw') {
    const { depth, half } = S.notch;
    const k = notch.k;
    const xn = notch.x;
    pts.push([xn - half * k, -h], [xn, -h + depth * k], [xn + half * k, -h]);
  }
  pts.push([R, -h], [R, h], [x0, h]);
  return polyPath(pts);
}

function filletPaths(G: Setup, st: SlotState): string {
  if (st.fillet <= 1e-4) return '';
  const { h } = G;
  const L = st.M.line;
  const radii = G.S.fillets;
  let d = '';
  for (let i = 0; i < 2; i++) {
    const dir = i === 0 ? -1 : 1;
    const r = radii[i] * st.fillet;
    if (r < 0.02) continue;
    const nside = (t: number) => {
      const u = dir2(L, t);
      let n = [-u[1], u[0]];
      if (n[0] * dir < 0) n = [-n[0], -n[1]];
      return n;
    };
    const centre = (t: number, off: number) => {
      const p = P2(L, t);
      const n = nside(t);
      return [p[0] + off * n[0], p[1] + off * n[1]];
    };
    // the circle of radius r tangent to the bar's lower edge (y = h) and to this side of the member
    const t2 = bisect((t) => centre(t, h + r)[1] - (h + r), 90, 175);
    const c = centre(t2, h + r);
    const T2 = centre(t2, h);
    const T1 = [c[0], h];
    const tq = bisect((t) => centre(t, h - SINK)[1] - (h - SINK), 90, 175);
    const Q = centre(tq, h - SINK);
    const pts: Pt[] = [Q, [T1[0], h - SINK], T1];
    const a1 = Math.atan2(T1[1] - c[1], T1[0] - c[0]);
    let a2 = Math.atan2(T2[1] - c[1], T2[0] - c[0]);
    while (a2 - a1 > Math.PI) a2 -= 2 * Math.PI;
    while (a1 - a2 > Math.PI) a2 += 2 * Math.PI;
    for (let j = 1; j < 16; j++) {
      const a = a1 + ((a2 - a1) * j) / 16;
      pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
    }
    pts.push(T2);
    for (let j = 1; j <= 6; j++) pts.push(centre(t2 + ((tq - t2) * j) / 6, h - SINK));
    d += polyPath(pts);
  }
  return d;
}

/* ------------------------------------------------------------ one frame */

/** The members with g + origin in -1, 0 and 1 carry that slot's cuts at closedness c; retract draws one slot's member back. */
type Cuts = { readonly origin: number; readonly c: Closedness; readonly retract?: { readonly slot: number; readonly r: number } };
/** Each member's extent (0 none, 1 pole to pole), by its index g and its flow position s. */
type Extent = (g: number, s: number) => number;
/** The flow phase p (member g stands at s = g + p), the cuts (null: every line whole) and the extents. */
type FlowState = { readonly phase: number; readonly cuts: Cuts | null; readonly extent: Extent };

function frame(state: FlowState, mark: MarkId): LinePaths {
  const G = setup(mark);
  const h = G.h;
  const p = state.phase;
  const frac = p - Math.floor(p);
  const cuts = state.cuts;
  const c = cuts ? cuts.c : SHUT;
  const out: Out = { stroke: G.ring, fill: '' };
  const states: SlotState[] = [];
  for (let i = -3; i <= 2; i++) {
    const s = i + frac;
    const g = Math.round(s - p);
    const d = state.extent(g, s);
    if (d <= 1e-4) continue;
    const M = member(G, s);
    const k = cuts ? g + cuts.origin : null;
    const rt = cuts && cuts.retract && cuts.retract.slot === k ? cuts.retract.r : 0;
    const P = cuts && k !== null ? PATTERNS[mark].get(k) : undefined;
    const st: SlotState = P ? slotState(G, M, P, c, rt) : { M, pieces: [{ a: sq(0), b: sq(180) }], holes: [], notch: 0, fillet: 0 };
    clipToExtent(G, st, d);
    states.push(st);
  }
  // the latitude: one line from the right node, under the bottom, round the left node and over the top to the G's
  // free end, cut by the holes members carry
  const holes = latitudeHoles(G, states);
  let start = sq(180);
  for (const hole of holes) {
    drawPiece(G.lat, start, hole.end, h, out);
    start = hole.start;
  }
  drawPiece(G.lat, start, sq(mix(G.latEnd, 540, power2InOut(c.gaps))), h, out);
  // the meridians
  for (const st of states) for (const pc of st.pieces) drawPiece(st.M.line, pc.a, pc.b, h, out);
  // the bar, and the fillets under it
  const notchSt = states.find((st) => st.notch > 1e-4);
  out.fill += barPath(G, notchSt ? { k: notchSt.notch, x: P2(notchSt.M.line, 90)[0] } : null, power2InOut(c.gaps));
  for (const st of states) out.fill += filletPaths(G, st);
  return { stroke: out.stroke, fill: out.fill };
}

/* ------------------------------------------------------------ the moves */

/** At a stop: the three members of the mark. */
const MARK_EXTENT: Extent = (_g, s) => (Math.abs(s) <= 1.0001 ? 1 : 0);
const cutsAt = (origin: number, c: Closedness): Cuts => ({ origin, c });

const STILLS = new Map<MarkId, LinePaths>();

/** The rest mark: every hold, and the designed still under reduced motion. */
export function still(mark: MarkId): LinePaths {
  const cached = STILLS.get(mark);
  if (cached) return cached;
  const made = frame({ phase: 0, cuts: cutsAt(0, { junction: 0, holes: 0, gaps: 0, stem: 0 }), extent: MARK_EXTENT }, mark);
  STILLS.set(mark, made);
  return made;
}

type Span = readonly [number, number];
type Groups = { readonly junction: Span; readonly holes: Span; readonly gaps: Span; readonly stem: Span };

/** Each cut group's share of a close (power2.inOut): the junction details, the latitude holes, the gaps, then the stem's top. */
const CLOSE: Groups = { junction: [0, 0.3], holes: [0.05, 0.35], gaps: [0.1, 0.45], stem: [0.45, 0.8] };
/** The open runs the reverse order on a power2.out clock, so the cuts arrive and settle. */
const OPEN: Groups = { stem: [0, 0.45], gaps: [0.2, 0.75], holes: [0.5, 0.95], junction: [0.55, 1] };
const LOADER_CLOSE: Groups = { junction: [0, 0.4], holes: [0.05, 0.5], gaps: [0.15, 0.75], stem: [0.5, 1] };

const across = (x: number, [a, b]: Span) => clamp01((x - a) / (b - a));
const closeOver = (x: number, groups: Groups): Closedness => ({
  junction: across(x, groups.junction),
  holes: across(x, groups.holes),
  gaps: across(x, groups.gaps),
  stem: across(x, groups.stem),
});
const closeAt = (x: number) => closeOver(x, CLOSE);
function openAt(x: number): Closedness {
  const u = power2Out(x);
  return { junction: 1 - across(u, OPEN.junction), holes: 1 - across(u, OPEN.holes), gaps: 1 - across(u, OPEN.gaps), stem: 1 - across(u, OPEN.stem) };
}

/**
 * A language switch, on the 0.5 s grid: the globe turns one spacing over
 * 1.5 s on power2.inOut. The close takes the first 1 s: the cuts shut, the
 * right meridian folds into the bar, a new meridian unfolds out of the bar
 * on the left, and the stem grows to the north pole last. The open is a
 * power2.out arrival over the 0.5 s after the meridians stop.
 */
const SWITCH = 2;
const SW = { close: 1, turn: 1.5, leave: [0.15, 0.55], unfold: [0.65, 1] } as const;

function switchState(tau: number, from: number): FlowState {
  if (tau <= 0) return { phase: from, cuts: cutsAt(from, closeAt(0)), extent: MARK_EXTENT };
  const f = power2InOut(tau / SW.turn);
  const phase = from + f;
  const extent: Extent = (g) => {
    // the slot the member stood on at the start
    const slot = g + from;
    if (slot === -1 || slot === 0) return 1;
    if (slot === 1) return tau < SW.leave[1] ? 1 : 0;
    if (slot === -2) return over(tau, SW.unfold[0], SW.unfold[1]);
    return 0;
  };
  if (tau < SW.close) {
    const retract = { slot: 1, r: clamp01((tau - SW.leave[0]) / (SW.leave[1] - SW.leave[0])) };
    return { phase, cuts: { ...cutsAt(from, closeAt(tau / SW.close)), retract }, extent };
  }
  if (tau < SW.turn) return { phase, cuts: null, extent };
  return { phase: from + 1, cuts: cutsAt(from + 1, openAt((tau - SW.turn) / (SWITCH - SW.turn))), extent: MARK_EXTENT };
}

/**
 * The loader: the globe builds speed out of the stop on power2.in over
 * 0.5 s while the cuts shut, turns at a steady `speed` spacings a second
 * (ease none), and once the work is done (time `finish`) lands on the next
 * stop it can reach with a power2.out of 0.5 s, then the cuts open as the
 * arrival. Members come in by unfolding out of the bar on the left and go
 * out by folding into it on the right.
 */
const LOADER = { speed: 1.5, ramp: 0.5, close: 0.5, open: 0.5 } as const;
/** Flow positions across which a member unfolds out of the bar on the left while its mirror folds back on the right. */
const LIMB = [1.3, 1.7] as const;
const limbExtent: Extent = (_g, s) => {
  const a = Math.abs(s);
  return a <= LIMB[0] ? 1 : a >= LIMB[1] ? 0 : (LIMB[1] - a) / (LIMB[1] - LIMB[0]);
};

/** The time the loader starts slowing and the stop it lands on, for work that finished at `finish`. */
function loaderLanding(finish: number, from: number): { start: number; stop: number } {
  const r = LOADER.ramp;
  const v = LOADER.speed;
  // each ramp covers d spacings; steady, p(t) = from + d + v (t - r), and the landing starts at the stop m - d, no
  // earlier than r and than finish
  const d = (v * r) / 2;
  const m = Math.max(from + 1, Math.ceil(from + d + v * (Math.max(finish, r) - r) + d - 1e-9));
  return { start: r + (m - d - from - d) / v, stop: m };
}

function loaderState(tau: number, from: number, finish: number): FlowState {
  const r = LOADER.ramp;
  const v = LOADER.speed;
  const d = (v * r) / 2;
  if (tau <= 0) return { phase: from, cuts: cutsAt(from, closeAt(0)), extent: MARK_EXTENT };
  const L = loaderLanding(finish, from);
  let phase: number;
  if (tau < r) phase = from + (v * tau * tau) / (2 * r);
  else if (tau < L.start) phase = from + d + v * (tau - r);
  else if (tau < L.start + r) {
    const q = L.start + r - tau;
    phase = L.stop - (v * q * q) / (2 * r);
  } else phase = L.stop;
  const tOpen = L.start + r;
  if (tau >= tOpen) return { phase: L.stop, cuts: cutsAt(L.stop, openAt((tau - tOpen) / LOADER.open)), extent: MARK_EXTENT };
  const x = tau / LOADER.close;
  const cuts = x < 1 ? cutsAt(from, closeOver(x, LOADER_CLOSE)) : null;
  return { phase, cuts, extent: limbExtent };
}

/** The loader's length, from leaving its stop to the end of the open. */
const loaderLength = (finish: number, from: number) => loaderLanding(finish, from).start + LOADER.ramp + LOADER.open;

/* ------------------------------------------------------------ the loop */

/** The work in the loop's loader is done 1.5 s after it starts. */
const LOOP_LOADER_FINISH = 1.5;

type Segment =
  | { readonly t0: number; readonly t1: number; readonly kind: 'hold' }
  | { readonly t0: number; readonly t1: number; readonly kind: 'switch'; readonly from: number }
  | { readonly t0: number; readonly t1: number; readonly kind: 'loader'; readonly from: number; readonly finish: number };

const TIMELINE: readonly Segment[] = [
  { t0: 0, t1: 1, kind: 'hold' },
  { t0: 1, t1: 3, kind: 'switch', from: 0 },
  { t0: 3, t1: 4, kind: 'hold' },
  { t0: 4, t1: 6, kind: 'switch', from: 1 },
  { t0: 6, t1: 7, kind: 'hold' },
  { t0: 7, t1: 7 + loaderLength(LOOP_LOADER_FINISH, 2), kind: 'loader', from: 2, finish: LOOP_LOADER_FINISH },
];

/** The loop's length in seconds: 10. */
export const DURATION = TIMELINE[TIMELINE.length - 1].t1;

/** The frame at t seconds, wrapped to the loop: a pure function of time. */
export function frameAt(t: number, mark: MarkId): LinePaths {
  const u = ((t % DURATION) + DURATION) % DURATION;
  const seg = TIMELINE.find((g) => u >= g.t0 && u < g.t1) ?? TIMELINE[TIMELINE.length - 1];
  if (seg.kind === 'hold') return still(mark);
  if (seg.kind === 'switch') return frame(switchState(u - seg.t0, seg.from), mark);
  return frame(loaderState(u - seg.t0, seg.from, seg.finish), mark);
}
