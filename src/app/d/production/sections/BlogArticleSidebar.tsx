'use client';

import { AlignLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import BlogArticleShare from './BlogArticleShare';

import type { ArticleHeading } from '../../singularity/company-sections/post-bodies';

/**
 * PRODUCTION · the article's rail — a port of the shipped SideBar
 * (apps/landing/src/components/blog/SideBar.tsx and TableOfContents.tsx).
 *
 * Same two faces as the shipped one. Above 980px: a sticky column holding
 * the "Table of contents" list over a "Share" block. Below it: the docs'
 * collapsed popover bar — progress ring, current section, chevron —
 * opening to the same list with the share row at its foot. A post with no
 * headings keeps share on both faces (the shipped page renders the bare
 * share bar on small screens and the Share block alone in the rail), so
 * the sticky bar is never an empty hairline.
 *
 * The shipped rail reads its active anchor from `fumadocs-core/toc`. This
 * repo has no fumadocs, so the same rule — the last heading whose top has
 * crossed the read line under the navbar — comes from an
 * IntersectionObserver, settled by a passive frame-throttled scroll
 * listener. The observer alone is not enough: an INSTANT jump (an anchor
 * click, a deep link with a hash, a restored scroll position) can move a
 * heading from below the line to above it without rendering a frame in
 * between, and no intersection callback fires.
 */

/** The read line, in px from the viewport top — clears this sticky navbar. */
const READ_LINE = 99;

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
  headings: readonly ArticleHeading[];
  postTitle: string;
};

export default function BlogArticleSidebar({ headings, postTitle }: Props) {
  const [activeId, setActiveId] = useState('');
  const [open, setOpen] = useState(false);

  /* Mount-only by contract: the heading set is fixed for the life of an
     article, and the caller keys this component by slug so a different
     post remounts it rather than reusing a stale observer. */
  useMountEffect(() => {
    const nodes = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((node): node is HTMLElement => node !== null);
    if (nodes.length === 0) return;

    /* The last heading whose top has crossed the read line wins; above the
       first one, nothing is lit and the ring reads empty. */
    const settle = () => {
      let passed = '';
      for (const node of nodes) {
        if (node.getBoundingClientRect().top <= READ_LINE) passed = node.id;
      }
      setActiveId(passed);
    };

    const observer = new IntersectionObserver(settle, {
      rootMargin: `-${READ_LINE}px 0px 0px 0px`,
      threshold: 0,
    });
    for (const node of nodes) observer.observe(node);

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        settle();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    settle();
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  });

  const selected = headings.findIndex((heading) => heading.id === activeId);
  const progress = (selected + 1) / Math.max(1, headings.length);

  const list = (onPick?: () => void) => (
    <div className='pba-toc-list'>
      {headings.map((heading) => (
        <a
          className='pba-toc-item'
          data-active={heading.id === activeId}
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
