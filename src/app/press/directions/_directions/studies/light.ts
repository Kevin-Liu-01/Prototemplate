/* 05 Light poster. A column of light opens in the dark, film grain jitters
   over it, and Book I, Proposition 1 is drawn with a compass: two circles on
   a line, the equilateral triangle, the points lettered as in the 1607
   edition. The definitions of point and line type themselves above and
   below. */

import { $, $$, E, coord, reduced, tween, type Ease, type Core } from '../core';
import { BEIJING } from '../data';
import { findDirection } from '../registry';

const SLUG = 'light';

type Point = [number, number];

export function light(core: Core) {
  const d = findDirection(SLUG)!;
  const root = core.section(
    SLUG,
    'v-light',
    `Direction ${d.label}, ${d.name}`,
    `<div class="lt-light" aria-hidden="true"><i class="lt-glow t"></i><i class="lt-glow b"></i><i class="lt-beam"></i><i class="lt-vig"></i></div>
    <svg class="lt-svg" aria-hidden="true"></svg>
    <div class="lt-grain" aria-hidden="true"></div>
    <p class="lt-head">ELEMENTS IN CHINESE<b><span>06</span><span>/</span><span>13</span></b></p>
    <p class="lt-txt lt-up"><span class="lt-type" style="--n:5;--at:4.1s">point</span><span class="lt-type" style="--n:25;--at:4.4s">is that which has no part</span></p>
    <p class="lt-txt lt-dn"><span class="lt-type" style="--n:4;--at:5.2s">line</span><span class="lt-type" style="--n:21;--at:5.4s">is breadthless length</span></p>
    <p class="lt-c tl">Atlas No. 01</p>
    <p class="lt-c tr"><span data-c="0"></span><br><span data-c="1"></span></p>
    <div class="lt-c bl"><h1>${core.issue.title}</h1><p>Book I, Proposition 1: on a given finite straight line, to construct an equilateral triangle. Points lettered 甲 乙 丙 丁, as in the 1607 edition. Six of the thirteen books were translated that year.</p></div>
    <p class="lt-c br">General Translation<br>Click to draw it again</p>`
  );
  const svg = $<SVGSVGElement>('.lt-svg', root);
  const [la, lb] = coord.prime(BEIJING.lat, BEIJING.lon);
  $('[data-c="0"]', root).textContent = `Beijing ${la}`;
  $('[data-c="1"]', root).textContent = lb;

  /* film grain: one noise tile, moved every few frames */
  const grain = $('.lt-grain', root);
  {
    const c = document.createElement('canvas');
    c.width = c.height = 220;
    const g = c.getContext('2d')!;
    const img = g.createImageData(220, 220);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    grain.style.backgroundImage = `url(${c.toDataURL()})`;
  }
  let graf = 0;
  let gl = 0;
  function jitter(now: number) {
    graf = requestAnimationFrame(jitter);
    if (now - gl < 55) return;
    gl = now;
    grain.style.transform = `translate(${(Math.random() * 120) | 0}px, ${(Math.random() * 120) | 0}px)`;
  }

  /* the construction */
  let geo: { A: Point; B: Point; C: Point; D: Point; r: number } | null = null;
  let stops: (() => void)[] = [];
  function build() {
    const W = root.clientWidth;
    const H = root.clientHeight;
    const mob = W < 760;
    const r = mob ? Math.min(W * 0.34, H * 0.2) : Math.min(H * 0.34, W * 0.28);
    const cx = W / 2;
    const cy = H * (mob ? 0.45 : 0.53);
    const A: Point = [cx - r / 2, cy];
    const B: Point = [cx + r / 2, cy];
    const h = (r * Math.sqrt(3)) / 2;
    const C: Point = [cx, cy - h];
    const D: Point = [cx, cy + h];
    // the line through P and Q, carried far past the screen
    const ext = (P: Point, Q: Point) => {
      const dx = Q[0] - P[0];
      const dy = Q[1] - P[1];
      const k = (4 * Math.max(W, H)) / Math.hypot(dx, dy);
      return `M${P[0] - dx * k} ${P[1] - dy * k}L${P[0] + dx * k} ${P[1] + dy * k}`;
    };
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = `
      <g class="geo">
        <path class="long" d="${ext(C, A)}"/><path class="long" d="${ext(C, B)}"/><path class="long" d="${ext(D, A)}"/><path class="long" d="${ext(D, B)}"/>
        <path class="ca" d="M${A[0] + r} ${A[1]}A${r} ${r} 0 1 0 ${A[0] - r} ${A[1]}A${r} ${r} 0 1 0 ${A[0] + r} ${A[1]}"/>
        <path class="cb" d="M${B[0] - r} ${B[1]}A${r} ${r} 0 1 1 ${B[0] + r} ${B[1]}A${r} ${r} 0 1 1 ${B[0] - r} ${B[1]}"/>
        <path class="ab" d="M${A[0]} ${A[1]}L${B[0]} ${B[1]}"/>
        <path class="tri" d="M${A[0]} ${A[1]}L${C[0]} ${C[1]}L${B[0]} ${B[1]}"/>
        <circle class="pt pa" cx="${A[0]}" cy="${A[1]}" r="2.6"/><circle class="pt pb" cx="${B[0]}" cy="${B[1]}" r="2.6"/>
        <text class="lab" x="${A[0] - 18}" y="${A[1] + 18}">甲</text><text class="lab" x="${B[0] + 7}" y="${B[1] + 18}">乙</text>
        <text class="lab" x="${C[0] + 12}" y="${C[1] - 8}">丙</text><text class="lab" x="${D[0] + 10}" y="${D[1] + 20}">丁</text>
      </g>
      <circle class="dot" cx="${C[0]}" cy="${C[1]}" r="${mob ? 6 : 8}"/>`;
    const up = $('.lt-up', root);
    const dn = $('.lt-dn', root);
    up.style.left = dn.style.left = `${cx}px`;
    up.style.top = `${C[1] - (mob ? 74 : 92)}px`;
    dn.style.top = `${D[1] + (mob ? 20 : 28)}px`;
    geo = { A, B, C, D, r };
  }
  function draw(sel: string, dur: number, delay: number, ease: Ease = E.io2) {
    const els = $$<SVGGeometryElement>(sel, svg);
    const lengths = els.map((el) => {
      const len = el.getTotalLength();
      el.style.strokeDasharray = String(len);
      el.style.strokeDashoffset = String(len);
      return len;
    });
    stops.push(tween(dur, (e) => els.forEach((el, i) => (el.style.strokeDashoffset = String(lengths[i]! * (1 - e)))), { ease, delay }));
  }
  function fade(sel: string, dur: number, delay: number, from = 0) {
    const els = $$<SVGElement>(sel, svg);
    els.forEach((el) => (el.style.opacity = String(from)));
    stops.push(tween(dur, (e) => els.forEach((el) => (el.style.opacity = String(from + (1 - from) * e))), { ease: E.out3, delay }));
  }
  function construct(t0 = 1300) {
    stops.forEach((s) => s());
    stops = [];
    build();
    $$<SVGElement>('.long', svg).forEach((el) => (el.style.opacity = '.55'));
    fade('.pt', 500, t0);
    draw('.ab', 600, t0 + 250);
    draw('.ca', 1300, t0 + 750, E.io3);
    draw('.cb', 1300, t0 + 1150, E.io3);
    const dot = $<SVGCircleElement>('.dot', svg);
    dot.style.transformOrigin = `${geo!.C[0]}px ${geo!.C[1]}px`;
    dot.style.transform = 'scale(0)';
    stops.push(tween(700, (e) => (dot.style.transform = `scale(${e})`), { ease: E.outBack, delay: t0 + 2300 }));
    draw('.tri', 900, t0 + 2550);
    draw('.long', 1500, t0 + 3000, E.out3);
    fade('.lab', 700, t0 + 2600);
  }
  root.addEventListener('click', (e) => {
    if (!(e.target as Element).closest('a, button')) construct(150);
  });

  core.register(SLUG, root, {
    enter() {
      const beam = $('.lt-beam', root);
      beam.classList.remove('breathe');
      window.setTimeout(() => {
        if (core.current === SLUG) beam.classList.add('breathe');
      }, 2400);
      construct();
      if (!reduced()) graf = requestAnimationFrame(jitter);
    },
    leave() {
      cancelAnimationFrame(graf);
      stops.forEach((s) => s());
      stops = [];
    },
    pause() {
      cancelAnimationFrame(graf);
    },
    resume() {
      if (core.current === SLUG && !reduced()) graf = requestAnimationFrame(jitter);
    },
    resize() {
      stops.forEach((s) => s());
      stops = [];
      build();
    },
  });
}
