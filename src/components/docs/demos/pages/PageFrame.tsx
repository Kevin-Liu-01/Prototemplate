'use client';

import { useContext, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { useLayoutWork } from '@/lib/use-layout-work';
import { useMountEffect } from '@/lib/use-mount-effect';

import { PlateNearContext } from '../hooks';

export type FrameWidth = '1440' | '390';
export type FrameTheme = 'light' | 'dark';

/** The frame's document per width: the 1440 by 900 desktop the captures use, and a 390 by 844 phone. */
export const FRAME_SIZE: Record<FrameWidth, { w: number; h: number }> = {
  '1440': { w: 1440, h: 900 },
  '390': { w: 390, h: 844 },
};

export const WIDTH_OPTIONS: readonly { value: FrameWidth; label: string }[] = [
  { value: '1440', label: '1440px' },
  { value: '390', label: '390px' },
];

/* the tallest the stage draws a frame, so a phone frame never fills a whole screen of the docs page */
const MAX_STAGE_H = 640;

/** What an overlay needs to draw over the live frame. */
export type FrameView = {
  /** the loaded frame */
  frame: HTMLIFrameElement;
  /** the scale the frame is drawn at */
  scale: number;
  width: FrameWidth;
  /** counts the frame's load events, so an overlay reads the document again after a navigation inside it */
  loads: number;
};

type PageFrameProps = {
  /** the same-origin address the frame loads */
  src: string;
  width: FrameWidth;
  /** the theme posted to the framed page */
  theme: FrameTheme;
  /** the frame's accessible name */
  title: string;
  /** a 640 by 360 still of the page's 1440 first fold, drawn until the frame has loaded */
  still?: string | null;
  /** drawn after the frame box, inside a wrapper that holds the frame's size: the anatomy overlay and its legend */
  overlay?: (view: FrameView) => ReactNode;
};

/**
 * True while the element is within 180px of the viewport. Unlike the
 * plates' useArmed, it turns false again when the element leaves, so the
 * frame is removed and a page the reader has scrolled past costs nothing.
 * Inside PlateNearContext the host already mounts the plate only near the
 * reader, so it is true for as long as the plate is mounted.
 */
function useNear(ref: { current: HTMLElement | null }, onLeave: () => void): boolean {
  const host = useContext(PlateNearContext);
  const [near, setNear] = useState(host);
  useMountEffect(() => {
    const el = ref.current;
    if (host) return;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const on = entries[entries.length - 1]?.isIntersecting ?? true;
        setNear(on);
        if (!on) onLeave();
      },
      { rootMargin: '180px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  });
  return near;
}

/**
 * One live page in a same-origin frame, scaled to the plate, on the
 * pattern of HeadFrameDemo. The frame exists only while the plate is near
 * the viewport: it is created within 180px of it and removed when the
 * plate leaves, so a page holds at most one live document per plate. Until
 * the page has loaded, the page's still (when it has one) stands in the
 * frame's place. On load, and whenever `theme` changes, the frame is sent
 * the root layout's postMessage({ type: 'gt-theme', theme }), so it shows
 * the theme the plate asks for even where nothing is saved in storage; a
 * toggle of the docs theme also reaches it as a storage event.
 */
export default function PageFrame({ src, width, theme, title, still, overlay }: PageFrameProps) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  /* the frame whose load event has fired (its address and width), with the element and the load count */
  const [ready, setReady] = useState<{ key: string; frame: HTMLIFrameElement; loads: number } | null>(null);
  const near = useNear(box, () => setReady(null));
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const { w, h } = FRAME_SIZE[width];
  const key = `${src}@${width}`;
  const live = near && ready !== null && ready.key === key ? ready : null;

  /* the scale that fits the frame into the stage, read again on every resize */
  useLayoutWork(
    () => {
      const el = box.current;
      if (!el) return;
      const fit = () => setScale(Math.min(1, el.clientWidth / w, MAX_STAGE_H / h));
      fit();
      const observer = new ResizeObserver(fit);
      observer.observe(el);
      return () => observer.disconnect();
    },
    { dependencies: [w, h], revertOnUpdate: true }
  );

  const post = (next: FrameTheme) => {
    frameRef.current?.contentWindow?.postMessage({ type: 'gt-theme', theme: next }, window.location.origin);
  };

  /* a theme change reaches the loaded page */
  useLayoutWork(() => post(theme), { dependencies: [theme] });

  const style: CSSProperties = { '--dmo-frame-w': `${w}px`, '--dmo-frame-h': `${h}px`, '--dmo-frame-s': scale };
  const showStill = Boolean(still) && width === '1440' && !live;

  return (
    <div className='pgx-frame' style={style}>
      <div className='dmo-frame-box pgx-box' ref={box}>
        {showStill && still ? (
          <img alt='' className='pgx-back' decoding='async' height={360} loading='lazy' src={still} width={640} />
        ) : null}
        {near ? (
          <iframe
            className={live ? 'dmo-frame-doc pgx-doc is-on' : 'dmo-frame-doc pgx-doc'}
            key={key}
            ref={frameRef}
            src={src}
            title={title}
            onLoad={(event) => {
              const frame = event.currentTarget;
              post(theme);
              setReady((previous) => ({ key, frame, loads: (previous?.loads ?? 0) + 1 }));
            }}
          />
        ) : null}
        {live ? null : (
          <span className='pgx-status' role='status'>
            {near ? 'Loading the live page' : 'The live page loads on screen'}
          </span>
        )}
      </div>
      {live && overlay ? overlay({ frame: live.frame, scale, width, loads: live.loads }) : null}
    </div>
  );
}
