'use client';

import { useState } from 'react';

import { useMountEffect } from '../hooks';
import { MoonIcon, SunIcon } from './icons';

/** The hub's own storage key and attribute, so the press and the hub keep one theme. */
const KEY = 'gt-theme';

type Theme = 'light' | 'dark';

/* The light and dark switch: it stamps data-theme on <html> and keeps the
   choice, as the hub's own theme button does. */
export default function ThemeSwitch({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useMountEffect(() => {
    const html = document.documentElement;
    const read = () => setTheme(html.dataset.theme === 'light' ? 'light' : 'dark');
    read();
    // the hub's boot script, another tab or another switch can change it too
    const observer = new MutationObserver(read);
    observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  });

  const flip = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // private mode: the attribute alone carries the choice for the visit
    }
    setTheme(next);
  };

  return (
    <button type='button' className={['gtp-theme', className].filter(Boolean).join(' ')} onClick={flip} aria-label={theme === 'light' ? 'Dark theme' : 'Light theme'}>
      {theme === 'light' ? <MoonIcon size={15} /> : <SunIcon size={15} />}
    </button>
  );
}
