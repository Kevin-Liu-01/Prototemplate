/*
 * Scene 8 · the close (SCRIPT-v2 lines 13 and 14).
 *
 * Richard's plates of 1913 arrive one at a time on the spoken names, each
 * with its own printed caption: 孫行者 stands at the cut, 猪八戒 arrives with
 * "Pigsy" and 沙和尚 with "Sandy", and 唐三藏 lands in type in the fourth place
 * with "Tripitaka". Waley's row is typed on the narrator's words. Then
 * LOVELL, 2021 and her four names are typed as a block in the same face,
 * size and places; on "kept" one box closes round both rows, and on the last
 * word a second box closes round the two "Monkey" entries. The frame holds
 * while the bed resolves.
 */
(function () {
  const J = window.JW;
  const { E } = J;

  J.scenes.s8 = function (tl, root) {
    const SLOT = 296, GAP = 44, X0 = 1780 - (4 * SLOT + 3 * GAP), TOP = 112;
    const sx = (i) => X0 + i * (SLOT + GAP);
    let PH = 0;
    const plates = ['r58', 'r234', 'r250'].map((id, i) => {
      const p = J.plate(id, sx(i), TOP, window.JW_PLATES[id].s);
      PH = p.h;
      return p;
    });
    // A plate arrives as its name is said (0.35 s, power2.out); its place is empty until then.
    plates[1].box.style.opacity = 0;
    plates[2].box.style.opacity = 0;
    J.fade(tl, [plates[1].box], E['s8.pigsy'], 0, 1, 0.35, 'power2.out');
    J.fade(tl, [plates[2].box], E['s8.sandy'], 0, 1, 0.35, 'power2.out');
    // The fourth pilgrim has no plate among these: his name lands in type, upright like the plates' own labels.
    const TS = 112;
    const tang = J.han(root, '唐三藏', { v: true, x: sx(3) + SLOT / 2 - TS / 2, y: TOP + PH / 2 - (3 * TS) / 2, size: TS, style: { opacity: 0 } });
    tang.setAttribute('data-layout-allow-occlusion', ''); // the auditor reads the plate row as covering it; nothing does
    J.rise(tl, [tang], E['s8.tripitaka'], 0.45);

    const NAMES = ['Monkey', 'Pigsy', 'Sandy', 'Tripitaka'];
    const B1 = TOP + PH + 96, B2 = B1 + 100, NS = 60;
    const wt = J.tag(root, 'Waley, 1942', { x: 160, base: B1 - 4 });
    J.rise(tl, [wt.e], E['s8.waley'], 0.4);
    const WAT = [E['s8.monkey'], E['s8.pigsy'], E['s8.sandy'], E['s8.tripitaka']];
    const cells = NAMES.map((n, i) => {
      const e = J.latin(root, n, { x: sx(i) + SLOT / 2, base: B1, size: NS, align: 'center', typed: true });
      J.typeOn(tl, e.letters, WAT[i], 26);
      return e;
    });
    const lt = J.tag(root, 'Lovell, 2021', { x: 160, base: B2 - 4 });
    J.rise(tl, [lt.e], E['s8.lovell'], 0.4);
    const cells2 = NAMES.map((n, i) => {
      const e = J.latin(root, n, { x: sx(i) + SLOT / 2, base: B2, size: NS, align: 'center', typed: true });
      J.typeOn(tl, e.letters, E['s8.lovell'] + 0.001 + i * 0.03, 26);
      return e;
    });
    const art = J.svg(root);
    const box = J.hairBox(art, [X0 - 22, B1 - NS * 0.74 - 34, sx(3) + SLOT + 22, B2 + NS * 0.24 + 34]);
    J.drawOn(tl, [box], E['s8.kept'], 0.45);
    // The two "Monkey" entries, inside the first box with 20 px between the two lines.
    const mw = Math.max(cells[0].w, cells2[0].w);
    const mx = sx(0) + SLOT / 2;
    const mbox = J.hairBox(art, [mx - mw / 2 - 22, B1 - NS * 0.74 - 14, mx + mw / 2 + 22, B2 + NS * 0.24 + 14]);
    J.drawOn(tl, [mbox], E['s8.last'], 0.45);

    J.credit(root, ['Plates: Timothy Richard’s English version, <i>A Mission to Heaven</i>, 1913, after an unnamed Chinese illustrated edition · Cornell University Library'], { w: 1600 });
  };
})();
