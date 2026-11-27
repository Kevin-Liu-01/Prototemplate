// The logo as an armillary sphere: its pieces, each turning on its own,
// drawn as SVG. pnpm build:armillary-gif draws the frames in ink and pnpm
// build:ascii-armillary samples the same frames onto the dot header's grid.
// Every number is in scripts/build/armillary.json, one block a version.
//
// The pieces are the logo's own lines (GtLogoArmillary.frame.ts): the ring,
// the sphere's outline; the meridian, its stretch with the gap where the bar
// runs; the G, the latitude's stretch from the right node round to the G's
// tip; and the T, the bar and the stem as one solid letter with the logo's
// fillets. Each version moves them its own way (its `motion`):
//
// - axis: the ring holds still, the meridian turns about the polar
//   (vertical) axis, the G about the node (horizontal) axis, the bar's own
//   line, and the T about its stem;
// - rings: the ring and the T hold still, and the meridian and the G turn
//   round their own rings: each ring stays where the logo draws it and the
//   stretch slides along it, so the meridian's gap and the G's mouth travel;
// - gimbal: the lines nest as a gimbal's rings. They part, the ring out and
//   the G in; the ring is the frame and holds still; the meridian, hung on
//   it at its poles, turns about the vertical; the G, inside the meridian,
//   turns about its node axis (its bar's line), which the meridian carries
//   round; and the T holds level at the centre, its arms drawn in to stay
//   inside the G. The meridian outside the G is the logo's own order: where
//   it faces the viewer it passes over the G, so crossings between the rings
//   go by depth once they part and agree with the logo at rest (gimbalSvg).
//
// At rest the pieces are the logo: drawn at the GIF's size they differ from
// its path only in the antialiasing of 145 edge pixels. Over and under
// follow the logo's crossings: the meridian passes over everything where it
// faces the viewer and under everything where it faces away, and the G
// passes over the T. The line underneath is cut by the line on top widened
// by the logo's gap each side, by the logo's own gap for that crossing. The
// meridian cuts on its outer side only, as the logo's C gaps do, so the G
// and the bar run flush into its inner side. Where a crossing involves the
// T, the cut is made only where the cutting line stands `deep` out of the
// sphere's outline, so the bar and the stem run into the ring and the G
// meets the bar at the node as they do in the logo. A turned outer ring and
// a line cut each other by depth: where they cross, the one standing `deep`
// in front of the other cuts it. Every ring lies on one sphere, so where two
// cross facing the same way they meet there, and neither is cut.

const DEG = Math.PI / 180;
const { SPHERE, meridianPoint, latitudePoint, easeInOut } = await import(new URL('../../src/components/brand/GtLogoArmillary.frame.ts', import.meta.url).href);

export { SPHERE };

const off = (deg) => Math.abs(deg - 360 * Math.round(deg / 360)) < 1e-9;

/** True when every piece stands at rest (a whole number of turns from it). */
export function atRest(a) {
  return off(a.ring) && off(a.meridian) && off(a.g) && off(a.t) && Math.abs(a.nest) < 1e-9;
}

const [CX, CY] = SPHERE.centre;

/**
 * Each piece's turn in degrees `s` seconds into version `V`'s lap, eased
 * over its window, 0 at rest and 0 throughout for a piece the version does
 * not move: a turn runs once round, a swing tilts out and back each way. What a turn means is the version's motion (pieces below).
 */
export function angles(V, s) {
  const turn = (k) => {
    if (!V.turns[k]) return 0;
    const { from, to, turn: deg, swing } = V.turns[k];
    const u = easeInOut((s - from) / (to - from));
    /* a swing: out, back through rest, out the other way and back, still at both ends */
    const v = swing === undefined ? deg * u : swing * Math.sin(2 * Math.PI * u);
    /* the sine leaves a trace at the window's end; a piece back at rest stands exactly there */
    return Math.abs(v) < 1e-9 ? 0 : v;
  };
  /* how far the gimbal's rings are parted, 0 at rest to 1 */
  const ease = (w) => easeInOut((s - w.from) / (w.to - w.from));
  const parted = V.nest ? ease(V.nest.open) * (1 - ease(V.nest.close)) : 0;
  const nest = parted < 1e-9 ? 0 : parted;
  return { ring: turn('ring'), meridian: turn('meridian'), g: turn('g'), t: turn('t'), nest };
}

/** A point turned `deg` about the vertical axis through (cx, cz), as meridianPoint turns the meridian. */
function turnY(p, deg, cx) {
  const [c, s] = [Math.cos(deg * DEG), Math.sin(deg * DEG)];
  const dx = p.x - cx;
  return { x: cx + dx * c + p.z * s, y: p.y, z: -dx * s + p.z * c };
}

/** A point turned `deg` about the horizontal axis through cy, as latitudePoint turns the latitude. */
function turnX(p, deg, cy) {
  const [c, s] = [Math.cos(deg * DEG), Math.sin(deg * DEG)];
  const dy = p.y - cy;
  return { x: p.x, y: cy + dy * c + p.z * s, z: -dy * s + p.z * c };
}

/** The T in the logo's plane: the bar and the stem with the fillets between them, as an outline. */
function tOutline(T) {
  const { top, bottomLeft, bottomRight, left, stemLeft, stemRight, fillet, end } = T;
  const pts = [
    [left, top],
    [end, top],
    [end, bottomRight],
    [stemRight + fillet, bottomRight],
  ];
  const arc = (cx, cy, a0, a1) => {
    for (let i = 1; i <= 12; i++) {
      const a = (a0 + ((a1 - a0) * i) / 12) * DEG;
      pts.push([cx + fillet * Math.cos(a), cy + fillet * Math.sin(a)]);
    }
  };
  arc(stemRight + fillet, bottomRight + fillet, 270, 180);
  pts.push([stemRight, end], [stemLeft, end], [stemLeft, bottomLeft + fillet]);
  arc(stemLeft - fillet, bottomLeft + fillet, 0, -90);
  pts.push([left, bottomLeft]);
  return pts;
}

/**
 * A point of the T turned `t` degrees about its stem, right of the stem
 * towards the viewer as t grows. The T turns as a solid letter whose bar and
 * stem are round in section: the stem, `half` either side of the axis, keeps
 * its width at every angle, and only the bar beyond it shortens with the
 * cosine, so seen end on the bar is a square knot of its own weight on the
 * stem, not a sliver. Past a quarter turn the letter shows its back, the bar
 * mirrored.
 */
function tPoint(axis, half, [x, y], t) {
  const c = Math.cos(t * DEG);
  const side = c < 0 ? -1 : 1;
  const d = x - axis;
  const reach = Math.abs(d) <= half ? d : Math.sign(d) * (half + (Math.abs(d) - half) * Math.abs(c));
  return { x: axis + side * reach, y, z: d * Math.sin(t * DEG) };
}

/**
 * The pieces at turns `a` in a version's `motion`: polylines of points
 * { x, y, z } in the logo's 256 unit square (z towards the viewer from the
 * sphere's centre plane), the meridian's outer edge pushed out by the C gap
 * (`outer`, the line its cut follows), the T's outline as a polygon, and the
 * outer ring as a closed polyline when it is turned (null at rest, where it
 * is drawn as the logo's circle).
 */
export function pieces(A, motion, a, nest = { ring: 0, g: 0, meridian: 0, t: 0 }) {
  const line = (from, to, at) => {
    const n = Math.ceil((to - from) / A.step);
    return Array.from({ length: n + 1 }, (_, i) => at(from + ((to - from) * i) / n));
  };
  const [M, L] = [SPHERE.meridian, SPHERE.latitude];
  let meridian;
  let g;
  let ring = null;
  if (motion === 'axis') {
    /* each ring turns about its own axis */
    meridian = line(A.meridian.from, A.meridian.to, (t) => meridianPoint(t, M.rest + a.meridian));
    g = line(A.g.from, A.g.to, (t) => latitudePoint(t, L.rest + a.g));
  } else if (motion === 'rings') {
    /* each ring keeps the logo's tilt; its stretch slides round it */
    meridian = line(A.meridian.from, A.meridian.to, (t) => meridianPoint(t + a.meridian, M.rest));
    g = line(A.g.from, A.g.to, (t) => latitudePoint(t + a.g, L.rest));
  } else if (motion === 'gimbal') {
    /* the ring is the frame and turns about the vertical; the meridian, hung on it at its poles, turns about the vertical
       inside it; the G, inside the meridian, turns about its node axis (the bar's line), which the meridian carries round */
    /* the rings parted: the ring out and the G in, each about its own centre */
    const rr = SPHERE.ring + nest.ring * a.nest;
    const scale = (ring, by) => {
      const k = (ring.r + by * a.nest) / ring.r;
      return (p) => ({ x: ring.cx + (p.x - ring.cx) * k, y: ring.cy + (p.y - ring.cy) * k, z: p.z * k });
    };
    const [inM, inG] = [scale(M, nest.meridian), scale(L, nest.g)];
    meridian = line(A.meridian.from, A.meridian.to, (t) => turnY(inM(meridianPoint(t, M.rest + a.meridian)), a.ring, M.cx));
    g = line(A.g.from, A.g.to, (t) => turnY(turnY(inG(latitudePoint(t, L.rest + a.g)), a.meridian, L.cx), a.ring, L.cx));
    /* a closed ring, run one step past its start so its two ends overlap and leave no seam */
    if (!off(a.ring) || a.nest) ring = line(0, 360 + A.step, (t) => turnY({ x: CX + rr * Math.sin(t * DEG), y: CY - rr * Math.cos(t * DEG), z: 0 }, a.ring, CX));
  } else {
    throw new Error(`armillary-pieces: no motion called ${motion}`);
  }
  /* in the gimbal the T is the core inside the G: as the rings part its arms draw in by up to nest.t, and the bar's left
     end follows the meridian in, so it still meets the meridian's inner side where the logo has it */
  const mIn = (M.r + nest.meridian * a.nest) / M.r;
  const T = motion === 'gimbal' && a.nest ? { ...A.t, end: A.t.end + (nest.t ?? 0) * a.nest, left: M.cx + (A.t.left - M.cx) * mIn } : A.t;
  const mid = (T.top + (T.bottomLeft + T.bottomRight) / 2) / 2;
  const axis = (T.stemLeft + T.stemRight) / 2;
  const turn = (p) => tPoint(axis, (T.stemRight - T.stemLeft) / 2, p, a.t);
  const tLines = [line(T.left, T.end, (x) => turn([x, mid])), line(mid, T.end, (y) => turn([axis, y]))];
  /* the meridian's outer edge pushed out by the C gap: the line its one-sided cut follows */
  const m = SPHERE.meridian;
  const outer = meridian.map((p, i) => {
    const [q0, q1] = [meridian[Math.max(0, i - 1)], meridian[Math.min(meridian.length - 1, i + 1)]];
    let [nx, ny] = [q1.y - q0.y, q0.x - q1.x];
    const n = Math.hypot(nx, ny) || 1;
    [nx, ny] = [nx / n, ny / n];
    if (nx * (p.x - m.cx) + ny * (p.y - m.cy) < 0) [nx, ny] = [-nx, -ny];
    return { x: p.x + (nx * A.gaps.c) / 2, y: p.y + (ny * A.gaps.c) / 2, z: p.z };
  });
  return { meridian, outer, g, tLines, t: tOutline(T).map(turn), ring };
}

const f = (v) => Math.round(v * 1000) / 1000;

/** Path data of a polyline's runs where `keep` holds. */
function runs(points, keep) {
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

/** The point of `lines` nearest `p` on screen: where `p` crosses them, the point it crosses. */
function nearest(lines, p) {
  let best = Infinity;
  let at = p;
  for (const l of lines)
    for (const q of l) {
      const d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
      if (d < best) [best, at] = [d, q];
    }
  return at;
}

/** The depth of `lines` where `p` crosses them. */
const zAt = (lines, p) => nearest(lines, p).z;

/**
 * For the straight lines `lines`: given a polyline, a test that holds at its
 * points except where it runs within `reach` of one of the lines at less
 * than 30 degrees to it.
 */
function across(lines, reach) {
  const dirs = lines.map((l) => {
    const [a, b] = [l[0], l[l.length - 1]];
    const n = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return [(b.x - a.x) / n, (b.y - a.y) / n];
  });
  return (points) => {
    const along = new Set();
    points.forEach((p, i) => {
      const [q0, q1] = [points[Math.max(0, i - 1)], points[Math.min(points.length - 1, i + 1)]];
      const n = Math.hypot(q1.x - q0.x, q1.y - q0.y) || 1;
      const [ux, uy] = [(q1.x - q0.x) / n, (q1.y - q0.y) / n];
      lines.forEach((l, k) => {
        if (Math.abs(ux * dirs[k][0] + uy * dirs[k][1]) < Math.cos(30 * DEG)) return;
        if (l.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < reach)) along.add(p);
      });
    });
    return (p) => !along.has(p);
  };
}

/** A polyline's unit direction at its point `i`. */
function dirAt(points, i) {
  const [q0, q1] = [points[Math.max(0, i - 1)], points[Math.min(points.length - 1, i + 1)]];
  const n = Math.hypot(q1.x - q0.x, q1.y - q0.y) || 1;
  return [(q1.x - q0.x) / n, (q1.y - q0.y) / n];
}

/**
 * For a polyline running under `over`: a test that fails at its points that
 * run beside `over` at less than 30 degrees to it, within `reach` of it, where
 * `isOver` holds at the point of `over` beside them. A line passing under
 * another nearly along it is then hidden whole, so it never shows as a sliver
 * at the edge of the other's cut.
 */
function besideUnder(points, over, isOver, reach) {
  const hid = new Set();
  points.forEach((p, i) => {
    let [best, j] = [Infinity, -1];
    over.forEach((q, k) => {
      const d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
      if (d < best) [best, j] = [d, k];
    });
    if (j < 0 || best >= reach * reach || !isOver(over[j])) return;
    const [u, v] = [dirAt(points, i), dirAt(over, j)];
    if (Math.abs(u[0] * v[0] + u[1] * v[1]) >= Math.cos(30 * DEG)) hid.add(p);
  });
  /* a stretch left shown between two hidden ones, shorter than three line weights, would be a stub: hide it too */
  let last = -1;
  points.forEach((p, i) => {
    if (!hid.has(p)) return;
    if (last >= 0 && i - last > 1) {
      let len = 0;
      for (let k = last + 1; k <= i; k++) len += Math.hypot(points[k].x - points[k - 1].x, points[k].y - points[k - 1].y);
      if (len < 3 * SPHERE.weight) for (let k = last + 1; k < i; k++) hid.add(points[k]);
    }
    last = i;
  });
  return (p) => !hid.has(p);
}

const polygon = (pts) => `M${pts.map((p) => `${f(p.x)} ${f(p.y)}`).join('L')}Z`;

/**
 * The SVG of one frame of a version's `motion` at turns `a` in `ink` on
 * `ground`, `px` wide and high over `view` ([x, y, width, height] in the
 * logo's units). Every frame, the still included, is the pieces, so the lap
 * has no hand-off to make.
 */
export function frameSvg(A, motion, a, { view, px, ground, ink, nest }) {
  const P = pieces(A, motion, a, nest);
  if (motion === 'gimbal') return gimbalSvg(A, a, P, { view, px, ground, ink });
  const W = SPHERE.weight;
  const deep = A.deep * SPHERE.ring;
  const near = (p) => p.z >= 0;
  const far = (p) => p.z <= 0;
  const isDeep = (p) => Math.abs(p.z) >= deep;
  const all = () => true;
  /* the cutters: the G and the T cut both sides; the meridian cuts its outer side only, as the logo's C gaps do */
  const gAll = cut(runs(P.g, all), W + 2 * A.gaps.meridian);
  const gDeep = cut(runs(P.g, isDeep), W + 2 * A.gaps.stem);
  const merNearAll = cut(runs(P.outer, near), W + A.gaps.c);
  const merNearDeep = cut(runs(P.outer, (p) => near(p) && isDeep(p)), W + A.gaps.c);
  const tDeep = P.tLines.map((l) => cut(runs(l, isDeep), W + 2 * A.gaps.stem)).join('');
  const masks = mask(view, 'mf', gAll + tDeep) + mask(view, 'mt', gDeep + merNearDeep) + mask(view, 'mg', merNearAll);
  const ring = `<circle cx="${CX}" cy="${CY}" r="${SPHERE.ring}" fill="none" stroke="${ink}" stroke-width="${W}"/>`;
  return (
    svgOpen(view, px, ground, masks) +
    `<g mask="url(#mf)">${stroke(P.meridian, far, ink)}</g>` +
    `<g mask="url(#mt)"><path d="${polygon(P.t)}" fill="${ink}"/></g>` +
    `<g mask="url(#mg)">${stroke(P.g, all, ink)}</g>` +
    stroke(P.meridian, near, ink) +
    ring +
    `</svg>`
  );
}

/**
 * One frame of the gimbal. Over and under between the meridian and the G go
 * by depth: once the rings part, the meridian outside the G, the nearer of
 * the two passes over wherever they cross, which at rest is the logo's own
 * rule (the meridian over the G where it faces the viewer, under it where it
 * faces away); while they are close to one sphere the logo's rule decides
 * the crossings that stand within `deep` of level, a margin that narrows to
 * nothing as they part. The T keeps the logo's crossings, cut by a ring
 * standing `deep` in front of it and cutting a ring standing `deep` behind
 * it, and a ring running along the bar or the stem merges with it. A line
 * passing under another nearly along it is hidden there whole, and a piece of
 * any line left between two cuts, or between a cut and its end, shorter than
 * a line and a half's weight is cut away with them, so no stub or sliver
 * shows.
 */
function gimbalSvg(A, a, P, { view, px, ground, ink }) {
  if (!off(a.ring)) throw new Error('armillary-pieces: the gimbal draws its outer ring as a still frame');
  const W = SPHERE.weight;
  const deep = A.deep * SPHERE.ring;
  const level = deep * (1 - a.nest);
  const isDeep = (p) => Math.abs(p.z) >= deep;
  const all = () => true;
  const band = (points, keep, w) => ({ d: runs(points, keep), pts: points.filter(keep), w });
  /* the meridian and the G by depth where they cross, by the logo's rule where they stand level */
  const gOverMer = (q) => {
    const zm = zAt([P.meridian], q);
    return Math.abs(q.z - zm) >= level ? q.z > zm : zm <= 0;
  };
  const merOverG = new Set(
    P.outer.filter((_, i) => {
      const p = P.meridian[i];
      const zg = zAt([P.g], p);
      return Math.abs(p.z - zg) >= level ? p.z > zg : p.z >= 0;
    }),
  );
  const merShown = besideUnder(P.meridian, P.g, gOverMer, W + A.gaps.meridian);
  const gShown = besideUnder(P.g, P.meridian, (q) => merOverG.has(P.outer[P.meridian.indexOf(q)]), W + A.gaps.c);
  /* the T: a ring standing deep in front cuts it and one standing deep behind is cut by it, except along the bar or the stem */
  const reach = W + 2 * A.gaps.stem;
  const acrossT = across(P.tLines, reach);
  const [merAlongT, gOverT, merOverT] = [acrossT(P.meridian), acrossT(P.g), acrossT(P.outer)];
  const merAt = new Map(P.outer.map((q, i) => [q, P.meridian[i]]));
  const [axis, mid] = [P.tLines[1][0].x, P.tLines[0][0].y];
  const short = 1.5 * W;

  /* the cuts, made only by what is drawn: a stub cut away cuts nothing, so the cuts are found again once without the stubs */
  let gone = { mer: new Set(), g: new Set(), t: new Set() };
  let B;
  let S;
  for (let pass = 0; pass < 2; pass++) {
    const merOn = (p) => merShown(p) && !gone.mer.has(p);
    const outerOn = (q) => merOn(merAt.get(q));
    const gOn = (p) => gShown(p) && !gone.g.has(p);
    const tOn = (p) => !gone.t.has(p);
    B = {
      gCutsMer: band(P.g, (q) => gOn(q) && gOverMer(q), W + 2 * A.gaps.meridian),
      merCutsG: band(P.outer, (q) => outerOn(q) && merOverG.has(q), W + A.gaps.c),
      tCutsMer: P.tLines.map((l) =>
        band(l, (p) => {
          const q = nearest([P.meridian], p);
          return tOn(p) && q.z <= -deep && merAlongT(q);
        }, reach),
      ),
      gCutsT: band(P.g, (p) => gOn(p) && isDeep(p) && gOverT(p), reach),
      merCutsT: band(P.outer, (p) => outerOn(p) && p.z >= 0 && isDeep(p) && merOverT(p), W + A.gaps.c),
    };
    S = {
      mer: stubs(P.meridian, merShown, () => [B.gCutsMer, ...B.tCutsMer], [true, true], short),
      g: stubs(P.g, gShown, () => [B.merCutsG], [true, true], short),
      bar: stubs(P.tLines[0], all, () => [B.gCutsT, B.merCutsT], [true, true], short, (p) => Math.abs(p.x - axis) < 1),
      stem: stubs(P.tLines[1], all, () => [B.gCutsT, B.merCutsT], [false, true], short, (p) => p.y - mid < 1),
    };
    gone = { mer: S.mer.gone, g: S.g.gone, t: new Set([...S.bar.gone, ...S.stem.gone]) };
  }
  const cuts = (...bands) => bands.map((b) => cut(b.d, b.w, b.cap)).join('');
  const masks =
    mask(view, 'mm', cuts(B.gCutsMer, ...B.tCutsMer, S.mer)) +
    mask(view, 'mt', cuts(B.gCutsT, B.merCutsT, S.bar, S.stem)) +
    mask(view, 'mg', cuts(B.merCutsG, S.g));
  const ring = P.ring
    ? stroke(P.ring, all, ink)
    : `<circle cx="${CX}" cy="${CY}" r="${SPHERE.ring}" fill="none" stroke="${ink}" stroke-width="${W}"/>`;
  return (
    svgOpen(view, px, ground, masks) +
    /* every crossing is a cut, so the order the lines are laid in shows nowhere, and the meridian is drawn whole, its near
       and far halves one line with no join between them */
    `<g mask="url(#mm)">${stroke(P.meridian, merShown, ink)}</g>` +
    `<g mask="url(#mt)"><path d="${polygon(P.t)}" fill="${ink}"/></g>` +
    `<g mask="url(#mg)">${stroke(P.g, gShown, ink)}</g>` +
    ring +
    `</svg>`
  );
}

/**
 * The pieces of a line its cuts leave too short to read, as a cutter along
 * the line with the set of its points (`gone`): the line's shown points (`shown`) not inside one of the bands
 * `bandsAt(p)` cut at them, taken run by run, where a run is shorter than
 * `short` and has a cut or one of the line's real ends (`ends`, start and
 * finish) at each side. A run holding a point where `anchored` holds joins
 * the rest of its piece and stays.
 */
function stubs(points, shown, bandsAt, ends, short, anchored = () => false) {
  const inBand = (p) => bandsAt(p).some((b) => b.pts.some((q) => (q.x - p.x) ** 2 + (q.y - p.y) ** 2 < (b.w / 2) ** 2));
  const seen = points.map((p) => shown(p) && !inBand(p));
  const gone = new Set();
  let i = 0;
  while (i < points.length) {
    if (!seen[i]) {
      i++;
      continue;
    }
    let j = i;
    while (j + 1 < points.length && seen[j + 1]) j++;
    let len = 0;
    for (let k = i + 1; k <= j; k++) len += Math.hypot(points[k].x - points[k - 1].x, points[k].y - points[k - 1].y);
    const bounded = (i > 0 || ends[0]) && (j < points.length - 1 || ends[1]) && !(i === 0 && j === points.length - 1);
    if (bounded && len < short && !points.slice(i, j + 1).some(anchored))
      for (let k = Math.max(0, i - 1); k <= Math.min(points.length - 1, j + 1); k++) gone.add(points[k]);
    i = j + 1;
  }
  /* square caps carry the cut past the line's own end, so no hairline of it is left there */
  return { d: runs(points, (p) => gone.has(p)), pts: [], w: SPHERE.weight + 4, cap: 'square', gone };
}

const cut = (d, width, cap = 'butt') => (d ? `<path d="${d}" fill="none" stroke="#000" stroke-width="${width}" stroke-linecap="${cap}" stroke-linejoin="round"/>` : '');

function mask([vx, vy, vw, vh], id, cutters) {
  return `<mask id="${id}" maskUnits="userSpaceOnUse" x="${vx}" y="${vy}" width="${vw}" height="${vh}"><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#fff"/>${cutters}</mask>`;
}

function stroke(points, keep, ink) {
  const d = runs(points, keep);
  return d ? `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${SPHERE.weight}" stroke-linecap="butt" stroke-linejoin="round"/>` : '';
}

function svgOpen([vx, vy, vw, vh], px, ground, masks) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${px[0]}" height="${px[1]}" viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="none">` +
    `<defs>${masks}</defs>` +
    `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="${ground}"/>`
  );
}

/** Version `V`'s lap as the times of its frames in seconds. */
export function lapTimes(V) {
  const n = Math.round(V.lap.seconds * V.lap.fps);
  return Array.from({ length: n }, (_, i) => i / V.lap.fps);
}
