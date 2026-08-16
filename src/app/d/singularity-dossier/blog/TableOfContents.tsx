'use client';

import { useState } from 'react';
import { AlignLeft } from 'lucide-react';

import { useMountEffect } from '@/lib/use-mount-effect';

/** A heading anchor: ids are github-slugger over the full heading text
    across ALL heading depths in document order (the landing derives
    them from the MDX; this static mirror inlines them precomputed). */
export type Heading = {
  id: string;
  text: string;
  level: number;
};

export type TocItem = {
  title: string;
  url: string;
  depth: number;
};

/** The clerk rail's item classes — shared by the desktop rail and the
    mobile popover so both lists read identically. */
export const TOC_ITEM_CLASS =
  '-ml-px border-l border-transparent py-[5px] text-[12.5px] text-(--tc-ink-2) transition-colors hover:text-(--tc-ink) data-[active=true]:border-(--tc-accent) data-[active=true]:text-(--tc-accent)';

export function tocItemIndent(depth: number): string {
  return depth === 3 ? 'pl-6' : 'pl-3.5';
}

/**
 * Local stand-in for the landing's Fumadocs anchor engine: the active
 * anchor is the last heading whose top has crossed the reading line
 * under the sticky chrome. Null until the first heading is reached,
 * like the docs rail at the top of an article.
 */
export function useActiveAnchor(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useMountEffect(() => {
    const measure = () => {
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= 130) current = id;
        else break;
      }
      setActive(current);
    };
    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  });

  return active;
}

/**
 * The article's contents rail in the docs' clerk style: items carry
 * data-active, so the rail highlights exactly like the docs sidebar
 * does. The active anchor is tracked by SideBar (one engine feeds the
 * rail and the popover) and passed down.
 */
export function TocRail({
  items,
  active,
}: {
  items: TocItem[];
  active: string | null;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className='blog-toc'>
      <h2 className='flex items-center gap-2'>
        <AlignLeft size={14} aria-hidden='true' />
        Table of contents
      </h2>
      <div className='flex flex-col border-l border-(--tc-hair)'>
        {items.map((item) => (
          <a
            key={item.url}
            href={item.url}
            data-active={active !== null && item.url === `#${active}` ? 'true' : undefined}
            className={`${TOC_ITEM_CLASS} ${tocItemIndent(item.depth)}`}
          >
            {item.title}
          </a>
        ))}
      </div>
    </nav>
  );
}
