'use client';

import { useRef, useState } from 'react';

import { useLayoutWork } from '@/lib/use-layout-work';

import { Choice, Range } from '../controls';
import { useTheme } from '../hooks';
import Plate from '../Plate';
import { useBox, usePictureSource, type PictureSource } from './hooks';
import { PALETTE_OPTIONS, blit, packColor, readPalette, readVar, snapCell, surfaceFor, type Palette } from './raster';
import { SCREEN_LABELS, SCREEN_ORDER, curve, screenTone, type ScreenId } from './screens';
import { creditFor, fillTone } from './sources';
import { DropZone, SourcePicker, SourceStatus } from './SourcePicker';

import './dither-lab.css';

type Layout = {
  cell: number;
  tilesX: number;
  tilesY: number;
  tileW: number;
  tileH: number;
  gap: number;
  labelH: number;
  bufW: number;
  bufH: number;
};

/** Eight tiles in a 4 by 2 grid, or 2 by 4 under 560px, each with a label strip under it. */
function layoutFor(w: number, h: number, cellPx: number): Layout | null {
  if (w < 60 || h < 60) return null;
  const cell = snapCell(cellPx);
  const tilesX = w >= 560 ? 4 : 2;
  const tilesY = SCREEN_ORDER.length / tilesX;
  const gap = Math.ceil(12 / cell);
  const labelH = Math.ceil(26 / cell);
  const cols = Math.floor(w / cell);
  const rows = Math.floor(h / cell);
  const tileW = Math.floor((cols - gap * (tilesX - 1)) / tilesX);
  const tileH = Math.floor((rows - labelH * tilesY - gap * (tilesY - 1)) / tilesY);
  if (tileW < 8 || tileH < 8) return null;
  return {
    cell,
    tilesX,
    tilesY,
    tileW,
    tileH,
    gap,
    labelH,
    bufW: tileW * tilesX + gap * (tilesX - 1),
    bufH: (tileH + labelH) * tilesY + gap * (tilesY - 1),
  };
}

type Label = { id: ScreenId; left: number; top: number; width: number; lit: number };

type StageProps = {
  source: PictureSource;
  cellPx: number;
  threshold: number;
  gamma: number;
  palette: Palette;
  onMean: (mean: number) => void;
};

function BenchStage({ source, cellPx, threshold, gamma, palette, onMean }: StageProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const size = useBox();
  const theme = useTheme();
  const [labels, setLabels] = useState<Label[]>([]);
  const cache = useRef<{ key: string; tone: Float32Array } | null>(null);

  useLayoutWork(
    () => {
      const el = canvas.current;
      const loaded = source.loaded;
      const layout = layoutFor(size.w, size.h, cellPx);
      if (!el || !loaded || !layout) return;
      const { cell, tilesX, tileW, tileH, gap, labelH, bufW, bufH } = layout;

      const key = `${loaded.id}|${source.fileName ?? ''}|${tileW}x${tileH}|${cell}`;
      if (cache.current?.key !== key) {
        cache.current = { key, tone: fillTone(loaded, tileW, tileH, cell, new Float32Array(tileW * tileH)) };
      }
      const { tone } = cache.current;
      const bias = 0.5 - threshold;

      const index = new Uint8Array(bufW * bufH).fill(2);
      const next: Label[] = [];
      SCREEN_ORDER.forEach((id, i) => {
        const tx = i % tilesX;
        const ty = Math.floor(i / tilesX);
        const ox = tx * (tileW + gap);
        const oy = ty * (tileH + labelH + gap);
        const lit = screenTone(id, tone, tileW, tileH, index, bufW, ox, oy, { gamma, bias });
        next.push({ id, left: ox * cell, top: (oy + tileH) * cell, width: tileW * cell, lit: lit / (tileW * tileH) });
      });

      let sum = 0;
      for (let i = 0; i < tone.length; i++) sum += Math.min(1, Math.max(0, curve(tone[i] ?? 0, gamma, bias)));
      onMean(sum / tone.length);

      const surface = surfaceFor(el, bufW, bufH, cell);
      if (!surface) return;
      const { ink, paper } = readPalette(el, palette);
      const ground = readVar(el, '--pt-paper', 'rgb(255, 255, 255)');
      blit(surface, index, new Uint32Array([packColor(paper), packColor(ink), packColor(ground)]));
      setLabels(next);
    },
    { dependencies: [size.w, size.h, cellPx, threshold, gamma, palette, theme, source.loaded, source.fileName] }
  );

  return (
    <DropZone className='dl-box' onFile={source.open}>
      <div className='dl-fill' ref={size.ref}>
        <div className='dl-frame'>
          <canvas aria-hidden='true' className='dl-canvas' ref={canvas} />
          {labels.map((label) => (
            <p className='dl-label' key={label.id} style={{ left: label.left, top: label.top, width: label.width }}>
              <span>{SCREEN_LABELS[label.id]}</span>
              <span className='dl-num'>{(label.lit * 100).toFixed(1)}%</span>
            </p>
          ))}
        </div>
      </div>
    </DropZone>
  );
}

/**
 * One source through eight screens at once: a plain threshold, the three
 * Bayer matrices, a white-noise threshold, Floyd-Steinberg, Atkinson and a
 * 45 degree halftone. Each tile prints the share of its cells in ink, so
 * the reader can see which screens keep the source's mean tone.
 */
export default function ScreenBenchDemo() {
  const source = usePictureSource('earth');
  const [cellPx, setCellPx] = useState(2);
  const [threshold, setThreshold] = useState(0.5);
  const [gamma, setGamma] = useState(1);
  const [palette, setPalette] = useState<Palette>('theme');
  const [mean, setMean] = useState<number | null>(null);

  const credit = creditFor(source.id, source.fileName ?? undefined);
  const status = mean === null ? credit : `${credit} Mean tone after the curve: ${(mean * 100).toFixed(1)}%.`;

  return (
    <Plate
      controls={
        <>
          <SourcePicker source={source} />
          <Choice
            label='Cell'
            options={[
              { value: '1', label: '1px' },
              { value: '2', label: '2px' },
              { value: '3', label: '3px' },
              { value: '4', label: '4px' },
            ]}
            value={String(cellPx)}
            onChange={(v) => setCellPx(Number(v))}
          />
          <Range
            format={(v) => v.toFixed(2)}
            label='Threshold'
            max={0.8}
            min={0.2}
            step={0.01}
            value={threshold}
            onChange={setThreshold}
          />
          <Range format={(v) => v.toFixed(2)} label='Gamma' max={2.5} min={0.4} step={0.05} value={gamma} onChange={setGamma} />
          <Choice label='Ink' options={PALETTE_OPTIONS} value={palette} onChange={setPalette} />
          <SourceStatus error={source.error} text={status} />
        </>
      }
      height={460}
      label='One source screened eight ways, side by side'
      lazy
      phoneHeight={660}
      tag='screenTone(id, tone, w, h)'
    >
      <BenchStage cellPx={cellPx} gamma={gamma} palette={palette} source={source} threshold={threshold} onMean={setMean} />
    </Plate>
  );
}
