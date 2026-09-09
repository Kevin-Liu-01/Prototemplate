'use client';

import { useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, RefObject } from 'react';

import { useRouter } from 'next/navigation';

import { Icon } from '@/components/viewer/icons';
import { Seg } from '@/components/viewer/Seg';
import type { SegOption } from '@/components/viewer/Seg';
import { usePtShell } from '@/components/viewer/shell-context';
import { ToolButton } from '@/components/viewer/ToolButton';
import { isExternalSurface, surfaceGroups, surfaceInitial, surfaceMatches } from '@/lib/surfaces';
import type { Surface, SurfaceSet } from '@/lib/surfaces';
import { useMountEffect } from '@/lib/use-mount-effect';

import './IndexPanel.css';

/**
 * The index panel: a 460px column that slides over the scrimmed stage from
 * the right (the sheet under it keeps its fit), listing one set from
 * src/lib/surfaces.ts in groups, each row with a 96x54 preview, a name, an
 * address and a line of description. A `This site | General Translation`
 * seg above the filter switches between the two sets, so every route
 * reaches every page on this site and every public place the brand is
 * live; the route names the set the panel opens on and the head counts
 * `N pages` or `N places`. The filter is a case-insensitive substring
 * match on the row text and its href; groups with no match hide and the
 * head count follows. Opened by the toolbar's Index button and, in
 * useShellKeys, by R and by Cmd K or Ctrl K, which also focus the filter, so
 * the palette habit survives; the panel itself focuses the filter on every
 * open. Escape closes and blurs. Enter on a focused row navigates: the
 * router for internal hrefs, a new tab for external ones; Enter in the
 * filter opens the first match.
 */
export type IndexPanelProps = {
  /** which registry the panel opens on: the site map, or every public surface */
  set: SurfaceSet;
  /** the aside, for the shell's ResizeObserver, which publishes the panel width */
  ref?: RefObject<HTMLElement | null>;
};

/* the two sets in a first visitor's words: what is on this site, and where General Translation is live */
const SET_OPTIONS: readonly SegOption<SurfaceSet>[] = [
  { value: 'site', label: 'This site', title: 'Every page on this site' },
  { value: 'public', label: 'General Translation', title: 'Every public place the brand is live' },
];

/* each note starts with what the rows do */
const NOTE: Record<SurfaceSet, string> = {
  site: 'Pages on this site; a row opens it here. A preview shows where one exists.',
  public: "General Translation's live pages; a row opens in a new tab. A preview shows where one exists.",
};

/** `14 pages`, `23 places`: the head count for a set. */
export function surfaceCount(set: SurfaceSet, n: number): string {
  const one = set === 'site' ? 'page' : 'place';
  return `${n} ${n === 1 ? one : `${one}s`}`;
}

/** A left click with no modifier: the one the router should take over. */
function isPlainClick(event: ReactMouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/** How many frames the filter keeps asking for focus while the panel settles. */
const FOCUS_TRIES = 12;

/**
 * Mounted only while the panel is open: focuses the filter as soon as the
 * browser lets it (the panel is visible from its first open frame, but a
 * style recalc can lag a frame, and focus() on a not yet visible input is
 * refused silently), retrying for a few frames, and lets go of the focus
 * when the panel closes.
 */
function FocusOnOpen({ target }: { target: RefObject<HTMLInputElement | null> }) {
  useMountEffect(() => {
    let frame = 0;
    let tries = 0;
    const attempt = () => {
      frame = 0;
      const input = target.current;
      if (!input || !input.isConnected) return;
      input.focus({ preventScroll: true });
      tries += 1;
      if (document.activeElement !== input && tries < FOCUS_TRIES) frame = requestAnimationFrame(attempt);
    };
    frame = requestAnimationFrame(attempt);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      const input = target.current;
      if (input && document.activeElement === input) input.blur();
    };
  });
  return null;
}

type ShotProps = { row: Surface; broken: boolean; onBroken: () => void };

/**
 * The 96x54 preview. Light and dark twins both render and the theme picks
 * one in CSS; a row without a capture, or one whose file is missing, shows
 * the blank plate with its initial.
 */
function Shot({ row, broken, onBroken }: ShotProps) {
  if (!row.shot || broken) {
    return (
      <span className='shot-s blank' aria-hidden='true'>
        {surfaceInitial(row)}
      </span>
    );
  }
  return (
    <span className='shot-s'>
      <img
        className={row.shotDark ? 'light' : undefined}
        src={row.shot}
        alt=''
        loading='lazy'
        decoding='async'
        onError={onBroken}
      />
      {row.shotDark ? (
        <img className='dark' src={row.shotDark} alt='' loading='lazy' decoding='async' onError={onBroken} />
      ) : null}
    </span>
  );
}

export function IndexPanel({ set: initialSet, ref }: IndexPanelProps) {
  const shell = usePtShell();
  const router = useRouter();
  const ownRef = useRef<HTMLElement>(null);
  const panelRef = ref ?? ownRef;
  const inputRef = useRef<HTMLInputElement>(null);
  const [set, setSet] = useState<SurfaceSet>(initialSet);
  const [query, setQuery] = useState('');
  const [broken, setBroken] = useState<ReadonlySet<string>>(() => new Set());

  const open = shell.panelOpen;
  const groups = surfaceGroups(set)
    .map((entry) => ({
      group: entry.group,
      rows: entry.rows.filter((row) => surfaceMatches(row, query)),
    }))
    .filter((entry) => entry.rows.length > 0);
  const visible = groups.reduce((n, entry) => n + entry.rows.length, 0);
  const first = groups[0]?.rows[0];

  const close = () => {
    shell.setPanel(false);
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && panelRef.current?.contains(focused)) focused.blur();
  };

  const go = (row: Surface) => {
    if (isExternalSurface(row)) {
      window.open(row.href, '_blank', 'noopener,noreferrer');
      return;
    }
    shell.setPanel(false);
    router.push(row.href);
  };

  const onRowClick = (event: ReactMouseEvent<HTMLAnchorElement>, row: Surface) => {
    /* external rows open through the anchor's own target; modified clicks keep the browser's meaning */
    if (isExternalSurface(row) || !isPlainClick(event)) return;
    event.preventDefault();
    go(row);
  };

  const onPanelKey = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape' || shell.helpOpen) return;
    event.preventDefault();
    close();
  };

  const onInputKey = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || !query.trim() || !first) return;
    event.preventDefault();
    go(first);
  };

  const markBroken = (id: string) => {
    setBroken((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  };

  return (
    <aside
      ref={panelRef}
      className={open ? 'pt-panel is-on' : 'pt-panel'}
      aria-label='Index'
      aria-hidden={!open}
      inert={!open}
      onKeyDown={onPanelKey}
    >
      {open && !shell.narrow ? <FocusOnOpen target={inputRef} /> : null}
      <div className='pt-panel-head'>
        <b>Index</b>
        <span>{surfaceCount(set, visible)}</span>
        <ToolButton icon='close' title='Close the index (Esc)' onClick={close} />
      </div>
      <div className='pt-panel-tools'>
        <Seg options={SET_OPTIONS} value={set} onChange={setSet} label='Which index' className='pt-panel-sets' />
        {/* the same control as the sidebar's filter: a search glyph, then the field */}
        <label className='pt-panel-filter'>
          <Icon name='search' />
          <input
            ref={inputRef}
            type='search'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKey}
            placeholder='Filter by name or address'
            aria-label='Filter by name or address'
            autoComplete='off'
            spellCheck={false}
          />
        </label>
      </div>
      <div className='pt-panel-body pt-scroll'>
        <p className='pt-panel-note'>{NOTE[set]}</p>
        {groups.map((entry) => (
          <div className='pt-surf-group' key={entry.group}>
            <h4>{entry.group}</h4>
            {entry.rows.map((row) => {
              const external = isExternalSurface(row);
              return (
                <a
                  key={row.id}
                  className='pt-surf'
                  href={row.href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noreferrer' : undefined}
                  onClick={(event) => onRowClick(event, row)}
                >
                  <Shot row={row} broken={broken.has(row.id)} onBroken={() => markBroken(row.id)} />
                  <span className='pt-surf-t'>
                    <span className='pt-surf-name'>{row.name}</span>
                    <span className='pt-surf-url'>{row.host}</span>
                    <span className='pt-surf-desc'>{row.desc}</span>
                  </span>
                  <Icon name={external ? 'external' : 'next'} />
                </a>
              );
            })}
          </div>
        ))}
        {visible === 0 ? <p className='pt-panel-note'>Nothing matches the filter.</p> : null}
      </div>
    </aside>
  );
}
