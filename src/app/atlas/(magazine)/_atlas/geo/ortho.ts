/* The orthographic projection the press globe draws with: a point on the
   globe to the disc, as seen from a camera. */

import type { LatLon } from '../coords';

const RAD = Math.PI / 180;

/** The camera faces (lat0, lon0); the disc's centre is (cx, cy) with `radius`, y down. */
export type GlobeView = {
  lat0: number;
  lon0: number;
  radius: number;
  cx: number;
  cy: number;
};

export type GlobeCamera = Pick<GlobeView, 'lat0' | 'lon0'>;

export function wrap180(deg: number): number {
  return ((((deg + 180) % 360) + 360) % 360) - 180;
}

/** Where a point lands on the disc. `depth` is the cosine of its angle from the point faced: 1 at the centre, 0 on the limb, negative behind; `near` is true on the side facing the reader. */
export function project(
  view: GlobeView,
  { lat, lon }: LatLon
): { x: number; y: number; depth: number; near: boolean } {
  const phi = lat * RAD;
  const lam = (lon - view.lon0) * RAD;
  const phi0 = view.lat0 * RAD;
  const cosPhi = Math.cos(phi);
  const cosLam = Math.cos(lam);
  const depth =
    Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * cosPhi * cosLam;
  return {
    x: view.cx + view.radius * cosPhi * Math.sin(lam),
    y:
      view.cy -
      view.radius *
        (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * cosPhi * cosLam),
    depth,
    near: depth > 0,
  };
}

/** The camera at progress `k` (0 to 1, eased by the caller) from `from` to `to`, the short way round in longitude. */
export function turnToward(
  from: GlobeCamera,
  to: GlobeCamera,
  k: number
): GlobeCamera {
  return {
    lat0: from.lat0 + (to.lat0 - from.lat0) * k,
    lon0: wrap180(from.lon0 + wrap180(to.lon0 - from.lon0) * k),
  };
}
