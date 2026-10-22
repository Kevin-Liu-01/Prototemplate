import { MOOD_PICTURES, type PictureName } from '@/components/plate/brand/moodPictures';
import {
  PICTURE_FILE_HEIGHT,
  PICTURE_FILE_WIDTH,
  loadPictureTone,
  pictureField,
  type PicturePlacement,
  type PictureTone,
} from '@/components/plate/lib/picture-field';

/**
 * What the lab's plates screen: the five artifact pictures as their tone
 * grids (public/brand/mood), a linear ramp, value noise, and a picture the
 * reader opens, which is read and converted in the browser and never sent
 * anywhere.
 */

export type SourceId = PictureName | 'ramp' | 'noise' | 'file';

export const PICTURE_ORDER: readonly PictureName[] = ['earth', 'rosetta', 'calligraphy', 'tablet', 'gloss'];

export const SOURCE_LABELS: Record<SourceId, string> = {
  earth: 'Earth',
  rosetta: 'Rosetta',
  calligraphy: 'Calligraphy',
  tablet: 'Tablet',
  gloss: 'Gloss',
  ramp: 'Ramp',
  noise: 'Noise',
  file: 'Yours',
};

/** A source ready to sample: a decoded tone grid, or null for the procedural ones. */
export type LoadedSource = { id: SourceId; picture: PictureTone | null };

export function isPicture(id: SourceId): id is PictureName {
  return id in MOOD_PICTURES;
}

/** The line printed under a plate for its source: the picture's title and credit. */
export function creditFor(id: SourceId, fileName?: string): string {
  if (isPicture(id)) {
    const { title, credit } = MOOD_PICTURES[id].caption;
    return `${title}. ${credit}.`;
  }
  if (id === 'ramp') return 'A linear ramp from tone 0 at the left to tone 1 at the right.';
  if (id === 'noise') return 'Value noise summed over four octaves.';
  return `${fileName ?? 'Your picture'}, read in this browser and never uploaded.`;
}

/** Decodes a source; a picture's grid is cached by its URL, so a second plate reuses it. */
export async function loadSource(id: SourceId, file: PictureTone | null): Promise<LoadedSource> {
  if (isPicture(id)) return { id, picture: await loadPictureTone(MOOD_PICTURES[id].src) };
  if (id === 'file') return { id, picture: file };
  return { id, picture: null };
}

/** Deterministic 2D value hash, 0 to 1. */
function hash2(x: number, y: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const sx = xf * xf * (3 - 2 * xf);
  const sy = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  const top = a + (b - a) * sx;
  return top + (c + (d - c) * sx - top) * sy;
}

/** Fractal value noise, 0 to 1, over four octaves. */
export function fbm(x: number, y: number): number {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  let fx = x;
  let fy = y;
  for (let o = 0; o < 4; o++) {
    sum += valueNoise(fx, fy) * amp;
    norm += amp;
    amp *= 0.5;
    fx *= 2.03;
    fy *= 2.01;
  }
  return sum / norm;
}

export type FillOptions = {
  /** seconds; the noise drifts and the ramp scrolls with it */
  time?: number;
  /** the earth's diameter as a share of the box's shorter side */
  disc?: number;
  /** a cell's height in CSS pixels when it is not square */
  cellH?: number;
};

/** Where a picture lands in a box of `width` by `height` CSS pixels. */
function placementFor(id: SourceId, width: number, height: number, disc: number): PicturePlacement {
  if (!isPicture(id)) return { kind: 'cover', focusX: 0.5, focusY: 0.5 };
  const placement = MOOD_PICTURES[id].placement;
  if (placement.kind === 'disc') {
    return { ...placement, centre: { x: width / 2, y: height / 2 }, diameter: Math.min(width, height) * disc };
  }
  if (placement.kind === 'cover') return placement;
  return { kind: 'cover', focusX: 0.5, focusY: 0.5 };
}

/**
 * Samples a source at the centre of every cell of a `cols` by `rows` grid
 * of `cell` CSS pixel cells into `out`. A picture cell that covers several
 * grid cells reads their area average, so the screen re-dithers the
 * picture's density instead of beating against it.
 */
export function fillTone(
  source: LoadedSource,
  cols: number,
  rows: number,
  cell: number,
  out: Float32Array,
  { time = 0, disc = 0.92, cellH = cell }: FillOptions = {}
): Float32Array {
  if (source.picture) {
    const width = cols * cell;
    const height = rows * cellH;
    const field = pictureField(source.picture, {
      placement: placementFor(source.id, width, height, disc),
      canvasWidth: width,
      canvasHeight: height,
      cellSize: Math.max(cell, cellH),
    });
    for (let y = 0, i = 0; y < rows; y++) {
      const v = (y + 0.5) / rows;
      for (let x = 0; x < cols; x++, i++) out[i] = field((x + 0.5) / cols, v, 0);
    }
    return out;
  }
  if (source.id === 'ramp') {
    for (let y = 0, i = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++, i++) {
        const u = (x + 0.5) / cols + time * 0.04;
        out[i] = u - Math.floor(u);
      }
    }
    return out;
  }
  /* noise: about six features across the shorter side, whatever the cell */
  const scale = 6 / Math.max(1, Math.min(cols * cell, rows * cellH));
  for (let y = 0, i = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++, i++) {
      const n = fbm((x + 0.5) * cell * scale + time * 0.35, (y + 0.5) * cellH * scale + time * 0.12);
      out[i] = Math.min(1, Math.max(0, (n - 0.5) * 1.9 + 0.5));
    }
  }
  return out;
}

/** The share of 256 bytes clipped at each end of a reader's picture, the cutter's autocontrast. */
const CLIP = 0.005;
/** The cutter's tone gamma. */
const GAMMA = 1.2;
/** The largest file the lab reads. */
const MAX_BYTES = 30 * 1024 * 1024;

/**
 * Reads an image file with FileReader and converts it to a tone grid at
 * the pictures' 1600 by 900: cover-fit, gray by Rec. 709 luma, levels
 * stretched so 0.5 percent clips at each end, then raised to 1.2.
 */
export function readPictureFile(file: File): Promise<PictureTone> {
  return new Promise<PictureTone>((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('The file is not an image.'));
      return;
    }
    if (file.size > MAX_BYTES) {
      reject(new Error('The file is over 30 MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The file could not be read.'));
    reader.onload = () => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        const tone = toneFromImage(image);
        if (tone) resolve(tone);
        else reject(new Error('The image could not be decoded.'));
      };
      image.onerror = () => reject(new Error('The image could not be decoded.'));
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function toneFromImage(image: HTMLImageElement): PictureTone | null {
  const width = PICTURE_FILE_WIDTH;
  const height = PICTURE_FILE_HEIGHT;
  const iw = image.naturalWidth;
  const ih = image.naturalHeight;
  if (!iw || !ih) return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  const scale = Math.max(width / iw, height / ih);
  ctx.drawImage(image, (width - iw * scale) / 2, (height - ih * scale) / 2, iw * scale, ih * scale);
  const { data } = ctx.getImageData(0, 0, width, height);
  const luma = new Uint8Array(width * height);
  const histogram = new Uint32Array(256);
  for (let i = 0, j = 0; i < luma.length; i++, j += 4) {
    const y = Math.round(0.2126 * (data[j] ?? 0) + 0.7152 * (data[j + 1] ?? 0) + 0.0722 * (data[j + 2] ?? 0));
    luma[i] = y;
    histogram[y] = (histogram[y] ?? 0) + 1;
  }
  const cut = luma.length * CLIP;
  let lo = 0;
  for (let seen = 0; lo < 255 && seen + (histogram[lo] ?? 0) <= cut; lo++) seen += histogram[lo] ?? 0;
  let hi = 255;
  for (let seen = 0; hi > 0 && seen + (histogram[hi] ?? 0) <= cut; hi--) seen += histogram[hi] ?? 0;
  const span = Math.max(1, hi - lo);
  const tone = new Float32Array(luma.length);
  for (let i = 0; i < luma.length; i++) {
    const t = Math.min(1, Math.max(0, ((luma[i] ?? 0) - lo) / span));
    tone[i] = Math.pow(t, GAMMA);
  }
  return { width, height, tone };
}
