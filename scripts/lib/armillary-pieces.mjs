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
//   round; and the T holds level at the centre, drawn in until it sits
//   clear inside the G, so no ring passes through it. The meridian outside
//   the G is the logo's own order: where it faces the viewer it passes over
//   the G, so crossings go by depth once the rings part and agree with the
//   logo at rest. The gimbal is drawn pixel by pixel (gimbalCoverage), its
//   gaps opening with depth, so no crossing pops between frames. With
//   nest.globe each line's ends are the logo's, carried with the line, so
//   they keep their shape and place as the lines round them move.
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
  /* in the gimbal the T is the core inside the G: as the rings part its arms draw in by up to nest.t, clear of every ring,
     and the bar's left end moves with the meridian's radius, so it meets the meridian where the logo has it */
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

const polygon = (pts) => `M${pts.map((p) => `${f(p.x)} ${f(p.y)}`).join('L')}Z`;

/**
 * The SVG of one frame of a version's `motion` at turns `a` in `ink` on
 * `ground`, `px` wide and high over `view` ([x, y, width, height] in the
 * logo's units). Every frame, the still included, is the pieces, so the lap
 * has no hand-off to make.
 */
export function frameSvg(A, motion, a, { view, px, ground, ink, nest }) {
  if (motion === 'gimbal') throw new Error('armillary-pieces: the gimbal is drawn by gimbalCoverage');
  const P = pieces(A, motion, a, nest);
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

const cut = (d, width) => (d ? `<path d="${d}" fill="none" stroke="#000" stroke-width="${width}" stroke-linecap="butt" stroke-linejoin="round"/>` : '');

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

/** Hermite step from 0 at `a` to 1 at `b`. */
function smooth(a, b, x) {
  const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
}

/**
 * One frame of the gimbal as ink coverage, 0 to 1 a pixel, `size` pixels a
 * side over `view`, each pixel sampled `ss` by `ss` times.
 *
 * The gimbal is drawn pixel by pixel rather than as SVG, because its lines
 * cross at every angle and depth: a line is ink where it covers the pixel
 * unless a line standing over it there leaves its gap round it, and how wide
 * that gap opens follows how far the two stand apart in depth, smoothly,
 * so a crossing never pops from one frame to the next. Which line stands
 * over is its key: the logo's order at rest (the meridian over everything
 * where it faces the viewer and under everything where it faces away, and
 * the G over the T), and the lines' true depth once the rings have parted,
 * the meridian outside the G as a gimbal nests them, so the two agree; the
 * key moves from one to the other while the rings part and before they
 * turn. A line and the T cut each other only where the line stands `deep`
 * out of the T's plane, so the bar and the stem run into the rings where
 * they meet them, as in the logo. The outer ring cuts nothing and is cut by
 * nothing. Lines end square, as the logo's do, and join round. The globe
 * (nest.globe) keeps rules of its own, set out at globeGap and keptRuns.
 */
function gimbalScene(A, a, nest, view, cuts = null) {
  const P = pieces(A, 'gimbal', a, nest);
  /* A ring tilted either way about the bar's line draws the same ellipse, so the globe reads the G tilted the way that
     sets it in front of the stem where the logo draws it over the stem, and its depth then agrees with the logo at rest */
  if (nest.globe) P.g = P.g.map((p) => ({ ...p, z: -p.z }));
  const W = SPHERE.weight;
  const half = W / 2;
  const deep = A.deep * SPHERE.ring;
  const { c: gapC, meridian: gapM, stem: gapT } = A.gaps;
  const reach = Math.max(gapC, gapM, gapT);
  /* 0 at rest, the logo's order; 1 once the rings have half parted, true depth, before any ring turns. The globe
     (nest.globe) keeps no such blend in time: its crossings follow only where the lines stand */
  const lam = nest.globe ? 0 : smooth(0, 0.5, a.nest);
  /* the depth over which a gap opens from nothing to whole */
  const ramp = A.ramp * SPHERE.ring;
  const K = 2 * ramp;
  /* Rings parted to different radii stand at different depths wherever they cross, so true depth can take over from the
     logo's order. Rings kept on one sphere meet where they cross, at one depth, so there the logo's order holds through
     the lap, the meridian over the G where it faces the viewer and under it where it faces away, turning over smoothly
     as it passes edge on; depth then only settles the T, which lies in the sphere's middle plane. */
  const parted = Boolean(nest.ring || nest.g || nest.meridian);
  /* with nest.over the T stands over every ring once they move, so it stays whole and still while they pass behind it */
  const front = nest.over ? 2 * K + SPHERE.ring : 0;
  const keyOf = (line, z) => {
    const logo = line === MER ? (parted ? (z >= 0 ? K : -K) : K * (2 * smooth(-ramp / 2, ramp / 2, z) - 1)) : line === G ? 0 : -K / 2;
    if (line === T && front) return (1 - lam) * logo + lam * front;
    return (parted ? 1 - lam : 1) * logo + lam * (line === T ? 0 : z);
  };
  /* where a line meets the T it cuts it, or is cut, only as it stands deep out of the T's plane: at rest exactly at deep, as
     the logo does, and in motion over a soft edge below it */
  const soft = 0.5 * deep * lam;
  const outOfPlane = (z) => (soft > 0 ? smooth(deep - soft, deep, Math.abs(z)) : Math.abs(z) >= deep ? 1 : 0);

  /* the segments of the meridian and the G, binned on a grid */
  /* each line ends square: a segment within two weights of an end draws nothing past that end's own plane. With `cuts`
     (logoCuts) each end is instead the cut the logo gives it at rest, carried with the line: the plane through the
     points where its two edges end, so a line's ends keep their shape and place however the lines round it move */
  const segs = [];
  for (const [line, pts] of [[MER, P.meridian], [G, P.g]]) {
    const n = pts.length - 1;
    const endOf = (a, b) => {
      const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      return { x: a.x, y: a.y, dx: (a.x - b.x) / l, dy: (a.y - b.y) / l };
    };
    let [start, end] = [endOf(pts[0], pts[1]), endOf(pts[n], pts[n - 1])];
    let run = 0;
    const along = pts.map((p, i) => (run += i ? Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) : 0));
    let [startLen, endLen] = [2 * W, 2 * W];
    if (cuts) {
      const at = alongLine(pts);
      /* the end's plane through its two edges' ends, `a` and `b` segments in from the start, facing out */
      const plane = ({ a: ua, b: ub }, out) => {
        const [pa, pb] = [at(ua), at(ub)];
        const [ax, ay, bx, by] = [pa.x - pa.nx * half, pa.y - pa.ny * half, pb.x + pb.nx * half, pb.y + pb.ny * half];
        let [dx, dy] = [by - ay, ax - bx];
        const l = Math.hypot(dx, dy) || 1;
        [dx, dy] = [dx / l, dy / l];
        if (dx * out.dx + dy * out.dy < 0) [dx, dy] = [-dx, -dy];
        return { x: ax, y: ay, dx, dy };
      };
      /* only an end the logo cuts across its whole width; an end with an edge showing from its tip stays square */
      const [cs, ce] = cuts[line];
      if (Math.min(cs.a, cs.b) > 0) {
        start = plane(cs, start);
        startLen = along[Math.min(n, Math.ceil(Math.max(cs.a, cs.b)))] + 2 * W;
      }
      if (Math.min(ce.a, ce.b) > 0) {
        end = plane({ a: n - ce.a, b: n - ce.b }, end);
        endLen = run - along[Math.max(0, Math.floor(n - Math.max(ce.a, ce.b)))] + 2 * W;
      }
    }
    for (let i = 0; i < n; i++)
      segs.push({
        line,
        p: pts[i],
        q: pts[i + 1],
        s0: along[i],
        len: along[i + 1] - along[i],
        ends: [along[i] < startLen && start, run - along[i + 1] < endLen && end].filter(Boolean),
      });
  }
  const [vx, vy, vw] = view;
  const cell = 4;
  const cols = Math.ceil(vw / cell) + 1;
  const bins = new Map();
  const R = half + reach + 1;
  for (const s of segs) {
    const [x0, x1] = [Math.min(s.p.x, s.q.x) - R, Math.max(s.p.x, s.q.x) + R];
    const [y0, y1] = [Math.min(s.p.y, s.q.y) - R, Math.max(s.p.y, s.q.y) + R];
    for (let cy = Math.floor((y0 - vy) / cell); cy <= Math.floor((y1 - vy) / cell); cy++)
      for (let cx = Math.floor((x0 - vx) / cell); cx <= Math.floor((x1 - vx) / cell); cx++) {
        const k = cy * cols + cx;
        if (!bins.has(k)) bins.set(k, []);
        bins.get(k).push(s);
      }
  }
  /* the T as a polygon with its box */
  const tp = P.t;
  let [tx0, ty0, tx1, ty1] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const p of tp) [tx0, ty0, tx1, ty1] = [Math.min(tx0, p.x), Math.min(ty0, p.y), Math.max(tx1, p.x), Math.max(ty1, p.y)];
  const tSigned = (x, y) => {
    let d = Infinity;
    let inside = false;
    for (let i = 0, j = tp.length - 1; i < tp.length; j = i++) {
      const [a1, b1] = [tp[j], tp[i]];
      const [ex, ey] = [b1.x - a1.x, b1.y - a1.y];
      const u = Math.min(1, Math.max(0, ((x - a1.x) * ex + (y - a1.y) * ey) / (ex * ex + ey * ey || 1)));
      d = Math.min(d, Math.hypot(x - a1.x - u * ex, y - a1.y - u * ey));
      if (a1.y > y !== b1.y > y && x < ((b1.x - a1.x) * (y - a1.y)) / (b1.y - a1.y) + a1.x) inside = !inside;
    }
    return inside ? -d : d;
  };
  /* the T's direction at a point: the bar's along the bar, the stem's below it */
  const tBarFoot = (A.t.bottomLeft + A.t.bottomRight) / 2;
  const ringR = P.ring ? Math.hypot(P.ring[0].x - CX, P.ring[0].y - CY) : SPHERE.ring;
  const [mcx, mcy] = [SPHERE.meridian.cx, SPHERE.meridian.cy];

  /* the lines near (x, y): each a candidate with its edge distance (negative inside the line), its key, its depth and, for
     the meridian, which side of it the point lies on */
  const near = (x, y) => {
    const out = [];
    const list = bins.get(Math.floor((y - vy) / cell) * cols + Math.floor((x - vx) / cell));
    if (list)
      for (const s of list) {
        const [ex, ey] = [s.q.x - s.p.x, s.q.y - s.p.y];
        if (s.ends.some((e) => (x - e.x) * e.dx + (y - e.y) * e.dy > 0)) continue;
        const u = Math.min(1, Math.max(0, ((x - s.p.x) * ex + (y - s.p.y) * ey) / (ex * ex + ey * ey || 1)));
        const [fx, fy] = [s.p.x + u * ex, s.p.y + u * ey];
        const e = Math.hypot(x - fx, y - fy) - half;
        if (e > reach) continue;
        const z = s.p.z + u * (s.q.z - s.p.z);
        const outer = s.line === MER && (x - fx) * (fx - mcx) + (y - fy) * (fy - mcy) > 0;
        const l = Math.hypot(ex, ey) || 1;
        out.push({ line: s.line, e, z, key: keyOf(s.line, z), outer, dx: ex / l, dy: ey / l, run: s.line, s: s.s0 + u * s.len });
      }
    if (nest.globe) {
      const e = Math.abs(Math.hypot(x - CX, y - CY) - ringR) - half;
      const r = Math.hypot(x - CX, y - CY) || 1;
      if (e <= reach) out.push({ line: RING, e, z: 0, key: 0, outer: false, dx: -(y - CY) / r, dy: (x - CX) / r, run: null, s: 0 });
    }
    if (x > tx0 - reach && x < tx1 + reach && y > ty0 - reach && y < ty1 + reach) {
      const e = tSigned(x, y);
      const bar = y <= tBarFoot || x < A.t.stemLeft - A.t.fillet || x > A.t.stemRight + A.t.fillet;
      if (e <= reach) out.push({ line: T, e, z: 0, key: keyOf(T, 0), outer: false, dx: bar ? 1 : 0, dy: bar ? 0 : 1, run: bar ? BAR : STEM, s: bar ? x : y });
    }
    return out;
  };
  /* where the T keeps its full size (nest.t 0) its bar stays joined to the meridian, as in the logo, while the meridian is
     near where it rests, and cuts it only once it has turned away */
  const fromRest = (deg) => {
    const d = Math.abs(deg) % 360;
    return smooth(0, 20, Math.min(d, 360 - d));
  };
  const away = nest.t ? 1 : fromRest(a.meridian);
  /* in the globe, how far each ring has turned from rest, 0 to 1: the G rides on the meridian, so it moves with either */
  const moved = { [MER]: away, [G]: Math.max(away, fromRest(a.g)) };
  /* how nearly a ring faces the viewer, 0 to 1: the cosine of its plane's tilt from the screen, eased over the last turns
     before it lies on the outer ring. Near there a ring runs close along the outer ring, and the outer ring takes it
     under itself rather than leave a hairline between them */
  const facing = (pts) => {
    const n = pts.length - 1;
    const [p, q, r] = [pts[0], pts[Math.round(n / 3)], pts[Math.round((2 * n) / 3)]];
    const [ux, uy, uz, vx2, vy2, vz] = [q.x - p.x, q.y - p.y, q.z - p.z, r.x - p.x, r.y - p.y, r.z - p.z];
    const [nx, ny, nz] = [uy * vz - uz * vy2, uz * vx2 - ux * vz, ux * vy2 - uy * vx2];
    return smooth(0.8, 0.93, Math.abs(nz) / (Math.hypot(nx, ny, nz) || 1));
  };
  const face = nest.globe ? { [MER]: facing(P.meridian), [G]: facing(P.g) } : null;
  /* the gap line `o` leaves round itself where it stands over line `c` */
  const gap = (o, c) => {
    if (nest.globe) return globeGap(o, c);
    const strength = smooth(0, ramp, o.key - c.key);
    if (strength <= 0) return -Infinity;
    if (o.line === T) return gapT * strength * outOfPlane(c.z) * (c.line === MER ? lam * away : 1);
    if (c.line === T) return (o.line === MER ? (o.outer ? gapC : gapC * lam) : gapT) * strength * outOfPlane(o.z);
    if (o.line === MER) return (o.outer ? gapC : gapC * lam) * strength;
    return gapM * strength;
  };
  const globeGap = (o, c) => {
    if (o.line === RING) return c.line === T ? -Infinity : gapT * face[c.line] || -Infinity;
    /* the globe: a ring passes over the T where it stands in front of the T's plane and under it where it stands behind,
       as the logo draws it at rest; each cuts the T or is cut only as it stands clear of the T's
       plane, so the bar and the stem run into the rings where they meet; the rings cross each other in the logo's order;
       and the meridian's inner side, flush in the logo, opens as it turns away. Every change follows a ring's turn, so
       nothing changes while nothing moves */
    if (o.line === T || c.line === T) {
      const r = o.line === T ? c : o;
      const s = smooth(0, ramp, o.line === T ? -r.z : r.z);
      if (s <= 0) return -Infinity;
      /* clear of the T's plane: at rest exactly at deep, as the logo cuts, and over a soft edge below it once the ring moves */
      const soft = 0.5 * deep * moved[r.line];
      const clear = soft > 0 ? smooth(deep - soft, deep, Math.abs(r.z)) : Math.abs(r.z) >= deep ? 1 : 0;
      if (clear <= 0) return -Infinity;
      if (o.line === T) return gapT * s * clear * (c.line === MER ? away : 1);
      return (o.line === MER ? (o.outer ? gapC : gapC * away) : gapT) * s * clear;
    }
    const s = smooth(0, ramp, o.key - c.key);
    if (s <= 0) return -Infinity;
    return (o.line === MER ? (o.outer ? gapC : gapC * away) : gapM) * s;
  };
  /* In the globe a line is kept in whole pieces. Along each line's centre the gaps leave stretches open; a short one is
     kept only where it runs on into the rest of the T, so a gap never leaves a shard or a stub. Each kept stretch ends
     where a line over it begins its gap, on a straight cut along that line, as the logo cuts, leaning at most `lean`
     from square across so a shallow crossing ends in a blunt cut and not a long point. A line is drawn whole across its
     width wherever its stretch is kept, so a line passing close by never bites a notch out of its edge */
  const piece = 2 * W;
  const lean = 40 * DEG;
  const reachOut = half * Math.tan(lean) + 1;
  const kept = nest.globe ? keptRuns() : null;
  function keptRuns() {
    const lines = { [MER]: [], [G]: [], [BAR]: [], [STEM]: [] };
    const step = 0.5;
    const sample = (run, line, s, x, y, z, dx, dy, gone) => {
      if (gone) return lines[run].push({ s, gone: true });
      const c = { line, e: -half, z, key: keyOf(line, z), outer: false, dx, dy, run, s };
      let by = null;
      for (const o of near(x, y)) {
        if (o.line === line) continue;
        const d = o.e - gap(o, c);
        if (d <= 0 && (!by || d < by.d)) by = { d, dx: o.dx, dy: o.dy };
      }
      lines[run].push({ s, x, y, dx, dy, by });
    };
    for (const sg of segs) {
      const k = Math.max(1, Math.ceil(sg.len / step));
      const [ex, ey] = [sg.q.x - sg.p.x, sg.q.y - sg.p.y];
      const l = Math.hypot(ex, ey) || 1;
      for (let i = 0; i < k; i++) {
        const u = i / k;
        const [x, y] = [sg.p.x + u * ex, sg.p.y + u * ey];
        const gone = sg.ends.some((e) => (x - e.x) * e.dx + (y - e.y) * e.dy > 0);
        sample(sg.line, sg.line, sg.s0 + u * sg.len, x, y, sg.p.z + u * (sg.q.z - sg.p.z), ex / l, ey / l, gone);
      }
    }
    const { top, bottomLeft, bottomRight, left, stemLeft, stemRight, end } = A.t;
    const barY = (top + (bottomLeft + bottomRight) / 2) / 2;
    for (let x = left; x <= end; x += step) sample(BAR, T, x, x, barY, 0, 1, 0, false);
    for (let y = tBarFoot; y <= end; y += step) sample(STEM, T, y, (stemLeft + stemRight) / 2, y, 0, 0, 1, false);
    /* the cut where a kept stretch ends at `p`, its last open point, against `q`, the first point the gap covers: a
       plane through the point between them along the line over it, leaning at most `lean`, facing out of the stretch */
    const cut = (p, q, at) => {
      const [tx, ty] = [q.x - p.x, q.y - p.y];
      const tl = Math.hypot(tx, ty) || 1;
      const [ux, uy] = [tx / tl, ty / tl];
      let [nx, ny] = [-q.by.dy, q.by.dx];
      if (nx * ux + ny * uy < 0) [nx, ny] = [-nx, -ny];
      /* the cut leans from square across as far as the crossing is from square, up to `lean`; a crossing shallower
         than that turns its cut back towards square, all the way where the lines run along each other */
      const off = Math.acos(Math.min(1, nx * ux + ny * uy));
      const most = off <= lean ? off : Math.max(0, (lean * (Math.PI / 2 - off)) / (Math.PI / 2 - lean));
      if (most < off) {
        const side = Math.sign(ux * ny - uy * nx) || 1;
        const [c, s2] = [Math.cos(most), side * Math.sin(most)];
        [nx, ny] = [ux * c - uy * s2, ux * s2 + uy * c];
      }
      return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2, dx: nx, dy: ny, at };
    };
    const out = {};
    for (const [run, list] of Object.entries(lines)) {
      out[run] = [];
      let from = null;
      list.forEach((p, i) => {
        const open = !p.gone && !p.by;
        if (!open) return;
        if (from === null) from = i;
        const q = list[i + 1];
        const last = !q || q.gone || q.by || q.s - p.s > 2 * step;
        if (!last) return;
        const f = list[from];
        const b = list[from - 1];
        const cuts = [];
        if (b && !b.gone && b.by && f.s - b.s <= 2 * step) cuts.push(cut(f, b, f.s));
        if (q && !q.gone && q.by && q.s - p.s <= 2 * step) cuts.push(cut(p, q, p.s));
        /* a short stretch of a ring that a gap cuts goes; a stretch of the T runs on into the rest of the T, so it goes
           only when it floats free, cut at both ends, and otherwise shrinks away as the gap closes on it */
        if (p.s - f.s >= piece || cuts.length < (run === BAR || run === STEM ? 2 : 1)) out[run].push({ a: f.s, b: p.s, cuts });
        from = null;
      });
    }
    return out;
  }
  /* line `c` covers (x, y) and no line standing over it leaves its gap there; in the globe, it covers the point inside
     one of its kept stretches */
  const shows = (c, cs, x, y) => {
    if (c.e > 0) return false;
    if (!kept) return !cs.some((o) => o.line !== c.line && o.e <= gap(o, c));
    if (c.line === RING) return true;
    return kept[c.run].some((r) => c.s >= r.a - reachOut && c.s <= r.b + reachOut && r.cuts.every((k) => Math.abs(c.s - k.at) > 2 * W || (x - k.x) * k.dx + (y - k.y) * k.dy <= 0));
  };
  const ink = (x, y) => {
    const d = Math.hypot(x - CX, y - CY) - ringR;
    if (Math.abs(d) <= half) return true;
    const cs = near(x, y);
    return cs.some((c) => shows(c, cs, x, y));
  };
  /* whether `line` shows at (x, y) */
  const shown = (line, x, y) => {
    const cs = near(x, y);
    return cs.some((c) => c.line === line && shows(c, cs, x, y));
  };
  return { P, ink, near, shown, ringR, half, reach, kept };
}

/**
 * One frame of the gimbal as ink coverage, 0 to 1 a pixel, `size` pixels a
 * side over `view`, each pixel sampled `ss` by `ss` times. With nest.globe
 * the meridian's and the G's ends are the logo's, carried with each line
 * (logoCuts), so an end keeps its shape and place as the lines round it
 * move away.
 */
export function gimbalCoverage(A, a, nest, view, size, ss = 3) {
  const { ink, near, ringR, half, reach } = gimbalScene(A, a, nest, view, nest.globe ? logoCuts(A, nest, view) : null);
  const [vx, vy, vw] = view;
  const cov = new Float32Array(size * size);
  const px = vw / size;
  const pad = half + reach + px;
  for (let j = 0; j < size; j++)
    for (let i = 0; i < size; i++) {
      const [x, y] = [vx + (i + 0.5) * px, vy + (j + 0.5) * px];
      /* a pixel far from every line is ground */
      if (Math.abs(Math.hypot(x - CX, y - CY) - ringR) > pad && near(x, y).every((c) => c.e > px)) continue;
      let n = 0;
      for (let sj = 0; sj < ss; sj++) for (let si = 0; si < ss; si++) if (ink(vx + (i + (si + 0.5) / ss) * px, vy + (j + (sj + 0.5) / ss) * px)) n++;
      cov[j * size + i] = n / (ss * ss);
    }
  return cov;
}

/** The point `u` segments along polyline `pts`, interpolated, with its unit normal (left of the line's run). */
function alongLine(pts) {
  const n = pts.length - 1;
  return (u) => {
    const i = Math.min(n - 1, Math.max(0, Math.floor(u)));
    const f = u - i;
    const [p, q] = [pts[i], pts[i + 1]];
    const l = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    return { x: p.x + f * (q.x - p.x), y: p.y + f * (q.y - p.y), nx: (p.y - q.y) / l, ny: (q.x - p.x) / l };
  };
}

const cutsSeen = new Map();

/**
 * Where the logo ends the meridian and the G: for each end of each line,
 * how many segments in from its stretch's end each of its two edges first
 * shows at rest. The stretches in armillary.json run on a little under the
 * gaps that end them at rest, so the logo's end is the gap's cut, slanted
 * as the line it runs into; gimbalScene carries that cut with the line.
 */
function logoCuts(A, nest, view) {
  const key = JSON.stringify([nest, view]);
  if (cutsSeen.has(key)) return cutsSeen.get(key);
  const rest = { ring: 0, meridian: 0, g: 0, t: 0, nest: 0 };
  const { P, shown, half } = gimbalScene(A, rest, nest, view);
  const out = {};
  for (const [line, pts] of [[MER, P.meridian], [G, P.g]]) {
    const n = pts.length - 1;
    const at = alongLine(pts);
    /* from one end (`dir` 1 from the start, -1 from the end), the first place the edge on `side` shows */
    const walk = (dir, side) => {
      for (let k = 0; k < n * 25; k++) {
        const p = at(dir > 0 ? k * 0.02 : n - k * 0.02);
        if (shown(line, p.x + side * p.nx * half * 0.995, p.y + side * p.ny * half * 0.995)) return k * 0.02;
      }
      return 0;
    };
    out[line] = [{ a: walk(1, -1), b: walk(1, 1) }, { a: walk(-1, -1), b: walk(-1, 1) }];
  }
  cutsSeen.set(key, out);
  return out;
}

const [MER, G, T, BAR, STEM, RING] = ['meridian', 'g', 't', 'bar', 'stem', 'ring'];

/** Version `V`'s lap as the times of its frames in seconds. */
export function lapTimes(V) {
  const n = Math.round(V.lap.seconds * V.lap.fps);
  return Array.from({ length: n }, (_, i) => i / V.lap.fps);
}
