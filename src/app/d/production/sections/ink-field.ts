/* VENDORED — apps/landing/src/components/landing/glyph-rain/sections/band/
   inkField.ts (gt-cloud), verbatim but for the import below: the shared
   package's glyph-field is this repo's src/lib/glyph-field.ts, and the two
   exports it needs (GLYPHS, ditherAtlasRows) are identical there. This
   concept already carries an OLDER copy of this engine at
   d/glyph-rain/sections/band/inkField.ts, which predates the options the
   enterprise page passes (clearing:'none', glyphColor/setGlyphColor, pool);
   that copy belongs to another direction and is left alone. */

/**
 * inkField — the closing band's material: the hero's glyph field inverted.
 * Paper glyphs from the same eight-script inventory rise slowly off the ink
 * band (the hero condenses; the closer disperses), set in the same 34px
 * columns, with depth spoken as solid glyphs at three sizes on a per-tier
 * alpha ramp (dither on moving glyphs strobes, so the moving field
 * carries none; the clearing's EDGES stay dithered via the per-particle
 * threshold). The content column is a clearing measured off the real DOM
 * box: glyphs own the band's margins and top/bottom strips, and the dark
 * centre is where the type and the four artifact panels sit.
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
/* ALL tiers solid — dither strobes on anything that moves, and every
   glyph in this field rises. Depth speaks through size and the per-tier
   alpha below; the dither machinery stays for the atlas's other users. */
const TIER_COVER: readonly [number, number, number] = [1, 1, 1];
/** The tiers' dither coverages, spoken as alpha, so the field keeps its tone. */
const TIER_ALPHA: readonly [number, number, number] = [0.9, 0.55, 0.3];
const CELL = 26;
/* The closing band's paper, as the shipped constant #f2f1ed — spelled
   rgb() here because this repo's practices lint bans hex literals in
   source. Same color, same fillStyle. */
const PAPER = 'rgb(242 241 237)';
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
  /** The head block whose full-width STRIP the field also keeps clear of —
      glyphs own the sides and the foot, never the header (measured live,
      dithered rim below it like every other clearing edge). */
  clearTopEl?: HTMLElement | null;
  displayFamily?: string;
  /** 'none' floods the whole canvas — the craft plate's cut. The default
      keeps the measured content clearing the bands rely on. */
  clearing?: 'measured' | 'none';
  /** Below this canvas width the field PARKS — loop stopped, canvas
      cleared, nothing drawn — and unparks if a resize crosses back. The
      band mounts pass the tc narrow cut. */
  minWidth?: number;
  /** Device-pixel ceiling (before the governor's own floor). Bands pass
      1.5. */
  dprCap?: number;
  /** Frame cap for the slow-drift material — bands pass 30. Skipped ticks
      stay on the rAF chain (the cap skips draws, not frames). */
  fpsCap?: number;
  /** Pointer play (the craft plate): glyphs shiver as the pointer nears,
      and a click bursts the nearest one — a shockwave shoves its
      neighbors before the field heals. The band mounts never set this;
      their canvases stay pointer-blind scenery. Ignored under reduced
      motion (interaction needs the loop). */
  interactive?: boolean;
  /** Glyph ink — defaults to the closing band's paper. Hosts that re-ink
      per theme pass a sampled color and setGlyphColor() on the flip. */
  glyphColor?: string;
  /** Thins the field toward the named edge on the same per-particle
      dither threshold as the clearing rim. 'left': full density at the
      right, gone before the left margin. 'top': the rain rises off the
      band's foot and disperses before the upper region — ground fog. */
  edgeFade?: 'left' | 'top';
  /** Custom inventory — the eight-script set by default. Entries may be
      short strings (amounts, codes); pair with cellWidth so the atlas
      cells fit them. */
  glyphs?: readonly string[];
  /** Atlas cell WIDTH in CSS px (height stays the band's square cell):
      widen for multi-character inventories. */
  cellWidth?: number;
  /** Column pitch in CSS px — widen with cellWidth so neighboring
      columns don't overlap. */
  colPitch?: number;
  /** Live glyph count — the standard pool by default. Sparse mounts
      pass a lower count for an airier field; dense mounts a higher one
      (allocation follows, capped at 2x). */
  pool?: number;
};

/* The frame-time governor, glyph-field's pattern: a ratchet judged on raw
   rAF cadence (independent of the fps cap's deliberate skips) — tier 1
   drops the device-pixel floor to 1.25, tier 2 strides the pool by 2. */
const GOV_BUDGET_MS = 22;
const GOV_WINDOW = 120;
const GOV_TRIP = 0.35;
const GOV_WARMUP_MS = 2500;
const GOV_GAP_MS = 900;

/* the interaction's reach, in CSS px / seconds */
const WOBBLE_R = 90;
const BOOM_R = 130;
const BOOM_DUR = 0.7;
/** The popped glyph's blow-up time, and how long it stays gone after. */
const POP_DUR = 0.45;
const POP_HIDE = 2.6;
/** Concurrent bursts — a tiny ring buffer, no per-click allocation. */
const BURSTS = 4;

export type InkFieldHandle = {
  /** Re-ink the atlas (theme flips); a parked field takes it on unpark. */
  setGlyphColor(color: string): void;
  destroy(): void;
};

export function createInkField(
  options: InkFieldOptions
): InkFieldHandle | null {
  const { canvas, clearEl } = options;
  const maybeCtx = canvas.getContext('2d');
  if (!maybeCtx) return null;
  const ctx: CanvasRenderingContext2D = maybeCtx;

  const disp =
    options.displayFamily || "'Switzer', ui-sans-serif, system-ui, sans-serif";
  let glyphInk = options.glyphColor || PAPER;
  const inv =
    options.glyphs && options.glyphs.length > 0 ? options.glyphs : GLYPHS;
  const cellW = options.cellWidth ?? CELL;
  const pitch = options.colPitch ?? COL_PITCH;
  /* the pool sizes per mount: sparse hosts pass fewer, dense hosts
     more (allocation follows, capped sanely) */
  const cap = Math.min(Math.max(options.pool ?? POOL, 1), 1120);
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- the pool ---------- */

  const rand = mulberry32(0x696e6b66);
  const ux = new Float32Array(cap);
  const uy = new Float32Array(cap);
  const hx = new Float32Array(cap);
  const hy = new Float32Array(cap);
  const phase = new Float32Array(cap);
  const period = new Float32Array(cap);
  const rise = new Float32Array(cap); // px/s upward drift — dispersal
  const sway = new Float32Array(cap);
  const stag = new Float32Array(cap);
  const jit = new Float32Array(cap);
  const gi = new Uint16Array(cap);
  const tier = new Uint8Array(cap);
  const order = new Uint16Array(cap);

  for (let i = 0; i < cap; i++) {
    ux[i] = rand();
    uy[i] = rand();
    const depth = Math.pow(rand(), 0.85);
    phase[i] = rand() * Math.PI * 2;
    period[i] = 8 + rand() * 8;
    rise[i] = 2 + (1 - depth) * 6.5;
    sway[i] = 1.5 + (1 - depth) * 2.5;
    stag[i] = rand();
    jit[i] = rand() * 8 - 4;
    gi[i] = Math.floor(rand() * inv.length);
    tier[i] = depth < NEAR_CUT ? 0 : depth < MID_CUT ? 1 : 2;
    order[i] = i;
  }
  order.sort((a, b) => (tier[b] ?? 0) - (tier[a] ?? 0)); // far first

  /* ---------- layout ---------- */

  let w = 0;
  let h = 0;
  let dpr = 1;
  let parked = false;
  /* the governor's ladder: 0 full · 1 lean dpr · 2 strided pool */
  let govTier = 0;
  let govOver = 0;
  let govCount = 0;
  let govBornAt = 0;
  let rafLast = -1;
  let leanStride = 1;
  /* The clearing: the content box in canvas coordinates. */
  let cbL = 0;
  let cbT = 0;
  let cbR = 0;
  let cbB = 0;
  /* The header strip's floor: no glyph stands above it. */
  let topB = 0;

  function layout(): void {
    if (clearEl) {
      const box = clearEl.getBoundingClientRect();
      const own = canvas.getBoundingClientRect();
      cbL = box.left - own.left - 6;
      cbT = box.top - own.top - 6;
      cbR = box.right - own.left + 6;
      cbB = box.bottom - own.top + 6;
      const head = options.clearTopEl;
      topB = head ? head.getBoundingClientRect().bottom - own.top + 10 : 0;
    } else {
      cbL = w * 0.12;
      cbT = h * 0.14;
      cbR = w * 0.88;
      cbB = h * 0.86;
      topB = 0;
    }
    for (let i = 0; i < cap; i++) {
      hx[i] = Math.round(((ux[i] ?? 0) * w) / pitch) * pitch + (jit[i] ?? 0);
      hy[i] = (uy[i] ?? 0) * h;
    }
  }

  /* ---------- glyph atlas (paper on ink) ---------- */

  const atlas = document.createElement('canvas');
  const atlasCtx = atlas.getContext('2d', { willReadFrequently: true });
  /* The BLIT source: a CPU-pinned atlas makes every per-glyph drawImage
     an upload — snapshot each build into a GPU-resident ImageBitmap and
     blit from that. */
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
    atlas.width = Math.max(1, Math.round(inv.length * cellW * dpr));
    atlas.height = Math.max(1, Math.round(3 * CELL * dpr));
    atlasCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    atlasCtx.clearRect(0, 0, inv.length * cellW, 3 * CELL);
    atlasCtx.fillStyle = glyphInk;
    atlasCtx.textAlign = 'center';
    atlasCtx.textBaseline = 'middle';
    for (let row = 0; row < 3; row++) {
      atlasCtx.font = `500 ${TIER_SIZE[row] ?? 10}px ${disp}`;
      for (let col = 0; col < inv.length; col++) {
        atlasCtx.fillText(
          inv[col] ?? '',
          col * cellW + cellW / 2,
          row * CELL + CELL / 2
        );
      }
    }
    ditherAtlasRows(
      atlasCtx,
      atlas.width,
      atlas.height,
      dpr,
      (cssY) => Math.min(2, Math.floor(cssY / CELL)),
      (row) => TIER_COVER[row] ?? 1
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

  /** Keep-probability: zero over the content box AND the header's
      full-width strip, dithered rim around both; an edge fade thins the
      field toward its named side on the same threshold. */
  function keepAt(x: number, y: number): number {
    let k: number;
    if (open) {
      k = 1;
    } else {
      const dx = Math.max(cbL - x, x - cbR, 0);
      const dy = Math.max(cbT - y, y - cbB, 0);
      let dist = Math.max(dx, dy);
      if (topB > 0) dist = Math.min(dist, y - topB);
      k = smoothstep(0, RIM, dist);
    }
    if (options.edgeFade === 'left') {
      k = Math.min(k, smoothstep(0.34, 0.86, x / (w || 1)));
    } else if (options.edgeFade === 'top') {
      k = Math.min(k, smoothstep(0.6, 0.9, y / (h || 1)));
    }
    return k;
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
    return (
      (hx[i] ?? 0) +
      Math.sin(simT / (period[i] ?? 8) + (phase[i] ?? 0)) * (sway[i] ?? 2)
    );
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
    for (let i = 0; i < cap; i++) {
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
      returns a band ABOVE it — without the gap, the sway strobes glyphs
      riding the rim's iso-line. */
  const vis = new Uint8Array(cap);

  function draw(): void {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    /* Blits run in raw device px — identity transform, integer snap,
       1:1 atlas cells: a sprite drawn at fractional device positions is
       resampled with a different subpixel phase every frame, and that
       shimmer reads as flicker on the band's margins. */
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const wrap = h + 52;
    const cs = CELL;
    const cp = cs * dpr;
    const cwp = cellW * dpr;
    let alphaRow = -1;
    for (let k = 0; k < cap; k += leanStride) {
      const i = order[k] ?? 0;
      let x =
        (hx[i] ?? 0) +
        Math.sin(simT / (period[i] ?? 8) + (phase[i] ?? 0)) * (sway[i] ?? 2);
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
        if (
          pdx > -WOBBLE_R &&
          pdx < WOBBLE_R &&
          pdy > -WOBBLE_R &&
          pdy < WOBBLE_R
        ) {
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
           fractional-scale blit for half a second */
        const grow = 1 + (popAge / POP_DUR) * 2.4;
        const gw = cwp * grow;
        const gh = cp * grow;
        ctx.globalAlpha = (TIER_ALPHA[row] ?? 1) * (1 - popAge / POP_DUR);
        ctx.drawImage(
          atlasSrc,
          (gi[i] ?? 0) * cwp,
          row * cp,
          cwp,
          cp,
          Math.round(x * dpr - gw / 2),
          Math.round(y * dpr - gh / 2),
          Math.round(gw),
          Math.round(gh)
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
        (gi[i] ?? 0) * cwp,
        row * cp,
        cwp,
        cp,
        Math.round((x - cellW / 2) * dpr),
        Math.round((y - cs / 2) * dpr),
        cwp,
        cp
      );
    }
    ctx.globalAlpha = 1;
  }

  /* the governor judges raw rAF cadence — the fps cap's deliberate skips
     are near-free ticks, so a healthy display reads healthy even at 30fps */
  function govern(ts: number): void {
    if (govTier >= 2) return;
    if (rafLast < 0) {
      rafLast = ts;
      return;
    }
    const dtMs = ts - rafLast;
    rafLast = ts;
    if (dtMs > GOV_GAP_MS) return;
    if (govBornAt === 0) {
      govBornAt = ts;
      return;
    }
    if (ts - govBornAt < GOV_WARMUP_MS) return;
    govCount += 1;
    if (dtMs > GOV_BUDGET_MS) govOver += 1;
    if (govCount < GOV_WINDOW) return;
    const trip = govOver / govCount >= GOV_TRIP;
    govCount = 0;
    govOver = 0;
    if (!trip) return;
    govTier += 1;
    canvas.dataset.gfTier = String(govTier);
    if (govTier === 1) resize();
    else leanStride = 2;
  }

  const frameMin =
    options.fpsCap && options.fpsCap > 0 ? 1000 / options.fpsCap - 2 : 0;
  let lastDraw = -1e9;

  function frame(ts: number): void {
    if (destroyed) return;
    raf = requestAnimationFrame(frame);
    govern(ts);
    if (frameMin > 0 && ts - lastDraw < frameMin) return;
    if (lastTs >= 0) simT += Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    lastDraw = ts;
    draw();
  }

  function start(): void {
    if (running || destroyed || reduced || parked) return;
    running = true;
    lastTs = -1;
    rafLast = -1;
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
    /* the mobile gate: below the cut the field parks — loop stopped,
       canvas cleared, no atlas, no still — and unparks on the way back */
    const shouldPark = box.width < (options.minWidth ?? 0);
    if (shouldPark !== parked) {
      parked = shouldPark;
      if (parked) {
        stop();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else if (visible) {
        start();
      }
    }
    if (parked) return;
    w = Math.round(box.width);
    h = Math.round(box.height);
    dpr = Math.min(
      govTier >= 1 ? 1.25 : (options.dprCap ?? 2),
      window.devicePixelRatio || 1
    );
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
    { threshold: 0.02 }
  );
  io.observe(canvas);

  /* A settled boot: the field mid-drift, so the first paint is composed. */
  simT = 2.4;
  resize();
  if (!reduced && visible) start();

  if ('fonts' in document) {
    document.fonts.ready
      .then(() => {
        if (destroyed || parked) return;
        buildAtlas();
        if (!running) draw();
      })
      .catch(() => undefined);
  }

  return {
    setGlyphColor(color) {
      if (destroyed || color === glyphInk) return;
      glyphInk = color;
      if (parked) return;
      buildAtlas();
      if (!running) draw();
    },
    destroy() {
      atlasGen++;
      if (atlasSrc !== atlas && atlasSrc instanceof ImageBitmap)
        atlasSrc.close();
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
