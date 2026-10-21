'use client';

import { useRef, useState, type CSSProperties } from 'react';
import { useMountEffect } from '@/lib/use-mount-effect';

import {
  EMBED_ASK,
  EMBED_HEIGHT,
  STAGE_COLUMN,
  type EmbedAsk,
  type EmbedHeight,
} from '@/app/d/blog-globe/_stage/rounds';

const FIRST_HEIGHT = 640; // until the embedded figure reports its own

/** Custom properties are legal inline styles but absent from CSSProperties. */
type StyleVars = CSSProperties & Record<`--${string}`, string>;

/* One frame of /d/blog-globe/all. The embedded stage posts its height, and
   the frame takes it, so it never scrolls. In the three-column grid the
   frame lays the figure out at the stage's column width and scales it to
   the cell, so every figure keeps its desktop layout; stacked on a narrow
   screen it lays the figure out at the cell's own width (rounds-grid.css). */
export default function RoundFrame({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const cellRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [cellWidth, setCellWidth] = useState<number>(STAGE_COLUMN);
  const [height, setHeight] = useState(FIRST_HEIGHT);

  useMountEffect(() => {
    const cell = cellRef.current;
    const frame = frameRef.current;
    if (!cell || !frame) return;
    const observer = new ResizeObserver(() => setCellWidth(cell.clientWidth));
    observer.observe(cell);
    const onMessage = (event: MessageEvent<Partial<EmbedHeight> | null>) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frame.contentWindow) return;
      const reported = event.data?.type === EMBED_HEIGHT && event.data.height;
      if (typeof reported === 'number' && reported > 0) setHeight(reported);
    };
    window.addEventListener('message', onMessage);
    // the frame may have reported before this page listened
    const ask: EmbedAsk = { type: EMBED_ASK };
    frame.contentWindow?.postMessage(ask, window.location.origin);
    return () => {
      observer.disconnect();
      window.removeEventListener('message', onMessage);
    };
  });

  const style: StyleVars = {
    '--grr-w': `${STAGE_COLUMN}px`,
    '--grr-h': `${height}px`,
    '--grr-s': String(Math.min(1, cellWidth / STAGE_COLUMN)),
  };

  return (
    <div ref={cellRef} className='grr-frame' style={style}>
      <iframe ref={frameRef} src={src} title={title} loading='lazy' />
    </div>
  );
}
