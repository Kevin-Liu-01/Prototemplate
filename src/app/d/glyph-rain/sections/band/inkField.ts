/**
 * inkField — the closing band's material: the hero's glyph field inverted.
 * Paper glyphs from the same eight-script inventory rise slowly off the ink
 * band (the hero condenses; the closer disperses), set in the same 34px
 * columns, with depth spoken the hero's post-dither way: solid glyphs at
 * three sizes on a per-tier alpha ramp (the founder's flicker rounds —
 * dither on moving glyphs strobes, so the moving field carries none; the
 * clearing's EDGES stay dithered via the per-particle threshold). The
 * content column is a clearing measured off the real DOM box: glyphs own
 * the band's margins and top/bottom strips, and the dark centre is where
 * the type and the four artifact panels sit (AESTHETIC_ADDENDUM 2b).
 *
 * Same craft rules as the hero field: one preallocated pool, no per-frame
 * allocation, tier-batched alpha (three state changes a frame, never one
 * per glyph), integer-snapped device-px blits, dithered density edges
 * instead of veils, and prefers-reduced-motion renders exactly one
 * composed frame.
 */

import { GLYPHS, ditherAtlasRows } from '@/lib/glyph-field';

const POOL = 560;

const NEAR_CUT = 0.16;
const MID_CUT = 0.68;
const TIER_SIZE: readonly [number, number, number] = [17, 13, 10];
/* ALL tiers solid — the hero field's own founder round, ported (the
   dither strobed on anything that moved; here the rising glyphs
   flickered the same way). Depth speaks through size and the per-tier
   alpha below; the dither machinery stays for the atlas's other users. */
const TIER_COVER: readonly [number, number, number] = [1, 1, 1];
/** The old coverages, spoken as alpha, so the field's tone is unchanged. */
const TIER_ALPHA: readonly [number, number, number] = [0.9, 0.55, 0.3];
const CELL = 26;
const PAPER = '#f2f1ed';
const COL_PITCH = 34;
/** How far outside the content box the dithered clearing rim runs. */
const RIM = 64;

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

function smoothstep(a: number, b: number, x: number): number {
  const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
}

export type InkFieldOptions = {
  canvas: HTMLCanvasElement;
  /** The content block the field keeps clear of, measured off the DOM. */
  clearEl?: HTMLElement | null;
  displayFamily?: string;
  /** 'none' floods the whole canvas — the craft plate's cut. The default
      keeps the measured content clearing the bands rely on. */
  clearing?: 'measured' | 'none';
  /** Pointer play (the craft plate): glyphs shiver as the pointer nears,
      and a click bursts the nearest one — a shockwave shoves its
      neighbors before the field heals. The band mounts never set this;
      their canvases stay pointer-blind scenery. Ignored under reduced
      motion (interaction needs the loop). */
  interactive?: boolean;
};

/* the interaction's reach, in CSS px / seconds */
const WOBBLE_R = 90;
const BOOM_R = 130;
const BOOM_DUR = 0.7;
/** The popped glyph's blow-up time, and how long it stays gone after. */
const POP_DUR = 0.45;
const POP_HIDE = 2.6;
/** Concurrent bursts — a tiny ring buffer, no per-click allocation. */
const BURSTS = 4;

export type InkFieldHandle = { destroy(): void };

export function createInkField(options: InkFieldOptions): InkFieldHandle | null {
  const { canvas, clearEl } = options;
  const maybeCtx = canvas.getContext('2d');
  if (!maybeCtx) return null;
  const ctx: CanvasRenderingContext2D = maybeCtx;

  const disp = options.displayFamily || "'Switzer', ui-sans-serif, system-ui, sans-serif";
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- the pool ---------- */

  const rand = mulberry32(0x696e6b66);
  const ux = new Float32Array(POOL);
  const uy = new Float32Array(POOL);
  const hx = new Float32Array(POOL);
  const hy = new Float32Array(POOL);
  const phase = new Float32Array(POOL);
  const period = new Float32Array(POOL);
  const rise = new Float32Array(POOL); // px/s upward drift — dispersal
  const sway = new Float32Array(POOL);
  const stag = new Float32Array(POOL);
  const jit = new Float32Array(POOL);
  const gi = new Uint16Array(POOL);
  const tier = new Uint8Array(POOL);
  const order = new Uint16Array(POOL);

  for (let i = 0; i < POOL; i++) {
    ux[i] = rand();
    uy[i] = rand();
    const depth = Math.pow(rand(), 0.85);
    phase[i] = rand() * Math.PI * 2;
    period[i] = 8 + rand() * 8;
    rise[i] = 2 + (1 - depth) * 6.5;
    sway[i] = 1.5 + (1 - depth) * 2.5;
    stag[i] = rand();
    jit[i] = rand() * 8 - 4;
    gi[i] = Math.floor(rand() * GLYPHS.length);
    tier[i] = depth < NEAR_CUT ? 0 : depth < MID_CUT ? 1 : 2;
    order[i] = i;
  }
  order.sort((a, b) => (tier[b] ?? 0) - (tier[a] ?? 0)); // far first

  /* ---------- layout ---------- */

  let w = 0;
  let h = 0;
  let dpr = 1;
  /* The clearing: the content box in canvas coordinates. */
  let cbL = 0;
  let cbT = 0;
  let cbR = 0;
  let cbB = 0;

  function layout(): void {
    if (clearEl) {
      const box = clearEl.getBoundingClientRect();
      const own = canvas.getBoundingClientRect();
      cbL = box.left - own.left - 6;
      cbT = box.top - own.top - 6;
      cbR = box.right - own.left + 6;
      cbB = box.bottom - own.top + 6;
    } else {
      cbL = w * 0.12;
      cbT = h * 0.14;
      cbR = w * 0.88;
      cbB = h * 0.86;
    }
    for (let i = 0; i < POOL; i++) {
      hx[i] = Math.round(((ux[i] ?? 0) * w) / COL_PITCH) * COL_PITCH + (jit[i] ?? 0);
      hy[i] = (uy[i] ?? 0) * h;
    }
  }

  /* ---------- glyph atlas (paper on ink) ---------- */

  const atlas = document.createElement('canvas');
  const atlasCtx = atlas.getContext('2d', { willReadFrequently: true });
  /* The BLIT source (the glyph-field's own fix, ported): the CPU-pinned
     atlas made every per-glyph drawImage an upload — snapshot each build
     into a GPU-resident ImageBitmap and blit from that. */
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

  function buildAtlas(): void {
    if (!atlasCtx) return;
    atlas.width = Math.max(1, Math.round(GLYPHS.length * CELL * dpr));
    atlas.height = Math.max(1, Math.round(3 * CELL * dpr));
    atlasCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    atlasCtx.clearRect(0, 0, GLYPHS.length * CELL, 3 * CELL);
    atlasCtx.fillStyle = PAPER;
    atlasCtx.textAlign = 'center';
    atlasCtx.textBaseline = 'middle';
    for (let row = 0; row < 3; row++) {
      atlasCtx.font = `500 ${TIER_SIZE[row] ?? 10}px ${disp}`;
      for (let col = 0; col < GLYPHS.length; col++) {
        atlasCtx.fillText(GLYPHS[col] ?? '', col * CELL + CELL / 2, row * CELL + CELL / 2);
      }
    }
    ditherAtlasRows(
      atlasCtx,
      atlas.width,
      atlas.height,
      dpr,
      (cssY) => Math.min(2, Math.floor(cssY / CELL)),
      (row) => TIER_COVER[row] ?? 1,
    );
    snapshotAtlas();
  }

  /* ---------- the frame ---------- */

  let simT = 0;
  let lastTs = -1;
  let raf = 0;
  let running = false;
  let visible = true;
  let destroyed = false;

  /** Keep-probability: zero over the content box, dithered rim around it. */
  function keepAt(x: number, y: number): number {
    if (open) return 1;
    const dx = Math.max(cbL - x, x - cbR, 0);
    const dy = Math.max(cbT - y, y - cbB, 0);
    return smoothstep(0, RIM, Math.max(dx, dy));
  }

  /* ---------- pointer play (opt-in) ---------- */

  const open = options.clearing === 'none';
  const interactive = options.interactive === true && !reduced;
  let ptrX = -1e6;
  let ptrY = -1e6;
  const bX = new Float32Array(BURSTS);
  const bY = new Float32Array(BURSTS);
  const bT = new Float32Array(BURSTS).fill(-1e6);
  const popI = new Int32Array(BURSTS).fill(-1);
  let bNext = 0;

  /** A glyph's base position at the current simT — the draw loop's own
      formula, shared so the click scan can find the nearest glyph. */
  function baseX(i: number): number {
    return (hx[i] ?? 0) + Math.sin(simT / (period[i] ?? 8) + (phase[i] ?? 0)) * (sway[i] ?? 2);
  }

  function baseY(i: number): number {
    const wrap = h + 52;
    let y = (hy[i] ?? 0) - simT * (rise[i] ?? 3);
    y = ((y % wrap) + wrap) % wrap;
    return y - 26;
  }

  function toCanvas(e: PointerEvent): void {
    const box = canvas.getBoundingClientRect();
    ptrX = e.clientX - box.left;
    ptrY = e.clientY - box.top;
  }

  function onMove(e: PointerEvent): void {
    toCanvas(e);
  }

  function onLeave(): void {
    ptrX = -1e6;
    ptrY = -1e6;
  }

  function onDown(e: PointerEvent): void {
    toCanvas(e);
    /* seat a burst at the click; if a drawn glyph stands within reach it
       is the one that blows up — otherwise the shockwave alone fires */
    let nearest = -1;
    let best = 40 * 40;
    for (let i = 0; i < POOL; i++) {
      if (vis[i] !== 1) continue;
      const dx = baseX(i) - ptrX;
      const dy = baseY(i) - ptrY;
      const d2 = dx * dx + dy * dy;
      if (d2 < best) {
        best = d2;
        nearest = i;
      }
    }
    bX[bNext] = ptrX;
    bY[bNext] = ptrY;
    bT[bNext] = simT;
    popI[bNext] = nearest;
    bNext = (bNext + 1) % BURSTS;
  }

  if (interactive) {
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('pointerdown', onDown);
  }

  /** Hysteresis for the clearing-rim cull: a drawn glyph only culls once
      its keep drops a band BELOW its threshold, and a culled one only
      returns a band ABOVE it — the sway no longer strobes glyphs riding
      the rim's iso-line (the tower wrap's own fix). */
  const vis = new Uint8Array(POOL);

  function draw(): void {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    /* Blits run in raw device px — identity transform, integer snap,
       1:1 atlas cells — the hero field's craft rule: a sprite drawn at
       fractional device positions is resampled with a different
       subpixel phase every frame, and that shimmer is the flicker the
       founder saw on the band's margins. */
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const wrap = h + 52;
    const cs = CELL;
    const cp = cs * dpr;
    let alphaRow = -1;
    for (let k = 0; k < POOL; k++) {
      const i = order[k] ?? 0;
      let x = (hx[i] ?? 0) + Math.sin(simT / (period[i] ?? 8) + (phase[i] ?? 0)) * (sway[i] ?? 2);
      let y = (hy[i] ?? 0) - simT * (rise[i] ?? 3);
      y = ((y % wrap) + wrap) % wrap;
      y -= 26;
      /* the clearing owns the BASE position — interaction below only
         displaces the draw, so play never strobes the rim cull */
      const keep = keepAt(x, y);
      if (keep <= (stag[i] ?? 0) + (vis[i] === 1 ? -0.04 : 0.04)) {
        vis[i] = 0;
        continue;
      }
      vis[i] = 1;
      const row = tier[i] ?? 2;

      let popAge = -1;
      if (interactive) {
        /* the wobble: a nervous shiver that grows as the pointer nears */
        const pdx = x - ptrX;
        const pdy = y - ptrY;
        if (pdx > -WOBBLE_R && pdx < WOBBLE_R && pdy > -WOBBLE_R && pdy < WOBBLE_R) {
          const d = Math.sqrt(pdx * pdx + pdy * pdy);
          if (d < WOBBLE_R) {
            const prox = 1 - d / WOBBLE_R;
            const s = prox * prox * 3.8;
            x += Math.sin(simT * 21 + i * 1.7) * s;
            y += Math.cos(simT * 17 + i * 2.3) * s;
          }
        }
        /* the shockwaves: every live burst shoves the field radially,
           hardest at the center, dying with the wave */
        for (let b = 0; b < BURSTS; b++) {
          const age = simT - (bT[b] ?? -1e6);
          if (age < 0 || age > BOOM_DUR) continue;
          if (popI[b] === i) {
            popAge = age;
            continue;
          }
          const bdx = x - (bX[b] ?? 0);
          const bdy = y - (bY[b] ?? 0);
          const bd = Math.sqrt(bdx * bdx + bdy * bdy) || 1;
          if (bd > BOOM_R) continue;
          const decay = 1 - age / BOOM_DUR;
          const push = 30 * decay * decay * (1 - bd / BOOM_R);
          x += (bdx / bd) * push;
          y += (bdy / bd) * push;
        }
        /* a popped glyph past its blow-up stays gone until it heals */
        if (popAge < 0) {
          for (let b = 0; b < BURSTS; b++) {
            if (popI[b] !== i) continue;
            const age = simT - (bT[b] ?? -1e6);
            if (age >= 0 && age < POP_HIDE) popAge = age;
          }
        }
      }

      if (popAge >= 0) {
        if (popAge > POP_DUR) continue;
        /* the blow-up: the clicked glyph swells and burns out — one
           fractional-scale blit for half a second, sanctioned */
        const grow = 1 + (popAge / POP_DUR) * 2.4;
        const gs = cp * grow;
        ctx.globalAlpha = (TIER_ALPHA[row] ?? 1) * (1 - popAge / POP_DUR);
        ctx.drawImage(
          atlas,
          (gi[i] ?? 0) * cp,
          row * cp,
          cp,
          cp,
          Math.round(x * dpr - gs / 2),
          Math.round(y * dpr - gs / 2),
          Math.round(gs),
          Math.round(gs),
        );
        alphaRow = -1;
        continue;
      }

      /* order[] sorts by tier, so alpha changes three times a frame, not
         once per glyph */
      if (row !== alphaRow) {
        alphaRow = row;
        ctx.globalAlpha = TIER_ALPHA[row] ?? 1;
      }
      ctx.drawImage(
        atlasSrc,
        (gi[i] ?? 0) * cp,
        row * cp,
        cp,
        cp,
        Math.round((x - cs / 2) * dpr),
        Math.round((y - cs / 2) * dpr),
        cp,
        cp,
      );
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
    if (reduced || !running) draw();
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

  /* A settled boot: the field mid-drift, so the first paint is composed. */
  simT = 2.4;
  resize();
  if (!reduced && visible) start();

  if ('fonts' in document) {
    document.fonts.ready
      .then(() => {
        if (destroyed) return;
        buildAtlas();
        if (!running) draw();
      })
      .catch(() => undefined);
  }

  return {
    destroy() {
      atlasGen++;
      if (atlasSrc !== atlas && atlasSrc instanceof ImageBitmap) atlasSrc.close();
      destroyed = true;
      stop();
      cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      io.disconnect();
      if (interactive) {
        canvas.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('pointerleave', onLeave);
        canvas.removeEventListener('pointerdown', onDown);
      }
    },
  };
}
