'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useRef, useState } from 'react';

import { HelpCard } from '@/components/viewer/HelpCard';
import { IndexPanel } from '@/components/viewer/IndexPanel';
import { ShellContext } from '@/components/viewer/shell-context';
import type { ShellState } from '@/components/viewer/shell-context';
import { Sidebar } from '@/components/viewer/Sidebar';
import { toggleTheme } from '@/components/viewer/ThemeButton';
import { ToolButton } from '@/components/viewer/ToolButton';
import type { ShellKeyRow } from '@/components/viewer/useShellKeys';
import { cn } from '@/lib/cn';
import { useMountEffect } from '@/lib/use-mount-effect';

import './DirectionCorner.css';

/**
 * The direction pages' one piece of floating chrome, in the shell's grammar.
 * Two labeled buttons stacked in the top left corner: Directions opens the
 * shell Sidebar as a 300px overlay over a scrim, listing the whole site map
 * (Pages, Documents, Sites, Explorations, Archive) with this page's row
 * marked, so every route is one click away from every prototype; Index
 * opens the IndexPanel over the page. Keys: [ for the list, R and Cmd K or
 * Ctrl K for the index, D for the theme, ? for the shortcuts, Escape back
 * one layer. Hidden under ?chrome=0, which the presenter's iframes, the
 * gallery's exhibit and every screenshot pass depend on. No toolbar and no
 * sheet: the page stays a full document with its own nav. Replaces
 * src/components/shared/DirectionDock.tsx with the same prop shape, { slug }.
 *
 * The Sidebar, the IndexPanel and the HelpCard read shell state from
 * context, so the corner publishes small ShellState values of its own: one
 * for the list (narrow, so the sidebar draws itself as the overlay with its
 * close button and closes after a pick), one for the panel (wide, so the
 * filter takes focus), one for the help card.
 */
export type DirectionCornerProps = { slug: string };

/** The site map groups open when the list opens on a direction page. */
const OPEN_GROUPS: readonly string[] = ['Pages', 'Sites', 'Explorations'];

/** The corner's own key table, for the help card. */
const ROWS: readonly ShellKeyRow[] = [
  { group: 'Move', keys: 'Space, arrows', action: 'Scroll the page' },
  { group: 'Panels', keys: '[', action: 'Show or hide the list of every page' },
  { group: 'Panels', keys: 'R, Cmd K or Ctrl K', action: 'Index panel, with the filter focused' },
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
    density: 'outline',
    sidebarOpen: false,
    panelOpen: false,
    helpOpen: false,
    present: false,
    narrow: false,
    active,
    index: -1,
    total: 0,
    stageSize: { width: 0, height: 0 },
    panelWidth: 0,
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

function Corner({ slug }: DirectionCornerProps) {
  const params = useSearchParams();
  const [list, setList] = useState(false);
  const [panel, setPanel] = useState(false);
  const [help, setHelp] = useState(false);

  /* the mount-time listener reads the latest layers through this ref */
  const layers = useRef({ list, panel, help });
  layers.current = { list, panel, help };

  useMountEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.isComposing) return;
      const low = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if ((e.metaKey || e.ctrlKey) && !e.altKey && low === 'k') {
        e.preventDefault();
        setPanel(true);
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditable(e.target)) {
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
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  if (params.get('chrome') === '0') return null;

  const listState = cornerState(slug, { narrow: true, sidebarOpen: list, setSidebar: setList });
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
        <ToolButton
          icon='sidebar'
          label='Directions'
          title='Every page on the site ([)'
          pressed={list}
          onClick={() => setList(!list)}
        />
        <ToolButton icon='index' label='Index' title='Index (R)' pressed={panel} onClick={() => setPanel(!panel)} />
      </div>
      <div className={cn('pt-corner-layer', open && 'is-on')}>
        {open ? (
          <button type='button' className='pt-corner-scrim' aria-label='Close (Esc)' onClick={closeTop} />
        ) : null}
        {list ? (
          <ShellContext value={listState}>
            <Sidebar title='Prototemplate' mark='pt' count='the site' sections={[]} thumb='row' siteMap openGroups={OPEN_GROUPS} />
          </ShellContext>
        ) : null}
        <ShellContext value={panelState}>
          <IndexPanel set='site' />
        </ShellContext>
      </div>
      <ShellContext value={helpState}>
        <HelpCard rows={ROWS} note='The list and the index reach every page on the site; the page itself scrolls as a document.' />
      </ShellContext>
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
