/*
 * modern-hebrew: the composing move. A word is built from its parts on a type
 * card: a pattern's stand-in letters sink to the ghost tone, a root's letters
 * drop out of their tray cells into the empty slots, a letter leaves, a point
 * falls away and a new one rises, an ending docks. Every glyph is its own
 * outline from data/glyphs.js (tools/glyphs.mjs: fontkit with the font's GPOS
 * mark and mkmk positioning), so a letter and its points move separately and
 * land exactly where the browser sets the same word as one text node.
 * Ported from the roots lane's build (motion/concepts/modern-hebrew/roots/
 * lib/mh.js) into the dictionary's inks.
 *
 * MHBuild.word(parent, spec) returns { set(state) }. set() is a pure function
 * of the state it is given: every glyph's place, size, colour and opacity.
 *
 * spec:
 *   to       target word id; placed with its right edge at x, baseline at y, size px
 *   sources  { key: { word, x, y, size } }  words the glyphs come from (right edge at x)
 *   take     { 'ci/gi': how }  how each target glyph arrives (ci = cluster in
 *            reading order, gi = glyph in the cluster, 0 = the letter):
 *              ['move', key, sci, sgi, channel]   from a source glyph
 *              ['swap', key, sci, sgi, channel]   from a source letter of another form (cross-fade)
 *              ['in', channel]                    a new point rising 30 px into place
 *              ['tray', k, channel]               from tray cell k (centre x, y, letter size)
 *              ['rest']                           already in place
 *   leave    { 'key/ci/gi': how }  what source glyphs not taken do:
 *              ['lift', channel]   rise 130 px and fade (a letter that leaves)
 *              ['out', channel]    fall 30 px and fade (a point that changes)
 *              ['ghost', sinkChannel, goneChannel]  a stand-in: sinks to the ghost tone, then goes as its slot fills
 *              ['fade', channel]   fade where it stands (a maqaf that is no longer needed)
 *   tray     [{ x, y, size, ch }]
 *   ink      (role, glyph) => colour at rest
 * state: { <channel>: 0..1, show: { <sourceKey>: 0..1 }, target: 0..1 }
 */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const G = () => window.MH_GLYPHS;
  const lerp = (a, b, p) => a + (b - a) * p;
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, p) => {
    const A = hex(a);
    const B = hex(b);
    return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], p))).join(',')})`;
  };

  function place(id, x, y, size) {
    const W = G().words[id];
    const s = size / W.upm;
    return { W, s, left: x - W.adv * s, y };
  }
  const at = (P, gl) => ({ x: P.left + gl.x * P.s, y: P.y - gl.y * P.s, s: P.s });

  function path(parent, d) {
    const n = document.createElementNS(NS, 'path');
    n.setAttribute('d', d);
    parent.appendChild(n);
    return n;
  }
  function put(n, x, y, s, op, fill) {
    n.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${s.toFixed(5)} ${(-s).toFixed(5)})`);
    const o = clamp(op);
    n.setAttribute('opacity', o.toFixed(3));
    // hidden when spent; otherwise inherit, so a hidden card hides its glyphs
    if (o <= 0.001) n.setAttribute('visibility', 'hidden');
    else n.removeAttribute('visibility');
    if (fill) n.setAttribute('fill', fill);
  }

  function word(parent, spec) {
    const g = document.createElementNS(NS, 'g');
    parent.appendChild(g);
    const T = place(spec.to, spec.x, spec.y, spec.size);
    const P = {};
    for (const [k, src] of Object.entries(spec.sources || {})) P[k] = place(src.word, src.x, src.y, src.size);
    const items = [];
    const taken = new Set();
    // target glyphs
    T.W.clusters.forEach((c, ci) => {
      c.glyphs.forEach((gl, gi) => {
        const how = (spec.take && spec.take[`${ci}/${gi}`]) || ['rest'];
        const it = { kind: how[0], node: path(g, gl.d), to: at(T, gl), role: gl.mark ? 'p' : c.role, gl };
        if (how[0] === 'move' || how[0] === 'swap') {
          const [, key, sci, sgi, ch] = how;
          const sg = P[key].W.clusters[sci].glyphs[sgi];
          it.from = at(P[key], sg);
          it.ch = ch;
          it.key = key;
          taken.add(`${key}/${sci}/${sgi}`);
          if (how[0] === 'swap') {
            // the source letter cross-fades out while it travels with the new one
            items.push({ kind: 'swapOut', node: path(g, sg.d), from: it.from, to: { x: it.to.x + (sg.x - gl.x) * 0, y: it.to.y, s: it.to.s }, ch, key, role: P[key].W.clusters[sci].role, gl: sg });
            taken.add(`${key}/${sci}/${sgi}`);
          }
        } else if (how[0] === 'in') {
          it.ch = how[1];
        } else if (how[0] === 'tray') {
          const [, k, ch] = how;
          const tr = spec.tray[k];
          const L = G().letters[tr.ch];
          const ts = tr.size / G().upm;
          // the tray letter's ink box centred on its cell
          it.from = { x: tr.x - ((L.bb[0] + L.bb[2]) / 2) * ts, y: tr.y + ((L.bb[1] + L.bb[3]) / 2) * ts, s: ts };
          it.ch = ch;
          it.k = k;
        }
        items.push(it);
      });
    });
    // source glyphs that no target glyph takes
    for (const [key, PP] of Object.entries(P)) {
      PP.W.clusters.forEach((c, ci) => {
        c.glyphs.forEach((gl, gi) => {
          const id = `${key}/${ci}/${gi}`;
          if (taken.has(id)) return;
          const how = (spec.leave && spec.leave[id]) || ['lift', 'leave'];
          items.push({ kind: how[0], node: path(g, gl.d), from: at(PP, gl), ch: how[1], ch2: how[2], key, role: gl.mark ? 'p' : c.role, gl });
        });
      });
    }
    const ink = spec.ink;
    const C = spec.colors;

    function set(st) {
      const v = (ch) => (ch == null ? 1 : clamp(st[ch] ?? 0));
      const shown = (key) => (st.show && st.show[key] != null ? st.show[key] : 1);
      const tgt = st.target ?? 1;
      for (const it of items) {
        const col = ink(it.role, it.gl);
        switch (it.kind) {
          case 'rest':
            put(it.node, it.to.x, it.to.y, it.to.s, tgt, col);
            break;
          case 'move': {
            const p = v(it.ch);
            put(it.node, lerp(it.from.x, it.to.x, p), lerp(it.from.y, it.to.y, p), lerp(it.from.s, it.to.s, p), p > 0 ? 1 : shown(it.key), col);
            break;
          }
          case 'swap': {
            const p = v(it.ch);
            put(it.node, lerp(it.from.x, it.to.x, p), lerp(it.from.y, it.to.y, p), it.to.s, p, col);
            break;
          }
          case 'swapOut': {
            const p = v(it.ch);
            put(it.node, lerp(it.from.x, it.to.x, p), lerp(it.from.y, it.to.y, p), it.from.s, (p > 0 ? 1 : shown(it.key)) * (1 - p), col);
            break;
          }
          case 'in': {
            const p = v(it.ch);
            put(it.node, it.to.x, it.to.y + 30 * (1 - p), it.to.s, p, col);
            break;
          }
          case 'tray': {
            const p = v(it.ch);
            const vis = st.tray ? clamp(st.tray[it.k] ?? 0) : 1;
            const dy = st.trayRise ? 14 * (1 - vis) : 0;
            put(it.node, lerp(it.from.x, it.to.x, p), lerp(it.from.y + dy, it.to.y, p), lerp(it.from.s, it.to.s, p), p > 0 ? 1 : vis, col);
            break;
          }
          case 'lift': {
            const p = v(it.ch);
            put(it.node, it.from.x, it.from.y - 130 * p, it.from.s, shown(it.key) * (1 - p), col);
            break;
          }
          case 'out': {
            const p = v(it.ch);
            put(it.node, it.from.x, it.from.y + 30 * p, it.from.s, shown(it.key) * (1 - p), col);
            break;
          }
          case 'fade': {
            const p = v(it.ch);
            put(it.node, it.from.x, it.from.y, it.from.s, shown(it.key) * (1 - p), col);
            break;
          }
          case 'ghost': {
            const sink = v(it.ch);
            const gone = v(it.ch2);
            put(it.node, it.from.x, it.from.y, it.from.s, shown(it.key) * (1 - gone), mix(col, C.ghost, sink));
            break;
          }
          default:
            break;
        }
      }
    }
    return { g, set, items, T };
  }

  window.MHBuild = { word, place };
})();
