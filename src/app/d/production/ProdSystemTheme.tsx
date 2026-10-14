'use client';

import { THEME_KEY } from '@/components/viewer/ThemeButton';
import { useMountEffect } from '@/lib/use-mount-effect';

function savedTheme(): 'light' | 'dark' | null {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null;
  }
}

/* the boot script in src/app/layout.tsx uses the same test */
const PRODUCTION_PATH = /^\/d\/production(\/|$)/;

function systemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * The live site follows prefers-color-scheme until the visitor picks a
 * theme. On a full load the boot script in src/app/layout.tsx does that for
 * every /d/production address; this component covers the two client
 * navigations it cannot see. Arriving from a page that opened on the site's
 * dark default, it applies the system theme and marks the html
 * data-theme-from='system', which the boot script's media listener reads.
 * Leaving /d/production (this layout unmounts) with nothing saved, it
 * restores the dark default the rest of the site opens on. A saved choice
 * (gt-theme) and a theme the framing page posted (data-theme-from='message')
 * are never overridden.
 */
export default function ProdSystemTheme() {
  useMountEffect(() => {
    const root = document.documentElement;
    const saved = savedTheme();
    /* a not-found render can rebuild <html> without the boot script's
       attribute; the saved choice is stamped again, as ThemeButton does
       for the shell */
    if (saved && root.dataset.theme !== 'light' && root.dataset.theme !== 'dark') {
      root.dataset.theme = saved;
    }
    if (!saved && root.dataset.themeFrom === undefined) {
      root.dataset.theme = systemTheme();
      root.dataset.themeFrom = 'system';
    }
    return () => {
      /* The new address decides, not the DOM: the router pushes the next
         URL before this cleanup runs, while a hidden copy of the old route
         can keep its nodes in the document for a while. The check runs now
         and again on the next frame, in case the address had not changed
         yet; both runs are no-ops under /d/production. */
      const restore = () => {
        if (PRODUCTION_PATH.test(window.location.pathname)) return;
        if (root.dataset.themeFrom !== 'system') return;
        delete root.dataset.themeFrom;
        if (!savedTheme()) root.dataset.theme = 'dark';
      };
      restore();
      window.requestAnimationFrame(restore);
    };
  });
  return null;
}
