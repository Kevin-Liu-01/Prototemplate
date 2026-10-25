'use client';

import { useRef, useState, type CSSProperties } from 'react';

import {
  EMBED_ASK,
  EMBED_HEIGHT,
  STAGE_COLUMN,
  type EmbedAsk,
  type EmbedHeight,
  type GlobeRoundKey,
  type GlobeVariantKey,
} from '@/app/d/blog-globe/_stage/rounds';
import { FIGURE_HEIGHTS, embedHref } from '@/components/blog-globe/figures';
import { postTheme, readTheme } from '@/lib/theme';
import { useMountEffect } from '@/lib/use-mount-effect';

import './blog-globe.css';

/** Below this width a 'fit' frame lays the figure out at its own width, where the figure's container queries give it the phone layout. */
const FIT_BELOW = 600;

/** How far outside the viewport a frame starts to load its figure. */
const ARM_MARGIN = '320px 0px';

export type GlobeFrameLayout = 'scale' | 'fit';

export type GlobeFrameProps = {
  round: GlobeRoundKey;
  variant: GlobeVariantKey;
  /** the frame's accessible name */
  title: string;
  /**
   * 'scale' lays the figure out at the review column (712 px) at every
   * width and scales it down to the box, as a cell of the comparison grid
   * does. 'fit' does the same from 600 px up and below that lays the
   * figure out at the box's own width.
   */
  layout?: GlobeFrameLayout;
};

/**
 * One live globe figure in a same-origin frame of its round's route
 * (src/app/d/blog-globe), so each round keeps its own stylesheets and the
 * docs bundle carries none of the figures' code. The frame loads when it
 * comes within ARM_MARGIN of the viewport. The figure posts its height
 * (EMBED_HEIGHT) and the frame takes it, so the frame never scrolls; until
 * then the box keeps the measured height from figures.ts and the frame
 * stays transparent, so the stage's own first render never shows. The
 * frame follows the page's theme through the gt-theme message the root
 * layout's boot script reads.
 */
export default function GlobeFrame({ round, variant, title, layout = 'fit' }: GlobeFrameProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [armed, setArmed] = useState(false);
  const [width, setWidth] = useState<number | null>(null);
  const [reported, setReported] = useState<number | null>(null);

  useMountEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    setWidth(box.clientWidth);
    const sizes = new ResizeObserver(() => setWidth(box.clientWidth));
    sizes.observe(box);

    let near: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === 'undefined') setArmed(true);
    else {
      near = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          setArmed(true);
          near?.disconnect();
        },
        { rootMargin: ARM_MARGIN }
      );
      near.observe(box);
    }

    const onMessage = (event: MessageEvent<Partial<EmbedHeight> | null>) => {
      if (event.origin !== window.location.origin) return;
      const frame = frameRef.current;
      if (!frame || event.source !== frame.contentWindow) return;
      const height = event.data?.type === EMBED_HEIGHT ? event.data.height : undefined;
      if (typeof height === 'number' && height > 0) setReported(height);
    };
    window.addEventListener('message', onMessage);

    const theme = new MutationObserver(() => postTheme(frameRef.current?.contentWindow, readTheme()));
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      sizes.disconnect();
      near?.disconnect();
      window.removeEventListener('message', onMessage);
      theme.disconnect();
    };
  });

  /* the frame may have posted its height before this page listened, and it
     takes the theme from storage, which a private window does not share */
  const onLoad = () => {
    const target = frameRef.current?.contentWindow;
    if (!target) return;
    postTheme(target, readTheme());
    const ask: EmbedAsk = { type: EMBED_ASK };
    target.postMessage(ask, window.location.origin);
  };

  const [columnHeight, phoneHeight] = FIGURE_HEIGHTS[round][variant];
  const fit = layout === 'fit' && width !== null && width < FIT_BELOW;
  const scale = fit || width === null ? 1 : Math.min(1, width / STAGE_COLUMN);
  const column = reported !== null && !fit ? reported : columnHeight;
  const phone = reported !== null && fit ? reported : phoneHeight;

  /* the box's size is CSS alone (blog-globe.css), so the first paint
     already holds the figure's space; the frame's own size needs the
     measured width, and the frame only mounts after that */
  const style: CSSProperties = {
    '--bgf-ratio': `${STAGE_COLUMN} / ${column}`,
    '--bgf-phone': `${phone}px`,
    '--bgf-w': `${fit && width !== null ? width : STAGE_COLUMN}px`,
    '--bgf-h': `${fit ? phone : column}px`,
    '--bgf-s': String(scale),
  };

  return (
    <div className='bgf-fit'>
      <div
        ref={boxRef}
        className='bgf-frame'
        data-layout={layout}
        data-ready={reported !== null ? '' : undefined}
        style={style}
      >
        {armed && width !== null ? (
          <iframe ref={frameRef} src={embedHref(round, variant)} title={title} onLoad={onLoad} />
        ) : null}
      </div>
    </div>
  );
}
