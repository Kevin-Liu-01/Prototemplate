'use client';

import { useState } from 'react';

import { ToolButton } from '@/components/viewer/ToolButton';
import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The site's light and dark switch, on the shell button. State lives on
 * <html data-theme> so every stylesheet remaps its tokens under
 * [data-theme='dark']; the choice persists under one key, gt-theme, which
 * the boot script in src/app/layout.tsx applies before first paint. Dark is
 * the default when nothing is saved (decision 2). Replaces
 * src/components/shared/ThemeToggle.tsx. The D key in useShellKeys calls
 * toggleTheme() directly and the button follows through a MutationObserver
 * on the attribute.
 *
 * The glyph is the old one (directive 8.4): the half discs ◐ in light mode
 * and ◑ in dark mode, rendered as text at 16px, the one place in chrome a
 * text glyph stands for an icon. The moon and the sun are gone from the
 * button and from icons.tsx. ToolButton.css sizes the glyph (.pt-theme-glyph):
 * the span is a child of ToolButton, whose sheet loads wherever the button
 * renders, on the shell toolbar and on the direction navs alike.
 *
 * Two forms. In the shell toolbar it is a labeled button like every other
 * control (decision 7), with the title naming the D key. The direction
 * navs (the toolchain TopNavs, V0Nav, V0Footer) pass their own className
 * and get the 32px icon square with no label and no key in the title,
 * because D only works inside the shell; their bars are unchanged.
 */
export type Theme = 'light' | 'dark';

export const THEME_KEY = 'gt-theme';

const DEFAULT_THEME: Theme = 'dark';

/** The glyph names the theme the button is in: the left half filled in light, the right half in dark. */
const GLYPH: Record<Theme, string> = { light: '◐', dark: '◑' };

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

function loadTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return isTheme(saved) ? saved : null;
  } catch {
    // private mode: the attribute alone carries the choice for the session
    return null;
  }
}

/** The theme on <html>, or the default when the attribute is missing. */
export function readTheme(): Theme {
  const current = document.documentElement.dataset.theme;
  return isTheme(current) ? current : DEFAULT_THEME;
}

/** Stamps the attribute and persists the choice. */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // private mode: the switch still works for the session
  }
}

/** Flips the theme and returns the new one. */
export function toggleTheme(): Theme {
  const next: Theme = readTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

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
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
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
        {GLYPH[theme]}
      </span>
    </ToolButton>
  );
}
