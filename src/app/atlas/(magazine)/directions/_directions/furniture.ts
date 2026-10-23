/* The current site's edge furniture, which the Riffle and Atlas book
   directions keep: the Atlas mark, the coordinates of the title's city, the
   topics, a dotted globe that turns to that city, the language buttons and
   the closed or open toggle. */

import { $, $$, clamp, coord, lerp, reduced, type Core } from './core';
import { TITLE_LANGS } from './data';

/** The Atlas mark: a book with the GT glyph cut into its cover. `cut` is the colour of the cut. */
export const atlasMark = (cut: string) =>
  `<svg viewBox="0 0 34 46" aria-hidden="true"><path d="M2 3.5v40.5h28" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="5" y="0.5" width="28.5" height="41" rx="1.2" fill="currentColor"/><g transform="translate(7.6 4) scale(.34)" fill="none" style="stroke:${cut}"><path d="M21.04 7.25A10.5 10.5 0 1 0 23.5 14H15.5" stroke-width="3.6"/><path d="M25 3.5H42M33.5 3.5V24.5" stroke-width="3.6"/></g></svg>`;

/** A dotted globe on a canvas that turns to a city; the city of the title's language is lit in the accent. */
export function globe(c: HTMLCanvasElement, core: Core) {
  const g = c.getContext('2d')!;
  const W = c.width;
  const R = W * 0.44;
  let lon = -122;
  let lat = 20;
  let tl = lon;
  let tt = lat;
  let raf = 0;
  let accent = '';
  const pts: [number, number][] = [];
  for (let la = -80; la <= 80; la += 10) {
    const n = Math.max(6, Math.round(36 * Math.cos((la * Math.PI) / 180)));
    for (let i = 0; i < n; i++) pts.push([la, -180 + (i * 360) / n]);
  }
  const proj = (la: number, lo: number): [number, number, number] => {
    const r = Math.PI / 180;
    const ph = la * r;
    const th = (lo - lon) * r;
    const c0 = lat * r;
    return [
      W / 2 + Math.cos(ph) * Math.sin(th) * R,
      W / 2 - (Math.cos(c0) * Math.sin(ph) - Math.sin(c0) * Math.cos(ph) * Math.cos(th)) * R,
      Math.sin(c0) * Math.sin(ph) + Math.cos(c0) * Math.cos(ph) * Math.cos(th),
    ];
  };
  function draw() {
    accent ||= getComputedStyle(c).getPropertyValue('--accent').trim();
    g.clearRect(0, 0, W, W);
    for (const [la, lo] of pts) {
      const [x, y, z] = proj(la, lo);
      if (z < 0) continue;
      g.fillStyle = `rgba(150,170,255,${0.18 + z * 0.55})`;
      g.fillRect(x - 1.1, y - 1.1, 2.2, 2.2);
    }
    for (const l of TITLE_LANGS) {
      const [x, y, z] = proj(l.lat, l.lon);
      if (z < 0.05) continue;
      const on = l.code === core.lang;
      g.fillStyle = on ? accent : 'rgba(241,239,233,.7)';
      g.beginPath();
      g.arc(x, y, on ? 4.6 : 2, 0, Math.PI * 2);
      g.fill();
    }
  }
  function loop() {
    lon = lerp(lon, tl, 0.06);
    lat = lerp(lat, tt, 0.06);
    draw();
    raf = Math.abs(lon - tl) > 0.05 || Math.abs(lat - tt) > 0.05 ? requestAnimationFrame(loop) : 0;
  }
  return {
    draw,
    to(lo: number, la: number) {
      let d = lo - lon;
      d = ((d + 540) % 360) - 180;
      tl = lon + d;
      tt = clamp(la * 0.6, -30, 35);
      if (reduced()) {
        lon = tl;
        lat = tt;
        draw();
        return;
      }
      if (!raf) raf = requestAnimationFrame(loop);
    },
  };
}

/**
 * Puts the furniture on a direction's section: the mark and the coordinates
 * and topics at the top, the globe, the city and the language buttons at the
 * bottom left, and the toggle at the bottom right. `label` names what the
 * toggle closes and opens.
 */
export function furniture(root: HTMLElement, core: Core, { label, toggle }: { label: string; toggle: (open: boolean) => void }) {
  root.insertAdjacentHTML(
    'afterbegin',
    `<header class="at-tl"><a class="at-logo" href="/atlas" aria-label="Atlas by General Translation">${atlasMark('var(--bg)')}<span>Atlas</span></a></header>
    <div class="at-tr"><p class="at-coord" aria-label="Coordinates"><span data-c="0"></span><span data-c="1"></span></p>
      <ul class="at-topics" aria-label="Topics"><li>Docs</li><li>Design</li><li>Open source</li><li class="on">Translation</li></ul></div>`
  );
  root.insertAdjacentHTML(
    'beforeend',
    `<footer class="at-bl"><canvas class="at-globe" width="116" height="116" aria-hidden="true"></canvas>
      <div><p class="at-city"><b data-city></b><span data-lang-label></span></p><div class="at-langs" aria-label="Language of the title"></div></div></footer>
    <div class="at-br"><div class="at-toggle" role="group" aria-label="${label}">
      <button type="button" data-o="0" aria-pressed="true" aria-label="Closed"><svg viewBox="0 0 18 14" aria-hidden="true"><rect x="5" y="1" width="8" height="12" rx="1" fill="currentColor"/></svg></button>
      <button type="button" data-o="1" aria-pressed="false" aria-label="Open"><svg viewBox="0 0 18 14" aria-hidden="true"><rect x="1" y="1" width="7.4" height="12" rx="1" fill="currentColor"/><rect x="9.6" y="1" width="7.4" height="12" rx="1" fill="currentColor"/></svg></button>
    </div></div>`
  );
  core.langButtons($('.at-langs', root));
  const gl = globe($<HTMLCanvasElement>('.at-globe', root), core);
  const update = () => {
    const l = core.L();
    const [a, b] = coord.site(l.lat, l.lon);
    $('[data-c="0"]', root).textContent = a;
    $('[data-c="1"]', root).textContent = b;
    $('[data-city]', root).textContent = l.city;
    $('[data-lang-label]', root).textContent = l.label;
    gl.to(l.lon, l.lat);
  };
  core.onLang(update);
  $$('.at-toggle button', root).forEach((b) => b.addEventListener('click', () => toggle(b.dataset.o === '1')));
  return {
    refresh() {
      update();
      gl.draw();
    },
    setOpen(open: boolean) {
      $$('.at-toggle button', root).forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.o === '1') === open)));
    },
  };
}
