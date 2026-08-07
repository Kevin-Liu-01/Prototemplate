'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';
import { SEARCH_INDEX, type SearchEntry } from '@/lib/search-index';

/**
 * The ⌘K palette — one flat index over pages, docs, directions, the
 * library anchors, and the brand book's sections. The trigger chip sits in
 * the nav to the right of the theme switcher; ⌘K / Ctrl-K toggles, Escape
 * closes, arrows walk the list, Enter goes. The panel is the pt grammar:
 * one hairline box on the page's own paper, the active row the only ink.
 */
const EMPTY_LIMIT = 9;
const RESULT_LIMIT = 12;

function matches(entry: SearchEntry, q: string): boolean {
  const hay = `${entry.title} ${entry.kind} ${entry.keywords ?? ''}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => hay.includes(term));
}

export default function CommandSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const openRef = useRef(open);
  openRef.current = open;

  useMountEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQ('');
        setSel(0);
        setOpen(!openRef.current);
      } else if (e.key === 'Escape' && openRef.current) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const items = q.trim()
    ? SEARCH_INDEX.filter((entry) => matches(entry, q)).slice(0, RESULT_LIMIT)
    : SEARCH_INDEX.slice(0, EMPTY_LIMIT);

  const go = (entry: SearchEntry) => {
    setOpen(false);
    router.push(entry.href);
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((v) => Math.min(v + 1, Math.max(items.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((v) => Math.max(v - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const it = items[Math.min(sel, items.length - 1)];
      if (it) go(it);
    }
  };

  return (
    <>
      <button
        aria-haspopup='dialog'
        className='pt-nav-search'
        type='button'
        onClick={() => {
          setQ('');
          setSel(0);
          setOpen(true);
        }}
      >
        Search
        <kbd aria-hidden>⌘K</kbd>
      </button>
      {open ? (
        <div
          className='pt-kbar'
          role='presentation'
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div aria-label='Search the site' aria-modal='true' className='pt-kbar-panel' role='dialog'>
            <input
              aria-label='Search pages, directions, and libraries'
              autoFocus
              className='pt-kbar-input'
              placeholder='Search pages, directions, libraries…'
              type='text'
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setSel(0);
              }}
              onKeyDown={onInputKey}
            />
            <div aria-label='Results' className='pt-kbar-list' role='listbox'>
              {items.map((entry, i) => (
                <button
                  aria-selected={i === sel}
                  className='pt-kbar-row'
                  data-on={i === sel}
                  key={`${entry.href}-${entry.title}`}
                  role='option'
                  type='button'
                  onClick={() => go(entry)}
                  onMouseEnter={() => setSel(i)}
                >
                  <span>{entry.title}</span>
                  <em>{entry.kind}</em>
                </button>
              ))}
              {items.length === 0 ? <p className='pt-kbar-empty'>Nothing matches.</p> : null}
            </div>
            <p aria-hidden className='pt-kbar-hint'>
              <kbd>↑↓</kbd> navigate · <kbd>↵</kbd> open · <kbd>esc</kbd> close
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
