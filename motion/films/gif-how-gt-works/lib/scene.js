/*
 * gif-how-gt-works: the scene (DESIGN.md sections 3 to 8, revised in NOTES.md).
 *
 * One 1280 x 720 stage in design px. gif/index.html shows it at scale 1 and
 * index.html at scale 1.5. The app page stays on the right through the four
 * steps; the tool panel on the left hard-cuts between the code (B1), the
 * terminal (B2), the Dashboard's Translations page (B3) and <LocaleSelector />
 * (B4). B5 is the General Translation card, a hard cut of the whole frame.
 *
 * Everything on screen is set by render(time), a pure function of film time,
 * called from the paused timeline's onUpdate. Every visible element is fully
 * written on every call, so frames render in any order. Times below are story
 * times; the render starts OFF seconds into the story (see render()).
 */
(function () {
  'use strict';
  const { clamp01, lerp, lin, smooth, ease, el, cross, poly, markAt, mix } = window.F;

  const C = { ink: '#070707', raised: '#101010', white: '#ffffff', ti: '#8a8f98', hair: '#5c6068', acc: '#86a8ff' };
  const XML = 'http://www.w3.org/XML/1998/namespace';
  const DUR = 17.3;
  /*
   * The render opens 2.70 s into the story, on B1's still (wrapped code, both
   * connectors, both marked boxes, heading 1), so a first-frame preview shows
   * the heading over the picture it names. The still runs 2.65 to 3.30, so the
   * last frame (story 2.65) and the first (2.70) are the same picture.
   */
  const OFF = 2.7;

  const f2 = (v) => (Math.abs(v) < 0.005 ? '0' : v.toFixed(2));
  const pt = (p) => f2(p[0]) + ',' + f2(p[1]);
  const pts = (a) => a.map(pt).join(' ');
  const show = (e, on) => {
    const v = on ? '' : 'none';
    if (e.style.display !== v) e.style.display = v;
  };
  const setA = (e, k, v) => e.setAttribute(k, v);
  const opa = (e, v) => e.setAttribute('opacity', f2(clamp01(v)));
  const lift = (e, dy) => e.setAttribute('transform', `translate(0 ${f2(dy)})`);

  /* ---------------- the frame (DESIGN.md section 3) ---------------- */
  const PANEL = { x: 80, y: 184, w: 520, h: 480 };
  const PAGE = { x: 712, y: 184, w: 488, h: 480 };
  const PC = [PAGE.x + PAGE.w / 2, PAGE.y + PAGE.h / 2];
  const ROWT = (n) => 216 + (n - 1) * 40; // code row n's top
  const ROWC = (n) => ROWT(n) + 20; // and its centre
  /* The baseline that centres a line's caps (Inter and SF Mono caps sit 0.36 em above it) on cy. */
  const BL = (cy, size) => Math.round(cy + 0.364 * size);

  /* ---------------- the strings (DESIGN.md section 2) ---------------- */
  const LANGS = ['en', 'es', 'fr', 'ja'];
  const STR = {
    en: { h: 'Welcome back', b: 'Get started', s: 'English' },
    es: { h: 'Hola de nuevo', b: 'Comenzar', s: 'Español' },
    fr: { h: 'Bon retour', b: 'Commencer', s: 'Français' },
    ja: { h: 'おかえりなさい', b: '始める', s: '日本語' },
  };
  const ES_BEFORE = 'Comenzar ahora'; // GT's own Spanish (TranslateWindow PREVIEWS), edited to 'Comenzar' in B3
  /* Measured widths in design px; estimates until measure() runs. */
  const W = {
    h: { en: 248, es: 262, fr: 206, ja: 280 },
    b: { en: 126, es: 108, fr: 122, ja: 72 },
    s: { en: 80, es: 88, fr: 90, ja: 72 },
    b0: 170,
    cw: 14.4,
  };

  /* ---------------- the clock (DESIGN.md section 7) ---------------- */
  /* The cuts: B1 to B2, B2 to B3, B3 to B4, B4 to the card, the card back to B1's frame-0 code. */
  const CUT = [3.5, 7.5, 11.0, 14.8, 16.7];
  /* Heading 1 rises after the card and holds across the story's 0. */
  const HEADS = [
    { text: 'You wrap your text in <T>', rise: 16.7, drop: 3.3 },
    { text: 'One command translates your app', rise: 3.5, drop: 7.3 },
    { text: 'Your team reviews translations', rise: 7.5, drop: 10.8 },
    { text: 'Your app is now multilingual', rise: 11.0, drop: 14.6 },
    { text: 'General Translation', rise: 14.8, drop: 16.5, lock: true },
  ];
  const beat = (t) => (t < CUT[0] ? 1 : t < CUT[1] ? 2 : t < CUT[2] ? 3 : t < CUT[3] ? 4 : t < CUT[4] ? 5 : 1);
  /* Time since a story time a, counted forward around the loop. */
  const since = (t, a) => (((t - a) % DUR) + DUR) % DUR;
  /* Characters shown by a line that types from t0 at one character per rate seconds. */
  const typed = (t, t0, len, rate) => (t < t0 ? 0 : Math.min(len, Math.floor((t - t0) / (rate || 0.025) + 1e-6) + 1));
  /* A row that rises 6 px with opacity in 0.25 s. */
  const rowIn = (t, t0) => ease.p3out(lin(t0, t0 + 0.25, t));

  /* The page's turn into the 30 degree axonometric map and back (one curve, zero speed at both ends). */
  const turnAt = (t) => (t < 11.4 ? smooth(4.3, 5.2, t) : 1 - smooth(11.4, 11.9, t));
  /*
   * The page's text against its bars: text until 4.3, bars through the iso view,
   * text again from 11.9. One leaves before the other arrives, so a bar never
   * crosses its string like a strikethrough.
   */
  const textAt = (t) => (t < 11.9 ? 1 - lin(4.3, 4.38, t) : lin(11.97, 12.05, t));
  const barAt = (t) => (t < 11.9 ? lin(4.37, 4.45, t) : 1 - lin(11.9, 11.98, t));
  /*
   * The three language plates, in paint order (ja lowest, es on top). z: the
   * lift in screen px. Every plate is a full copy of the page on one footprint,
   * so their heights must stay in paint order (es >= fr >= ja) at every frame.
   * Going up, the highest plate starts first; coming down, the lowest leaves
   * first (ja 11.0, fr 11.05, es 11.1, 0.3 s each on one ease). A higher plate
   * that starts later on the same ease never falls below the one under it,
   * and all three are on the base by 11.4, when the turn to flat starts.
   */
  const PLATES = [
    { L: 'ja', z: 55, up: 6.0, down: 11.0 },
    { L: 'fr', z: 110, up: 5.6, down: 11.05 },
    { L: 'es', z: 165, up: 5.2, down: 11.1 },
  ];
  const sepAt = (pl, t) => ease.p3out(lin(pl.up, pl.up + 0.5, t)) * (1 - ease.p2io(lin(pl.down, pl.down + 0.3, t)));
  /* The es plate's button bar shortens to 'Comenzar' after the Dashboard edit is saved. */
  const esEdit = (t) => ease.p2io(lin(10.55, 10.8, t));
  /*
   * The language cycle on the flat page (B4): the thumb arrives, then the page
   * changes. The cycle ends on 日本語 and the card follows; the frame-0 page
   * (English) comes back with the cut out of the card.
   */
  const CHANGES = [
    [12.55, 'en', 'es'],
    [13.3, 'es', 'fr'],
    [14.05, 'fr', 'ja'],
  ];
  /* A box that grows leads its label by this much, so the new label never reads past its edge. */
  const LEAD = 0.1;
  const EN = { c: -1, from: 'en', to: 'en', outA: 0, inA: 1, inY: 0, t: 0 };
  function langAt(t) {
    if (t >= CUT[4]) return EN;
    let i = -1;
    for (let k = 0; k < CHANGES.length; k++) if (t >= CHANGES[k][0] - LEAD) i = k;
    if (i < 0) return EN;
    const [c, from, to] = CHANGES[i];
    const inP = ease.p2out(lin(c + 0.1, c + 0.3, t));
    return { c, from, to, outA: 1 - lin(c, c + 0.12, t), inA: inP, inY: 4 * (1 - inP), t };
  }
  /*
   * A slot's box width (heading bar, button, selector) at language state s.
   * Shrinking, the box follows the old label out (c + 0.05 to c + 0.35), so
   * the old label is nearly gone before the box reaches it. Growing, it runs
   * ahead of the new label (c - 0.1 to c + 0.15): the label starts in at
   * c + 0.1, when the box is 92 percent of the way, and is opaque once the box
   * is done.
   */
  function slotW(slot, s) {
    const a = W[slot][s.from], b = W[slot][s.to];
    if (s.from === s.to) return b;
    const p = b > a ? ease.p2io(lin(s.c - LEAD, s.c + 0.15, s.t)) : ease.p2io(lin(s.c + 0.05, s.c + 0.35, s.t));
    return lerp(a, b, p);
  }
  const langAlpha = (s, L) => (L === s.to ? s.inA : 0) + (L === s.from && s.from !== s.to ? s.outA : 0);

  /* ---------------- the axonometric map (the reference's matrixZ) ---------------- */
  const ISO_Q = Math.tan(Math.PI / 6);
  const ISO_S = Math.sqrt(1.5);
  const K_ISO = 0.55;
  const THICK = 10; // a plate's side faces in screen px at the full iso view
  /*
   * The turn's parts on the one curve p: the scale leads (0 to 0.45 of it) and
   * the 45 degree turn and tan 30 squash follow (0.2 to 1), so no corner leaves
   * the flat page's box on the way (measured: x 712 to 1200, y 184 to 664).
   */
  const parts = (p) => ({ r: smooth(0.2, 1, p), k: smooth(0, 0.45, p), c: smooth(0, 1, p) });
  function rawMatrix(r, kp, c) {
    const th = (Math.PI / 4) * r;
    const q = lerp(1, ISO_Q, r);
    const k = Math.exp(lerp(0, Math.log(K_ISO), kp));
    const s = k * lerp(1, ISO_S, r);
    const a = s * Math.cos(th), b = s * q * Math.sin(th), cc = -s * Math.sin(th), d = s * q * Math.cos(th);
    return { a, b, c: cc, d, e: c[0] - (a * PC[0] + cc * PC[1]), f: c[1] - (b * PC[0] + d * PC[1]) };
  }
  /* The iso centre that puts the page's bottom-left corner (the diamond's left vertex) on (726, 510). */
  const C_ISO = (() => {
    const m = rawMatrix(1, 1, [0, 0]);
    return [726 - (m.a * PAGE.x + m.c * (PAGE.y + PAGE.h) + m.e), 510 - (m.b * PAGE.x + m.d * (PAGE.y + PAGE.h) + m.f)];
  })();
  /* The page's matrix at turn progress p, lifted by liftPx screen px. */
  function matrixAt(p, liftPx) {
    const q = parts(p);
    const m = rawMatrix(q.r, q.k, [lerp(PC[0], C_ISO[0], q.c), lerp(PC[1], C_ISO[1], q.c)]);
    m.f -= liftPx;
    return m;
  }
  const pr = (m, x, y) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f];
  const quad = (m, x, y, w, h) => pts([pr(m, x, y), pr(m, x + w, y), pr(m, x + w, y + h), pr(m, x, y + h)]);
  /* A 1 px stroked box on pixel centres. */
  const squad = (m, x, y, w, h) => quad(m, x + 0.5, y + 0.5, w - 1, h - 1);
  const mtx = (m) => `matrix(${m.a.toFixed(5)} ${m.b.toFixed(5)} ${m.c.toFixed(5)} ${m.d.toFixed(5)} ${f2(m.e)} ${f2(m.f)})`;

  /* ---------------- drawing pieces ---------------- */
  /* Heroicons 2.2.0 16 solid chevron-down (MIT, Tailwind Labs). */
  const CHEVRON = 'M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z';

  function text(parent, x, y, str, o) {
    const t = el(parent, 'text', { x, y, 'font-size': o.size || 24, 'font-weight': o.weight || 400, fill: o.fill || C.white });
    if (o.lang) t.setAttribute('lang', o.lang);
    if (o.mono) t.setAttribute('class', 'mono');
    if (o.anchor) t.setAttribute('text-anchor', o.anchor);
    t.setAttributeNS(XML, 'xml:space', 'preserve');
    t.textContent = str;
    return t;
  }
  /* A line of code: colored runs in one text node (tspans), revealed one character at a time by set(n). */
  function codeLine(parent, x, y, runs) {
    const t = el(parent, 'text', { x, y, 'font-size': 24, class: 'mono', fill: C.white });
    t.setAttributeNS(XML, 'xml:space', 'preserve');
    const spans = runs.map(([s, color]) => {
      const sp = el(t, 'tspan', { fill: color });
      sp.textContent = s;
      return { sp, s };
    });
    const len = runs.reduce((n, r) => n + r[0].length, 0);
    return {
      t,
      len,
      set(n) {
        let k = n;
        for (const r of spans) {
          const v = r.s.slice(0, Math.max(0, Math.min(r.s.length, k)));
          if (r.sp.textContent !== v) r.sp.textContent = v;
          k -= r.s.length;
        }
      },
    };
  }
  /*
   * The doubled line: one path stroked twice, the full gauge in titanium under
   * a core in the ground that carves two threads (gauge 4, core 2: two 1 px
   * threads on integer coordinates). The pulse and the thumb are a third copy
   * in the accent on a sub-path over both, a solid run the full gauge wide, as
   * the reference film's pulses are.
   */
  function doubled(parent, path, end, ground) {
    const g = el(parent, 'g', {});
    const P = poly(path);
    const base = { fill: 'none', 'stroke-linejoin': 'miter', 'stroke-miterlimit': 10, 'stroke-linecap': 'butt' };
    const a = el(g, 'path', Object.assign({ stroke: C.ti, 'stroke-width': 4 }, base));
    const b = el(g, 'path', Object.assign({ stroke: ground || C.ink, 'stroke-width': 2 }, base));
    const p = el(g, 'path', Object.assign({ stroke: C.acc, 'stroke-width': 4 }, base));
    const x = end ? cross(g, end[0], end[1], C.white, 4) : null;
    return {
      g,
      P,
      /* drawn: the length drawn from the owner; pulse: [from, to] lengths lit in the accent; crossA: the end cross. */
      set(drawn, pulse, crossA) {
        const d = P.sub(0, drawn);
        setA(a, 'd', d || 'M0 0');
        setA(b, 'd', d || 'M0 0');
        const pd = pulse ? P.sub(Math.max(0, pulse[0]), Math.min(drawn, pulse[1])) : '';
        setA(p, 'd', pd || 'M0 0');
        if (x) opa(x, crossA || 0);
      },
    };
  }
  /* A 1 px box that draws out of its top-left corner: top and left edges first, then right and bottom. */
  function markBox(parent, color) {
    const o = { fill: 'none', stroke: color, 'stroke-width': 1, 'stroke-linecap': 'square', 'stroke-linejoin': 'miter' };
    const a = el(parent, 'path', o);
    const b = el(parent, 'path', o);
    return {
      set(x, y, w, h, p) {
        const PA = poly([[x + 0.5, y + 0.5], [x + w - 0.5, y + 0.5], [x + w - 0.5, y + h - 0.5]]);
        const PB = poly([[x + 0.5, y + 0.5], [x + 0.5, y + h - 0.5], [x + w - 0.5, y + h - 0.5]]);
        setA(a, 'd', PA.sub(0, PA.total * p) || 'M0 0');
        setA(b, 'd', PB.sub(0, PB.total * p) || 'M0 0');
      },
    };
  }
  /* A 1 px rule that draws out of its left end. */
  function rule(parent, x0, x1, y, color) {
    const e = el(parent, 'line', { x1: x0, y1: y + 0.5, x2: x0, y2: y + 0.5, stroke: color || C.hair, 'stroke-width': 1 });
    return { e, set: (p) => setA(e, 'x2', f2(lerp(x0, x1, p))) };
  }

  /* ---------------- the app page ---------------- */
  /* Fixed titanium bars: the logo square, three nav bars, two summary bars, two bars in each stat card. */
  const CARD_X = [744, 888, 1032];
  const FILLS = [
    [736, 202, 20, 20],
    [776, 209, 48, 6],
    [840, 209, 56, 6],
    [912, 209, 44, 6],
    [744, 336, 280, 8],
    [744, 356, 200, 8],
  ];
  CARD_X.forEach((x, i) => FILLS.push([x + 16, 410, [52, 40, 60][i], 6], [x + 16, 444, [76, 60, 84][i], 10]));
  const CORNERS = [[PAGE.x, PAGE.y], [PAGE.x + PAGE.w, PAGE.y], [PAGE.x + PAGE.w, PAGE.y + PAGE.h], [PAGE.x, PAGE.y + PAGE.h]];
  const SEL = { right: 1176, y: 194, h: 36, chev: 1148 };
  const selLeft = (ws) => SEL.chev - 12 - ws - 16;
  const Y = { h: BL(296, 40), b: BL(552, 24), s: BL(212, 24) };

  /* One copy of the page: the base page (with its text) or a language plate (bars only). */
  function pageCopy(parent, kind) {
    const g = el(parent, 'g', {});
    const P = { kind, g };
    P.drops = kind === 'base' ? [] : CORNERS.map(() => el(g, 'line', { stroke: C.ti, 'stroke-width': 1, 'stroke-dasharray': '2 3' }));
    P.faceL = el(g, 'polygon', { fill: C.raised });
    P.faceR = el(g, 'polygon', { fill: C.raised });
    P.rimLow = el(g, 'polyline', { fill: 'none', stroke: C.hair, 'stroke-width': 1, 'stroke-linejoin': 'miter' });
    P.top = el(g, 'polygon', { fill: C.ink });
    P.rule = el(g, 'polygon', { fill: C.hair });
    P.fills = FILLS.map((r) => ({ r, e: el(g, 'polygon', { fill: C.ti }) }));
    P.cards = CARD_X.map((x) => ({ r: [x, 392, 128, 88], e: el(g, 'polygon', { fill: 'none', stroke: C.hair, 'stroke-width': 1 }) }));
    P.sel = el(g, 'polygon', { fill: 'none', stroke: C.hair, 'stroke-width': 1 });
    P.btn = el(g, 'polygon', { fill: C.white });
    P.hBar = el(g, 'polygon', { fill: C.white });
    P.bBar = el(g, 'polygon', { fill: C.ink });
    P.sBar = el(g, 'polygon', { fill: C.white });
    P.tg = el(g, 'g', {});
    el(P.tg, 'path', { d: CHEVRON, fill: C.ti, 'fill-rule': 'evenodd', transform: `translate(${SEL.chev - 2} ${SEL.y + 8}) scale(1.25)` });
    if (kind === 'base') {
      P.tx = { h: {}, b: {}, s: {} };
      for (const L of LANGS) {
        P.tx.h[L] = text(P.tg, 744, Y.h, STR[L].h, { size: 40, weight: 500, lang: L });
        P.tx.b[L] = text(P.tg, 764, Y.b, STR[L].b, { size: 24, weight: 500, lang: L, fill: C.ink });
        P.tx.s[L] = text(P.tg, 0, Y.s, STR[L].s, { size: 24, weight: 400, lang: L });
      }
    }
    P.rimTop = el(g, 'polygon', { fill: 'none', stroke: C.hair, 'stroke-width': 1, 'stroke-linejoin': 'miter' });
    return P;
  }
  /*
   * Writes one page copy. st: m (matrix), T (side face height), rim (rim color),
   * wH, wB, wS (heading, button label and selector label widths), barA (the
   * bars' opacity), lower (the matrix of the plate below, for the drop lines),
   * and for the base page lang (the language state) and textA.
   */
  function drawCopy(P, st) {
    const m = st.m;
    const [a, b, c, d] = CORNERS.map(([x, y]) => pr(m, x, y));
    const dn = (p) => [p[0], p[1] + st.T];
    if (st.T > 0.05) {
      setA(P.faceL, 'points', pts([d, c, dn(c), dn(d)]));
      setA(P.faceR, 'points', pts([b, c, dn(c), dn(b)]));
      setA(P.rimLow, 'points', pts([d, dn(d), dn(c), dn(b), b]));
      setA(P.rimLow, 'stroke', st.rim);
      show(P.faceL, 1), show(P.faceR, 1), show(P.rimLow, 1);
    } else show(P.faceL, 0), show(P.faceR, 0), show(P.rimLow, 0);
    if (P.drops.length) {
      CORNERS.forEach(([x, y], i) => {
        const tp = dn(pr(m, x, y));
        const foot = pr(st.lower, x, y);
        const on = foot[1] - tp[1] > 2;
        show(P.drops[i], on);
        if (on) setA(P.drops[i], 'x1', f2(tp[0])), setA(P.drops[i], 'y1', f2(tp[1])), setA(P.drops[i], 'x2', f2(foot[0])), setA(P.drops[i], 'y2', f2(foot[1]));
      });
    }
    setA(P.top, 'points', pts([a, b, c, d]));
    setA(P.rule, 'points', quad(m, PAGE.x, 240, PAGE.w, 1));
    for (const q of P.fills) setA(q.e, 'points', quad(m, q.r[0], q.r[1], q.r[2], q.r[3]));
    for (const q of P.cards) setA(q.e, 'points', squad(m, q.r[0], q.r[1], q.r[2], q.r[3]));
    const L0 = selLeft(st.wS);
    setA(P.sel, 'points', squad(m, L0, SEL.y, SEL.right - L0, SEL.h));
    setA(P.btn, 'points', quad(m, 744, 528, st.wB + 40, 48));
    const barOn = st.barA > 0.001;
    show(P.hBar, barOn), show(P.bBar, barOn), show(P.sBar, barOn);
    if (barOn) {
      setA(P.hBar, 'points', quad(m, 744, 290, st.wH, 12));
      setA(P.bBar, 'points', quad(m, 764, 549, st.wB, 6));
      setA(P.sBar, 'points', quad(m, L0 + 16, 209, st.wS, 6));
      [P.hBar, P.bBar, P.sBar].forEach((e) => opa(e, st.barA));
    }
    setA(P.tg, 'transform', mtx(m));
    if (P.tx) {
      for (const L of LANGS) {
        const k = langAlpha(st.lang, L) * st.textA;
        const dy = L === st.lang.to && st.lang.from !== st.lang.to ? st.lang.inY : 0;
        for (const slot of ['h', 'b', 's']) {
          const e = P.tx[slot][L];
          show(e, k > 0.001);
          if (k > 0.001) {
            opa(e, k);
            setA(e, 'transform', `translate(0 ${f2(dy)})`);
            if (slot === 's') setA(e, 'x', f2(L0 + 16));
          }
        }
      }
    }
    setA(P.rimTop, 'points', squad(m, PAGE.x, PAGE.y, PAGE.w, PAGE.h));
    setA(P.rimTop, 'stroke', st.rim);
  }

  /* ---------------- the scene ---------------- */
  function mount(stage) {
    const svg = el(stage, 'svg', { id: 'art', width: 1280, height: 720, viewBox: '0 0 1280 720' });
    svg.setAttribute('data-layout-allow-overflow', '');
    /* The ground, drawn in the art itself: a PNG-sequence render drops the page background. */
    el(svg, 'rect', { x: 0, y: 0, width: 1280, height: 720, fill: C.ink });

    /* Everything of the four steps, which the card (B5) cuts away as one. */
    const gMain = el(svg, 'g', {});

    /* The tool panel's fill (its frame is drawn last, over its contents). */
    el(gMain, 'rect', { x: PANEL.x, y: PANEL.y, width: PANEL.w, height: PANEL.h, fill: C.raised });

    /* The page: the base page, then the plates ja, fr, es. */
    const gPage = el(gMain, 'g', {});
    const base = pageCopy(gPage, 'base');
    const plates = PLATES.map((pl) => Object.assign({ pl }, { P: pageCopy(gPage, pl.L) }));
    const gPageX = el(gMain, 'g', {});
    [[PAGE.x, PAGE.y], [PAGE.x + PAGE.w - 1, PAGE.y], [PAGE.x + PAGE.w - 1, PAGE.y + PAGE.h - 1], [PAGE.x, PAGE.y + PAGE.h - 1]].forEach(([x, y]) => cross(gPageX, x, y, C.ti, 4));

    /* B1: the code. */
    const gB1 = el(gMain, 'g', {});
    const imp = codeLine(gB1, 112, BL(ROWC(1), 24), [['import', C.ti], [' { ', C.ti], ['T', C.acc], [' } ', C.ti], ['from', C.ti], [' ', C.ti], ["'gt-next'", C.white], [';', C.ti]]);
    const tOpen = codeLine(gB1, 112, BL(ROWC(3), 24), [['<T>', C.acc]]);
    const tClose = codeLine(gB1, 112, BL(ROWC(6), 24), [['</T>', C.acc]]);
    const hLine = codeLine(gB1, 112, BL(ROWC(1), 24), [['<', C.ti], ['h1', C.white], ['>', C.ti], ['Welcome back', C.white], ['</', C.ti], ['h1', C.white], ['>', C.ti]]);
    const bLine = codeLine(gB1, 112, BL(ROWC(2), 24), [['<', C.ti], ['button', C.white], ['>', C.ti], ['Get started', C.white], ['</', C.ti], ['button', C.white], ['>', C.ti]]);

    /*
     * B2: the terminal and the project's file tree. es.json shows what it now
     * holds: the two translated leaves of the <T> component, quoted as the home
     * page's payload panel shows them (TranslateWindow.tsx PayloadJson: keys
     * dim, punctuation faint, translated leaves lit). Its hashed key is left
     * out; at 24 px mono it would run past the panel's 456 px measure.
     */
    const gB2 = el(gMain, 'g', {});
    const dollar = text(gB2, 112, BL(ROWC(1), 24), '$', { mono: true, fill: C.ti });
    const cmd = codeLine(gB2, 141, BL(ROWC(1), 24), [['npx gt translate', C.white]]);
    const rule2 = rule(gB2, 112, 568, 312, C.hair);
    const leaf = (s) => [['    "', C.ti], [s, C.white], ['"', C.ti]];
    const tree = [
      [[['public/_gt/', C.ti]], 4, 4.3],
      [[['  es.json', C.white]], 5, 5.2],
      [leaf('Hola de nuevo'), 6, 5.3, 'es'],
      [leaf(ES_BEFORE), 7, 5.37, 'es'],
      [[['  fr.json', C.white]], 8, 5.6],
      [[['  ja.json', C.white]], 9, 6.0],
    ].map(([runs, row, t0, lang]) => {
      const g = el(gB2, 'g', {});
      const line = codeLine(g, 112, BL(ROWC(row), 24), runs);
      line.set(line.len);
      if (lang) line.t.setAttribute('lang', lang);
      return { g, t0 };
    });

    /*
     * B3: the Dashboard's Translations page, Components view. One <T> is one
     * component, so it is one row: its Source cell and its Translation cell
     * each hold both lines (GtjsonComponentSourceCell renders a component's
     * whole JSX children in one cell). The focus box takes the whole
     * Translation cell; the edit is on its second line.
     */
    const gB3 = el(gMain, 'g', {});
    markAt(gB3, 112, 201, (22 * 1213) / 771, C.white);
    text(gB3, 160, BL(212, 24), 'Translations', { weight: 500 });
    el(gB3, 'rect', { x: 524.5, y: 196.5, width: 43, height: 31, fill: 'none', stroke: C.hair, 'stroke-width': 1 });
    text(gB3, 546, BL(212, 24), 'es', { weight: 500, anchor: 'middle', lang: 'es' });
    rule(gB3, 112, 568, 240, C.hair).set(1);
    const LN3 = [322, 358]; // the component row's two line centres
    const rows3 = [
      [[['Source', 112, C.ti, 'en', 264], ['Translation', 352, C.ti, 'en', 264]], 288],
      [[['Welcome back', 112, C.white, 'en', LN3[0]], ['Get started', 112, C.white, 'en', LN3[1]], ['Hola de nuevo', 352, C.white, 'es', LN3[0]]], 392],
    ].map(([cells, ry], i) => {
      const g = el(gB3, 'g', {});
      cells.forEach(([s, x, color, lang, cy]) => text(g, x, BL(cy, 24), s, { fill: color, lang }));
      const r = rule(gB3, 112, 568, ry, C.hair);
      return { g, r, t0: 7.55 + 0.07 * i };
    });
    const esCell = text(rows3[1].g, 352, BL(LN3[1], 24), ES_BEFORE, { lang: 'es' });
    const focus = markBox(gB3, C.white);
    const gSave = el(gB3, 'g', {});
    const saveBox = el(gSave, 'rect', { x: 480.5, y: 600.5, width: 87, height: 43, fill: 'none', stroke: C.white, 'stroke-width': 1 });
    const saveLabel = text(gSave, 524, BL(622, 24), 'Save', { weight: 500, anchor: 'middle' });

    /* B4: <LocaleSelector /> drawn large. */
    const gB4 = el(gMain, 'g', {});
    codeLine(gB4, 112, BL(ROWC(1), 24), [['<', C.ti], ['LocaleSelector', C.white], [' />', C.ti]]);
    rule(gB4, 112, 568, 264, C.hair).set(1);
    const OPT_C = [310, 374, 438, 502];
    const opts = LANGS.map((L, i) => {
      const g = el(gB4, 'g', {});
      const t = text(g, 152, BL(OPT_C[i], 28), STR[L].s, { size: 28, lang: L, fill: C.ti });
      return { g, t, t0: 11.1 + 0.08 * i };
    });
    const rail = doubled(gB4, [[128, 288], [128, 524]], null, C.raised);

    /* The connectors, the marked boxes, the tags and the carets. */
    const gC = el(gMain, 'g', {});
    const c1h = doubled(gC, [[600, 356], [672, 356], [672, 296], [732, 296]], [732, 296]);
    const c1b = doubled(gC, [[600, 396], [656, 396], [656, 552], [732, 552]], [732, 552]);
    const boxH = markBox(gC, C.white);
    const boxB = markBox(gC, C.white);
    /*
     * From the es.json, fr.json and ja.json rows (L5, L8, L9) to each plate's
     * left vertex. The routes never cross. ja draws at 6.3, so the fr pulse
     * (0.40 s on its 242 px route) is out 0.1 s before the ja pulse starts.
     */
    const C2 = [
      { L: 'es', path: [[600, 396], [640, 396], [640, 345], [726, 345]], draw: 5.4 },
      { L: 'fr', path: [[600, 516], [656, 516], [656, 400], [726, 400]], draw: 5.8 },
      { L: 'ja', path: [[600, 556], [672, 556], [672, 455], [726, 455]], draw: 6.3 },
    ].map((c) => {
      const end = c.path[c.path.length - 1];
      const line = doubled(gC, c.path, end);
      const tg = el(gC, 'g', {});
      text(tg, 690, end[1] - 10, c.L, { weight: 500, lang: c.L });
      return Object.assign(c, { line, tg, land: c.draw + 0.35 });
    });
    /* From the component row, level with the es plate's left vertex, straight in (the row spans y 288 to 392). */
    const c3 = doubled(gC, [[600, 345], [726, 345]], [726, 345]);
    const c4 = doubled(gC, [[600, 236], [640, 236], [640, 160], [1150, 160], [1150, 194]], [1150, 194]);
    const caret = el(gC, 'rect', { x: 0, y: 0, width: 2, height: 28, fill: C.white });

    /* The tool panel's frame and corner crosses. */
    el(gMain, 'rect', { x: PANEL.x + 0.5, y: PANEL.y + 0.5, width: PANEL.w - 1, height: PANEL.h - 1, fill: 'none', stroke: C.hair, 'stroke-width': 1 });
    [[PANEL.x, PANEL.y], [PANEL.x + PANEL.w - 1, PANEL.y], [PANEL.x + PANEL.w - 1, PANEL.y + PANEL.h - 1], [PANEL.x, PANEL.y + PANEL.h - 1]].forEach(([x, y]) => cross(gMain, x, y, C.ti, 4));

    /*
     * B5: the card, after the reference film's end card (its mark top right,
     * its title bottom left, on the plain ground). The white doubled-line GT
     * mark, 176 px wide, with its top-right corner on the safe area (1200, 80);
     * the name is the fifth heading, whose baseline sits at y 640.
     */
    const gLock = el(svg, 'g', {});
    markAt(gLock, 1200 - 176, 80, 176, C.white);

    /* The headings. */
    const heads = HEADS.map((h, i) => {
      const d = document.createElement('div');
      d.className = h.lock ? 'hd lock' : 'hd';
      d.id = 'h' + (i + 1);
      d.textContent = h.text;
      stage.appendChild(d);
      return Object.assign({ d }, h);
    });

    /* One pulse at a time, all at one constant speed (stage px a second), 40 px long. */
    const PULSE_V = 700;
    const PULSE_LEN = 40;
    const pulseAt = (line, t, t0) => {
      const s = (t - t0) * PULSE_V;
      return t >= t0 && s - PULSE_LEN < line.P.total ? [s - PULSE_LEN, s] : null;
    };

    /* Each heading rises 17 px (0.6 s, expo.out), holds, and drops 12 px up (0.2 s, power2.in), counted around the loop. */
    function drawHeads(t) {
      for (const h of heads) {
        let a = 0, y = 0;
        const s = since(t, h.rise);
        const hold = since(h.drop, h.rise);
        if (s < hold) {
          const e = ease.expoOut(lin(0, 0.6, s));
          a = e;
          y = 17 * (1 - e);
        } else if (s < hold + 0.2) {
          const e = ease.p2in(lin(hold, hold + 0.2, s));
          a = 1 - e;
          y = -12 * e;
        }
        const vis = a > 0.001 ? '' : 'none';
        if (h.d.style.display !== vis) h.d.style.display = vis;
        h.d.style.opacity = f2(a);
        h.d.style.transform = `translateY(${f2(y)}px)`;
      }
    }

    function drawPage(t) {
      const p = turnAt(t);
      const tilt = parts(p).r;
      const T = THICK * tilt;
      const textA = textAt(t);
      const lang = langAt(t);
      const m0 = matrixAt(p, 0);
      drawCopy(base, { m: m0, T, rim: C.hair, wH: slotW('h', lang), wB: slotW('b', lang), wS: slotW('s', lang), barA: barAt(t), lang, textA });
      opa(gPageX, textA);
      show(gPageX, textA > 0.001);
      let lower = m0;
      for (const { pl, P } of plates) {
        const s = sepAt(pl, t);
        const on = s > 0.0005 && tilt > 0.0005;
        show(P.g, on);
        if (!on) continue;
        const m = matrixAt(p, pl.z * s * tilt);
        const wB = pl.L === 'es' ? lerp(W.b0, W.b.es, esEdit(t)) : W.b[pl.L];
        drawCopy(P, {
          m,
          T,
          rim: mix(C.hair, C.white, clamp01(s * 4)),
          wH: lerp(W.h.en, W.h[pl.L], s),
          wB: lerp(W.b.en, wB, s),
          wS: lerp(W.s.en, W.s[pl.L], s),
          barA: 1,
          lower,
        });
        lower = m;
      }
    }

    function drawB1(t, wrap) {
      // wrap false: the frame 0 code (also 15.2 to 16.0).
      const slide = wrap ? ease.p3out(lin(0.4, 0.8, t)) : 0;
      const dx = 2 * W.cw * slide;
      setA(hLine.t, 'transform', `translate(${f2(dx)} ${f2(120 * slide)})`);
      setA(bLine.t, 'transform', `translate(${f2(dx)} ${f2(120 * slide)})`);
      hLine.set(hLine.len);
      bLine.set(bLine.len);
      const ni = wrap ? typed(t, 0.5, imp.len) : 0;
      const no = wrap ? typed(t, 1.2, tOpen.len) : 0;
      const nc = wrap ? typed(t, 1.3, tClose.len) : 0;
      imp.set(ni), tOpen.set(no), tClose.set(nc);
      if (wrap && t >= 0.5 && t < 1.45) {
        const [n, row] = t < 1.2 ? [ni, 1] : t < 1.3 ? [no, 3] : [nc, 6];
        caretAt(112 + n * W.cw + 1, ROWC(row));
      }
      // The connectors from the <h1> and <button> rows to the page, their crosses, then the marked boxes.
      const on = wrap && t >= 1.6;
      show(c1h.g, on), show(c1b.g, on);
      if (on) {
        c1h.set(c1h.P.total * ease.p3out(lin(1.6, 2.2, t)), null, lin(2.2, 2.3, t));
        c1b.set(c1b.P.total * ease.p3out(lin(1.75, 2.35, t)), null, lin(2.35, 2.45, t));
      }
      boxH.set(736, 264, W.h.en + 16, 64, wrap ? ease.p3out(lin(2.2, 2.5, t)) : 0);
      boxB.set(738, 522, W.b.en + 52, 60, wrap ? ease.p3out(lin(2.35, 2.65, t)) : 0);
    }

    function drawB2(t) {
      const n = typed(t, 3.7, cmd.len);
      cmd.set(n);
      if (t < 4.15) caretAt(112 + (2 + n) * W.cw + 1, ROWC(1));
      rule2.set(ease.p3out(lin(4.2, 4.5, t)));
      for (const r of tree) {
        const k = rowIn(t, r.t0);
        show(r.g, k > 0.001);
        opa(r.g, k);
        lift(r.g, 6 * (1 - k));
      }
    }

    function drawTags(t) {
      for (const c of C2) {
        const on = t >= c.draw && t < CUT[1];
        show(c.line.g, on);
        if (on) c.line.set(c.line.P.total * ease.p3out(lin(c.draw, c.land, t)), pulseAt(c.line, t, c.land), lin(c.land, c.land + 0.1, t));
        const k = rowIn(t, c.land) * (1 - lin(11.0, 11.15, t));
        show(c.tg, k > 0.001);
        opa(c.tg, k);
        lift(c.tg, 6 * (1 - rowIn(t, c.land)));
      }
    }

    function drawB3(t) {
      rows3.forEach((r) => {
        const k = rowIn(t, r.t0);
        opa(r.g, k);
        lift(r.g, 6 * (1 - k));
        r.r.set(ease.p3out(lin(r.t0, r.t0 + 0.3, t)));
      });
      const ks = rowIn(t, 7.76);
      opa(gSave, ks);
      lift(gSave, 6 * (1 - ks));
      // The edit: the focus box, the caret, ' ahora' deleted one character a frame (50 ms).
      const del = t < 8.8 ? 0 : Math.min(6, Math.floor((t - 8.8) / 0.05 + 1e-6) + 1);
      const s = ES_BEFORE.slice(0, ES_BEFORE.length - del);
      if (esCell.textContent !== s) esCell.textContent = s;
      focus.set(344, 296, 224, 88, t < 9.8 ? ease.p3out(lin(8.3, 8.6, t)) : 1 - ease.p3out(lin(9.8, 10.0, t)));
      if (t >= 8.6 && t < 9.8) caretAt(352 + esCell.getComputedTextLength() + 2, LN3[1]);
      /*
       * Save, in the loop's one blue: the outline, the draft from 9.3 (#86a8ff
       * fill, ink label, 8.7 : 1), pressed for two frames at 9.7 (white fill,
       * ink label), the outline again from 9.8.
       */
      const draft = t >= 9.3 && t < 9.7, pressed = t >= 9.7 && t < 9.8;
      setA(saveBox, 'fill', draft ? C.acc : pressed ? C.white : 'none');
      setA(saveBox, 'stroke', draft ? C.acc : C.white);
      setA(saveLabel, 'fill', draft || pressed ? C.ink : C.white);
      const on = t >= 9.9;
      show(c3.g, on);
      if (on) c3.set(c3.P.total * ease.p3out(lin(9.9, 10.25, t)), pulseAt(c3, t, 10.25), lin(10.25, 10.35, t));
    }

    /* The thumb's centre on the rail: lands on English at 11.6, then moves with the cycle and stays on 日本語. */
    const THUMB = [[12.2, 12.55, 1], [12.95, 13.3, 2], [13.7, 14.05, 3]];
    function thumbAt(t) {
      let y = OPT_C[0];
      for (const [a, b, i] of THUMB) if (t >= a) y = lerp(y, OPT_C[i], ease.p2io(lin(a, b, t)));
      return y;
    }
    const ACTIVE = [[11.6, 0], [12.55, 1], [13.3, 2], [14.05, 3]];
    function drawB4(t) {
      opts.forEach((o, i) => {
        const k = rowIn(t, o.t0);
        opa(o.g, k);
        lift(o.g, 6 * (1 - k));
        // White when active: each arrival mixes the new option up and the old one down over 0.15 s.
        let w = 0;
        for (let j = 0; j < ACTIVE.length; j++) {
          const [at, idx] = ACTIVE[j];
          const m = lin(at, at + 0.15, t);
          if (idx === i) w = Math.max(w, m);
          else if (m > 0) w = Math.min(w, 1 - m);
        }
        setA(o.t, 'fill', mix(C.ti, C.white, w));
      });
      const railLen = rail.P.total;
      const drawn = railLen * ease.p3out(lin(11.2, 11.6, t));
      const cy = thumbAt(t) - 288;
      const grow = 40 * ease.p3out(lin(11.6, 11.75, t));
      rail.set(drawn, t >= 11.6 ? [cy - 20, cy - 20 + grow] : null);
      const on = t >= 11.7;
      show(c4.g, on);
      if (on) c4.set(c4.P.total * ease.p3out(lin(11.7, 12.1, t)), null, lin(12.1, 12.2, t));
    }

    function caretAt(x, cy) {
      show(caret, 1);
      setA(caret, 'x', f2(x));
      setA(caret, 'y', f2(cy - 14));
    }

    /* Story time for a film time: OFF ahead, around the loop, rounded to the microsecond so a wrap never lands a hair short. */
    const storyAt = (time) => {
      const v = Math.round(since(Math.max(0, Math.min(DUR, time)) + OFF, 0) * 1e6) / 1e6;
      return v >= DUR ? v - DUR : v;
    };
    function render(time) {
      const t = storyAt(time);
      const b = beat(t);
      show(gMain, b !== 5), show(gLock, b === 5);
      show(caret, 0);
      drawHeads(t);
      drawPage(t);
      show(gB1, b === 1), show(gB2, b === 2), show(gB3, b === 3), show(gB4, b === 4);
      const b1wrap = t < CUT[0];
      if (b === 1) drawB1(t, b1wrap);
      else show(c1h.g, 0), show(c1b.g, 0), boxH.set(0, 0, 1, 1, 0), boxB.set(0, 0, 1, 1, 0);
      if (b === 2) drawB2(t);
      drawTags(t);
      if (b === 3) drawB3(t);
      else show(c3.g, 0), focus.set(0, 0, 1, 1, 0);
      if (b === 4) drawB4(t);
      else show(c4.g, 0);
    }

    /* Measures every string in its own text node, in its own language, once the fonts are in. */
    function measure() {
      for (const L of LANGS) {
        for (const slot of ['h', 'b', 's']) {
          const e = base.tx[slot][L];
          show(e, 1);
          W[slot][L] = e.getComputedTextLength();
        }
      }
      W.b0 = esCell.getComputedTextLength(); // 'Comenzar ahora', with B3's group shown below
      const probe = text(svg, 0, -40, 'MMMMMMMMMM', { mono: true });
      W.cw = probe.getComputedTextLength() / 10;
      probe.remove();
      cmd.t.setAttribute('x', f2(112 + 2 * W.cw));
    }

    /* Ready once every kit face has loaded and the strings are measured. */
    const ready = Promise.all(Array.from(document.fonts).map((f) => f.load().catch(() => null)))
      .then(() => document.fonts.ready)
      .then(() => {
        show(gB3, 1);
        esCell.textContent = ES_BEFORE;
        measure();
      });

    render(0);
    return { render, ready, W, C_ISO, matrixAt, storyAt, langAt, slotW };
  }

  window.GTScene = { mount, DUR, OFF };
})();
