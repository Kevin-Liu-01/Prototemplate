/* The press globe: an orthographic Earth printed in the house 1-bit
   material, one canvas pixel per cell and a 4x4 Bayer screen, upscaled by
   CSS with image-rendering: pixelated. It draws once per camera and only
   animates while it turns to a new place. Inks come from the canvas's CSS
   custom properties, so a theme change repaints it in the new colors. */

import type { LatLon } from './coords';
import { landAt } from './geo/land';
import { project, turnToward, wrap180, type GlobeCamera } from './geo/ortho';

const RAD = Math.PI / 180;
const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/* light from the upper left, in view space (x right, y up, z toward the reader) */
const LIGHT = (() => {
  const v = [-0.55, 0.6, 0.58];
  const len = Math.hypot(v[0]!, v[1]!, v[2]!);
  return v.map((c) => c / len) as [number, number, number];
})();

export type GlobeHandle = {
  turnTo(target: LatLon, ms?: number): void;
  repaint(): void;
  destroy(): void;
};

type Inks = { land: number[]; sea: number[]; rim: number[] };

function hex(value: string, fallback: number[]): number[] {
  const m = /^#?([0-9a-f]{6})$/i.exec(value.trim());
  if (!m) return fallback;
  const n = parseInt(m[1]!, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Where the camera sits to show `p` above and right of the disc's centre; `tilt` is how far above, in degrees. */
export function cameraFor(p: LatLon, tilt = 14): GlobeCamera {
  return { lat0: Math.max(-60, Math.min(60, p.lat - tilt)), lon0: wrap180(p.lon - 22) };
}

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/** Degrees between the coordinate lines. */
const GRID = 15;

/**
 * Mounts on a canvas inside a square box. `pin` is moved to the target's
 * place on the disc (left/top in percent) and hidden behind the limb; the
 * box carries the same place as --px and --py, for a leader line to a
 * readout. Any element in the box with data-lat and data-lon is placed the
 * same way, and the box fires gtp-globe-placed after each placing.
 * `graticule` prints the parallels and meridians every 15 degrees.
 */
export function mountGlobe(
  canvas: HTMLCanvasElement,
  pin: HTMLElement | null,
  start: LatLon,
  cell = 3,
  tilt = 14,
  graticule = false
): GlobeHandle {
  const ctx = canvas.getContext('2d');
  let camera = cameraFor(start, tilt);
  let target = start;
  let size = 0;
  let image: ImageData | null = null;
  let frame = 0;
  // per cell: view-space normal of the disc, or NaN off the disc
  let nx = new Float32Array(0);
  let ny = new Float32Array(0);
  let nz = new Float32Array(0);

  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function inks(): Inks {
    const style = getComputedStyle(canvas);
    return {
      land: hex(style.getPropertyValue('--gtp-globe-land'), [96, 132, 255]),
      sea: hex(style.getPropertyValue('--gtp-globe-sea'), [36, 62, 160]),
      rim: hex(style.getPropertyValue('--gtp-globe-rim'), [191, 226, 241]),
    };
  }

  function resize() {
    const css = canvas.parentElement?.clientWidth ?? canvas.clientWidth;
    const next = Math.max(48, Math.floor(css / cell));
    if (next === size) return;
    size = next;
    canvas.width = size;
    canvas.height = size;
    image = ctx ? ctx.createImageData(size, size) : null;
    nx = new Float32Array(size * size);
    ny = new Float32Array(size * size);
    nz = new Float32Array(size * size);
    const r = size / 2 - 0.5;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = y * size + x;
        const px = (x + 0.5 - size / 2) / r;
        const py = (y + 0.5 - size / 2) / r;
        const d2 = px * px + py * py;
        if (d2 >= 1) {
          nx[i] = NaN;
          continue;
        }
        nx[i] = px;
        ny[i] = py;
        nz[i] = Math.sqrt(1 - d2);
      }
    }
  }

  function draw() {
    if (!ctx || !image) return;
    const { land, sea, rim } = inks();
    const data = image.data;
    const sin0 = Math.sin(camera.lat0 * RAD);
    const cos0 = Math.cos(camera.lat0 * RAD);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = y * size + x;
        const o = i * 4;
        const px = nx[i]!;
        if (Number.isNaN(px)) {
          data[o + 3] = 0;
          continue;
        }
        const py = ny[i]!;
        const pz = nz[i]!;
        const sinLat = -py * cos0 + pz * sin0;
        const lat = Math.asin(Math.max(-1, Math.min(1, sinLat))) / RAD;
        const lon = camera.lon0 + Math.atan2(px, pz * cos0 + py * sin0) / RAD;
        const lit = Math.max(0, px * LIGHT[0] - py * LIGHT[1] + pz * LIGHT[2]);
        const ground = landAt(lat, wrap180(lon));
        let value: number;
        let ink: number[];
        if (ground > 0.5) {
          value = 0.1 + 0.62 * lit * lit;
          ink = lit > 0.82 ? rim : land;
        } else {
          value = 0.02 + 0.08 * lit;
          ink = sea;
        }
        // the coordinate lines: a cell wide at the disc's middle, wider toward the limb where a cell spans more of the sphere
        let line = false;
        if (graticule) {
          const half = (57.3 / size) / Math.max(pz, 0.3);
          const offLat = Math.abs(lat - Math.round(lat / GRID) * GRID);
          const along = wrap180(lon);
          const offLon = Math.abs(along - Math.round(along / GRID) * GRID) * Math.cos(lat * RAD);
          line = offLat < half || (offLon < half && Math.abs(lat) < 76);
        }
        // the limb, printed as a thin lit ring
        if (pz < 0.16) {
          value = Math.max(value, 0.42 * (1 - pz / 0.16) + 0.08);
          ink = rim;
        }
        const threshold = (BAYER_4[(y & 3) * 4 + (x & 3)]! + 0.5) / 16;
        if (value > threshold) {
          data[o] = ink[0]!;
          data[o + 1] = ink[1]!;
          data[o + 2] = ink[2]!;
          data[o + 3] = 255;
        } else if (line) {
          // a coordinate line where no dot prints: a faint solid cell, so the line runs unbroken through the screen
          data[o] = rim[0]!;
          data[o + 1] = rim[1]!;
          data[o + 2] = rim[2]!;
          data[o + 3] = 96;
        } else {
          data[o + 3] = 0;
        }
      }
    }
    ctx.putImageData(image, 0, 0);
    placePin();
  }

  function placePin() {
    if (!pin) return;
    const p = project({ ...camera, radius: 50, cx: 50, cy: 50 }, target);
    pin.style.left = `${p.x}%`;
    pin.style.top = `${p.y}%`;
    pin.dataset.hidden = p.near ? 'false' : 'true';
    pin.dataset.side = p.x > 62 ? 'left' : 'right';
    const box = canvas.parentElement;
    box?.style.setProperty('--px', `${p.x}%`);
    box?.style.setProperty('--py', `${p.y}%`);
    // any other places marked in the box (data-lat, data-lon) move with the globe too
    box?.querySelectorAll<HTMLElement>('[data-lat][data-lon]').forEach((mark) => {
      const q = project({ ...camera, radius: 50, cx: 50, cy: 50 }, { lat: Number(mark.dataset.lat), lon: Number(mark.dataset.lon) });
      mark.style.left = `${q.x}%`;
      mark.style.top = `${q.y}%`;
      mark.dataset.hidden = q.near ? 'false' : 'true';
    });
    box?.dispatchEvent(new Event('gtp-globe-placed'));
  }

  function turnTo(next: LatLon, ms = 1100) {
    cancelAnimationFrame(frame);
    target = next;
    const from = camera;
    const to = cameraFor(next, tilt);
    if (reduce || ms <= 0) {
      camera = to;
      draw();
      return;
    }
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      camera = turnToward(from, to, ease(k));
      draw();
      if (k < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  }

  resize();
  draw();
  const observer = new ResizeObserver(() => {
    const before = size;
    resize();
    if (size !== before) draw();
  });
  if (canvas.parentElement) observer.observe(canvas.parentElement);
  const themes = new MutationObserver(() => draw());
  themes.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });

  return {
    turnTo,
    repaint: draw,
    destroy() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      themes.disconnect();
    },
  };
}
