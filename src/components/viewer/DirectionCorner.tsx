'use client';

import { useGSAP } from '@gsap/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useRef, useState } from 'react';

import Link from 'next/link';

import { HelpCard } from '@/components/viewer/HelpCard';
import { IndexPanel } from '@/components/viewer/IndexPanel';
import { PreviewLayer } from '@/components/viewer/PreviewLayer';
import { PtMark } from '@/components/viewer/PtMark';
import { openSearch, Search } from '@/components/viewer/Search';
import { ShellContext } from '@/components/viewer/shell-context';
import type { ShellState } from '@/components/viewer/shell-context';
import { Sidebar } from '@/components/viewer/Sidebar';
import { toggleTheme } from '@/components/viewer/ThemeButton';
import { ToolButton } from '@/components/viewer/ToolButton';
import type { ShellKeyRow } from '@/components/viewer/useShellKeys';
import { cn } from '@/lib/cn';
import { SITE_SURFACES } from '@/lib/surfaces';
import type { SurfaceGroup } from '@/lib/surfaces';
import { useMountEffect } from '@/lib/use-mount-effect';

import './DirectionCorner.css';

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
 * PreviewLayer (directive 8.6) mounts here for all three. Keys: Cmd K
 * or Ctrl K for the search, [ for the list, R for the index, D for the
 * theme, ? for the shortcuts, Escape back one layer. Hidden under
 * ?chrome=0, which the gallery's
 * exhibit, the compare panes and every screenshot pass depend on. No
 * toolbar and no sheet: the page stays a full document with its own nav.
 * Replaces src/components/shared/DirectionDock.tsx with the same prop
 * shape, { slug }. The palette opens inside the corner's own stacking
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
 */
export type DirectionCornerProps = { slug: string };

/** The site map groups the list shows, in the shell's one order (Shipped after Pages, directive 8.10); the count names their rows. */
const LIST_GROUPS: readonly SurfaceGroup[] = ['Pages', 'Knowledge', 'Shipped', 'Documents', 'Sites', 'Explorations', 'Archive'];

/** `44 pages`: the count at the end of the filter row, and the word its placeholder takes (`Filter pages`). */
const LIST_COUNT = `${SITE_SURFACES.filter((row) => LIST_GROUPS.includes(row.group)).length} pages`;

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

function Corner({ slug }: DirectionCornerProps) {
  const params = useSearchParams();
  const [list, setList] = useState(false);
  const [panel, setPanel] = useState(false);
  const [help, setHelp] = useState(false);
  /* true from a close of the list until its exit has run, so it is still there to slide out */
  const [leaving, setLeaving] = useState(false);
  const wasList = useRef(false);
  const leaveTimer = useRef(0);

  /* the mount-time listener reads the latest layers through this ref */
  const layers = useRef({ list, panel, help });
  layers.current = { list, panel, help };

  /* the one dependency effect: the list closed, so hold it for its exit */
  useGSAP(
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

  useMountEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.isComposing) return;
      const low = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if ((e.metaKey || e.ctrlKey) && !e.altKey && low === 'k') {
        e.preventDefault();
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
          setList((open) => !open);
          return;
        case 'r':
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
      <div className='pt-corner' role='group' aria-label='Prototemplate'>
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
        {listShown ? (
          <ShellContext value={listState}>
            <Sidebar
              title='Prototemplate'
              mark='pt'
              count={LIST_COUNT}
              sections={[]}
              thumb='row'
              siteMap
            />
          </ShellContext>
        ) : null}
        <ShellContext value={panelState}>
          <IndexPanel set='site' />
        </ShellContext>
      </div>
      <ShellContext value={helpState}>
        <HelpCard
          rows={ROWS}
          note='The list and the index reach every page on the site; the page itself scrolls as a document.'
        />
      </ShellContext>
      {/* the one preview layer (directive 8.6) for the list's, the index's and the search's rows */}
      <PreviewLayer />
    </>
  );
}

/** useSearchParams reads the address on the client, so the corner mounts behind a Suspense boundary, as the dock did. */
export function DirectionCorner(props: DirectionCornerProps) {
  return (
    <Suspense fallback={null}>
      <Corner {...props} />
    </Suspense>
  );
}

export default DirectionCorner;
