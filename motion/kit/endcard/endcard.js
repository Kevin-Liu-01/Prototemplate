/*
 * GT motion kit: the series end card.
 *
 * Every film of the series ends on this card after its narrative: the
 * doubled-line GT mark filled with the film's gem smoke, the post's title in
 * two lines and the post's link. The layout, the sizes, the timing and the
 * motion are fixed here; a film passes only its palette, its title and its
 * link. README.md in this folder has the API, the timings and the layout
 * measurements.
 *
 *   <link rel="stylesheet" href="kit/tokens.css" />     (Inter through var(--font))
 *   <script src="kit/gsap.min.js"></script>
 *   <script type="module">
 *     import { addEndCard } from './kit/endcard/endcard.js';
 *     const tl = gsap.timeline({ paused: true });
 *     // ... the film's own tweens ...
 *     addEndCard(tl, { palette: 'fire', title: ['Fuma Nama: The philosophy', 'of an open-sourcerer'],
 *                      url: 'generaltranslation.com/blog/fuma-nama', start: 52 });
 *     window.__timelines['main'] = tl;
 *   </script>
 *
 * The card is a pure function of the timeline's time. Its gem smoke is
 * drawn from a proxy tween's onUpdate (the kit/gemsmoke.js pattern), every
 * other change is a tween on the same timeline, and nothing reads a clock.
 */
import '../gemsmoke.js';

/** The card's length in seconds, from the cut to the film's last frame. */
export const DURATION = 4;

const W = 1920;
const H = 1080;

/* Inter 4.1 vertical metrics in em (unitsPerEm 2048): ascender 1984,
   descender 494, cap height 1490. */
const ASC = 1984 / 2048;
const DESC = 494 / 2048;
const CAP = 1490 / 2048;

/**
 * The palettes. ground is the gem smoke's own colorBack, so the shader's
 * canvas and the card's ground are one surface. hair and cross color the
 * optional series frame (frame: true): fire repeats the films' old rails,
 * blue draws them in the material's #86a8ff at the same contrast.
 */
export const PALETTES = {
  fire: { ground: '#000000', type: '#ffffff', hair: 'rgba(242, 242, 240, 0.11)', cross: 'rgba(242, 242, 240, 0.32)' },
  blue: { ground: '#2f5ce0', type: '#ffffff', hair: 'rgba(134, 168, 255, 0.26)', cross: '#86a8ff' },
};

/**
 * The layout at 1920 x 1080 (README.md draws it). The type stands on the
 * lower title-safe line at the left edge of the title-safe area; the mark
 * hangs from the upper title-safe line at its right edge. The mark is as
 * tall as the title's ink (line 1 cap top to line 2 baseline).
 */
export const LAYOUT = {
  inset: 67, // the optional series frame's rails (frame: true)
  left: 160, // title safe
  right: 1760,
  top: 160,
  title: { size: 120, pitch: 122, tracking: -0.035, weight: 500, maxWidth: 1600, minSize: 100 },
  link: { size: 40, tracking: -0.005, weight: 400 },
  linkBaseline: 920, // the lower title-safe line; the title's baselines sit one and two pitches above it
};

/** The motion, in seconds from the cut (README.md has the table). */
export const TIMING = {
  bloom: { at: 0, duration: 1.0, ease: 'power3.out', from: 0.4 }, // the mark's smoke density rises
  title: { at: 0.12, stagger: 0.08, ease: 'expo.out' }, // each line rises out of its mask
  link: { at: 0.4, ease: 'expo.out' },
  settled: 1.0, // every arrival lands on this beat; the hold runs from here to DURATION
  smoke: { from: 3.5, travel: 1.0 }, // shader seconds: 3.5 at the cut, 4.5 on the last frame, on power2.out
};

/* The smoke, the same in both palettes: one geometry, one choreography,
   only the colors change. scale/offsetX/offsetY place the mark (below). */
const SMOKE = { innerGlow: 1, outerGlow: 0.5, innerDistortion: 0.8, outerDistortion: 0.8, angle: -60, size: 0.7, offset: 0 };

/* The processed shape: kit/gem-shapes/gt-mark.png is 1024 square with the
   mark's box 654 x 412 at its centre (alpha bbox 185..839, 306..718). The
   shader draws the texture over a square of H * scale / 0.95 px. */
const SHAPE_URL = new URL('../gem-shapes/gt-mark.png', import.meta.url).href;
const SHAPE_W = 654 / 1024;
const SHAPE_H = 412 / 1024;

/* Glyphs whose left side is a curve: their ink sits a little left of the
   flush edge so they look aligned with the stems (about 1 percent of the
   size). */
const ROUND_LEFT = new Set('acdeoqsCGOQS'.split(''));
const OVERSHOOT = 0.0125;

let STYLE_DONE = false;
function injectStyle() {
  if (STYLE_DONE) return;
  STYLE_DONE = true;
  const s = document.createElement('style');
  s.setAttribute('data-gt-endcard', '');
  s.textContent = `
.gt-endcard { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; overflow: hidden; visibility: hidden; pointer-events: none; }
.gt-endcard > .gt-ec-ground, .gt-endcard > .gt-ec-gem { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; display: block; }
.gt-endcard .gt-ec-rail { position: absolute; display: block; }
.gt-endcard .gt-ec-cross { position: absolute; width: 13px; height: 13px; display: block; }
.gt-endcard .gt-ec-cross > i { position: absolute; display: block; }
.gt-endcard .gt-ec-ln { position: absolute; display: block; overflow: hidden; margin: 0; padding: 0 0.12em; white-space: nowrap; font-family: var(--font); font-feature-settings: 'ss01' 0, 'cv11' 1; -webkit-font-smoothing: antialiased; }
.gt-endcard .gt-ec-ln > span { display: block; }
.gt-endcard .gt-ec-shape { position: absolute; width: 1px; height: 1px; opacity: 0; }
`;
  document.head.appendChild(s);
}

function div(cls, style, parent) {
  const e = document.createElement('div');
  if (cls) e.className = cls;
  if (style) Object.assign(e.style, style);
  if (parent) parent.appendChild(e);
  return e;
}

/**
 * One masked line: the mask box runs from 1.0 em above the baseline to
 * 0.2725 em below it (past the descender), and the span inside rises from
 * one box height below to its seat. Returns { mask, span, size }.
 */
function maskedLine(parent, text, size, weight, tracking, color, baseline, left) {
  const box = (ASC + DESC + 0.0625) * size; // the line box whose baseline sits 1.0 em below its top
  const mask = div('gt-ec-ln', {
    top: Math.round(baseline - size) + 'px',
    height: Math.ceil(box) + 'px',
    left: left - 0.12 * size + 'px',
    fontSize: size + 'px',
    fontWeight: String(weight),
    letterSpacing: tracking + 'em',
    color,
    lineHeight: box + 'px',
  }, parent);
  const span = document.createElement('span');
  span.textContent = text;
  mask.appendChild(span);
  return { mask, span, size, left, text };
}

/**
 * Seats a line's first glyph's ink on its left edge, measured from the
 * loaded face (canvas actualBoundingBoxLeft), with the round-glyph
 * overshoot. Runs once the face is loaded; the layout is static after it.
 */
function seat(line) {
  const cs = getComputedStyle(line.mask);
  const ctx = seat.ctx || (seat.ctx = document.createElement('canvas').getContext('2d'));
  ctx.font = `${cs.fontWeight} ${line.size}px ${cs.fontFamily}`;
  const ch = line.text.charAt(0);
  const m = ctx.measureText(ch);
  const lsb = -m.actualBoundingBoxLeft; // ink starts this far right of the pen
  const over = ROUND_LEFT.has(ch) ? OVERSHOOT * line.size : 0;
  line.mask.style.left = line.left - lsb - over - 0.12 * line.size + 'px';
}

/**
 * The series frame (frame: true only): 1 px rails at x 67 and 1853, rules
 * at y 67 and 1013, and a 13 px registration cross on each meeting, in the
 * palette's hair and cross colors.
 */
function drawFrame(root, P) {
  const I = LAYOUT.inset;
  [I, H - I].forEach((y) => div('gt-ec-rail', { left: '0px', top: y + 'px', width: W + 'px', height: '1px', background: P.hair }, root));
  [I, W - I].forEach((x) => div('gt-ec-rail', { top: '0px', left: x + 'px', width: '1px', height: H + 'px', background: P.hair }, root));
  [I, W - I].forEach((x) =>
    [I, H - I].forEach((y) => {
      const c = div('gt-ec-cross', { left: x - 6 + 'px', top: y - 6 + 'px' }, root);
      const v = document.createElement('i');
      Object.assign(v.style, { left: '6px', top: '0px', width: '1px', height: '13px', background: P.cross });
      const h = document.createElement('i');
      Object.assign(h.style, { left: '0px', top: '6px', width: '13px', height: '1px', background: P.cross });
      c.appendChild(v);
      c.appendChild(h);
    })
  );
}

function onBeat(t) {
  return Math.abs(t * 2 - Math.round(t * 2)) < 1e-6;
}

/**
 * Adds the end card to a paused GSAP timeline.
 *   tl       the composition's paused timeline
 *   opts     { palette: 'fire' | 'blue', title: [line1, line2], url, start,
 *              host (default the composition root), zIndex (default 100),
 *              frame (default false: true draws the series frame's rails
 *              and registration crosses) }
 * Returns { el, start, end, duration, ready } where ready resolves when the
 * gem smoke is mounted and the type is seated.
 */
export function addEndCard(tl, opts) {
  const o = opts || {};
  const palette = o.palette === 'blue' ? 'blue' : 'fire';
  const P = PALETTES[palette];
  const start = Number(o.start) || 0;
  const title = Array.isArray(o.title) ? o.title.slice(0, 2) : [String(o.title || ''), ''];
  const url = String(o.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!onBeat(start)) console.warn('[endcard] start ' + start + ' s is off the 0.5 s beat grid; the card enters on a hard cut, which lands on a beat');
  if (title.length !== 2 || !title[0] || !title[1]) console.warn('[endcard] the title is two lines: [line1, line2]');

  injectStyle();
  const host = o.host || document.querySelector('[data-composition-id]') || document.body;
  const root = div('gt-endcard gt-endcard--' + palette, { zIndex: String(o.zIndex == null ? 100 : o.zIndex) }, host);
  root.setAttribute('data-layout-allow-overflow', '');

  // The ground and the smoke.
  div('gt-ec-ground', { background: P.ground }, root);
  const gemHost = div('gt-ec-gem', null, root);
  const shapeImg = document.createElement('img');
  shapeImg.className = 'gt-ec-shape';
  shapeImg.alt = '';
  shapeImg.src = SHAPE_URL;
  root.appendChild(shapeImg);

  // The series frame, off by default: two rails, two rules, a registration
  // cross at each meeting.
  if (o.frame === true) drawFrame(root, P);

  // The type: the link stands on the lower title-safe line, the title above it.
  const L = LAYOUT;
  const linkBase = L.linkBaseline;
  const base2 = linkBase - L.title.pitch;
  const base1 = base2 - L.title.pitch;
  let tSize = L.title.size;
  const lines = [
    maskedLine(root, title[0], tSize, L.title.weight, L.title.tracking, P.type, base1, L.left),
    maskedLine(root, title[1], tSize, L.title.weight, L.title.tracking, P.type, base2, L.left),
  ];
  const link = maskedLine(root, url, L.link.size, L.link.weight, L.link.tracking, P.type, linkBase, L.left);

  // The mark: as tall as the title's ink, its top on the upper title-safe
  // line, its right edge (the T's flat bar end) on the right title-safe line.
  const markH = CAP * L.title.size + L.title.pitch;
  const markW = (markH * SHAPE_W) / SHAPE_H;
  const markCx = L.right - markW / 2;
  const markCy = L.top + markH / 2;
  const scale = (markH * 0.95) / (SHAPE_H * H);
  const smoke = Object.assign({}, SMOKE, { scale, offsetX: (markCx - W / 2) / H, offsetY: (markCy - H / 2) / H });

  // Seat the first glyphs once the face is loaded; shrink a title line that
  // would pass the right title-safe edge (never below 100 px).
  const family = getComputedStyle(lines[0].mask).fontFamily;
  const fontsReady = Promise.all([
    document.fonts.load(`${L.title.weight} ${tSize}px ${family}`, title.join('')),
    document.fonts.load(`${L.link.weight} ${L.link.size}px ${family}`, url),
  ]).then(() => {
    const widest = Math.max(...lines.map((l) => l.span.getBoundingClientRect().width));
    if (widest > L.title.maxWidth) {
      tSize = Math.max(L.title.minSize, Math.floor((L.title.size * L.title.maxWidth) / widest));
      console.warn('[endcard] a title line is ' + Math.round(widest) + ' px at ' + L.title.size + ' px; set at ' + tSize + ' px');
      lines.forEach((l, k) => {
        const b = k === 0 ? base2 - Math.round(L.title.pitch * (tSize / L.title.size)) : base2;
        const box = (ASC + DESC + 0.0625) * tSize;
        Object.assign(l.mask.style, { fontSize: tSize + 'px', top: Math.round(b - tSize) + 'px', height: Math.ceil(box) + 'px', lineHeight: box + 'px' });
        l.size = tSize;
      });
      const still = Math.max(...lines.map((l) => l.span.getBoundingClientRect().width));
      if (still > L.title.maxWidth) console.warn('[endcard] the title is still ' + Math.round(still) + ' px wide at ' + tSize + ' px; break it into two shorter lines (each at most ' + L.title.maxWidth + ' px)');
    }
    lines.forEach(seat);
    seat(link);
  });

  // The smoke clock: shader seconds on power2.out, so the material comes to
  // rest with the card; the mark's density rises on the bloom.
  const T = TIMING;
  const ease2 = gsap.parseEase('power2.out');
  const easeBloom = gsap.parseEase(T.bloom.ease);
  const gem = { g: null, glow: -1 };
  const proxy = { t: 0 };
  function draw(t) {
    if (!gem.g) return;
    const b = easeBloom(Math.min(1, Math.max(0, (t - T.bloom.at) / T.bloom.duration)));
    if (b !== gem.glow) {
      gem.glow = b;
      gem.g.mount.setUniforms({ u_innerGlow: SMOKE.innerGlow * (T.bloom.from + (1 - T.bloom.from) * b), u_outerGlow: SMOKE.outerGlow * b });
    }
    gem.g.at(T.smoke.from + T.smoke.travel * ease2(Math.min(1, Math.max(0, t / DURATION))));
  }
  const gemReady = window.GTGem.mount(gemHost, { palette, width: W, height: H, image: SHAPE_URL, params: smoke }).then((g) => {
    gem.g = g;
    const now = tl.time() - start;
    draw(Math.min(DURATION, Math.max(0, now)));
    return g;
  });

  // The cut, the bloom clock, the type.
  tl.set(root, { visibility: 'visible', immediateRender: false }, start);
  tl.fromTo(proxy, { t: 0 }, { t: DURATION, duration: DURATION, ease: 'none', immediateRender: false, onUpdate: () => draw(proxy.t) }, start);
  lines.forEach((l, k) => {
    const at = T.title.at + k * T.title.stagger;
    tl.fromTo(l.span, { yPercent: 100 }, { yPercent: 0, duration: T.settled - at, ease: T.title.ease }, start + at);
  });
  tl.fromTo(link.span, { yPercent: 100 }, { yPercent: 0, duration: T.settled - T.link.at, ease: T.link.ease }, start + T.link.at);

  return {
    el: root,
    start,
    end: start + DURATION,
    duration: DURATION,
    ready: Promise.all([gemReady, fontsReady]).then(() => root),
  };
}

window.GTEndCard = { addEndCard, DURATION, PALETTES, LAYOUT, TIMING };
window.dispatchEvent(new Event('gtendcard-ready'));
