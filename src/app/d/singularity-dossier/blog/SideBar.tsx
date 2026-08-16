'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { useMountEffect } from '@/lib/use-mount-effect';

import CopyLinkButton from './CopyLinkButton';
import SocialIcon from './SocialIcon';
import {
  TocRail,
  TOC_ITEM_CLASS,
  tocItemIndent,
  useActiveAnchor,
  type Heading,
  type TocItem,
} from './TableOfContents';

type SideBarProps = {
  headings: Heading[];
  postTitle: string;
};

/** The docs' reading-progress ring: a track at quarter ink, the arc
    filled to the current section's share of the list. */
function ProgressCircle({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const size = 24;
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value, 0), 1) * circumference;
  const circleProps = {
    cx: size / 2,
    cy: size / 2,
    r: radius,
    fill: 'none',
    strokeWidth,
  };

  return (
    <svg
      role='progressbar'
      viewBox={`0 0 ${size} ${size}`}
      aria-valuenow={Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={className}
    >
      <circle {...circleProps} className='stroke-current/25' />
      <circle
        {...circleProps}
        stroke='currentColor'
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap='round'
        className='transition-all'
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

/**
 * The small screens' contents: the docs' collapsed popover bar — the
 * progress ring, the current section's title, a chevron — expanding to
 * the same clerk list, with the share row at its foot.
 */
function TocPopover({
  items,
  active,
  share,
}: {
  items: TocItem[];
  active: string | null;
  share: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const selected = items.findIndex((item) => item.url === `#${active ?? ''}`);

  return (
    <div
      className='min-[981px]:hidden'
      onKeyDown={(event) => {
        if (event.key === 'Escape') setOpen(false);
      }}
    >
      <button
        type='button'
        aria-expanded={open}
        aria-controls='blog-toc-popover-panel'
        onClick={() => setOpen(!open)}
        className='flex h-12 w-full items-center gap-2.5 px-(--tc-gut) text-[13px] text-(--tc-ink-2) [&_svg]:size-4'
      >
        <ProgressCircle
          value={(selected + 1) / Math.max(1, items.length)}
          className={`shrink-0 ${open ? 'text-(--tc-accent)' : ''}`}
        />
        <span className='flex-1 truncate text-start'>
          {selected >= 0 ? items[selected]?.title : 'Table of contents'}
        </span>
        <ChevronDown
          aria-hidden='true'
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          id='blog-toc-popover-panel'
          className='border-t border-(--tc-hair) px-(--tc-gut) py-3.5'
        >
          <div className='flex flex-col border-l border-(--tc-hair)'>
            {items.map((item) => (
              <a
                key={item.url}
                href={item.url}
                onClick={() => setOpen(false)}
                data-active={
                  active !== null && item.url === `#${active}`
                    ? 'true'
                    : undefined
                }
                className={`${TOC_ITEM_CLASS} ${tocItemIndent(item.depth)}`}
              >
                {item.title}
              </a>
            ))}
          </div>
          <div className='blog-share-actions flex items-center gap-1.5 pt-3.5'>
            {share}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SideBar({ headings, postTitle }: SideBarProps) {
  const [mounted, setMounted] = useState(false);
  useMountEffect(() => {
    setMounted(true);
  });

  const shareUrl = mounted ? window.location.href : '';
  const encodedShareUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(postTitle);

  const items: TocItem[] = headings.map((heading) => ({
    title: heading.text,
    url: `#${heading.id}`,
    depth: heading.level,
  }));
  const active = useActiveAnchor(headings.map((heading) => heading.id));

  const share = (
    <>
      <SocialIcon
        kind='linkedin'
        label='Share on LinkedIn'
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`}
      />
      <SocialIcon
        kind='x'
        label='Share on X'
        href={`https://x.com/intent/tweet?url=${encodedShareUrl}&text=${encodedTitle}`}
      />
      <CopyLinkButton url={shareUrl} />
    </>
  );

  return (
    <aside className='blog-sidebar'>
      {items.length > 0 ? (
        <TocPopover items={items} active={active} share={share} />
      ) : (
        /* headingless posts still get share on small screens — and the
           sticky bar never renders as a bare hairline */
        <div className='blog-share-actions is-bar flex h-12 items-center gap-1.5 px-(--tc-gut) min-[981px]:hidden'>
          {share}
        </div>
      )}
      <div className='blog-sidebar-sticky max-[980px]:hidden'>
        <TocRail items={items} active={active} />
        <div className='blog-share'>
          <h2>Share</h2>
          <div className='blog-share-actions'>{share}</div>
        </div>
      </div>
    </aside>
  );
}
