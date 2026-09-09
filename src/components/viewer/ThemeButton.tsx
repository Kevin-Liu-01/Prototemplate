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
 * src/components/shared/ThemeToggle.tsx; direction navs keep passing their
 * own className. The D key in useShellKeys calls toggleTheme() directly and
 * the button follows through a MutationObserver on the attribute.
 */
export type Theme = 'light' | 'dark';

export const THEME_KEY = 'gt-theme';

const DEFAULT_THEME: Theme = 'dark';

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

export type ThemeButtonProps = { className?: string };

export function ThemeButton({ className }: ThemeButtonProps) {
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
      icon='theme'
      title='Dark or light (D)'
      ariaLabel={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
      className={className}
      onClick={() => {
        toggleTheme();
      }}
    />
  );
}
