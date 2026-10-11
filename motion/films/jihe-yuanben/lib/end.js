/*
 * Beat 10 of v2 (beat 11 of the 100 s cut): the closing title.
 *
 * The empty table under the lamp. 幾何原本 is set in one column (Noto Serif
 * CJK TC 600, 148 px), as the book sets its title. v2 drops the EB Garamond
 * block that sat to its left, so the column stands at the centre of the
 * window and only the title and the last subtitle share the frame. The column
 * arrives in reading order, one character at a time (90 ms stagger, opacity
 * and an 8 px rise, power3.out) while the last line plays over it; the
 * subtitle holds to its reading floor, and as it clears the brush adds one
 * vermilion stop after 本 (0.3 s) in a clear frame (tools/timeline.py,
 * B[10].stop). The archived 100 s cut's version is archive-100s/lib/end.js.
 */
(function () {
  function build(ctx) {
    const { f, tl, B, move, sfx, s11 } = ctx;
    const T = B[10].start;
    const end = document.createElement('div');
    end.className = 'jy-end';
    const chars = ['幾', '何', '原', '本'];
    end.innerHTML =
      // the film's grain lies over the title at an alpha of 0 to 3 / 255 on purpose
      '<div class="jy-end-title" lang="zh-Hant">' + chars.map((c) => '<span data-layout-allow-occlusion>' + c + '</span>').join('') + '</div>' +
      '<canvas class="jy-end-stop" width="120" height="120"></canvas>';
    f.win.insertBefore(end, f.black);
    const spans = Array.from(end.querySelectorAll('.jy-end-title span'));
    const stop = end.querySelector('.jy-end-stop');
    const g = stop.getContext('2d', JY.CPU);

    const st = s11.st; // carries c0 to c3, stop and drift from film.js
    spans.forEach((_, i) => {
      const to = {};
      to['c' + i] = 1;
      move(st, to, 0.45, 'power3.out', T + 0.05 + i * 0.09);
    });
    const tStop = B[10].stop;
    move(st, { stop: 1 }, 0.3, 'power2.out', tStop);
    sfx('mark', tStop, { mark: 'dot', dur: 0.3 });
    move(st, { drift: 1 }, B[10].end - T, 'none', T);

    // The stop: one reading circle at the lower right of 本.
    const h = JY.mark({ ctx: null, svg: null, g: null, marks: {} }, 'stop', { kind: 'dot', x: 60, y: 60, rx: 13, ry: 13.5, w: 3.6, seed: 7, under: false, noDom: true });
    let last = -1;
    s11.draw = (t, s) => {
      spans.forEach((sp, i) => {
        const u = s['c' + i];
        sp.style.opacity = u.toFixed(3);
        sp.style.transform = `translateY(${(8 * (1 - u)).toFixed(2)}px)`;
      });
      end.style.transform = `scale(${(1 + 0.012 * s.drift).toFixed(5)})`;
      if (Math.abs(s.stop - last) > 1e-4) {
        last = s.stop;
        g.clearRect(0, 0, 120, 120);
        if (s.stop > 0.0005) {
          h.set(s.stop);
          g.fillStyle = '#c9351b';
          g.fill(new Path2D(h.d));
        }
      }
    };
    s11.enter = () => (end.style.display = 'block');
    s11.leave = () => (end.style.display = 'none');
    end.style.display = 'none';
  }
  window.JYEnd = { build };
})();
