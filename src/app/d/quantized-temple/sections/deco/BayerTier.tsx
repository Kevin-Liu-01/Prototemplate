/**
 * Deco layer, shared helper. C1 homes served: section heads (C1.1, the
 * TierCrest), dividers (C1.2, the TierHatch), and the hero crown (C1.4, the
 * HeroCrown plinth).
 *
 * The house 4x4 Bayer screen as SVG pattern tiers. Every tonal step in this
 * direction's ornament is one of these tiers, never a gradient: a tier lights
 * k of the 16 cells in a tile, in the matrix's threshold order, so any two
 * tiers nest by construction and adjacent strips filled with different tiers
 * compose an exact stepped ramp. Cells are drawn in `currentColor`, so the
 * host SVG's CSS `color` is the ornament ink and the dark remap flows through.
 */

/** The 4x4 ordered-dither matrix, an exact permutation of 0..15. */
export const BAYER_4: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** A document-unique, url()-safe id root from React's `useId()` output. */
export function patternBase(prefix: string, reactId: string): string {
  return `${prefix}${reactId.replace(/[^A-Za-z0-9_-]/g, '')}`;
}

export function tierId(base: string, lit: number): string {
  return `${base}-t${lit}`;
}

export function tierFill(base: string, lit: number): string {
  return `url(#${tierId(base, lit)})`;
}

type BayerTierDefsProps = {
  base: string;
  /** The tiers to define, each as lit cells per 16. */
  tiers: readonly number[];
  /** Cell size in user units (CSS px when the SVG is unscaled). Default 3. */
  cell?: number;
};

/** One `<pattern>` per tier, tiled in user space so strips share one grid. */
export function BayerTierDefs({ base, tiers, cell = 3 }: BayerTierDefsProps) {
  const size = cell * 4;
  const unique = Array.from(new Set(tiers));
  return (
    <defs>
      {unique.map((lit) => (
        <pattern
          key={lit}
          id={tierId(base, lit)}
          width={size}
          height={size}
          patternUnits='userSpaceOnUse'
        >
          {BAYER_4.flatMap((row, y) =>
            row.map((value, x) =>
              value < lit ? (
                <rect
                  key={`${x}-${y}`}
                  x={x * cell}
                  y={y * cell}
                  width={cell}
                  height={cell}
                  fill='currentColor'
                />
              ) : null
            )
          )}
        </pattern>
      ))}
    </defs>
  );
}
