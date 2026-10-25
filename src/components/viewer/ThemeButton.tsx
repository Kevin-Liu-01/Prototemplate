'use client';

import { useState } from 'react';

import { ToolButton } from '@/components/viewer/ToolButton';
import { DEFAULT_THEME, isTheme, loadTheme, onThemeChange, readTheme, THEME_GLYPH, toggleTheme } from '@/lib/theme';
import type { Theme } from '@/lib/theme';
import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The site's light and dark switch, on the shell button. It flips the theme
 * through src/lib/theme.ts; the D key in useShellKeys calls toggleTheme()
 * directly, and the button follows through a MutationObserver on the
 * attribute.
 *
 * The glyph (directive 8.4) is the half disc, ◐ in light mode and ◑ in
 * dark mode, rendered as text at 16px, the one place in chrome a text glyph
 * stands for an icon. ToolButton.css sizes it (.pt-theme-glyph): the span is
 * a child of ToolButton, whose sheet loads wherever the button renders, on
 * the shell toolbar and on the direction navs alike.
 *
 * Two forms. In the shell toolbar it is a labeled button like every other
 * control (decision 7), with the title naming the D key. The direction
 * navs (the toolchain TopNavs, V0Nav, V0Footer) pass their own className
 * and get the 32px icon square with no label and no key in the title,
 * because D only works inside the shell; their bars are unchanged.
 */
export type ThemeButtonProps = {
  className?: string;
  /** show the `Theme` label and name the D key; defaults to true unless a className is passed */
  label?: boolean;
};

export function ThemeButton({ className, label = className === undefined }: ThemeButtonProps) {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  useMountEffect(() => {
    /* Safari: an Intl-driven hydration bailout can re-render <html> without
       the parse-time script's attribute, so the saved choice (or the
       default) is asserted again from the client */
    const current = document.documentElement.dataset.theme;
    if (!isTheme(current)) {
      document.documentElement.dataset.theme = loadTheme() ?? DEFAULT_THEME;
    }
    setTheme(readTheme());
    return onThemeChange(() => setTheme(readTheme()));
  });

  return (
    <ToolButton
      label={label ? 'Theme' : undefined}
      title={label ? 'Dark or light (D)' : 'Dark or light'}
      ariaLabel={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
      className={className}
      onClick={() => {
        toggleTheme();
      }}
    >
      <span className='pt-theme-glyph' aria-hidden='true'>
        {THEME_GLYPH[theme]}
      </span>
    </ToolButton>
  );
}
