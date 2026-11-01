/* The press globe: an orthographic Earth printed in the house 1-bit
   material, one canvas pixel per cell and a 4x4 Bayer screen, the cells as
   small as a device pixel so the dither reads as a tone, not as squares;
   over it the coordinate lines and the limb are stroked as clean vector
   lines. It draws once per camera and only animates while it turns to a
   new place. Inks come from the canvas's CSS custom properties, so a theme
   change repaints it in the new colors. */

import type { LatLon } from './coords';
import { landAt } from './geo/land';
import { project, turnToward, wrap180, type GlobeCamera } from './geo/ortho';
import { prefersReducedMotion } from './motion';
import { BAYER_4 } from './dither';

const RAD = Math.PI / 180;
/* light from the upper left, in view space (x right, y up, z toward the reader) */
const LIGHT = (() => {
  const v = [-0.55, 0.6, 0.58];
  const len = Math.hypot(v[0]!, v[1]!, v[2]!);
  return v.map((c) => c / len) as [number, number, number];
})();

export type GlobeHandle = {
  turnTo(target: LatLon, ms?: number, curve?: (t: number) => number): void;
  repaint(): void;
  destroy(): void;
};

/** Each ink as RGB, and as the one 32-bit pixel the canvas stores for it, opaque. */
type Inks = {
  land: number[];
  sea: number[];
  rim: number[];
  pixel: { land: number; sea: number; rim: number };
};

function hex(value: string, fallback: number[]): number[] {
  const m = /^#?([0-9a-f]{6})$/i.exec(value.trim());
  if (!m) return fallback;
  const n = parseInt(m[1]!, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** An opaque RGB color as the 32-bit pixel an ImageData holds for it, in the machine's own byte order. */
function pixelOf([r, g, b]: number[]): number {
  return new Uint32Array(new Uint8ClampedArray([r!, g!, b!, 255]).buffer)[0]!;
}

/* What a cell on the disc prints, fixed by where it sits: the light falling there against its screen threshold says
   whether land prints, whether that land is in the highlight, and whether sea prints. A cell that prints neither
   stays clear whatever turns under it, so a frame never looks at it. */
const PRINTS_LAND = 1;
const PRINTS_RIM = 2;
const PRINTS_SEA = 4;

/** Where the camera sits to show `p` above and right of the disc's centre; `tilt` is how far above, in degrees. */
export function cameraFor(p: LatLon, tilt = 14): GlobeCamera {
  return {
    lat0: Math.max(-60, Math.min(60, p.lat - tilt)),
    lon0: wrap180(p.lon - 22),
  };
}

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/** In and out, for a slow turn that sets off and lands gently. */
export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Degrees between the coordinate lines. */
const GRID = 30;

/** The coordinate lines as points every 2 degrees, the parallels and then the meridians, laid out once. */
const GRATICULE: LatLon[][] = [
  ...Array.from({ length: 180 / GRID - 1 }, (_, k) =>
    Array.from({ length: 181 }, (_, j) => ({
      lat: -90 + GRID * (k + 1),
      lon: -180 + 2 * j,
    }))
  ),
  ...Array.from({ length: 360 / GRID }, (_, k) =>
    Array.from({ length: 77 }, (_, j) => ({
      lat: -76 + 2 * j,
      lon: -180 + GRID * k,
    }))
  ),
];

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
  // the image's pixels, one 32-bit word each
  let pixels = new Uint32Array(0);
  let frame = 0;
  // per cell that can print (PRINTS_*): its pixel, its view-space normal on the disc, and what it prints
  let at = new Int32Array(0);
  let nx = new Float32Array(0);
  let ny = new Float32Array(0);
  let nz = new Float32Array(0);
  let prints = new Uint8Array(0);

  const reduce = prefersReducedMotion();

  // the inks are read once and again only when the theme changes, so a turning globe reads no style per frame
  let read: Inks | null = null;
  function inks(): Inks {
    if (read) return read;
    const style = getComputedStyle(canvas);
    const land = hex(
      style.getPropertyValue('--gtp-globe-land'),
      [96, 132, 255]
    );
    const sea = hex(style.getPropertyValue('--gtp-globe-sea'), [36, 62, 160]);
    const rim = hex(style.getPropertyValue('--gtp-globe-rim'), [191, 226, 241]);
    read = {
      land,
      sea,
      rim,
      pixel: { land: pixelOf(land), sea: pixelOf(sea), rim: pixelOf(rim) },
    };
    return read;
  }

  function resize() {
    const css = canvas.parentElement?.clientWidth ?? canvas.clientWidth;
    // each cell a whole number of device pixels, so the screen prints evenly at any pixel ratio
    const ratio = window.devicePixelRatio || 1;
    const step = Math.max(1, Math.round(cell * ratio)) / ratio;
    const next = Math.max(48, Math.floor(css / step));
    if (next === size) return;
    size = next;
    canvas.width = size;
    canvas.height = size;
    image = ctx ? ctx.createImageData(size, size) : null;
    pixels = image ? new Uint32Array(image.data.buffer) : new Uint32Array(0);
    // the light and the screen never turn with the globe, so what each cell can print is worked out once per size
    const found: number[] = [];
    const normals: number[] = [];
    const kinds: number[] = [];
    const r = size / 2 - 0.5;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const px = (x + 0.5 - size / 2) / r;
        const py = (y + 0.5 - size / 2) / r;
        const d2 = px * px + py * py;
        if (d2 >= 1) continue;
        const pz = Math.sqrt(1 - d2);
        const lit = Math.max(0, px * LIGHT[0] - py * LIGHT[1] + pz * LIGHT[2]);
        const threshold = (BAYER_4[(y & 3) * 4 + (x & 3)]! + 0.5) / 16;
        const kind =
          (0.1 + 0.62 * lit * lit > threshold ? PRINTS_LAND : 0) |
          (lit > 0.82 ? PRINTS_RIM : 0) |
          (0.02 + 0.08 * lit > threshold ? PRINTS_SEA : 0);
        if (!(kind & (PRINTS_LAND | PRINTS_SEA))) continue;
        found.push(y * size + x);
        normals.push(px, py, pz);
        kinds.push(kind);
      }
    }
    at = Int32Array.from(found);
    nx = Float32Array.from(found, (_, k) => normals[k * 3]!);
    ny = Float32Array.from(found, (_, k) => normals[k * 3 + 1]!);
    nz = Float32Array.from(found, (_, k) => normals[k * 3 + 2]!);
    prints = Uint8Array.from(kinds);
  }

  function draw() {
    if (!ctx || !image) return;
    const { rim, pixel } = inks();
    const sin0 = Math.sin(camera.lat0 * RAD);
    const cos0 = Math.cos(camera.lat0 * RAD);
    const lon0 = camera.lon0;
    // only the cells that can print are written; the rest stay clear from when the image was made
    for (let k = 0; k < at.length; k++) {
      const px = nx[k]!;
      const py = ny[k]!;
      const pz = nz[k]!;
      const sinLat = -py * cos0 + pz * sin0;
      const lat = Math.asin(Math.max(-1, Math.min(1, sinLat))) / RAD;
      const lon = lon0 + Math.atan2(px, pz * cos0 + py * sin0) / RAD;
      const kind = prints[k]!;
      pixels[at[k]!] =
        landAt(lat, lon) > 0.5
          ? kind & PRINTS_LAND
            ? kind & PRINTS_RIM
              ? pixel.rim
              : pixel.land
            : 0
          : kind & PRINTS_SEA
            ? pixel.sea
            : 0;
    }
    ctx.putImageData(image, 0, 0);
    strokeLines(rim);
    placePin();
  }

  /** The coordinate lines every 30 degrees on the side facing the reader, and the limb, as clean strokes over the dither. */
  function strokeLines(rim: number[]) {
    if (!ctx) return;
    const view = {
      ...camera,
      radius: size / 2 - 0.5,
      cx: size / 2,
      cy: size / 2,
    };
    const color = `rgb(${rim[0]} ${rim[1]} ${rim[2]} /`;
    ctx.lineWidth = 1;
    if (graticule) {
      ctx.strokeStyle = `${color} 0.3)`;
      ctx.beginPath();
      const trace = (points: LatLon[]) => {
        let pen = false;
        for (const point of points) {
          const p = project(view, point);
          if (!p.near) {
            pen = false;
            continue;
          }
          if (pen) ctx.lineTo(p.x, p.y);
          else ctx.moveTo(p.x, p.y);
          pen = true;
        }
      };
      for (const line of GRATICULE) trace(line);
      ctx.stroke();
    }
    // the limb, one clean ring
    ctx.strokeStyle = `${color} 0.7)`;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 0.5, 0, Math.PI * 2);
    ctx.stroke();
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
    box
      ?.querySelectorAll<HTMLElement>('[data-lat][data-lon]')
      .forEach((mark) => {
        const q = project(
          { ...camera, radius: 50, cx: 50, cy: 50 },
          { lat: Number(mark.dataset.lat), lon: Number(mark.dataset.lon) }
        );
        mark.style.left = `${q.x}%`;
        mark.style.top = `${q.y}%`;
        mark.dataset.hidden = q.near ? 'false' : 'true';
      });
    box?.dispatchEvent(new Event('gtp-globe-placed'));
  }

  function turnTo(next: LatLon, ms = 1100, curve = ease) {
    cancelAnimationFrame(frame);
    target = next;
    const from = camera;
    const to = cameraFor(next, tilt);
    // already facing it: nothing turns, so only the pin moves
    if (from.lat0 === to.lat0 && from.lon0 === to.lon0) {
      placePin();
      return;
    }
    if (reduce || ms <= 0) {
      camera = to;
      draw();
      return;
    }
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      camera = turnToward(from, to, curve(k));
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
  const themes = new MutationObserver(() => {
    read = null;
    draw();
  });
  themes.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'class'],
  });

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
