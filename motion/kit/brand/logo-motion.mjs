// Writes kit/brand/gt-logo-motion.js, the General Translation logo form for
// films and its loader: the site's GtLogoMotion drawn as SVG and moved by a
// function of time, so a HyperFrames render can seek it.
//
// It reads the two files pnpm build:logo-motion writes for the site,
// src/components/brand/GtLogoMotion.geometry.ts (the drawing and the logo
// form's timing) and GtLogoMotion.css (the channels, the keyframes and the
// dash rules), and copies their numbers; it adds no motion of its own. The
// logo form is the loader's lap with the meridian's return moved to start
// where the G lands. The layers and masks follow GtLogoMotion.tsx in loader
// mode. Rerun it whenever those files change. --check writes nothing and fails when the
// script differs from what it would write.
//
// Usage: node motion/kit/brand/logo-motion.mjs [--check]
// Requires: Node 22.18 or later (it imports the .ts file), postcss from the
// repository's node_modules.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const OUT = join(HERE, 'gt-logo-motion.js');
const { GT_LOGO_MOTION: G } = await import(join(ROOT, 'src/components/brand/GtLogoMotion.geometry.ts'));
const css = postcss.parse(readFileSync(join(ROOT, 'src/components/brand/GtLogoMotion.css'), 'utf8'));

// the channels: every registered --gt-logo-* property
const PROPS = [];
css.walkAtRules('property', (at) => {
  const m = /^--gt-logo-([a-z-]+)$/.exec(at.params.trim());
  if (m) PROPS.push(m[1]);
});
const LINES = PROPS.filter((p) => !p.endsWith('-at'));
if (!LINES.length || LINES.some((c) => !PROPS.includes(`${c}-at`))) throw new Error(`unexpected channels: ${PROPS.join(', ')}`);

const px = (v) => {
  const m = /^(-?[\d.]+)px$/.exec(v.trim());
  if (!m) throw new Error(`not a px length: ${v}`);
  return Number(m[1]);
};
const declsOf = (rule) => {
  const out = {};
  rule.walkDecls((d) => {
    out[d.prop] = d.value;
  });
  return out;
};
const ruleFor = (selector) => {
  let found = null;
  css.walkRules((r) => {
    if (r.selector === selector) found = r;
  });
  if (!found) throw new Error(`GtLogoMotion.css has no rule "${selector}"`);
  return found;
};
const stateOf = (decls) => {
  const s = {};
  for (const p of PROPS) if (decls[`--gt-logo-${p}`] != null) s[p] = px(decls[`--gt-logo-${p}`]);
  return s;
};

// the rest values, set on the svg
const rest = stateOf(declsOf(ruleFor('.gt-logo-motion > svg')));
if (Object.keys(rest).length !== PROPS.length) throw new Error('the rest rule does not set every channel');

// the dash rules: dasharray "var(--x) <gap>px", dashoffset "calc(-1 * var(--x-at))" or "calc(<n>px - var(--x-at))"
const DASH = {};
for (const c of LINES) {
  const d = declsOf(ruleFor(`.gt-logo-motion-${c}`));
  const gap = /^var\(--gt-logo-([a-z-]+)\)\s+([\d.]+)px$/.exec(d['stroke-dasharray'] ?? '');
  const off = d['stroke-dashoffset'] ?? '';
  const lead = /^calc\(([\d.]+)px - var\(--gt-logo-([a-z-]+)\)\)$/.exec(off);
  const neg = /^calc\(-1 \* var\(--gt-logo-([a-z-]+)\)\)$/.exec(off);
  if (!gap || gap[1] !== c || !(neg || lead) || (neg ?? lead).at(-1) !== `${c}-at`) throw new Error(`unexpected dash rule on .gt-logo-motion-${c}`);
  DASH[c] = { gap: Number(gap[2]), lead: lead ? Number(lead[1]) : 0 };
}

// the keyframes, each a list of [fraction, state]
const keyframes = {};
css.walkAtRules('keyframes', (at) => {
  const stops = [];
  at.walkRules((r) => {
    const s = stateOf(declsOf(r));
    for (const sel of r.selector.split(',')) {
      const t = sel.trim();
      stops.push([t === 'from' ? 0 : t === 'to' ? 1 : Number(t.replace('%', '')) / 100, s]);
    }
  });
  stops.sort((a, b) => a[0] - b[0]);
  keyframes[at.params.replace(/^gt-logo-/, '')] = stops;
});

// the loader's laps: every keyframe set runs one lap, from the logo to the logo
const anims = postcss.list
  .comma(declsOf(ruleFor(".gt-logo-motion:is([data-mode='loader'], [data-play='loop']) > svg")).animation)
  .map((a) => {
    const m = /^\s*([a-z-]+)\s+([\d.]+)ms\s+linear\s.*\binfinite\s*$/.exec(a);
    if (!m) throw new Error(`unexpected animation "${a}"`);
    return { name: m[1].replace(/^gt-logo-/, ''), ms: Number(m[2]) };
  });
for (const a of anims) if (!keyframes[a.name]) throw new Error(`no keyframes for ${a.name}`);
if (anims.some((a) => a.ms !== anims[0].ms)) throw new Error('the laps do not share one length');
const T = G.timing;
const MERIDIAN = anims.find((a) => keyframes[a.name].some(([, st]) => 'meridian' in st));
if (!MERIDIAN || anims.some((a) => a !== MERIDIAN && keyframes[a.name].some(([, st]) => 'meridian' in st))) throw new Error('one keyframe set must carry the meridian');
if (T.lap !== anims[0].ms || T.form.meridianReturn[0] < T.meridianReturn[0]) throw new Error('the logo form does not fit the lap');

const data = {
  geometry: G,
  rest,
  dash: DASH,
  keyframes,
  anims: anims.map((a) => a.name),
  meridian: MERIDIAN.name,
  lap: T.lap,
  back: T.drawBack,
  returns: T.meridianReturn,
  form: T.form.meridianReturn,
};
const body = `/* Written by kit/brand/logo-motion.mjs from src/components/brand/GtLogoMotion.geometry.ts and GtLogoMotion.css. Do not edit by hand. */
/*
 * window.GTLogoMotion: the General Translation logo form for films, and its
 * loader. The drawing, the layers and every number are the site's
 * GtLogoMotion in loader mode; time comes from the film, so every frame is a
 * function of it.
 *
 *   const logo = GTLogoMotion.create({ ink: '#ffffff' });   // logo.svg is an <svg>, sized by its parent
 *   logo.set(t);   // t in seconds from the form's start
 *
 * The logo form, the default: the logo (t < 0); the meridian draws back (0 to ${T.drawBack / 1000} s)
 * and a line runs once round it; the G draws off and back on round the
 * equator, landing at ${T.form.meridianReturn[0] / 1000} s; then the meridian draws on again, landing on the
 * logo at ${T.form.meridianReturn[1] / 1000} s (GTLogoMotion.DURATION); then the logo again.
 * create({ loader: true, laps: n }) runs n laps of the loader instead, where
 * the meridian draws on again from behind the G as it returns; each lap is
 * ${T.lap / 1000} s (GTLogoMotion.LAP) and lands on the logo.
 */
(function () {
  const D = ${JSON.stringify(data)};
  const NS = 'http://www.w3.org/2000/svg';
  const LAP = D.lap / 1000;
  const FORM = D.form[1] / 1000;
  function at(stops, f) {
    if (f <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i++) {
      const [f1, s1] = stops[i];
      if (f <= f1) {
        const [f0, s0] = stops[i - 1];
        const k = f1 > f0 ? (f - f0) / (f1 - f0) : 1;
        const o = {};
        for (const c in s1) o[c] = s0[c] + (s1[c] - s0[c]) * k;
        return o;
      }
    }
    return stops[stops.length - 1][1];
  }
  // the channels at ms into a lap, each keyframe set at its own lap time
  function frame(lapMs) {
    const s = Object.assign({}, D.rest);
    for (const a of D.anims) Object.assign(s, at(D.keyframes[a], lapMs(a) / D.lap));
    return s;
  }
  // the loader at ms from its start
  const loader = (ms) => frame(() => ms % D.lap);
  // the logo form at ms: the lap until the G lands, with the meridian's return moved to start there
  const form = (ms) =>
    frame((a) => {
      if (a !== D.meridian) return Math.min(ms, D.form[0]);
      if (ms < D.returns[0]) return ms;
      return Math.min(D.returns[1], Math.max(D.returns[0], ms - (D.form[0] - D.returns[0])));
    });
  function el(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  let made = 0;
  function create(opts) {
    const o = Object.assign({ ink: 'currentColor', loader: false, laps: 1 }, opts);
    const g = D.geometry;
    const id = 'gtlm' + made++;
    const url = (n) => 'url(#' + id + '-' + n + ')';
    const line = (w, ink) => ({ fill: 'none', stroke: ink, 'stroke-width': w });
    const dashes = [];
    const dash = (channel, d, attrs, parent) => {
      const p = el('path', Object.assign({ d }, attrs), parent);
      dashes.push([p, channel]);
      return p;
    };
    const meridian = (ink, parent) => dash('meridian', g.meridian.d, Object.assign({ mask: url('zone') }, line(g.meridian.width, ink)), parent);
    const lap = (c, ink, parent) => dash(c, g.latitude.d, line(c === 'fill' ? g.fill.width : g.under.width, ink), parent);
    // the logo's meridian where it is drawn, cut faces included, while the G laps under it
    const meridianInk = (parent) => el('path', { 'fill-rule': g.rest.fillRule, d: g.rest.d, mask: url('ink') }, parent);
    const less = (parent, ...cs) => cs.forEach((c) => lap(c, '#000', parent));
    const round = { 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    // where no mask reaches: the ring from just inside its inner edge, less every point near a line's ink in the
    // ring's hole (stroked in units and again in CSS pixels), but always the ring's outer half
    const free = (ink, near, parent) => {
      const f = el('g', Object.assign({ 'shape-rendering': 'crispEdges' }, round), parent);
      el('circle', Object.assign({ cx: g.ring.cx, cy: g.ring.cy, r: g.free.ring.r }, line(g.free.ring.width, ink)), f);
      el('path', Object.assign({ d: g.free.near.d }, line(g.free.near.width, near)), f);
      el('path', Object.assign({ d: g.free.near.d, 'vector-effect': 'non-scaling-stroke' }, line(g.free.near.px, near)), f);
      el('circle', Object.assign({ cx: g.ring.cx, cy: g.ring.cy, r: g.free.outer.r }, line(g.free.outer.width, ink)), f);
    };
    const svg = el('svg', { viewBox: g.viewBox, width: '100%', height: '100%', fill: o.ink, 'aria-hidden': 'true' });
    svg.style.overflow = 'visible';
    svg.style.display = 'block';
    const defs = el('defs', {}, svg);
    const box = { maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 256, height: 256 };
    const mask = (n) => el('mask', Object.assign({ id: id + '-' + n }, box), defs);
    free('#fff', '#000', mask('free'));
    const moving = mask('moving');
    el('rect', { width: 256, height: 256, fill: '#fff' }, moving);
    free('#000', '#fff', moving);
    const zone = mask('zone');
    el('path', Object.assign({ d: g.zone.band.d }, line(g.zone.band.width, '#fff')), zone);
    el('path', Object.assign({ d: g.zone.breaks.d }, line(g.zone.breaks.width, '#fff')), zone);
    el('path', Object.assign({ d: g.zone.near.d, 'vector-effect': 'non-scaling-stroke' }, round, line(g.zone.near.px, '#fff')), zone);
    el('path', Object.assign({ d: g.zone.ends.d }, line(g.zone.ends.width, '#000')), zone);
    const keep = mask('keep');
    el('rect', { width: 256, height: 256, fill: '#fff' }, keep);
    meridian('#000', keep);
    less(keep, 'under', 'head', 'fill');
    const bare = mask('bare');
    meridian('#fff', bare);
    less(bare, 'under', 'head', 'fill');
    const under = mask('under');
    lap('under', '#fff', under);
    less(under, 'head', 'fill');
    const head = mask('head');
    lap('head', '#fff', head);
    less(head, 'fill');
    lap('fill', '#fff', mask('fill'));
    const ink = mask('ink');
    el('path', Object.assign({ d: g.meridianInk.d }, line(g.meridianInk.width, '#fff')), ink);
    dash('meridian', g.meridian.d, line(g.meridian.width, '#000'), ink);
    const inside = mask('inside');
    el('rect', { width: 256, height: 256, fill: '#fff' }, inside);
    el('circle', Object.assign({ cx: g.ring.cx, cy: g.ring.cy, r: g.free.core.r, 'shape-rendering': 'crispEdges' }, line(g.free.core.width, '#000')), inside);
    const restPath = el('path', { 'fill-rule': g.rest.fillRule, d: g.rest.d }, svg);
    const move = el('g', {}, svg);
    const stack = el('g', {}, move);
    stack.style.isolation = 'isolate';
    el('path', { 'fill-rule': g.rest.fillRule, d: g.rest.d, mask: url('free') }, stack);
    const inner = el('g', { mask: url('moving') }, stack);
    inner.style.isolation = 'isolate';
    inner.style.mixBlendMode = 'plus-lighter';
    el('path', { 'fill-rule': g.rest.fillRule, d: g.rest.d, mask: url('keep') }, inner);
    // the ring as the logo draws it, filled; it shows only at the inner edge where a line merged into it
    const add = (n) => {
      const a = el('g', { mask: url(n) }, inner);
      a.style.mixBlendMode = 'plus-lighter';
      el('path', { d: g.ring.d }, a);
      el('path', { d: g.bar }, a);
      return a;
    };
    const b = add('bare');
    el('path', { d: g.stem }, b);
    el('path', { d: g.c }, b);
    meridianInk(add('under'));
    const h = add('head');
    el('path', Object.assign({ d: g.latitude.d }, line(g.width, o.ink)), h);
    meridianInk(h);
    const f = add('fill');
    el('path', { d: g.stem }, f);
    meridianInk(f);
    dash('lap', g.meridianLap.d, Object.assign({ mask: url('inside') }, line(g.width, o.ink)), stack);
    function paint(s) {
      for (const [p, c] of dashes) {
        const r = D.dash[c];
        p.setAttribute('stroke-dasharray', s[c] + ' ' + r.gap);
        p.setAttribute('stroke-dashoffset', r.lead - s[c + '-at']);
      }
    }
    const total = o.loader ? LAP * o.laps : FORM;
    function set(t) {
      const moving = t > 0 && t < total;
      // '' inherits, so a hidden card hides the logo too
      restPath.style.visibility = moving ? 'hidden' : '';
      move.style.visibility = moving ? '' : 'hidden';
      if (moving) paint(o.loader ? loader(t * 1000) : form(t * 1000));
    }
    set(-1);
    return { svg, set, duration: total };
  }
  window.GTLogoMotion = { create, DURATION: FORM, LAP, viewBox: D.geometry.viewBox, restPath: D.geometry.rest.d };
})();
`;

if (process.argv.includes('--check')) {
  const now = readFileSync(OUT, 'utf8');
  if (now !== body) {
    console.error('kit/brand/gt-logo-motion.js differs from what logo-motion.mjs would write; rerun it');
    process.exit(1);
  }
  console.log('kit/brand/gt-logo-motion.js matches');
} else {
  writeFileSync(OUT, body);
  console.log(`wrote kit/brand/gt-logo-motion.js (${body.length} bytes; ${anims.length} animations, channels ${LINES.join(', ')})`);
}
