'use client';

import { useRef, useState } from 'react';
import {
  SiDjango,
  SiFlask,
  SiNextdotjs,
  SiNodedotjs,
  SiReact,
  SiSanity,
} from '@icons-pack/react-simple-icons';
import { ChevronLeft, ChevronRight, Package, Terminal } from 'lucide-react';

import { useMountEffect } from '@/lib/use-mount-effect';

import { postHref, RELEASES } from '../../singularity/company-sections/posts';
import GtMark from './GtMark';
import { formatDay } from './model';

import type { ComponentType } from 'react';

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

/* Release titles are frontmatter like "pkg@2.1.0" — sometimes several
   packages cut together, "gt-flask@0.1.0 / gt-django@0.1.0". */
function splitRelease(title: string) {
  const segments = title
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean);
  const parsed = segments.map((segment) => {
    const at = segment.lastIndexOf('@');
    if (at <= 0) return { pkg: segment, version: '' };
    return { pkg: segment.slice(0, at), version: segment.slice(at + 1) };
  });
  const first = parsed[0] ?? { pkg: title, version: '' };
  return {
    pkg: first.pkg,
    label: parsed.map((entry) => entry.pkg).join(' · '),
    version: first.version,
  };
}

/**
 * The changelog as a departures board: exactly five release slabs
 * across the hall, the rest waiting past the right edge — arrows and
 * scroll snap page through them, and a mouse drag pans the hall. Each
 * slab carries the mono-free date, the package name, the version on a
 * single flap chip, and its marque seated in the corner.
 */
export default function ChangelogBoard() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startX: 0, startLeft: 0, moved: 0 });
  const [canBack, setCanBack] = useState(false);
  const [canAhead, setCanAhead] = useState(false);
  const [dragging, setDragging] = useState(false);

  const parsed = RELEASES.map((release) => ({
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
    track.scrollBy({ left: dir * track.clientWidth, behavior: 'smooth' });
  };

  /* mouse drag pans the hall; a real drag swallows the click so the
     release never opens a release. Touch keeps native scrolling. */
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const track = trackRef.current;
    if (!track) return;
    dragRef.current = {
      startX: event.clientX,
      startLeft: track.scrollLeft,
      moved: 0,
    };
    setDragging(true);
    track.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const track = trackRef.current;
    if (!track) return;
    const dx = event.clientX - dragRef.current.startX;
    dragRef.current.moved = Math.max(dragRef.current.moved, Math.abs(dx));
    track.scrollLeft = dragRef.current.startLeft - dx;
  };

  const onPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    trackRef.current?.releasePointerCapture(event.pointerId);
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
              disabled={!canBack}
              onClick={() => page(-1)}
            >
              <ChevronLeft size={15} aria-hidden='true' />
            </button>
            <button
              type='button'
              aria-label='Next releases'
              disabled={!canAhead}
              onClick={() => page(1)}
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
                href={postHref(release.slug)}
                className='blog-updates-cell'
              >
                <span className='blog-updates-meta'>
                  <time dateTime={release.date}>{formatDay(release.date)}</time>
                </span>
                <strong>{release.label}</strong>
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
