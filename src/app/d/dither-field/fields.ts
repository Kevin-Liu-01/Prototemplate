'use client';

/**
 * DITHER-FIELD — the fork's field compositions.
 *
 * Everything visual on this page that is not type is a 1-bit Bayer field
 * rendered by `src/lib/dither.ts`. This module owns the two big compositions
 * (the hero transmission and the dark band's ground burst) plus a small React
 * hook that mounts a `createDitherLoop` on a canvas and keeps the field's
 * aspect ratio honest across resizes.
 *
 * The compositional law (AESTHETIC_ADDENDUM 2b) applied to ink instead of
 * light: the field is the armature, not wallpaper. The hero's transmission
 * FILLS its framed plate edge to edge — the only paper holes are the ones the
 * composition carves for itself: the source dock on the left edge and each
 * greeting's own margin.
 */

import { useEffect, useRef } from 'react';

import {
  createDitherLoop,
  type DitherLoopHandle,
  type DitherLoopOptions,
  type FieldFn,
} from '@/lib/dither';

const TAU = Math.PI * 2;

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Mutable aspect box. `ditherToCanvas` re-measures the canvas every frame, so
 * the buffer tracks resizes on its own — but a field closure bakes its aspect
 * in. Fields here read aspect through this box and the hook updates it from a
 * ResizeObserver, so rays stay straight at any viewport without tearing the
 * loop down. `height` is the canvas's CSS height in px — fields that print
 * glyph payloads use it to size their box-filter taps to one dither cell.
 */
export type AspectBox = { value: number; height?: number };

/* ------------------------------------------------------------------------ *
 * THE TRANSMISSION's payload — one short greeting per locale.
 *
 * Index 0 is the source string (pinned at the dock's edge); the outer
 * stations cycle through the rest as the wavefronts reach them. Real
 * translations of one line, because the broadcast is the localization story:
 * one source, every locale.
 * ------------------------------------------------------------------------ */

type HelloWord = { text: string; tag: string };

const HELLOS: readonly HelloWord[] = [
  { text: 'hello', tag: 'en' },
  { text: 'hola', tag: 'es' },
  { text: 'こんにちは', tag: 'ja' },
  { text: 'bonjour', tag: 'fr' },
  { text: '你好', tag: 'zh' },
  { text: 'hallo', tag: 'de' },
  { text: '안녕하세요', tag: 'ko' },
  { text: 'مرحبا', tag: 'ar' },
  { text: 'привет', tag: 'ru' },
  { text: 'नमस्ते', tag: 'hi' },
  { text: 'olá', tag: 'pt' },
];

/** A greeting rasterised to a binary coverage grid, ready for field sampling. */
type WordMask = { data: Uint8Array; w: number; h: number };

const WORD_RASTER_PX = 64;

/**
 * Scripts whose glyphs pack strokes densely (Han, kana, Hangul, Devanagari).
 * They are rasterised larger and never stroke-fattened: a 2px stroke that
 * merely bolds a Latin stem floods a hanzi or a Hangul block solid.
 */
const DENSE_SCRIPT = /[ऀ-ॿ぀-ヿ㐀-鿿가-힣]/;

/**
 * Rasterise `word tag` once into a 1-bit mask (word large, BCP-47 tag at half
 * size on the same baseline). System mono keeps the raster synchronous — no
 * webfont wait — and the CJK/Arabic/Devanagari fallbacks are system faces the
 * canvas resolves immediately. SSR gets null and the field simply prints no
 * payload until mounted client-side.
 */
function rasterizeHello(word: HelloWord): WordMask | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  const measureCtx = canvas.getContext('2d', { willReadFrequently: true });
  if (!measureCtx) return null;

  const dense = DENSE_SCRIPT.test(word.text);
  const px = dense ? Math.round(WORD_RASTER_PX * 1.3) : WORD_RASTER_PX;
  // The tag rides at ~0.7 of the word: below that its cap height lands under
  // six display cells at the plate's word sizes and the letters merge into
  // blobs — the one thing a locale tag cannot survive.
  const tagPx = Math.round(WORD_RASTER_PX * 0.72);
  const tagText = word.tag.toUpperCase();
  const family = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
  const wordFont = `600 ${px}px ${family}`;
  const tagFont = `600 ${tagPx}px ${family}`;

  // Tracking keeps stroke-fattened glyphs from merging into blobs after the
  // downsample. letterSpacing is not in older lib.dom typings; feature-detect
  // (the same dance the glyph SDF library does).
  const spacing = (ctx2d: CanvasRenderingContext2D, em: number) => {
    const withSpacing = ctx2d as CanvasRenderingContext2D & { letterSpacing?: string };
    if ('letterSpacing' in withSpacing) withSpacing.letterSpacing = `${em}em`;
  };

  measureCtx.font = wordFont;
  spacing(measureCtx, 0.06);
  const wordW = Math.ceil(measureCtx.measureText(word.text).width);
  measureCtx.font = tagFont;
  spacing(measureCtx, 0.14);
  const tagW = Math.ceil(measureCtx.measureText(tagText).width);
  const gap = Math.round(px * 0.38);

  const w = wordW + gap + tagW + 6;
  const h = Math.ceil(px * 1.42);
  // Resizing resets context state, so the fonts are re-set below.
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#fff';
  ctx.lineJoin = 'round';
  ctx.textBaseline = 'alphabetic';
  const base = Math.round(px * 1.06);
  // Stroke + fill: a thin fixed stroke nudges every stem past one display
  // cell after downsampling (so words print as solid pixel type, not
  // sub-cell dust) without flooding the counters the way a heavy weight or a
  // proportional stroke does. Dense scripts skip the stroke entirely — their
  // structure IS the tight counters — and rely on the larger raster instead.
  ctx.font = wordFont;
  spacing(ctx, 0.06);
  ctx.lineWidth = 2;
  if (!dense) ctx.strokeText(word.text, 3, base);
  ctx.fillText(word.text, 3, base);
  ctx.font = tagFont;
  spacing(ctx, 0.14);
  // The tag runs a lighter stroke: at half the word size, the word's 2px
  // fattening floods an E's counters and the tag prints as a blob.
  ctx.lineWidth = 1.3;
  ctx.strokeText(tagText, 3 + wordW + gap, base);
  ctx.fillText(tagText, 3 + wordW + gap, base);

  const img = ctx.getImageData(0, 0, w, h).data;
  const data = new Uint8Array(w * h);
  for (let i = 0, p = 3; i < data.length; i++, p += 4) {
    data[i] = (img[p] ?? 0) >= 110 ? 1 : 0;
  }
  return { data, w, h };
}

/** Bilinear sample of a binary mask; 0 outside the [0,1] box. */
function sampleMask(m: WordMask, su: number, sv: number): number {
  if (su < 0 || su > 1 || sv < 0 || sv > 1) return 0;
  const gx = su * (m.w - 1);
  const gy = sv * (m.h - 1);
  const x0 = gx | 0;
  const y0 = gy | 0;
  const x1 = x0 + 1 < m.w ? x0 + 1 : x0;
  const y1 = y0 + 1 < m.h ? y0 + 1 : y0;
  const fx = gx - x0;
  const fy = gy - y0;
  const row0 = y0 * m.w;
  const row1 = y1 * m.w;
  const top = m.data[row0 + x0]! + (m.data[row0 + x1]! - m.data[row0 + x0]!) * fx;
  const bottom = m.data[row1 + x0]! + (m.data[row1 + x1]! - m.data[row1 + x0]!) * fx;
  return top + (bottom - top) * fy;
}

/**
 * A payload station: a fixed point in the plate where a greeting materialises
 * out of the dither when a wavefront passes, then dissolves. Positions are in
 * field space so the composition re-hangs itself at any aspect.
 */
type StationSpec = {
  u: number;
  v: number;
  /** Word box height as a fraction of the plate height. */
  hv: number;
  /**
   * Word-cycle offset. Not arbitrary: two stations show the same greeting
   * when their kStar difference matches their offset difference (mod the
   * word count), and kStar differences are pinned by the stations' front
   * reach-times — so a bad pair collides EVERY cycle. These offsets were
   * solved against each layout's reach-times so no two stations can
   * materialise the same greeting at the same time.
   */
  seed: number;
  /**
   * Transit latency in seconds between the front crossing and the word
   * materialising — each locale resolves on its own beat, so the plate never
   * flashes every word in sync.
   */
  delay?: number;
  /** The pinned source station: always lit, always HELLOS[0]. */
  source?: boolean;
};

/* The plate (desktop): the source docks on the pocket's fringe at the left
   edge, ON the wire; six greeting stations occupy the rest of the component —
   a top rank, the mid field, and two standing on the ground limb — so the
   payload inhabits the whole plate the field fills. */
const STATIONS_PLATE: readonly StationSpec[] = [
  { u: 0.22, v: 0.5, hv: 0.135, seed: 0, source: true },
  { u: 0.5, v: 0.23, hv: 0.125, seed: 0 },
  { u: 0.83, v: 0.09, hv: 0.105, seed: 3, delay: 1.3 },
  { u: 0.74, v: 0.4, hv: 0.13, seed: 4, delay: 0.7 },
  { u: 0.47, v: 0.68, hv: 0.12, seed: 5, delay: 0.35 },
  { u: 0.28, v: 0.88, hv: 0.11, seed: 7, delay: 1.1 },
  { u: 0.8, v: 0.85, hv: 0.115, seed: 9, delay: 1.6 },
];

/* Compact plate (stacked mobile): the source plus three stations on a
   diagonal cascade, sized for a ~380px-wide panel. */
const STATIONS_COMPACT: readonly StationSpec[] = [
  { u: 0.26, v: 0.5, hv: 0.12, seed: 0, source: true },
  { u: 0.6, v: 0.2, hv: 0.13, seed: 0 },
  { u: 0.66, v: 0.64, hv: 0.13, seed: 2, delay: 0.8 },
  { u: 0.4, v: 0.87, hv: 0.12, seed: 3, delay: 0.4 },
];

/** Per-frame runtime state for one station. Mutated in place, never per-pixel. */
type StationRt = {
  spec: StationSpec;
  mask: WordMask | null;
  /** Carve strength for the word's paper margin (rises fast, falls with the word). */
  alpha: number;
  /** Dissolve multiplier at end-of-life, 0..1. */
  fall: number;
  /** Assembly wipe progress, 0..1 — the word prints SOLID behind this edge. */
  reveal: number;
  wu: number;
  u0: number;
  v0: number;
  cu0: number;
  cu1: number;
  cv0: number;
  cv1: number;
  padV: number;
  du: number;
  dv: number;
};

export type HeroTransmissionOptions = {
  /** Vertical centre of the source dock, 0..1. Default 0.5. */
  cy?: number;
  /** Dither cell size the canvas renders at; sizes the glyph box filter. Default 4. */
  cellScale?: number;
};

/**
 * THE TRANSMISSION — the hero plate's field.
 *
 * The broadcast made visible as a broadcast, composed to FILL its framed
 * plate. The source pocket rides the plate's LEFT edge — a small paper dock
 * holding the pinned `hello EN` — and everything radiates rightward from it:
 * squircle wavefronts (contours of the dock's own superellipse metric) launch
 * every couple of seconds and sweep the full width of the plate, a fan of
 * needle rays carries signal ticks outward, an ambient print fill keeps the
 * far corners inked, and a dithered planet limb grounds the bottom edge. The
 * payload is the language story itself: real greetings with their locale tags
 * materialise out of the ordered dither at stations spread over the whole
 * component as each front reaches them, then dissolve — glyphs as
 * transmission content, at 1 bit. Each lit word carves its own paper margin
 * (the dock's doctrine applied locally) so payloads stay legible over rings,
 * rays or ground.
 *
 * Everything is a pure function of (u, v, t): fronts and station envelopes
 * are derived from the clock, never accumulated, so the reduced-motion still
 * is a composed frame and pause/resume can never drift.
 */
export function heroTransmission(
  aspect: AspectBox,
  opts: HeroTransmissionOptions = {}
): FieldFn {
  const CY = opts.cy ?? 0.5;
  const CELL = opts.cellScale ?? 4;

  /** The dock's centre sits just off-plate, so the q = 1 fringe cuts a
      half-squircle pocket into the left edge instead of floating a hole. */
  const CX = -0.03;
  /** Vertical stretch on the metric: fronts run wider than tall, so the
      sweep reads as travel across the plate, not concentric halos. */
  const VS = 1.18;
  /** Pocket half-extents in metric units — sized to hug the one source line
      (the headline lives OUTSIDE the plate now, so the paper stays small). */
  const WX = 0.21;
  const WY = 0.15;

  /** The transmission clock: a front is born at the dock fringe every PERIOD
      seconds and travels outward at SPEED dock-units per second until it has
      fully dissolved at Q_GONE (past the far corner, q ~ 6). Fronts exist for
      every integer index, so the plate is already mid-broadcast on the first
      painted frame. */
  const PERIOD = 2.4;
  const SPEED = 0.75;
  const Q_BORN = 1.0;
  const Q_GONE = 6.3;
  const MAX_FRONTS = 6;

  const masks: readonly (WordMask | null)[] = HELLOS.map((w) => rasterizeHello(w));
  const translationCount = HELLOS.length - 1;

  // ---- per-frame state (recomputed when t or aspect changes, never per-pixel)
  let lastT = NaN;
  let lastA = NaN;
  const frontR = new Float64Array(MAX_FRONTS);
  const frontA = new Float64Array(MAX_FRONTS);
  let frontN = 0;
  let stations: StationRt[] = [];
  let lastLayout: readonly StationSpec[] | null = null;

  /** Word life after a front reaches a station: the assembly wipe runs for
      ~0.55s, the word holds SOLID and legible, then dissolves to dust between
      1.7s and 2.3s — shorter than PERIOD, so every station gets a beat of
      clear paper before the next front re-lights it. */
  const revealOf = (ts: number) => clamp01((ts - 0.05) / 0.5);
  const fallOf = (ts: number) => 1 - smoothstep(1.7, 2.3, ts);

  const updateFrame = (t: number, a: number) => {
    lastT = t;
    lastA = a;

    // Live fronts, newest first. R is pure in t and the front index.
    frontN = 0;
    const newest = Math.floor(t / PERIOD);
    for (let k = newest; frontN < MAX_FRONTS; k--) {
      const r = Q_BORN + SPEED * (t - k * PERIOD);
      if (r > Q_GONE) break;
      frontR[frontN] = r;
      frontA[frontN] =
        smoothstep(Q_BORN, 1.25, r) * (1 - smoothstep(5.1, Q_GONE, r));
      frontN++;
    }

    // Layout by rendered WIDTH, not aspect: the plate is squarish on desktop
    // (~1.0) and on the stacked mobile panel (~0.9) alike, so aspect cannot
    // tell them apart — pixel width can.
    const w = a * (aspect.height ?? 600);
    const layout = w < 480 ? STATIONS_COMPACT : STATIONS_PLATE;
    if (layout !== lastLayout) {
      lastLayout = layout;
      stations = layout.map((spec) => ({
        spec,
        mask: null,
        alpha: 0,
        fall: 0,
        reveal: 0,
        wu: 0,
        u0: 0,
        v0: 0,
        cu0: 0,
        cu1: 0,
        cv0: 0,
        cv1: 0,
        padV: 0,
        du: 0,
        dv: 0,
      }));
    }

    const cellsH = Math.max(40, (aspect.height ?? 480) / CELL);
    for (const st of stations) {
      const { spec } = st;
      const dx = (spec.u - CX) * a;
      const dy = (spec.v - CY) * VS;
      const q = Math.pow(
        Math.pow(Math.abs(dx) / WX, 2.4) + Math.pow(Math.abs(dy) / WY, 2.4),
        1 / 2.4
      );

      let wordIdx: number;
      if (spec.source) {
        st.reveal = 1;
        st.fall = 1;
        st.alpha = 1;
        wordIdx = 0;
      } else {
        // When did the most recent front cross this station's radius (plus
        // the station's own transit latency)? The life of that crossing IS
        // the word's life; the crossing index picks which locale
        // materialises, so the languages rotate.
        const reachT = (q - Q_BORN) / SPEED + (spec.delay ?? 0);
        const kStar = Math.floor((t - reachT) / PERIOD);
        const since = t - (kStar * PERIOD + reachT);
        st.reveal = revealOf(since);
        st.fall = fallOf(since);
        // The paper margin opens quickly ahead of the wipe and leaves with
        // the word.
        st.alpha = clamp01(st.reveal * 2.5) * st.fall;
        const cycle = kStar + spec.seed;
        wordIdx = 1 + (((cycle % translationCount) + translationCount) % translationCount);
      }

      st.mask = masks[wordIdx] ?? null;
      if (!st.mask || st.alpha <= 0.004) {
        st.alpha = 0;
        continue;
      }

      const hv = spec.hv;
      st.wu = (hv * (st.mask.w / st.mask.h)) / a;
      st.u0 = spec.u - st.wu / 2;
      st.v0 = spec.v - hv / 2;
      // The source's margin runs tighter: it already sits half in the paper
      // pocket, and the full margin punched a hard slot through the rings.
      st.padV = hv * (spec.source ? 0.42 : 0.6);
      const padU = st.padV / a;
      st.cu0 = st.u0 - padU;
      st.cu1 = st.u0 + st.wu + padU;
      st.cv0 = st.v0 - st.padV;
      st.cv1 = st.v0 + hv + st.padV;
      // Half a display cell in mask space, for the 2x2 box sample that keeps
      // thin strokes from falling between dither cells.
      st.dv = 0.5 / (hv * cellsH);
      st.du = 0.5 / (st.wu * cellsH * a);
    }
  };

  return (u, v, t) => {
    const a = aspect.value;
    if (t !== lastT || a !== lastA) updateFrame(t, a);

    const dx = (u - CX) * a;
    const dy = (v - CY) * VS;

    // The source dock — the composition's hub, docked on the left edge. `q`
    // is superellipse distance from it: <1 inside (always paper), ~1 at the
    // fringe. Everything radiates from this fringe, so the paper pocket
    // itself is the broadcast source and the alignment is one system.
    const qx = Math.abs(dx) / WX;
    const qy = Math.abs(dy) / WY;
    const q = Math.pow(Math.pow(qx, 2.4) + Math.pow(qy, 2.4), 1 / 2.4);

    // --- the payload: greetings materialising at their stations -----------
    let word = 0;
    let carve = 1;
    for (let i = 0; i < stations.length; i++) {
      const st = stations[i]!;
      if (st.alpha <= 0) continue;
      if (u < st.cu0 || u > st.cu1 || v < st.cv0 || v > st.cv1) continue;
      const overX = Math.abs(u - st.spec.u) - st.wu / 2;
      const overY = Math.abs(v - st.spec.v) - st.spec.hv / 2;
      const px = (overX > 0 ? overX : 0) * a;
      const py = overY > 0 ? overY : 0;
      const d = Math.sqrt(px * px + py * py);
      // The word's paper margin materialises with the word itself.
      carve *= 1 - st.alpha * (1 - smoothstep(st.padV * 0.3, st.padV, d));
      if (d === 0) {
        const su = (u - st.u0) / st.wu;
        // The assembly wipe: cells behind the edge print at full value, so a
        // materialising word is SOLID where it exists and dither-dust only at
        // the moving edge (and during the end-of-life dissolve). The edge
        // always enters from the left — the side the front arrives from.
        const gate = smoothstep(0.02, 0.09, st.reveal * 1.11 - su);
        if (gate > 0) {
          const sv = (v - st.v0) / st.spec.hv;
          const m = st.mask!;
          const cov =
            (sampleMask(m, su - st.du, sv - st.dv) +
              sampleMask(m, su + st.du, sv - st.dv) +
              sampleMask(m, su - st.du, sv + st.dv) +
              sampleMask(m, su + st.du, sv + st.dv)) *
            0.25;
          const wv = clamp01((cov - 0.13) * 1.9) * gate * st.fall;
          if (wv > word) word = wv;
        }
      }
    }

    // --- the figure --------------------------------------------------------
    let bg = 0;
    if (q > 0.88) {
      const well = smoothstep(0.88, 1.16, q);

      // ZONE 1 — the rings: two solid contour bands hugging the dock,
      // breathing by a few hundredths of q. Deliberate drawn strokes: solid
      // ink at the core, a one-cell dither fringe at the edges.
      const r1 = 1.32 + 0.02 * Math.sin(t * 0.32);
      const r2 = 1.74 + 0.025 * Math.sin(t * 0.26 + 1.4);
      let rings = (1 - smoothstep(0.016, 0.055, Math.abs(q - r1))) * 0.95;
      const ring2 = (1 - smoothstep(0.014, 0.05, Math.abs(q - r2))) * 0.85;
      if (ring2 > rings) rings = ring2;

      // ZONE 2 — the fan: thick needle rays with signal ticks riding them,
      // radiating rightward from the dock across most of the plate. Reach and
      // weight are fixed harmonics of the angle (integer multiples, so there
      // is no seam at ±π); the tick train flows outward slower than the
      // fronts, so the two speeds read as carrier and pulse.
      let rays = 0;
      if (q > 1.28 && q < 5.2) {
        const th = Math.atan2(dy, dx);
        const reach =
          3.6 +
          0.9 * Math.sin(3 * th + 1.7) +
          0.5 * Math.sin(7 * th - 0.6) +
          0.15 * Math.sin(t * 0.35 + 2 * th);
        const len = reach < 2.6 ? 2.6 : reach;
        const needle = 1 - Math.abs(Math.sin(9 * th + t * 0.05));
        const n2 = needle * needle;
        const n4 = n2 * n2;
        const weight = 0.82 + 0.18 * Math.sin(5 * th + 0.9);
        const rayZone =
          smoothstep(1.3, 1.5, q) * (1 - smoothstep(len - 0.6, len, q));
        const ph = q * 2.6 - t * 0.85;
        const s = ph - Math.floor(ph);
        const tick = smoothstep(0.04, 0.2, s) * (1 - smoothstep(0.55, 0.75, s));
        rays = n4 * rayZone * weight * (0.72 + 0.5 * tick);
      }

      // ZONE 3 — the wavefronts: a crisp crest with a dithered wake trailing
      // behind it (behind = inside, the direction it came from), so every
      // front reads as travel, not as another static ring.
      let front = 0;
      for (let i = 0; i < frontN; i++) {
        const behind = frontR[i]! - q;
        if (behind < -0.08 || behind > 0.6) continue;
        const crest = 1 - smoothstep(0.02, 0.09, Math.abs(behind));
        const wake = behind > 0 ? 0.34 * (1 - smoothstep(0.04, 0.58, behind)) : 0;
        const f = (crest > wake ? crest : wake) * frontA[i]!;
        if (f > front) front = f;
      }

      // ZONE 4 — the print fill: a quiet ambient coverage that rises toward
      // the far corners, so the plate is inked edge to edge (the founder's
      // directive: the field FILLS its component) instead of dissolving to
      // bare paper wherever rays and fronts thin out. Low-frequency sway
      // keeps it reading as material, not a flat tint.
      const amb =
        0.055 +
        0.075 * smoothstep(1.6, 6.2, q) +
        0.02 * Math.sin(u * 7.3 + t * 0.1) * Math.sin(v * 5.7 - t * 0.07);

      // Screen-blend the zones; the well guarantees the dock stays paper.
      bg =
        (1 - (1 - rings) * (1 - rays) * (1 - front) * (1 - clamp01(amb))) *
        well;
    }

    // --- the ground: a dithered planet limb along the bottom edge ----------
    // The limb bows up at the centre (the broadcast stands over a horizon),
    // dense ink at the bottom dissolving upward through loose dust.
    const uu = 2 * (u - 0.5);
    const limb = 0.9 - 0.055 * (1 - uu * uu);
    if (v > limb - 0.06) {
      let ground = smoothstep(limb, limb + 0.14, v) * 0.9;
      const dust = 0.13 * (1 - smoothstep(0, 0.06, limb - v));
      if (dust > ground) ground = dust;
      if (ground > bg) bg = ground;
    }

    const field = bg * carve;
    return field > word ? field : word;
  };
}

/**
 * PANEL BLOOM — the dark band's texture panel, paper-on-ink.
 *
 * The viteplus grammar rebuilt in this fork's material: a halftone bloom —
 * concentric white rings dissolving into loose cells toward the panel's
 * edges — around a committed dark core, and the status terminal floats in
 * that core. The texture never runs under type: the terminal is an opaque
 * plate, and everything inside the core radius is held at ink by the field
 * itself. Confinement is architectural, not statistical.
 */
export function panelBloom(aspect: AspectBox): FieldFn {
  return (u, v, t) => {
    const a = aspect.value;

    const dx = (u - 0.5) * a;
    const dy = v - 0.5;
    const r = Math.sqrt(dx * dx + dy * dy);

    // The dark core the terminal sits in. Nothing prints here.
    if (r <= 0.38) return 0;
    const core = smoothstep(0.38, 0.52, r);

    // The bloom: a ramp toward the edges the dither renders as progressive
    // thickening — the panel's mass.
    const bloom = smoothstep(0.42, 0.98, r) * 0.74;

    // Signal rings drifting slowly outward through the bloom.
    const ridge = 1 - Math.abs(Math.sin((r - t * 0.014) * 4.2 * TAU));
    const ridge2 = ridge * ridge;
    const ridge4 = ridge2 * ridge2;
    const ringZone = smoothstep(0.4, 0.48, r) * (1 - smoothstep(0.9, 1.15, r));
    const rings = ridge4 * ridge4 * ringZone * 0.85;

    return (bloom + rings * (1 - bloom)) * core;
  };
}

/**
 * FLOOR DISSOLVE — the band's bottom edge, paper-on-ink.
 *
 * The classic ordered-dither dissolve: coverage ramps from nothing to a
 * bright floor line across the strip's height, with a slow low-frequency
 * sway so the checkerboard horizon breathes. The strip is mounted in the
 * band's bottom padding, below every line of content, so the one place the
 * texture is allowed to be loose is a place type can never be.
 */
export function floorDissolve(aspect: AspectBox): FieldFn {
  return (u, v, t) => {
    void aspect;
    const sway =
      0.045 * Math.sin(u * 5 * TAU * 0.2 + t * 0.22) +
      0.03 * Math.sin(u * 11 * TAU * 0.2 - t * 0.13);
    return clamp01((v + sway - 0.08) * 0.92);
  };
}

export type UseDitherFieldOptions = Omit<DitherLoopOptions, 'cssWidth' | 'cssHeight'> & {
  /**
   * Resolve the field's ink from the canvas's own computed CSS `color` at
   * mount, and re-resolve whenever the document's `data-theme` attribute
   * flips. A 1-bit field is exactly two colors, so following the theme means
   * flipping the ink, not blending it: style the canvas with
   * `color: var(--tc-ink)` (or any theme-mapped ink) and the dark theme gets
   * light dust on ink-black paper instead of a stale dark-on-dark frame.
   * Fields that live on permanently-dark plates (the band bloom, the floor
   * dissolve) never opt in — their literals are the point.
   */
  themeInk?: boolean;
};

/**
 * Mount an animated dither field on a canvas. Builds the field from a factory
 * that receives a live AspectBox, wires a ResizeObserver into that box, and
 * tears the loop down with the component. Reduced motion is handled inside
 * `createDitherLoop` (single static frame, no rAF at all).
 */
export function useDitherField(
  factory: (aspect: AspectBox) => FieldFn,
  options: UseDitherFieldOptions
): React.RefObject<HTMLCanvasElement | null> {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const optsRef = useRef(options);
  optsRef.current = options;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const box: AspectBox = { value: 1 };
    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        box.value = rect.width / rect.height;
        box.height = rect.height;
      }
    };
    measure();

    const { themeInk, ...loopOptions } = optsRef.current;

    let loop: DitherLoopHandle | null = null;
    loop = createDitherLoop(canvas, factory(box), loopOptions);

    // Theme-following ink: the canvas's computed `color` IS the ink. Resolved
    // once at mount (after the loop's first synchronous frame) and again on
    // every data-theme flip; a static (reduced-motion) loop repaints inside
    // setOptions, a running one picks the new ink up next frame.
    let themeObserver: MutationObserver | undefined;
    if (themeInk) {
      const applyInk = () => {
        const ink = getComputedStyle(canvas).color;
        if (ink) loop?.setOptions({ ink });
      };
      applyInk();
      if (typeof MutationObserver !== 'undefined') {
        themeObserver = new MutationObserver(applyInk);
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-theme'],
        });
      }
    }

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            measure();
            // A static (reduced-motion) loop needs an explicit repaint with
            // the fresh aspect; a running loop picks it up next frame.
            if (loop && !loop.running) loop.render(optsRef.current.reducedMotionTime ?? 0);
          })
        : undefined;
    ro?.observe(canvas);

    return () => {
      ro?.disconnect();
      themeObserver?.disconnect();
      loop?.destroy();
      loop = null;
    };
    // The factory identity is stable by convention (module-level functions).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return canvasRef;
}
