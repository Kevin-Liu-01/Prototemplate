// Runs in Chromium: fits Inter to each published title, then draws the cover at full size on the re-screened ground.
const load = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

function pixels(img) {
  const c = canvas(img.width, img.height), x = c.getContext('2d');
  x.drawImage(img, 0, 0);
  return x.getImageData(0, 0, img.width, img.height);
}

// Light, unsaturated pixels inside a region: the published type.
function maskIn(px, [x0, y0, x1, y1], T) {
  const w = x1 - x0, h = y1 - y0, m = new Uint8Array(w * h);
  let bx0 = 1e9, by0 = 1e9, bx1 = -1, by1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = ((y + y0) * px.width + x + x0) * 4, r = px.data[i], g = px.data[i + 1], b = px.data[i + 2];
    if ((r + g + b) / 3 > T && Math.max(r, g, b) - Math.min(r, g, b) < 50) {
      m[y * w + x] = 1;
      bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x + 1); by1 = Math.max(by1, y + 1);
    }
  }
  return { m, w, h, ink: [x0 + bx0, y0 + by0, x0 + bx1, y0 + by1] };
}

function setFont(x, weight, size, spacing) {
  x.font = `${weight} ${size}px Inter`;
  x.letterSpacing = `${spacing}px`;
  x.fontKerning = 'normal';
}

function measure(text, weight, size, spacing) {
  const x = canvas(4, 4).getContext('2d');
  setFont(x, weight, size, spacing);
  const m = x.measureText(text);
  return { left: m.actualBoundingBoxLeft, right: m.actualBoundingBoxRight, asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent };
}

// Size from the ink height, tracking from the ink width, weight by overlap with the published mask.
function fitText(px, text, region, T, only) {
  const M = maskIn(px, region, T), [ix0, iy0, ix1, iy1] = M.ink, bw = ix1 - ix0, bh = iy1 - iy0;
  let best = null;
  for (let weight = only || 300; weight <= (only || 800); weight += 25) {
    const m0 = measure(text, weight, 400, 0), size = 400 * bh / (m0.asc + m0.desc);
    let spacing = 0;
    for (let k = 0; k < 3; k++) {
      const m = measure(text, weight, size, spacing);
      spacing += (bw - (m.left + m.right)) / Math.max(1, [...text].length - 1);
    }
    const m = measure(text, weight, size, spacing);
    const c = canvas(M.w, M.h), x = c.getContext('2d');
    setFont(x, weight, size, spacing); x.fillStyle = '#fff';
    x.fillText(text, ix0 - region[0] + m.left, iy0 - region[1] + m.asc);
    const d = x.getImageData(0, 0, M.w, M.h).data;
    let inter = 0, uni = 0;
    for (let i = 0; i < M.m.length; i++) { const a = d[i * 4 + 3] > 127 ? 1 : 0; inter += a & M.m[i]; uni += a | M.m[i]; }
    const iou = inter / uni;
    if (!best || iou > best.iou) best = { weight, size, spacing, iou, ink: M.ink, cap: measure('H', weight, size, 0).asc };
  }
  return best;
}

function drawText(x, text, f, k, at) {
  const size = f.size * k, spacing = f.spacing * k, m = measure(text, f.weight, size, spacing);
  setFont(x, f.weight, size, spacing); x.fillStyle = '#fff';
  x.fillText(text, at[0] * k + m.left, at[1] * k + m.asc);
}

// Ink box of an image as a fraction of its frame.
function inkFrac(img, W = 2000) {
  const H = Math.round(W * img.height / img.width), c = canvas(W, H), x = c.getContext('2d');
  x.drawImage(img, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data;
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) if (d[(y * W + i) * 4 + 3] > 8) { x0 = Math.min(x0, i); y0 = Math.min(y0, y); x1 = Math.max(x1, i + 1); y1 = Math.max(y1, y + 1); }
  return [x0 / W, y0 / H, x1 / W, y1 / H, W / H];
}

// Draws an SVG so its ink fills the box's height, centred on the box.
async function drawSvg(x, svg, box, k, fitBy = 'height') {
  const probe = await load('data:image/svg+xml;base64,' + btoa(svg));
  const [fx0, fy0, fx1, fy1, aspect] = inkFrac(probe);
  const [bx0, by0, bx1, by1] = box.map((v) => v * k);
  const inkH = fitBy === 'width' ? (bx1 - bx0) / ((fx1 - fx0) * aspect) * (fy1 - fy0) : by1 - by0;
  const fullH = inkH / (fy1 - fy0), fullW = fullH * aspect;
  const left = (bx0 + bx1) / 2 - fullW * (fx0 + fx1) / 2, top = (by0 + by1) / 2 - fullH * (fy0 + fy1) / 2;
  const sized = svg.replace('<svg ', `<svg width="${fullW}" height="${fullH}" preserveAspectRatio="none" `);
  const img = await load('data:image/svg+xml;base64,' + btoa(sized));
  x.drawImage(img, left, top, fullW, fullH);
  return { left: left + fullW * fx0, top: top + fullH * fy0, right: left + fullW * fx1, bottom: top + fullH * fy1 };
}

window.compose = async function (spec) {
  await document.fonts.load('500 100px Inter');
  const pub = pixels(await load(spec.pub)), ground = await load(spec.ground);
  const k = spec.W / pub.width, out = canvas(spec.W, spec.H), x = out.getContext('2d');
  x.imageSmoothingEnabled = false;
  x.drawImage(ground, 0, 0);
  x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
  const log = [];
  for (const it of spec.items) {
    if (it.t === 'text') {
      const f = fitText(pub, it.text, it.region, it.T, it.weight);
      drawText(x, it.text, f, k, f.ink);
      log.push({ text: it.text, weight: f.weight, size: +f.size.toFixed(2), spacingEm: +(f.spacing / f.size).toFixed(4), iou: +f.iou.toFixed(3), ink: f.ink });
    } else if (it.t === 'lockup1') {
      // The one-line lockup's rule: the globe 1.9 caps, centred on the cap band, 0.5826 cap of white to the words' ink.
      const f = fitText(pub, it.text, it.region, it.T, it.weight), m = measure(it.text, f.weight, f.size, f.spacing);
      const base = f.ink[1] + m.asc, cap = f.cap, g = 1.9 * cap, gap = 0.5826 * cap;
      const inkW = f.ink[2] - f.ink[0], left = it.center - (g + gap + inkW) / 2;
      await drawSvg(x, it.globe, [left, base - cap / 2 - g / 2, left + g, base - cap / 2 + g / 2], k);
      drawText(x, it.text, f, k, [left + g + gap, f.ink[1]]);
      log.push({ lockup: it.text, weight: f.weight, size: +f.size.toFixed(2), spacingEm: +(f.spacing / f.size).toFixed(4), iou: +f.iou.toFixed(3), cap: +cap.toFixed(2), globe: +g.toFixed(2), group: [+left.toFixed(1), +(left + g + gap + inkW).toFixed(1)] });
    } else if (it.t === 'svg') {
      const r = await drawSvg(x, it.svg, it.box, k, it.fitBy);
      log.push({ svg: it.name, box: it.box, drawn: Object.values(r).map((v) => +(v / k).toFixed(1)) });
    } else if (it.t === 'rim') {
      // The Fumadocs glass is re-screened with the ground; only its rim is drawn again, crisp.
      const [bx0, by0, bx1, by1] = it.box.map((v) => v * k), cx = (bx0 + bx1) / 2, cy = (by0 + by1) / 2, r = (bx1 - bx0 + by1 - by0) / 4;
      if (it.outer) {
        // Outside the disc the ground comes from a run that masked the whole disc, so the glass never bleeds past its rim.
        const outer = await load(it.outer);
        x.save(); x.beginPath(); x.rect(0, 0, spec.W, spec.H); x.arc(cx, cy, r - it.rim * k / 2, 0, Math.PI * 2, true); x.clip('evenodd');
        x.imageSmoothingEnabled = false; x.drawImage(outer, 0, 0); x.restore(); x.imageSmoothingEnabled = true;
      }
      x.beginPath(); x.arc(cx, cy, r - it.rim * k / 2, 0, Math.PI * 2); x.strokeStyle = it.rimColor; x.lineWidth = it.rim * k; x.stroke();
      log.push({ rim: it.box });
    } else if (it.t === 'img') {
      const img = await load(it.src), [bx0, by0] = it.box;
      x.drawImage(img, bx0 * k, by0 * k, img.width * k, img.height * k);
      log.push({ img: it.name, box: it.box });
    }
  }
  return { png: out.toDataURL('image/png'), log };
};
