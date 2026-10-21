/* Variant A's globe, as pure functions the engine and the no-JavaScript
   still both draw through. The lit sphere is the sign-in globe's (globe()
   in packages/ui/src/lib/dither.ts: light from the upper left, ambient,
   rim, a one-cell feather at the limb), forked to face any point and to
   print real land from landAt() instead of noise. Each cell is screened
   through the 8 by 8 Bayer matrix at 2 CSS px in two nested inks, the
   Versions plate's pair: the light ink for the lit sphere, the strong ink
   for land. The light is fixed to the reader, so a cell's shade never
   changes; only the ground under it turns. */

import { BAYER8, smoothstep } from '@/app/d/blog-globe/_shared/ditherMask';
import { landAt } from '@/app/d/blog-globe/_rounds/r2/land';

import type {
  GlobeCamera,
  LatLon,
} from '@/app/d/blog-globe/_rounds/r2/ortho';
import type { Box } from '@/app/d/blog-globe/_shared/versions-field';

export const CELL = 2; // CSS px per cell, as the sign-in globe

const RAD = Math.PI / 180;
const AMBIENT = 0.16;
const RIM = 0.18;
const SEA = 0.36; // the sea prints this share of the land's light ink
const DEEP = 0.62; // land's strong ink, a nested tier of its light ink
export const NEAR = 0.25; // a city's dot shows only this far in from the limb
export const HALO = 11; // CSS px cleared round a hovered city: its 9 px ring and 2 px of ground

const LIGHT = (() => {
  const [x, y, z] = [-0.45, -0.62, 0.65];
  const n = Math.hypot(x, y, z);
  return { x: x / n, y: y / n, z: z / n };
})();

/** A cell's print: 0 the ground, 1 the light ink, 2 the strong ink, 3 a city. */
export type Print = 0 | 1 | 2 | 3;

/** A square of `size` cells holding the disc: per cell its position on the unit sphere (y down) and its fixed shade, 0 off the disc. */
export type DiscGrid = {
  size: number;
  nx: Float32Array;
  ny: Float32Array;
  pz: Float32Array;
  shade: Float32Array;
  inside: Uint32Array;
};

export function makeDisc(size: number): DiscGrid {
  const r = size / 2;
  const feather = 1 - (1 - 1.5 / r) ** 2;
  const n = size * size;
  const grid: DiscGrid = {
    size,
    nx: new Float32Array(n),
    ny: new Float32Array(n),
    pz: new Float32Array(n),
    shade: new Float32Array(n),
    inside: new Uint32Array(0),
  };
  const inside: number[] = [];
  for (let y = 0, i = 0; y < size; y++) {
    for (let x = 0; x < size; x++, i++) {
      const nx = (x + 0.5 - r) / r;
      const ny = (y + 0.5 - r) / r;
      const d2 = nx * nx + ny * ny;
      if (d2 >= 1) continue;
      const pz = Math.sqrt(1 - d2);
      const light = Math.max(0, nx * LIGHT.x + ny * LIGHT.y + pz * LIGHT.z);
      const lit = AMBIENT + (1 - AMBIENT) * light + RIM * d2 ** 3.5;
      grid.nx[i] = nx;
      grid.ny[i] = ny;
      grid.pz[i] = pz;
      grid.shade[i] = Math.min(1, lit) * smoothstep((1 - d2) / feather);
      inside.push(i);
    }
  }
  grid.inside = Uint32Array.from(inside);
  return grid;
}

/** The two inks nest: a cell takes the strong ink only where its light ink is already printed. */
export function printCell(
  shade: number,
  land: number,
  threshold: number
): Print {
  if (shade * DEEP * land > threshold) return 2;
  if (shade * (SEA + (1 - SEA) * land) > threshold) return 1;
  return 0;
}

/** Prints the globe as the camera faces it into `out`, one Print per cell. `clear` (0 to 255 per cell) takes the field away under the label, the pin and its leader. */
export function drawGlobe(
  grid: DiscGrid,
  camera: GlobeCamera,
  clear: Uint8Array | null,
  out: Uint8Array
): void {
  out.fill(0);
  const { size, nx, ny, pz, shade } = grid;
  const sin0 = Math.sin(camera.lat0 * RAD);
  const cos0 = Math.cos(camera.lat0 * RAD);
  for (const i of grid.inside) {
    const k = clear ? 1 - clear[i]! / 255 : 1;
    if (k <= 0) continue;
    const y = ny[i]!;
    const z = pz[i]!;
    // ortho.ts unproject(), inlined: the point under the cell
    const sinLat = Math.max(-1, Math.min(1, -y * cos0 + z * sin0));
    const lat = Math.asin(sinLat) / RAD;
    const lon = camera.lon0 + Math.atan2(nx[i]!, z * cos0 + y * sin0) / RAD;
    const land = smoothstep((landAt(lat, lon) - 0.25) * 2);
    const row = BAYER8[Math.floor(i / size) & 7]!;
    out[i] = printCell(shade[i]! * k, land, (row[(i % size) & 7]! + 0.5) / 64);
  }
}

/** Marks each city on the near side as a 2 by 2 cell square in a cleared ring, unless the label or the pin has taken the field there, and says which cities it drew. The `hovered` city's ring widens to HALO, so the city targets' hover ring sits on cleared ground as the pin does. The squares print after every ring and the halo, so a neighbour's ring or halo never takes a drawn city's square, and every city with a target shows its dot. */
export function drawCities(
  grid: DiscGrid,
  camera: GlobeCamera,
  cities: readonly LatLon[],
  clear: Uint8Array | null,
  out: Uint8Array,
  hovered = -1
): boolean[] {
  const { size } = grid;
  const r = size / 2;
  const sin0 = Math.sin(camera.lat0 * RAD);
  const cos0 = Math.cos(camera.lat0 * RAD);
  const reach = Math.ceil(HALO / CELL);
  const squares: number[] = [];
  const drawn = cities.map((city, c) => {
    const phi = city.lat * RAD;
    const lam = (city.lon - camera.lon0) * RAD;
    const depth = sin0 * Math.sin(phi) + cos0 * Math.cos(phi) * Math.cos(lam);
    if (depth < NEAR) return false;
    const px = r + r * Math.cos(phi) * Math.sin(lam);
    const py =
      r - r * (cos0 * Math.sin(phi) - sin0 * Math.cos(phi) * Math.cos(lam));
    const bx = Math.round(px) - 1;
    const by = Math.round(py) - 1;
    const cells: number[] = [];
    for (let y = by - 1; y <= by + 2; y++) {
      for (let x = bx - 1; x <= bx + 2; x++) {
        if (x >= 0 && y >= 0 && x < size && y < size) cells.push(y * size + x);
      }
    }
    // a dot the label or the pin has partly taken is not drawn at all
    if (clear && cells.some((i) => clear[i]! >= 64)) return false;
    if (c === hovered) {
      // the halo centres on the projected point, where the target's ring is
      for (let y = Math.floor(py) - reach; y <= Math.ceil(py) + reach; y++) {
        for (let x = Math.floor(px) - reach; x <= Math.ceil(px) + reach; x++) {
          const inside = x >= 0 && y >= 0 && x < size && y < size;
          const d = Math.hypot(x + 0.5 - px, y + 0.5 - py) * CELL;
          if (inside && d <= HALO) out[y * size + x] = 0;
        }
      }
    }
    for (const i of cells) {
      const x = i % size;
      const y = Math.floor(i / size);
      out[i] = 0;
      if (x >= bx && x <= bx + 1 && y >= by && y <= by + 1) squares.push(i);
    }
    return true;
  });
  for (const i of squares) out[i] = 3;
  return drawn;
}

/** A box (CSS px from the disc's top left) the field gives way around: fully inside it and `pad` past it, then falling off over `fall`. */
export type ClearBox = Box & { pad: number; fall: number };

/** One byte per cell, 255 where the field is gone: rounded boxes with a soft edge, as the Versions plate clears around its lines. */
export function clearMap(boxes: readonly ClearBox[], size: number): Uint8Array {
  const out = new Uint8Array(size * size);
  for (const box of boxes) {
    const hw = (box.right - box.left) / 2 + box.pad;
    const hh = (box.bottom - box.top) / 2 + box.pad;
    const mx = (box.left + box.right) / 2;
    const my = (box.top + box.bottom) / 2;
    const radius = Math.min(hw, hh, 4);
    const reach = box.fall + 1;
    const x0 = Math.max(0, Math.floor((mx - hw - reach) / CELL));
    const x1 = Math.min(size, Math.ceil((mx + hw + reach) / CELL));
    const y0 = Math.max(0, Math.floor((my - hh - reach) / CELL));
    const y1 = Math.min(size, Math.ceil((my + hh + reach) / CELL));
    for (let cy = y0; cy < y1; cy++) {
      const qy = Math.abs((cy + 0.5) * CELL - my) - hh + radius;
      for (let cx = x0; cx < x1; cx++) {
        const qx = Math.abs((cx + 0.5) * CELL - mx) - hw + radius;
        const d =
          Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) +
          Math.min(Math.max(qx, qy), 0) -
          radius;
        const v =
          d <= 0
            ? 255
            : box.fall > 0 && d < box.fall
              ? Math.round(smoothstep(1 - d / box.fall) * 255)
              : 0;
        const i = cy * size + cx;
        out[i] = Math.max(out[i]!, v);
      }
    }
  }
  return out;
}

/* ---------- the turn ---------- */

/** The camera that centres a place. */
export const aim = ({ lat, lon }: LatLon): GlobeCamera => ({
  lat0: lat,
  lon0: lon,
});

/** power2.inOut: a move from one place to another, no overshoot. */
export function easeInOut(k: number): number {
  const t = Math.min(1, Math.max(0, k));
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/** The angle in degrees between two cameras' centres, along the great circle. */
export function arcDegrees(a: GlobeCamera, b: GlobeCamera): number {
  const dLat = (b.lat0 - a.lat0) * RAD;
  const dLon = (b.lon0 - a.lon0) * RAD;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat0 * RAD) * Math.cos(b.lat0 * RAD) * Math.sin(dLon / 2) ** 2;
  return (2 * Math.asin(Math.min(1, Math.sqrt(h)))) / RAD;
}

/** How long a turn takes: longer for a longer way round, 0.8 to 1.4 s. */
export function spinMs(degrees: number): number {
  return Math.round(Math.min(1400, Math.max(800, 700 + 5 * degrees)));
}

/** When the label and the passage start their step: centred on the middle of the turn, so the words change while the ground moves fastest. */
export function textDelay(spin: number): number {
  return Math.max(0, spin / 2 - 100);
}
