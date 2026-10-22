'use client';

import { useRef, useState } from 'react';

import { useLayoutWork } from '@/lib/use-layout-work';

import { Action, Choice, Range } from '../controls';
import { useReducedMotion, useTheme } from '../hooks';
import Plate from '../Plate';
import { useBox, useFrameLoop, usePictureSource } from './hooks';
import { blit, packColor, packedRamp, readVar, snapCell, surfaceFor } from './raster';
import { screenTone } from './screens';
import { PICTURE_ORDER, SOURCE_LABELS, creditFor, fillTone, type SourceId } from './sources';
import { SourceStatus } from './SourcePicker';

import './dither-lab.css';

type Method = 'tone' | 'alpha' | 'tile';

const METHODS: readonly { value: Method; label: string }[] = [
  { value: 'tone', label: 'Tone mix' },
  { value: 'alpha', label: 'Alpha fade' },
  { value: 'tile', label: 'Moved tile' },
];

const CALLS: Record<Method, string> = {
  tone: 'mixFields(a, b, smoothstep(k))',
  alpha: 'opacity: k (refused)',
  tile: 'phase moves at k = 0.5 (refused)',
};

const PICTURES: readonly { value: SourceId; label: string }[] = PICTURE_ORDER.map((id) => ({ value: id, label: SOURCE_LABELS[id] }));

/** The house durations: a step between pictures, a resolve, and a slow pass to watch the cells. */
const DURATIONS: readonly { value: string; label: string }[] = [
  { value: '150', label: '150 ms' },
  { value: '350', label: '350 ms' },
  { value: '2000', label: '2 s' },
];

/** Gray steps an alpha fade is drawn in. */
const LEVELS = 32;
/** The incoming tile's offset in the moved-tile method, in cells. */
const MOVED = { x: 3, y: 2 };

function smooth(k: number): number {
  const t = Math.min(1, Math.max(0, k));
  return t * t * (3 - 2 * t);
}

/**
 * Two pictures on one grid of cells and one anchored 8 by 8 tile, mixed by
 * tone: each cell's tone moves from the first picture's to the second's on
 * one smoothstep, so each cell crosses its fixed threshold at most once.
 * The two refused methods sit beside it for comparison: an alpha fade of
 * the two screens, and a tone mix whose tile moves halfway through.
 */
export default function ToneMixDemo() {
  const reduced = useReducedMotion();
  const theme = useTheme();
  const from = usePictureSource('earth');
  const to = usePictureSource('rosetta');
  const [method, setMethod] = useState<Method>('tone');
  const [duration, setDuration] = useState('350');
  const [cellPx, setCellPx] = useState(2);
  const [k, setK] = useState(0);
  const [running, setRunning] = useState(false);
  const [toward, setToward] = useState(1);

  const canvas = useRef<HTMLCanvasElement>(null);
  const readout = useRef<HTMLParagraphElement>(null);
  const size = useBox();
  const anim = useRef({ from: 0, to: 1, start: 0, ms: 350 });
  const cache = useRef<{ key: string; a: Float32Array; b: Float32Array; bitsA: Uint8Array; bitsB: Uint8Array } | null>(null);
  const prev = useRef<{ key: string; index: Uint8Array } | null>(null);
  const tally = useRef({ changes: 0, cells: new Set<number>(), counting: false });

  useLayoutWork(
    () => {
      const el = canvas.current;
      const a = from.loaded;
      const b = to.loaded;
      if (!el || !a || !b || size.w < 40 || size.h < 40) return;
      const cell = snapCell(cellPx);
      const cols = Math.floor(size.w / cell);
      const rows = Math.floor(size.h / cell);
      const n = cols * rows;
      const key = `${a.id}|${b.id}|${cols}x${rows}|${cell}`;
      if (cache.current?.key !== key) {
        const ta = fillTone(a, cols, rows, cell, new Float32Array(n), { disc: 1.3 });
        const tb = fillTone(b, cols, rows, cell, new Float32Array(n), { disc: 1.3 });
        const bitsA = new Uint8Array(n);
        const bitsB = new Uint8Array(n);
        screenTone('bayer8', ta, cols, rows, bitsA, cols);
        screenTone('bayer8', tb, cols, rows, bitsB, cols);
        cache.current = { key, a: ta, b: tb, bitsA, bitsB };
      }
      const c = cache.current;
      const index = new Uint8Array(n);
      if (method === 'alpha') {
        for (let i = 0; i < n; i++) index[i] = Math.round(((c.bitsA[i] ?? 0) * (1 - k) + (c.bitsB[i] ?? 0) * k) * LEVELS);
      } else {
        const mixed = new Float32Array(n);
        for (let i = 0; i < n; i++) mixed[i] = (c.a[i] ?? 0) + ((c.b[i] ?? 0) - (c.a[i] ?? 0)) * k;
        const moved = method === 'tile' && k >= 0.5;
        screenTone('bayer8', mixed, cols, rows, index, cols, 0, 0, moved ? { phaseX: MOVED.x, phaseY: MOVED.y } : {});
        for (let i = 0; i < n; i++) index[i] = (index[i] ?? 0) * LEVELS;
      }

      let changed = 0;
      const last = prev.current?.key === `${key}|${method}` ? prev.current.index : null;
      if (last) {
        const t = tally.current;
        for (let i = 0; i < n; i++) {
          if (index[i] === last[i]) continue;
          changed++;
          if (t.counting) {
            t.changes++;
            t.cells.add(i);
          }
        }
      }
      prev.current = { key: `${key}|${method}`, index };

      const surface = surfaceFor(el, cols, rows, cell);
      if (!surface) return;
      const paper = packColor(readVar(el, '--pt-paper', 'rgb(255, 255, 255)'));
      const ink = packColor(readVar(el, '--pt-ink', 'rgb(7, 7, 7)'));
      blit(surface, index, packedRamp(paper, ink, LEVELS + 1));

      if (readout.current) {
        const t = tally.current;
        const share = ((changed / n) * 100).toFixed(1);
        const run = t.counting || t.changes > 0
          ? ` Over this mix ${t.cells.size.toLocaleString('en-US')} cells changed, ${t.changes.toLocaleString('en-US')} times in all.`
          : '';
        readout.current.textContent = `Mix ${k.toFixed(2)}. The last step changed ${changed.toLocaleString('en-US')} cells (${share}%).${run}`;
      }
    },
    { dependencies: [size.w, size.h, from.loaded, to.loaded, cellPx, k, method, theme] }
  );

  useFrameLoop(
    size.el,
    (now) => {
      const a = anim.current;
      if (!a.start) a.start = now;
      const p = (now - a.start) / a.ms;
      setK(a.from + (a.to - a.from) * smooth(p));
      if (p >= 1) {
        tally.current.counting = false;
        setRunning(false);
      }
    },
    running,
    60
  );

  const play = () => {
    /* an interrupted mix turns around from the frame on screen */
    const target = running ? 1 - toward : k < 0.5 ? 1 : 0;
    tally.current = { changes: 0, cells: new Set<number>(), counting: !reduced };
    if (reduced) {
      setK(target);
      return;
    }
    anim.current = { from: k, to: target, start: 0, ms: Number(duration) };
    setToward(target);
    setRunning(true);
  };

  return (
    <Plate
      controls={
        <>
          <Choice label='From' options={PICTURES} value={from.id} onChange={from.choose} />
          <Choice label='To' options={PICTURES} value={to.id} onChange={to.choose} />
          <Choice label='Method' options={METHODS} value={method} onChange={setMethod} />
          <Choice label='Duration' options={DURATIONS} value={duration} onChange={setDuration} />
          <Choice
            label='Cell'
            options={[
              { value: '1', label: '1px' },
              { value: '2', label: '2px' },
              { value: '3', label: '3px' },
            ]}
            value={String(cellPx)}
            onChange={(v) => setCellPx(Number(v))}
          />
          <Range
            format={(v) => v.toFixed(2)}
            label='Mix'
            max={1}
            min={0}
            step={0.01}
            value={k}
            onChange={(v) => {
              setRunning(false);
              tally.current = { changes: 0, cells: new Set<number>(), counting: false };
              setK(v);
            }}
          />
          <div className='dmo-field'>
            <span className='dmo-field-label'>Transition</span>
            <Action onClick={play}>{(running ? toward === 0 : k < 0.5) ? 'Mix to B' : 'Mix to A'}</Action>
          </div>
          <p className='dmo-bar-status dl-status' ref={readout} />
          <SourceStatus text={`A: ${creditFor(from.id)} B: ${creditFor(to.id)}`} />
        </>
      }
      height={340}
      label='Two pictures mixed by tone on one grid of dither cells'
      lazy
      moves
      phoneHeight={260}
      tag={CALLS[method]}
    >
      <div className='dl-box is-flush'>
        <div className='dl-fill' ref={size.ref}>
          <div className='dl-frame'>
            <canvas aria-hidden='true' className='dl-canvas' ref={canvas} />
          </div>
        </div>
      </div>
    </Plate>
  );
}
