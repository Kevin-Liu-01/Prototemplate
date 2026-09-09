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
 * light one in both themes. A shot with no dark twin at all (the archive
 * captures) is wrapped in .pt-shot-mat, which Sidebar.css insets on a
 * --pt-plate ground with a --pt-hair rule in the dark theme, so a light
 * picture never fills a frame on the ink ground as a bright block.
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
  const light = (
    <img
      className={cn('pt-shot is-light', dark !== null && 'has-dark')}
      src={shot.light}
      alt=''
      loading='lazy'
      decoding='async'
      draggable={false}
      onError={() => setLightBroken(true)}
    />
  );
  if (dark === null) {
    return <span className='pt-shot-mat'>{light}</span>;
  }
  return (
    <>
      {light}
      <img
        className='pt-shot is-dark'
        src={dark}
        alt=''
        loading='lazy'
        decoding='async'
        draggable={false}
        onError={() => setDarkBroken(true)}
      />
    </>
  );
}
