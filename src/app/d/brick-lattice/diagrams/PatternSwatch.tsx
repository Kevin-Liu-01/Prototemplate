import { brickThreshold, FIELDS } from './lattice';
import type { FieldName, LatticeCell } from './lattice';

/**
 * brick-lattice · a pattern from the book, at tile scale.
 *
 * Home: the section heads (the mark before each h2 is the section's own
 * bond pattern) and the footer's pattern book, where the six patterns are
 * printed in a row with their names. The swatch runs the same field
 * function the section's canvas runs, over a square tile of fine running
 * bond, every brick thresholded against the house Bayer screen; so the
 * swatch is the pattern, not a picture of it. Server-rendered and
 * deterministic: two paths (lapis, gold) over the bond pattern the page's
 * <defs> provides, or over nothing when the host wants only the glaze.
 */
export type PatternSwatchProps = {
  field: FieldName;
  /** tile edge in CSS px; the SVG scales to it */
  size: number;
  /** stretcher width inside the tile's own 192-unit space */
  brick?: number;
  /** 'bond' fills the ground with fired clay; 'none' leaves the host's surface */
  ground?: 'bond' | 'none';
  className?: string;
};

const TILE = 192;

export default function PatternSwatch({ field, size, brick = 16, ground = 'bond', className }: PatternSwatchProps) {
  const fn = FIELDS[field];
  const bw = brick;
  const bh = brick / 2;
  const cols = Math.ceil(TILE / bw) + 1;
  const rows = Math.ceil(TILE / bh);

  /* the rosette centres on an anchor; the others ignore it. Half the tile, centred. */
  const anchor = field === 'rosette' ? { ax: TILE * 0.25, ay: TILE * 0.25, aw: TILE * 0.5, ah: TILE * 0.5 } : { ax: 0, ay: 0, aw: 0, ah: 0 };

  const cell: LatticeCell = {
    x: 0,
    y: 0,
    w: TILE,
    h: TILE,
    bw,
    bh,
    col: 0,
    row: 0,
    ...anchor,
    t: 0,
    k: 0,
  };

  const lapis: string[] = [];
  const gold: string[] = [];
  for (let row = 0; row < rows; row++) {
    const y = row * bh;
    const xOff = row & 1 ? -bh : 0;
    cell.row = row;
    cell.y = y + bh / 2;
    for (let col = 0; col <= cols; col++) {
      const x = xOff + col * bw;
      cell.col = col;
      cell.x = x + bw / 2;
      const v = fn(cell);
      const th = brickThreshold(col, row);
      const seg = `M${x + 1} ${y + 1}h${bw - 1}v${bh - 1}h${-(bw - 1)}Z`;
      if (v - 1 > th) gold.push(seg);
      else if (v > th) lapis.push(seg);
    }
  }

  const classes = ['bl-swatch', `is-${field}`];
  if (className) classes.push(className);

  return (
    <svg
      className={classes.join(' ')}
      viewBox={`0 0 ${TILE} ${TILE}`}
      width={size}
      height={size}
      aria-hidden='true'
      shapeRendering='crispEdges'
    >
      {ground === 'bond' ? <rect className='bl-swatch-bond' width={TILE} height={TILE} /> : null}
      <path className='bl-swatch-lapis' d={lapis.join('')} />
      <path className='bl-swatch-gold' d={gold.join('')} />
    </svg>
  );
}
