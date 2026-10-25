'use client';

import { useState } from 'react';

import { onThemeChange, readTheme, THEME_GLYPH, toggleTheme } from '@/lib/theme';
import type { Theme } from '@/lib/theme';
import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The docs site's light and dark switch. The theme lives on
 * <html data-theme>, which the root layout stamps before first paint and
 * every stylesheet remaps its tokens under; fumadocs' own next-themes
 * switch is off (RootProvider theme.enabled false), so nothing writes a
 * .dark class. It flips the theme through src/lib/theme.ts, so the choice
 * persists under gt-theme and reaches every framed page, and it shows the
 * shell's glyph. A change made elsewhere (another tab, the hub)
 * reaches this button through a MutationObserver on the attribute.
 */
export default function DocsThemeButton({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useMountEffect(() => {
    setTheme(readTheme());
    return onThemeChange(() => setTheme(readTheme()));
  });

  return (
    <button
      type='button'
      className={className}
      onClick={() => setTheme(toggleTheme())}
      aria-label={theme === 'dark' ? 'Switch to the light theme' : 'Switch to the dark theme'}
      title='Theme'
      data-docs-theme=''
    >
      <span aria-hidden='true'>{THEME_GLYPH[theme]}</span>
    </button>
  );
}
