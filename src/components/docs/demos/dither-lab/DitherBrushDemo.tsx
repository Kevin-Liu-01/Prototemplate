'use client';

import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';

import { useLayoutWork } from '@/lib/use-layout-work';

import { Action, Choice, Range } from '../controls';
import { useTheme } from '../hooks';
import Plate from '../Plate';
import { useBox, usePictureSource } from './hooks';
import { blit, packColor, readVar, snapCell, surfaceFor, type Surface } from './raster';
import { screenTone, type ScreenId } from './screens';
import { creditFor, fillTone } from './sources';
import { SourceStatus } from './SourcePicker';

import './dither-lab.css';

type Tool = 'paint' | 'erase' | 'reveal';
type BrushScreen = Extract<ScreenId, 'bayer4' | 'bayer8' | 'halftone'>;

const TOOLS: readonly { value: Tool; label: string }[] = [
  { value: 'paint', label: 'Paint' },
  { value: 'erase', label: 'Erase' },
  { value: 'reveal', label: 'Reveal picture' },
];

const SCREENS: readonly { value: BrushScreen; label: string }[] = [
  { value: 'bayer8', label: '8 by 8' },
  { value: 'bayer4', label: '4 by 4' },
  { value: 'halftone', label: 'Halftone' },
];

type Canvas = {
  cols: number;
  rows: number;
  cell: number;
  tone: Float32Array;
  index: Uint8Array;
  surface: Surface;
  colors: Uint32Array;
};

type Rect = { x0: number; y0: number; x1: number; y1: number };

/**
 * A brush that paints tone into a grid and prints it through one screen.
 * Each dab adds tone with a soft round falloff, and only the cells under
 * the dab are screened again, at their own tile position, so a stroke
 * never shifts the cells around it.
 */
export default function DitherBrushDemo() {
  const theme = useTheme();
  const picture = usePictureSource('calligraphy');
  const [tool, setTool] = useState<Tool>('paint');
  const [screen, setScreen] = useState<BrushScreen>('bayer8');
  const [cellPx, setCellPx] = useState(3);
  const [radius, setRadius] = useState(28);
  const [flow, setFlow] = useState(0.35);

  const canvas = useRef<HTMLCanvasElement>(null);
  const size = useBox();
  const state = useRef<Canvas | null>(null);
  const reveal = useRef<{ key: string; tone: Float32Array } | null>(null);
  const stroke = useRef<{ x: number; y: number } | null>(null);
  const seeded = useRef(false);

  /** Screens the cells inside `rect` at their own tile position and puts them on the canvas. */
  const print = (rect: Rect) => {
    const s = state.current;
    if (!s) return;
    const x0 = Math.max(0, Math.floor(rect.x0));
    const y0 = Math.max(0, Math.floor(rect.y0));
    const x1 = Math.min(s.cols, Math.ceil(rect.x1));
    const y1 = Math.min(s.rows, Math.ceil(rect.y1));
    const w = x1 - x0;
    const h = y1 - y0;
    if (w <= 0 || h <= 0) return;
    const sub = new Float32Array(w * h);
    for (let y = 0; y < h; y++) sub.set(s.tone.subarray((y0 + y) * s.cols + x0, (y0 + y) * s.cols + x1), y * w);
    screenTone(screen, sub, w, h, s.index, s.cols, x0, y0, { phaseX: x0, phaseY: y0, pitch: 6 });
    blit(s.surface, s.index, s.colors, x0, y0, w, h);
  };

  const revealTone = (s: Canvas): Float32Array | null => {
    const loaded = picture.loaded;
    if (!loaded) return null;
    const key = `${loaded.id}|${s.cols}x${s.rows}|${s.cell}`;
    if (reveal.current?.key !== key) {
      reveal.current = { key, tone: fillTone(loaded, s.cols, s.rows, s.cell, new Float32Array(s.cols * s.rows)) };
    }
    return reveal.current.tone;
  };

  /** One round dab at cell x, y; returns the cells it touched. */
  const dab = (cx: number, cy: number, r: number, amount: number, mode: Tool): Rect | null => {
    const s = state.current;
    if (!s) return null;
    const target = mode === 'reveal' ? revealTone(s) : null;
    if (mode === 'reveal' && !target) return null;
    const x0 = Math.max(0, Math.floor(cx - r));
    const y0 = Math.max(0, Math.floor(cy - r));
    const x1 = Math.min(s.cols, Math.ceil(cx + r));
    const y1 = Math.min(s.rows, Math.ceil(cy + r));
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / r;
        if (d >= 1) continue;
        const fall = (1 - d * d) * (1 - d * d) * amount;
        const i = y * s.cols + x;
        const t = s.tone[i] ?? 0;
        if (mode === 'paint') s.tone[i] = t + (1 - t) * fall;
        else if (mode === 'erase') s.tone[i] = t - t * fall;
        else s.tone[i] = t + ((target?.[i] ?? 0) - t) * fall;
      }
    }
    return { x0, y0, x1, y1 };
  };

  /** Dabs from `a` to `b` (cells) every third of a radius, then prints the union of the dabs. */
  const strokeTo = (a: { x: number; y: number }, b: { x: number; y: number }, r: number, amount: number, mode: Tool) => {
    const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / Math.max(0.5, r / 3)));
    let box: Rect | null = null;
    for (let k = 1; k <= steps; k++) {
      const hit = dab(a.x + ((b.x - a.x) * k) / steps, a.y + ((b.y - a.y) * k) / steps, r, amount, mode);
      if (!hit) continue;
      box = box
        ? { x0: Math.min(box.x0, hit.x0), y0: Math.min(box.y0, hit.y0), x1: Math.max(box.x1, hit.x1), y1: Math.max(box.y1, hit.y1) }
        : hit;
    }
    if (box) print(box);
  };

  /** A sample stroke: a wave across the plate whose width swells and thins. */
  const sample = () => {
    const s = state.current;
    if (!s) return;
    const r = (Math.min(s.cols * s.cell, s.rows * s.cell) * 0.11) / s.cell;
    let last = { x: s.cols * 0.08, y: s.rows * 0.56 };
    for (let k = 1; k <= 90; k++) {
      const t = k / 90;
      const next = { x: s.cols * (0.08 + 0.84 * t), y: s.rows * (0.52 + 0.2 * Math.sin(t * Math.PI * 2.2)) };
      strokeTo(last, next, r * (0.55 + 0.6 * Math.sin(t * Math.PI)), 0.32, 'paint');
      last = next;
    }
  };

  /* a new grid keeps the painting: the old tone is read at the new cells */
  useLayoutWork(
    () => {
      const el = canvas.current;
      if (!el || size.w < 40 || size.h < 40) return;
      const cell = snapCell(cellPx);
      const cols = Math.floor(size.w / cell);
      const rows = Math.floor(size.h / cell);
      const surface = surfaceFor(el, cols, rows, cell);
      if (!surface) return;
      const tone = new Float32Array(cols * rows);
      const old = state.current;
      if (old) {
        for (let y = 0, i = 0; y < rows; y++) {
          const oy = Math.min(old.rows - 1, Math.floor(((y + 0.5) * cell) / old.cell));
          for (let x = 0; x < cols; x++, i++) {
            const ox = Math.min(old.cols - 1, Math.floor(((x + 0.5) * cell) / old.cell));
            tone[i] = old.tone[oy * old.cols + ox] ?? 0;
          }
        }
      }
      const paper = packColor(readVar(el, '--pt-paper', 'rgb(255, 255, 255)'));
      const ink = packColor(readVar(el, '--pt-ink', 'rgb(7, 7, 7)'));
      state.current = { cols, rows, cell, tone, index: new Uint8Array(cols * rows), surface, colors: new Uint32Array([paper, ink]) };
      print({ x0: 0, y0: 0, x1: cols, y1: rows });
      if (!seeded.current) {
        seeded.current = true;
        sample();
      }
    },
    { dependencies: [size.w, size.h, cellPx, screen, theme] }
  );

  const at = (event: PointerEvent<HTMLDivElement>) => {
    const s = state.current;
    const el = canvas.current;
    if (!s || !el) return null;
    const rect = el.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * s.cols, y: ((event.clientY - rect.top) / rect.height) * s.rows };
  };

  const brush = () => {
    const s = state.current;
    return s ? radius / s.cell : 1;
  };

  return (
    <Plate
      controls={
        <>
          <Choice label='Tool' options={TOOLS} value={tool} onChange={setTool} />
          <Choice label='Screen' options={SCREENS} value={screen} onChange={setScreen} />
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
          <Range format={(v) => `${v}px`} label='Size' max={64} min={6} step={2} value={radius} onChange={setRadius} />
          <Range format={(v) => v.toFixed(2)} label='Flow' max={1} min={0.05} step={0.05} value={flow} onChange={setFlow} />
          <div className='dmo-field'>
            <span className='dmo-field-label'>Canvas</span>
            <div className='dl-actions'>
              <Action onClick={sample}>Sample Stroke</Action>
              <Action
                onClick={() => {
                  const s = state.current;
                  if (!s) return;
                  s.tone.fill(0);
                  print({ x0: 0, y0: 0, x1: s.cols, y1: s.rows });
                }}
              >
                Clear
              </Action>
            </div>
          </div>
          <SourceStatus text={`Reveal picture paints in ${creditFor('calligraphy')}`} />
        </>
      }
      height={340}
      label='A canvas that paints in dither cells'
      lazy
      phoneHeight={260}
      tag={`screenTone('${screen}', tone, ..., { phase })`}
    >
      <div className='dl-box is-flush'>
        <div className='dl-fill' ref={size.ref}>
          <div
            className='dl-frame dl-brush'
            onPointerCancel={() => {
              stroke.current = null;
            }}
            onPointerDown={(event) => {
              const p = at(event);
              if (!p) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              stroke.current = p;
              strokeTo(p, p, brush(), flow, tool);
            }}
            onPointerMove={(event) => {
              const last = stroke.current;
              const p = at(event);
              if (!last || !p) return;
              strokeTo(last, p, brush(), flow, tool);
              stroke.current = p;
            }}
            onPointerUp={() => {
              stroke.current = null;
            }}
          >
            <canvas aria-hidden='true' className='dl-canvas' ref={canvas} />
          </div>
        </div>
      </div>
    </Plate>
  );
}
