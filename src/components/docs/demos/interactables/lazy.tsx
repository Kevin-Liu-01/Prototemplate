'use client';

import dynamic from 'next/dynamic';

/**
 * The Interactables pages' plates as the MDX imports them: each one its
 * own chunk, so a plate's code and its stylesheets (the shell's sheets,
 * the blog sheet, the production chrome, flag-icons) load only on the page
 * that renders it. The server still renders each plate, so the HTML holds
 * its markup and its still. The fallback shows only during a client
 * navigation, at about the plate's height, so the page does not shift
 * when the chunk lands (the pattern of ../lazy.tsx).
 */
function slot(height: number) {
  function PlateSlot() {
    return <div aria-hidden='true' style={{ height, margin: '24px 0 12px' }} />;
  }
  return PlateSlot;
}

export const CarouselDemo = dynamic(() => import('./CarouselDemo'), { loading: slot(560) });
export const FilterDemo = dynamic(() => import('./FilterDemo'), { loading: slot(520) });
export const FlapDemo = dynamic(() => import('./FlapDemo'), { loading: slot(330) });
export const HelpToastDemo = dynamic(() => import('./HelpToastDemo'), { loading: slot(600) });
export const IndexPanelDemo = dynamic(() => import('./IndexPanelDemo'), { loading: slot(600) });
export const InstallFieldDemo = dynamic(() => import('./InstallFieldDemo'), { loading: slot(310) });
export const LanguageSelectorDemo = dynamic(() => import('./LanguageSelectorDemo'), { loading: slot(420) });
export const LanguageWheelDemo = dynamic(() => import('./LanguageWheelDemo'), { loading: slot(520) });
export const SearchDemo = dynamic(() => import('./SearchDemo'), { loading: slot(540) });
export const SegDemo = dynamic(() => import('./SegDemo'), { loading: slot(300) });
export const ShellToolbarDemo = dynamic(() => import('./ShellToolbarDemo'), { loading: slot(520) });
export const ToolButtonDemo = dynamic(() => import('./ToolButtonDemo'), { loading: slot(380) });
