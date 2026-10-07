import { GT_OUTLINE_BOX, GT_OUTLINE_PATHS } from './gt-outline';

/** the traced contours' own box, so the figure is exactly the mark's width and height */
const VIEWBOX = `${GT_OUTLINE_BOX.x} ${GT_OUTLINE_BOX.y} ${GT_OUTLINE_BOX.w} ${GT_OUTLINE_BOX.h}`;

/**
 * The GT monogram in dotted outline: the traced contours of the logo
 * (gt-outline.ts), stroked in dots. The brand head's badge after the title,
 * where BookHead sizes it to the title's cap height.
 */
export default function GtOutline() {
  return (
    <svg className='ptb-gt-outline' viewBox={VIEWBOX}>
      {GT_OUTLINE_PATHS.map((d) => (
        <path d={d} key={d.slice(0, 24)} />
      ))}
    </svg>
  );
}
