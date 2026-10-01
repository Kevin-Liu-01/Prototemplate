'use client';

import { useState } from 'react';

import { useMountEffect } from '@/components/plate/hooks/use-mount-effect';
import { cn } from '@/components/plate/lib/utils';
import { useGT } from '@/components/plate/shims/gt-next';
import {
  readTheme,
  toggleTheme,
  type Theme,
} from '@/components/viewer/ThemeButton';

type PlateThemeToggleProps = {
  className?: string;
};

/**
 * The frame's light and dark flip, in the dashboard's dress (one of its
 * 32px ghost icon buttons with the half-disc glyphs, ◐ in light and ◑ in
 * dark) and on Prototemplate's theme: toggleTheme from the viewer stamps
 * <html data-theme>, writes the gt-theme key the boot script in
 * src/app/layout.tsx reads before paint, and tells every frame on the
 * page, so the plate pages and the shell around them agree. The glyph is
 * picked by the `dark` variant (plate-theme.css binds it to the
 * attribute), so it is right before hydration; the accessible name follows
 * the attribute through a MutationObserver, as the viewer's button does.
 */
export default function PlateThemeToggle({ className }: PlateThemeToggleProps) {
  const gt = useGT();
  /* The site's default until the attribute is read; the server has no
     theme to render. */
  const [theme, setTheme] = useState<Theme>('dark');

  useMountEffect(() => {
    setTheme(readTheme());
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  });

  return (
    <button
      type='button'
      onClick={() => {
        toggleTheme();
      }}
      className={cn(
        'text-foreground flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-[15px] leading-none transition-colors duration-150 outline-none hover:bg-(--plate) focus-visible:bg-(--plate)',
        className
      )}
      aria-label={
        theme === 'light' ? gt('Switch to dark mode') : gt('Switch to light mode')
      }
      title={theme === 'light' ? gt('Dark mode') : gt('Light mode')}
    >
      <span aria-hidden='true'>
        <span className='dark:hidden'>◐</span>
        <span className='hidden dark:inline'>◑</span>
      </span>
    </button>
  );
}
