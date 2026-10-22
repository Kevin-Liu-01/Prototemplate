'use client';

import dynamic from 'next/dynamic';

/**
 * The page layout plates as the MDX pages import them, each its own chunk,
 * so a plate's code and stylesheets load only on the page that renders it
 * (the same reason as src/components/docs/demos/lazy.tsx). The server
 * still renders each plate; the fallback shows only during a client
 * navigation, at about the plate's height, so the page does not shift.
 */
function slot(height: number) {
  function PlateSlot() {
    return <div aria-hidden='true' style={{ height, margin: '24px 0 12px' }} />;
  }
  return PlateSlot;
}

export const PageSkeletonDemo = dynamic(() => import('./PageSkeletonDemo'), { loading: slot(1100) });
export const HeadCtaDemo = dynamic(() => import('./HeadCtaDemo'), { loading: slot(420) });
export const JunctionDemo = dynamic(() => import('./JunctionDemo'), { loading: slot(470) });
export const GridSeamsDemo = dynamic(() => import('./GridSeamsDemo'), { loading: slot(560) });
export const GridViewDemo = dynamic(() => import('./GridViewDemo'), { loading: slot(700) });
export const ShellAnatomyDemo = dynamic(() => import('./ShellAnatomyDemo'), { loading: slot(760) });
export const SheetDemo = dynamic(() => import('./SheetDemo'), { loading: slot(680) });
export const PlateDemo = dynamic(() => import('./PlateDemo'), { loading: slot(400) });
