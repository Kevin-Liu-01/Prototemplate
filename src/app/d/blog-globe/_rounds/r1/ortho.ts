/* The orthographic projection the globe variants share, with a camera that
   can face any point: forward (EdgeGlobe and GrowthGlobe fix their camera,
   this one moves), inverse for drawing a disc cell by cell, the turn
   between two cameras, and the great circle between two places. After
   orthoForward, globePoint and turnToward on k/language-map
   (src/lib/world). */

const RAD = Math.PI / 180;

export type LatLon = { lat: number; lon: number };

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

/** Where a point lands on the disc; `near` is true on the side facing the reader. */
export function project(
  view: GlobeView,
  { lat, lon }: LatLon
): { x: number; y: number; near: boolean } {
  const phi = lat * RAD;
  const lam = (lon - view.lon0) * RAD;
  const phi0 = view.lat0 * RAD;
  const cosPhi = Math.cos(phi);
  const cosLam = Math.cos(lam);
  return {
    x: view.cx + view.radius * cosPhi * Math.sin(lam),
    y:
      view.cy -
      view.radius *
        (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * cosPhi * cosLam),
    near: Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * cosPhi * cosLam > 0,
  };
}

/** The point under disc position (x, y), or null off the disc. */
export function unproject(
  view: GlobeView,
  x: number,
  y: number
): LatLon | null {
  const nx = (x - view.cx) / view.radius;
  const ny = (y - view.cy) / view.radius;
  const d2 = nx * nx + ny * ny;
  if (d2 >= 1) return null;
  const pz = Math.sqrt(1 - d2);
  const sin0 = Math.sin(view.lat0 * RAD);
  const cos0 = Math.cos(view.lat0 * RAD);
  const sinLat = -ny * cos0 + pz * sin0;
  return {
    lat: Math.asin(Math.max(-1, Math.min(1, sinLat))) / RAD,
    lon: wrap180(view.lon0 + Math.atan2(nx, pz * cos0 + ny * sin0) / RAD),
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

/** `steps + 1` points on the great circle from `a` to `b`, both ends included. */
export function greatCircle(a: LatLon, b: LatLon, steps: number): LatLon[] {
  const unit = ({ lat, lon }: LatLon) => [
    Math.cos(lat * RAD) * Math.cos(lon * RAD),
    Math.cos(lat * RAD) * Math.sin(lon * RAD),
    Math.sin(lat * RAD),
  ];
  const [p, q] = [unit(a), unit(b)];
  const dot = p.reduce((sum, v, i) => sum + v * (q[i] ?? 0), 0);
  const omega = Math.acos(Math.max(-1, Math.min(1, dot)));
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    if (omega < 1e-9) return { lat: a.lat, lon: a.lon };
    const sa = Math.sin((1 - t) * omega) / Math.sin(omega);
    const sb = Math.sin(t * omega) / Math.sin(omega);
    const [x, y, z] = p.map((v, j) => sa * v + sb * (q[j] ?? 0));
    return {
      lat: Math.asin(Math.max(-1, Math.min(1, z ?? 0))) / RAD,
      lon: Math.atan2(y ?? 0, x ?? 0) / RAD,
    };
  });
}
