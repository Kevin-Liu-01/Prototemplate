/**
 * The stage's three colors as numbers. The plates read --dmo-ink,
 * --dmo-ground and --dmo-accent off the stage (demos.css binds them to the
 * docs theme) and resolve each through a 1 by 1 canvas, so any CSS color
 * the tokens hold comes back as sRGB channels from 0 to 1, unconverted.
 */

export type Rgb = readonly [number, number, number];

export type StageInks = {
  ink: Rgb;
  ground: Rgb;
  accent: Rgb;
  /** the ground is darker than the ink: light cells on ink */
  dark: boolean;
};

let probe: CanvasRenderingContext2D | null = null;

/** One CSS color as sRGB channels from 0 to 1; the fallback when the string does not parse. */
export function parseColor(css: string, fallback: Rgb): Rgb {
  if (typeof document === 'undefined' || !css) return fallback;
  if (!probe) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    probe = canvas.getContext('2d', { willReadFrequently: true });
  }
  if (!probe) return fallback;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = 'transparent';
  probe.fillStyle = css;
  probe.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0, a = 0] = probe.getImageData(0, 0, 1, 1).data;
  if (a === 0) return fallback;
  return [r / 255, g / 255, b / 255];
}

function luma([r, g, b]: Rgb): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const NEAR_BLACK: Rgb = [7 / 255, 7 / 255, 7 / 255];
const NEAR_WHITE: Rgb = [242 / 255, 242 / 255, 240 / 255];
const GT_BLUE: Rgb = [47 / 255, 92 / 255, 224 / 255];

/** The stage's ink, ground and accent, read from the element's computed tokens. */
export function readInks(el: Element): StageInks {
  const style = getComputedStyle(el);
  const ink = parseColor(style.getPropertyValue('--dmo-ink').trim(), NEAR_BLACK);
  const ground = parseColor(style.getPropertyValue('--dmo-ground').trim(), NEAR_WHITE);
  const accent = parseColor(style.getPropertyValue('--dmo-accent').trim(), GT_BLUE);
  return { ink, ground, accent, dark: luma(ground) < luma(ink) };
}

/** An sRGB triple as a CSS rgb() string, for a 2D context. */
export function cssRgb([r, g, b]: Rgb, alpha = 1): string {
  return `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)} / ${alpha})`;
}

/** An sRGB triple packed for a Uint32 view of ImageData (little-endian ABGR), fully opaque. */
export function packRgb([r, g, b]: Rgb): number {
  return ((255 << 24) | (Math.round(b * 255) << 16) | (Math.round(g * 255) << 8) | Math.round(r * 255)) >>> 0;
}
