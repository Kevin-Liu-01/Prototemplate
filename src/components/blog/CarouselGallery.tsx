'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import type { MouseEvent, PointerEvent, UIEvent } from 'react';
import { useRef, useState } from 'react';

import { BLOG_COLUMN_SIZES } from '@/lib/blog-image-sizes';
import { useMountEffect } from '@/lib/use-mount-effect';

export type CarouselImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

type CarouselGalleryProps = {
  items: readonly CarouselImage[];
  /** Accessible name for the whole gallery, e.g. "Where things live". */
  label?: string;
  /** Milliseconds between automatic advances; 0 turns autoplay off. */
  interval?: number;
};

const AUTOPLAY_MS = 4500;
/* A press that travels further than this before release is a drag, not a click. */
const DRAG_PX = 8;
/* Commands closer together than this are one command: a double-click or a
   held key moves one slide, not two, and the scroll gets to finish. */
const DEBOUNCE_MS = 350;

/**
 * The blog's image gallery, the same instrument the landing site ships: a
 * scroll-snap track that loops, a click on the left half of the image
 * going back and on the right half forward, 16px chevrons over soft
 * scrims that surface on hover or focus, dots, and autoplay that pauses on
 * hover, focus and off-screen and stays off under reduced motion. The
 * track is the source of truth for the visible slide; relative commands
 * step from the last requested slide so rapid presses land one slide each.
 */
export default function CarouselGallery({ items, label, interval = AUTOPLAY_MS }: CarouselGalleryProps) {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const settleRef = useRef(0);
  const indexRef = useRef(0);
  const targetRef = useRef(0);
  const pendingRef = useRef<number | null>(null);
  const holdRef = useRef({ hover: false, focus: false, visible: false, lastInteraction: 0 });
  const pressRef = useRef<{ x: number; y: number; dragged: boolean } | null>(null);
  const [index, setIndex] = useState(0);
  const [pointerOver, setPointerOver] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const count = items.length;
  const autoplay = count > 1 && interval > 0;
  const shown = pointerOver || focusWithin;

  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const goTo = (next: number, byUser = true) => {
    const track = trackRef.current;
    if (!track) return;
    if (byUser) {
      const now = Date.now();
      if (now - holdRef.current.lastInteraction < DEBOUNCE_MS) return;
      holdRef.current.lastInteraction = now;
    }
    const target = (next + count) % count;
    targetRef.current = target;
    const left = target * track.clientWidth;
    if (Math.abs(track.scrollLeft - left) < 1) {
      pendingRef.current = null;
      return;
    }
    pendingRef.current = target;
    track.scrollTo({ left, behavior: reduceMotion() ? 'auto' : 'smooth' });
  };
  const step = (delta: number) => goTo(targetRef.current + delta);

  const onTrackScroll = (event: UIEvent<HTMLDivElement>) => {
    const track = event.currentTarget;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const width = track.clientWidth || 1;
      const visible = Math.max(0, Math.min(count - 1, Math.round(track.scrollLeft / width)));
      indexRef.current = visible;
      setIndex(visible);
      if (pendingRef.current === null || pendingRef.current === visible) {
        pendingRef.current = null;
        targetRef.current = visible;
      }
    });
    window.clearTimeout(settleRef.current);
    settleRef.current = window.setTimeout(() => {
      pendingRef.current = null;
      targetRef.current = indexRef.current;
    }, 160);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest('button')) return;
    pressRef.current = { x: event.clientX, y: event.clientY, dragged: false };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const press = pressRef.current;
    if (!press || press.dragged) return;
    if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > DRAG_PX) {
      press.dragged = true;
      pendingRef.current = null;
      targetRef.current = indexRef.current;
    }
  };
  const onPointerCancel = () => {
    pressRef.current = null;
  };
  const onPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') pressRef.current = null;
  };
  const onImageClick = (event: MouseEvent<HTMLDivElement>) => {
    const press = pressRef.current;
    pressRef.current = null;
    if ((event.target as Element).closest('button')) return;
    if (press?.dragged) return;
    const { left, width } = event.currentTarget.getBoundingClientRect();
    step(event.clientX - left < width / 2 ? -1 : 1);
  };

  useMountEffect(() => {
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.clearTimeout(settleRef.current);
    };
  });

  useMountEffect(() => {
    if (!autoplay) return;
    const hold = holdRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        hold.visible = !!entry?.isIntersecting;
      },
      { threshold: 0.5 }
    );
    if (rootRef.current) observer.observe(rootRef.current);
    const timer = window.setInterval(() => {
      if (reduceMotion()) return;
      if (document.hidden || !hold.visible || hold.hover || hold.focus) return;
      if (Date.now() - hold.lastInteraction < interval) return;
      goTo(targetRef.current + 1, false);
    }, interval);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
    };
  });

  if (count === 0) return null;
  const multiple = count > 1;

  return (
    <figure
      ref={rootRef}
      className='blog-carousel'
      aria-label={label}
      aria-roledescription={multiple ? 'carousel' : undefined}
      data-testid='blog-carousel'
      data-autoplay={autoplay ? interval : undefined}
      onPointerEnter={(event) => {
        holdRef.current.hover = true;
        if (event.pointerType === 'mouse') setPointerOver(true);
      }}
      onPointerLeave={() => {
        holdRef.current.hover = false;
        setPointerOver(false);
      }}
      onFocus={() => {
        holdRef.current.focus = true;
        setFocusWithin(true);
      }}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        holdRef.current.focus = false;
        setFocusWithin(false);
      }}
    >
      <div
        className={`blog-carousel-frame${multiple ? ' is-multiple' : ''}`}
        onPointerDown={multiple ? onPointerDown : undefined}
        onPointerMove={multiple ? onPointerMove : undefined}
        onPointerCancel={multiple ? onPointerCancel : undefined}
        onPointerLeave={multiple ? onPointerLeave : undefined}
        onClick={multiple ? onImageClick : undefined}
      >
        <div
          ref={trackRef}
          className='blog-carousel-track'
          tabIndex={multiple ? 0 : -1}
          onScroll={onTrackScroll}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') {
              event.preventDefault();
              step(1);
            } else if (event.key === 'ArrowLeft') {
              event.preventDefault();
              step(-1);
            }
          }}
        >
          {items.map((item, i) => (
            <div key={item.src} className='blog-carousel-slide' aria-hidden={i !== index}>
              <Image
                src={item.src}
                alt={item.alt}
                width={item.width ?? 3840}
                height={item.height ?? 2160}
                sizes={BLOG_COLUMN_SIZES}
                quality={95}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
        {multiple ? (
          <>
            <EdgeArrow side='left' shown={shown} label='Previous image' onClick={() => step(-1)} />
            <EdgeArrow side='right' shown={shown} label='Next image' onClick={() => step(1)} />
          </>
        ) : null}
      </div>
      {multiple ? (
        <div className='blog-carousel-dots'>
          {items.map((item, i) => (
            <button
              key={item.src}
              type='button'
              className={`blog-carousel-dot${i === index ? ' is-current' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
            />
          ))}
          <span className='blog-sr-only' aria-live='polite'>
            {index + 1} / {count}
          </span>
        </div>
      ) : null}
    </figure>
  );
}

type EdgeArrowProps = {
  side: 'left' | 'right';
  shown: boolean;
  label: string;
  onClick: () => void;
};

/* A soft scrim on one edge of the image with a 16px chevron over it, both
   fading in while the gallery is hovered or focused. */
function EdgeArrow({ side, shown, label, onClick }: EdgeArrowProps) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <div className={`blog-carousel-edge is-${side}${shown ? ' is-shown' : ''}`} aria-hidden={!shown}>
      <button type='button' tabIndex={shown ? 0 : -1} onClick={onClick} aria-label={label} className='blog-carousel-arrow'>
        <Icon aria-hidden='true' size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
