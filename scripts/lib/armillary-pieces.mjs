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
// - gimbal: the lines nest as a gimbal's rings. The outer ring turns about
//   the vertical axis; the G, hung on the ring at its nodes, turns about the
//   node axis the ring carries; the meridian, inside the G, turns about the
//   vertical axis the G carries; and the T holds still at the centre.
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
export function pieces(A, motion, a, nest = { ring: 0, g: 0, meridian: 0 }) {
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
    /* the ring turns about the vertical, the G inside it about the node axis, the meridian inside the G about the vertical */
    /* the rings parted: the ring out, the G and the meridian in, each about its own centre */
    const rr = SPHERE.ring + nest.ring * a.nest;
    const scale = (ring, by) => {
      const k = (ring.r + by * a.nest) / ring.r;
      return (p) => ({ x: ring.cx + (p.x - ring.cx) * k, y: ring.cy + (p.y - ring.cy) * k, z: p.z * k });
    };
    const [inM, inG] = [scale(M, nest.meridian), scale(L, nest.g)];
    meridian = line(A.meridian.from, A.meridian.to, (t) => turnY(turnX(inM(meridianPoint(t, M.rest + a.meridian)), a.g, M.cy), a.ring, M.cx));
    g = line(A.g.from, A.g.to, (t) => turnY(inG(latitudePoint(t, L.rest + a.g)), a.ring, L.cx));
    /* a closed ring, run one step past its start so its two ends overlap and leave no seam */
    if (!off(a.ring) || a.nest) ring = line(0, 360 + A.step, (t) => turnY({ x: CX + rr * Math.sin(t * DEG), y: CY - rr * Math.cos(t * DEG), z: 0 }, a.ring, CX));
  } else {
    throw new Error(`armillary-pieces: no motion called ${motion}`);
  }
  const T = A.t;
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

/**
 * Path data of a polyline's runs where `keep` holds; with `overlap`, each run
 * reaches one point past each end, so two runs that meet overlap by a step.
 */
function runs(points, keep, overlap = false) {
  let d = '';
  let open = false;
  for (const [i, p] of points.entries()) {
    const beside = overlap && (keep(points[i - 1] ?? p) || keep(points[i + 1] ?? p));
    if (keep(p) || beside) {
      d += `${open ? 'L' : 'M'}${f(p.x)} ${f(p.y)}`;
      open = true;
    } else {
      open = false;
    }
  }
  return d;
}

/** The depth of the point of `lines` nearest `p` on screen: where `p` crosses them, their depth at the crossing. */
function zAt(lines, p) {
  let best = Infinity;
  let z = 0;
  for (const l of lines)
    for (const q of l) {
      const d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
      if (d < best) [best, z] = [d, q.z];
    }
  return z;
}

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

const polygon = (pts) => `M${pts.map((p) => `${f(p.x)} ${f(p.y)}`).join('L')}Z`;

/**
 * The SVG of one frame of a version's `motion` at turns `a` in `ink` on
 * `ground`, `px` wide and high over `view` ([x, y, width, height] in the
 * logo's units). Every frame, the still included, is the pieces, so the lap
 * has no hand-off to make.
 */
export function frameSvg(A, motion, a, { view, px, ground, ink, nest }) {
  const P = pieces(A, motion, a, nest);
  const W = SPHERE.weight;
  const deep = A.deep * SPHERE.ring;
  const near = (p) => p.z >= 0;
  const far = (p) => p.z <= 0;
  const isDeep = (p) => Math.abs(p.z) >= deep;
  const cut = (d, width) => (d ? `<path d="${d}" fill="none" stroke="#000" stroke-width="${width}" stroke-linecap="butt" stroke-linejoin="round"/>` : '');
  const all = () => true;
  /* the cutters: the G and the T cut both sides; the meridian cuts its outer side only, as the logo's C gaps do */
  const gAll = cut(runs(P.g, all), W + 2 * A.gaps.meridian);
  /* in the gimbal a ring folds edge on onto the bar or the stem, the lines the logo builds them on; running along them,
     within a cut's width, it merges with them, so it cuts the T only where it crosses at more than 30 degrees */
  const acrossT = motion === 'gimbal' ? across(P.tLines, W + 2 * A.gaps.stem) : () => () => true;
  const [gOverT, merOverT] = [acrossT(P.g), acrossT(P.outer)];
  const gDeep = cut(runs(P.g, (p) => isDeep(p) && gOverT(p)), W + 2 * A.gaps.stem);
  const merNearAll = cut(runs(P.outer, near), W + A.gaps.c);
  const merNearDeep = cut(runs(P.outer, (p) => near(p) && isDeep(p) && merOverT(p)), W + A.gaps.c);
  const tDeep = P.tLines.map((l) => cut(runs(l, isDeep), W + 2 * A.gaps.stem)).join('');
  /* a turned outer ring and a line cut each other by depth: where they cross, the one standing deep in front of the other
     cuts it. The ring cuts only where it stands deep towards the viewer itself, so its cuts grow from nothing as it
     tilts. All the rings lie on one sphere, so where two cross with both facing the viewer they meet and neither is cut */
  const ringNear = (p) => p.z > -deep;
  const ringGap = W + 2 * A.gaps.stem;
  const ringOver = (target) => (P.ring ? cut(runs(P.ring, (p) => p.z >= deep && p.z - zAt(target, p) >= deep), ringGap) : '');
  const ringCut = { meridian: ringOver([P.meridian]), g: ringOver([P.g]), t: ringOver(P.tLines) };
  const underRing = P.ring ? [P.meridian, P.g, ...P.tLines].map((l) => cut(runs(l, (p) => p.z - zAt([P.ring], p) >= deep), ringGap)).join('') : '';
  const [vx, vy, vw, vh] = view;
  const rect = `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#fff"/>`;
  const mask = (id, cutters) => `<mask id="${id}" maskUnits="userSpaceOnUse" x="${vx}" y="${vy}" width="${vw}" height="${vh}">${rect}${cutters}</mask>`;
  const masks =
    mask('mf', gAll + tDeep + ringCut.meridian) +
    mask('mt', gDeep + merNearDeep + ringCut.t) +
    mask('mg', merNearAll + ringCut.g) +
    (P.ring ? mask('mn', ringCut.meridian) + mask('mr', underRing) : '');

  const stroke = (points, keep, overlap = false) => {
    const d = runs(points, keep, overlap);
    return d ? `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${W}" stroke-linecap="butt" stroke-linejoin="round"/>` : '';
  };
  /* the outer ring: the logo's circle at rest; turned, its far half (round capped where it meets the near half) under every line and its near half over them */
  const ring = P.ring
    ? stroke(P.ring, ringNear)
    : `<circle cx="${CX}" cy="${CY}" r="${SPHERE.ring}" fill="none" stroke="${ink}" stroke-width="${W}"/>`;
  const ringFar = P.ring ? `<g mask="url(#mr)">${stroke(P.ring, (p) => !ringNear(p)).replace('stroke-linecap="butt"', 'stroke-linecap="round"')}</g>` : '';
  /* in the gimbal the G carries the meridian's poles off the ring, so its near half overlaps the far one there */
  const merNear = stroke(P.meridian, near, motion === 'gimbal');

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${px[0]}" height="${px[1]}" viewBox="${view.join(' ')}" preserveAspectRatio="none">` +
    `<defs>${masks}</defs>` +
    `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="${ground}"/>` +
    ringFar +
    `<g mask="url(#mf)">${stroke(P.meridian, far)}</g>` +
    `<g mask="url(#mt)"><path d="${polygon(P.t)}" fill="${ink}"/></g>` +
    `<g mask="url(#mg)">${stroke(P.g, all)}</g>` +
    (P.ring && merNear ? `<g mask="url(#mn)">${merNear}</g>` : merNear) +
    ring +
    `</svg>`
  );
}

/** Version `V`'s lap as the times of its frames in seconds. */
export function lapTimes(V) {
  const n = Math.round(V.lap.seconds * V.lap.fps);
  return Array.from({ length: n }, (_, i) => i / V.lap.fps);
}
