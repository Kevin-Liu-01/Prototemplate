'use client';

import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { FocusEvent, KeyboardEvent, MouseEvent, ReactNode, RefObject } from 'react';
import { Fragment, useRef, useState } from 'react';

import { cn } from '@/lib/cn';
import type { ShellDensity, ShellItem, ShellMark, ShellSection, ShellThumb } from '@/lib/shell-data';
import { surfaceGroups } from '@/lib/surfaces';
import type { Surface, SurfaceGroup } from '@/lib/surfaces';
import { useMountEffect } from '@/lib/use-mount-effect';

import { GtMark } from './GtMark';
import { HoverPreview, useHoverPreview } from './HoverPreview';
import type { HoverPreviewControls } from './HoverPreview';
import { Icon } from './icons';
import { activateOnKey, ListRow, pressWithoutFocus } from './ListRow';
import { PtMark } from './PtMark';
import { Seg } from './Seg';
import type { SegOption } from './Seg';
import { usePtShell } from './shell-context';
import { SidebarFilter as FilterRow } from './SidebarFilter';
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

/** Everything the arrow keys walk in the list: item rows, frames, sub rows, group heads. */
const ROW_SELECTOR = '.pt-orow, .pt-thumb, .pt-row, .pt-sec-head';

/* queue-list for the outline (bars-3 would read as the toolbar's List toggle 60px away), photo for the frames */
const DENSITY_OPTIONS: readonly SegOption<ShellDensity>[] = [
  { value: 'outline', label: 'Outline', icon: 'queue-list', title: 'Outline' },
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

/** A site map row as a preview subject: its capture under its name. */
function rowAsItem(row: Surface): ShellItem {
  return {
    id: `nav:${row.id}`,
    title: row.name,
    shot: row.shot ? { light: row.shot, dark: row.shotDark } : undefined,
  };
}

/** `52 slides` -> `slides`; the word the filter's accessible name carries (the placeholder is `Filter`, the count beside it names the noun). */
function nounOf(count: string): string {
  return count.replace(/^\d+\s*/, '').trim() || 'items';
}

/** True when the element took focus from the keyboard, not from a click. */
function focusVisible(el: HTMLElement): boolean {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
}

function scrollRow(el: HTMLElement, block: ScrollLogicalPosition): void {
  try {
    el.scrollIntoView({ block });
  } catch {
    el.scrollIntoView();
  }
}

/**
 * A ref callback, not an effect: React calls it when the active row mounts
 * or when the ref prop switches on, so the row follows every selection and
 * reappears in view when a hidden list is shown again. Nothing happens
 * before the shell is ready (the SSR default row must not spend the
 * landing); the first landing after that centers the row on the next frame,
 * so it measures rendered boxes; later moves scroll the least distance.
 */
function makeFollow(landed: RefObject<boolean>, ready: RefObject<boolean>) {
  return (el: HTMLElement | null) => {
    if (!el || !ready.current) return;
    if (landed.current) {
      scrollRow(el, 'nearest');
      return;
    }
    landed.current = true;
    requestAnimationFrame(() => {
      if (el.isConnected) scrollRow(el, 'center');
    });
  };
}

type ThumbItemProps = {
  item: ShellItem;
  active: boolean;
  onSelect: (id: string) => void;
  follow?: (el: HTMLElement | null) => void;
};

/** A route item as a captured 16:9 frame with its number and title (thumbnail density). */
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
  preview: HoverPreviewControls;
};

/**
 * A route item as a 32px outline row: the number in a 26px tabular column,
 * the title, and, when the item has a capture, a 12px preview affordance
 * that shows on hover. The active row draws a 2px ink bar at its left edge.
 * The title clamps to two lines and the tooltip repeats the description, or
 * the title itself when there is none, so a clamped row still names itself.
 * Enter selects; Space opens the preview (or selects an item with no
 * capture); hovering or keyboard-focusing the row for 500ms opens it too.
 */
function OutlineRow({ item, active, onSelect, follow, preview }: OutlineRowProps) {
  const select = () => onSelect(item.id);
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      /* not prevented: the shell's digit buffer (1, 2, Enter) still lands and wins */
      select();
      return;
    }
    if (event.key === ' ') {
      /* stopped here: in a paged route the shell reads Space as next */
      event.preventDefault();
      event.stopPropagation();
      if (item.shot) preview.open(item, event.currentTarget);
      else select();
      return;
    }
    if (event.key === 'Escape') preview.close();
  };
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (focusVisible(event.currentTarget)) preview.arm(item, event.currentTarget);
  };
  const onPeek = (event: MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    const row = event.currentTarget.closest<HTMLElement>('.pt-orow');
    if (row) preview.open(item, row);
  };
  return (
    <div
      className={cn('pt-orow', active && 'is-active', item.shot && 'has-shot')}
      role='button'
      tabIndex={0}
      data-id={item.id}
      aria-current={active || undefined}
      title={item.desc ?? item.title}
      onMouseDown={pressWithoutFocus}
      onClick={select}
      onKeyDown={onKey}
      onMouseEnter={(event) => preview.arm(item, event.currentTarget)}
      onMouseLeave={preview.close}
      onFocus={onFocus}
      onBlur={preview.close}
      ref={active && follow ? follow : undefined}
    >
      <span className='n'>{item.n ?? ''}</span>
      <span className='pt-orow-title'>{item.title}</span>
      {item.shot ? (
        <span className='pt-orow-peek' title='Preview (Space)' aria-hidden='true' onClick={onPeek}>
          <Icon name='eye' />
        </span>
      ) : null}
    </div>
  );
}

type NavRowProps = {
  row: Surface;
  current: boolean;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, row: Surface, current: boolean) => void;
  follow?: (el: HTMLElement | null) => void;
  preview: HoverPreviewControls;
};

/** A site map row: a link to another route, marked when it names this one; its capture previews like an item's. */
function NavRow({ row, current, onNavigate, follow, preview }: NavRowProps) {
  const subject = rowAsItem(row);
  return (
    <Link
      className={cn('pt-orow is-nav', current && 'is-active', subject.shot && 'has-shot')}
      href={row.href}
      aria-current={current ? 'page' : undefined}
      title={row.desc}
      onClick={(event) => onNavigate(event, row, current)}
      onMouseEnter={(event) => preview.arm(subject, event.currentTarget)}
      onMouseLeave={preview.close}
      onFocus={(event) => {
        if (focusVisible(event.currentTarget)) preview.arm(subject, event.currentTarget);
      }}
      onBlur={preview.close}
      ref={current && follow ? follow : undefined}
    >
      <span className='n' aria-hidden='true' />
      <span className='pt-orow-title'>{row.name}</span>
      {subject.shot ? (
        <span className='pt-orow-peek' aria-hidden='true'>
          <Icon name='eye' />
        </span>
      ) : null}
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

/**
 * Column one of the shell (directive 7.3), an outline first and a thumbnail
 * strip second. A 52px head holds the mark (a link back to the gallery on
 * every other route), the title, which never truncates, and the density
 * toggle: two 28px icon options, Outline and Thumbnails. A 40px filter row
 * holds the search field and, at its right end, the route's count. The list
 * fills the rest as a scroll region: collapsible groups whose open state
 * persists per route under gt-shell-sections:<id>, each item a 32px row
 * with the active one marked by a 2px ink bar, or a strip of captured 16:9
 * frames in thumbnail density. Site map groups are links to other routes
 * and stay rows in both densities; the current route's row reads in ink
 * (no bar: the bar means the place inside the current document).
 * Typing in the filter narrows every group and opens them; Enter opens the
 * first match; Escape clears; Down arrow moves into the list. Arrow keys
 * move between rows, Enter selects, Space previews. Hovering or focusing a
 * row with a capture for 500ms opens a preview beside the list (never on
 * touch). The list centers the active row once, after the shell has
 * applied the hash (shell.ready), so a deep link lands in the middle. At or below 900px an open list is an overlay with a close button,
 * and selecting an item closes it.
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
  const { id, density, present, narrow, sidebarOpen, sidebarShown, active, select, setSidebar, setDensity } = shell;
  /* the shell's landing flag; a state assembled elsewhere (DirectionCorner) leaves it out and is ready at once */
  const ready = shell.ready ?? true;

  const [query, setQuery] = useState('');
  /* per group, open or closed, where the reader has changed the default; persisted per route */
  const [overrides, setOverrides] = useState<ReadonlyMap<string, boolean>>(() => new Map());
  const preview = useHoverPreview();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const landed = useRef(false);
  const readyRef = useRef(ready);
  readyRef.current = ready;
  /* one stable ref callback: React calls it only when the active row mounts or changes */
  const [follow] = useState(() => makeFollow(landed, readyRef));

  /* the landing without a hash: the row the server marked is already in the
     DOM, its ref callback ran before the shell was ready and will not run
     again, so the centering is spent here once ready */
  useGSAP(
    () => {
      if (!ready || landed.current) return;
      const row = listRef.current?.querySelector<HTMLElement>('.pt-orow.is-active, .pt-thumb.is-active');
      if (row) follow(row);
    },
    { dependencies: [ready] }
  );

  const groups = buildGroups(sections, siteMap, openGroups);
  const q = query.trim().toLowerCase();
  const filtering = q.length > 0;

  /* in the DOM while the shell says so: sidebarShown lags a close by the
     sidebar duration so the content can fade while the column narrows
     (directive 7.4); a state without it (DirectionCorner) follows the toggle */
  const hidden = !(sidebarShown ?? (sidebarOpen && !present));
  const overlay = narrow && !hidden;
  const storageKey = `gt-shell-sections:${id}`;
  const frames = density === 'thumbs' && thumb !== 'row';

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
    preview.close();
    select(itemId);
    if (narrow) setSidebar(false);
  };

  const onNavigate = (event: MouseEvent<HTMLAnchorElement>, row: Surface, current: boolean) => {
    preview.close();
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

  const rowsInList = (): HTMLElement[] => {
    const list = listRef.current;
    return list ? Array.from(list.querySelectorAll<HTMLElement>(ROW_SELECTOR)) : [];
  };

  const onFilterKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      /* prevented so the shell's Escape ladder leaves the index alone; the field answered */
      event.preventDefault();
      if (query) setQuery('');
      else event.currentTarget.blur();
      return;
    }
    if (event.key === 'ArrowDown') {
      const first = rowsInList().find((row) => !row.classList.contains('pt-sec-head')) ?? rowsInList()[0];
      if (first) {
        event.preventDefault();
        first.focus();
      }
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

  /* arrow keys move focus between the rows of the list; Up from the first row returns to the filter */
  const onListKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const rows = rowsInList();
    const at = rows.indexOf(target);
    if (at < 0) return;
    event.preventDefault();
    if (event.key === 'ArrowUp' && at === 0) {
      inputRef.current?.focus({ preventScroll: true });
      return;
    }
    const next = rows[at + (event.key === 'ArrowDown' ? 1 : -1)];
    next?.focus();
  };

  const renderHead = (group: Group, n: number) => {
    const open = isOpen(group);
    return (
      <button
        type='button'
        className='pt-sec-head'
        aria-expanded={open}
        title={open ? `Collapse ${group.label}` : `Expand ${group.label}`}
        onClick={() => toggle(group)}
      >
        <Icon name='chevron-down' />
        <span className='pt-sec-label'>{group.label}</span>
        <span className='pt-sec-count'>{n}</span>
      </button>
    );
  };

  const renderGroup = (group: Group) => {
    const open = isOpen(group);
    if (group.kind === 'nav') {
      const rows = filtering ? group.rows.filter((row) => matches(rowText(row), q)) : group.rows;
      if (rows.length === 0) return null;
      return (
        <div className={cn('pt-sec', !open && 'is-closed')} key={group.key}>
          {renderHead(group, rows.length)}
          {open ? (
            <div className='pt-sec-body is-rows'>
              {rows.map((row) => (
                <NavRow
                  key={row.id}
                  row={row}
                  current={isCurrentRoute(row, pathname)}
                  onNavigate={onNavigate}
                  follow={follow}
                  preview={preview}
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
    return (
      <div className={cn('pt-sec', !open && 'is-closed')} key={group.key}>
        {renderHead(group, items.length)}
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
                    <OutlineRow item={item} active={on} onSelect={pick} follow={follow} preview={preview} />
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
  const markNode = mark === 'gt' ? <GtMark /> : <PtMark />;

  return (
    <aside
      className={cn('pt-sb', hidden && 'is-hidden', overlay && 'is-overlay')}
      aria-label={title}
      aria-hidden={hidden || undefined}
    >
      <div className='pt-sb-head'>
        {gallery ? (
          <span className='pt-sb-mark'>{markNode}</span>
        ) : (
          <Link className='pt-sb-mark' href='/' title='Back to the gallery' aria-label='Back to the gallery'>
            {markNode}
          </Link>
        )}
        <b>{title}</b>
        {thumb === 'row' ? null : (
          <Seg
            options={DENSITY_OPTIONS}
            value={density}
            onChange={(next) => {
              preview.close();
              setDensity(next);
            }}
            label='List density'
            iconOnly
            className='is-small'
          />
        )}
        {overlay ? (
          <ToolButton icon='close' title='Close the list (Esc)' onClick={() => setSidebar(false)} />
        ) : null}
      </div>
      <FilterRow
        className='pt-sb-tools'
        value={query}
        onChange={setQuery}
        onKeyDown={onFilterKey}
        placeholder='Filter'
        label={`Filter ${nounOf(count)}`}
        count={count}
        inputRef={inputRef}
      />
      <div ref={listRef} className='pt-thumbs pt-scroll' onKeyDown={onListKey} onScroll={preview.close}>
        {rendered.length > 0 ? rendered : <p className='pt-sb-empty'>Nothing matches the filter.</p>}
      </div>
      {preview.preview && !hidden && !frames ? <HoverPreview preview={preview.preview} /> : null}
    </aside>
  );
}
