/* The globe at the first stop as SVG path data, one path per ink, for the
   server markup: without JavaScript (and until the engine draws) the window
   shows the first stop at the figure's zoom in the theme's inks. Each row's runs of one ink are
   1-unit strokes on a STILL_CELLS-unit viewBox, so a cell is the same
   square the canvas prints. */

import { STOPS } from '@/app/d/blog-globe/_rounds/r3/stops';

import { aim, drawGlobe, makeDisc, ZOOM } from './field';

/** Cells across the still: exact at a 320 CSS px disc, scaled at others. */
export const STILL_CELLS = 160;

/** The cells printed at `level` as one path of horizontal runs, stroked 1 unit wide through the row's middle. */
export function runsPath(
  prints: Uint8Array,
  size: number,
  level: number
): string {
  let d = '';
  for (let y = 0; y < size; y++) {
    let pen = -1; // where the row's last run ended, -1 before its first
    for (let x = 0; x < size; ) {
      if (prints[y * size + x] !== level) {
        x++;
        continue;
      }
      let n = 1;
      while (x + n < size && prints[y * size + x + n] === level) n++;
      d += pen < 0 ? `M${x} ${y}.5h${n}` : `m${x - pen} 0h${n}`;
      pen = x + n;
      x += n;
    }
  }
  return d;
}

let still: { light: string; strong: string } | null = null;

/** The first stop's globe as path data for the light ink's cells and the strong ink's. Made once per page. */
export function firstStopStill() {
  if (still) return still;
  const grid = makeDisc(STILL_CELLS, ZOOM);
  const prints = new Uint8Array(STILL_CELLS * STILL_CELLS);
  drawGlobe(grid, aim(STOPS[0]), null, prints);
  still = {
    light: runsPath(prints, STILL_CELLS, 1),
    strong: runsPath(prints, STILL_CELLS, 2),
  };
  return still;
}
