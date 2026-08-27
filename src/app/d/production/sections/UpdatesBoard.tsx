'use client';

import {
  SiDjango,
  SiFlask,
  SiNextdotjs,
  SiNodedotjs,
  SiReact,
  SiSanity,
} from '@icons-pack/react-simple-icons';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Package,
  Terminal,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import {
  formatPostDate,
  postHref,
  splitRelease,
  type IndexRelease,
} from './blog-index-data';
import GtMark from './GtMark';

import type { ComponentType } from 'react';

type UpdatesBoardProps = {
  releases: readonly IndexRelease[];
};

/* Each package under its own marque, set in the board's ink; the core
   gt package carries the house monogram, and packages without a marque
   ship under the crate. */
const PACKAGE_MARKS: readonly [RegExp, ComponentType<{ size?: number }>][] = [
  [/^gt$/, GtMark],
  [/i18n/, GtMark],
  [/react/, SiReact],
  [/next/, SiNextdotjs],
  [/node/, SiNodedotjs],
  [/sanity/, SiSanity],
  [/flask/, SiFlask],
  [/django/, SiDjango],
  [/cli/, Terminal],
];

function markFor(pkg: string): ComponentType<{ size?: number }> {
  for (const [pattern, mark] of PACKAGE_MARKS) {
    if (pattern.test(pkg)) return mark;
  }
  return Package;
}

/**
 * Changelog strip: renders one linked slab per release in a
 * horizontally scrolling track, paged by the arrow buttons and
 * pannable by mouse drag. The cell width in blog-index.css assumes
 * exactly five slabs per track viewport.
 *
 * Ported from apps/landing/src/components/blog/UpdatesBoard.tsx. The
 * shipped board is fed by DevlogList, which slims the devlog frontmatter
 * and renders nothing when there are no releases; here the release array
 * is the vendored fixture and the empty guard lives in BlogList.
 */
export default function UpdatesBoard({ releases }: UpdatesBoardProps) {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/production';
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    startX: 0,
    startLeft: 0,
    moved: 0,
    captured: false,
  });
  const [canBack, setCanBack] = useState(false);
  const [canAhead, setCanAhead] = useState(false);
  const [dragging, setDragging] = useState(false);

  const parsed = releases.map((release) => ({
    ...release,
    ...splitRelease(release.title),
  }));

  const measure = () => {
    const track = trackRef.current;
    if (!track) return;
    setCanBack(track.scrollLeft > 4);
    setCanAhead(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
  };

  useMountEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });

  const page = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    /* page by the content box: the slabs are sized against it, so a
       padded clientWidth would overshoot the board pitch */
    const style = getComputedStyle(track);
    const pitch =
      track.clientWidth -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight);
    track.scrollBy({ left: dir * pitch, behavior: 'smooth' });
  };

  /* mouse drag pans the hall; a real drag swallows the click so the
     release never opens a release. Touch keeps native scrolling.
     Pointer capture waits for actual movement — capturing on the
     press retargets the click to the track and dead-ends plain
     clicks on the slabs. */
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    dragRef.current = {
      startX: event.clientX,
      startLeft: track.scrollLeft,
      moved: 0,
      captured: false,
    };
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    /* the release can land off-track before capture engages — a stale
       flag would scroll-jack the next hover */
    if (event.buttons === 0) {
      setDragging(false);
      return;
    }
    const track = trackRef.current;
    if (!track) return;
    const dx = event.clientX - dragRef.current.startX;
    dragRef.current.moved = Math.max(dragRef.current.moved, Math.abs(dx));
    if (!dragRef.current.captured && dragRef.current.moved > 6) {
      dragRef.current.captured = true;
      track.setPointerCapture(event.pointerId);
    }
    if (dragRef.current.captured) {
      track.scrollLeft = dragRef.current.startLeft - dx;
    }
  };

  const onPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    if (dragRef.current.captured) {
      trackRef.current?.releasePointerCapture(event.pointerId);
    }
    /* the click this gesture produces (if any) fires before this
       timeout, so a drag still suppresses it — but a cancelled or
       clickless end never leaves the latch set to eat the next click */
    setTimeout(() => {
      dragRef.current.moved = 0;
    }, 0);
  };

  const onClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current.moved > 6) {
      event.preventDefault();
      event.stopPropagation();
      dragRef.current.moved = 0;
    }
  };

  return (
    <section className='tc-sec blog-updates'>
      <div className='blog-updates-board'>
        <header className='blog-updates-head'>
          <h2>Changelog</h2>
          <div className='blog-updates-arrows'>
            <button
              type='button'
              aria-label='Previous releases'
              aria-disabled={!canBack}
              onClick={() => canBack && page(-1)}
            >
              <ChevronLeft size={15} aria-hidden='true' />
            </button>
            <button
              type='button'
              aria-label='Next releases'
              aria-disabled={!canAhead}
              onClick={() => canAhead && page(1)}
            >
              <ChevronRight size={15} aria-hidden='true' />
            </button>
          </div>
        </header>
        <div
          className={`blog-updates-track${dragging ? ' is-dragging' : ''}`}
          ref={trackRef}
          onScroll={measure}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onClickCapture={onClickCapture}
          /* anchors are draggable by default; native DnD would steal
             the pan gesture with a pointercancel */
          onDragStart={(event) => event.preventDefault()}
        >
          {parsed.map((release) => {
            const Mark = markFor(release.pkg);
            return (
              <a
                key={release.slug}
                href={postHref(base, release.slug)}
                className='blog-updates-cell'
              >
                <span className='blog-updates-meta'>
                  <time dateTime={release.date}>
                    {formatPostDate(release.date)}
                  </time>
                </span>
                <ArrowUpRight
                  size={14}
                  aria-hidden='true'
                  className='blog-updates-go'
                />
                <strong>{release.label}</strong>
                {release.headline && (
                  <span className='blog-updates-headline'>
                    {release.headline}
                  </span>
                )}
                {release.version && (
                  <span className='blog-updates-ver'>
                    {`v${release.version}`}
                  </span>
                )}
                <span className='blog-updates-mark' aria-hidden='true'>
                  <Mark size={24} />
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
