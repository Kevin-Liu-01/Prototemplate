'use client';

import { useRouter } from 'next/navigation';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { useRef, useState } from 'react';

import { Icon } from '@/components/viewer/icons';
import { ToolButton } from '@/components/viewer/ToolButton';
import { searchCount, searchGroups } from '@/lib/search-index';
import type { SearchEntry, SearchGroupRows } from '@/lib/search-index';
import { useMountEffect } from '@/lib/use-mount-effect';

import './Search.css';

/**
 * The search bar (directive 8.3), the primary way to get anywhere: the
 * palette from 430e3c7 restyled in the shell's grammar. A field-shaped
 * button in the toolbar (the old nav's pill, kept at Kevin's request: the
 * search glyph, the word Search, a kbd chip reading ⌘K, or Ctrl K on
 * Windows and Linux, in titanium; an icon square at or below 900px) opens
 * a card over a scrim:
 * the 34px filter with the search glyph and a count, then the results as
 * ruled rows grouped under 12.5px titanium labels, each row a Heroicon, a
 * title and its address, the active row marked with the 2px ink bar. The
 * arrows move, Enter opens, Escape closes; hovering a row makes it the
 * active one; a plain click opens it and a modified click keeps the
 * browser's meaning. Every row writes its surface id to data-preview so the
 * preview layer (directive 8.6) can show its capture. The index is
 * src/lib/search-index.ts: pages, documents and their headings,
 * directions, archive versions, brand sections, library anchors and the 52
 * deck slides. Radius 0, tokens only, Inter, no shadow.
 *
 * Opening from a key: useShellKeys (Cmd K and Ctrl K on every shell route)
 * and DirectionCorner (the same keys on /d pages) call openSearch(), which
 * fires one document event the mounted Search answers, so the key owner
 * never holds the palette's state. The index panel keeps R.
 *
 * Navigation goes through the router for another path and through the
 * hash for an anchor on the current path, so a heading on the document
 * being read fires hashchange and the shell's scroll-spy follows it.
 *
 * The index is filtered only while the card is open: the trigger sits in
 * the toolbar, which re-renders on every shell state change, and a closed
 * palette has nothing to compute. An empty query shows a short map of the
 * site (search-index.ts, searchGroups) that fits the card without a scroll
 * region, so opening it mounts a few rows and the preview layer preloads
 * only what a reader can see.
 */
export type SearchProps = {
  /** `field`: the toolbar's field-shaped button; `tool`: a labeled ToolButton for the direction corner's stack */
  trigger?: 'field' | 'tool';
  /** extra classes on the card's overlay */
  className?: string;
  /** called as the palette opens, from the button or from the key: the direction corner closes its list and index with it */
  onOpen?: () => void;
};

const EMPTY_GROUPS: readonly SearchGroupRows[] = [];

/** The document event that opens the palette; fired by openSearch(). */
export const SEARCH_OPEN_EVENT = 'pt:search-open';

/** Open the mounted search palette from anywhere: the key owners call this. */
export function openSearch(): void {
  document.dispatchEvent(new CustomEvent(SEARCH_OPEN_EVENT));
}

const TITLE = 'Search (Cmd K or Ctrl K)';

/* what the pill's key chip reads: the command glyph on Apple platforms, the word elsewhere */
const MAC_CHIP = '⌘K';
const OTHER_CHIP = 'Ctrl K';

/** Apple platforms, where the shortcut is Cmd K; everything else (Windows, Linux) reads Ctrl K. */
function isApplePlatform(): boolean {
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
}

/** A left click with no modifier: the one the router should take over. */
function isPlainClick(event: ReactMouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}

/** The id of the row at `index` in the flat list, for aria-activedescendant and the scroll. */
function rowId(index: number): string {
  return `pt-search-opt-${index}`;
}

export function Search({ trigger = 'field', className, onOpen }: SearchProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [sel, setSel] = useState(0);
  /* the key chip's text: ⌘K as rendered on the server and on Apple platforms, Ctrl K everywhere else */
  const [chip, setChip] = useState(MAC_CHIP);
  const card = useRef<HTMLDivElement>(null);
  /* the mount-time listener reads the latest callback through this ref */
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  const groups = open ? searchGroups(query) : EMPTY_GROUPS;
  const rows: readonly SearchEntry[] = groups.flatMap((entry) => entry.rows);
  const at = Math.min(sel, Math.max(rows.length - 1, 0));

  const show = () => {
    setQuery('');
    setSel(0);
    setOpen(true);
    onOpenRef.current?.();
  };

  const close = () => {
    setOpen(false);
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && card.current?.contains(focused)) focused.blur();
  };

  useMountEffect(() => {
    const onOpen = () => show();
    document.addEventListener(SEARCH_OPEN_EVENT, onOpen);
    return () => document.removeEventListener(SEARCH_OPEN_EVENT, onOpen);
  });

  /* the chip is rendered as ⌘K on the server; a Windows or Linux reader sees Ctrl K after mount */
  useMountEffect(() => {
    if (!isApplePlatform()) setChip(OTHER_CHIP);
  });

  const go = (entry: SearchEntry) => {
    close();
    if (isExternal(entry.href)) {
      window.open(entry.href, '_blank', 'noopener,noreferrer');
      return;
    }
    const hashAt = entry.href.indexOf('#');
    const path = hashAt < 0 ? entry.href : entry.href.slice(0, hashAt);
    if (hashAt >= 0 && path === window.location.pathname) {
      /* the same document: a hash change, so the shell's listeners hear it */
      window.location.hash = entry.href.slice(hashAt);
      return;
    }
    router.push(entry.href);
  };

  /* keep the active row in view as the arrows move it */
  const move = (next: number) => {
    const clamped = Math.max(0, Math.min(rows.length - 1, next));
    setSel(clamped);
    requestAnimationFrame(() => {
      document.getElementById(rowId(clamped))?.scrollIntoView({ block: 'nearest' });
    });
  };

  const onInputKey = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      move(at + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      move(at - 1);
    } else if (event.key === 'Home' && !query) {
      event.preventDefault();
      move(0);
    } else if (event.key === 'End' && !query) {
      event.preventDefault();
      move(rows.length - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const entry = rows[at];
      if (entry) go(entry);
    }
  };

  /* Escape anywhere in the card closes it; prevented so the shell's ladder does not also step */
  const onCardKey = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    close();
  };

  const onRowClick = (event: ReactMouseEvent<HTMLAnchorElement>, entry: SearchEntry) => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    go(entry);
  };

  let index = -1;

  return (
    <>
      {trigger === 'tool' ? (
        <ToolButton icon='search' label='Search' title={TITLE} pressed={open} onClick={show} />
      ) : (
        <button
          type='button'
          className='pt-ib pt-search-btn'
          title={TITLE}
          aria-haspopup='dialog'
          aria-expanded={open}
          onClick={show}
        >
          <Icon name='search' />
          <span className='pt-lb'>Search</span>
          <kbd className='pt-search-kbd' aria-hidden='true'>
            {chip}
          </kbd>
        </button>
      )}
      {open ? (
        <div
          className={className ? `pt-search ${className}` : 'pt-search'}
          role='presentation'
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            ref={card}
            className='pt-search-card'
            role='dialog'
            aria-modal='true'
            aria-label='Search the site'
            onKeyDown={onCardKey}
          >
            <div className='pt-search-tools'>
              <label className='pt-search-field'>
                <Icon name='search' />
                <input
                  type='search'
                  value={query}
                  autoFocus
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSel(0);
                  }}
                  onKeyDown={onInputKey}
                  placeholder='Search pages, documents, directions and slides'
                  aria-label='Search pages, documents, directions and slides'
                  aria-controls='pt-search-list'
                  aria-activedescendant={rows.length > 0 ? rowId(at) : undefined}
                  autoComplete='off'
                  autoCorrect='off'
                  autoCapitalize='off'
                  spellCheck={false}
                  enterKeyHint='go'
                />
              </label>
              <span className='pt-search-count'>{searchCount(rows.length)}</span>
            </div>
            <div id='pt-search-list' className='pt-search-list pt-scroll' role='listbox' aria-label='Results'>
              {groups.map((entry) => (
                <div className='pt-search-group' key={entry.group}>
                  <h4>{entry.group}</h4>
                  {entry.rows.map((row) => {
                    index += 1;
                    const i = index;
                    const active = i === at;
                    const external = isExternal(row.href);
                    return (
                      <a
                        key={row.id}
                        id={rowId(i)}
                        className={active ? 'pt-search-row is-active' : 'pt-search-row'}
                        href={row.href}
                        role='option'
                        aria-selected={active}
                        tabIndex={-1}
                        data-preview={row.surface}
                        data-site={row.site}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noreferrer' : undefined}
                        onClick={(event) => onRowClick(event, row)}
                        onMouseMove={() => {
                          if (!active) setSel(i);
                        }}
                      >
                        <span className='pt-search-ic'>
                          <Icon name={row.icon} />
                        </span>
                        <span className='pt-search-t'>{row.title}</span>
                        <span className='pt-search-m'>{row.meta}</span>
                        {external ? <Icon name='external' /> : null}
                      </a>
                    );
                  })}
                </div>
              ))}
              {rows.length === 0 ? <p className='pt-search-empty'>Nothing matches</p> : null}
            </div>
            <p className='pt-search-foot' aria-hidden='true'>
              <span>Up and down arrows move</span>
              <span>Enter opens</span>
              <span>Escape closes</span>
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
