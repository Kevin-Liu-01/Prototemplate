'use client';

import { usePathname } from 'next/navigation';

import { THEME_KEY } from '@/components/viewer/ThemeButton';
import { useLayoutWork } from '@/lib/use-layout-work';

/* the boot script in src/app/layout.tsx uses the same test */
const PRODUCTION_PATH = /^\/d\/production(\/|$)/;

function savedTheme(): 'light' | 'dark' | null {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null;
  }
}

function systemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * The live site follows prefers-color-scheme until the visitor picks a
 * theme. On a full load the boot script in src/app/layout.tsx does that for
 * every /d/production address; this component covers client navigation,
 * which the boot script cannot see. The root layout mounts it, so it stays
 * mounted on every route and reads the router's pathname, and the work runs
 * in a layout effect whenever that pathname changes: in the commit that
 * renders the new route, before it paints, with no wait on an unmount or
 * on the address bar.
 *
 * Arriving under /d/production with nothing saved, it applies the system
 * theme and marks the html data-theme-from='system', which the boot
 * script's media listener reads. Arriving anywhere else from there, it
 * removes the mark and restores the dark default the rest of the site
 * opens on. A saved choice (gt-theme) and a theme the framing page posted
 * (data-theme-from='message') are never overridden.
 */
export default function ProdSystemTheme() {
  const pathname = usePathname() ?? '';
  useLayoutWork(
    () => {
      const root = document.documentElement;
      const saved = savedTheme();
      if (PRODUCTION_PATH.test(pathname)) {
        /* a not-found render can rebuild <html> without the boot script's
           attribute; the saved choice is stamped again, as ThemeButton
           does for the shell */
        if (saved && root.dataset.theme !== 'light' && root.dataset.theme !== 'dark') {
          root.dataset.theme = saved;
        }
        if (!saved && root.dataset.themeFrom === undefined) {
          root.dataset.theme = systemTheme();
          root.dataset.themeFrom = 'system';
        }
        return;
      }
      if (root.dataset.themeFrom !== 'system') return;
      delete root.dataset.themeFrom;
      if (!saved) root.dataset.theme = 'dark';
    },
    { dependencies: [pathname] },
  );
  return null;
}
