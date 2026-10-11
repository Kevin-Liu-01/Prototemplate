/*
 * modern-hebrew: the film engine.
 *
 * MHFilm.mount(el) builds the whole frame inside el, synchronously, and
 * returns { render(t), DUR }. render(t) is a pure function of film time: it
 * asks the beat that owns t for a frame state (lib/beats.js) and applies that
 * state to the frame. Nothing reads a clock, nothing is random, nothing
 * touches the network.
 *
 * The frame, bottom to top:
 *   canvas.mh-page   the ground (the book's paper, or the board), the page under
 *                    the copy-stand camera with its ghost veil and isolation
 *                    holes, the documents laid on the board, the coinage sign
 *                    (lifted from the key of signs and printed in the accent,
 *                    the only object that crosses a cut), the page's bands and
 *                    rules. A software canvas: every render process rasterises
 *                    the scans alike. Pictures are drawn from hidden <img>
 *                    elements, so the renderer waits for them.
 *   svg.mh-svg       set type on the cards (Hebrew lines as single text nodes
 *                    with lang="he", direction rtl; moving words as glyph
 *                    outlines from lib/build.js), crop marks, hairlines, rules.
 *   div.mh-head      the running head (only the guide words copied from a
 *                    scan's page); div.mh-notes the numbered notes.
 * v2 (SCRIPT-v2.md): the board, its documents' notes and the close heading are
 * cut; the 100 s engine is in archive-100s/lib/film.js.
 */
(function () {
  const { k, L, COL, WIN, toScreen, rectScreen } = window.MHU;
  const D = window.MHDATA;
  const GL = window.MH_GLYPHS;
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1920;
  const H = 1080;
  const DUR = window.MH_CUES.DUR; // the film's length, from the takes (sound/tools/mix.py)

  // ---------- small DOM helpers ----------
  function svgEl(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const a in attrs) n.setAttribute(a, attrs[a]);
    if (parent) parent.appendChild(n);
    return n;
  }
  // A Hebrew line as one SVG text node. anchor: the edge of the line at x
  // ('right', 'center' or 'left'); y is the baseline.
  function he(parent, str, x, y, size, o = {}) {
    const anchor = { right: 'start', center: 'middle', left: 'end' }[o.anchor || 'right'];
    const t = svgEl('text', {
      x: x.toFixed(2), y: y.toFixed(2), 'font-family': 'MH Hebrew', 'font-weight': o.weight || 500, 'font-size': size,
      fill: o.fill || COL.ink, direction: 'rtl', 'text-anchor': anchor, lang: 'he', dir: 'rtl', class: 'heb', 'data-f0': o.fill || COL.ink,
      'text-rendering': 'geometricPrecision',
    }, parent);
    t.textContent = str;
    return t;
  }
  // A Latin line (glosses, labels). Markup: <i>..</i> sets italic inside a
  // roman line, <r>..</r> roman inside an italic one, <h>..</h> a Hebrew run.
  function la(parent, markup, x, y, size, o = {}) {
    const anchor = { left: 'start', center: 'middle', right: 'end' }[o.anchor || 'left'];
    const t = svgEl('text', {
      x: x.toFixed(2), y: y.toFixed(2), 'font-family': 'MH Latin', 'font-weight': o.weight || 400, 'font-size': size,
      fill: o.fill || COL.ink2, 'text-anchor': anchor, 'font-style': o.italic ? 'italic' : 'normal', lang: 'en', 'data-f0': o.fill || COL.ink2,
    }, parent);
    const re = /<(i|r|h|g)>(.*?)<\/\1>/g;
    let last = 0;
    let m;
    const plain = (s) => { if (s) svgEl('tspan', {}, t).textContent = s; };
    while ((m = re.exec(markup))) {
      plain(markup.slice(last, m.index));
      const sp = svgEl('tspan', {}, t);
      if (m[1] === 'i') sp.setAttribute('font-style', 'italic');
      if (m[1] === 'r') sp.setAttribute('font-style', 'normal');
      if (m[1] === 'h') {
        sp.setAttribute('font-family', 'MH Hebrew');
        sp.setAttribute('font-weight', '500');
        sp.setAttribute('font-style', 'normal');
        sp.setAttribute('lang', 'he');
        sp.setAttribute('direction', 'rtl');
        sp.setAttribute('font-size', Math.round(size * 1.1));
      }
      if (m[1] === 'g') {
        sp.setAttribute('font-family', 'MH Greek');
        sp.setAttribute('font-style', 'normal');
      }
      sp.textContent = m[2];
      last = re.lastIndex;
    }
    plain(markup.slice(last));
    return t;
  }
  // Hebrew run inside an HTML note: one isolated text node
  const bdi = (s) => `<bdi class="he" lang="he" dir="rtl">${s}</bdi>`;
  // width in px of a shaped line from data/glyphs.js
  const adv = (id, size) => (GL.strings[id].adv * size) / GL.upm;
  // a word's edges in px inside a shaped line set with its right edge at x
  function wordX(id, wi, x, size) {
    const s = size / GL.upm;
    const S = GL.strings[id];
    const left = x - S.adv * s;
    return [left + S.words[wi].x0 * s, left + S.words[wi].x1 * s];
  }

  // ---------- the notes, as the book prints them (SCRIPT-v2, Notes and glosses on screen) ----------
  const N = {
    n1: `<span class="n">1)</span>Eliezer Ben-Yehuda’s dictionary began to appear in 1908.`,
    n2: `<span class="n">2)</span>Ben-Yehuda’s column appeared in the Hebrew weekly <i>Magid Mishneh</i> on 1 January 1880.`,
    n3: `<span class="n">3)</span>The dictionary’s pages are from the Princeton Theological Seminary Library copy on the Internet Archive.`,
    n4: `<span class="n">4)</span>Today the word is pointed ${bdi('אוֹפַנַּיִם')}.`,
    n5: `<span class="n">5)</span>Ezekiel 1:4 is set here from the public-domain text Tanach with Nikkud.`,
    n6: `<span class="n">6)</span>Vol. 4 credits this sense to the poet Judah Leib Gordon.`,
    n7: `<span class="n">7)</span>The scholar Reuven Sivan concludes that Pines apparently coined the word in 1885–86 on the model of German <i>Liebesapfel</i>, love apple.`,
  };

  // ---------- the cards: set type on the book's paper ----------
  // Every layout number is in screen px at 1920 x 1080. Hebrew lines are
  // placed by their right edge (or centre) and baseline; word edges inside a
  // line come from the shaped advances in data/glyphs.js. Every gloss is a
  // sentence in MH Latin italic 34 px, ink 2.
  const inkRole = (role) => (role === 'r' ? COL.ink : COL.ink2);
  const GLOSS = 34;
  const gloss = (parent, markup, x, y, anchor = 'center') => la(parent, markup, x, y, GLOSS, { anchor, italic: true });
  function buildCards(svg, R) {
    const E = {}; // element groups the beats show, by name
    const geo = {};
    const grp = (name, parent = svg) => (E[name] = svgEl('g', { class: 'mh-el', 'data-el': name }, parent));
    const card = (name) => grp(name);

    // card 1: בתי עיניים, then ספר מלים, struck; Wörter under מלים, buch under ספר
    {
      const c = card('sefer');
      const y0 = 280;
      const s0 = 150;
      const b = grp('sefer.batei', c);
      he(b, 'בתי עיניים', 960 + adv('batei', s0) / 2, y0, s0);
      gloss(grp('sefer.bateiGloss', c), 'The phrase for eyeglasses meant houses for the eyes.', 960, y0 + 88);
      const size = 200;
      const x = 960 + adv('sefer', size) / 2;
      const y = 580;
      he(grp('sefer.he', c), 'ספר מלים', x, y, size);
      const [s0x, s1x] = wordX('sefer', 0, x, size); // ספר
      const [m0, m1] = wordX('sefer', 1, x, size); // מלים
      geo.strike = { x0: x - adv('sefer', size) - 18, x1: x + 18, y: y - 0.29 * size };
      E['sefer.strike'] = svgEl('rect', { x: 0, y: (geo.strike.y - 1).toFixed(1), width: 0, height: 2, fill: COL.ink }, c);
      const yg = 750;
      const cS = (s0x + s1x) / 2;
      const cM = (m0 + m1) / 2;
      geo.german = { cS, cM, top: yg - 74, bot: y + 24 };
      la(grp('sefer.wort', c), 'Wörter', cM, yg, 96, { anchor: 'center', fill: COL.ink2 });
      la(grp('sefer.buch', c), 'buch', cS, yg, 96, { anchor: 'center', fill: COL.ink2 });
      E['sefer.hairM'] = svgEl('line', { x1: cM, x2: cM, y1: 0, y2: 0, stroke: COL.ink2, 'stroke-width': 1 }, c);
      E['sefer.hairS'] = svgEl('line', { x1: cS, x2: cS, y1: 0, y2: 0, stroke: COL.ink2, 'stroke-width': 1 }, c);
      gloss(grp('sefer.gloss', c), 'Sefer milim means book of words.', 960, 822);
    }

    // card 2: the sum מִלָּה + ־וֹן = מִלּוֹן, a sentence to the left of each row
    {
      const c = card('milon');
      const size = 160;
      const XR = 1318;
      const XG = XR - adv('plusOn', size) - 64;
      const rows = [345, 535, 765];
      he(grp('milon.r0', c), 'מִלָּה', XR, rows[0], size);
      gloss(E['milon.r0'], 'Mila means word.', XG, rows[0] - 38, 'right');
      he(grp('milon.r1', c), '+ ־וֹן', XR, rows[1], size, { fill: COL.ink2 });
      gloss(E['milon.r1'], 'The ending <h>־וֹן</h> can mark a holder.', XG, rows[1] - 38, 'right');
      geo.sum = { x0: XG - 520, x1: XR + 20, y: 605 };
      E['milon.sum'] = svgEl('rect', { x: 0, y: geo.sum.y, width: 0, height: 1, fill: COL.ink, opacity: 0.6 }, c);
      const r2 = grp('milon.r2', c);
      he(r2, 'מִלּוֹן', XR, rows[2], size, { fill: COL.ink2 });
      overlay(r2, 'milon', XR, rows[2], size);
      gloss(r2, 'Milon means dictionary.', XG, rows[2] - 38, 'right');
    }

    // the composing card. מַקְטֵל on the rail; the root ק ל ע in the tray
    {
      const c = card('maktel');
      const size = 220;
      const RX = 1350;
      const RY = 635;
      geo.maktel = { RX, RY, size };
      E['maktel.rail'] = svgEl('line', { x1: 760, x2: 1500, y1: RY + 2.5, y2: RY + 2.5, stroke: COL.ink2, 'stroke-width': 1, opacity: 0.5 }, c);
      // the pattern's מ, for the crop marks on "mem" (its ink box and patah, screen px)
      {
        const P0 = window.MHBuild.place('maktel', RX, RY, size);
        const m = P0.W.clusters[0].glyphs;
        const x0 = Math.min(...m.map((g) => P0.left + (g.x + g.bb[0]) * P0.s));
        const x1 = Math.max(...m.map((g) => P0.left + (g.x + g.bb[2]) * P0.s));
        const y0 = Math.min(...m.map((g) => RY - (g.y + g.bb[3]) * P0.s));
        const y1 = Math.max(...m.map((g) => RY - (g.y + g.bb[1]) * P0.s));
        geo.mem = [x0, y0, x1, y1];
      }
      // the tray: three cells over the three slots, in reading order right to left
      const P = window.MHBuild.place('maklea', RX, RY, size);
      const slotX = [1, 2, 3].map((ci) => {
        const g = P.W.clusters[ci].glyphs[0];
        return P.left + ((g.x + (g.bb[0] + g.bb[2]) / 2) * P.s);
      });
      const cell = 132;
      const gap = 14;
      const mid = (slotX[0] + slotX[2]) / 2;
      const cy = 287;
      const tray = [0, 1, 2].map((i) => ({ x: mid + (cell + gap) - i * (cell + gap), y: cy, size: 110, ch: 'קלע'[i] }));
      geo.tray = tray;
      const tg = grp('maktel.tray', c);
      tray.forEach((t, i) => {
        E[`maktel.cell${i}`] = svgEl('rect', { x: t.x - cell / 2, y: cy - cell / 2, width: cell, height: cell, fill: 'none', stroke: COL.ink2, 'stroke-width': 1, opacity: 0.55 }, tg);
      });
      // the root's sentence to the right of the tray, clear of the letters' fall
      geo.trayRight = mid + 1.5 * cell + gap;
      gloss(grp('maktel.rootGloss', c), 'The root <h>ק־ל־ע</h> means to sling.', geo.trayRight + 36, cy + 12, 'left');
      // the model, upper left, with its sentence under it
      const mod = grp('maktel.model', c);
      const MX = 610;
      he(mod, 'מַפְתֵּחַ', MX, 300, 110, { fill: COL.ink2 });
      const mc = MX - adv('mafteakh', 110) / 2;
      gloss(mod, 'Mafteakh means key and comes', mc, 380);
      gloss(mod, 'from <h>פתח</h>, to open.', mc, 426);
      // the pattern at rest (one text node) and the build
      he(grp('maktel.rest', c), 'מַקְטֵל', RX, RY, size, { fill: COL.ink2 });
      E['maktel.build'] = svgEl('g', {}, c);
      R.buildMaktel = window.MHBuild.word(E['maktel.build'], {
        to: 'maklea', x: RX, y: RY, size,
        sources: { p: { word: 'maktel', x: RX, y: RY, size } },
        take: {
          '0/0': ['move', 'p', 0, 0, 'settle'], '0/1': ['move', 'p', 0, 1, 'settle'],
          '1/0': ['tray', 0, 'drop0'], '1/1': ['move', 'p', 1, 1, 'settle'],
          '2/0': ['tray', 1, 'drop1'], '2/1': ['move', 'p', 2, 1, 'settle'],
          '3/0': ['tray', 2, 'drop2'], '3/1': ['in', 'patah'],
        },
        leave: { 'p/1/0': ['ghost', 'sink', 'drop0'], 'p/2/0': ['ghost', 'sink', 'drop1'], 'p/3/0': ['ghost', 'sink', 'drop2'] },
        tray, ink: inkRole, colors: COL,
      });
      const res = grp('maktel.result', c);
      he(res, 'מַקְלֵעַ', RX, RY, size, { fill: COL.ink2 });
      overlay(res, 'maklea', RX, RY, size);
      gloss(grp('maktel.g1', c), 'Makle’a meant a cannon.', RX - adv('maklea', size) / 2, RY + 122);
    }

    // the bicycle card. אוֹפָן on the rail, ־ַיִם at the rail's left end, the model above
    {
      const c = card('ofan');
      const size = 220;
      const RX = 1330;
      const RY = 635;
      const EX = 640;
      geo.ofan = { RX, RY, size, EX };
      svgEl('line', { x1: 360, x2: 1440, y1: RY + 2.5, y2: RY + 2.5, stroke: COL.ink2, 'stroke-width': 1, opacity: 0.5 }, grp('ofan.rail', c));
      // the model אָזְנַיִם centred over the bicycle word, its sentence to its right
      const mod = grp('ofan.model', c);
      const mc = RX - adv('ofnayim', size) / 2;
      const MY = 315;
      const mR = mc + adv('oznayim', 110) / 2;
      he(mod, 'אָזְנַיִם', mR, MY, 110, { fill: COL.ink2 });
      gloss(mod, 'Oznayim means ears.', mR + 40, MY - 18, 'left');
      // the ending of each word (נַ יִ ם), for the hairline on "ears"
      const ending = (id, xr, y, sz) => {
        const P = window.MHBuild.place(id, xr, y, sz);
        const gs = P.W.clusters.slice(2).flatMap((cl) => cl.glyphs);
        const x0 = Math.min(...gs.map((g) => P.left + (g.x + g.bb[0]) * P.s));
        const x1 = Math.max(...gs.map((g) => P.left + (g.x + g.bb[2]) * P.s));
        return { x: (x0 + x1) / 2, top: y - 597 * P.s, bot: y + 158 * P.s };
      };
      const eM = ending('oznayim', mR, MY, 110);
      const eR = ending('ofnayim', RX, RY, size);
      geo.ears = { x0: eM.x, y0: eM.bot + 14, x1: eR.x, y1: eR.top - 16 };
      E['ofan.ears'] = svgEl('line', { x1: eM.x, y1: geo.ears.y0, x2: eM.x, y2: geo.ears.y0, stroke: COL.ink2, 'stroke-width': 1 }, c);
      const src = grp('ofan.src', c);
      he(src, 'אוֹפָן', RX, RY, size, { fill: COL.ink2 });
      overlay(src, 'ofan', RX, RY, size);
      he(grp('ofan.end', c), '־ַיִם', EX, RY, size, { fill: COL.ink2 });
      // the two sentences under the rail word, set flush with its right edge
      gloss(grp('ofan.g0', c), 'Ofan means wheel.', RX, RY + 122, 'right');
      E['ofan.build'] = svgEl('g', {}, c);
      R.buildOfan = window.MHBuild.word(E['ofan.build'], {
        to: 'ofnayim', x: RX, y: RY, size,
        sources: { a: { word: 'ofan', x: RX, y: RY, size }, e: { word: 'ayim', x: EX, y: RY, size } },
        take: {
          '0/0': ['move', 'a', 0, 0, 'settle'], '0/1': ['in', 'settle'],
          '1/0': ['move', 'a', 2, 0, 'settle'], '1/1': ['in', 'settle'],
          '2/0': ['swap', 'a', 3, 0, 'dock'], '2/1': ['move', 'e', 0, 1, 'dock'],
          '3/0': ['move', 'e', 1, 0, 'dock'], '3/1': ['move', 'e', 1, 1, 'dock'],
          '4/0': ['move', 'e', 2, 0, 'dock'],
        },
        leave: { 'a/1/0': ['lift', 'leave'], 'a/1/1': ['lift', 'leave'], 'a/2/1': ['out', 'settle'], 'e/0/0': ['fade', 'settle'] },
        ink: (role) => (role === 'r' ? COL.ink : COL.ink2), colors: COL,
      });
      const res = grp('ofan.result', c);
      he(res, 'אָפְנַיִם', RX, RY, size, { fill: COL.ink2 });
      overlay(res, 'ofnayim', RX, RY, size);
      gloss(grp('ofan.g1', c), 'Ofnayim means bicycle.', RX, RY + 172, 'right');
    }

    // Ezekiel 1:4, the clause in one text node, and the verse as a sentence
    {
      const c = card('ezek');
      const size = 104;
      const x = 960 + adv('ezek', size) / 2;
      const y = 520;
      he(grp('ezek.he', c), GL.strings.ezek.text, x, y, size);
      const [w0, w1] = wordX('ezek', 2, x, size); // הַחַשְׁמַל
      geo.ezek = { w0, w1, y: y + 46 };
      E['ezek.rule'] = svgEl('rect', { x: 0, y: geo.ezek.y, width: 0, height: 2, fill: COL.ink }, c);
      la(grp('ezek.greek', c), '<g>ἤλεκτρον</g>', (w0 + w1) / 2, 386, 64, { anchor: 'center', fill: COL.ink });
      const en = grp('ezek.en', c);
      la(en, 'The verse reads, “and from its midst, like the look of the <i>khashmal</i>,', 960, 668, 36, { anchor: 'center' });
      la(en, 'from the midst of the fire.”', 960, 720, 36, { anchor: 'center' });
    }

    // the tomato. עַגְבָנִיָּה with its root in ink, and בַּדּוּרָה below it
    {
      const c = card('tomato');
      const size = 200;
      const x = 960 + adv('agvaniya', size) / 2;
      const y = 400;
      const w = grp('tomato.he', c);
      he(w, 'עַגְבָנִיָּה', x, y, size, { fill: COL.ink2 });
      overlay(w, 'agvaniya', x, y, size);
      gloss(grp('tomato.gloss', c), 'Agvaniya means tomato.', 960, y + 100);
      gloss(grp('tomato.root', c), 'The root <h>ע־ג־ב</h> means to desire.', 960, y + 150);
      geo.tomatoPlace = [x + 64, y - 0.3 * size - 36, x + 64 + 140, y - 0.3 * size + 36];
      const b = grp('tomato.badura', c);
      he(b, 'בַּדּוּרָה', 960 + adv('badura', 140) / 2, y + 330, 140);
      gloss(b, 'Ben-Yehuda used badura, from Arabic <r>bandūra</r>.', 960, y + 410);
    }

    // marks drawn per frame: crop marks, hairlines
    E.marks = svgEl('g', { class: 'mh-marks' }, svg);
    return { E, geo };

    // the carried letters of a word, as outlines in ink, laid exactly over the
    // word's text node (set in ink 2): the composing colour rule at rest
    function overlay(parent, id, x, y, size) {
      const P = window.MHBuild.place(id, x, y, size);
      for (const c2 of P.W.clusters) {
        if (c2.role !== 'r') continue;
        const g = c2.glyphs[0];
        svgEl('path', {
          d: g.d, fill: COL.ink,
          transform: `translate(${(P.left + g.x * P.s).toFixed(2)} ${(y - g.y * P.s).toFixed(2)}) scale(${P.s.toFixed(5)} ${(-P.s).toFixed(5)})`,
        }, parent);
      }
    }
  }

  // ---------- build the frame ----------
  function build(el) {
    el.classList.add('mh');
    el.innerHTML = '';
    const mk = (tag, cls, parent = el) => {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      parent.appendChild(n);
      return n;
    };
    const R = { root: el };
    // faces in use from the first frame, so the renderer waits for every one
    const warm = mk('div', 'mh-warm');
    warm.setAttribute('aria-hidden', 'true');
    warm.setAttribute('data-layout-allow-overlap', '');
    warm.setAttribute('data-layout-allow-occlusion', '');
    const occ = 'data-layout-allow-occlusion';
    warm.innerHTML = `<span ${occ} class="w-he" lang="he" dir="rtl">מִלּוֹן</span><span ${occ} class="w-la">a</span><span ${occ} class="w-la5">a</span><span ${occ} class="w-it">a</span><span ${occ} class="w-gk">ἤ</span>`;
    // pictures: hidden <img> elements the canvas draws from
    const store = mk('div', 'mh-store');
    R.img = {};
    R.ghost = {};
    const addImg = (src) => {
      const i = mk('img', null, store);
      i.src = src;
      i.alt = '';
      i.decoding = 'sync';
      return i;
    };
    for (const [id, p] of Object.entries(D.plates)) {
      R.img[id] = addImg(p.src);
      if (p.ghost) R.ghost[id] = addImg(p.ghost);
    }
    // the coinage sign: the printed sign cut from the key of signs, in rose
    R.signImg = addImg('assets/derived/sign-key-rose.png');
    // ink cut out of a plate (the title's first word)
    R.ink = {};
    for (const [id, q] of Object.entries(D.inks)) R.ink[id] = addImg(q.src);
    // layers
    R.page = mk('canvas', 'mh-page');
    R.page.width = W;
    R.page.height = H;
    // a software canvas: every worker rasterises the scans the same way,
    // whatever it drew before (a GPU canvas's image cache made frames depend
    // on the worker's history; see NOTES.md, Determinism)
    R.ctx = R.page.getContext('2d', { willReadFrequently: true, alpha: false });
    R.svg = svgEl('svg', { class: 'mh-svg', width: W, height: H, viewBox: `0 0 ${W} ${H}` }, el);
    const cards = buildCards(R.svg, R);
    R.E = cards.E;
    R.geo = cards.geo;
    R.head = mk('div', 'mh-head');
    R.hc = mk('div', 'hc', R.head);
    R.hr = mk('div', 'hr', R.head);
    R.hr.lang = 'he';
    R.hr.dir = 'rtl';
    R.hl = mk('div', 'hl', R.head);
    R.hl.lang = 'he';
    R.hl.dir = 'rtl';
    R.notes = mk('div', 'mh-notes');
    R.noteP = {};
    for (const [id, html] of Object.entries(N)) {
      const p = mk('p', 'note', R.notes);
      p.innerHTML = html;
      R.noteP[id] = p;
    }

    return R;
  }

  // ---------- apply a frame state ----------
  const ready = (img) => img && img.complete && img.naturalWidth > 0;

  function drawPage(R, S) {
    const ctx = R.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = S.ground === 'board' ? COL.board : COL.paper;
    ctx.fillRect(0, 0, W, H);
    if (S.cam) {
      const id = S.cam.id;
      const p = D.plates[id];
      const img = R.img[id];
      const gimg = R.ghost[id];
      const tx = S.cam.ax - S.cam.x * S.cam.s;
      const ty = S.cam.ay - S.cam.y * S.cam.s;
      ctx.save();
      if (S.bands >= 1) {
        ctx.beginPath();
        ctx.rect(WIN[0], WIN[1], WIN[2] - WIN[0], WIN[3] - WIN[1]);
        ctx.clip();
      }
      ctx.setTransform(S.cam.s, 0, 0, S.cam.s, tx, ty);
      // base 'page': the page in ink, its ghost over it at the veil's strength.
      // base 'ghost': the page only as its ghost, printed in from the paper at
      // S.ghostA (the open's title page, where only the first word is in ink).
      let v = S.veil ? S.veil.v : 0;
      if (S.base === 'ghost') {
        v = 0;
        if (ready(gimg) && S.ghostA > 0.001) {
          ctx.globalAlpha = Math.min(1, S.ghostA);
          ctx.drawImage(gimg, 0, 0, p.w, p.h);
          ctx.globalAlpha = 1;
        }
      } else if (ready(img)) ctx.drawImage(img, 0, 0, p.w, p.h);
      if (v > 0.001 && ready(gimg)) {
        ctx.globalAlpha = Math.min(1, v);
        ctx.drawImage(gimg, 0, 0, p.w, p.h);
        ctx.globalAlpha = 1;
      }
      if ((v > 0.001 || S.base === 'ghost') && S.veil) {
        // holes: the page itself shows through at the hole's strength
        const pad = 6 / S.cam.s;
        for (const h of S.veil.holes || []) {
          if (h.o <= 0.001) continue;
          const r = [h.r[0] - pad, h.r[1] - pad, h.r[2] + pad, h.r[3] + pad];
          if (h.sweep != null) {
            // printing in right to left: ink from the sweep's edge to the right
            // end, and a soft edge of twelve steps on its left
            const soft = h.soft || 60;
            const e = h.sweep;
            const x1 = r[2];
            const xa = Math.max(r[0], e);
            if (x1 > xa) blit(ctx, img, xa, r[1], x1 - xa, r[3] - r[1], h.o);
            for (let i = 0; i < 12; i++) {
              const sx0 = e - soft + (soft * i) / 12;
              const sx1 = e - soft + (soft * (i + 1)) / 12;
              const a0 = Math.max(r[0], sx0);
              const a1 = Math.min(x1, sx1);
              if (a1 > a0) blit(ctx, img, a0, r[1], a1 - a0, r[3] - r[1], h.o * ((i + 0.5) / 12));
            }
          } else {
            blit(ctx, img, r[0], r[1], r[2] - r[0], r[3] - r[1], h.o);
          }
        }
      }
      // ink alone, cut out of the plate, over whatever paper is drawn
      for (const q of S.inks || []) {
        const im = R.ink[q.id];
        const r = D.inks[q.id].r;
        if (!ready(im) || q.o <= 0.001) continue;
        ctx.globalAlpha = Math.min(1, q.o);
        ctx.drawImage(im, r[0], r[1], r[2] - r[0], r[3] - r[1]);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }
    // documents laid on the board, each on its own paper
    for (const d of S.docs) {
      const p = D.plates[d.id];
      const img = R.img[d.id];
      if (!ready(img) || d.o <= 0.001) continue;
      ctx.save();
      ctx.globalAlpha = d.o;
      ctx.setTransform(d.s, 0, 0, d.s, d.x, d.y);
      ctx.drawImage(img, 0, 0, p.w, p.h);
      if (d.veil && d.veil.v > 0.001 && ready(R.ghost[d.id])) {
        ctx.globalAlpha = d.o * d.veil.v;
        ctx.drawImage(R.ghost[d.id], 0, 0, p.w, p.h);
        for (const h of d.veil.holes) blit(ctx, img, h.r[0] - 6, h.r[1] - 6, h.r[2] - h.r[0] + 12, h.r[3] - h.r[1] + 12, d.o * h.o);
      }
      ctx.restore();
    }
    drawSign(R, S);
    // the page's bands and rules
    if (S.bands > 0.001 && S.ground === 'paper') {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (S.bands < 1 && S.cam) {
        ctx.globalAlpha = S.bands;
        ctx.fillStyle = COL.paper;
        ctx.fillRect(0, 0, W, WIN[1]);
        ctx.fillRect(0, WIN[3], W, H - WIN[3]);
        ctx.fillRect(0, WIN[1], WIN[0], WIN[3] - WIN[1]);
        ctx.fillRect(WIN[2], WIN[1], W - WIN[2], WIN[3] - WIN[1]);
      }
      ctx.globalAlpha = 0.55 * S.bands;
      ctx.fillStyle = COL.ink;
      ctx.fillRect(WIN[0], 131, WIN[2] - WIN[0], 1);
      ctx.fillRect(WIN[0], 908, WIN[2] - WIN[0], 1);
      ctx.globalAlpha = 1;
    }
  }
  function blit(ctx, img, x, y, w, h, a) {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const x0 = Math.max(0, x);
    const y0 = Math.max(0, y);
    const x1 = Math.min(iw, x + w);
    const y1 = Math.min(ih, y + h);
    if (x1 <= x0 || y1 <= y0) return;
    ctx.globalAlpha = Math.min(1, a);
    ctx.drawImage(img, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);
    ctx.globalAlpha = 1;
  }

  function line(g, x1, y1, x2, y2, col, op, w = 1.5) {
    svgEl('line', { x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1), stroke: col, 'stroke-width': w, opacity: op.toFixed(3), 'stroke-linecap': 'square' }, g);
  }

  function drawMarks(R, S) {
    const g = R.E.marks;
    while (g.firstChild) g.removeChild(g.firstChild);
    for (const c of S.crops) {
      const op = (c.o ?? 1) * Math.min(1, c.p * 1.5);
      if (c.p <= 0.001 || op <= 0.001) continue;
      const r = c.sr || rectScreen(S.cam, c.r);
      const pad = c.pad ?? 8;
      const gp = L(64, pad, c.p);
      const len = c.len ?? 22;
      const col = COL[c.col || 'ink'];
      const [x0, y0, x1, y1] = r;
      // Marks keep only the arms that clear the neighbouring text. A sign set
      // tight in its line (a sign before its word) keeps the vertical arms
      // (vOnly); a passage with lines close above and below it (a footnote,
      // a sentence inside a paragraph) keeps the horizontal arms (hOnly).
      const hL = !c.noLeft && !c.vOnly;
      const hR = !c.vOnly;
      const vA = !c.hOnly;
      if (hL) line(g, x0 - gp - len, y0, x0 - gp, y0, col, op);
      if (vA) line(g, x0, y0 - gp - len, x0, y0 - gp, col, op);
      if (hR) line(g, x1 + gp, y0, x1 + gp + len, y0, col, op);
      if (vA) line(g, x1, y0 - gp - len, x1, y0 - gp, col, op);
      if (hL) line(g, x0 - gp - len, y1, x0 - gp, y1, col, op);
      if (vA) line(g, x0, y1 + gp, x0, y1 + gp + len, col, op);
      if (hR) line(g, x1 + gp, y1, x1 + gp + len, y1, col, op);
      if (vA) line(g, x1, y1 + gp, x1, y1 + gp + len, col, op);
      if (c.num) {
        // the note's number at the outer corner, clear of the passage
        const right = c.numAt === 'right';
        const mid = c.numAt === 'midLeft';
        // midRight: beside the passage's line, past the right arms, in the margin;
        // belowRight: under the lower-right arm, clear of anything over the passage
        const midR = c.numAt === 'midRight';
        const below = c.numAt === 'belowRight';
        // vertical-only marks: the number stands 10 px clear of the right arm;
        // midLeft: beside the passage's first line, in the gap before it;
        // numX: a fixed x for the number's right end (a document's margin)
        const fixed = c.numX != null;
        const nx = fixed ? c.numX : (c.vOnly || below) ? x1 + 10 : (right || midR) ? x1 + gp + len + 6 : x0 - gp - len - 6;
        const ny = (mid || midR) ? y0 + (c.numFy ?? 0.62) * (y1 - y0) : below ? y1 + gp + len : y0 - gp - 6;
        const t = svgEl('text', {
          x: nx.toFixed(1), y: ny.toFixed(1), 'text-anchor': !fixed && (right || c.vOnly || below || midR) ? 'start' : 'end',
          'font-family': 'MH Latin', 'font-size': 21, fill: col, opacity: op.toFixed(3),
        }, g);
        t.textContent = c.num + ')';
      }
    }
    for (const ln of S.links) {
      if (ln.p <= 0.001) continue;
      const pts = ln.pts.map(([x, y]) => toScreen(S.cam, x, y));
      let total = 0;
      const seg = [];
      for (let i = 1; i < pts.length; i++) {
        const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        seg.push(l);
        total += l;
      }
      let left = total * ln.p;
      let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
      for (let i = 1; i < pts.length && left > 0; i++) {
        const f = Math.min(1, left / seg[i - 1]);
        d += `L${L(pts[i - 1][0], pts[i][0], f).toFixed(1)},${L(pts[i - 1][1], pts[i][1], f).toFixed(1)}`;
        left -= seg[i - 1];
      }
      svgEl('path', { d, fill: 'none', stroke: COL.ink, 'stroke-width': 1.5, opacity: (ln.o ?? 1).toFixed(3) }, g);
    }
  }

  // The coinage sign, drawn on the page canvas after the page, so it is cut at
  // the rules like the page's own text and rasterised in software like the
  // scans. Nothing set in type ever lies under it: the key's labels and crop
  // marks are gone before the lifted sign grows over them.
  function drawSign(R, S) {
    const sg = S.sign;
    if (!sg || sg.o <= 0.001 || !ready(R.signImg)) return;
    const ctx = R.ctx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (S.bands >= 1 && S.ground === 'paper') {
      ctx.beginPath();
      ctx.rect(WIN[0], WIN[1], WIN[2] - WIN[0], WIN[3] - WIN[1]);
      ctx.clip();
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.globalAlpha = Math.min(1, sg.o);
    const w = sg.w;
    const h = (w * 520) / 1000;
    ctx.drawImage(R.signImg, sg.cx - w / 2, sg.cy - h / 2, w, h);
    ctx.restore();
  }

  function apply(R, S) {
    drawPage(R, S);
    // set type
    for (const [name, n] of Object.entries(R.E)) {
      if (name === 'marks') continue;
      const st = S.el[name];
      if (!st) {
        n.setAttribute('visibility', 'hidden');
        continue;
      }
      const o = st.o ?? 1;
      // shown parts inherit, so a part never shows inside a hidden card
      if (o <= 0.001) n.setAttribute('visibility', 'hidden');
      else n.removeAttribute('visibility');
      n.setAttribute('opacity', o.toFixed(3));
      if (n.tagName === 'g') {
        if (st.dy || st.dx) n.setAttribute('transform', `translate(${(st.dx || 0).toFixed(2)} ${(st.dy || 0).toFixed(2)})`);
        else n.removeAttribute('transform');
        // every text takes its own fill back unless the state recolours it
        for (const t of n.querySelectorAll(':scope > text')) t.setAttribute('fill', st.fill || t.getAttribute('data-f0'));
      }
      if (st.rect) {
        n.setAttribute('x', st.rect[0].toFixed(2));
        n.setAttribute('width', Math.max(0, st.rect[1] - st.rect[0]).toFixed(2));
      }
      if (st.ln) {
        n.setAttribute('y1', st.ln[0].toFixed(2));
        n.setAttribute('y2', st.ln[1].toFixed(2));
      }
      if (st.x2 != null) {
        n.setAttribute('x2', st.x2.toFixed(2));
        n.setAttribute('y2', st.y2.toFixed(2));
      }
    }
    if (S.build.maktel) R.buildMaktel.set(S.build.maktel);
    if (S.build.ofan) R.buildOfan.set(S.build.ofan);
    R.svg.style.clipPath = S.bands >= 1 && S.ground === 'paper' ? `inset(${WIN[1]}px ${W - WIN[2]}px ${H - WIN[3]}px ${WIN[0]}px)` : 'none';
    drawMarks(R, S);
    // running head
    const headO = S.head ? (S.head.o ?? 1) : 0;
    if (headO > 0.001 && S.ground === 'paper') {
      R.head.style.display = 'block';
      R.head.style.opacity = headO.toFixed(3);
      if (R.hc.innerHTML !== (S.head.c || '')) R.hc.innerHTML = S.head.c || '';
      R.hr.textContent = S.head.r || '';
      R.hl.textContent = S.head.l || '';
    } else {
      R.head.style.display = 'none';
    }
    // notes in the band
    let any = false;
    for (const [id, p] of Object.entries(R.noteP)) {
      const o = S.notes[id] || 0;
      p.style.display = o > 0.001 ? 'block' : 'none';
      p.style.opacity = o.toFixed(3);
      if (o > 0.001) any = true;
    }
    R.notes.style.display = any ? 'block' : 'none';
  }

  function blank() {
    return { ground: 'paper', bands: 1, cam: null, base: 'page', veil: null, docs: [], head: null, notes: {}, el: {}, build: {}, crops: [], links: [], sign: null };
  }

  function mount(el) {
    const R = build(el);
    const beats = window.MHBeats(R);
    function render(t) {
      const tt = Math.max(0, Math.min(DUR, t));
      const b = beats.find((x) => tt >= x.t0 && tt < x.t1) || beats[beats.length - 1];
      const S = blank();
      b.f(tt - b.t0, S, tt);
      apply(R, S);
    }
    return { render, DUR, R };
  }

  window.MHFilm = { mount, DUR, N };
})();
