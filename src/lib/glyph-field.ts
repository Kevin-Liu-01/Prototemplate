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
 * A caliper bracket prints the word's measured advance while it holds,
 * fading in after the print front and back out as the peel begins.
 *
 * Craft constraints, in order:
 * - One preallocated pool. Every per-particle number lives in a typed array
 *   allocated once at init; the frame loop allocates nothing.
 * - Depth-faded material. Depth renders as size + Bayer coverage + an
 *   alpha ramp: near glyphs are solid ink, far glyphs are dithered AND
 *   faded, so overlapping glyphs separate by depth instead of colliding
 *   at equal ink. Word material (the condensed row) always prints full.
 * - The rain is set in columns (a 34px pitch with small fixed jitter), so
 *   the field reads as composed typesetting, not static.
 * - The held word is typography, not particles: particles land, the word
 *   prints over them with a hard clip front, and they are absorbed.
 * - Blits are tight. Every particle draws as a pre-measured sprite — the
 *   glyph's actual ink bounds out of the atlas, never the empty cell
 *   margins — integer-snapped in device px (1:1, no per-glyph filtering),
 *   with the depth fade quantized so alpha state changes a handful of
 *   times per pass instead of once per glyph. (An offscreen lower-DPR
 *   rain layer was tried and measured SLOWER: compositing a same-frame
 *   offscreen canvas forces a synchronous flush inside drawImage.)
 * - The type column, the held word's own paper, and the bottom seam are
 *   all dithered density falloffs (per-particle threshold) — no alpha
 *   veil ever sits behind content. The word's paper is a rounded distance
 *   field off its glyph box, the copy edge bows organically with height,
 *   and the seam is a short feathered tail, so no clearing ever reads as
 *   a ruled box (founder: no square around the word, no empty bar at the
 *   bottom).
 * - prefers-reduced-motion renders exactly one frame — the printed word
 *   and its caliper — and never starts the loop.
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
const TIER_SIZE: readonly [number, number, number] = [19, 13, 11];
/**
 * The 1-bit ink coverage per tier. Near and mid are solid ink at their two
 * sizes; the far tier is Bayer-dithered — the sanctioned way to render the
 * atmosphere's "grey". Two solid sizes plus one halftone plus the printed
 * word are the field's whole palette.
 */
/* ALL tiers solid (founder, after three dither rounds: 'the dither is
   making it flicker every time it moves — remove the dither'). Depth is
   spoken by size and the quantized alpha ramp alone; with no pattern on
   the moving rain there is nothing left to shimmer. The dither machinery
   stays for the atlas's other users. */
const TIER_COVER: readonly [number, number, number] = [1, 1, 1];
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
/**
 * Depth-fade quantization: the static per-particle alpha ramp rounds to
 * 1/48 steps (imperceptible under the dither) so the frame loop sets
 * globalAlpha a handful of times per pass instead of once per glyph.
 */
const ALPHA_Q = 48;
/** Feather width (CSS px) of the word hole's rounded distance field. */
const WORD_FEATHER = 30;

/* The loop, in seconds: print, hold, peel, fly. Each formed word LINGERS —
   the caliper fades in, stands for a beat, and fades back out — then the
   word dissolves, spreads, reorganizes and forms the next, one continuous
   movement. */
const HOLD = 4.0;
const MORPH = 2.4;
const CYCLE = HOLD + MORPH;
/**
 * The first word lingers like every other; the boot instant lands mid-hold
 * with the word already printed and the caliper already in. (Reduced motion
 * still renders the printed word as a still.)
 */
const FIRST_HOLD = 4.0;
const FIRST_CYCLE = FIRST_HOLD + MORPH;
/** The print front's sweep at the start of a hold. */
const PRINT = 0.5;
/** The peel front's sweep at the start of a morph. */
const PEEL = 0.7;
/** Each particle's own flight time inside the morph. */
const FLIGHT = MORPH - PEEL;

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
    /* DEVICE-px Bayer cells (founder round: 'smoother, cleaner, full
       resolution'): the screen is twice as fine at dpr 2, and because
       blits land on integer device px, every step translates the
       pattern by WHOLE cells — rigid under motion, no re-phasing. */
    const bayerRow = BAYER[y % 4] ?? BAYER[0] ?? [0, 8, 2, 10];
    for (let x = 0; x < widthPx; x++) {
      const idx = (y * widthPx + x) * 4 + 3;
      const alpha = data[idx] ?? 0;
      if (alpha === 0) continue;
      const threshold = ((bayerRow[x % 4] ?? 0) + 0.5) / 16;
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
  /** Ambient drift direction — the library's fall, or a rising field. */
  drift?: 'fall' | 'rise';
  /** Multiplier on the rain tiers' glyph sizes (the formed word is untouched). */
  glyphScale?: number;
  /** Where the host's copy block sits. 'auto' (default) infers left/top from
      width; 'left'/'top' force a fold; 'none' is a standalone plate — no copy
      clearing, full-bleed rain, word centered. */
  copy?: 'auto' | 'left' | 'top' | 'none';
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

  /* Additive hosts' knobs: drift sign rides the same wrap math (it is
     negative-safe), the scale multiplies only the rain tiers. */
  const driftSign = options.drift === 'rise' ? -1 : 1;
  const glyphScale = options.glyphScale ?? 1;

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
  const vis = new Uint8Array(POOL); // cull hysteresis: 1 while drawn (a 0.06 band stops boundary flicker)
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
  const toneQ = new Uint8Array(POOL); // quantized depth fade, 0…ALPHA_Q
  const mark = new Uint8Array(POOL); // resample scratch: candidate membership

  let eligibleCount = 0;
  for (let i = 0; i < POOL; i++) {
    ux[i] = rand();
    uy[i] = rand();
    const depth = Math.pow(rand(), 0.82); // bias toward far — atmosphere
    z[i] = depth;
    phase[i] = rand() * Math.PI * 2;
    period[i] = 7 + rand() * 8;
    fall[i] = driftSign * (2.2 + (1 - depth) * 7.5);
    sway[i] = 1.5 + (1 - depth) * 2.5;
    stag[i] = rand();
    vis[i] = 1;
    bow[i] = rand() * 2 - 1;
    const scriptAt = Math.floor(rand() * 8);
    const per = Math.ceil(GLYPHS.length / 8);
    gi[i] = Math.min(GLYPHS.length - 1, scriptAt * per + Math.floor(rand() * per));
    tier[i] = depth < NEAR_CUT ? 0 : depth < MID_CUT ? 1 : 2;
    /* z never changes, so the depth fade is a fixed bucket per particle. */
    toneQ[i] = Math.round((1 - 0.6 * depth) * ALPHA_Q);
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
    const mode = options.copy ?? 'auto';
    narrow = mode === 'top' || (mode === 'auto' && w < 880);
    const standalone = mode === 'none';
    if (standalone) {
      /* no copy block at all: the clearing edge sits off-canvas, so
         keepAt's smoothstep saturates to 1 for every on-canvas x, and
         the word centers in a full-bleed field */
      zoneCx = w * 0.5;
      zoneW = Math.max(160, w - 96);
      baselineY = h * 0.56;
      maxFont = Math.min(h * 0.3, 132);
      fadeB = -60;
      fadeA = -30;
    } else if (narrow) {
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
      /* 0.585, not 0.55 (founder: the word read a little high) — the
         word + caliper GROUP now optically centres in the band */
      baselineY = h * 0.585;
      maxFont = Math.min(h * 0.36, 232);
      fadeB = w * 0.43;
      fadeA = w * 0.55;
    }
    railY = Math.min(h - 26, baselineY + maxFont * 0.3 + 18);
    /* The bottom seam is a short dithered tail, not a reserve (founder: no
       empty bar): density holds until ~46px above the edge and the falloff
       completes just PAST it, so edge glyphs still print, clipped, and the
       field runs to the paper's end. The caption keeps its own local
       clearing (wordKeep), so the seam no longer has to carry it. */
    botB = h + 10;
    botA = narrow ? Math.max(railY + 10, h - 60) : h - 46;
    for (let i = 0; i < POOL; i++) {
      const px = ux[i] ?? 0;
      /* Homes snap to a column pitch, with a small fixed jitter, so the rain
         reads as set type. The type column stays the field's clearing: every
         home sits to the right of it (below it on narrow); the clearing edge
         itself is a per-frame dithered density falloff. */
      const raw = standalone || narrow ? px * w : (0.4 + px * 0.63) * w;
      hx[i] = Math.round(raw / COL_PITCH) * COL_PITCH + (bow[i] ?? 0) * 4;
      const py = uy[i] ?? 0;
      /* Homes seed the FULL wrap cycle (h + 60, the draw loop's modulus),
         not just [0, h]: the draw position is wrap(hy + t·fall) − 30, so
         seeding a band 60px short left the bottom strip empty at boot —
         glyphs only reached it after wrapping around, at 2–10 px/s, and
         every arrival opened on a bare floor that healed over ~10s
         (founder: "glyph rain always starts with empty spaces below").
         Seeded over the whole cycle, boot IS the steady state. */
      hy[i] = narrow ? (h + 60) * (0.5 + py * 0.5) : py * (h + 60);
    }
  }

  /* ---------- glyph atlas ---------- */

  const atlas = document.createElement('canvas');
  const atlasCtx = atlas.getContext('2d', { willReadFrequently: true });
  /** Atlas device scale: cp / CELL, so atlas cells land on integer px. */
  let dprA = 1;
  /** Atlas cell size in device px. */
  let cp = CELL;
  /**
   * Per-(row × glyph) ink bounds, measured off the built atlas: source rect
   * [x, y, w, h] in atlas px, and the rect's offset from the glyph's center.
   * The frame loop blits exactly the ink — never the empty cell margins —
   * which cuts the blitted area several-fold for the small tiers.
   */
  const spr = new Int16Array(ATLAS_ROWS * GLYPHS.length * 4);
  const sprOff = new Int16Array(ATLAS_ROWS * GLYPHS.length * 2);

  /** Scan the finished atlas once per build for each cell's ink bbox. */
  function measureSprites(): void {
    if (!atlasCtx) return;
    const img = atlasCtx.getImageData(0, 0, atlas.width, atlas.height);
    const data = img.data;
    const cols = GLYPHS.length;
    for (let row = 0; row < ATLAS_ROWS; row++) {
      for (let col = 0; col < cols; col++) {
        const bx = col * cp;
        const by = row * cp;
        let x0 = cp;
        let y0 = cp;
        let x1 = -1;
        let y1 = -1;
        for (let y = 0; y < cp; y++) {
          const base = ((by + y) * atlas.width + bx) * 4 + 3;
          for (let x = 0; x < cp; x++) {
            if ((data[base + x * 4] ?? 0) !== 0) {
              if (x < x0) x0 = x;
              if (x > x1) x1 = x;
              if (y < y0) y0 = y;
              if (y > y1) y1 = y;
            }
          }
        }
        const m = (row * cols + col) * 4;
        const o = (row * cols + col) * 2;
        if (x1 < 0) {
          spr[m + 2] = 0;
          spr[m + 3] = 0;
          continue;
        }
        spr[m] = bx + x0;
        spr[m + 1] = by + y0;
        spr[m + 2] = x1 - x0 + 1;
        spr[m + 3] = y1 - y0 + 1;
        sprOff[o] = Math.round(x0 - cp / 2);
        sprOff[o + 1] = Math.round(y0 - cp / 2);
      }
    }
  }

  function buildAtlas(): void {
    if (!atlasCtx) return;
    /* The atlas renders at the canvas's own scale so every blit is 1:1
       device px. Rounding cp to whole px keeps cell boundaries (and the
       Bayer grid) exact. */
    cp = Math.max(8, Math.round(CELL * dpr));
    dprA = cp / CELL;
    atlas.width = Math.max(1, GLYPHS.length * cp);
    atlas.height = Math.max(1, ATLAS_ROWS * cp);
    atlasCtx.setTransform(dprA, 0, 0, dprA, 0, 0);
    atlasCtx.clearRect(0, 0, GLYPHS.length * CELL, ATLAS_ROWS * CELL);
    atlasCtx.fillStyle = ink;
    atlasCtx.textAlign = 'center';
    atlasCtx.textBaseline = 'middle';
    /* Rows 0–2 are the rain tiers; row 3 is the flight size at native px,
       so a flying glyph never draws through a downscale. */
    for (let row = 0; row < ATLAS_ROWS; row++) {
      const px = row === COND_ROW ? CONDENSED_PX : (TIER_SIZE[row] ?? 10) * glyphScale;
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
      dprA,
      (cssY) => Math.min(ATLAS_ROWS - 1, Math.floor(cssY / CELL)),
      (row) => (row === COND_ROW ? 1 : TIER_COVER[row] ?? 1),
    );
    measureSprites();
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
  let prevLabel = '';
  let prevLabelW = 0;

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
    mark.fill(0);
    for (let k = 0; k < eligibleCount; k++) {
      const i = pick[k] ?? 0;
      if (inNext[i] === 1) {
        cand[cc++] = i;
        mark[i] = 1;
      }
    }
    for (let k = 0; k < eligibleCount; k++) {
      const i = pick[k] ?? 0;
      if (mark[i] === 1) continue;
      const rx =
        (hx[i] ?? 0) + Math.sin(simT / (period[i] ?? 8) + (phase[i] ?? 0)) * (sway[i] ?? 2);
      let ry = (hy[i] ?? 0) + simT * (fall[i] ?? 3);
      ry = ((ry % wrapC) + wrapC) % wrapC;
      ry -= 30;
      if (keepAt(rx, ry, true) > (stag[i] ?? 0)) {
        cand[cc++] = i;
        mark[i] = 1;
      }
    }
    if (cc < eligibleCount) {
      for (let k = 0; k < eligibleCount; k++) {
        const i = pick[k] ?? 0;
        if (mark[i] !== 1) cand[cc++] = i;
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
    /* Edge targets pull in by half a condensed glyph: landed glyphs draw
       centered, so an ink sample at the advance's very edge would bleed
       past the printed word's own right/left bound. */
    const inset = advance > CONDENSED_PX * 2 ? CONDENSED_PX / 2 : 0;
    for (let k = 0; k < ptCount; k++) {
      const p = cand[k] ?? 0;
      const rawX = left + (pts[k * 2] ?? 0) - pad;
      tx[p] = Math.min(Math.max(rawX, left + inset), left + advance - inset);
      ty[p] = baselineY + (pts[k * 2 + 1] ?? 0) - yb;
      inNext[p] = 1;
    }
    sampledWord = wordIndex;
  }

  /**
   * Refresh the formed word's fill metrics against newly-loaded font faces
   * WITHOUT re-dealing the swarm: membership survives, and the standing
   * targets are remapped AFFINELY from the stale span onto the true one —
   * a subtle squeeze, never a teleport — so the sketch, the fill, the
   * caliper and the cleared zone all agree on the same advance. (Leaving
   * targets stale made the sketch overhang the printed word whenever the
   * raster ran before the display face arrived.)
   */
  function remeasure(wordIndex: number): void {
    if (!sampleCtx || w === 0) return;
    const entry = SCRIPTS[wordIndex];
    if (!entry) return;
    const oldLeft = formedLeft;
    const oldAdvance = formedRight - formedLeft;
    const oldPx = formedPx;
    let fontPx = maxFont;
    sampleCtx.font = `500 ${fontPx}px ${disp}`;
    let advance = sampleCtx.measureText(entry.word).width;
    if (advance > zoneW) {
      fontPx = Math.max(24, (fontPx * zoneW) / advance);
    }
    sampleCtx.font = `500 ${fontPx}px ${disp}`;
    advance = sampleCtx.measureText(entry.word).width;
    const left = zoneCx - advance / 2;
    if (sampledWord === wordIndex && oldAdvance > 1 && oldPx > 0) {
      const sx = advance / oldAdvance;
      const sy = fontPx / oldPx;
      const inset = advance > CONDENSED_PX * 2 ? CONDENSED_PX / 2 : 0;
      for (let p = 0; p < POOL; p++) {
        if (inNext[p] !== 1) continue;
        const mapped = left + ((tx[p] ?? 0) - oldLeft) * sx;
        tx[p] = Math.min(Math.max(mapped, left + inset), left + advance - inset);
        ty[p] = baselineY + ((ty[p] ?? baselineY) - baselineY) * sy;
      }
    }
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

  /* Where the loop stands at time t — the single phase authority. Written
     into standing slots (never a returned object) so the frame allocates
     nothing. */
  let phCycle = 0;
  let phP = 0;
  let phHold = FIRST_HOLD;
  function computePhase(t: number): void {
    if (t < FIRST_CYCLE) {
      phCycle = 0;
      phP = t;
      phHold = FIRST_HOLD;
      return;
    }
    const t2 = t - FIRST_CYCLE;
    phCycle = 1 + Math.floor(t2 / CYCLE);
    phP = t2 - (phCycle - 1) * CYCLE;
    phHold = HOLD;
  }
  const morphingNow = (): boolean => {
    computePhase(simT);
    return phP >= phHold;
  };

  function announce(index: number): void {
    if (index === announcedWord) return;
    announcedWord = index;
    onScript?.(index);
  }

  /**
   * The copy-clearing edge's shift at a position ALONG it (y on wide
   * layouts, x on narrow), toward the copy in px. The straight dithered
   * ramp read as a ruled wall (founder), so the edge bows: a gentle ripple
   * that drifts almost imperceptibly with time, plus an encroachment at
   * the clearing's quiet extremes — above and below the copy block — where
   * the rain may stand closer without touching type. The copy zone itself
   * (the middle of the span) never gains rain: shifts there stay a small
   * fraction of the ramp's width.
   */
  function copyEdgeShift(along: number, span: number): number {
    const u = span > 0 ? along / span : 0;
    const ramp = fadeA - fadeB;
    const wave = Math.sin(u * 8.2 + simT * 0.13) * 0.16 * ramp;
    const bow = (smoothstep(0.22, 0, u) + smoothstep(0.78, 1, u)) * 0.42 * ramp;
    return wave + bow;
  }

  /**
   * A word's clearing at (x, y), 0…1: a rounded distance field off the
   * word's actual glyph box — a capsule, tight to the type, feathered over
   * WORD_FEATHER px — never the old rectangular falloff (founder: no
   * square around the word). The caliper keeps its own small local
   * clearing, a slimmer capsule around the dimension line and its value.
   */
  function wordKeep(x: number, y: number, gate: number, left: number, right: number, px: number): number {
    let m = 1;
    const boxTop = baselineY - px * 0.96;
    const boxBot = baselineY + Math.min(26, 8 + px * 0.1);
    const cx = (left + right) / 2;
    const cy = (boxTop + boxBot) / 2;
    const hw = (right - left) / 2 + 10;
    const hh = (boxBot - boxTop) / 2 + 6;
    const r = Math.min(hw, hh);
    const qx = Math.abs(x - cx) - (hw - r);
    const qy = Math.abs(y - cy) - (hh - r);
    if (qx < r + WORD_FEATHER && qy < r + WORD_FEATHER) {
      const ax = qx > 0 ? qx : 0;
      const ay = qy > 0 ? qy : 0;
      const d = Math.sqrt(ax * ax + ay * ay) - r;
      m *= 1 - gate * (1 - smoothstep(0, WORD_FEATHER, d));
    }
    /* The caliper is an annotation: its dimension line and value stand on
       paper. A capsule too, so the band's ends taper instead of cutting. */
    const caliperY = Math.min(railY - 9, baselineY + maxFont * 0.24) + 8;
    const hd = Math.max(left - x, x - right, 0);
    const vd = Math.abs(y - caliperY) - 10;
    if (hd < 18 && vd < 18) {
      const ay = vd > 0 ? vd : 0;
      const d = Math.sqrt(hd * hd + ay * ay);
      m *= 1 - gate * (1 - smoothstep(2, 16, d));
    }
    return m;
  }

  /**
   * The rain's keep-probability at (x, y): the product of the type-column
   * clearing, the bottom seam, and the held word's own paper. Each particle
   * compares it to its fixed uniform and either draws at full tier material
   * or not at all — dithered edges, no veils.
   */
  function keepAt(x: number, y: number, morphing: boolean): number {
    /* fast path (perf round): a particle deep inside the field — past
       the copy fade, above the bottom tail, clear of both word gates —
       keeps at the base value with no smoothstep ladder at all. The
       vast majority of the pool takes this branch every frame. */
    if (
      y < botA &&
      /* the copy edge waves/bows outward by at most 0.16 x ramp — the
         fast path clears the worst case, never the resting edge */
      (narrow ? y : x) > fadeA + 0.16 * (fadeA - fadeB) &&
      (ptCount === 0 || nextGate <= 0 || x < formedLeft - 40 || x > formedRight + 40) &&
      (!morphing || !prevWord || prevGate <= 0 || x < prevLeft - 40 || x > prevRight + 40)
    ) {
      return narrow ? 0.72 : 1;
    }
    const shift = narrow ? copyEdgeShift(x, w) : copyEdgeShift(y, h);
    let k = smoothstep(fadeB - shift, fadeA - shift, narrow ? y : x);
    if (k <= 0) return 0;
    k *= 1 - smoothstep(botA, botB, y);
    if (k <= 0) return 0;
    if (ptCount > 0 && nextGate > 0) {
      k *= wordKeep(x, y, nextGate, formedLeft, formedRight, formedPx);
    }
    if (morphing && prevWord && prevGate > 0) {
      /* The outgoing word's paper heals with the same gate. */
      k *= wordKeep(x, y, prevGate, prevLeft, prevRight, prevPx);
    }
    if (narrow) k *= 0.72;
    return k;
  }

  function draw(): void {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    /* Particles draw in raw device px (identity transform, integer snap);
       the transform comes back for the word, which draws in CSS px. */
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    computePhase(simT);
    const cycle = phCycle;
    const p = phP;
    const holdDur = phHold;
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
        prevLabel = formedLabel;
        prevLabelW = formedLabelW;
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
    const gcount = GLYPHS.length;
    let curQ = -1;
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
        if (!wordBound) {
          /* HYSTERESIS on the dithered cull (founder: the flank glyphs
             flickered): a drawn glyph only culls once its keep drops a
             band BELOW its threshold, and a culled one only returns a
             band ABOVE it — the iso-line no longer strobes as the rain
             sways across it. Density statistics are unchanged. */
          const keep = keepAt(x, y, morph >= 0);
          /* a hard-cleared zone (keep 0) culls regardless of hysteresis —
             otherwise a low-threshold glyph drawn at boot survives forever
             inside a clearing */
          if (keep <= 0 || keep <= (stag[i] ?? 0) + (vis[i] === 1 ? -0.06 : 0.06)) {
            vis[i] = 0;
            lastX[i] = x;
            lastY[i] = y;
            continue;
          }
          vis[i] = 1;
        }

        let row = t;

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
          } else if (inNext[i] === 1) {
            /* Called back from the rain: the glyph keeps its own rain
               material for the whole flight — nothing brightens mid-air —
               and inks up to the flight material exactly on landing, where
               the word absorbs it. */
            x += ((tx[i] ?? 0) - x) * e + arc * 36 * (1 - e);
            y += ((ty[i] ?? 0) - y) * e;
            if (u >= 1) {
              row = COND_ROW;
            }
          } else {
            /* Released: the fill crumbles to rain material at the peel
               front and the dust flies home to its own live rain slot.
               Landing is exact (e = 1 is the rain formula), so the handoff
               back to plain rain never jumps; once landed it is plain rain,
               dithered culls and all. */
            x = (fx[i] ?? 0) + (x - (fx[i] ?? 0)) * e + arc * 36 * e;
            y = (fy[i] ?? 0) + (y - (fy[i] ?? 0)) * e;
            const landedKeep = u >= 1 ? keepAt(x, y, true) : 1;
            if (
              u >= 1 &&
              (landedKeep <= 0 ||
                landedKeep <= (stag[i] ?? 0) + (vis[i] === 1 ? -0.06 : 0.06))
            ) {
              vis[i] = 0;
              lastX[i] = x;
              lastY[i] = y;
              continue;
            }
          }
        }

        lastX[i] = x;
        lastY[i] = y;
        /* Depth fade: farther glyphs recede in alpha as well as size, so
           overlapping glyphs separate by depth instead of colliding at
           equal ink. Word material always prints full. Buckets are static
           per particle and the order is z-sorted, so the alpha state
           changes a handful of times per pass, not once per glyph. */
        const q = row === COND_ROW ? ALPHA_Q : (toneQ[i] ?? ALPHA_Q);
        if (q !== curQ) {
          curQ = q;
          ctx.globalAlpha = q / ALPHA_Q;
        }
        /* The blit: the sprite's measured ink bounds only, integer-snapped
           in device px — 1:1 pixels, no per-glyph filtering, no empty cell
           margins. Positions convert at the canvas's exact dpr; the sprite
           itself is 1:1 at the atlas's cell-rounded scale (≤1% size drift
           at fractional DPRs, uniform and invisible). */
        const cell = row * gcount + (gi[i] ?? 0);
        const m = cell * 4;
        const sw = spr[m + 2] ?? 0;
        if (sw === 0) continue;
        const sh = spr[m + 3] ?? 0;
        const o = cell * 2;
        /* Device-px snap for every tier: with the Bayer lattice at
           device-pixel cells (ditherAtlasRows), each integer step is a
           whole cell — the pattern rides rigidly AND the motion runs at
           display rate (founder round: the CSS-px quantization read as
           sub-60fps chop). */
        ctx.drawImage(
          atlas,
          spr[m] ?? 0,
          spr[m + 1] ?? 0,
          sw,
          sh,
          Math.round(x * dpr) + (sprOff[o] ?? 0),
          Math.round(y * dpr) + (sprOff[o + 1] ?? 0),
          sw,
          sh,
        );
      }
    }

    /* The transform comes back for the type. */
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* The words themselves — real typography, machined contours. The
       incoming word prints in behind its front; the outgoing word peels
       away ahead of its own. Hard clip edges: ink or paper, never a fade. */
    ctx.globalAlpha = 1;
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
       dimension line, 5px end ticks, mono value in ink. It fades in once
       the print front has swept, stands while the word holds, and fades
       back out over the outgoing word as the morph begins. */
    const calIn = morph < 0 && ptCount > 0 ? clamp01((p - PRINT - 0.1) / 0.45) : 0;
    const calOut = morph >= 0 && prevWord ? 1 - clamp01(mp / 0.45) : 0;
    const calA = Math.max(calIn, calOut);
    if (calA > 0) {
      const cl = calIn > 0 ? formedLeft : prevLeft;
      const cr = calIn > 0 ? formedRight : prevRight;
      const label = calIn > 0 ? formedLabel : prevLabel;
      const labelW = calIn > 0 ? formedLabelW : prevLabelW;
      const by = Math.min(railY - 9, baselineY + maxFont * 0.24);
      ctx.globalAlpha = calA;
      ctx.fillStyle = ink;
      ctx.fillRect(cl, by, cr - cl, 1.5);
      ctx.fillRect(cl, by - 5, 1.5, 5);
      ctx.fillRect(cr - 1.5, by - 5, 1.5, 5);
      /* The value stands on cleared paper — rain never strikes through it.
         (clearRect ignores alpha, so only punch the hole at full ink;
         mid-fade the band is already rain-free via the gated clearing.) */
      if (calA >= 1) ctx.clearRect(cr - labelW - 8, by + 4, labelW + 12, 17);
      ctx.font = `500 11.5px ${mono}`;
      ctx.textAlign = 'right';
      ctx.fillText(label, cr, by + 16);
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

  let everWoke = false;
  function start(): void {
    if (running || destroyed || reduced) return;
    if (!everWoke) {
      /* First visibility: layout may have settled since the mount-time
         seed (fonts, clamp paddings) — re-measure and re-seed so the
         field is FULL from its first frame instead of filling as the
         wrap carries glyphs into space that did not exist at seed time
         (founder: black space at the bottom at the beginning). */
      everWoke = true;
      resize();
    }
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
      /* Release the bitmaps the engine owns — the atlas and the word
         sampler — rather than waiting on GC for canvas backing store. */
      atlas.width = 0;
      atlas.height = 0;
      sample.width = 0;
      sample.height = 0;
    },
  };
}
