'use client';

import { useRef, useState } from 'react';

import { GLYPHS } from '@/lib/glyph-field';
import { useLayoutWork } from '@/lib/use-layout-work';
import { useMountEffect } from '@/lib/use-mount-effect';

import { readDpr } from '../2d-3d/presence';
import { Choice, Toggle } from '../controls';
import { useTheme } from '../hooks';
import Plate from '../Plate';
import { useBox, usePictureSource } from './hooks';
import { readVar } from './raster';
import { BAYER } from './screens';
import { creditFor, fillTone } from './sources';
import { DropZone, SourcePicker, SourceStatus } from './SourcePicker';

import './dither-lab.css';

type GlyphSet = 'latin' | 'scripts' | 'digits';

const SETS: Record<GlyphSet, readonly string[]> = {
  latin: ['.', '`', ',', ':', ';', '-', '~', '=', '+', '*', 'i', 'c', 'o', 'a', 'x', 'e', 's', 'z', '%', '#', '&', '$', '@', 'W', 'M'],
  scripts: GLYPHS,
  digits: ['1', '7', '2', '3', '4', '5', '9', '6', '0', '8'],
};

/** A cell is this many times taller than it is wide, close to a line of text. */
const CELL_ASPECT = 1.5;

/** A glyph ladder: characters sorted by the share of their cell they ink, the space first. */
type Ladder = { glyphs: string[]; cover: Float32Array; atlas: HTMLCanvasElement; cw: number; ch: number };

/**
 * Draws every glyph of the set once into an atlas row, measures each one's
 * ink, sorts them, and drops glyphs within 1.5 percent of the one before,
 * so each step of the ladder is a visible step in tone.
 */
function buildLadder(set: readonly string[], family: string, cw: number, ch: number, ink: string): Ladder | null {
  const probe = document.createElement('canvas');
  probe.width = cw * set.length;
  probe.height = ch;
  const ctx = probe.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  let px = ch * 0.62;
  ctx.font = `500 ${px}px ${family}`;
  const widest = Math.max(...set.map((g) => ctx.measureText(g).width));
  if (widest > cw * 1.04) px *= (cw * 1.04) / widest;
  const font = `500 ${px}px ${family}`;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgb(0, 0, 0)';
  set.forEach((g, i) => ctx.fillText(g, i * cw + cw / 2, ch * 0.54));
  const { data } = ctx.getImageData(0, 0, probe.width, ch);
  const measured = set.map((g, i) => {
    let sum = 0;
    for (let y = 0; y < ch; y++) {
      for (let x = i * cw; x < (i + 1) * cw; x++) sum += data[(y * probe.width + x) * 4 + 3] ?? 0;
    }
    return { g, c: sum / 255 / (cw * ch) };
  });
  measured.sort((a, b) => a.c - b.c);
  const kept: { g: string; c: number }[] = [{ g: ' ', c: 0 }];
  const top = measured.at(-1)?.c || 1;
  for (const m of measured) {
    const last = kept.at(-1)?.c ?? 0;
    if (m.c / top - last / top >= 0.015) kept.push(m);
  }
  const atlas = document.createElement('canvas');
  atlas.width = cw * kept.length;
  atlas.height = ch;
  const actx = atlas.getContext('2d');
  if (!actx) return null;
  actx.font = font;
  actx.textAlign = 'center';
  actx.textBaseline = 'middle';
  actx.fillStyle = ink;
  kept.forEach((m, i) => actx.fillText(m.g, i * cw + cw / 2, ch * 0.54));
  return {
    glyphs: kept.map((m) => m.g),
    cover: Float32Array.from(kept.map((m) => m.c / top)),
    atlas,
    cw,
    ch,
  };
}

/**
 * A picture printed as characters. Each cell's tone picks a step of the
 * glyph ladder; with dithering on, a tone between two steps picks the
 * upper one where it is over the cell's 8 by 8 Bayer threshold, so the
 * screen's tile carries the tone between the glyphs.
 */
export default function GlyphScreenDemo() {
  const theme = useTheme();
  const source = usePictureSource('earth');
  const [set, setSet] = useState<GlyphSet>('latin');
  const [cellPx, setCellPx] = useState(8);
  const [dither, setDither] = useState(true);
  const [fonts, setFonts] = useState(0);
  const [steps, setSteps] = useState<string[]>([]);

  const canvas = useRef<HTMLCanvasElement>(null);
  const size = useBox();

  useMountEffect(() => {
    let live = true;
    void document.fonts?.ready.then(() => {
      if (live) setFonts((n) => n + 1);
    });
    return () => {
      live = false;
    };
  });

  useLayoutWork(
    () => {
      const el = canvas.current;
      const loaded = source.loaded;
      if (!el || !loaded || size.w < 40 || size.h < 40) return;
      const dpr = readDpr();
      const cw = Math.max(4, Math.round(cellPx * dpr));
      const ch = Math.round(cw * CELL_ASPECT);
      const cols = Math.floor((size.w * dpr) / cw);
      const rows = Math.floor((size.h * dpr) / ch);
      const ladder = buildLadder(SETS[set], getComputedStyle(el).fontFamily, cw, ch, readVar(el, '--pt-ink', 'rgb(7, 7, 7)'));
      if (!ladder || cols < 1 || rows < 1) return;
      const tone = fillTone(loaded, cols, rows, cw / dpr, new Float32Array(cols * rows), { cellH: ch / dpr });

      el.width = cols * cw;
      el.height = rows * ch;
      el.style.width = `${(cols * cw) / dpr}px`;
      el.style.height = `${(rows * ch) / dpr}px`;
      const ctx = el.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, el.width, el.height);
      const { cover, atlas } = ladder;
      const last = cover.length - 1;
      const map = BAYER[8];
      for (let y = 0, i = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++, i++) {
          const t = Math.min(1, Math.max(0, tone[i] ?? 0));
          let k = 0;
          while (k < last && (cover[k + 1] ?? 1) <= t) k++;
          if (k < last) {
            const lo = cover[k] ?? 0;
            const hi = cover[k + 1] ?? 1;
            const frac = (t - lo) / Math.max(1e-6, hi - lo);
            const step = dither ? frac > (map[((y & 7) << 3) | (x & 7)] ?? 0.5) : frac >= 0.5;
            if (step) k++;
          }
          if (k > 0) ctx.drawImage(atlas, k * cw, 0, cw, ch, x * cw, y * ch, cw, ch);
        }
      }
      setSteps((prev) => (prev.join('') === ladder.glyphs.join('') ? prev : ladder.glyphs));
    },
    { dependencies: [size.w, size.h, set, cellPx, dither, theme, fonts, source.loaded, source.fileName] }
  );

  return (
    <Plate
      controls={
        <>
          <SourcePicker source={source} />
          <Choice
            label='Glyphs'
            options={[
              { value: 'latin', label: 'Latin' },
              { value: 'scripts', label: 'Eight scripts' },
              { value: 'digits', label: 'Digits' },
            ]}
            value={set}
            onChange={setSet}
          />
          <Choice
            label='Cell'
            options={[
              { value: '6', label: '6px' },
              { value: '8', label: '8px' },
              { value: '10', label: '10px' },
              { value: '14', label: '14px' },
            ]}
            value={String(cellPx)}
            onChange={(v) => setCellPx(Number(v))}
          />
          <div className='dmo-field'>
            <span className='dmo-field-label'>Between steps</span>
            <Toggle label='Dither' pressed={dither} onChange={setDither} />
          </div>
          <p className='dmo-bar-status dl-status'>
            The ladder climbs from a blank cell through <span className='dl-ladder-code'>{steps.slice(1).join(' ')}</span>, lightest to densest.
          </p>
          <SourceStatus error={source.error} text={creditFor(source.id, source.fileName ?? undefined)} />
        </>
      }
      height={380}
      label='A picture printed as characters chosen by their ink'
      lazy
      phoneHeight={300}
      tag={`buildLadder(SETS.${set})`}
    >
      <DropZone className='dl-box is-flush' onFile={source.open}>
        <div className='dl-fill' ref={size.ref}>
          <div className='dl-frame'>
            <canvas aria-hidden='true' className='dl-glyph-canvas' ref={canvas} />
          </div>
        </div>
      </DropZone>
    </Plate>
  );
}
