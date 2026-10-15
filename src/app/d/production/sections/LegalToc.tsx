'use client';

import { useRef, useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import type { LegalHeading } from './legal-docs';

/**
 * The legal document's Contents list: the docs' fumadocs TOC that live
 * mounts (packages/ui/src/components/ui/toc.tsx over fumadocs-core's
 * AnchorProvider), rebuilt without the library. Every heading fully in
 * view is active; with none in view, the heading nearest the top of the
 * viewport is. A 1px accent thumb spans the active items' text over the
 * list's own rule, measured as fumadocs' TocThumb measures it.
 */
export default function LegalToc({ headings }: { headings: readonly LegalHeading[] }) {
  const [active, setActive] = useState<readonly string[]>([]);
  const [thumb, setThumb] = useState<{ top: number; height: number } | null>(null);
  const list = useRef<HTMLDivElement>(null);

  useMountEffect(() => {
    const visible = new Set<string>();
    const elements = headings.flatMap((heading) => document.getElementById(heading.id) ?? []);

    const place = (ids: readonly string[]) => {
      const root = list.current;
      if (!root || ids.length === 0) {
        setThumb(null);
        return;
      }
      let upper = Number.MAX_VALUE;
      let lower = 0;
      for (const id of ids) {
        const item = root.querySelector<HTMLElement>(`a[href="#${CSS.escape(id)}"]`);
        if (!item) continue;
        const styles = getComputedStyle(item);
        upper = Math.min(upper, item.offsetTop + parseFloat(styles.paddingTop));
        lower = Math.max(lower, item.offsetTop + item.clientHeight - parseFloat(styles.paddingBottom));
      }
      setThumb(lower > upper ? { top: upper, height: lower - upper } : null);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        let next: string[];
        if (visible.size === 0) {
          const viewTop = entries[0]?.rootBounds?.top ?? 0;
          let nearest: HTMLElement | undefined;
          let min = -1;
          for (const element of elements) {
            const distance = Math.abs(viewTop - element.getBoundingClientRect().top);
            if (min === -1 || distance < min) {
              nearest = element;
              min = distance;
            }
          }
          next = nearest ? [nearest.id] : [];
        } else {
          next = headings.map((heading) => heading.id).filter((id) => visible.has(id));
        }
        setActive(next);
        place(next);
      },
      { rootMargin: '0px', threshold: 0.98 }
    );
    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  });

  return (
    <div className='legal-toc-scroll'>
      {thumb ? <div className='legal-toc-thumb' style={{ top: thumb.top, height: thumb.height }} /> : null}
      <div className='legal-toc-list' ref={list}>
        {headings.map((heading) => (
          <a data-active={active.includes(heading.id)} href={`#${heading.id}`} key={heading.id}>
            {heading.title}
          </a>
        ))}
      </div>
    </div>
  );
}
