/**
 * BAYER-FRIEZE, the ornament engine.
 *
 * C1 homes this module serves: section heads (the frieze rule under
 * `.tc-head` and the stepped key in the `tc-head-icon` slot), dividers (the
 * `.tc-hatch` band and the chevron course seated on the pricing seam),
 * frames (the beaded mats of `.tc-mount`, `.tcr-mat`, `.tcb-art` and
 * `.tcb-ctx-box`, and the sawtooth under `.tc-code-bar`), the hero crown
 * (the sunrise over the mark and the meander on the plate's edges), and the
 * dark band (its chevron course).
 *
 * One 4x4 Bayer threshold matrix at four stepped densities: 1/16, 4/16,
 * 8/16 and 12/16. A density d lights every cell whose threshold is below d,
 * so the tiers nest: every tier's lit cells are a subset of the next tier's,
 * and the friezes read as one screen at four exposures rather than four
 * textures. Every ornament here is a list of unit cells. The `--bf-*` tokens
 * in styles.css are `mask-image` SVGs of those cells (`bayerCssTokens()`
 * prints them), so the page's `--deco-ornament` color shows through the lit
 * cells and the dark remap needs no second copy of any tile. The components
 * in Ornaments.tsx print the same cells inline in currentColor.
 *
 * Cell scale: friezes render at 2px per cell (an 8px tile); the two crown
 * figures render at 3px per cell. Both are CSS sizes; the SVGs carry unit
 * cells and `shape-rendering: crispEdges`, so cells stay square at any zoom.
 */

export const BAYER_4: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** The four stepped densities, out of 16. 16 renders solid; 0 renders nothing. */
export const DENSITIES = [1, 4, 8, 12] as const;

export type Cell = readonly [number, number];

/** A density field: the tier (out of 16) a cell belongs to, 0 for outside the shape. */
export type DensityField = (x: number, y: number) => number;

/** Whether the matrix lights cell (x, y) at the given density. */
export function lit(x: number, y: number, density: number): boolean {
  const row = BAYER_4[((y % 4) + 4) % 4];
  const threshold = row?.[((x % 4) + 4) % 4] ?? 16;
  return threshold < density;
}

/** Threshold a w by h field of densities into its lit cells. */
export function screen(w: number, h: number, field: DensityField): Cell[] {
  const out: Cell[] = [];
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const d = field(x, y);
      if (d > 0 && lit(x, y, d)) out.push([x, y]);
    }
  }
  return out;
}

/** One SVG path of unit squares, one `M x y h1v1h-1z` per lit cell. */
export function cellsPath(cells: readonly Cell[]): string {
  return cells.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join('');
}

/**
 * A CSS `url()` of the cells as an SVG mask. The path carries no fill
 * attribute: a mask reads alpha, and the default fill is opaque.
 */
export function maskUri(w: number, h: number, cells: readonly Cell[]): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' shape-rendering='crispEdges'><path d='${cellsPath(cells)}'/></svg>`;
  return `url("data:image/svg+xml,${svg}")`;
}

/* ------------------------------------------------------------------ *
 * The repeating units. Sizes are in cells; the CSS sets 2px per cell.
 * ------------------------------------------------------------------ */

/** A flat 4x4 tile at one density: the stripe frieze rows and the beaded mats. */
export function tile(density: number): Cell[] {
  return screen(4, 4, () => density);
}

/** The chevron course: a zigzag stroke two cells thick, peak up, 12 by 7 cells. */
export const CHEVRON = { w: 12, h: 7 } as const;

export function chevron(density = 12): Cell[] {
  return screen(CHEVRON.w, CHEVRON.h, (x, y) => {
    const dx = Math.abs(x + 0.5 - CHEVRON.w / 2);
    const y0 = Math.floor(dx);
    return y === y0 || y === y0 + 1 ? density : 0;
  });
}

/** The sawtooth: filled triangles on a one-cell base line, 8 by 4 cells. */
export const SAWTOOTH = { w: 8, h: 4 } as const;

export function sawtooth(density = 8): Cell[] {
  return screen(SAWTOOTH.w, SAWTOOTH.h, (x, y) => {
    const dx = Math.abs(x + 0.5 - SAWTOOTH.w / 2);
    return y >= Math.floor(dx) ? density : 0;
  });
}

/**
 * The Greek key: a continuous top rail two cells deep at 12/16, and under it
 * one square spiral hook at 8/16, two cells thick with two-cell gaps. The
 * unit is 12 by 12 cells; hooks repeat every 24px and join through the rail.
 */
export const KEY = { w: 12, h: 12 } as const;

const KEY_HOOK = [
  '............',
  '............',
  '..........##',
  '..........##',
  '..######..##',
  '..######..##',
  '..##..##..##',
  '..##..##..##',
  '..##..######',
  '..##..######',
  '............',
  '............',
] as const;

export function key(rail = 12, hook = 8): Cell[] {
  return screen(KEY.w, KEY.h, (x, y) => {
    if (y < 2) return rail;
    return KEY_HOOK[y]?.[x] === '#' ? hook : 0;
  });
}

/* ------------------------------------------------------------------ *
 * The two figures. Printed inline by Ornaments.tsx; the CSS sets 3px per cell.
 * ------------------------------------------------------------------ */

/**
 * The sunrise: a half disc of nine wedges alternating 12/16 and 4/16 around
 * a clear hub the mark sits in, rimmed at 12/16 on both its edges. 48 by 24
 * cells, center on the bottom edge.
 */
export const SUNRISE = { w: 48, h: 24, hub: 10 } as const;

export function sunrise(): Cell[] {
  const cx = SUNRISE.w / 2;
  const cy = SUNRISE.h;
  const r = SUNRISE.h;
  const wedges = 9;
  return screen(SUNRISE.w, SUNRISE.h, (x, y) => {
    const dx = x + 0.5 - cx;
    const dy = cy - (y + 0.5);
    const d = Math.hypot(dx, dy);
    if (d >= r || d < SUNRISE.hub) return 0;
    if (d >= r - 1.5 || d < SUNRISE.hub + 1.5) return 12;
    const theta = Math.atan2(dy, dx);
    const w = Math.min(wedges - 1, Math.floor((theta / Math.PI) * wedges));
    return w % 2 === 0 ? 12 : 4;
  });
}

/**
 * The stepped key: three nested corner brackets, two cells thick, stepping
 * inward five cells at a time and falling from 12/16 through 8/16 to 4/16.
 * 16 by 16 cells, opening toward the bottom right.
 */
export const STEP_KEY = { w: 16, h: 16 } as const;

export function stepKey(): Cell[] {
  const steps: readonly { at: number; density: number }[] = [
    { at: 0, density: 12 },
    { at: 5, density: 8 },
    { at: 10, density: 4 },
  ];
  return screen(STEP_KEY.w, STEP_KEY.h, (x, y) => {
    for (const step of steps) {
      const o = step.at;
      const onBar = y >= o && y <= o + 1 && x >= o;
      const onPost = x >= o && x <= o + 1 && y >= o;
      if (onBar || onPost) return step.density;
    }
    return 0;
  });
}

/* ------------------------------------------------------------------ *
 * The CSS tokens. `node -e "import('./bayer.ts').then(m => console.log(m.bayerCssTokens()))"`
 * prints the `--bf-*` block styles.css carries; regenerate after any change here.
 * ------------------------------------------------------------------ */

export function bayerCssTokens(): string {
  const lines = DENSITIES.map((d) => `  --bf-t${d}: ${maskUri(4, 4, tile(d))};`);
  lines.push(`  --bf-chev: ${maskUri(CHEVRON.w, CHEVRON.h, chevron())};`);
  lines.push(`  --bf-tri: ${maskUri(SAWTOOTH.w, SAWTOOTH.h, sawtooth())};`);
  lines.push(`  --bf-key: ${maskUri(KEY.w, KEY.h, key())};`);
  return lines.join('\n');
}
