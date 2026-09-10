'use client';

import { useGSAP } from '@gsap/react';
import { useState } from 'react';

import { ThumbShot } from '@/components/viewer/ThumbShot';
import { cn } from '@/lib/cn';
import { directionShots } from '@/lib/directions';
import type { Direction } from '@/lib/directions';
import type { ShellItem } from '@/lib/shell-data';

import './DirectionFrame.css';

/** The live exhibit's stage in CSS pixels, before the sheet that holds it scales it: the site exhibit size. */
export const FRAME_W = 1440;
export const FRAME_H = 900;

/** How long a new direction waits before the frame loads it, so rapid arrowing through a list does not load every page. */
const SETTLE_MS = 300;

export type DirectionFrameProps = {
  direction: Direction;
  /** the shell item the frame stands for, when the route has one: its title and capture; the direction's own otherwise */
  item?: ShellItem;
};

/**
 * The live exhibit of a direction: one same-origin iframe of the direction
 * page with its corner hidden (?chrome=0), at 1440x900 inside whatever
 * stage holds it, which scales it (the gallery's fixed sheet in slide
 * mode, the direction page's own frame). The static capture sits behind it
 * and shows until the page has loaded; a new direction waits SETTLE_MS
 * before the frame takes it. The frame is keyed by its address, so a late
 * load event from a page that was skipped never marks the next one ready.
 * The gt:freeze gate the presenter uses for its wall is not needed here:
 * this is the one live frame in its stage, and it unmounts with it. The
 * theme reaches the frame through the storage event the boot script in
 * layout.tsx listens for.
 */
export function DirectionFrame({ direction, item }: DirectionFrameProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState<string | null>(null);

  useGSAP(
    () => {
      const timer = window.setTimeout(() => setSrc(`/d/${direction.slug}?chrome=0`), SETTLE_MS);
      return () => window.clearTimeout(timer);
    },
    { dependencies: [direction.slug], revertOnUpdate: true }
  );

  const shot: ShellItem = item ?? { id: direction.slug, title: direction.name, shot: directionShots(direction.slug) };
  const on = src !== null && ready === src;

  return (
    <div className='dr-exhibit'>
      <ThumbShot item={shot} />
      {src ? (
        <iframe
          key={src}
          className={cn('dr-frame', on && 'is-on')}
          src={src}
          title={`${shot.title}, live at ${FRAME_W} pixels wide`}
          onLoad={() => setReady(src)}
        />
      ) : null}
    </div>
  );
}
