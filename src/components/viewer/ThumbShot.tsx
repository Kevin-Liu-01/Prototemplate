'use client';

import { useState } from 'react';

import { cn } from '@/lib/cn';
import type { ShellItem } from '@/lib/shell-data';

import './Sidebar.css';

export type ThumbShotProps = { item: ShellItem };

/**
 * A captured thumbnail: light and dark image twins from item.shot, the dark
 * one shown under html[data-theme='dark'] by CSS alone, so a theme switch
 * costs no render. Fills whatever frame holds it (.pt-thumb-frame in the
 * list and grid, .pt-page-frame in the book) with object-fit cover from the
 * top. Without a shot, or when the light file fails to load, it draws the
 * blank plate with the item number. A missing dark file falls back to the
 * light one in both themes.
 */
export function ThumbShot({ item }: ThumbShotProps) {
  const [lightBroken, setLightBroken] = useState(false);
  const [darkBroken, setDarkBroken] = useState(false);
  const shot = item.shot;

  if (!shot || lightBroken) {
    return (
      <div className='pt-plate' aria-hidden='true'>
        {item.n || item.title.charAt(0)}
      </div>
    );
  }

  const dark = shot.dark && !darkBroken ? shot.dark : null;
  return (
    <>
      <img
        className={cn('pt-shot is-light', dark !== null && 'has-dark')}
        src={shot.light}
        alt=''
        loading='lazy'
        decoding='async'
        draggable={false}
        onError={() => setLightBroken(true)}
      />
      {dark !== null ? (
        <img
          className='pt-shot is-dark'
          src={dark}
          alt=''
          loading='lazy'
          decoding='async'
          draggable={false}
          onError={() => setDarkBroken(true)}
        />
      ) : null}
    </>
  );
}
