/**
 * The three line globe animations of the graticule marks, by id. In each,
 * the mark is one frame of a line globe and only its lines move, each the
 * way its own family moves on a globe, so no letter ever turns, mirrors or
 * shows a back. Each animation is a pure function of time that returns
 * path data for Graticule GT, heavy and Graticule jaw, thicker, with its
 * still for reduced motion and its loop length. Frame 0 and the frame at
 * the loop length are the still, which is the rest mark.
 *
 * This module carries the geometry, so it runs on the server and in the
 * frame worker (frame-worker.ts), never in a page's own bundle; a page
 * reads the ids and names from line-loop.ts.
 */
import type { LinePaths, MarkId } from './geometry';
import * as globeLean from './globe-lean';
import * as languageTurn from './language-turn';
import type { LineAnimationId, LineLoop, LineLoops } from './line-loop';
import { LINE_ANIMATION_TITLES } from './line-loop';
import * as markToGlobe from './mark-to-globe';

export type LineAnimation = {
  readonly id: LineAnimationId;
  readonly title: string;
  /** The loop's length in seconds. */
  readonly duration: number;
  /** The frame at t seconds, wrapped to the loop. */
  readonly frame: (t: number, mark: MarkId) => LinePaths;
  /** The rest mark: frame 0, and the designed still under reduced motion. */
  readonly still: (mark: MarkId) => LinePaths;
};

export const LINE_ANIMATIONS: Readonly<Record<LineAnimationId, LineAnimation>> = {
  'language-turn': { id: 'language-turn', title: LINE_ANIMATION_TITLES['language-turn'], duration: languageTurn.DURATION, frame: languageTurn.frameAt, still: languageTurn.still },
  'globe-lean': { id: 'globe-lean', title: LINE_ANIMATION_TITLES['globe-lean'], duration: globeLean.DURATION, frame: globeLean.frameAt, still: globeLean.still },
  'mark-to-globe': { id: 'mark-to-globe', title: LINE_ANIMATION_TITLES['mark-to-globe'], duration: markToGlobe.DURATION, frame: markToGlobe.frameAt, still: markToGlobe.still },
};

const loopOf = (animation: LineAnimationId, mark: MarkId): LineLoop => ({ animation, mark, duration: LINE_ANIMATIONS[animation].duration, rest: LINE_ANIMATIONS[animation].still(mark) });
const loopsOf = (animation: LineAnimationId): Readonly<Record<MarkId, LineLoop>> => ({ heavy: loopOf(animation, 'heavy'), jaw: loopOf(animation, 'jaw') });

/** Every animation's loop for each mark, with its still drawn, for a server page to hand its LineGlobes. Written out key by key, so the compiler checks that each animation and each mark is there. */
export function lineLoops(): LineLoops {
  return { 'language-turn': loopsOf('language-turn'), 'globe-lean': loopsOf('globe-lean'), 'mark-to-globe': loopsOf('mark-to-globe') };
}
