'use client';

import { useState } from 'react';

import { ToolButton } from '@/components/viewer/ToolButton';
import { readTheme, toggleTheme } from '@/components/viewer/ThemeButton';
import type { Theme } from '@/components/viewer/ThemeButton';
import { useMountEffect } from '@/lib/use-mount-effect';

import './prod-chrome.css';

/**
 * The live site's theme switch (gt-cloud packages/ui
 * src/components/frame/ThemeToggle.tsx) on the mirror's theme door: the
 * choice lands on html[data-theme] and in gt-theme through ThemeButton's
 * toggleTheme, as everywhere on this site. Both half discs render and the
 * root theme shows one (prod-chrome.css), so the first paint carries the
 * right glyph before hydration, as live does with its dark: classes. The
 * name and title follow live: "Switch to dark mode" and "Dark mode" in
 * light, the reverse in dark; until the client reads the theme they say
 * light, as live's unmounted toggle does.
 */
function useRootTheme(): Theme {
  const [theme, setTheme] = useState<Theme>('light');
  useMountEffect(() => {
    setTheme(readTheme());
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  });
  return theme;
}

function Glyphs() {
  return (
    <>
      <span className='pc-glyph-light'>◐</span>
      <span className='pc-glyph-dark'>◑</span>
    </>
  );
}

/** The bare glyph button of the header bar and the footer strip. */
export default function ProdThemeToggle({ className }: { className: string }) {
  const theme = useRootTheme();
  return (
    <ToolButton
      ariaLabel={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={className}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      onClick={() => {
        toggleTheme();
      }}
    >
      <span aria-hidden='true' className='pt-theme-glyph'>
        <Glyphs />
      </span>
    </ToolButton>
  );
}

/**
 * The phone sheet's labeled switch: the glyph and the current mode's name,
 * with the visible name opening the accessible name (WCAG 2.5.3), as live
 * labels it: "Light, switch to dark mode".
 */
export function ProdSheetThemeToggle({ className }: { className: string }) {
  const theme = useRootTheme();
  return (
    <button
      aria-label={theme === 'dark' ? 'Dark, switch to light mode' : 'Light, switch to dark mode'}
      className={className}
      type='button'
      onClick={() => {
        toggleTheme();
      }}
    >
      <span aria-hidden='true' className='pn-sheet-theme-glyph'>
        <Glyphs />
      </span>
      <span className='pc-name-light'>Light</span>
      <span className='pc-name-dark'>Dark</span>
    </button>
  );
}
