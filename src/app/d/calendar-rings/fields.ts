/**
 * calendar-rings: the disk field and the token readers.
 *
 * The hero disk and its inverted twin in the negative ring are one scalar
 * field rendered through the house Bayer engine (src/lib/dither.ts): one
 * device pixel per cell, density as ordered dither, never a gradient. The
 * field is a pure closure over the ring geometry below, so the SVG overlay
 * and the HTML chips in diagrams/Disk.tsx read the same radii and every
 * rule lands on its step.
 */
import type { FieldFn } from '@/lib/dither';

const TAU = Math.PI * 2;

/**
 * The disk's radii as fractions of the plate's half-width. Six regions
 * alternate ground and dither from the center out, the way a calendar
 * stone alternates its cell rings with its plain band rings:
 *
 *   hub      0     .. 0.33   ground; the claim sits here, the source
 *   ring 1   0.33  .. 0.42   0.10, carries the crown text
 *   ring 2   0.42  .. 0.52   ground; four cells, the surfaces, labelled
 *   ring 3   0.52  .. 0.63   0.34; seven cells, the usage rates, numbered;
 *                            its inner edge notched twice per cell, turning
 *   ring 4   0.63  .. 0.85   ground; twenty cells, the locales, as chips
 *   rim      0.85  .. 1.00   0.90; twenty notches, one per locale, turning
 *                            the other way
 *
 * The two notched edges turn against each other the way the two wheels of
 * the calendar round do. Every other boundary is fixed.
 */
export const DISK = {
  hub: 0.33,
  r1: 0.42,
  r2: 0.52,
  r3: 0.63,
  r4: 0.85,
  surfaces: 4,
  rates: 7,
  locales: 20,
  rimNotches: 20,
  ringNotches: 14,
  rimCut: 0.03,
  ringLift: 0.02,
} as const;

export const DENSITY = {
  ring1: 0.1,
  ring3: 0.34,
  rim: 0.9,
} as const;

/** Square-wave notch test: true on the raised half of each notch period. */
function notched(theta: number, count: number, phase: number): boolean {
  const p = (theta / TAU) * count + phase;
  return p - Math.floor(p) < 0.5;
}

/**
 * The disk field. `t` turns the two notched edges; every other boundary is
 * fixed, so the overlay's rules never drift off their steps. Rendered with
 * a transparent paper, so the ground rings show whatever surface the disk
 * sits on: clay on the page, obsidian in the negative.
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
    if (r >= DISK.r3) return 0;
    if (r >= DISK.r2) {
      const theta = Math.atan2(dy, dx);
      const lift = notched(theta, DISK.ringNotches, -t * 0.035) ? DISK.ringLift : 0;
      return r >= DISK.r2 + lift ? DENSITY.ring3 : 0;
    }
    if (r >= DISK.r1) return 0;
    return DENSITY.ring1;
  };
}

/** The value of one CSS custom property as the element itself resolves it, for the current theme and scope. */
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
