/*
 * Scene 3 · the cut after line 3 to the cut on "thirty" · Waley's title card
 * (SCRIPT-v2 line 4).
 *
 * The title column as scene 1 left it: the scan at a third, 西遊記 in type in
 * its box, "Journey to the West" beside it. The card's two lines rise at the
 * cut; "Monkey" is typed at 210 px on the narrator's word, and a hairline runs
 * from its last letter to the box. The card is the film's own type and
 * imitates no jacket.
 */
(function () {
  const J = window.JW;
  const { C, E } = J;

  J.scenes.s3 = function (tl, root) {
    const F = J.titleFrame(tl, root, { live: false, key: 'title-s3' });
    const monkey = J.latin(root, 'Monkey', { x: 160, base: F.base, size: 210, typed: true });
    J.typeOn(tl, monkey.letters, E['s3.monkey'], 14);
    const l1 = J.latin(root, 'translated by Arthur Waley', { x: 166, base: F.base + 78, size: 44 });
    const l2 = J.latin(root, 'London, 1942', { x: 166, base: F.base + 130, size: 36, color: C.label });
    J.rise(tl, [l1.e, l2.e], E['s3.lines'], 0.5, 0.09);
    const hx0 = 160 + monkey.w + 34;
    const hl = J.line(F.art, hx0, F.base, F.hx1, F.base, { w: 1 });
    J.drawOn(tl, [hl], E['s3.hair'], 0.5);
  };
})();
