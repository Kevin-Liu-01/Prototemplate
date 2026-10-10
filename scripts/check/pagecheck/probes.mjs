// The generic in-page read and the judgements made from it. readPage is
// one function serialized into page.evaluate, so it reads nothing but its
// argument and the document; judgeReads runs in Node on what came back.
//
// What readPage returns, per cell:
//   scrollWidth against innerWidth (horizontal overflow), the elements
//   whose visible box crosses the left or right viewport edge (clipping
//   ancestors are honoured, so a marquee inside an overflow hidden box
//   does not count), text clipped by an overflow hidden or clip ancestor
//   (sr-only text is clipped on purpose and is marked so the report can
//   leave it out; text-overflow ellipsis is marked as a truncation and
//   becomes a note), the document height, the first h1 and its box, the
//   theme as the root carries it (html[data-theme] and the dark class),
//   on a touch device the tap targets (buttons, links with an href,
//   inputs, role button or combobox, inside the scope the site names)
//   with their boxes, and the boxes of the named landmarks a site hook
//   compares across pages. Every element reading carries `within`, the
//   nearest ancestor with a class, so the report can place a bare link by
//   its row or group.
//
// A tap target's size is its hit area where the target is on screen: how
// far past each edge of its box a tap through its center still lands on
// it (elementFromPoint), so a 32px drawing with a 44px ::after answers as
// 44. Off screen, the box stands in.
//
// What counts: under 44px on the smaller side a tap target is listed;
// on a phone under 40 is a defect and 40 to 43 a note (the source
// system's rule, kept). A tablet's targets are notes until Kevin decides
// whether tablets get the phone's touch sizing. A clipped text whose box
// truncates with an ellipsis is a note, not a defect, because the
// truncation is the design's own answer to a long title; a clip without
// one hides words. A layout shift score over 0.1 (the Web Vitals limit)
// is a defect and over 0.05 a note.

/**
 * The read, run inside the document.
 * cfg.touch: whether the device is a phone or a tablet (tap targets are read then).
 * cfg.w, cfg.h: the viewport.
 * cfg.skip: selectors whose subtrees are left out of the edge and clip reads.
 * cfg.landmarks: name to selector; each box is returned under its name.
 * cfg.tapScope: the selector the tap-target candidates are read inside.
 */
export const readPage = (cfg) => {
  const r1 = (n) => Math.round(n * 10) / 10;
  const box = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: r1(b.x), y: r1(b.y), w: r1(b.width), h: r1(b.height), right: r1(b.right), bottom: r1(b.bottom) };
  };
  const desc = (n) => {
    if (!n) return '?';
    const cls = typeof n.className === 'string' && n.className ? '.' + n.className.trim().split(/\s+/).slice(0, 3).join('.') : '';
    const id = n.id ? '#' + n.id : '';
    const testid = n.dataset?.testid ? '[' + n.dataset.testid + ']' : '';
    return `${n.nodeName.toLowerCase()}${id}${cls}${testid}`;
  };
  const text = (el) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40);
  /* the nearest ancestor that carries a class, so the report can place a bare link or button by its row or group */
  const within = (el) => {
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      if (typeof n.className === 'string' && n.className.trim()) return desc(n);
    }
    return '';
  };
  const visible = (el) => {
    const b = el.getBoundingClientRect();
    if (b.width <= 0 || b.height <= 0) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0.02;
  };
  const skipRoots = cfg.skip.flatMap((s) => {
    try {
      return [...document.querySelectorAll(s)];
    } catch {
      return [];
    }
  });
  const skipped = (el) => skipRoots.some((root) => root === el || root.contains(el)) || Boolean(el.closest('[data-radix-popper-content-wrapper]'));
  const clips = (cs) => /hidden|clip/.test(cs.overflowX) || /hidden|clip/.test(cs.overflowY);
  /* the box after every clipping ancestor has cut it; null when nothing is
     left. A fixed element escapes its ancestors' overflow (the shell is
     fixed inside a zero-height body with overflow hidden), so the walk
     stops at a fixed node, and an ancestor with no area clips nothing. */
  const visibleRect = (el) => {
    let left = -Infinity;
    let right = Infinity;
    let top = -Infinity;
    let bottom = Infinity;
    for (let n = el; n && n !== document.documentElement && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.position === 'fixed') break;
      if (n === el || !clips(cs)) continue;
      const b = n.getBoundingClientRect();
      if (b.width <= 0 || b.height <= 0) continue;
      left = Math.max(left, b.left);
      right = Math.min(right, b.right);
      top = Math.max(top, b.top);
      bottom = Math.min(bottom, b.bottom);
    }
    const b = el.getBoundingClientRect();
    const out = {
      left: Math.max(b.left, left),
      right: Math.min(b.right, right),
      top: Math.max(b.top, top),
      bottom: Math.min(b.bottom, bottom),
    };
    return out.right - out.left > 0.5 && out.bottom - out.top > 0.5 ? out : null;
  };
  const srOnly = (el) => {
    const cs = getComputedStyle(el);
    return (
      /(^|\s)sr-only(\s|$)/.test(typeof el.className === 'string' ? el.className : '') ||
      (cs.position === 'absolute' && parseFloat(cs.width) <= 1 && parseFloat(cs.height) <= 1)
    );
  };
  const hasOwnText = (el) => [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());

  const all = [...document.body.querySelectorAll('*')];
  const w = cfg.w;

  /* 1. boxes past the viewport's left or right edge, after clipping */
  const pastEdge = [];
  for (const el of all) {
    if (pastEdge.length >= 12) break;
    if (skipped(el) || !visible(el)) continue;
    if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
    const vr = visibleRect(el);
    if (!vr) continue;
    if (vr.left < -1 || vr.right > w + 1) {
      pastEdge.push({ el: desc(el), within: within(el), x: r1(vr.left), right: r1(vr.right), text: text(el).slice(0, 24) });
    }
  }

  /* 2. text clipped by an overflow hidden or clip box */
  const clipped = [];
  for (const el of all) {
    if (clipped.length >= 12) break;
    if (skipped(el) || !visible(el)) continue;
    const cs = getComputedStyle(el);
    if (!/hidden|clip/.test(cs.overflowX) && !/hidden|clip/.test(cs.overflow)) continue;
    if (el.scrollWidth <= el.clientWidth + 1) continue;
    if (!(el.textContent ?? '').trim()) continue;
    /* a scroll region that hides its bar is a scroller, not a clip; a box of blocks that each fit is not a clip of text */
    if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') continue;
    /* only a child with readable text counts: an empty aria-hidden watermark may run past the edge */
    const spills = (c) => c.getBoundingClientRect().right > el.getBoundingClientRect().right + 1 && !!c.textContent?.trim() && !c.closest('[aria-hidden="true"], [aria-hidden=""]');
    if (!hasOwnText(el) && ![...el.children].some(spills)) continue;
    clipped.push({
      el: desc(el),
      within: within(el),
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      text: text(el),
      srOnly: srOnly(el),
      ellipsis: cs.textOverflow === 'ellipsis' && cs.whiteSpace === 'nowrap',
    });
  }

  /* the hit area through the center: how far past each edge a tap still lands on the target; null off screen */
  const HIT_MAX = 12;
  const hitArea = (el, b) => {
    if (b.left < 0 || b.top < 0 || b.right > window.innerWidth || b.bottom > window.innerHeight) return null;
    const on = (x, y) => {
      const t = document.elementFromPoint(x, y);
      return Boolean(t) && (t === el || el.contains(t));
    };
    const cx = (b.left + b.right) / 2;
    const cy = (b.top + b.bottom) / 2;
    if (!on(cx, cy)) return null;
    /* in quarter pixels: the last offset that still lands, plus the quarter it stands for */
    const reach = (x, y, dx, dy) => {
      let n = 0;
      while (n < HIT_MAX * 4 && on(x + (dx * (n + 1)) / 4, y + (dy * (n + 1)) / 4)) n++;
      return n ? (n + 1) / 4 : 0;
    };
    return {
      w: b.width + reach(b.left, cy, -1, 0) + reach(b.right, cy, 1, 0),
      h: b.height + reach(cx, b.top, 0, -1) + reach(cx, b.bottom, 0, 1),
    };
  };

  /* 3. tap targets on a touch device */
  const targets = [];
  if (cfg.touch) {
    const scopes = [...document.querySelectorAll(cfg.tapScope)];
    const seen = new Set();
    for (const scope of scopes) {
      for (const el of scope.querySelectorAll('button, a[href], input:not([type=hidden]), [role=button], [role=combobox]')) {
        if (seen.has(el)) continue;
        seen.add(el);
        if (skipped(el) || !visible(el)) continue;
        if (el.closest('[aria-hidden="true"]')) continue;
        const vr = visibleRect(el);
        if (!vr) continue;
        const b = el.getBoundingClientRect();
        /* a target scrolled out of the viewport is still a target; one clipped away by a closed panel is not */
        const hit = hitArea(el, b) ?? { w: b.width, h: b.height };
        targets.push({
          el: desc(el),
          within: within(el),
          text: (text(el) || el.getAttribute('aria-label') || el.getAttribute('title') || '').slice(0, 30),
          w: r1(hit.w),
          h: r1(hit.h),
          size: r1(Math.min(hit.w, hit.h)),
          y: r1(b.y),
        });
      }
    }
  }

  /* 4. the landmarks a site names */
  const landmarks = {};
  for (const [name, selector] of Object.entries(cfg.landmarks)) {
    let els = [];
    try {
      els = [...document.querySelectorAll(selector)];
    } catch {
      els = [];
    }
    const el = els[0] ?? null;
    landmarks[name] = el
      ? { ...box(el), count: els.length, display: getComputedStyle(el).display, visible: visible(el), className: typeof el.className === 'string' ? el.className : '' }
      : null;
  }

  const h1 = document.querySelector('h1');
  return {
    href: location.pathname + location.search + location.hash,
    title: document.title,
    theme: { data: document.documentElement.dataset.theme ?? null, darkClass: document.documentElement.classList.contains('dark') },
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    scrollHeight: document.documentElement.scrollHeight,
    h1: text(h1),
    h1Box: box(h1),
    h1Count: document.querySelectorAll('h1').length,
    pastEdge,
    clipped,
    targets,
    landmarks,
    canvases: document.querySelectorAll('canvas').length,
    frames: document.querySelectorAll('iframe').length,
  };
};

/** The tap target thresholds (px on the smaller side). */
export const TAP_DEFECT_UNDER = 40;
export const TAP_NOTE_UNDER = 44;

/** The layout shift limits: over CLS_DEFECT a defect, over CLS_NOTE a note. */
export const CLS_DEFECT = 0.1;
export const CLS_NOTE = 0.05;

/** The long tasks a cell counts toward its blocking time (ms over 50, as Lighthouse sums TBT). */
const LONG_TASK_MS = 50;

/** What the context's observers collected (context.mjs observeVitals), read inside the page. */
export const readVitals = () => window.__pcVitals ?? null;

/**
 * The layout shift score as Web Vitals counts it: shifts without a recent
 * input, grouped into windows that close after 1s without a shift or 5s
 * in all, and the largest window's sum.
 */
export function clsOf(shifts) {
  let best = 0;
  let sum = 0;
  let start = -Infinity;
  let last = -Infinity;
  for (const s of shifts.filter((x) => !x.recent)) {
    if (s.t - last > 1000 || s.t - start > 5000) {
      sum = 0;
      start = s.t;
    }
    sum += s.value;
    last = s.t;
    best = Math.max(best, sum);
  }
  return Math.round(best * 10000) / 10000;
}

/** The vitals a cell reports: the layout shift score with its largest shifts, the largest paint and the long tasks. */
export function summarizeVitals(v) {
  if (!v) return null;
  const top = [...v.shifts].sort((a, b) => b.value - a.value).slice(0, 3);
  return {
    cls: clsOf(v.shifts),
    shifts: top.map((s) => ({ t: s.t, value: Math.round(s.value * 10000) / 10000, sources: s.sources })),
    lcp: v.lcp,
    longTasks: v.longTasks.length,
    blockingMs: v.longTasks.reduce((n, d) => n + Math.max(0, d - LONG_TASK_MS), 0),
  };
}

/**
 * The generic judgements from a cell's reads: `judge` holds pass or fail
 * booleans, `info` the readings the report prints beside them.
 * consoleErrors is the list after the allowlist has been applied; vitals
 * is summarizeVitals' reading, or null when the observers saw nothing.
 */
export function judgeReads(reads, cell, consoleErrors, vitals) {
  const judge = {};
  const info = {};
  judge.noOverflow = reads.scrollWidth <= reads.innerWidth;
  info.overflow = [reads.scrollWidth, reads.innerWidth];
  judge.noPastEdge = reads.pastEdge.length === 0;
  const clippedText = reads.clipped.filter((c) => !c.srOnly && !c.ellipsis);
  judge.noClippedText = clippedText.length === 0;
  info.clippedText = clippedText;
  info.truncated = reads.clipped.filter((c) => c.ellipsis && !c.srOnly);
  judge.noConsoleErrors = consoleErrors.length === 0;
  judge.themeApplied = reads.theme.data === cell.theme;
  /* a reading, not a check: the deck and the presenter have no h1 by design */
  info.h1Count = reads.h1Count;
  if (cell.kind !== 'desktop') {
    const under = reads.targets.filter((t) => t.size < TAP_DEFECT_UNDER);
    info.targets40to43 = reads.targets.filter((t) => t.size >= TAP_DEFECT_UNDER && t.size < TAP_NOTE_UNDER);
    /* a phone fails under 40; a tablet's small targets are notes until Kevin decides on tablet touch sizing */
    if (cell.kind === 'phone') {
      info.targetsUnder40 = under;
      judge.tapTargets = under.length === 0;
    } else info.tabletUnder40 = under;
  }
  if (vitals) {
    judge.noLayoutShift = vitals.cls <= CLS_DEFECT;
    info.noLayoutShift = vitals;
  }
  return { judge, info };
}
