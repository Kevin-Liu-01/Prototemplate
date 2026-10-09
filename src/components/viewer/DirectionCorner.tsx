'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Suspense, useRef, useState } from 'react';

import Link from 'next/link';

import { HelpCard } from '@/components/viewer/HelpCard';
import { PtMark } from '@/components/viewer/PtMark';
import { openSearch, preloadSearch, Search } from '@/components/viewer/Search';
import { ShellContext } from '@/components/viewer/shell-context';
import type { ShellState } from '@/components/viewer/shell-context';
import { toggleTheme } from '@/components/viewer/ThemeButton';
import { ToolButton } from '@/components/viewer/ToolButton';
import type { ShellKeyRow } from '@/components/viewer/useShellKeys';
import { cn } from '@/lib/cn';
import { useLayoutWork } from '@/lib/use-layout-work';
import { useMountEffect } from '@/lib/use-mount-effect';

import './DirectionCorner.css';

/* the list, the index panel and the preview layer: their own chunk (CornerLayers.tsx) */
const CornerLayers = dynamic(() => import('@/components/viewer/CornerLayers'), { ssr: false });

/**
 * The direction pages' one piece of floating chrome, in the shell's grammar.
 * A 32px tile with the Prototemplate mark leads the stack in the top left
 * corner (the link back to the gallery, as the sidebar head's mark is), so
 * the stack reads as Prototemplate chrome and not as part of the
 * prototype's own nav band; under it three labeled buttons: Search opens
 * the search bar's palette (directive 8.3, the same Search the toolbar
 * mounts, so Cmd K reaches every page from a prototype too); List opens
 * the shell Sidebar as the 300px overlay over a scrim, in outline density,
 * listing the whole site map (Pages, Shipped, Documents, Sites,
 * Explorations, Archive) with this page's row marked, with its filter and
 * its collapsible groups, so every route is one click away from every
 * prototype; Index opens the IndexPanel over the page; the one
 * PreviewLayer (directive 8.6) mounts with them for all three. Keys: Cmd K
 * or Ctrl K for the search, [ for the list, R for the index, D for the
 * theme, ? for the shortcuts, Escape back one layer. Hidden under
 * ?chrome=0, which the gallery's
 * exhibit, the compare panes and every screenshot pass depend on. No
 * toolbar and no sheet: the page stays a full document with its own nav.
 * Replaces src/components/shared/DirectionDock.tsx with the same prop
 * shape, { slug }, plus `placement`: 'right' puts the corner at the top
 * right, as a row, under 768px (DirectionCorner.css), for a page whose
 * column starts at the left edge under the corner, as the plate pages do,
 * and `suspense`: false mounts the corner without its Suspense boundary on
 * a route that renders per request, so it hydrates with the page. The
 * palette opens inside the corner's own stacking
 * context (z-index 100), under the layer that holds the list, the index and
 * their scrim (101), so opening it from the button or from Cmd K closes the
 * list and the index first; the palette is then the one thing over the page.
 *
 * The Sidebar, the IndexPanel and the HelpCard read shell state from
 * context, so the corner publishes small ShellState values of its own: one
 * for the list (narrow, so the sidebar draws itself as the overlay with its
 * close button and closes after a pick), one for the panel (wide, so the
 * filter takes focus), one for the help card.
 *
 * Motion (directive 7.4): the scrim stays mounted and fades both ways over
 * the panel's slide duration; the list slides in through Sidebar.css and,
 * on close, stays mounted for the sidebar duration under .is-leaving so
 * DirectionCorner.css can slide it back out. Reduced motion commits at once.
 *
 * Loading: the list, the index panel and the preview layer (CornerLayers)
 * and the search index are chunks of their own, about 150K of script a
 * prototype would otherwise parse for a 32px corner. The layers' chunk is
 * fetched once the page is idle and mounts on the first hover or focus
 * inside the corner, on [, R or Cmd K, and when the palette opens; a panel
 * opened by its key before its chunk lands slides in from its
 * @starting-style (DirectionCorner.css).
 */
export type DirectionCornerProps = {
  slug: string;
  /**
   * Where the corner sits under 768px: the top left under the page's nav
   * band (the default), or the top right as one row of squares, for a page
   * whose column starts at the left edge under the corner.
   */
  placement?: 'left' | 'right';
  /**
   * Whether the corner mounts behind its Suspense boundary (the default).
   * The boundary exists for the address read (useSearchParams), which a
   * statically rendered route has to finish on the client; a route that
   * renders per request, because it awaits searchParams on the server,
   * reads the address on the server too, so it can pass false and the
   * corner hydrates in the page's pass instead of in a later one. The
   * plate pages do: a fixture there opens a modal dialog on mount, and the
   * dialog stamps aria-hidden on every other child of the body, which a
   * corner that had yet to hydrate then reported as a hydration mismatch.
   */
  suspense?: boolean;
};

/** How long the closing list stays for its exit; matches --pt-dur-sb in tokens.css. */
const LEAVE_MS = 220;

/** The corner's own key table, for the help card. */
const ROWS: readonly ShellKeyRow[] = [
  { group: 'Move', keys: 'Space, arrows', action: 'Scroll the page' },
  { group: 'Panels', keys: 'Cmd K or Ctrl K', action: 'Search every page, document, direction and slide' },
  { group: 'Panels', keys: '[', action: 'Show or hide the list' },
  { group: 'Panels', keys: 'R', action: 'Index panel, with the filter focused' },
  { group: 'Panels', keys: '?', action: 'Keyboard shortcuts' },
  { group: 'Panels', keys: 'Esc', action: 'Back one layer: the shortcuts, the index, the list' },
  { group: 'Theme', keys: 'D', action: 'Dark or light' },
];

const noop = () => {};

/** A ShellState for one child of the corner: the fields the child reads, the rest inert. */
function cornerState(active: string, overrides: Partial<ShellState>): ShellState {
  return {
    id: 'direction',
    modes: ['slide'],
    keys: 'flow',
    noun: 'direction',
    items: [],
    paged: [],
    mode: 'slide',
    transition: null,
    density: 'outline',
    sidebarOpen: false,
    sidebarShown: false,
    panelOpen: false,
    helpOpen: false,
    present: false,
    narrow: false,
    active,
    index: -1,
    dir: 'next',
    total: 0,
    setMode: noop,
    setDensity: noop,
    setSidebar: noop,
    setPanel: noop,
    setHelp: noop,
    setPresent: noop,
    select: noop,
    step: noop,
    say: noop,
    ...overrides,
  };
}

function isEditable(target: EventTarget | null): target is HTMLElement {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

/** The reader has asked for no motion: the list leaves at once. */
function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function Corner({ slug, placement = 'left' }: DirectionCornerProps) {
  const params = useSearchParams();
  const [list, setList] = useState(false);
  const [panel, setPanel] = useState(false);
  const [help, setHelp] = useState(false);
  /* true from a close of the list until its exit has run, so it is still there to slide out */
  const [leaving, setLeaving] = useState(false);
  /* true from the first reach for the corner: CornerLayers and the search index load then */
  const [awake, setAwake] = useState(false);
  const wake = () => {
    if (awake) return;
    setAwake(true);
    preloadSearch();
  };
  const wasList = useRef(false);
  const leaveTimer = useRef(0);

  /* the mount-time listener reads the latest layers through this ref */
  const layers = useRef({ list, panel, help });
  layers.current = { list, panel, help };

  /* the one dependency effect: the list closed, so hold it for its exit */
  useLayoutWork(
    () => {
      window.clearTimeout(leaveTimer.current);
      if (list) {
        wasList.current = true;
        setLeaving(false);
        return;
      }
      if (!wasList.current) return;
      wasList.current = false;
      if (reducedMotion()) return;
      setLeaving(true);
      leaveTimer.current = window.setTimeout(() => setLeaving(false), LEAVE_MS);
    },
    { dependencies: [list] }
  );

  /* fetch the layers' chunk once the page is idle, so the first [ opens at once */
  useMountEffect(() => {
    const warm = () => void import('@/components/viewer/CornerLayers');
    if (typeof window.requestIdleCallback !== 'function') {
      const id = window.setTimeout(warm, 2000);
      return () => window.clearTimeout(id);
    }
    const id = window.requestIdleCallback(warm, { timeout: 4000 });
    return () => window.cancelIdleCallback(id);
  });

  useMountEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.isComposing) return;
      const low = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if ((e.metaKey || e.ctrlKey) && !e.altKey && low === 'k') {
        e.preventDefault();
        setAwake(true);
        /* the palette renders inside the corner's stacking context, under
           the layer that holds the list and the index, so both close first */
        setList(false);
        setPanel(false);
        openSearch();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditable(e.target)) {
        /* the list filter and the index filter answer their own Escape (defaultPrevented) */
        if (e.key === 'Escape' && !e.defaultPrevented) {
          setPanel(false);
          e.target.blur();
        }
        return;
      }
      if (e.defaultPrevented) return;
      switch (low) {
        case '[':
          setAwake(true);
          setList((open) => !open);
          return;
        case 'r':
          setAwake(true);
          setPanel((open) => !open);
          return;
        case 'd':
          toggleTheme();
          return;
        case '?':
          setHelp((open) => !open);
          return;
        default:
          break;
      }
      if (e.key === 'Escape') {
        if (layers.current.help) setHelp(false);
        else if (layers.current.panel) setPanel(false);
        else if (layers.current.list) setList(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(leaveTimer.current);
    };
  });

  if (params.get('chrome') === '0') return null;

  /* the list is in the DOM while it is wanted, and for its exit after */
  const listShown = list || leaving;
  const listState = cornerState(slug, {
    narrow: true,
    sidebarOpen: list,
    sidebarShown: listShown,
    setSidebar: setList,
  });
  const panelState = cornerState(slug, { panelOpen: panel, setPanel });
  const helpState = cornerState(slug, { helpOpen: help, setHelp });
  const open = list || panel;
  const closeTop = () => {
    if (panel) setPanel(false);
    else setList(false);
  };

  return (
    <>
      <div
        className={cn('pt-corner', placement === 'right' && 'is-right')}
        role='group'
        aria-label='Prototemplate'
        onFocus={wake}
        onPointerEnter={wake}
      >
        <Link
          className='pt-ib pt-icon pt-corner-mark'
          href='/'
          title='Back to the gallery'
          aria-label='Back to the gallery'
        >
          <PtMark />
        </Link>
        <Search
          trigger='tool'
          className='pt-corner-search'
          onOpen={() => {
            setAwake(true);
            setList(false);
            setPanel(false);
          }}
        />
        <ToolButton
          icon='sidebar'
          label='List'
          title='Show or hide the list ([)'
          pressed={list}
          onClick={() => setList(!list)}
        />
        <ToolButton
          icon='index'
          label='Index'
          title='Show or hide the index (R)'
          pressed={panel}
          onClick={() => setPanel(!panel)}
        />
      </div>
      <div className={cn('pt-corner-layer', open && 'is-on', leaving && !list && 'is-leaving')}>
        {/* always mounted so it can fade both ways; hidden by DirectionCorner.css while off */}
        <button
          type='button'
          className={cn('pt-corner-scrim', open && 'is-on')}
          aria-label='Close (Esc)'
          tabIndex={-1}
          onClick={closeTop}
        />
        {awake ? <CornerLayers listShown={listShown} listState={listState} panelState={panelState} /> : null}
      </div>
      <ShellContext value={helpState}>
        <HelpCard
          rows={ROWS}
          note='The list and the index reach every page on the site; the page itself scrolls as a document.'
        />
      </ShellContext>
    </>
  );
}

/**
 * useSearchParams reads the address on the client on a static route, so the
 * corner mounts behind a Suspense boundary there, as the dock did; a route
 * that renders per request passes suspense={false} and mounts it directly.
 */
export function DirectionCorner({ suspense = true, ...props }: DirectionCornerProps) {
  if (!suspense) return <Corner {...props} />;
  return (
    <Suspense fallback={null}>
      <Corner {...props} />
    </Suspense>
  );
}

export default DirectionCorner;
