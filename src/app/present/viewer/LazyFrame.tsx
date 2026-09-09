'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A scaled-down live preview of a direction page. The iframe only exists
 * while the row is near the viewport — the direction pages run WebGL, and
 * browsers cap live GL contexts, so far-away thumbnails must release theirs.
 *
 * A wall of live shaders is also prohibitively heavy, so once a page has
 * painted and its entrance has settled, its animation loops are frozen via
 * the rAF gate every page installs (see the root layout script). Thumbnails
 * idle as stills and animate only under the pointer.
 */
const FRAME_WIDTH = 1440;
const SETTLE_MS = 2800;

export default function LazyFrame({ slug }: { slug: string }) {
  const holder = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const settleTimer = useRef(0);
  const [visible, setVisible] = useState(false);
  const [scale, setScale] = useState(0.18);

  const setFrozen = (frozen: boolean) => {
    frame.current?.contentWindow?.postMessage({ type: 'gt:freeze', frozen }, '*');
  };

  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? false),
      { rootMargin: '300px 0px' }
    );
    observer.observe(el);
    // scale() only accepts a plain number, so the card-to-frame ratio can't be
    // expressed in CSS container units — measure it instead.
    const sizer = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width ?? 0;
      if (width) setScale(width / FRAME_WIDTH);
    });
    sizer.observe(el);
    return () => {
      observer.disconnect();
      sizer.disconnect();
      window.clearTimeout(settleTimer.current);
    };
  }, []);

  return (
    <div
      ref={holder}
      className='pr-thumb'
      onMouseEnter={() => {
        window.clearTimeout(settleTimer.current);
        setFrozen(false);
      }}
      onMouseLeave={() => setFrozen(true)}
    >
      {visible ? (
        <iframe
          ref={frame}
          src={`/d/${slug}?chrome=0`}
          title={`${slug} preview`}
          loading='lazy'
          tabIndex={-1}
          aria-hidden
          style={{ transform: `scale(${scale})` }}
          onLoad={() => {
            // Let the hero paint and the entrance settle before freezing.
            window.clearTimeout(settleTimer.current);
            settleTimer.current = window.setTimeout(
              () => setFrozen(true),
              SETTLE_MS
            );
          }}
        />
      ) : (
        <span className='pr-thumb-empty'>·</span>
      )}
    </div>
  );
}
