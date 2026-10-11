/*
 * slash-announcement v8: the film. Slash and General Translation, on Kevin's
 * script: five narrated lines by Frederick Surrey, then a silent end card.
 * v8 (Kevin's notes of 2026-10-09 on v7: "its a bit hard to see the lines,
 * and also make the transition less \"weird\" ... dont make the credit card
 * merge into world, but make it slide right behind the globe"): from "for"
 * the globe grows at its seat in front of the card and the card slides right
 * behind it (the move, sceneOpen); the routes and their crosses are drawn
 * stronger, over an olive keyline (drawRoutes); plate 1's light clears with
 * its outline instead of in one frame, and the stems lead "localize" so the
 * first plate draws within 0.5 s of the credits bar landing. v7's morph is
 * gone; the v7 build is in archive-v7-build/, the interrupted v7 fix round
 * in archive-v7-fix-partial/.
 * v7's opener (Kevin's notes of 2026-10-09, "make the card transition and
 * become the globe" and "the slash logo should be white instead of the dark
 * gray"): Slash's wordmark is the file's own white, and from "for" the card
 * itself became the globe in one move (drawMorph, removed in v8).
 * v7 also brings the offer's stems and plates in on "localize", right after
 * the credits bar lands (Kevin: "not wait there as long for the boxes under
 * it to appear"), and line 8 is a new take, "Your product should exist in
 * every language." (French on "every"). v6 is in archive-v6/.
 * v6 is v5 on Kevin's note of 2026-10-09 ("i meant the slash logo should be
 * there in the beginning"): Slash's wordmark, drawn from its file in the
 * film's olive ink, rises over the card on "Slash" and fades as the card sets
 * off on "for"; the card stands a little lower and smaller under it. From the
 * card's arrival at the origin on, the film is v5's. v5 is in archive-v5/.
 * v5 is v4 on Kevin's notes of 2026-10-08 ("make the intro transition much
 * better into the 2nd shot", "keep the slash in beginning and get rid of the
 * 'hello' section"): the hard cut from the card to the globe is now one move
 * in which the card becomes the routes' origin, and the greetings under the
 * lockup are gone (the lockup pushes in slowly until "So"). v4 is in
 * archive-v4/.
 * v4 is v3 (the faster cut and its carry-over) on Kevin's notes of
 * 2026-10-08: it opens on Slash's card (his photo, cut out and turned in 3D
 * on the photo's own ground) instead of the dithered wordmark; the globe's 24
 * routes are drawn as the approved 19.5 s cut draws its routes (1 px white,
 * small 1 px crosses); the lockup's seat through the offer is Kevin's lockup
 * at 0.50 (the card's at 0.80 again); and the Slides plate reads "Sales deck".
 * The v4 fix round slows the card's highlight to run under the words, makes
 * the card solid from its first frames, starts the globe's rise before the
 * cut, and lengthens the lockup's glide on "So".
 * STORYBOARD.md is the design; NOTES.md is the build as it was made. The v4
 * build is in archive-v4-build/; v3's
 * carry-over is in archive-v3-carry/, its fix round in archive-v3-fix/, v2
 * (39.98 s) in archive-v2/, v1 (74.3 s, eight lines) in archive-v1/.
 *
 * Every frame is a pure function of film time: the one paused timeline's
 * onUpdate calls render(tl.time()), and render() draws every canvas and
 * sets every DOM style from that time alone. Nothing reads a clock, every
 * seeded order comes from GTDither.rng, and every image a canvas draws sits
 * in the DOM as a hidden <img>. The spoken words' film times are window.CUE
 * (lib/cues.js, from the takes' .json timings by lib/cues.mjs).
 *
 * The screen is 3 px everywhere: the kit's 8x8 Bayer tile on a 3 px cell
 * grid anchored at the frame's top left (Kevin: "we use 3 px dither").
 *
 * Copied, not imported: the payment globe, its routes and count and its glyph
 * bridge are the approved 19.5 s cut's (../slash-partnership/lib/film.js),
 * drawn as it draws them, on the 3 px grid (v4: its routes' stroke and
 * crosses too, on v3's 24 routes and clock); the light, the mark printing, the
 * plates, the app page and the end card are v1's (archive-v1/lib/film.js),
 * which took them from ../slash-partnership/archive-47s/ and
 * ../gif-how-gt-works/. Those folders are never edited.
 *
 * Layers (bottom to top): the light (cvField), pictures printed on the 3 px
 * grid (cvPic: the globe and its glyph ground, the plate drawings), the glyph
 * globe's glyphs (cvDots), lines (cvVec), marks printed through the screen
 * (cvMarks), the opener (its ground and the card, a 3D-turned canvas), the
 * figures and the DOM text (rows, labels, the app page), the end card (DOM +
 * cvCard).
 */
window.GTFilmBoot = function () {
  'use strict';

  const W = 1920;
  const H = 1080;
  const CELL = 3;
  const HALF = CELL / 2;
  const COLS = W / CELL;
  const ROWS = H / CELL;
  const N = COLS * ROWS;
  const CUE = window.CUE;
  const CUTS = window.CUTS;
  const CARD = window.CARD;
  const END = window.END;
  const EV = window.EV;
  const DI = window.GTDither;
  const $ = (id) => document.getElementById(id);

  /* ---------------- palette: five colours, sampled from Kevin's image ---------------- */
  const RGB = { olive: [59, 56, 43], gold: [193, 165, 109], straw: [199, 183, 141], sgold: [198, 183, 93], white: [255, 255, 255] };
  const css = (c, a) => (a == null ? `rgb(${c[0]},${c[1]},${c[2]})` : `rgba(${c[0]},${c[1]},${c[2]},${a})`);

  /* ---------------- maths ---------------- */
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const ss = (e0, e1, x) => {
    const u = clamp01((x - e0) / (e1 - e0));
    return u * u * (3 - 2 * u);
  };
  const lerp = (a, b, u) => a + (b - a) * u;
  const EASE = {};
  ['expo.out', 'power3.out', 'power4.out', 'power2.inOut', 'power3.inOut', 'power2.out', 'none'].forEach((n) => (EASE[n] = gsap.parseEase(n)));
  const prog = (t, t0, dur, ease) => EASE[ease || 'none'](clamp01((t - t0) / dur));
  const on = (t, a, b) => t >= a && t < b;

  /* The 8x8 Bayer threshold of every 3 px cell, anchored at cell (0, 0), the frame's top left. */
  const TH = new Float32Array(N);
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) TH[y * COLS + x] = (DI.B8[(y & 7) * 8 + (x & 7)] + 0.5) / 64;
  // the threshold of the cell under a point (the approved cut's crosses leave by it)
  const thAt = (px, py) => TH[Math.min(ROWS - 1, Math.max(0, Math.floor(py / CELL))) * COLS + Math.min(COLS - 1, Math.max(0, Math.floor(px / CELL)))];

  /* ---------------- type metrics (Inter 4, unitsPerEm 2048) ---------------- */
  const ASC = 1984 / 2048;
  const DESC = 494 / 2048;
  const CAP = 1490 / 2048;
  const BOXH = ASC + DESC + 0.0625; // a line box whose baseline sits 1.0 em below its top
  const ROUND_LEFT = new Set('acdeoqsCGOQS'.split(''));
  const FACE = 'GTCanvas';

  const mctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  function measure(text, size, weight, tracking) {
    mctx.font = `${weight} ${size}px ${FACE}`;
    mctx.letterSpacing = (tracking || 0) * size + 'px';
    const m = mctx.measureText(text);
    return { left: -m.actualBoundingBoxLeft, right: m.actualBoundingBoxRight, asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent, width: m.width };
  }

  /* ================= THE CLOCK: the cuts and the spoken words ================= */
  const L1 = CUE.L1, L3 = CUE.L3, L6 = CUE.L6, L7 = CUE.L7, L8 = CUE.L8;
  const T = {
    c1: CUTS.c1, // line 1's "businesses" (a bar line): v4's hard cut to the globe; v5's ground and globe change here under the card's move
    mix3: CUTS.mix3, // line 3's "partner": the glyph globe to the lockup (tone mix, on its word)
    c6: CUTS.c6, // line 6's "up": the offer's figure rises and counts (on a bar line; since the carry-over no cut, the offer's ground arrives on "So")
    c8: CUTS.c8, // line 8's "product": the app page (hard cut, on a bar line)
    card: CARD, // the bed's held chord (tone mix, on a bar line)
    end: END,
  };
  const CARD_D = END - CARD; // 3.532: its contents land by 0.53, then the title's 3.0 s
  // line 1's first sentence: Slash's card (Kevin's photo, Slash's image, cut
  // out by lib/card-prep.py at 16/9, the scale at which the photo's width
  // fills the frame) floats in to its place in the photo over OP_IN
  // (power3.out), solid within OP_FADE (5 frames); a soft highlight sweeps
  // across its brushed gold along its long side at a constant rate over
  // SHEEN, on the card from "building" to "center"; under both it keeps
  // turning slowly (OP_DRIFT over the whole opener), so it never stands
  // still. v5: on "for" it sets off into the globe (the move, below). v6:
  // Slash's wordmark stands over it (LOGO, below).
  const CP = window.CARDPHOTO;
  const OP_IN = 1.1;
  const OP_FADE = 0.08;
  const OP_FROM = { ty: 90, rx: 16, ry: -14, rz: -2, s: 0.9 };
  const OP_DRIFT = { ty: -14, ry: 3.5 };
  const OP_PERSP = 1600;
  const SHEEN_T0 = 0.9;
  const SHEEN_D = 1.85;
  // v6 (Kevin, 2026-10-09: "i meant the slash logo should be there in the
  // beginning"): Slash's wordmark stands centred over the card on the photo's
  // ground, drawn from its file (assets/logos/slash-logo.svg) as a vector at
  // its size, never printed through the screen. v6 filled it with the film's
  // olive; v7 draws it in the file's own white (Kevin, 2026-10-09: "at the
  // front the slash logo should be white instead of the dark gray"), with no
  // outline and no shadow: on lossless frames its edge holds on the gold
  // behind it (relative luminance 0.25 to 0.34, about 3:1). Its ink is 409 px
  // wide, the size of the Slash wordmark in Kevin's lockup on "partner". It
  // rises out of its mask on "Slash" (LOGO_IN, expo.out, the film's mask rise),
  // holds through "is building the financial command center", and on "for",
  // as the card sets off, it fades out while dropping a little (LOGO_OUT,
  // LOGO_DROP, power2.out), as the card begins to become the globe. The card
  // stands lower and smaller in the opener (OP_K about its centre, drawn small
  // in its own canvas; OP_DY) so the two sit as one composition, centred in
  // the frame; the move starts from there.
  const LOGO = { x0: 756, y0: 229, x1: 1165 }; // the wordmark's ink box; its height (137 px) follows from its proportions
  const LOGO_INK = null; // v7: the file's own white (Kevin: "the slash logo should be white instead of the dark gray")
  const LOGO_T0 = L1.slash;
  const LOGO_IN = 0.5;
  const LOGO_OUT = 0.18;
  const LOGO_DROP = 16;
  const OP_K = 0.84;
  const OP_DY = 101;
  // line 1 from "for": the approved 19.5 s cut's payment globe. v8: it
  // grows at its seat in front of the card (the move, below); the origin
  // cross prints on it by "They" (Slash); 24 routes draw out of it one after
  // another from "sending", the 24th landing on "eighty", on the approved
  // cut's great-circle arcs, each with a cross where it lands (v8 draws them
  // stronger, ROUTE_W below); the figure rises as the first route lands and
  // counts 1 to 180; on "countries" its "+" is set and the approved cut's
  // screen-gold pulse runs out along every route (0.35 s, a 0.25 tail)
  const ORIGIN_T = L1.they;
  // v8 (Kevin, 2026-10-09, on v7: "make the transition less \"weird\" ...
  // dont make the credit card merge into world, but make it slide right
  // behind the globe"): from "for" the globe grows at its seat, in front of
  // the card, from its centre (GROW_D, power3.out: seven eighths of its
  // radius in 0.2 s), drawn in the opener over the card (cvFront: an opaque olive
  // disc under the globe's 3 px cells, so nothing of the card shows between
  // them). The card slides right into the globe's footprint and passes
  // behind its edge (SLIDE_D, power2.inOut, toward SLIDE_TO), shrinking a
  // little as it goes (SLIDE_K), as if moving back; it is wholly behind the
  // globe 0.44 s after "for" (CARD_GONE). The card stays a photo, drawn at
  // its size in its own canvas. The wordmark leaves as in v6 and v7, and the
  // ground leaves by tone from "businesses" (GROUND_D). Once the card is
  // hidden, the globe at its seat and the ground gone, the opener stands
  // down and the globe is sceneGlobe's (OPEN_T1); the origin cross prints by
  // tone over CROSS_IN before "They", as in v5 to v7. Prototyped against two
  // other entries (the globe sweeping in from the left over the card, and in
  // from the right edge): proto-v8/, NOTES.md (v8).
  const MOVE_T0 = L1.for;
  const GROW_D = 0.4;
  const SLIDE_D = 0.8;
  const SLIDE_K = 0.8;
  const SLIDE_TO = [1300, 600]; // behind the globe's centre (GL)
  const GROUND_D = 0.5;
  let CARD_GONE = 0; // the card's first frame wholly behind the globe (build)
  let OPEN_T1 = 0; // the opener's last frame is before this (build)
  const CROSS_IN = 0.09; // the origin cross prints by tone over this long before "They" (v5's)
  const ROUTE_N = 24;
  const ROUTE_D = 0.24; // each route draws in 0.24 s, at a constant rate (the approved cut's draw)
  const ROUTE_T0 = L1.sending;
  const ROUTE_STEP = (L1.eighty - ROUTE_D - ROUTE_T0) / (ROUTE_N - 1);
  // v8 (Kevin, 2026-10-09: "its a bit hard to see the lines"): the routes
  // keep their number, paths, clock and white, and are drawn stronger: the
  // line ROUTE_W px wide at full opacity (v4 to v7: 1 px), the crosses' arms
  // CROSS_W px (v4 to v7: 1 px) at CROSS_ORIGIN and CROSS_END px (17 and 7),
  // the pulse PULSE_W px (2), all over a keyline of the film's olive ROUTE_KEY
  // px each side at ROUTE_KEY_A, which keeps them apart from the bright
  // land's white cells. No glow.
  const ROUTE_W = 2.5;
  const CROSS_W = 2;
  const CROSS_ORIGIN = 25;
  const CROSS_END = 13;
  const PULSE_W = 3;
  const ROUTE_KEY = 1;
  const ROUTE_KEY_A = 0.6;
  const ROUTE_SEED = 314; // the endpoints' seed (buildRoutes' rules place all 24 with it; the shortest route is 109 px)
  const FIG1_T = ROUTE_T0 + ROUTE_D;
  const PULSE0 = EV.pulse0; // "countries"
  const PULSE_D = EV.pulseD;
  // the glyph bridge (lib/cues.mjs places it with 0.40 s holds): the routes
  // retract and the blocks switch to glyphs, then every glyph steps once to
  // its next writing system
  const SW0 = EV.sw0;
  const SW_D = EV.swD;
  const STEP0 = EV.step0;
  const STEP_D = EV.stepD;
  const RETRACT_D = 0.28;
  const CROSS_OUT = [0.14, 0.42]; // the crosses leave by tone over this stretch after SW0
  // line 3: on "partner" the glyph globe and its figure leave by tone while the
  // light mixes from the globe setting to Kevin's composition and the lockup
  // prints in reading order (the approved film's opener): Slash, the x, GT
  const MIX3 = T.mix3;
  const MIX3_OUT = 0.21;
  const MIX3_LIGHT = 0.35;
  const LOCK_P = 0.35; // each mark of the lockup prints over this long
  const LOCK_X = 0.14; // the x rises from here
  const LOCK_GT = 0.175; // the GT mark prints from here
  const LOCK_DONE = MIX3 + LOCK_GT + LOCK_P; // 0.525 after "partner"
  // v5: the greetings are gone (Kevin: "get rid of the 'hello' section").
  // From its arrival to line 6's "So" the lockup pushes in slowly about its
  // centre (PUSH) on Kevin's drifting light, redrawn from its files at every
  // size so it stays sharp. v5 fix: 9 percent at a constant rate (it was 5
  // percent, sine.inOut, which moved each edge about 0.1 px a frame and stood
  // nearly still for its first and last half second).
  const PUSH = 0.09;
  const PUSH_C = [956.5, 539.5]; // the lockup's ink centre (Slash x 498 to GT x 1415, y 466 to 613)
  // line 6's "So" ends the shot: the offer's ground comes in under the lockup by tone
  // (SO_LIGHT), and the lockup glides and scales into its corner seat (SEAT,
  // Kevin's lockup at 0.50) in one move across "So if you bank with Slash"
  // (SEAT_D, power2.inOut; v4 fix: 0.5 s left it standing alone for 1.87 s).
  // The offer plays with the lockup seated; on the cut to the app page it
  // leaves by tone (SEAT_OUT), and the card prints it at 0.80 in the card's
  // own seat.
  const SO_T = L6.so;
  const SO_LIGHT = 0.5;
  const SEAT_D = 1.4;
  const SEAT_OUT = 0.21;
  // lines 6 and 7: on "up" the figure rises in the offer's ground and counts
  // (no cut since "So")
  const FIG6_T = L6.up;
  const COUNT_END = L6.thousand;
  const BAR_T = L6.credits;
  const BAR_D = 0.35;
  // v7 (Kevin, 2026-10-09: "make the bar that appears under up to $2000
  // translation credits not wait there as long for the boxes under it to
  // appear"): the stems drop and the plates draw around "localize" (STEM_T),
  // right after the bar lands, with v6's stagger and draw-on; v6 waited for
  // "surface", 1.53 s after it. v7 dropped the stems on "localize" (0.45 s
  // after the bar landed at BAR_T + BAR_D, its first outline 0.63 s after);
  // v8 leads "localize" by STEM_LEAD, so the stems drop 0.30 s after the bar
  // lands (on "to") and the first plate's outline starts 0.48 s after it,
  // 0.03 s after "localize"; the 42 ms stagger and the draw-on are v7's.
  // Each plate's English row still steps in on "surface" (SURF_T, as in v6),
  // so the plates do not stand unchanged for 2.3 s before "app".
  const STEM_LEAD = 0.15;
  const STEM_T = L6.localize - STEM_LEAD;
  const SURF_T = L6.surface;
  const STEM_APART = 0.042;
  const PLATE_T = [L7.app, L7.website, L7.documentation, L7.slides, L7.design];
  // on "more" a screen-gold pulse runs down each stem (v1's, 0.35 s, the stems
  // 42 ms apart from the left) and, as it reaches its plate, the plate's
  // outline draws again in white out of its top-left corner (power3.out 0.21)
  const MORE_T = L7.more;
  const MORE_D = 0.35;
  const MORE_LINE = 0.21;
  // line 8: Spanish on "exist", French on "every", Japanese on "language"
  // (v7: Kevin changed the line to "Your product should exist in every
  // language."; the French step was on "more" to v6; lib/cues.mjs sets EV.langs)
  const CHANGES = [
    [EV.langs[0], 'en', 'es'],
    [EV.langs[1], 'es', 'fr'],
    [EV.langs[2], 'fr', 'ja'],
  ];
  // the end card: a tone mix from the app page on the held chord. The page
  // leaves by tone over CARD_OUT while the card's light arrives over CARD_MIX;
  // the lockup (in the mark corner, clear of the page) prints from CARD_LOCK;
  // the title and the link rise once the page is gone (CARD_OUT), so no two
  // texts share a place. Everything lands by CARD_LAND, which leaves the
  // title's 3.0 s reading hold (6 words: 6 / 3 + 1) before the last frame.
  // v3 has no legal line (Kevin: "get rid of the 'subject to approval' on last
  // line"), and v2's 0.74 s floor on CARD_LAND is gone: at 3.532 s it would
  // have cut the title's hold to 2.79 s.
  const CARD_MIX = 0.35;
  const CARD_OUT = 0.21;
  const CARD_LOCK = 0.07;
  const CARD_PRINT = 0.35; // each mark of the card's lockup, 0.04 s apart
  const CARD_LAND = Math.min(1.5, CARD_D - 3.0); // 0.532

  /* ================= THE LIGHT ================= */
  // Kevin's composition, fitted to his image's luma in 12 px blocks
  // (lib/light-fit.json; 48 px block mean absolute error 1.10 levels).
  const FIT = { cT0: 0.6272, cT1: 3.0794, ce0: 56.5634, ce1: 108.4428, cs0: 55.1433, cs1: -166.5682, gT0: 0.5546, gT1: 0.0827, gT2: -0.0424, glo0: 719.8332, glo1: -33.1002, glo2: -5.7233, ghi0: 801.38, ghi1: 97.9542, ghi2: 5.6684, gls0: 41.4862, gls1: -5.6751, ghs0: 39.1472, ghs1: -9.758, se0: 952.7364, se1: 67.8096, se2: 15.9441, ss0: 33.297, ss1: 6.2589, dD0: 0.4199, dD1: -0.0192, dlo0: 1231.4893, dlo1: 113.3148, dhi0: 1390.2008, dhi1: 72.9914, dls0: 52.5807, dls1: -8.3329, dhs0: 64.8918, dhs1: -30.8195, hD0: -0.2655, hD1: 1.0181, hD2: 0.1079, hlo0: 1461.7665, hlo1: 58.1262, hlo2: 28.7665, hhi0: 1492.8292, hhi1: 236.3819, hhi2: 46.2765, hls0: 30.4705, hls1: 59.9623, hhs0: 134.7877, hhs1: -17.7619 };
  const ANG = (33 * Math.PI) / 180;
  const SN = Math.sin(ANG);
  const CS = Math.cos(ANG);
  const S0 = new Float32Array(N); // the coordinate normal to the shafts (px)
  const A0 = new Float32Array(N); // the coordinate along the shafts (px)
  const XC = new Float32Array(N);
  const YC = new Float32Array(N);
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
      const i = y * COLS + x;
      const X = x * CELL + HALF;
      const Y = y * CELL + HALF;
      XC[i] = X;
      YC[i] = Y;
      S0[i] = X * SN + Y * CS;
      A0[i] = X * CS - Y * SN;
    }
  function lin(k, a) {
    return FIT[k + '0'] + FIT[k + '1'] * a + (FIT[k + '2'] || 0) * a * a;
  }
  const up = (s, e, soft) => ss(e - soft, e + soft, s);
  function fullTone(S, A) {
    const a = A / 1000;
    const sf = (k) => Math.max(5, lin(k, a));
    const tc = clamp01(lin('cT', a)) * (1 - up(S, lin('ce', a), sf('cs')));
    const tg = clamp01(lin('gT', a)) * up(S, lin('glo', a), sf('gls')) * (1 - up(S, lin('ghi', a), sf('ghs')));
    let tst = up(S, lin('se', a), sf('ss'));
    tst *= 1 - clamp01(lin('dD', a)) * up(S, lin('dlo', a), sf('dls')) * (1 - up(S, lin('dhi', a), sf('dhs')));
    tst *= 1 - clamp01(lin('hD', a)) * up(S, lin('hlo', a), sf('hls')) * (1 - up(S, lin('hhi', a), sf('hhs')));
    return Math.max(tc, tg, tst);
  }
  const band = (s, c, hw, soft) => ss(c - hw - soft, c - hw + soft, s) * (1 - ss(c + hw - soft, c + hw + soft, s));
  // Diagram: olive with two narrow gold shafts, one across the upper right
  // corner and one across the lower left corner.
  function diagramTone(S, A) {
    const ur = 0.84 * band(S, 1065, 50, 70) * ss(1100, 1420, A);
    const ll = 0.84 * band(S, 995, 50, 70) * (1 - ss(-380, 120, A));
    return Math.max(ur, ll);
  }
  // Globe: olive with one broad gold shaft behind the globe (the approved cut's).
  function globeTone(S) {
    return 0.8 * band(S, 1211, 205, 150);
  }
  // The card: Kevin's light above the diagonal from (560, 0) to (1920, 760).
  const DN = [-760 / Math.hypot(1360, 760), 1360 / Math.hypot(1360, 760)];
  function cardMask(X, Y) {
    const d = (X - 560) * DN[0] + Y * DN[1];
    return 1 - ss(-90, 30, d);
  }
  // Screen coverage against tone, measured from Kevin's image.
  const COV = [[0, 0], [0.06, 0.05], [0.1, 0.11], [0.3, 0.15], [0.4, 0.2], [0.5, 0.31], [0.6, 0.42], [0.75, 0.47], [0.9, 0.52], [1.0, 0.56]];
  function cov(v) {
    if (v <= 0) return 0;
    for (let k = 1; k < COV.length; k++) if (v <= COV[k][0]) return lerp(COV[k - 1][1], COV[k][1], (v - COV[k - 1][0]) / (COV[k][0] - COV[k - 1][0]));
    return COV[COV.length - 1][1];
  }
  /*
   * The setting and the drift. The light drifts 12 px a second along the
   * shafts' normal; its phase is set per scene, so each full-light scene
   * starts from Kevin's fitted composition: the opener at frame 0, line 3 so
   * that the fit lands as the lockup completes, the card at its cut (then
   * slowing to rest, power2.out). The globe setting starts at the approved
   * cut's phase (-36 px) and the diagram reaches v1's (-93 px) on "up". Two
   * settings mix by tone ("partner", "So" and the card): a cell takes the
   * arriving setting once p passes its Bayer threshold.
   */
  function settingAt(t) {
    if (t < T.c1) return { fn: 'full', d: 12 * t };
    const globe = { fn: 'globe', d: 12 * (t - T.c1) - 36 };
    const full3 = { fn: 'full', d: 12 * (t - LOCK_DONE) };
    if (t < MIX3) return globe;
    if (t < MIX3 + MIX3_LIGHT) return { ...globe, mix: { ...full3, p: (t - MIX3) / MIX3_LIGHT } };
    if (t < SO_T) return full3;
    // the offer's ground arrives by tone on "So", under the lockup's move, at
    // the phase that reaches v3's (-93 px) on "up"
    const dia6 = { fn: 'diagram', d: 12 * (t - T.c6) - 93 };
    if (t < SO_T + SO_LIGHT) return { ...full3, mix: { ...dia6, p: (t - SO_T) / SO_LIGHT } };
    if (t < T.c8) return dia6;
    const dia8 = { fn: 'diagram', d: 12 * (t - T.c8) - 93 };
    if (t < T.card) return dia8;
    // power2.out leaves at twice its mean speed: 27 px over 4.5 s starts at 12 px a second
    const card = { fn: 'card', d: 6 * CARD_D * EASE['power2.out'](clamp01((t - T.card) / CARD_D)) };
    if (t < T.card + CARD_MIX) return { ...dia8, mix: { ...card, p: (t - T.card) / CARD_MIX } };
    return card;
  }

  // The canvases.
  function ctx2d(id) {
    return $(id).getContext('2d', { willReadFrequently: true });
  }
  const cField = ctx2d('cvField');
  const cPic = ctx2d('cvPic');
  const cDots = ctx2d('cvDots');
  const cVec = ctx2d('cvVec');
  const cMarks = ctx2d('cvMarks');
  const cCard = ctx2d('cvCard');
  function off(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return { c, x: c.getContext('2d', { willReadFrequently: true }) };
  }
  const gOff = off(COLS, ROWS);
  const gImg = gOff.x.createImageData(COLS, ROWS);
  const kOff = off(COLS, ROWS);
  const kImg = kOff.x.createImageData(COLS, ROWS);
  const pOff = off(COLS, ROWS);
  const pImg = pOff.x.createImageData(COLS, ROWS);
  // the glyph globe's smooth ground (cell resolution, drawn smoothed like the light's)
  const qOff = off(COLS, ROWS);
  const qImg = qOff.x.createImageData(COLS, ROWS);
  let groundOn = false;

  const TONE = new Float32Array(N);
  const CLR = new Float32Array(N);

  /*
   * Clearance: around every figure (40 px) and object (18 px) the light falls
   * to olive by tone, easing to its full value over the next 60 px. A zone is
   * a rectangle or a disc with a weight (its object's presence), so its
   * clearance comes and goes with the object, and the cells switch in Bayer order.
   */
  let ZONES = [];
  let WINDOWS = [];
  const zone = (x0, y0, x1, y1, m, w) => {
    if (w > 0) ZONES.push({ x0, y0, x1, y1, m, w });
  };
  const headZone = (x0, y0, x1, y1, w) => zone(x0, y0, x1, y1, 40, w);
  const objZone = (x0, y0, x1, y1, w) => zone(x0, y0, x1, y1, 18, w);
  const circZone = (cx, cy, r, m, w) => {
    if (w > 0) ZONES.push({ cx, cy, r, m, w });
  };
  function applyZones() {
    CLR.fill(1);
    for (const z of ZONES) {
      const reach = z.m + 60;
      const bx0 = z.r ? z.cx - z.r : z.x0;
      const bx1 = z.r ? z.cx + z.r : z.x1;
      const by0 = z.r ? z.cy - z.r : z.y0;
      const by1 = z.r ? z.cy + z.r : z.y1;
      const c0 = Math.max(0, Math.floor((bx0 - reach) / CELL));
      const c1 = Math.min(COLS - 1, Math.ceil((bx1 + reach) / CELL));
      const r0 = Math.max(0, Math.floor((by0 - reach) / CELL));
      const r1 = Math.min(ROWS - 1, Math.ceil((by1 + reach) / CELL));
      for (let y = r0; y <= r1; y++)
        for (let x = c0; x <= c1; x++) {
          const i = y * COLS + x;
          let d;
          if (z.r) d = Math.max(0, Math.hypot(XC[i] - z.cx, YC[i] - z.cy) - z.r);
          else {
            const dx = Math.max(z.x0 - XC[i], 0, XC[i] - z.x1);
            const dy = Math.max(z.y0 - YC[i], 0, YC[i] - z.y1);
            d = Math.hypot(dx, dy);
          }
          if (d >= reach) continue;
          CLR[i] *= 1 - z.w * (1 - ss(z.m, reach, d));
        }
    }
  }
  // A window prints the full light inside a rectangle (the credits bar), raised
  // by its tone p in Bayer order, at drift phase d (sh and ah move the sampled
  // stretch along the normal and along the shafts).
  const lightWindow = (x0, y0, x1, y1, p, d, sh, ah) => {
    if (p > 0) WINDOWS.push({ x0, y0, x1, y1, p, d, sh: sh || 0, ah: ah || 0 });
  };

  // Kevin's full light stands uncleared (the opener, the lockup)
  function toneOf(fn, d, i) {
    const S = S0[i] - d;
    if (fn === 'full') return fullTone(S, A0[i]);
    if (fn === 'diagram') return diagramTone(S, A0[i]) * CLR[i];
    if (fn === 'globe') return globeTone(S) * CLR[i];
    // the card: during its mix the leaving page's clearance holds the light back from it
    return fullTone(S, A0[i]) * cardMask(XC[i], YC[i]) * CLR[i];
  }
  function drawField(t) {
    const st = settingAt(t);
    applyZones();
    const mx = st.mix;
    for (let i = 0; i < N; i++) TONE[i] = mx && TH[i] < mx.p ? toneOf(mx.fn, mx.d, i) : toneOf(st.fn, st.d, i);
    for (const w of WINDOWS) {
      const c0 = Math.max(0, Math.floor(w.x0 / CELL));
      const c1 = Math.min(COLS, Math.ceil(w.x1 / CELL));
      const r0 = Math.max(0, Math.floor(w.y0 / CELL));
      const r1 = Math.min(ROWS, Math.ceil(w.y1 / CELL));
      for (let y = r0; y < r1; y++)
        for (let x = c0; x < c1; x++) {
          const i = y * COLS + x;
          if (XC[i] < w.x0 || XC[i] > w.x1 || YC[i] < w.y0 || YC[i] > w.y1) continue;
          // raised in Bayer order: a cell takes the light once p passes its threshold, then grows with p
          const lit = ss(TH[i] * 0.7, TH[i] * 0.7 + 0.3, w.p);
          TONE[i] = fullTone(S0[i] - w.d + w.sh, A0[i] + w.ah) * lit;
        }
    }
    const g = gImg.data;
    const k = kImg.data;
    const O = RGB.olive, G = RGB.gold, S = RGB.straw;
    for (let i = 0; i < N; i++) {
      const v = TONE[i];
      let r, gg, b;
      if (v <= 0) {
        r = O[0];
        gg = O[1];
        b = O[2];
      } else if (v < 0.6) {
        const u = v / 0.6;
        r = O[0] + (G[0] - O[0]) * u;
        gg = O[1] + (G[1] - O[1]) * u;
        b = O[2] + (G[2] - O[2]) * u;
      } else {
        const u = Math.min(1, (v - 0.6) / 0.4);
        r = G[0] + (S[0] - G[0]) * u;
        gg = G[1] + (S[1] - G[1]) * u;
        b = G[2] + (S[2] - G[2]) * u;
      }
      const q = i * 4;
      g[q] = r;
      g[q + 1] = gg;
      g[q + 2] = b;
      g[q + 3] = 255;
      if (cov(v) > TH[i]) {
        k[q] = r;
        k[q + 1] = gg;
        k[q + 2] = Math.max(0, b - 42);
        k[q + 3] = 255;
      } else k[q + 3] = 0;
    }
    gOff.x.putImageData(gImg, 0, 0);
    kOff.x.putImageData(kImg, 0, 0);
    cField.imageSmoothingEnabled = true;
    cField.imageSmoothingQuality = 'low';
    cField.drawImage(gOff.c, 0, 0, W, H);
    cField.imageSmoothingEnabled = false;
    cField.drawImage(kOff.c, 0, 0, W, H);
  }

  /* ================= PICTURES ON THE 3 px GRID ================= */
  const P = pImg.data;
  const Q = qImg.data;
  function picClear() {
    P.fill(0);
    if (groundOn) Q.fill(0);
    groundOn = false;
  }
  function picFlush() {
    pOff.x.putImageData(pImg, 0, 0);
    cPic.clearRect(0, 0, W, H);
    if (groundOn) {
      qOff.x.putImageData(qImg, 0, 0);
      cPic.imageSmoothingEnabled = true;
      cPic.imageSmoothingQuality = 'low';
      cPic.drawImage(qOff.c, 0, 0, W, H);
    }
    cPic.imageSmoothingEnabled = false;
    cPic.drawImage(pOff.c, 0, 0, W, H);
  }
  // a ground cell: olive toward gold by u (the light's smooth-ground ramp)
  function putGround(i, u) {
    const O = RGB.olive, G = RGB.gold;
    const q = i * 4;
    Q[q] = O[0] + (G[0] - O[0]) * u;
    Q[q + 1] = O[1] + (G[1] - O[1]) * u;
    Q[q + 2] = O[2] + (G[2] - O[2]) * u;
    Q[q + 3] = 255;
    groundOn = true;
  }
  // Nested Bayer tiers on their own ramps: ink k's coverage runs from 0 at
  // bk[k][0] to full at bk[k][1]; a cell takes the highest tier its tone passes.
  function tierInkB(v, th, inks, bk) {
    let c = null;
    for (let k = 0; k < inks.length; k++) {
      const cv = clamp01((v - bk[k][0]) / (bk[k][1] - bk[k][0]));
      if (cv > th) c = inks[k];
    }
    return c;
  }
  // Nested tiers on one ramp (tone v over n inks).
  function tierInk(v, th, inks) {
    const n = inks.length;
    const vv = clamp01(v) * n;
    let lev = 0;
    for (let k = 1; k <= n; k++) if (vv - (k - 1) > th) lev = k;
    return lev ? inks[lev - 1] : null;
  }
  function putCell(i, c) {
    const q = i * 4;
    P[q] = c[0];
    P[q + 1] = c[1];
    P[q + 2] = c[2];
    P[q + 3] = 255;
  }
  // Prints a rectangle's cells (cell centres inside it) at tone v in the inks;
  // gate (optional) lets only cells whose threshold is under it print.
  function printRect(x0, y0, x1, y1, v, inks, gate) {
    if (v <= 0) return;
    const c0 = Math.max(0, Math.ceil((x0 - HALF) / CELL));
    const c1 = Math.min(COLS - 1, Math.floor((x1 - HALF) / CELL));
    const r0 = Math.max(0, Math.ceil((y0 - HALF) / CELL));
    const r1 = Math.min(ROWS - 1, Math.floor((y1 - HALF) / CELL));
    for (let y = r0; y <= r1; y++)
      for (let x = c0; x <= c1; x++) {
        const i = y * COLS + x;
        if (gate != null && TH[i] >= gate) continue;
        const c = tierInk(v, TH[i], inks);
        if (c) putCell(i, c);
      }
  }
  const INKS3 = [RGB.sgold, RGB.straw, RGB.white];

  /* ================= LINES ================= */
  function poly(pts) {
    const L = [0];
    for (let k = 1; k < pts.length; k++) L.push(L[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
    return { pts, L, len: L[L.length - 1] };
  }
  function pointAt(pl, d) {
    const { pts, L } = pl;
    if (d <= 0) return pts[0];
    for (let k = 1; k < pts.length; k++)
      if (d <= L[k]) {
        const u = (d - L[k - 1]) / (L[k] - L[k - 1] || 1);
        return [lerp(pts[k - 1][0], pts[k][0], u), lerp(pts[k - 1][1], pts[k][1], u)];
      }
    return pts[pts.length - 1];
  }
  function subPts(pl, a, b) {
    a = Math.max(0, a);
    b = Math.min(pl.len, b);
    if (b <= a) return null;
    const out = [pointAt(pl, a)];
    for (let k = 1; k < pl.pts.length - 1; k++) if (pl.L[k] > a && pl.L[k] < b) out.push(pl.pts[k]);
    out.push(pointAt(pl, b));
    return out;
  }
  function stroke(ctx, pts, width, color, cap) {
    if (!pts || pts.length < 2) return;
    ctx.save();
    // integer geometry lands odd widths on whole pixels; even widths straddle the integer line
    if (width % 2 === 1) ctx.translate(0.5, 0.5);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.lineCap = cap || 'butt';
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 4;
    ctx.stroke();
    ctx.restore();
  }
  // The approved cut's stroke (../slash-partnership/lib/film.js), for its
  // routes and their pulse: always half a pixel over, whatever the width.
  function strokeA(ctx, pts, width, color) {
    if (!pts || pts.length < 2) return;
    ctx.save();
    ctx.translate(0.5, 0.5);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 4;
    ctx.stroke();
    ctx.restore();
  }
  const WHITE = '#ffffff';
  const OLIVE = css(RGB.olive);
  const STRAW = css(RGB.straw);
  const SGOLD = css(RGB.sgold);
  // The doubled line: one path stroked twice, a 7 px white gauge under a 3 px
  // olive core (two 2 px threads), drawn to length d from its owner. A pulse
  // (v1's) is a third copy in screen gold over the core, a sub-path [p0, p1].
  function dline(pl, d, pulse) {
    const pts = subPts(pl, 0, d);
    if (!pts) return;
    stroke(cVec, pts, 7, WHITE);
    stroke(cVec, pts, 3, OLIVE);
    if (pulse) {
      const q = subPts(pl, Math.max(0, pulse[0]), Math.min(d, pulse[1]));
      if (q) stroke(cVec, q, 3, SGOLD);
    }
  }
  // A registration cross of whole-pixel rects, arms w px thick (2 px: v1's
  // floor for a meaningful line).
  function cross(x, y, color, size, w) {
    const s = Math.round((size || 17) / 2);
    const th = w || 2;
    const cx = Math.round(x), cy = Math.round(y);
    const o = Math.floor(th / 2);
    cVec.fillStyle = color || WHITE;
    cVec.fillRect(cx - s, cy - o, 2 * s + (th % 2), th);
    cVec.fillRect(cx - o, cy - s, th, 2 * s + (th % 2));
  }
  // A rectangle drawn out of its top-left corner: two paths meeting at the bottom right.
  function drawRectOut(x0, y0, x1, y1, u, color, width) {
    const a = poly([[x0, y0], [x1, y0], [x1, y1]]);
    const b = poly([[x0, y0], [x0, y1], [x1, y1]]);
    const wd = width || 2;
    stroke(cVec, subPts(a, 0, a.len * u), wd, color || STRAW, 'square');
    stroke(cVec, subPts(b, 0, b.len * u), wd, color || STRAW, 'square');
  }
  // A 2 px outline on whole pixels (x0..x1, y0..y1 the outer edges).
  function frameRect(ctx, x0, y0, x1, y1, color, alpha, w) {
    const th = w || 2;
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.fillStyle = color || STRAW;
    ctx.fillRect(x0, y0, x1 - x0, th);
    ctx.fillRect(x0, y1 - th, x1 - x0, th);
    ctx.fillRect(x0, y0, th, y1 - y0);
    ctx.fillRect(x1 - th, y0, th, y1 - y0);
    ctx.globalAlpha = 1;
  }
  // A canvas leaving by tone: it keeps only the cells whose threshold is at or over p.
  const vmask = off(COLS, ROWS);
  const vmaskImg = vmask.x.createImageData(COLS, ROWS);
  let vmaskP = -1;
  function leaveByTone(ctx, p) {
    if (p <= 0) return;
    if (p !== vmaskP) {
      const d = vmaskImg.data;
      for (let i = 0; i < N; i++) d[i * 4 + 3] = TH[i] >= p ? 255 : 0;
      vmask.x.putImageData(vmaskImg, 0, 0);
      vmaskP = p;
    }
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(vmask.c, 0, 0, W, H);
    ctx.restore();
  }

  /* ================= MARKS PRINTED THROUGH THE SCREEN ================= */
  const IMG = {};
  const INK = {}; // each image's ink box, normalized to its drawn size
  const ASPECT = { slash: 64 / 22, gt: 1213 / 771 };
  function measureInk(name) {
    const img = IMG[name];
    const h = 600;
    const w = Math.round(h * ASPECT[name]);
    const o = off(w, h);
    o.x.drawImage(img, 0, 0, w, h);
    const d = o.x.getImageData(0, 0, w, h).data;
    let x0 = w, x1 = -1, y0 = h, y1 = -1;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        if (d[(y * w + x) * 4 + 3] > 100) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
    INK[name] = { x0: x0 / w, x1: (x1 + 1) / w, y0: y0 / h, y1: (y1 + 1) / h };
  }
  const MARKS = {};
  /*
   * A mark cached at its place: drawn so that its ink spans x0..x1 (height from
   * its own proportions, top at y0), into a canvas aligned to the cell grid.
   * The Slash wordmark draws as its white file; the GT mark (currentColor) is
   * filled white through source-in.
   */
  function makeMark(id, name, x0, y0, x1) {
    const ink = INK[name];
    const inkW = x1 - x0;
    const dw = inkW / (ink.x1 - ink.x0);
    const dh = dw / ASPECT[name];
    const dx = x0 - ink.x0 * dw;
    const dy = y0 - ink.y0 * dh;
    const bx0 = Math.floor(dx / CELL) * CELL;
    const by0 = Math.floor(dy / CELL) * CELL;
    const bx1 = Math.ceil((dx + dw) / CELL) * CELL;
    const by1 = Math.ceil((dy + dh) / CELL) * CELL;
    const m = off(bx1 - bx0, by1 - by0);
    m.x.drawImage(IMG[name], dx - bx0, dy - by0, dw, dh);
    if (name === 'gt') {
      m.x.globalCompositeOperation = 'source-in';
      m.x.fillStyle = WHITE;
      m.x.fillRect(0, 0, bx1 - bx0, by1 - by0);
      m.x.globalCompositeOperation = 'source-over';
    }
    const cw = (bx1 - bx0) / CELL;
    const ch = (by1 - by0) / CELL;
    const mask = off(cw, ch);
    MARKS[id] = { c: m.c, bx: bx0, by: by0, w: bx1 - bx0, h: by1 - by0, cw, ch, mask, maskImg: mask.x.createImageData(cw, ch), scratch: off(bx1 - bx0, by1 - by0), ink: { x0: dx + ink.x0 * dw, y0: dy + ink.y0 * dh, x1: dx + ink.x1 * dw, y1: dy + ink.y1 * dh }, anchor: { x: x0, y: y0, unit: inkW } };
    return MARKS[id];
  }
  // Draws a cached canvas through the screen: a cell shows while its threshold
  // lies in [lo, p). Raising by p is (0, p); leaving by p is (p, 1).
  function printCached(ctx, mk, p, lo) {
    const a = lo == null ? 0 : lo;
    const b = p;
    if (b <= a) return;
    if (a <= 0 && b >= 1) {
      ctx.drawImage(mk.c, mk.bx, mk.by);
      return;
    }
    const d = mk.maskImg.data;
    const cx0 = mk.bx / CELL;
    const cy0 = mk.by / CELL;
    for (let y = 0; y < mk.ch; y++)
      for (let x = 0; x < mk.cw; x++) {
        const gx = cx0 + x;
        const gy = cy0 + y;
        const th = gx >= 0 && gy >= 0 && gx < COLS && gy < ROWS ? TH[gy * COLS + gx] : 1;
        d[(y * mk.cw + x) * 4 + 3] = th < b && th >= a ? 255 : 0;
      }
    mk.mask.x.putImageData(mk.maskImg, 0, 0);
    const s = mk.scratch.x;
    s.globalCompositeOperation = 'source-over';
    s.clearRect(0, 0, mk.w, mk.h);
    s.drawImage(mk.c, 0, 0);
    s.globalCompositeOperation = 'destination-in';
    s.imageSmoothingEnabled = false;
    s.drawImage(mk.mask.c, 0, 0, mk.w, mk.h);
    s.globalCompositeOperation = 'source-over';
    ctx.drawImage(mk.scratch.c, mk.bx, mk.by);
  }
  const printMark = (id, p, ctx) => MARKS[id] && printCached(ctx || cMarks, MARKS[id], p);

  // Canvas text cached like a mark (the lockup's x).
  function makeText(id, text, size, weight, x, baseline) {
    mctx.font = `${weight} ${size}px ${FACE}`;
    mctx.letterSpacing = '0px';
    const m = mctx.measureText(text);
    const pad = 8;
    const asc = Math.max(m.actualBoundingBoxAscent, size * 0.9);
    const desc = Math.max(m.actualBoundingBoxDescent, size * 0.3);
    const bx0 = Math.floor((x - pad) / CELL) * CELL;
    const by0 = Math.floor((baseline - asc - pad) / CELL) * CELL;
    const bx1 = Math.ceil((x + m.width + pad) / CELL) * CELL;
    const by1 = Math.ceil((baseline + desc + pad) / CELL) * CELL;
    const c = off(bx1 - bx0, by1 - by0);
    c.x.font = `${weight} ${size}px ${FACE}, sans-serif`;
    c.x.fillStyle = WHITE;
    c.x.textBaseline = 'alphabetic';
    c.x.textAlign = 'left';
    c.x.fillText(text, x - bx0, baseline - by0);
    const cw = (bx1 - bx0) / CELL;
    const ch = (by1 - by0) / CELL;
    const mask = off(cw, ch);
    MARKS[id] = { c: c.c, bx: bx0, by: by0, w: bx1 - bx0, h: by1 - by0, cw, ch, mask, maskImg: mask.x.createImageData(cw, ch), scratch: off(bx1 - bx0, by1 - by0), anchor: { x: x - m.actualBoundingBoxLeft, y: baseline, unit: size } };
    return MARKS[id];
  }
  // Kevin's lockup scaled by k about its ink centre (the push), cached as the
  // marks slash<id>, x<id> and gt<id> exactly as the lockup's own are made,
  // so each size is drawn from the files (at k = 1 it is the lockup itself)
  function makeLock(id, k) {
    const X = (x) => PUSH_C[0] + (x - PUSH_C[0]) * k;
    const Y = (y) => PUSH_C[1] + (y - PUSH_C[1]) * k;
    makeMark('slash' + id, 'slash', X(498), Y(472), X(907));
    makeMark('gt' + id, 'gt', X(1182), Y(466), X(1415));
    makeText('x' + id, 'x', 104 * k, 500, X(1016) - measure('x', 104 * k, 500, 0).left, Y(571));
  }
  // A whole mark on its way from its seat in `from` to its seat in `to` (u from
  // 0 to 1): its anchor (ink left and top, or a glyph's ink left and baseline)
  // and its scale run straight between the two, so its box does too. At u = 1
  // the seated mark itself is drawn.
  function drawBetween(ctx, from, to, u) {
    const a = MARKS[from], b = MARKS[to];
    if (u >= 1) return printCached(ctx, b, 1);
    const k = lerp(1, b.anchor.unit / a.anchor.unit, u);
    const ax = lerp(a.anchor.x, b.anchor.x, u), ay = lerp(a.anchor.y, b.anchor.y, u);
    ctx.drawImage(a.c, ax + (a.bx - a.anchor.x) * k, ay + (a.by - a.anchor.y) * k, a.w * k, a.h * k);
  }
  // a glyph rising out of its mask (a box from 1.0 em above its baseline to 0.2725 em below)
  function riseGlyph(ctx, id, size, base, u) {
    if (u <= 0) return;
    const mk = MARKS[id];
    const top = base - size;
    const hgt = BOXH * size;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, top, W, hgt);
    ctx.clip();
    ctx.translate(0, Math.round((1 - u) * hgt));
    printCached(ctx, mk, 1);
    ctx.restore();
  }

  /* ================= THE FIGURES (DOM) ================= */
  // Inter 500, white, first ink on x 160, cap tops on y 172, line pitch 1.02 em.
  const HEADS = {
    f1: { size: 140, lines: ['180+', 'countries'] },
    f6: { size: 140, lines: ['Up to $2,000', 'in translation credits'] },
  };
  const TRACK = -0.03;
  const LN = {};
  function layoutHeads() {
    document.querySelectorAll('#heads .ln').forEach((el) => {
      const h = HEADS[el.dataset.h];
      const k = Number(el.dataset.k);
      const F = h.size;
      const base = 172 + CAP * F + k * 1.02 * F;
      const text = h.lines[k];
      const first = measure(text.charAt(0), F, 500, TRACK);
      const over = ROUND_LEFT.has(text.charAt(0)) ? 0.0125 * F : 0;
      const pen = 160 - first.left - over;
      Object.assign(el.style, { fontSize: F + 'px', letterSpacing: TRACK + 'em', lineHeight: BOXH * F + 'px', height: Math.ceil(BOXH * F) + 'px', top: base - F + 'px', left: pen + 'px' });
      const m = measure(text, F, 500, TRACK);
      LN[el.dataset.h + ':' + k] = { el, F, base, pen, text, box: { x0: pen + m.left, x1: pen + m.right, y0: base - m.asc, y1: base + m.desc } };
    });
    // the globe's tally holds the final width of "180" in tabular figures, so the "+" never moves
    const n180 = $('n180');
    n180.textContent = '180';
    n180.style.width = n180.getBoundingClientRect().width + 'px';
    // a line's box runs to its last laid-out glyph: the tabular figures set wider
    // than the canvas measure, and the "+" stands after them (a box measured on
    // the digits alone clipped the "+" off as the figure left by tone)
    for (const key in LN) {
      const rg = document.createRange();
      rg.selectNodeContents(LN[key].el);
      LN[key].box.x1 = Math.max(LN[key].box.x1, rg.getBoundingClientRect().right);
    }
    n180.textContent = '0';
  }
  // A figure line's state: risen by u (0.18 em with its opacity), visible alpha a.
  function setLine(h, k, u, a) {
    const L = LN[h + ':' + k];
    if (!L) return;
    const alpha = clamp01(u) * (a == null ? 1 : a);
    L.el.style.opacity = String(alpha);
    L.el.style.transform = `translate3d(0, ${((1 - clamp01(u)) * 0.18 * L.F).toFixed(2)}px, 0)`;
    if (alpha > 0) headZone(L.box.x0, L.box.y0, L.box.x1, L.box.y1, Math.min(1, alpha * 1.2));
  }
  const rise = (t, t0, d) => prog(t, t0, d || 0.35, 'expo.out');
  // lv: the figure leaving by tone (0 to 1), its cells switching off in Bayer order
  function heading(h, t, t0, lv) {
    for (let k = 0; k < 2; k++) {
      const L = LN[h + ':' + k];
      if (lv >= 1) continue;
      if (lv > 0) {
        // a settled figure leaves: its line box keeps the cells whose threshold is at or over lv
        setLine(h, k, 1, 1 - lv);
        L.el.style.opacity = '1';
        L.el.style.clipPath = cellPath(L.box.x0, L.box.y0, L.box.x1, L.box.y1, L.pen, L.base - L.F, lv, true);
        L.clipped = true;
      } else setLine(h, k, rise(t, t0 + k * 0.04));
    }
  }
  // The 3 px cells over a box (8 px out on each side, 4 px above and below) whose
  // Bayer threshold is under p (arriving) or at or over p (leaving), as a
  // clip-path relative to an element whose box starts at (left, top); each
  // row's neighbouring cells are merged into one run.
  function cellPath(x0, y0, x1, y1, left, top, p, leaving) {
    const c0 = Math.floor((x0 - 8) / CELL), c1 = Math.ceil((x1 + 8) / CELL);
    const r0 = Math.floor((y0 - 4) / CELL), r1 = Math.ceil((y1 + 4) / CELL);
    const parts = [];
    for (let y = r0; y < r1; y++) {
      const yy = Math.max(0, Math.min(ROWS - 1, y));
      let run = -1;
      for (let x = c0; x <= c1; x++) {
        let lit = false;
        if (x < c1) {
          const th = TH[yy * COLS + Math.max(0, Math.min(COLS - 1, x))];
          lit = leaving ? th >= p : th < p;
        }
        if (lit && run < 0) run = x;
        else if (!lit && run >= 0) {
          const w = (x - run) * CELL;
          parts.push(`M${(run * CELL - left).toFixed(1)} ${(y * CELL - top).toFixed(1)}h${w}v${CELL}h-${w}z`);
          run = -1;
        }
      }
    }
    return parts.length ? `path('${parts.join('')}')` : 'inset(50%)';
  }

  /* ================= DOM TEXT PRINTED BY TONE ================= */
  /*
   * A DOM text run (one text node with its lang and dir) changes state by
   * tone on the film's cell grid: its clip-path is the union of the 3 px
   * cells whose Bayer threshold is under p (arriving) or at or over p
   * (leaving), so its cells switch in Bayer order, the way the light's do.
   */
  const TXT = {};
  function seatText(id, x, base, size, opts) {
    const o = opts || {};
    const el = $(id);
    const box = BOXH * size;
    Object.assign(el.style, { fontSize: size + 'px', lineHeight: box + 'px', height: Math.ceil(box) + 'px', top: base - size + 'px' });
    if (o.letterSpacing != null) el.style.letterSpacing = o.letterSpacing + 'em';
    const r0 = el.getBoundingClientRect();
    let left;
    if (o.align === 'right') left = x - r0.width;
    else if (o.align === 'center') left = x - r0.width / 2;
    else left = x;
    el.style.left = left + 'px';
    const r = el.getBoundingClientRect();
    TXT[id] = { el, x0: r.left, x1: r.right, y0: base - size * 0.95, y1: base + size * 0.32, left: r.left, top: r.top, w: r.width };
    return TXT[id];
  }
  function showText(id, p, leaving) {
    const tx = TXT[id];
    if (!tx) return;
    const el = tx.el;
    if ((!leaving && p <= 0) || (leaving && p >= 1)) {
      el.style.visibility = 'hidden';
      return;
    }
    el.style.visibility = 'visible';
    el.style.opacity = '1';
    if ((!leaving && p >= 1) || (leaving && p <= 0)) {
      el.style.clipPath = 'none';
      return;
    }
    el.style.clipPath = cellPath(tx.x0, tx.y0, tx.x1, tx.y1, tx.left, tx.top, p, leaving);
  }
  // A Latin label rising out of its line box (expo.out), like a figure line.
  function riseText(id, u) {
    const tx = TXT[id];
    if (!tx) return;
    const el = tx.el;
    if (u <= 0) {
      el.style.visibility = 'hidden';
      return;
    }
    el.style.visibility = 'visible';
    el.style.clipPath = 'none';
    el.style.opacity = String(clamp01(u));
    const size = parseFloat(el.style.fontSize);
    el.style.transform = `translate3d(0, ${((1 - clamp01(u)) * 0.18 * size).toFixed(2)}px, 0)`;
  }
  const DOMTEXT = [];
  function hideText() {
    for (const el of DOMTEXT) {
      if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden';
    }
  }

  /* ================= THE PAYMENT GLOBE (the approved 19.5 s cut's) ================= */
  // Kevin's dithered globe (Prototemplate dither-lib globe(), sign-in settings),
  // the approved cut's centre, radius, tilt, spin, light, land noise and inks.
  const GL = { cx: 1300, cy: 600, r: 380, tilt: 0.15, spin: 0.05, ambient: 0.14, rim: 0.16, landmass: 0.42, gamma: 1.15, gain: 0.94 };
  const LV = (() => {
    const l = Math.hypot(-0.45, -0.62, 0.65);
    return [-0.45 / l, -0.62 / l, 0.65 / l];
  })();
  function hash2(x, y) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function vnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const sx = xf * xf * (3 - 2 * xf), sy = yf * yf * (3 - 2 * yf);
    const a = hash2(xi, yi) + (hash2(xi + 1, yi) - hash2(xi, yi)) * sx;
    const b = hash2(xi, yi + 1) + (hash2(xi + 1, yi + 1) - hash2(xi, yi + 1)) * sx;
    return a + (b - a) * sy;
  }
  function fbm(x, y) {
    let s = 0, amp = 0.5, n = 0, fx = x, fy = y;
    for (let o = 0; o < 4; o++) {
      s += vnoise(fx, fy) * amp;
      n += amp;
      amp *= 0.5;
      fx *= 2.03;
      fy *= 2.01;
    }
    return s / n;
  }
  const CT = Math.cos(GL.tilt), STt = Math.sin(GL.tilt);
  const globeClock = (t) => 40 + (t - T.c1); // the approved still's T = 40 at the cut, spinning 0.05 rad a second
  function globeAt(x, y, gt) {
    const px = (x - GL.cx) / GL.r;
    const py = (y - GL.cy) / GL.r;
    const d2 = px * px + py * py;
    if (d2 >= 1) return null;
    const nz = Math.sqrt(1 - d2);
    let light = px * LV[0] + py * LV[1] + nz * LV[2];
    light = light < 0 ? 0 : light;
    let value = GL.ambient + (1 - GL.ambient) * light;
    value += GL.rim * Math.pow(d2, 3.5);
    const ay = py * CT - nz * STt;
    const az = py * STt + nz * CT;
    const lat = Math.asin(Math.max(-1, Math.min(1, ay)));
    const lon = Math.atan2(px, az) + gt * GL.spin;
    const landN = ss(0.42, 0.62, fbm(Math.cos(lon) * 2.2 + 4.1, Math.sin(lon) * 2.2 + lat * 2.6));
    value *= 1 - GL.landmass + GL.landmass * 2 * landN;
    const v = Math.pow(clamp01(value) * ss(1, 0.985, d2), GL.gamma) * GL.gain;
    return { v, land: landN, light };
  }
  // view direction (unit, y down, z to the viewer) <-> the globe's texture frame at clock gt
  function toTex(n, gt) {
    const ay = n[1] * CT - n[2] * STt;
    const az = n[1] * STt + n[2] * CT;
    return { lat: Math.asin(Math.max(-1, Math.min(1, ay))), lon: Math.atan2(n[0], az) + gt * GL.spin };
  }
  function toView(tx, gt) {
    const lv = tx.lon - gt * GL.spin;
    const X = Math.cos(tx.lat) * Math.sin(lv);
    const Ya = Math.sin(tx.lat);
    const Za = Math.cos(tx.lat) * Math.cos(lv);
    return [X, Ya * CT + Za * STt, -Ya * STt + Za * CT];
  }
  const ORIGIN_PX = [1150, 420];
  const ROUTES = [];
  let ORIGIN = null;
  const DEG = Math.PI / 180;
  const onScreen = (n) => [GL.cx + GL.r * n[0], GL.cy + GL.r * n[1]];
  /*
   * The 24 endpoints, seeded at the clock of the 24th landing ("eighty"), when
   * every route stands. Each lies within 60 degrees of the globe's centre from
   * the first landing to the switch, at least 14 degrees from the origin, at
   * least 90 px from every other endpoint on screen (at "eighty" and at the
   * switch) and at least BEAR_GAP degrees of bearing from every other route
   * as seen from the origin, so every line and every cross reads on its own.
   * The routes draw in order of their bearing from the origin, clockwise,
   * starting after the widest gap, so the fan sweeps once across the disc.
   */
  const BEAR_GAP = 5;
  function buildRoutes() {
    const ox = (ORIGIN_PX[0] - GL.cx) / GL.r;
    const oy = (ORIGIN_PX[1] - GL.cy) / GL.r;
    ORIGIN = toTex([ox, oy, Math.sqrt(1 - ox * ox - oy * oy)], globeClock(ORIGIN_T));
    const clocks = [globeClock(FIG1_T), globeClock(L1.eighty), globeClock(SW0)];
    const o = onScreen(toView(ORIGIN, clocks[1]));
    const oN = toView(ORIGIN, clocks[1]);
    const bearOf = (tex) => {
      const p = onScreen(toView(tex, clocks[1]));
      return Math.atan2(p[1] - o[1], p[0] - o[0]);
    };
    const rnd = DI.rng(ROUTE_SEED);
    const ends = [];
    for (let tries = 0; tries < 20000 && ends.length < ROUTE_N; tries++) {
      const cu = 1 - rnd() * (1 - Math.cos(60 * DEG));
      const th = Math.acos(cu);
      const ph = rnd() * Math.PI * 2;
      const tex = toTex([Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)], clocks[1]);
      let ok = clocks.every((c) => toView(tex, c)[2] >= Math.cos(60 * DEG));
      const n = toView(tex, clocks[1]);
      if (oN[0] * n[0] + oN[1] * n[1] + oN[2] * n[2] > Math.cos(14 * DEG)) ok = false;
      const b0 = bearOf(tex);
      for (const e of ends) {
        if (!ok) break;
        for (const c of [clocks[1], clocks[2]]) {
          const a = onScreen(toView(e.tex, c)), b = onScreen(toView(tex, c));
          if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 90) ok = false;
        }
        let d = Math.abs(e.b - b0);
        if (Math.min(d, 2 * Math.PI - d) < BEAR_GAP * DEG) ok = false;
      }
      if (ok) ends.push({ tex, b: b0 });
    }
    if (ends.length < ROUTE_N) throw new Error(`route seed ${ROUTE_SEED} placed ${ends.length} endpoints`);
    ends.sort((a, b) => a.b - b.b);
    let gi = 0, gw = -1;
    for (let k = 0; k < ROUTE_N; k++) {
      const nx = k + 1 < ROUTE_N ? ends[k + 1].b : ends[0].b + 2 * Math.PI;
      if (nx - ends[k].b > gw) {
        gw = nx - ends[k].b;
        gi = k + 1;
      }
    }
    for (let k = 0; k < ROUTE_N; k++) ROUTES.push({ t0: ROUTE_T0 + k * ROUTE_STEP, end: ends[(gi + k) % ROUTE_N].tex });
  }
  function slerp(a, b, u) {
    const d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
    const om = Math.acos(d);
    if (om < 1e-6) return a.slice();
    const s0 = Math.sin((1 - u) * om) / Math.sin(om);
    const s1 = Math.sin(u * om) / Math.sin(om);
    return [a[0] * s0 + b[0] * s1, a[1] * s0 + b[1] * s1, a[2] * s0 + b[2] * s1];
  }
  function routePts(r, gt, u0, u1) {
    const a = toView(ORIGIN, gt);
    const b = toView(r.end, gt);
    const out = [];
    const n = 28;
    for (let k = 0; k <= n; k++) {
      const u = lerp(u0, u1, k / n);
      const p = slerp(a, b, u);
      const lift = 1 + 0.04 * Math.sin(Math.PI * u);
      out.push([GL.cx + GL.r * p[0] * lift, GL.cy + GL.r * p[1] * lift]);
    }
    return out;
  }
  // The glyph globe: 24 px blocks, twenty writing systems.
  const SCRIPTS = [
    ['a', 'e', 'g', 'r', 's', 'G', 'T'],
    ['λ', 'Ω', 'φ', 'ξ'],
    ['Ж', 'я', 'ф', 'д'],
    ['א', 'ש', 'ל', 'ת'],
    ['ب', 'ع', 'ق', 'ك', 'م'],
    ['क', 'ह', 'श', 'ज', 'त'],
    ['த', 'ழ', 'க', 'ம'],
    ['ಕ', 'ಗ', 'ಮ'],
    ['ক', 'ভ', 'ম'],
    ['ก', 'ญ', 'ม', 'ษ'],
    ['ა', 'ღ', 'ქ'],
    ['Ա', 'Ֆ', 'Ջ'],
    ['ሀ', 'ጸ', 'ሰ'],
    ['あ', 'ゆ', 'の'],
    ['カ', 'ネ', 'ト'],
    ['文', '字', '語', '言', '世', '界'],
    ['한', '글', '말'],
    ['ᠮ', 'ᠣ'],
    ['ཀ', 'ཤ'],
    ['ꦲ', 'ꦤ'],
  ];
  const BLOCKS = [];
  function buildBlocks() {
    const rnd = DI.rng(2026);
    for (let by = Math.floor((GL.cy - GL.r) / 24); by <= Math.ceil((GL.cy + GL.r) / 24); by++)
      for (let bx = Math.floor((GL.cx - GL.r) / 24); bx <= Math.ceil((GL.cx + GL.r) / 24); bx++) {
        const cx = bx * 24 + 12;
        const cy = by * 24 + 12;
        const s = Math.floor(rnd() * SCRIPTS.length);
        const g = Math.floor(rnd() * 64);
        if (Math.hypot(cx - GL.cx, cy - GL.cy) > GL.r - 4) continue;
        BLOCKS.push({ bx, by, cx, cy, s, g, th: (DI.B8[(by & 7) * 8 + (bx & 7)] + 0.5) / 64 });
      }
  }
  const GLOBE_INKS = [RGB.gold, RGB.straw, RGB.white];
  const GLOBE_GAIN = 1.0;
  const GLOBE_BK = [[0.04, 0.5], [0.5, 0.8], [0.76, 1.02]];
  const GROUND = 0.76; // the glyph globe's ground: olive to gold by 0.76 of the globe's value

  /* ================= SCENE GEOMETRY ================= */
  // Lines 6 and 7: the credits bar and the five surfaces.
  const BAR = { x0: 160, y0: 480, x1: 1760, y1: 528 };
  const PLATES = [
    { x0: 160, kind: 'app', label: 'App', lang: 'ja' },
    { x0: 488, kind: 'web', label: 'Website', lang: 'ar', rtl: true },
    { x0: 816, kind: 'docs', label: 'Docs', lang: 'hi' },
    { x0: 1144, kind: 'slides', label: 'Slides', lang: 'ko' },
    { x0: 1472, kind: 'design', label: 'Design files', lang: 'zh' },
  ].map((p) => ({ ...p, x1: p.x0 + 288, y0: 600, y1: 920, cx: p.x0 + 144 }));
  // Each plate: its label at the top left (Inter 500, 44 px), its drawing in
  // the band DRAW (y 676 to 826), and its row (Inter 500, 40 px) on one
  // baseline across all five plates, 20 px in from the plate's edges, so the
  // five translations read as one line and each holds at a phone's size.
  const PLATE_IN = 20;
  const LABEL = { size: 44, base: 650 };
  const ROW = { size: 40, base: 884 };
  const DRAW = { y0: 676, y1: 826 };
  // each plate's row: where its English string and its translation stand (baseline, left or right edge)
  function plateRow(p) {
    return { x: p.x0 + PLATE_IN, base: ROW.base };
  }
  // Line 8: the app page (the GIF's page at frame width, in the film's inks),
  // centred in the frame now that it stands without a heading (v1's page, 175 px higher).
  const APP = { x0: 160, y0: 290, x1: 1760, y1: 790 };
  const LANGS = ['en', 'es', 'fr', 'ja'];
  // the top bar's centre line is y 338; the selector's and the button's labels are Inter 44 px
  const BAR8 = { mid: 338, rule: 386 };
  const SEL = { right: 1720, y0: 303, y1: 373, labelRight: 1664, base: 354, size: 44, pad: 22 };
  const BTN = { x0: 200, y0: 694, y1: 762, pad: 30, base: 744, size: 44 };
  const APP_HEAD = { x: 200, base: 482 };
  // Heroicons 2.2.0 16 solid chevron-down (MIT, Tailwind Labs), drawn at 24 px.
  const CHEVRON = new Path2D('M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z');
  const AW = { s: {}, b: {} }; // the selector's and the button's label widths per language

  // The lockup's seat from line 6's "So" through the offer and the surfaces:
  // Kevin's lockup at 0.50 (v3's carry-over had 0.70; Kevin, v4: "make the gt
  // x slash when showing the 2k credits smaller"), right edge on x 1760 and
  // top on y 160. Its boxes clear "Up to $2,000" (ink x 160 to 956) by 346 px
  // and stand 80 px above "in translation credits" (ink top y 314); on a
  // rendered frame its ink (x 1303 to 1759, y 160 to 232) gives 347 and 82.
  const SEAT_S = 0.5;
  const seatX = (X) => Math.round(1760 - (1415 - X) * SEAT_S);
  const seatY = (Y) => Math.round(160 + (Y - 466) * SEAT_S);
  const SEAT = {
    slash: { x0: seatX(498), y0: seatY(472), x1: seatX(907) }, // x 1302 to 1506, top 163
    gt: { x0: seatX(1182), y0: 160, x1: 1760 }, // x 1644 to 1760
    x: { left: seatX(1016), base: seatY(571), size: 104 * SEAT_S }, // ink x 1561, baseline 213
  };
  // The end card. Its lockup is back in its pre-v3 seat, Kevin's lockup at
  // 0.80 in the mark corner (Slash x 1024 to 1352, GT x 1573 to 1760).
  const EC = {
    slash: { x0: 1024, y0: 165, x1: 1352 },
    gt: { x0: 1573, y0: 160, x1: 1760 },
    x: { left: 1440, base: 244, size: 104 * 0.8 },
    t1: 676,
    t2: 798,
    link: 920,
  };

  /* ================= BUILD (after the faces and the images load) ================= */
  let READY = false;
  function build() {
    ['slash', 'gt'].forEach((n) => {
      IMG[n] = $('img-' + n);
      measureInk(n);
    });
    // the opener's card: its canvas stands on the card image's box in the
    // frame, turned about the card's centre
    IMG.card = $('img-card');
    const cv = $('cvCardPhoto');
    cv.width = CP.box.w;
    cv.height = CP.box.h;
    Object.assign(cv.style, { left: CP.box.x + 'px', top: CP.box.y + 'px', width: CP.box.w + 'px', height: CP.box.h + 'px', transformOrigin: `${(CP.centre[0] - CP.box.x).toFixed(2)}px ${(CP.centre[1] - CP.box.y).toFixed(2)}px` });
    cardCtx = cv.getContext('2d');
    sheenOff = off(CP.box.w, CP.box.h);
    buildSheen();
    compOff = off(CP.box.w, CP.box.h);
    groundCtx = $('cvOpGround').getContext('2d', { willReadFrequently: true });
    logoCtx = $('cvOpLogo').getContext('2d');
    makeLogo();
    frontCtx = $('cvFront').getContext('2d', { willReadFrequently: true });
    fOff = off(COLS, ROWS);
    fImg = fOff.x.createImageData(COLS, ROWS);
    keyOff = off(W, H);
    // v8: the card's first frame wholly behind the globe (it stays behind
    // from there), and the opener's end: the card hidden, the globe at its
    // seat and the ground gone
    CARD_GONE = MOVE_T0 + SLIDE_D;
    for (let t = MOVE_T0 + SLIDE_D; t >= MOVE_T0; t -= 1 / 600) {
      if (!cardHidden(t)) break;
      CARD_GONE = t;
    }
    OPEN_T1 = Math.max(CARD_GONE, MOVE_T0 + GROW_D, T.c1 + GROUND_D);
    for (let t = CARD_GONE; t <= OPEN_T1 + 0.5; t += 1 / 600) if (!cardHidden(t)) throw new Error(`the card shows at ${t.toFixed(4)} after it went behind the globe`);
    // Kevin's lockup (1080 coordinates)
    makeMark('slashOpen', 'slash', 498, 472, 907);
    makeMark('gtOpen', 'gt', 1182, 466, 1415);
    makeText('xOpen', 'x', 104, 500, 1016 - measure('x', 104, 500, 0).left, 571);
    // the lockup at the push's end, where the glide on "So" starts
    makeLock('Push', 1 + PUSH);
    // the lockup's seat at 0.50 from line 6's "So" through the offer
    makeMark('slashSeat', 'slash', SEAT.slash.x0, SEAT.slash.y0, SEAT.slash.x1);
    makeMark('gtSeat', 'gt', SEAT.gt.x0, SEAT.gt.y0, SEAT.gt.x1);
    makeText('xSeat', 'x', SEAT.x.size, 500, SEAT.x.left - measure('x', SEAT.x.size, 500, 0).left, SEAT.x.base);
    // the card's lockup at 0.80, in the mark corner
    makeMark('slashEnd', 'slash', EC.slash.x0, EC.slash.y0, EC.slash.x1);
    makeMark('gtEnd', 'gt', EC.gt.x0, EC.gt.y0, EC.gt.x1);
    makeText('xEnd', 'x', EC.x.size, 500, EC.x.left - measure('x', EC.x.size, 500, 0).left, EC.x.base);
    layoutHeads();
    layoutText();
    layoutCard();
    buildRoutes();
    buildBlocks();
    READY = true;
  }

  function layoutText() {
    document.querySelectorAll('.tx').forEach((el) => DOMTEXT.push(el));
    // lines 6 and 7: the plate labels and rows
    PLATES.forEach((p, k) => {
      seatText('pl' + k, p.x0 + PLATE_IN, LABEL.base, LABEL.size, { letterSpacing: -0.01 });
      const r = plateRow(p);
      seatText('pe' + k, r.x, r.base, ROW.size);
      if (p.rtl) seatText('pt' + k, p.x1 - PLATE_IN, r.base, ROW.size, { align: 'right' });
      else seatText('pt' + k, r.x, r.base, ROW.size);
    });
    // line 8: the app page's strings
    LANGS.forEach((L) => {
      seatText('ah-' + L, APP_HEAD.x, APP_HEAD.base, 72, { letterSpacing: -0.02 });
      const s = seatText('as-' + L, SEL.labelRight, SEL.base, SEL.size, { align: 'right' });
      AW.s[L] = s.w;
      const b = seatText('ab-' + L, BTN.x0 + BTN.pad, BTN.base, BTN.size);
      AW.b[L] = b.w;
    });
  }

  function layoutCard() {
    const seatLine = (id, text, size, weight, tracking, base, left, right) => {
      const el = $(id);
      const box = BOXH * size;
      const m = measure(text, size, weight, tracking);
      let x;
      if (right != null) x = right - m.right;
      else {
        const first = measure(text.charAt(0), size, weight, tracking);
        x = left - first.left - (ROUND_LEFT.has(text.charAt(0)) ? 0.0125 * size : 0);
      }
      Object.assign(el.style, { top: Math.round(base - size) + 'px', height: Math.ceil(box) + 'px', lineHeight: box + 'px', fontSize: size + 'px', letterSpacing: tracking + 'em', left: x + 'px' });
      return { x0: x + m.left, x1: x + m.right, y0: base - m.asc, y1: base + m.desc };
    };
    EC.boxT1 = seatLine('cardT1', 'Up to $2,000', 120, 500, -0.035, EC.t1, 160);
    EC.boxT2 = seatLine('cardT2', 'in translation credits', 120, 500, -0.035, EC.t2, 160);
    EC.boxL = seatLine('cardL', 'generaltranslation.com/slash', 48, 400, -0.005, EC.link, 160);
  }

  /* ================= SCENES ================= */
  // Line 1, first sentence: Slash's card on the photo's own ground (lib/
  // card-prep.py). It floats in to its place in the photo, from 90 px lower,
  // tilted back, turned left and rolled, at 0.90 of its size (OP_IN,
  // power3.out), solid within its first 5 frames; under that it turns slowly
  // the whole time (OP_DRIFT), and a soft highlight sweeps across its brushed
  // gold at a constant rate (drawCardPhoto). From "for" it slides right
  // behind the globe (v8, sceneOpen's move). v6: Slash's wordmark rises over
  // it on "Slash" and fades on "for" (drawLogo).
  let cardCtx = null;
  let sheenOff = null;
  const SHEEN = {};
  // the sweep's geometry in the card image's box: a band parallel to the
  // card's short side, moving along its long side from beyond its left edge
  // to beyond its right
  function buildSheen() {
    const C = CP.corners.map((c) => [c[0] - CP.box.x, c[1] - CP.box.y]);
    const sh = [C[3][0] - C[0][0], C[3][1] - C[0][1]];
    const L = Math.hypot(sh[0], sh[1]);
    let g = [sh[1] / L, -sh[0] / L];
    if (g[0] * (C[1][0] - C[0][0]) + g[1] * (C[1][1] - C[0][1]) < 0) g = [-g[0], -g[1]];
    const pr = C.map((c) => c[0] * g[0] + c[1] * g[1]);
    const s0 = Math.min(...pr), s1 = Math.max(...pr);
    Object.assign(SHEEN, { g, s0, s1, bw: 0.3 * (s1 - s0), core: 0.09 * (s1 - s0) });
  }
  // the highlight: a broad soft band with a narrower core, warm white, added
  // to the card in screen
  const SHEEN_RGB = [255, 238, 200];
  const SHEEN_HALO = 0.22;
  const SHEEN_CORE = 0.5;
  function drawCardPhoto(t, target) {
    const c = target || cardCtx;
    const w = CP.box.w, h = CP.box.h;
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, w, h);
    c.drawImage(IMG.card, 0, 0);
    const u = prog(t, SHEEN_T0, SHEEN_D);
    if (u <= 0 || u >= 1) return;
    const { g, s0, s1, bw, core } = SHEEN;
    const pos = lerp(s0 - bw, s1 + bw, u);
    const s = sheenOff.x;
    s.globalCompositeOperation = 'source-over';
    s.clearRect(0, 0, w, h);
    // two raised-cosine bands on one centre line, their alphas added
    [[bw, SHEEN_HALO], [core, SHEEN_CORE]].forEach(([hw, peak], n) => {
      const grad = s.createLinearGradient(g[0] * (pos - hw), g[1] * (pos - hw), g[0] * (pos + hw), g[1] * (pos + hw));
      for (let k = 0; k <= 8; k++) grad.addColorStop(k / 8, css(SHEEN_RGB, peak * (0.5 - 0.5 * Math.cos((2 * Math.PI * k) / 8))));
      s.globalCompositeOperation = n ? 'lighter' : 'source-over';
      s.fillStyle = grad;
      s.fillRect(0, 0, w, h);
    });
    // clipped to the card, then added as light
    s.globalCompositeOperation = 'destination-in';
    s.drawImage(IMG.card, 0, 0);
    c.globalCompositeOperation = 'screen';
    c.drawImage(sheenOff.c, 0, 0);
    c.globalCompositeOperation = 'source-over';
  }
  // v6: the card drawn at OP_K inside its own canvas (about the card's
  // centre, high-quality smoothing), so it is resampled from the photo at its
  // size on screen
  let compOff = null; // the card with the highlight's tail, for the move's first frames
  function drawCardMoved(t, s, deg) {
    let src = IMG.card;
    if (t < SHEEN_T0 + SHEEN_D) {
      drawCardPhoto(t, compOff.x);
      src = compOff.c;
    }
    const c = cardCtx;
    const px = CP.centre[0] - CP.box.x, py = CP.centre[1] - CP.box.y;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, CP.box.w, CP.box.h);
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    c.translate(px, py);
    c.rotate((deg * Math.PI) / 180);
    c.scale(s, s);
    c.translate(-px, -py);
    c.drawImage(src, 0, 0);
    c.setTransform(1, 0, 0, 1, 0, 0);
  }

  /* ---- v8: the card slides behind the globe ---- */
  // The card's pose on screen at film time t from "for": the opener's slow
  // drift carries on, and on one eased progress (SLIDE_D, power2.inOut) its
  // centre runs to SLIDE_TO while it shrinks to SLIDE_K of its opener size,
  // as if moving back in depth. tx and ty are the CSS layer's translation; k
  // is drawn inside the card's own canvas (drawCardMoved), so the photo is
  // resampled at its size on screen and never printed through the screen.
  const CARD_C0 = [CP.centre[0], CP.centre[1] + OP_DY];
  function cardAt(t) {
    const d = t / T.c1;
    const e = EASE['power2.inOut'](clamp01((t - MOVE_T0) / SLIDE_D));
    const d1 = (MOVE_T0 + SLIDE_D) / T.c1;
    return {
      e,
      tx: (SLIDE_TO[0] - CARD_C0[0]) * e,
      ty: OP_DY + OP_DRIFT.ty * d + (SLIDE_TO[1] - CARD_C0[1] - OP_DRIFT.ty * d1) * e,
      ry: OP_DRIFT.ry * d,
      k: lerp(1, SLIDE_K, e),
    };
  }
  // the card's four corners on screen for a pose (the CSS transform: rotateY
  // about the card's centre, the translation, the perspective)
  function cardCorners(c) {
    const b = (c.ry * Math.PI) / 180;
    return CP.corners.map((p) => {
      const X = OP_K * c.k * (p[0] - CP.centre[0]), Y = OP_K * c.k * (p[1] - CP.centre[1]);
      const w = 1 + (X * Math.sin(b)) / OP_PERSP;
      return [CP.centre[0] + (X * Math.cos(b) + c.tx) / w, CP.centre[1] + (Y + c.ty) / w];
    });
  }
  // The globe in front of the card at film time t: at its seat, grown to
  // scale s about its centre
  function frontAt(t) {
    return { cx: GL.cx, cy: GL.cy, s: EASE['power3.out'](clamp01((t - MOVE_T0) / GROW_D)) };
  }
  // whether every corner of the card stands inside the front globe's disc
  const MARGIN = 3;
  function cardHidden(t) {
    const f = frontAt(t);
    const r = GL.r * f.s - MARGIN;
    if (r <= 0) return false;
    return cardCorners(cardAt(t)).every((p) => Math.hypot(p[0] - f.cx, p[1] - f.cy) < r);
  }
  // Drawn into cvFront (in the opener, over the card): an olive disc (the
  // globe's own ground, opaque, so nothing of the card shows between its
  // cells) and the globe's 3 px cells at that place and scale, on the film's
  // grid. At its seat (s = 1) the cells are exactly sceneGlobe's.
  let frontCtx = null;
  let fOff = null, fImg = null;
  function drawFront(t, f) {
    const c = frontCtx;
    c.clearRect(0, 0, W, H);
    const r = GL.r * f.s;
    if (r < 0.5) return;
    c.fillStyle = OLIVE;
    c.beginPath();
    c.arc(f.cx, f.cy, r, 0, 2 * Math.PI);
    c.fill();
    const D = fImg.data;
    D.fill(0);
    const gt = globeClock(t);
    const c0 = Math.max(0, Math.floor((f.cx - r) / CELL)), c1 = Math.min(COLS, Math.ceil((f.cx + r) / CELL));
    const r0 = Math.max(0, Math.floor((f.cy - r) / CELL)), r1 = Math.min(ROWS, Math.ceil((f.cy + r) / CELL));
    for (let y = r0; y < r1; y++)
      for (let x = c0; x < c1; x++) {
        const i = y * COLS + x;
        const X = x * CELL + HALF, Y = y * CELL + HALF;
        const g = globeAt(GL.cx + (X - f.cx) / f.s, GL.cy + (Y - f.cy) / f.s, gt);
        if (!g) continue;
        const ink = tierInkB(g.v * GLOBE_GAIN, TH[i], GLOBE_INKS, GLOBE_BK);
        if (!ink) continue;
        const q = i * 4;
        D[q] = ink[0];
        D[q + 1] = ink[1];
        D[q + 2] = ink[2];
        D[q + 3] = 255;
      }
    fOff.x.putImageData(fImg, 0, 0);
    c.imageSmoothingEnabled = false;
    c.drawImage(fOff.c, 0, 0, W, H);
  }
  // the photo's ground leaving by tone: it keeps the cells whose threshold is at or over p
  let groundCtx = null;
  let groundP = -1;
  function drawGroundLeaving(p) {
    if (p === groundP) return;
    const c = groundCtx;
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, W, H);
    c.drawImage($('opGround'), 0, 0);
    leaveByTone(c, p);
    groundP = p;
  }
  // the route origin's point on the turning globe at film time t
  function originAt(t) {
    const o = toView(ORIGIN, globeClock(t));
    return [GL.cx + GL.r * o[0], GL.cy + GL.r * o[1]];
  }
  // v6: Slash's wordmark, made once from its file at its size (its ink box
  // LOGO, its top left on whole pixels); v7 keeps the file's own white (a
  // LOGO_INK would fill it)
  let logoCtx = null;
  let LOGO_MK = null;
  let logoKey = '';
  function makeLogo() {
    const ink = INK.slash;
    const dw = (LOGO.x1 - LOGO.x0) / (ink.x1 - ink.x0);
    const dh = dw / ASPECT.slash;
    const dx = LOGO.x0 - ink.x0 * dw;
    const dy = LOGO.y0 - ink.y0 * dh;
    const bx = Math.floor(dx), by = Math.floor(dy);
    const o = off(Math.ceil(dx + dw) - bx, Math.ceil(dy + dh) - by);
    o.x.drawImage(IMG.slash, dx - bx, dy - by, dw, dh);
    if (LOGO_INK) {
      o.x.globalCompositeOperation = 'source-in';
      o.x.fillStyle = css(LOGO_INK);
      o.x.fillRect(0, 0, o.c.width, o.c.height);
      o.x.globalCompositeOperation = 'source-over';
    }
    LOGO_MK = { c: o.c, bx, by, ink: { x0: LOGO.x0, y0: LOGO.y0, x1: LOGO.x1, y1: dy + ink.y1 * dh } };
  }
  // The wordmark at film time t: out of its mask on "Slash" (the mask is its
  // ink box with a little room), then on "for" a fade with a small drop.
  function drawLogo(t) {
    const ri = prog(t, LOGO_T0, LOGO_IN, 'expo.out');
    const lo = prog(t, MOVE_T0, LOGO_OUT);
    const a = 1 - EASE['power2.out'](lo);
    const drop = LOGO_DROP * EASE['power2.out'](lo);
    const key = ri <= 0 || a <= 0 ? 'off' : ri.toFixed(5) + ':' + lo.toFixed(5);
    if (key === logoKey) return;
    logoKey = key;
    const c = logoCtx;
    c.clearRect(0, 0, W, H);
    if (key === 'off') return;
    const mk = LOGO_MK;
    const hgt = mk.ink.y1 - mk.ink.y0 + 8;
    c.save();
    if (ri < 1) {
      c.beginPath();
      c.rect(0, mk.ink.y0 - 4, W, hgt);
      c.clip();
    }
    c.globalAlpha = a;
    c.drawImage(mk.c, mk.bx, mk.by + Math.round((1 - ri) * hgt + drop)); // on whole pixels, so it stays sharp
    c.restore();
  }
  const cardTransform = (ty, rx, ry, rz, sc, tx) => `perspective(${OP_PERSP}px) translate3d(${(tx || 0).toFixed(3)}px, ${ty.toFixed(3)}px, 0px) rotateX(${rx.toFixed(4)}deg) rotateY(${ry.toFixed(4)}deg) rotateZ(${rz.toFixed(4)}deg) scale(${sc.toFixed(5)})`;
  function sceneOpen(t) {
    const op = $('opener');
    if (t >= OPEN_T1) {
      if (op.style.visibility !== 'hidden') op.style.visibility = 'hidden';
      return;
    }
    op.style.visibility = 'visible';
    const el = $('cvCardPhoto');
    const wrap = $('opCard');
    const gImg = $('opGround');
    const gCv = $('cvOpGround');
    const fr = $('cvFront');
    if (t < MOVE_T0) {
      // the opener, as v6 (its parts inherit the opener's visibility, so
      // hiding the opener hides them on any seek)
      gImg.style.visibility = 'inherit';
      gCv.style.visibility = 'hidden';
      wrap.style.visibility = 'inherit';
      fr.style.visibility = 'hidden';
      const u = prog(t, 0, OP_IN, 'power3.out');
      const d = t / T.c1;
      const ty = OP_FROM.ty * (1 - u) + OP_DRIFT.ty * d;
      const rx = OP_FROM.rx * (1 - u);
      const ry = OP_FROM.ry * (1 - u) + OP_DRIFT.ry * d;
      const rz = OP_FROM.rz * (1 - u);
      const sc = lerp(OP_FROM.s, 1, u);
      el.style.opacity = String(clamp01(t / OP_FADE));
      el.style.transform = cardTransform(ty + OP_DY, rx, ry, rz, sc);
      drawCardMoved(t, OP_K, 0);
      drawLogo(t);
      return;
    }
    // the move. The ground leaves by tone from "businesses".
    const gp = (t - T.c1) / GROUND_D;
    gImg.style.visibility = gp < 0 ? 'inherit' : 'hidden';
    if (gp >= 0 && gp < 1) {
      gCv.style.visibility = 'inherit';
      drawGroundLeaving(gp);
    } else gCv.style.visibility = 'hidden';
    drawLogo(t);
    // the card slides right, behind the globe (it is not drawn once it is wholly behind)
    if (t < CARD_GONE) {
      wrap.style.visibility = 'inherit';
      const c = cardAt(t);
      el.style.opacity = '1';
      el.style.transform = cardTransform(c.ty, 0, c.ry, 0, 1, c.tx);
      drawCardMoved(t, OP_K * c.k, 0);
    } else wrap.style.visibility = 'hidden';
    // the globe in front of it, with its clearance in the light
    const f = frontAt(t);
    fr.style.visibility = 'inherit';
    drawFront(t, f);
    if (f.s > 0) circZone(f.cx, f.cy, GL.r * f.s, 18, 1);
  }

  // Line 1 from "businesses", and the glyph bridge: the approved cut's payment
  // globe, drawn as it draws it on the 3 px grid, with v3's 24 routes. On
  // "partner" it leaves by tone.
  function sceneGlobe(t) {
    if (!on(t, T.c1, MIX3 + MIX3_OUT)) return;
    const lv = t >= MIX3 ? clamp01((t - MIX3) / MIX3_OUT) : 0;
    // the figure counts 1 to 180 from the first landing to the 24th (the count
    // is the number; the routes illustrate it); its "+" is set on "countries"
    const landed = Math.max(1, Math.round(lerp(1, 180, clamp01((t - FIG1_T) / (L1.eighty - FIG1_T)))));
    const n180 = $('n180');
    if (n180.textContent !== String(landed)) n180.textContent = String(landed);
    $('plus').style.opacity = t >= PULSE0 ? '1' : '0';
    // it rises as the first route lands, so it never reads "0 countries"
    heading('f1', t, FIG1_T, lv);
    const gt = globeClock(t);
    const glyphOn = t >= SW0;
    // block switch times (Bayer order on the 24 px block grid)
    const blockDone = (bx, by) => glyphOn && t >= SW0 + SW_D * ((DI.B8[(by & 7) * 8 + (bx & 7)] + 0.5) / 64);
    const c0 = Math.floor((GL.cx - GL.r) / CELL), c1 = Math.ceil((GL.cx + GL.r) / CELL);
    const r0 = Math.floor((GL.cy - GL.r) / CELL), r1 = Math.ceil((GL.cy + GL.r) / CELL);
    // v8: until the opener stands down, the globe is drawn in front of the card (drawFront)
    if (t >= OPEN_T1) {
    for (let y = r0; y < r1; y++)
      for (let x = c0; x < c1; x++) {
        const i = y * COLS + x;
        if (lv > 0 && TH[i] < lv) continue; // left by tone
        const X = x * CELL + HALF, Y = y * CELL + HALF;
        const g = globeAt(X, Y, gt);
        if (!g) continue;
        if (blockDone(Math.floor(X / 24), Math.floor(Y / 24))) {
          // a switched block keeps the globe's tone as a smooth ground under its glyph
          putGround(i, GROUND * g.v);
          continue;
        }
        const ink = tierInkB(g.v * GLOBE_GAIN, TH[i], GLOBE_INKS, GLOBE_BK);
        if (ink) putCell(i, ink);
      }
    circZone(GL.cx, GL.cy, GL.r, 18, 1 - lv);
    }
    // the glyphs
    if (glyphOn) {
      const ctx = cDots;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let lastFont = '';
      for (const b of BLOCKS) {
        if (t < SW0 + SW_D * b.th) continue;
        // the block's tone: the mean of the approved cut's 16 samples (6 px apart)
        let sv = 0, sl = 0, n = 0;
        for (let yy = 0; yy < 4; yy++)
          for (let xx = 0; xx < 4; xx++) {
            const g = globeAt(b.bx * 24 + xx * 6 + 3, b.by * 24 + yy * 6 + 3, gt);
            if (!g) continue;
            sv += g.v;
            sl += g.land;
            n++;
          }
        if (!n) continue;
        const v = sv / 16;
        const land = sl / n > 0.5;
        const step = t >= STEP0 + STEP_D * b.th ? 1 : 0;
        const sc = SCRIPTS[(b.s + step) % SCRIPTS.length];
        const ch = sc[b.g % sc.length];
        // lit glyphs large and white (the land's larger), the dark side's small
        // and in straw and gold, sized by the block's light, over the globe's own
        // tone as a smooth ground
        const k = clamp01(v / 0.7);
        const px = 24 * Math.min(1.15, (land ? 0.62 : 0.5) + 0.55 * k);
        const tv = v + (b.th - 0.5) * 0.1;
        const ink = tv > (land ? 0.24 : 0.38) ? RGB.white : tv > 0.2 ? RGB.straw : RGB.gold;
        const font = `500 ${px.toFixed(1)}px ${FACE}, sans-serif`;
        if (font !== lastFont) {
          ctx.font = font;
          lastFont = font;
        }
        ctx.fillStyle = css(ink);
        ctx.fillText(ch, b.cx, b.cy + 1);
      }
      leaveByTone(ctx, lv);
    }
    // the origin, the routes, their crosses (gone with the switch), on the
    // approved 19.5 s cut's paths and clock (../slash-partnership/lib/
    // film.js): the origin a cross, each route a white arc from the origin to
    // its head, each endpoint a smaller cross as its route lands, the crosses
    // leaving cell by cell (the threshold under each) with the switch. v8
    // draws them stronger (ROUTE_W, the crosses' arms CROSS_W, over the
    // olive keyline ROUTE_KEY; drawRoutes).
    // v7: the origin cross prints by tone over CROSS_IN before "They" (v5's timing, now on the formed globe)
    if (t > ORIGIN_T - CROSS_IN && t < ORIGIN_T) {
      const o = originAt(t);
      drawRoutes([], [[o[0], o[1], CROSS_ORIGIN]], [], (t - (ORIGIN_T - CROSS_IN)) / CROSS_IN);
    }
    if (t >= ORIGIN_T && t < SW0 + CROSS_OUT[1]) {
      const leave = t >= SW0 ? ss(SW0 + CROSS_OUT[0], SW0 + CROSS_OUT[1], t) : 0;
      const o = toView(ORIGIN, gt);
      const ox = GL.cx + GL.r * o[0], oy = GL.cy + GL.r * o[1];
      const lines = [], crosses = [], pulses = [];
      if (thAt(ox, oy) >= leave) crosses.push([ox, oy, CROSS_ORIGIN]);
      const retract = t >= SW0 ? prog(t, SW0, RETRACT_D, 'power3.out') : 0;
      // the approved cut's pulse on "countries": a screen-gold stretch runs
      // from the origin to every endpoint (0.35 s, ease none), its 0.25 tail
      // clearing by 0.4375 s
      const pulseF = (t - PULSE0) / PULSE_D;
      ROUTES.forEach((r) => {
        if (t < r.t0) return;
        const u = clamp01((t - r.t0) / ROUTE_D);
        if (retract < 1) {
          lines.push(routePts(r, gt, retract, u));
          if (pulseF > 0 && pulseF < 1.3) {
            const a = Math.max(retract, pulseF - 0.25), b = Math.min(u, pulseF);
            if (b > a) pulses.push(routePts(r, gt, a, b));
          }
        }
        if (u >= 1) {
          const e = toView(r.end, gt);
          const ex = GL.cx + GL.r * e[0], ey = GL.cy + GL.r * e[1];
          if (thAt(ex, ey) >= leave) crosses.push([ex, ey, CROSS_END]);
        }
      });
      drawRoutes(lines, crosses, pulses, 1);
    }
  }
  // v8 (Kevin, 2026-10-09: "its a bit hard to see the lines"): the routes and
  // their crosses, in three passes so that no keyline crosses a white line
  // where routes meet: the keylines of every line and cross, drawn opaque
  // into their own layer and laid on at ROUTE_KEY_A (so overlapping keylines
  // never darken twice); the white lines and crosses; the pulse. A cross
  // printing by tone (p < 1) shows each pixel once p passes the threshold of
  // the 3 px cell under it, its keyline the same way.
  let keyOff = null;
  function drawRoutes(lines, crosses, pulses, p) {
    if (ROUTE_KEY > 0 && ROUTE_KEY_A > 0) {
      const k = keyOff.x;
      k.clearRect(0, 0, W, H);
      for (const pts of lines) strokeA(k, pts, ROUTE_W + 2 * ROUTE_KEY, OLIVE);
      for (const c of crosses) crossBox(k, c[0], c[1], c[2], CROSS_W, ROUTE_KEY, OLIVE, p);
      cVec.globalAlpha = ROUTE_KEY_A;
      cVec.drawImage(keyOff.c, 0, 0);
      cVec.globalAlpha = 1;
    }
    for (const pts of lines) strokeA(cVec, pts, ROUTE_W, WHITE);
    for (const c of crosses) crossBox(cVec, c[0], c[1], c[2], CROSS_W, 0, WHITE, p);
    for (const pts of pulses) strokeA(cVec, pts, PULSE_W, SGOLD);
  }
  // A cross of whole-pixel rects (cross()'s geometry: arms w px thick, size
  // px long, centred on the pixel grid), grown by pad px on every side; by
  // tone if p < 1.
  function crossBox(ctx, x, y, size, w, pad, color, p) {
    const s = Math.round(size / 2);
    const cx = Math.round(x), cy = Math.round(y);
    const o = Math.floor(w / 2);
    const R = [
      [cx - s - pad, cy - o - pad, 2 * s + (w % 2) + 2 * pad, w + 2 * pad],
      [cx - o - pad, cy - s - pad, w + 2 * pad, 2 * s + (w % 2) + 2 * pad],
    ];
    ctx.fillStyle = color;
    if (p >= 1) {
      R.forEach((r) => ctx.fillRect(r[0], r[1], r[2], r[3]));
      return;
    }
    for (const r of R)
      for (let yy = r[1]; yy < r[1] + r[3]; yy++)
        for (let xx = r[0]; xx < r[0] + r[2]; xx++) if (thAt(xx + 0.5, yy + 0.5) < p) ctx.fillRect(xx, yy, 1, 1);
  }

  // Line 3: on "partner" Kevin's lockup prints in reading order (the approved
  // film's opener): the wordmark by tone, the x rising, the GT mark by tone. It
  // lands on Kevin's image and stands on his light, uncleared. From there to
  // line 6's "So" it pushes in slowly about its centre (v5: the greetings are
  // gone). On "So" it glides and scales into its corner seat at 0.50 (1.4 s,
  // power2.inOut) while the offer's ground comes in under it (settingAt,
  // 0.5 s). It stands there through the offer and the surfaces and leaves by
  // tone on the cut to the app page.
  function sceneLock3(t) {
    if (!on(t, MIX3, T.c8 + SEAT_OUT)) return;
    if (t >= T.c8) {
      const lv = clamp01((t - T.c8) / SEAT_OUT);
      ['slashSeat', 'xSeat', 'gtSeat'].forEach((id) => printCached(cMarks, MARKS[id], 1, lv));
      return;
    }
    if (t >= SO_T) {
      const u = prog(t, SO_T, SEAT_D, 'power2.inOut');
      drawBetween(cMarks, 'slashPush', 'slashSeat', u);
      drawBetween(cMarks, 'xPush', 'xSeat', u);
      drawBetween(cMarks, 'gtPush', 'gtSeat', u);
    } else if (t > LOCK_DONE) {
      // the push: the lockup made at this frame's size from its files
      makeLock('Now', 1 + PUSH * prog(t, LOCK_DONE, SO_T - LOCK_DONE));
      ['slashNow', 'xNow', 'gtNow'].forEach((id) => printCached(cMarks, MARKS[id], 1));
    } else {
      printMark('slashOpen', ss(MIX3, MIX3 + LOCK_P, t));
      riseGlyph(cMarks, 'xOpen', 104, 571, prog(t, MIX3 + LOCK_X, LOCK_P, 'expo.out'));
      printMark('gtOpen', ss(MIX3 + LOCK_GT, MIX3 + LOCK_GT + LOCK_P, t));
    }
  }

  // Lines 6 and 7: the offer counted, the credits bar, five surfaces localized on their words.
  function plateDraw(p, k, t, gate) {
    const t0 = PLATE_T[k];
    const lit = ss(t0, t0 + 0.28, t);
    const inks = INKS3;
    const x0 = p.x0 + PLATE_IN, x1 = p.x1 - PLATE_IN, cx = p.cx;
    const y0 = DRAW.y0, y1 = DRAW.y1;
    const dim = 1 / 6 + (2 / 3) * lit; // a screen-gold checker before its word, straw under a white checker on it
    const dim2 = 1 / 6 + 0.5 * lit;
    const pr = (a, b, c, d, v) => printRect(a, b, c, d, v, inks, gate);
    const fr = (a, b, c, d) => frameRect(cVec, a, b, c, d, STRAW, gate);
    // each drawing stands in the band y0..y1 above the plate's row
    switch (p.kind) {
      case 'app': {
        fr(cx - 52, y0, cx + 52, y1); // a portrait phone, 104 x 150
        pr(cx - 40, y0 + 12, cx + 40, y0 + 26, dim); // the app's header
        pr(cx - 40, y0 + 38, cx + 40, y0 + 78, dim2); // its content
        pr(cx - 40, y0 + 90, cx + 16, y0 + 100, dim2);
        fr(cx - 16, y1 - 30, cx + 16, y1 - 20); // its button
        break;
      }
      case 'web': {
        pr(x0, y0, x1, y0 + 18, dim); // the nav bar
        pr(x0, y0 + 30, x1, y0 + 118, dim2); // the hero
        fr(x0, y1 - 20, x0 + 96, y1); // a button
        break;
      }
      case 'docs': {
        pr(x0, y0, x0 + 44, y1, dim2); // the sidebar
        for (let r = 0; r < 5; r++) pr(x0 + 60, y0 + 6 + r * 30, x1 - (r % 3) * 30, y0 + 18 + r * 30, dim);
        break;
      }
      case 'slides': {
        fr(x0, y0, x1, y0 + 140); // a 16:9 slide, 248 x 140
        pr(x0 + 16, y0 + 40, x1 - 110, y0 + 52, dim);
        pr(x0 + 16, y0 + 64, x1 - 130, y0 + 76, dim);
        pr(x1 - 92, y0 + 34, x1 - 16, y0 + 106, dim2);
        break;
      }
      default: {
        // a design file: a toolbar, one large artboard (selected) and two small ones below
        pr(x0, y0, x1, y0 + 10, dim2);
        fr(x0 + 8, y0 + 26, x1 - 8, y0 + 84);
        pr(x0 + 22, y0 + 44, x1 - 70, y0 + 66, dim);
        fr(x0, y0 + 102, x0 + 116, y1);
        fr(x0 + 128, y0 + 102, x1, y1);
        pr(x0 + 12, y0 + 114, x0 + 104, y1 - 12, dim2);
        pr(x0 + 140, y0 + 124, x1 - 12, y1 - 12, dim2);
        // the selection box around the large artboard, with its handles
        if (lit > 0) {
          cVec.globalAlpha = lit * gate;
          frameRect(cVec, x0, y0 + 18, x1, y0 + 92, WHITE, lit * gate);
          cVec.fillStyle = WHITE;
          [[x0 + 1, y0 + 19], [x1 - 1, y0 + 19], [x0 + 1, y0 + 91], [x1 - 1, y0 + 91]].forEach(([hx, hy]) => cVec.fillRect(hx - 4, hy - 4, 8, 8));
          cVec.globalAlpha = 1;
        }
      }
    }
  }
  function sceneSurf6(t) {
    if (!on(t, T.c6, T.c8)) return;
    // the figure: both lines rise on "up"; the count runs $10 to $2,000 in steps of $10 to "thousand"
    heading('f6', t, FIG6_T, 0);
    const n = 10 * Math.round(lerp(1, 200, clamp01((t - FIG6_T) / (COUNT_END - FIG6_T))));
    const s = n.toLocaleString('en-US');
    const el = $('n2000');
    if (el.textContent !== s) el.textContent = s;
    // the credits bar: a lit stretch of Kevin's light, 640 px down the normal and 100 px back along
    // the shafts, chosen so that no part of the bar falls under 0.55 tone while it drifts
    if (t >= BAR_T) {
      lightWindow(BAR.x0, BAR.y0, BAR.x1, BAR.y1, ss(BAR_T, BAR_T + BAR_D, t), 12 * (t - BAR_T), 640, -100);
      objZone(BAR.x0, BAR.y0, BAR.x1, BAR.y1, 1);
    }
    // the stems, the plates, their drawings, labels and rows
    PLATES.forEach((p, k) => {
      const t0 = STEM_T + STEM_APART * k; // v8: the stem 0.15 s ahead of "localize", its plate's outline from +0.175
      const r0 = SURF_T + STEM_APART * k; // the English row on "surface" (v6's time)
      if (t < t0) return;
      const stem = poly([[p.cx, BAR.y1], [p.cx, p.y0]]);
      cross(p.cx, BAR.y1);
      // on "more" a screen-gold pulse runs from the bar down the stem (v1's),
      // the stems 42 ms apart from the left, and the plate's outline draws
      // again in white as the pulse reaches it
      const m0 = MORE_T + STEM_APART * k;
      const f = (t - m0) / MORE_D;
      const front = f * (stem.len + 120);
      dline(stem, stem.len * prog(t, t0, 0.21, 'expo.out'), f > 0 && front - 120 < stem.len ? [front - 120, front] : null);
      objZone(p.cx - 4, BAR.y1, p.cx + 4, p.y0, 1);
      // the plate: a 2 px straw outline that draws out of its top-left corner as the stem lands
      const pu = prog(t, t0 + 0.175, 0.21, 'power3.out');
      if (pu > 0) {
        drawRectOut(p.x0, p.y0, p.x1 - 2, p.y1 - 2, pu, STRAW, 2);
        const mu = prog(t, m0 + (MORE_D * stem.len) / (stem.len + 120), MORE_LINE, 'power3.out');
        if (mu > 0) drawRectOut(p.x0, p.y0, p.x1 - 2, p.y1 - 2, mu, WHITE, 2);
        plateDraw(p, k, t, pu);
        // v8: its light clears evenly over the outline's draw (in v7 it
        // cleared at full weight on the outline's first frame and cut the
        // lower-left gold shaft in one frame)
        objZone(p.x0, p.y0, p.x1, p.y1, ss(t0 + 0.175, t0 + 0.175 + 0.21, t));
        // its row: its own interface string in English, stepping by tone to the plate's language on its word
        const pt0 = PLATE_T[k];
        const step = ss(pt0 + 0.245, pt0 + 0.49, t);
        if (step > 0) showText('pe' + k, step, true);
        else showText('pe' + k, ss(r0 + 0.21, r0 + 0.42, t));
        showText('pt' + k, step);
        // its label rises at its top-left on its word
        riseText('pl' + k, prog(t, pt0 + 0.035, 0.35, 'expo.out'));
      }
    });
  }

  // Line 8: the app page, in English at the cut on "product", then Spanish,
  // French and Japanese on "exist", "every" and "language" (v2's steps at 0.7
  // of their durations: the box 0.28 s, the old string out over 0.084, the new
  // in over 0.14 from +0.07).
  const LEAD = 0.07; // a box that grows leads its label by this much
  function langAt(t) {
    let i = -1;
    for (let k = 0; k < CHANGES.length; k++) if (t >= CHANGES[k][0] - LEAD) i = k;
    if (i < 0) return { c: -1, from: 'en', to: 'en', outA: 0, inA: 1, inY: 0, t };
    const [c, from, to] = CHANGES[i];
    const inP = EASE['power2.out'](clamp01((t - (c + 0.07)) / 0.14));
    return { c, from, to, outA: 1 - clamp01((t - c) / 0.084), inA: inP, inY: 4 * (1 - inP), t };
  }
  // a slot's box width: growing, it runs ahead of the new label; shrinking, it follows the old label out
  function slotW(map, s) {
    const a = map[s.from], b = map[s.to];
    if (s.from === s.to) return b;
    const p = b > a ? EASE['power2.inOut'](clamp01((s.t - (s.c - LEAD)) / 0.28)) : EASE['power2.inOut'](clamp01((s.t - (s.c + 0.035)) / 0.28));
    return lerp(a, b, p);
  }
  // On the held chord the page leaves by tone (CARD_OUT) while the card's light
  // and lockup arrive in the same Bayer order (sceneCard).
  function sceneApp8(t) {
    if (!on(t, T.c8, T.card + CARD_OUT)) return;
    const lv = t >= T.card ? (t - T.card) / CARD_OUT : 0;
    const A = APP;
    objZone(A.x0, A.y0, A.x1, A.y1, 1 - clamp01(lv));
    frameRect(cVec, A.x0, A.y0, A.x1, A.y1, STRAW, 1);
    // the top bar
    cVec.fillStyle = STRAW;
    cVec.fillRect(A.x0, BAR8.rule, A.x1 - A.x0, 2);
    cVec.fillRect(200, BAR8.mid - 16, 32, 32);
    cVec.fillRect(256, BAR8.mid - 5, 96, 10);
    cVec.fillRect(372, BAR8.mid - 5, 120, 10);
    cVec.fillRect(512, BAR8.mid - 5, 84, 10);
    // the summary bars
    cVec.fillRect(200, 512, 620, 10);
    cVec.fillRect(200, 534, 420, 10);
    // three stat cards, each with two bars
    [200, 717, 1234].forEach((x) => {
      frameRect(cVec, x, 566, x + 486, 674, STRAW, 1);
      cVec.fillStyle = STRAW;
      cVec.fillRect(x + 24, 594, 120, 10);
      cVec.fillRect(x + 24, 620, 220, 24);
    });
    const s = langAt(t);
    // the selector: its box's left edge tracks its label; the chevron (2.2x, for the 44 px label) sits 14 px after it
    const sw = slotW(AW.s, s);
    frameRect(cVec, Math.round(SEL.labelRight - sw - SEL.pad), SEL.y0, SEL.right, SEL.y1, STRAW, 1);
    cVec.save();
    cVec.translate(SEL.labelRight + 14 - 4.22 * 2.2, BAR8.mid - 8.4 * 2.2);
    cVec.scale(2.2, 2.2);
    cVec.fillStyle = WHITE;
    cVec.fill(CHEVRON);
    cVec.restore();
    // the button: white fill, its width tracks its label
    const bw = slotW(AW.b, s);
    cVec.fillStyle = WHITE;
    cVec.fillRect(BTN.x0, BTN.y0, Math.round(bw + 2 * BTN.pad), BTN.y1 - BTN.y0);
    // the strings: the old one fades out, the new one fades in and rises 4 px
    LANGS.forEach((L) => {
      const a = (L === s.to ? s.inA : 0) + (L === s.from && s.from !== s.to ? s.outA : 0);
      const y = L === s.to && s.from !== s.to ? s.inY : 0;
      ['ah-', 'as-', 'ab-'].forEach((pre) => {
        const tx = TXT[pre + L];
        const el = tx.el;
        if (a <= 0) {
          el.style.visibility = 'hidden';
          return;
        }
        el.style.visibility = 'visible';
        el.style.clipPath = lv > 0 ? cellPath(tx.x0, tx.y0, tx.x1, tx.y1, tx.left, tx.top, lv, true) : 'none';
        el.style.opacity = String(clamp01(a));
        el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      });
    });
    // the page's lines keep only the cells whose threshold is at or over lv
    if (lv > 0) leaveByTone(cVec, lv);
  }

  function sceneCard(t) {
    const card = $('card');
    if (t < T.card) {
      card.style.visibility = 'hidden';
      return;
    }
    card.style.visibility = 'visible';
    const ct = t - T.card;
    // a tone mix on the held chord: as the app page leaves, the lockup prints
    // in Bayer order, in reading order (Slash, x, GT, 0.04 s apart, 0.35 s each)
    const pS = clamp01((ct - CARD_LOCK) / CARD_PRINT);
    const pX = clamp01((ct - CARD_LOCK - 0.04) / CARD_PRINT);
    const pG = clamp01((ct - CARD_LOCK - 0.08) / CARD_PRINT);
    // (all three are complete at CARD_LOCK + 0.43 = 0.50, before CARD_LAND)
    cCard.clearRect(0, 0, W, H);
    printCached(cCard, MARKS.slashEnd, pS);
    printCached(cCard, MARKS.xEnd, pX);
    printCached(cCard, MARKS.gtEnd, pG);
    // then the title and the link rise out of their masks (expo.out), all landed by CARD_LAND
    const riseLine = (id, at) => {
      const u = prog(ct, at, CARD_LAND - at, 'expo.out');
      $(id).firstElementChild.style.transform = `translate3d(0, ${((1 - u) * 100).toFixed(2)}%, 0)`;
    };
    riseLine('cardT1', CARD_OUT);
    riseLine('cardT2', CARD_OUT + 0.028);
    riseLine('cardL', CARD_OUT + 0.08);
  }

  /* ================= RENDER ================= */
  function render(t) {
    if (!READY) return;
    ZONES = [];
    WINDOWS = [];
    picClear();
    cDots.clearRect(0, 0, W, H);
    cVec.clearRect(0, 0, W, H);
    cMarks.clearRect(0, 0, W, H);
    for (const key in LN) {
      const L = LN[key];
      L.el.style.opacity = '0';
      if (L.clipped) {
        L.el.style.clipPath = 'none';
        L.clipped = false;
      }
    }
    $('plus').style.opacity = '0';
    hideText();
    // the opener is DOM: it hides itself for every time after the cut, so it
    // is called for every frame (a seek straight past the card left it shown)
    sceneOpen(t);
    if (t < T.card) {
      sceneGlobe(t);
      sceneLock3(t);
      sceneSurf6(t);
    }
    sceneApp8(t);
    sceneCard(t);
    picFlush();
    drawField(t);
  }

  /* ================= TIMELINE (registered by index.html's inline script) ================= */
  window.GTFilm = { render, END };
  const nowT = () => (window.__timelines && window.__timelines.main ? window.__timelines.main.time() : 0);
  window.__render = render;
  window.__dbg = { T, CUE, EV, ZONES: () => ZONES, MARKS, INK, LN, EC, SEAT, CP, SHEEN, TXT, ROUTES, BLOCKS, AW, MIX3, LOCK_DONE, SW0, STEP0, FIG1_T, ROUTE_STEP, PULSE0, CARD_MIX, CARD_OUT, CARD_LOCK, CARD_LAND, onScreen, toView, globeClock, originAt, MOVE_T0, OPEN_T1: () => OPEN_T1, CARD_GONE: () => CARD_GONE, cardAt, cardCorners, frontAt, cardHidden, routePts, GL, ORIGIN: () => ORIGIN };

  window.__hf = window.__hf || {};
  window.__hf.buildReady = window.__hf.buildReady || {};
  const face = new FontFace(FACE, 'url(lib/fonts/InterCanvas.woff2)', { weight: '100 900' });
  document.fonts.add(face);
  const imgs = Array.from(document.querySelectorAll('#assets img, #opener img')).map((im) => (im.complete && im.naturalWidth ? Promise.resolve() : new Promise((res) => { im.onload = res; im.onerror = res; })));
  // the page's face is var(--font) (kit/tokens.css); load it by its computed family, never by a literal name
  const fam = getComputedStyle(document.querySelector('#heads .ln')).fontFamily;
  const ready = Promise.all([face.load(), document.fonts.load('500 120px ' + fam), document.fonts.load('400 40px ' + fam), ...imgs])
    .then(() => document.fonts.ready)
    .then(() => {
      build();
      render(nowT());
      window.__filmReady = true;
    })
    .catch((e) => {
      window.__filmError = String((e && e.stack) || e);
      console.error(window.__filmError);
    });
  window.__hf.buildReady.film = ready;
  return window.GTFilm;
};
