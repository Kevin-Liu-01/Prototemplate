/* 06 Route. Wayfinding signage for Matteo Ricci's road from Macau to
   Peking: guide lines at the sign's cap and base lines, a lime block, and a
   sign that changes stop by stop, its distance counting up, until it
   arrives at the book. */

import { $, $$, E, coord, reduced, tween, type Core } from '../core';
import { BEIJING, PICTURES, ROUTE, SPREAD_ALT } from '../data';
import { findDirection } from '../registry';

const SLUG = 'route';

type Sign = { name: string; zh: string; km: number | null; kmText?: string; code: string; sub: string; lat: number; lon: number };

export function route(core: Core) {
  const d = findDirection(SLUG)!;
  const { issue } = core;
  const root = core.section(
    SLUG,
    'v-route',
    `Direction ${d.label}, ${d.name}`,
    `<div class="rt-grid" aria-hidden="true"></div>
    <i class="rt-block" aria-hidden="true"></i>
    <p class="rt-head" style="--d:0">${issue.title.replace(' Euclid’s', '<br>Euclid’s')}<br><span>Atlas No. 01 · Journey to Peking</span></p>
    <div class="rt-sign" style="--d:1" aria-live="polite">
      <p class="rt-row r1"><span class="rt-slot" data-k="name"><span></span></span></p>
      <p class="rt-row r2"><span class="rt-slot rt-km" data-k="km"><span></span></span><span class="rt-slot rt-zh" data-k="zh" lang="zh-Hant"><span></span></span></p>
      <p class="rt-row r3"><span class="rt-oval" data-k="code"></span><span class="rt-slot" data-k="sub"><span></span></span></p>
    </div>
    <figure class="rt-fig" style="--d:2"><img alt="${SPREAD_ALT}" src="${PICTURES.spread}"><figcaption>Fig. E1 <span>幾何原本, Book I, Beijing 1607</span></figcaption></figure>
    <div class="rt-strip" style="--d:3" role="group" aria-label="Stops on the route"><i class="track"></i><i class="done"></i></div>
    <header class="rt-c tl"><a href="/atlas">Atlas</a></header>
    <p class="rt-c tr"><span data-c="0"></span><br><span data-c="1"></span></p>
    <p class="rt-c bl"><button type="button" class="rt-replay">Replay the route</button></p>
    <p class="rt-c br grey">Distances: straight-line legs, added up</p>`
  );
  const STOPS: Sign[] = ROUTE.map((c, i) => ({ name: c.name, zh: c.zh, km: c.km, code: String(i + 1).padStart(2, '0'), sub: String(c.year), lat: c.lat, lon: c.lon }));
  const BOOK: Sign = { name: 'Jihe Yuanben', zh: '幾何原本', km: null, kmText: '1607', code: 'E1', sub: 'Euclid’s Elements', lat: BEIJING.lat, lon: BEIJING.lon };
  const strip = $('.rt-strip', root);
  STOPS.forEach((s, i) =>
    strip.insertAdjacentHTML(
      'beforeend',
      `<button type="button" data-i="${i}" aria-label="${s.name}, ${s.sub}"><span class="zh" lang="zh-Hant">${s.zh}</span><i></i><span class="en">${s.name}<span>${s.sub}</span></span></button>`
    )
  );

  function layout() {
    const W = root.clientWidth;
    const H = root.clientHeight;
    const mob = W < 860;
    const u = parseFloat(getComputedStyle(root).getPropertyValue('--u')) || 40;
    const sx = mob ? W * 0.07 : W * 0.2;
    const sy = mob ? H * 0.34 : H * 0.36;
    const sign = $('.rt-sign', root);
    sign.style.left = `${sx}px`;
    sign.style.top = `${sy}px`;
    const rowH = u * 1.22;
    $$('.rt-row', root).forEach((r, i) => (r.style.top = `${i * rowH}px`));
    const blk = $('.rt-block', root);
    const bx = mob ? W * 0.04 : sx - u * 3.4;
    const bw = mob ? W * 0.56 : u * 7.4;
    blk.style.left = `${bx}px`;
    blk.style.width = `${bw}px`;
    blk.style.top = `${sy - u * 3.8}px`;
    blk.style.height = `${u * 3.8 + rowH * 1.82}px`;
    const head = $('.rt-head', root);
    head.style.left = `${mob ? W * 0.07 : bx}px`;
    head.style.top = `${sy - u * 3.8 - (mob ? 74 : 86)}px`;
    // between about 860 and 1150 pixels wide the head reaches the corner mark; the head names the issue, so the mark gives way
    const mark = $('.rt-c.tl', root);
    mark.style.visibility = '';
    const hb = head.getBoundingClientRect();
    const mb = mark.getBoundingClientRect();
    if (hb.left < mb.right + 12 && hb.top < mb.bottom + 8 && hb.bottom > mb.top - 8) mark.style.visibility = 'hidden';
    const fig = $('.rt-fig', root);
    if (mob) fig.style.display = 'none';
    else {
      fig.style.display = '';
      fig.style.left = `${W * 0.66}px`;
      fig.style.width = `${W * 0.2}px`;
      fig.style.top = `${sy - u * 3.8}px`;
    }
    strip.style.left = `${mob ? W * 0.1 : W * 0.2}px`;
    strip.style.right = `${mob ? W * 0.1 : W * 0.14}px`;
    strip.style.top = `${mob ? H * 0.74 : H * 0.79}px`;
    strip.style.height = '2px';
    const sw = strip.clientWidth;
    $$('button', strip).forEach((b, i) => (b.style.left = `${(i / (STOPS.length - 1)) * sw}px`));
    // guide lines: the base and cap lines of each row, the block's edges, the figure's edges
    const ys: number[] = [];
    $$('.rt-row', root).forEach((_, i) => {
      const top = sy + i * rowH;
      ys.push(top + u * 0.14, top + u * 0.86);
    });
    const xs = [bx, bx + 12, sx, mob ? W * 0.93 : W * 0.66, mob ? W * 0.93 + 10 : W * 0.86, mob ? 0 : W * 0.86 + 10];
    $('.rt-grid', root).innerHTML =
      xs
        .filter((x) => x > 0)
        .map((x, i) => `<i class="gv" style="left:${x}px;--d:${i}"></i>`)
        .join('') + ys.map((y, i) => `<i class="gh" style="top:${y}px;--d:${i}"></i>`).join('');
  }

  let cur = -1;
  let kmNow = 0;
  let stopKm: (() => void) | null = null;
  let timer = 0;
  let auto = true;
  function setSlot(k: string, text: string, animate: boolean) {
    const s = $(`[data-k="${k}"]`, root);
    if (s.classList.contains('rt-oval')) {
      s.textContent = text;
      return;
    }
    s.innerHTML = `<span>${text}</span>`;
    if (animate) {
      s.classList.remove('flip');
      void s.offsetWidth;
      s.classList.add('flip');
    }
  }
  const kmFmt = (v: number) => `${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KM`;
  function show(i: number, animate = true) {
    const s = i < 0 || i >= STOPS.length ? BOOK : STOPS[i]!;
    const isBook = s === BOOK;
    setSlot('name', s.name, animate);
    setSlot('zh', s.zh, animate);
    setSlot('code', s.code, false);
    setSlot('sub', s.sub, animate);
    stopKm?.();
    if (isBook || s.km === null) setSlot('km', s.kmText ?? '', animate);
    else {
      const from = kmNow;
      const to = s.km;
      if (!animate || reduced()) {
        kmNow = to;
        setSlot('km', kmFmt(to), animate);
      } else {
        setSlot('km', kmFmt(from), false);
        const el = $('[data-k="km"] > span', root);
        stopKm = tween(
          900,
          (e) => {
            kmNow = from + (to - from) * e;
            el.textContent = kmFmt(kmNow);
          },
          { ease: E.io2 }
        );
      }
    }
    cur = i;
    const on = isBook ? STOPS.length - 1 : i;
    $$('button', strip).forEach((b, j) => {
      b.classList.toggle('on', j === on && !isBook);
      b.classList.toggle('past', j < on || isBook);
    });
    $('.done', strip).style.width = `${(on / (STOPS.length - 1)) * 100}%`;
    const [a, b] = coord.prime(s.lat, s.lon);
    $('[data-c="0"]', root).textContent = a;
    $('[data-c="1"]', root).textContent = b;
  }
  function play(from = 0) {
    clearTimeout(timer);
    auto = true;
    kmNow = 0;
    let i = from;
    const step = () => {
      if (!auto || core.current !== SLUG) return;
      show(i);
      i++;
      timer =
        i <= STOPS.length - 1
          ? window.setTimeout(step, 1700)
          : window.setTimeout(() => {
              if (auto) show(STOPS.length);
            }, 2200);
    };
    timer = window.setTimeout(step, 1300);
  }
  strip.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('button');
    if (!b) return;
    auto = false;
    clearTimeout(timer);
    show(Number(b.dataset.i));
  });
  $('.rt-replay', root).addEventListener('click', () => {
    show(0, false);
    play(1);
  });

  core.register(SLUG, root, {
    enter() {
      layout();
      kmNow = 0;
      show(0, false);
      if (reduced()) show(STOPS.length, false);
      else play(1);
    },
    leave() {
      clearTimeout(timer);
      auto = false;
      stopKm?.();
    },
    key(e) {
      if (e.key === 'ArrowRight') {
        auto = false;
        clearTimeout(timer);
        show(Math.min(STOPS.length, cur + 1));
      }
      if (e.key === 'ArrowLeft') {
        auto = false;
        clearTimeout(timer);
        show(Math.max(0, cur - 1));
      }
    },
    resize() {
      layout();
    },
  });
}
