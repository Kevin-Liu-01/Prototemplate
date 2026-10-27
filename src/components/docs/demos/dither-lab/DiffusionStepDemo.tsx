'use client';

import { useRef, useState } from 'react';

import { useLayoutWork } from '@/lib/use-layout-work';

import { Action, Choice, Toggle } from '../controls';
import { useReducedMotion, useTheme } from '../hooks';
import Plate from '../Plate';
import { useBox, useFrameLoop, usePictureSource } from './hooks';
import { blit, packColor, packedRamp, readVar, snapCell, surfaceFor } from './raster';
import { ATKINSON, BAYER, FLOYD, type Kernel } from './screens';
import { creditFor, fillTone, type SourceId } from './sources';
import { SourceStatus } from './SourcePicker';

import './dither-lab.css';

type KernelId = 'floyd' | 'atkinson';
type Speed = 'slow' | 'fast';

const KERNELS: Record<KernelId, Kernel> = { floyd: FLOYD, atkinson: ATKINSON };
const RATE: Record<Speed, number> = { slow: 10, fast: 48 };
/** The still drawn under reduced motion stops this share of the way through the grid. */
const STILL_SHARE = 0.45;
/** Seconds the finished grid holds before the walk starts again. */
const HOLD_S = 1.6;

const SOURCES: readonly { value: SourceId; label: string }[] = [
  { value: 'ramp', label: 'Ramp' },
  { value: 'noise', label: 'Noise' },
  { value: 'earth', label: 'Earth' },
];

const ERROR_ROUTES: Record<KernelId, string> = {
  floyd: '7/16 right, 3/16 down left, 5/16 down and 1/16 down right',
  atkinson: '1/8 to each of six cells, and the last 1/4 is dropped',
};

type Walk = {
  cols: number;
  rows: number;
  /** each cell's tone plus the error it has received so far */
  values: Float32Array;
  /** -1 until the walk reaches the cell, then 0 for paper or 1 for ink */
  decided: Int8Array;
  pos: number;
  last: { i: number; v: number; on: number; err: number; targets: number[] } | null;
};

function freshWalk(tone: Float32Array, cols: number, rows: number): Walk {
  return { cols, rows, values: tone.slice(), decided: new Int8Array(cols * rows).fill(-1), pos: 0, last: null };
}

/** Decides the next cell in raster order and hands its error to the kernel's cells. */
function stepWalk(walk: Walk, kernel: Kernel): boolean {
  const { cols, rows, values, decided } = walk;
  if (walk.pos >= cols * rows) return false;
  const i = walk.pos++;
  const x = i % cols;
  const y = Math.floor(i / cols);
  const v = values[i] ?? 0;
  const on = v > 0.5 ? 1 : 0;
  decided[i] = on;
  const err = v - on;
  const targets: number[] = [];
  for (const [dx, dy, weight] of kernel) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || nx >= cols || ny >= rows) continue;
    const j = ny * cols + nx;
    values[j] = (values[j] ?? 0) + err * weight;
    targets.push(j);
  }
  walk.last = { i, v, on, err, targets };
  return true;
}

type Geometry = { cols: number; rows: number; sub: number; span: number; bufW: number; bufH: number };

/** Big cells about 24px across (16 columns under 560px), each `span` sub-cells of about 2px. */
function geometryFor(w: number, h: number): Geometry | null {
  if (w < 80 || h < 80) return null;
  const sub = snapCell(2);
  const cols = w >= 560 ? 30 : 15;
  const span = Math.max(6, Math.floor(w / cols / sub));
  const rows = Math.max(4, Math.floor(h / (span * sub)));
  return { cols, rows, sub, span, bufW: cols * span, bufH: rows * span };
}

/** Index buffer slots: 0 paper, 1 ink, 2 ground, 3 frame, 4 accent. */
function paint(walk: Walk, geo: Geometry, index: Uint8Array): void {
  const { span, bufW } = geo;
  const map = BAYER[8];
  const marked = new Set(walk.last?.targets ?? []);
  const cursor = walk.last?.i ?? -1;
  index.fill(2);
  for (let cy = 0; cy < walk.rows; cy++) {
    for (let cx = 0; cx < walk.cols; cx++) {
      const i = cy * walk.cols + cx;
      const state = walk.decided[i] ?? -1;
      const v = Math.min(1, Math.max(0, walk.values[i] ?? 0));
      const x0 = cx * span;
      const y0 = cy * span;
      const inner = span - 1;
      const edge = i === cursor || marked.has(i) ? 4 : 3;
      for (let y = 0; y < inner; y++) {
        let o = (y0 + y) * bufW + x0;
        const by = (y0 + y) & 7;
        for (let x = 0; x < inner; x++, o++) {
          const rim = x === 0 || y === 0 || x === inner - 1 || y === inner - 1;
          if (state >= 0) {
            index[o] = i === cursor && rim ? 4 : state;
          } else if (rim) {
            index[o] = edge;
          } else {
            index[o] = v > (map[(by << 3) | ((x0 + x) & 7)] ?? 0.5) ? 1 : 0;
          }
        }
      }
    }
  }
}

/** The line before the walk decides its first cell. */
const UNDECIDED = 'No cell is decided yet. Each pending cell shows its tone plus the error it has received, through the 8 by 8 screen.';

function describe(walk: Walk, kernel: KernelId): string {
  const last = walk.last;
  if (!last) return UNDECIDED;
  const x = (last.i % walk.cols) + 1;
  const y = Math.floor(last.i / walk.cols) + 1;
  const sign = last.err < 0 ? '−' : '+';
  return `Cell ${x}, ${y} holds ${last.v.toFixed(2)} and prints ${last.on ? 'ink' : 'paper'}. Its error of ${sign}${Math.abs(last.err).toFixed(2)} goes ${ERROR_ROUTES[kernel]}.`;
}

/** The line at its widest on this grid: the last cell's numbers, paper, and a signed error. */
function widestLine(walk: Walk, kernel: KernelId): string {
  return `Cell ${walk.cols}, ${walk.rows} holds 0.00 and prints paper. Its error of −0.00 goes ${ERROR_ROUTES[kernel]}.`;
}

/**
 * Error diffusion one cell at a time on a coarse grid. A pending cell
 * shows its tone plus the error it has received as a small 8 by 8 Bayer
 * patch; a decided cell is solid ink or paper. The cell just decided and
 * the cells its error went to carry the accent frame.
 */
export default function DiffusionStepDemo() {
  const reduced = useReducedMotion();
  const theme = useTheme();
  const source = usePictureSource('ramp');
  const [kernel, setKernel] = useState<KernelId>('floyd');
  const [speed, setSpeed] = useState<Speed>('slow');
  const [playing, setPlaying] = useState(true);
  const [restarts, setRestarts] = useState(0);

  const canvas = useRef<HTMLCanvasElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const widest = useRef<HTMLSpanElement>(null);
  const size = useBox();
  const walk = useRef<Walk | null>(null);
  const geo = useRef<Geometry | null>(null);
  const colors = useRef(new Uint32Array(5));
  const clock = useRef({ last: 0, carry: 0, hold: 0 });

  const draw = () => {
    const el = canvas.current;
    const w = walk.current;
    const g = geo.current;
    if (!el || !w || !g) return;
    const surface = surfaceFor(el, g.bufW, g.bufH, g.sub);
    if (!surface) return;
    const index = new Uint8Array(g.bufW * g.bufH);
    paint(w, g, index);
    blit(surface, index, colors.current);
    if (line.current) line.current.textContent = describe(w, kernel);
    if (widest.current) widest.current.textContent = widestLine(w, kernel);
  };

  /* colors: the theme's paper and ink, a frame between them, the docs accent */
  useLayoutWork(
    () => {
      const el = canvas.current;
      if (!el) return;
      const paper = packColor(readVar(el, '--pt-paper', 'rgb(255, 255, 255)'));
      const ink = packColor(readVar(el, '--pt-ink', 'rgb(7, 7, 7)'));
      const frame = packedRamp(paper, ink, 5)[1] ?? ink;
      colors.current = new Uint32Array([paper, ink, paper, frame, packColor(readVar(el, '--dl-blue', 'rgb(47, 92, 224)'))]);
      draw();
    },
    { dependencies: [theme, size.el] }
  );

  /* a new grid, source or kernel starts the walk over; reduced motion draws the still */
  useLayoutWork(
    () => {
      const loaded = source.loaded;
      const g = geometryFor(size.w, size.h);
      if (!loaded || !g) return;
      geo.current = g;
      const tone = fillTone(loaded, g.cols, g.rows, g.span * g.sub, new Float32Array(g.cols * g.rows));
      const next = freshWalk(tone, g.cols, g.rows);
      if (reduced) {
        const stop = Math.floor(g.cols * g.rows * STILL_SHARE);
        while (next.pos < stop) stepWalk(next, KERNELS[kernel]);
      }
      walk.current = next;
      clock.current = { last: 0, carry: 0, hold: 0 };
      draw();
    },
    { dependencies: [size.w, size.h, source.loaded, kernel, reduced, restarts] }
  );

  useFrameLoop(
    size.el,
    (now) => {
      const w = walk.current;
      if (!w) return;
      const c = clock.current;
      const dt = c.last ? Math.min(0.1, (now - c.last) / 1000) : 0;
      c.last = now;
      if (w.pos >= w.cols * w.rows) {
        c.hold += dt;
        if (c.hold >= HOLD_S) {
          c.hold = 0;
          setRestarts((n) => n + 1);
        }
        return;
      }
      c.carry += dt * RATE[speed];
      let moved = false;
      while (c.carry >= 1) {
        c.carry -= 1;
        moved = stepWalk(w, KERNELS[kernel]) || moved;
      }
      if (moved) draw();
    },
    playing
  );

  const step = () => {
    setPlaying(false);
    const w = walk.current;
    if (!w) return;
    if (!stepWalk(w, KERNELS[kernel])) {
      setRestarts((n) => n + 1);
      return;
    }
    draw();
  };

  return (
    <Plate
      controls={
        <>
          <Choice label='Source' options={SOURCES} value={source.id} onChange={source.choose} />
          <Choice
            label='Kernel'
            options={[
              { value: 'floyd', label: 'Floyd-Steinberg' },
              { value: 'atkinson', label: 'Atkinson' },
            ]}
            value={kernel}
            onChange={setKernel}
          />
          <Choice
            label='Speed'
            options={[
              { value: 'slow', label: '10 cells/s' },
              { value: 'fast', label: '48 cells/s' },
            ]}
            value={speed}
            onChange={setSpeed}
          />
          <div className='dmo-field'>
            <span className='dmo-field-label'>Walk</span>
            <div className='dl-actions'>
              <Toggle disabled={reduced} label='Play' pressed={playing && !reduced} onChange={setPlaying} />
              <Action onClick={step}>Step</Action>
              <Action onClick={() => setRestarts((n) => n + 1)}>Restart</Action>
            </div>
          </div>
          <p className='dmo-bar-status dl-status dl-walk-line dmo-held'>
            <span ref={line} />
            <span aria-hidden='true' className='dmo-held-ghost'>
              {UNDECIDED}
            </span>
            <span aria-hidden='true' className='dmo-held-ghost' ref={widest} />
          </p>
          <SourceStatus text={creditFor(source.id)} />
        </>
      }
      height={360}
      label='Error diffusion deciding one cell at a time'
      lazy
      moves
      phoneHeight={320}
      tag={`stepWalk(walk, ${kernel === 'floyd' ? 'FLOYD' : 'ATKINSON'})`}
    >
      <div className='dl-box'>
        <div className='dl-fill' ref={size.ref}>
          <div className='dl-frame'>
            <canvas aria-hidden='true' className='dl-canvas' ref={canvas} />
          </div>
        </div>
      </div>
    </Plate>
  );
}
