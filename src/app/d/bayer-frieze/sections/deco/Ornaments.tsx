/**
 * BAYER-FRIEZE, the two printed figures.
 *
 * C1 homes: the hero crown (`Sunrise`, the half disc the mark sits in, above
 * the h1 inside the hero copy card) and section heads (`StepKey`, the nested
 * brackets in the `tc-head-icon` slot). Both are the engine's cells printed
 * inline as one path in currentColor, so the host sets the ink through
 * `color` and the dark remap needs nothing else. Decorative: aria-hidden,
 * never focusable, no ids, no pattern references.
 */

import { cellsPath, STEP_KEY, SUNRISE, stepKey, sunrise } from './bayer';

const SUNRISE_PATH = cellsPath(sunrise());
const STEP_KEY_PATH = cellsPath(stepKey());

type OrnamentProps = { className?: string };

/** The crown's sunrise: 48 by 24 cells; the CSS sets 144 by 72 px (3px cells). */
export function Sunrise({ className }: OrnamentProps) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${SUNRISE.w} ${SUNRISE.h}`}
      aria-hidden='true'
      focusable='false'
      shapeRendering='crispEdges'
    >
      <path d={SUNRISE_PATH} fill='currentColor' />
    </svg>
  );
}

/** The section head's stepped key: 16 by 16 cells; the CSS sets 48px (3px cells). */
export function StepKey({ className }: OrnamentProps) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${STEP_KEY.w} ${STEP_KEY.h}`}
      aria-hidden='true'
      focusable='false'
      shapeRendering='crispEdges'
    >
      <path d={STEP_KEY_PATH} fill='currentColor' />
    </svg>
  );
}
