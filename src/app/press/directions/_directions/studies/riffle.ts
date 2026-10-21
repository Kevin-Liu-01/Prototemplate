/* 01 Riffle. The issue as a thin paper magazine on the black Atlas shelf,
   with the current site's edge furniture around it. A click riffles every
   page past, as a thumb run down the edge does; a scroll, a swipe or an
   arrow key turns one page. The gloss follows the pointer, and the pages
   wear the folds of a scanned sheet at full strength. */

import { $, coarse, lerp, reduced, type Core } from '../core';
import { editorialPages, fillTitle } from '../editorial';
import { furniture } from '../furniture';
import { findDirection } from '../registry';
import { Sheet } from '../sheet';

const SLUG = 'riffle';

export function riffle(core: Core) {
  const d = findDirection(SLUG)!;
  const root = core.section(
    SLUG,
    'v-atlas v-mag',
    `Direction ${d.label}, ${d.name}`,
    `<div class="mz-stage"><div class="mz-land"><div class="mz-tilt"><div class="mz-mag" role="group" aria-roledescription="magazine" aria-label="${core.issue.title}. Click to riffle the pages, or scroll to turn one."></div></div></div></div>`
  );
  let mag: Sheet | null = null;
  const chrome = furniture(root, core, { label: 'Magazine', toggle: (open) => mag?.go(open ? 1 : 0) });
  const tilt = $('.mz-tilt', root);
  const magEl = $('.mz-mag', root);
  let touched = false;
  let hintT = 0;
  const sheet = new Sheet(magEl, {
    pages: editorialPages(core),
    strips: 22,
    dur: 900,
    onChange: (s) => chrome.setOpen(s > 0),
    onInteract: () => {
      touched = true;
      clearTimeout(hintT);
    },
  });
  mag = sheet;
  fillTitle(root, core);
  core.onLang(() => fillTitle(root, core));

  // a scroll or a swipe on a trackpad turns one page
  let wAcc = 0;
  let wT = 0;
  root.addEventListener(
    'wheel',
    (e) => {
      if (core.current !== SLUG) return;
      wAcc += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const now = performance.now();
      if (now - wT < 300 || Math.abs(wAcc) < 40) return;
      touched = true;
      clearTimeout(hintT);
      if (wAcc > 0) sheet.next();
      else sheet.prev();
      wAcc = 0;
      wT = now;
    },
    { passive: true }
  );

  // the magazine leans toward the pointer and its gloss follows it
  let rx = 0;
  let ry = 0;
  let trx = 0;
  let tryY = 0;
  let lx = 34;
  let ly = 14;
  let tlx = 34;
  let tly = 14;
  let raf = 0;
  let run = false;
  function tick() {
    const calm = sheet.busy || sheet.drag || sheet.peeking;
    rx = lerp(rx, calm ? 0 : trx, 0.07);
    ry = lerp(ry, calm ? 0 : tryY, 0.07);
    lx = lerp(lx, tlx, 0.08);
    ly = lerp(ly, tly, 0.08);
    tilt.style.transform = `rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`;
    magEl.style.setProperty('--lx', `${lx.toFixed(1)}%`);
    magEl.style.setProperty('--ly', `${ly.toFixed(1)}%`);
    if (run) raf = requestAnimationFrame(tick);
  }
  function move(e: PointerEvent) {
    if (reduced()) return;
    const nx = e.clientX / innerWidth - 0.5;
    const ny = e.clientY / innerHeight - 0.5;
    if (!coarse()) {
      tryY = nx * 7;
      trx = -ny * 5;
    }
    tlx = 50 + nx * 120;
    tly = 32 + ny * 120;
  }

  core.register(SLUG, root, {
    enter() {
      chrome.refresh();
      sheet.reset();
      sheet.build();
      fillTitle(root, core);
      touched = false;
      run = true;
      raf = requestAnimationFrame(tick);
      addEventListener('pointermove', move);
      clearTimeout(hintT);
      if (!reduced())
        hintT = window.setTimeout(() => {
          if (!touched && core.current === SLUG) sheet.hint();
        }, 2200);
    },
    leave() {
      run = false;
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', move);
      clearTimeout(hintT);
      sheet.reset();
    },
    key(e) {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        touched = true;
        sheet.next();
      } else if (e.key === 'ArrowLeft') {
        touched = true;
        sheet.prev();
      } else if (e.key === 'Escape') sheet.go(0);
    },
    resize() {
      sheet.build();
    },
  });
}
