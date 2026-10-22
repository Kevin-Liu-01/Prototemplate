/**
 * A small copy of the line auditor (scripts/lint/lines.mjs) for one plate:
 * it reads every border from computed CSS, adds the seams a row's ground
 * shows through its gaps, and reports two strokes from two owners within
 * 4px of each other along most of their run, seams no stroke covers, a
 * ground strip wider than one pixel, and ground left showing as a block.
 */

export type Segment = {
  orient: 'h' | 'v';
  /** the stroke's center line, in the root's pixels */
  pos: number;
  from: number;
  to: number;
  width: number;
  owner: string;
};

export type Mark =
  | { kind: 'doubled' | 'coincident'; orient: 'h' | 'v'; pos: number; from: number; to: number }
  | { kind: 'missing'; orient: 'h' | 'v'; pos: number; from: number; to: number }
  | { kind: 'bar'; orient: 'h' | 'v'; pos: number; from: number; to: number; width: number }
  | { kind: 'void'; x: number; y: number; w: number; h: number };

export type Audit = { seams: number; marks: Mark[] };

type Box = { left: number; top: number; right: number; bottom: number };

const NEAR = 4;

function boxOf(el: Element, origin: DOMRect): Box {
  const r = el.getBoundingClientRect();
  return { left: r.left - origin.left, top: r.top - origin.top, right: r.right - origin.left, bottom: r.bottom - origin.top };
}

/** The four borders of an element as segments, read from computed CSS; a transparent or zero side draws nothing. */
export function borderSegments(el: Element, owner: string, origin: DOMRect): Segment[] {
  const cs = getComputedStyle(el);
  const b = boxOf(el, origin);
  const side = (name: 'Top' | 'Right' | 'Bottom' | 'Left') => {
    const width = Number.parseFloat(cs.getPropertyValue(`border-${name.toLowerCase()}-width`)) || 0;
    const style = cs.getPropertyValue(`border-${name.toLowerCase()}-style`);
    const color = cs.getPropertyValue(`border-${name.toLowerCase()}-color`);
    const clear = /rgba?\([^)]*,\s*0\)$|transparent/.test(color);
    return style === 'none' || clear ? 0 : width;
  };
  const out: Segment[] = [];
  const t = side('Top');
  const r = side('Right');
  const btm = side('Bottom');
  const l = side('Left');
  if (t) out.push({ orient: 'h', pos: b.top + t / 2, from: b.left, to: b.right, width: t, owner });
  if (btm) out.push({ orient: 'h', pos: b.bottom - btm / 2, from: b.left, to: b.right, width: btm, owner });
  if (l) out.push({ orient: 'v', pos: b.left + l / 2, from: b.top, to: b.bottom, width: l, owner });
  if (r) out.push({ orient: 'v', pos: b.right - r / 2, from: b.top, to: b.bottom, width: r, owner });
  return out;
}

/**
 * Audits a grid. `owners` are the elements whose borders count, each with
 * its owner's name; `cells` are the grid's items; with `ground` the grid's
 * background shows through its gaps as the seams (a row that owns its
 * seams), and without it only borders draw.
 */
export function auditGrid(
  root: Element,
  owners: { el: Element; owner: string }[],
  cells: Element[],
  grid: Element,
  ground: boolean
): Audit {
  const origin = root.getBoundingClientRect();
  const segs = owners.flatMap(({ el, owner }) => borderSegments(el, owner, origin));
  const boxes = cells.map((cell) => boxOf(cell, origin));
  const marks: Mark[] = [];

  /* the pairs of cells that meet across a gap: every one is a seam that needs one stroke */
  const gridCs = getComputedStyle(grid);
  const reach = Math.max(Number.parseFloat(gridCs.columnGap) || 0, Number.parseFloat(gridCs.rowGap) || 0) + 1.5;
  const edges: { orient: 'h' | 'v'; lo: number; hi: number; from: number; to: number }[] = [];
  boxes.forEach((a, i) =>
    boxes.forEach((b, j) => {
      if (i === j) return;
      const dx = b.left - a.right;
      const dy = b.top - a.bottom;
      const overY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      const overX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      if (dx >= -0.5 && dx <= reach && overY > 4) {
        edges.push({ orient: 'v', lo: a.right, hi: b.left, from: Math.max(a.top, b.top), to: Math.min(a.bottom, b.bottom) });
      }
      if (dy >= -0.5 && dy <= reach && overX > 4) {
        edges.push({ orient: 'h', lo: a.bottom, hi: b.top, from: Math.max(a.left, b.left), to: Math.min(a.right, b.right) });
      }
    })
  );
  const seams = edges;

  /* the ground's strips: one segment per seam, as wide as the gap */
  if (ground) {
    for (const e of seams) {
      const width = e.hi - e.lo;
      if (width < 0.5) continue;
      segs.push({ orient: e.orient, pos: (e.lo + e.hi) / 2, from: e.from, to: e.to, width, owner: 'ground' });
      if (width > 1.5) marks.push({ kind: 'bar', orient: e.orient, pos: (e.lo + e.hi) / 2, from: e.from, to: e.to, width });
    }
  }

  /* doubled and coincident strokes */
  for (const orient of ['h', 'v'] as const) {
    const pool = segs.filter((s) => s.orient === orient).sort((a, b) => a.pos - b.pos);
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        const a = pool[i];
        const b = pool[j];
        if (!a || !b || b.pos - a.pos > NEAR) break;
        if (a.owner === b.owner) continue;
        const from = Math.max(a.from, b.from);
        const to = Math.min(a.to, b.to);
        const shorter = Math.min(a.to - a.from, b.to - b.from);
        if (to - from < Math.max(12, shorter * 0.75)) continue;
        const kind = b.pos - a.pos < 1 ? 'coincident' : 'doubled';
        if (marks.some((m) => m.kind !== 'void' && m.orient === orient && Math.abs(m.pos - a.pos) < 2 && m.from < to && m.to > from)) continue;
        marks.push({ kind, orient, pos: (a.pos + b.pos) / 2, from, to });
      }
    }
  }

  /* seams no stroke covers */
  for (const e of seams) {
    const mid = (e.lo + e.hi) / 2;
    const half = (e.hi - e.lo) / 2 + 1.5;
    const covered = segs.some(
      (s) => s.orient === e.orient && Math.abs(s.pos - mid) <= half && Math.min(s.to, e.to) - Math.max(s.from, e.from) > (e.to - e.from) * 0.5
    );
    if (!covered) marks.push({ kind: 'missing', orient: e.orient, pos: mid, from: e.from, to: e.to });
  }

  /* the ground left showing where no cell sits: sampled on a 4px grid inside the ground */
  if (ground) {
    const g = boxOf(grid, origin);
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (let y = g.top + 2; y < g.bottom - 1; y += 4) {
      for (let x = g.left + 2; x < g.right - 1; x += 4) {
        const inside = boxes.some((b) => x >= b.left - reach && x <= b.right + reach && y >= b.top - reach && y <= b.bottom + reach);
        if (inside) continue;
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x);
        y1 = Math.max(y1, y);
      }
    }
    if (x1 > x0) marks.push({ kind: 'void', x: x0 - 2, y: y0 - 2, w: x1 - x0 + 4, h: y1 - y0 + 4 });
  }

  /* each pair of cells was found from both sides; a seam counts once */
  const unique = new Set(seams.map((e) => `${e.orient}:${Math.round(e.lo)}:${Math.round(e.from)}`));
  return { seams: unique.size, marks };
}
