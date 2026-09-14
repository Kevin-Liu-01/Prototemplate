import { useId } from 'react';

/**
 * MarbleBand. Deco home: C1.2, dividers. The `.tc-hatch` spacer of the base
 * becomes a combed-marble endpaper band, the leaf a bound report turns
 * between its sections: parallel waves drawn as 1px gold hairlines inside
 * one SVG pattern. Hairline geometry only, no fills, no gradients, no
 * motion. The element keeps the hatch spacer's one-owner boundary rules
 * (styles.css), so it never doubles a seam it sits on.
 */

const TILE_W = 72;
const PITCH = 4.4;
const LINES = 12;
const TILE_H = LINES * PITCH;
const SAMPLES = 24;

/** One combed wave across the tile, smoothed through the sample midpoints. */
function wave(y: number, amp: number, phase: number): string {
  const pts: [number, number][] = [];
  for (let k = 0; k <= SAMPLES; k += 1) {
    const x = (k / SAMPLES) * TILE_W;
    pts.push([x, y + amp * Math.sin((k / SAMPLES) * Math.PI * 2 + phase)]);
  }
  const first = pts[0];
  const last = pts[pts.length - 1];
  if (!first || !last) return '';
  let d = `M${first[0].toFixed(2)} ${first[1].toFixed(2)}`;
  for (let i = 1; i < pts.length - 1; i += 1) {
    const p = pts[i];
    const q = pts[i + 1];
    if (!p || !q) break;
    const mx = (p[0] + q[0]) / 2;
    const my = (p[1] + q[1]) / 2;
    d += ` Q${p[0].toFixed(2)} ${p[1].toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)}`;
  }
  d += ` L${last[0].toFixed(2)} ${last[1].toFixed(2)}`;
  return d;
}

/* The comb drags every line together, so the waves share a period; a slow
   phase drift and two amplitudes give the nonpareil its grain. */
const PATHS: readonly string[] = Array.from({ length: LINES }, (_, i) =>
  wave(PITCH / 2 + i * PITCH, i % 2 === 0 ? 1.7 : 2.2, i * 0.32)
);

export default function MarbleBand() {
  const rawId = useId();
  const patternId = `glm-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <div className='tc-hatch gl-marble' aria-hidden='true'>
      <svg xmlns='http://www.w3.org/2000/svg' focusable='false'>
        <defs>
          <pattern id={patternId} width={TILE_W} height={TILE_H} patternUnits='userSpaceOnUse'>
            {PATHS.map((d, i) => (
              <path d={d} key={i} />
            ))}
          </pattern>
        </defs>
        <rect width='100%' height='100%' fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
