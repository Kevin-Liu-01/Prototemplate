'use client';

import { useRef, useState } from 'react';

import { useLayoutWork } from '@/lib/use-layout-work';

import { Choice, Range, Toggle } from '../controls';
import { useReducedMotion, useTheme } from '../hooks';
import Plate from '../Plate';
import { useBox, useFrameLoop } from './hooks';
import { blit, packColor, readVar, snapCell, surfaceFor } from './raster';
import { screenTone } from './screens';
import { MARK_LABELS, loadMark, markShape, type CellShape, type MarkArt, type MarkId } from './shapes';

import './dither-lab.css';

type Order = 'tiers' | 'core' | 'edge' | 'sweep';
type MarkScreen = 'bayer4' | 'bayer8';

const ORDERS: readonly { value: Order; label: string }[] = [
  { value: 'tiers', label: 'Tiers' },
  { value: 'core', label: 'Core out' },
  { value: 'edge', label: 'Edge in' },
  { value: 'sweep', label: 'Sweep' },
];

const MARKS: readonly { value: MarkId; label: string }[] = Object.entries(MARK_LABELS).map(([id, label]) => ({ value: id, label }));

/** The tone band, as a share of the ramp, that the core, edge and sweep orders spread across. */
const BAND = 0.35;
/** The cycle: resolve, hold, erode, hold, in seconds. */
const RESOLVE_S = 1.4;
const HOLD_S = 1.2;
const CYCLE_S = RESOLVE_S * 2 + HOLD_S * 2;

function smooth(k: number): number {
  const t = Math.min(1, Math.max(0, k));
  return t * t * (3 - 2 * t);
}

/** The level (0 to 1) at a time in the cycle: up, hold, down, hold. */
function levelAt(t: number): number {
  const p = ((t % CYCLE_S) + CYCLE_S) % CYCLE_S;
  if (p < RESOLVE_S) return smooth(p / RESOLVE_S);
  if (p < RESOLVE_S + HOLD_S) return 1;
  if (p < RESOLVE_S * 2 + HOLD_S) return 1 - smooth((p - RESOLVE_S - HOLD_S) / RESOLVE_S);
  return 0;
}

/**
 * The tone of each cell inside the mark at `level`. Tiers gives every
 * inside cell the same tone; core out and edge in order the cells by their
 * depth from the outline; sweep orders them from left to right.
 */
function markTone(shape: CellShape, order: Order, level: number, out: Float32Array): number {
  const { cols, rows, sd, box, depth } = shape;
  const span = Math.max(1, box.x1 - box.x0);
  let inside = 0;
  for (let y = 0, i = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++, i++) {
      const d = sd[i] ?? 1;
      if (d >= 0) {
        out[i] = 0;
        continue;
      }
      inside++;
      if (order === 'tiers') {
        out[i] = level;
        continue;
      }
      const rank =
        order === 'sweep'
          ? (x - box.x0) / span
          : order === 'core'
            ? 1 - Math.min(1, -d / Math.max(1, depth))
            : Math.min(1, -d / Math.max(1, depth));
      out[i] = Math.min(1, Math.max(0, (level * (1 + BAND) - rank) / BAND));
    }
  }
  return inside;
}

/**
 * A mark held as a signed distance field and printed through the Bayer
 * tiers. The level walks the 65 tiers of the 8 by 8 screen (17 of the
 * 4 by 4), and because the tiers nest, every step up lights cells and
 * every step down drops them without moving any other cell.
 */
export default function MarkTiersDemo() {
  const reduced = useReducedMotion();
  const theme = useTheme();
  const [mark, setMark] = useState<MarkId>('gt');
  const [order, setOrder] = useState<Order>('tiers');
  const [screen, setScreen] = useState<MarkScreen>('bayer8');
  const [cellPx, setCellPx] = useState(3);
  const [level, setLevel] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [art, setArt] = useState<{ id: MarkId; art: MarkArt } | null>(null);

  const canvas = useRef<HTMLCanvasElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const widest = useRef<HTMLSpanElement>(null);
  const size = useBox();
  const cache = useRef<{ key: string; shape: CellShape } | null>(null);
  const clock = useRef({ t: RESOLVE_S, last: 0 });

  useLayoutWork(
    () => {
      let live = true;
      loadMark(mark)
        .then((next) => {
          if (live) setArt({ id: mark, art: next });
        })
        .catch(() => {
          if (live && readout.current) readout.current.textContent = 'The mark could not be loaded.';
        });
      return () => {
        live = false;
      };
    },
    { dependencies: [mark], revertOnUpdate: true }
  );

  const tiers = screen === 'bayer8' ? 64 : 16;

  useLayoutWork(
    () => {
      const el = canvas.current;
      if (!el || !art || art.id !== mark || size.w < 40 || size.h < 40) return;
      const cell = snapCell(cellPx);
      const cols = Math.floor(size.w / cell);
      const rows = Math.floor(size.h / cell);
      const key = `${mark}|${cols}x${rows}`;
      if (cache.current?.key !== key) cache.current = { key, shape: markShape(art.art, cols, rows) };
      const tone = new Float32Array(cols * rows);
      /* the level snaps to the screen's tiers, so the readout counts real steps */
      const tier = Math.round(level * tiers);
      const inside = markTone(cache.current.shape, order, tier / tiers, tone);
      const index = new Uint8Array(cols * rows);
      const lit = screenTone(screen, tone, cols, rows, index, cols, 0, 0);
      const surface = surfaceFor(el, cols, rows, cell);
      if (!surface) return;
      const paper = packColor(readVar(el, '--pt-paper', 'rgb(255, 255, 255)'));
      const ink = packColor(readVar(el, '--pt-ink', 'rgb(7, 7, 7)'));
      blit(surface, index, new Uint32Array([paper, ink]));
      const all = inside.toLocaleString('en-US');
      if (readout.current) {
        readout.current.textContent = `Level ${tier} of ${tiers}: ${lit.toLocaleString('en-US')} of the mark's ${all} cells print ink.`;
      }
      /* the sentence at its widest, every cell lit, holds the readout's height while the level plays */
      if (widest.current) widest.current.textContent = `Level ${tiers} of ${tiers}: ${all} of the mark's ${all} cells print ink.`;
    },
    { dependencies: [size.w, size.h, art, mark, order, screen, cellPx, level, tiers, theme] }
  );

  useFrameLoop(
    size.el,
    (now) => {
      const c = clock.current;
      const dt = c.last ? Math.min(0.1, (now - c.last) / 1000) : 0;
      c.last = now;
      c.t += dt;
      setLevel(levelAt(c.t));
    },
    playing
  );

  return (
    <Plate
      controls={
        <>
          <Choice label='Mark' options={MARKS} value={mark} onChange={setMark} />
          <Choice label='Order' options={ORDERS} value={order} onChange={setOrder} />
          <Choice
            label='Screen'
            options={[
              { value: 'bayer8', label: '8 by 8' },
              { value: 'bayer4', label: '4 by 4' },
            ]}
            value={screen}
            onChange={setScreen}
          />
          <Choice
            label='Cell'
            options={[
              { value: '2', label: '2px' },
              { value: '3', label: '3px' },
              { value: '4', label: '4px' },
              { value: '6', label: '6px' },
            ]}
            value={String(cellPx)}
            onChange={(v) => setCellPx(Number(v))}
          />
          <Range
            format={(v) => `${Math.round(v * tiers)} of ${tiers}`}
            label='Level'
            max={1}
            min={0}
            step={1 / tiers}
            value={level}
            onChange={(v) => {
              setPlaying(false);
              setLevel(v);
            }}
          />
          <div className='dmo-field'>
            <span className='dmo-field-label'>Motion</span>
            <Toggle
              disabled={reduced}
              label='Play'
              pressed={playing && !reduced}
              onChange={(on) => {
                if (on) clock.current = { t: RESOLVE_S, last: 0 };
                setPlaying(on);
              }}
            />
          </div>
          <p className='dmo-bar-status dl-status dmo-held'>
            <span ref={readout} />
            <span aria-hidden='true' className='dmo-held-ghost' ref={widest} />
          </p>
        </>
      }
      height={340}
      label={`The ${MARK_LABELS[mark] ?? mark} printed through the Bayer tiers`}
      lazy
      moves
      phoneHeight={240}
      tag={`markShape(loadMark('${mark}'))`}
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
