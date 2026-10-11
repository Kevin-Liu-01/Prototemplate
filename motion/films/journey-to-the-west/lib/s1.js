/*
 * Scene 1 · 0.0 to the cut on "surname" · the title column (SCRIPT-v2 line 1).
 *
 * The chapter 1 title column of the oldest surviving edition at full tone. A
 * box draws round the printed 西遊記, the film's type lands on it and the
 * column lowers to a third; "Journey to the West" is typed beside the box
 * from the narrator's "novel", finishing as he says it. The Monkey card waits
 * for line 4 (scene 3), which cuts back to this frame as it is left here.
 *
 * J.titleFrame builds the frame for both scenes: { live: true } plays the
 * opening moves, { live: false } stands in the state the opening ends on.
 * Every time is a film second from data/events.js (sound/tools/timeline.py).
 */
(function () {
  const J = window.JW;
  const { C, E } = J;

  J.titleFrame = function (tl, root, o) {
    const P = J.plate('title', 1484, 0, 0.8, o.key);
    P.box.style.opacity = o.live ? 1 : J.THIRD;
    const art = J.svg(root);
    const marks = { 西: [1442, 1262, 1527, 1348], 遊: [1440, 1352, 1528, 1438], 記: [1442, 1442, 1530, 1528] };
    const chs = Object.keys(marks);
    const regs = chs.map((ch) => J.register(ch, marks[ch], P.map, 500));
    const box = J.inkBox(regs, chs, 500, 9);
    const hb = J.hairBox(art, box);
    // Paper inside the box, so the type stands alone over the tinted print. It
    // stops above the library's red line (plate rows 639 to 670), which runs
    // under 記: the NCL marks stay whole wherever a crop includes them.
    const RED_TOP = P.y + 637;
    const kn = J.knock(art, [box[0], box[1], box[2], Math.min(box[3], RED_TOP)]);
    const type = chs.map((ch, i) => {
      const g = J.char(art, ch, 500);
      J.place(g, regs[i]);
      g.setAttribute('opacity', o.live ? 0 : 1);
      return g;
    });
    if (!o.live) kn.setAttribute('opacity', 1);
    // The card's baseline is the height of the foot of 遊; "Journey to the West"
    // sits 26 px above it, right-aligned 22 px from the box, so the hairline
    // of scene 3 runs under it into the box with its descenders clear of the
    // line (fix round: at 14 px the y of "Journey" touched it). The hairline
    // ends on the box's left side (hx1), so it joins "Monkey" to the box.
    const base = regs[1].y + regs[1].size * 0.83;
    const hx1 = box[0];
    const jw = J.latin(root, 'Journey to the West', { x: box[0] - 22, base: base - 26, size: 36, italic: true, color: C.label, align: 'right', typed: o.live });
    const cr = J.credit(root, [J.scan('Chapter 1, the title column')], { w: 1290, style: { opacity: o.live ? 0 : 1 } });
    if (o.live) {
      J.drawOn(tl, [hb], E['s1.box'], 0.45);
      J.fade(tl, type, E['s1.type'], 0, 1, 0.2);
      J.fade(tl, [kn], E['s1.type'], 0, 1, 0.2);
      tl.fromTo(P.box, { opacity: 1 }, { opacity: J.THIRD, duration: 0.6, ease: 'power2.in', immediateRender: false }, E['s1.lower']);
      J.typeOn(tl, jw.letters, E['s1.journey'], 26);
      J.fade(tl, [cr], 0.5, 0, 1, 0.4);
    }
    return { P, art, box, base, hx1, regs };
  };

  J.scenes.s1 = function (tl, root) {
    J.titleFrame(tl, root, { live: true, key: 'title' });
  };
})();
