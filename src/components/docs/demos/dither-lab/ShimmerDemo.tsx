'use client';

import { useRef, useState } from 'react';

import { useLayoutWork } from '@/lib/use-layout-work';

import { Choice, Toggle } from '../controls';
import { useReducedMotion, useTheme } from '../hooks';
import Plate from '../Plate';
import { useBox, useFrameLoop, usePictureSource } from './hooks';
import { blit, packColor, readVar, snapCell, surfaceFor, type Surface } from './raster';
import { SCREEN_LABELS, screenTone, type ScreenId } from './screens';
import { creditFor, fillTone, type LoadedSource, type SourceId } from './sources';
import { SourceStatus } from './SourcePicker';

import './dither-lab.css';

type Rival = 'floyd' | 'atkinson' | 'random';

const SOURCES: readonly { value: SourceId; label: string }[] = [
  { value: 'noise', label: 'Noise' },
  { value: 'ramp', label: 'Ramp' },
  { value: 'earth', label: 'Earth' },
];

/** The time the reduced-motion still is drawn at; its rates compare it with the frame 1/30 s before. */
const STILL_T = 4;
/** Cells of drift each way when the earth sways: under 3 percent of a 120-cell half. */
const SWAY = 2.5;

type Geometry = { cell: number; half: number; rows: number; gap: number; top: number; bufW: number; bufH: number };

function geometryFor(w: number, h: number, cellPx: number): Geometry | null {
  if (w < 80 || h < 80) return null;
  const cell = snapCell(cellPx);
  const gap = Math.ceil(12 / cell);
  /* the label strip holds the name and the rate on one line, or two under 560px */
  const top = Math.ceil((w < 560 ? 44 : 28) / cell);
  const cols = Math.floor(w / cell);
  const half = Math.floor((cols - gap) / 2);
  const rows = Math.floor(h / cell) - top;
  if (half < 8 || rows < 8) return null;
  return { cell, half, rows, gap, top, bufW: half * 2 + gap, bufH: rows + top };
}

/** The earth sampled with a margin once, then read at a sub-cell offset per frame. */
type Sway = { tone: Float32Array; cols: number; rows: number; pad: number };

function swayed(sway: Sway, out: Float32Array, cols: number, rows: number, t: number): void {
  const dx = sway.pad + Math.sin(t * 0.9) * SWAY;
  const dy = sway.pad + Math.cos(t * 0.7) * SWAY * 0.6;
  for (let y = 0, i = 0; y < rows; y++) {
    const sy = y + dy;
    const y0 = Math.floor(sy);
    const fy = sy - y0;
    for (let x = 0; x < cols; x++, i++) {
      const sx = x + dx;
      const x0 = Math.floor(sx);
      const fx = sx - x0;
      const a = y0 * sway.cols + x0;
      const t00 = sway.tone[a] ?? 0;
      const t10 = sway.tone[a + 1] ?? 0;
      const t01 = sway.tone[a + sway.cols] ?? 0;
      const t11 = sway.tone[a + sway.cols + 1] ?? 0;
      const top = t00 + (t10 - t00) * fx;
      out[i] = top + (t01 + (t11 - t01) * fx - top) * fy;
    }
  }
}

/**
 * The same moving field through the house 8 by 8 screen on the left and
 * through error diffusion or white noise on the right. Each side prints
 * the share of its cells that changed since the previous frame.
 */
export default function ShimmerDemo() {
  const reduced = useReducedMotion();
  const theme = useTheme();
  const source = usePictureSource('noise');
  const [rival, setRival] = useState<Rival>('floyd');
  const [cellPx, setCellPx] = useState(3);
  const [playing, setPlaying] = useState(true);

  const canvas = useRef<HTMLCanvasElement>(null);
  const rateLeft = useRef<HTMLSpanElement>(null);
  const rateRight = useRef<HTMLSpanElement>(null);
  const size = useBox();

  const state = useRef<{
    geo: Geometry;
    loaded: LoadedSource;
    tone: Float32Array;
    index: Uint8Array;
    prev: Uint8Array;
    sway: Sway | null;
    surface: Surface;
    colors: Uint32Array;
    rates: [number, number];
    shown: number;
    t: number;
    last: number;
  } | null>(null);

  /* one frame at time t: fill the tone, screen both halves, count the cells that changed */
  const frame = (t: number, measure: boolean) => {
    const s = state.current;
    if (!s) return;
    const { geo, tone, index, prev } = s;
    if (s.sway) swayed(s.sway, tone, geo.half, geo.rows, t);
    else fillTone(s.loaded, geo.half, geo.rows, geo.cell, tone, { time: t });
    prev.set(index);
    const sides: [ScreenId, number][] = [
      ['bayer8', 0],
      [rival, geo.half + geo.gap],
    ];
    sides.forEach(([id, ox], k) => {
      screenTone(id, tone, geo.half, geo.rows, index, geo.bufW, ox, geo.top);
      if (!measure) return;
      let changed = 0;
      for (let y = geo.top; y < geo.bufH; y++) {
        let o = y * geo.bufW + ox;
        for (let x = 0; x < geo.half; x++, o++) if (index[o] !== prev[o]) changed++;
      }
      const rate = changed / (geo.half * geo.rows);
      s.rates[k] = s.rates[k] * 0.8 + rate * 0.2;
    });
    blit(s.surface, index, s.colors);
  };

  const showRates = (rates: [number, number]) => {
    if (rateLeft.current) rateLeft.current.textContent = `${(rates[0] * 100).toFixed(1)}% per frame`;
    if (rateRight.current) rateRight.current.textContent = `${(rates[1] * 100).toFixed(1)}% per frame`;
  };

  useLayoutWork(
    () => {
      const el = canvas.current;
      const loaded = source.loaded;
      const geo = geometryFor(size.w, size.h, cellPx);
      if (!el || !loaded || !geo) return;
      const surface = surfaceFor(el, geo.bufW, geo.bufH, geo.cell);
      if (!surface) return;
      const paper = packColor(readVar(el, '--pt-paper', 'rgb(255, 255, 255)'));
      const ink = packColor(readVar(el, '--pt-ink', 'rgb(7, 7, 7)'));
      let sway: Sway | null = null;
      if (loaded.picture) {
        const pad = Math.ceil(SWAY) + 2;
        const cols = geo.half + pad * 2;
        const rows = geo.rows + pad * 2;
        sway = { tone: fillTone(loaded, cols, rows, geo.cell, new Float32Array(cols * rows), { disc: 1.25 }), cols, rows, pad };
      }
      const index = new Uint8Array(geo.bufW * geo.bufH).fill(2);
      state.current = {
        geo,
        loaded,
        tone: new Float32Array(geo.half * geo.rows),
        index,
        prev: new Uint8Array(index.length),
        sway,
        surface,
        colors: new Uint32Array([paper, ink, paper]),
        rates: [0, 0],
        shown: 0,
        t: state.current?.t ?? STILL_T,
        last: 0,
      };
      const s = state.current;
      if (reduced || !playing) {
        /* the still: the frame 1/30 s before, then the frame, so the rates are one frame's change */
        const t = reduced ? STILL_T : s.t;
        frame(t - 1 / 30, false);
        frame(t, true);
        s.rates = [s.rates[0] / 0.2, s.rates[1] / 0.2];
        showRates(s.rates);
      } else {
        frame(s.t, false);
      }
    },
    { dependencies: [size.w, size.h, cellPx, rival, source.loaded, theme, reduced, playing] }
  );

  useFrameLoop(
    size.el,
    (now) => {
      const s = state.current;
      if (!s) return;
      const dt = s.last ? Math.min(0.1, (now - s.last) / 1000) : 1 / 30;
      s.last = now;
      s.t += dt;
      frame(s.t, true);
      if (now - s.shown > 250) {
        s.shown = now;
        showRates(s.rates);
      }
    },
    playing
  );

  const geo = geometryFor(size.w, size.h, cellPx);
  const halfW = geo ? geo.half * geo.cell : 0;
  const rightX = geo ? (geo.half + geo.gap) * geo.cell : 0;

  return (
    <Plate
      controls={
        <>
          <Choice label='Field' options={SOURCES} value={source.id} onChange={source.choose} />
          <Choice
            label='Right side'
            options={[
              { value: 'floyd', label: 'Floyd-Steinberg' },
              { value: 'atkinson', label: 'Atkinson' },
              { value: 'random', label: 'White noise' },
            ]}
            value={rival}
            onChange={setRival}
          />
          <Choice
            label='Cell'
            options={[
              { value: '2', label: '2px' },
              { value: '3', label: '3px' },
              { value: '4', label: '4px' },
            ]}
            value={String(cellPx)}
            onChange={(v) => setCellPx(Number(v))}
          />
          <div className='dmo-field'>
            <span className='dmo-field-label'>Motion</span>
            <Toggle disabled={reduced} label='Play' pressed={playing && !reduced} onChange={setPlaying} />
          </div>
          <SourceStatus text={creditFor(source.id)} />
        </>
      }
      height={340}
      label='A moving field through the Bayer screen and through error diffusion, with the share of cells that change each frame'
      lazy
      moves
      phoneHeight={300}
      tag={`screenTone('bayer8') vs screenTone('${rival}')`}
    >
      <div className='dl-box'>
        <div className='dl-fill' ref={size.ref}>
          <div className='dl-frame'>
            <canvas aria-hidden='true' className='dl-canvas' ref={canvas} />
            {geo ? (
              <>
                <p className='dl-label is-top' style={{ left: 0, top: 0, width: halfW }}>
                  <span>{SCREEN_LABELS.bayer8}</span>
                  <span className='dl-num' ref={rateLeft} />
                </p>
                <p className='dl-label is-top' style={{ left: rightX, top: 0, width: halfW }}>
                  <span>{SCREEN_LABELS[rival]}</span>
                  <span className='dl-num' ref={rateRight} />
                </p>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </Plate>
  );
}
