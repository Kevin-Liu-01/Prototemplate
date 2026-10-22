'use client';

import dynamic from 'next/dynamic';

/**
 * The artifact plates as the MDX pages import them: each one its own
 * chunk, as src/components/docs/demos/lazy.tsx explains. A plate's code,
 * its engines and artifacts.css load only on a page that renders it. The
 * server still renders each plate, and the fallback below shows only
 * during a client navigation, at about the plate's height, so the page
 * does not shift when the chunk lands.
 */
function slot(height: number) {
  function PlateSlot() {
    return <div aria-hidden='true' style={{ height, margin: '24px 0 12px' }} />;
  }
  return PlateSlot;
}

export const ContactSheetDemo = dynamic(() => import('./ContactSheetDemo'), { loading: slot(620) });
export const CoverGeneratorDemo = dynamic(() => import('./CoverGeneratorDemo'), { loading: slot(760) });
export const FallbackCoverDemo = dynamic(() => import('./FallbackCoverDemo'), { loading: slot(480) });
export const FilmPlayerDemo = dynamic(() => import('./FilmPlayerDemo'), { loading: slot(520) });
export const MoodCompareDemo = dynamic(() => import('./MoodCompareDemo'), { loading: slot(560) });
export const MoodScreenDemo = dynamic(() => import('./MoodScreenDemo'), { loading: slot(560) });
export const ReportCardDemo = dynamic(() => import('./ReportCardDemo'), { loading: slot(900) });
export const SocialCardDemo = dynamic(() => import('./SocialCardDemo'), { loading: slot(560) });
