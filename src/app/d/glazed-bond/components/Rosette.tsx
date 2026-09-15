import { useId } from 'react';

import { sheenId } from './GlazeDefs';

/**
 * Deco homes: the rosette bands (dividers), the medallions (languages), the
 * parapets (tower tops, in two rhythms), the wedge numerals (course and
 * beat numbers).
 *
 * Every shape is a radial or stepped repeat: rhombus petals around a disc
 * for the Ishtar Gate rosette, three-step merlons for the gate's
 * crenellation and two-step merlons for the court's, vertical wedges for
 * the numerals. No figure appears. Colors come from the sheet through
 * class names so the geometry remaps with the theme where it should and
 * stays glazed where it should not. The medallion's dome carries a
 * dithered cap from the shared glaze tiles, the catch-light on a glazed
 * disc, in two non-overlapping tiers.
 */

const TAU = Math.PI * 2;

function pt(cx: number, cy: number, r: number, a: number): string {
  return `${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`;
}

/** One rhombus petal from radius r1 to r2 at angle a, half-width w at its middle. */
function petal(cx: number, cy: number, a: number, r1: number, r2: number, w: number): string {
  const rm = (r1 + r2) / 2;
  const side = Math.atan2(w, rm);
  return [pt(cx, cy, r1, a), pt(cx, cy, rm, a - side), pt(cx, cy, r2, a), pt(cx, cy, rm, a + side)].join(' ');
}

/** The radial repeat of petals as one path of polygons. */
function petals(cx: number, cy: number, count: number, r1: number, r2: number, w: number): string[] {
  const out: string[] = [];
  for (let k = 0; k < count; k++) {
    out.push(petal(cx, cy, (k / count) * TAU - Math.PI / 2, r1, r2, w));
  }
  return out;
}

/** The circular segment of a disc above the chord at height k over the center. */
function cap(c: number, r: number, k: number): string {
  const half = Math.sqrt(Math.max(0, r * r - k * k));
  const y = (c - k).toFixed(2);
  return `M${(c - half).toFixed(2)} ${y}A${r} ${r} 0 0 1 ${(c + half).toFixed(2)} ${y}Z`;
}

/* ------------------------------------------------------------------ *
 * The medallion: a lapis disc under a dithered glaze cap, a turquoise
 * glaze ring, sixteen gold petals, a gold outer ring. The script sample is
 * HTML laid over the center by the host.
 * ------------------------------------------------------------------ */

export type RosetteProps = { size?: number; className?: string };

export default function Rosette({ size = 120, className }: RosetteProps) {
  const c = size / 2;
  const disc = c - 2;
  const outer = c - 6;
  const r1 = c * 0.56;
  const r2 = c * 0.86;
  const kHigh = disc * 0.62;
  const kLow = disc * 0.3;
  return (
    <svg
      className={className ? `gb-rosette ${className}` : 'gb-rosette'}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-hidden='true'
      focusable='false'
    >
      <circle className='gb-ros-disc' cx={c} cy={c} r={disc} />
      {/* the glaze cap: the dense tier at the crown, the thin tier in the ring under it */}
      <path d={cap(c, disc, kHigh)} fill={`url(#${sheenId('cream', 'b')})`} />
      <path
        d={`${cap(c, disc, kLow)}${cap(c, disc, kHigh)}`}
        fillRule='evenodd'
        fill={`url(#${sheenId('cream', 'c')})`}
      />
      <circle className='gb-ros-ring' cx={c} cy={c} r={outer} />
      {petals(c, c, 16, r1, r2, c * 0.07).map((points, i) => (
        <polygon className='gb-ros-petal' points={points} key={i} />
      ))}
      <circle className='gb-ros-glaze' cx={c} cy={c} r={r1 - 4} />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * The band: a frieze of small gold rosettes on lapis between two gold
 * register rules, each rosette ringed in turquoise glaze at its heart.
 * One pattern tile, repeated across any width.
 * ------------------------------------------------------------------ */

export const BAND_H = 44;
const BAND_TILE = 56;

export type RosetteBandProps = { className?: string };

export function RosetteBand({ className }: RosetteBandProps) {
  const raw = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = `gb-frieze-${raw}`;
  const c = BAND_TILE / 2;
  const cy = BAND_H / 2;
  return (
    <svg
      className={className ? `gb-band-svg ${className}` : 'gb-band-svg'}
      aria-hidden='true'
      focusable='false'
    >
      <defs>
        <pattern id={id} width={BAND_TILE} height={BAND_H} patternUnits='userSpaceOnUse'>
          <circle className='gb-band-ring' cx={c} cy={cy} r={17} />
          {petals(c, cy, 12, 6, 15, 2.4).map((points, i) => (
            <polygon className='gb-band-gold' points={points} key={i} />
          ))}
          <circle className='gb-band-turq' cx={c} cy={cy} r={4.6} />
          <circle className='gb-band-gold' cx={c} cy={cy} r={2.4} />
        </pattern>
      </defs>
      <rect className='gb-band-ground' width='100%' height='100%' />
      <rect width='100%' height='100%' fill={`url(#${id})`} />
      <rect className='gb-band-gold' x={0} y={5} width='100%' height={1} />
      <rect className='gb-band-gold' x={0} y={BAND_H - 6} width='100%' height={1} />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * The parapet: stepped merlons on a rail, the Babylonian crenellation.
 * Period 48, three steps of 12; the top step is turquoise glaze on the
 * lapis merlon. The gate towers and the pricing towers wear it.
 * ------------------------------------------------------------------ */

export const PARAPET_H = 44;
const MERLON_W = 48;

export type ParapetProps = { className?: string };

export function Parapet({ className }: ParapetProps) {
  const raw = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = `gb-merlon-${raw}`;
  return (
    <svg
      className={className ? `gb-parapet ${className}` : 'gb-parapet'}
      height={PARAPET_H}
      aria-hidden='true'
      focusable='false'
      shapeRendering='crispEdges'
    >
      <defs>
        <pattern id={id} width={MERLON_W} height={PARAPET_H} patternUnits='userSpaceOnUse'>
          <rect className='gb-glaze' x={6} y={24} width={36} height={12} />
          <rect className='gb-glaze' x={12} y={12} width={24} height={12} />
          <rect className='gb-turq' x={18} y={0} width={12} height={12} />
        </pattern>
      </defs>
      <rect width='100%' height={PARAPET_H} fill={`url(#${id})`} />
      <rect className='gb-glaze' x={0} y={36} width='100%' height={8} />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * The court parapet: the second crenellation rhythm. Period 36, two steps
 * of 10, the court's own lapis rising into the ground above it, each
 * merlon capped with a line of turquoise glaze, and a turquoise register
 * rule where the rail meets the court wall.
 * ------------------------------------------------------------------ */

export const COURT_PARAPET_H = 24;
const COURT_MERLON_W = 36;

export type CourtParapetProps = { className?: string };

export function CourtParapet({ className }: CourtParapetProps) {
  const raw = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = `gb-court-merlon-${raw}`;
  return (
    <svg
      className={className ? `gb-court-parapet ${className}` : 'gb-court-parapet'}
      height={COURT_PARAPET_H}
      aria-hidden='true'
      focusable='false'
      shapeRendering='crispEdges'
    >
      <defs>
        <pattern id={id} width={COURT_MERLON_W} height={COURT_PARAPET_H} patternUnits='userSpaceOnUse'>
          <rect className='gb-court-fill' x={4} y={10} width={28} height={10} />
          <rect className='gb-court-fill' x={11} y={3} width={14} height={7} />
          <rect className='gb-turq' x={11} y={0} width={14} height={3} />
        </pattern>
      </defs>
      <rect width='100%' height={COURT_PARAPET_H} fill={`url(#${id})`} />
      <rect className='gb-court-fill' x={0} y={20} width='100%' height={4} />
      <rect className='gb-turq' x={0} y={20} width='100%' height={1} />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * The wedge numeral: n vertical wedges in rows of three, the Babylonian
 * unit sign. Fills currentColor so the host sets the ink.
 * ------------------------------------------------------------------ */

const WEDGE_W = 10;
const WEDGE_H = 18;
const WEDGE_GAP = 3;

export type WedgeNumeralProps = { n: number; className?: string; label?: string };

export function WedgeNumeral({ n, className, label }: WedgeNumeralProps) {
  const count = Math.max(1, Math.min(9, Math.round(n)));
  const cols = Math.min(3, count);
  const rows = Math.ceil(count / 3);
  const width = cols * WEDGE_W + (cols - 1) * WEDGE_GAP;
  const height = rows * WEDGE_H + (rows - 1) * WEDGE_GAP;
  const wedges: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = (i % 3) * (WEDGE_W + WEDGE_GAP);
    const y = Math.floor(i / 3) * (WEDGE_H + WEDGE_GAP);
    wedges.push(`M${x} ${y}h${WEDGE_W}l-3.6 6.4v${WEDGE_H - 6.4}h-2.8v-${WEDGE_H - 6.4}z`);
  }
  return (
    <svg
      className={className ? `gb-wedge ${className}` : 'gb-wedge'}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
      focusable='false'
    >
      <path d={wedges.join('')} fill='currentColor' />
    </svg>
  );
}
