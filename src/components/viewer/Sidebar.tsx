'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { KeyboardEvent, MouseEvent, PointerEvent, ReactElement, ReactNode, RefObject } from 'react';
import { Fragment, memo, useCallback, useMemo, useRef, useState } from 'react';

import { brandFontVariables } from '@/lib/brand-fonts';
import { cn } from '@/lib/cn';
import type { ShellDensity, ShellItem, ShellMark, ShellSection, ShellShot, ShellSubRow, ShellThumb } from '@/lib/shell-data';
import { previewId } from '@/lib/shell-data';
import { isExternalSurface, surfaceGroups } from '@/lib/surfaces';
import type { Surface, SurfaceGroup, SurfaceSite } from '@/lib/surfaces';
import { useLayoutWork } from '@/lib/use-layout-work';
import { useMountEffect } from '@/lib/use-mount-effect';

import { GtMark } from './GtMark';
import { Icon } from './icons';
import type { IconName } from './icons';
import { activateOnKey, ListRow, pressWithoutFocus } from './ListRow';
import { PREVIEW_DELAY_MS } from './PreviewLayer';
import { PtMark } from './PtMark';
import { Seg } from './Seg';
import type { SegOption } from './Seg';
import { usePtShell } from './shell-context';
import { SidebarFilter as FilterRow } from './SidebarFilter';
import { createSidebarRails } from './SidebarRails';
import { ThumbShot } from './ThumbShot';
import { ToolButton } from './ToolButton';

import './Sidebar.css';

/**
 * The headings a route hangs under the active item of a run, as data, so
 * the list draws every route's deep rows with one markup: the h3s of the
 * brand section being read, the headings of the open document on /docs,
 * the sections of a film's package. Null for none.
 */
export type SubRows = (item: ShellItem, active: boolean) => readonly ShellSubRow[] | null;

/** What ViewerShell reads from the filter for the Escape ladder: whether it holds text, and how to clear it. */
export type SidebarFilter = { active: boolean; clear: () => void };

/** The site map groups, in the one order every route keeps (decision 7; Knowledge then Shipped after Pages, directive 8.10). */
const NAV_GROUPS: readonly SurfaceGroup[] = ['Pages', 'Knowledge', 'Shipped', 'Documents', 'Sites', 'Explorations', 'Archive'];

/** The Shipped group's folded child: the live surfaces of the shipped site (directive 8.10). */
const LIVE_KEY = 'Shipped:live';
const LIVE_LABEL = 'Live site';

/** Groups folded on a first visit: only the live surfaces, whose header names them; every top-level group is open. */
const CLOSED_BY_DEFAULT: readonly string[] = [LIVE_KEY];

/**
 * Where the reader's folds live: one site-wide key holding a JSON map of
 * group key to open or closed, so a group folded on one route stays folded
 * on the next. The per-route keys an earlier version wrote
 * (gt-shell-sections:<id>) are ignored.
 */
const STORAGE_KEY = 'gt-shell-groups';

/** What the arrow keys walk, in document order: headers, page rows, a run's labels and rows, the deep rows. */
const WALK = '.pt-grp-head, .pt-orow, .pt-nest-head, .pt-nrow';

/** A run longer than this opens only the labelled group holding the active item (the graphics' 99 images); a shorter run opens every group. */
const RUN_OPEN_MAX = 40;

/** the distance a followed row keeps from the list's edges */
const FOLLOW_MARGIN = 8;

/**
 * The path a keyboard activation of a row is heading for (Enter on the
 * link), or null. Every row is a link that remounts the shell on the new
 * route, so the flag lives outside the component: the list on that page
 * puts focus back on its marked row once ready, and the arrow walk goes on
 * where a pointer click would have left the reader, instead of dropping to
 * the body and forcing a Tab back through the toolbar after every Enter.
 */
let pendingFocusPath: string | null = null;

/* queue-list for the outline (bars-3 would read as the toolbar's list toggle 60px away), photo for the shots */
const DENSITY_OPTIONS: readonly SegOption<ShellDensity>[] = [
  { value: 'outline', label: 'Outline', icon: 'queue-list', title: 'Outline' },
  { value: 'thumbs', label: 'Thumbnails', icon: 'photo', title: 'Thumbnails' },
];

/* ---- icons (directive 8.5) ---- */

/* The list's repeated glyphs as constant elements: React skips a child
   whose element is the one it rendered before, so a render of the list
   (a fold, a pick, the shell's boot) never re-renders the chevrons, the
   group glyphs or the head's mark. */
const CHEVRON = <Icon name='chevron-down' />;
const GLYPHS = new Map<IconName, ReactElement>();
function glyph(name: IconName): ReactElement {
  let el = GLYPHS.get(name);
  if (!el) {
    el = <Icon name={name} />;
    GLYPHS.set(name, el);
  }
  return el;
}
const MARK_NODES: Readonly<Record<ShellMark, ReactElement>> = { gt: <GtMark />, pt: <PtMark /> };

/** The filter row, memoized: its props are the query, stable handlers and the route's words. */
const FilterRowMemo = memo(FilterRow);

/* the Pages rows, by surface id */
const PAGE_ICON: Readonly<Record<string, IconName>> = {
  gallery: 'gallery',
  brand: 'swatch',
  docs: 'document',
  deck: 'deck',
  present: 'present',
  compare: 'compare',
  skills: 'skill',
  handbook: 'book',
  marks: 'swatch',
  motion: 'film',
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
  Knowledge: 'sparkles',
  Shipped: 'document',
  Documents: 'document',
  Explorations: 'explore',
  Archive: 'archive',
  Libraries: 'cube',
};

/* the icon a route's own section gives its items at the top level, by
   section id; a run's rows draw their number in the icon's slot instead */
const SECTION_ICON: Readonly<Partial<Record<string, IconName>>> = {
  shipped: 'document',
  documents: 'document',
  explorations: 'explore',
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
  if (row.group === 'Pages' || row.group === 'Knowledge') return PAGE_ICON[row.id] ?? 'pages';
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
  /** the shorter name the tree shows: a child row's (`Enterprise` under `Dossier`), or a run row's when its title is a sentence (ShellItem.short) */
  short?: string;
  /** the route's own number, drawn in the icon's slot when the row stands in a run */
  n?: string;
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
  /** the page's run: its route sections, opened under this page row on the page's own routes (ShellSection.under) */
  subs?: readonly Group[];
};

type Group = {
  key: string;
  label: string;
  rows: readonly Row[];
  /** the header's own glyph and the color it draws: the Shipped group's check-badge (directive 8.10) */
  icon?: IconName;
  site?: SurfaceSite;
  /** folded child groups rendered after the rows: the Shipped group's live surfaces */
  subs?: readonly Group[];
  /** the group belongs to a page row's run (ShellSection.under) */
  nested?: boolean;
  /** the label a run shows when the section's label is a sentence (ShellSection.short) */
  short?: string;
  /** closed by default: a labelled group of a run longer than RUN_OPEN_MAX */
  closed?: boolean;
};

function fromItem(section: ShellSection, item: ShellItem): Row {
  const site = siteOfId(item.id);
  const preview = previewId(item);
  return {
    key: item.id,
    name: item.title,
    short: item.short,
    n: item.n || undefined,
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
    subs: live.length > 0 ? [{ key: LIVE_KEY, label: LIVE_LABEL, rows: live }] : undefined,
  };
}

/**
 * A site map group as the list shows it: Shipped with its child group, Sites
 * as a tree, the rest as rows. Knowledge drops its archive row, since the
 * Archive group below lists every retired version itself.
 */
function navGroup(group: SurfaceGroup, rows: readonly Row[]): Group {
  if (group === 'Shipped') return shippedGroup(group, rows);
  if (group === 'Sites') return { key: group, label: group, rows: nestSites(rows) };
  if (group === 'Knowledge') return { key: group, label: group, rows: rows.filter((row) => row.preview !== 'archive') };
  return { key: group, label: group, rows };
}

/**
 * The runs (ShellSection.under), keyed by the surface id of the page row
 * they open under, hung on the row with that preview id wherever it
 * stands. A section whose row is not in the list is left for the caller to
 * place at the top level.
 */
function hangUnderRows(groups: readonly Group[], nested: ReadonlyMap<string, readonly Group[]>): readonly Group[] {
  if (nested.size === 0) return groups;
  const hang = (group: Group): Group => ({
    ...group,
    rows: group.rows.map((row) => {
      const subs = nested.get(row.preview);
      return subs ? { ...row, subs } : row;
    }),
    subs: group.subs?.map(hang),
  });
  return groups.map(hang);
}

/** True when a row of the group, or of a group nested under one of its rows, has this preview id. */
function holdsPreview(groups: readonly Group[], preview: string): boolean {
  return allGroups(groups).some((group) => group.rows.some((row) => row.preview === preview));
}

/**
 * The groups in order. With the site map on, the seven groups run in the
 * one order every route keeps, a route section replacing the group of its
 * own name (Sites and Explorations on the gallery, Archive on an archived
 * version). A route section that names its page row (`under`) opens as a
 * run under that row, in the row's own group: the brand book's sections
 * under Brand, the documents under Docs (the Documents group then leaves
 * the top level on that route, its rows merged into the run), the marks
 * under Marks, the films under Motion, the images under Graphics, the
 * skills under Skills. A run longer than RUN_OPEN_MAX closes its labelled
 * groups by default. A route section that matches no group and names no
 * row present follows Pages, since the route is a page. Without the site
 * map the route's sections are the whole list.
 */
function buildGroups(sections: readonly ShellSection[], siteMap: boolean): readonly Group[] {
  const own = (section: ShellSection, rows?: readonly Row[]): Group => ({
    key: section.id,
    label: section.label,
    short: section.short,
    rows: rows ?? section.items.map((item) => fromItem(section, item)),
  });
  if (!siteMap) return sections.map((section) => own(section));
  const navRows = new Map(surfaceGroups('site').map((entry) => [entry.group, entry.rows]));
  /* the site map group a section stands for, by its id (`documents`) */
  const groupOf = (section: ShellSection) => NAV_GROUPS.find((group) => group.toLowerCase() === section.id);
  const hung = sections.filter((section) => section.under);
  const matched = new Set<string>();
  const out: Group[] = [];
  for (const group of NAV_GROUPS) {
    /* a group a run has taken (the documents under Docs) leaves the top level */
    if (hung.some((section) => groupOf(section) === group)) continue;
    const section = sections.find((entry) => !entry.under && entry.id === group.toLowerCase());
    const nav = navRows.get(group) ?? [];
    if (section) {
      matched.add(section.id);
      out.push(navGroup(group, merge(section, nav)));
    } else if (nav.length > 0) {
      out.push(navGroup(group, nav.map(fromNav)));
    }
  }
  /* the runs, by the surface id of the page row they open under */
  const runs = new Map<string, Group[]>();
  for (const section of hung) {
    const under = section.under ?? '';
    if (!holdsPreview(out, under)) continue;
    matched.add(section.id);
    const group = groupOf(section);
    const rows = group ? merge(section, navRows.get(group) ?? []) : undefined;
    runs.set(under, [...(runs.get(under) ?? []), { ...own(section, rows), nested: true }]);
  }
  for (const [under, run] of runs) {
    const total = run.reduce((n, group) => n + group.rows.length, 0);
    if (total > RUN_OPEN_MAX) runs.set(under, run.map((group) => ({ ...group, closed: true })));
  }
  const withRuns = hangUnderRows(out, runs);
  /* a section that names no group and no row present stands after Pages, as before */
  const rest = sections.filter((entry) => !matched.has(entry.id)).map((entry) => own(entry));
  const pages = withRuns.findIndex((group) => group.key === 'Pages');
  return pages < 0 ? [...withRuns, ...rest] : [...withRuns.slice(0, pages + 1), ...rest, ...withRuns.slice(pages + 1)];
}

/** Every group, every child group and every group nested under a row, flat and in document order, for lookups by key. */
function allGroups(groups: readonly Group[]): readonly Group[] {
  return groups.flatMap((group) => [
    group,
    ...group.rows.flatMap((row) => (row.subs ? allGroups(row.subs) : [])),
    ...(group.subs ? allGroups(group.subs) : []),
  ]);
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
 * The one row that names the page the reader is on, site map row or route
 * item alike: of the rows whose path covers the pathname, the longest, so
 * on /d/production/enterprise the Enterprise row is current and not the
 * Home row above it as well, and on /skills/<slug> the skill's own row and
 * not the Skills row it hangs under. Rows that leave the site never are.
 */
function currentKey(groups: readonly Group[], pathname: string): string | null {
  let best: Row | null = null;
  for (const group of allGroups(groups)) {
    for (const row of group.rows) {
      if (row.external) continue;
      const path = pathOf(row.href);
      if (!covers(path, pathname)) continue;
      if (!best || path.length > pathOf(best.href).length) best = row;
    }
  }
  return best?.key ?? null;
}

/**
 * True for a page row the reader is inside: it hangs route sections under
 * it (the Skills row) and its path covers the pathname, so on
 * /skills/<slug> the Skills row is marked with the skill's own row.
 */
function isParentPage(row: Row, pathname: string): boolean {
  return Boolean(row.subs) && !row.external && covers(pathOf(row.href), pathname);
}

/** The widest number in a run, 2 or 3 characters; the run's number column is sized from it (data-n). */
function runDigits(run: readonly Group[]): 2 | 3 {
  const widest = Math.max(0, ...run.flatMap((group) => group.rows.map((row) => row.n?.length ?? 0)));
  return widest > 2 ? 3 : 2;
}

/** A run shows labels when two or more of its groups hold more than one row (Films and Translation series); a group of one row is that row. */
function isLabelled(run: readonly Group[]): boolean {
  return run.filter((group) => group.rows.length > 1).length >= 2;
}

/** Where a row sits: its top-level group, the page row whose run holds it, the label it opens under. */
type Place = { top: Group; row: Row; page?: Row; label?: Group };

/** Where every row sits: its top-level group, the page row whose run holds it, the label it opens under. */
function placesOf(groups: readonly Group[]): ReadonlyMap<string, Place> {
  const out = new Map<string, Place>();
  for (const top of groups) {
    const add = (rows: readonly Row[], page?: Row, label?: Group) => {
      for (const row of rows) {
        if (!out.has(row.key)) out.set(row.key, { top, row, page, label });
        if (!row.subs) continue;
        const labelled = isLabelled(row.subs);
        for (const sub of row.subs) add(sub.rows, row, labelled && sub.rows.length > 1 ? sub : undefined);
      }
    };
    add(top.rows);
    for (const sub of top.subs ?? []) add(sub.rows, undefined, sub);
  }
  return out;
}

/** An element id from a key: `nav:brand` becomes `pt-row-nav-brand`. */
function domId(prefix: string, key: string): string {
  return `${prefix}-${key.replace(/[^\w-]/g, '-')}`;
}

/**
 * aria-current, one per set. The row of the page the reader is on is
 * "page": the current row whose own path is the pathname (Brand on
 * /brand, never a section of it; the skill on /skills/<slug>). A page row
 * the reader is inside is "true" in the top level (Skills on
 * /skills/<slug>). The active item is "true" in its run.
 */
function ariaCurrent(row: Row, active: boolean, current: string | null, pathname: string): 'page' | 'true' | undefined {
  if (row.external) return undefined;
  if (row.key === current) return pathOf(row.href) === pathname ? 'page' : 'true';
  if (isParentPage(row, pathname)) return 'true';
  return active ? 'true' : undefined;
}

/**
 * True for a row whose click the browser or the router answers, never the
 * shell: a site map row, a row that leaves the site, or a route item whose
 * href names a page other than the one the reader is on and that does not
 * ask to be selected in place (ShellItem.inPlace). An item with no href, an
 * in-place item, or the item of the page itself is selected by the shell.
 */
function navigates(row: Row, pathname: string): boolean {
  if (!row.item || row.external) return true;
  if (row.item.inPlace || !row.item.href) return false;
  return pathOf(row.href) !== pathname;
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
 * sections are built the way the sidebar builds its groups (the groups
 * nested under a page row included), so the two agree on what Shipped and
 * Sites hold. A pick follows the sidebar's rule: an item of this page, or
 * one asking to be selected in place, is selected; every other item and
 * every site map row opens its page through the router. The grid draws
 * tiles only: the headings the list hangs under an item have no book to
 * scroll here.
 */
export function ThumbList({ sections, thumb, density, siteMap = false, onSelect, className }: ThumbListProps) {
  const shell = usePtShell();
  const router = useRouter();
  const pathname = usePathname();
  const pick = onSelect ?? shell.select;
  const frames = density === 'thumbs' && thumb !== 'row';

  type Block = { key: string; label: string; entries: readonly { item: ShellItem; own: boolean }[] };
  const blocks: readonly Block[] = siteMap
    ? allGroups(buildGroups(sections, true))
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
    const { item } = entry;
    const inPlace = entry.own && (item.inPlace || !item.href || pathOf(item.href) === pathname);
    if (inPlace) {
      pick(item.id);
      return;
    }
    if (item.url) window.open(item.url, '_blank', 'noopener,noreferrer');
    else if (item.href) router.push(item.href);
  };

  return (
    <div className={cn('pt-thumbs', !frames && 'is-rows', className)}>
      {blocks.map((block) => (
        <Fragment key={block.key}>
          <div className='pt-sec-label'>{block.label}</div>
          {block.entries.map((entry) => {
            const { item } = entry;
            const active = entry.own && item.id === shell.active;
            return frames ? (
              <ThumbItem key={item.id} item={item} active={active} onSelect={() => open(entry)} />
            ) : (
              <ListRow key={item.id} item={item} active={active} onSelect={() => open(entry)} />
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
  /** the row names the page the reader is on, or the page row the reader is inside, while an item carries the bar */
  current: boolean;
  /** the row's click is answered by the router or the browser (a link), not by the shell's select */
  link: boolean;
  /** thumbnail density: the 64x36 capture and the address */
  shots: boolean;
  /** a plain click or Space (null) picks the row; a modified click keeps the browser's meaning */
  onPick: (row: Row, event: MouseEvent<HTMLElement> | null) => void;
  follow?: (el: HTMLElement | null) => void;
  /** `tree`: a top-level row with its icon; `run`: a row of a page's run, its number in the icon's slot */
  variant: 'tree' | 'run';
  /** the row owns a run: it keeps room at its right end for the fold */
  hasRun?: boolean;
  id: string;
  /** the element Left moves to: the run's label or page row */
  parent?: string;
  /** the row's aria-current, decided once per set (ariaCurrent) */
  aria: 'page' | 'true' | undefined;
  /** the rail's level the row joins (data-rail): 0 a tree row, 1 a run row or a child row, 2 a deep row */
  rail: 0 | 1 | 2;
  /** the row is the rail's mark: the one place the list shows as current (data-mark) */
  mark: boolean;
};

/**
 * The link attributes every row shares. The title carries the full name
 * and the description, since a name may be a short form of the title.
 * aria-current comes from ariaCurrent, so a reader never hears two pages
 * announced as the current one.
 */
function linkAttrs(row: Row, aria: 'page' | 'true' | undefined) {
  return {
    href: row.href,
    title: row.desc === row.name ? row.name : `${row.name}. ${row.desc}`,
    'data-preview': row.preview,
    'data-site': row.site,
    'aria-current': aria,
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
 * A 28px row in two variants. A tree row (`.pt-orow`) is a site map row or
 * a route item at the top level: the Heroicon, a direct child so a row is
 * four nodes and the list stays under its DOM budget, in a 16px column
 * under the header's label (a site's icon on its --pt-site-* token through
 * data-site), the name, a route's short mark at the right end when it sets
 * one (the pane letter on /compare), and in thumbnail density the 64x36
 * capture on the left with the address on a second line, 44px tall. A
 * child row (a site's enterprise page) is indented one level under the row
 * before it and shows its short name. A page row that owns a run keeps
 * 34px at its right end for the fold. A run row (`.pt-nrow`) is a row of a
 * page's run: three elements, the anchor, the route's number in the icon's
 * slot (aria-hidden; the accessible name is the title) and the name, which
 * wraps and is never cut; in thumbnail density the capture leads it. A
 * route item selected in place (no href of its own, an in-place item, or
 * the item of this page) is an anchor with its real href whose plain click
 * the shell answers (a modified click keeps the browser's meaning); every
 * other row, a site map row or an item whose page is elsewhere, is a link
 * to its page (`link`), with prefetch off: a list of two hundred rows must
 * not fetch every page that scrolls into view; its route is prefetched on
 * intent by the list (P6). The row joins the group's rail at its level
 * (data-rail) and carries data-mark when the rail marks it. Memoized: the
 * list builds its rows once per section set, so a row renders only when
 * its own state changes.
 */
const TreeRow = memo(function TreeRow({
  row,
  active,
  current,
  link,
  shots,
  onPick,
  follow,
  variant,
  hasRun,
  id,
  parent,
  aria,
  rail,
  mark,
}: RowProps) {
  const className =
    variant === 'run'
      ? cn('pt-nrow', active && 'is-active', current && 'is-current')
      : cn(
          'pt-orow',
          active && 'is-active',
          current && 'is-current',
          row.external && 'is-external',
          row.child && 'is-child',
          hasRun && 'has-run'
        );
  const attrs = { ...linkAttrs(row, aria), id, 'data-parent': parent, 'data-rail': rail, 'data-mark': mark || undefined };
  const body =
    variant === 'run' ? (
      <>
        {shots ? <Mini row={row} /> : null}
        <span className='pt-nrow-n' aria-hidden='true'>
          {row.n ?? ''}
        </span>
        <span className='pt-nrow-name'>{row.short ?? row.name}</span>
      </>
    ) : (
      <>
        {shots ? <Mini row={row} /> : null}
        <Icon name={row.icon} />
        <span className='pt-orow-name'>{row.short ?? row.name}</span>
        {row.item?.mark ? <span className='pt-orow-mark'>{row.item.mark}</span> : null}
        {shots ? <span className='pt-orow-addr'>{row.address}</span> : null}
      </>
    );
  if (link && !row.external) {
    return (
      <Link
        className={className}
        {...attrs}
        data-navigates=''
        prefetch={false}
        onClick={(event) => onPick(row, event)}
        ref={follow}
      >
        {body}
      </Link>
    );
  }
  return (
    <a
      className={className}
      {...attrs}
      onMouseDown={link ? undefined : pressWithoutFocus}
      onClick={(event) => onPick(row, event)}
      onKeyDown={link ? undefined : (event) => onRowSpace(event, () => onPick(row, null))}
      ref={follow}
    >
      {body}
    </a>
  );
});

type DeepRowProps = {
  sub: ShellSubRow;
  parent: string;
  mark: boolean;
  /** the list's one stable handler: it runs the latest onSelect of the heading with this id, then closes the narrow overlay */
  onAct: (id: string) => void;
};

/** True when a deep row would draw the same: its heading's data, its parent and its mark (the handler is the list's stable one). */
function sameDeepRow(a: DeepRowProps, b: DeepRowProps): boolean {
  return (
    a.sub.id === b.sub.id &&
    a.sub.title === b.sub.title &&
    a.sub.href === b.sub.href &&
    a.sub.active === b.sub.active &&
    a.parent === b.parent &&
    a.mark === b.mark &&
    a.onAct === b.onAct
  );
}

/**
 * A heading under the active item: a link to its place whose plain click
 * the route answers; a modified click keeps the browser's meaning. It joins
 * the rail at level 2, and carries the mark while it is the heading being
 * read. Memoized on what it draws: a route builds its headings afresh on
 * every heading change, and only the two rows whose state changed render.
 */
const DeepRow = memo(function DeepRow({ sub, parent, mark, onAct }: DeepRowProps) {
  const act = () => onAct(sub.id);
  return (
    <a
      className='pt-nrow is-deep'
      href={sub.href}
      title={sub.title}
      data-parent={parent}
      data-rail={2}
      data-mark={mark || undefined}
      aria-current={sub.active ? 'true' : undefined}
      onMouseDown={pressWithoutFocus}
      onClick={(event) => {
        if (isModified(event)) return;
        event.preventDefault();
        act();
      }}
      onKeyDown={(event) => onRowSpace(event, act)}
    >
      <span className='pt-nrow-name'>{sub.title}</span>
    </a>
  );
}, sameDeepRow);

/** A top-level group's rail: the line, and the track holding the pointer's thumb and the marked row's. React renders them once; SidebarRails writes their styles. */
const Rail = memo(function Rail() {
  return (
    <>
      <div className='pt-sb-rail' aria-hidden='true' />
      <div className='pt-sb-track' aria-hidden='true'>
        <i className='pt-sb-thumb is-hover' />
        <i className='pt-sb-thumb is-current' />
      </div>
    </>
  );
});

/** The two grounds under the rows: the pointer's and the marked row's. */
const Pills = memo(function Pills() {
  return (
    <>
      <i className='pt-sb-pill is-hover' aria-hidden='true' />
      <i className='pt-sb-pill is-current' aria-hidden='true' />
    </>
  );
});

/** Creates the rail layer once the list is laid out, before paint, and destroys it on unmount. */
const RailsLayer = memo(function RailsLayer({ list }: { list: RefObject<HTMLElement | null> }) {
  useLayoutWork(
    () => {
      const el = list.current;
      const rails = el ? createSidebarRails(el) : null;
      return () => rails?.destroy();
    },
    { dependencies: [] }
  );
  return null;
});

export type SidebarProps = {
  title: string;
  mark: ShellMark;
  /** `52 slides`, `17 directions`; already worded by the route. */
  count: string;
  sections: readonly ShellSection[];
  thumb: ShellThumb;
  /** the headings the route hangs under the active item of a run */
  subRows?: SubRows;
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
 * is open on a first visit; the reader's own folds persist site-wide under
 * gt-shell-groups. Shipped (directive 8.10) carries the check-badge on its
 * header, its pages as document rows, and the eight live surfaces folded
 * under a `Live site` child header. Sites holds each site's home on its
 * colored icon with its enterprise page as an indented child row.
 *
 * A page's sections open under its row (ShellSection.under), on the page's
 * own routes, as a run: flush under the row, each run row with the route's
 * number in the icon's slot and a name that wraps (two lines at most for
 * the data the routes give, never cut). When two or more of the page's
 * sections hold more than one row, each gets a label with a chevron and a
 * count inside the run; a section of one row is that row. A run of 40 rows
 * or fewer opens every label; past 40 only the label holding the active
 * item opens. The headings of the item being read (SubRows) hang under it
 * as a deep run, in the list mode only.
 *
 * The rail marks the place (DESIGN.md section 16). In outline density each
 * top-level group carries one rail (<Rail>, drawn by SidebarRails.ts): a
 * 1px row-role line masked down the group's rows at each row's level
 * (data-rail: 0 the tree, 1 a run and a child row, 2 the deep run), bending
 * 45 degrees where the level changes. The marked row (data-mark: the deep
 * heading being read, else the active item, else the current page's row,
 * else the page row the reader is inside) carries the 2px ink thumb on the
 * rail and the current pill; the row under the pointer or keyboard focus
 * the pointer's thumb and pill (<Pills>). A plain click moves both marks
 * at once and the row reads as current before the page arrives. Thumbnail
 * density has no rail: each run keeps its guide and the active row its
 * 2px bar. A chevron at
 * the right end of the page row folds the run for the visit. Off its own
 * routes a page row is a plain link. In thumbnail density every row is
 * 44px with its 64x36 capture (or the plate with its initial) and the
 * address on a second line.
 *
 * Every row is a link to a page. A site map row, and a route item whose
 * href names a page other than this one, navigate through the router; the
 * shell selects in place only an item with no address of its own, an item
 * asking for it (ShellItem.inPlace, the documents on /docs) or the item of
 * the page itself. So no row scrolls the gallery: a direction opens its
 * page, a skill its own. The row that names the page the reader is on is
 * always marked, whether it is a site map row or a route item: it carries
 * the rail's thumb and ink text while no item is marked, and ink text
 * otherwise, as does the page row the reader is inside (Skills on
 * /skills/<slug>). The list scrolls to the marked row, alone, when it is
 * out of view; a deep link's first follow centers it. Every row carries
 * data-preview for the one preview layer (directive 8.6); the list draws no
 * preview of its own. Typing in the filter narrows every group and opens
 * them and every run; Enter opens the first match; Escape clears; Down
 * moves into the list; the arrows walk headers, rows, run labels and deep
 * rows, Home and End reach the ends, Left and Right fold and unfold a
 * header, a run or a label and move between parent and child. Exactly one
 * row is aria-current="page"; a run and a deep run are role="group", each
 * with at most one current element. At or below 900px an open list is an
 * overlay with a close button, and a pick closes it.
 */
export function Sidebar({
  title,
  mark,
  count,
  sections,
  thumb,
  subRows,
  siteMap = false,
  closedGroups = CLOSED_BY_DEFAULT,
  filter,
  onCurrentPage,
}: SidebarProps) {
  const shell = usePtShell();
  const router = useRouter();
  const pathname = usePathname();
  const { id, density, present, narrow, sidebarOpen, sidebarShown, active, select, setSidebar, setDensity, mode } = shell;
  /* the shell's landing flag; a state assembled elsewhere (DirectionCorner) leaves it out and is ready at once */
  const ready = shell.ready ?? true;

  const [query, setQuery] = useState('');
  /* per group, open or closed, where the reader has changed the default; persisted site-wide */
  const [overrides, setOverrides] = useState<ReadonlyMap<string, boolean>>(() => new Map());
  /* the runs the reader folded on this visit, and the folds of a labelled
     group holding the active item; neither is persisted, so a run opens
     again on the page's next visit */
  const [visitFolds, setVisitFolds] = useState<ReadonlySet<string>>(() => new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLElement>(null);
  const readyRef = useRef(ready);
  readyRef.current = ready;
  /* one stable ref callback: React calls it only when the current row mounts or changes */
  const [follow] = useState(() => makeFollow(listRef, readyRef));

  /* the groups and their indexes are built once per section set, never per
     render, so every Row keeps its identity and a memoized row whose state
     did not change skips its render (a fold renders the rows it adds or
     removes, a pick the rows whose state changed) */
  const groups = useMemo(() => buildGroups(sections, siteMap), [sections, siteMap]);
  const flat = useMemo(() => allGroups(groups), [groups]);
  /* every row by its element id, for the keys: a page row's run and a label's parent */
  const allRows = useMemo(
    () => new Map(flat.flatMap((group) => group.rows.map((row) => [domId('pt-row', row.key), row] as const))),
    [flat]
  );
  const q = query.trim().toLowerCase();
  const filtering = q.length > 0;
  const current = useMemo(() => currentKey(groups, pathname), [groups, pathname]);
  /* an item marked by the shell is the active row; while none is (the
     gallery at its top, a direction page) the current page's row is */
  const hasActiveItem = useMemo(() => flat.some((group) => group.rows.some((row) => row.item?.id === active)), [flat, active]);
  const places = useMemo(() => placesOf(groups), [groups]);

  /* in the DOM while the shell says so: sidebarShown lags a close by the
     sidebar duration so the content can fade while the column narrows
     (directive 7.4); a state without it (DirectionCorner) follows the toggle */
  const hidden = !(sidebarShown ?? (sidebarOpen && !present));
  const overlay = narrow && !hidden;
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
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setOverrides(new Map(Object.entries(JSON.parse(saved) as Record<string, boolean>)));
    } catch {
      // private mode or a stale value: the defaults hold
    }
  });

  /* the landing: the row the server marked mounted before the shell was
     ready, so its ref callback did nothing; once ready, the current row is
     brought into view if it is not. A landing that a keyboard activation
     asked for (pendingFocusPath names this page) puts focus back on the
     marked row, the current page's row failing that, so the arrow walk
     goes on from the list of the new page. */
  useLayoutWork(
    () => {
      if (!ready) return;
      const list = listRef.current;
      const row = list?.querySelector<HTMLElement>('.is-active[data-preview]');
      if (row) follow(row);
      if (pendingFocusPath === null) return;
      const wanted = pendingFocusPath === pathname;
      pendingFocusPath = null;
      if (!wanted) return;
      (row ?? list?.querySelector<HTMLElement>('.is-current[data-preview]'))?.focus({ preventScroll: true });
    },
    { dependencies: [ready, pathname] }
  );

  /* the group holds the marked item or the current page's row, in its own rows or a group nested under one */
  const holdsCurrent = (group: Group): boolean =>
    group.rows.some(
      (row) =>
        row.item?.id === active ||
        row.key === current ||
        (row.subs?.some(holdsCurrent) ?? false)
    );

  /* closed until the reader opens it: the live surfaces, and a labelled group of a run past RUN_OPEN_MAX */
  const closedByDefault = (group: Group) => Boolean(group.closed) || closedGroups.includes(group.key);

  const foldForVisit = (key: string, folded: boolean) => {
    const next = new Set(visitFolds);
    if (folded) next.add(key);
    else next.delete(key);
    setVisitFolds(next);
  };

  /* a page's run is open on the page's own routes unless folded this visit */
  const runOpen = (row: Row) => filtering || !visitFolds.has(row.key);

  /* a labelled group holding the active item always opens on arrival, and the reader's fold of it lasts the visit */
  const isOpen = (group: Group) => {
    if (filtering) return true;
    if (group.nested && holdsCurrent(group)) return !visitFolds.has(group.key);
    return overrides.get(group.key) ?? (holdsCurrent(group) || !closedByDefault(group));
  };

  const setOpen = (group: Group, open: boolean) => {
    if (group.nested && holdsCurrent(group)) {
      foldForVisit(group.key, !open);
      return;
    }
    const next = new Map(overrides);
    next.set(group.key, open);
    setOverrides(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(next)));
    } catch {
      // private mode: the state holds for the session
    }
  };

  /* an item of this page, or one asking for it: the shell selects it; every
     other row is a link and navigates, unless it names this route, whose
     own handler runs instead. The rows get one stable handler that reads
     the latest closure through a ref, so a memoized row never renders for
     a new function. */
  const pickNow = (row: Row, event: MouseEvent<HTMLElement> | null) => {
    if (event && isModified(event)) return;
    if (!navigates(row, pathname) && row.item) {
      event?.preventDefault();
      select(row.item.id);
      if (narrow) setSidebar(false);
      return;
    }
    if (!row.external && row.key === current && onCurrentPage && pathOf(row.href) === pathname) {
      event?.preventDefault();
      onCurrentPage();
    } else if (!row.external && event?.detail === 0) {
      /* Enter on the link (a keyboard click has no detail count): the list on the new page takes focus back */
      pendingFocusPath = pathOf(row.href);
    }
    if (narrow) setSidebar(false);
  };
  const pickRef = useRef(pickNow);
  pickRef.current = pickNow;
  const onPick = useCallback((row: Row, event: MouseEvent<HTMLElement> | null) => pickRef.current(row, event), []);

  /* the deep rows' one stable handler: the heading's latest onSelect (the
     route builds its headings afresh on every render, this render records
     them), then the narrow overlay closes */
  const narrowRef = useRef(narrow);
  narrowRef.current = narrow;
  const setSidebarRef = useRef(setSidebar);
  setSidebarRef.current = setSidebar;
  const deepSubs = useRef(new Map<string, ShellSubRow>());
  deepSubs.current = new Map();
  const onDeepAct = useCallback((id: string) => {
    deepSubs.current.get(id)?.onSelect();
    if (narrowRef.current) setSidebarRef.current(false);
  }, []);
  /* the density control's stable handler, so the memoized control skips the shell's renders */
  const densityRef = useRef(setDensity);
  densityRef.current = setDensity;
  const onDensity = useCallback((next: ShellDensity) => densityRef.current(next), []);

  /* prefetch on intent: prefetch={false} on the rows also turns off Link's
     hover prefetch (next 16.2, client/app-dir/link.js onMouseEnter), so the
     list prefetches a navigating row's route itself: after the pointer
     rests on it for the preview delay, or on keyboard focus; once per path.
     Never on pointer down: the click's own navigation starts a few ms
     later, so a prefetch there races it, fetches the route twice and
     renders the arriving page twice. A press cancels a pending dwell for
     the same reason. */
  const prefetched = useRef(new Set<string>());
  const intentTimer = useRef(0);
  const intentPath = (target: EventTarget | null): string | null => {
    const a = target instanceof Element ? target.closest<HTMLAnchorElement>('a[data-navigates]') : null;
    const href = a?.getAttribute('href') ?? '';
    if (!href.startsWith('/')) return null;
    const path = pathOf(href);
    return path === pathname || prefetched.current.has(path) ? null : path;
  };
  const prefetchNow = (path: string | null) => {
    if (!path) return;
    prefetched.current.add(path);
    router.prefetch(path);
  };
  const onIntentOver = (event: PointerEvent<HTMLElement>) => {
    window.clearTimeout(intentTimer.current);
    if (event.pointerType === 'touch') return;
    const path = intentPath(event.target);
    if (path) intentTimer.current = window.setTimeout(() => prefetchNow(path), PREVIEW_DELAY_MS);
  };
  useMountEffect(() => () => window.clearTimeout(intentTimer.current));

  /* the rows the filter matches by their own text */
  const matchingRows = (group: Group): readonly Row[] =>
    filtering ? group.rows.filter((row) => matches(row, q)) : group.rows;

  /* the group has something to show: a row of its own, or one in a group nested under a row */
  const hasVisible = (group: Group): boolean =>
    visibleRows(group).length > 0 || (group.subs?.some(hasVisible) ?? false);

  /* the rows the list shows: the matches, and a page row kept for the matches nested under it (the Skills row while a skill matches) */
  const visibleRows = (group: Group): readonly Row[] =>
    filtering ? group.rows.filter((row) => matches(row, q) || (row.subs?.some(hasVisible) ?? false)) : group.rows;

  /* the row the list shows, by the same folds and filter the render uses */
  const shown = (key: string | null | undefined): key is string => {
    const place = key ? places.get(key) : undefined;
    if (!place) return false;
    if (filtering) return matches(place.row, q) || (place.row.subs?.some(hasVisible) ?? false);
    return isOpen(place.top) && (!place.page || runOpen(place.page)) && (!place.label || isOpen(place.label));
  };
  /* the rail's mark, one row or none: the deep heading being read when the
     deep run shows, else the active item's row, else the current page's
     row, else the page row the reader is inside */
  const allFlatRows = flat.flatMap((group) => group.rows);
  const activeRow = active ? allFlatRows.find((row) => row.item?.id === active) : undefined;
  const deepMark =
    activeRow?.item && subRows && mode !== 'grid' && shown(activeRow.key)
      ? (subRows(activeRow.item, true)?.find((sub) => sub.active)?.id ?? null)
      : null;
  const parentRow = allFlatRows.find((row) => isParentPage(row, pathname));
  const markKey = deepMark ? null : ([activeRow?.key, current, parentRow?.key].find(shown) ?? null);

  /* the first thing the filter matches by its own text, opened the way its row would be: selected in place, or navigated to */
  const firstMatch = (): (() => void) | null => {
    for (const group of flat) {
      const row = matchingRows(group)[0];
      if (!row) continue;
      const item = row.item;
      if (item && !navigates(row, pathname)) {
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

  const filterKeyNow = (event: KeyboardEvent<HTMLInputElement>) => {
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

  const filterKeyRef = useRef(filterKeyNow);
  filterKeyRef.current = filterKeyNow;
  const onFilterKey = useCallback((event: KeyboardEvent<HTMLInputElement>) => filterKeyRef.current(event), []);

  /* the arrows walk headers, page rows, run labels, run rows and deep rows
     in document order; Up from the first returns to the filter; Home and
     End reach the first and last. Left and Right fold and unfold: a page
     row's run, a run label, a header; Right enters what is open, Left
     returns to the parent (data-parent: the label or the page row for a run
     row, the page row for a label, the run row for a deep row) */
  const onListKey = (event: KeyboardEvent<HTMLElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const { key } = event;
    if (key === 'Home' || key === 'End') {
      const rows = walk();
      const to = key === 'Home' ? rows[0] : rows[rows.length - 1];
      if (to) {
        event.preventDefault();
        to.focus();
      }
      return;
    }
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
    const next = () => {
      const rows = walk();
      rows[rows.indexOf(target) + 1]?.focus();
    };
    /* a page row that owns a run: its fold is the next sibling while the filter is empty */
    const runRow = target.classList.contains('has-run') ? allRows.get(target.id) : undefined;
    if (runRow) {
      event.preventDefault();
      const open = runOpen(runRow);
      if (key === 'ArrowRight') {
        if (open) next();
        else foldForVisit(runRow.key, false);
      } else if (open) {
        foldForVisit(runRow.key, true);
      } else {
        target.closest('.pt-grp')?.querySelector<HTMLElement>('.pt-grp-head')?.focus();
      }
      return;
    }
    /* a run label */
    if (target.classList.contains('pt-nest-head')) {
      const group = flat.find((entry) => entry.key === target.dataset.group);
      if (!group) return;
      event.preventDefault();
      const open = isOpen(group);
      if (key === 'ArrowRight') {
        if (open) next();
        else setOpen(group, true);
      } else if (open) {
        setOpen(group, false);
      } else {
        document.getElementById(target.dataset.parent ?? '')?.focus();
      }
      return;
    }
    /* a run row or a deep row: Right enters the deep run under it, Left returns to the parent */
    if (target.classList.contains('pt-nrow')) {
      event.preventDefault();
      if (key === 'ArrowRight') {
        if (target.nextElementSibling?.classList.contains('is-deep')) next();
      } else {
        document.getElementById(target.dataset.parent ?? '')?.focus();
      }
      return;
    }
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

  /* a row; the fold and the run when it owns one; the deep run under an active item */
  const renderRow = (
    row: Row,
    place: { variant: 'tree' | 'run'; parent?: string; child?: boolean } = { variant: 'tree' }
  ): ReactNode => {
    const isActive = row.item ? row.item.id === active : !hasActiveItem && row.key === current;
    const isCurrent = !isActive && (row.key === current || isParentPage(row, pathname));
    const run = row.subs?.filter(hasVisible) ?? [];
    const rowId = domId('pt-row', row.key);
    const runId = domId('pt-run', row.key);
    const open = runOpen(row);
    const deep = row.item && subRows && mode !== 'grid' ? subRows(row.item, isActive) : null;
    if (deep) for (const sub of deep) deepSubs.current.set(sub.id, sub);
    return (
      <Fragment key={row.key}>
        <TreeRow
          row={row}
          active={isActive}
          current={isCurrent}
          link={navigates(row, pathname)}
          shots={shots}
          onPick={onPick}
          follow={isActive ? follow : undefined}
          variant={place.variant}
          hasRun={run.length > 0 && !filtering}
          id={rowId}
          parent={place.parent}
          aria={ariaCurrent(row, isActive, current, pathname)}
          rail={place.variant === 'run' || place.child || row.child ? 1 : 0}
          mark={row.key === markKey}
        />
        {run.length > 0 && !filtering ? (
          <button
            type='button'
            className='pt-orow-fold'
            aria-expanded={open}
            aria-controls={open ? runId : undefined}
            aria-label={`Sections of ${row.name}`}
            title={open ? `Hide the sections of ${row.name}` : `Show the sections of ${row.name}`}
            onClick={() => foldForVisit(row.key, open)}
          >
            {CHEVRON}
          </button>
        ) : null}
        {run.length > 0 && open ? (
          <div className='pt-nest' id={runId} role='group' aria-labelledby={rowId} data-n={runDigits(run)} data-run={row.key}>
            {renderRun(run, rowId)}
          </div>
        ) : null}
        {deep && deep.length > 0 ? (
          <div className='pt-nest is-deep' role='group' aria-labelledby={rowId}>
            {deep.map((sub) => (
              <DeepRow key={sub.id} sub={sub} parent={rowId} mark={sub.id === deepMark} onAct={onDeepAct} />
            ))}
          </div>
        ) : null}
      </Fragment>
    );
  };

  /* a run: its groups' rows, each labelled group under its label when the run is labelled */
  const renderRun = (run: readonly Group[], pageId: string): ReactNode => {
    const labelled = isLabelled(run);
    return run.map((group) => {
      const rows = visibleRows(group);
      if (rows.length === 0) return null;
      if (!labelled || group.rows.length === 1) {
        return <Fragment key={group.key}>{rows.map((row) => renderRow(row, { variant: 'run', parent: pageId }))}</Fragment>;
      }
      const open = isOpen(group);
      const headId = domId('pt-head', group.key);
      const name = group.short ?? group.label;
      return (
        <Fragment key={group.key}>
          <button
            type='button'
            className='pt-nest-head'
            id={headId}
            aria-expanded={open}
            title={open ? `Collapse ${name}` : `Expand ${name}`}
            data-count={rows.length}
            data-group={group.key}
            data-parent={pageId}
            data-rail={1}
            onClick={() => setOpen(group, !open)}
          >
            {CHEVRON}
            <span>{name}</span>
          </button>
          {open ? rows.map((row) => renderRow(row, { variant: 'run', parent: headId })) : null}
        </Fragment>
      );
    });
  };

  /* a group: the header, then its rows as the section's own children (no
     wrapper, so the list stays under its node budget), then its child
     groups (the live surfaces under Shipped). A page's run renders under
     its row, in renderRow. */
  const renderGroup = (group: Group, child = false): ReactNode => {
    const rows = visibleRows(group);
    const subs = group.subs?.filter(hasVisible) ?? [];
    if (rows.length === 0 && subs.length === 0) return null;
    const open = isOpen(group);
    return (
      <section className={cn('pt-grp', !open && 'is-closed', child && 'is-sub')} key={group.key} data-group={group.key}>
        {!child && !shots ? <Rail /> : null}
        <button
          type='button'
          className='pt-grp-head'
          aria-expanded={open}
          title={open ? `Collapse ${group.label}` : `Expand ${group.label}`}
          data-count={rows.length}
          data-site={group.site}
          data-rail={child ? 0 : undefined}
          onClick={() => setOpen(group, !open)}
        >
          {CHEVRON}
          {group.icon ? glyph(group.icon) : null}
          <span className='pt-grp-name'>{group.label}</span>
        </button>
        {open ? rows.map((row) => renderRow(row, { variant: 'tree', child })) : null}
        {open ? subs.map((sub) => renderGroup(sub, true)) : null}
      </section>
    );
  };

  const rendered = groups.map((group) => renderGroup(group)).filter((node) => node !== null);
  const gallery = id === 'gallery';
  const markNode = MARK_NODES[mark];
  /* the mark, a link back to the gallery on every other route; memoized, so the list's renders skip it */
  const markLink = useMemo(
    () =>
      gallery ? (
        <span className='pt-sb-mark pt-mark-host'>{markNode}</span>
      ) : (
        <Link className='pt-sb-mark pt-mark-host' href='/' title='Back to the gallery' aria-label='Back to the gallery'>
          {markNode}
        </Link>
      ),
    [gallery, markNode]
  );
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
        {markLink}
        {nameNode}
        {thumb === 'row' ? null : (
          <Seg
            options={DENSITY_OPTIONS}
            value={density}
            onChange={onDensity}
            label='List density'
            iconOnly
            className='is-small'
          />
        )}
        {overlay ? (
          <ToolButton icon='close' title='Close the list (Esc)' onClick={() => setSidebar(false)} />
        ) : null}
      </div>
      <FilterRowMemo
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
        onPointerOver={onIntentOver}
        onPointerLeave={() => window.clearTimeout(intentTimer.current)}
        onPointerDown={() => window.clearTimeout(intentTimer.current)}
        onFocus={(event) => {
          /* keyboard focus only: a pointer press focuses the row too */
          if (event.target instanceof Element && event.target.matches(':focus-visible')) prefetchNow(intentPath(event.target));
        }}
      >
        {shots ? null : <Pills />}
        {rendered.length > 0 ? rendered : <p className='pt-sb-empty'>Nothing matches the filter.</p>}
      </nav>
      {shots ? null : <RailsLayer list={listRef} />}
    </aside>
  );
}
