/* An uploaded mark made safe and uniform. An SVG keeps an allowlist of
   shape elements and presentation attributes (no script, style, handler,
   foreignObject, text, image or outside reference); its class and style
   rules are inlined first, a background rect that covers the canvas is
   removed, every paint becomes one black ink on transparent, and the
   viewBox is cut to the drawn ink, strokes, miter tips and caps included.
   A mark that draws near-white shapes over dark ones keeps them as holes
   through an internal luminance mask, so the file still renders as one
   ink. A PNG must have at least one fully transparent pixel, read from its
   decoded pixels. Imports node:zlib only, so node --test loads it
   directly. */
import { inflateSync } from 'node:zlib';

type El = { name: string; attrs: Map<string, string>; children: El[]; text: string };
type Matrix = [number, number, number, number, number, number];
type Box = { x0: number; y0: number; x1: number; y1: number };
type ViewBox = { x: number; y: number; w: number; h: number };
type Point = [number, number];
type Tone = 'ink' | 'hole' | null;
type Join = 'miter' | 'round' | 'bevel';
type Cap = 'butt' | 'round' | 'square';
type StrokeStyle = { half: number; join: Join; limit: number; cap: Cap };
/* what of a shape counts toward the drawn box */
type Ink = { fill: boolean; stroke: StrokeStyle | null };
type Painted = { el: El; parent: El; fill: Tone; stroke: Tone; style: StrokeStyle; matrix: Matrix; onStage: boolean };
/* a line [x0 y0 x1 y1], a cubic [x0 y0 x1 y1 x2 y2 x3 y3] or an elliptic arc [cx cy ux uy vx vy t0 dt],
   the arc being P(t) = C + U cos t + V sin t for t from t0 over dt; local units */
type Seg = { kind: 'line' | 'cubic' | 'arc'; v: number[] };
/* one subpath: its segments in drawing order, and whether it closes */
type Run = { segs: Seg[]; closed: boolean };

export type MarkKind = 'svg' | 'png';
export type NormalizedSvg = { svg: string; mode: 'flat' | 'mask'; tight: boolean };

const SVG_NS = 'http://www.w3.org/2000/svg';
const ELEMENTS = new Set(['svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'defs', 'clipPath', 'mask', 'use', 'symbol']);
/* containers that become a group: their disallowed children drop out and the rest stays */
const UNWRAP = new Set(['a', 'switch']);
const SHAPES = new Set(['path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon']);
/* subtrees that draw nothing by themselves */
const OFFSTAGE = new Set(['defs', 'clipPath', 'mask', 'symbol']);
const PROPS = ['fill', 'fill-rule', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-opacity', 'opacity', 'clip-rule', 'clip-path', 'mask', 'display', 'visibility', 'vector-effect'];
const PAINT_PROPS = ['fill', 'stroke', 'opacity', 'fill-opacity', 'stroke-opacity'];
const ATTRIBUTES = new Set([...PROPS, 'id', 'd', 'x', 'y', 'width', 'height', 'cx', 'cy', 'r', 'rx', 'ry', 'x1', 'y1', 'x2', 'y2', 'points', 'transform', 'viewBox', 'href', 'clipPathUnits', 'maskUnits', 'maskContentUnits', 'pathLength']);
const ROOT_KEEP = ['fill-rule', 'clip-rule', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit'];
const ID = /^[A-Za-z_][\w.:-]*$/;
const URL_REF = /^url\(\s*['"]?#([A-Za-z_][\w.:-]*)['"]?\s*\)$/;
const NUMBER = /[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/y;
const NUMBERS = /[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;
const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];
/* a paint at least this light, drawn among darker ones, is a hole */
const HOLE_LUMINANCE = 0.85;
const BOM = 0xfeff;

function stripBom(text: string): string {
  return text.charCodeAt(0) === BOM ? text.slice(1) : text;
}

/* ------------------------------------------------------------------ */
/* kind and PNG                                                        */

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export function detectKind(bytes: Uint8Array): MarkKind | null {
  if (PNG_SIGNATURE.every((byte, i) => bytes[i] === byte)) return 'png';
  const head = stripBom(new TextDecoder().decode(bytes.subarray(0, 4096)));
  return /^\s*</.test(head) && /<(?:svg:)?svg[\s>]/i.test(head) ? 'svg' : null;
}

const NEEDS_ALPHA = 'The PNG needs a transparent background.';
/* the most decoded scanline bytes read: 4096 by 4096 pixels at 8 bits RGBA */
const MAX_RAW_BYTES = 4096 * 4096 * 4 + 4096;
const CHANNELS: Record<number, number> = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
const DEPTHS: Record<number, number[]> = { 0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16] };
/* Adam7: x start, y start, x step, y step of each pass */
const ADAM7 = [
  [0, 0, 8, 8],
  [4, 0, 8, 8],
  [0, 4, 4, 8],
  [2, 0, 4, 4],
  [0, 2, 2, 4],
  [1, 0, 2, 2],
  [0, 1, 1, 2],
];

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

/** Undoes one scanline's filter in place, against the line above it (zeros for the first). */
function unfilter(kind: number, line: Uint8Array, above: Uint8Array | null, bpp: number): boolean {
  for (let i = 0; i < line.length; i += 1) {
    const a = i >= bpp ? (line[i - bpp] ?? 0) : 0;
    const b = above ? (above[i] ?? 0) : 0;
    const c = above && i >= bpp ? (above[i - bpp] ?? 0) : 0;
    const x = line[i] ?? 0;
    if (kind === 1) line[i] = (x + a) & 255;
    else if (kind === 2) line[i] = (x + b) & 255;
    else if (kind === 3) line[i] = (x + ((a + b) >> 1)) & 255;
    else if (kind === 4) line[i] = (x + paeth(a, b, c)) & 255;
    else if (kind !== 0) return false;
  }
  return true;
}

/** Sample j of a scanline at a bit depth of 1, 2, 4, 8 or 16. */
function sampleAt(line: Uint8Array, j: number, depth: number): number {
  if (depth === 8) return line[j] ?? 0;
  if (depth === 16) return ((line[2 * j] ?? 0) << 8) | (line[2 * j + 1] ?? 0);
  const bit = j * depth;
  return ((line[bit >> 3] ?? 0) >> (8 - depth - (bit & 7))) & ((1 << depth) - 1);
}

/** An error sentence, or null when the PNG decodes and has at least one fully transparent pixel. */
export function checkPng(bytes: Uint8Array): string | null {
  if (detectKind(bytes) !== 'png' || bytes.length < 33) return 'The file is not a PNG.';
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunks = new Map<string, Uint8Array>();
  const data: Uint8Array[] = [];
  for (let at = 8; at + 12 <= bytes.length; ) {
    const length = view.getUint32(at);
    const type = String.fromCharCode(...bytes.subarray(at + 4, at + 8));
    const body = bytes.subarray(at + 8, at + 8 + length);
    if (body.length !== length) return 'The PNG is cut short.';
    if (type === 'IEND') break;
    if (type === 'IDAT') data.push(body);
    else if (!chunks.has(type)) chunks.set(type, body);
    at += 12 + length;
  }
  const header = chunks.get('IHDR');
  const trns = chunks.get('tRNS') ?? null;
  if (!header || header.length < 13) return 'The file is not a PNG.';
  const head = new DataView(header.buffer, header.byteOffset, header.byteLength);
  const width = head.getUint32(0);
  const height = head.getUint32(4);
  const depth = header[8] ?? 0;
  const colorType = header[9] ?? -1;
  const interlaced = header[12] === 1;
  if (width === 0 || height === 0 || !data.length) return 'The PNG has no pixels.';
  const channels = CHANNELS[colorType];
  if (!channels || !DEPTHS[colorType]?.includes(depth)) return 'The file is not a PNG.';
  const alpha = colorType === 4 || colorType === 6;
  if (!alpha && !trns) return NEEDS_ALPHA;

  const bitsPerPixel = channels * depth;
  const bpp = Math.max(1, bitsPerPixel >> 3);
  const passes = (interlaced ? ADAM7 : [[0, 0, 1, 1]]).map(([x0 = 0, y0 = 0, dx = 1, dy = 1]) => ({
    w: width > x0 ? Math.ceil((width - x0) / dx) : 0,
    h: height > y0 ? Math.ceil((height - y0) / dy) : 0,
  }));
  let expected = 0;
  for (const pass of passes) if (pass.w && pass.h) expected += pass.h * (1 + Math.ceil((pass.w * bitsPerPixel) / 8));
  if (expected > MAX_RAW_BYTES) return 'The PNG has too many pixels.';
  let raw: Uint8Array;
  try {
    raw = inflateSync(Buffer.concat(data), { maxOutputLength: expected + 1024 });
  } catch {
    return 'The PNG could not be read.';
  }
  if (raw.length < expected) return 'The PNG is cut short.';

  /* the sample values that mean "transparent" for a type without an alpha channel */
  const key = trns && !alpha ? Array.from({ length: Math.floor(trns.length / 2) }, (_, i) => ((trns[2 * i] ?? 0) << 8) | (trns[2 * i + 1] ?? 0)) : [];
  const clear = (line: Uint8Array, x: number): boolean => {
    if (colorType === 6 || colorType === 4) return sampleAt(line, x * channels + channels - 1, depth) === 0;
    if (colorType === 3) {
      const index = sampleAt(line, x, depth);
      return trns !== null && index < trns.length && trns[index] === 0;
    }
    if (colorType === 0) return key.length >= 1 && sampleAt(line, x, depth) === key[0];
    return key.length >= 3 && [0, 1, 2].every((k) => sampleAt(line, x * 3 + k, depth) === key[k]);
  };

  let offset = 0;
  for (const pass of passes) {
    if (!pass.w || !pass.h) continue;
    const stride = Math.ceil((pass.w * bitsPerPixel) / 8);
    let above: Uint8Array | null = null;
    for (let y = 0; y < pass.h; y += 1) {
      const kind = raw[offset] ?? 0;
      const line = raw.subarray(offset + 1, offset + 1 + stride);
      offset += 1 + stride;
      if (!unfilter(kind, line, above, bpp)) return 'The PNG could not be read.';
      for (let x = 0; x < pass.w; x += 1) if (clear(line, x)) return null;
      above = line;
    }
  }
  return NEEDS_ALPHA;
}

/* ------------------------------------------------------------------ */
/* parse and serialize                                                 */

const TOKEN = /<!--[\s\S]*?-->|<!\[CDATA\[([\s\S]*?)\]\]>|<!DOCTYPE[^[>]*(?:\[[\s\S]*?\])?\s*>|<![^>]*>|<\?[\s\S]*?\?>|<\/\s*([^\s>]+)\s*>|<([A-Za-z_][\w:.-]*)((?:\s+[^\s=/>]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>|([^<]+)|</gi;
const ATTR = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function decode(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (whole, entity: string) => {
    const lower = entity.toLowerCase();
    if (!lower.startsWith('#')) return ENTITIES[lower] ?? whole;
    const code = lower.startsWith('#x') ? parseInt(lower.slice(2), 16) : parseInt(lower.slice(1), 10);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : String.fromCharCode(0xfffd);
  });
}

function localName(name: string): string {
  return name.startsWith('svg:') ? name.slice(4) : name;
}

function parse(source: string): El | null {
  const root: El = { name: '#root', attrs: new Map(), children: [], text: '' };
  const stack: El[] = [root];
  for (const match of stripBom(source).matchAll(TOKEN)) {
    const [whole, cdata, close, open, rawAttrs, selfClose, text] = match;
    const top = stack[stack.length - 1] as El;
    if (cdata !== undefined) top.text += cdata;
    else if (text !== undefined) top.text += decode(text);
    else if (close !== undefined) {
      const name = localName(close);
      let at = stack.length - 1;
      while (at > 0 && stack[at]?.name !== name) at -= 1;
      if (at === 0) return null;
      stack.length = at;
    } else if (open !== undefined) {
      const el: El = { name: localName(open), attrs: new Map(), children: [], text: '' };
      for (const attr of (rawAttrs ?? '').matchAll(ATTR)) {
        el.attrs.set(attr[1] as string, decode(attr[2] ?? attr[3] ?? attr[4] ?? ''));
      }
      top.children.push(el);
      if (!selfClose) stack.push(el);
    } else if (whole === '<') return null;
  }
  const svgs = root.children.filter((el) => el.name === 'svg');
  return svgs.length === 1 ? (svgs[0] as El) : null;
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function serialize(el: El): string {
  const attrs = [...el.attrs].map(([name, value]) => ` ${name}="${escapeAttr(value)}"`).join('');
  if (!el.children.length) return `<${el.name}${attrs}/>`;
  return `<${el.name}${attrs}>${el.children.map(serialize).join('')}</${el.name}>`;
}

function walk(el: El, visit: (el: El) => void): void {
  visit(el);
  for (const child of el.children) walk(child, visit);
}

/* ------------------------------------------------------------------ */
/* sanitize                                                            */

type Rule = { tag: string | null; id: string | null; classes: string[]; decls: [string, string][] };

function declarations(text: string): [string, string][] {
  const out: [string, string][] = [];
  for (const part of text.split(';')) {
    const colon = part.indexOf(':');
    if (colon < 0) continue;
    const prop = part.slice(0, colon).trim().toLowerCase();
    const value = part.slice(colon + 1).replace(/\s*!\s*important\s*$/i, '').trim();
    if (PROPS.includes(prop) && value) out.push([prop, value]);
  }
  return out;
}

/* simple selectors only (tag, #id, .class and their compounds); any other selector is skipped */
function cssRules(css: string): Rule[] {
  const rules: Rule[] = [];
  for (const match of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const decls = declarations(match[2] ?? '');
    if (!decls.length) continue;
    for (const raw of (match[1] ?? '').split(',')) {
      const selector = raw.trim();
      const parts = /^([A-Za-z][\w-]*)?((?:[.#][\w-]+)*)$/.exec(selector);
      if (!selector || !parts) continue;
      const rest = parts[2] ?? '';
      rules.push({
        tag: parts[1] ?? null,
        id: /#([\w-]+)/.exec(rest)?.[1] ?? null,
        classes: [...rest.matchAll(/\.([\w-]+)/g)].map((m) => m[1] as string),
        decls,
      });
    }
  }
  return rules;
}

function safeValue(name: string, value: string): string | null {
  const v = value.trim();
  if (!v || /[<>]|javascript:|expression\(|@import/i.test(v)) return null;
  if (name === 'href') return /^#[A-Za-z_][\w.:-]*$/.test(v) ? v : null;
  if (name === 'id') return ID.test(v) ? v : null;
  if (/url\(/i.test(v)) return URL_REF.test(v) ? v : null;
  return v;
}

function sanitize(el: El, rules: Rule[]): El | null {
  const name = UNWRAP.has(el.name) ? 'g' : el.name;
  if (!ELEMENTS.has(name)) return null;
  const attrs = new Map<string, string>();
  for (const [raw, value] of el.attrs) {
    const attr = raw === 'xlink:href' ? 'href' : raw;
    if (ATTRIBUTES.has(attr)) attrs.set(attr, value);
  }
  const classes = (el.attrs.get('class') ?? '').split(/\s+/).filter(Boolean);
  for (const rule of rules) {
    if (rule.tag && rule.tag !== el.name) continue;
    if (rule.id && rule.id !== el.attrs.get('id')) continue;
    if (!rule.classes.every((c) => classes.includes(c))) continue;
    for (const [prop, value] of rule.decls) attrs.set(prop, value);
  }
  for (const [prop, value] of declarations(el.attrs.get('style') ?? '')) attrs.set(prop, value);
  for (const [attr, value] of attrs) {
    const safe = safeValue(attr, value);
    if (safe === null) attrs.delete(attr);
    else attrs.set(attr, safe);
  }
  if (attrs.get('display') === 'none' || /^(hidden|collapse)$/.test(attrs.get('visibility') ?? '')) return null;
  const children = el.children.map((child) => sanitize(child, rules)).filter((child): child is El => child !== null);
  return { name, attrs, children, text: '' };
}

/* ------------------------------------------------------------------ */
/* geometry                                                            */

class Bail extends Error {}

function multiply(m: Matrix, n: Matrix): Matrix {
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
  ];
}

function apply(m: Matrix, x: number, y: number): Point {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

function numbers(text: string): number[] {
  return [...text.matchAll(NUMBERS)].map((m) => Number(m[0]));
}

function unit(x: number, y: number): Point | null {
  const length = Math.hypot(x, y);
  return length > 1e-12 ? [x / length, y / length] : null;
}

/** The matrix of a transform list; throws Bail when it cannot be read. */
function transformOf(value: string | undefined): Matrix {
  if (!value) return IDENTITY;
  const re = /(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g;
  if (value.replace(re, '').replace(/[\s,]/g, '')) throw new Bail();
  let m = IDENTITY;
  for (const match of value.matchAll(re)) {
    const a = numbers(match[2] ?? '');
    const rad = ((a[0] ?? 0) * Math.PI) / 180;
    let t: Matrix;
    if (match[1] === 'matrix') {
      if (a.length !== 6) throw new Bail();
      t = a as Matrix;
    } else if (match[1] === 'translate') t = [1, 0, 0, 1, a[0] ?? 0, a[1] ?? 0];
    else if (match[1] === 'scale') t = [a[0] ?? 1, 0, 0, a[1] ?? a[0] ?? 1, 0, 0];
    else if (match[1] === 'rotate') {
      const [cx, cy] = [a[1] ?? 0, a[2] ?? 0];
      const r: Matrix = [Math.cos(rad), Math.sin(rad), -Math.sin(rad), Math.cos(rad), 0, 0];
      t = multiply(multiply([1, 0, 0, 1, cx, cy], r), [1, 0, 0, 1, -cx, -cy]);
    } else if (match[1] === 'skewX') t = [1, 0, Math.tan(rad), 1, 0, 0];
    else t = [1, Math.tan(rad), 0, 1, 0, 0];
    m = multiply(m, t);
  }
  if (!m.every(Number.isFinite)) throw new Bail();
  return m;
}

/* an arc command in center form (SVG implementation notes F.6.5); null when it is a straight line */
function arcOf(x1: number, y1: number, rxIn: number, ryIn: number, angle: number, large: number, sweep: number, x2: number, y2: number): number[] | null {
  let rx = Math.abs(rxIn);
  let ry = Math.abs(ryIn);
  if ((x1 === x2 && y1 === y2) || !rx || !ry) return null;
  const phi = (angle * Math.PI) / 180;
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const xp = cos * dx + sin * dy;
  const yp = -sin * dx + cos * dy;
  const lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }
  const num = rx * rx * ry * ry - rx * rx * yp * yp - ry * ry * xp * xp;
  const den = rx * rx * yp * yp + ry * ry * xp * xp;
  const coef = (large === sweep ? -1 : 1) * (den ? Math.sqrt(Math.max(0, num / den)) : 0);
  const cxp = (coef * rx * yp) / ry;
  const cyp = (-coef * ry * xp) / rx;
  const between = (ux: number, uy: number, vx: number, vy: number) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const theta = between(1, 0, (xp - cxp) / rx, (yp - cyp) / ry);
  let delta = between((xp - cxp) / rx, (yp - cyp) / ry, (-xp - cxp) / rx, (-yp - cyp) / ry);
  if (!sweep && delta > 0) delta -= 2 * Math.PI;
  else if (sweep && delta < 0) delta += 2 * Math.PI;
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2;
  const cy = sin * cxp + cos * cyp + (y1 + y2) / 2;
  return [cx, cy, rx * cos, rx * sin, -ry * sin, ry * cos, theta, delta];
}

/** A path's subpaths; null when its data cannot be read. */
export function parsePath(d: string): Run[] | null {
  const runs: Run[] = [];
  let open = false;
  const add = (kind: Seg['kind'], v: number[]) => {
    if (!open) runs.push({ segs: [], closed: false });
    open = true;
    (runs[runs.length - 1] as Run).segs.push({ kind, v });
  };
  let i = 0;
  const skip = () => {
    while (i < d.length && ' \t\n\r\f,'.includes(d.charAt(i))) i += 1;
  };
  const num = (): number => {
    skip();
    NUMBER.lastIndex = i;
    const match = NUMBER.exec(d);
    if (!match) throw new Bail();
    i = NUMBER.lastIndex;
    return Number(match[0]);
  };
  const flag = (): number => {
    skip();
    const c = d.charAt(i);
    if (c !== '0' && c !== '1') throw new Bail();
    i += 1;
    return c === '1' ? 1 : 0;
  };
  let [x, y, startX, startY, ctrlX, ctrlY] = [0, 0, 0, 0, 0, 0];
  let prev = '';
  let cmd = '';
  try {
    for (;;) {
      skip();
      if (i >= d.length) break;
      const c = d.charAt(i);
      if (/[A-Za-z]/.test(c)) {
        if (!'MmLlHhVvCcSsQqTtAaZz'.includes(c)) return null;
        cmd = c;
        i += 1;
      } else if (!cmd || cmd === 'Z' || cmd === 'z') return null;
      const rel = cmd === cmd.toLowerCase();
      const ox = rel ? x : 0;
      const oy = rel ? y : 0;
      const upper = cmd.toUpperCase();
      if (upper === 'Z') {
        if (open) {
          const run = runs[runs.length - 1] as Run;
          if (x !== startX || y !== startY) run.segs.push({ kind: 'line', v: [x, y, startX, startY] });
          run.closed = true;
        }
        open = false;
        [x, y] = [startX, startY];
      } else if (upper === 'M') {
        [x, y] = [ox + num(), oy + num()];
        [startX, startY] = [x, y];
        runs.push({ segs: [], closed: false });
        open = true;
        cmd = rel ? 'l' : 'L';
      } else if (upper === 'L' || upper === 'H' || upper === 'V') {
        const nx = upper === 'V' ? x : ox + num();
        const ny = upper === 'H' ? y : oy + num();
        if (!open) [startX, startY] = [x, y];
        add('line', [x, y, nx, ny]);
        [x, y] = [nx, ny];
      } else if (upper === 'C' || upper === 'S') {
        const reflect = prev === 'C' || prev === 'S';
        const x1 = upper === 'S' ? (reflect ? 2 * x - ctrlX : x) : ox + num();
        const y1 = upper === 'S' ? (reflect ? 2 * y - ctrlY : y) : oy + num();
        const [x2, y2, ex, ey] = [ox + num(), oy + num(), ox + num(), oy + num()];
        if (!open) [startX, startY] = [x, y];
        add('cubic', [x, y, x1, y1, x2, y2, ex, ey]);
        [ctrlX, ctrlY, x, y] = [x2, y2, ex, ey];
      } else if (upper === 'Q' || upper === 'T') {
        const reflect = prev === 'Q' || prev === 'T';
        const qx = upper === 'T' ? (reflect ? 2 * x - ctrlX : x) : ox + num();
        const qy = upper === 'T' ? (reflect ? 2 * y - ctrlY : y) : oy + num();
        const [ex, ey] = [ox + num(), oy + num()];
        if (!open) [startX, startY] = [x, y];
        add('cubic', [x, y, x + (2 / 3) * (qx - x), y + (2 / 3) * (qy - y), ex + (2 / 3) * (qx - ex), ey + (2 / 3) * (qy - ey), ex, ey]);
        [ctrlX, ctrlY, x, y] = [qx, qy, ex, ey];
      } else {
        const [rx, ry, rot] = [num(), num(), num()];
        const [large, sweep] = [flag(), flag()];
        const [ex, ey] = [ox + num(), oy + num()];
        const arc = arcOf(x, y, rx, ry, rot, large, sweep, ex, ey);
        if (!open) [startX, startY] = [x, y];
        if (arc) add('arc', arc);
        else if (ex !== x || ey !== y) add('line', [x, y, ex, ey]);
        [x, y] = [ex, ey];
      }
      prev = upper;
    }
  } catch (error) {
    if (error instanceof Bail) return null;
    throw error;
  }
  return runs.every((run) => run.segs.every((seg) => seg.v.every(Number.isFinite))) ? runs : null;
}

function cubicExtent(p0: number, p1: number, p2: number, p3: number): [number, number] {
  let min = Math.min(p0, p3);
  let max = Math.max(p0, p3);
  const a = -p0 + 3 * p1 - 3 * p2 + p3;
  const b = 2 * (p0 - 2 * p1 + p2);
  const c = p1 - p0;
  const roots: number[] = [];
  if (Math.abs(a) < 1e-12) {
    if (Math.abs(b) > 1e-12) roots.push(-c / b);
  } else {
    const disc = b * b - 4 * a * c;
    if (disc >= 0) roots.push((-b + Math.sqrt(disc)) / (2 * a), (-b - Math.sqrt(disc)) / (2 * a));
  }
  for (const t of roots) {
    if (!(t > 0 && t < 1)) continue;
    const u = 1 - t;
    const v = u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
    min = Math.min(min, v);
    max = Math.max(max, v);
  }
  return [min, max];
}

/* the range of c + u cos t + v sin t for t from t0 over dt */
function arcExtent(c: number, u: number, v: number, t0: number, dt: number): [number, number] {
  const reach = Math.hypot(u, v);
  if (Math.abs(dt) >= 2 * Math.PI - 1e-12) return [c - reach, c + reach];
  const at = (t: number) => c + u * Math.cos(t) + v * Math.sin(t);
  const lo = Math.min(t0, t0 + dt);
  const hi = Math.max(t0, t0 + dt);
  let min = Math.min(at(lo), at(hi));
  let max = Math.max(at(lo), at(hi));
  const base = Math.atan2(v, u);
  for (let k = Math.ceil((lo - base) / Math.PI); base + k * Math.PI <= hi; k += 1) {
    const value = at(base + k * Math.PI);
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  return [min, max];
}

function union(a: Box | null, b: Box | null): Box | null {
  if (!a) return b;
  if (!b) return a;
  return { x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) };
}

function grow(box: Box, by: number): Box {
  return { x0: box.x0 - by, y0: box.y0 - by, x1: box.x1 + by, y1: box.y1 + by };
}

function ends(seg: Seg): [number, number, number, number] {
  const v = seg.v;
  if (seg.kind === 'line') return [v[0], v[1], v[2], v[3]];
  if (seg.kind === 'cubic') return [v[0], v[1], v[6], v[7]];
  const at = (t: number): Point => [v[0] + v[2] * Math.cos(t) + v[4] * Math.sin(t), v[1] + v[3] * Math.cos(t) + v[5] * Math.sin(t)];
  return [...at(v[6]), ...at(v[6] + v[7])];
}

/* the direction of travel where a segment starts and where it ends */
function direction(seg: Seg, end: boolean): Point | null {
  const v = seg.v;
  if (seg.kind === 'line') return unit(v[2] - v[0], v[3] - v[1]);
  if (seg.kind === 'cubic') {
    return end
      ? (unit(v[6] - v[4], v[7] - v[5]) ?? unit(v[6] - v[2], v[7] - v[3]) ?? unit(v[6] - v[0], v[7] - v[1]))
      : (unit(v[2] - v[0], v[3] - v[1]) ?? unit(v[4] - v[0], v[5] - v[1]) ?? unit(v[6] - v[0], v[7] - v[1]));
  }
  const t = end ? v[6] + v[7] : v[6];
  const sign = Math.sign(v[7]);
  return unit(sign * (-v[2] * Math.sin(t) + v[4] * Math.cos(t)), sign * (-v[3] * Math.sin(t) + v[5] * Math.cos(t)));
}

/* the exact box of a segment's centerline under m */
function segBox(seg: Seg, m: Matrix): Box {
  const v = seg.v;
  if (seg.kind === 'arc') {
    const [x, y] = apply(m, v[0], v[1]);
    const [x0, x1] = arcExtent(x, m[0] * v[2] + m[2] * v[3], m[0] * v[4] + m[2] * v[5], v[6], v[7]);
    const [y0, y1] = arcExtent(y, m[1] * v[2] + m[3] * v[3], m[1] * v[4] + m[3] * v[5], v[6], v[7]);
    return { x0, y0, x1, y1 };
  }
  const p = Array.from({ length: v.length / 2 }, (_, j) => apply(m, v[2 * j], v[2 * j + 1]));
  if (seg.kind === 'line') {
    return { x0: Math.min(p[0][0], p[1][0]), y0: Math.min(p[0][1], p[1][1]), x1: Math.max(p[0][0], p[1][0]), y1: Math.max(p[0][1], p[1][1]) };
  }
  const [x0, x1] = cubicExtent(p[0][0], p[1][0], p[2][0], p[3][0]);
  const [y0, y1] = cubicExtent(p[0][1], p[1][1], p[2][1], p[3][1]);
  return { x0, y0, x1, y1 };
}

/* where a miter join reaches: the vertex plus the outward bisector at half / sin(angle / 2), or null when the
   segments run straight on or the miter limit bevels it */
function miterTip(into: Point | null, out: Point | null, vx: number, vy: number, half: number, limit: number): Point | null {
  if (!into || !out) return null;
  const cos = -(into[0] * out[0] + into[1] * out[1]);
  if (cos <= -1 + 1e-9) return null;
  const sinHalf = Math.sqrt((1 - cos) / 2);
  if (sinHalf < 1e-9 || 1 / sinHalf > limit) return null;
  const outward = unit(into[0] - out[0], into[1] - out[1]);
  return outward ? [vx + (outward[0] * half) / sinHalf, vy + (outward[1] * half) / sinHalf] : null;
}

/* the drawn box of a shape under m: its fill, and its stroke with joins and caps */
function inkBox(runs: Run[], m: Matrix, ink: Ink): Box | null {
  let box: Box | null = null;
  const s = ink.stroke;
  const half = s?.half ?? 0;
  const reach = half * Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2]));
  const point = (x: number, y: number, r = 0) => {
    const [px, py] = apply(m, x, y);
    box = union(box, { x0: px - r, y0: py - r, x1: px + r, y1: py + r });
  };
  for (const run of runs) {
    for (const seg of run.segs) {
      const line = segBox(seg, m);
      if (ink.fill) box = union(box, line);
      if (!s) continue;
      if (seg.kind !== 'line') {
        box = union(box, grow(line, reach));
        continue;
      }
      const d = direction(seg, false);
      if (!d) continue;
      const [x0, y0, x1, y1] = ends(seg);
      const [nx, ny] = [-d[1] * half, d[0] * half];
      point(x0 + nx, y0 + ny);
      point(x0 - nx, y0 - ny);
      point(x1 + nx, y1 + ny);
      point(x1 - nx, y1 - ny);
    }
    if (!s || !run.segs.length) continue;
    const segs = run.segs;
    const joints: [Seg, Seg][] = segs.slice(1).map((seg, j) => [segs[j] as Seg, seg]);
    if (run.closed && segs.length > 1) joints.push([segs[segs.length - 1] as Seg, segs[0] as Seg]);
    for (const [a, b] of joints) {
      const [, , vx, vy] = ends(a);
      if (s.join === 'round') point(vx, vy, reach);
      else if (s.join === 'miter') {
        const tip = miterTip(direction(a, true), direction(b, false), vx, vy, half, s.limit);
        if (tip) point(tip[0], tip[1]);
      }
    }
    if (run.closed || s.cap === 'butt') continue;
    const first = segs[0] as Seg;
    const last = segs[segs.length - 1] as Seg;
    const [sx, sy] = ends(first);
    const [, , ex, ey] = ends(last);
    if (s.cap === 'round') {
      point(sx, sy, reach);
      point(ex, ey, reach);
      continue;
    }
    /* a square cap reaches half a width past the end, half a width to each side */
    const square = (x: number, y: number, d: Point | null, along: number) => {
      if (!d) return;
      for (const side of [1, -1]) point(x + d[0] * along - d[1] * half * side, y + d[1] * along + d[0] * half * side);
    };
    square(sx, sy, direction(first, false), -half);
    square(ex, ey, direction(last, true), half);
  }
  return box;
}

function length(value: string | undefined, axis: 'x' | 'y' | 'r', vb: ViewBox): number {
  if (value === undefined || value.trim() === '') return 0;
  const v = value.trim();
  const n = Number.parseFloat(v);
  if (!Number.isFinite(n)) throw new Bail();
  if (v.endsWith('%')) {
    const base = axis === 'x' ? vb.w : axis === 'y' ? vb.h : Math.hypot(vb.w, vb.h) / Math.SQRT2;
    return (n / 100) * base;
  }
  if (/[a-z]$/i.test(v) && !/px$/i.test(v)) throw new Bail();
  return n;
}

function polyline(points: number[], closed: boolean): Run {
  const segs: Seg[] = [];
  const count = Math.floor(points.length / 2);
  for (let j = 1; j <= (closed ? count : count - 1); j += 1) {
    const [ax, ay] = [points[2 * (j - 1)] as number, points[2 * (j - 1) + 1] as number];
    const [bx, by] = [points[2 * (j % count)] as number, points[2 * (j % count) + 1] as number];
    if (ax !== bx || ay !== by) segs.push({ kind: 'line', v: [ax, ay, bx, by] });
  }
  return { segs, closed };
}

/** A shape's subpaths in its own units; null when it draws nothing; throws Bail when it cannot be measured. */
function shapeGeometry(el: El, vb: ViewBox): Run[] | null {
  const a = (name: string, axis: 'x' | 'y' | 'r') => length(el.attrs.get(name), axis, vb);
  if (el.name === 'rect') {
    const [x, y, w, h] = [a('x', 'x'), a('y', 'y'), a('width', 'x'), a('height', 'y')];
    return w > 0 && h > 0 ? [polyline([x, y, x + w, y, x + w, y + h, x, y + h], true)] : null;
  }
  if (el.name === 'circle' || el.name === 'ellipse') {
    const [rx, ry] = el.name === 'circle' ? [a('r', 'r'), a('r', 'r')] : [a('rx', 'x'), a('ry', 'y')];
    return rx > 0 && ry > 0 ? [{ segs: [{ kind: 'arc', v: [a('cx', 'x'), a('cy', 'y'), rx, 0, 0, ry, 0, 2 * Math.PI] }], closed: true }] : null;
  }
  if (el.name === 'line') return [polyline([a('x1', 'x'), a('y1', 'y'), a('x2', 'x'), a('y2', 'y')], false)];
  if (el.name === 'polyline' || el.name === 'polygon') {
    const points = numbers(el.attrs.get('points') ?? '');
    return points.length >= 4 ? [polyline(points, el.name === 'polygon')] : null;
  }
  if (el.name === 'path') {
    const runs = parsePath(el.attrs.get('d') ?? '');
    if (!runs) throw new Bail();
    return runs.some((run) => run.segs.length) ? runs : null;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* paint                                                               */

function parseColor(value: string): [number, number, number, number] | null {
  const v = value.trim().toLowerCase();
  if (v === 'white') return [255, 255, 255, 1];
  if (v === 'black') return [0, 0, 0, 1];
  const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(v)?.[1];
  if (hex) {
    const full = hex.length <= 4 ? [...hex].map((c) => c + c).join('') : hex;
    const n = (i: number) => parseInt(full.slice(i * 2, i * 2 + 2), 16);
    return [n(0), n(1), n(2), full.length === 8 ? n(3) / 255 : 1];
  }
  const fn = /^rgba?\(([^)]*)\)$/.exec(v)?.[1];
  if (!fn) return null;
  const parts = fn.split(/[\s,/]+/).filter(Boolean);
  const channel = (p: string | undefined, max: number) => (p === undefined ? max : p.endsWith('%') ? (parseFloat(p) / 100) * max : parseFloat(p));
  const rgba: [number, number, number, number] = [channel(parts[0], 255), channel(parts[1], 255), channel(parts[2], 255), channel(parts[3], 1)];
  return rgba.every(Number.isFinite) ? rgba : null;
}

function luminance([r, g, b]: [number, number, number, number]): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** ink for a dark or unreadable paint (currentColor, a gradient), hole for near white, null for none. */
export function toneOf(paint: string | undefined): Tone {
  const v = (paint ?? '').trim().toLowerCase();
  if (!v || v === 'none' || v === 'transparent') return null;
  const rgba = parseColor(v);
  if (!rgba) return 'ink';
  if (rgba[3] <= 0) return null;
  return luminance(rgba) >= HOLE_LUMINANCE ? 'hole' : 'ink';
}

function isZero(value: string | undefined): boolean {
  return value !== undefined && Number.parseFloat(value) === 0;
}

type Context = {
  fill: string;
  stroke: string;
  hidden: boolean;
  fillOff: boolean;
  strokeOff: boolean;
  matrix: Matrix;
  width: number;
  join: Join;
  cap: Cap;
  limit: number;
};

type Survey = { measurable: boolean; uses: boolean };

/* every shape outside masks and clip paths with its effective paint, on stage unless it sits in defs or a
   symbol; a transform that cannot be read leaves the drawing unmeasured, not unpainted */
function collectPainted(el: El, parent: El, ctx: Context, isRoot: boolean, onStage: boolean, out: Painted[], survey: Survey): void {
  if (el.name === 'mask' || el.name === 'clipPath') return;
  const stage = onStage && !OFFSTAGE.has(el.name);
  const own = (name: string) => el.attrs.get(name);
  let transform = IDENTITY;
  if (!isRoot) {
    try {
      transform = transformOf(own('transform'));
    } catch (error) {
      if (!(error instanceof Bail)) throw error;
      survey.measurable = false;
    }
  }
  const join = own('stroke-linejoin');
  const cap = own('stroke-linecap');
  const limit = Number.parseFloat(own('stroke-miterlimit') ?? '');
  const next: Context = {
    fill: own('fill') ?? ctx.fill,
    stroke: own('stroke') ?? ctx.stroke,
    hidden: ctx.hidden || isZero(own('opacity')),
    fillOff: own('fill-opacity') !== undefined ? isZero(own('fill-opacity')) : ctx.fillOff,
    strokeOff: own('stroke-opacity') !== undefined ? isZero(own('stroke-opacity')) : ctx.strokeOff,
    matrix: multiply(ctx.matrix, transform),
    width: own('stroke-width') !== undefined ? Number.parseFloat(own('stroke-width') ?? '') : ctx.width,
    join: join === 'round' || join === 'bevel' ? join : join !== undefined ? 'miter' : ctx.join,
    cap: cap === 'round' || cap === 'square' ? cap : cap !== undefined ? 'butt' : ctx.cap,
    limit: limit >= 1 ? limit : ctx.limit,
  };
  if (el.name === 'use' && stage && !next.hidden) survey.uses = true;
  if (!SHAPES.has(el.name)) {
    for (const child of el.children) collectPainted(child, el, next, false, stage, out, survey);
    return;
  }
  const fill = next.hidden || next.fillOff || el.name === 'line' ? null : toneOf(next.fill);
  const stroke = next.hidden || next.strokeOff || !(next.width > 0) ? null : toneOf(next.stroke);
  const style: StrokeStyle = { half: stroke ? next.width / 2 : 0, join: next.join, limit: next.limit, cap: next.cap };
  out.push({ el, parent, fill, stroke, style, matrix: next.matrix, onStage: stage });
}

/* a rect, or a path of at most four straight edges, filled across the whole canvas */
function isBackground(p: Painted, vb: ViewBox): boolean {
  if (!p.fill || p.stroke || (p.el.name !== 'rect' && p.el.name !== 'path')) return false;
  let box: Box | null = null;
  try {
    const runs = shapeGeometry(p.el, vb);
    if (!runs || runs.filter((run) => run.segs.length).length !== 1) return false;
    const segs = runs.flatMap((run) => run.segs);
    if (segs.length > 4 || segs.some((seg) => seg.kind !== 'line')) return false;
    box = inkBox(runs, p.matrix, { fill: true, stroke: null });
  } catch {
    return false;
  }
  const tol = Math.max(vb.w, vb.h) * 0.01;
  return Boolean(box && box.x0 <= vb.x + tol && box.y0 <= vb.y + tol && box.x1 >= vb.x + vb.w - tol && box.y1 >= vb.y + vb.h - tol);
}

/* ------------------------------------------------------------------ */
/* normalize                                                           */

function readViewBox(svg: El): ViewBox | null {
  const parts = numbers(svg.attrs.get('viewBox') ?? '');
  if (parts.length === 4 && (parts[2] as number) > 0 && (parts[3] as number) > 0) {
    return { x: parts[0] as number, y: parts[1] as number, w: parts[2] as number, h: parts[3] as number };
  }
  const width = svg.attrs.get('width') ?? '';
  const height = svg.attrs.get('height') ?? '';
  const w = Number.parseFloat(width);
  const h = Number.parseFloat(height);
  return w > 0 && h > 0 && !width.endsWith('%') && !height.endsWith('%') ? { x: 0, y: 0, w, h } : null;
}

function format(n: number): string {
  return String(Number(n.toPrecision(8)));
}

/* the box rounded outward at four significant digits of its larger side; a value within a
   millionth of a step of the grid is float noise and snaps to it first */
function roundOut(box: Box): ViewBox {
  const q = 10 ** (Math.floor(Math.log10(Math.max(box.x1 - box.x0, box.y1 - box.y0))) - 3);
  const steps = (v: number) => (Math.abs(v / q - Math.round(v / q)) < 1e-6 ? Math.round(v / q) : v / q);
  const x = Math.floor(steps(box.x0)) * q;
  const y = Math.floor(steps(box.y0)) * q;
  return { x, y, w: Math.ceil(steps(box.x1)) * q - x, h: Math.ceil(steps(box.y1)) * q - y };
}

/* the drawn box of a subtree (shapes in `inks` only), cut by a measurable clip path; throws Bail */
function boxOf(el: El, parent: Matrix, inks: Map<El, Ink>, ids: Map<string, El>, vb: ViewBox, isRoot: boolean): Box | null {
  if (OFFSTAGE.has(el.name)) return null;
  const m = multiply(parent, isRoot ? IDENTITY : transformOf(el.attrs.get('transform')));
  let box: Box | null = null;
  if (SHAPES.has(el.name)) {
    const ink = inks.get(el);
    const runs = ink ? shapeGeometry(el, vb) : null;
    box = ink && runs ? inkBox(runs, m, ink) : null;
  } else {
    for (const child of el.children) box = union(box, boxOf(child, m, inks, ids, vb, false));
  }
  const clipId = URL_REF.exec(el.attrs.get('clip-path') ?? '')?.[1];
  const clip = clipId ? ids.get(clipId) : undefined;
  if (box && clip?.name === 'clipPath' && clip.attrs.get('clipPathUnits') !== 'objectBoundingBox') {
    const shapes = new Map<El, Ink>();
    walk(clip, (child) => {
      if (SHAPES.has(child.name)) shapes.set(child, { fill: true, stroke: null });
    });
    const cm = multiply(m, transformOf(clip.attrs.get('transform')));
    let clipBox: Box | null = null;
    for (const child of clip.children) clipBox = union(clipBox, boxOf(child, cm, shapes, ids, vb, false));
    if (clipBox) {
      box = { x0: Math.max(box.x0, clipBox.x0), y0: Math.max(box.y0, clipBox.y0), x1: Math.min(box.x1, clipBox.x1), y1: Math.min(box.y1, clipBox.y1) };
      if (box.x1 <= box.x0 || box.y1 <= box.y0) box = null;
    }
  }
  return box;
}

function descendantsOf(root: El, name: string): Set<El> {
  const out = new Set<El>();
  walk(root, (el) => {
    if (el.name === name) walk(el, (child) => out.add(child));
  });
  return out;
}

/** The safe, one-ink version of an SVG mark, or an error sentence. */
export function normalizeSvg(source: string): NormalizedSvg | { error: string } {
  const parsed = parse(source);
  if (!parsed) return { error: 'The file is not a readable SVG.' };
  let css = '';
  walk(parsed, (el) => {
    if (el.name === 'style') css += `${el.text}\n`;
  });
  const svg = sanitize(parsed, cssRules(css));
  if (!svg) return { error: 'The file is not a readable SVG.' };
  const vb = readViewBox(svg);
  if (!vb) return { error: 'The SVG needs a viewBox or a width and height.' };

  /* a use or a nested svg draws through a viewport this code does not measure: keep the canvas, one flat ink */
  let simple = false;
  walk(svg, (el) => {
    if (el.name === 'use' || (el !== svg && el.name === 'svg')) simple = true;
  });
  const painted: Painted[] = [];
  const survey: Survey = { measurable: true, uses: false };
  const start: Context = { fill: 'black', stroke: 'none', hidden: false, fillOff: false, strokeOff: false, matrix: IDENTITY, width: 1, join: 'miter', cap: 'butt', limit: 4 };
  collectPainted(svg, svg, start, true, true, painted, survey);
  if (!survey.measurable) simple = true;
  const drawn = painted.filter((p) => p.onStage && (p.fill || p.stroke));
  const first = drawn[0];
  if (!simple && first && drawn.length > 1 && isBackground(first, vb)) {
    first.parent.children = first.parent.children.filter((child) => child !== first.el);
    drawn.shift();
  }
  if (!drawn.length && !survey.uses) return { error: 'The SVG draws nothing.' };
  const tones = drawn.flatMap((p) => [p.fill, p.stroke]);
  const mode: 'flat' | 'mask' = !simple && tones.includes('ink') && tones.includes('hole') ? 'mask' : 'flat';

  /* paint: masks keep theirs, clip paths and containers lose theirs, shapes take the one ink */
  const inMask = descendantsOf(svg, 'mask');
  const inClip = descendantsOf(svg, 'clipPath');
  const byEl = new Map(painted.map((p) => [p.el, p]));
  const paint = (tone: Tone) => (tone === 'ink' ? (mode === 'mask' ? '#fff' : '#000') : tone === 'hole' ? '#000' : 'none');
  walk(svg, (el) => {
    if (inMask.has(el)) return;
    const p = byEl.get(el);
    for (const name of PAINT_PROPS) el.attrs.delete(name);
    if (inClip.has(el) || !SHAPES.has(el.name) || !p) return;
    el.attrs.set('fill', paint(p.fill));
    el.attrs.set('stroke', paint(p.stroke));
  });

  let box: Box | null = null;
  if (!simple) {
    const counts = (tone: Tone) => (mode === 'mask' ? tone === 'ink' : tone !== null);
    const inks = new Map<El, Ink>();
    for (const p of drawn) {
      if (counts(p.fill) || counts(p.stroke)) inks.set(p.el, { fill: counts(p.fill), stroke: counts(p.stroke) ? p.style : null });
    }
    const ids = new Map<string, El>();
    walk(svg, (el) => {
      const id = el.attrs.get('id');
      if (id) ids.set(id, el);
    });
    try {
      box = boxOf(svg, IDENTITY, inks, ids, vb, true);
    } catch (error) {
      if (!(error instanceof Bail)) throw error;
    }
  }
  const tight = Boolean(box && box.x1 > box.x0 && box.y1 > box.y0 && [box.x0, box.y0, box.x1, box.y1].every(Number.isFinite));
  const view = tight && box ? roundOut(box) : vb;

  const attrs = new Map<string, string>([
    ['xmlns', SVG_NS],
    ['viewBox', [view.x, view.y, view.w, view.h].map(format).join(' ')],
    ['width', format(view.w)],
    ['height', format(view.h)],
  ]);
  for (const name of ROOT_KEEP) {
    const value = svg.attrs.get(name);
    if (value) attrs.set(name, value);
  }
  let children = svg.children;
  if (mode === 'mask') {
    const taken = new Set<string>();
    walk(svg, (el) => {
      const id = el.attrs.get('id');
      if (id) taken.add(id);
    });
    let id = 'pt-ink';
    for (let n = 2; taken.has(id); n += 1) id = `pt-ink-${n}`;
    const area: [string, string][] = [
      ['x', format(view.x)],
      ['y', format(view.y)],
      ['width', format(view.w)],
      ['height', format(view.h)],
    ];
    children = [
      { name: 'mask', attrs: new Map([['id', id], ['maskUnits', 'userSpaceOnUse'], ...area]), children, text: '' },
      { name: 'rect', attrs: new Map([...area, ['fill', '#000'], ['mask', `url(#${id})`]]), children: [], text: '' },
    ];
  }
  return { svg: serialize({ name: 'svg', attrs, children, text: '' }), mode, tight };
}
