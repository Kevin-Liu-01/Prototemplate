/* 02 Atlas book. The current shelf reduced to one book in a dark room, with
   the edge furniture kept. The cover carries the plate, a seal and the title
   in the chosen language; it opens on the 1607 page, inked character by
   character, and the first page holds the contents. */

import { $, E, applyLang, coarse, jihe, lerp, reduced, splitWords, tween, type Core } from '../core';
import { PICTURES, SPREAD_ALT, type TitleLang } from '../data';
import { furniture } from '../furniture';
import { findDirection } from '../registry';

const SLUG = 'atlas';

export function atlas(core: Core) {
  const d = findDirection(SLUG)!;
  const { issue } = core;
  const root = core.section(
    SLUG,
    'v-atlas',
    `Direction ${d.label}, ${d.name}`,
    `<div class="at-stage">
      <div class="at-wrap">
        <div class="at-book" role="button" tabindex="0" aria-pressed="false" aria-label="Open the book">
          <div class="at-shadow"></div>
          <div class="at-body">
            <div class="at-pages">
              <div class="at-p1">
                <p class="k"><span>Atlas No. 01</span><span>Contents</span></p>
                <h3>In this issue</h3>
                <ol class="at-p1-list"></ol>
                <div class="def">
                  <span class="zh" lang="zh-Hant">點者無分</span>
                  <p>Definition I. A point is that which has no part.</p>
                  <p class="src">Book I, Beijing, 1607</p>
                </div>
                <a class="read" href="${issue.href}">Read the story <span aria-hidden="true">→</span></a>
              </div>
            </div>
            <div class="at-fore"></div>
            <div class="at-head"></div>
            <div class="at-tail"></div>
            <div class="at-spine" aria-hidden="true"><span class="t"></span><span class="by">General Translation</span></div>
            <div class="at-cover">
              <div class="at-front">
                <svg class="at-gt" viewBox="0 0 44 28" aria-hidden="true"><g class="gt-line"><path d="M21.04 7.25A10.5 10.5 0 1 0 23.5 14H15.5"/><path d="M25 3.5H42M33.5 3.5V24.5"/></g><g class="gt-inline"><path d="M21.04 7.25A10.5 10.5 0 1 0 23.5 14H15.5"/><path d="M25 3.5H42M33.5 3.5V24.5"/></g></svg>
                <figure class="at-plate"><img alt="${SPREAD_ALT}" src="${PICTURES.plate}"></figure>
                <div class="at-seal" aria-hidden="true">
                  <svg viewBox="0 0 100 100"><defs><filter id="at-rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="3.2"/></filter></defs><g filter="url(#at-rough)"><rect class="seal-bg" x="3" y="3" width="94" height="94" rx="3"/><rect class="seal-line" x="9" y="9" width="82" height="82"/><g class="seal-txt" text-anchor="middle"><text x="70" y="47">幾</text><text x="70" y="86">何</text><text x="30" y="47">原</text><text x="30" y="86">本</text></g></g></svg>
                </div>
                <h1 class="at-title"></h1>
                <p class="at-foot">General Translation</p>
                <i class="sheen"></i><i class="dim"></i>
              </div>
              <div class="at-inside"><i class="shade"></i></div>
            </div>
          </div>
        </div>
      </div>
      <aside class="at-notes" aria-label="About this issue">
        <p class="k" style="--d:0">No. 01 · Translation</p>
        <p class="dek" style="--d:1">In 1607 a Jesuit from Italy and a scholar-official from Shanghai published the first six books of Euclid in Chinese. Matteo Ricci explained the Latin aloud, and Xu Guangqi wrote it down in classical Chinese.</p>
        <p class="meta" style="--d:2">General Translation · ${issue.dateShort} · ${issue.minutes} min</p>
        <ol class="at-notes-list" style="--d:3"></ol>
        <div class="acts" style="--d:4"><a class="at-btn primary at-read" href="${issue.href}">Read <span aria-hidden="true">→</span></a><button type="button" class="at-btn ghost at-open">Open the book</button></div>
      </aside>
    </div>`
  );
  const chrome = furniture(root, core, { label: 'Book', toggle: (open) => setOpen(open) });
  const wrap = $('.at-wrap', root);
  const book = $('.at-book', root);
  const body = $('.at-body', root);
  const title = $('.at-title', root);
  const spineT = $('.at-spine .t', root);
  const front = $('.at-front', root);
  $('.at-inside', root).insertAdjacentHTML('afterbegin', jihe('Book I, first page · after the Beijing edition, 1607'));
  const jp = $('.at-inside .jp', root);

  // contents
  $('.at-notes-list', root).innerHTML = issue.chapters
    .map((c) => `<li><a href="${c.href}"><span class="n">${c.n}</span><span lang="${c.lang}">${c.text}</span></a></li>`)
    .join('');
  $('.at-p1-list', root).innerHTML = issue.chapters
    .map((c) => `<li><span class="n">${c.n}</span><span class="t" lang="${c.lang}">${c.text}</span><small>${c.note}</small></li>`)
    .join('');

  function renderTitle(l: TitleLang, swap: boolean) {
    applyLang(title, l);
    title.textContent = l.title;
    title.toggleAttribute('data-long', l.title.length > 57 && l.script === 'latn');
    splitWords(title);
    title.classList.remove('is-swap', 'is-intro');
    void title.offsetWidth;
    title.classList.add(swap ? 'is-swap' : 'is-intro');
    spineT.textContent = l.title;
    applyLang(spineT, l);
  }

  // the book leans toward the pointer and the sheen follows it
  let rx = 0;
  let ry = 0;
  let trx = 0;
  let tryY = 0;
  let sx = 30;
  let sy = 20;
  let tsx = 30;
  let tsy = 20;
  let raf = 0;
  let running = false;
  function tick() {
    rx = lerp(rx, trx, 0.08);
    ry = lerp(ry, tryY, 0.08);
    sx = lerp(sx, tsx, 0.08);
    sy = lerp(sy, tsy, 0.08);
    body.style.setProperty('--rx', `${rx.toFixed(3)}deg`);
    body.style.setProperty('--ry', `${ry.toFixed(3)}deg`);
    front.style.setProperty('--sx', `${sx.toFixed(1)}%`);
    front.style.setProperty('--sy', `${sy.toFixed(1)}%`);
    if (running) raf = requestAnimationFrame(tick);
  }
  function onMove(e: PointerEvent) {
    if (reduced() || coarse()) return;
    const nx = e.clientX / innerWidth - 0.5;
    const ny = e.clientY / innerHeight - 0.5;
    const k = open ? 0.35 : 1;
    tryY = nx * 14 * k;
    trx = -ny * 9 * k;
    tsx = 50 + nx * 90;
    tsy = 40 + ny * 90;
  }

  // open and close: the spine moves to the centre and the spread scales to fit
  let open = false;
  let stopT: (() => void) | null = null;
  let o = 0;
  function layout() {
    const bw = wrap.offsetWidth;
    const pad = Math.max(16, innerWidth * 0.035);
    const fit = Math.min(1, (innerWidth - 2 * pad) / (2 * bw));
    root.style.setProperty('--fit', fit.toFixed(4));
    root.style.setProperty('--dx', `${(innerWidth / 2 - wrap.offsetLeft).toFixed(1)}px`);
  }
  function setOpen(v: boolean) {
    if (v === open) return;
    open = v;
    root.classList.toggle('is-open', open);
    book.setAttribute('aria-pressed', String(open));
    book.setAttribute('aria-label', open ? 'Close the book' : 'Open the book');
    chrome.setOpen(open);
    $('.at-open', root).textContent = open ? 'Close the book' : 'Open the book';
    layout();
    stopT?.();
    const from = o;
    const to = open ? 1 : 0;
    if (open) {
      jp.classList.remove('is-writing');
      void jp.offsetWidth;
      jp.classList.add('is-writing');
    }
    tryY = trx = 0;
    stopT = tween(
      1250,
      (e) => {
        o = lerp(from, to, e);
        root.style.setProperty('--o', o.toFixed(4));
      },
      { ease: E.io3 }
    );
  }
  book.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) return;
    setOpen(!open);
  });
  book.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(!open);
    }
  });
  $('.at-open', root).addEventListener('click', () => setOpen(!open));
  core.onLang((l) => renderTitle(l, true));

  core.register(SLUG, root, {
    enter() {
      renderTitle(core.L(), false);
      chrome.refresh();
      running = true;
      raf = requestAnimationFrame(tick);
      addEventListener('pointermove', onMove);
      layout();
    },
    leave() {
      running = false;
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', onMove);
      stopT?.();
      if (open) {
        open = false;
        o = 0;
        root.style.setProperty('--o', '0');
        root.classList.remove('is-open');
        chrome.setOpen(false);
        book.setAttribute('aria-pressed', 'false');
        book.setAttribute('aria-label', 'Open the book');
        $('.at-open', root).textContent = 'Open the book';
      }
    },
    key(e) {
      if (e.key === 'ArrowRight') setOpen(true);
      else if (e.key === 'ArrowLeft' || e.key === 'Escape') setOpen(false);
    },
    resize() {
      layout();
    },
  });
}
