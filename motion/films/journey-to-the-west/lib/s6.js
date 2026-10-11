/*
 * Scene 6 · the chapter 4 text · 弼馬溫 over 避馬瘟 (SCRIPT-v2 lines 7 to 10).
 *
 * A box draws round the printed 弼馬溫 on the reader's 弼 and the type lands on
 * it. Between the reader's two readings the plate lowers to a third, 弼馬溫
 * travels to the top row, a copy drops to the bottom row and becomes 避馬瘟:
 * 溫's 氵 slides out and turns to tint while 疒 slides in over the same 昷, and
 * 弼 gives way to 避; 馬 never moves. One reading, bì mǎ wēn, is typed between
 * the rows as the swap lands, and the reader says it again under 避馬瘟.
 * "ward off horse plague" is typed under 避馬瘟 on the narrator's words. Then
 * the line that makes the joke: the horse manual quoted in the 本草綱目,
 * 「馬廄畜母猴，辟馬瘟疫」, is typed in the lower band; a box draws round 母猴
 * with "macaque" under it on "macaque", and on "job" a hairline runs from that
 * box up to the 弼馬溫 row.
 */
(function () {
  const J = window.JW;
  const { C, E } = J;
  const NFD = (s) => s.normalize('NFD');

  J.scenes.s6 = function (tl, root) {
    const P = J.plate('ch4', 160, 0, 1);
    const creditB = J.credit(root, [J.scan('Chapter 4')], { w: 1300 });
    const art = J.svg(root);
    const pm = { 弼: [1165, 1024, 1225, 1090], 馬: [1162, 1103, 1216, 1180], 溫: [1162, 1190, 1222, 1255] };
    const chs = Object.keys(pm);
    const regs = chs.map((ch) => J.register(ch, pm[ch], P.map, 600));
    const hb = J.hairBox(art, J.inkBox(regs, chs, 600, 8));
    const kn = J.knock(art, J.inkBox(regs, chs, 600, 8));
    const S = 200, GAP = 40, X0 = 640, TOP1 = 120, TOP2 = 470;
    const slot = (i, y) => ({ x: X0 + i * (S + GAP), y, size: S });
    const top = chs.map((ch, i) => {
      const g = J.char(art, ch, 600);
      J.place(g, regs[i]);
      g.setAttribute('opacity', 0);
      return g;
    });
    // The box draws on the reader's 弼 and the type lands as 溫 is said.
    J.drawOn(tl, [hb], E['s6.box'], 0.45);
    J.fade(tl, top, E['s6.land'], 0, 1, 0.2);
    J.fade(tl, [kn], E['s6.land'], 0, 1, 0.2);
    // The plate lowers to a third before the type leaves it.
    const TL = E['s6.lower'];
    tl.fromTo(P.box, { opacity: 1 }, { opacity: J.THIRD, duration: 0.4, ease: 'power2.inOut', immediateRender: false }, TL);
    J.fade(tl, [hb], TL, 1, 0, 0.3);
    J.fade(tl, [kn], TL, 1, 0, 0.4, 'power2.inOut');
    // 弼馬溫 to the top row: the lowest character, which goes farthest, leaves
    // first, so the three never stack while they grow (0.6 s in all).
    const TT = E['s6.travel'];
    top.forEach((g, i) => J.move(tl, g, regs[i], slot(i, TOP1), TT + (2 - i) * 0.05, 0.5));

    // The copy, drawn at the bottom row and dropped into it from the top row.
    const copy = J.el('g', { opacity: 0 }, art);
    const inner = J.el('g', {}, copy);
    // 弼 and 避 each sit in a wrapper that slides, so the slide never touches their placement.
    const bi = J.el('g', {}, inner), vi = J.el('g', { opacity: 0 }, inner);
    [[bi, '弼'], [vi, '避']].forEach(([w, ch]) => {
      const g = J.char(w, ch, 600);
      g.removeAttribute('fill'); // the wrapper's fill reaches the strokes
      J.place(g, slot(0, TOP2));
    });
    const ma = J.char(inner, '馬', 600);
    J.place(ma, slot(1, TOP2));
    const [shui, wen] = J.split('溫', slot(2, TOP2), 600);
    const [ne, wen2] = J.split('瘟', slot(2, TOP2), 600);
    const shuiG = J.el('g', {}, inner);
    shui.forEach((c) => J.el('path', { d: c.d }, shuiG));
    const wenT = J.pairs(inner, wen, wen2, C.ink, 1);
    const neG = J.el('g', { opacity: 0 }, inner);
    ne.forEach((c) => J.el('path', { d: c.d }, neG));
    [bi, vi, ma, shuiG, neG].forEach((g) => g.setAttribute('fill', C.ink));
    const TD = E['s6.drop'];
    J.fade(tl, [copy], TD, 0, 1, 0.001);
    tl.fromTo(copy, { y: TOP1 - TOP2 }, { y: 0, duration: 0.35, ease: 'power3.out', immediateRender: false }, TD);

    // The swap, in 0.5 s. Each differing part slides out downward on a
    // straight path and turns to tint; its replacement comes down the same
    // line from above. The outgoing part is gone (0.15 s) before the incoming
    // one starts (0.18 s), so the two are never on screen together. 馬 never
    // moves, and nothing crosses it.
    const TW = E['s6.swap'], DROP = 130, DO = 0.3, DI = 0.32, LAG = 0.18;
    const out = (g, at) => {
      tl.fromTo(g, { y: 0, fill: C.ink }, { y: DROP, fill: C.tint, duration: DO, ease: 'power2.in', immediateRender: false }, at);
      tl.fromTo(g, { opacity: 1 }, { opacity: 0, duration: 0.15, ease: 'none', immediateRender: false }, at);
    };
    const into = (g, at) => tl.fromTo(g, { y: -DROP, opacity: 0 }, { y: 0, opacity: 1, duration: DI, ease: 'power3.out', immediateRender: false }, at);
    out(bi, TW);
    into(vi, TW + LAG);
    out(shuiG, TW);
    into(neG, TW + LAG);
    J.settle(tl, wenT, TW + LAG, DI, 'power3.out');

    // One reading between the rows: a hairline through each pair, and its syllable.
    const SY = ['bì', 'mǎ', 'wēn'];
    const sylls = [];
    const links = [];
    SY.forEach((s, i) => {
      const cx = X0 + i * (S + GAP) + S / 2;
      links.push(J.line(art, cx, TOP1 + S + 22, cx, TOP1 + S + 38, { w: 1 }), J.line(art, cx, TOP2 - 38, cx, TOP2 - 22, { w: 1 }));
      sylls.push(J.latin(root, NFD(s), { x: cx, base: (TOP1 + S + TOP2) / 2 + 18, size: 54, align: 'center', typed: true }));
    });
    J.drawOn(tl, links, E['s6.syll'], 0.4, 0.04);
    sylls.forEach((s) => J.typeOn(tl, s.letters, E['s6.syll'], 26));
    const RW = 3 * S + 2 * GAP;
    const gloss = J.latin(root, 'ward off horse plague', { x: X0 + RW / 2, base: TOP2 + S + 56, size: 44, italic: true, color: C.label, align: 'center', typed: true });
    J.typeOn(tl, gloss.letters, E['s6.ward'], 26);

    // The line that makes the joke, in the lower band: 「馬廄畜母猴，辟馬瘟疫」
    // (the 本草綱目 quoting a horse manual: keep a macaque in the stable to
    // ward off horse plague). The chapter 4 plate leaves with its credit.
    const TM = E['s6.manual'];
    J.fade(tl, [P.box], TM, J.THIRD, 0, 0.5, 'power2.inOut');
    J.fade(tl, [creditB], TM, 1, 0, 0.3);
    const creditM = J.credit(root, [J.zh('本草綱目') + ' <i>Compendium of Materia Medica</i>, quoting a horse manual'], { w: 1300, style: { opacity: 0 } });
    J.fade(tl, [creditM], TM + 0.1, 0, 1, 0.4);
    const LS = 52, LT = 800;
    const ln = J.html('div', { class: 'han', lang: 'zh-Hant', style: { left: X0 + 'px', top: LT + 'px', fontSize: LS + 'px', color: C.ink } }, root);
    const TEXT = '「馬廄畜母猴，辟馬瘟疫」';
    // 母猴 (the fifth and sixth characters) is set with SP px of extra space
    // after 畜 and after 猴 (fix round), so its box stands 8 px clear of the
    // type on every side: at one em a character the box's left side lay on
    // the right stroke of 畜.
    const SP = 16;
    const spans = Array.from(TEXT).map((ch, i) => J.html('span', { style: Object.assign({ opacity: 0 }, i === 3 || i === 5 ? { marginRight: SP + 'px' } : {}) }, ln, ch));
    spans.forEach((sp, i) => tl.fromTo(sp, { opacity: 0 }, { opacity: 1, duration: 0.001, ease: 'none', immediateRender: false }, TM + i * 0.07));
    // Every character of the line, brackets and comma included, is one em
    // wide in this face; measured once on a canvas, since a scene is not laid
    // out before it is shown.
    const cv = document.createElement('canvas').getContext('2d');
    cv.font = '500 ' + LS + 'px "JW Han"';
    const adv = (t) => cv.measureText(t).width;
    if (Math.abs(adv(TEXT) - TEXT.length * LS) > 1) throw new Error('the horse manual line is not set one em a character: ' + adv(TEXT));
    const x5 = X0 + adv(TEXT.slice(0, 4)) + SP, x6 = X0 + adv(TEXT.slice(0, 6)) + SP;
    const mb = [x5 - 8, LT - 8, x6 + 8, LT + LS + 8];
    const mbox = J.hairBox(art, mb);
    J.drawOn(tl, [mbox], E['s6.macaque'], 0.45);
    const mq = J.latin(root, 'macaque', { x: (mb[0] + mb[2]) / 2, base: mb[3] + 36, size: 30, italic: true, color: C.label, align: 'center', typed: true });
    J.typeOn(tl, mq.letters, E['s6.macaque'] + 0.1, 26);
    // On "job": from the box up into the paper between the gloss and the line,
    // across to the right of the rows, up to the 弼馬溫 row and into it.
    const G = LT - 34, RX = X0 + RW + 60, RY = TOP1 + S / 2;
    const f = (v) => v.toFixed(1);
    const route = J.el('path', { d: `M${f((mb[0] + mb[2]) / 2)},${f(mb[1])}V${f(G)}H${f(RX)}V${f(RY)}H${f(X0 + RW + 10)}`, fill: 'none', stroke: C.ink, 'stroke-width': 1.5, 'stroke-linejoin': 'miter' }, art);
    tl.fromTo(route, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.7, ease: 'power1.inOut', immediateRender: true }, E['s6.job']);
  };
})();
