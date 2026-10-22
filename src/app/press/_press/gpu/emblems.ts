/* Each cover's design, drawn in two layers on transparent canvases the
   cover's size, in the space between the head's line and the title.

   - The emblem layer goes in the mask's red: the display pass prints it
     through the dither in the cover's lighter inks, or, on a cover with an
     accent, as a solid accent ink (the proof marks).
   - The art layer goes in the blue: printed crisp in the cover's art ink.

   Shapes are drawn in white; only their alpha counts. */

type Box = { x: number; y: number; w: number; h: number };

/** Where a design draws, as fractions of the cover's width and height, for a cover laid out differently. */
export type ArtBox = { x: number; y: number; w: number; h: number };
type Draw = (ctx: CanvasRenderingContext2D, box: Box) => void | Promise<void>;
type Design = { emblem?: Draw; art?: Draw };

export type Layers = { emblem: HTMLCanvasElement | null; art: HTMLCanvasElement | null };

/** The middle of a cover, between the head's line and the title, where a design draws. `bottom` is where the title begins. */
function stage(width: number, height: number, bottom: number): Box {
  const w = width * 0.8;
  const y = height * 0.17;
  const h = Math.max(0, Math.min(height * 0.4, bottom - y));
  return { x: (width - w) / 2, y, w, h };
}

const images = new Map<string, Promise<HTMLImageElement | null>>();

function image(src: string): Promise<HTMLImageElement | null> {
  let found = images.get(src);
  if (!found) {
    found = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
    images.set(src, found);
  }
  return found;
}

/* ---------- Translating Euclid: the 1607 page ---------- */

const JIHE = '/press/euclid/emblem-jihe-yuanben.png';

/** The page fitted to the box, centred. */
function pageRect(img: HTMLImageElement, box: Box): Box {
  const s = Math.min(box.w / img.naturalWidth, box.h / img.naturalHeight);
  const w = Math.round(img.naturalWidth * s);
  const h = Math.round(img.naturalHeight * s);
  return { x: Math.round(box.x + (box.w - w) / 2), y: Math.round(box.y + (box.h - h) / 2), w, h };
}

/** The woodblock page printed in full ink: the paper drops away and every stroke keeps its weight. */
const euclidPage: Draw = async (ctx, box) => {
  const img = await image(JIHE);
  if (!img) return;
  const r = pageRect(img, box);
  const tmp = document.createElement('canvas');
  tmp.width = r.w;
  tmp.height = r.h;
  const t = tmp.getContext('2d');
  if (!t) return;
  t.drawImage(img, 0, 0, r.w, r.h);
  const data = t.getImageData(0, 0, r.w, r.h);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const lum = (0.2126 * px[i]! + 0.7152 * px[i + 1]! + 0.0722 * px[i + 2]!) / 255;
    const ink = Math.max(0, Math.min(1, (0.8 - lum) * 3.2));
    px[i] = px[i + 1] = px[i + 2] = 255;
    px[i + 3] = Math.round(px[i + 3]! * ink);
  }
  t.putImageData(data, 0, 0);
  ctx.drawImage(tmp, r.x, r.y);
  // a hairline around the page, as a plate is tipped into a book
  const gap = Math.max(4, Math.round(box.w * 0.025));
  ctx.strokeStyle = 'rgb(255 255 255 / 0.55)';
  ctx.lineWidth = Math.max(1, box.w / 400);
  ctx.strokeRect(r.x - gap + 0.5, r.y - gap + 0.5, r.w + gap * 2 - 1, r.h + gap * 2 - 1);
};

/* ---------- Designing docs for humans: the docs page, exploded in isometric ---------- */

/** Draws the exploded page: 'fill' for the panels the dither prints, 'line' for the crisp strokes over them. */
function isoDocs(ctx: CanvasRenderingContext2D, box: Box, mode: 'fill' | 'line') {
  const COS = Math.cos(Math.PI / 6);
  const SIN = 0.5;
  // page units: 10 wide, 7 deep, the layers 2.6 apart; the drawing spans 17 cos 30 across and 13.7 down, fitted and centred
  const spanX = 17 * COS;
  const spanY = 7 * SIN + 10 * SIN + 5.2;
  const unit = Math.min(box.w / spanX, box.h / spanY);
  const ox = box.x + (box.w - spanX * unit) / 2 + 7 * COS * unit;
  const oy = box.y + (box.h - spanY * unit) / 2 + 5.2 * unit;
  const at = (x: number, y: number, z: number): [number, number] => [ox + (x - y) * COS * unit, oy + (x + y) * SIN * unit - z * unit];
  const quad = (x: number, y: number, w: number, d: number, z: number) => {
    ctx.beginPath();
    ctx.moveTo(...at(x, y, z));
    ctx.lineTo(...at(x + w, y, z));
    ctx.lineTo(...at(x + w, y + d, z));
    ctx.lineTo(...at(x, y + d, z));
    ctx.closePath();
  };
  const layers = [
    // the content: lines of text and a card row
    { z: 0, parts: [...[1.2, 2, 2.8, 3.6].map((y) => ({ x: 3, y, w: 4.6, d: 0.32 })), { x: 3, y: 4.6, w: 2.1, d: 1.4 }, { x: 5.5, y: 4.6, w: 2.1, d: 1.4 }] },
    // the navigation: the sidebar and the contents rail
    { z: 2.6, parts: [{ x: 0.6, y: 1, w: 1.7, d: 5.4 }, { x: 8.2, y: 1.2, w: 1.2, d: 0.22 }, { x: 8.2, y: 1.8, w: 1.2, d: 0.22 }, { x: 8.2, y: 2.4, w: 1.2, d: 0.22 }] },
    // the actions: the header bar and the search
    { z: 5.2, parts: [{ x: 0.4, y: 0.25, w: 9.2, d: 0.5 }, { x: 6.4, y: 0.33, w: 2.4, d: 0.34 }] },
  ];
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(1.25, unit * 0.06);
  if (mode === 'line') {
    // the guides that tie the layers together at the page's corners
    ctx.strokeStyle = 'rgb(255 255 255 / 0.6)';
    ctx.setLineDash([unit * 0.22, unit * 0.22]);
    for (const [x, y] of [[0, 0], [10, 0], [10, 7], [0, 7]] as const) {
      ctx.beginPath();
      ctx.moveTo(...at(x, y, 0));
      ctx.lineTo(...at(x, y, 5.2));
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }
  for (const layer of layers) {
    quad(0, 0, 10, 7, layer.z);
    if (mode === 'fill') {
      ctx.fillStyle = 'rgb(255 255 255 / 0.22)';
      ctx.fill();
    } else {
      ctx.strokeStyle = '#fff';
      ctx.stroke();
    }
    for (const part of layer.parts) {
      quad(part.x, part.y, part.w, part.d, layer.z);
      if (mode === 'fill') {
        ctx.fillStyle = 'rgb(255 255 255 / 0.8)';
        ctx.fill();
      } else {
        ctx.strokeStyle = 'rgb(255 255 255 / 0.9)';
        ctx.stroke();
      }
    }
  }
}

/* ---------- Rewriting docs: a proof sheet, the edits marked in red ---------- */

const PROOF_LINES = [0.92, 0.78, 0.86, 0.64, 0.9, 0.7, 0.84, 0.58, 0.88, 0.74];
const STRUCK = new Set([2, 5, 8]);

/** Lays out the sheet once, so the lines and the marks over them agree. */
function proof(box: Box, draw: (kind: 'line' | 'struck' | 'new' | 'mark', x: number, y: number, w: number, h: number) => void) {
  const rows = PROOF_LINES.length + STRUCK.size;
  const rowH = box.h / rows;
  const barH = Math.max(3, rowH * 0.3);
  const left = box.x + box.w * 0.06;
  const width = box.w * 0.94;
  let y = box.y;
  PROOF_LINES.forEach((len, i) => {
    const w = width * len;
    if (!STRUCK.has(i)) {
      draw('line', left, y, w, barH);
      y += rowH;
      return;
    }
    // the old line, struck through and flagged in the margin
    draw('struck', left, y, w, barH);
    draw('mark', box.x, y - barH * 0.5, Math.max(2, barH * 0.5), rowH * 2 - barH * 0.5);
    y += rowH;
    // the new line under it, and the caret where it is still being written
    draw('new', left, y, w * 0.8, barH);
    y += rowH;
  });
}

const proofLines: Draw = (ctx, box) => {
  proof(box, (kind, x, y, w, h) => {
    if (kind === 'mark') return;
    ctx.fillStyle = kind === 'struck' ? 'rgb(255 255 255 / 0.35)' : kind === 'new' ? '#fff' : 'rgb(255 255 255 / 0.62)';
    ctx.fillRect(x, y, w, h);
  });
};

const proofMarks: Draw = (ctx, box) => {
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#fff';
  proof(box, (kind, x, y, w, h) => {
    if (kind === 'struck') {
      // the strike, run a little past both ends of the line
      ctx.fillRect(x - h, y + h * 0.35, w + h * 2, Math.max(2, h * 0.3));
    } else if (kind === 'mark') {
      ctx.fillRect(x, y, w, h);
    } else if (kind === 'new') {
      // a caret at the end of the rewritten line
      const cx = x + w + h * 1.4;
      ctx.lineWidth = Math.max(1.5, h * 0.3);
      ctx.beginPath();
      ctx.moveTo(cx - h * 0.9, y + h * 1.4);
      ctx.lineTo(cx, y - h * 0.3);
      ctx.lineTo(cx + h * 0.9, y + h * 1.4);
      ctx.stroke();
    }
  });
};

/* ---------- Fuma Nama: Luna, the Fumadocs moon, in plain shapes ---------- */

/** The moon's place: a disc a little right of the box's middle, with room for the line at its left. */
function luna(box: Box) {
  const r = Math.min(box.w * 0.27, box.h * 0.4);
  return { cx: box.x + box.w * 0.56, cy: box.y + box.h * 0.5, r };
}

const fumaMoon: Draw = (ctx, box) => {
  const { cx, cy, r } = luna(box);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#fff';
  // the crescent: the disc with a second disc taken out of it
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx + r * 0.46, cy - r * 0.2, r * 0.86, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // its orbit, tilted, with two bodies on it
  ctx.lineWidth = Math.max(1.25, r * 0.022);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.32);
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.62, r * 0.42, 0, 0, Math.PI * 2);
  ctx.stroke();
  for (const [a, s] of [[0.35, 0.07], [3.6, 0.045]] as const) {
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r * 1.62, Math.sin(a) * r * 0.42, r * s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  // Fumadocs' table of contents line down the left: a step where the headings nest, and its thumb
  const x0 = box.x + box.w * 0.04;
  const step = r * 0.16;
  const top = cy - r * 1.05;
  const seg = (r * 2.1) / 5;
  const path: [number, number][] = [
    [x0, top],
    [x0, top + seg * 1.6],
    [x0 + step, top + seg * 1.6 + step],
    [x0 + step, top + seg * 3.2],
    [x0, top + seg * 3.2 + step],
    [x0, top + seg * 5],
  ];
  ctx.lineWidth = Math.max(1.25, r * 0.022);
  ctx.beginPath();
  path.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.lineWidth = Math.max(3, r * 0.07);
  ctx.beginPath();
  ctx.moveTo(x0 + step, top + seg * 1.6 + step * 1.6);
  ctx.lineTo(x0 + step, top + seg * 2.7);
  ctx.stroke();
};

/** A glow of the cover's light inks around the moon, printed through the dither. */
const fumaHalo: Draw = (ctx, box) => {
  const { cx, cy, r } = luna(box);
  const glow = ctx.createRadialGradient(cx, cy, r * 0.95, cx, cy, r * 1.5);
  glow.addColorStop(0, 'rgb(255 255 255 / 0.85)');
  glow.addColorStop(1, 'rgb(255 255 255 / 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
  ctx.fill();
};

const DESIGNS: Record<string, Design> = {
  'translating-euclid': { art: euclidPage },
  'designing-docs-for-humans': { emblem: (ctx, box) => isoDocs(ctx, box, 'fill'), art: (ctx, box) => isoDocs(ctx, box, 'line') },
  'rewriting-our-docs': { art: proofLines, emblem: proofMarks },
  'fuma-nama': { art: fumaMoon, emblem: fumaHalo },
};

async function layer(draw: Draw | undefined, width: number, height: number, box: Box): Promise<HTMLCanvasElement | null> {
  if (!draw) return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  await draw(ctx, box);
  return canvas;
}

/** The story's two layers on transparent canvases the cover's size, above `bottom`; none when the room is too small. */
export async function drawLayers(slug: string, width: number, height: number, bottom = height, at?: ArtBox): Promise<Layers> {
  const design = DESIGNS[slug];
  const box = at ? { x: width * at.x, y: height * at.y, w: width * at.w, h: height * at.h } : stage(width, height, bottom);
  if (!design || box.h < height * 0.08) return { emblem: null, art: null };
  const [emblem, art] = await Promise.all([layer(design.emblem, width, height, box), layer(design.art, width, height, box)]);
  return { emblem, art };
}
