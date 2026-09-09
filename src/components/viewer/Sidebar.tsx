'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { KeyboardEvent, MouseEvent, ReactNode, RefObject } from 'react';
import { Fragment, useRef, useState } from 'react';

import { cn } from '@/lib/cn';
import type { ShellDensity, ShellItem, ShellMark, ShellSection, ShellThumb } from '@/lib/shell-data';
import { surfaceGroups } from '@/lib/surfaces';
import type { Surface, SurfaceGroup } from '@/lib/surfaces';
import { useMountEffect } from '@/lib/use-mount-effect';

import { GtMark } from './GtMark';
import { Icon } from './icons';
import { activateOnKey, ListRow, pressWithoutFocus } from './ListRow';
import { PtMark } from './PtMark';
import { Seg } from './Seg';
import type { SegOption } from './Seg';
import { usePtShell } from './shell-context';
import { ThumbShot } from './ThumbShot';
import { ToolButton } from './ToolButton';

import './Sidebar.css';

/**
 * Rows a route hangs under an item: the headings under the active document
 * on /docs, the h3 rows under a section on /brand. Return null for none.
 */
export type SubRenderer = (item: ShellItem, active: boolean) => ReactNode;

/** What ViewerShell reads from the filter for the Escape ladder: whether it holds text, and how to clear it. */
export type SidebarFilter = { active: boolean; clear: () => void };

/** The site map groups the sidebar shows, in the one order every route keeps (decision 7). */
const NAV_GROUPS: readonly SurfaceGroup[] = ['Pages', 'Documents', 'Sites', 'Explorations', 'Archive'];

/** The groups open by default on a site route: the route's own sections, and Pages. */
const OPEN_BY_DEFAULT: readonly string[] = ['Pages'];

/** How long a row is hovered before its preview opens. */
const PREVIEW_MS = 250;

const DENSITY_OPTIONS: readonly SegOption<ShellDensity>[] = [
  { value: 'outline', label: 'Outline', icon: 'list', title: 'Outline' },
  { value: 'thumbs', label: 'Thumbnails', icon: 'photo', title: 'Thumbnails' },
];

/**
 * One group in the list: a site map group from src/lib/surfaces.ts (rows
 * are links to other routes) or one of the route's own sections (items the
 * shell selects). A route section replaces the site map group of the same
 * name, so /docs lists its six documents under Documents and the gallery
 * its directions under Sites and Explorations.
 */
type Group =
  | { kind: 'nav'; key: string; label: string; rows: readonly Surface[]; open: boolean }
  | { kind: 'section'; key: string; label: string; section: ShellSection; open: boolean };

function buildGroups(
  sections: readonly ShellSection[],
  siteMap: boolean,
  openByDefault: readonly string[]
): readonly Group[] {
  const own = (section: ShellSection): Group => ({
    kind: 'section',
    key: section.id,
    label: section.label,
    section,
    open: true,
  });
  if (!siteMap) return sections.map(own);
  const used = new Set<string>();
  const out: Group[] = [];
  const navRows = new Map(surfaceGroups('site').map((entry) => [entry.group, entry.rows]));
  for (const group of NAV_GROUPS) {
    const match = sections.find((section) => section.id === group.toLowerCase());
    if (match) {
      used.add(match.id);
      out.push(own(match));
      continue;
    }
    const rows = navRows.get(group);
    if (rows && rows.length > 0) {
      out.push({ kind: 'nav', key: group, label: group, rows, open: openByDefault.includes(group) });
    }
  }
  for (const section of sections) {
    if (!used.has(section.id)) out.push(own(section));
  }
  return out;
}

function matches(text: string, query: string): boolean {
  return text.toLowerCase().includes(query);
}

function itemText(item: ShellItem): string {
  return `${item.n ?? ''} ${item.title} ${item.desc ?? ''}`;
}

function rowText(row: Surface): string {
  return `${row.name} ${row.host} ${row.desc}`;
}

/** True when the site map row names the route the reader is on. */
function isCurrentRoute(row: Surface, pathname: string): boolean {
  const href = row.href.split('#')[0] ?? row.href;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * A ref callback, not an effect: React calls it when the active row mounts
 * or when the ref prop switches on, so the row follows every selection and
 * reappears in view when a hidden list is shown again. The first landing
 * centers the row; later moves scroll the least distance.
 */
function makeFollow(landed: RefObject<boolean>) {
  return (el: HTMLElement | null) => {
    if (!el) return;
    const block: ScrollLogicalPosition = landed.current ? 'nearest' : 'center';
    landed.current = true;
    try {
      el.scrollIntoView({ block });
    } catch {
      el.scrollIntoView();
    }
  };
}

type ThumbItemProps = {
  item: ShellItem;
  active: boolean;
  onSelect: (id: string) => void;
  follow?: (el: HTMLElement | null) => void;
};

/** A route item as a captured 16:9 frame with its number and title. */
function ThumbItem({ item, active, onSelect, follow }: ThumbItemProps) {
  const select = () => onSelect(item.id);
  return (
    <div
      className={cn('pt-thumb', active && 'is-active')}
      role='button'
      tabIndex={0}
      data-id={item.id}
      aria-current={active || undefined}
      onMouseDown={pressWithoutFocus}
      onClick={select}
      onKeyDown={(event) => activateOnKey(event, select)}
      ref={active && follow ? follow : undefined}
    >
      <div className='n'>{item.n ?? ''}</div>
      <div className='pt-thumb-body'>
        <div className='pt-thumb-frame'>
          <ThumbShot item={item} />
        </div>
        <div className='pt-thumb-title'>{item.title}</div>
      </div>
    </div>
  );
}

type OutlineRowProps = ThumbItemProps & {
  onHover?: (item: ShellItem | null, el: HTMLElement | null) => void;
};

/** A route item as a 32px outline row: the number in a 26px column, the title, a 2px ink bar when active. */
function OutlineRow({ item, active, onSelect, follow, onHover }: OutlineRowProps) {
  const select = () => onSelect(item.id);
  return (
    <div
      className={cn('pt-orow', active && 'is-active')}
      role='button'
      tabIndex={0}
      data-id={item.id}
      aria-current={active || undefined}
      title={item.desc}
      onMouseDown={pressWithoutFocus}
      onClick={select}
      onKeyDown={(event) => activateOnKey(event, select)}
      onMouseEnter={onHover ? (event) => onHover(item, event.currentTarget) : undefined}
      onMouseLeave={onHover ? () => onHover(null, null) : undefined}
      ref={active && follow ? follow : undefined}
    >
      <span className='n'>{item.n ?? ''}</span>
      <span className='pt-orow-title'>{item.title}</span>
    </div>
  );
}

type NavRowProps = {
  row: Surface;
  current: boolean;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, row: Surface, current: boolean) => void;
  follow?: (el: HTMLElement | null) => void;
};

/** A site map row: a link to another route, marked when it names this one. */
function NavRow({ row, current, onNavigate, follow }: NavRowProps) {
  return (
    <Link
      className={cn('pt-orow is-nav', current && 'is-active')}
      href={row.href}
      aria-current={current ? 'page' : undefined}
      title={row.desc}
      onClick={(event) => onNavigate(event, row, current)}
      ref={current && follow ? follow : undefined}
    >
      <span className='n' aria-hidden='true' />
      <span className='pt-orow-title'>{row.name}</span>
    </Link>
  );
}

export type ThumbListProps = {
  sections: readonly ShellSection[];
  thumb: ShellThumb;
  density: ShellDensity;
  renderSub?: SubRenderer;
  /** Defaults to the shell's select. GridView passes one that opens the slide first. */
  onSelect?: (id: string) => void;
  /** Extra classes on .pt-thumbs. */
  className?: string;
};

/**
 * The route's own items as a plain list: a label per section and every item
 * as a captured frame (or a row when the route's thumb is 'row'). The grid
 * renders this over the stage; GridView.css re-lays it out. Every item
 * carries data-id so the shell can find it from outside.
 */
export function ThumbList({ sections, thumb, density, renderSub, onSelect, className }: ThumbListProps) {
  const shell = usePtShell();
  const pick = onSelect ?? shell.select;
  const frames = density === 'thumbs' && thumb !== 'row';
  return (
    <div className={cn('pt-thumbs', !frames && 'is-rows', className)}>
      {sections.map((section) => (
        <Fragment key={section.id}>
          <div className='pt-sec-label'>{section.label}</div>
          {section.items.map((item) => {
            const active = item.id === shell.active;
            const sub = renderSub ? renderSub(item, active) : null;
            return (
              <Fragment key={item.id}>
                {frames ? (
                  <ThumbItem item={item} active={active} onSelect={pick} />
                ) : (
                  <ListRow item={item} active={active} onSelect={pick} />
                )}
                {sub ? <div className='pt-sub'>{sub}</div> : null}
              </Fragment>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}

export type SidebarProps = {
  title: string;
  mark: ShellMark;
  /** `52 slides`, `17 directions`; already worded by the route. */
  count: string;
  sections: readonly ShellSection[];
  thumb: ShellThumb;
  renderSub?: SubRenderer;
  /** render the site map groups around the route's sections */
  siteMap?: boolean;
  /** the site map groups open by default; Pages unless the caller says otherwise */
  openGroups?: readonly string[];
  /** where ViewerShell reads the filter state for the Escape ladder */
  filter?: RefObject<SidebarFilter>;
  /** what the current route's own Pages row does when clicked */
  onCurrentPage?: () => void;
};

type Preview = { item: ShellItem; top: number; left: number };

/**
 * Column one of the shell (directive 7.3): a 52px head with the mark (a
 * link back to the gallery on every other route) and the never-truncated
 * title; a 40px filter row with the density toggle; then the list as a
 * scroll region. The list is an outline by default: collapsible groups of
 * 32px rows with the active row marked by a 2px ink bar, or the strip of
 * captured 16:9 frames in thumbnail density. Site map groups are links to
 * other routes and stay rows in both densities; the current route's row is
 * marked. Typing in the filter narrows every group and opens them; Enter
 * opens the first match; Escape clears. Arrow keys move between rows.
 * Hovering an outline row with a capture for 250ms opens a preview beside
 * the list (not on touch). At or below 900px an open list is an overlay
 * with a close button, and selecting an item closes it.
 */
export function Sidebar({
  title,
  mark,
  count,
  sections,
  thumb,
  renderSub,
  siteMap = false,
  openGroups = OPEN_BY_DEFAULT,
  filter,
  onCurrentPage,
}: SidebarProps) {
  const shell = usePtShell();
  const router = useRouter();
  const pathname = usePathname();
  const { id, density, present, narrow, sidebarOpen, active, select, setSidebar, setDensity } = shell;

  const [query, setQuery] = useState('');
  /* per group, open or closed, where the reader has changed the default; persisted per route */
  const [overrides, setOverrides] = useState<ReadonlyMap<string, boolean>>(() => new Map());
  const [preview, setPreview] = useState<Preview | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const landed = useRef(false);
  const hoverTimer = useRef(0);
  /* one stable ref callback: React calls it only when the active row mounts or changes */
  const [follow] = useState(() => makeFollow(landed));

  const groups = buildGroups(sections, siteMap, openGroups);
  const q = query.trim().toLowerCase();
  const filtering = q.length > 0;

  const hidden = present || !sidebarOpen;
  const overlay = narrow && !hidden;
  const storageKey = `gt-shell-closed:${id}`;

  if (filter) {
    filter.current = {
      active: filtering,
      clear: () => {
        setQuery('');
        inputRef.current?.blur();
      },
    };
  }

  useMountEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setOverrides(new Map(Object.entries(JSON.parse(saved) as Record<string, boolean>)));
    } catch {
      // private mode or a stale value: the defaults hold
    }
    return () => window.clearTimeout(hoverTimer.current);
  });

  const isOpen = (group: Group) => filtering || (overrides.get(group.key) ?? group.open);

  const toggle = (group: Group) => {
    const next = new Map(overrides);
    next.set(group.key, !(overrides.get(group.key) ?? group.open));
    setOverrides(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(next)));
    } catch {
      // private mode: the state holds for the session
    }
  };

  const pick = (itemId: string) => {
    select(itemId);
    if (narrow) setSidebar(false);
  };

  const onNavigate = (event: MouseEvent<HTMLAnchorElement>, row: Surface, current: boolean) => {
    if (current && onCurrentPage && (row.href.split('#')[0] ?? row.href) === pathname) {
      event.preventDefault();
      onCurrentPage();
    }
    if (narrow) setSidebar(false);
  };

  /* the first visible thing the filter matches: a route item or a site map row */
  const firstMatch = (): (() => void) | null => {
    for (const group of groups) {
      if (group.kind === 'section') {
        const item = group.section.items.find((entry) => matches(itemText(entry), q));
        if (item) return () => pick(item.id);
      } else {
        const row = group.rows.find((entry) => matches(rowText(entry), q));
        if (row) {
          return () => {
            if (narrow) setSidebar(false);
            router.push(row.href);
          };
        }
      }
    }
    return null;
  };

  const onFilterKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (query) setQuery('');
      else event.currentTarget.blur();
      return;
    }
    if (event.key === 'Enter' && filtering) {
      const go = firstMatch();
      if (go) {
        event.preventDefault();
        go();
      }
    }
  };

  /* arrow keys move focus between the rows of the list */
  const onListKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const list = listRef.current;
    const target = event.target;
    if (!list || !(target instanceof HTMLElement)) return;
    const rows = Array.from(list.querySelectorAll<HTMLElement>('.pt-orow, .pt-thumb, .pt-row, .pt-sec-head'));
    const at = rows.indexOf(target);
    if (at < 0) return;
    event.preventDefault();
    const next = rows[at + (event.key === 'ArrowDown' ? 1 : -1)];
    next?.focus();
  };

  const onHover = (item: ShellItem | null, el: HTMLElement | null) => {
    window.clearTimeout(hoverTimer.current);
    if (!item || !el || !item.shot || !window.matchMedia('(hover: hover)').matches) {
      setPreview(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    hoverTimer.current = window.setTimeout(() => {
      const top = Math.max(8, Math.min(window.innerHeight - 236, rect.top - 8));
      setPreview({ item, top, left: rect.right + 8 });
    }, PREVIEW_MS);
  };

  const renderGroup = (group: Group) => {
    const open = isOpen(group);
    if (group.kind === 'nav') {
      const rows = filtering ? group.rows.filter((row) => matches(rowText(row), q)) : group.rows;
      if (rows.length === 0) return null;
      return (
        <div className={cn('pt-sec', !open && 'is-closed')} key={group.key}>
          <button
            type='button'
            className='pt-sec-head'
            aria-expanded={open}
            title={open ? `Collapse ${group.label}` : `Expand ${group.label}`}
            onClick={() => toggle(group)}
          >
            <Icon name='chevron-down' />
            <span className='pt-sec-label'>{group.label}</span>
            <span className='pt-sec-count'>{rows.length}</span>
          </button>
          {open ? (
            <div className='pt-sec-body is-rows'>
              {rows.map((row) => (
                <NavRow
                  key={row.id}
                  row={row}
                  current={isCurrentRoute(row, pathname)}
                  onNavigate={onNavigate}
                  follow={follow}
                />
              ))}
            </div>
          ) : null}
        </div>
      );
    }
    const items = filtering
      ? group.section.items.filter((item) => matches(itemText(item), q))
      : group.section.items;
    if (items.length === 0) return null;
    const frames = density === 'thumbs' && thumb !== 'row';
    return (
      <div className={cn('pt-sec', !open && 'is-closed')} key={group.key}>
        <button
          type='button'
          className='pt-sec-head'
          aria-expanded={open}
          title={open ? `Collapse ${group.label}` : `Expand ${group.label}`}
          onClick={() => toggle(group)}
        >
          <Icon name='chevron-down' />
          <span className='pt-sec-label'>{group.label}</span>
          <span className='pt-sec-count'>{items.length}</span>
        </button>
        {open ? (
          <div className={cn('pt-sec-body', !frames && 'is-rows')}>
            {items.map((item) => {
              const on = item.id === active;
              const sub = renderSub ? renderSub(item, on) : null;
              return (
                <Fragment key={item.id}>
                  {frames ? (
                    <ThumbItem item={item} active={on} onSelect={pick} follow={follow} />
                  ) : (
                    <OutlineRow item={item} active={on} onSelect={pick} follow={follow} onHover={onHover} />
                  )}
                  {sub ? <div className='pt-sub'>{sub}</div> : null}
                </Fragment>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  };

  const rendered = groups.map(renderGroup).filter((node) => node !== null);
  const gallery = id === 'gallery';

  return (
    <aside className={cn('pt-sb', hidden && 'is-hidden', overlay && 'is-overlay')} aria-label={title}>
      <div className='pt-sb-head'>
        {gallery ? (
          <span className='pt-sb-mark'>{mark === 'gt' ? <GtMark /> : <PtMark />}</span>
        ) : (
          <Link className='pt-sb-mark' href='/' title='Back to the gallery' aria-label='Back to the gallery'>
            {mark === 'gt' ? <GtMark /> : <PtMark />}
          </Link>
        )}
        <b>{title}</b>
        {overlay ? (
          <ToolButton icon='close' title='Close the list (Esc)' onClick={() => setSidebar(false)} />
        ) : null}
      </div>
      <div className='pt-sb-tools'>
        <label className='pt-sb-filter'>
          <Icon name='search' />
          <input
            ref={inputRef}
            type='search'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onFilterKey}
            placeholder='Filter'
            title={`Filter ${count}`}
            aria-label={`Filter ${count}`}
            autoComplete='off'
            spellCheck={false}
          />
        </label>
        {thumb === 'row' ? null : (
          <Seg
            options={DENSITY_OPTIONS}
            value={density}
            onChange={setDensity}
            label='List density'
            iconOnly
            className='is-small'
          />
        )}
      </div>
      <div ref={listRef} className='pt-thumbs pt-scroll' onKeyDown={onListKey}>
        {rendered.length > 0 ? rendered : <p className='pt-sb-empty'>Nothing matches the filter.</p>}
      </div>
      {preview ? (
        <div className='pt-sb-preview' style={{ top: preview.top, left: preview.left }} aria-hidden='true'>
          <div className='pt-sb-preview-frame'>
            <ThumbShot item={preview.item} />
          </div>
          <div className='pt-sb-preview-title'>
            {preview.item.n ? <span>{preview.item.n} </span> : null}
            {preview.item.title}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
