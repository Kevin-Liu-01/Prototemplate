import { bayerTile, type ShineTier } from './pricing-bayer';

/**
 * The shipped EnterpriseDither (services-landing/EnterpriseDither.tsx),
 * unchanged: the house ordered dither poured as one static blue wall —
 * solid accent at the right edge dissolving leftward through the 4x4 Bayer
 * tiers, dead vertical. Pure server-rendered SVG; the aura is in the
 * material, not in motion.
 *
 * bayerTile and ShineTier come from the Bayer kit a sibling page already
 * vendored into this folder from the same shipped module
 * (apps/landing/src/components/landing/shared/DitheredMark.tsx), rather
 * than a second copy of the same twenty lines.
 */

const RAMP: readonly ShineTier[] = [
  { cover: 16, width: 90 },
  { cover: 12, width: 26 },
  { cover: 8, width: 22 },
  { cover: 5, width: 18 },
  { cover: 3, width: 16 },
  { cover: 1, width: 14 },
];

const CELL = 3;
const TILE = CELL * 4;

export default function EnterpriseDither({
  className,
  zoom = 1,
}: {
  className?: string;
  /** Zooms the material OUT: the wall keeps its relative width but is
      built from `zoom`x more tiles at 1/`zoom` the screen size. */
  zoom?: number;
}) {
  const size = 400 * zoom;
  let edge = -60 * zoom;
  const bands = RAMP.map((tier) => {
    const width = tier.width * zoom;
    const band = { cover: tier.cover, x: edge, width };
    edge += width;
    return band;
  });

  return (
    <span
      className={`tce-dither${className ? ` ${className}` : ''}`}
      aria-hidden='true'
    >
      <svg viewBox={`0 0 ${size} ${size}`} preserveAspectRatio='xMaxYMid slice'>
        <defs>
          {RAMP.map((tier) => (
            <pattern
              id={`tce-dither-${zoom}-${tier.cover}`}
              key={tier.cover}
              width={TILE}
              height={TILE}
              patternUnits='userSpaceOnUse'
            >
              <path d={bayerTile(tier.cover, CELL)} />
            </pattern>
          ))}
        </defs>
        {/* mirrored: the dense tier hangs flush at the right edge and the
            ramp dissolves into the page */}
        <g transform={`translate(${size} 0) scale(-1 1)`}>
          {bands.map((band) => (
            <rect
              fill={`url(#tce-dither-${zoom}-${band.cover})`}
              height={size * 1.75}
              key={band.cover}
              width={band.width}
              x={band.x}
              y={-size * 0.375}
            />
          ))}
        </g>
      </svg>
    </span>
  );
}
