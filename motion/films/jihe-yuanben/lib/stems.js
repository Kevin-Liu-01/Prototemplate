/*
 * Beat 8 of v2 (beat 9 of the 100 s cut): A B C becomes 甲 乙 丙.
 *
 * Shot A, Clavius 1574 fol. 21v: on "sounds" the Prop. I.1 figure's ink lifts
 * off its page as one indigo sheet (the page under it is the same paper with
 * the ink taken off, lib/derived/clav74-fig-bare.png). Shot B, the 1607 Prop.
 * I.1 (LOC vol. 1 sp=23), cut on "so": the sheet travels in and settles by
 * the similarity that takes the printed A onto 甲 and B onto 乙, so C falls on
 * 丙 and D on 丁 and the circles coincide. On each of the reader's four
 * syllables that Latin letter sinks into the paper while the brush rings the
 * Stem beneath it; then the rest of the indigo sinks, leaving the woodblock
 * figure with four vermilion rings.
 *
 * The sheet is five canvases (the figure, A, B, C, D) cut losslessly from the
 * scan by tools/derive.py; each is painted once and moved by its transform.
 */
(function () {
  function build(ctx) {
    const { tl, pl, D, P, move, brush, shot, mark, sfx, W, Z, L, B, tSo } = ctx;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, u) => a + (b - a) * u;
    const FIG = D.clav74fig;
    const box = { x0: FIG.box[0], y0: FIG.box[1], x1: FIG.box[2], y1: FIG.box[3] };
    const Lp = D.prop1.latin74;
    const H = D.prop1.han;
    const NAMES = ['ink', 'A', 'B', 'C', 'D'];

    // A sheet of five ink canvases (and its shadow) on a plane.
    function sheet(plane) {
      const out = {};
      out.shadow = JY.layer(plane, { x0: box.x0 - 40, y0: box.y0 - 40, x1: box.x1 + 40, y1: box.y1 + 40 }, { before: 'end', blend: 'multiply', opacity: 0 });
      NAMES.forEach((n) => {
        out[n] = JY.layer(plane, box, { before: 'end', blend: 'multiply', src: 'lib/derived/clav74-fig-' + n + '.png', opacity: 0 });
      });
      // The shadow is the figure's ink, darkened and soft, drawn when the ink is decoded.
      out.paintShadow = () => {
        if (out.shadowPainted || !out.ink.painted) return;
        const g = out.shadow.g;
        g.save();
        g.filter = 'blur(5px)';
        NAMES.forEach((n) => g.drawImage(out[n].cv, 40, 40));
        g.globalCompositeOperation = 'source-in';
        g.filter = 'none';
        g.fillStyle = 'rgb(30, 20, 12)';
        g.fillRect(0, 0, out.shadow.w, out.shadow.h);
        g.restore();
        out.shadowPainted = true;
      };
      return out;
    }
    // Place a canvas whose content is in Clavius page pixels (its box) by the
    // map p -> c + R(th) k (p - o), into the plane it lives on.
    function place(el, b, o, c, th, k, dx, dy) {
      const co = Math.cos(th) * k;
      const si = Math.sin(th) * k;
      const M = [co, si, -si, co, c[0] - (co * o[0] - si * o[1]) + (dx || 0), c[1] - (si * o[0] + co * o[1]) + (dy || 0)];
      const tx = M[0] * b.x0 + M[2] * b.y0 + M[4] - b.x0;
      const ty = M[1] * b.x0 + M[3] * b.y0 + M[5] - b.y0;
      el.style.transform = `matrix(${M[0].toFixed(6)}, ${M[1].toFixed(6)}, ${M[2].toFixed(6)}, ${M[3].toFixed(6)}, ${tx.toFixed(3)}, ${ty.toFixed(3)})`;
    }

    /* ---- shot A: the Latin page */
    const shA = sheet(pl.clav74f21v);
    const bare = JY.layer(pl.clav74f21v, box, { src: 'lib/derived/clav74-fig-bare.png', opacity: 0 });
    const tSounds = W('en12', 'sounds');
    const fc = [(box.x0 + box.x1) / 2, (box.y0 + box.y1) / 2];
    const s9a = shot({
      key: 's8a', t0: B[8].start, t1: tSo, planes: [pl.clav74f21v], dof: 3.5, cite: P.clav74f21v.cite,
      cam: { cx: 1112, cy: 2080, s: 1.68, rx: 16, rz: 0.6 },
      st: { lamp: 0.6, lx: 960, ly: 420, lrx: 920, lry: 560, core: 28, lift: 0 },
    });
    move(s9a.cam, { s: 1.78, cy: 2060 }, tSo - B[8].start, 'none', B[8].start);
    move(s9a.st, { lift: 1 }, 0.8, 'power2.out', tSounds);
    sfx('peel', tSounds);
    s9a.draw = (t, st) => {
      const u = st.lift;
      shA.paintShadow();
      bare.cv.style.opacity = clamp(u * 1.7, 0, 1).toFixed(3);
      const k = 1 + 0.07 * u;
      const th = (-1.4 * u * Math.PI) / 180;
      const c = [fc[0] - 16 * u, fc[1] - 28 * u];
      NAMES.forEach((n) => {
        shA[n].cv.style.opacity = clamp(u * 1.7, 0, 1).toFixed(3);
        place(shA[n].cv, box, fc, c, th, k);
      });
      shA.shadow.cv.style.opacity = (0.38 * u).toFixed(3);
      place(shA.shadow.cv, { x0: box.x0 - 40, y0: box.y0 - 40 }, fc, c, th, k, 12 * u, 20 * u);
    };

    /* ---- shot B: the Chinese page */
    const shB = sheet(pl.p023);
    const kS = Math.hypot(H.B[0] - H.A[0], H.B[1] - H.A[1]) / Math.hypot(Lp.B[0] - Lp.A[0], Lp.B[1] - Lp.A[1]);
    const rot = Math.atan2(H.B[1] - H.A[1], H.B[0] - H.A[0]) - Math.atan2(Lp.B[1] - Lp.A[1], Lp.B[0] - Lp.A[0]);
    const s9b = shot({
      key: 's8b', t0: tSo, t1: B[8].end, planes: [pl.p023], dof: 3.5, cite: P.p023.cite,
      cam: { cx: 716, cy: 694, s: 1.6, rx: 12, rz: -0.6 },
      st: { lamp: 0.6, lx: 960, ly: 420, lrx: 920, lry: 560, core: 28, land: 0, a: 1, b: 1, c: 1, d: 1, ink: 1 },
    });
    move(s9b.cam, { s: 1.7, cy: 700 }, B[8].end - tSo, 'none', tSo);
    move(s9b.st, { land: 1 }, 1.2, 'power3.out', tSo);
    sfx('settle', tSo + 0.55, { gain: 0.45 });
    const labels = ['A', 'B', 'C', 'D'];
    const keys = ['a', 'b', 'c', 'd'];
    labels.forEach((n, i) => {
      const at = Z('zh6', i);
      const to = {};
      to[keys[i]] = 0;
      move(s9b.st, to, 0.25, 'power2.in', at);
      const q = H.labels[n];
      const h = mark(pl.p023, 'stem' + n, { kind: 'dot', x: q[0], y: q[1], rx: 24, ry: 24, w: 2.8, seed: 120 + i });
      brush(h, at, 0.3, 'power2.out');
    });
    // v2: the rest of the indigo sinks in 0.5 s (100 s cut: 0.8 s), from just
    // after 丁's ring (tools/timeline.py, B[8].sink), and the shot holds the
    // four vermilion rings for 0.2 s before the cut
    const tSink = B[8].sink;
    move(s9b.st, { ink: 0 }, 0.5, 'power1.inOut', tSink);
    s9b.draw = (t, st) => {
      const v = st.land;
      shB.paintShadow();
      const k = kS * (1 + 0.16 * (1 - v));
      const th = rot + ((-7 * (1 - v)) * Math.PI) / 180;
      const c = [H.A[0] - 560 * (1 - v), H.A[1] - 230 * (1 - v)];
      const al = { ink: st.ink, A: st.a, B: st.b, C: st.c, D: st.d };
      NAMES.forEach((n) => {
        shB[n].cv.style.opacity = clamp(al[n], 0, 1).toFixed(3);
        place(shB[n].cv, box, Lp.A, c, th, k);
      });
      const hgt = 1 - v;
      shB.shadow.cv.style.opacity = (0.4 * hgt * st.ink).toFixed(3);
      place(shB.shadow.cv, { x0: box.x0 - 40, y0: box.y0 - 40 }, Lp.A, c, th, k, 26 * hgt, 40 * hgt);
    };
  }
  window.JYStems = { build };
})();
