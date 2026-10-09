'use client';

import { useRef, useState } from 'react';

import { postTheme, type Theme } from '@/components/viewer/ThemeButton';

/**
 * A verdict card's preview: the direction's 640x360 thumbnail at rest, and a
 * live iframe of the page only while a mouse is over the card. A wall of
 * live direction pages kept about twelve documents, their WebGL and their
 * hydration running on the presenter's main thread, so the frame mounts on
 * pointer enter and unmounts on leave. Touch shows the still.
 */
const FRAME_WIDTH = 1440;

export default function LazyFrame({ slug, theme }: { slug: string; theme: Theme }) {
  const holder = useRef<HTMLDivElement>(null);
  // the frame's scale while live, read from the card's width on enter
  const [scale, setScale] = useState(0);
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      ref={holder}
      className='pr-thumb'
      onPointerEnter={(event) => {
        if (event.pointerType === 'touch') return;
        setScale((holder.current?.clientWidth ?? 0) / FRAME_WIDTH);
      }}
      onPointerLeave={() => {
        setScale(0);
        setLoaded(false);
      }}
    >
      <img
        src={`/shots/thumb/${slug}${theme === 'dark' ? '-dark' : ''}.webp`}
        alt=''
        loading='lazy'
        decoding='async'
      />
      {scale > 0 && (
        <iframe
          src={`/d/${slug}?chrome=0`}
          title={`${slug} preview`}
          tabIndex={-1}
          aria-hidden
          className={loaded ? 'is-loaded' : ''}
          style={{ transform: `scale(${scale}) translateY(-50%)` }}
          onLoad={(event) => {
            // the theme reaches a fresh frame even where storage is blocked
            postTheme(event.currentTarget.contentWindow, theme);
            setLoaded(true);
          }}
        />
      )}
    </div>
  );
}
