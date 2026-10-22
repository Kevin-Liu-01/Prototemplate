'use client';

import dynamic from 'next/dynamic';

/**
 * The dither lab's plates as the MDX pages import them, each its own
 * chunk, so a plate's code and dither-lab.css load only on a page that
 * renders it. The fallback holds about the plate's height during a client
 * navigation, so the page does not shift when the chunk lands.
 */
function slot(height: number) {
  function PlateSlot() {
    return <div aria-hidden='true' style={{ height, margin: '24px 0 12px' }} />;
  }
  return PlateSlot;
}

export const ScreenBenchDemo = dynamic(() => import('./ScreenBenchDemo'), { loading: slot(620) });
export const DiffusionStepDemo = dynamic(() => import('./DiffusionStepDemo'), { loading: slot(520) });
export const ShimmerDemo = dynamic(() => import('./ShimmerDemo'), { loading: slot(480) });
export const DitherWordDemo = dynamic(() => import('./DitherWordDemo'), { loading: slot(470) });
export const MarkTiersDemo = dynamic(() => import('./MarkTiersDemo'), { loading: slot(500) });
export const GlyphScreenDemo = dynamic(() => import('./GlyphScreenDemo'), { loading: slot(560) });
export const ToneMixDemo = dynamic(() => import('./ToneMixDemo'), { loading: slot(560) });
export const ScreenLensDemo = dynamic(() => import('./ScreenLensDemo'), { loading: slot(520) });
export const DitherBrushDemo = dynamic(() => import('./DitherBrushDemo'), { loading: slot(500) });
