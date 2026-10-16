'use client';

import { usePathname } from 'next/navigation';

import { useMountEffect } from '@/lib/use-mount-effect';

// Sidebar motion for the desktop sidebar (the drawer keeps static CSS rails
// and fumadocs' own markers; touch has no hover):
//
//  - Rails: fumadocs' TOC method. Each group of rows gets one absolutely
//    positioned div masked by an SVG path that runs down the rail, stepping
//    12px in per nesting level with a 45° bend between levels. Inside it two
//    full-width layers show only along the path: the blue thumb that marks
//    the current page, and a faint thumb that follows the pointer. Moving a
//    thumb transitions its top/height, so the blue slides along the line,
//    through the bends, to the row you pick.
//  - Pills: a soft pill glides under the pointer, and the current page's
//    tinted pill travels with the thumb and lands a shade stronger.
//  - Click: the thumb and the pill travel at once and the link reads as
//    current before the page arrives; they settle when navigation commits.
// Styles live in globals.css.

const VIEWPORT_SELECTOR = '#nd-sidebar [data-radix-scroll-area-viewport]';
const ROW_SELECTOR = 'a[href], button[type="button"]';
const PENDING_CLASS = 'docs-sb-pending';
// the rail sits 12px before the row text (globals.css ladder)
const RAIL_BEFORE_TEXT = 12;
// rows carry 6px of vertical padding; the line's per-row segment spans the
// text, and the 12px between rows is where a bend lives
const ROW_INSET_Y = 6;
const STROKE = 1.5;
const TRAVEL_MS = 300;

type RowGeometry = { x: number; top: number; bottom: number };
type Run = {
  rail: HTMLElement;
  thumb: HTMLElement;
  hoverThumb: HTMLElement;
  top: number;
  rows: Map<HTMLElement, RowGeometry>;
};

type State = { host: HTMLElement; viewport: HTMLElement; runs: Run[] };
let state: State | null = null;
let landingTimer: ReturnType<typeof setTimeout> | undefined;

function snap(el: HTMLElement, apply: () => void) {
  el.style.transition = 'none';
  apply();
  void el.offsetHeight;
  el.style.transition = '';
}

// rows in reading order under one group label; folders contribute their
// header and, when open, their children
function collectRows(node: Element, out: HTMLElement[]) {
  if (node.matches('a[href]')) {
    out.push(node as HTMLElement);
    return;
  }
  if (!node.matches('div[data-state]')) return;
  const header = node.querySelector<HTMLElement>(
    ':scope > :is(button, a[href])'
  );
  if (header) out.push(header);
  // the collapsible animates its height to 0 when the folder closes; its
  // one list div holds the rows
  const collapsible = node.querySelector<HTMLElement>(
    ':scope > div[data-state]'
  );
  const list = collapsible?.firstElementChild;
  if (collapsible && list && collapsible.offsetHeight > 0) {
    for (const child of list.children) collectRows(child, out);
  }
}

function groupRows(host: HTMLElement): HTMLElement[][] {
  const groups: HTMLElement[][] = [];
  let current: HTMLElement[] | null = null;
  for (const child of host.children) {
    // skip the motion layer's own nodes (a pending row carries docs-sb- too)
    if (child.matches('.docs-sb-rail, .docs-sb-hover, .docs-sb-current')) {
      continue;
    }
    if (child.tagName === 'P') {
      current = null;
      continue;
    }
    const rows: HTMLElement[] = [];
    collectRows(child, rows);
    if (rows.length === 0) continue;
    if (!current) {
      current = [];
      groups.push(current);
    }
    current.push(...rows);
  }
  return groups;
}

function makeRun(host: HTMLElement): Run {
  const rail = document.createElement('div');
  rail.className = 'docs-sb-rail';
  const hoverThumb = document.createElement('div');
  hoverThumb.className = 'docs-sb-thumb-hover';
  const thumb = document.createElement('div');
  thumb.className = 'docs-sb-thumb';
  rail.append(hoverThumb, thumb);
  host.prepend(rail);
  return { rail, thumb, hoverThumb, top: 0, rows: new Map() };
}

// (Re)draw every rail from the current row positions. Geometry is measured
// against the host, which scrolls with the rows.
function buildRails() {
  if (!state) return;
  const { host } = state;
  const hostRect = host.getBoundingClientRect();
  // the rail box is anchored at the host's physical left, so x is physical
  // too: in RTL the text starts at the row's right edge
  const rtl = getComputedStyle(host).direction === 'rtl';
  const groups = groupRows(host);
  while (state.runs.length < groups.length) state.runs.push(makeRun(host));
  state.runs.forEach((run, i) => {
    const rows = groups[i]?.filter((row) => row.offsetHeight > 0) ?? [];
    run.rows.clear();
    if (rows.length === 0) {
      run.rail.style.display = 'none';
      return;
    }
    let top = Infinity;
    let bottom = 0;
    let width = 0;
    const geometry: RowGeometry[] = rows.map((row) => {
      const rect = row.getBoundingClientRect();
      const textStart =
        parseFloat(getComputedStyle(row).paddingInlineStart) || 0;
      const g = {
        x: rtl
          ? rect.right - hostRect.left - textStart + RAIL_BEFORE_TEXT - 0.5
          : rect.left - hostRect.left + textStart - RAIL_BEFORE_TEXT + 0.5,
        top: rect.top - hostRect.top + ROW_INSET_Y,
        bottom: rect.bottom - hostRect.top - ROW_INSET_Y,
      };
      top = Math.min(top, g.top);
      bottom = Math.max(bottom, g.bottom);
      width = Math.max(width, g.x + STROKE);
      return g;
    });
    rows.forEach((row, j) => run.rows.set(row, geometry[j]!));
    run.top = top;
    const height = bottom - top;
    const path = geometry
      .map(
        (g, j) =>
          `${j === 0 ? 'M' : 'L'}${g.x} ${g.top - top} L${g.x} ${g.bottom - top}`
      )
      .join(' ');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><path d="${path}" stroke="black" stroke-width="${STROKE}" fill="none" stroke-linejoin="round" stroke-linecap="round" /></svg>`;
    const mask = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    Object.assign(run.rail.style, {
      display: '',
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      maskImage: mask,
      WebkitMaskImage: mask,
    });
  });
}

function runOf(row: HTMLElement): Run | undefined {
  return state?.runs.find((run) => run.rows.has(row));
}

function placeThumb(
  kind: 'thumb' | 'hoverThumb',
  row: HTMLElement | null,
  immediate = false
) {
  if (!state) return;
  const target = row ? runOf(row) : undefined;
  for (const run of state.runs) {
    const el = run[kind];
    if (run !== target) {
      el.removeAttribute('data-visible');
      continue;
    }
    const g = run.rows.get(row!)!;
    const apply = () => {
      el.style.top = `${g.top - run.top}px`;
      el.style.height = `${g.bottom - g.top}px`;
    };
    // a thumb that was hidden appears in place rather than sliding in
    if (immediate || !el.hasAttribute('data-visible')) snap(el, apply);
    else apply();
    el.setAttribute('data-visible', '');
  }
}

function placePill(
  kind: 'hover' | 'current',
  row: HTMLElement | null,
  immediate = false
) {
  if (!state) return;
  const pill = state.host.querySelector<HTMLElement>(`.docs-sb-${kind}`);
  if (!pill) return;
  if (!row) {
    pill.removeAttribute('data-visible');
    return;
  }
  const rect = row.getBoundingClientRect();
  const hostRect = state.host.getBoundingClientRect();
  const transform = `translate3d(${rect.left - hostRect.left}px, ${rect.top - hostRect.top}px, 0)`;
  const moved =
    pill.hasAttribute('data-visible') && pill.style.transform !== transform;
  const apply = () => {
    pill.style.transform = transform;
    pill.style.width = `${rect.width}px`;
    pill.style.height = `${rect.height}px`;
  };
  if (immediate || !pill.hasAttribute('data-visible')) snap(pill, apply);
  else apply();
  if (kind === 'hover') {
    const onCurrent =
      row.getAttribute('data-active') === 'true' ||
      row.classList.contains(PENDING_CLASS);
    if (onCurrent) pill.setAttribute('data-tone', 'accent');
    else pill.removeAttribute('data-tone');
  }
  if (kind === 'current' && moved && !immediate) {
    pill.setAttribute('data-landing', '');
    clearTimeout(landingTimer);
    landingTimer = setTimeout(
      () => pill.removeAttribute('data-landing'),
      TRAVEL_MS + 120
    );
  }
  pill.setAttribute('data-visible', '');
}

function markCurrent(row: HTMLElement | null, immediate = false) {
  placeThumb('thumb', row, immediate);
  placePill('current', row, immediate);
}

// null while a closing folder's content hides the row: the row stays mounted
// until the collapse animation ends, then unmounts without resizing the
// host. A closed folder's own header (an index page link) stays visible.
function currentActiveRow(): HTMLElement | null {
  const row = document.querySelector<HTMLElement>(
    `${VIEWPORT_SELECTOR} a[data-active="true"]`
  );
  return row?.closest('div[data-state] > div[data-state="closed"]')
    ? null
    : row;
}

function clearPending() {
  document
    .querySelectorAll(`${VIEWPORT_SELECTOR} .${PENDING_CLASS}`)
    .forEach((el) => el.classList.remove(PENDING_CLASS));
}

export default function SidebarMotion() {
  const pathname = usePathname();
  return (
    <>
      <Mount />
      <SettleOnActive key={pathname} />
    </>
  );
}

function Mount() {
  useMountEffect(() => {
    // the desktop sidebar has no layout at phone widths; set up once it does
    let teardown: (() => void) | null = setup();
    const desktop = window.matchMedia('(min-width: 768px)');
    const onChange = () => {
      if (teardown || !desktop.matches) return;
      requestAnimationFrame(() => {
        if (!teardown) teardown = setup();
      });
    };
    desktop.addEventListener('change', onChange);
    return () => {
      desktop.removeEventListener('change', onChange);
      teardown?.();
    };
  });
  return null;
}

// Builds the motion layer inside the desktop sidebar and returns its
// teardown, or null when the sidebar is not laid out.
function setup(): (() => void) | null {
  const viewport = document.querySelector<HTMLElement>(VIEWPORT_SELECTOR);
  if (!viewport || viewport.offsetParent === null) return null;
  const host = (viewport.firstElementChild as HTMLElement | null) ?? viewport;
  host.style.position = 'relative';
  state = { host, viewport, runs: [] };
  // The desktop viewport ignores scroll(): fumadocs calls it whenever an active
  // row mounts, re-opened folders included. SidebarActiveScroll places this
  // viewport by writing scrollTop; the drawer keeps fumadocs' scroll.
  viewport.scroll = () => {};

  const hover = document.createElement('div');
  hover.className = 'docs-sb-hover';
  const current = document.createElement('div');
  current.className = 'docs-sb-current';
  // first in DOM: the pills paint under the rows and the rails
  host.prepend(hover, current);

  buildRails();
  markCurrent(currentActiveRow(), true);
  // Only now do fumadocs' own rail and active tint stand down (globals.css
  // gates both on [data-sb-ready]). Before this point they are what the
  // reader sees, so the sidebar is never marked-up-but-unmarked.
  const shell = viewport.closest<HTMLElement>('#nd-sidebar');
  shell?.setAttribute('data-sb-ready', '');

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const rowAt = (event: Event) => {
    const target = event.target as Element | null;
    const row = target?.closest<HTMLElement>(ROW_SELECTOR);
    return row && viewport.contains(row) ? row : null;
  };
  const onPointerOver = (event: PointerEvent) => {
    if (!fine.matches) return;
    const row = rowAt(event);
    placePill('hover', row);
    placeThumb('hoverThumb', row);
  };
  const onPointerLeave = () => {
    placePill('hover', null);
    placeThumb('hoverThumb', null);
  };
  const onClick = (event: MouseEvent) => {
    // modified clicks and new-tab links leave this tab on its page
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    const row = rowAt(event);
    if (!row || !row.matches('a[href]:not([target="_blank"])')) return;
    clearPending();
    row.classList.add(PENDING_CLASS);
    markCurrent(row);
    placePill('hover', row);
  };
  viewport.addEventListener('pointerover', onPointerOver);
  viewport.addEventListener('pointerleave', onPointerLeave);
  viewport.addEventListener('click', onClick);

  // folders opening/closing and resizes move the rows: redraw, no motion
  const observer = new ResizeObserver(() => {
    buildRails();
    placePill('hover', null);
    placeThumb('hoverThumb', null);
    markCurrent(currentActiveRow(), true);
  });
  observer.observe(host);

  return () => {
    Reflect.deleteProperty(viewport, 'scroll');
    shell?.removeAttribute('data-sb-ready');
    observer.disconnect();
    viewport.removeEventListener('pointerover', onPointerOver);
    viewport.removeEventListener('pointerleave', onPointerLeave);
    viewport.removeEventListener('click', onClick);
    hover.remove();
    current.remove();
    state?.runs.forEach((run) => run.rail.remove());
    state = null;
  };
}

// Re-keyed on every navigation: once the new page's active link is
// committed, the markers settle on it (no movement if they already traveled
// there) and the optimistic "pending" tint hands over to the real one.
function SettleOnActive() {
  useMountEffect(() => {
    const frame = requestAnimationFrame(() => {
      buildRails();
      markCurrent(currentActiveRow());
      clearPending();
    });
    return () => cancelAnimationFrame(frame);
  });
  return null;
}
