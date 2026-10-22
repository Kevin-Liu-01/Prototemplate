'use client';

import dynamic from 'next/dynamic';

/**
 * The 2D and 3D plates as their two MDX pages import them, each its own
 * chunk. fumadocs-mdx imports every docs page into the one
 * /docs/[[...slug]] route, so a direct import would put three.js and these
 * engines into every docs page's first load. Through next/dynamic, three.js
 * and the canvas engines load only on a page that renders one of these
 * plates. The server still renders each plate's frame and controls, and
 * the fallback holds the plate's height during a client navigation so the
 * page does not shift when the chunk lands.
 */
function slot(height: number) {
  function PlateSlot() {
    return <div aria-hidden='true' style={{ height, margin: '24px 0 12px' }} />;
  }
  return PlateSlot;
}

export const MarkSceneDemo = dynamic(() => import('./MarkSceneDemo'), { loading: slot(470) });
export const EarthSceneDemo = dynamic(() => import('./EarthSceneDemo'), { loading: slot(510) });
export const StackSceneDemo = dynamic(() => import('./StackSceneDemo'), { loading: slot(530) });
export const FlowFieldDemo = dynamic(() => import('./FlowFieldDemo'), { loading: slot(450) });
export const ContourDemo = dynamic(() => import('./ContourDemo'), { loading: slot(450) });
export const GlyphRainDemo = dynamic(() => import('./GlyphRainDemo'), { loading: slot(450) });
export const DitherPadDemo = dynamic(() => import('./DitherPadDemo'), { loading: slot(410) });
