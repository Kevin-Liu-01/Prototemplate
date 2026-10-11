/*
 * Scene 4 · the cut on "thirty" to the woodcut · thirty of a hundred
 * (SCRIPT-v2 line 5).
 *
 * The contents of the oldest surviving edition as eleven half pages, read
 * right to left. The 70 chapter columns Waley did not keep fall to tint in
 * reading order, 10 ms apart, while the counter runs from 100 to 30. The
 * fall claims the count of thirty and not a column-for-column match.
 */
(function () {
  const J = window.JW;
  const { C, E } = J;

  J.scenes.s4 = function (tl, root, film) {
    const D = window.JW_CONTENTS;
    const order = ['p06L', 'p07R', 'p07L', 'p08R', 'p08L', 'p09R', 'p09L', 'p10R', 'p10L', 'p11R', 'p11L'];
    const S = 0.168, GAP = 14, RIGHT = 1800, TOP = [64, 446];
    const maps = {};
    let row = 0, xr = RIGHT;
    order.forEach((key, i) => {
      if (i === 6) {
        row = 1;
        xr = RIGHT;
      }
      const w = window.JW_PLATES['c-' + key].w;
      const p = J.plate('c-' + key, xr - w, TOP[row], S);
      maps[key] = p.map;
      xr -= w + GAP;
    });
    // The chapters Waley kept (Hu Shih's list in the American edition; BRIEF item 2).
    const KEPT = new Set([...Array.from({ length: 15 }, (_, i) => i + 1), 18, 19, 22, 37, 38, 39, 44, 45, 46, 47, 48, 49, 98, 99, 100]);
    const veils = [];
    for (let ch = 1; ch <= 100; ch++) {
      if (KEPT.has(ch)) continue;
      const c = D.chapters[String(ch)];
      const [x0, y0] = maps[c.half](c.box[0], c.box[1]);
      const [x1, y1] = maps[c.half](c.box[2], c.box[3]);
      veils.push(J.html('div', { class: 'veil', style: { position: 'absolute', display: 'block', left: x0.toFixed(2) + 'px', top: y0.toFixed(2) + 'px', width: (x1 - x0).toFixed(2) + 'px', height: (y1 - y0).toFixed(2) + 'px', background: C.paper, opacity: 0 } }, root));
    }
    if (veils.length !== 70) throw new Error('expected 70 columns, got ' + veils.length);
    // Each column falls to tint (a white veil at 79 percent, so at 1280 x 720
    // the thirty kept columns still stand apart from the seventy), 10 ms
    // apart (SCRIPT-v2 line 5: the fall runs 1.0 s).
    const FALL = 0.79, T = E['s4.fall'], STEP = 0.010;
    veils.forEach((v, i) => tl.fromTo(v, { opacity: 0 }, { opacity: FALL, duration: 0.3, ease: 'power2.out', immediateRender: false }, T + i * STEP));

    // The counter: 100 of 100, down to 30 of 100 on the fall's clock. A
    // column counts once its fall is half done.
    const fig = J.latin(root, '100', { x: 1800 - J.width('of 100', 30) - 12, base: 952, size: 64, align: 'right' });
    fig.e.style.textAlign = 'right';
    J.latin(root, 'of 100', { x: 1800, base: 952, size: 30, align: 'right' });
    film.on((t) => {
      let n = 100;
      if (t >= T) n = Math.max(30, 100 - Math.max(0, Math.min(70, Math.floor((t - T - 0.15) / STEP) + 1)));
      if (fig.e.textContent !== String(n)) fig.e.textContent = String(n);
    });

    // The caption names the book whose thirty the columns show.
    const cap = J.latin(root, '', { x: 160, base: 878, size: 30 });
    cap.e.innerHTML = 'Arthur Waley, <i>Monkey</i>, 1942';
    cap.e.style.width = 'auto';
    J.rise(tl, [cap.e], T, 0.5);
    J.credit(root, [J.scan('The contents, read right to left')], { w: 1180 });
  };
})();
