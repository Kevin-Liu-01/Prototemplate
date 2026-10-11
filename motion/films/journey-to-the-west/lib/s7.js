/*
 * Scene 7 · 心猿, then Hu Shih (SCRIPT-v2 lines 11 and 12).
 *
 * A (to the cut after line 11): the contents of the oldest surviving edition
 * round chapter 14, at the left. On "chapter titles" a box draws round 心猿
 * and the type lands on it; the scan falls away and 心猿 turns from the print's
 * vertical line into a row where it stands, at the left of the frame; "mind-
 * monkey" is typed under it on the word.
 * B (from the cut to the close): Hu Shih's photograph of 1939 at the right
 * half of the frame, pushed slowly from 1.00 to 1.03. 心猿 and "mind-monkey"
 * stay on the paper at the left through the cut, untouched: not tinted and
 * not struck, so the frame sets the two readings side by side and takes no
 * side. "胡適 Hu Shih" is typed on his name, and "introduction to Monkey, New
 * York, 1943" on "introduced". His 1943 introduction is in copyright, so the
 * narrator paraphrases it and nothing of it is quoted on screen.
 */
(function () {
  const J = window.JW;
  const { C, E } = J;

  J.scenes.s7 = function (tl, root) {
    const A = root.querySelector('.part.a');
    const B = root.querySelector('.part.b');

    // ---- A · chapter 14 ---------------------------------------------------
    const P14 = J.plate('ch14', 120, 0, 0.75);
    const art = J.svg(root);
    const marks = { 心: [2395, 1066, 2477, 1120], 猿: [2400, 1135, 2470, 1217] };
    const chs = Object.keys(marks);
    const rs = chs.map((ch) => J.register(ch, marks[ch], P14.map, 500));
    const gs = chs.map((ch, i) => {
      const g = J.char(art, ch, 500);
      J.place(g, rs[i]);
      g.setAttribute('opacity', 0);
      return g;
    });
    const ib = J.inkBox(rs, chs, 500, 8);
    const kn = J.knock(art, ib);
    const box = J.hairBox(art, ib);
    J.drawOn(tl, [box], E['s7.box'], 0.45);
    J.fade(tl, gs, E['s7.land'], 0, 1, 0.2);
    J.fade(tl, [kn], E['s7.land'], 0, 1, 0.2);
    J.fade(tl, [P14.box, box, kn], E['s7.fall'], 1, 0, 0.45, 'power2.out');
    // The row stands where the word stands: the pair turns about its own
    // centre into a row at the left of the frame, 132 px, from x 160.
    const RS = 132;
    const cy = (rs[0].y + rs[1].y + rs[1].size) / 2;
    const RT = Math.round(cy - RS / 2);
    J.swing(tl, gs[0], gs[1], rs[0], rs[1], { x: 160, y: RT, size: RS }, { x: 160 + RS, y: RT, size: RS }, E['s7.row'], 0.6, { easeX: 'power2.inOut', easeY: 'power2.inOut', easeS: 'power2.inOut' });
    const mm = J.latin(root, 'mind-monkey', { x: 160, base: RT + RS + 40, size: 30, italic: true, color: C.label, typed: true });
    J.typeOn(tl, mm.letters, E['s7.mind'], 26);
    const c14 = J.credit(A, [J.scan('The contents, chapter 14')], { w: 1300 });
    J.fade(tl, [c14], E['s7.fall'], 1, 0, 0.45, 'power2.out');

    // ---- B · Hu Shih -------------------------------------------------------
    const H = J.plate('hushih', 1200, 120, 0.268);
    J.push(tl, H, E['cut.s7b'], E['cut.s8'] - E['cut.s7b'], 1.03, 0.5, 0.4);
    // His name and the book he introduced, right-aligned 40 px from the plate.
    const RX = H.x - 40;
    const huW = J.width('Hu Shih', 76);
    const hu = J.latin(B, 'Hu Shih', { x: RX, base: 150 + 78, size: 76, align: 'right', typed: true });
    const name = J.han(B, '胡適', { x: RX - huW - 28 - 2 * 90, y: 150, size: 90, style: { opacity: 0 } });
    J.fade(tl, [name], E['s7.name'] - 0.05, 0, 1, 0.3);
    J.typeOn(tl, hu.letters, E['s7.name'], 26);
    const parts = [['introduction to ', false], ['Monkey', true], [', New York, 1943', false]];
    const LW = parts.reduce((s, [t, it]) => s + J.width(t, 34, it), 0);
    let x = RX - LW;
    const letters = [];
    parts.forEach(([t, it]) => {
      const e = J.latin(B, t, { x, base: 300, size: 34, italic: it, color: C.label, typed: true });
      letters.push(...e.letters);
      x += e.w;
    });
    J.typeOn(tl, letters, E['s7.intro'], 26);
    J.credit(B, ['Photograph: Harris &amp; Ewing, 1939 · Library of Congress'], { w: 1200 });

    J.show(tl, [A], E['cut.s7b'], false);
    J.show(tl, [B], E['cut.s7b'], true);
  };
})();
