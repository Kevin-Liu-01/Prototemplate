/**
 * Picture-sampled fields for the dither loop: a tone grid decoded once from
 * a grayscale image, and a field that places it on a canvas by cover, by a
 * disc fit to a diameter about a canvas point, or by a file rectangle fit
 * inside a frame.
 */

import type { FieldFn } from './dither';

/**
 * The pixel space every placement is stated in: the deck's picture files
 * are 1600 by 900, and a tone grid of any resolution maps onto that space.
 */
export const PICTURE_FILE_WIDTH = 1600;
export const PICTURE_FILE_HEIGHT = 900;

/** A picture as tone, row major, 0..1 per cell, `width * height` long. */
export type PictureTone = {
  width: number;
  height: number;
  tone: Float32Array;
};

/** A rectangle on the canvas, in CSS px from the canvas's top left. */
export type PictureFrame = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * Where the picture file lands on the canvas, in the file's pixel space.
 * `cover` scales the file to cover the canvas and slides it so the focus
 * point stays in view. `disc` scales the file so the disc at `cx`, `cy`
 * of radius `r` is `diameter` CSS px across and puts the disc's centre on
 * `centre`, a canvas point in CSS px that may lie off the canvas. `region`
 * scales the file so the rectangle `x0`, `y0` to `x1`, `y1` fits inside
 * `frame` at its aspect, centred on it. Under `disc` and `region` the rest
 * of the file is drawn around the fit as far as the canvas reaches.
 */
export type PicturePlacement =
  | { kind: 'cover'; focusX: number; focusY: number }
  | {
      kind: 'disc';
      cx: number;
      cy: number;
      r: number;
      centre: { x: number; y: number };
      diameter: number;
    }
  | {
      kind: 'region';
      x0: number;
      y0: number;
      x1: number;
      y1: number;
      frame: PictureFrame;
    };

const toneCache = new Map<string, Promise<PictureTone>>();

/**
 * The red channel value under which a cell reads as 0. A JPEG grid's black
 * ground carries encoder ringing of a few values next to a bright subject,
 * and the Bayer tile's lowest threshold (1/128) would print those as stray
 * cells; 10 of 255 is above the ringing and below any tone a picture keeps.
 */
export const TONE_FLOOR = 10;

/** A channel byte as tone: 0 up to the floor, then the byte over 255. */
export function toneFromByte(value: number): number {
  return value <= TONE_FLOOR ? 0 : value / 255;
}

/**
 * Decodes the grayscale image at `src` into a tone grid, once per `src`:
 * repeat calls share one promise, and a failed decode is dropped from the
 * cache so a later call retries. Tone is the red channel over 255, read as
 * 0 at and under TONE_FLOOR.
 */
export function loadPictureTone(src: string): Promise<PictureTone> {
  const cached = toneCache.get(src);
  if (cached) return cached;
  const loading = decodePicture(src).catch((error) => {
    toneCache.delete(src);
    throw error;
  });
  toneCache.set(src, loading);
  return loading;
}

function decodePicture(src: string): Promise<PictureTone> {
  return new Promise<PictureTone>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('loadPictureTone needs a document'));
      return;
    }
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx || width === 0 || height === 0) {
        reject(new Error(`loadPictureTone could not decode ${src}`));
        return;
      }
      ctx.drawImage(image, 0, 0);
      const { data } = ctx.getImageData(0, 0, width, height);
      const tone = new Float32Array(width * height);
      for (let i = 0, j = 0; i < tone.length; i++, j += 4) {
        tone[i] = toneFromByte(data[j] ?? 0);
      }
      resolve({ width, height, tone });
    };
    image.onerror = () => {
      reject(new Error(`loadPictureTone could not load ${src}`));
    };
    image.src = src;
  });
}

/**
 * A field that reads `picture` through `placement` on a canvas of
 * `canvasWidth` by `canvasHeight` CSS px, drawn by a loop whose cell is
 * `cellSize` CSS px (default 1). The canvas cell at u, v is taken to sit
 * at `u * canvasWidth`, `v * canvasHeight`. Grid cell i, j covers the file
 * px from `i * 1600 / width`, `j * 900 / height` to the next cell's start,
 * so an 800 by 450 grid holds one cell per deck cell. A loop cell that
 * covers at most one grid cell reads the grid cell under its centre, so a
 * two-tone grid prints cell for cell where one loop cell is one grid
 * cell; a loop cell that covers more, the picture drawn smaller than that,
 * reads the area average of the grid cells under it, so the loop's screen
 * re-dithers the grid's density instead of beating against its pattern.
 * Tone is 0 outside the file; a `disc` placement with a radius or a
 * diameter of 0 or less, and a `region` placement on a frame or a
 * rectangle with no area, are 0 everywhere. Nothing clips to the canvas:
 * a read at a u or v outside 0..1 is the file's tone there. Time is
 * ignored.
 */
export function pictureField(
  picture: PictureTone,
  opts: {
    placement: PicturePlacement;
    canvasWidth: number;
    canvasHeight: number;
    cellSize?: number;
  }
): FieldFn {
  const { placement, canvasWidth, canvasHeight, cellSize = 1 } = opts;
  const { width, height, tone } = picture;
  if (width < 1 || height < 1) return () => 0;

  let scale: number;
  let offsetX: number;
  let offsetY: number;
  if (placement.kind === 'cover') {
    scale = Math.max(
      canvasWidth / PICTURE_FILE_WIDTH,
      canvasHeight / PICTURE_FILE_HEIGHT
    );
    offsetX = (canvasWidth - PICTURE_FILE_WIDTH * scale) * placement.focusX;
    offsetY = (canvasHeight - PICTURE_FILE_HEIGHT * scale) * placement.focusY;
  } else if (placement.kind === 'disc') {
    const { cx, cy, r, centre, diameter } = placement;
    if (!(r > 0) || !(diameter > 0)) return () => 0;
    scale = diameter / (2 * r);
    offsetX = centre.x - cx * scale;
    offsetY = centre.y - cy * scale;
  } else {
    const { x0, y0, x1, y1, frame } = placement;
    const rectWidth = x1 - x0;
    const rectHeight = y1 - y0;
    if (
      !(frame.width > 0) ||
      !(frame.height > 0) ||
      !(rectWidth > 0) ||
      !(rectHeight > 0)
    ) {
      return () => 0;
    }
    scale = Math.min(frame.width / rectWidth, frame.height / rectHeight);
    offsetX = frame.left + frame.width / 2 - ((x0 + x1) / 2) * scale;
    offsetY = frame.top + frame.height / 2 - ((y0 + y1) / 2) * scale;
  }
  if (!(scale > 0)) return () => 0;

  // Canvas px to grid cells: cell k spans [k, k + 1) in this space.
  const gridX = width / (PICTURE_FILE_WIDTH * scale);
  const gridY = height / (PICTURE_FILE_HEIGHT * scale);
  // The loop cell's footprint in grid cells.
  const spanX = Math.max(0, cellSize) * gridX;
  const spanY = Math.max(0, cellSize) * gridY;

  if (spanX <= 1 && spanY <= 1) {
    return (u, v) => {
      const gx = (u * canvasWidth - offsetX) * gridX;
      if (gx < 0 || gx >= width) return 0;
      const gy = (v * canvasHeight - offsetY) * gridY;
      if (gy < 0 || gy >= height) return 0;
      return tone[(gy | 0) * width + (gx | 0)] ?? 0;
    };
  }

  const halfX = spanX / 2;
  const halfY = spanY / 2;
  const area = spanX * spanY;
  return (u, v) => {
    const gx = (u * canvasWidth - offsetX) * gridX;
    const x0 = gx - halfX;
    const x1 = gx + halfX;
    if (x1 <= 0 || x0 >= width) return 0;
    const gy = (v * canvasHeight - offsetY) * gridY;
    const y0 = gy - halfY;
    const y1 = gy + halfY;
    if (y1 <= 0 || y0 >= height) return 0;
    const cx0 = Math.max(0, Math.floor(x0));
    const cx1 = Math.min(width, Math.ceil(x1));
    const cy0 = Math.max(0, Math.floor(y0));
    const cy1 = Math.min(height, Math.ceil(y1));
    let sum = 0;
    for (let cy = cy0; cy < cy1; cy++) {
      const wy = Math.min(y1, cy + 1) - Math.max(y0, cy);
      const row = cy * width;
      for (let cx = cx0; cx < cx1; cx++) {
        const wx = Math.min(x1, cx + 1) - Math.max(x0, cx);
        sum += (tone[row + cx] ?? 0) * wx * wy;
      }
    }
    return sum / area;
  };
}
