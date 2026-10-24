/* A story's map sheet laid into a box: the projection at equal scale about
   the sheet's centre latitude, and its land as one path of square dots, a
   dot to the degree or to a fraction of one so the dots keep one size
   whatever the sheet's span. Shared by the sheet inside each magazine
   (ui/MapSheet.tsx) and the inset map on the opened magazine's opening
   spread (riffle/pages.ts). */

import type { MapSheet } from '../stories';
import { landAt } from './land';

/** The size a land dot's cell aims for, in the box's units. */
const CELL = 9;

export type Projected = {
  /** A latitude and longitude as a point in the box. */
  at: (lat: number, lon: number) => [number, number];
  /** The land, as one path of square dots, none cut by the box's edge. */
  land: string;
  /** How many degrees a dot stands for. */
  step: number;
  /** Kilometres to one of the box's units, along the centre latitude. */
  km: number;
  latMin: number;
  latMax: number;
  lonMin: number;
};

/** The sheet in the box from (x0, y0) to (x1, y1), its span across the box's width; `cell` is the dot cell to aim for. */
export function project(sheet: MapSheet, x0: number, y0: number, x1: number, y1: number, cell = CELL): Projected {
  const k = (x1 - x0) / sheet.span;
  const ky = k / Math.cos((sheet.lat * Math.PI) / 180);
  const lonMin = sheet.lon - sheet.span / 2;
  const latMax = sheet.lat + (y1 - y0) / ky / 2;
  const latMin = sheet.lat - (y1 - y0) / ky / 2;
  // rounded, so the server and every browser print the same numbers into the drawing
  const r2 = (v: number) => Math.round(v * 100) / 100;
  const at = (lat: number, lon: number): [number, number] => [r2(x0 + (lon - lonMin) * k), r2(y0 + (latMax - lat) * ky)];
  const step = [1, 0.5, 0.25].find((s) => s * k <= cell * 1.25) ?? 0.25;
  const dot = 0.62 * Math.min(k, ky) * step;
  let land = '';
  for (let lat = Math.floor(latMax / step) * step + step / 2; lat > latMin; lat -= step) {
    for (let lon = Math.floor(lonMin / step) * step + step / 2; lon < lonMin + sheet.span; lon += step) {
      if (landAt(lat, lon) < 0.5) continue;
      const [x, y] = at(lat, lon);
      if (x - dot / 2 < x0 || x + dot / 2 > x1 || y - dot / 2 < y0 || y + dot / 2 > y1) continue;
      land += `M${(x - dot / 2).toFixed(1)} ${(y - dot / 2).toFixed(1)}h${dot.toFixed(1)}v${dot.toFixed(1)}h${(-dot).toFixed(1)}z`;
    }
  }
  return { at, land, step, km: (111.32 * Math.cos((sheet.lat * Math.PI) / 180)) / k, latMin, latMax, lonMin };
}
