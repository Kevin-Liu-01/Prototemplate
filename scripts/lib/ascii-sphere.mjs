// The ASCII renderer of the logo's sphere, shared by pnpm build:logo-ascii
// (scripts/build/logo-ascii.mjs, the loader's frames) and
// pnpm build:ascii-armillary (scripts/build/ascii-armillary.mjs, the
// armillary GIF on /marks/ascii).
//
// Lines are points on the sphere, turned to the camera. A cell of the grid
// takes a glyph when enough of its 4 by 8 sample points lie within `line`
// units of a near point, within `ringLine` of the outer ring's circle, or
// (when far points are given) within `line` of a far point; its level is the
// share times `gain` times (ambient + (1 - ambient) times the Lambert
// shade), and the glyph is the ramp's entry past as many `cuts` as the level
// reaches. A far point's normal faces away from the viewer and its level is
// scaled by `far`, so the back of a ring reads darker than its front.

const DEG = Math.PI / 180;
/** the sphere's radius in logo units, the meridian's and the latitude's */
export const R = 96.26;

/** the camera: yaw about the vertical, pitch about the horizontal, roll about the view axis (Rz Rx Ry) */
export function camera({ yaw, pitch, roll }) {
  const [cy, sy, cp, sp, cr, sr] = [Math.cos(yaw * DEG), Math.sin(yaw * DEG), Math.cos(pitch * DEG), Math.sin(pitch * DEG), Math.cos(roll * DEG), Math.sin(roll * DEG)];
  const Ry = [[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]];
  const Rx = [[1, 0, 0], [0, cp, -sp], [0, sp, cp]];
  const Rz = [[cr, -sr, 0], [sr, cr, 0], [0, 0, 1]];
  const mul = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, v, k) => s + v * B[k][j], 0)));
  return mul(Rz, mul(Rx, Ry));
}

export const apply = (M, p) => [M[0][0] * p[0] + M[0][1] * p[1] + M[0][2] * p[2], M[1][0] * p[0] + M[1][1] * p[1] + M[1][2] * p[2], M[2][0] * p[0] + M[2][1] * p[1] + M[2][2] * p[2]];

/** The grid's cell centres in logo units from the sphere's centre (y down), from a config's `grid` block. */
export function gridOf(C) {
  const [PX, PY] = C.grid.pxPerUnit;
  const [CXP, CYP] = C.grid.centrePx;
  const [CW, CH] = C.grid.cellPx;
  const [X0, Y0] = C.grid.firstCellCentrePx;
  return {
    cols: C.grid.cols,
    rows: C.grid.rows,
    cu: (c) => (X0 + CW * c - CXP) / PX,
    cv: (r) => (Y0 + CH * r - CYP) / PY,
    cellU: CW / PX,
    cellV: CH / PY,
  };
}

/** The distance from (u, v) to the nearest of `pts` (camera space), searched in 8 unit buckets. */
function nearest(pts) {
  const B = 8;
  const grid = new Map();
  for (const p of pts) {
    const key = `${Math.floor(p[0] / B)},${Math.floor(p[1] / B)}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(p);
  }
  return (u, v) => {
    const i = Math.floor(u / B);
    const j = Math.floor(v / B);
    let best = Infinity;
    for (let di = -1; di <= 1; di++) {
      for (let dj = -1; dj <= 1; dj++) {
        for (const p of grid.get(`${i + di},${j + dj}`) ?? []) best = Math.min(best, Math.hypot(u - p[0], v - p[1]));
      }
    }
    return best;
  };
}

/**
 * One frame's levels, a row of numbers (null where a cell takes no glyph)
 * for each row of the grid. `near` and `far` are points in camera space;
 * the outer ring is drawn when C.ringR is set. C holds grid, light,
 * ambient, gain { line, ring }, floor, line, ringLine, ringR, sample and,
 * for far points, far.
 */
export function cellLevels(C, near, far = []) {
  const G = gridOf(C);
  const L = (() => {
    const v = C.light;
    const n = Math.hypot(...v);
    return v.map((x) => x / n);
  })();
  const dNear = nearest(near);
  const dFar = far.length ? nearest(far) : () => Infinity;
  const rows = [];
  for (let r = 0; r < G.rows; r++) {
    const row = [];
    for (let c = 0; c < G.cols; c++) {
      const x = G.cu(c);
      const y = G.cv(r);
      let inLine = 0;
      let inRing = 0;
      let inFar = 0;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 8; j++) {
          const u = x + ((i + 0.5) / 4 - 0.5) * G.cellU * C.sample[0];
          const v = y + ((j + 0.5) / 8 - 0.5) * G.cellV * C.sample[1];
          if (dNear(u, v) < C.line) inLine++;
          else if (C.ringR && Math.abs(Math.hypot(u, v) - C.ringR) < C.ringLine) inRing++;
          else if (dFar(u, v) < C.line) inFar++;
        }
      }
      const cov = (inLine + inRing + inFar) / 32;
      if (cov < C.floor) {
        row.push(null);
        continue;
      }
      const rr = Math.hypot(x, y);
      const back = inFar > inLine && inFar > inRing;
      const onLine = back || inLine >= inRing;
      const depth = Math.sqrt(Math.max(R * R - rr * rr, 0)) / R;
      const n = onLine && rr < 96 ? [x / R, y / R, back ? -depth : depth] : [x / Math.max(rr, 1e-6), y / Math.max(rr, 1e-6), 0];
      const shade = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);
      const gain = onLine ? C.gain.line : C.gain.ring;
      row.push(Math.min(1, cov * gain) * (C.ambient + (1 - C.ambient) * shade) * (back ? C.far : 1));
    }
    rows.push(row);
  }
  return rows;
}

/** Levels as glyphs: a space where there is none, else the ramp's entry past as many of `cuts` as the level reaches. */
export const glyphs = (levels, ramp, cuts) => levels.map((row) => row.map((level) => (level === null ? ' ' : ramp[cuts.filter((cut) => level >= cut).length])).join(''));

/** One frame's glyph rows, with C's ramp and cuts. */
export const shadedRows = (C, near, far = []) => glyphs(cellLevels(C, near, far), C.ramp, C.cuts);
