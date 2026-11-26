// The logo as an armillary sphere: its pieces, each turning on its own axis,
// drawn as SVG. pnpm build:armillary-gif draws the frames in ink and pnpm
// build:ascii-armillary samples the same frames onto the dot header's grid.
// Every number is in scripts/build/armillary.json.
//
// The pieces are the logo's own lines (GtLogoArmillary.frame.ts):
//
// - the ring, the sphere's outline, which never moves;
// - the meridian, its stretch with the gap where the bar runs, turning about
//   the polar (vertical) axis;
// - the G, the latitude's stretch from the right node round to the G's tip,
//   turning about the node (horizontal) axis, the bar's own line;
// - the T, the bar and the stem as one solid letter with the logo's
//   fillets, turning about the stem.
//
// At rest the pieces are the logo: drawn at the GIF's size they differ from
// its path only in the antialiasing of 145 edge pixels. Over and under
// follow the logo's crossings: the meridian passes over everything where it faces the viewer
// and under everything where it faces away, and the G passes over the T. The
// line underneath is cut by the line on top widened by the logo's gap each
// side, by the logo's own gap for that crossing. The meridian cuts on its
// outer side only, as the logo's C gaps do, so the G and the bar run flush
// into its inner side. Where a crossing involves the T, the cut is made only
// where the cutting line stands `deep` out of the sphere's outline, so the
// bar and the stem run into the ring and the G meets the bar at the node as
// they do in the logo.

const DEG = Math.PI / 180;
const { SPHERE, meridianPoint, latitudePoint, easeInOut } = await import(new URL('../../src/components/brand/GtLogoArmillary.frame.ts', import.meta.url).href);

export { SPHERE };

/** True when every piece stands at its rest angle (a whole number of turns from it). */
export function atRest(a) {
  const off = (deg) => Math.abs(deg - 360 * Math.round(deg / 360)) < 1e-9;
  return off(a.meridian - SPHERE.meridian.rest) && off(a.g - SPHERE.latitude.rest) && off(a.t);
}

const [CX, CY] = SPHERE.centre;

/** Each piece's angle `s` seconds into the lap: its rest, plus its turn eased over its window. */
export function angles(A, s) {
  const turn = (k) => {
    const { from, to, turn: deg } = A.turns[k];
    return deg * easeInOut((s - from) / (to - from));
  };
  return { meridian: SPHERE.meridian.rest + turn('meridian'), g: SPHERE.latitude.rest + turn('g'), t: turn('t') };
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
 * The pieces at angles `a`: polylines of points { x, y, z } in the logo's
 * 256 unit square (z towards the viewer from the sphere's centre plane),
 * the meridian's outer edge pushed out by the C gap (`outer`, the line its
 * cut follows), and the T's outline as a polygon.
 */
export function pieces(A, a) {
  const line = (from, to, at) => {
    const n = Math.ceil((to - from) / A.step);
    return Array.from({ length: n + 1 }, (_, i) => at(from + ((to - from) * i) / n));
  };
  const meridian = line(A.meridian.from, A.meridian.to, (t) => meridianPoint(t, a.meridian));
  const g = line(A.g.from, A.g.to, (t) => latitudePoint(t, a.g));
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
  return { meridian, outer, g, tLines, t: tOutline(T).map(turn) };
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
 * The SVG of one frame at angles `a` in `ink` on `ground`, `px` wide and
 * high over `view` ([x, y, width, height] in the logo's units). Every frame,
 * the still included, is the pieces, so the lap has no hand-off to make.
 */
export function frameSvg(A, a, { view, px, ground, ink }) {
  const P = pieces(A, a);
  const W = SPHERE.weight;
  const deep = A.deep * SPHERE.ring;
  const near = (p) => p.z >= 0;
  const far = (p) => p.z <= 0;
  const isDeep = (p) => Math.abs(p.z) >= deep;
  const cut = (d, width) => (d ? `<path d="${d}" fill="none" stroke="#000" stroke-width="${width}" stroke-linecap="butt" stroke-linejoin="round"/>` : '');
  const all = () => true;
  /* the cutters: the G and the T cut both sides; the meridian cuts its outer side only, as the logo's C gaps do */
  const gAll = cut(runs(P.g, all), W + 2 * A.gaps.meridian);
  const gDeep = cut(runs(P.g, isDeep), W + 2 * A.gaps.stem);
  const merNearAll = cut(runs(P.outer, near), W + A.gaps.c);
  const merNearDeep = cut(runs(P.outer, (p) => near(p) && isDeep(p)), W + A.gaps.c);
  const tDeep = P.tLines.map((l) => cut(runs(l, isDeep), W + 2 * A.gaps.stem)).join('');
  const [vx, vy, vw, vh] = view;
  const rect = `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#fff"/>`;
  const masks =
    `<mask id="mf" maskUnits="userSpaceOnUse" x="${vx}" y="${vy}" width="${vw}" height="${vh}">${rect}${gAll}${tDeep}</mask>` +
    `<mask id="mt" maskUnits="userSpaceOnUse" x="${vx}" y="${vy}" width="${vw}" height="${vh}">${rect}${gDeep}${merNearDeep}</mask>` +
    `<mask id="mg" maskUnits="userSpaceOnUse" x="${vx}" y="${vy}" width="${vw}" height="${vh}">${rect}${merNearAll}</mask>`;

  const stroke = (points, keep) => {
    const d = runs(points, keep);
    return d ? `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${W}" stroke-linecap="butt" stroke-linejoin="round"/>` : '';
  };
  const ring = `<circle cx="${CX}" cy="${CY}" r="${SPHERE.ring}" fill="none" stroke="${ink}" stroke-width="${W}"/>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${px[0]}" height="${px[1]}" viewBox="${view.join(' ')}" preserveAspectRatio="none">` +
    `<defs>${masks}</defs>` +
    `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="${ground}"/>` +
    `<g mask="url(#mf)">${stroke(P.meridian, far)}</g>` +
    `<g mask="url(#mt)"><path d="${polygon(P.t)}" fill="${ink}"/></g>` +
    `<g mask="url(#mg)">${stroke(P.g, all)}</g>` +
    stroke(P.meridian, near) +
    ring +
    `</svg>`
  );
}

/** The lap's frames as times in seconds. */
export function lapTimes(A) {
  const n = Math.round(A.lap.seconds * A.lap.fps);
  return Array.from({ length: n }, (_, i) => i / A.lap.fps);
}
