/*
 * The isometric family (DESIGN.md section 6) for this film: one 30 degree
 * axonometric map, camera at (+, +, +), light from the upper left, three
 * visible faces shaded top 4 / left 9 / right 15 percent of the ink on the
 * ground. A box is an opaque hull (the occluder), then its face fills, then
 * its hairlines: the silhouette once and the interior front edges once, so
 * no edge is stroked twice.
 *
 *   const iso = GTIso.make({ ox: 960, oy: 652 });
 *   const svg = iso.box({ x: 0, y: 0, z: 0, w: 260, d: 260, h: 10 }, { stroke: 'rgba(...)' });
 */
(function () {
  'use strict';
  const C30 = Math.cos(Math.PI / 6);

  function make(o) {
    const ox = o.ox;
    const oy = o.oy;
    const ink = o.ink || '242,242,240';
    const ground = o.ground || '#070707';
    function p(x, y, z) {
      return [ox + (x - y) * C30, oy + (x + y) * 0.5 - z];
    }
    function pts(list) {
      return list.map((q) => q[0].toFixed(2) + ',' + q[1].toFixed(2)).join(' ');
    }
    /** SVG markup for one box. s.stroke is the hairline color. */
    function box(b, s) {
      const st = s || {};
      const x0 = b.x;
      const y0 = b.y;
      const x1 = b.x + b.w;
      const y1 = b.y + b.d;
      const zb = b.z;
      const zt = b.z + b.h;
      const back = p(x0, y0, zt);
      const right = p(x1, y0, zt);
      const front = p(x1, y1, zt);
      const left = p(x0, y1, zt);
      const rightB = p(x1, y0, zb);
      const frontB = p(x1, y1, zb);
      const leftB = p(x0, y1, zb);
      const stroke = st.stroke || 'rgba(' + ink + ',0.45)';
      const fills = st.fills || [0.04, 0.09, 0.15];
      let m = '';
      m += '<polygon points="' + pts([back, right, rightB, frontB, leftB, left]) + '" fill="' + ground + '"/>';
      m += '<polygon points="' + pts([back, right, front, left]) + '" fill="rgba(' + ink + ',' + fills[0] + ')"/>';
      m += '<polygon points="' + pts([left, front, frontB, leftB]) + '" fill="rgba(' + ink + ',' + fills[1] + ')"/>';
      m += '<polygon points="' + pts([front, right, rightB, frontB]) + '" fill="rgba(' + ink + ',' + fills[2] + ')"/>';
      m += '<polygon points="' + pts([back, right, rightB, frontB, leftB, left]) + '" fill="none" stroke="' + stroke + '" stroke-width="' + (st.width || 1) + '" stroke-linejoin="miter"/>';
      m += '<path d="M' + left[0].toFixed(2) + ' ' + left[1].toFixed(2) + 'L' + front[0].toFixed(2) + ' ' + front[1].toFixed(2) + 'L' + right[0].toFixed(2) + ' ' + right[1].toFixed(2) + 'M' + front[0].toFixed(2) + ' ' + front[1].toFixed(2) + 'L' + frontB[0].toFixed(2) + ' ' + frontB[1].toFixed(2) + '" fill="none" stroke="' + stroke + '" stroke-width="' + (st.width || 1) + '"/>';
      return m;
    }
    return { p, box, C30 };
  }

  /**
   * Sub-path of a polyline between arc lengths a and b, as an SVG d string.
   * The doubled line's draw-on and its pulse are real geometry rewritten
   * per frame, never a dash offset.
   */
  function polyline(points) {
    const cum = [0];
    for (let i = 1; i < points.length; i++) {
      const dx = points[i][0] - points[i - 1][0];
      const dy = points[i][1] - points[i - 1][1];
      cum.push(cum[i - 1] + Math.sqrt(dx * dx + dy * dy));
    }
    const length = cum[cum.length - 1];
    function at(s) {
      if (s <= 0) return points[0];
      if (s >= length) return points[points.length - 1];
      let i = 1;
      while (cum[i] < s) i++;
      const t = (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
      return [points[i - 1][0] + (points[i][0] - points[i - 1][0]) * t, points[i - 1][1] + (points[i][1] - points[i - 1][1]) * t];
    }
    function sub(a, b) {
      const s0 = Math.max(0, Math.min(length, a));
      const s1 = Math.max(0, Math.min(length, b));
      if (s1 - s0 < 0.01) return 'M0 0';
      const out = [at(s0)];
      for (let i = 1; i < points.length - 1; i++) if (cum[i] > s0 && cum[i] < s1) out.push(points[i]);
      out.push(at(s1));
      return 'M' + out.map((q) => q[0].toFixed(2) + ' ' + q[1].toFixed(2)).join('L');
    }
    return { length, at, sub };
  }

  window.GTIso = { make, polyline };
})();
