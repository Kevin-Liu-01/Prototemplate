/*
 * Beat 5 of v2 (beat 6 of the 100 s cut): cut and reassembled (round 8's
 * design, retimed to SCRIPT-v2 line 9; the v2 notes are at the end of this
 * header).
 *
 * The 句股容圓圖 (Siku vol. 7 to 9, p. 132), supplied by the Qing editors, is a
 * right triangle 6 cells by 8 with its inscribed circle (radius 2) and the
 * regions 朱冪, 青冪 and 黃冪. The editors' note under it: 截朱青冪各成小句股者二
 * 今倒順相補各成小長方合四朱四青四黃而成大長方以容圓之徑為廣并句股弦為袤. Four copies
 * of the triangle, cut along the circle's radii (and the 朱 and 青 kites along
 * their diagonals), close into one rectangle 4 cells by 24: the circle's
 * diameter by the sum of the three sides.
 *
 * The shot. The cut lands on the figure at the film's framing; the camera
 * makes its one move from there, back and flatter (sine.inOut, to PLAN.camEnd),
 * and the table left of the page comes into view with three plain paper
 * copies of the triangle lying in a row on it, each low over the strip's
 * place: the print turned a half (◥, upside down) over the strip's left end,
 * the print turned a quarter the other way (◢, on its long leg), and a second
 * upside-down copy. On "Liu" the figure's regions and the copies' take their
 * labels' colours together, 朱 then 青 then 黃. The four triangles then lie
 * still, the camera stopped, until "cutting": a hairline of lamp light runs
 * along every cut and fades, and the cut lines stay on the copies as fine
 * dark lines. Nothing parts.
 *
 * Then one demonstration, and the only motion of the beat: two 朱 halves
 * close into the 朱 rectangle at the strip's left end (倒順相補), one from the
 * upside-down copy and one from the copy on its long leg. The ◥'s half on its
 * long side drops down and in to the rectangle's lower half, turning about
 * its centroid by 51 degrees; the ◢'s half on its long side slides left along
 * the strip's top into the upper half, turning by 39. One ease (sine ramps
 * over the first and last PLAN.ke of the move); a moving piece lifts (its
 * shadow grows) and lies above everything.
 *
 * A rest, and the rest of the strip prints in place, one small rectangle after
 * another in reading order (the upper row left to right, then the lower row):
 * each comes up from its left edge, as ink comes up on paper, and as it does
 * the halves it is made of light up in their triangles (lighter, with a fine
 * vermilion ring) and then go: a copy's piece clears from its left edge, in
 * the brush's direction, and the print's colour drains to a ghost. No other
 * piece travels. Then the brush measures the strip in one set: the inscribed
 * circle on its left end with the upright diameter and 4, then the brackets
 * 6, 8 and 10 (the triangle's sides) and over them 24. The whole frame holds
 * still to the cut.
 *
 * The plan (copies, slots, the demonstration's paths and turn windows, the
 * print times) is worked out offline in tools/beat6/ (demo.py simulates exactly
 * the pose below at 60 fps) and written here by tools/beat6/embed.py. Every
 * piece is fitted from the print to an exact 6-8-10 figure of U px cells (the
 * moving halves in the air, the printed rectangles drawn exact in their
 * slots); the print's inner points are taken where the exact figure puts them
 * under the print's own grid, so every piece stretches by the same +-4.3
 * percent.
 *
 * Every scan, mark, piece and shadow is a canvas in the page's plane, drawn
 * from the timeline's proxies in s6.draw. No clock, no Math.random.
 *
 * v2 (SCRIPT-v2 line 9, "A commentary written in 263 CE justified those
 * methods by cutting figures apart and reassembling them."): the shot opens
 * near the end framing with the copies on the table, so round 8's pull back
 * is gone; the hairline on "cutting"; the demonstration 0.08 s after it,
 * landing on "apart"; the print-in through "and reassembling them", 0.12 s
 * apart as in round 8; the measures as the line ends; a 0.95 s still hold.
 * v2 fix round: the colours come one to a phrase of the line's subject, 朱 on
 * "commentary", 青 on "sixty-three", 黃 on "justified" (0.4 s each, as in
 * round 8), and the camera opens 2.5 percent wider than the end framing
 * (PLAN.camStart, the window's lower edge on the same page line) and pushes
 * in onto it from the cut to "cutting" (sine.out), so no frame of the shot
 * repeats before the cut and from "cutting" on the frame is round 8's.
 * Everything else is round 8.
 */
(function () {
  function build(ctx) {
    const { f, pl, move, shot, sfx, W, B } = ctx;
    const lerp = (a, b, u) => a + (b - a) * u;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const EM = gsap.parseEase('sine.inOut');
    const E2o = gsap.parseEase('power2.out');
    // sine ramps over the first and last k of a move and an even speed between
    // (its peak speed is 1 / (1 - k) of the mean; k 0.5 is sine.inOut)
    const etrap = (u, k) => {
      u = clamp(u, 0, 1);
      const v = 1 / (1 - k);
      const a = (k * v * 2) / Math.PI;
      const n = 2 * a + (1 - 2 * k) * v;
      if (u < k) return (a * (1 - Math.cos(((Math.PI / 2) * u) / k))) / n;
      if (u > 1 - k) return (n - a * (1 - Math.cos(((Math.PI / 2) * (1 - u)) / k))) / n;
      return (a + (u - k) * v) / n;
    };
    const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    const ang = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);

    // The plan, written here by tools/beat6/embed.py from tools/beat6/plan.json.
    const PLAN = /*PLAN*/ {"U":207.2,"RX":-4682.46,"RY":1581.2,"part":0.0,"pd":0.0,"ke":0.4,"tris":[{"name":"a0","rot":0,"x0":1188.0,"y0":820.5,"printed":true},{"name":"c1","rot":180,"x0":-4920.74,"y0":-174.06,"printed":false},{"name":"c2","rot":270,"x0":-3190.62,"y0":220.54,"printed":false},{"name":"c3","rot":180,"x0":-1595.18,"y0":-70.46,"printed":false}],"pieces":[{"tri":"c2","kind":"zhuR","item":"Z0","slot":[[-3439.26,1581.2],[-4682.46,1581.2],[-3439.26,1995.6]],"demo":true,"tp":33.532,"a1":0.3129,"n1":28.96,"a2":0.444,"n2":340.37,"rs":0.5,"re":0.9778},{"tri":"c1","kind":"zhuR","item":"Z0","slot":[[-4682.46,1995.6],[-3439.26,1995.6],[-4682.46,1581.2]],"demo":true,"tp":33.532,"a1":0.6,"n1":76.76,"a2":0.9,"n2":0.95,"rs":0.1706,"re":0.8517},{"tri":"c1","kind":"zhuL","item":"Z6","slot":[[-3439.26,1581.2],[-2196.06,1581.2],[-3439.26,1995.6]],"tp":33.782},{"tri":"c2","kind":"zhuL","item":"Z6","slot":[[-2196.06,1995.6],[-3439.26,1995.6],[-2196.06,1581.2]],"tp":33.782},{"tri":"c3","kind":"zhuR","item":"Z12","slot":[[-2196.06,1995.6],[-952.86,1995.6],[-2196.06,1581.2]],"tp":33.902},{"tri":"a0","kind":"zhuR","item":"Z12","slot":[[-952.86,1581.2],[-2196.06,1581.2],[-952.86,1995.6]],"tp":33.902},{"tri":"c3","kind":"zhuL","item":"Z18","slot":[[-952.86,1581.2],[290.34,1581.2],[-952.86,1995.6]],"tp":34.022},{"tri":"a0","kind":"zhuL","item":"Z18","slot":[[290.34,1995.6],[-952.86,1995.6],[290.34,1581.2]],"tp":34.022},{"tri":"c1","kind":"huang","item":"H0","slot":[[-4268.06,1995.6],[-4682.46,1995.6],[-4268.06,2410.0]],"tp":34.142},{"tri":"c1","kind":"qingL","item":"Q2","slot":[[-3439.26,1995.6],[-4268.06,1995.6],[-3439.26,2410.0]],"tp":34.262},{"tri":"c2","kind":"qingL","item":"Q2","slot":[[-4268.06,2410.0],[-3439.26,2410.0],[-4268.06,1995.6]],"tp":34.262},{"tri":"c2","kind":"huang","item":"H6","slot":[[-3024.86,2410.0],[-3024.86,1995.6],[-3439.26,2410.0]],"tp":34.382},{"tri":"c1","kind":"qingR","item":"Q8","slot":[[-2196.06,2410.0],[-3024.86,2410.0],[-2196.06,1995.6]],"tp":34.502},{"tri":"c2","kind":"qingR","item":"Q8","slot":[[-3024.86,1995.6],[-2196.06,1995.6],[-3024.86,2410.0]],"tp":34.502},{"tri":"c3","kind":"huang","item":"H12","slot":[[-1781.66,1995.6],[-2196.06,1995.6],[-1781.66,2410.0]],"tp":34.622},{"tri":"c3","kind":"qingL","item":"Q14","slot":[[-952.86,1995.6],[-1781.66,1995.6],[-952.86,2410.0]],"tp":34.742},{"tri":"a0","kind":"qingL","item":"Q14","slot":[[-1781.66,2410.0],[-952.86,2410.0],[-1781.66,1995.6]],"tp":34.742},{"tri":"a0","kind":"huang","item":"H18","slot":[[-952.86,2410.0],[-538.46,2410.0],[-952.86,1995.6]],"tp":34.862},{"tri":"c3","kind":"qingR","item":"Q20","slot":[[290.34,2410.0],[-538.46,2410.0],[290.34,1995.6]],"tp":34.982},{"tri":"a0","kind":"qingR","item":"Q20","slot":[[-538.46,1995.6],[290.34,1995.6],[-538.46,2410.0]],"tp":34.982}],"items":[{"name":"Z0","t":33.532,"x0":-4682.46,"x1":-3439.26},{"name":"Z6","t":33.782,"x0":-3439.26,"x1":-2196.06},{"name":"Z12","t":33.902,"x0":-2196.06,"x1":-952.86},{"name":"Z18","t":34.022,"x0":-952.86,"x1":290.34},{"name":"H0","t":34.142,"x0":-4682.46,"x1":-4268.06},{"name":"Q2","t":34.262,"x0":-4268.06,"x1":-3439.26},{"name":"H6","t":34.382,"x0":-3439.26,"x1":-3024.86},{"name":"Q8","t":34.502,"x0":-3024.86,"x1":-2196.06},{"name":"H12","t":34.622,"x0":-2196.06,"x1":-1781.66},{"name":"Q14","t":34.742,"x0":-1781.66,"x1":-952.86},{"name":"H18","t":34.862,"x0":-952.86,"x1":-538.46},{"name":"Q20","t":34.982,"x0":-538.46,"x1":290.34}],"demo":{"t0":32.582,"dur":0.95},"print":{"dur":0.1,"rise":0.05,"hold":0.06,"go":0.08,"lift":0.35,"ghostC":0.18},"camEnd":{"cx":-1280.65,"cy":914.81,"s":0.24308,"ox":0,"oy":0,"rx":5,"rz":0},"camStart":{"cx":-1280.65,"cy":873.31,"s":0.23715,"ox":0,"oy":0,"rx":5,"rz":0},"tCamEnd":28.1667,"lampEnd":{"lx":960,"ly":410,"lrx":1560,"lry":760,"lamp":0.5,"core":34},"dofk":0.32,"tMeasure":35.082,"measureDur":0.25,"measures":{"circleX":3,"brackets":[[0,6],[6,14],[14,24]]}} /*END*/;
    const U = PLAN.U;
    // the demonstration's one ease
    const EP = PLAN.ke == null ? EM : (u) => etrap(u, PLAN.ke);

    /* ------------------------------------------------ the printed figure */
    // The print's corners as measured (the inner edge of the outline), and its
    // inner points where the exact figure puts them under the print's own grid
    // (cells 216.4 px wide, 198.7 px tall); they lie on the printed radii.
    const BL0 = [1188, 2410];
    const EXc = (2486.5 - 1188) / 6;
    const EYc = (2410 - 820.5) / 8;
    const EXACT = { T: [0, -8], BL: [0, 0], R: [6, 0], O: [2, -2], Lt: [0, -2], Bt: [2, 0], Ht: [3.6, -3.2] };
    const p = {};
    for (const k in EXACT) p[k] = [BL0[0] + EXc * EXACT[k][0], BL0[1] + EYc * EXACT[k][1]];
    const KIND = {
      zhuL: { col: 'zhu', poly: ['T', 'Lt', 'O'], tri: ['Lt', 'T', 'O'], cuts: [[2, 0], [1, 2]] },
      zhuR: { col: 'zhu', poly: ['T', 'O', 'Ht'], tri: ['Ht', 'T', 'O'], cuts: [[0, 1], [1, 2]] },
      qingL: { col: 'qing', poly: ['R', 'Bt', 'O'], tri: ['Bt', 'R', 'O'], cuts: [[1, 2], [2, 0]] },
      qingR: { col: 'qing', poly: ['R', 'O', 'Ht'], tri: ['Ht', 'R', 'O'], cuts: [[0, 1], [1, 2]] },
      huang: { col: 'huang', poly: ['BL', 'Bt', 'O', 'Lt'], tri: ['BL', 'Bt', 'Lt'], cuts: [[1, 2], [2, 3]] },
    };
    const COL = { zhu: '#c9351b', qing: '#3f6f68', huang: '#d6a12e' };
    const OPA = { zhu: 0.62, qing: 0.55, huang: 0.6 };
    // the light on a piece's sources as its rectangle prints: lighter (its
    // paper toward the lamp's white, its colour LIFT thinner) with a fine
    // vermilion ring; once used, a copy's piece clears and the print's colour
    // drains to GHOST_C of itself (PLAN.print)
    const LIFT = PLAN.print.lift;
    const GHOST_C = PLAN.print.ghostC;
    const LAMPW = [255, 250, 240];
    const RINGW = 9;

    // A triangle turned rot degrees (clockwise on screen, quarter turns) from
    // the print, its box's top left at (x0, y0): the same rule as geo.py.
    function triVerts(rot, x0, y0) {
      const r = (((rot % 360) + 360) % 360) * (Math.PI / 180);
      const co = Math.round(Math.cos(r));
      const si = Math.round(Math.sin(r));
      const bx = p.BL[0];
      const by = p.T[1];
      const rp = {};
      let mx = Infinity;
      let my = Infinity;
      for (const k in p) {
        const q = [p[k][0] - bx, p[k][1] - by];
        const v = [co * q[0] - si * q[1], si * q[0] + co * q[1]];
        rp[k] = v;
        mx = Math.min(mx, v[0]);
        my = Math.min(my, v[1]);
      }
      const out = {};
      for (const k in rp) out[k] = [rp[k][0] - mx + x0, rp[k][1] - my + y0];
      return out;
    }
    const TRIS = {};
    for (const t of PLAN.tris) TRIS[t.name] = Object.assign({}, t, { v: t.printed ? p : triVerts(t.rot, t.x0, t.y0) });
    const COPIES = PLAN.tris.filter((t) => !t.printed).map((t) => TRIS[t.name]);

    function affine(src, dst) {
      const [[x1, y1], [x2, y2], [x3, y3]] = src;
      const det = x1 * (y2 - y3) - y1 * (x2 - x3) + (x2 * y3 - x3 * y2);
      const solve = (v1, v2, v3) => [
        (v1 * (y2 - y3) - y1 * (v2 - v3) + (v2 * y3 - v3 * y2)) / det,
        (x1 * (v2 - v3) - v1 * (x2 - x3) + (x2 * v3 - x3 * v2)) / det,
        (x1 * (y2 * v3 - y3 * v2) - y1 * (x2 * v3 - x3 * v2) + v1 * (x2 * y3 - x3 * y2)) / det,
      ];
      const [a, c, e] = solve(dst[0][0], dst[1][0], dst[2][0]);
      const [b, d, f2] = solve(dst[0][1], dst[1][1], dst[2][1]);
      return [a, b, c, d, e, f2];
    }
    const apply = (m, q) => [m[0] * q[0] + m[2] * q[1] + m[4], m[1] * q[0] + m[3] * q[1] + m[5]];
    function areaCentroid(poly) {
      let a = 0;
      let cx = 0;
      let cy = 0;
      for (let i = 0; i < poly.length; i++) {
        const [x0, y0] = poly[i];
        const [x1, y1] = poly[(i + 1) % poly.length];
        const c = x0 * y1 - x1 * y0;
        a += c;
        cx += (x0 + x1) * c;
        cy += (y0 + y1) * c;
      }
      a *= 0.5;
      return [cx / (6 * a), cy / (6 * a)];
    }

    /* ------------------------------------------------ the shot */
    // v2: line 9's words (tools/timeline.py writes them to JYCUES.liuhui and
    // the schedule into tools/beat6/plan.json, which embed.py writes above)
    const C6 = window.JYCUES.liuhui;
    const tCols = C6.colours; // "commentary", "sixty-three", "justified": 朱, 青, 黃
    const tCut = C6.cut; // "cutting"
    const T6 = B[5].start;
    const tCutLines = 0.16;
    const DEMO = PLAN.demo;
    const LAND = DEMO.t0 + DEMO.dur;
    const PR = PLAN.print;
    const tMeasure = PLAN.tMeasure;
    const MEAS = PLAN.measureDur;

    // v2 opens near the end framing, with the copies already on the table: no
    // pull back, the lamp and the depth-of-field bands as round 8 left them;
    // a slow push in from PLAN.camStart lands on round 8's end framing on
    // "cutting" (v2 fix round)
    const camEnd = PLAN.camEnd;
    const camStart = PLAN.camStart;
    const LE = PLAN.lampEnd;
    const s6 = shot({
      key: 's5', t0: T6, t1: B[5].end, planes: [pl], dof: 4,
      cite: '<span class="han">句股容圓圖</span> and its note, supplied by the Qing editors (<span class="han">原本缺圖今補</span>) · <i>Nine Chapters</i>, Qing edition, Siku Quanshu · Source Library / Internet Archive (CADAL), CC BY-SA 4.0',
      cam: Object.assign({}, camStart),
      st: { lamp: LE.lamp, lx: LE.lx, ly: LE.ly, lrx: LE.lrx, lry: LE.lry, core: LE.core, dofk: PLAN.dofk, zhu: 0, qing: 0, huang: 0, hair: 0, hairA: 0, cutk: 0, meas: 0 },
    });
    const st = s6.st;
    move(s6.cam, { cx: camEnd.cx, cy: camEnd.cy, s: camEnd.s }, tCut - T6, 'sine.out', T6);
    // the colours, 朱 then 青 then 黃, 0.4 s each as in round 8, one on each
    // phrase of the line's subject
    const CD = C6.colourDur;
    move(st, { zhu: 1 }, CD, 'power2.out', tCols[0]);
    move(st, { qing: 1 }, CD, 'power2.out', tCols[1]);
    move(st, { huang: 1 }, CD, 'power2.out', tCols[2]);
    // the cut: the hairline runs out along every cut and is gone on the
    // frame the demonstration starts (its fade starts after its rise, so the
    // fade wins); the cut lines come up on the copies as it passes and are
    // done by then too, so nothing but the pair changes after it; nothing parts
    move(st, { hair: 1 }, Math.min(0.2, DEMO.t0 - (tCut - 0.04)), 'power2.out', tCut - 0.04);
    move(st, { hairA: 1 }, 0.04, 'power1.out', tCut - 0.04);
    move(st, { hairA: 0 }, DEMO.t0 - tCut, 'power1.in', tCut);
    move(st, { cutk: 1 }, Math.min(tCutLines, DEMO.t0 - tCut), 'power2.out', tCut);
    sfx('cut', tCut);
    move(st, { meas: 1 }, MEAS, 'none', tMeasure);

    /* ------------------------------------------------ colour on the print */
    const fz = JY.fill(pl, 'zhu', [p.T, p.Ht, p.O, p.Lt], COL.zhu, 0);
    const fq = JY.fill(pl, 'qing', [p.Ht, p.R, p.Bt, p.O], COL.qing, 0);
    const fh = JY.fill(pl, 'huang', [p.Lt, p.O, p.Bt, p.BL], COL.huang, 0);

    /* ------------------------------------------------ the copies, whole */
    // Until the cut a copy is one sheet: plain paper with its regions coloured
    // as the print's are, and a contact shadow on the table.
    const bboxOf = (poly, pad) => ({
      x0: Math.floor(Math.min(...poly.map((q) => q[0]))) - pad, y0: Math.floor(Math.min(...poly.map((q) => q[1]))) - pad,
      x1: Math.ceil(Math.max(...poly.map((q) => q[0]))) + pad, y1: Math.ceil(Math.max(...poly.map((q) => q[1]))) + pad,
    });
    const tracePath = (g, poly, off) => {
      g.beginPath();
      poly.forEach((q, i) => (i ? g.lineTo(q[0] - off[0], q[1] - off[1]) : g.moveTo(q[0] - off[0], q[1] - off[1])));
      g.closePath();
    };
    const shadowOn = (L, poly) => {
      const g = L.g;
      g.filter = 'blur(13px)';
      g.fillStyle = 'rgb(34, 20, 8)';
      tracePath(g, poly, [L.box.x0, L.box.y0]);
      g.fill();
      g.filter = 'none';
    };
    for (const C of COPIES) {
      const outline = [C.v.T, C.v.BL, C.v.R];
      C.bb = bboxOf(outline, 8);
      C.sbb = bboxOf(outline, 50);
      C.shadow = JY.layer(pl, C.sbb, { before: 'end', blend: 'multiply', opacity: 0 });
      C.cv = JY.layer(pl, C.bb, { before: 'end', opacity: 0 });
      C.cv.cv.style.zIndex = '3';
      C.shadow.cv.style.zIndex = '2';
      shadowOn(C.shadow, outline.map((q) => [q[0] + 6, q[1] + 10]));
      C.key = '';
    }
    let paperRGB = null;
    let scanEl = null;
    function paintCopy(C, az, aq, ah) {
      const key = az.toFixed(3) + '/' + aq.toFixed(3) + '/' + ah.toFixed(3);
      if (key === C.key) return;
      C.key = key;
      const g = C.cv.g;
      const off = [C.bb.x0, C.bb.y0];
      const v = C.v;
      g.clearRect(0, 0, C.cv.w, C.cv.h);
      g.save();
      tracePath(g, [v.T, v.BL, v.R], off);
      g.clip();
      g.fillStyle = `rgb(${paperRGB[0]}, ${paperRGB[1]}, ${paperRGB[2]})`;
      g.fillRect(0, 0, C.cv.w, C.cv.h);
      g.globalCompositeOperation = 'multiply';
      const regions = [['zhu', az, [v.T, v.Ht, v.O, v.Lt]], ['qing', aq, [v.Ht, v.R, v.Bt, v.O]], ['huang', ah, [v.Lt, v.O, v.Bt, v.BL]]];
      for (const [col, a, poly] of regions) {
        if (a <= 0.001) continue;
        g.globalAlpha = OPA[col] * a;
        g.fillStyle = COL[col];
        tracePath(g, poly, off);
        g.fill();
      }
      g.restore();
      g.lineJoin = 'round';
      g.strokeStyle = 'rgba(56, 36, 18, 0.62)';
      g.lineWidth = 6;
      tracePath(g, [v.T, v.BL, v.R], off);
      g.stroke();
    }

    /* ------------------------------------------------ the twenty pieces */
    // Every piece of the four triangles stays at its seat (parted by the cut)
    // but the two of the demonstration; each other piece has a twin, the half
    // of its small rectangle drawn exact in its slot, which prints in at tp.
    const pieces = [];
    const twins = [];
    const PAD = 6;
    const SPAD = 52;
    const ITEM = {};
    for (const it of PLAN.items) ITEM[it.name] = it;
    for (const q of PLAN.pieces) {
      const T = TRIS[q.tri];
      const K = KIND[q.kind];
      const col = K.col;
      const poly = K.poly.map((n) => T.v[n]);
      const tri = K.tri.map((n) => T.v[n]);
      const slot = q.slot;
      const M = affine(tri, slot);
      const th = wrap(ang(slot[0], slot[1]) - ang(tri[0], tri[1]));
      const co = Math.cos(-th);
      const si = Math.sin(-th);
      const Fm = [co * M[0] - si * M[1], si * M[0] + co * M[1], co * M[2] - si * M[3], si * M[2] + co * M[3]];
      // the point that follows the path and that the piece turns about: its
      // centroid, or the corner pv
      const cen = areaCentroid(poly);
      const hinge = q.pv ? T.v[q.pv] : cen;
      const H1 = apply(M, hinge);
      // parting: away from the triangle's incentre, and kite halves apart
      // across their shared diagonal
      const O = T.v.O;
      const v = [cen[0] - O[0], cen[1] - O[1]];
      const l = Math.hypot(v[0], v[1]) || 1;
      const part = [(v[0] / l) * PLAN.part * U, (v[1] / l) * PLAN.part * U];
      if (col !== 'huang') {
        const tip = T.v[col === 'zhu' ? 'T' : 'R'];
        const dg = [tip[0] - O[0], tip[1] - O[1]];
        const dl = Math.hypot(dg[0], dg[1]);
        let nx = -dg[1] / dl;
        let ny = dg[0] / dl;
        if ((cen[0] - O[0]) * nx + (cen[1] - O[1]) * ny < 0) {
          nx = -nx;
          ny = -ny;
        }
        part[0] += nx * PLAN.pd * U;
        part[1] += ny * PLAN.pd * U;
      }
      const bb = bboxOf(poly, PAD);
      const sbb = bboxOf(poly, SPAD);
      const shadow = JY.layer(pl, sbb, { before: 'end', blend: 'multiply', opacity: 0 });
      const cv = JY.layer(pl, bb, { before: 'end', opacity: 0 });
      shadowOn(shadow, poly);
      const P0 = {
        tri: q.tri, kind: q.kind, col, cuts: K.cuts, poly, slot, M, th, Fm, hinge, H1, part, bb, sbb, cv, shadow,
        printed: !!T.printed, demo: !!q.demo, tp: q.tp, item: q.item, key: '',
        t0: q.demo ? DEMO.t0 : Infinity, dur: DEMO.dur, n1: q.n1 || 0, n2: q.n2 || 0, a1: q.a1, a2: q.a2, rs: q.rs || 0, re: q.re == null ? 1 : q.re,
      };
      pieces.push(P0);
      if (!q.demo) {
        // the twin: the exact half in its slot, plain paper and colour
        const tpoly = poly.map((r) => apply(M, r));
        const tbb = bboxOf(tpoly, PAD);
        const tsbb = bboxOf(tpoly, SPAD);
        const tw = {
          P: P0, col, poly: tpoly, bb: tbb, it: ITEM[q.item], key: '', tp: q.tp,
          shadow: JY.layer(pl, tsbb, { before: 'end', blend: 'multiply', opacity: 0 }),
          cv: JY.layer(pl, tbb, { before: 'end', opacity: 0 }),
        };
        shadowOn(tw.shadow, tpoly.map((r) => [r[0] + 5, r[1] + 8]));
        tw.cv.cv.style.zIndex = '9';
        tw.shadow.cv.style.zIndex = '8';
        twins.push(tw);
      }
    }

    // c: colour amount 0..1, kc: how far the inner cuts show 0..1, lit: the
    // light as its rectangle prints 0..1, gh: how far it has gone (a copy's
    // piece cleared from its left edge, the print's colour drained to its ghost)
    function paintPiece(P0, c, kc, lit, gh) {
      const key = c.toFixed(3) + '/' + kc.toFixed(3) + '/' + lit.toFixed(3) + '/' + gh.toFixed(3);
      if (key === P0.key) return;
      P0.key = key;
      const g = P0.cv.g;
      const off = [P0.bb.x0, P0.bb.y0];
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 1;
      g.clearRect(0, 0, P0.cv.w, P0.cv.h);
      if (!P0.printed && gh >= 0.9995) return;
      g.save();
      tracePath(g, P0.poly, off);
      g.clip();
      if (P0.printed) {
        g.drawImage(scanEl, P0.bb.x0, P0.bb.y0, P0.cv.w, P0.cv.h, 0, 0, P0.cv.w, P0.cv.h);
        if (lit > 0.001) {
          g.fillStyle = `rgba(${LAMPW[0]}, ${LAMPW[1]}, ${LAMPW[2]}, ${(0.45 * lit).toFixed(3)})`;
          g.fillRect(0, 0, P0.cv.w, P0.cv.h);
        }
      } else {
        const k = 0.6 * lit;
        g.fillStyle = `rgb(${Math.round(lerp(paperRGB[0], LAMPW[0], k))}, ${Math.round(lerp(paperRGB[1], LAMPW[1], k))}, ${Math.round(lerp(paperRGB[2], LAMPW[2], k))})`;
        g.fillRect(0, 0, P0.cv.w, P0.cv.h);
      }
      // the light thins the colour (a raise of tone, never a deepening); the
      // print's colour drains to its ghost once used
      const drain = P0.printed ? 1 - (1 - GHOST_C) * gh : 1;
      const a = OPA[P0.col] * c * (1 - LIFT * lit) * drain;
      if (a > 0.001) {
        g.globalCompositeOperation = 'multiply';
        g.globalAlpha = a;
        g.fillStyle = COL[P0.col];
        g.fillRect(0, 0, P0.cv.w, P0.cv.h);
      }
      g.restore();
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 1;
      // edges: a copy's outer edges always (it is cut paper), the cuts as they show
      g.lineJoin = 'round';
      const n = P0.poly.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const inner = P0.cuts.some(([a0, b0]) => (a0 === i && b0 === j) || (a0 === j && b0 === i));
        const alpha = inner || P0.printed ? 0.62 * kc : 0.62;
        if (alpha < 0.005) continue;
        g.strokeStyle = `rgba(56, 36, 18, ${alpha.toFixed(3)})`;
        g.lineWidth = 6;
        g.beginPath();
        g.moveTo(P0.poly[i][0] - off[0], P0.poly[i][1] - off[1]);
        g.lineTo(P0.poly[j][0] - off[0], P0.poly[j][1] - off[1]);
        g.stroke();
      }
      // the fine vermilion ring while it is lit
      if (lit > 0.001) {
        g.save();
        tracePath(g, P0.poly, off);
        g.clip();
        g.strokeStyle = `rgba(201, 53, 27, ${(0.9 * lit).toFixed(3)})`;
        g.lineWidth = 2 * RINGW;
        tracePath(g, P0.poly, off);
        g.stroke();
        g.restore();
      }
      // a copy's used piece clears from its left edge, in the brush's direction
      if (!P0.printed && gh > 0.0005) {
        const x0 = 0;
        const span = P0.cv.w;
        const F = Math.min(span, Math.max(0.15 * span, 60));
        const e = x0 + gh * (span + F);
        const gr = g.createLinearGradient(e - F, 0, e, 0);
        gr.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gr.addColorStop(1, 'rgba(0, 0, 0, 1)');
        g.globalCompositeOperation = 'destination-in';
        g.fillStyle = gr;
        g.fillRect(0, 0, P0.cv.w, P0.cv.h);
        g.globalCompositeOperation = 'source-over';
      }
    }
    // a twin printing in: w 0..1, the rectangle coming up from its left edge
    // over a soft front a little wider than half the rectangle
    function paintTwin(tw, w) {
      const key = w.toFixed(3);
      if (key === tw.key) return;
      tw.key = key;
      const g = tw.cv.g;
      const off = [tw.bb.x0, tw.bb.y0];
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 1;
      g.clearRect(0, 0, tw.cv.w, tw.cv.h);
      if (w <= 0.0005) return;
      g.save();
      tracePath(g, tw.poly, off);
      g.clip();
      g.fillStyle = `rgb(${paperRGB[0]}, ${paperRGB[1]}, ${paperRGB[2]})`;
      g.fillRect(0, 0, tw.cv.w, tw.cv.h);
      g.globalCompositeOperation = 'multiply';
      g.globalAlpha = OPA[tw.col];
      g.fillStyle = COL[tw.col];
      g.fillRect(0, 0, tw.cv.w, tw.cv.h);
      g.restore();
      g.lineJoin = 'round';
      g.strokeStyle = 'rgba(56, 36, 18, 0.62)';
      g.lineWidth = 6;
      tracePath(g, tw.poly, off);
      g.stroke();
      if (w < 0.9995) {
        const x0 = tw.it.x0 - off[0];
        const span = tw.it.x1 - tw.it.x0;
        const F = 0.6 * span;
        const e = x0 + w * (span + F);
        const gr = g.createLinearGradient(e - F, 0, e, 0);
        gr.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gr.addColorStop(1, 'rgba(0, 0, 0, 0)');
        g.globalCompositeOperation = 'destination-in';
        g.fillStyle = gr;
        g.fillRect(0, 0, tw.cv.w, tw.cv.h);
        g.globalCompositeOperation = 'source-over';
      }
    }
    pl.onPaint = (plane) => {
      if (!plane.painted) return;
      if (!paperRGB) {
        scanEl = plane.scanEl;
        const px = scanEl.getContext('2d', JY.CPU).getImageData(900, 1500, 1, 1).data; // blank paper of the page
        paperRGB = [px[0], px[1], px[2]];
      }
    };

    /* ------------------------------------------------ the cut: lamp light along the cuts */
    const cutSegs = [];
    for (const name in TRIS) {
      const v = TRIS[name].v;
      for (const [a, b] of [['O', 'T'], ['O', 'R'], ['O', 'Lt'], ['O', 'Bt'], ['O', 'Ht']]) cutSegs.push([v[a], v[b]]);
    }
    const HB = bboxOf(cutSegs.flat(), 120);
    const HK = 2;
    const hairL = JY.layer(pl, HB, { before: 'end', blend: 'screen' });
    hairL.cv.width = Math.round((HB.x1 - HB.x0) / HK);
    hairL.cv.height = Math.round((HB.y1 - HB.y0) / HK);
    hairL.g = hairL.cv.getContext('2d', JY.CPU);
    hairL.cv.style.zIndex = '90';
    let hairKey = '';
    function drawHair(u, a) {
      const key = u.toFixed(3) + '/' + a.toFixed(3);
      if (key === hairKey) return;
      hairKey = key;
      const g = hairL.g;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, hairL.cv.width, hairL.cv.height);
      if (a <= 0.001 || u <= 0.001) return;
      g.setTransform(1 / HK, 0, 0, 1 / HK, -HB.x0 / HK, -HB.y0 / HK);
      g.lineCap = 'round';
      const stroke = (w, rgba, blur) => {
        g.filter = blur ? `blur(${blur / HK}px)` : 'none';
        g.lineWidth = w;
        g.strokeStyle = rgba;
        g.beginPath();
        for (const [a0, a1] of cutSegs) {
          g.moveTo(a0[0], a0[1]);
          g.lineTo(lerp(a0[0], a1[0], u), lerp(a0[1], a1[1], u));
        }
        g.stroke();
      };
      stroke(26, `rgba(160, 112, 56, ${0.6 * a})`, 10);
      stroke(5, `rgba(255, 228, 176, ${0.85 * a})`, 1);
      g.filter = 'blur(' + 7 / HK + 'px)';
      g.fillStyle = `rgba(255, 236, 196, ${0.9 * a * clamp((1 - u) * 4, 0, 1)})`;
      for (const [a0, a1] of cutSegs) {
        g.beginPath();
        g.arc(lerp(a0[0], a1[0], u), lerp(a0[1], a1[1], u), 18, 0, Math.PI * 2);
        g.fill();
      }
      g.filter = 'none';
    }

    /* ------------------------------------------------ the measures */
    // The short side: the inscribed circle brushed on the strip near its left
    // end, touching both long sides, with its upright diameter (wider than the
    // pieces' edge lines, with a short tick at each end) and 4 written beside
    // the diameter on the 青 below. The long side: over the strip three
    // brackets, 6, 8 and 10 (the triangle's three sides), and over them one
    // bracket of 24. One set, in that order (the stages of m below).
    const ME = PLAN.measures;
    const RX = PLAN.RX;
    const RY = PLAN.RY;
    const RW = 24 * U;
    const RH = 4 * U;
    const MB = { x0: RX - 120, y0: RY - 400, x1: RX + RW + 120, y1: RY + RH + 60 };
    const MK = 2;
    const measL = JY.layer(pl, MB, { before: 'end', blend: 'multiply' });
    measL.cv.width = Math.round((MB.x1 - MB.x0) / MK);
    measL.cv.height = Math.round((MB.y1 - MB.y0) / MK);
    measL.g = measL.cv.getContext('2d', JY.CPU);
    measL.cv.style.zIndex = '95';
    const cx = RX + ME.circleX * U;
    const cy = RY + 2 * U;
    const ringM = { x: cx, y: cy, rx: 2 * U, ry: 2 * U, w: 9, seed: 263, start: -92, sweep: 372, spiral: 0.01 };
    const ringPts = JY.KINDS.ring.pts(ringM);
    const ringW = JY.KINDS.ring.w(ringM);
    const ringRough = (() => {
      const R = JY.rng(263 * 7919 + 13);
      const r = [];
      for (let i = 0; i < 64; i++) r.push((R() - 0.5) * 0.26);
      return r.map((v, i) => (r[(i + 62) % 64] + 2 * v + r[(i + 2) % 64]) / 4);
    })();
    const seg = (x0, y0, x1, y1, n) => {
      const out = [];
      for (let i = 0; i <= n; i++) out.push([lerp(x0, x1, i / n), lerp(y0, y1, i / n)]);
      return out;
    };
    const flatW = (w) => (t) => w * (t < 0.06 ? 0.5 + 0.5 * (t / 0.06) : t > 0.9 ? 0.4 + 0.6 * ((1 - t) / 0.1) : 1);
    // the diameter, from one long side to the other, with end ticks
    const diam = seg(cx, RY + 8, cx, RY + RH - 8, 24);
    const ticks = [seg(cx - 30, RY + 6, cx + 30, RY + 6, 6), seg(cx - 30, RY + RH - 6, cx + 30, RY + RH - 6, 6)];
    // brackets over the strip: the triangle's three sides, spanning the lower
    // row's pieces (2 + 4, 2 + 4 + 2, 2 + 4 + 4), and over them the whole long side
    const bracket = (a, b, y, foot) => {
      const x0 = RX + a * U + 14;
      const x1 = RX + b * U - 14;
      return { pts: [[x0, y + foot], [x0, y], [x1, y], [x1, y + foot]], mx: (x0 + x1) / 2, y, label: String(b - a) };
    };
    const brs = ME.brackets.map(([a, b]) => bracket(a, b, RY - 40, 24));
    const longBr = bracket(0, 24, RY - 236, 28);
    // the stages of the set: [start, length] as fractions of it
    const STG = { ring: [0, 0.42], diam: [0.24, 0.26], four: [0.38, 0.2], br: [[0.46, 0.22], [0.54, 0.22], [0.62, 0.22]], lab: 0.12, long: [0.68, 0.24] };
    const sub = (m, s) => E2o(clamp((m - s[0]) / s[1], 0, 1));
    let measKey = '';
    function drawMeasures(m) {
      const key = m.toFixed(4);
      if (key === measKey) return;
      measKey = key;
      const g = measL.g;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, measL.cv.width, measL.cv.height);
      if (m <= 0.0005) return;
      if (!document.fonts.check('500 124px "JY Latin"')) {
        measKey = '';
        return;
      }
      g.setTransform(1 / MK, 0, 0, 1 / MK, -MB.x0 / MK, -MB.y0 / MK);
      g.globalAlpha = 0.9;
      g.fillStyle = COL.zhu;
      const ur = sub(m, STG.ring);
      if (ur > 0.0005) g.fill(new Path2D(JY.outline(ringPts, ringW, ur, ringRough)));
      const kd = sub(m, STG.diam);
      if (kd > 0.001) {
        g.fill(new Path2D(JY.outline(diam, flatW(10), kd, null)));
        for (const tk of ticks) g.fill(new Path2D(JY.outline(tk, flatW(6), kd, null)));
      }
      const kb = brs.map((br, i) => sub(m, STG.br[i]));
      const kl = sub(m, STG.long);
      brs.forEach((br, i) => {
        if (kb[i] > 0.001) g.fill(new Path2D(JY.outline(br.pts, flatW(5.5), kb[i], null)));
      });
      if (kl > 0.001) g.fill(new Path2D(JY.outline(longBr.pts, flatW(5.5), kl, null)));
      g.fillStyle = '#b22f18';
      g.font = '500 124px "JY Latin"';
      g.textBaseline = 'alphabetic';
      g.textAlign = 'center';
      const lab = (k, s) => 0.92 * clamp((k - s) / (1 - s), 0, 1);
      brs.forEach((br, i) => {
        const a = lab(kb[i], 0.5);
        if (a > 0.001) {
          g.globalAlpha = a;
          g.fillText(br.label, br.mx, br.y - 28);
        }
      });
      const al = lab(kl, 0.5);
      if (al > 0.001) {
        g.globalAlpha = al;
        g.fillText(longBr.label, longBr.mx, longBr.y - 28);
      }
      const a4 = 0.92 * sub(m, STG.four);
      if (a4 > 0.001) {
        g.globalAlpha = a4;
        g.textAlign = 'left';
        g.fillText('4', cx + 0.42 * U, cy + 1.45 * U);
      }
      g.globalAlpha = 1;
    }

    /* ------------------------------------------------ sound */
    // One tap as the demonstration's halves land (that tap takes the film's
    // rotation of brush levels); a soft tick as each rectangle prints, and the
    // brush for the measures (the ring takes the rotation, the strokes after
    // it a level of their own), so every mark after beat 6 keeps the level it
    // had (tools/mix.py).
    const onFrame = (t) => Math.round(t * 60 + 1e-6) / 60;
    sfx('tap', onFrame(LAND), { pitch: 0 });
    // a tick on the first frame its rectangle shows (the first frame after
    // its time: at its time it has not begun)
    const firstFrame = (t) => (Math.floor(t * 60 + 1e-6) + 1) / 60;
    PLAN.items.slice(1).forEach((it, i) => sfx('tap', firstFrame(it.t), { pitch: 2, lvl: [0.34, 0.3, 0.38][i % 3] }));
    sfx('mark', tMeasure, { mark: 'ring', dur: MEAS });
    sfx('mark', tMeasure + STG.diam[0] * MEAS, { mark: 'line', dur: 0.06, lvl: 0.85 });
    sfx('mark', tMeasure + STG.br[0][0] * MEAS, { mark: 'line', dur: 0.1, lvl: 0.7 });

    /* ------------------------------------------------ drawing */
    function cssMatrix(M, el, b) {
      const tx = M[0] * b.x0 + M[2] * b.y0 + M[4] - b.x0;
      const ty = M[1] * b.x0 + M[3] * b.y0 + M[5] - b.y0;
      el.style.transform = `matrix(${M[0].toFixed(6)}, ${M[1].toFixed(6)}, ${M[2].toFixed(6)}, ${M[3].toFixed(6)}, ${tx.toFixed(3)}, ${ty.toFixed(3)})`;
    }
    const bez3 = (p0, p1, p2, p3, w) => {
      const a = (1 - w) ** 3;
      const b = 3 * (1 - w) ** 2 * w;
      const c = 3 * (1 - w) * w * w;
      const d = w ** 3;
      return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
    };
    // A piece's transform (page to page) at film time t, given how far the
    // pieces have parted (pk): the same pose as tools/beat6/sim.py.
    function pose(P0, t, pk) {
      const u = clamp((t - P0.t0) / P0.dur, 0, 1);
      const w = EP(u);
      const r = EP(clamp((u - P0.rs) / (P0.re - P0.rs), 0, 1));
      // the print's pieces stay on the page; the copies' part a little
      const k = P0.printed ? 0 : pk;
      const H0 = [P0.hinge[0] + P0.part[0] * k, P0.hinge[1] + P0.part[1] * k];
      const H1 = P0.H1;
      const dx = H1[0] - H0[0];
      const dy = H1[1] - H0[1];
      const L = Math.hypot(dx, dy) || 1;
      const nx = -dy / L;
      const ny = dx / L;
      // control points a1 and a2 of the way along the chord (a third and two
      // thirds unless the plan says otherwise), bent sideways by n1 and n2
      const a1 = P0.a1 == null ? 1 / 3 : P0.a1;
      const a2 = P0.a2 == null ? 2 / 3 : P0.a2;
      const c1 = [H0[0] + dx * a1 + nx * P0.n1, H0[1] + dy * a1 + ny * P0.n1];
      const c2 = [H0[0] + dx * a2 + nx * P0.n2, H0[1] + dy * a2 + ny * P0.n2];
      const H = bez3(H0, c1, c2, H1, w);
      const th = P0.th * r;
      const co = Math.cos(th);
      const si = Math.sin(th);
      const F = P0.Fm;
      const Fv = [1 + (F[0] - 1) * r, F[1] * r, F[2] * r, 1 + (F[3] - 1) * r];
      const Lm = [co * Fv[0] - si * Fv[1], si * Fv[0] + co * Fv[1], co * Fv[2] - si * Fv[3], si * Fv[2] + co * Fv[3]];
      const hx = P0.hinge[0];
      const hy = P0.hinge[1];
      return { M: [Lm[0], Lm[1], Lm[2], Lm[3], H[0] - (Lm[0] * hx + Lm[2] * hy), H[1] - (Lm[1] * hx + Lm[3] * hy)], u };
    }
    // the lift: up over the first fifth of a move, down over the last
    const liftOf = (u) => (u <= 0 || u >= 1 ? 0 : Math.min(1, EM(clamp(u / 0.2, 0, 1)), EM(clamp((1 - u) / 0.2, 0, 1))));
    // the light on a source as its rectangle prints (up over rise, held),
    // then how far it has gone (over go): a copy's piece stays lit as it
    // clears, the print's light goes with its colour
    const lightOf = (t, tp, printed) => {
      if (!(t > tp)) return [0, 0];
      const k = E2o(clamp((t - tp) / PR.rise, 0, 1));
      const g = EM(clamp((t - tp - PR.rise - PR.hold) / PR.go, 0, 1));
      return [printed ? k * (1 - g) : k, g];
    };
    window.JYBeat6 = { pieces, twins, pose, PLAN, p, TRIS, U, camEnd, tCut, LAND, tMeasure };

    s6.draw = (t, s) => {
      const dk = s.dofk.toFixed(3);
      f.dofTop.style.opacity = dk;
      f.dofBottom.style.opacity = dk;
      // a worker that seeks straight into this shot paints the plane first,
      // so the bare paper and the copies are there on its first frame
      if (!paperRGB) JY.flush();
      const cut = t >= tCut - 1e-6;
      fz.set(cut ? 0 : OPA.zhu * s.zhu);
      fq.set(cut ? 0 : OPA.qing * s.qing);
      fh.set(cut ? 0 : OPA.huang * s.huang);
      drawHair(s.hair, s.hairA);
      drawMeasures(s.meas);
      if (!paperRGB) return;
      for (const C of COPIES) {
        if (cut) {
          C.cv.cv.style.opacity = '0';
          C.shadow.cv.style.opacity = '0';
          continue;
        }
        paintCopy(C, s.zhu, s.qing, s.huang);
        C.cv.cv.style.opacity = '1';
        C.shadow.cv.style.opacity = '0.26';
      }
      const kc = clamp(s.cutk, 0, 1);
      const pk = 0;
      for (const P0 of pieces) {
        if (!cut) {
          P0.cv.cv.style.opacity = '0';
          P0.shadow.cv.style.opacity = '0';
          continue;
        }
        const [lit, gh] = P0.demo ? [0, 0] : lightOf(t, P0.tp, P0.printed);
        paintPiece(P0, s[P0.col], kc, lit, gh);
        const ps = pose(P0, t, pk);
        cssMatrix(ps.M, P0.cv.cv, P0.bb);
        const moving = ps.u > 0 && ps.u < 1;
        const h = liftOf(ps.u);
        // a copy's used piece clears (its shadow with it); the print's pieces are the page
        const paper = P0.printed ? 1 : 1 - gh;
        P0.cv.cv.style.opacity = !P0.printed && gh >= 0.9995 ? '0' : '1';
        // resting and landed pieces lie on the table with a contact shadow; a
        // moving piece is lifted; the print's pieces are the page itself
        const base = P0.printed ? 0 : 0.26 * paper;
        const Ms = ps.M.slice();
        Ms[4] += 5 + 22 * h;
        Ms[5] += 8 + 32 * h;
        cssMatrix(Ms, P0.shadow.cv, P0.sbb);
        P0.shadow.cv.style.opacity = (base + 0.16 * h).toFixed(3);
        const z = moving ? 30 : ps.u >= 1 ? 10 : P0.printed ? 6 : 4;
        P0.cv.cv.style.zIndex = String(z + 1);
        P0.shadow.cv.style.zIndex = String(z);
      }
      for (const tw of twins) {
        const w = t > tw.tp ? E2o(clamp((t - tw.tp) / PR.dur, 0, 1)) : 0;
        paintTwin(tw, w);
        tw.cv.cv.style.opacity = w > 0.0005 ? '1' : '0';
        tw.shadow.cv.style.opacity = (0.26 * w).toFixed(3);
      }
    };
    s6.leave = () => {
      f.dofTop.style.opacity = '';
      f.dofBottom.style.opacity = '';
    };
    return s6;
  }
  window.JYLiuHui = { build };
})();
