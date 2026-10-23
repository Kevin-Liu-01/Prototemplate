/* 07 Measure. A drafting sheet: Book I, Proposition 47 in heavy black on a
   dashed field, the squares on the sides wiped in and dimensioned 30, 40
   and 50, the reference plate at the upper right and a title block in the
   corner. A click draws the proof again. */

import { $, $$, E, coord, reduced, tween, type Core } from '../core';
import { BEIJING, PICTURES } from '../data';
import { findDirection } from '../registry';

const SLUG = 'measure';
const SVG_NS = 'http://www.w3.org/2000/svg';

type Point = [number, number];

export function measure(core: Core) {
  const d = findDirection(SLUG)!;
  const { issue } = core;
  const root = core.section(
    SLUG,
    'v-measure',
    `Direction ${d.label}, ${d.name}`,
    `<svg class="ms-svg" role="img" aria-label="Book I, Proposition 47: the square on the hypotenuse equals the squares on the other two sides, drawn with sides 30, 40 and 50."></svg>
    <figure class="ms-plate" style="--d:1"><img alt="An open copy of Jihe Yuanben, 1607, at the first page of Book I." src="${PICTURES.spread}"><figcaption>Ref. A <span>幾何原本, Book I, Beijing 1607</span></figcaption></figure>
    <div class="ms-tb" style="--d:0">
      <div class="t"><small>Title</small><strong>${issue.title}</strong></div>
      <div><small>Sheet</small>01 / 04</div>
      <div><small>Drawing</small>Book I, Prop. 47</div>
      <div><small>Sides</small>30 · 40 · 50</div>
      <div><small>Date</small>${issue.dateDots}</div>
      <div class="w"><small>Drawn by</small>General Translation, for Atlas · <a href="${issue.href}" class="ms-read">Read the story</a></div>
    </div>
    <p class="ms-c tl"><a href="/atlas"><b>Atlas</b></a><span>No. 01</span></p>
    <p class="ms-c tr"><b data-c="0"></b><b data-c="1"></b></p>
    <p class="ms-c bl">30² + 40² = 50² · Click to draw the proof again</p>`
  );
  const svg = $<SVGSVGElement>('.ms-svg', root);
  const [a, b] = coord.prime(BEIJING.lat, BEIJING.lon);
  $('[data-c="0"]', root).textContent = a;
  $('[data-c="1"]', root).textContent = b;
  let stops: (() => void)[] = [];
  const P = (x: number, y: number) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  const Pp = (p: Point) => P(p[0], p[1]);

  function build() {
    const W = root.clientWidth;
    const H = root.clientHeight;
    const mob = W < 860;
    // units: B(0,0) C(5,0) A(1.8,-2.4), squares outward; the drawing spans x -2.4..7.4, y -5.6..5
    const s = mob ? Math.min((W * 0.86) / 9.8, (H * 0.52) / 10.6) : Math.min((H * 0.78) / 10.6, (W * 0.62) / 9.8);
    const ox = mob ? W * 0.5 - 2.5 * s : -0.6 * s + W * 0.06;
    const oy = mob ? H * 0.16 + 5.6 * s : H * 0.5 - 0.2 * s;
    const X = (u: number) => ox + u * s;
    const Y = (v: number) => oy + v * s;
    const pt = (u: number, v: number): Point => [X(u), Y(v)];
    const A = pt(1.8, -2.4);
    const B = pt(0, 0);
    const C = pt(5, 0);
    const Dm = pt(1.8, 0);
    const sqAB = [A, B, pt(-2.4, -1.8), pt(-0.6, -4.2)];
    const sqAC = [A, C, pt(7.4, -3.2), pt(4.2, -5.6)];
    const recL = [B, Dm, pt(1.8, 5), pt(0, 5)];
    const recR = [Dm, C, pt(5, 5), pt(1.8, 5)];
    const poly = (ps: Point[], cls: string) => `<path class="${cls}" d="M${ps.map(Pp).join('L')}Z"/>`;
    // the dashed field at 45 degrees
    let dash = '';
    for (let c = -H; c < W + H; c += mob ? 80 : 118) dash += `<path class="dash" d="M${P(c, 0)}L${P(c - H, H)}"/>`;
    const guides =
      [A[1], B[1], Y(5)].map((y) => `<path class="guide" d="M0 ${y.toFixed(1)}H${W}"/>`).join('') +
      [B[0], Dm[0], C[0]].map((x) => `<path class="vguide" d="M${x.toFixed(1)} 0V${H}"/>`).join('');
    // a dimension line parallel to a side, offset outward, with ticks, arrowheads and a label box
    const dimLine = (p: Point, q: Point, off: number, label: number, key: string) => {
      const dx = q[0] - p[0];
      const dy = q[1] - p[1];
      const L = Math.hypot(dx, dy);
      const nx = (-dy / L) * off;
      const ny = (dx / L) * off;
      const p1: Point = [p[0] + nx, p[1] + ny];
      const q1: Point = [q[0] + nx, q[1] + ny];
      const m: Point = [(p1[0] + q1[0]) / 2, (p1[1] + q1[1]) / 2];
      const t = 7;
      const tx = (-dy / L) * t;
      const ty = (dx / L) * t;
      const ah = (o: Point, dir: Point) => {
        const ux = (dir[0] / L) * 8;
        const uy = (dir[1] / L) * 8;
        const vx = -uy * 0.45;
        const vy = ux * 0.45;
        return `M${P(o[0] + ux + vx, o[1] + uy + vy)}L${Pp(o)}L${P(o[0] + ux - vx, o[1] + uy - vy)}`;
      };
      return `<g class="dimg" data-k="${key}">
        <path class="tick" d="M${P(p[0] + nx * 0.25, p[1] + ny * 0.25)}L${P(p1[0] + tx, p1[1] + ty)}M${P(q[0] + nx * 0.25, q[1] + ny * 0.25)}L${P(q1[0] + tx, q1[1] + ty)}"/>
        <path class="dim" d="M${Pp(p1)}L${Pp(q1)}${ah(p1, [dx, dy])}${ah(q1, [-dx, -dy])}"/>
        <g class="lbl" transform="translate(${Pp(m)})"><rect x="-15" y="-9" width="30" height="18"/><text data-to="${label}">${label}</text></g></g>`;
    };
    const centre = (ps: Point[]): Point => [ps.reduce((sum, p) => sum + p[0], 0) / ps.length, ps.reduce((sum, p) => sum + p[1], 0) / ps.length];
    const area = (ps: Point[], cls: string, n: number) => {
      const [x, y] = centre(ps);
      return `<text class="area ${cls}" x="${x}" y="${y}">${n}</text>`;
    };
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = `<g class="field">${dash}${guides}</g>
      <g class="fig">
        ${poly(sqAB, 'sq s1')}${poly(sqAC, 'sq s2')}${poly(recL, 'sq s3')}${poly(recR, 'sq s4')}
        <path class="alt" d="M${Pp(A)}L${P(X(1.8), Y(5))}"/>
        ${area(sqAB, 'a1', 900)}${area(sqAC, 'a2', 1600)}${area(recL, 'a3', 900)}${area(recR, 'a4', 1600)}
        <text class="pt" x="${A[0] - 5}" y="${A[1] - 12}">甲</text>
        <text class="pt" x="${B[0] - 20}" y="${B[1] + 4}">乙</text>
        <text class="pt" x="${C[0] + 8}" y="${C[1] + 4}">丙</text>
      </g>
      <g class="dims">
        ${dimLine(pt(0, 0), pt(1.8, -2.4), 24, 30, 'ab')}
        ${dimLine(pt(4.2, -5.6), pt(7.4, -3.2), -26, 40, 'ac')}
        ${dimLine(pt(0, 5), pt(5, 5), 30, 50, 'bc')}
      </g>`;
    // the reference plate sits at the upper right
    const plate = $('.ms-plate', root);
    if (!mob) {
      plate.style.width = `${Math.min(W * 0.21, 330)}px`;
      plate.style.right = 'max(16px, 3.4vw)';
      plate.style.top = `${H * 0.2}px`;
    }
  }
  /** Wipes a filled shape in from its left edge, or from its top. */
  function fillWipe(sel: string, dur: number, delay: number, dir?: 'down') {
    const el = svg.querySelector<SVGGraphicsElement>(sel);
    if (!el) return;
    const bb = el.getBBox();
    const cp = document.createElementNS(SVG_NS, 'clipPath');
    cp.id = `ms-clip-${sel.replace(/\W/g, '')}`;
    const r = document.createElementNS(SVG_NS, 'rect');
    cp.appendChild(r);
    svg.appendChild(cp);
    el.setAttribute('clip-path', `url(#${cp.id})`);
    const set = (e: number) => {
      if (dir === 'down') {
        r.setAttribute('x', String(bb.x - 2));
        r.setAttribute('y', String(bb.y - 2));
        r.setAttribute('width', String(bb.width + 4));
        r.setAttribute('height', String((bb.height + 4) * e));
      } else {
        r.setAttribute('y', String(bb.y - 2));
        r.setAttribute('height', String(bb.height + 4));
        r.setAttribute('x', String(bb.x - 2));
        r.setAttribute('width', String((bb.width + 4) * e));
      }
    };
    set(0);
    stops.push(tween(dur, set, { ease: E.io3, delay }));
  }
  function fadeIn(sel: string, dur: number, delay: number) {
    $$<SVGElement>(sel, svg).forEach((el) => {
      el.style.opacity = '0';
      stops.push(tween(dur, (e) => (el.style.opacity = String(e)), { delay }));
    });
  }
  function run() {
    stops.forEach((f) => f());
    stops = [];
    build();
    if (reduced()) return;
    const field = $<SVGGElement>('.field', svg);
    field.style.opacity = '0';
    stops.push(tween(1000, (e) => (field.style.opacity = String(e)), { delay: 50 }));
    fillWipe('.s1', 800, 500);
    fillWipe('.s2', 800, 950);
    fillWipe('.s3', 900, 1600, 'down');
    fillWipe('.s4', 900, 2000, 'down');
    fadeIn('.a1', 500, 1200);
    fadeIn('.a2', 500, 1650);
    fadeIn('.a3', 500, 2350);
    fadeIn('.a4', 500, 2750);
    fadeIn('.alt', 600, 2900);
    fadeIn('.pt', 600, 1300);
    $$<SVGGElement>('.dimg', svg).forEach((g, i) => {
      g.style.opacity = '0';
      const tx = $<SVGTextElement>('text', g);
      const to = Number(tx.dataset.to);
      stops.push(
        tween(
          900,
          (e) => {
            g.style.opacity = String(Math.min(1, e * 2));
            tx.textContent = String(Math.round(to * e));
          },
          { delay: 2600 + i * 220, ease: E.out3 }
        )
      );
    });
  }
  root.addEventListener('click', (e) => {
    if (!(e.target as Element).closest('a, button')) run();
  });

  core.register(SLUG, root, {
    enter() {
      run();
    },
    leave() {
      stops.forEach((f) => f());
      stops = [];
    },
    resize() {
      stops.forEach((f) => f());
      stops = [];
      build();
    },
  });
}
