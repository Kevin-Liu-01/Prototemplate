/**
 * calendar-rings: the two dither fields and the token readers.
 *
 * The hero disk and the negative ring's floor are scalar fields rendered
 * through the house Bayer engine (src/lib/dither.ts): one device pixel per
 * cell, density as ordered dither, never a gradient. Both fields are pure
 * closures over the ring geometry below, so the SVG overlay in
 * diagrams/Disk.tsx reads the same radii and the rules land on the steps.
 */
import type { FieldFn } from '@/lib/dither';

const TAU = Math.PI * 2;

/**
 * The disk's radii as fractions of the plate's half-width. Six regions,
 * density stepping outward: the hub (ground), four rings, the rim.
 *
 *   hub      0     .. 0.36   ground; the claim sits here
 *   ring 1   0.36  .. 0.46   0.08, carries the crown text
 *   ring 2   0.46  .. 0.58   0.20, its inner edge notched 18 times, turning
 *   ring 3   0.58  .. 0.70   0.36
 *   ring 4   0.70  .. 0.86   0.58, thirteen cells with bar-and-dot numerals
 *   rim      0.86  .. 1.00   0.90, its outer edge notched 20 times, turning the other way
 *
 * The counts are the calendar's: thirteen numbers and twenty day positions
 * make the 260-day round; the two notched edges turn against each other
 * the way the two wheels of the round do.
 */
export const DISK = {
  hub: 0.36,
  r1: 0.46,
  r2: 0.58,
  r3: 0.7,
  r4: 0.86,
  cells: 13,
  rimNotches: 20,
  ringNotches: 18,
  rimCut: 0.03,
  ringLift: 0.02,
} as const;

export const DENSITY = {
  ring1: 0.08,
  ring2: 0.2,
  ring3: 0.36,
  ring4: 0.58,
  rim: 0.9,
} as const;

/** Square-wave notch test: true on the raised half of each notch period. */
function notched(theta: number, count: number, phase: number): boolean {
  const p = (theta / TAU) * count + phase;
  return p - Math.floor(p) < 0.5;
}

/**
 * The disk field. `t` turns the two notched edges; every other boundary is
 * fixed, so the overlay's rules never drift off their steps.
 */
export function calendarDisk(): FieldFn {
  return (u, v, t) => {
    const dx = u * 2 - 1;
    const dy = v * 2 - 1;
    const r = Math.sqrt(dx * dx + dy * dy);
    if (r >= 1 || r < DISK.hub) return 0;
    if (r >= DISK.r4) {
      const theta = Math.atan2(dy, dx);
      const cut = notched(theta, DISK.rimNotches, t * 0.04) ? DISK.rimCut : 0;
      return r < 1 - cut ? DENSITY.rim : 0;
    }
    if (r >= DISK.r3) return DENSITY.ring4;
    if (r >= DISK.r2) return DENSITY.ring3;
    if (r >= DISK.r1) {
      const theta = Math.atan2(dy, dx);
      const lift = notched(theta, DISK.ringNotches, -t * 0.035) ? DISK.ringLift : 0;
      return r >= DISK.r1 + lift ? DENSITY.ring2 : DENSITY.ring1;
    }
    return DENSITY.ring1;
  };
}

/**
 * The negative ring's floor: the bottom of a much larger ring, seen as
 * four arcs of stepping density along the band's lower edge. `aspect` is
 * the canvas's width over its height so the arcs stay circular.
 */
export function ringFloor(aspect: number): FieldFn {
  /* the ring's center sits far above the band; its rim touches the
     canvas at the bottom center and climbs out of the top near the ends */
  const cy = -9.5;
  const rim = 10.5;
  return (u, v) => {
    const x = (u - 0.5) * aspect;
    const y = v - cy;
    const d = Math.sqrt(x * x + y * y);
    const s = rim - d;
    if (s < 0) return 0;
    if (s < 0.3) return 0.34;
    if (s < 0.6) return 0.2;
    if (s < 0.9) return 0.11;
    if (s < 1.2) return 0.05;
    return 0;
  };
}

/** The value of one CSS custom property on an element, resolved for the current theme. */
export function readToken(el: Element, name: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

/** Runs `cb` whenever the document's theme attribute flips; returns the disconnect. */
export function onThemeChange(cb: () => void): () => void {
  if (typeof MutationObserver === 'undefined') return () => {};
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}
