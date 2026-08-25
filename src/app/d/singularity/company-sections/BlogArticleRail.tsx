'use client';

import { AlignLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import type { ArticleHeading } from './post-bodies';

/**
 * The article's contents rail — the landing app's SideBar, rebuilt without
 * fumadocs. The original leaned on `fumadocs-core/toc` for the active
 * anchor; this repo has no fumadocs, so the same behaviour comes from an
 * IntersectionObserver watching the rendered headings cross the read line
 * (just under the navbar). The active entry is the last heading whose top
 * has passed that line — the docs' own rule, so a long section keeps its
 * own heading lit instead of going blank.
 *
 * The observer is the trigger, not the answer: an INSTANT jump (an anchor
 * click, a deep link with a hash, a restored scroll position) can move a
 * heading from below the line to above it without ever rendering a frame in
 * between, and no intersection callback fires. A passive, frame-throttled
 * scroll listener settles those, so the rail is never stale.
 */

/** The read line, in px from the viewport top — clears the sticky navbar. */
const READ_LINE = 96;

function ProgressRing({ value }: { value: number }) {
  const size = 24;
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value, 0), 1) * circumference;
  const shared = { cx: size / 2, cy: size / 2, r: radius, fill: 'none', strokeWidth };

  return (
    <svg
      role='progressbar'
      viewBox={`0 0 ${size} ${size}`}
      aria-valuenow={Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      className='cpa-ring'
    >
      <circle {...shared} className='cpa-ring-track' />
      <circle
        {...shared}
        className='cpa-ring-arc'
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
};

export default function BlogArticleRail({ headings }: Props) {
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

  if (headings.length === 0) return <aside className='cpa-rail' />;

  const selected = headings.findIndex((heading) => heading.id === activeId);
  const progress = (selected + 1) / headings.length;

  const list = (onPick?: () => void) => (
    <div className='cpa-toc-list'>
      {headings.map((heading) => (
        <a
          className='cpa-toc-item'
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
    <aside className='cpa-rail'>
      {/* small screens: the collapsed progress bar, opening to the list */}
      <div
        className='cpa-toc-pop'
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
        }}
      >
        {/* `type` leads the attribute list on purpose: the practices lint
            reads the tag with a `[^>]*` scan, which the arrow in an onClick
            handler cuts short. */}
        <button
          type='button'
          aria-controls='cpa-toc-panel'
          aria-expanded={open}
          className='cpa-toc-bar'
          onClick={() => setOpen(!open)}
        >
          <ProgressRing value={progress} />
          <span className='cpa-toc-bar-label'>
            {selected >= 0 ? headings[selected]?.text : 'Contents'}
          </span>
          <ChevronDown aria-hidden='true' className={open ? 'is-open' : undefined} />
        </button>
        {open ? (
          <div className='cpa-toc-panel' id='cpa-toc-panel'>
            {list(() => setOpen(false))}
          </div>
        ) : null}
      </div>

      <div className='cpa-rail-sticky'>
        <nav className='cpa-toc'>
          <h2>
            <AlignLeft size={14} aria-hidden='true' />
            Contents
            <ProgressRing value={progress} />
          </h2>
          {list()}
        </nav>
      </div>
    </aside>
  );
}
