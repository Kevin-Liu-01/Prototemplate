/*
 * Scene 5 · the woodcut of chapter 4 (SCRIPT-v2 line 6).
 *
 * "In the novel, Heaven gives the monkey a post in the imperial stables." The
 * chapter 4 woodcut of the oldest surviving edition, a court audience, both
 * leaves trimmed to the paper, pushed slowly from 1.00 to 1.03 (the plate
 * only). Its printed caption is part of the picture and is not transcribed.
 */
(function () {
  const J = window.JW;
  const { E } = J;

  J.scenes.s5 = function (tl, root) {
    const W = J.plate('woodcut', 960 - window.JW_PLATES.woodcut.w / 2, 90, 0.356);
    J.push(tl, W, E['cut.s5'], E['cut.s6'] - E['cut.s5'], 1.03, 0.5, 0.5);
    J.credit(root, [J.scan('Woodcut, chapter 4')], { w: 1300 });
  };
})();
