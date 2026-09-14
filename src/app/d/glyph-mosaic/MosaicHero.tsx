'use client';

import { useRef } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * GLYPH MOSAIC hero — the GT monogram set as a deco floor mosaic whose
 * tesserae are real glyphs from eight writing systems. One canvas, drawn
 * once: an offscreen mask renders "GT" in the display face, and each grid
 * cell samples that mask to decide its role. Cells inside the letterforms
 * draw a glyph at full script color; cells outside draw the deco ground: a
 * gold border course, an elliptical medallion ring, and a 24-wedge sunburst
 * whose alternating rays are denser fields of pale glyphs. Colors and the
 * display family are read from the page's CSS custom properties so the
 * canvas never owns a color. The reveal animates outward from the center by
 * appending tesserae per frame (no full redraws); prefers-reduced-motion
 * paints the finished floor in one pass.
 */

const W = 1064;
const H = 616;
const CELL = 14;
const COLS = W / CELL;
const ROWS = H / CELL;
const WEDGES = 24;

type ScriptKey =
  | 'latin'
  | 'greek'
  | 'cyrillic'
  | 'arabic'
  | 'devanagari'
  | 'hangul'
  | 'kana'
  | 'han';

const SCRIPTS: readonly { key: ScriptKey; glyphs: string }[] = [
  { key: 'latin', glyphs: 'AEGKMNORSTaegnrst' },
  { key: 'greek', glyphs: 'ΑΓΔΘΛΞΣΦΨΩαδλπφω' },
  { key: 'cyrillic', glyphs: 'БГДЖЗИЛПФЦЧШЯЮбжя' },
  { key: 'arabic', glyphs: 'ابجحدرسشصطعفقلمنهوي' },
  { key: 'devanagari', glyphs: 'अआइकखगचजटतदनपबमयरलवशस' },
  { key: 'hangul', glyphs: '가나다라마바사아자차카타파하한글' },
  { key: 'kana', glyphs: 'あかさたなはまやらわアカサタナホメユ' },
  { key: 'han', glyphs: '文字言語译世界读書写话译' },
];

/** Deterministic per-cell noise, so the floor is identical on every visit. */
function hash(x: number, y: number, seed: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return s - Math.floor(s);
}

type Cell = {
  x: number;
  y: number;
  glyph: string;
  color: string;
  alpha: number;
  size: number;
  order: number;
};

/** Renders "GT" offscreen in the display face and returns its alpha channel. */
function buildMask(family: string): Uint8ClampedArray | null {
  const mask = document.createElement('canvas');
  mask.width = W;
  mask.height = H;
  const mc = mask.getContext('2d', { willReadFrequently: true });
  if (!mc) return null;
  mc.textAlign = 'center';
  mc.font = `400 100px ${family}`;
  const probe = mc.measureText('GT');
  const probeH = probe.actualBoundingBoxAscent + probe.actualBoundingBoxDescent;
  if (probe.width <= 0 || probeH <= 0) return null;
  const scale = Math.min((W * 0.58) / probe.width, (H * 0.84) / probeH);
  mc.font = `400 ${Math.floor(100 * scale)}px ${family}`;
  const fit = mc.measureText('GT');
  const baseline =
    H / 2 + (fit.actualBoundingBoxAscent - fit.actualBoundingBoxDescent) / 2;
  mc.fillText('GT', W / 2, baseline);
  return mc.getImageData(0, 0, W, H).data;
}

function buildCells(
  mask: Uint8ClampedArray,
  colors: Record<ScriptKey, string>,
  gold: string
): Cell[] {
  const cells: Cell[] = [];
  const cx0 = W / 2;
  const cy0 = H * 0.52;
  const maxR = Math.hypot(W / 2, H / 2);

  for (let gy = 0; gy < ROWS; gy++) {
    for (let gx = 0; gx < COLS; gx++) {
      const x = gx * CELL + CELL / 2;
      const y = gy * CELL + CELL / 2;
      const a = mask[(Math.floor(y) * W + Math.floor(x)) * 4 + 3];
      const r1 = hash(gx, gy, 1);
      const r2 = hash(gx, gy, 2);
      const r3 = hash(gx, gy, 3);
      const script = SCRIPTS[Math.floor(r1 * SCRIPTS.length) % SCRIPTS.length];
      const glyph = script.glyphs.charAt(
        Math.floor(r2 * script.glyphs.length) % script.glyphs.length
      );
      const color = colors[script.key];
      const dx = x - cx0;
      const dy = y - cy0;
      const dist = Math.hypot(dx, dy);
      const order = dist + r3 * 130;

      // The letterform field: every cell is a tessera at full color.
      if (a > 150) {
        cells.push({
          x,
          y,
          glyph,
          color,
          alpha: 0.95,
          size: Math.round(CELL * (0.84 + r3 * 0.28)),
          order,
        });
        continue;
      }
      // Partial coverage dithers the letter edge instead of aliasing it.
      if (a > 40) {
        cells.push({
          x,
          y,
          glyph,
          color,
          alpha: 0.6,
          size: Math.round(CELL * 0.8),
          order,
        });
        continue;
      }
      // The gold border course, one tessera deep, all the way around.
      if (gx === 0 || gy === 0 || gx === COLS - 1 || gy === ROWS - 1) {
        cells.push({
          x,
          y,
          glyph,
          color: gold,
          alpha: 0.5,
          size: Math.round(CELL * 0.78),
          order,
        });
        continue;
      }
      // The elliptical medallion ring just inside the border.
      const e = Math.hypot(dx / (W * 0.455), dy / (H * 0.44));
      if (Math.abs(e - 1) < 0.045) {
        cells.push({
          x,
          y,
          glyph,
          color: gold,
          alpha: 0.44,
          size: Math.round(CELL * 0.74),
          order,
        });
        continue;
      }
      // Outside the medallion: bare floor with a rare stray tessera.
      if (e > 1) {
        if (r3 < 0.06) {
          cells.push({
            x,
            y,
            glyph,
            color,
            alpha: 0.16,
            size: Math.round(CELL * 0.68),
            order,
          });
        }
        continue;
      }
      // The sunburst: alternating wedges carry denser pale fields.
      const ang = Math.atan2(dy, dx) + Math.PI;
      const wedge = Math.floor((ang / (2 * Math.PI)) * WEDGES) % WEDGES;
      const rayOn = wedge % 2 === 0;
      const density = rayOn ? 0.5 * (1 - (dist / maxR) * 0.3) : 0.08;
      if (r3 < density) {
        cells.push({
          x,
          y,
          glyph,
          color,
          alpha: rayOn ? 0.3 : 0.22,
          size: Math.round(CELL * 0.7),
          order,
        });
      }
    }
  }

  cells.sort((p, q) => p.order - q.order);
  return cells;
}

function paint(
  ctx: CanvasRenderingContext2D,
  cells: Cell[],
  family: string,
  from: number,
  to: number
) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = from; i < to; i++) {
    const c = cells[i];
    ctx.globalAlpha = c.alpha;
    ctx.fillStyle = c.color;
    ctx.font = `${c.size}px ${family}`;
    ctx.fillText(c.glyph, c.x, c.y);
  }
  ctx.globalAlpha = 1;
}

export default function MosaicHero() {
  const ref = useRef<HTMLCanvasElement>(null);

  useMountEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let disposed = false;
    let raf = 0;

    const run = () => {
      const root = canvas.closest('.glyph-mosaic-root');
      const styles = getComputedStyle(
        root instanceof HTMLElement ? root : canvas
      );
      const readVar = (name: string) =>
        styles.getPropertyValue(name).trim() || styles.color;
      const family = readVar('--gm-disp');
      const colors: Record<ScriptKey, string> = {
        latin: readVar('--gm-s-latin'),
        greek: readVar('--gm-s-greek'),
        cyrillic: readVar('--gm-s-cyrillic'),
        arabic: readVar('--gm-s-arabic'),
        devanagari: readVar('--gm-s-devanagari'),
        hangul: readVar('--gm-s-hangul'),
        kana: readVar('--gm-s-kana'),
        han: readVar('--gm-s-han'),
      };
      const gold = readVar('--gm-s-greek');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      const mask = buildMask(family);
      if (!mask) return;
      const cells = buildCells(mask, colors, gold);
      const still = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (still) {
        paint(ctx, cells, family, 0, cells.length);
        return;
      }
      const perFrame = Math.max(26, Math.ceil(cells.length / 88));
      let drawn = 0;
      const step = () => {
        if (disposed) return;
        const next = Math.min(cells.length, drawn + perFrame);
        paint(ctx, cells, family, drawn, next);
        drawn = next;
        if (drawn < cells.length) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    // The mask is typeset in the display face, so wait for the font load;
    // if the promise rejects the fallback serif still yields a monogram.
    document.fonts.ready
      .then(() => {
        if (!disposed) run();
      })
      .catch(() => {
        if (!disposed) run();
      });

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
    };
  });

  return (
    <canvas
      ref={ref}
      className='gm-mosaic-canvas'
      width={W}
      height={H}
      role='img'
      aria-label='The GT monogram set as a floor mosaic whose tiles are glyphs from Latin, Greek, Cyrillic, Arabic, Devanagari, Hangul, Kana, and Han scripts, on a sunburst ground'
    />
  );
}
