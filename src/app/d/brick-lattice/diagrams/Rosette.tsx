import { brickThreshold, rosetteValue } from './lattice';

/**
 * brick-lattice · a dot-rosette medallion in fine brick.
 *
 * Home: the languages band (one medallion per locale, the native name and
 * its flag chip seated on the core disc) and the section heads (the small
 * gold-cored mark before each h2). The medallion is the hero rosette's
 * geometry at tile scale: a running bond of 16x8 bricks in a square tile,
 * every brick thresholded against the Bayer screen, so the petals are
 * glazed dots that thicken toward each petal's core. Server-rendered and
 * deterministic: two paths (lapis, gold) over the bond pattern the band's
 * <defs> provides, so sixteen medallions cost a few kilobytes of markup.
 */
export type RosetteProps = {
  /** tile edge in CSS px; the SVG scales to it */
  size: number;
  /** stretcher width inside the tile's own 192-unit space */
  brick?: number;
  petals?: number;
  /** 'hollow' leaves the core to the host disc; 'gold' fills it */
  core?: 'hollow' | 'gold';
  className?: string;
};

const TILE = 192;

export default function Rosette({ size, brick = 16, petals = 8, core = 'hollow', className }: RosetteProps) {
  const bw = brick;
  const bh = brick / 2;
  const cols = Math.ceil(TILE / bw) + 1;
  const rows = Math.ceil(TILE / bh);
  const cx = TILE / 2;
  const cy = TILE / 2;
  const R = TILE * 0.48;
  const opts =
    core === 'gold'
      ? { petals, inner: 0.34, outer: 0.97, core: 0.3, ring: 0 }
      : { petals, inner: 0.6, outer: 0.98, core: 0, ring: 0.54 };

  const lapis: string[] = [];
  const gold: string[] = [];
  for (let row = 0; row < rows; row++) {
    const y = row * bh;
    const xOff = row & 1 ? -bh : 0;
    for (let col = 0; col <= cols; col++) {
      const x = xOff + col * bw;
      const dx = x + bw / 2 - cx;
      const dy = y + bh / 2 - cy;
      const r = Math.hypot(dx, dy) / R;
      const v = rosetteValue(r, Math.atan2(dy, dx), opts);
      const th = brickThreshold(col, row);
      const seg = `M${x + 1} ${y + 1}h${bw - 1}v${bh - 1}h${-(bw - 1)}Z`;
      if (v - 1 > th) gold.push(seg);
      else if (v > th) lapis.push(seg);
    }
  }

  return (
    <svg
      className={className ? `bl-ros-svg ${className}` : 'bl-ros-svg'}
      viewBox={`0 0 ${TILE} ${TILE}`}
      width={size}
      height={size}
      aria-hidden='true'
      shapeRendering='crispEdges'
    >
      <rect className='bl-ros-bond' width={TILE} height={TILE} />
      <path className='bl-ros-lapis' d={lapis.join('')} />
      <path className='bl-ros-gold' d={gold.join('')} />
    </svg>
  );
}
