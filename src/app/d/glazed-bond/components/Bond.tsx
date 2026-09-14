import { useId } from 'react';

import { bayerTile } from '@/app/d/production/sections/pricing-bayer';

/**
 * Deco home: the walls. The running-bond brick pattern of the Ishtar Gate,
 * drawn as one SVG pattern: stretchers of 72 by 28 with a one-pixel mortar
 * seam, every second course offset by half a brick. Under the seams an
 * optional Bayer stipple (the house 4x4 screen at coverage k/16, two-pixel
 * cells) gives the face the warmth of fired brick without a gradient. The
 * seam and stipple colors come from the sheet through the two class names,
 * so the wall remaps with the theme.
 */
export const BRICK_W = 72;
export const COURSE_H = 28;

export type BondWallProps = {
  className?: string;
  /** Draw the fired-brick stipple under the seams. Default true. */
  stipple?: boolean;
  /** Bayer coverage of the stipple, 0..16. Default 3. */
  cover?: number;
};

export default function BondWall({ className, stipple = true, cover = 3 }: BondWallProps) {
  const raw = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const bondId = `gb-bond-${raw}`;
  const stipId = `gb-stip-${raw}`;
  return (
    <svg
      className={className ? `gb-bond ${className}` : 'gb-bond'}
      aria-hidden='true'
      focusable='false'
      shapeRendering='crispEdges'
    >
      <defs>
        <pattern id={bondId} width={BRICK_W} height={COURSE_H * 2} patternUnits='userSpaceOnUse'>
          <rect className='gb-bond-seam' x={0} y={0} width={BRICK_W} height={1} />
          <rect className='gb-bond-seam' x={0} y={COURSE_H} width={BRICK_W} height={1} />
          <rect className='gb-bond-seam' x={0} y={0} width={1} height={COURSE_H} />
          <rect className='gb-bond-seam' x={BRICK_W / 2} y={COURSE_H} width={1} height={COURSE_H} />
        </pattern>
        {stipple ? (
          <pattern id={stipId} width={8} height={8} patternUnits='userSpaceOnUse'>
            <path className='gb-bond-stipple' d={bayerTile(cover, 2)} />
          </pattern>
        ) : null}
      </defs>
      {stipple ? <rect width='100%' height='100%' fill={`url(#${stipId})`} /> : null}
      <rect width='100%' height='100%' fill={`url(#${bondId})`} />
    </svg>
  );
}
