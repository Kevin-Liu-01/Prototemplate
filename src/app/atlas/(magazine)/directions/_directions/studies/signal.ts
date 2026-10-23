/* 03 Signal. The GT poster: a field of Morse that spells Euclid's first
   definition, the definition in the five languages that carried it, and the
   coordinates of each version's city in large type, rolling digit by digit
   when the language changes. */

import { $, $$, coord, p2, reduced, type Core } from '../core';
import { DEFS, type Definition } from '../data';
import { findDirection } from '../registry';

const SLUG = 'signal';

const MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--',
  N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
};
const MESSAGE = 'A POINT IS THAT WHICH HAS NO PART';

/** The message as cells: 1 a dot (one cell), 2 a dash (two cells), 0 a gap. */
function stream(): number[] {
  const out: number[] = [];
  for (const word of MESSAGE.split(' ')) {
    for (const ch of word) {
      for (const s of MORSE[ch] ?? '') out.push(s === '.' ? 1 : 2);
      out.push(0);
    }
    out.push(0, 0, 0);
  }
  return out;
}

type Mark = { x: number; y: number; s: number; r: number; c: number };

export function signal(core: Core) {
  const d = findDirection(SLUG)!;
  const root = core.section(
    SLUG,
    'v-signal',
    `Direction ${d.label}, ${d.name}`,
    `<canvas class="sg-field" aria-hidden="true"></canvas>
    <header class="sg-tl">
      <p class="sg-copy">© 2026 General Translation, Inc.<br>All rights reserved.</p>
      <h1 class="sg-title"><a href="${core.issue.href}">Atlas No. 01</a><br>${core.issue.title}</h1>
    </header>
    <ol class="sg-nums" aria-label="Five versions of the first definition"></ol>
    <div class="sg-chips" role="group" aria-label="Show the definition in"></div>
    <div class="sg-lines" aria-live="polite">
      <p class="sg-sm s0"></p><p class="sg-sm s1"></p>
      <div class="sg-big"><p></p></div>
      <p class="sg-sm s2"></p><p class="sg-sm s3"></p>
    </div>
    <div class="sg-coord" aria-label="Coordinates"><div><span class="v0"></span><span class="h h0"></span></div><div><span class="v1"></span><span class="h h1"></span></div></div>
    <p class="sg-legend">·− ·−−· −−− ·· −· −<br><span>The field is Morse for “A point is that which has no part”</span></p>`
  );
  const canvas = $<HTMLCanvasElement>('.sg-field', root);
  const g = canvas.getContext('2d')!;

  /* the Morse field */
  const STREAM = stream();
  let marks: Mark[] = [];
  let cell = 24;
  let W = 0;
  let H = 0;
  let dpr = 1;
  let raf = 0;
  let tIntro = 0;
  let pulse = -1;
  function layout() {
    W = root.clientWidth;
    H = root.clientHeight;
    dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    cell = Math.round(Math.max(15, Math.min(27, Math.min(W, H) / 33)));
    const cols = Math.floor((W - cell) / cell);
    const rows = Math.floor((H - cell * 0.6) / cell);
    const ox = (W - cols * cell) / 2 + cell / 2;
    const oy = (H - rows * cell) / 2 + cell / 2;
    marks = [];
    let k = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; ) {
        const s = STREAM[k % STREAM.length]!;
        if (s === 2 && c === cols - 1) {
          c++;
          continue;
        }
        if (s) marks.push({ x: ox + c * cell, y: oy + r * cell, s, r, c });
        c += s === 2 ? 2 : 1;
        k++;
      }
    }
  }
  function draw(now: number) {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#fff';
    const rad = cell * 0.17;
    const t = now - tIntro;
    for (const m of marks) {
      let a = reduced() ? 1 : Math.min(1, Math.max(0, (t - m.r * 34 - m.c * 5) / 260));
      if (pulse >= 0) {
        const dt = now - pulse - m.c * 9 - m.r * 2;
        if (dt > 0 && dt < 340) a *= Math.abs(Math.cos((dt / 340) * Math.PI));
      }
      if (a <= 0) continue;
      g.globalAlpha = a;
      g.beginPath();
      if (m.s === 1) g.arc(m.x, m.y, rad * (0.6 + 0.4 * a), 0, Math.PI * 2);
      else g.roundRect(m.x - rad, m.y - rad, (cell + rad * 2) * (0.4 + 0.6 * a), rad * 2, rad);
      g.fill();
    }
    g.globalAlpha = 1;
  }
  let loopOn = false;
  function loop(now: number) {
    draw(now);
    const intro = now - tIntro < 3000;
    const pulsing = pulse >= 0 && now - pulse < 1600;
    if (pulse >= 0 && !pulsing) pulse = -1;
    if ((intro || pulsing) && loopOn) raf = requestAnimationFrame(loop);
    else loopOn = false;
  }
  function kick() {
    if (!loopOn) {
      loopOn = true;
      raf = requestAnimationFrame(loop);
    }
  }

  /* coordinates whose changed digits roll over */
  const rollTimers = new Map<HTMLElement, number>();
  function roll(el: HTMLElement, next: string) {
    const prev = el.dataset.v ?? '';
    el.dataset.v = next;
    if (!prev || reduced()) {
      el.textContent = next;
      return;
    }
    const n = Math.max(prev.length, next.length);
    const a = prev.padStart(n, ' ');
    const b = next.padStart(n, ' ');
    el.innerHTML = [...b]
      .map((ch, i) =>
        a[i] === ch
          ? ch === ' '
            ? ''
            : ch
          : `<span class="sg-roll" style="--d:${i * 28}ms"><span>${a[i] === ' ' ? '&nbsp;' : a[i]}</span><span>${ch === ' ' ? '' : ch}</span></span>`
      )
      .join('');
    requestAnimationFrame(() => $$('.sg-roll', el).forEach((r) => r.classList.add('go')));
    clearTimeout(rollTimers.get(el));
    rollTimers.set(
      el,
      window.setTimeout(() => {
        el.textContent = next;
      }, 1200)
    );
  }

  /* the five versions */
  const order = ['zh-Hant', 'grc', 'ar', 'la', 'en'];
  let active = order[0]!;
  let auto = 0;
  let autoOn = true;
  const D = (code: string) => DEFS.find((x) => x.code === code) ?? DEFS[0]!;
  $('.sg-nums', root).innerHTML = DEFS.map((x, i) => `<li data-code="${x.code}"><span>${p2(i + 1)}</span><span>${x.city}, ${x.year}</span></li>`).join('');
  $('.sg-chips', root).innerHTML = DEFS.map(
    (x) => `<button type="button" data-code="${x.code}" aria-pressed="false" title="${x.name}, ${x.city} ${x.year}" aria-label="${x.name}">${x.short}</button>`
  ).join('');
  $('.sg-chips', root).addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-code]');
    if (b?.dataset.code) {
      autoOn = false;
      set(b.dataset.code);
    }
  });
  function setText(p: HTMLElement, x: Definition) {
    p.textContent = x.text;
    p.lang = x.code;
    p.dir = x.dir;
  }
  function set(code: string, first = false) {
    active = code;
    const x = D(code);
    const others = DEFS.filter((o) => o.code !== code);
    $$('.sg-sm', root).forEach((p, i) => {
      if (first) return setText(p, others[i]!);
      p.style.opacity = '0';
      window.setTimeout(() => {
        setText(p, others[i]!);
        p.style.opacity = '1';
      }, 300);
    });
    const big = $('.sg-big p', root);
    if (first) setText(big, x);
    else {
      big.classList.remove('in');
      big.classList.add('out');
      window.setTimeout(() => {
        setText(big, x);
        big.classList.remove('out');
        void big.offsetWidth;
        big.classList.add('in');
      }, 290);
    }
    $$('.sg-nums li', root).forEach((li) => li.classList.toggle('on', li.dataset.code === code));
    $$('.sg-chips button', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.code === code)));
    const [[v0, h0], [v1, h1]] = coord.split(x.lat, x.lon);
    roll($('.v0', root), v0);
    roll($('.v1', root), v1);
    $('.h0', root).textContent = h0;
    $('.h1', root).textContent = h1;
    if (!first) {
      pulse = performance.now();
      kick();
    }
  }
  function schedule() {
    clearTimeout(auto);
    if (!autoOn || reduced()) return;
    auto = window.setTimeout(() => {
      if (autoOn && core.current === SLUG) {
        set(order[(order.indexOf(active) + 1) % order.length]!);
        schedule();
      }
    }, 4600);
  }
  set(active, true);

  core.register(SLUG, root, {
    enter() {
      layout();
      tIntro = performance.now();
      kick();
      autoOn = true;
      schedule();
    },
    leave() {
      cancelAnimationFrame(raf);
      loopOn = false;
      clearTimeout(auto);
    },
    key(e) {
      const i = order.indexOf(active);
      if (e.key === 'ArrowRight') {
        autoOn = false;
        set(order[(i + 1) % order.length]!);
      }
      if (e.key === 'ArrowLeft') {
        autoOn = false;
        set(order[(i + order.length - 1) % order.length]!);
      }
    },
    resize() {
      layout();
      draw(performance.now());
    },
  });
}
