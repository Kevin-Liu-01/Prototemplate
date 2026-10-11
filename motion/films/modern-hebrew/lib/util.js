/*
 * modern-hebrew: shared helpers for the film engine. Pure functions only:
 * easings, keyed progress, the copy-stand camera, and the film's inks.
 */
(function () {
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const E = {
    lin: (x) => x,
    out2: (x) => 1 - (1 - x) * (1 - x),
    out3: (x) => 1 - Math.pow(1 - x, 3),
    in2: (x) => x * x,
    outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
    io2: (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
    io3: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  };
  // progress of t through [t0, t1] on an easing; 0 before, 1 after
  function k(t, t0, t1, e = 'io2') {
    if (t <= t0) return 0;
    if (t >= t1) return 1;
    return E[e]((t - t0) / (t1 - t0));
  }
  const L = (a, b, p) => a + (b - a) * p;

  // The copy stand: a page is flat and square to the frame. A camera puts
  // plate point (x, y) at screen point (ax, ay) at scale s. Scale moves on a
  // log scale and the centre follows the point that stays put, so a pull-back
  // reads as one straight move.
  const BODY_Y = 520; // centre of the body window between the rules (132 to 908)
  const C = (id, x, y, s, ax = 960, ay = BODY_Y) => ({ id, x, y, s, ax, ay });
  function camLerp(a, b, p) {
    if (p <= 0) return { ...a };
    if (p >= 1) return { ...b };
    const s = a.s * Math.pow(b.s / a.s, p);
    const q = Math.abs(b.s - a.s) < 1e-6 ? p : (s - a.s) / (b.s - a.s);
    return { id: b.id, s, x: L(a.x, b.x, q), y: L(a.y, b.y, q), ax: L(a.ax, b.ax, p), ay: L(a.ay, b.ay, p) };
  }
  const toScreen = (cam, x, y) => [cam.ax + (x - cam.x) * cam.s, cam.ay + (y - cam.y) * cam.s];
  function rectScreen(cam, r) {
    const [a, b] = toScreen(cam, r[0], r[1]);
    const [c, d] = toScreen(cam, r[2], r[3]);
    return [a, b, c, d];
  }
  const centre = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];

  // Every colour is sampled from the Princeton copy of vol. 1 (CONCEPT.md, The palette).
  const COL = {
    paper: '#dbcfba', // vol. 1, p. 110
    ink: '#332617', // vol. 1, title page
    ink2: '#615546', // ink mixed toward paper, 4.7:1 on paper
    ghost: '#c5b9a5', // the plates' own ghost ink
    board: '#131112', // the marbled board
    rose: '#823c4b', // the marbling's rose veins: the one accent
    boardInk2: '#9a9182', // paper mixed toward the board, for note numbers and credits on the board
  };

  // The window of the page: running head above 132, notes below 908.
  const WIN = [120, 132, 1800, 908];

  window.MHU = { clamp, E, k, L, C, camLerp, toScreen, rectScreen, centre, COL, WIN, BODY_Y };
})();
