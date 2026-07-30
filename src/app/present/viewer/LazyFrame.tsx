'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A scaled-down live preview of a direction page. The iframe only exists
 * while the row is near the viewport — the direction pages run WebGL, and
 * browsers cap live GL contexts, so far-away thumbnails must release theirs.
 */
const FRAME_WIDTH = 1440;

export default function LazyFrame({ slug }: { slug: string }) {
  const holder = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [scale, setScale] = useState(0.18);

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
    };
  }, []);

  return (
    <div ref={holder} className='pr-thumb'>
      {visible ? (
        <iframe
          src={`/d/${slug}?chrome=0`}
          title={`${slug} preview`}
          loading='lazy'
          tabIndex={-1}
          aria-hidden
          style={{ transform: `scale(${scale})` }}
        />
      ) : (
        <span className='pr-thumb-empty'>·</span>
      )}
    </div>
  );
}
