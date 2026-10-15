/* The frame loop allocates nothing: every per-particle value lives in typed arrays allocated once at init. */

export type ScriptSample = {
  tag: string;
  script: string;
  /** The word "language" in that language. */
  word: string;
  lang: string;
  rtl?: boolean;
};

/** Cycle order; the field boots printed on the first entry. */
export const SCRIPTS: readonly ScriptSample[] = [
  { tag: 'zh', script: 'Han', word: '语言', lang: 'zh' },
  { tag: 'ar', script: 'Arabic', word: 'لغة', lang: 'ar', rtl: true },
  { tag: 'hi', script: 'Devanagari', word: 'भाषा', lang: 'hi' },
  { tag: 'ru', script: 'Cyrillic', word: 'язык', lang: 'ru' },
  { tag: 'ko', script: 'Hangul', word: '언어', lang: 'ko' },
  { tag: 'el', script: 'Greek', word: 'γλωσσα', lang: 'el' },
  { tag: 'th', script: 'Thai', word: 'ภาษา', lang: 'th' },
  { tag: 'en', script: 'Latin', word: 'language', lang: 'en' },
];

/** Standalone-safe forms only: no combining marks that would render with a dotted circle. */
export const GLYPHS: readonly string[] = [
  'l',
  'a',
  'n',
  'g',
  'e',
  't',
  '语',
  '言',
  '文',
  '字',
  'ل',
  'غ',
  'ة',
  'भ',
  'ष',
  'म',
  'न',
  'я',
  'з',
  'ы',
  'к',
  '언',
  '어',
  '한',
  'γ',
  'λ',
  'σ',
  'α',
  'ภ',
  'า',
  'ษ',
];

export const POOL = 1280;

/** Particles nearer than this never condense — they stay foreground rain. */
const NEAR_CUT = 0.14;
const MID_CUT = 0.6;
/** Glyph size per depth tier (near, mid, far) in CSS px. */
const TIER_SIZE: readonly [number, number, number] = [19, 13, 11];
/** All solid because a dither pattern on the moving rain shimmers with every step. */
const TIER_COVER: readonly [number, number, number] = [1, 1, 1];
const CONDENSED_PX = 12;
/** Under the flight glyph size so the landed swarm doesn't overprint into scribble. */
const COND_PITCH = 9;
/** prepareSamples scales its proportional divisor with this pitch. */
const COND_PITCH_NARROW = 13;
const COND_ROW = 3;
const ATLAS_ROWS = 4;
const CELL = 30;
/** Light-mode `--tc-ink` fallback; init and every theme flip re-resolve the live token. */
const INK = '#070707';
const COL_PITCH = 34;
/** Rounds the depth fade to 1/48 steps so the frame loop sets globalAlpha only a handful of times per pass. */
const ALPHA_Q = 48;
/** Feather width (CSS px) of the word hole's rounded distance field. */
const WORD_FEATHER = 30;
const NARROW_KEEP = 0.5;
/** Bounds the narrow frame path to the first NARROW_POOL slots; off-frame loops still cover POOL so a wide crossing finds every particle intact. */
const NARROW_POOL = 560;
/** resize() is the only writer of dpr, so the canvas, atlas and blits re-derive together on any width crossing. */
const DPR_CAP = 2;
const DPR_CAP_NARROW = 1.25;

/* Loop timings in seconds. */
const HOLD = 4.0;
const MORPH = 2.4;
const CYCLE = HOLD + MORPH;
const FIRST_HOLD = 4.0;
const FIRST_CYCLE = FIRST_HOLD + MORPH;
const PRINT = 0.5;
const PEEL = 0.7;
const FLIGHT = MORPH - PEEL;

const BAYER: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

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

export function ditherAtlasRows(
  ctx: CanvasRenderingContext2D,
  widthPx: number,
  heightPx: number,
  dpr: number,
  rowOfY: (cssY: number) => number,
  coverOfRow: (row: number) => number
): void {
  const img = ctx.getImageData(0, 0, widthPx, heightPx);
  const data = img.data;
  for (let y = 0; y < heightPx; y++) {
    const cssY = Math.floor(y / dpr);
    const cover = coverOfRow(rowOfY(cssY));
    if (cover >= 1) continue;
    /* Device-px Bayer cells keep the pattern rigid under motion because blits land on integer device px. */
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
  drift?: 'fall' | 'rise';
  /** Multiplier on the rain tiers' glyph sizes (the formed word is untouched). */
  glyphScale?: number;
  /** 'auto' infers left or top from width; 'none' is a standalone plate with no copy clearing and the word centred. */
  copy?: 'auto' | 'left' | 'top' | 'none';
  /** The copy block's bottom edge in canvas px, re-read at every layout so wrapping locales never cross into the rain. */
  copyBottom?: () => number | undefined;
  /** Blank space between the lowest rain glyphs and the canvas edge. */
  bottomClearance?: number;
  /** Entries must fit the square atlas cell at the rain tiers' sizes, such as single symbols or two-character codes. */
  glyphs?: readonly string[];
  /** 'dithered' prints a diagonal Bayer ramp inside the letterforms. */
  wordFill?: 'flat' | 'dithered';
  formWords?: boolean;
  /** Layout for `copy: 'none'`: the baseline and size as height fractions, with a px cap. */
  standalone?: { baseline?: number; fontScale?: number; fontCap?: number };
};

export type GlyphFieldHandle = { destroy(): void };

export function createGlyphField(
  options: GlyphFieldOptions
): GlyphFieldHandle | null {
  const { canvas, onScript } = options;
  const maybeCtx = canvas.getContext('2d');
  if (!maybeCtx) return null;
  /* Bound once so the closures below see a non-null context. */
  const ctx: CanvasRenderingContext2D = maybeCtx;

  const disp =
    options.displayFamily ||
    // next/font registers Inter under a generated family name, so a literal
    // 'Inter' would miss it; the page's own computed face is the real default.
    getComputedStyle(document.body).fontFamily;
  const mono =
    options.monoFamily || "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
  const inv =
    options.glyphs && options.glyphs.length > 0 ? options.glyphs : GLYPHS;
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const driftSign = options.drift === 'rise' ? -1 : 1;
  const glyphScale = options.glyphScale ?? 1;
  const wordFill = options.wordFill ?? 'flat';
  const formWords = options.formWords ?? true;
  const soBaseline = options.standalone?.baseline ?? 0.56;
  const soFontScale = options.standalone?.fontScale ?? 0.3;
  const soFontCap = options.standalone?.fontCap ?? 132;

  const resolveInk = (): string =>
    getComputedStyle(canvas).getPropertyValue('--tc-ink').trim() || INK;
  let ink = resolveInk();

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
    const per = Math.ceil(inv.length / 8);
    gi[i] = Math.min(inv.length - 1, scriptAt * per + Math.floor(rand() * per));
    tier[i] = depth < NEAR_CUT ? 0 : depth < MID_CUT ? 1 : 2;
    toneQ[i] = Math.round((1 - 0.6 * depth) * ALPHA_Q);
    if (depth >= NEAR_CUT) eligibleCount++;
  }

  for (let i = 0; i < POOL; i++) order[i] = i;
  order.sort((a, b) => (z[b] ?? 0) - (z[a] ?? 0));

  let pc = 0;
  for (let i = 0; i < POOL; i++) if ((z[i] ?? 0) >= NEAR_CUT) pick[pc++] = i;
  for (let i = pc - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const a = pick[i] ?? 0;
    pick[i] = pick[j] ?? 0;
    pick[j] = a;
  }

  /* Narrow views drop the far tier, which is pure atmosphere on a phone, and keep their parents' order so narrow statistics match the wide field. */
  const orderN = new Uint16Array(NARROW_POOL);
  let orderNCount = 0;
  for (let k = 0; k < POOL; k++) {
    const i = order[k] ?? 0;
    if (i < NARROW_POOL && (tier[i] ?? 2) !== 2) orderN[orderNCount++] = i;
  }
  const pickN = new Uint16Array(NARROW_POOL);
  let pickNCount = 0;
  for (let k = 0; k < pc; k++) {
    const i = pick[k] ?? 0;
    if (i < NARROW_POOL && (tier[i] ?? 2) !== 2) pickN[pickNCount++] = i;
  }

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
      /* The clearing edge sits off-canvas, so keepAt's smoothstep saturates to 1 for every on-canvas x. */
      zoneCx = w * 0.5;
      zoneW = Math.max(160, w - 96);
      baselineY = h * soBaseline;
      maxFont = Math.min(h * soFontScale, soFontCap);
      fadeB = -60;
      fadeA = -30;
    } else if (narrow) {
      zoneCx = w * 0.5;
      zoneW = Math.max(120, w - 48);
      /* The narrow layout reserves visible space below the formed word. */
      baselineY = h * 0.74;
      maxFont = Math.min(h * 0.19, 116);
      /* The quiet zone follows the real copy block so a deep-wrapping locale can't push its CTAs into the rain. */
      const copyB = options.copyBottom?.();
      fadeB =
        typeof copyB === 'number' && copyB > 0
          ? Math.max(h * 0.52, copyB + 16)
          : h * 0.52;
      fadeA = fadeB + Math.max(28, h * 0.1);
    } else {
      const left = w * 0.47;
      zoneW = Math.max(240, w - 40 - left);
      zoneCx = left + zoneW / 2;
      /* 0.585 — the word + caliper GROUP optically centres in the band */
      baselineY = h * 0.585;
      maxFont = Math.min(h * 0.36, 232);
      fadeB = w * 0.43;
      fadeA = w * 0.55;
    }
    railY = Math.min(h - 26, baselineY + maxFont * 0.3 + 18);
    /* The bottom seam completes past the canvas edge unless bottomClearance moves its endpoint inward. */
    botB =
      typeof options.bottomClearance === 'number'
        ? h - Math.max(0, options.bottomClearance)
        : h + 10;
    botA = Math.min(narrow ? Math.max(railY + 10, h - 60) : h - 46, botB - 1);
    for (let i = 0; i < POOL; i++) {
      const px = ux[i] ?? 0;
      /* Wide homes sit right of the type column; the clearing edge itself is a per-frame dithered density falloff. */
      const raw = standalone || narrow ? px * w : (0.4 + px * 0.63) * w;
      hx[i] = Math.round(raw / COL_PITCH) * COL_PITCH + (bow[i] ?? 0) * 4;
      const py = uy[i] ?? 0;
      /* Homes seed the full wrap cycle (h + 60, the draw loop's modulus) so the bottom strip isn't empty at boot. */
      hy[i] = narrow ? (h + 60) * (0.5 + py * 0.5) : py * (h + 60);
    }
  }

  const atlas = document.createElement('canvas');
  const atlasCtx = atlas.getContext('2d', { willReadFrequently: true });
  /* willReadFrequently pins the atlas to CPU memory, so the frame loop blits from a GPU-resident ImageBitmap snapshot once it lands. */
  let atlasSrc: CanvasImageSource = atlas;
  let atlasGen = 0;
  function snapshotAtlas(): void {
    atlasSrc = atlas;
    const gen = ++atlasGen;
    if (typeof createImageBitmap !== 'function') return;
    createImageBitmap(atlas)
      .then((bmp) => {
        if (gen !== atlasGen) {
          bmp.close();
          return;
        }
        const old = atlasSrc;
        atlasSrc = bmp;
        if (old !== atlas && old instanceof ImageBitmap) old.close();
      })
      .catch(() => undefined);
  }
  /** Atlas device scale: cp / CELL, so atlas cells land on integer px. */
  let dprA = 1;
  /** Atlas cell size in device px. */
  let cp = CELL;
  /** Per-(row × glyph) ink bounds: source rect [x, y, w, h] in atlas px plus its offset from the glyph's centre. */
  const spr = new Int16Array(ATLAS_ROWS * inv.length * 4);
  const sprOff = new Int16Array(ATLAS_ROWS * inv.length * 2);

  function measureSprites(): void {
    if (!atlasCtx) return;
    const img = atlasCtx.getImageData(0, 0, atlas.width, atlas.height);
    const data = img.data;
    const cols = inv.length;
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
    /* Rounding cp to whole device px keeps cell boundaries and the Bayer grid exact. */
    cp = Math.max(8, Math.round(CELL * dpr));
    dprA = cp / CELL;
    atlas.width = Math.max(1, inv.length * cp);
    atlas.height = Math.max(1, ATLAS_ROWS * cp);
    atlasCtx.setTransform(dprA, 0, 0, dprA, 0, 0);
    atlasCtx.clearRect(0, 0, inv.length * CELL, ATLAS_ROWS * CELL);
    atlasCtx.fillStyle = ink;
    atlasCtx.textAlign = 'center';
    atlasCtx.textBaseline = 'middle';
    /* Rows 0–2 are the rain tiers; row 3 is the flight size at native px,
       so a flying glyph never draws through a downscale. */
    for (let row = 0; row < ATLAS_ROWS; row++) {
      const px =
        row === COND_ROW ? CONDENSED_PX : (TIER_SIZE[row] ?? 10) * glyphScale;
      atlasCtx.font = `500 ${px}px ${disp}`;
      for (let col = 0; col < inv.length; col++) {
        atlasCtx.fillText(
          inv[col] ?? '',
          col * CELL + CELL / 2,
          row * CELL + CELL / 2
        );
      }
    }
    ditherAtlasRows(
      atlasCtx,
      atlas.width,
      atlas.height,
      dprA,
      (cssY) => Math.min(ATLAS_ROWS - 1, Math.floor(cssY / CELL)),
      (row) => (row === COND_ROW ? 1 : (TIER_COVER[row] ?? 1))
    );
    measureSprites();
    snapshotAtlas();
  }

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
  let prevSeed = 0;

  const WORD_RAMP: readonly { cover: number; width: number }[] = [
    { cover: 16, width: 46 },
    { cover: 12, width: 44 },
    { cover: 8, width: 40 },
    { cover: 5, width: 26 },
    { cover: 3, width: 20 },
    { cover: 1, width: 16 },
  ];
  const RAMP_SPAN = WORD_RAMP.reduce((s, t) => s + t.width, 0);
  type WordSprite = {
    canvas: HTMLCanvasElement;
    x: number;
    y: number;
    w: number;
    h: number;
    ready: boolean;
  };
  const makeSprite = (): WordSprite => ({
    canvas: document.createElement('canvas'),
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    ready: false,
  });
  const heldSprite = makeSprite();
  const peelSprite = makeSprite();
  let heldSpriteDirty = true;

  function buildWordSprite(
    sprite: WordSprite,
    word: string,
    font: string,
    px: number,
    left: number,
    right: number,
    seed: number,
    rtl: boolean
  ): void {
    sprite.ready = false;
    if (!word || px <= 0) return;
    const c = sprite.canvas.getContext('2d', { willReadFrequently: true });
    if (!c) return;
    const padX = 24;
    const ascent = px * 1.08;
    const descent = px * 0.36;
    sprite.x = left - padX;
    sprite.y = baselineY - ascent;
    sprite.w = right - left + padX * 2;
    sprite.h = ascent + descent;
    const cw = Math.max(1, Math.round(sprite.w * dpr));
    const ch = Math.max(1, Math.round(sprite.h * dpr));
    sprite.canvas.width = cw;
    sprite.canvas.height = ch;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, sprite.w, sprite.h);
    c.fillStyle = ink;
    c.textAlign = 'left';
    c.textBaseline = 'alphabetic';
    c.font = font;
    c.fillText(word, padX, ascent);

    /* Solid ink enters from the word's reading side (flipped for RTL) and falls away through the Bayer tiers. */
    const deg = (14 + ((seed * 13) % 26)) * (seed % 2 === 0 ? 1 : -1);
    const rad = (deg * Math.PI) / 180;
    const flip = rtl ? -1 : 1;
    const co = Math.cos(rad) * flip;
    const si = Math.sin(rad) * flip;
    let pMin = Infinity;
    let pMax = -Infinity;
    for (const [cx, cy] of [
      [0, 0],
      [cw, 0],
      [0, ch],
      [cw, ch],
    ] as const) {
      const pr = cx * co + cy * si;
      if (pr < pMin) pMin = pr;
      if (pr > pMax) pMax = pr;
    }
    const span = Math.max(1, pMax - pMin);
    /* chunky device-px cells, ~5 CSS px — the covers' scale */
    const cell = Math.max(3, Math.round(5 * dpr));
    const img = c.getImageData(0, 0, cw, ch);
    const data = img.data;
    for (let y = 0; y < ch; y++) {
      const bRow = BAYER[Math.floor(y / cell) % 4] ?? BAYER[0] ?? [0, 8, 2, 10];
      for (let x = 0; x < cw; x++) {
        const idx = (y * cw + x) * 4 + 3;
        if ((data[idx] ?? 0) === 0) continue;
        const u = (x * co + y * si - pMin) / span;
        let at = u * RAMP_SPAN;
        let cover = 1;
        for (const tier of WORD_RAMP) {
          if (at < tier.width) {
            cover = tier.cover;
            break;
          }
          at -= tier.width;
        }
        const threshold = ((bRow[Math.floor(x / cell) % 4] ?? 0) + 0.5) / 16;
        data[idx] = cover / 16 > threshold ? 255 : 0;
      }
    }
    c.putImageData(img, 0, 0);
    sprite.ready = true;
  }

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

  /* The next word's raster is prepared during the hold because running it at morph start stalls the first frame ~200ms on throttled mobile; resize and late webfonts invalidate it. */
  const prepPts = new Float32Array(POOL * 2);
  let prepWord = -1;
  /* the layout cut the set was rastered under — part of the cache key:
     a wide raster's pitch and cap belong to the wide deal */
  let prepNarrow = false;
  let prepCount = 0;
  let prepFontPx = 0;
  let prepAdvance = 0;
  /* which cycle already queued its prepare, so a hold schedules once */
  let prepQueuedCycle = -1;
  let prepHandle = 0;
  let prepViaIdle = false;
  const cancelPrepare = (): void => {
    if (prepHandle === 0) return;
    if (prepViaIdle) window.cancelIdleCallback(prepHandle);
    else window.clearTimeout(prepHandle);
    prepHandle = 0;
  };
  const schedulePrepare = (wordIndex: number): void => {
    cancelPrepare();
    const run = (): void => {
      prepHandle = 0;
      if (destroyed) return;
      prepareSamples(wordIndex);
    };
    if (typeof window.requestIdleCallback === 'function') {
      prepViaIdle = true;
      /* the timeout keeps the raster inside the 4s hold even on a busy
         main thread — late is fine, morph-start is not */
      prepHandle = window.requestIdleCallback(run, { timeout: 1500 });
    } else {
      prepViaIdle = false;
      prepHandle = window.setTimeout(run, 200);
    }
  };

  function prepareSamples(wordIndex: number): void {
    if (!sampleCtx || w === 0) return;
    const entry = SCRIPTS[wordIndex];
    if (!entry) return;

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

    /* On narrow the pitch cap and proportional divisor coarsen together by 13/9, and the cap is the narrow deal's recruitable set so overflow re-steps against what can seat. */
    const cap = narrow ? pickNCount : eligibleCount;
    let step = narrow
      ? Math.max(6, Math.min(COND_PITCH_NARROW, Math.round(fontPx / 9)))
      : Math.max(6, Math.min(COND_PITCH, Math.round(fontPx / 13)));
    let count = scan(step, sw, sh, cap);
    while (count > cap && step < 24) {
      step = Math.max(step + 1, Math.round(step * Math.sqrt(count / cap)));
      count = scan(step, sw, sh, cap);
    }
    /* pts is scan scratch — copy out so a mid-hold resample (resize)
       can rescan without clobbering the standing set */
    prepCount = Math.min(count, cap);
    prepPts.set(pts.subarray(0, prepCount * 2));
    prepFontPx = fontPx;
    prepAdvance = advance;
    prepNarrow = narrow;
    prepWord = wordIndex;
  }

  function resample(wordIndex: number): void {
    if (!sampleCtx || w === 0) return;
    const entry = SCRIPTS[wordIndex];
    if (!entry) return;

    /* The outgoing word's particles are dealt first, then visible rain, then culled rain; the rain position formula must match draw(). */
    const wrapC = h + 60;
    /* A narrow deal recruits only from the narrow view, since a particle the draw loop never visits would fly invisibly. */
    const sel = narrow ? pickN : pick;
    const selCount = narrow ? pickNCount : eligibleCount;
    let cc = 0;
    mark.fill(0);
    for (let k = 0; k < selCount; k++) {
      const i = sel[k] ?? 0;
      if (inNext[i] === 1) {
        cand[cc++] = i;
        mark[i] = 1;
      }
    }
    for (let k = 0; k < selCount; k++) {
      const i = sel[k] ?? 0;
      if (mark[i] === 1) continue;
      const rx =
        (hx[i] ?? 0) +
        Math.sin(simT / (period[i] ?? 8) + (phase[i] ?? 0)) * (sway[i] ?? 2);
      let ry = (hy[i] ?? 0) + simT * (fall[i] ?? 3);
      ry = ((ry % wrapC) + wrapC) % wrapC;
      ry -= 30;
      if (keepAt(rx, ry, true) > (stag[i] ?? 0)) {
        cand[cc++] = i;
        mark[i] = 1;
      }
    }
    if (cc < selCount) {
      for (let k = 0; k < selCount; k++) {
        const i = sel[k] ?? 0;
        if (mark[i] !== 1) cand[cc++] = i;
      }
    }

    /* Normally prepared during the hold; the synchronous call is the fallback, including a set rastered under the other layout cut. */
    if (prepWord !== wordIndex || prepNarrow !== narrow)
      prepareSamples(wordIndex);
    if (prepWord !== wordIndex) return; // raster impossible — guarded above, defensive
    const fontPx = prepFontPx;
    const advance = prepAdvance;
    ptCount = prepCount;
    /* one-shot: the set is consumed; the next hold prepares the next word */
    prepWord = -1;
    const pad = 10;
    const yb = Math.round(fontPx * 1.08);

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

    inNext.fill(0);
    /* Landed glyphs draw centred, so edge targets pull in by half a condensed glyph to stay inside the printed word. */
    const inset = advance > CONDENSED_PX * 2 ? CONDENSED_PX / 2 : 0;
    for (let k = 0; k < ptCount; k++) {
      const p = cand[k] ?? 0;
      const rawX = left + (prepPts[k * 2] ?? 0) - pad;
      tx[p] = Math.min(Math.max(rawX, left + inset), left + advance - inset);
      ty[p] = baselineY + (prepPts[k * 2 + 1] ?? 0) - yb;
      inNext[p] = 1;
    }
    sampledWord = wordIndex;
    heldSpriteDirty = true;
  }

  /** Refreshes the fill metrics after webfonts load without re-dealing: standing targets are remapped affinely onto the new span. */
  function remeasure(wordIndex: number, oldBaselineY = baselineY): void {
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
        tx[p] = Math.min(
          Math.max(mapped, left + inset),
          left + advance - inset
        );
        ty[p] = baselineY + ((ty[p] ?? oldBaselineY) - oldBaselineY) * sy;
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
    heldSpriteDirty = true;
  }

  let simT = 0;
  let pendingResample = false;
  /* Zone gates, 0…1, ramped by draw() so the word holes grow and heal as dithered ramps. */
  let nextGate = 1;
  let prevGate = 0;
  let lastTs = -1;
  let raf = 0;
  let running = false;
  let visible = true;
  let destroyed = false;
  let announcedWord = -1;
  let morphedCycle = -1;

  /* The single phase authority, written into standing slots so the frame allocates nothing. */
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

  /** The clearing edge's shift toward the copy in px at a position along it (y on wide layouts, x on narrow). */
  function copyEdgeShift(along: number, span: number): number {
    const u = span > 0 ? along / span : 0;
    const ramp = fadeA - fadeB;
    const wave = Math.sin(u * 8.2 + simT * 0.13) * 0.16 * ramp;
    const bow = (smoothstep(0.22, 0, u) + smoothstep(0.78, 1, u)) * 0.42 * ramp;
    return wave + bow;
  }

  /** A word's clearing at (x, y), 0…1, as a rounded distance field off its glyph box. */
  function wordKeep(
    x: number,
    y: number,
    gate: number,
    left: number,
    right: number,
    px: number
  ): number {
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

  /** The rain's keep-probability at (x, y), which each particle compares to its fixed uniform. */
  function keepAt(x: number, y: number, morphing: boolean): number {
    if (
      y < botA &&
      /* Clears copyEdgeShift's worst-case 0.16 x ramp bow. */
      (narrow ? y : x) > fadeA + 0.16 * (fadeA - fadeB) &&
      (ptCount === 0 ||
        nextGate <= 0 ||
        x < formedLeft - 40 ||
        x > formedRight + 40) &&
      (!morphing ||
        !prevWord ||
        prevGate <= 0 ||
        x < prevLeft - 40 ||
        x > prevRight + 40)
    ) {
      return narrow ? NARROW_KEEP : 1;
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
      k *= wordKeep(x, y, prevGate, prevLeft, prevRight, prevPx);
    }
    if (narrow) k *= NARROW_KEEP;
    return k;
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
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
    const current =
      ((cycle % SCRIPTS.length) + SCRIPTS.length) % SCRIPTS.length;
    const next = (current + 1) % SCRIPTS.length;

    /* The incoming hole opens just before the first glyph lands and the outgoing hole heals as the dust departs, with exact handoffs at both boundaries. */
    if (!formWords) {
      nextGate = 0;
      prevGate = 0;
    } else if (p < holdDur) {
      nextGate = 1;
      prevGate = 0;
    } else {
      const mm = p - holdDur;
      nextGate = smoothstep(FLIGHT - 0.7, FLIGHT, mm);
      prevGate = 1 - smoothstep(PEEL, MORPH, mm);
    }

    let morph = -1; // −1: holding; 0…1: flying to `next`
    if (formWords && p < holdDur) {
      if (sampledWord !== current || pendingResample) {
        resample(current);
        inPrev.set(inNext);
        pendingResample = false;
      }
      if (!reduced && prepQueuedCycle !== cycle) {
        prepQueuedCycle = cycle;
        schedulePrepare(next);
      }
      announce(current);
    } else if (formWords) {
      if (morphedCycle !== cycle) {
        morphedCycle = cycle;
        prevLeft = formedLeft;
        prevRight = formedRight;
        prevWord = formedWord;
        prevFont = formedFont;
        prevPx = formedPx;
        prevRtl = formedRtl;
        prevLabel = formedLabel;
        prevLabelW = formedLabelW;
        prevSeed = current;
        if (wordFill === 'dithered') {
          buildWordSprite(
            peelSprite,
            prevWord,
            prevFont,
            prevPx,
            prevLeft,
            prevRight,
            prevSeed,
            prevRtl
          );
        }
        fx.set(lastX);
        fy.set(lastY);
        inPrev.set(inNext);
        resample(next);
        announce(next);
        const span = Math.max(1, prevRight - prevLeft);
        const nspan = Math.max(1, formedRight - formedLeft);
        /* narrow's deal never reaches past NARROW_POOL, so the departure
           pass walks the same bound the rest of the frame does */
        const lim = narrow ? NARROW_POOL : POOL;
        for (let i = 0; i < lim; i++) {
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
            const dn = clamp01(((tx[i] ?? 0) - formedLeft) / nspan);
            dep[i] = formedRtl ? 1 - dn : dn;
          }
        }
      }
      morph = (p - holdDur) / MORPH;
    }

    const mp = morph < 0 ? 0 : p - holdDur; // seconds into the morph

    const printU = morph < 0 ? clamp01(p / PRINT) : 1;
    const printX = formedRtl
      ? formedRight - printU * (formedRight - formedLeft)
      : formedLeft + printU * (formedRight - formedLeft);
    const peelU = morph < 0 ? 0 : clamp01(mp / PEEL);
    const peelX = prevRtl
      ? prevRight - peelU * (prevRight - prevLeft)
      : prevLeft + peelU * (prevRight - prevLeft);

    /* Two passes keep the word-bound swarm above the rain without allocating. */
    const wrap = h + 60;
    const gcount = inv.length;
    const ord = narrow ? orderN : order;
    const ordCount = narrow ? orderNCount : POOL;
    let curQ = -1;
    for (let pass = 0; pass < 2; pass++) {
      for (let k = 0; k < ordCount; k++) {
        const i = ord[k] ?? 0;
        const wordBound =
          morph < 0 ? inNext[i] === 1 : inNext[i] === 1 || inPrev[i] === 1;
        if ((pass === 1) !== wordBound) continue;

        const t = tier[i] ?? 2;

        let x =
          (hx[i] ?? 0) +
          Math.sin(simT / (period[i] ?? 8) + (phase[i] ?? 0)) * (sway[i] ?? 2);
        let y = (hy[i] ?? 0) + simT * (fall[i] ?? 3);
        y = ((y % wrap) + wrap) % wrap;
        y -= 30;

        if (!wordBound) {
          /* The ±0.06 hysteresis band stops the cull iso-line strobing flank glyphs as the rain sways across it. */
          const keep = keepAt(x, y, morph >= 0);
          /* a hard-cleared zone (keep 0) culls regardless of hysteresis —
             otherwise a low-threshold glyph drawn at boot survives forever
             inside a clearing */
          if (
            keep <= 0 ||
            keep <= (stag[i] ?? 0) + (vis[i] === 1 ? -0.06 : 0.06)
          ) {
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
            x = tx[i] ?? 0;
            y = ty[i] ?? 0;
            lastX[i] = x;
            lastY[i] = y;
            /* printU ≥ 1 absorbs unconditionally: a late remeasure can move
               the front's endpoint off stale targets, and none may linger. */
            const absorbed =
              printU >= 1 || (formedRtl ? x >= printX : x <= printX);
            if (absorbed) continue;
            row = COND_ROW;
          }
        } else if (wordBound) {
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
            y =
              (fy[i] ?? 0) +
              ((ty[i] ?? 0) - (fy[i] ?? 0)) * e -
              Math.abs(arc) * 34;
            row = COND_ROW;
          } else if (inNext[i] === 1) {
            /* A recruit keeps its rain material until it lands. */
            x += ((tx[i] ?? 0) - x) * e + arc * 36 * (1 - e);
            y += ((ty[i] ?? 0) - y) * e;
            if (u >= 1) {
              row = COND_ROW;
            }
          } else {
            /* Landing is exact (e = 1 is the rain formula), so the handoff back to plain rain never jumps. */
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
        const q = row === COND_ROW ? ALPHA_Q : (toneQ[i] ?? ALPHA_Q);
        if (q !== curQ) {
          curQ = q;
          ctx.globalAlpha = q / ALPHA_Q;
        }
        const cell = row * gcount + (gi[i] ?? 0);
        const m = cell * 4;
        const sw = spr[m + 2] ?? 0;
        if (sw === 0) continue;
        const sh = spr[m + 3] ?? 0;
        const o = cell * 2;
        /* Device-px snapping moves the Bayer lattice by whole cells, so the pattern stays rigid at display rate. */
        ctx.drawImage(
          atlasSrc,
          spr[m] ?? 0,
          spr[m + 1] ?? 0,
          sw,
          sh,
          Math.round(x * dpr) + (sprOff[o] ?? 0),
          Math.round(y * dpr) + (sprOff[o + 1] ?? 0),
          sw,
          sh
        );
      }
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

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
        if (wordFill === 'dithered') {
          if (heldSpriteDirty) {
            buildWordSprite(
              heldSprite,
              formedWord,
              formedFont,
              formedPx,
              formedLeft,
              formedRight,
              Math.max(0, sampledWord),
              formedRtl
            );
            heldSpriteDirty = false;
          }
          if (heldSprite.ready) {
            ctx.drawImage(
              heldSprite.canvas,
              heldSprite.x,
              heldSprite.y,
              heldSprite.w,
              heldSprite.h
            );
          }
        } else {
          ctx.font = formedFont;
          ctx.fillText(formedWord, formedLeft, baselineY);
        }
        ctx.restore();
      }
    } else if (prevWord && peelU < 1) {
      ctx.save();
      ctx.beginPath();
      if (prevRtl) ctx.rect(prevLeft - 20, 0, peelX - (prevLeft - 20), h);
      else ctx.rect(peelX, 0, prevRight + 20 - peelX, h);
      ctx.clip();
      if (wordFill === 'dithered') {
        if (peelSprite.ready) {
          ctx.drawImage(
            peelSprite.canvas,
            peelSprite.x,
            peelSprite.y,
            peelSprite.w,
            peelSprite.h
          );
        }
      } else {
        ctx.font = prevFont;
        ctx.fillText(prevWord, prevLeft, baselineY);
      }
      ctx.restore();
    }

    const calIn =
      morph < 0 && ptCount > 0 ? clamp01((p - PRINT - 0.1) / 0.45) : 0;
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
      /* clearRect ignores alpha, so the label's hole is punched only at full ink. */
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
      /* Layout may have settled since the mount-time seed, so the first wake re-measures and re-seeds. */
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

  function resize(): void {
    const box = canvas.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) return;
    const newW = Math.round(box.width);
    const newH = Math.round(box.height);
    /* The ResizeObserver and dpr watcher can both fire on a zoom, so an unchanged box and scale returns early. */
    const sameDpr =
      dpr ===
      Math.min(narrow ? DPR_CAP_NARROW : DPR_CAP, window.devicePixelRatio || 1);
    if (newW === w && newH === h && sameDpr && w !== 0) return;
    const oldW = w;
    const oldH = h;
    const oldNarrow = narrow;
    const oldBaseline = baselineY;
    w = newW;
    h = newH;
    /* layout() runs first because it derives the narrow flag the dpr cap keys off. */
    layout();
    dpr = Math.min(
      narrow ? DPR_CAP_NARROW : DPR_CAP,
      window.devicePixelRatio || 1
    );
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    buildAtlas();
    /* The prepared sample set was rastered against the old geometry. */
    prepWord = -1;
    prepQueuedCycle = -1;
    cancelPrepare();
    const cutFlipped = narrow !== oldNarrow;
    if (morphingNow()) {
      if (oldW > 0 && oldH > 0 && (oldW !== w || oldH !== h)) {
        const sx = w / oldW;
        const sy = h / oldH;
        for (let i = 0; i < POOL; i++) {
          fx[i] = (fx[i] ?? 0) * sx;
          fy[i] = (fy[i] ?? 0) * sy;
          lastX[i] = (lastX[i] ?? 0) * sx;
          lastY[i] = (lastY[i] ?? 0) * sy;
          tx[i] = (tx[i] ?? 0) * sx;
          ty[i] = (ty[i] ?? 0) * sy;
        }
        prevLeft *= sx;
        prevRight *= sx;
        formedLeft *= sx;
        formedRight *= sx;
        formedAdvance = Math.round(formedRight - formedLeft);
        for (const sprite of [heldSprite, peelSprite]) {
          sprite.x *= sx;
          sprite.y *= sy;
          sprite.w *= sx;
          sprite.h *= sy;
        }
        heldSpriteDirty = true;
      }
      pendingResample = true;
    } else if (!cutFlipped && sampledWord >= 0) {
      /* Remeasuring squeezes the standing swarm onto the new geometry, since a re-deal would teleport the word. */
      remeasure(sampledWord, oldBaseline);
    } else {
      /* A flipped narrow cut changes the pitch and recruitable set, so the word re-deals. */
      sampledWord = -1;
    }
    if (reduced || !running) {
      draw();
    }
  }

  let resizeRaf = 0;
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(resize);
  });
  ro.observe(canvas);

  /* Browser zoom can change devicePixelRatio without resizing the box, so a resolution media query re-arms on each change. */
  let dprMedia: MediaQueryList | null = null;
  function onDprChange(): void {
    if (destroyed) return;
    armDprWatch();
    resize();
  }
  const armDprWatch = (): void => {
    dprMedia?.removeEventListener('change', onDprChange);
    dprMedia = window.matchMedia(
      `(resolution: ${window.devicePixelRatio || 1}dppx)`
    );
    dprMedia.addEventListener('change', onDprChange);
  };
  armDprWatch();

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) start();
      else stop();
    },
    { threshold: 0.02 }
  );
  io.observe(canvas);

  const themeMo = new MutationObserver(() => {
    const next = resolveInk();
    if (next === ink) return;
    ink = next;
    buildAtlas();
    /* the word sprites carry the ink literally — re-pour both */
    heldSpriteDirty = true;
    if (wordFill === 'dithered' && prevWord) {
      buildWordSprite(
        peelSprite,
        prevWord,
        prevFont,
        prevPx,
        prevLeft,
        prevRight,
        prevSeed,
        prevRtl
      );
    }
    if (reduced || !running) draw();
  });
  themeMo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'class'],
  });

  /* The boot instant must stay inside FIRST_HOLD or the first peel lifts off from uninitialized origins. */
  simT = Math.min(FIRST_HOLD - 0.15, 1.05);
  resize();
  if (reduced) {
    announce(0);
    draw();
  } else if (visible) {
    start();
  }

  /* Late webfonts remeasure rather than resample, because re-dealing teleports standing glyphs. */
  if ('fonts' in document) {
    document.fonts.ready
      .then(() => {
        if (destroyed) return;
        buildAtlas();
        /* A sample set prepared against fallback metrics would land the swarm on the wrong advance. */
        prepWord = -1;
        prepQueuedCycle = -1;
        if (sampledWord >= 0) remeasure(sampledWord);
        if (!running) draw();
      })
      .catch(() => undefined);
  }

  return {
    destroy() {
      atlasGen++;
      if (atlasSrc !== atlas && atlasSrc instanceof ImageBitmap)
        atlasSrc.close();
      destroyed = true;
      stop();
      cancelPrepare();
      cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      io.disconnect();
      themeMo.disconnect();
      dprMedia?.removeEventListener('change', onDprChange);
      atlas.width = 0;
      atlas.height = 0;
      sample.width = 0;
      sample.height = 0;
      for (const sprite of [heldSprite, peelSprite]) {
        sprite.canvas.width = 0;
        sprite.canvas.height = 0;
      }
    },
  };
}
