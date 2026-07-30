'use client';

import { useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

type Theme = 'light' | 'dark';

/**
 * Global light/dark switch. State lives on <html data-theme> so every
 * direction's stylesheet can remap its tokens under [data-theme='dark'];
 * persisted to localStorage and pre-applied by an inline script in the root
 * layout so a reload never flashes the wrong theme.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useMountEffect(() => {
    const current = document.documentElement.dataset.theme as Theme | undefined;
    if (current === 'dark') setTheme('dark');
  });

  const toggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('gt-theme', next);
    } catch {
      // private mode: the toggle still works for the session
    }
  };

  return (
    <button
      type='button'
      onClick={toggle}
      className='rounded-lg px-2.5 py-1.5 text-white/55 transition-colors hover:bg-white/10 hover:text-white'
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Dark mode' : 'Light mode'}
    >
      {theme === 'light' ? '◐' : '◑'}
    </button>
  );
}
