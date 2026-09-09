'use client';

import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { KeyboardEvent, MouseEvent, ReactNode, RefObject } from 'react';
import { Fragment, useRef, useState } from 'react';

import { brandFontVariables } from '@/lib/brand-fonts';
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

/** The Shipped group's folded child: the live surfaces of the shipped site (directive 8.10). */
const LIVE_KEY = 'Shipped:live';
const LIVE_LABEL = 'Live site';

/** Groups folded on a first visit: only the live surfaces, whose header names them; every top-level group is open. */
const CLOSED_BY_DEFAULT: readonly string[] = [LIVE_KEY];

/** What the arrow keys walk, in document order: headers, rows, the rows a route hangs under an item. */
const WALK = '.pt-grp-head, .pt-orow, .pt-sub .pt-row';

/** the distance a followed row keeps from the list's edges */
const FOLLOW_MARGIN = 8;

/* queue-list for the outline (bars-3 would read as the toolbar's list toggle 60px away), photo for the shots */
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
  Shipped: 'document',
  Documents: 'document',
  Explorations: 'sparkles',
  Archive: 'archive',
  Libraries: 'cube',
  'Brand sections': 'swatch',
};

/* the icon a route's own section gives its items, by section id */
const SECTION_ICON: Readonly<Partial<Record<string, IconName>>> = {
  shipped: 'document',
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
};

function siteOfId(id: string): SurfaceSite | undefined {
  for (const [slug, site] of Object.entries(SITE_OF_SLUG)) {
    if (id === slug || id.startsWith(`${slug}-`)) return site;
  }
  return undefined;
}

/** True for a site's enterprise page, which sits as a child under the site's home. */
function isEnterprise(id: string): boolean {
  return id.endsWith('-enterprise');
}

/**
 * The glyph a site map row draws. Pages carry their own; a row that leaves
 * the site draws external; the shipped site's pages are documents (the
 * group's header carries the check-badge, so its rows are not a column of
 * badges); a site's enterprise page is a document on the site's color and
 * the site's home its own colored icon; the rest follow their group.
 */
function navIcon(row: Surface): IconName {
  if (row.group === 'Pages') return PAGE_ICON[row.id] ?? 'pages';
  if (isExternalSurface(row)) return 'external';
  if (row.group === 'Shipped') return 'document';
  if (row.site) return isEnterprise(row.id) ? 'document' : SITE_ICON[row.site];
  return GROUP_ICON[row.group] ?? 'pages';
}

function itemIcon(section: ShellSection, item: ShellItem, site: SurfaceSite | undefined): IconName {
  if (site) return isEnterprise(item.id) ? 'document' : SITE_ICON[site];
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
  /** the full name, as the grid caption and the preview title read it */
  name: string;
  /** the shorter name the tree shows for a child row (`Enterprise` under `Dossier`) */
  short?: string;
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
  /** indented one level under the row before it: a site's enterprise page */
  child?: boolean;
  item?: ShellItem;
};

type Group = {
  key: string;
  label: string;
  rows: readonly Row[];
  /** the header's own glyph and the color it draws: the Shipped group's check-badge (directive 8.10) */
  icon?: IconName;
  site?: SurfaceSite;
  /** a folded child group rendered after the rows: the Shipped group's live surfaces */
  sub?: Group;
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
    /* the shipped site's rows draw no color of their own; their header does */
    site: row.group === 'Shipped' ? undefined : row.site,
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
 * by surface id, and a paired item takes the map's name (so the shipped
 * direction reads `Home` here as it does in the index and the corner);
 * items the map does not know follow at the end.
 */
function merge(section: ShellSection, nav: readonly Surface[]): readonly Row[] {
  const items = section.items.map((item) => fromItem(section, item));
  const byPreview = new Map(items.map((row) => [row.preview, row]));
  const taken = new Set<string>();
  const out: Row[] = [];
  for (const surface of nav) {
    const own = byPreview.get(surface.id);
    if (own) {
      out.push({ ...own, name: surface.name, site: surface.group === 'Shipped' ? undefined : own.site });
      taken.add(own.key);
    } else {
      out.push(fromNav(surface));
    }
  }
  for (const row of items) if (!taken.has(row.key)) out.push(row);
  return out;
}

/** The Sites group as a tree: each enterprise page a child row named `Enterprise` under its site's home. */
function nestSites(rows: readonly Row[]): readonly Row[] {
  return rows.map((row) => (isEnterprise(row.preview) ? { ...row, child: true, short: 'Enterprise' } : row));
}

/** The Shipped group: the header carries the badge, the pages are its rows, the live surfaces fold under `Live site`. */
function shippedGroup(label: string, rows: readonly Row[]): Group {
  const pages = rows.filter((row) => !row.external);
  const live = rows.filter((row) => row.external);
  return {
    key: label,
    label,
    rows: pages,
    icon: 'check-badge',
    site: 'shipped',
    sub: live.length > 0 ? { key: LIVE_KEY, label: LIVE_LABEL, rows: live } : undefined,
  };
}

/** A site map group as the list shows it: Shipped with its child group, Sites as a tree, the rest as rows. */
function navGroup(group: SurfaceGroup, rows: readonly Row[]): Group {
  if (group === 'Shipped') return shippedGroup(group, rows);
  if (group === 'Sites') return { key: group, label: group, rows: nestSites(rows) };
  return { key: group, label: group, rows };
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
      out.push(navGroup(group, merge(section, nav)));
    } else if (nav.length > 0) {
      out.push(navGroup(group, nav.map(fromNav)));
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

/** Every group and every child group, flat, for lookups by key. */
function allGroups(groups: readonly Group[]): readonly Group[] {
  return groups.flatMap((group) => (group.sub ? [group, group.sub] : [group]));
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
  for (const group of allGroups(groups)) {
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
 * the landing. The sticky header above the row is kept clear of it. The
 * first follow after landing is the deep link's: a row out of view is
 * centered in the list, with the groups above and below it in sight,
 * instead of parked on the bottom edge; every later selection moves the
 * minimum distance.
 */
function makeFollow(listRef: RefObject<HTMLElement | null>, ready: RefObject<boolean>) {
  let landed = false;
  return (el: HTMLElement | null) => {
    const list = listRef.current;
    if (!el || !list || !ready.current) return;
    const head = el.closest('.pt-grp')?.querySelector<HTMLElement>('.pt-grp-head');
    const headH = head ? head.offsetHeight : 0;
    /* measured against the list, not the row's offsetParent (its positioned group) */
    const top = el.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
    const bottom = top + el.offsetHeight;
    const above = top - headH < list.scrollTop;
    const below = bottom > list.scrollTop + list.clientHeight;
    const first = !landed;
    landed = true;
    if (!above && !below) return;
    if (first) {
      list.scrollTo({ top: Math.max(0, top - (list.clientHeight - el.offsetHeight) / 2), behavior: 'auto' });
      return;
    }
    if (above) {
      list.scrollTo({ top: Math.max(0, top - headH - FOLLOW_MARGIN), behavior: scrollBehavior() });
    } else {
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
  /**
   * Mirror the sidebar's grouping (directive 8.10): a route section that
   * stands for a site map group shows the group's rows that have a capture,
   * the route's own items among them, so the grid's Shipped holds the home
   * and its captured pages and Sites the three homes with their enterprise
   * pages. Rows that leave the site and rows without a capture are left out.
   */
  siteMap?: boolean;
  renderSub?: SubRenderer;
  /** Defaults to the shell's select. GridView passes one that opens the slide first. */
  onSelect?: (id: string) => void;
  /** Extra classes on .pt-thumbs. */
  className?: string;
};

/** A site map row as a grid item: its capture under its full name, opened by the router. */
function navItem(row: Row): ShellItem {
  return { id: row.key, n: '', title: row.name, href: row.href, shot: row.shot, desc: row.desc, surface: row.preview };
}

/**
 * The route's own items as a plain list: a label per section and every item
 * as a captured frame (or a row when the route's thumb is 'row'). The grid
 * renders this over the stage; GridView.css re-lays it out. Every item
 * carries data-id so the shell can find it from outside. With siteMap the
 * sections are built the way the sidebar builds its groups, so the two
 * agree on what Shipped and Sites hold.
 */
export function ThumbList({ sections, thumb, density, siteMap = false, renderSub, onSelect, className }: ThumbListProps) {
  const shell = usePtShell();
  const router = useRouter();
  const pick = onSelect ?? shell.select;
  const frames = density === 'thumbs' && thumb !== 'row';

  type Block = { key: string; label: string; entries: readonly { item: ShellItem; own: boolean }[] };
  const blocks: readonly Block[] = siteMap
    ? buildGroups(sections, true)
        .filter((group) => sections.some((section) => section.id === group.key.toLowerCase()))
        .map((group) => ({
          key: group.key,
          label: group.label,
          entries: group.rows
            .filter((row) => row.item || (row.shot && !row.external))
            .map((row) => (row.item ? { item: row.item, own: true } : { item: navItem(row), own: false })),
        }))
    : sections.map((section) => ({
        key: section.id,
        label: section.label,
        entries: section.items.map((item) => ({ item, own: true })),
      }));

  const open = (entry: { item: ShellItem; own: boolean }) => {
    if (entry.own) {
      pick(entry.item.id);
      return;
    }
    if (entry.item.href) router.push(entry.item.href);
  };

  return (
    <div className={cn('pt-thumbs', !frames && 'is-rows', className)}>
      {blocks.map((block) => (
        <Fragment key={block.key}>
          <div className='pt-sec-label'>{block.label}</div>
          {block.entries.map((entry) => {
            const { item } = entry;
            const active = entry.own && item.id === shell.active;
            const sub = entry.own && renderSub ? renderSub(item, active) : null;
            return (
              <Fragment key={item.id}>
                {frames ? (
                  <ThumbItem item={item} active={active} onSelect={() => open(entry)} />
                ) : (
                  <ListRow item={item} active={active} onSelect={() => open(entry)} />
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

/** The link attributes every row shares. The title carries the full name and the description, since the row clamps to one line. */
function linkAttrs(row: Row, active: boolean, current: boolean) {
  return {
    href: row.href,
    title: row.desc === row.name ? row.name : `${row.name}. ${row.desc}`,
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

/** The 64x36 capture, or the plate with the row's initial, in its own frame. */
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
 * left with the address on a second line, 44px tall. A child row (a site's
 * enterprise page) is indented one level under the row before it and shows
 * its short name. A route item is an anchor with its real href whose plain
 * click the shell answers (a modified click keeps the browser's meaning); a
 * site map row is a link to its route. The row that is the place inside the
 * current document draws the 2px ink bar.
 */
function TreeRow({ row, active, current, shots, onPick, follow }: RowProps) {
  const Tag = row.item || row.external ? 'a' : Link;
  return (
    <Tag
      className={cn(
        'pt-orow',
        active && 'is-active',
        current && 'is-current',
        row.external && 'is-external',
        row.child && 'is-child'
      )}
      {...linkAttrs(row, active, current)}
      onMouseDown={row.item ? pressWithoutFocus : undefined}
      onClick={(event) => onPick(row, event)}
      onKeyDown={row.item ? (event) => onRowSpace(event, () => onPick(row, null)) : undefined}
      ref={follow}
    >
      {shots ? <Mini row={row} /> : null}
      <Icon name={row.icon} />
      <span className='pt-orow-name'>{row.short ?? row.name}</span>
      {row.item?.mark ? <span className='pt-orow-mark'>{row.item.mark}</span> : null}
      {shots ? <span className='pt-orow-addr'>{row.address}</span> : null}
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
  /** the groups folded on a first visit; the live surfaces unless the caller says otherwise */
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
 * header with the chevron, the group's name and its count (painted from
 * data-count, so the header is four nodes), sticky at the top of the
 * region so the group in view is always named, owning the --pt-hair rule
 * above its first row; under it, as the section's own children, 28px rows
 * indented 24px behind their Heroicons, so every icon sits in one column
 * under the header's label and the site colors stack. Every top-level group
 * is open on a first visit; the reader's own choices persist per route
 * under gt-shell-sections:<id>. Shipped (directive 8.10) carries the
 * check-badge on its header, its pages as document rows, and the eight live
 * surfaces folded under a `Live site` child header. Sites holds each site's
 * home on its colored icon with its enterprise page as an indented child
 * row. In thumbnail density every row is 44px with its 64x36 capture (or
 * the plate with its initial) and the address on a second line. The current
 * row draws the 2px ink bar and ink text and the list scrolls to it, alone,
 * when it is out of view; a deep link's first follow centers it. Every row
 * carries data-preview for the one preview layer (directive 8.6); the list
 * draws no preview of its own. Typing in the filter narrows every group and
 * opens them; Enter opens the first match; Escape clears; Down moves into
 * the list; the arrows walk headers and rows, Left and Right fold and unfold
 * a header. At or below 900px an open list is an overlay with a close
 * button, and a pick closes it.
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
  const flat = allGroups(groups);
  const q = query.trim().toLowerCase();
  const filtering = q.length > 0;
  const current = currentKey(groups, pathname);
  /* an item marked by the shell carries the bar; while none is (the gallery
     at its top, a direction page) the current route's row carries it */
  const hasActiveItem = flat.some((group) => group.rows.some((row) => row.item?.id === active));

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
    for (const group of flat) {
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
    const group = flat.find((entry) => entry.key === box?.dataset.group);
    if (!box || !group) return;
    const onHead = target.classList.contains('pt-grp-head');
    event.preventDefault();
    if (key === 'ArrowLeft') {
      if (onHead) setOpen(group, false);
      else box.querySelector<HTMLElement>('.pt-grp-head')?.focus();
      return;
    }
    if (!onHead) return;
    if (isOpen(group)) box.querySelector<HTMLElement>('.pt-orow')?.focus();
    else setOpen(group, true);
  };

  const renderRow = (row: Row) => {
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
    const sub = row.item && renderSub ? renderSub(row.item, isActive) : null;
    return (
      <Fragment key={row.key}>
        <TreeRow {...props} />
        {sub ? <div className='pt-sub'>{sub}</div> : null}
      </Fragment>
    );
  };

  /* a group: the header, then its rows as the section's own children (no
     wrapper, so the list stays under its node budget), then its child group */
  const renderGroup = (group: Group, child = false): ReactNode => {
    const rows = visibleRows(group);
    const sub = group.sub && visibleRows(group.sub).length > 0 ? group.sub : null;
    if (rows.length === 0 && !sub) return null;
    const open = isOpen(group);
    return (
      <section
        className={cn('pt-grp', !open && 'is-closed', child && 'is-sub')}
        key={group.key}
        data-group={group.key}
      >
        <button
          type='button'
          className='pt-grp-head'
          aria-expanded={open}
          title={open ? `Collapse ${group.label}` : `Expand ${group.label}`}
          data-count={rows.length}
          data-site={group.site}
          onClick={() => setOpen(group, !open)}
        >
          <Icon name='chevron-down' />
          {group.icon ? <Icon name={group.icon} /> : null}
          <span className='pt-grp-name'>{group.label}</span>
        </button>
        {open ? rows.map(renderRow) : null}
        {open && sub ? renderGroup(sub, true) : null}
      </section>
    );
  };

  const rendered = groups.map((group) => renderGroup(group)).filter((node) => node !== null);
  const gallery = id === 'gallery';
  const markNode = mark === 'gt' ? <GtMark /> : <PtMark />;
  /* the name beside the mark: the old nameplate on every Prototemplate route
     (Kevin's directive; DESIGN.md, chrome exceptions), `proto` in Fraunces
     and `template` in Space Grotesk, with the two font variables on the
     span itself so they resolve on /docs and /brand as on /; the deck keeps
     its Inter title beside the GT mark. The aside is still named by the
     route's title. */
  const nameNode =
    mark === 'pt' ? (
      <span className={cn('pt-brand-word', brandFontVariables)}>
        <b className='pt-face-serif'>proto</b>
        <b className='pt-face-grot'>template</b>
      </span>
    ) : (
      <b>{title}</b>
    );

  return (
    <aside
      className={cn('pt-sb', hidden && 'is-hidden', overlay && 'is-overlay')}
      aria-label={title}
      aria-hidden={hidden || undefined}
    >
      <div className='pt-sb-head'>
        {gallery ? (
          <span className='pt-sb-mark pt-mark-host'>{markNode}</span>
        ) : (
          <Link
            className='pt-sb-mark pt-mark-host'
            href='/'
            title='Back to the gallery'
            aria-label='Back to the gallery'
          >
            {markNode}
          </Link>
        )}
        {nameNode}
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
