/* The cover's type, drawn once into a canvas the cover's size: the GT
   monogram at the top left and the title at the foot, nothing else; the
   authors are on the spine. Titles set in Katagami Serif unless a cover
   picks another face. The color is the cover's paper; the WebGPU display pass reads only the
   alpha and prints the fluid through it, and the fallback draws it as is. */

import { GT_MARK_PATH } from '../ui/GtMark';
import { drawLayers, type Layers } from './emblems';

const SANS = '"Katagami Text", "Katagami CJK SC", "Katagami CJK JP", "Katagami CJK KR", system-ui, sans-serif';
const MONO = '"Katagami Mono", ui-monospace, monospace';
const SERIF = '"Katagami Serif", "Katagami CJK SC", "Katagami CJK JP", "Katagami CJK KR", Georgia, serif';
const FACES = { sans: SANS, serif: SERIF, mono: MONO } as const;

export type CoverText = {
  /** Picks the design. */
  slug: string;
  title: string;
  lang: string;
  dir: 'ltr' | 'rtl';
  paper: string;
  /** The crisp art's ink and the accent's, for the fallback, which draws them itself. */
  art?: string;
  accent?: string;
  face?: keyof typeof FACES;
};

/** Breaks at spaces, and inside a word that is wider than the line (CJK has no spaces). */
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const lines: string[] = [];
  let line = '';
  const tokens = /\s/.test(text) ? text.split(/(\s+)/) : Array.from(text);
  for (const token of tokens) {
    const next = line + token;
    if (ctx.measureText(next.trim()).width <= max || !line.trim()) {
      line = next;
      continue;
    }
    lines.push(line.trim());
    line = token.trimStart();
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

/** Breaks into as many lines as a greedy wrap needs, then narrows the measure until the lines are as even as they can be. */
function balance(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const lines = wrap(ctx, text, max);
  if (lines.length < 2) return lines;
  let lo = max * 0.4;
  let hi = max;
  for (let k = 0; k < 14; k++) {
    const mid = (lo + hi) / 2;
    if (wrap(ctx, text, mid).length > lines.length) lo = mid;
    else hi = mid;
  }
  return wrap(ctx, text, hi);
}

/** One canvas for the shader: the emblem's (or accent's) coverage in red, the type's in green, the art's in blue, opaque throughout. */
function encodeMask(text: HTMLCanvasElement, { emblem, art }: Layers = { emblem: null, art: null }): HTMLCanvasElement {
  const out = document.createElement('canvas');
  out.width = text.width;
  out.height = text.height;
  const ctx = out.getContext('2d');
  const tctx = text.getContext('2d');
  if (!ctx || !tctx) return out;
  const tp = tctx.getImageData(0, 0, text.width, text.height).data;
  const ep = emblem?.getContext('2d')?.getImageData(0, 0, text.width, text.height).data;
  const ap = art?.getContext('2d')?.getImageData(0, 0, text.width, text.height).data;
  const image = ctx.createImageData(text.width, text.height);
  const px = image.data;
  for (let i = 0; i < px.length; i += 4) {
    px[i] = ep ? ep[i + 3]! : 0;
    px[i + 1] = tp[i + 3]!;
    px[i + 2] = ap ? ap[i + 3]! : 0;
    px[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return out;
}

/** The fallback's own print: the art and the accent tinted in their inks, under the type. */
function withLayers(text: HTMLCanvasElement, { emblem, art }: Layers, t: CoverText): HTMLCanvasElement {
  const out = document.createElement('canvas');
  out.width = text.width;
  out.height = text.height;
  const ctx = out.getContext('2d');
  if (!ctx) return text;
  const tint = (layer: HTMLCanvasElement | null, ink: string | undefined) => {
    if (!layer || !ink) return;
    const tmp = document.createElement('canvas');
    tmp.width = layer.width;
    tmp.height = layer.height;
    const c = tmp.getContext('2d');
    if (!c) return;
    c.drawImage(layer, 0, 0);
    c.globalCompositeOperation = 'source-in';
    c.fillStyle = ink;
    c.fillRect(0, 0, tmp.width, tmp.height);
    ctx.drawImage(tmp, 0, 0);
  };
  tint(art, t.art ?? t.paper);
  tint(emblem, t.accent);
  ctx.drawImage(text, 0, 0);
  return out;
}

export type CoverLayers = {
  /** For the WebGPU pass: the emblem and the type packed by encodeMask. */
  mask: HTMLCanvasElement;
  /** For the fallback: the type in the paper ink on a transparent ground. */
  plain: HTMLCanvasElement;
};

export async function drawCoverText(width: number, height: number, t: CoverText): Promise<CoverLayers> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { mask: encodeMask(canvas, await drawLayers(t.slug, width, height)), plain: canvas };
  const face = FACES[t.face ?? 'serif'];
  // a title with a colon sets its first part large and the rest as a subtitle
  const split = /^(.+?)\s*[:：]\s*(.+)$/.exec(t.title);
  const main = split ? split[1]! : t.title;
  const sub = split ? split[2]! : '';
  // sized from the short side, so portrait book covers and wide plates both hold the title
  const short = Math.min(width, height / 0.62);
  const titleSize = Math.round(short * 0.112);
  const subSize = Math.round(short * 0.058);
  try {
    await Promise.all([
      document.fonts.load(`500 ${titleSize}px ${face}`, t.title),
    ]);
  } catch {
    // the system faces stand in
  }
  const pad = Math.round(short * 0.09);
  const rtl = t.dir === 'rtl';
  const x = rtl ? width - pad : pad;
  ctx.fillStyle = t.paper;
  ctx.textBaseline = 'alphabetic';

  // the head: the monogram at the top left
  const markH = Math.round(short * 0.075);
  const headBase = pad + markH;
  const scale = markH / 771;
  ctx.save();
  ctx.translate(pad, headBase - markH);
  ctx.scale(scale, scale);
  ctx.translate(8, -214);
  ctx.fill(new Path2D(GT_MARK_PATH), 'evenodd');
  ctx.restore();
  // the foot, from the bottom up: the subtitle, the title
  let base = height - pad;

  ctx.direction = rtl ? 'rtl' : 'ltr';
  ctx.textAlign = rtl ? 'right' : 'left';
  if (sub) {
    ctx.font = `400 ${subSize}px ${face}`;
    ctx.letterSpacing = `${(-0.01 * subSize).toFixed(1)}px`;
    ctx.globalAlpha = 0.8;
    const subLines = balance(ctx, sub, width - pad * 2);
    const subLead = subSize * 1.18;
    subLines.forEach((line, i) => ctx.fillText(line, x, base - (subLines.length - 1 - i) * subLead));
    ctx.globalAlpha = 1;
    base -= subLines.length * subLead + subSize * 0.5;
  }
  // the serif sets at its book weight and a looser fit; the mono at its own spacing
  ctx.font = `${(t.face ?? 'serif') === 'serif' ? 400 : 500} ${titleSize}px ${face}`;
  ctx.letterSpacing = `${((t.face === 'mono' ? -0.04 : t.face === 'sans' ? -0.03 : -0.015) * titleSize).toFixed(1)}px`;
  const lines = balance(ctx, main, width - pad * 2);
  const lead = titleSize * 1.06;
  lines.forEach((line, i) => ctx.fillText(line, x, base - (lines.length - 1 - i) * lead));
  // the emblem stops a gap above the title's first line, so a long title never runs into it
  const titleTop = base - (lines.length - 1) * lead - titleSize * 0.78;
  const layers = await drawLayers(t.slug, width, height, titleTop - short * 0.06);
  return { mask: encodeMask(canvas, layers), plain: withLayers(canvas, layers, t) };
}
