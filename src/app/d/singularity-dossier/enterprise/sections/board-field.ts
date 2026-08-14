/**
 * The terminus board field — a coarse split-flap cell grid on a 2D canvas.
 *
 * Three layers of language, one board pitch:
 *   1. TONE cells — two quiet ink levels re-flipped by slow column waves.
 *      The wave front is the field's only amber: a tight phosphor trail
 *      (glowTau short) that reads as one moving line, never a flank.
 *   2. NOISE glyphs — a sparse deterministic subset of cells carries a
 *      single faint character or a two-letter locale code, so any still
 *      frame says "language", not "texture". They swap when their cell
 *      flips.
 *   3. ANNOUNCEMENTS — every few seconds a real greeting resolves cell by
 *      cell somewhere on the wall ("BONJOUR", "こんにちは", "환영합니다"…)
 *      with a two-cell locale stamp, holds legibly for several seconds,
 *      then flips back into tone. Hebrew runs right-to-left. Vetted words
 *      only; the resolving word and the wave front never fire together —
 *      the schedule defers one for the other, so the board has ONE live
 *      moment at a time.
 *
 * The rows that would pass behind the measured headline box are never
 * drawn at all; the gap is structural, not masked, so the calm under the
 * type reads as the board's architecture.
 *
 * ARCHITECTURE — a CPU per-mount loop, not the shared WebGL engine: the
 * field is ~1,700 fillRects plus ~100 fillTexts per frame under a 30fps
 * cap, comfortably CPU territory (the dither-field precedent), and drawing
 * straight into the mounted canvas keeps the background TRANSPARENT — the
 * page's own paper shows through the seams, so surviving the dark-theme
 * remap is an ink swap (setInk) rather than a repaint of ground. Full
 * guard set: IntersectionObserver pause (120px), document.hidden,
 * prefers-reduced-motion = one composed static frame (with two held
 * announcements, so even the still shows translation), ResizeObserver,
 * DPR cap 2, fps cap, dt clamp with a wave resync after a background tab
 * returns, and deterministic hashing so every run of the board is the
 * same board.
 */

export type BoardInk = {
  /** Cell ink, 0–255 rgb. */
  ink: [number, number, number];
  /** Alpha of a quiet (level-0) cell. */
  quiet: number;
  /** Alpha of a marked (level-1) cell. */
  mark: number;
  /** Alpha of the sparse noise characters / locale codes. */
  glyph: number;
  /** Alpha of a resolved announcement character. */
  word: number;
  /** Alpha of an announcement's locale-stamp characters. */
  stamp: number;
  /** Alpha of an announcement tile's face tone. */
  face: number;
  /** Pigment a landed announcement glyph flashes before cooling to ink. */
  flash: [number, number, number];
  /** Afterglow emission, 0–255 rgb. */
  glow: [number, number, number];
  /** Peak afterglow alpha; decays at glowTau. */
  glowAlpha: number;
};

export const BOARD_LIGHT: BoardInk = {
  ink: [15, 17, 19],
  quiet: 0.05,
  mark: 0.105,
  glyph: 0.3,
  word: 0.82,
  stamp: 0.5,
  face: 0.13,
  flash: [207, 133, 20],
  glow: [255, 158, 13],
  glowAlpha: 0.34,
};

/* The same board photographed at night: white-alpha tone so the grid
   survives the dark remap, the glow a step warmer — emission carries
   further on ink than on paper. */
export const BOARD_DARK: BoardInk = {
  ink: [255, 255, 255],
  quiet: 0.045,
  mark: 0.095,
  glyph: 0.28,
  word: 0.86,
  stamp: 0.52,
  face: 0.115,
  flash: [255, 172, 46],
  glow: [255, 172, 46],
  glowAlpha: 0.3,
};

export type BoardParams = {
  /** CSS px cell pitch, seam included. Coarse: 18–26 reads as a board. */
  cell: number;
  /** CSS px of bare ground between cells. */
  seam: number;
  /** CSS px hinge gap across a settled cell's middle. */
  hinge: number;
  /** Seconds for one fold-and-swap. */
  flipDur: number;
  /** Base seconds between column waves. */
  wavePeriod: number;
  /** Seeded extra seconds added per wave. */
  waveJitter: number;
  /** Column-to-column delay inside a wave, seconds. */
  colStagger: number;
  /** Share of a column's cells that take the wave. */
  waveTake: number;
  /** Seconds between sparse single-cell idle flips. */
  idleMin: number;
  idleMax: number;
  /** Baseline share of marked cells. */
  markBase: number;
  /** Extra marked share inside the wave's drifting tonal band. */
  markSwing: number;
  /** Phosphor decay constant, seconds — short, so amber is a front, not a flank. */
  glowTau: number;
  /** CSS px added around the measured gap box before masking rows. */
  gapPad: number;
  /** Share of cells that carry a faint noise glyph. */
  glyphShare: number;
  /** Share of those that carry a locale code instead of a character. */
  codeShare: number;
  /** Sim-time of the first announcement. */
  annFirst: number;
  /** Base seconds between announcement starts. */
  annPeriod: number;
  /** Seconds a resolved announcement holds before dispersing. */
  annHold: number;
  /** Cell-to-cell stagger while an announcement resolves, seconds. */
  annPer: number;
  /** Cell-to-cell stagger while it disperses, seconds. */
  annOut: number;
};

export const BOARD_DEFAULTS: BoardParams = {
  cell: 22,
  seam: 1,
  hinge: 1,
  flipDur: 0.15,
  wavePeriod: 11.5,
  waveJitter: 2.5,
  colStagger: 0.05,
  waveTake: 0.35,
  idleMin: 0.9,
  idleMax: 2.2,
  markBase: 0.07,
  markSwing: 0.1,
  glowTau: 0.1,
  gapPad: 24,
  glyphShare: 0.055,
  codeShare: 0.3,
  annFirst: 0.7,
  annPeriod: 5.2,
  annHold: 7.5,
  annPer: 0.085,
  annOut: 0.045,
};

/* ---- the wall's language ---- */

export type BoardWord = {
  chars: string[];
  stamp: string;
  /** Right-to-left script: the word resolves from its right end. */
  rtl?: boolean;
};

/* Real greetings only — the wall is a departure board mid-announcement,
   never glyph soup. Scripts whose letters survive per-cell isolation
   (Latin, CJK, Hangul, Hebrew); cursive scripts (Arabic) live in the DOM
   departures pool instead, where they can be shaped properly. */
const WORDS: readonly BoardWord[] = [
  { chars: Array.from('BONJOUR'), stamp: 'FR' },
  { chars: Array.from('こんにちは'), stamp: 'JA' },
  { chars: Array.from('WILLKOMMEN'), stamp: 'DE' },
  { chars: Array.from('환영합니다'), stamp: 'KO' },
  { chars: Array.from('BIENVENIDO'), stamp: 'ES' },
  { chars: Array.from('欢迎光临'), stamp: 'ZH' },
  { chars: Array.from('BEM-VINDO'), stamp: 'PT' },
  { chars: Array.from('VÄLKOMMEN'), stamp: 'SV' },
  { chars: Array.from('שלום'), stamp: 'HE', rtl: true },
  { chars: Array.from('BENVENUTO'), stamp: 'IT' },
  { chars: Array.from('WELKOM'), stamp: 'NL' },
  { chars: Array.from('WITAMY'), stamp: 'PL' },
];

/* Sparse single characters between announcements — the scripts the flap
   headline riffles through, restated at board pitch. */
const NOISE = Array.from('AEIKORSTUNZ言語翻訳한글번역中文訳ÑÉÜÇØÅ日本語047·');

const CODES: readonly string[] = [
  'FR',
  'DE',
  'JA',
  'KO',
  'ES',
  'PT',
  'IT',
  'ZH',
  'NL',
  'PL',
  'SV',
  'TR',
  'HE',
  'UK',
];

export type GapRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  /** CSS px of clearance around this box; defaults to params.gapPad. The
      headline gap wants the full moat, solid furniture wants almost none. */
  pad?: number;
};

export type BoardFieldHandle = {
  /** Rows intersecting any of these canvas-relative CSS-px boxes are never
      drawn — the headline gap, plus any solid furniture (the departures
      rail) standing over the canvas. */
  setMasks: (rects: GapRect[]) => void;
  setInk: (ink: BoardInk) => void;
  pause: () => void;
  resume: () => void;
  renderStatic: () => void;
  destroy: () => void;
};

export type BoardOptions = {
  params?: Partial<BoardParams>;
  ink?: BoardInk;
  fps?: number;
  seed?: number;
  /** Override the announcement vocabulary (defaults to the greetings). */
  words?: readonly BoardWord[];
  /** CSS font-family stack for the board's letters (defaults to mono). */
  font?: string;
};

/** Deterministic per-cell decision hash — stable across runs and resizes. */
function cellHash(c: number, r: number, k: number): number {
  let h = (c * 374761393 + r * 668265263 + k * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Wave = { start: number; col: number; index: number };

/** kind: 0 word character, 1 blank spacer tile, 2 locale-stamp character. */
type StripCell = { ch: string; kind: 0 | 1 | 2; order: number };

type AnnCell = StripCell & { col: number; under: number; handed: boolean };

type Ann = { row: number; start: number; holdUntil: number; cells: AnnCell[] };

/** Visual left→right strip: word, blank, stamp — mirrored for RTL scripts,
    whose characters also resolve from the right end first. */
function buildStrip(word: BoardWord): StripCell[] {
  const len = word.chars.length;
  const strip: StripCell[] = [];
  if (word.rtl) {
    strip.push({ ch: word.stamp[0] ?? '', kind: 2, order: len + 1 });
    strip.push({ ch: word.stamp[1] ?? '', kind: 2, order: len + 2 });
    strip.push({ ch: '', kind: 1, order: len });
    for (let v = 0; v < len; v++) {
      const j = len - 1 - v;
      strip.push({ ch: word.chars[j] ?? '', kind: 0, order: j });
    }
  } else {
    word.chars.forEach((ch, j) => strip.push({ ch, kind: 0, order: j }));
    strip.push({ ch: '', kind: 1, order: len });
    strip.push({ ch: word.stamp[0] ?? '', kind: 2, order: len + 1 });
    strip.push({ ch: word.stamp[1] ?? '', kind: 2, order: len + 2 });
  }
  return strip;
}

export function createBoardField(
  canvas: HTMLCanvasElement,
  options: BoardOptions = {}
): BoardFieldHandle | null {
  const blit = canvas.getContext('2d');
  if (!blit) return null;
  /* narrowed once — the render closures below capture the non-null binding */
  const ctx: CanvasRenderingContext2D = blit;

  const params: BoardParams = { ...BOARD_DEFAULTS, ...options.params };
  const words = options.words ?? WORDS;
  let ink = options.ink ?? BOARD_LIGHT;
  const fps = options.fps ?? 30;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rng = mulberry32(options.seed ?? 0x74657262);

  const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
  const face = options.font ?? MONO;
  const fontPx = (f: number) => Math.max(7, Math.round(params.cell * f * dpr));
  const fontNoise = `${fontPx(0.5)}px ${face}`;
  const fontCode = `${fontPx(0.38)}px ${face}`;
  const fontWord = `500 ${fontPx(0.6)}px ${face}`;
  const fontStamp = `500 ${fontPx(0.4)}px ${face}`;

  /* ---- grid state (parallel arrays, allocated per resize) ---- */
  let cols = 0;
  let rows = 0;
  let offX = 0;
  let offY = 0;
  let level: number[] = [];
  let flipAt: number[] = []; // sim-time a flip starts, -1 when settled
  let flipTo: number[] = [];
  let flipQuiet: boolean[] = []; // true = fold without phosphor (disperse)
  let flipGen: number[] = []; // completed flips — advances a cell's noise glyph
  let glowAt: number[] = []; // sim-time the last flip completed
  let rowMask: boolean[] = [];
  let occupied: boolean[] = []; // cells owned by an active announcement
  let masks: GapRect[] = [];

  /* ---- schedule state ---- */
  let simT = 0;
  let waveIndex = 0;
  let waves: Wave[] = [];
  let anns: Ann[] = [];
  let annBand = 0; // alternates top / bottom band
  let annCount = 0;
  let wordCursor = 0;
  /* The first announcement resolves almost immediately, so the field's
     entrance carries language before the first wave sweeps. */
  let nextWaveAt = 2.9;
  let nextAnnAt = params.annFirst;
  let nextIdleAt = 2.2;

  let running = !reduced;
  let visible = true;
  let frameId = 0;
  let lastNow = 0;
  let acc = 0;

  /* cached fill styles — rebuilt on setInk so the draw loop allocates
     almost nothing */
  let quietTop = '';
  let quietBot = '';
  let markTop = '';
  let markBot = '';
  let faceTop = '';
  let faceBot = '';
  let glyphStyle = '';
  let glowPrefix = '';

  function rebuildStyles(): void {
    const [ir, ig, ib] = ink.ink;
    /* lit top leaf, shaded bottom leaf — the split-slab read at whisper level */
    quietTop = `rgba(${ir},${ig},${ib},${(ink.quiet * 0.86).toFixed(4)})`;
    quietBot = `rgba(${ir},${ig},${ib},${(ink.quiet * 1.08).toFixed(4)})`;
    markTop = `rgba(${ir},${ig},${ib},${(ink.mark * 0.88).toFixed(4)})`;
    markBot = `rgba(${ir},${ig},${ib},${(ink.mark * 1.06).toFixed(4)})`;
    faceTop = `rgba(${ir},${ig},${ib},${(ink.face * 0.92).toFixed(4)})`;
    faceBot = `rgba(${ir},${ig},${ib},${(ink.face * 1.1).toFixed(4)})`;
    glyphStyle = `rgba(${ir},${ig},${ib},${ink.glyph.toFixed(3)})`;
    const [gr, gg, gb] = ink.glow;
    glowPrefix = `rgba(${gr},${gg},${gb},`;
  }
  rebuildStyles();

  /** Announcement glyph color: flash pigment cooling into ink. */
  function coolStyle(mix: number, alpha: number): string {
    const [ir, ig, ib] = ink.ink;
    const [fr, fg, fb] = ink.flash;
    const r = Math.round(ir + (fr - ir) * mix);
    const g = Math.round(ig + (fg - ig) * mix);
    const b = Math.round(ib + (fb - ib) * mix);
    return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
  }

  /* The wave's tonal band: a broad diagonal swath (wavelength ~18 columns)
     that drifts with the wave index, so each sweep visibly re-tones a
     different region instead of re-rolling static. Analytic — no noise. */
  function toneShare(c: number, r: number, k: number): number {
    const band = 0.5 + 0.5 * Math.sin(c * 0.35 - r * 0.55 + k * 1.7);
    return params.markBase + params.markSwing * band;
  }

  function computeRowMask(): void {
    rowMask = Array.from({ length: rows }, () => false);
    for (const rect of masks) {
      const pad = rect.pad ?? params.gapPad;
      const top = rect.y - pad;
      const bottom = rect.y + rect.height + pad;
      for (let r = 0; r < rows; r++) {
        const y0 = offY + r * params.cell;
        const y1 = y0 + params.cell;
        if (y1 > top && y0 < bottom) rowMask[r] = true;
      }
    }
  }

  /** Contiguous runs of drawable rows — the bands above and below the gap. */
  function bandRuns(): Array<[number, number]> {
    const runs: Array<[number, number]> = [];
    let start = -1;
    for (let r = 0; r < rows; r++) {
      if (!rowMask[r]) {
        if (start < 0) start = r;
      } else if (start >= 0) {
        runs.push([start, r - 1]);
        start = -1;
      }
    }
    if (start >= 0) runs.push([start, rows - 1]);
    return runs;
  }

  function resize(): void {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    const dw = Math.max(1, Math.floor(w * dpr));
    const dh = Math.max(1, Math.floor(h * dpr));
    if (canvas.width !== dw) canvas.width = dw;
    if (canvas.height !== dh) canvas.height = dh;

    cols = Math.max(1, Math.floor(w / params.cell));
    rows = Math.max(1, Math.floor(h / params.cell));
    offX = (w - cols * params.cell) / 2;
    offY = (h - rows * params.cell) / 2;

    const n = cols * rows;
    level = Array.from({ length: n }, () => 0);
    flipAt = Array.from({ length: n }, () => -1);
    flipTo = Array.from({ length: n }, () => 0);
    flipQuiet = Array.from({ length: n }, () => false);
    flipGen = Array.from({ length: n }, () => 0);
    glowAt = Array.from({ length: n }, () => -1e9);
    occupied = Array.from({ length: n }, () => false);
    anns = [];
    nextAnnAt = Math.max(simT + 0.5, params.annFirst);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        level[r * cols + c] = cellHash(c, r, 7) < toneShare(c, r, waveIndex) ? 1 : 0;
      }
    }
    computeRowMask();
    if (!running) {
      if (reduced) buildStatic();
      compose();
    }
  }

  function fireColumn(col: number, k: number, at: number): void {
    for (let r = 0; r < rows; r++) {
      if (rowMask[r]) continue;
      const i = r * cols + col;
      if (occupied[i]) continue;
      if ((flipAt[i] ?? -1) >= 0) continue;
      if (cellHash(col, r, k * 3 + 1) >= params.waveTake) continue;
      flipAt[i] = at + cellHash(col, r, k * 3 + 2) * 0.06;
      flipTo[i] = cellHash(col, r, k * 3 + 5) < toneShare(col, r, k) ? 1 : 0;
      flipQuiet[i] = false;
    }
  }

  /** True while any announcement is still landing characters. */
  function annResolving(t: number): boolean {
    for (const ann of anns) {
      if (t < ann.start + ann.cells.length * params.annPer + params.flipDur) return true;
    }
    return false;
  }

  /** Place and start the next announcement: pick the next word that fits,
      alternate bands, retry a few seeded columns if the slot is taken. */
  function startAnn(t: number): void {
    const runs = bandRuns();
    const run = annBand === 0 ? runs[0] : runs[runs.length - 1];
    annBand = 1 - annBand;
    if (!run) return;
    const margin = 2;
    const maxLen = cols - margin * 2 - 3;
    let word: BoardWord | undefined;
    for (let k = 0; k < words.length; k++) {
      const cand = words[(wordCursor + k) % words.length];
      if (cand && cand.chars.length <= maxLen) {
        word = cand;
        wordCursor = (wordCursor + k + 1) % words.length;
        break;
      }
    }
    if (!word) return;
    const strip = buildStrip(word);
    const len = strip.length;
    const [r0, r1] = run;
    let rLo = r1 - r0 >= 2 ? r0 + 1 : r0;
    let rHi = r1 - r0 >= 2 ? r1 - 1 : r1;
    /* Bias away from the gap edge when the band affords it, so a later
       re-measure that widens the mask does not swallow the word. */
    if (r1 - r0 >= 4) {
      if (run === runs[0] && runs.length > 1) rHi = r1 - 2;
      else if (run !== runs[0]) rLo = r0 + 2;
    }
    for (let attempt = 0; attempt < 10; attempt++) {
      const row = rLo + Math.floor(rng() * (rHi - rLo + 1));
      const col = margin + Math.floor(rng() * Math.max(1, cols - len - margin * 2));
      let free = true;
      for (let s = -1; s <= len; s++) {
        /* the strip plus one clear cell each side, so two strips never touch */
        const cc = col + s;
        if (cc < 0 || cc >= cols) continue;
        if (occupied[row * cols + cc]) {
          free = false;
          break;
        }
      }
      if (!free) continue;
      const cells: AnnCell[] = strip.map((s, v) => ({
        ...s,
        col: col + v,
        under: level[row * cols + col + v] ?? 0,
        handed: false,
      }));
      for (let s = 0; s < len; s++) occupied[row * cols + col + s] = true;
      anns.push({
        row,
        start: t,
        holdUntil: t + len * params.annPer + params.flipDur + params.annHold,
        cells,
      });
      return;
    }
  }

  /** The reduced-motion wall holds two announcements permanently. */
  function buildStatic(): void {
    anns = [];
    occupied = Array.from({ length: cols * rows }, () => false);
    const runs = bandRuns();
    const top = runs[0];
    const bottom = runs.length > 1 ? runs[runs.length - 1] : undefined;
    const picks: Array<{ run: [number, number] | undefined; word: BoardWord | undefined; bias: number }> = [
      { run: top, word: words[0], bias: 0.34 },
      { run: bottom, word: words[3] ?? words[0], bias: 0.62 },
    ];
    for (const pick of picks) {
      if (!pick.run || !pick.word) continue;
      const strip = buildStrip(pick.word);
      const len = strip.length;
      if (len + 4 > cols) continue;
      const [r0, r1] = pick.run;
      const row = Math.min(r1, r0 + Math.floor((r1 - r0) / 2));
      const col = Math.max(2, Math.min(cols - len - 2, Math.round(cols * pick.bias - len / 2)));
      const cells: AnnCell[] = strip.map((s, v) => ({
        ...s,
        col: col + v,
        under: 0,
        handed: false,
      }));
      for (let s = 0; s < len; s++) occupied[row * cols + col + s] = true;
      anns.push({ row, start: simT - 60, holdUntil: Number.POSITIVE_INFINITY, cells });
    }
  }

  function advance(t: number): void {
    /* waves — deferred while a word is landing, so amber stays singular */
    while (t >= nextWaveAt) {
      if (annResolving(t)) {
        nextWaveAt = t + 1.2;
        break;
      }
      waveIndex += 1;
      waves.push({ start: nextWaveAt, col: 0, index: waveIndex });
      nextWaveAt += params.wavePeriod + rng() * params.waveJitter;
    }
    for (const wave of waves) {
      while (wave.col < cols && t >= wave.start + wave.col * params.colStagger) {
        fireColumn(wave.col, wave.index, wave.start + wave.col * params.colStagger);
        wave.col += 1;
      }
    }
    if (waves.length) waves = waves.filter((wave) => wave.col < cols);

    /* announcements — deferred while a wave is crossing */
    while (t >= nextAnnAt) {
      if (waves.length) {
        nextAnnAt = t + 0.7;
        break;
      }
      startAnn(t);
      annCount += 1;
      /* the second announcement follows fast, so both bands carry a word
         from the first composed frame onward */
      nextAnnAt = t + (annCount === 1 ? 1.6 : params.annPeriod + rng() * 1.4);
    }

    /* disperse: a held word peels back into tone, cell by cell, quietly */
    for (const ann of anns) {
      if (t < ann.holdUntil) continue;
      for (const cell of ann.cells) {
        if (cell.handed) continue;
        const at = ann.holdUntil + cell.order * params.annOut;
        if (t < at) continue;
        cell.handed = true;
        const i = ann.row * cols + cell.col;
        occupied[i] = false;
        level[i] = cell.kind === 1 ? 0 : 1;
        flipAt[i] = at;
        flipTo[i] = cellHash(cell.col, ann.row, waveIndex + 91) < toneShare(cell.col, ann.row, waveIndex) ? 1 : 0;
        flipQuiet[i] = true;
      }
    }
    if (anns.length) anns = anns.filter((ann) => ann.cells.some((cell) => !cell.handed));

    while (t >= nextIdleAt) {
      /* a single cell somewhere updates — the board never quite sleeps */
      const c = Math.floor(rng() * cols);
      const r = Math.floor(rng() * rows);
      const i = r * cols + c;
      if (!rowMask[r] && !occupied[i] && (flipAt[i] ?? -1) < 0) {
        flipAt[i] = nextIdleAt;
        flipTo[i] = rng() < toneShare(c, r, waveIndex) ? 1 : 0;
        flipQuiet[i] = false;
      }
      nextIdleAt += params.idleMin + rng() * (params.idleMax - params.idleMin);
    }
  }

  /** A long-hidden tab settles instantly instead of replaying a flip storm. */
  function resync(t: number): void {
    for (let i = 0; i < level.length; i++) {
      if ((flipAt[i] ?? -1) >= 0) {
        level[i] = flipTo[i] ?? 0;
        flipAt[i] = -1;
      }
      glowAt[i] = -1e9;
    }
    waves = [];
    for (const ann of anns) {
      for (const cell of ann.cells) {
        if (!cell.handed) occupied[ann.row * cols + cell.col] = false;
      }
    }
    anns = [];
    nextWaveAt = t + 2 + rng() * params.wavePeriod * 0.5;
    nextAnnAt = t + 0.8;
    nextIdleAt = t + 0.5;
  }

  function leafStyles(lv: number): [string, string] {
    if (lv === 2) return [faceTop, faceBot];
    return lv ? [markTop, markBot] : [quietTop, quietBot];
  }

  /** lv 0 quiet, 1 marked, 2 announcement face. */
  function drawCell(x: number, y: number, fold: number, lv: number, glow: number): void {
    const cellD = params.cell * dpr;
    const seamD = params.seam * dpr;
    const hingeD = Math.max(1, params.hinge * dpr);
    const inner = cellD - seamD;
    const cy = y + cellD / 2;
    const leaf = ((inner - hingeD) / 2) * fold;
    if (leaf < 0.5) return;
    const [top, bot] = leafStyles(lv);
    ctx.fillStyle = top;
    ctx.fillRect(x, cy - hingeD / 2 - leaf, inner, leaf);
    ctx.fillStyle = bot;
    ctx.fillRect(x, cy + hingeD / 2, inner, leaf);
    if (glow > 0.012) {
      ctx.fillStyle = `${glowPrefix}${glow.toFixed(3)})`;
      ctx.fillRect(x, cy - hingeD / 2 - leaf, inner, leaf * 2 + hingeD);
    }
  }

  /** The sparse language layer: a faint character or locale code, with the
      hinge slit re-cleared through it — a letter on a flap, not print. */
  function drawNoiseGlyph(c: number, r: number, i: number, x: number, y: number): void {
    if (cellHash(c, r, 31) >= params.glyphShare) return;
    /* never crowd an announcement: a code sitting flush against a stamp
       would read as part of it */
    if ((c > 0 && occupied[i - 1]) || (c < cols - 1 && occupied[i + 1])) return;
    const cellD = params.cell * dpr;
    const seamD = params.seam * dpr;
    const hingeD = Math.max(1, params.hinge * dpr);
    const inner = cellD - seamD;
    const cx = x + inner / 2;
    const cy = y + cellD / 2;
    const pick = cellHash(c, r, 47 + (flipGen[i] ?? 0) * 13);
    ctx.fillStyle = glyphStyle;
    if (cellHash(c, r, 53) < params.codeShare) {
      ctx.font = fontCode;
      ctx.fillText(CODES[Math.floor(pick * CODES.length)] ?? 'FR', cx, cy);
    } else {
      ctx.font = fontNoise;
      ctx.fillText(NOISE[Math.floor(pick * NOISE.length)] ?? '·', cx, cy);
    }
    ctx.clearRect(x, cy - hingeD / 2, inner, hingeD);
  }

  /** Announcement strips: resolve flips, phosphor-cooling glyphs, hold. */
  function drawAnns(t: number): void {
    if (!anns.length) return;
    const cellD = params.cell * dpr;
    const seamD = params.seam * dpr;
    const hingeD = Math.max(1, params.hinge * dpr);
    const inner = cellD - seamD;
    for (const ann of anns) {
      const y = Math.round((offY + ann.row * params.cell) * dpr);
      const cy = y + cellD / 2;
      for (const cell of ann.cells) {
        if (cell.handed) continue;
        const x = Math.round((offX + cell.col * params.cell) * dpr);
        const at = ann.start + cell.order * params.annPer;
        const land = at + params.flipDur;
        if (t < at) {
          drawCell(x, y, 1, cell.under, 0);
          continue;
        }
        if (t < land) {
          const p = (t - at) / params.flipDur;
          const fold = Math.abs(1 - 2 * p);
          if (p < 0.5) drawCell(x, y, fold, cell.under, 0);
          else drawCell(x, y, fold, 2, ink.glowAlpha * (p - 0.5) * 2);
          continue;
        }
        /* landed: face tone, short phosphor, glyph cooling from flash to ink */
        const dtLand = t - land;
        const glow = ink.glowAlpha * 0.9 * Math.exp(-dtLand / (params.glowTau * 1.6));
        drawCell(x, y, 1, 2, glow > 0.012 ? glow : 0);
        if (cell.ch) {
          const cool = Math.exp(-dtLand / 0.8);
          ctx.font = cell.kind === 2 ? fontStamp : fontWord;
          ctx.fillStyle = coolStyle(cool, cell.kind === 2 ? ink.stamp : ink.word);
          ctx.fillText(cell.ch, x + inner / 2, cy);
          ctx.clearRect(x, cy - hingeD / 2, inner, hingeD);
        }
      }
    }
  }

  function draw(t: number): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let r = 0; r < rows; r++) {
      if (rowMask[r]) continue;
      const y = (offY + r * params.cell) * dpr;
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (occupied[i]) continue;
        const x = Math.round((offX + c * params.cell) * dpr);
        const yr = Math.round(y);
        let fold = 1;
        let lv = level[i] ?? 0;
        let glow = 0;
        let settled = true;

        const fa = flipAt[i] ?? -1;
        if (fa >= 0 && t >= fa) {
          const p = (t - fa) / params.flipDur;
          if (p >= 1) {
            lv = flipTo[i] ?? 0;
            level[i] = lv;
            flipAt[i] = -1;
            flipGen[i] = (flipGen[i] ?? 0) + 1;
            if (!flipQuiet[i]) glowAt[i] = fa + params.flipDur;
          } else {
            settled = false;
            fold = Math.abs(1 - 2 * p);
            lv = p < 0.5 ? lv : (flipTo[i] ?? 0);
            if (p > 0.5 && !flipQuiet[i]) glow = ink.glowAlpha * 0.8 * (p - 0.5) * 2;
          }
        }
        if (glow === 0) {
          const ga = glowAt[i] ?? -1e9;
          if (ga > -1e8) {
            glow = ink.glowAlpha * Math.exp(-(t - ga) / params.glowTau);
            if (glow < 0.012) {
              glowAt[i] = -1e9;
              glow = 0;
            }
          }
        }
        drawCell(x, yr, fold, lv, glow);
        if (settled) drawNoiseGlyph(c, r, i, x, yr);
      }
    }
    drawAnns(t);
  }

  /**
   * The reduced-motion (and pre-resume) still: settled tones from the wave-
   * hash, the noise-glyph language layer, two held announcements (see
   * buildStatic), a scatter of afterglows, and two or three cells caught
   * mid-fold — the board photographs mid-update, deliberately.
   */
  function compose(): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let r = 0; r < rows; r++) {
      if (rowMask[r]) continue;
      const y = Math.round((offY + r * params.cell) * dpr);
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (occupied[i]) continue;
        const x = Math.round((offX + c * params.cell) * dpr);
        const lv = level[i] ?? 0;
        let fold = 1;
        let glow = 0;
        const h = cellHash(c, r, 911);
        if (h < 0.002) fold = 0.42;
        else if (h < 0.006) glow = ink.glowAlpha * (0.25 + 0.65 * cellHash(c, r, 913));
        drawCell(x, y, fold, lv, glow);
        if (fold === 1) drawNoiseGlyph(c, r, i, x, y);
      }
    }
    drawAnns(simT);
  }

  function schedule(): void {
    if (frameId || !running || !visible) return;
    frameId = requestAnimationFrame(tick);
  }

  function tick(now: number): void {
    frameId = 0;
    if (!running || !visible) return;
    if (!document.hidden) {
      if (!lastNow) lastNow = now;
      const dt = (now - lastNow) / 1000;
      lastNow = now;
      if (dt > 0.5) {
        simT += 0.016;
        resync(simT);
        advance(simT);
        draw(simT);
        acc = 0;
      } else {
        acc += dt;
        if (acc >= 1 / fps) {
          simT += acc;
          acc = 0;
          advance(simT);
          draw(simT);
        }
      }
    } else {
      lastNow = 0; // re-enter cleanly; the dt clamp catches the gap anyway
    }
    schedule();
  }

  let io: IntersectionObserver | undefined;
  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        visible = entry.isIntersecting;
        if (visible) lastNow = 0;
        schedule();
      },
      { rootMargin: '120px' }
    );
    io.observe(canvas);
  }

  let ro: ResizeObserver | undefined;
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(canvas);
  }

  resize();
  if (running) {
    /* Paint synchronously before the first rAF so the very first frame a
       screenshot can catch is already a composed board. */
    advance(simT);
    draw(simT);
    schedule();
  } else {
    compose();
  }

  return {
    setMasks(rects) {
      masks = rects;
      computeRowMask();
      if (reduced) {
        buildStatic();
        compose();
        return;
      }
      /* A live announcement whose row just fell inside the gap is dropped —
         its cells hand straight back to the background — and its band gets a
         prompt replacement instead of waiting out a whole period (the gap box
         re-measures after the web font lands, which can widen the mask). */
      let dropped = false;
      for (const ann of anns) {
        if (!rowMask[ann.row]) continue;
        dropped = true;
        for (const cell of ann.cells) {
          if (!cell.handed) occupied[ann.row * cols + cell.col] = false;
          cell.handed = true;
        }
      }
      if (dropped) {
        anns = anns.filter((ann) => ann.cells.some((cell) => !cell.handed));
        annBand = 1 - annBand;
        nextAnnAt = Math.min(nextAnnAt, simT + 0.5);
      }
      if (!running) compose();
    },
    setInk(next) {
      ink = next;
      rebuildStyles();
      if (!running) compose();
    },
    pause() {
      running = false;
    },
    resume() {
      if (reduced || running) return;
      running = true;
      lastNow = 0;
      schedule();
    },
    renderStatic() {
      compose();
    },
    destroy() {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      running = false;
      io?.disconnect();
      ro?.disconnect();
    },
  };
}
