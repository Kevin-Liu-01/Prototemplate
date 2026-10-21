/* Variant C's glyph globe: the World Language Map's globe (k/language-map,
   src/lib/world/render-globe.ts) at figure size. An even grid of upright
   screen cells is anchored to the disc's centre; each cell reads the ground
   under it and prints a letter of the current language where that ground is
   land, or a small square where it is sea. Each cell keeps its letter while
   the ground turns under it, so only the coast moves. Marks shrink toward
   the limb with the sphere's depth, which reads round in either theme's
   ink. Pure, so the server draws the first stop as SVG and the client draws
   every frame on a canvas from the same marks. */
import {
  BAYER8,
  DITHER_LEVELS,
  smoothstep,
} from '@/app/d/blog-globe/_shared/ditherMask';
import { landAt } from '@/app/d/blog-globe/_rounds/r2/land';
import {
  unproject,
  type GlobeCamera,
  type GlobeView,
} from '@/app/d/blog-globe/_rounds/r2/ortho';
import type { GlobeStop } from '@/app/d/blog-globe/_rounds/r2/stops';
import type { GlobeDisc } from '@/app/d/blog-globe/_rounds/r2/targets';

const RAD = Math.PI / 180;

/* ---------- the depth ---------- */

/** Type size in cells at depth z (1 at the disc's centre, about 0 at the limb): a + b * z. */
const TYPE_LAW: Record<'land' | 'sea', [number, number]> = {
  land: [0.6, 0.55],
  sea: [0.3, 0.4],
};
const MAX_TYPE = 1.15;

/* ---------- the marks ---------- */

/** Screen cells per disc radius, so the server's SVG and the canvas draw one lattice at any size: 36 marks across, enough for the continents to read. */
export const CELLS_PER_RADIUS = 18;
/** Mark sizes snap to twelfths of a cell: one font per step per frame. */
export const SIZE_STEPS = 12;
/** The largest step a mark can take. */
export const MAX_TIER = Math.round(MAX_TYPE * SIZE_STEPS);
/** A sea square's side as a share of its type size. */
export const SEA_SIDE = 0.34;
/** Offsets in cells a sea cell tries for land, so an island narrower than a cell (Britain, Cyprus) still prints. */
const PROBES = [
  [-0.3, -0.3],
  [0.3, -0.3],
  [-0.3, 0.3],
  [0.3, 0.3],
] as const;

export type GlobeMark = {
  /** Lattice column and row from the disc's top left; the Bayer screen reads them. */
  col: number;
  row: number;
  /** The cell's centre in radii from the disc's centre, y down. */
  nx: number;
  ny: number;
  land: boolean;
  /** The mark's type size in twelfths of a cell, 1 to MAX_TIER. */
  tier: number;
  /** Picks the letter within a language's set; fixed to the screen cell, so a turn never changes it. */
  seed: number;
};

/** lowbias32, as world-glyphs.ts on k/language-map hashes its lattice. */
function hash32(n: number): number {
  let x = n >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b) >>> 0;
  x ^= x >>> 16;
  return x >>> 0;
}

/** Every mark of the globe facing `camera`, row by row. */
export function globeMarks(camera: GlobeCamera): GlobeMark[] {
  const n = CELLS_PER_RADIUS;
  const view: GlobeView = { ...camera, radius: 1, cx: 0, cy: 0 };
  const probe = 1 / n;
  const marks: GlobeMark[] = [];
  for (let row = 0; row < 2 * n; row++) {
    const ny = (row - n + 0.5) / n;
    for (let col = 0; col < 2 * n; col++) {
      const nx = (col - n + 0.5) / n;
      const point = unproject(view, nx, ny);
      if (!point) continue;
      const land =
        landAt(point.lat, point.lon) >= 0.5 ||
        PROBES.some(([ox, oy]) => {
          const p = unproject(view, nx + ox * probe, ny + oy * probe);
          return p !== null && landAt(p.lat, p.lon) >= 0.5;
        });
      const depth = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      const [a, b] = TYPE_LAW[land ? 'land' : 'sea'];
      const tier = Math.round(Math.min(MAX_TYPE, a + b * depth) * SIZE_STEPS);
      marks.push({
        col,
        row,
        nx,
        ny,
        land,
        tier,
        seed: hash32(row * 2 * n + col),
      });
    }
  }
  return marks;
}

/* ---------- the letters ---------- */

/** The letters a language prints on the land: those of its passage and its own name, lower case, without marks, each once. */
export function lettersOf(
  stop: Pick<GlobeStop, 'passage' | 'label'>
): string[] {
  const text = `${stop.passage}${stop.label}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
  return [...new Set(text.match(/\p{L}/gu) ?? [])];
}

/** Han fills its em square where a Latin, Greek or Arabic letter fills about half of it, so Han prints smaller to keep the land as open. */
export const glyphScale = (lang: string) =>
  /^(zh|ja|ko)\b/.test(lang) ? 0.8 : 1;

/** The letter a land mark prints in a set. */
export const letterAt = (letters: readonly string[], mark: GlobeMark) =>
  letters[mark.seed % letters.length] ?? '';

/** Whether the cell at (col, row) prints the incoming language at step k (0 to 1): the 8 by 8 screen, anchored to the lattice, hands the cells over in threshold order, as the passage's mask does. */
export function handedOver(col: number, row: number, k: number): boolean {
  const level = Math.round(Math.min(1, Math.max(0, k)) * DITHER_LEVELS);
  return (BAYER8[row & 7]?.[col & 7] ?? DITHER_LEVELS) < level;
}

/* ---------- the move ---------- */

/** The text step, shared by the passage, the label and the letters on the land: the house dither step. */
export const STEP_MS = 150;
/** The label starts its step this long after the passage, as the Versions figure's rows do. */
export const STAGGER_MS = 55;

/** The angle in degrees between the points two cameras face. */
export function arcBetween(a: GlobeCamera, b: GlobeCamera): number {
  const dLat = (b.lat0 - a.lat0) * RAD;
  const dLon = (b.lon0 - a.lon0) * RAD;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat0 * RAD) * Math.cos(b.lat0 * RAD) * Math.sin(dLon / 2) ** 2;
  return (2 * Math.asin(Math.min(1, Math.sqrt(h)))) / RAD;
}

/** The turn's length, on the half-second grid: 1 s for a hop under 60°, 1.5 s for anything longer. */
export function turnMs(from: GlobeCamera, to: GlobeCamera): number {
  return arcBetween(from, to) < 60 ? 1000 : 1500;
}

/** The step of the passage (row 0) and the label (row 1), `t` ms into a turn `ms` long: centred on the turn's midpoint, so the words change while the ground moves fastest. */
export function rowsAt(ms: number, t: number): [number, number] {
  const start = ms / 2 - (STEP_MS + STAGGER_MS) / 2;
  return [
    smoothstep((t - start) / STEP_MS),
    smoothstep((t - start - STAGGER_MS) / STEP_MS),
  ];
}

/** power2.inOut: a move from one place to another, no overshoot. */
export function easeInOut(k: number): number {
  const t = Math.min(1, Math.max(0, k));
  return t < 0.5 ? 2 * t * t : 1 - (2 - 2 * t) ** 2 / 2;
}

/** The camera that faces a stop. */
export const cameraOf = (stop: Pick<GlobeStop, 'lat' | 'lon'>) => ({
  lat0: stop.lat,
  lon0: stop.lon,
});

/* ---------- the first stop as SVG, for the server ---------- */

/** The SVG's units: the disc's radius, and the margin the largest marks can reach past it. */
export const SVG_RADIUS = 100;
export const SVG_MARGIN = 8;
/** The current city's dot and ring, and the other cities' dots, in radii. */
export const CITY = { dot: 0.028, ring: 0.065, other: 0.018 } as const;
/** No mark prints this close to the current city (in radii), nor this close to another. */
export const CLEAR = {
  current: 1.5 / CELLS_PER_RADIUS,
  other: 0.8 / CELLS_PER_RADIUS,
};

/** The drawn disc in the square globe box, `size` CSS px a side: centred, with the SVG still's margin left for the largest marks. The canvas draws on it and the city targets sit on it, so a target's ring always rings its dot. */
export function globeDisc(size: number): GlobeDisc {
  const c = size / 2;
  return { cx: c, cy: c, radius: c / (1 + SVG_MARGIN / SVG_RADIUS) };
}

/** How stop `i` is drawn, in radii: the current city in the accent with its ring; a hovered city (its target under the pointer) in ink at the current dot's size, with the current city's clearing so the target's ring sits on open ground; any other city as a small ink dot. */
export function cityLook(
  i: number,
  current: number,
  hovered: number
): { dot: number; clear: number; accent: boolean } {
  if (i === current)
    return { dot: CITY.dot, clear: CLEAR.current, accent: true };
  if (i === hovered)
    return { dot: CITY.dot, clear: CLEAR.current, accent: false };
  return { dot: CITY.other, clear: CLEAR.other, accent: false };
}

/** One SVG text element per size step: its letters, each placed by the x and y lists. */
export type PoseRun = { size: number; x: string; y: string; text: string };

const unit = (v: number) => (v * SVG_RADIUS).toFixed(1);

/** The pose of the globe facing `camera` as SVG data: a text run for every size step (empty ones kept, so the markup's shape never changes) and one path for the sea. Marks within `clear` radii of `keepOut` are left out. */
export function svgPose(
  camera: GlobeCamera,
  letters: readonly string[],
  keepOut: readonly { x: number; y: number; clear: number }[] = []
): { runs: PoseRun[]; sea: string } {
  const cell = SVG_RADIUS / CELLS_PER_RADIUS;
  const runs = Array.from({ length: MAX_TIER }, (_, i) => ({
    size: Number((((i + 1) / SIZE_STEPS) * cell).toFixed(2)),
    x: [] as string[],
    y: [] as string[],
    text: '',
  }));
  const sea: string[] = [];
  for (const mark of globeMarks(camera)) {
    if (keepOut.some((p) => Math.hypot(mark.nx - p.x, mark.ny - p.y) < p.clear))
      continue;
    if (mark.land) {
      const run = runs[mark.tier - 1];
      if (!run) continue;
      run.x.push(unit(mark.nx));
      run.y.push(unit(mark.ny));
      run.text += letterAt(letters, mark);
      continue;
    }
    const side = (mark.tier / SIZE_STEPS) * cell * SEA_SIDE;
    const s = side.toFixed(2);
    sea.push(
      `M${(mark.nx * SVG_RADIUS - side / 2).toFixed(1)} ${(mark.ny * SVG_RADIUS - side / 2).toFixed(1)}h${s}v${s}h-${s}z`
    );
  }
  return {
    runs: runs.map((run) => ({
      size: run.size,
      x: run.x.join(' '),
      y: run.y.join(' '),
      text: run.text,
    })),
    sea: sea.join(''),
  };
}
