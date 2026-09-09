'use client';

import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { KeyboardEvent, MouseEvent, ReactNode, RefObject } from 'react';
import { Fragment, useId, useRef, useState } from 'react';

import { cn } from '@/lib/cn';
import type { ShellDensity, ShellItem, ShellMark, ShellSection, ShellShot, ShellThumb } from '@/lib/shell-data';
import { previewId } from '@/lib/shell-data';
import { isExternalSurface, surfaceGroups } from '@/lib/surfaces';
import type { Surface, SurfaceGroup, SurfaceSite } from '@/lib/surfaces';
import { useMountEffect } from '@/lib/use-mount-effect';

import { GtMark } from './GtMark';
import { Icon } from './icons';
import type { IconName } from './icons';
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

/** The site map groups, in the one order every route keeps (decision 7; Shipped after Pages, directive 8.10). */
const NAV_GROUPS: readonly SurfaceGroup[] = ['Pages', 'Shipped', 'Documents', 'Sites', 'Explorations', 'Archive'];

/** Groups folded on a first visit; the count on the header says what is inside. */
const CLOSED_BY_DEFAULT: readonly string[] = ['Shipped'];

/** The group whose body is the tile grid, one site per grid row. */
const TILE_GROUP: SurfaceGroup = 'Sites';

/** What the arrow keys walk, in document order: headers, rows, tiles, the rows a route hangs under an item. */
const WALK = '.pt-grp-head, .pt-orow, .pt-tile, .pt-sub .pt-row';

/** the distance a followed row keeps from the list's edges */
const FOLLOW_MARGIN = 8;

/* queue-list for the outline (bars-3 would read as the toolbar's List toggle 60px away), photo for the shots */
const DENSITY_OPTIONS: readonly SegOption<ShellDensity>[] = [
  { value: 'outline', label: 'Outline', icon: 'queue-list', title: 'Outline' },
  { value: 'thumbs', label: 'Thumbnails', icon: 'photo', title: 'Thumbnails' },
];

/* ---- icons (directive 8.5) ---- */

/* the Pages rows, by surface id */
const PAGE_ICON: Readonly<Record<string, IconName>> = {
  gallery: 'gallery',
  brand: 'swatch',
  docs: 'document',
  deck: 'deck',
  present: 'present',
  compare: 'compare',
};

/* the sites, on their color tokens */
const SITE_ICON: Readonly<Record<SurfaceSite, IconName>> = {
  dossier: 'folder',
  orbit: 'globe',
  signal: 'signal',
  shipped: 'check-badge',
};

/* the icon a site map group's rows share when the row itself does not decide */
const GROUP_ICON: Readonly<Partial<Record<string, IconName>>> = {
  Shipped: 'check-badge',
  Documents: 'document',
  Explorations: 'sparkles',
  Archive: 'archive',
  Libraries: 'cube',
  'Brand sections': 'swatch',
};

/* the icon a route's own section gives its items, by section id */
const SECTION_ICON: Readonly<Partial<Record<string, IconName>>> = {
  shipped: 'check-badge',
  documents: 'document',
  'brand-book': 'swatch',
  explorations: 'sparkles',
  archive: 'archive',
};

/** Which site a direction slug belongs to; a page under it (`singularity-dossier-enterprise`) belongs to the same one. */
const SITE_OF_SLUG: Readonly<Record<string, SurfaceSite>> = {
  'singularity-dossier': 'dossier',
  'singularity-orbit': 'orbit',
  'singularity-signal': 'signal',
  production: 'shipped',
};

function siteOfId(id: string): SurfaceSite | undefined {
  for (const [slug, site] of Object.entries(SITE_OF_SLUG)) {
    if (id === slug || id.startsWith(`${slug}-`)) return site;
  }
  return undefined;
}

function navIcon(row: Surface): IconName {
  if (row.group === 'Pages') return PAGE_ICON[row.id] ?? 'pages';
  if (isExternalSurface(row)) return 'external';
  if (row.site) return SITE_ICON[row.site];
  return GROUP_ICON[row.group] ?? 'pages';
}

function itemIcon(section: ShellSection, item: ShellItem, site: SurfaceSite | undefined): IconName {
  if (site) return SITE_ICON[site];
  if (item.url) return 'external';
  return SECTION_ICON[section.id] ?? GROUP_ICON[section.label] ?? 'pages';
}

/* ---- the list's data ---- */

/**
 * One row of the list: a route item the shell selects (`item` set), or a
 * site map row that links to another route. Both carry the same fields the
 * renderer reads, so a group's body is one list whatever it mixes.
 */
type Row = {
  key: string;
  name: string;
  /** the second line in thumbnail density: the path, or host and path for a row that leaves the site */
  address: string;
  desc: string;
  icon: IconName;
  /** the site whose color the icon draws, through data-site */
  site?: SurfaceSite;
  /** the surfaces.ts id, written to data-preview for the preview layer (directive 8.6) */
  preview: string;
  shot?: ShellShot;
  href: string;
  external: boolean;
  item?: ShellItem;
};

type Group = {
  key: string;
  label: string;
  rows: readonly Row[];
  /** the Sites group: tiles instead of rows */
  tiles: boolean;
};

function fromItem(section: ShellSection, item: ShellItem): Row {
  const site = siteOfId(item.id);
  const preview = previewId(item);
  return {
    key: item.id,
    name: item.title,
    address: item.url ?? item.href ?? '',
    desc: item.desc ?? item.title,
    icon: itemIcon(section, item, site),
    site,
    preview,
    shot: item.shot,
    href: item.url ?? item.href ?? `#${encodeURIComponent(item.id)}`,
    external: Boolean(item.url),
    item,
  };
}

function fromNav(row: Surface): Row {
  return {
    key: `nav:${row.id}`,
    name: row.name,
    address: row.host,
    desc: row.desc,
    icon: navIcon(row),
    site: row.site,
    preview: row.id,
    shot: row.shot ? { light: row.shot, dark: row.shotDark } : undefined,
    href: row.href,
    external: isExternalSurface(row),
  };
}

/**
 * A route section standing in for a site map group keeps the group's rows
 * the route does not own: on the gallery, Sites holds the three concepts as
 * items and their enterprise pages as links, Shipped the production home
 * as an item and its pages and live surfaces as links. Items and rows pair
 * by surface id; items the map does not know follow at the end.
 */
function merge(section: ShellSection, nav: readonly Surface[]): readonly Row[] {
  const items = section.items.map((item) => fromItem(section, item));
  const byPreview = new Map(items.map((row) => [row.preview, row]));
  const taken = new Set<string>();
  const out: Row[] = [];
  for (const surface of nav) {
    const own = byPreview.get(surface.id);
    if (own) {
      out.push(own);
      taken.add(own.key);
    } else {
      out.push(fromNav(surface));
    }
  }
  for (const row of items) if (!taken.has(row.key)) out.push(row);
  return out;
}

/**
 * The groups in order. With the site map on, the six groups run in the one
 * order every route keeps, a route section replacing the group of its own
 * name (Documents on /docs, Sites and Explorations on the gallery); a route
 * section that matches no group (the brand book's Sections) follows Pages,
 * since the route is a page. Without the site map the route's sections are
 * the whole list.
 */
function buildGroups(sections: readonly ShellSection[], siteMap: boolean): readonly Group[] {
  const own = (section: ShellSection): Group => ({
    key: section.id,
    label: section.label,
    rows: section.items.map((item) => fromItem(section, item)),
    tiles: false,
  });
  if (!siteMap) return sections.map(own);
  const navRows = new Map(surfaceGroups('site').map((entry) => [entry.group, entry.rows]));
  const matched = new Set<string>();
  const out: Group[] = [];
  for (const group of NAV_GROUPS) {
    const section = sections.find((entry) => entry.id === group.toLowerCase());
    const nav = navRows.get(group) ?? [];
    if (section) {
      matched.add(section.id);
      out.push({ key: group, label: group, rows: merge(section, nav), tiles: group === TILE_GROUP });
    } else if (nav.length > 0) {
      out.push({ key: group, label: group, rows: nav.map(fromNav), tiles: group === TILE_GROUP });
    }
    if (group === 'Pages') {
      for (const entry of sections) {
        if (!matched.has(entry.id) && !NAV_GROUPS.some((name) => name.toLowerCase() === entry.id)) {
          matched.add(entry.id);
          out.push(own(entry));
        }
      }
    }
  }
  for (const entry of sections) if (!matched.has(entry.id)) out.push(own(entry));
  return out;
}

function matches(row: Row, query: string): boolean {
  return `${row.name} ${row.address} ${row.desc}`.toLowerCase().includes(query);
}

/** `52 slides` -> `slides`; the word the filter's accessible name carries (the placeholder is `Filter`, the count beside it names the noun). */
function nounOf(count: string): string {
  return count.replace(/^\d+\s*/, '').trim() || 'items';
}

/** True for a click the browser should keep: a new tab, a new window, a drag. */
function isModified(event: MouseEvent<HTMLElement>): boolean {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

/** The path a row names: its href without the hash. */
function pathOf(href: string): string {
  return href.split('#')[0] ?? href;
}

/** True when the path is the one the reader is on, or above it (`/docs` for `/docs/design`). */
function covers(path: string, pathname: string): boolean {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

/**
 * The one site map row that names the route the reader is on: of the rows
 * whose path covers the pathname, the longest, so on /d/production/enterprise
 * the Enterprise row is current and not the Home row above it as well.
 */
function currentKey(groups: readonly Group[], pathname: string): string | null {
  let best: Row | null = null;
  for (const group of groups) {
    for (const row of group.rows) {
      if (row.item || row.external) continue;
      const path = pathOf(row.href);
      if (!covers(path, pathname)) continue;
      if (!best || path.length > pathOf(best.href).length) best = row;
    }
  }
  return best?.key ?? null;
}

/** Smooth unless the reader asked for less motion. */
function scrollBehavior(): ScrollBehavior {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  } catch {
    return 'auto';
  }
}

/**
 * A stable ref callback for the current row: React calls it when the row
 * mounts or when a row becomes current, never on an unrelated render, so
 * the list scrolls only when the current row changes. Scrolls the list
 * alone (scrollTo on the region, not scrollIntoView, which also moves every
 * scrolling ancestor), only when the row is out of view, and not before the
 * shell has applied the hash (ready), so the SSR default row never spends
 * the landing. The sticky header above the row is kept clear of it.
 */
function makeFollow(listRef: RefObject<HTMLElement | null>, ready: RefObject<boolean>) {
  return (el: HTMLElement | null) => {
    const list = listRef.current;
    if (!el || !list || !ready.current) return;
    const head = el.closest('.pt-grp')?.querySelector<HTMLElement>('.pt-grp-head');
    const headH = head ? head.offsetHeight : 0;
    /* measured against the list, not the row's offsetParent (its positioned group) */
    const top = el.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
    const bottom = top + el.offsetHeight;
    if (top - headH < list.scrollTop) {
      list.scrollTo({ top: Math.max(0, top - headH - FOLLOW_MARGIN), behavior: scrollBehavior() });
    } else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: bottom - list.clientHeight + FOLLOW_MARGIN, behavior: scrollBehavior() });
    }
  };
}

/* ---- the grid's list ---- */

type ThumbItemProps = {
  item: ShellItem;
  active: boolean;
  onSelect: (id: string) => void;
};

/** A route item as a captured 16:9 frame with its number and title; the caption previews the item (directive 8.6). */
function ThumbItem({ item, active, onSelect }: ThumbItemProps) {
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
    >
      <div className='n'>{item.n ?? ''}</div>
      <div className='pt-thumb-body'>
        <div className='pt-thumb-frame'>
          <ThumbShot item={item} />
        </div>
        <div className='pt-thumb-title' data-preview={previewId(item)}>
          {item.title}
        </div>
      </div>
    </div>
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

/* ---- the tree ---- */

type RowProps = {
  row: Row;
  /** the row is the place inside the current document, or the one current route while no item is marked */
  active: boolean;
  /** the row names the route the reader is on while an item carries the bar */
  current: boolean;
  /** thumbnail density: the 64x36 capture and the address */
  shots: boolean;
  /** a plain click or Space (null) picks the row; a modified click keeps the browser's meaning */
  onPick: (row: Row, event: MouseEvent<HTMLElement> | null) => void;
  follow?: (el: HTMLElement | null) => void;
};

/** The link attributes every row and tile shares. */
function linkAttrs(row: Row, active: boolean, current: boolean) {
  return {
    href: row.href,
    title: row.desc,
    'data-preview': row.preview,
    'data-site': row.site,
    'aria-current': active || current ? (row.item ? ('true' as const) : ('page' as const)) : undefined,
    target: row.external ? '_blank' : undefined,
    rel: row.external ? 'noreferrer' : undefined,
  };
}

/** Space activates a row as Enter does natively; stopped so a paged route's shell does not read it as next. */
function onRowSpace(event: KeyboardEvent<HTMLElement>, act: () => void): void {
  if (event.key !== ' ') return;
  event.preventDefault();
  event.stopPropagation();
  act();
}

/** The 64x36 capture, or the plate with the row's initial; in a row it is a frame, in a tile the tile is. */
function Mini({ row }: { row: Row }) {
  return (
    <span className='pt-thumb-frame is-mini'>
      <ThumbShot item={{ id: row.key, title: row.name, shot: row.shot }} />
    </span>
  );
}

/**
 * A 28px row: the Heroicon, a direct child so a row is four nodes and the
 * list stays under its DOM budget, in a 16px column under the header's
 * label (a site's icon on its --pt-site-* token through data-site), the
 * name, a route's short mark at the right end when it sets one (the pane
 * letter on /compare), and in thumbnail density the 64x36 capture on the
 * left with the address on a second line, 44px tall. A route item is an
 * anchor with its real href whose plain click the shell answers (a
 * modified click keeps the browser's meaning); a site map row is a link to
 * its route. The row that
 * is the place inside the current document draws the 2px ink bar.
 */
function TreeRow({ row, active, current, shots, onPick, follow }: RowProps) {
  const Tag = row.item || row.external ? 'a' : Link;
  return (
    <Tag
      className={cn('pt-orow', active && 'is-active', current && 'is-current', row.external && 'is-external')}
      {...linkAttrs(row, active, current)}
      onMouseDown={row.item ? pressWithoutFocus : undefined}
      onClick={(event) => onPick(row, event)}
      onKeyDown={row.item ? (event) => onRowSpace(event, () => onPick(row, null)) : undefined}
      ref={follow}
    >
      {shots ? <Mini row={row} /> : null}
      <Icon name={row.icon} />
      <span className='pt-orow-name'>{row.name}</span>
      {row.item?.mark ? <span className='pt-orow-mark'>{row.item.mark}</span> : null}
      {shots ? <span className='pt-orow-addr'>{row.address}</span> : null}
    </Tag>
  );
}

/**
 * A site as a tile (grafted from variant C): the colored 14px icon and the
 * name, set as one run of text so a two-word name wraps under the icon and
 * keeps the tile's full width, in a --pt-edge frame, ink on hover and
 * current with the 2px offset outline every other current frame uses; a
 * route's mark (the pane letter on /compare) follows the name. In
 * thumbnail density the 64x36 capture sits above them, drawn without a
 * frame of its own since the tile is the frame (directive 8.9).
 */
function Tile({ row, active, current, shots, onPick, follow }: RowProps) {
  const Tag = row.item || row.external ? 'a' : Link;
  return (
    <Tag
      className={cn('pt-tile', active && 'is-active', current && 'is-current')}
      {...linkAttrs(row, active, current)}
      onMouseDown={row.item ? pressWithoutFocus : undefined}
      onClick={(event) => onPick(row, event)}
      onKeyDown={row.item ? (event) => onRowSpace(event, () => onPick(row, null)) : undefined}
      ref={follow}
    >
      {shots ? <Mini row={row} /> : null}
      <span className='pt-tile-cap'>
        <Icon name={row.icon} size={14} />
        <span className='pt-tile-name'>{row.name}</span>
        {row.item?.mark ? <span className='pt-tile-mark'>{row.item.mark}</span> : null}
      </span>
    </Tag>
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
  /** the groups folded on a first visit; Shipped unless the caller says otherwise */
  closedGroups?: readonly string[];
  /** where ViewerShell reads the filter state for the Escape ladder */
  filter?: RefObject<SidebarFilter>;
  /** what the current route's own Pages row does when clicked */
  onCurrentPage?: () => void;
};

/**
 * Column one of the shell: the site map as a tree (directive 8.5, variant
 * B with the judged grafts). A 52px head holds the mark (a link back to the
 * gallery on every other route), the title, which never truncates, and the
 * density toggle; a 40px filter row holds the field and the route's count.
 * The list fills the rest as a scroll region of collapsible groups: a 24px
 * header with the chevron, the group's name and its count, sticky at the
 * top of the region so the group in view is always named, owning the
 * --pt-hair rule above its first row; under it 28px rows indented 24px
 * behind their Heroicons, so every icon sits in one column under the
 * header's label and the site colors stack. The Sites group is a two-column
 * grid of tiles, one site per grid row. Shipped starts folded with its
 * count; a group that holds the current route opens itself; the reader's
 * own choices persist per route under gt-shell-sections:<id>. In thumbnail
 * density every row is 44px with its 64x36 capture (or the plate with its
 * initial) and the address on a second line. The current row draws the 2px
 * ink bar and ink text and the list scrolls to it, alone, when it is out of
 * view. Every row carries data-preview for the one preview layer
 * (directive 8.6); the list draws no preview of its own. Typing in the
 * filter narrows every group and opens them; Enter opens the first match;
 * Escape clears; Down moves into the list; the arrows walk headers and
 * rows, Left and Right fold and unfold a header. At or below 900px an open
 * list is an overlay with a close button, and a pick closes it.
 */
export function Sidebar({
  title,
  mark,
  count,
  sections,
  thumb,
  renderSub,
  siteMap = false,
  closedGroups = CLOSED_BY_DEFAULT,
  filter,
  onCurrentPage,
}: SidebarProps) {
  const shell = usePtShell();
  const router = useRouter();
  const pathname = usePathname();
  const uid = useId();
  const { id, density, present, narrow, sidebarOpen, sidebarShown, active, select, setSidebar, setDensity } = shell;
  /* the shell's landing flag; a state assembled elsewhere (DirectionCorner) leaves it out and is ready at once */
  const ready = shell.ready ?? true;

  const [query, setQuery] = useState('');
  /* per group, open or closed, where the reader has changed the default; persisted per route */
  const [overrides, setOverrides] = useState<ReadonlyMap<string, boolean>>(() => new Map());
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLElement>(null);
  const readyRef = useRef(ready);
  readyRef.current = ready;
  /* one stable ref callback: React calls it only when the current row mounts or changes */
  const [follow] = useState(() => makeFollow(listRef, readyRef));

  const groups = buildGroups(sections, siteMap);
  const q = query.trim().toLowerCase();
  const filtering = q.length > 0;
  const current = currentKey(groups, pathname);
  /* an item marked by the shell carries the bar; while none is (the gallery
     at its top, a direction page) the current route's row carries it */
  const hasActiveItem = groups.some((group) => group.rows.some((row) => row.item?.id === active));

  /* in the DOM while the shell says so: sidebarShown lags a close by the
     sidebar duration so the content can fade while the column narrows
     (directive 7.4); a state without it (DirectionCorner) follows the toggle */
  const hidden = !(sidebarShown ?? (sidebarOpen && !present));
  const overlay = narrow && !hidden;
  const storageKey = `gt-shell-sections:${id}`;
  const shots = density === 'thumbs' && thumb !== 'row';

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

  /* the landing: the row the server marked mounted before the shell was
     ready, so its ref callback did nothing; once ready, the current row is
     brought into view if it is not */
  useGSAP(
    () => {
      if (!ready) return;
      const row = listRef.current?.querySelector<HTMLElement>('.is-active[data-preview]');
      if (row) follow(row);
    },
    { dependencies: [ready] }
  );

  const holdsCurrent = (group: Group) =>
    group.rows.some((row) => (row.item ? row.item.id === active : row.key === current));

  const isOpen = (group: Group) =>
    filtering || (overrides.get(group.key) ?? (holdsCurrent(group) || !closedGroups.includes(group.key)));

  const setOpen = (group: Group, open: boolean) => {
    const next = new Map(overrides);
    next.set(group.key, open);
    setOverrides(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(next)));
    } catch {
      // private mode: the state holds for the session
    }
  };

  /* a route item: the shell selects it; a site map row: the link navigates,
     unless it names this route, whose own handler runs instead */
  const onPick = (row: Row, event: MouseEvent<HTMLElement> | null) => {
    if (event && isModified(event)) return;
    if (row.item) {
      event?.preventDefault();
      select(row.item.id);
      if (narrow) setSidebar(false);
      return;
    }
    if (!row.external && row.key === current && onCurrentPage && pathOf(row.href) === pathname) {
      event?.preventDefault();
      onCurrentPage();
    }
    if (narrow) setSidebar(false);
  };

  const visibleRows = (group: Group): readonly Row[] =>
    filtering ? group.rows.filter((row) => matches(row, q)) : group.rows;

  /* the first visible thing the filter matches: a route item or a site map row */
  const firstMatch = (): (() => void) | null => {
    for (const group of groups) {
      const row = visibleRows(group)[0];
      if (!row) continue;
      if (row.item) {
        const item = row.item;
        return () => {
          select(item.id);
          if (narrow) setSidebar(false);
        };
      }
      return () => {
        if (narrow) setSidebar(false);
        if (row.external) window.open(row.href, '_blank', 'noopener,noreferrer');
        else router.push(row.href);
      };
    }
    return null;
  };

  const walk = (): HTMLElement[] => {
    const list = listRef.current;
    return list ? Array.from(list.querySelectorAll<HTMLElement>(WALK)) : [];
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
      const rows = walk();
      const first = rows.find((row) => !row.classList.contains('pt-grp-head')) ?? rows[0];
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

  /* the arrows move focus between headers and rows; Up from the first
     returns to the filter; Left on a row returns to its header and closes
     an open header; Right opens a closed header and enters an open one */
  const onListKey = (event: KeyboardEvent<HTMLElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const { key } = event;
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      const rows = walk();
      const at = rows.indexOf(target);
      if (at < 0) return;
      event.preventDefault();
      if (key === 'ArrowUp' && at === 0) {
        inputRef.current?.focus({ preventScroll: true });
        return;
      }
      rows[at + (key === 'ArrowDown' ? 1 : -1)]?.focus();
      return;
    }
    if (key !== 'ArrowLeft' && key !== 'ArrowRight') return;
    const box = target.closest<HTMLElement>('.pt-grp');
    const group = groups.find((entry) => entry.key === box?.dataset.group);
    if (!box || !group) return;
    const onHead = target.classList.contains('pt-grp-head');
    event.preventDefault();
    if (key === 'ArrowLeft') {
      if (onHead) setOpen(group, false);
      else box.querySelector<HTMLElement>('.pt-grp-head')?.focus();
      return;
    }
    if (!onHead) return;
    if (isOpen(group)) box.querySelector<HTMLElement>('.pt-orow, .pt-tile')?.focus();
    else setOpen(group, true);
  };

  const renderRow = (group: Group, row: Row) => {
    const isActive = row.item ? row.item.id === active : !hasActiveItem && row.key === current;
    const isCurrent = !isActive && row.key === current;
    const props: RowProps = {
      row,
      active: isActive,
      current: isCurrent,
      shots,
      onPick,
      follow: isActive ? follow : undefined,
    };
    if (group.tiles) return <Tile key={row.key} {...props} />;
    const sub = row.item && renderSub ? renderSub(row.item, isActive) : null;
    return (
      <Fragment key={row.key}>
        <TreeRow {...props} />
        {sub ? <div className='pt-sub'>{sub}</div> : null}
      </Fragment>
    );
  };

  const renderGroup = (group: Group) => {
    const rows = visibleRows(group);
    if (rows.length === 0) return null;
    const open = isOpen(group);
    const bodyId = `${uid}-${group.key}`;
    return (
      <section className={cn('pt-grp', !open && 'is-closed')} key={group.key} data-group={group.key}>
        <button
          type='button'
          className='pt-grp-head'
          aria-expanded={open}
          aria-controls={open ? bodyId : undefined}
          title={open ? `Collapse ${group.label}` : `Expand ${group.label}`}
          onClick={() => setOpen(group, !open)}
        >
          <span className='pt-chev' aria-hidden='true'>
            <Icon name='chevron-down' />
          </span>
          <span className='pt-grp-name'>{group.label}</span>
          <span className='pt-grp-count'>{rows.length}</span>
        </button>
        {open ? (
          <div id={bodyId} className={cn('pt-grp-body', group.tiles && 'pt-tiles')}>
            {rows.map((row) => renderRow(group, row))}
          </div>
        ) : null}
      </section>
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
            onChange={setDensity}
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
      <nav
        ref={listRef}
        className={cn('pt-thumbs pt-scroll', shots && 'is-shots')}
        aria-label='Site map'
        onKeyDown={onListKey}
      >
        {rendered.length > 0 ? rendered : <p className='pt-sb-empty'>Nothing matches the filter.</p>}
      </nav>
    </aside>
  );
}
