/*
 * modern-hebrew v2: the twelve pictures (SCRIPT-v2.md). Each writes the frame
 * state for film time t (seconds); lib/film.js applies it. Every time comes
 * from data/cues.js, which sound/tools/mix.py writes from the takes: a cue is
 * the film time of the word a picture event lands on (Q.word), or a line's
 * cut (Q['cut.n05'], the hard cut 0.05 s before its first sound), the cut
 * home (Q.close) or the end. The effects in sound/plan.json sound at the same
 * cues, so a tick sounds when crop marks close, a tap when a letter lands and
 * an impression when the sign registers. The 100 s cut's beats are in
 * archive-100s/lib/beats.js.
 *
 * Grammar:
 *   - a page or card changes only by a hard cut;
 *   - type prints in (0.5 s, out3, rising 14 px); a note that comes with a
 *     hard cut is there on the cut;
 *   - a passage is isolated by sinking the rest of the page to its ghost and
 *     closing crop marks round it (0.8 s, expo.out, 64 px out to 8 px);
 *   - the coinage sign, in rose, is the one object that crosses a cut.
 */
window.MHBeats = function (R) {
  const { k, L, C, toScreen, centre } = window.MHU;
  const D = window.MHDATA;
  const G = R.geo;
  const Q = window.MH_CUES.cues;

  // ---------- helpers ----------
  const show = (S, name, o = 1, extra = {}) => { S.el[name] = { o, ...extra }; };
  const pr = (t, t0, d = 0.5) => k(t, t0, t0 + d, 'out3');
  // type printing in: opacity and a 14 px rise
  const printIn = (S, name, t, t0, mul = 1) => {
    const p = pr(t, t0);
    if (p > 0) show(S, name, p * mul, { dy: 14 * (1 - p) });
  };
  // a note that comes with a hard cut is there on the cut; one that comes
  // later prints in
  const note = (S, id, t, t0, cut = false) => {
    const o = cut ? (t >= t0 ? 1 : 0) : pr(t, t0);
    if (o > 0) S.notes[id] = o;
  };
  // crop marks closing on a box; the tick in sound/plan.json is the close
  const crop = (S, t, tClose, box, o = {}) => {
    const p = k(t, tClose - 0.35, tClose + 0.45, 'outExpo');
    if (p > 0) S.crops.push({ p, ...o, [o.screen ? 'sr' : 'r']: box });
  };
  // the coinage sign drawn over a printed sign: the lifted crop is 50 x 26
  // scan px round an ink box 42 px wide; scale it to another printing's box
  const signOn = (cam, ink, inkW0 = 42) => {
    const [cx, cy] = toScreen(cam, ...centre(ink));
    return { cx, cy, w: 50 * ((ink[2] - ink[0]) / inkW0) * cam.s };
  };
  const BIG = 640; // the lifted sign's width at the centre of the window

  // ---------- the pictures' bounds ----------
  const T = {
    title: 0,
    card1: Q['cut.n02'],
    card2: Q['cut.n05'],
    compose: Q['cut.n06'],
    titleBack: Q['cut.n07'],
    key: Q.this,
    p110: Q['cut.n08'],
    bicycle: Q.aword,
    ezek: Q['cut.n09'],
    p1806: Q.poet,
    tomato: Q['cut.n12'],
    home: Q.close,
    end: Q.end,
  };

  // ---------- cameras ----------
  const CAM = {
    // the open: מִלּוֹן at 1.5 times the scan, centred in the window (SCRIPT-v2, Visual changes 6)
    title: C('v1-n12', (D.title.milon[0] + D.title.milon[2]) / 2, (D.title.milon[1] + D.title.milon[3]) / 2, 1.5),
    key: C('v1-n16', 1551, 2080, 0.92),
    // p. 110 at the scale of the registration, the headword and its sign in the window
    p110: C('v1-n131', 1000, 790, 1.6),
    // p. 1806: one steady frame at 1.6 (the most SCRIPT-v2 allows), holding
    // the sense line's printed sign and the line with Elektrizität; électricité
    p1806: C('v4-n408', 2250, 2525, 1.6),
  };

  // the title page: the page as its ghost, only the first word in ink
  const titlePage = (S, ghostA, wordO) => {
    S.cam = CAM.title;
    S.base = 'ghost';
    S.ghostA = ghostA;
    S.veil = null;
    S.inks = [{ id: 'milon', o: wordO }]; // the word's ink alone (tools/inkcut.py), so no paper edge shows
  };

  const ROW = D.key.rows[3];

  return [
    { // 1 · The title page · 0 to the cut to card 1
      t0: T.title, t1: T.card1, f(_, S, t) {
        // the word prints in (0.0 to 0.6), the ghost page round it (1.2 to 2.2); the camera holds
        titlePage(S, k(t, 1.2, 2.2, 'io2'), k(t, 0.0, 0.6, 'out3'));
        note(S, 'n1', t, 0.3);
      },
    },
    { // 2 · card 1: בתי עיניים and ספר מלים struck, Wörter and buch
      t0: T.card1, t1: T.card2, f(_, S, t) {
        show(S, 'sefer');
        // the first row prints on the cut; it sinks to the ghost tone on "such copies"
        const sink = k(t, Q.such, Q.such + 0.6, 'io2');
        const ghostO = L(1, 0.15, sink); // ink at 0.15 on the paper is the plates' ghost tone
        const pb = pr(t, T.card1);
        if (pb > 0) show(S, 'sefer.batei', pb * ghostO, { dy: 14 * (1 - pb) });
        const pg = pr(t, Q.phrases);
        if (pg > 0) show(S, 'sefer.bateiGloss', pg * ghostO, { dy: 14 * (1 - pg) });
        // the second row on "dictionary", its sentence on "sefer"
        printIn(S, 'sefer.he', t, Q.dictionary);
        printIn(S, 'sefer.gloss', t, Q.sefer);
        // the German halves on "German", their hairlines draw up to the Hebrew
        printIn(S, 'sefer.wort', t, Q.german);
        printIn(S, 'sefer.buch', t, Q.german + 0.06);
        const hp = k(t, Q.german + 0.12, Q.german + 0.62, 'outExpo');
        if (hp > 0) {
          const ln = [G.german.top, L(G.german.top, G.german.bot, hp)];
          show(S, 'sefer.hairM', 1, { ln });
          show(S, 'sefer.hairS', 1, { ln });
        }
        // the strike crosses ספר מלים right to left on "such copies"
        const st = k(t, Q.such, Q.such + 0.6, 'io2');
        if (st > 0) show(S, 'sefer.strike', 1, { rect: [L(G.strike.x1, G.strike.x0, st), G.strike.x1] });
        note(S, 'n2', t, Q.in1880);
      },
    },
    { // 3 · card 2: מִלָּה + ־וֹן = מִלּוֹן
      t0: T.card2, t1: T.compose, f(_, S, t) {
        note(S, 'n2', t, T.card2, true);
        show(S, 'milon');
        show(S, 'milon.r0'); // the cut lands on מִלָּה and its sentence
        printIn(S, 'milon.r1', t, T.card2 + 0.35);
        const sp = k(t, Q.made5, Q.made5 + 0.4, 'io2'); // the sum rule on "made"
        if (sp > 0) show(S, 'milon.sum', 1, { rect: [L(G.sum.x1, G.sum.x0, sp), G.sum.x1] });
        printIn(S, 'milon.r2', t, Q.milon); // on "milon"
      },
    },
    { // 4 · the composing card: מַקְטֵל, the root ק־ל־ע, מַקְלֵעַ
      t0: T.compose, t1: T.titleBack, f(_, S, t) {
        note(S, 'n2', t, T.compose, true);
        show(S, 'maktel');
        show(S, 'maktel.rail');
        // crop marks close round the pattern's מ on "mem"
        crop(S, t, Q.mem + 0.1, G.mem, { screen: true, pad: 10, len: 18, o: 1 - k(t, Q.made6, Q.made6 + 0.4, 'io2') });
        printIn(S, 'maktel.model', t, Q.tool); // the model on "tool"
        // on "made" the letters drop 0.25 s apart; each lands on its tap
        const land = [Q.made6 + 0.3, Q.made6 + 0.55, Q.made6 + 0.8];
        // on "sling" the tray's cells draw and ק ל ע print into them, with the
        // root's sentence; the empty cells fade out over 0.3 s after the third tap
        const cellsOut = 1 - k(t, land[2], land[2] + 0.3, 'io2');
        for (let i = 0; i < 3; i++) {
          const p = pr(t, Q.sling + 0.08 * i) * cellsOut;
          if (p > 0) { show(S, 'maktel.tray', 1); show(S, `maktel.cell${i}`, p * 0.55); }
        }
        printIn(S, 'maktel.rootGloss', t, Q.sling + 0.1);
        const sink = k(t, Q.root, Q.root + 0.6, 'in2'); // the stand-ins sink on "root"
        const drop = land.map((x) => k(t, x - 0.3, x + 0.4, 'outExpo'));
        const done = Q.made6 + 1.8;
        if (t < Q.root) {
          show(S, 'maktel.rest'); // the cut lands on the pattern
        } else if (t < done) {
          show(S, 'maktel.build');
          S.build.maktel = {
            sink,
            drop0: drop[0], drop1: drop[1], drop2: drop[2],
            settle: k(t, land[0] - 0.1, land[0] + 1.1, 'io2'),
            patah: k(t, land[2], land[2] + 0.6, 'out3'),
            tray: [0, 1, 2].map((i) => pr(t, Q.sling + 0.06 * i)),
            trayRise: true,
          };
        } else {
          show(S, 'maktel.result');
        }
        printIn(S, 'maktel.g1', t, Q.made6); // under the rail, on "made"
      },
    },
    { // 5 · the title page again, framed as at the open
      t0: T.titleBack, t1: T.key, f(_, S, t) {
        titlePage(S, 1, 1);
        note(S, 'n3', t, T.titleBack, true);
      },
    },
    { // 6 · the key of signs: the sign, its row, the lift
      t0: T.key, t1: T.p110, f(_, S, t) {
        S.cam = CAM.key;
        note(S, 'n3', t, T.key, true);
        const lift = k(t, Q.accepted, Q.accepted + 1.0, 'io3');
        const keep = 1 - k(t, Q.accepted, Q.accepted + 0.6, 'io2');
        // the coinage row rises from ghost to ink right to left under
        // "words he coined that people had already accepted"
        const xs = D.key.signCoin[0] - 4;
        const xe = ROW[0] - 8;
        const sw = k(t, Q.words, Q.accepted, 'io2');
        S.veil = {
          v: 0.92 + 0.08 * k(t, Q.accepted, Q.accepted + 0.6),
          holes: [
            { r: D.key.signCoin, o: keep }, // the printed sign stays in ink from the cut
            { r: ROW, o: keep, sweep: t < Q.words ? ROW[2] + 80 : L(xs, xe, sw), soft: 64 },
          ],
        };
        // rose crop marks with vertical arms only close on the printed sign on "sign"
        crop(S, t, Q.sign + 0.1, D.key.signCoin, { col: 'rose', pad: 12, len: 14, vOnly: true, o: keep });
        // the lift: a rose copy of the printed sign rises off the page to the centre
        if (t >= Q.accepted) {
          const from = signOn(S.cam, D.key.signCoin);
          S.sign = { cx: L(from.cx, 960, lift), cy: L(from.cy, 520, lift), w: from.w * Math.pow(BIG / from.w, lift), o: k(t, Q.accepted, Q.accepted + 0.15) };
        }
      },
    },
    { // 7 · p. 110: the sign comes down on the bicycle
      t0: T.p110, t1: T.bicycle, f(_, S, t) {
        S.cam = CAM.p110;
        S.head = { r: 'אופן', l: 'אוץ' };
        note(S, 'n3', t, T.p110, true);
        // the headword isolated on "bicycle"
        const iso = k(t, Q.bicycle, Q.bicycle + 0.6, 'out3');
        S.veil = { v: 0.92 * iso, holes: [{ r: D.p110.head, o: 1 }] };
        crop(S, t, Q.bicycle + 0.3, D.p110.head, { pad: 10 });
        // the lifted sign holds at the centre, comes down on "stands" and
        // registers on the printed sign (the impression, stands + 0.6)
        const down = k(t, Q.stands, Q.stands + 0.6, 'io3');
        const at = signOn(S.cam, D.p110.sign);
        S.sign = { cx: L(960, at.cx, down), cy: L(520, at.cy, down), w: BIG * Math.pow(at.w / BIG, down), o: 1 };
      },
    },
    { // 8 · the bicycle card: אוֹפָן and the ending for pairs, on the model of אָזְנַיִם
      t0: T.bicycle, t1: T.ezek, f(_, S, t) {
        note(S, 'n4', t, T.bicycle, true);
        show(S, 'ofan');
        show(S, 'ofan.rail');
        show(S, 'ofan.model'); // the cut lands on the model, the word and the ending
        show(S, 'ofan.g0');
        const two = Q.two;
        if (t < two) {
          show(S, 'ofan.src');
          show(S, 'ofan.end');
        }
        // on "two wheels": the ו and its holam lift out, פ closes up as its qamats
        // falls and a shva rises, a qamats rises under the א; ן turns into נ as
        // the ending docks on the tap (two + 0.6)
        const leave = k(t, two, two + 0.5, 'in2');
        const settle = k(t, two + 0.15, two + 0.65, 'io2');
        const dock = k(t, two + 0.4, two + 1.0, 'outExpo');
        if (t >= two && t < two + 1.2) {
          show(S, 'ofan.build');
          S.build.ofan = { leave, settle, dock };
        } else if (t >= two + 1.2) {
          show(S, 'ofan.result');
        }
        printIn(S, 'ofan.g1', t, two + 0.8); // אָפְנַיִם stands
        // on "ears" a hairline joins the model's ending to the bicycle's
        const hp = k(t, Q.ears, Q.ears + 0.5, 'outExpo');
        if (hp > 0) {
          const e = G.ears;
          show(S, 'ofan.ears', 1, { x2: L(e.x0, e.x1, hp), y2: L(e.y0, e.y1, hp) });
        }
      },
    },
    { // 9 · Ezekiel 1:4: חשמל, and ἤλεκτρον
      t0: T.ezek, t1: T.p1806, f(_, S, t) {
        note(S, 'n5', t, T.ezek, true);
        show(S, 'ezek');
        show(S, 'ezek.he'); // the cut lands on the clause and the sentence
        show(S, 'ezek.en');
        const rp = k(t, Q.khashmal, Q.khashmal + 0.6, 'io2'); // the underline on "khashmal"
        if (rp > 0) show(S, 'ezek.rule', 1, { rect: [L(G.ezek.w1, G.ezek.w0, rp), G.ezek.w1] });
        printIn(S, 'ezek.greek', t, Q.greek); // on "Greek"
      },
    },
    { // 10 · vol. 4, p. 1806: the sign comes down, finds another sign, withdraws
      t0: T.p1806, t1: T.tomato, f(_, S, t) {
        S.cam = CAM.p1806;
        S.head = { r: 'חשמל', l: 'חשמן' };
        note(S, 'n6', t, T.p1806, true);
        // the sense line from its printed ⁘ to the last whole word inside the
        // window (גופים), and Elektrizität; électricité
        S.veil = { v: 0.92, holes: [{ r: D.p1806.senseIso, o: 1 }, { r: D.p1806.german, o: 1 }] };
        // on "mark" the rose sign comes down from above the frame toward the
        // place before the sense and stops short in the gap over the line, as
        // rose crop marks with vertical arms close on the printed sign (the
        // tick, no impression); on "his own" it withdraws upward. The sign
        // stands over the passage, so the note's number goes under the
        // lower-right arm, 10 px clear of it.
        crop(S, t, Q.mark + 0.1, D.p1806.signBand, { col: 'rose', num: '6', numAt: 'belowRight', pad: 6, len: 12, vOnly: true });
        if (t >= Q.mark - 0.35) {
          const at = toScreen(S.cam, ...centre(D.p1806.sign));
          // vol. 4 is scanned about 1.27 times as densely as vol. 1
          const w1 = 50 * 1.27 * S.cam.s;
          // the gap between ערבות (its ghost ends near y 280 on screen) and the
          // crop marks' upper arms (from y 330): the sign's ink, 38 px tall,
          // ends 10 px above the arms
          const y1 = toScreen(S.cam, 0, 2388)[1];
          const w0 = 3 * w1;
          const y0 = 132 - 0.4 * w0;
          const p = k(t, Q.mark - 0.35, Q.mark + 0.3, 'io3') * (1 - k(t, Q.hisown, Q.hisown + 0.8, 'in2'));
          S.sign = { cx: at[0], cy: L(y0, y1, p), w: w0 * Math.pow(w1 / w0, p), o: 1 };
        }
      },
    },
    { // 11 · the tomato card: עַגְבָנִיָּה against בַּדּוּרָה
      t0: T.tomato, t1: T.home, f(_, S, t) {
        note(S, 'n7', t, T.tomato, true);
        show(S, 'tomato');
        show(S, 'tomato.he'); // the cut lands on the word, its root in ink
        printIn(S, 'tomato.gloss', t, Q.agvaniya); // on "agvaniya"
        printIn(S, 'tomato.root', t, Q.desire); // on "desire"
        // בַּדּוּרָה on "Ben-Yehuda"; it sinks to the ghost tone on "Today"
        const sinkB = k(t, Q.today, Q.today + 0.6, 'io2');
        const pb = pr(t, Q.benyehuda13);
        if (pb > 0) show(S, 'tomato.badura', pb * L(1, 0.15, sinkB), { dy: 14 * (1 - pb) });
        // rose crop marks close on the empty place before the word on "kept it out", and stay
        crop(S, t, Q.kept + 0.1, G.tomatoPlace, { col: 'rose', screen: true });
      },
    },
    { // 12 · the sign goes home: the key, the row in ink, the sign registers
      t0: T.home, t1: T.end + 0.01, f(_, S, t) {
        S.cam = CAM.key;
        S.veil = { v: 0.94, holes: [{ r: ROW, o: 1 }] };
        // the cut lands on the sign as the lift left it, at its lifted size in
        // the centre of the window; it comes down and shrinks onto the printed
        // sign in its row, as on p. 110, and registers on the impression
        // (close + 0.8 in sound/plan.json)
        const at = signOn(S.cam, D.key.signCoin);
        const down = k(t, T.home, T.home + 0.8, 'io3');
        S.sign = { cx: L(960, at.cx, down), cy: L(520, at.cy, down), w: BIG * Math.pow(at.w / BIG, down), o: 1 };
      },
    },
  ];
};
