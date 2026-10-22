'use client';

import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

import { DOCS_PAGES } from '@/components/docs/pages';
import { SidebarFilter } from '@/components/viewer/SidebarFilter';

import { Choice } from '../controls';
import Plate from '../Plate';

import './interactables.css';

type Size = 'panel' | 'sidebar';

/* the docs pages outside the handbook, in the sidebar's order */
const PAGES = DOCS_PAGES;

function matches(page: (typeof PAGES)[number], q: string): boolean {
  return page.title.toLowerCase().includes(q) || page.href.toLowerCase().includes(q);
}

/** `1 page`, `14 pages`: the count at the row's right end. */
function countOf(n: number): string {
  return `${n} ${n === 1 ? 'page' : 'pages'}`;
}

/**
 * SidebarFilter, live, over the docs pages: the controlled field with the
 * search glyph, the clear button while it holds text, and the count at the
 * row's right end. The host owns the query and the keys, as the sidebar
 * does: Escape clears and then lets go, Down arrow moves into the list,
 * Up arrow from the first row returns to the field, and Enter takes the
 * first match. In the sidebar Enter opens that page; here it marks the row
 * and focuses it, and Enter on a focused row follows its link. Size sets
 * the field at the index panel's 34px or the sidebar's 30px.
 */
export default function FilterDemo() {
  const [query, setQuery] = useState('');
  const [size, setSize] = useState<Size>('panel');
  const [picked, setPicked] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const q = query.trim().toLowerCase();
  const rows = q ? PAGES.filter((page) => matches(page, q)) : PAGES;
  const pickedPage = PAGES.find((page) => page.slug === picked);

  const rowEls = () => Array.from(list.current?.querySelectorAll<HTMLAnchorElement>('.ixa-filter-row') ?? []);

  const onFilterKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (query) setQuery('');
      else event.currentTarget.blur();
    } else if (event.key === 'ArrowDown') {
      const first = rowEls()[0];
      if (first) {
        event.preventDefault();
        first.focus();
      }
    } else if (event.key === 'Enter' && q) {
      const first = rows[0];
      if (!first) return;
      event.preventDefault();
      setPicked(first.slug);
      rowEls()[0]?.focus();
    }
  };

  const onListKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const els = rowEls();
    const at = els.indexOf(event.target as HTMLAnchorElement);
    if (at < 0) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (event.key === 'ArrowUp' && at === 0) {
        input.current?.focus({ preventScroll: true });
        return;
      }
      els[at + (event.key === 'ArrowDown' ? 1 : -1)]?.focus();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      (event.key === 'Home' ? els[0] : els[els.length - 1])?.focus();
    }
  };

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Size'
            options={[
              { value: 'panel', label: 'Index panel' },
              { value: 'sidebar', label: 'Sidebar' },
            ]}
            value={size}
            onChange={setSize}
          />
          <p className='dmo-bar-status' role='status'>
            {pickedPage ? (
              <>
                Marked <span className='dmo-num'>{pickedPage.title}</span>
              </>
            ) : (
              'Type, then press Enter to take the first match.'
            )}
          </p>
        </>
      }
      fit
      label='The list filter over the docs pages'
      stageClassName={size === 'sidebar' ? 'ixa-filter is-sidebar' : 'ixa-filter'}
      tag='<SidebarFilter value onChange placeholder count />'
    >
      <SidebarFilter
        count={countOf(rows.length)}
        inputRef={input}
        placeholder='Filter pages'
        value={query}
        onChange={(value) => {
          setQuery(value);
          setPicked('');
        }}
        onKeyDown={onFilterKey}
      />
      <div aria-label='Docs pages' className='ixa-filter-list pt-scroll' ref={list} role='list' onKeyDown={onListKey}>
        {rows.map((page) => (
          <div key={page.slug} role='listitem'>
            <a
              aria-current={page.slug === picked ? 'true' : undefined}
              className={page.slug === picked ? 'ixa-filter-row is-on' : 'ixa-filter-row'}
              href={page.href}
            >
              <span className='ixa-filter-t'>{page.title}</span>
              <span className='ixa-filter-path'>{page.href}</span>
            </a>
          </div>
        ))}
        {rows.length === 0 ? <p className='ixa-filter-empty'>Nothing matches the filter.</p> : null}
      </div>
    </Plate>
  );
}
