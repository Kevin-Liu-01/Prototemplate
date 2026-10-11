/*
 * jihe-yuanben: the film.
 *
 * Two old books are read aloud and marked by hand. Every picture is a real
 * scanned page under one lamp (lib/page.js); the only thing that moves on the
 * print is a reader's vermilion brush, and a few things lift off their pages
 * as paper. Ten beats, eleven shots, one paused GSAP timeline (v2, the
 * shots of SCRIPT-v2.md; the 100 s cut's builder is archive-100s/lib/film.js).
 *
 * Every time below comes from lib/cues.js, which tools/timeline.py writes from
 * the takes' own alignments: a word's start (W), a Mandarin character's start
 * (Z), a beat's cut (B). Every tween is a fromTo whose start values are the
 * state the build has reached (a shadow copy advanced in build order), so a
 * renderer worker that seeks straight to any frame gets the frame a worker
 * playing from 0 gets. Everything visible is drawn in the timeline's
 * onUpdate (render), from proxy values only: no clock, no Math.random, and
 * every scan, mark, slip, ink sheet and paper piece is a canvas.
 */
window.JYBuildFilm = function () {
  'use strict';
  const C = window.JYCUES;
  const D = window.JYDATA;
  const FPS = 60;
  const snap = (t) => Math.round(t * FPS) / FPS;
  const L = {};
  C.lines.forEach((l) => (L[l.id] = l));
  const B = {};
  C.beats.forEach((b) => (B[b.n] = b));
  const W = (id, w, n) => L[id].words.filter((x) => x[0].toLowerCase() === w.toLowerCase())[n || 0][1];
  const Z = (id, i) => L[id].chars[i][1];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const ease = (name) => gsap.parseEase(name);
  const e2io = ease('power2.inOut');
  const e2o = ease('power2.out');
  const e3o = ease('power3.out');

  const f = JY.frame(document.getElementById('f'));
  // Grain: a static, seeded noise of 0 to 3 code values over the window, so
  // the dark lamp pools and the table's gradient dither instead of banding in
  // 8 bits. Each pixel is white at an alpha of 0 to 3 / 255, which over a
  // colour c gives c + v (1 - c / 255), the same as screening a grey of v,
  // but in plain source-over: a blend mode here put the window into its own
  // render surface, and the depth-of-field blur inside it then came out a few
  // code values differently from one render to the next. It lifts the darkest
  // table by about 1.4 values and the lit paper by under 1.
  {
    const cv = document.createElement('canvas');
    cv.className = 'jy-grain';
    cv.width = JY.WIN_W;
    cv.height = JY.WIN_H;
    Object.assign(cv.style, { position: 'absolute', left: '0', top: '0', width: JY.WIN_W + 'px', height: JY.WIN_H + 'px', pointerEvents: 'none' });
    const g = cv.getContext('2d', JY.CPU);
    const im = g.createImageData(JY.WIN_W, JY.WIN_H);
    const R = JY.rng(1607);
    for (let i = 0; i < im.data.length; i += 4) {
      im.data[i] = im.data[i + 1] = im.data[i + 2] = 255;
      im.data[i + 3] = Math.floor(R() * 4);
    }
    g.putImageData(im, 0, 0);
    f.win.appendChild(cv);
  }
  const tl = gsap.timeline({ paused: true, onUpdate: () => render(tl.time()) });

  /* ------------------------------------------------------------ tweens */
  const shadowOf = new Map();
  const S = (o) => {
    shadowOf.set(o, Object.assign({}, o));
    return o;
  };
  function move(obj, to, dur, easeName, at) {
    const sh = shadowOf.get(obj);
    const from = {};
    for (const k in to) from[k] = sh[k];
    Object.assign(sh, to);
    tl.fromTo(obj, from, Object.assign({}, to, { duration: dur, ease: easeName || 'power2.inOut', lazy: false, immediateRender: false }), at);
  }
  // Sound cues: every brush mark and paper move is logged here, and
  // tools/events.mjs writes the list to audio/events.json for the mix, so a
  // dab is heard on the frame its circle starts.
  const EV = [];
  const sfx = (kind, t, o) => EV.push(Object.assign({ kind, t: Math.round(t * 10000) / 10000 }, o || {}));
  function brush(h, at, dur, easeName) {
    sfx('mark', at, { mark: h.m.kind, dur: Math.round(dur * 1000) / 1000 });
    const o = { p: 0 };
    tl.fromTo(o, { p: 0 }, { p: 1, duration: dur, ease: easeName || 'power2.out', lazy: false, immediateRender: false, onUpdate: () => h.set(o.p) }, at);
  }
  const mark = (pl, name, m) => JY.mark(pl, name, m);

  /* ------------------------------------------------------------ planes */
  const P = D.pages;
  const plane = (key, opts) => JY.plane(f.world, Object.assign({}, P[key], { id: 'pl-' + key }, opts || {}));
  const pl = {
    p008: plane('p008', { mbox: { x0: 560, y0: 360, x1: 1780, y1: 2820 } }),
    kircher: plane('kircher', { crop: { x0: 700, y0: 1150, x1: 4300, y1: 3400 }, mbox: { x0: 700, y0: 1150, x1: 760, y1: 1210 } }),
    siku19: plane('siku19', { tint: '#d4c4a4', filter: 'contrast(0.9)', mbox: { x0: 330, y0: 260, x1: 1290, y1: 2790 } }),
    siku132: plane('siku132', { tint: '#d4c4a4', filter: 'contrast(0.9)', mbox: { x0: 1140, y0: 760, x1: 2530, y1: 2450 } }),
    clav74f1: plane('clav74f1', { mbox: { x0: 90, y0: 790, x1: 1150, y1: 940 } }),
    clav74f21v: plane('clav74f21v', { mbox: { x0: 900, y0: 1900, x1: 960, y1: 1960 } }),
    p023: plane('p023', { mbox: { x0: 540, y0: 500, x1: 900, y1: 880 } }),
  };
  const NS = D.p008.noteSlip;
  pl.slip = JY.plane(f.world, Object.assign({}, P.p008, {
    id: 'pl-slip', crop: NS, cropSrc: 'lib/derived/p008-note-slip.jpg', clip: null,
    mbox: { x0: NS.x0, y0: 2300, x1: NS.x1, y1: NS.y1 },
  }));
  const ALL = Object.values(pl);

  /* ------------------------------------------------------------ shots */
  const shots = [];
  function shot(o) {
    o.cam = S(Object.assign({ cx: 0, cy: 0, s: 1, rx: 0, ry: 0, rz: 0, ox: 0, oy: 0 }, o.cam));
    o.st = S(Object.assign({ exp: 1, lamp: 0.6, lx: 960, ly: 420, lrx: 950, lry: 560, core: 28 }, o.st || {}));
    o.t0 = snap(o.t0);
    o.t1 = snap(o.t1);
    shots.push(o);
    return o;
  }
  const lampOf = (st) => ({ amount: st.lamp, x: st.lx, y: st.ly, rx: st.lrx, ry: st.lry, core: st.core });

  // Read light: a warm band that runs down a column as it is read
  // (colour-dodge, so the ink keeps its contrast). Drawn from the timeline.
  function readLight(plane_, col, id) {
    const top = col.chars[0][0] - 70;
    const bot = col.chars[col.chars.length - 1][1] + 70;
    const Wd = 184;
    const H = bot - top;
    const Ly = JY.layer(plane_, { x0: col.x - Wd / 2, y0: top, x1: col.x + Wd / 2, y1: bot }, { blend: 'color-dodge' });
    Ly.cv.id = id;
    const g = Ly.g;
    let last = '';
    return {
      set(p, a) {
        const key = p.toFixed(4) + '/' + a.toFixed(4);
        if (key === last) return;
        last = key;
        g.clearRect(0, 0, Wd, H);
        if (p <= 0 || a <= 0) return;
        const y = 70 + p * (H - 140);
        const c = `rgb(${Math.round(58 * a)}, ${Math.round(46 * a)}, ${Math.round(28 * a)})`;
        const v = g.createLinearGradient(0, 0, 0, H);
        const stop = (o) => clamp(o / H, 0, 1);
        v.addColorStop(0, '#000');
        v.addColorStop(stop(70), c);
        v.addColorStop(stop(y), c);
        v.addColorStop(stop(y + 110), '#000');
        v.addColorStop(1, '#000');
        g.fillStyle = v;
        g.fillRect(0, 0, Wd, H);
        const hz = g.createLinearGradient(0, 0, Wd, 0);
        hz.addColorStop(0, 'rgba(0,0,0,1)');
        hz.addColorStop(0.3, 'rgba(0,0,0,0)');
        hz.addColorStop(0.7, 'rgba(0,0,0,0)');
        hz.addColorStop(1, 'rgba(0,0,0,1)');
        g.fillStyle = hz;
        g.fillRect(0, 0, Wd, H);
      },
    };
  }

  /* ------------------------------------------------------------ v2 framings */
  // Beat 7: the framing that takes the standing 界說 slip whole once it has
  // lifted (the camera no longer travels down it).
  const SLIPCAM = { cx: 1300, cy: 1460, s: 0.3, rx: 26, rz: -1 };
  // Beat 9, line 16: back and to the right across the 1607 page until its
  // title column (line 1's ring on 幾何) stands beside the 幾何府 ring.
  // jh7: the 幾何府 ring in 1607 page px; jhT: the title ring in Qing page px.
  const ENDCAM9 = (jh7, jhT, dx, dy) => {
    const a = [jh7[0] + dx, jh7[1] + dy];
    return { cx: (a[0] + jhT[0]) / 2, cy: (a[1] + jhT[1]) / 2, s: 0.62 };
  };

  /* ================================================================ 1. The title column */
  const P8 = D.p008;
  const T8 = P8.title;
  // 幾何, the head of the title column: the ring of line 1, which stays on
  // the page for lines 15 and 16 (beat 9)
  const jhTitle = [T8.x, (T8.chars[0][0] + T8.chars[1][1]) / 2];
  {
    const wave = mark(pl.p008, 'title-wave', { kind: 'wave', x0: T8.x + T8.half + 26, y0: T8.chars[0][0] - 4, x1: T8.x + T8.half + 26, y1: T8.chars[3][1] + 6, amp: 5.5, period: 92, w: 3.0, seed: 3 });
    const ringT = mark(pl.p008, 'jh-title', { kind: 'ring', x: jhTitle[0] - 2, y: jhTitle[1], rx: 72, ry: 118, w: 5.8, seed: 27, start: -100, sweep: 372, spiral: 0.03 });
    const s1 = shot({
      key: 's1', t0: 0, t1: B[1].end, planes: [pl.p008], dof: 6, cite: P.p008.cite,
      cam: { cx: 1585, cy: 470, s: 1.42, rx: 30, rz: -1.2, ox: 250 },
      st: { exp: 0, lamp: 0.6, lx: 1260, ly: 430, lrx: 900, lry: 560, core: 28 },
    });
    // the lamp rises in 0.6 s; the camera holds the head of the column and
    // pushes in slowly, with no track down
    move(s1.st, { exp: 1 }, 0.6, 'power2.out', 0);
    move(s1.cam, { s: 1.56, cy: 500 }, B[1].end, 'power1.inOut', 0);
    brush(wave, W('en01', 'title'), 0.9, 'power2.out');
    const tWord = W('en01', 'word');
    brush(ringT, tWord, 0.9, 'power1.inOut');
  }

  /* ================================================================ 2. The Kircher plate */
  {
    const s2 = shot({
      key: 's2', t0: B[2].start, t1: B[2].end, planes: [pl.kircher], dof: 3, cite: P.kircher.cite,
      cam: { cx: 2525, cy: 2230, s: 0.8, rx: 8, rz: 0.4 },
      // both men in the lamp for line 3
      st: { lamp: 0.6, lx: 950, ly: 410, lrx: 1320, lry: 640, core: 30 },
    });
    move(s2.cam, { s: 0.87, cy: 2190 }, B[2].end - B[2].start, 'none', B[2].start);
    // on "one" the lamp narrows onto Ricci, on the left, and stays there
    move(s2.st, { lx: 400, lrx: 760, lry: 560, lamp: 0.74, core: 24 }, 0.7, 'power2.inOut', W('en04', 'one'));
  }

  /* ================================================================ 3. The credit columns */
  let lightR, lightX;
  {
    lightR = readLight(pl.p008, P8.ricci, 'rl-ricci');
    lightX = readLight(pl.p008, P8.xu, 'rl-xu');
    const T3 = B[3].start;
    // the framing holds both columns from the cut, so there is no camera cross
    const s3 = shot({
      key: 's3', t0: T3, t1: B[3].end, planes: [pl.p008], dof: 2.5, cite: P.p008.cite,
      cam: { cx: 1470, cy: 2020, s: 0.5, rx: 11, rz: -0.4 },
      st: { exp: 0.2, lamp: 0.55, lx: 960, ly: 400, lrx: 1000, lry: 520, core: 24, lr: 0, lx2: 0, ar: 1, ax: 1 },
    });
    const zr = Z('zh2', 0);
    const zx = Z('zh3', 0);
    const ringEnd = Z('zh3', 5) + 0.72;
    move(s3.st, { exp: 1 }, 0.6, 'power2.out', T3);
    // a slow push in while the columns are read, then the two rings held still
    move(s3.cam, { cx: 1520, cy: 2240, s: 0.64 }, ringEnd - T3, 'power1.inOut', T3);
    move(s3.st, { lr: 1 }, Z('zh2', 6) - zr + 0.25, 'none', zr);
    P8.ricci.chars.slice(0, 5).forEach((c, i) => {
      const h = mark(pl.p008, 'r' + i, { kind: 'dot', x: P8.ricci.x + P8.ricci.half + 6, y: c[1] + 4, rx: 11, ry: 11.5, w: 3.3, seed: 20 + i });
      brush(h, Z('zh2', i), 0.28);
    });
    const ringR = mark(pl.p008, 'ringR', { kind: 'ring', x: P8.ricci.x - 2, y: (P8.ricci.chars[5][0] + P8.ricci.chars[6][1]) / 2, rx: 64, ry: 196, w: 5.6, seed: 5, start: -104, sweep: 374, spiral: 0.035 });
    brush(ringR, Z('zh2', 5), 0.72, 'power1.inOut');
    // the read light moves to Xu's column in the gap between the two readings
    move(s3.st, { ar: 0 }, Math.max(0.2, zx - L.zh2.E), 'power1.inOut', L.zh2.E);
    move(s3.st, { lx2: 1 }, Z('zh3', 6) - zx + 0.25, 'none', zx);
    P8.xu.chars.slice(0, 5).forEach((c, i) => {
      const h = mark(pl.p008, 'x' + i, { kind: 'dot', x: P8.xu.x + P8.xu.half + 6, y: c[1] + 4, rx: 11, ry: 11.5, w: 3.3, seed: 40 + i });
      brush(h, Z('zh3', i), 0.26);
    });
    const ringX = mark(pl.p008, 'ringX', { kind: 'ring', x: P8.xu.x - 4, y: (P8.xu.chars[5][0] + P8.xu.chars[6][1]) / 2, rx: 66, ry: 198, w: 5.6, seed: 9, start: -98, sweep: 372, spiral: 0.035 });
    brush(ringX, Z('zh3', 5), 0.72, 'power1.inOut');
    move(s3.st, { ax: 0.55 }, Math.min(0.6, B[3].end - L.zh3.E), 'power1.inOut', L.zh3.E);
    s3.draw = (t, st) => {
      lightR.set(st.lr, st.ar);
      lightX.set(st.lx2, st.ax);
    };
    s3.leave = () => {
      lightR.set(0, 0);
      lightX.set(0, 0);
    };
  }

  /* ================================================================ 4. The Nine Chapters page */
  const Cp9 = D.siku19.problem;
  const jh9 = [Cp9.x, (Cp9.chars[14][0] + Cp9.chars[15][1]) / 2];
  {
    const s4 = shot({
      key: 's4', t0: B[4].start, t1: B[4].end, planes: [pl.siku19], dof: 3.5, cite: P.siku19.cite,
      cam: { cx: 1150, cy: 1060, s: 0.6, rx: 12, rz: 0.8 },
      st: { lamp: 0.66, lx: 1060, ly: 420, lrx: 900, lry: 560, core: 30 },
    });
    // six reading circles, under 十 五 步 on "fifteen paces" and under 十 六 步 on "by sixteen"
    const w15 = L.en07.words.find((x) => x[0] === 'fifteen');
    const w16 = L.en07.words.find((x) => x[0] === 'sixteen');
    const tDots = [w15[1], (w15[1] + w15[2]) / 2, W('en07', 'paces'), w16[1], (w16[1] + w16[2]) / 2, w16[2]];
    [4, 5, 6, 8, 9, 10].forEach((ci, i) => {
      const c = Cp9.chars[ci];
      const h = mark(pl.siku19, 'd' + ci, { kind: 'dot', x: Cp9.x + Cp9.half + 4, y: c[1] + 8, rx: 12, ry: 12.5, w: 3.4, seed: 60 + ci });
      brush(h, tDots[i], 0.28);
    });
    move(s4.cam, { cy: 1150 }, L.en08.S - 0.15 - B[4].start, 'power1.inOut', B[4].start);
    // the camera travels down to 問為田幾何, and on "first two characters" the brush rings 幾何
    move(s4.cam, { cy: 1900, s: 0.62 }, 1.9, 'power2.inOut', L.en08.S - 0.15);
    // v2 fix round: from the end of that travel to the cut the camera keeps
    // pushing in slowly on the ring (2.4 percent, sine.in, so it leaves the
    // travel's stop smoothly), where the first v2 build held still for 1.1 s
    const tTravel = L.en08.S - 0.15 + 1.9;
    move(s4.cam, { s: 0.635 }, B[4].end - tTravel, 'sine.in', tTravel);
    const ring9 = mark(pl.siku19, 'jh', { kind: 'ring', x: jh9[0] - 2, y: jh9[1], rx: 74, ry: 128, w: 6, seed: 31, start: -100, sweep: 372, spiral: 0.03 });
    brush(ring9, W('en08', 'first'), 0.6, 'power1.inOut');
  }

  /* ================================================================ 5. Liu Hui's figure */
  window.JYLiuHui.build({ f, tl, pl: pl.siku132, D, P, move, brush, shot, mark, sfx, W, L, B, snap });

  /* ================================================================ 6. Clavius's DEFINITIONES */
  {
    const Df = D.clav74f1.definitiones;
    const under = mark(pl.clav74f1, 'defin', { kind: 'line', x0: Df.x0, y0: Df.y1 + 14, x1: Df.x1, y1: Df.y1 + 12, w: 3.8, wobble: 1.2, bow: 1.2, seed: 21 });
    const s6 = shot({
      key: 's6', t0: B[6].start, t1: B[6].end, planes: [pl.clav74f1], dof: 4, cite: P.clav74f1.cite,
      cam: { cx: 640, cy: 1010, s: 1.0, rx: 20, rz: -0.5 },
      st: { lamp: 0.6, lx: 900, ly: 420, lrx: 1000, lry: 580, core: 28 },
    });
    move(s6.cam, { s: 1.06, cy: 990 }, B[6].end - B[6].start, 'none', B[6].start);
    brush(under, W('en10', 'defines'), 0.6, 'power2.out');
  }

  /* ================================================================ 7. The 界說 slip */
  {
    const H = P8.jsHead;
    const N = P8.note;
    const sw = NS.x1 - NS.x0;
    const shh = NS.y1 - NS.y0;
    const bare = JY.layer(pl.p008, NS, { src: 'lib/derived/p008-note-bare.png', opacity: 0 });
    // The slip's shadow on the page: a soft dark footprint, drawn once.
    const shBox = { x0: NS.x0 - 120, y0: NS.y0 - 120, x1: NS.x1 + 220, y1: NS.y1 + 160 };
    const shadowL = JY.layer(pl.p008, shBox, { blend: 'multiply', opacity: 0 });
    {
      const g = shadowL.g;
      g.filter = 'blur(26px)';
      g.fillStyle = 'rgb(40, 24, 12)';
      g.fillRect(120, 120, sw, shh);
      g.filter = 'none';
    }
    const slipEl = pl.slip.el;
    // the slip, raised into the lamp: a little brighter, with a cut edge
    const sb = { x0: NS.x0, y0: NS.y0, x1: NS.x1, y1: NS.y1 };
    const slipLight = JY.layer(pl.slip, sb, { blend: 'screen', before: 'end', opacity: 0 });
    {
      const g = slipLight.g;
      const v = g.createLinearGradient(0, 0, 0, shh);
      v.addColorStop(0, 'rgba(255, 232, 196, 0.16)');
      v.addColorStop(1, 'rgba(255, 232, 196, 0.04)');
      g.fillStyle = v;
      g.fillRect(0, 0, sw, shh);
    }
    const slipEdge = JY.layer(pl.slip, sb, { before: 'end', opacity: 0 });
    {
      const g = slipEdge.g;
      g.strokeStyle = 'rgba(70, 46, 24, 0.75)';
      g.lineWidth = 4;
      g.strokeRect(2, 2, sw - 4, shh - 4);
      g.strokeStyle = 'rgba(255, 244, 222, 0.55)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(5, 6);
      g.lineTo(5, shh - 6);
      g.stroke();
    }
    slipEl.style.transformOrigin = `${sw / 2}px ${shh}px`;
    const headRing = mark(pl.p008, 'js-head', { kind: 'ring', x: H.x, y: (H.chars[0][0] + H.chars[1][1]) / 2, rx: 70, ry: 140, w: 5, seed: 6, start: -96, sweep: 370, spiral: 0.03 });
    const slipRing = mark(pl.slip, 'js-note', { kind: 'ring', x: N.x - 2, y: (N.chars[17][0] + N.chars[18][1]) / 2, rx: 70, ry: 128, w: 5.4, seed: 4, start: -100, sweep: 372, spiral: 0.03 });
    const s7 = shot({
      key: 's7', t0: B[7].start, t1: B[7].end, planes: [pl.p008, pl.slip], dof: 5, cite: P.p008.cite,
      cam: { cx: 1100, cy: 1020, s: 0.56, rx: 24, rz: -1 },
      st: { lamp: 0.62, lx: 900, ly: 420, lrx: 900, lry: 560, core: 26, lift: 0, dk: 1 },
    });
    const tLift = W('en11', 'meaning');
    // on "made one" the brush rings the heading's 界說
    brush(headRing, W('en11', 'made'), 0.6, 'power1.inOut');
    move(s7.cam, { cy: 1080 }, tLift - B[7].start, 'none', B[7].start);
    // on "meaning" the note column lifts off as a slip hinged at its foot (1.0 s)
    move(s7.st, { lift: 1 }, 1.0, 'power2.inOut', tLift);
    sfx('lift', tLift);
    // the camera takes the standing slip whole as it stands, and holds
    move(s7.cam, SLIPCAM, 1.2, 'power2.inOut', tLift);
    move(s7.st, { lx: 870, lrx: 1000, dk: 0.4 }, 1.2, 'power2.inOut', tLift);
    // on "boundaries" the brush rings the slip's last 界說 (in 故曰界說)
    brush(slipRing, W('en11', 'boundaries'), 0.6, 'power1.inOut');
    s7.draw = (t, st) => {
      // the standing slip is square to the lens, so its ends keep sharp:
      // the depth-of-field bands fade as the camera takes it whole
      f.dofTop.style.opacity = st.dk.toFixed(3);
      f.dofBottom.style.opacity = st.dk.toFixed(3);
      const u = st.lift;
      bare.cv.style.opacity = String(clamp(u * 6, 0, 1));
      shadowL.cv.style.opacity = String(0.72 * u);
      shadowL.cv.style.transform = `translate(${(96 * u).toFixed(2)}px, ${(-60 * u).toFixed(2)}px)`;
      slipLight.cv.style.opacity = u.toFixed(3);
      slipEdge.cv.style.opacity = clamp(u * 3, 0, 1).toFixed(3);
      // v2: the slip's depth is scaled with the camera (scale3d on z), so it
      // stands 30 degrees off a page drawn at the camera's scale. The camera's
      // scale() leaves z unscaled, so in the 100 s cut the slip's top stood
      // 1/s too far toward the lens and ran out of the window at any framing.
      const kz = s7.cam.s.toFixed(5);
      slipEl.style.transform = `translateZ(${(10 * u * s7.cam.s).toFixed(2)}px) scale3d(1, 1, ${kz}) rotateX(${(-30 * u).toFixed(3)}deg) rotateZ(${(-2.4 * u).toFixed(3)}deg)`;
    };
    // The lift belongs to this shot only: leaving it puts the 1607 page back
    // as printed (the note column in place, no slip shadow), so beat 9's slide
    // shows the scan whatever path a renderer worker took to reach it.
    s7.leave = () => {
      f.dofTop.style.opacity = '';
      f.dofBottom.style.opacity = '';
      bare.cv.style.opacity = '0';
      shadowL.cv.style.opacity = '0';
      shadowL.cv.style.transform = '';
      slipLight.cv.style.opacity = '0';
      slipEdge.cv.style.opacity = '0';
      slipEl.style.transform = '';
    };
  }

  /* ================================================================ 8. A B C becomes 甲 乙 丙 丁 */
  const tSo = snap(W('en12', 'so'));
  window.JYStems.build({ f, tl, pl, D, P, move, brush, shot, mark, sfx, W, Z, L, B, snap, tSo });

  /* ================================================================ 9. 幾何 on both books */
  {
    const F = P8.fu;
    // the second problem on p. 19, 又有田廣十二步從十四步問為田幾何: its 幾何
    // (measured on the scan: 幾 2004 to 2129, 何 2156 to 2240, column centre 890)
    const jh9b = D.siku19.problem2.jh;
    const jh7 = [F.x, (F.chars[5][0] + F.chars[6][1]) / 2];
    const gap = 960;
    const dx = jh9[0] + gap - jh7[0];
    const dy = jh9[1] - jh7[1];
    const edgeX = 114; // the 1607 page's paper starts here (its clip)
    // the page edge's shadow on the Qing page: a gradient strip that follows the edge
    const shBox = { x0: 0, y0: 0, x1: 260, y1: P.siku19.h };
    const edgeShadow = JY.layer(pl.siku19, shBox, { blend: 'multiply', before: 'end', opacity: 0 });
    {
      const g = edgeShadow.g;
      const v = g.createLinearGradient(0, 0, 260, 0);
      v.addColorStop(0, 'rgba(30,18,8,0)');
      v.addColorStop(0.62, 'rgba(30,18,8,0.28)');
      v.addColorStop(1, 'rgba(30,18,8,0.62)');
      g.fillStyle = v;
      g.fillRect(0, 0, 260, P.siku19.h);
    }
    const ring9b = mark(pl.siku19, 'jh2', { kind: 'ring', x: jh9b[0] - 2, y: jh9b[1], rx: 74, ry: 128, w: 6, seed: 35, start: -100, sweep: 372, spiral: 0.03 });
    const ring7 = mark(pl.p008, 'jh', { kind: 'ring', x: jh7[0], y: jh7[1], rx: 74, ry: 128, w: 6, seed: 33, start: -100, sweep: 372, spiral: 0.03 });
    const s9 = shot({
      key: 's9', t0: B[9].start, t1: B[9].end, planes: [pl.siku19, pl.p008], dof: 4,
      cite: P.siku19.cite,
      cam: { cx: (jh9[0] + jh9b[0]) / 2 + 40, cy: jh9[1], s: 0.88, rx: 20, rz: -0.8 },
      st: { lamp: 0.62, lx: 960, ly: 420, lrx: 980, lry: 560, core: 28, slide: 0 },
    });
    const tRx = W('en15', 'Ricci');
    // on "ordinary word" the brush rings the 幾何 that ends the second problem
    brush(ring9b, W('en14', 'ordinary'), 0.6, 'power1.inOut');
    move(s9.cam, { s: 0.92 }, tRx - B[9].start, 'none', B[9].start);
    // on "Ricci and Xu" the 1607 page slides in from the right with its 幾何 (幾何府) at the same height
    move(s9.st, { slide: 1 }, 1.0, 'power2.inOut', tRx);
    sfx('slide', tRx, { gain: 0.6 });
    const camMid = { cx: jh9[0] + gap / 2, s: 0.7 };
    move(s9.cam, camMid, 1.0, 'power2.inOut', tRx);
    // on "quantity" the brush rings it
    brush(ring7, W('en15', 'quantity'), 0.6, 'power1.inOut');
    // line 16: the camera eases back and to the right across the 1607 page
    // until its title column is in frame, so line 1's ring on 幾何 stands
    // beside the 幾何府 ring (the Nine Chapters ring may leave the left edge)
    const jhT = [jhTitle[0] + dx, jhTitle[1] + dy];
    move(s9.cam, ENDCAM9(jh7, jhT, dx, dy), L.en16.E - L.en16.S, 'sine.inOut', L.en16.S);
    const far = 2900;
    // The two-book cite comes in on the first frame the 1607 page's edge is
    // inside the window: the slide and the camera are walked frame by frame
    // here, with the same eases and values the tweens use.
    let tEnter = tRx;
    const cx0 = (jh9[0] + jh9b[0]) / 2 + 40;
    const sAt = 0.92;
    for (let k = 0; k <= 60; k++) {
      const u = e2io(k / 60);
      const cx = lerp(cx0, camMid.cx, u);
      const sc = lerp(sAt, camMid.s, u);
      const ex = dx + far * (1 - u) + edgeX;
      if (960 + (ex - cx) * sc < 1920) {
        tEnter = snap(tRx + k / 60);
        break;
      }
    }
    s9.citeAt = [[tEnter, '<span class="credits-block"><span>Left: <span class="han">九章算術</span>, Qing edition, Siku Quanshu · Source Library / Internet Archive (CADAL), CC BY-SA 4.0</span>' +
      '<span>Right: <i>Jihe yuanben</i>, early 17th-century printing · Library of Congress / National Library of China (World Digital Library)</span></span>']];
    s9.draw = (t, st) => {
      const ox = dx + far * (1 - st.slide);
      pl.p008.el.style.transform = `translate3d(${ox.toFixed(2)}px, ${dy.toFixed(2)}px, 2px)`;
      const ex = ox + edgeX; // the 1607 page's left edge, in Qing page pixels
      edgeShadow.cv.style.transform = `translateX(${(ex - 260).toFixed(2)}px)`;
      edgeShadow.cv.style.opacity = ex < P.siku19.w + 40 ? '1' : '0';
    };
    s9.leave = () => {
      pl.p008.el.style.transform = '';
    };
  }

  /* ================================================================ 10. The closing title */
  const s11 = shot({
    // v2 fix round: the rows say which page was changed how (p. 19 is only
    // toned; the figure on p. 132 is also coloured, copied and cut), as
    // CREDITS.txt does; set as three rows, each under the 1680 px line
    key: 's10', t0: B[10].start, t1: C.duration, planes: [], dof: 0, cite: '<span class="credits-block"><span>Images: Library of Congress / National Library of China (World Digital Library); Villanova University, Falvey Library; Boston College Library via Internet Archive;</span>' +
      '<span>Source Library / Internet Archive (CADAL), CC BY-SA 4.0. Both Source Library pages of the <i>Nine Chapters</i> are toned in this film, and the figure on p. 132 is coloured, copied and cut.</span>' +
      '<span>These adapted images are licensed CC BY-SA 4.0 (creativecommons.org/licenses/by-sa/4.0).</span></span>',
    cam: { cx: 0, cy: 0, s: 1 },
    st: { lamp: 0.5, lx: 960, ly: 400, lrx: 900, lry: 520, core: 20, c0: 0, c1: 0, c2: 0, c3: 0, stop: 0, drift: 0 },
  });
  window.JYEnd.build({ f, tl, L, B, snap, move, sfx, s11 });

  shots.sort((a, b) => a.t0 - b.t0);
  const BOOK = { s1: 'loc', s2: 'kircher', s3: 'loc', s4: 'siku', s5: 'siku79', s6: 'clav74', s7: 'loc', s8a: 'clav74', s8b: 'loc', s9: 'siku', s10: null };
  shots.forEach((sh, i) => {
    if (i > 0 && BOOK[sh.key] && BOOK[sh.key] !== BOOK[shots[i - 1].key]) sfx('settle', sh.t0);
  });

  /* ------------------------------------------------------------ the bars */
  const cites = [];
  for (const sh of shots) {
    const ranges = [[sh.t0, sh.cite]].concat(sh.citeAt || []);
    ranges.forEach(([t0, html], i) => {
      const t1 = i + 1 < ranges.length ? ranges[i + 1][0] : sh.t1;
      const el = document.createElement('span');
      el.innerHTML = html;
      el.style.opacity = '0';
      f.citeEl.appendChild(el);
      cites.push({ t0, t1, el });
    });
  }
  const ROW = 44;
  const BAR_C = 63;
  const subs = C.subs.map((s) => {
    const el = document.createElement('span');
    el.className = 'sub-line';
    el.innerHTML = s.html;
    el.style.opacity = '0';
    f.subEl.appendChild(el);
    // on the 60 fps grid, as the shots are: a line that leaves at a cut then
    // leaves on that cut's frame, not one frame into the next shot
    return Object.assign({ el }, s, { t0: snap(s.t0), t1: snap(s.t1) });
  });
  const cutTimes = new Set(C.beats.map((b) => snap(b.start)));
  const events = Array.from(new Set(subs.flatMap((s) => [s.t0, s.t1]))).sort((a, b) => a - b);
  // The same 1e-6 tolerance the shots and the cites use.
  const activeAt = (t) => subs.filter((s) => s.t0 <= t + 1e-6 && t < s.t1 - 1e-6);
  // A line carried over a cut takes, on the cut frame, the row it keeps once
  // the next line comes in, when that line comes within 0.5 s of the cut: the
  // carried line moves once, hidden by the cut, instead of jumping to the
  // centre on the cut and gliding up again as the next line fades in (v2 fix
  // round). The lines still to come hold their rows in the layout only.
  const cutList = Array.from(cutTimes).sort((a, b) => a - b);
  const reserved = (t, set) => {
    let c = null;
    for (const x of cutList) if (x <= t + 1e-6) c = x;
    if (c === null || !set.some((s) => s.t0 < c - 1e-6)) return [];
    return subs.filter((s) => s.t0 > t + 1e-6 && s.t0 <= c + 0.5 + 1e-6 && set.indexOf(s) < 0);
  };
  const layout = (set, t) => {
    const res = reserved(t, set);
    const all = set.concat(res);
    const R = all.reduce((a, s) => a + s.rows, 0);
    let y = BAR_C - (R * ROW) / 2;
    const m = new Map();
    for (const s of all) {
      if (set.indexOf(s) >= 0) m.set(s, y);
      y += s.rows * ROW;
    }
    return m;
  };
  let subKey = '';
  function renderSubs(t) {
    let e = -1;
    for (const x of events) if (x <= t + 1e-6) e = x;
    const before = e < 0 ? [] : activeAt(e - 1e-4);
    const after = activeAt(e < 0 ? t : e);
    const cut = cutTimes.has(snap(e));
    const k = cut ? 1 : e2io(clamp((t - e) / 0.32, 0, 1));
    const kin = cut ? 1 : e2o(clamp((t - e - 0.14) / 0.26, 0, 1));
    const kout = cut ? 1 : clamp((t - e) / 0.16, 0, 1);
    const lb = layout(before, e - 1e-4);
    const la = layout(after, e < 0 ? t : e);
    const state = [];
    for (const s of subs) {
      let y = 0;
      let o = 0;
      if (la.has(s) && lb.has(s)) {
        y = lerp(lb.get(s), la.get(s), k);
        o = 1;
      } else if (la.has(s)) {
        y = la.get(s) + ROW * 0.3 * (1 - kin);
        o = kin;
      } else if (lb.has(s) && !cut) {
        y = lb.get(s) - ROW * 0.3 * k;
        o = 1 - kout;
      }
      state.push(o > 0.001 ? `${y.toFixed(2)}|${o.toFixed(3)}` : '');
      if (o > 0.001) {
        s.el.style.transform = `translateY(${y.toFixed(2)}px)`;
        s.el.style.opacity = o.toFixed(3);
      } else s.el.style.opacity = '0';
    }
    subKey = state.join(',');
  }

  /* ------------------------------------------------------------ render */
  let cur = null;
  function shotAt(t) {
    let r = shots[0];
    for (const sh of shots) if (sh.t0 <= t + 1e-6) r = sh;
    return r;
  }
  function render(t) {
    const sh = shotAt(t);
    if (sh !== cur) {
      if (cur && cur.leave) cur.leave();
      for (const p of ALL) p.el.style.display = sh.planes.indexOf(p) >= 0 ? 'block' : 'none';
      f.dof(sh.dof);
      if (sh.enter) sh.enter();
      cur = sh;
    }
    f.camera(sh.cam);
    f.exposure(sh.st.exp);
    f.lamp(lampOf(sh.st));
    if (sh.draw) sh.draw(t, sh.st);
    // the first cite comes up with the lamp
    const citeA = sh.key === 's1' ? clamp(sh.st.exp, 0, 1) : 1;
    for (const c of cites) c.el.style.opacity = c.t0 <= t + 1e-6 && t < c.t1 - 1e-6 ? citeA.toFixed(3) : '0';
    if (t >= C.duration - 1e-6) cites[cites.length - 1].el.style.opacity = '1';
    renderSubs(t);
    JY.flush();
  }

  EV.sort((a, b) => a.t - b.t);
  window.JYFilm = { tl, render, shots, f, pl, events: EV };
  return window.JYFilm;
};
