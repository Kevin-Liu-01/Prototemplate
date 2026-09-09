'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useRef, useState } from 'react';

import { IndexPanel } from '@/components/viewer/IndexPanel';
import { ShellContext } from '@/components/viewer/shell-context';
import type { ShellState } from '@/components/viewer/shell-context';
import { Sidebar } from '@/components/viewer/Sidebar';
import { ToolButton } from '@/components/viewer/ToolButton';
import { cn } from '@/lib/cn';
import { DIRECTIONS } from '@/lib/directions';
import type { Direction } from '@/lib/directions';
import { flattenShellItems } from '@/lib/shell-data';
import type { ShellItem, ShellSection } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import './DirectionCorner.css';

/**
 * The direction pages' one piece of floating chrome, in the shell's grammar.
 * Two 32px buttons stacked in the top left corner: Directions opens the
 * shell Sidebar as a 300px overlay listing the seventeen directions in the
 * gallery's three sections (selecting one navigates to /d/<slug>), and
 * Index opens the IndexPanel over the page, so every route is one click
 * away from every prototype. Keys: [ for the list, R and Cmd K or Ctrl K
 * for the index, Escape back one layer. Hidden under ?chrome=0, which the
 * presenter's iframes, the gallery's exhibit and every screenshot pass
 * depend on. No toolbar and no sheet: the page stays a full document with
 * its own nav. Replaces src/components/shared/DirectionDock.tsx with the
 * same prop shape, { slug }.
 *
 * The Sidebar and the IndexPanel read shell state from context, so the
 * corner publishes two small ShellState values of its own: one for the list
 * (narrow, so the sidebar draws itself as the overlay and closes after a
 * pick) and one for the panel (wide, so the filter takes focus).
 */
export type DirectionCornerProps = { slug: string };

function directionItem(d: Direction): ShellItem {
  return {
    id: d.slug,
    n: d.label ?? '',
    title: d.name,
    href: `/d/${d.slug}`,
    desc: d.concept,
    shot: { light: `/shots/light/${d.slug}.jpg`, dark: `/shots/dark/${d.slug}.jpg` },
  };
}

/** The gallery's three sections: the site concepts, the shipped site, the explorations in label order. */
const SECTIONS: readonly ShellSection[] = [
  { id: 'sites', label: 'Sites', items: DIRECTIONS.filter((d) => d.site && !d.reference).map(directionItem) },
  { id: 'shipped', label: 'Shipped', items: DIRECTIONS.filter((d) => d.reference).map(directionItem) },
  { id: 'explorations', label: 'Explorations', items: DIRECTIONS.filter((d) => !d.site).map(directionItem) },
];

const ITEMS = flattenShellItems(SECTIONS);

const noop = () => {};

/** A ShellState for one child of the corner: the fields the child reads, the rest inert. */
function cornerState(active: string, overrides: Partial<ShellState>): ShellState {
  return {
    id: 'direction',
    modes: ['slide'],
    keys: 'flow',
    noun: 'direction',
    items: ITEMS,
    mode: 'slide',
    sidebarOpen: false,
    panelOpen: false,
    helpOpen: false,
    present: false,
    narrow: false,
    active,
    index: ITEMS.findIndex((item) => item.id === active),
    total: ITEMS.length,
    stageSize: { width: 0, height: 0 },
    panelWidth: 0,
    setMode: noop,
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
  const router = useRouter();
  const [list, setList] = useState(false);
  const [panel, setPanel] = useState(false);

  /* the mount-time listener reads the latest layers through this ref */
  const layers = useRef({ list, panel });
  layers.current = { list, panel };

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
        if (e.key === 'Escape') {
          setPanel(false);
          e.target.blur();
        }
        return;
      }
      if (e.defaultPrevented) return;
      if (low === '[') {
        setList((open) => !open);
        return;
      }
      if (low === 'r') {
        setPanel((open) => !open);
        return;
      }
      if (e.key === 'Escape') {
        if (layers.current.panel) setPanel(false);
        else if (layers.current.list) setList(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  if (params.get('chrome') === '0') return null;

  const go = (id: string) => {
    setList(false);
    if (id !== slug) router.push(`/d/${id}`);
  };

  const listState = cornerState(slug, { narrow: true, sidebarOpen: list, setSidebar: setList, select: go });
  const panelState = cornerState(slug, { panelOpen: panel, setPanel });
  const open = list || panel;
  const closeTop = () => {
    if (panel) setPanel(false);
    else setList(false);
  };

  return (
    <>
      <div className='pt-corner' role='group' aria-label='Prototemplate'>
        <ToolButton icon='sidebar' title='Directions ([)' pressed={list} onClick={() => setList(!list)} />
        <ToolButton icon='index' title='Index (R)' pressed={panel} onClick={() => setPanel(!panel)} />
      </div>
      <div className={cn('pt-corner-layer', open && 'is-on')}>
        {open ? (
          <button type='button' className='pt-corner-scrim' aria-label='Close (Esc)' onClick={closeTop} />
        ) : null}
        {list ? (
          <ShellContext value={listState}>
            <Sidebar
              title='Prototemplate'
              mark='pt'
              count={`${ITEMS.length} directions`}
              sections={SECTIONS}
              thumb='shot'
            />
          </ShellContext>
        ) : null}
        <ShellContext value={panelState}>
          <IndexPanel set='site' />
        </ShellContext>
      </div>
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
