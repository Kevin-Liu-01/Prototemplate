/**
 * The shared glyph inventory and the Bayer atlas ditherer, extracted from
 * gt-cloud's @generaltranslation/ui glyph-field for the prototype: the
 * eight-script glyph set the rains draw from, and the threshold pass that
 * pre-dithers the atlas's mid and far rows at build time.
 */

export const GLYPHS: readonly string[] = [
  'l',
  'a',
  'n',
  'g',
  'e',
  't',
  '语',
  '言',
  '文',
  '字',
  'ل',
  'غ',
  'ة',
  'भ',
  'ष',
  'म',
  'न',
  'я',
  'з',
  'ы',
  'к',
  '언',
  '어',
  '한',
  'γ',
  'λ',
  'σ',
  'α',
  'ภ',
  'า',
  'ษ',
];

const BAYER: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/**
 * Threshold the atlas's mid and far rows through the Bayer matrix, in CSS-px
 * cells: every kept pixel becomes full ink, every dropped one paper. Runs at
 * atlas build time only - the frame loop draws pre-dithered bitmaps.
 */
export function ditherAtlasRows(
  ctx: CanvasRenderingContext2D,
  widthPx: number,
  heightPx: number,
  dpr: number,
  rowOfY: (cssY: number) => number,
  coverOfRow: (row: number) => number
): void {
  const img = ctx.getImageData(0, 0, widthPx, heightPx);
  const data = img.data;
  for (let y = 0; y < heightPx; y++) {
    const cssY = Math.floor(y / dpr);
    const cover = coverOfRow(rowOfY(cssY));
    if (cover >= 1) continue;
    const bayerRow = BAYER[y % 4] ?? BAYER[0] ?? [0, 8, 2, 10];
    for (let x = 0; x < widthPx; x++) {
      const idx = (y * widthPx + x) * 4 + 3;
      const alpha = data[idx] ?? 0;
      if (alpha === 0) continue;
      const threshold = ((bayerRow[x % 4] ?? 0) + 0.5) / 16;
      data[idx] = (alpha / 255) * cover > threshold ? 255 : 0;
    }
  }
  ctx.putImageData(img, 0, 0);
}
