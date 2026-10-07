/**
 * The sidebar's rail (DESIGN.md section 16): the GT docs sidebar's mask
 * method (gt-cloud apps/landing/src/components/docs/SidebarMotion.tsx) in
 * Prototemplate's grammar. Framework-free. Sidebar.tsx creates it on the
 * list in outline density (RailsLayer) and destroys it on unmount or when
 * the density turns to thumbnails, where the rows lead with their captures
 * and keep round one's guides.
 *
 * What it draws. Every top-level group (.pt-grp) holds a .pt-sb-rail, a box
 * painted in --pt-sb-rail-ink and masked by an SVG path down the group's
 * rows (1px), and a .pt-sb-track, the same box masked by the same path at
 * 2px, which holds two thumbs: the pointer's (.pt-sb-thumb.is-hover) and
 * the marked row's (.pt-sb-thumb.is-current). A row joins the rail at its
 * level's column (data-rail="0|1|2", the columns --pt-sb-col-0..2, each
 * 16px before the level's first glyph). Where two consecutive rows sit at
 * different columns the path bends at 45 degrees, centred on the gap
 * between them. The list holds two pills (.pt-sb-pill.is-hover and
 * .is-current), grounds under the rows. A thumb is a 1px band translated
 * and scaled onto a row's segment, so only the part of the path inside the
 * band shows and it slides along the line through the bends. A pill keeps
 * its real size at rest and travels by FLIP.
 *
 * Motion is WAAPI on transform only, at --pt-dur-sb (a pick) and
 * --pt-dur-toast (the pointer), eased by --pt-ease. tokens.css sets both
 * to 0ms under reduced motion, so the marks then move at once and no
 * animation is created. Geometry is read once per layout change (a
 * ResizeObserver per group and on the list, a MutationObserver for rows
 * and marks), coalesced into one requestAnimationFrame, never per frame and
 * never on hover. Until the shell settles (.pt-viewer[data-settled]) every
 * placement is a cut, so the boot's hash selection never animates from the
 * server's default.
 *
 * Across routes. Every route mounts its own shell, so the list is rebuilt
 * on a navigation. A plain click on a row that leaves the page records the
 * row's href and its height in the list's viewport (the handoff). The next
 * page's layer, if the same href is on its rail, scrolls its list so that
 * row sits where it was, holds both marks on it until the shell settles,
 * and then travels to the new page's mark.
 *
 * What the layer owns: the inline styles of its own nodes; data-rails on
 * the aside while it is live (the CSS fallbacks stand down on it);
 * data-pending on a clicked row until the route marks a row; data-on and
 * data-quiet on thumbs and pills; data-rail-path on each rail, which the
 * line auditor reads. It never writes a row's class, aria or content.
 */

type Seg = {
  row: HTMLElement;
  run: Run;
  /** the level's pixel column */
  col: number;
  /** the row's box in the group's coordinates */
  y: number;
  h: number;
  /** the row's segment: its box less the inset */
  top: number;
  bottom: number;
  /** the straight part of the segment, where a thumb rests (a bend may take a few px of either end) */
  vTop: number;
  vBottom: number;
};

type Run = {
  group: HTMLElement;
  rail: HTMLElement;
  track: HTMLElement;
  current: HTMLElement;
  hover: HTMLElement;
  /** the rail box's top in the group */
  top: number;
  /** the group's offset in the list and its width, for the pills */
  gy: number;
  w: number;
};

type Box = { x: number; y: number; w: number; h: number };

type Config = {
  col: readonly [number, number, number];
  inset: number;
  pillInset: number;
  travel: number;
  hover: number;
  ease: string;
  /** a 2px thumb centred on a 1px rail sits on whole pixels at DPR 2 (+0.5) and half a pixel right at DPR 1 (+1) */
  thumbDx: number;
};

/** A click that left the page: where its row sat, for the next page's layer. */
type Handoff = { href: string; path: string; from: string; y: number; at: number };

export type SidebarRails = { refresh: () => void; destroy: () => void };

/** the rows a click can make current: links on a rail that stay on the site */
const PLACE = 'a[data-rail]:not([target])';

/** a handoff older than this is ignored; a pending row older than this goes back to the mark */
const HANDOFF_MS = 10000;
const PENDING_MS = 10000;

const anims = new WeakMap<HTMLElement, Animation>();
const boxes = new WeakMap<HTMLElement, Box>();

/* module level, like Sidebar.tsx's pendingFocusPath: it outlives the layer it was written by */
let handoff: Handoff | null = null;

function readConfig(sb: HTMLElement): Config {
  const cs = getComputedStyle(sb);
  const px = (name: string) => parseFloat(cs.getPropertyValue(name)) || 0;
  const ms = (name: string) => {
    const value = cs.getPropertyValue(name).trim();
    return value.endsWith('ms') ? parseFloat(value) || 0 : (parseFloat(value) || 0) * 1000;
  };
  return {
    col: [px('--pt-sb-col-0'), px('--pt-sb-col-1'), px('--pt-sb-col-2')],
    inset: px('--pt-sb-rail-inset'),
    pillInset: px('--pt-sb-pill-inset'),
    travel: ms('--pt-dur-sb'),
    hover: ms('--pt-dur-toast'),
    ease: cs.getPropertyValue('--pt-ease').trim() || 'ease-out',
    thumbDx: window.devicePixelRatio >= 2 ? 0.5 : 1,
  };
}

function pathOf(href: string): string {
  try {
    return new URL(href, window.location.href).pathname;
  } catch {
    return href.split('#')[0] ?? href;
  }
}

function running(el: HTMLElement): Animation | undefined {
  const anim = anims.get(el);
  return anim && anim.playState === 'running' ? anim : undefined;
}

/** A thumb onto a segment: a 1px band, translated and scaled; it has no corner, so the scale is exact. */
function band(el: HTMLElement, y: number, h: number, dur: number, ease: string): void {
  const to = `translate3d(0, ${y}px, 0) scale3d(1, ${h}, 1)`;
  const from = dur > 0 ? (running(el) ? getComputedStyle(el).transform : el.style.transform) : '';
  anims.get(el)?.cancel();
  anims.delete(el);
  el.style.transform = to;
  if (dur > 0 && from && from !== 'none' && from !== to) {
    anims.set(el, el.animate([{ transform: from }, { transform: to }], { duration: dur, easing: ease }));
  }
}

/** A pill onto a row: its real size at rest, so the control corner stays round, and a FLIP scale while it travels. */
function flip(el: HTMLElement, to: Box, dur: number, ease: string): void {
  const last = boxes.get(el);
  let from: Box | null = null;
  if (dur > 0 && last) {
    if (running(el)) {
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      from = { x: m.e, y: m.f, w: last.w * m.a, h: last.h * m.d };
    } else {
      from = last;
    }
  }
  anims.get(el)?.cancel();
  anims.delete(el);
  if (!last || last.w !== to.w) el.style.width = `${to.w}px`;
  if (!last || last.h !== to.h) el.style.height = `${to.h}px`;
  const rest = `translate3d(${to.x}px, ${to.y}px, 0)`;
  el.style.transform = rest;
  if (from && (from.x !== to.x || from.y !== to.y || from.w !== to.w || from.h !== to.h)) {
    const start = `translate3d(${from.x}px, ${from.y}px, 0) scale(${from.w / to.w}, ${from.h / to.h})`;
    anims.set(el, el.animate([{ transform: start }, { transform: `${rest} scale(1, 1)` }], { duration: dur, easing: ease }));
  }
  boxes.set(el, to);
}

/* a mask is alpha only, so the stroke's color is irrelevant; a named color keeps lint-shell's literal check quiet */
function svgMask(d: string, width: number, height: number, stroke: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><path d="${d}" fill="none" stroke="black" stroke-width="${stroke}" stroke-linejoin="round"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function createSidebarRails(list: HTMLElement): SidebarRails | null {
  const sb = list.closest<HTMLElement>('.pt-sb');
  const hoverPill = list.querySelector<HTMLElement>(':scope > .pt-sb-pill.is-hover');
  const currentPill = list.querySelector<HTMLElement>(':scope > .pt-sb-pill.is-current');
  if (!sb || !hoverPill || !currentPill) return null;
  const aside: HTMLElement = sb;
  const hoverGround: HTMLElement = hoverPill;
  const currentGround: HTMLElement = currentPill;
  /* the shell root; DirectionCorner's list has none and counts as settled */
  const viewer = aside.closest<HTMLElement>('.pt-viewer');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dense = window.matchMedia('(min-resolution: 2dppx)');
  const runs = new Map<HTMLElement, Run>();
  const segs = new Map<HTMLElement, Seg>();
  const dirty = new Set<HTMLElement>();
  let everything = true;
  let frame = 0;
  let cfg = readConfig(aside);
  let markRow: HTMLElement | null = null;
  let hoverRow: HTMLElement | null = null;
  /* the [data-mark] row the last sync read: a new one means the route moved its mark */
  let seenMark: HTMLElement | null = null;
  let flightEnd = 0;
  let pendingAt = 0;
  let pendingTimer = 0;
  /* the handoff's scroll has been applied */
  let handed = false;
  /* a row or mark change seen before the shell settled (the boot applying
     the hash): the mark it moves is placed with a cut, never a travel */
  let cut = false;

  const settled = () => !viewer || viewer.hasAttribute('data-settled');

  /* the shell's column transition (ViewerShell.css, grid-template-columns), in flight or not */
  const isColumnMove = (anim: Animation) =>
    (anim as Animation & { transitionProperty?: string }).transitionProperty === 'grid-template-columns' &&
    anim.playState === 'running';
  let columnMoving = Boolean(viewer?.getAnimations().some(isColumnMove));

  /* the border box each group had when it was last built. A notification
     that reports that same box is not a layout change: the observer's
     first one after a group is observed, and the one that follows a
     rebuild the mutation observer already asked for (a pick that swaps a
     deep run). Rebuilding on those read every row twice per change. The
     list's own first notification is skipped for the same reason: the
     first sync measured everything in the creating frame. */
  const built = new WeakMap<Element, { w: number; h: number }>();
  let listSeen = false;
  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const target = entry.target as HTMLElement;
      if (target === list) {
        if (listSeen) schedule(null);
        listSeen = true;
        continue;
      }
      const last = built.get(target);
      const box = entry.borderBoxSize?.[0];
      if (last && box && Math.abs(box.inlineSize - last.w) < 0.5 && Math.abs(box.blockSize - last.h) < 0.5) continue;
      schedule(target);
    }
  });

  function runFor(group: HTMLElement): Run | null {
    const known = runs.get(group);
    if (known) return known;
    const rail = group.querySelector<HTMLElement>(':scope > .pt-sb-rail');
    const track = group.querySelector<HTMLElement>(':scope > .pt-sb-track');
    const current = track?.querySelector<HTMLElement>('.pt-sb-thumb.is-current');
    const hover = track?.querySelector<HTMLElement>('.pt-sb-thumb.is-hover');
    if (!rail || !track || !current || !hover) return null;
    const run: Run = { group, rail, track, current, hover, top: 0, gy: 0, w: 0 };
    runs.set(group, run);
    ro.observe(group);
    return run;
  }

  /* One group's rail from its rows' boxes, read in one pass before any
     write. The path runs down each row's segment at its level's column;
     between two columns it bends at 45 degrees around the middle of the
     gap, taking a few px of the segments when the step is wider than the
     gap. Straight stretches carry no vertices. */
  function build(run: Run): void {
    const gr = run.group.getBoundingClientRect();
    built.set(run.group, { w: gr.width, h: gr.height });
    for (const [row, seg] of segs) if (seg.run === run) segs.delete(row);
    const rows: Seg[] = [];
    for (const row of run.group.querySelectorAll<HTMLElement>('[data-rail]')) {
      const r = row.getBoundingClientRect();
      if (r.height === 0) continue;
      const level = Math.min(2, Math.max(0, Number(row.dataset.rail) || 0));
      const inset = Math.min(cfg.inset, (r.height - 8) / 2);
      const y = r.top - gr.top;
      const top = y + inset;
      const bottom = y + r.height - inset;
      rows.push({ row, run, col: cfg.col[level] ?? 0, y, h: r.height, top, bottom, vTop: top, vBottom: bottom });
    }
    run.w = run.group.clientWidth;
    const first = rows[0];
    const last = rows[rows.length - 1];
    if (!first || !last) {
      run.rail.style.display = 'none';
      run.track.style.display = 'none';
      delete run.rail.dataset.railPath;
      return;
    }
    const points: [number, number][] = [[first.col, first.top]];
    let maxCol = first.col;
    for (let i = 1; i < rows.length; i++) {
      const a = rows[i - 1];
      const b = rows[i];
      if (!a || !b) continue;
      maxCol = Math.max(maxCol, b.col);
      if (a.col === b.col) continue;
      const half = Math.abs(b.col - a.col) / 2;
      const mid = (a.bottom + b.top) / 2;
      a.vBottom = Math.max(a.top, mid - half);
      b.vTop = Math.min(b.bottom, mid + half);
      points.push([a.col, a.vBottom], [b.col, b.vTop]);
    }
    points.push([last.col, last.bottom]);
    for (const seg of rows) segs.set(seg.row, seg);
    const top = first.top;
    const height = Math.max(1, last.bottom - top);
    const width = maxCol + 3;
    const d = (dx: number) =>
      points.map(([x, y], i) => `${i ? 'L' : 'M'}${+(x + dx).toFixed(2)} ${+(y - top).toFixed(2)}`).join(' ');
    const masks: [HTMLElement, string][] = [
      [run.rail, svgMask(d(0.5), width, height, 1)],
      [run.track, svgMask(d(cfg.thumbDx), width, height, 2)],
    ];
    for (const [el, mask] of masks) {
      el.style.display = '';
      el.style.top = `${top}px`;
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
      el.style.setProperty('-webkit-mask-image', mask);
      el.style.maskImage = mask;
    }
    run.rail.dataset.railPath = d(0.5);
    run.top = top;
  }

  const show = (el: HTMLElement, on: boolean) => el.toggleAttribute('data-on', on);

  function placeThumb(kind: 'current' | 'hover', row: HTMLElement | null, dur: number): void {
    const seg = row ? segs.get(row) : undefined;
    for (const run of runs.values()) {
      const el = run[kind];
      if (!seg || seg.run !== run) {
        show(el, false);
        continue;
      }
      /* a thumb that was hidden appears in place; one that shows slides */
      band(el, seg.vTop - run.top, Math.max(1, seg.vBottom - seg.vTop), el.hasAttribute('data-on') ? dur : 0, cfg.ease);
      show(el, true);
    }
  }

  function placePill(el: HTMLElement, row: HTMLElement | null, dur: number): void {
    const seg = row ? segs.get(row) : undefined;
    if (!seg) {
      show(el, false);
      return;
    }
    const x = cfg.pillInset;
    flip(el, { x, y: seg.run.gy + seg.y, w: seg.run.w - 2 * x, h: seg.h }, el.hasAttribute('data-on') ? dur : 0, cfg.ease);
    show(el, true);
  }

  function mark(row: HTMLElement | null, dur: number): void {
    markRow = row;
    if (dur > 0) flightEnd = performance.now() + dur;
    placeThumb('current', row, dur);
    placePill(currentGround, row, dur);
    hoverGround.toggleAttribute('data-quiet', Boolean(row) && row === hoverRow);
  }

  function setHover(row: HTMLElement | null): void {
    if (row === hoverRow) return;
    hoverRow = row;
    placeThumb('hover', row, cfg.hover);
    placePill(hoverGround, row, cfg.hover);
    hoverGround.toggleAttribute('data-quiet', Boolean(row) && row === markRow);
  }

  /* the handoff's row on this page, while the handoff is fresh and was written on another page */
  function handoffRow(): HTMLElement | null {
    const h = handoff;
    if (!h) return null;
    const here = window.location.pathname;
    if (performance.now() - h.at > HANDOFF_MS || h.path !== here || h.from === here) {
      handoff = null;
      return null;
    }
    return list.querySelector<HTMLElement>(`a[data-rail][href="${CSS.escape(h.href)}"]`);
  }

  /* where a row's marks rest, in list coordinates: the thumb's band and the pill's box; empty when the row has no segment */
  function restOf(row: HTMLElement | null): string {
    const seg = row ? segs.get(row) : undefined;
    return seg ? `${seg.run.gy + seg.vTop}|${seg.vBottom - seg.vTop}|${seg.run.gy + seg.y}|${seg.h}|${seg.run.w}` : '';
  }

  /* after a rebuild, a hover mark rides with its row at once */
  function carryHover(): void {
    const keep = hoverRow?.isConnected ? hoverRow : null;
    hoverRow = null;
    if (!keep) return;
    hoverRow = keep;
    placeThumb('hover', keep, 0);
    placePill(hoverGround, keep, 0);
  }

  /* One frame's work after whatever the observers saw: rebuild the groups
     whose rows moved, refresh every group's offset (a fold moves the groups
     under it without resizing them), then settle the marks. A mark is
     re-placed only when its row's resting geometry changed, so the
     observers' first notifications and unrelated rebuilds never restart a
     travel (a restarted ease would stall the thumb mid-flight). */
  function sync(): void {
    frame = 0;
    /* the column's width is moving (a density change; the list toggled):
       the list can follow it on every frame of the transition, so the
       rebuild waits for the move to end (the transition's end and the
       viewer observer run it then), and the rows are read once, never per
       frame */
    if (columnMoving || viewer?.dataset.sbMoving === 'density') return;
    if (everything) cfg = readConfig(aside);
    const markWas = restOf(markRow);
    const hoverWas = restOf(hoverRow);
    for (const group of list.querySelectorAll<HTMLElement>(':scope > .pt-grp')) runFor(group);
    for (const [group, run] of runs) {
      if (group.isConnected) continue;
      ro.unobserve(group);
      runs.delete(group);
      for (const [row, seg] of segs) if (seg.run === run) segs.delete(row);
    }
    for (const run of runs.values()) {
      if (!everything && !dirty.has(run.group)) continue;
      build(run);
    }
    for (const run of runs.values()) run.gy = run.group.offsetTop;
    dirty.clear();
    everything = false;
    const markShifted = Boolean(markRow?.isConnected) && restOf(markRow) !== markWas;
    const hoverShifted = Boolean(hoverRow) && restOf(hoverRow) !== hoverWas;

    const ready = settled();
    const boot = cut;
    cut = false;

    /* a page just mounted from a click on the last one: hold both marks on
       the clicked row, where it sat, until the shell settles */
    const held = ready ? null : handoffRow();
    if (held) {
      const seg = segs.get(held);
      if (seg && !handed && handoff) {
        handed = true;
        list.scrollTop = Math.max(0, seg.run.gy + seg.y - handoff.y);
      }
      if (markShifted || markRow !== held) mark(held, 0);
      if (hoverShifted) carryHover();
      return;
    }

    const pending = list.querySelector<HTMLElement>('[data-pending]');
    const marked = list.querySelector<HTMLElement>('[data-mark]');
    const markMoved = marked !== seenMark;
    seenMark = marked;
    const stale = pending !== null && performance.now() - pendingAt > PENDING_MS;
    if (pending && (pending === marked || markMoved || stale)) {
      pending.removeAttribute('data-pending');
      /* picked in place: the click never left the page */
      if (pending === marked) handoff = null;
    }
    const next = list.querySelector<HTMLElement>('[data-pending]') ?? marked;
    /* glide once settled; a boot change cuts, except the release of a handoff, which is the travel it was held for */
    const glide = ready && (!boot || handed);
    const left = flightEnd - performance.now();
    if (markShifted) mark(markRow, glide && left > 0 ? Math.max(60, left) : 0);
    if (next !== markRow) mark(next, glide && markRow?.isConnected ? cfg.travel : 0);
    /* the handoff's travel has started (or was not needed): it is spent */
    if (ready && handed) {
      handoff = null;
      handed = false;
    }
    if (hoverShifted) carryHover();
  }

  function schedule(group: HTMLElement | null): void {
    if (group) dirty.add(group);
    else everything = true;
    if (!frame) frame = requestAnimationFrame(sync);
  }

  function settle(): void {
    if (!frame) frame = requestAnimationFrame(sync);
  }

  const topGroup = (node: Node): HTMLElement | null => {
    const el = node instanceof Element ? node : node.parentElement;
    return el?.closest<HTMLElement>('.pt-thumbs > .pt-grp') ?? null;
  };
  const mo = new MutationObserver((records) => {
    if (!settled()) cut = true;
    for (const record of records) {
      if (record.type === 'attributes') settle();
      else schedule(record.target === list ? null : topGroup(record.target));
    }
  });
  const moViewer = new MutationObserver(settle);
  const onColumn = (event: TransitionEvent) => {
    if (event.target !== viewer || event.propertyName !== 'grid-template-columns') return;
    columnMoving = event.type === 'transitionrun' || event.type === 'transitionstart';
    if (!columnMoving) settle();
  };
  const COLUMN_EVENTS = ['transitionrun', 'transitionstart', 'transitionend', 'transitioncancel'] as const;

  /* the row an event is on: a rail row, or the page row a fold sits on */
  const rowAt = (node: EventTarget | null): HTMLElement | null => {
    if (!(node instanceof Element)) return null;
    const el = node.closest<HTMLElement>('[data-rail], .pt-orow-fold');
    if (!el || !list.contains(el)) return null;
    return el.classList.contains('pt-orow-fold') ? (el.previousElementSibling as HTMLElement | null) : el;
  };
  const onOver = (event: PointerEvent) => {
    if (!fine.matches || event.pointerType === 'touch') return;
    setHover(rowAt(event.target));
  };
  const onLeave = () => setHover(null);
  const onFocusIn = (event: FocusEvent) => {
    if (event.target instanceof Element && event.target.matches(':focus-visible')) setHover(rowAt(event.target));
  };
  const onFocusOut = (event: FocusEvent) => {
    if (!(event.relatedTarget instanceof Node) || !list.contains(event.relatedTarget)) setHover(null);
  };
  /* a plain click on a place: both marks leave at once and the row reads as
     current until the route marks a row; a click that leaves the page
     writes the handoff for the next page's layer */
  const onClick = (event: MouseEvent) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const row = event.target instanceof Element ? event.target.closest<HTMLElement>(PLACE) : null;
    if (!row || !list.contains(row) || row.hasAttribute('data-mark')) return;
    for (const el of list.querySelectorAll('[data-pending]')) el.removeAttribute('data-pending');
    row.setAttribute('data-pending', '');
    pendingAt = performance.now();
    const href = row.getAttribute('href') ?? '';
    const path = pathOf(href);
    const seg = segs.get(row);
    const here = window.location.pathname;
    handoff = seg && path !== here ? { href, path, from: here, y: seg.run.gy + seg.y - list.scrollTop, at: performance.now() } : null;
    mark(row, settled() ? cfg.travel : 0);
    window.clearTimeout(pendingTimer);
    pendingTimer = window.setTimeout(settle, PENDING_MS + 50);
  };
  /* reduced motion or the pixel ratio changed: read the tokens now, so a click before the next frame already uses them */
  const onMedia = () => {
    cfg = readConfig(aside);
    schedule(null);
  };

  ro.observe(list);
  mo.observe(list, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-mark'] });
  if (viewer) {
    moViewer.observe(viewer, { attributes: true, attributeFilter: ['data-settled', 'data-sb-moving'] });
    for (const type of COLUMN_EVENTS) viewer.addEventListener(type, onColumn);
  }
  list.addEventListener('pointerover', onOver, { passive: true });
  list.addEventListener('pointerleave', onLeave, { passive: true });
  list.addEventListener('focusin', onFocusIn);
  list.addEventListener('focusout', onFocusOut);
  list.addEventListener('click', onClick);
  reduce.addEventListener('change', onMedia);
  dense.addEventListener('change', onMedia);

  /* the first build is synchronous (the caller runs in a layout effect), so
     the rails and the thumb arrive in the list's first frame; only then do
     the CSS fallbacks stand down */
  sync();
  aside.setAttribute('data-rails', '');

  return {
    refresh() {
      schedule(null);
    },
    destroy() {
      cancelAnimationFrame(frame);
      frame = 0;
      window.clearTimeout(pendingTimer);
      ro.disconnect();
      mo.disconnect();
      moViewer.disconnect();
      if (viewer) for (const type of COLUMN_EVENTS) viewer.removeEventListener(type, onColumn);
      list.removeEventListener('pointerover', onOver);
      list.removeEventListener('pointerleave', onLeave);
      list.removeEventListener('focusin', onFocusIn);
      list.removeEventListener('focusout', onFocusOut);
      list.removeEventListener('click', onClick);
      reduce.removeEventListener('change', onMedia);
      dense.removeEventListener('change', onMedia);
      aside.removeAttribute('data-rails');
      for (const run of runs.values()) for (const el of [run.current, run.hover]) anims.get(el)?.cancel();
      for (const el of [hoverGround, currentGround]) anims.get(el)?.cancel();
    },
  };
}
