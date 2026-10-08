'use client';

import { useRef, useState } from 'react';

import { ThumbShot } from '@/components/viewer/ThumbShot';
import { cn } from '@/lib/cn';
import { directionShots } from '@/lib/directions';
import type { Direction } from '@/lib/directions';
import type { ShellItem } from '@/lib/shell-data';
import { useLayoutWork } from '@/lib/use-layout-work';
import { useMountEffect } from '@/lib/use-mount-effect';

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
 * While the exhibit is off screen (the reader has scrolled the book past
 * it) the frame is frozen through the gt:freeze gate in layout.tsx, the
 * one the presenter's wall uses, and it resumes when the exhibit returns;
 * a frame that loads off screen is frozen as it loads. The theme reaches
 * the frame through the storage event the boot script in layout.tsx
 * listens for.
 */
export function DirectionFrame({ direction, item }: DirectionFrameProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState<string | null>(null);
  const exhibit = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  /* whether the exhibit is on screen, read when a frame loads */
  const inView = useRef(true);

  /* tell the frame's rAF gate whether to run */
  const sync = () => {
    frame.current?.contentWindow?.postMessage({ type: 'gt:freeze', frozen: !inView.current }, window.location.origin);
  };

  useMountEffect(() => {
    const el = exhibit.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      inView.current = entry?.isIntersecting ?? true;
      sync();
    });
    observer.observe(el);
    return () => observer.disconnect();
  });

  useLayoutWork(
    () => {
      const timer = window.setTimeout(() => setSrc(`/d/${direction.slug}?chrome=0`), SETTLE_MS);
      return () => window.clearTimeout(timer);
    },
    { dependencies: [direction.slug], revertOnUpdate: true }
  );

  const shot: ShellItem = item ?? { id: direction.slug, title: direction.name, shot: directionShots(direction.slug) };
  const on = src !== null && ready === src;

  return (
    <div className='dr-exhibit' ref={exhibit}>
      <ThumbShot item={shot} />
      {src ? (
        <iframe
          key={src}
          ref={frame}
          className={cn('dr-frame', on && 'is-on')}
          src={src}
          title={`${shot.title}, live at ${FRAME_W} pixels wide`}
          onLoad={() => {
            setReady(src);
            sync();
          }}
        />
      ) : null}
    </div>
  );
}
