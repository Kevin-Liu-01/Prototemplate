/**
 * A line globe loop as a page holds it, with none of the geometry: the
 * animations' ids and names, the weight of the stroke path, the grid the
 * frames are drawn on, and a loop's length and still. The geometry runs
 * where the page's main thread never waits on it: on the server, which
 * draws each still (lineLoops in line-animations.ts), and in the frame
 * worker (frame-worker.ts), which draws the motion. A page that imports
 * only this module, loop-clock.ts and LineGlobe ships none of it.
 */
import type { LinePaths, MarkId } from './geometry';

export const LINE_ANIMATION_IDS = ['language-turn', 'globe-lean', 'mark-to-globe'] as const;
export type LineAnimationId = (typeof LINE_ANIMATION_IDS)[number];

/** Each animation's public name. */
export const LINE_ANIMATION_TITLES: Readonly<Record<LineAnimationId, string>> = {
  'language-turn': 'Language globe turn',
  'globe-lean': 'Globe lean',
  'mark-to-globe': 'Mark to globe',
};

/** The weight of every line of both marks: the stroke path is drawn at it, with butt caps and round joins. */
export const REST_WEIGHT = 11.912;

/** Frames a second on the grid every loop is drawn on: grid frame i is the frame at i / GRID_FPS seconds. */
export const GRID_FPS = 60;

/** One animation for one mark, as a server page hands it to a LineGlobe: its length in seconds and its still, the rest mark. */
export type LineLoop = { readonly animation: LineAnimationId; readonly mark: MarkId; readonly duration: number; readonly rest: LinePaths };

/** Every animation's loop for each mark. */
export type LineLoops = Readonly<Record<LineAnimationId, Readonly<Record<MarkId, LineLoop>>>>;
