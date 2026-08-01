/**
 * glyphField — this fork's shader: a canvas-2D particle system of glyphs
 * drawn from eight scripts, drifting as depth-sorted ink on paper. The field
 * condenses into the word "language" in one script after another: the held
 * word PRINTS as real solid typography (fillText — machined contours, never
 * a mosaic), then crumbles to dust at the peel front, and that dust IS the
 * next word's material — it flies straight into the next print. Only the
 * deficit is called out of the visible rain (keeping its rain material
 * until it lands and inks up), and any surplus dust flies home to its own
 * slot in the fall. Nothing spawns mid-air and nothing vanishes mid-flight.
 * The two brand threads run under the word as the rail the composition
 * stands on, and a caliper bracket prints the word's measured advance
 * while it holds.
 *
 * Craft constraints, in order:
 * - One preallocated pool. Every per-particle number lives in a typed array
 *   allocated once at init; the frame loop allocates nothing.
 * - 1-bit material. The page's materials law allows greys only via dither,
 *   so depth is rendered as size + Bayer coverage: near glyphs are solid
 *   ink, mid and far glyphs are ordered-dithered ink at fixed coverages,
 *   thresholded once in the atlas. The frame loop never touches globalAlpha
 *   for the field — every mark is pure ink or absent.
 * - The rain is set in columns (a 34px pitch with small fixed jitter), so
 *   the field reads as composed typesetting, not static.
 * - The held word is typography, not particles: particles land, the word
 *   prints over them with a hard clip front, and they are absorbed. A small
 *   ring of orbiters keeps visibly condensing into the word through the
 *   hold, so any still carries the "field becomes the word" argument.
 * - The type column, the held word's own paper, and the bottom seam above
 *   the script ledger are all dithered density falloffs (per-particle
 *   threshold) — no alpha veil ever sits behind content, and the field
 *   ends composed instead of running into the dark band.
 * - prefers-reduced-motion renders exactly one frame — the printed word,
 *   its caliper, and the frozen orbiters — and never starts the loop.
 */

export type ScriptSample = {
  tag: string;
  script: string;
  /** The word "language", in that language. Real translations, never soup. */
  word: string;
  lang: string;
  rtl?: boolean;
};

/** Cycle order. The field boots printed on the first entry. */
export const SCRIPTS: readonly ScriptSample[] = [
  { tag: 'zh', script: 'Han', word: '语言', lang: 'zh' },
  { tag: 'ar', script: 'Arabic', word: 'لغة', lang: 'ar', rtl: true },
  { tag: 'hi', script: 'Devanagari', word: 'भाषा', lang: 'hi' },
  { tag: 'ru', script: 'Cyrillic', word: 'язык', lang: 'ru' },
  { tag: 'ko', script: 'Hangul', word: '언어', lang: 'ko' },
  { tag: 'el', script: 'Greek', word: 'γλώσσα', lang: 'el' },
  { tag: 'th', script: 'Thai', word: 'ภาษา', lang: 'th' },
  { tag: 'en', script: 'Latin', word: 'language', lang: 'en' },
];

/**
 * The drifting inventory: letters of the eight words themselves (plus 文字,
 * 한 — writing, Korean — from the same vocabulary). Standalone-safe forms
 * only: no combining marks that would render with a dotted circle.
 */
export const GLYPHS: readonly string[] = [
  'l', 'a', 'n', 'g', 'e', 't',
  '语', '言', '文', '字',
  'ل', 'غ', 'ة',
  'भ', 'ष', 'म', 'न',
  'я', 'з', 'ы', 'к',
  '언', '어', '한',
  'γ', 'λ', 'σ', 'α',
  'ภ', 'า', 'ษ',
];

export const POOL = 1280;

/** Particles nearer than this never condense — they stay foreground rain. */
const NEAR_CUT = 0.14;
/** Depth boundary between the mid and far tiers. */
const MID_CUT = 0.6;
/** Glyph size by depth tier: near, mid, far (CSS px). */
const TIER_SIZE: readonly [number, number, number] = [19, 13, 10];
/**
 * The 1-bit ink coverage per tier. Near and mid are solid ink at their two
 * sizes; the far tier is Bayer-dithered — the sanctioned way to render the
 * atmosphere's "grey". Two solid sizes plus one halftone plus the printed
 * word are the field's whole palette.
 */
const TIER_COVER: readonly [number, number, number] = [1, 1, 0.45];
/** Flight glyphs draw at one size, solid ink. */
const CONDENSED_PX = 12;
/**
 * Word-sampling pitch, comfortably under the flight glyph size: the landed
 * swarm sketches the word without overprinting into scribble, and the
 * printed fill — not the particles — is what carries the word at rest.
 */
const COND_PITCH = 9;
/** Atlas row for the condensed size — drawn at native px, no downscaling blur. */
const COND_ROW = 3;
const ATLAS_ROWS = 4;
const CELL = 30;
/**
 * The field's resting ink — the page's light-mode `--tc-ink`, kept as the
 * fallback. At init (and on every `data-theme` flip) the engine re-resolves
 * the live token off the canvas, so in dark mode the rain, the printed word,
 * the threads and the caliper all flip to the white ramp while light mode
 * renders byte-for-byte what this constant always drew.
 */
const INK = '#070707';
/** The rain's column pitch: the field is set, not scattered. */
const COL_PITCH = 34;

/* The loop, in seconds: print, hold, peel, fly. The field is mostly IN
   MOTION by design — each formed word rests for about a second, then
   dissolves, spreads, reorganizes and forms the next, one continuous
   movement. */
const HOLD = 1.2;
const MORPH = 2.4;
const CYCLE = HOLD + MORPH;
/**
 * The first word starts dissolving after roughly a second — the field
 * should be alive almost immediately. (Reduced motion still renders the
 * printed word as a still.)
 */
const FIRST_HOLD = 1.2;
const FIRST_CYCLE = FIRST_HOLD + MORPH;
/** The print front's sweep at the start of a hold. */
const PRINT = 0.5;
/** The peel front's sweep at the start of a morph. */
const PEEL = 0.7;
/** Each particle's own flight time inside the morph. */
const FLIGHT = MORPH - PEEL;

/** Number of orbiters — glyphs visibly condensing into the held word. */
const ORB = 10;

/** Ordered 4×4 Bayer matrix for the atlas's 1-bit tiers. */
const BAYER: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** Deterministic PRNG so a reload composes the same field. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function easeInOutCubic(u: number): number {
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

function smoothstep(a: number, b: number, x: number): number {
  const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/**
 * Threshold the atlas's mid and far rows through the Bayer matrix, in CSS-px
 * cells: every kept pixel becomes full ink, every dropped one paper. Runs at
 * atlas build time only — the frame loop draws pre-dithered bitmaps.
 */
export function ditherAtlasRows(
  ctx: CanvasRenderingContext2D,
  widthPx: number,
  heightPx: number,
  dpr: number,
  rowOfY: (cssY: number) => number,
  coverOfRow: (row: number) => number,
): void {
  const img = ctx.getImageData(0, 0, widthPx, heightPx);
  const data = img.data;
  for (let y = 0; y < heightPx; y++) {
    const cssY = Math.floor(y / dpr);
    const cover = coverOfRow(rowOfY(cssY));
    if (cover >= 1) continue;
    const by = cssY % 4;
    const bayerRow = BAYER[by] ?? BAYER[0] ?? [0, 8, 2, 10];
    for (let x = 0; x < widthPx; x++) {
      const idx = (y * widthPx + x) * 4 + 3;
      const alpha = data[idx] ?? 0;
      if (alpha === 0) continue;
      const bx = Math.floor(x / dpr) % 4;
      const threshold = ((bayerRow[bx] ?? 0) + 0.5) / 16;
      data[idx] = (alpha / 255) * cover > threshold ? 255 : 0;
    }
  }
  ctx.putImageData(img, 0, 0);
}

export type GlyphFieldOptions = {
  canvas: HTMLCanvasElement;
  /** Resolved font-family strings, read off the page so canvas type matches. */
  displayFamily?: string;
  monoFamily?: string;
  /** Fired when the field commits to a script (index into SCRIPTS). */
  onScript?: (index: number) => void;
};

export type GlyphFieldHandle = { destroy(): void };

export function createGlyphField(options: GlyphFieldOptions): GlyphFieldHandle | null {
  const { canvas, onScript } = options;
  const maybeCtx = canvas.getContext('2d');
  if (!maybeCtx) return null;
  /* Bound once so the closures below see a non-null context. */
  const ctx: CanvasRenderingContext2D = maybeCtx;

  const disp = options.displayFamily || "'Switzer', ui-sans-serif, system-ui, sans-serif";
  const mono = options.monoFamily || "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* The ink follows the theme: `--tc-ink` resolves to the printed constant on
     paper and to the white ramp under [data-theme='dark']. Resolved off the
     canvas so the value is the page's own, never a guess. */
  const resolveInk = (): string =>
    getComputedStyle(canvas).getPropertyValue('--tc-ink').trim() || INK;
  let ink = resolveInk();

  /* ---------- the pool ---------- */

  const rand = mulberry32(0x67746c67);
  const ux = new Float32Array(POOL); // unit home position, kept for resize
  const uy = new Float32Array(POOL);
  const hx = new Float32Array(POOL); // home in CSS px, column-snapped
  const hy = new Float32Array(POOL);
  const z = new Float32Array(POOL); // 0 near … 1 far
  const phase = new Float32Array(POOL);
  const period = new Float32Array(POOL);
  const fall = new Float32Array(POOL); // px/s downward drift
  const sway = new Float32Array(POOL);
  const stag = new Float32Array(POOL); // per-particle uniform for dithered culls
  const bow = new Float32Array(POOL); // flight-path curvature, −1 … 1
  const tx = new Float32Array(POOL); // condensation target
  const ty = new Float32Array(POOL);
  const fx = new Float32Array(POOL); // flight origin, snapshotted per morph
  const fy = new Float32Array(POOL);
  const dep = new Float32Array(POOL); // departure order inside the peel
  const lastX = new Float32Array(POOL); // where the particle stood last frame
  const lastY = new Float32Array(POOL);
  const gi = new Uint16Array(POOL); // glyph index
  const tier = new Uint8Array(POOL);
  const inPrev = new Uint8Array(POOL); // membership in the outgoing word
  const inNext = new Uint8Array(POOL); // membership in the incoming word
  const order = new Uint16Array(POOL); // draw order, far → near, sorted once
  const pick = new Uint16Array(POOL); // eligible indices, shuffled once
  const cand = new Uint16Array(POOL); // per-resample candidate order (dust first)
  const slot = new Uint16Array(POOL); // sampled point k → particle index

  let eligibleCount = 0;
  for (let i = 0; i < POOL; i++) {
    ux[i] = rand();
    uy[i] = rand();
    const depth = Math.pow(rand(), 0.82); // bias toward far — atmosphere
    z[i] = depth;
    phase[i] = rand() * Math.PI * 2;
    period[i] = 7 + rand() * 8;
    fall[i] = 2.2 + (1 - depth) * 7.5;
    sway[i] = 1.5 + (1 - depth) * 2.5;
    stag[i] = rand();
    bow[i] = rand() * 2 - 1;
    const scriptAt = Math.floor(rand() * 8);
    const per = Math.ceil(GLYPHS.length / 8);
    gi[i] = Math.min(GLYPHS.length - 1, scriptAt * per + Math.floor(rand() * per));
    tier[i] = depth < NEAR_CUT ? 0 : depth < MID_CUT ? 1 : 2;
    if (depth >= NEAR_CUT) eligibleCount++;
  }

  for (let i = 0; i < POOL; i++) order[i] = i;
  /* Far first. z never changes, so one sort covers every frame. */
  order.sort((a, b) => (z[b] ?? 0) - (z[a] ?? 0));

  let pc = 0;
  for (let i = 0; i < POOL; i++) if ((z[i] ?? 0) >= NEAR_CUT) pick[pc++] = i;
  for (let i = pc - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const a = pick[i] ?? 0;
    pick[i] = pick[j] ?? 0;
    pick[j] = a;
  }

  /* Orbiters: fixed spawn geometry, one glyph each, cycling forever. */
  const orbSeedA = new Float32Array(ORB);
  const orbSeedR = new Float32Array(ORB);
  const orbGlyph = new Uint16Array(ORB);
  for (let j = 0; j < ORB; j++) {
    orbSeedA[j] = rand();
    orbSeedR[j] = rand();
    orbGlyph[j] = Math.floor(rand() * GLYPHS.length);
  }

  /* ---------- layout ---------- */

  let w = 0;
  let h = 0;
  let dpr = 1;
  let narrow = false;
  let zoneCx = 0;
  let zoneW = 0;
  let baselineY = 0;
  let railY = 0;
  let maxFont = 0;
  /* The copy clearing: field density falls to zero toward the text block. */
  let fadeA = 0;
  let fadeB = 0;
  /* The bottom seam: density falls to zero before the script ledger. */
  let botA = 0;
  let botB = 0;

  function layout(): void {
    narrow = w < 880;
    if (narrow) {
      zoneCx = w * 0.5;
      zoneW = Math.max(120, w - 48);
      baselineY = h * 0.78;
      maxFont = Math.min(h * 0.19, 116);
      fadeB = h * 0.52;
      fadeA = h * 0.62;
    } else {
      const left = w * 0.47;
      zoneW = Math.max(240, w - 40 - left);
      zoneCx = left + zoneW / 2;
      baselineY = h * 0.55;
      maxFont = Math.min(h * 0.36, 232);
      fadeB = w * 0.43;
      fadeA = w * 0.55;
    }
    railY = Math.min(h - 26, baselineY + maxFont * 0.3 + 18);
    botB = h - 6;
    botA = narrow ? railY + 26 : h - 88;
    for (let i = 0; i < POOL; i++) {
      const px = ux[i] ?? 0;
      /* Homes snap to a column pitch, with a small fixed jitter, so the rain
         reads as set type. The type column stays the field's clearing: every
         home sits to the right of it (below it on narrow); the clearing edge
         itself is a per-frame dithered density falloff. */
      const raw = narrow ? px * w : (0.4 + px * 0.63) * w;
      hx[i] = Math.round(raw / COL_PITCH) * COL_PITCH + (bow[i] ?? 0) * 4;
      const py = uy[i] ?? 0;
      hy[i] = narrow ? h * (0.5 + py * 0.5) : py * h;
    }
  }

  /* ---------- glyph atlas ---------- */

  const atlas = document.createElement('canvas');
  const atlasCtx = atlas.getContext('2d', { willReadFrequently: true });

  function buildAtlas(): void {
    if (!atlasCtx) return;
    atlas.width = Math.max(1, Math.round(GLYPHS.length * CELL * dpr));
    atlas.height = Math.max(1, Math.round(ATLAS_ROWS * CELL * dpr));
    atlasCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    atlasCtx.clearRect(0, 0, GLYPHS.length * CELL, ATLAS_ROWS * CELL);
    atlasCtx.fillStyle = ink;
    atlasCtx.textAlign = 'center';
    atlasCtx.textBaseline = 'middle';
    /* Rows 0–2 are the rain tiers; row 3 is the flight size at native px,
       so a flying glyph never draws through a downscale. */
    for (let row = 0; row < ATLAS_ROWS; row++) {
      const px = row === COND_ROW ? CONDENSED_PX : TIER_SIZE[row] ?? 10;
      atlasCtx.font = `500 ${px}px ${disp}`;
      for (let col = 0; col < GLYPHS.length; col++) {
        atlasCtx.fillText(GLYPHS[col] ?? '', col * CELL + CELL / 2, row * CELL + CELL / 2);
      }
    }
    /* The 1-bit pass: mid and far rows become Bayer-dithered ink. */
    ditherAtlasRows(
      atlasCtx,
      atlas.width,
      atlas.height,
      dpr,
      (cssY) => Math.min(ATLAS_ROWS - 1, Math.floor(cssY / CELL)),
      (row) => (row === COND_ROW ? 1 : TIER_COVER[row] ?? 1),
    );
  }

  /* ---------- word sampling ---------- */

  const sample = document.createElement('canvas');
  const sampleCtx = sample.getContext('2d', { willReadFrequently: true });
  const pts = new Float32Array(POOL * 2);
  let ptCount = 0;
  let sampledWord = -1;
  let formedLeft = 0;
  let formedRight = 0;
  let formedAdvance = 0;
  let formedLabel = '';
  let formedLabelW = 0;
  let formedWord = '';
  let formedFont = '';
  let formedPx = 0;
  let formedRtl = false;
  /* The outgoing word, snapshotted at each morph start for the peel. */
  let prevLeft = 0;
  let prevRight = 0;
  let prevWord = '';
  let prevFont = '';
  let prevPx = 0;
  let prevRtl = false;

  function scan(step: number, sw: number, sh: number, cap: number): number {
    if (!sampleCtx) return 0;
    const img = sampleCtx.getImageData(0, 0, sw, sh);
    const data = img.data;
    let count = 0;
    let rowIndex = 0;
    for (let sy = 0; sy < sh; sy += step, rowIndex++) {
      const off = rowIndex % 2 === 1 ? step >> 1 : 0;
      for (let sx = off; sx < sw; sx += step) {
        if ((data[(sy * sw + sx) * 4 + 3] ?? 0) < 140) continue;
        if (count >= cap) return count + 1; // signal overflow, caller re-steps
        pts[count * 2] = sx;
        pts[count * 2 + 1] = sy;
        count++;
      }
    }
    return count;
  }

  /**
   * Rasterize one word into target points and hand them to the eligible
   * particles. Runs once per cycle (and on resize / font arrival) — the only
   * allocation it makes is getImageData's own buffer, well off the frame loop.
   */
  function resample(wordIndex: number): void {
    if (!sampleCtx || w === 0) return;
    const entry = SCRIPTS[wordIndex];
    if (!entry) return;

    /* MATTER IS CONSERVED, WORD FIRST: the outgoing word's own particles
       are the incoming word's material — the dust the peel releases flies
       straight into the next print, so one word visibly becomes the next.
       Only the deficit recruits from rain that is actually visible in the
       fall right now (the eye watches it leave), any surplus dust flies
       home to its own rain slot, and culled rain is the last resort, so a
       word never starves. (Rain position formula: keep in sync with
       draw().) */
    const wrapC = h + 60;
    let cc = 0;
    for (let k = 0; k < eligibleCount; k++) {
      const i = pick[k] ?? 0;
      if (inNext[i] === 1) cand[cc++] = i;
    }
    for (let k = 0; k < eligibleCount; k++) {
      const i = pick[k] ?? 0;
      if (inNext[i] === 1) continue;
      const rx =
        (hx[i] ?? 0) + Math.sin(simT / (period[i] ?? 8) + (phase[i] ?? 0)) * (sway[i] ?? 2);
      let ry = (hy[i] ?? 0) + simT * (fall[i] ?? 3);
      ry = ((ry % wrapC) + wrapC) % wrapC;
      ry -= 30;
      if (keepAt(rx, ry, true) > (stag[i] ?? 0)) cand[cc++] = i;
    }
    if (cc < eligibleCount) {
      for (let k = 0; k < eligibleCount; k++) {
        const i = pick[k] ?? 0;
        if (inNext[i] === 1) continue;
        let seen = false;
        for (let q = 0; q < cc; q++)
          if (cand[q] === i) {
            seen = true;
            break;
          }
        if (!seen) cand[cc++] = i;
      }
    }

    let fontPx = maxFont;
    sampleCtx.font = `500 ${fontPx}px ${disp}`;
    let advance = sampleCtx.measureText(entry.word).width;
    if (advance > zoneW) {
      fontPx = Math.max(24, (fontPx * zoneW) / advance);
    }

    const pad = 10;
    const yb = Math.round(fontPx * 1.08);
    const sw = Math.min(2048, Math.ceil(zoneW + pad * 2));
    const sh = Math.min(1024, Math.ceil(fontPx * 1.5));
    sample.width = sw;
    sample.height = sh;
    sampleCtx.clearRect(0, 0, sw, sh);
    sampleCtx.fillStyle = '#000';
    sampleCtx.textAlign = 'left';
    sampleCtx.textBaseline = 'alphabetic';
    sampleCtx.font = `500 ${fontPx}px ${disp}`;
    advance = sampleCtx.measureText(entry.word).width;
    sampleCtx.fillText(entry.word, pad, yb);

    /* Pitch stays under the flight glyph size so the landed swarm sketches
       the word discretely; overflow steps the pitch back up. */
    const cap = eligibleCount;
    let step = Math.max(6, Math.min(COND_PITCH, Math.round(fontPx / 13)));
    let count = scan(step, sw, sh, cap);
    while (count > cap && step < 24) {
      step = Math.max(step + 1, Math.round(step * Math.sqrt(count / cap)));
      count = scan(step, sw, sh, cap);
    }
    ptCount = Math.min(count, cap);

    const left = zoneCx - advance / 2;
    formedLeft = left;
    formedRight = left + advance;
    formedAdvance = Math.round(advance);
    /* The caliper value and its measured width, fixed for the whole hold. */
    formedLabel = `advance ${formedAdvance}px · ${entry.tag}`;
    sampleCtx.font = `500 11.5px ${mono}`;
    formedLabelW = sampleCtx.measureText(formedLabel).width;
    /* The fill the swarm becomes: same word, same metrics, same origin. */
    formedWord = entry.word;
    formedFont = `500 ${fontPx}px ${disp}`;
    formedPx = fontPx;
    formedRtl = entry.rtl === true;

    inNext.fill(0);
    for (let k = 0; k < ptCount; k++) {
      const p = cand[k] ?? 0;
      tx[p] = left + (pts[k * 2] ?? 0) - pad;
      ty[p] = baselineY + (pts[k * 2 + 1] ?? 0) - yb;
      inNext[p] = 1;
      slot[k] = p;
    }
    sampledWord = wordIndex;
  }

  /**
   * Refresh the formed word's fill metrics against newly-loaded font faces
   * WITHOUT re-dealing the swarm: membership and targets keep their
   * geometry (one cycle of subtly stale sketch beats teleporting glyphs);
   * the fill, the caliper and the cleared zone take the true metrics now.
   */
  function remeasure(wordIndex: number): void {
    if (!sampleCtx || w === 0) return;
    const entry = SCRIPTS[wordIndex];
    if (!entry) return;
    let fontPx = maxFont;
    sampleCtx.font = `500 ${fontPx}px ${disp}`;
    let advance = sampleCtx.measureText(entry.word).width;
    if (advance > zoneW) {
      fontPx = Math.max(24, (fontPx * zoneW) / advance);
    }
    sampleCtx.font = `500 ${fontPx}px ${disp}`;
    advance = sampleCtx.measureText(entry.word).width;
    const left = zoneCx - advance / 2;
    formedLeft = left;
    formedRight = left + advance;
    formedAdvance = Math.round(advance);
    formedLabel = `advance ${formedAdvance}px · ${entry.tag}`;
    sampleCtx.font = `500 11.5px ${mono}`;
    formedLabelW = sampleCtx.measureText(formedLabel).width;
    formedWord = entry.word;
    formedFont = `500 ${fontPx}px ${disp}`;
    formedPx = fontPx;
    formedRtl = entry.rtl === true;
  }

  /* ---------- the frame ---------- */

  let simT = 0;
  let pendingResample = false;
  /* Zone gates, 0…1: how strongly the incoming/outgoing word's cleared hole
     applies to the rain this frame. Driven by the cycle in draw() so the
     holes GROW and HEAL as dithered ramps — the background never gains or
     loses a block of glyphs in a single frame. */
  let nextGate = 1;
  let prevGate = 0;
  let lastTs = -1;
  let raf = 0;
  let running = false;
  let visible = true;
  let destroyed = false;
  let announcedWord = -1;
  let morphedCycle = -1;

  /** Where the loop stands at time t — the single phase authority. */
  function phaseAt(t: number): { cycle: number; p: number; holdDur: number } {
    if (t < FIRST_CYCLE) return { cycle: 0, p: t, holdDur: FIRST_HOLD };
    const t2 = t - FIRST_CYCLE;
    const cycle = 1 + Math.floor(t2 / CYCLE);
    return { cycle, p: t2 - (cycle - 1) * CYCLE, holdDur: HOLD };
  }
  const morphingNow = (): boolean => {
    const ph = phaseAt(simT);
    return ph.p >= ph.holdDur;
  };

  function announce(index: number): void {
    if (index === announcedWord) return;
    announcedWord = index;
    onScript?.(index);
  }

  /**
   * The rain's keep-probability at (x, y): the product of the type-column
   * clearing, the bottom seam above the ledger, and the held word's own
   * paper. Each particle compares it to its fixed uniform and either draws
   * at full tier material or not at all — dithered edges, no veils.
   */
  function keepAt(x: number, y: number, morphing: boolean): number {
    let k = smoothstep(fadeB, fadeA, narrow ? y : x);
    if (k <= 0) return 0;
    k *= 1 - smoothstep(botA, botB, y);
    if (k <= 0) return 0;
    /* The doubled rail is the brand's thread — rain never strikes it. */
    k *= smoothstep(10, 22, Math.abs(y - (railY + 3)));
    if (k <= 0) return 0;
    if (ptCount > 0 && nextGate > 0) {
      const boxTop = baselineY - formedPx * 1.08;
      const dx = Math.max(formedLeft - 22 - x, x - (formedRight + 22), 0);
      const dy = Math.max(boxTop - y, y - (baselineY + 28), 0);
      k *= 1 - nextGate * (1 - smoothstep(0, 26, Math.max(dx, dy)));
      /* The caliper is an annotation: its dimension line and value stand on
         paper, so rain clears the measurement band under the word too. */
      if (x > formedLeft - 30 && x < formedRight + 30) {
        const caliperY = Math.min(railY - 9, baselineY + maxFont * 0.24) + 8;
        k *= 1 - nextGate * (1 - smoothstep(14, 26, Math.abs(y - caliperY)));
      }
    }
    if (morphing && prevWord && prevGate > 0) {
      const boxTop = baselineY - prevPx * 1.08;
      const dx = Math.max(prevLeft - 22 - x, x - (prevRight + 22), 0);
      const dy = Math.max(boxTop - y, y - (baselineY + 28), 0);
      k *= 1 - prevGate * (1 - smoothstep(0, 26, Math.max(dx, dy)));
      /* The outgoing caliper band heals with the same gate. */
      if (x > prevLeft - 30 && x < prevRight + 30) {
        const caliperY = Math.min(railY - 9, baselineY + maxFont * 0.24) + 8;
        k *= 1 - prevGate * (1 - smoothstep(14, 26, Math.abs(y - caliperY)));
      }
    }
    if (narrow) k *= 0.72;
    return k;
  }

  function draw(): void {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const ph = phaseAt(simT);
    const cycle = ph.cycle;
    const p = ph.p;
    const holdDur = ph.holdDur;
    const current = ((cycle % SCRIPTS.length) + SCRIPTS.length) % SCRIPTS.length;
    const next = (current + 1) % SCRIPTS.length;

    /* The word holes breathe with the cycle: the incoming hole opens just
       before the first glyph lands, the outgoing hole heals as the dust
       departs. Handoffs at both boundaries are exact (the outgoing hole
       takes over the held one at full strength; gates land on their hold
       values), so the rain never gains or loses a block in one frame. */
    if (p < holdDur) {
      nextGate = 1;
      prevGate = 0;
    } else {
      const mm = p - holdDur;
      nextGate = smoothstep(FLIGHT - 0.7, FLIGHT, mm);
      prevGate = 1 - smoothstep(PEEL, MORPH, mm);
    }

    let morph = -1; // −1: holding; 0…1: flying to `next`
    if (p < holdDur) {
      if (sampledWord !== current || pendingResample) {
        resample(current);
        inPrev.set(inNext);
        pendingResample = false;
      }
      announce(current);
    } else {
      if (morphedCycle !== cycle) {
        /* Flight begins: snapshot the outgoing word, lift off from the
           drawn positions, and stagger departures by position in the word
           so it peels the way it printed. */
        morphedCycle = cycle;
        prevLeft = formedLeft;
        prevRight = formedRight;
        prevWord = formedWord;
        prevFont = formedFont;
        prevPx = formedPx;
        prevRtl = formedRtl;
        fx.set(lastX);
        fy.set(lastY);
        inPrev.set(inNext);
        resample(next);
        announce(next);
        const span = Math.max(1, prevRight - prevLeft);
        const nspan = Math.max(1, formedRight - formedLeft);
        for (let i = 0; i < POOL; i++) {
          if (inPrev[i] === 1) {
            /* a particle that never drew (hidden boot, first frames) lifts
               off from its own target, never from the canvas origin */
            if ((fx[i] ?? 0) === 0 && (fy[i] ?? 0) === 0) {
              fx[i] = tx[i] ?? 0;
              fy[i] = ty[i] ?? 0;
            }
            const d = clamp01(((fx[i] ?? 0) - prevLeft) / span);
            dep[i] = prevRtl ? 1 - d : d;
          } else if (inNext[i] === 1) {
            /* recruits are called in print order, so the sketch inks up the
               way the word will print */
            const dn = clamp01(((tx[i] ?? 0) - formedLeft) / nspan);
            dep[i] = formedRtl ? 1 - dn : dn;
          }
        }
      }
      morph = (p - holdDur) / MORPH;
    }

    const mp = morph < 0 ? 0 : p - holdDur; // seconds into the morph

    /* The two threads: the rail the word stands on, at brand gauge and full
       ink. They enter from under the type column and run out the edge. */
    const railX = narrow ? 0 : fadeB;
    ctx.fillStyle = ink;
    ctx.globalAlpha = 1;
    ctx.fillRect(railX, railY, w - railX, 1.5);
    ctx.fillRect(railX, railY + 4.5, w - railX, 1.5);

    /* The print / peel fronts, in x. */
    const printU = morph < 0 ? clamp01(p / PRINT) : 1;
    const printX = formedRtl
      ? formedRight - printU * (formedRight - formedLeft)
      : formedLeft + printU * (formedRight - formedLeft);
    const peelU = morph < 0 ? 0 : clamp01(mp / PEEL);
    const peelX = prevRtl
      ? prevRight - peelU * (prevRight - prevLeft)
      : prevLeft + peelU * (prevRight - prevLeft);

    /* Two passes over the same sorted order: the rain first, then the
       word-bound particles, so the swarm always sits above the rain.
       Same particles, drawn once each — the loop still allocates nothing. */
    const wrap = h + 60;
    const cs = CELL;
    for (let pass = 0; pass < 2; pass++) {
      for (let k = 0; k < POOL; k++) {
        const i = order[k] ?? 0;
        const wordBound = morph < 0 ? inNext[i] === 1 : inNext[i] === 1 || inPrev[i] === 1;
        if ((pass === 1) !== wordBound) continue;

        const t = tier[i] ?? 2;

        /* Rain: a slow fall wrapped over the band, swayed by a long sine. */
        let x = (hx[i] ?? 0) + Math.sin(simT / (period[i] ?? 8) + (phase[i] ?? 0)) * (sway[i] ?? 2);
        let y = (hy[i] ?? 0) + simT * (fall[i] ?? 3);
        y = ((y % wrap) + wrap) % wrap;
        y -= 30;

        /* The dithered zones cull rain outright — a culled particle records
           its position and draws nothing. */
        if (!wordBound && keepAt(x, y, morph >= 0) <= (stag[i] ?? 0)) {
          lastX[i] = x;
          lastY[i] = y;
          continue;
        }

        let row = t;
        let px = TIER_SIZE[t] ?? 10;

        if (morph < 0) {
          if (wordBound) {
            /* Landed. The word's fill absorbs each glyph as the print front
               passes its target; until then it stands on its point. */
            x = tx[i] ?? 0;
            y = ty[i] ?? 0;
            lastX[i] = x;
            lastY[i] = y;
            /* printU ≥ 1 absorbs unconditionally: a late remeasure can move
               the front's endpoint off stale targets, and none may linger. */
            const absorbed = printU >= 1 || (formedRtl ? x >= printX : x <= printX);
            if (absorbed) continue;
            row = COND_ROW;
            px = CONDENSED_PX;
          }
        } else if (wordBound) {
          /* Departure staggered by the peel; each flight lasts FLIGHT. */
          const u = clamp01((mp - (dep[i] ?? 0) * PEEL) / FLIGHT);
          if (u <= 0 && inPrev[i] === 1) {
            /* Not yet peeled: still part of the outgoing word's fill. */
            lastX[i] = fx[i] ?? 0;
            lastY[i] = fy[i] ?? 0;
            continue;
          }
          const e = easeInOutCubic(u);
          const arc = Math.sin(Math.PI * e) * (bow[i] ?? 0);

          if (inNext[i] === 1 && inPrev[i] === 1) {
            x = (fx[i] ?? 0) + ((tx[i] ?? 0) - (fx[i] ?? 0)) * e + arc * 56;
            y = (fy[i] ?? 0) + ((ty[i] ?? 0) - (fy[i] ?? 0)) * e - Math.abs(arc) * 34;
            row = COND_ROW;
            px = CONDENSED_PX;
          } else if (inNext[i] === 1) {
            /* Called back from the rain: the glyph keeps its own rain
               material for the whole flight — nothing brightens mid-air —
               and inks up to the flight material exactly on landing, where
               the word absorbs it. */
            x += ((tx[i] ?? 0) - x) * e + arc * 36 * (1 - e);
            y += ((ty[i] ?? 0) - y) * e;
            if (u >= 1) {
              row = COND_ROW;
              px = CONDENSED_PX;
            }
          } else {
            /* Released: the fill crumbles to rain material at the peel
               front and the dust flies home to its own live rain slot.
               Landing is exact (e = 1 is the rain formula), so the handoff
               back to plain rain never jumps; once landed it is plain rain,
               dithered culls and all. */
            x = (fx[i] ?? 0) + (x - (fx[i] ?? 0)) * e + arc * 36 * e;
            y = (fy[i] ?? 0) + (y - (fy[i] ?? 0)) * e;
            if (u >= 1 && keepAt(x, y, true) <= (stag[i] ?? 0)) {
              lastX[i] = x;
              lastY[i] = y;
              continue;
            }
          }
        }

        lastX[i] = x;
        lastY[i] = y;
        const ds = cs * (px / (row === COND_ROW ? CONDENSED_PX : TIER_SIZE[row] ?? 10));
        ctx.drawImage(
          atlas,
          (gi[i] ?? 0) * cs * dpr,
          row * cs * dpr,
          cs * dpr,
          cs * dpr,
          x - ds / 2,
          y - ds / 2,
          ds,
          ds,
        );
      }
    }

    /* Orbiters: through the hold, a slow ring of glyphs keeps condensing
       into the word — the argument stays visible in any still. They melt
       into the fill on arrival (ink over ink). */
    if (morph < 0 && ptCount > 0) {
      for (let j = 0; j < ORB; j++) {
        const f = (simT * 0.16 + j / ORB) % 1;
        const kIdx = Math.min(ptCount - 1, Math.floor(((j + 0.5) * ptCount) / ORB));
        const pi = slot[kIdx] ?? 0;
        const tgx = tx[pi] ?? zoneCx;
        const tgy = ty[pi] ?? baselineY;
        /* Spawns bias above the word, so approach paths never cross the
           caliper annotation beneath it. */
        const ang = ((orbSeedA[j] ?? 0.5) - 0.5) * 1.4;
        const r0 = maxFont * (1.4 + (orbSeedR[j] ?? 0.5) * 0.9);
        const sx = tgx + Math.sin(ang) * r0;
        let sy = tgy - Math.cos(ang) * r0 * 0.85;
        sy = Math.max(narrow ? fadeA : 24, sy);
        const e = easeInOutCubic(f);
        const ox = sx + (tgx - sx) * e;
        const oy = sy + (tgy - sy) * e;
        ctx.drawImage(
          atlas,
          (orbGlyph[j] ?? 0) * cs * dpr,
          COND_ROW * cs * dpr,
          cs * dpr,
          cs * dpr,
          ox - cs / 2,
          oy - cs / 2,
          cs,
          cs,
        );
      }
    }

    /* The words themselves — real typography, machined contours. The
       incoming word prints in behind its front; the outgoing word peels
       away ahead of its own. Hard clip edges: ink or paper, never a fade. */
    ctx.fillStyle = ink;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    if (morph < 0) {
      if (formedWord && printU > 0) {
        ctx.save();
        ctx.beginPath();
        if (formedRtl) ctx.rect(printX, 0, formedRight + 20 - printX, h);
        else ctx.rect(formedLeft - 20, 0, printX - (formedLeft - 20), h);
        ctx.clip();
        ctx.font = formedFont;
        ctx.fillText(formedWord, formedLeft, baselineY);
        ctx.restore();
      }
    } else if (prevWord && peelU < 1) {
      ctx.save();
      ctx.beginPath();
      if (prevRtl) ctx.rect(prevLeft - 20, 0, peelX - (prevLeft - 20), h);
      else ctx.rect(peelX, 0, prevRight + 20 - peelX, h);
      ctx.clip();
      ctx.font = prevFont;
      ctx.fillText(prevWord, prevLeft, baselineY);
      ctx.restore();
    }

    /* The caliper: the printed word's measured advance — regular-weight
       dimension line, 5px end ticks, mono value in ink. */
    if (morph < 0 && ptCount > 0) {
      const a = Math.min(1, Math.max(0, (p - PRINT - 0.1) / 0.4));
      if (a > 0) {
        const by = Math.min(railY - 9, baselineY + maxFont * 0.24);
        ctx.globalAlpha = a;
        ctx.fillStyle = ink;
        ctx.fillRect(formedLeft, by, formedRight - formedLeft, 1.5);
        ctx.fillRect(formedLeft, by - 5, 1.5, 5);
        ctx.fillRect(formedRight - 1.5, by - 5, 1.5, 5);
        /* The value stands on cleared paper — rain never strikes through it. */
        ctx.clearRect(formedRight - formedLabelW - 8, by + 4, formedLabelW + 12, 17);
        ctx.font = `500 11.5px ${mono}`;
        ctx.textAlign = 'right';
        ctx.fillText(formedLabel, formedRight, by + 16);
      }
    }

    ctx.globalAlpha = 1;
  }

  function frame(ts: number): void {
    if (destroyed) return;
    if (lastTs >= 0) simT += Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    draw();
    raf = requestAnimationFrame(frame);
  }

  function start(): void {
    if (running || destroyed || reduced) return;
    running = true;
    lastTs = -1;
    raf = requestAnimationFrame(frame);
  }

  function stop(): void {
    running = false;
    cancelAnimationFrame(raf);
  }

  /* ---------- wiring ---------- */

  function resize(): void {
    const box = canvas.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) return;
    w = Math.round(box.width);
    h = Math.round(box.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    layout();
    buildAtlas();
    if (morphingNow()) pendingResample = true;
    else sampledWord = -1;
    if (reduced || !running) {
      /* One legible frame: the field printed on its current word. */
      draw();
    }
  }

  let resizeRaf = 0;
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(resize);
  });
  ro.observe(canvas);

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) start();
      else stop();
    },
    { threshold: 0.02 },
  );
  io.observe(canvas);

  /* Theme flips re-ink the field: the atlas is rebuilt in the new ink and a
     paused field re-prints its still. Cheap — one attribute on the root,
     observed only while the field lives. */
  const themeMo = new MutationObserver(() => {
    const next = resolveInk();
    if (next === ink) return;
    ink = next;
    buildAtlas();
    if (reduced || !running) draw();
  });
  themeMo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* Boot mid-hold: the word already printed, the caliper already in, and
     comfortably BEFORE the first morph — the boot instant must stay inside
     FIRST_HOLD or the first peel lifts off from uninitialized origins. */
  simT = Math.min(FIRST_HOLD - 0.15, 1.05);
  resize();
  if (reduced) {
    announce(0);
    draw();
  } else if (visible) {
    start();
  }

  /* Webfont metrics land late; rebuild the atlas and re-measure the fill
     against them. Never a resample: re-dealing membership teleports
     standing glyphs — remeasure() keeps every particle where it is. */
  if ('fonts' in document) {
    document.fonts.ready
      .then(() => {
        if (destroyed) return;
        buildAtlas();
        if (sampledWord >= 0) remeasure(sampledWord);
        if (!running) draw();
      })
      .catch(() => undefined);
  }

  return {
    destroy() {
      destroyed = true;
      stop();
      cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      io.disconnect();
      themeMo.disconnect();
    },
  };
}
