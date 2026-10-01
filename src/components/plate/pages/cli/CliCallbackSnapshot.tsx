'use client';

import { useState } from 'react';

import { useMountEffect } from '@/components/plate/hooks/use-mount-effect';
import {
  cliCallbackPage,
  type CliCallbackState,
} from '@/components/plate/lib/cliCallbackPages';
import { readTheme, type Theme } from '@/components/viewer/ThemeButton';

type CliCallbackSnapshotProps = {
  state: CliCallbackState;
};

const titles: Record<CliCallbackState, string> = {
  signedIn: 'The CLI callback page, signed in',
  denied: 'The CLI callback page, denied',
  failed: 'The CLI callback page, failed',
};

/**
 * The snapshot document with its colour scheme pinned to the site's theme.
 * The real page follows the OS through `color-scheme: light dark` and a
 * prefers-color-scheme block; the sandboxed frame cannot see the site's
 * data-theme, so both are rewritten before the document is handed to
 * srcDoc: the scheme becomes the theme, and the dark block's query becomes
 * one that always matches (dark) or never does (light). Each document
 * carries one of each, so the first match is the only one.
 */
function themedPage(state: CliCallbackState, theme: Theme): string {
  return cliCallbackPage(state)
    .replace('color-scheme: light dark', `color-scheme: ${theme}`)
    .replace(
      '@media (prefers-color-scheme: dark)',
      theme === 'dark' ? '@media all' : '@media not all'
    );
}

/**
 * One of the three documents the gt CLI serves on its 127.0.0.1 callback,
 * rendered from the snapshot in cliCallbackPages.ts inside a sandboxed
 * iframe on the bare frame. An empty sandbox gives the document no script,
 * no forms and no origin, so the snapshot stays a picture of the page. The
 * document carries its own styles; its colour scheme follows the site's
 * theme, read from <html data-theme> as PlateThemeToggle reads it and kept
 * by a MutationObserver, so the foot's flip reaches it, and the frame is
 * keyed on the theme so a flip reloads the document. The server has no
 * theme to render, so until the theme is read after mount a block of the
 * same height holds the place: a document in the wrong scheme that then
 * reloaded would flash.
 */
export default function CliCallbackSnapshot({
  state,
}: CliCallbackSnapshotProps) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useMountEffect(() => {
    setTheme(readTheme());
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  });

  if (!theme) {
    return (
      <div
        className='bg-background h-svh w-full'
        data-testid={`cli-callback-${state}-pending`}
      />
    );
  }

  return (
    <iframe
      key={theme}
      title={titles[state]}
      sandbox=''
      srcDoc={themedPage(state, theme)}
      className='bg-background block h-svh w-full border-0'
      data-testid={`cli-callback-${state}`}
      data-theme={theme}
    />
  );
}
