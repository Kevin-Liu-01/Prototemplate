/* 04 Proof poster. A printer's proof on grey stock: the wordmark in grey
   type with construction lines at its letter boundaries, labelled with the
   ratio of each letter's width; the figure hung from the cap line; and a
   second page, turned by a click, with the first definition as it
   travelled. */

import { $, $$, Flip, applyLang, coord, type Core } from '../core';
import { DEFS, PICTURES } from '../data';
import { findDirection } from '../registry';

const SLUG = 'proof';

export function proof(core: Core) {
  const d = findDirection(SLUG)!;
  const root = core.section(
    SLUG,
    'v-proof',
    `Direction ${d.label}, ${d.name}`,
    `<div class="pf-flip"></div>
    <p class="pf-chrome tl">Atlas, a press by General Translation<br><i>Proof</i> · <span class="pf-pg">1 / 2</span></p>
    <p class="pf-chrome tr"><span data-c="0"></span><br><span data-c="1"></span></p>
    <div class="pf-chrome bl"><p><i>Title in</i></p><div class="pf-langs" aria-label="Language of the title"></div></div>
    <p class="pf-chrome br">Click the page to turn<br><i>Ratios are the letter widths of the wordmark</i></p>`
  );
  const page1 = () => `<div class="pf-page" data-p="1">
      <div class="pf-lines"></div>
      <h1 class="pf-mark" style="--d:0"><span class="pf-word">Atlas</span><sup>®</sup></h1>
      <p class="pf-sub" style="--d:1"><span class="pf-t1"></span><br><span class="pf-t2">General Translation, San Francisco<span class="gap"></span>No. 01</span></p>
      <figure class="pf-fig" style="--d:0"><img alt="An open copy of Jihe Yuanben, 1607, at the first page of Book I." src="${PICTURES.spread}"><figcaption>Fig. 1. <span lang="zh-Hant">幾何原本</span>, Book I. Beijing, 1607.</figcaption></figure>
    </div>`;
  const page2 = () => `<div class="pf-page" data-p="2">
      <div class="pf-lines"></div>
      <p class="pf-h" style="--d:0">Definition I, as it travelled</p>
      <div class="pf-defs">${DEFS.map((x, i) => `<p class="pf-def" lang="${x.code}" dir="${x.dir}" style="--d:${i + 1}">${x.text}</p><p class="pf-src" style="--d:${i}">${x.city}, ${x.year}</p>`).join('')}</div>
      <a class="pf-read" href="${core.issue.href}" style="--d:6">Read the story</a>
    </div>`;

  const flip = new Flip($('.pf-flip', root), {
    pages: [page1, page2],
    perspective: 2200,
    dur: 1300,
    onChange: (s) => {
      $('.pf-pg', root).textContent = `${s + 1} / 2`;
    },
  });

  /* measure the real glyph boundaries and draw the construction lines on both pages */
  const ctx = document.createElement('canvas').getContext('2d')!;
  function capOf(el: HTMLElement) {
    const cs = getComputedStyle(el);
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    return ctx.measureText('H').actualBoundingBoxAscent;
  }
  function baseline(el: HTMLElement) {
    const probe = document.createElement('span');
    probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    el.appendChild(probe);
    const y = probe.getBoundingClientRect().top;
    probe.remove();
    return y;
  }
  function build() {
    const vw = root.clientWidth;
    const vh = root.clientHeight;
    const mob = vw < 760;
    const p1 = $('[data-p="1"]', root);
    const p2 = $('[data-p="2"]', root);
    const leaf1 = p1.closest<HTMLElement>('.flip-leaf')!;
    const leaf2 = p2.closest<HTMLElement>('.flip-leaf')!;
    const saved = [leaf1.style.transform, leaf2.style.transform];
    leaf1.style.transform = leaf2.style.transform = 'none';
    const mark = $('.pf-mark', p1);
    const word = $('.pf-word', mark);
    const sub = $('.pf-sub', p1);
    const fig = $('.pf-fig', p1);
    const l = core.L();
    const t1 = $('.pf-t1', p1);
    applyLang(t1, l);
    t1.textContent = l.title + (l.dir === 'rtl' ? '' : '.');
    // the wordmark
    const mx = mob ? vw * 0.08 : vw * 0.2;
    const my = mob ? vh * 0.17 : vh * 0.2;
    mark.style.left = `${mx}px`;
    mark.style.top = `${my}px`;
    const r0 = p1.getBoundingClientRect();
    // its glyph edges
    const node = word.firstChild as Text;
    const xs: number[] = [];
    for (let i = 0; i < node.length; i++) {
      const rg = document.createRange();
      rg.setStart(node, i);
      rg.setEnd(node, i + 1);
      const b = rg.getBoundingClientRect();
      xs.push(b.left - r0.left);
      if (i === node.length - 1) xs.push(b.right - r0.left);
    }
    const widths = xs.slice(1).map((x, i) => x - xs[i]!);
    const min = Math.min(...widths);
    const base = baseline(mark) - r0.top;
    const cap = capOf(mark);
    // the second block
    const sx = mob ? vw * 0.08 : xs[0]! - (xs[2]! - xs[0]!);
    sub.style.left = `${sx}px`;
    sub.style.top = `${mob ? vh * 0.5 : vh * 0.6}px`;
    const lines2 = $$('span[class^="pf-t"]', sub);
    const b1 = baseline(lines2[0]!) - r0.top;
    const b2 = baseline(lines2[1]!) - r0.top;
    const c2 = capOf(sub);
    // the figure hangs from the wordmark's cap line, on its own pair of verticals
    const figL = mob ? vw * 0.08 : vw * 0.66;
    const figW = mob ? vw * 0.5 : vw * 0.2;
    fig.style.left = `${figL}px`;
    fig.style.width = `${figW}px`;
    fig.style.top = `${mob ? b2 + 30 : base - cap}px`;
    const V = xs.map((x, i) => `<i class="gv" style="left:${x.toFixed(1)}px;--d:${i}"></i>`).join('');
    const VF = mob ? '' : [figL, figL + figW].map((x, i) => `<i class="gv" style="left:${x.toFixed(1)}px;--d:${i + xs.length}"></i>`).join('');
    const labels = widths
      .map(
        (w, i) =>
          `<b style="left:${((xs[i]! + xs[i + 1]!) / 2).toFixed(1)}px;top:${(base - cap - Math.max(46, vh * 0.07)).toFixed(1)}px;--d:${i}">${(w / min).toFixed(1).replace(/\.0$/, '')}</b>`
      )
      .join('');
    const hs = [base - cap, base, b1 - c2, b2];
    const Hh = hs.map((y, i) => `<i class="gh" style="top:${y.toFixed(1)}px;--d:${i}"></i>`).join('');
    $('.pf-lines', p1).innerHTML = V + VF + Hh + labels;
    // page 2: the same verticals, one pair of rules per definition
    const defs = $$('.pf-def', p2);
    const srcs = $$('.pf-src', p2);
    const top0 = mob ? vh * 0.24 : vh * 0.27;
    const step = mob ? vh * 0.12 : vh * 0.118;
    const h2: number[] = [];
    const head = $('.pf-h', p2);
    head.style.left = `${mob ? vw * 0.08 : xs[0]!}px`;
    head.style.top = `${top0 - step * 0.95}px`;
    defs.forEach((def, i) => {
      def.style.left = `${mob ? vw * 0.08 : xs[0]!}px`;
      def.style.top = `${top0 + i * step}px`;
      const bl = baseline(def) - r0.top;
      const cp = capOf(def);
      h2.push(bl - cp, bl);
      const s = srcs[i]!;
      if (mob) {
        s.style.left = `${vw * 0.08}px`;
        s.style.right = 'auto';
        s.style.top = `${bl + 10}px`;
      } else {
        s.style.left = 'auto';
        s.style.right = `${vw * 0.034}px`;
        s.style.top = `${bl - 14}px`;
      }
    });
    const rd = $('.pf-read', p2);
    rd.style.left = `${mob ? vw * 0.08 : xs[0]!}px`;
    rd.style.top = `${top0 + 5 * step + (mob ? 10 : 18)}px`;
    $('.pf-lines', p2).innerHTML = V + h2.map((y, i) => `<i class="gh" style="top:${y.toFixed(1)}px;--d:${i}"></i>`).join('');
    leaf1.style.transform = saved[0]!;
    leaf2.style.transform = saved[1]!;
  }
  function animate() {
    $$('.pf-page', root).forEach((p) => {
      p.classList.remove('pf-anim');
      void p.offsetWidth;
      p.classList.add('pf-anim');
    });
  }
  root.addEventListener('click', (e) => {
    const target = e.target as Element;
    if (target.closest('a, button') || !target.closest('.pf-page')) return;
    if (flip.state === 0) flip.next();
    else flip.prev();
  });
  core.langButtons($('.pf-langs', root));
  function chrome() {
    const l = core.L();
    const [a, b] = coord.site(l.lat, l.lon);
    $('[data-c="0"]', root).textContent = a;
    $('[data-c="1"]', root).textContent = b;
  }
  core.onLang(() => {
    chrome();
    if (core.current === SLUG) build();
  });

  core.register(SLUG, root, {
    enter() {
      chrome();
      flip.set(0);
      const go = () => {
        build();
        animate();
      };
      Promise.all([document.fonts.load('400 120px Newsreader'), document.fonts.load('400 30px "EB Garamond"')]).then(go, go);
    },
    key(e) {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        flip.next();
      } else if (e.key === 'ArrowLeft' || e.key === 'Escape') flip.prev();
    },
    resize() {
      build();
    },
  });
}
