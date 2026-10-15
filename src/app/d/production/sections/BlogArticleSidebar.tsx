'use client';

import { AlignLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import BlogArticleShare from './BlogArticleShare';

import type { PostHeading } from './blog-post-source';

/**
 * PRODUCTION · the article's rail, a port of the shipped SideBar
 * (apps/landing/src/components/blog/SideBar.tsx and TableOfContents.tsx).
 *
 * Same two faces as the shipped one. Above 980px: a sticky column holding
 * the "Table of contents" list over a "Share" block. Below it: the docs'
 * collapsed popover bar (progress ring, current section, chevron) opening
 * to the same list with the share row at its foot. A post with no
 * headings keeps share on both faces, so the sticky bar is never an empty
 * hairline.
 *
 * The shipped rail reads its active anchors from fumadocs-core 16.16.1's
 * toc Observer, and this port runs the same rule: every heading at least
 * 90% inside the viewport is active, the most recently activated one is
 * the current section, and when none is in view the heading nearest the
 * viewport's top edge stands in.
 */

type Anchor = { id: string; active: boolean; fallback: boolean; t: number };

/** The shipped ProgressCircle: a track at quarter ink, the arc filled to
    the current section's share of the list. */
function ProgressRing({ value }: { value: number }) {
  const size = 24;
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value, 0), 1) * circumference;
  const shared = {
    cx: size / 2,
    cy: size / 2,
    r: radius,
    fill: 'none',
    strokeWidth,
  };

  return (
    <svg
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(value * 100)}
      className='pba-ring'
      role='progressbar'
      viewBox={`0 0 ${size} ${size}`}
    >
      <circle {...shared} className='pba-ring-track' />
      <circle
        {...shared}
        className='pba-ring-arc'
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap='round'
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

type Props = {
  headings: readonly PostHeading[];
  postTitle: string;
};

export default function BlogArticleSidebar({ headings, postTitle }: Props) {
  const [active, setActive] = useState<readonly string[]>([]);
  const [current, setCurrent] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);

  /* Mount-only by contract: the heading set is fixed for the life of an
     article, and the caller keys this component by slug so a different
     post remounts it rather than reusing a stale observer. */
  useMountEffect(() => {
    let items: Anchor[] = headings.map((heading) => ({ id: heading.id, active: false, fallback: false, t: 0 }));

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.length === 0) return;
        let hasActive = false;
        const updated = items.map((item) => {
          const entry = entries.find((candidate) => candidate.target.id === item.id);
          const isActive = entry ? entry.isIntersecting : item.active && !item.fallback;
          const next = item.active === isActive ? item : { ...item, t: Date.now(), active: isActive, fallback: false };
          if (isActive) hasActive = true;
          return next;
        });
        const viewTop = entries[0]?.rootBounds?.top;
        if (!hasActive && viewTop !== undefined) {
          let min = Number.MAX_VALUE;
          let fallbackAt = -1;
          updated.forEach((item, index) => {
            const element = document.getElementById(item.id);
            if (!element) return;
            const distance = Math.abs(viewTop - element.getBoundingClientRect().top);
            if (distance < min) {
              fallbackAt = index;
              min = distance;
            }
          });
          const fallback = updated[fallbackAt];
          if (fallback) updated[fallbackAt] = { ...fallback, active: true, fallback: true, t: Date.now() };
        }
        items = updated;
        let latest: Anchor | undefined;
        const ids: string[] = [];
        for (const item of updated) {
          if (!item.active) continue;
          ids.push(item.id);
          if (!latest || item.t > latest.t) latest = item;
        }
        setActive(ids);
        setCurrent(latest?.id);
      },
      { threshold: 0.9 }
    );
    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  });

  const selected = headings.findIndex((heading) => heading.id === current);
  const progress = (selected + 1) / Math.max(1, headings.length);

  const list = (onPick?: () => void) => (
    <div className='pba-toc-list'>
      {headings.map((heading) => (
        <a
          className='pba-toc-item'
          data-active={active.includes(heading.id)}
          data-depth={heading.level}
          href={`#${heading.id}`}
          key={heading.id}
          onClick={onPick}
        >
          {heading.text}
        </a>
      ))}
    </div>
  );

  return (
    <aside className='pba-rail'>
      {headings.length > 0 ? (
        <div
          className='pba-toc-pop'
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false);
          }}
        >
          {/* `type` leads the attribute list on purpose: the practices lint
              reads the tag with a `[^>]*` scan, which the arrow in an
              onClick handler cuts short. */}
          <button
            type='button'
            aria-controls='pba-toc-panel'
            aria-expanded={open}
            className='pba-toc-bar'
            onClick={() => setOpen(!open)}
          >
            <ProgressRing value={progress} />
            <span className='pba-toc-bar-label'>
              {selected >= 0 ? headings[selected]?.text : 'Table of contents'}
            </span>
            <ChevronDown
              aria-hidden='true'
              className={open ? 'is-open' : undefined}
            />
          </button>
          {open ? (
            <div className='pba-toc-panel' id='pba-toc-panel'>
              {list(() => setOpen(false))}
              <div className='pba-share-actions'>
                <BlogArticleShare postTitle={postTitle} />
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        /* headingless posts still get share on small screens — and the
           sticky bar never renders as a bare hairline */
        <div className='pba-share-actions is-bar'>
          <BlogArticleShare postTitle={postTitle} />
        </div>
      )}

      <div className='pba-rail-sticky'>
        {headings.length > 0 ? (
          <nav className='pba-toc'>
            <h2>
              <AlignLeft aria-hidden='true' size={14} />
              Table of contents
            </h2>
            {list()}
          </nav>
        ) : null}
        <div className='pba-share'>
          <h2>Share</h2>
          <div className='pba-share-actions'>
            <BlogArticleShare postTitle={postTitle} />
          </div>
        </div>
      </div>
    </aside>
  );
}
