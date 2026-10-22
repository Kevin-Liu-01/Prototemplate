'use client';

import { useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';

import { useLayoutWork } from '@/lib/use-layout-work';

import { Choice, Range } from '../controls';
import { useTheme } from '../hooks';
import Plate from '../Plate';
import { useBox, usePictureSource } from './hooks';
import { blit, packColor, packedRamp, readVar, snapCell, surfaceFor, type Surface } from './raster';
import { BAYER, halftoneThreshold } from './screens';
import { creditFor, fillTone } from './sources';
import { DropZone, SourcePicker, SourceStatus } from './SourcePicker';

import './dither-lab.css';

type Base = 'bayer4' | 'bayer2' | 'halftone';
type Lens = 'tone' | 'fine' | 'map' | 'loupe';

/** Fine cells per coarse cell for each base screen; the halftone runs on the fine cells. */
const BLOCK: Record<Base, number> = { bayer4: 4, bayer2: 6, halftone: 1 };
const PITCH = 7;
const ZOOM = 4;
/** Gray steps from paper (0) to ink (64); slot 65 is the lens ring. */
const STEPS = 64;
const RING = 65;

const BASES: readonly { value: Base; label: string }[] = [
  { value: 'bayer4', label: '4 by 4 at 4px' },
  { value: 'bayer2', label: '2 by 2 at 6px' },
  { value: 'halftone', label: 'Halftone' },
];

const LENSES: readonly { value: Lens; label: string }[] = [
  { value: 'tone', label: 'Tone' },
  { value: 'fine', label: '8 by 8 at 1px' },
  { value: 'map', label: 'Thresholds' },
  { value: 'loupe', label: 'Loupe 4x' },
];

type Scene = {
  cols: number;
  rows: number;
  cell: number;
  tone: Float32Array;
  /** the base screen at fine cells, 0 or STEPS */
  base: Uint8Array;
  /** the 8 by 8 screen at fine cells, 0 or STEPS */
  fine: Uint8Array;
  /** the base screen's threshold at each fine cell, 0 to STEPS */
  map: Uint8Array;
  index: Uint8Array;
  surface: Surface;
  colors: Uint32Array;
  /** the lens's last bounding box, in cells */
  last: { x0: number; y0: number; x1: number; y1: number } | null;
};

/** The coarse screen at the fine grid: each block's mean tone against the block's threshold. */
function buildBase(tone: Float32Array, cols: number, rows: number, base: Base): { bits: Uint8Array; map: Uint8Array } {
  const bits = new Uint8Array(cols * rows);
  const map = new Uint8Array(cols * rows);
  const k = BLOCK[base];
  if (base === 'halftone') {
    for (let y = 0, i = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++, i++) {
        const t = halftoneThreshold(x, y, PITCH);
        map[i] = Math.round(t * STEPS);
        bits[i] = (tone[i] ?? 0) > t ? STEPS : 0;
      }
    }
    return { bits, map };
  }
  const n = base === 'bayer4' ? 4 : 2;
  const thresholds = BAYER[n];
  for (let by = 0; by < rows; by += k) {
    for (let bx = 0; bx < cols; bx += k) {
      let sum = 0;
      let count = 0;
      for (let y = by; y < Math.min(rows, by + k); y++) {
        for (let x = bx; x < Math.min(cols, bx + k); x++) {
          sum += tone[y * cols + x] ?? 0;
          count++;
        }
      }
      const cx = bx / k;
      const cy = by / k;
      const t = thresholds[(cy % n) * n + (cx % n)] ?? 0.5;
      const on = sum / count > t ? STEPS : 0;
      for (let y = by; y < Math.min(rows, by + k); y++) {
        for (let x = bx; x < Math.min(cols, bx + k); x++) {
          bits[y * cols + x] = on;
          map[y * cols + x] = Math.round(t * STEPS);
        }
      }
    }
  }
  return { bits, map };
}

/**
 * A picture through a coarse screen, with a round lens that follows the
 * pointer. Inside the lens the plate shows what the screen hides: the
 * continuous tone it reads, the picture through the 8 by 8 screen at
 * 1px cells, the screen's own thresholds, or the cells under it at 4
 * times their size.
 */
export default function ScreenLensDemo() {
  const theme = useTheme();
  const source = usePictureSource('tablet');
  const [base, setBase] = useState<Base>('bayer4');
  const [lens, setLens] = useState<Lens>('tone');
  const [radius, setRadius] = useState(72);

  const canvas = useRef<HTMLCanvasElement>(null);
  const size = useBox();
  const scene = useRef<Scene | null>(null);
  const pos = useRef({ x: 0.62, y: 0.48 });
  const raf = useRef(0);

  /** Restores the base under the old lens, draws the lens at `pos`, and puts only that rectangle. */
  const drawLens = () => {
    const s = scene.current;
    if (!s) return;
    const { cols, rows, base: baseBits, index } = s;
    const r = radius / s.cell;
    const cx = pos.current.x * cols;
    const cy = pos.current.y * rows;
    const box = {
      x0: Math.max(0, Math.floor(cx - r - 2)),
      y0: Math.max(0, Math.floor(cy - r - 2)),
      x1: Math.min(cols, Math.ceil(cx + r + 2)),
      y1: Math.min(rows, Math.ceil(cy + r + 2)),
    };
    const dirty = s.last
      ? { x0: Math.min(box.x0, s.last.x0), y0: Math.min(box.y0, s.last.y0), x1: Math.max(box.x1, s.last.x1), y1: Math.max(box.y1, s.last.y1) }
      : { x0: 0, y0: 0, x1: cols, y1: rows };
    for (let y = dirty.y0; y < dirty.y1; y++) {
      const row = y * cols;
      index.set(baseBits.subarray(row + dirty.x0, row + dirty.x1), row + dirty.x0);
    }
    for (let y = box.y0; y < box.y1; y++) {
      for (let x = box.x0; x < box.x1; x++) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
        if (d > r + 0.75) continue;
        const i = y * cols + x;
        if (d > r - 0.75) {
          index[i] = RING;
          continue;
        }
        if (lens === 'tone') index[i] = Math.round(Math.min(1, Math.max(0, s.tone[i] ?? 0)) * STEPS);
        else if (lens === 'fine') index[i] = s.fine[i] ?? 0;
        else if (lens === 'map') index[i] = s.map[i] ?? 0;
        else {
          const sx = Math.min(cols - 1, Math.max(0, Math.floor(cx + (x + 0.5 - cx) / ZOOM)));
          const sy = Math.min(rows - 1, Math.max(0, Math.floor(cy + (y + 0.5 - cy) / ZOOM)));
          index[i] = baseBits[sy * cols + sx] ?? 0;
        }
      }
    }
    s.last = box;
    blit(s.surface, index, s.colors, dirty.x0, dirty.y0, dirty.x1 - dirty.x0, dirty.y1 - dirty.y0);
  };

  useLayoutWork(
    () => {
      const el = canvas.current;
      const loaded = source.loaded;
      if (!el || !loaded || size.w < 40 || size.h < 40) return;
      const cell = snapCell(1);
      const cols = Math.floor(size.w / cell);
      const rows = Math.floor(size.h / cell);
      const tone = fillTone(loaded, cols, rows, cell, new Float32Array(cols * rows), { disc: 1.2 });
      const { bits, map } = buildBase(tone, cols, rows, base);
      const fine = new Uint8Array(cols * rows);
      const b8 = BAYER[8];
      for (let y = 0, i = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++, i++) fine[i] = (tone[i] ?? 0) > (b8[((y & 7) << 3) | (x & 7)] ?? 0.5) ? STEPS : 0;
      }
      const surface = surfaceFor(el, cols, rows, cell);
      if (!surface) return;
      const paper = packColor(readVar(el, '--pt-paper', 'rgb(255, 255, 255)'));
      const ink = packColor(readVar(el, '--pt-ink', 'rgb(7, 7, 7)'));
      const colors = new Uint32Array(RING + 1);
      colors.set(packedRamp(paper, ink, STEPS + 1));
      colors[RING] = packColor(readVar(el, '--dl-blue', 'rgb(47, 92, 224)'));
      scene.current = { cols, rows, cell, tone, base: bits, fine, map, index: bits.slice(), surface, colors, last: null };
      drawLens();
    },
    { dependencies: [size.w, size.h, source.loaded, source.fileName, base, theme] }
  );

  /* a lens or radius change redraws the lens over the cached base */
  useLayoutWork(
    () => {
      drawLens();
    },
    { dependencies: [lens, radius] }
  );

  const moveTo = (x: number, y: number) => {
    pos.current = { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) };
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      drawLens();
    });
  };

  const onPointer = (event: PointerEvent<HTMLDivElement>) => {
    const el = canvas.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    moveTo((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
  };

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const s = scene.current;
    if (!s) return;
    const step = 16 / s.cell;
    const dx = event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0;
    const dy = event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0;
    if (!dx && !dy) return;
    event.preventDefault();
    moveTo(pos.current.x + dx / s.cols, pos.current.y + dy / s.rows);
  };

  return (
    <Plate
      controls={
        <>
          <SourcePicker source={source} />
          <Choice label='Screen' options={BASES} value={base} onChange={setBase} />
          <Choice label='Lens shows' options={LENSES} value={lens} onChange={setLens} />
          <Range format={(v) => `${v}px`} label='Radius' max={130} min={32} step={2} value={radius} onChange={setRadius} />
          <SourceStatus error={source.error} text={creditFor(source.id, source.fileName ?? undefined)} />
        </>
      }
      height={360}
      label='A picture through a coarse screen, with a lens that shows what the screen reads'
      lazy
      phoneHeight={280}
      tag={base === 'halftone' ? `halftoneThreshold(x, y, ${PITCH})` : `BAYER[${base === 'bayer4' ? 4 : 2}]`}
    >
      <DropZone className='dl-box is-flush' onFile={source.open}>
        <div className='dl-fill' ref={size.ref}>
          <div
            aria-label='Lens. Move the pointer over the picture, or use the arrow keys.'
            className='dl-frame dl-lens'
            role='application'
            tabIndex={0}
            onKeyDown={onKey}
            onPointerDown={onPointer}
            onPointerMove={onPointer}
          >
            <canvas aria-hidden='true' className='dl-canvas' ref={canvas} />
          </div>
        </div>
      </DropZone>
    </Plate>
  );
}
