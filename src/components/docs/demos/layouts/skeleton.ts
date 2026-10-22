import type { LandingMetrics } from './landing';

/**
 * The page skeleton's arithmetic: which part draws which rule, and how
 * tall each part stands at a width. Pure, so the plate renders every part
 * at an exact height and the overlay knows each seam's position without
 * measuring.
 */

export type PartKind = 'hero' | 'section' | 'hatch' | 'band';

export type Part = { id: number; kind: PartKind };

/**
 * The ownership rule. `one`: a section yields its bottom rule to a spacer
 * or a band under it, a spacer yields a seam to a band, and a spacer and a
 * band draw both of their own edges (v0-pages.css, the hatch spacers).
 * `each`: every part draws its own edges and nothing yields.
 */
export type Owners = 'one' | 'each';

export type Seam = 'ok' | 'doubled' | 'missing';

export type PartBox = Part & {
  top: boolean;
  bottom: boolean;
  /** the part's height, its own rules included */
  height: number;
  /** the part's top edge in the page */
  y: number;
  /** the seam above the part; null for the first part */
  above: Seam | null;
};

export const PART_NAMES: Record<PartKind, string> = {
  hero: 'Hero',
  section: 'Section',
  hatch: 'Hatch spacer',
  band: 'Full-bleed band',
};

/* the skeleton's own content sizes: a cell's h3 at 1.1rem, its copy at 14px over two lines, and a figure */
const CELL_TITLE = 17.6 * 1.06;
const CELL_COPY = 2 * 14 * 1.62;
const CELL_GAPS = 11 + 24;
export const CELL_FIG = 150;
export const BAND_FIG = 210;
const HERO_LEAD = 17 * 1.55;
export const HERO_GAP = 16;

/** The lines a head's copy takes in the column: the heading, and the lead at its 60ch measure. */
export function headLines(m: LandingMetrics): { h2: number; lead: number } {
  const content = m.column - 2 - 2 * m.gut;
  return { h2: m.h2Nowrap ? 1 : 2, lead: content >= 520 ? 1 : 2 };
}

export function cellHeight(m: LandingMetrics): number {
  return m.cellTop + CELL_TITLE + CELL_GAPS + CELL_COPY + CELL_FIG + m.cellBottom;
}

function contentHeight(kind: PartKind, m: LandingMetrics): number {
  const lines = headLines(m);
  if (kind === 'hatch') return m.hatch;
  if (kind === 'hero') return m.heroTop + 2 * m.heroH1 * m.heroLh + HERO_GAP + HERO_LEAD + m.ctaGap + m.btn + m.heroBottom;
  const head = m.h2 * m.h2Lh * lines.h2 + m.leadGap + m.lead * m.leadLh * lines.lead;
  if (kind === 'band') return m.bandTop + head + 28 + BAND_FIG + m.bandBottom;
  const cell = cellHeight(m);
  /* the head, the row's own top rule, then one row of cells or two stacked over the 1px seam */
  return m.headTop + head + m.headBottom + 1 + (m.stacked ? cell * 2 + 1 : cell);
}

/** Each part's rules, height and place, and the verdict on every seam. */
export function layoutParts(parts: readonly Part[], m: LandingMetrics, owners: Owners): PartBox[] {
  let y = 0;
  const edges = parts.map((part, i) => {
    const prev = parts[i - 1]?.kind;
    const next = parts[i + 1]?.kind;
    const last = i === parts.length - 1;
    if (part.kind === 'band') return { top: true, bottom: true };
    if (part.kind === 'hatch') {
      if (owners === 'each') return { top: true, bottom: true };
      return { top: prev !== 'band', bottom: next !== 'band' };
    }
    if (last) return { top: false, bottom: false };
    if (owners === 'each') return { top: false, bottom: true };
    return { top: false, bottom: next !== 'hatch' && next !== 'band' };
  });
  return parts.map((part, i) => {
    const edge = edges[i] ?? { top: false, bottom: false };
    const height = Math.round(contentHeight(part.kind, m)) + (edge.top ? 1 : 0) + (edge.bottom ? 1 : 0);
    const prev = edges[i - 1];
    const count = prev ? (prev.bottom ? 1 : 0) + (edge.top ? 1 : 0) : -1;
    const above: Seam | null = count < 0 ? null : count === 1 ? 'ok' : count === 2 ? 'doubled' : 'missing';
    const box: PartBox = { ...part, ...edge, height, y, above };
    y += height;
    return box;
  });
}

/** Who draws the rule above a part, in words. */
export function seamNote(box: PartBox, prev: PartBox | undefined): string {
  if (!prev || box.above === null) return 'Opens the page';
  if (box.above === 'doubled') return `Doubled: the ${PART_NAMES[prev.kind].toLowerCase()} and this part both draw it`;
  if (box.above === 'missing') return 'No rule: neither part draws it';
  return prev.bottom ? `Drawn by the ${PART_NAMES[prev.kind].toLowerCase()} above` : 'Drawn by this part';
}
