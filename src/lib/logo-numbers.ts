import { LOCKUP } from '@/lib/logo';
import CONSTRUCTION from '@/lib/logo-construction.json';

/**
 * The logo's numbers as the site states them in words: each is computed
 * once, from LOCKUP in src/lib/logo.ts or from the logo's construction
 * (src/lib/logo-construction.json), and written with `stated`, the one
 * rounding rule. The brand kit's README and sheets use the same values and
 * the same rule (gt-logo-kit-1108/build/geo.mjs), so /brand and the kit
 * agree to the last digit.
 */

/**
 * The one rounding rule: decimal, half up, at `places` decimals, trailing
 * zeros dropped (0.475 at 2 places is 0.48, never the binary 0.47 that
 * `toFixed` gives).
 */
export function stated(n: number, places: number): string {
  return String(Number(`${Math.round(Number(`${n}e${places}`))}e-${places}`));
}

/** clear space on every side of a logo: a quarter of the globe's height */
export const CLEAR = 0.25;
/** the clear space around the stacked lockup, in the name's cap heights */
export const CLEAR_STACKED = CLEAR * LOCKUP.mark;
/** the clear space around the one-line lockup, in the name's cap heights */
export const CLEAR_ONE_LINE = CLEAR * LOCKUP.oneLine;
/** the ring's weight over the globe's drawn height (its outer diameter) */
export const RING_SHARE = CONSTRUCTION.new.weight / (2 * CONSTRUCTION.new.ring.outer);
