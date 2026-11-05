/**
 * The three line globe animations of the graticule marks, by id. In each,
 * the mark is one frame of a line globe and only its lines move, each the
 * way its own family moves on a globe, so no letter ever turns, mirrors or
 * shows a back. Each animation is a pure function of time that returns
 * path data for Graticule GT, heavy and Graticule jaw, thicker, with its
 * still for reduced motion and its loop length. Frame 0 and the frame at
 * the loop length are the still, which is the rest mark.
 */
import type { LinePaths, MarkId } from './geometry';
import * as globeLean from './globe-lean';
import * as languageTurn from './language-turn';
import * as markToGlobe from './mark-to-globe';

export const LINE_ANIMATION_IDS = ['language-turn', 'globe-lean', 'mark-to-globe'] as const;
export type LineAnimationId = (typeof LINE_ANIMATION_IDS)[number];

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
  'language-turn': { id: 'language-turn', title: 'Language globe turn', duration: languageTurn.DURATION, frame: languageTurn.frameAt, still: languageTurn.still },
  'globe-lean': { id: 'globe-lean', title: 'Globe lean', duration: globeLean.DURATION, frame: globeLean.frameAt, still: globeLean.still },
  'mark-to-globe': { id: 'mark-to-globe', title: 'Mark to globe', duration: markToGlobe.DURATION, frame: markToGlobe.frameAt, still: markToGlobe.still },
};
