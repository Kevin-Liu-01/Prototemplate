'use client';

import { useRef } from 'react';

import { useLayoutWork, useMountEffect } from '../hooks';

type Props = {
  items: readonly { id: string; text: string }[];
  /** 1-based section being read; 0 before the first heading. */
  current: number;
  label: string;
};

/* Fuma Nama's table of contents, drawn as Fumadocs draws its own: a line
   down the headings, and a thumb that shows only where the line runs, so
   it slides along the line to the section being read. The line is an SVG
   path used as a mask, rebuilt whenever the headings move. */
export default function MaskToc({ items, current, label }: Props) {
  const root = useRef<HTMLElement>(null);

  const measure = () => {
    const el = root.current;
    if (!el) return;
    const links = [...el.querySelectorAll<HTMLElement>('.gtp-mtoc-item')];
    let height = 0;
    const d = links.map((a, i) => {
      const top = a.offsetTop + 4;
      const bottom = a.offsetTop + a.offsetHeight - 4;
      height = Math.max(height, bottom);
      return `${i ? 'L' : 'M'}1 ${top}L1 ${bottom}`;
    });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 ${height}"><path d="${d.join('')}" stroke="black" stroke-width="2" fill="none"/></svg>`;
    el.style.setProperty(
      '--mask',
      `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
    );
    el.style.setProperty('--mh', `${height}px`);
    const on = links[current - 1];
    el.style.setProperty('--t', `${on ? on.offsetTop : 0}px`);
    el.style.setProperty('--th', `${on ? on.offsetHeight : 0}px`);
  };

  useLayoutWork(measure, { dependencies: [current, items.length] });

  useMountEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  });

  return (
    <nav ref={root} className='gtp-mtoc' aria-label={label}>
      <span className='gtp-mtoc-line' aria-hidden='true' />
      <span className='gtp-mtoc-track' aria-hidden='true'>
        <span className='gtp-mtoc-thumb' />
      </span>
      <ol>
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              className='gtp-mtoc-item'
              href={`#${item.id}`}
              data-on={current === i + 1}
              aria-current={current === i + 1 ? 'location' : undefined}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
