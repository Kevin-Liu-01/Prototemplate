'use client';

import V0Footer from '../../_v0/V0Footer';

import { OPEN_SETTINGS } from './ConsentBanner';
import LanguageSelector from './LanguageSelector';
import ProdThemeToggle from './ProdThemeToggle';

function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS));
}

/**
 * The production mirror's footer: the shared V0Footer with live's closing
 * strip (the language selector stub and the theme switch with live's
 * labels) and a Manage Cookies button that opens the consent stub's
 * settings dialog (ConsentBanner.tsx). The production pieces load here, so
 * the other concepts that mount V0Footer load none of their styles.
 */
export default function ProdFooter() {
  return (
    <V0Footer
      onManageCookies={openCookieSettings}
      tools={
        <>
          <span className='v0-foot-lang'>
            <LanguageSelector />
          </span>
          <ProdThemeToggle className='v0-foot-theme max-[640px]:ml-auto' />
        </>
      }
    />
  );
}
