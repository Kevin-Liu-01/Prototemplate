/* Prints a story's cover into a folio's canvas in the press material: the
   picture's light cut to three inks (navy, cobalt, sky) through a 4x4
   Bayer screen, one canvas pixel per cell. */

const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const INKS: readonly (readonly [number, number, number])[] = [
  [11, 22, 54],
  [52, 84, 230],
  [191, 226, 241],
];

/** Draws the picture, then calls `done`; the returned function stops a load still in flight. */
export function ditherCover(canvas: HTMLCanvasElement, src: string, done?: () => void): () => void {
  let alive = true;
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => {
    if (!alive) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const { width: w, height: h } = canvas;
    // cover-fit the picture into the canvas
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const sw = w / scale;
    const sh = h / scale;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, 0, 0, w, h);
    const image = ctx.getImageData(0, 0, w, h);
    const data = image.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const o = (y * w + x) * 4;
        const lum = (0.2126 * data[o]! + 0.7152 * data[o + 1]! + 0.0722 * data[o + 2]!) / 255;
        const v = Math.min(1, Math.max(0, (lum - 0.04) * 1.7)) * 2;
        const base = Math.floor(v);
        const t = (BAYER_4[(y & 3) * 4 + (x & 3)]! + 0.5) / 16;
        const level = Math.min(2, base + (v - base > t ? 1 : 0));
        const ink = INKS[level]!;
        data[o] = ink[0];
        data[o + 1] = ink[1];
        data[o + 2] = ink[2];
        data[o + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    done?.();
  };
  img.src = src;
  return () => {
    alive = false;
  };
}
