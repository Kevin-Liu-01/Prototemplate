'use client';

import dynamic from 'next/dynamic';

/**
 * The page plates as the MDX pages under content/docs/components/(pages)
 * import them, each its own chunk, on the pattern of ../lazy.tsx: fumadocs
 * imports every docs page into the one /docs/[[...slug]] route, so a plate
 * imported directly would put its code and pages.css into every docs
 * page's first load. The server still renders each plate, so the HTML
 * holds its controls, its list and its stills. The fallback shows only
 * during a client navigation, at about the plate's height at 1440, so the
 * page does not shift when the chunk lands.
 */
function slot(height: number) {
  function PlateSlot() {
    return <div aria-hidden='true' style={{ height, margin: '24px 0 12px' }} />;
  }
  return PlateSlot;
}

export const PageGalleryDemo = dynamic(() => import('./PageGalleryDemo'), { loading: slot(1000) });
export const PageTemplateDemo = dynamic(() => import('./PageTemplateDemo'), { loading: slot(600) });
