/*
 * Scene 2 · the cut on "surname" to the end of line 3 · the surname, the
 * signature move (SCRIPT-v2 lines 1 to 3).
 *
 * The chapter 1 naming passage at full tone and 1:1. On "macaque" boxes draw
 * round the printed 猢 and 猻 and the type lands on them; on "animal" the scan
 * falls away and the two characters travel to the middle as the word, and
 * "macaque" is typed under it. Line 2 runs the built moves in the built order:
 * the animal radical lifts off both characters and turns to tint; 胡 turns to
 * tint and is set aside while what remains of 猻 widens into 孫 at the centre;
 * 孫 opens into 子 "boy" and 系 "infant" and closes again; the set-aside parts
 * leave; "Sun" is typed under it on the word. Line 3: ARTHUR WALEY, 1942 rises
 * under "Sun", a hairline bracket draws from under "Sun" on "footnote", and
 * "Monkey" is typed where the bracket ends on the word, with the label
 * "footnote" under it, typed with it.
 *
 * Every component move fits inside the box it is going to, so no stroke is
 * drawn out past its target (lib/jw.js tracks, morphBack). 胡 stays whole.
 */
(function () {
  const J = window.JW;
  const { C, E } = J;

  J.scenes.s2 = function (tl, root) {
    const P = J.plate('naming', 1000, 0, 1);
    const art = J.svg(root);
    const boxes = J.el('g', {}, art);
    const set = J.el('g', {}, art); // what is set aside
    const live = J.el('g', {}, art);

    // Printed ink boxes on the scan (p. 25).
    const RH = J.register('猢', [2969, 692, 3040, 766], P.map, 600);
    const RS = J.register('猻', [2839, 1372, 2920, 1436], P.map, 600);
    const pad = 8;
    const ink = (r, ch) => J.inkBox([r], [ch], 600, pad);
    const bh = J.hairBox(boxes, ink(RH, '猢')), bs = J.hairBox(boxes, ink(RS, '猻'));
    const kn = [J.knock(art, ink(RH, '猢')), J.knock(art, ink(RS, '猻'))];

    // Stage positions.
    const W = 300;
    const A = { x: 960 - W, y: 330, size: W }, B = { x: 960, y: 330, size: W };
    const LIFT = -210; // the radicals rise this far
    const HU = { x: 345, y: 400, size: W }; // 胡, set aside at the left, clear of the radicals
    const SUN = { x: 960 - W / 2, y: 330, size: W }; // 孫 at the centre
    const ZS = 270;
    const ZI = { x: 960 - 14 - ZS, y: 345, size: ZS }, XI = { x: 960 + 14, y: 345, size: ZS };
    // 孫 closed again, 70 px left of the centre, so "Sun", its hairline and
    // Waley's "Monkey" (line 3) fit one row inside the safe area; 胡 has left
    // that paper by then (it stands at x 345 to 645).
    const BX = 890;
    const BIG = { x: BX - 190, y: 190, size: 380 };

    // On "macaque": the boxes, then the type.
    const hu0 = J.char(live, '猢', 600), sun0 = J.char(live, '猻', 600);
    J.place(hu0, RH);
    J.place(sun0, RS);
    hu0.setAttribute('opacity', 0);
    sun0.setAttribute('opacity', 0);
    J.drawOn(tl, [bh], E['s2.boxHu'], 0.45);
    J.drawOn(tl, [bs], E['s2.boxSun'], 0.45);
    J.fade(tl, [hu0, sun0], E['s2.land'], 0, 1, 0.2);
    J.fade(tl, kn, E['s2.land'], 0, 1, 0.2);
    // On "animal" the scan falls away, so it is mostly gone when the word
    // forms, and the two characters travel to the middle as the word 猢猻.
    const TF = E['s2.fall'], T0 = E['s2.travel'];
    J.fade(tl, [P.box], TF, 1, 0, 0.6, 'power2.inOut');
    J.fade(tl, [boxes], TF, 1, 0, 0.3);
    J.fade(tl, kn, TF, 1, 0, 0.6, 'power2.inOut');
    J.move(tl, hu0, RH, A, T0, 0.9);
    J.move(tl, sun0, RS, B, T0 + 0.05, 0.9);
    const mac = J.latin(root, 'macaque', { x: 960, base: 330 + W + 62, size: 54, italic: true, color: C.label, align: 'center', typed: true });
    J.typeOn(tl, mac.letters, E['s2.macaque'], 26);

    // "Without the animal part": the animal radical lifts off both characters.
    const TL = E['s2.lift'];
    const [huRad, huRest] = J.split('猢', A, 600);
    const [sunRad, sunRest] = J.split('猻', B, 600);
    const rad = J.el('g', {}, set);
    const radPaths = [...huRad, ...sunRad].map((c) => J.el('path', { d: c.d, fill: C.ink, opacity: 0 }, rad));
    const restHu = huRest.map((c) => J.el('path', { d: c.d, fill: C.ink, opacity: 0 }, live));
    const restSun = sunRest.map((c) => J.el('path', { d: c.d, fill: C.ink, opacity: 0 }, live));
    J.show(tl, [hu0, sun0], TL, false);
    J.show(tl, [...radPaths, ...restHu, ...restSun], TL, true);
    const radH = radPaths.slice(0, huRad.length), radS = radPaths.slice(huRad.length);
    tl.fromTo(radH, { y: 0, fill: C.ink }, { y: LIFT, fill: C.tint, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, TL);
    tl.fromTo(radS, { y: 0, fill: C.ink }, { y: LIFT, fill: C.tint, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, TL + 0.06);

    // "the second character": 胡 turns to tint and is set aside at the left with
    // the radicals; what remains of 猻 widens into 孫 at the centre.
    const TS = E['s2.aside'];
    const huT = J.tracks(set, huRest, J.contours('胡', HU, 600), C.ink);
    const sunT = J.tracks(live, sunRest, J.contours('孫', SUN, 600), C.ink);
    J.show(tl, restHu, TS, false);
    J.show(tl, restSun, TS, false);
    J.show(tl, [...huT, ...sunT], TS, true);
    J.morph(tl, huT, TS, 0.8);
    J.morph(tl, sunT, TS, 0.8);
    tl.fromTo(huT.map((t) => t.el), { fill: C.ink }, { fill: C.tint, duration: 0.4, ease: 'power2.out', immediateRender: false }, TS);
    const huB = J.bbox(huRad), suB = J.bbox(sunRad);
    tl.fromTo(radH, { x: 0 }, { x: 160 - huB[0], duration: 0.6, ease: 'power2.inOut', immediateRender: false }, TS);
    tl.fromTo(radS, { x: 0 }, { x: 160 + (huB[2] - huB[0]) + 14 - suB[0], duration: 0.6, ease: 'power2.inOut', immediateRender: false }, TS + 0.05);
    // "macaque" glosses the word 猢猻, so it leaves when the word is broken.
    J.fade(tl, [mac.e], TS, 1, 0, 0.5);

    // "leaves": 孫 opens into 子 and 系.
    const TO = E['s2.open'];
    const [zi, xi] = J.split('孫', SUN, 600);
    const openT = [...J.tracks(live, zi, J.contours('子', ZI, 600)), ...J.tracks(live, xi, J.contours('系', XI, 600))];
    J.show(tl, sunT, TO, false);
    J.show(tl, openT, TO, true);
    J.morph(tl, openT, TO, 0.8);
    const gl = (txt, r) => J.latin(root, txt, { x: r.x + r.size / 2, base: r.y + r.size + 66, size: 54, italic: true, color: C.label, align: 'center', typed: true });
    const boy = gl('boy', ZI), inf = gl('infant', XI);
    J.typeOn(tl, boy.letters, E['s2.boy'], 26);
    J.typeOn(tl, inf.letters, E['s2.infant'], 26);

    // "so": 子 and 系 close into 孫, the opening move played backwards.
    const TC = E['s2.close'];
    const [bz, bx] = J.split('孫', BIG, 600);
    const closeT = [...J.tracks(live, bz, J.contours('子', ZI, 600), C.ink), ...J.tracks(live, bx, J.contours('系', XI, 600), C.ink)];
    J.show(tl, openT, TC, false);
    J.show(tl, closeT, TC, true);
    J.morphBack(tl, closeT, TC, 0.9);
    // The set-aside parts leave, and the glosses with them.
    J.fade(tl, [set, boy.e, inf.e], E['s2.leave'], 1, 0, 0.5);

    // "Sun" under 孫 on the word.
    const SB = BIG.y + BIG.size + 150;
    const sun = J.latin(root, 'Sun', { x: BX, base: SB, size: 160, align: 'center', typed: true });
    J.typeOn(tl, sun.letters, E['s2.sun'], 14);

    // Line 3: Waley's footnote. One tag under "Sun", one hairline from it, and
    // the one word "Monkey" at the hairline's end, with the label "footnote".
    // The tag and the label stand 86 px under the baseline, so the hairline
    // has its own band between them and the words.
    const LB = SB + 86;
    const tw = J.tag(root, 'Arthur Waley, 1942', { x: BX, base: LB, align: 'center' });
    J.rise(tl, [tw.e], E['s2.tag'], 0.5);
    const HX0 = sun.left + sun.w + 22, HX1 = HX0 + 140;
    const mk = J.latin(root, 'Monkey', { x: HX1 + 22, base: SB, size: 160, typed: true });
    if (mk.left + mk.w > 1800) throw new Error('Monkey runs past the safe area: ' + (mk.left + mk.w));
    // The hairline is a lower bracket (fix round): down from under the n of
    // "Sun", across under the gap, and up to under the M of "Monkey", drawn
    // from "Sun". A straight line on the baseline between the words read as
    // a blank to fill in.
    const XA = sun.left + sun.w - J.width('n', 160) / 2, XB = mk.left + J.width('M', 160) / 2;
    const Y0 = SB + 12, Y1 = SB + 32;
    const hair = J.el('path', { d: `M${XA.toFixed(1)},${Y0}V${Y1}H${XB.toFixed(1)}V${Y0}`, fill: 'none', stroke: C.ink, 'stroke-width': 1.5, 'stroke-linejoin': 'miter' }, art);
    J.drawOn(tl, [hair], E['s2.hair'], 0.6);
    J.typeOn(tl, mk.letters, E['s2.monkey'], 14);
    const fn = J.latin(root, 'footnote', { x: mk.left + 4, base: LB, size: 36, italic: true, color: C.label, typed: true });
    J.typeOn(tl, fn.letters, E['s2.footnote'], 26);

    // Credits: the naming passage leaves with its scan; Waley's footnote
    // arrives with his tag.
    const c1 = J.credit(root, [J.scan('Chapter 1, the naming passage')], { w: 1300 });
    J.fade(tl, [c1], TF, 1, 0, 0.6, 'power2.inOut');
    const c3 = J.credit(root, ['Arthur Waley, <i>Monkey</i>, 1942, a footnote in chapter VI'], { w: 1300, style: { opacity: 0 } });
    J.fade(tl, [c3], E['s2.tag'], 0, 1, 0.4);
  };
})();
