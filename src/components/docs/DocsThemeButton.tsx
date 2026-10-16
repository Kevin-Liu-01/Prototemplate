'use client';

import { useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

type Theme = 'light' | 'dark';

/* the key the root layout's boot script reads before first paint (src/app/layout.tsx) */
const THEME_KEY = 'gt-theme';

/** The glyph names the theme the page is in: the left half filled in light, the right half in dark. */
const GLYPH: Record<Theme, string> = { light: '◐', dark: '◑' };

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

/**
 * The docs site's light and dark switch. The theme lives on
 * <html data-theme>, which the root layout stamps before first paint and
 * every stylesheet remaps its tokens under; fumadocs' own next-themes
 * switch is off (RootProvider theme.enabled false), so nothing writes a
 * .dark class. The choice persists under gt-theme, the key the rest of the
 * site reads, so the docs and the hub always agree. The glyph is the
 * shell's: ◐ in light, ◑ in dark. A change made elsewhere (another tab, the
 * hub) reaches this button through a MutationObserver on the attribute.
 */
export default function DocsThemeButton({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useMountEffect(() => {
    setTheme(readTheme());
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  });

  const toggle = () => {
    const next: Theme = readTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // private mode: the attribute carries the choice for the session
    }
    setTheme(next);
  };

  return (
    <button
      type='button'
      className={className}
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to the light theme' : 'Switch to the dark theme'}
      title='Theme'
      data-docs-theme=''
    >
      <span aria-hidden='true'>{GLYPH[theme]}</span>
    </button>
  );
}
