'use client';

import { useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';

import { loadPictureTone, type PictureFrame, type PictureTone } from '@/components/plate/lib/picture-field';
import { useLayoutWork } from '@/lib/use-layout-work';

import { Choice, Range } from '../controls';
import { useArmed, useTheme } from '../hooks';
import Plate from '../Plate';
import { screenPicture, useMoodPick } from './mood-pick';
import { MOOD_THEMES, fileRect } from './pictures';

import './artifacts.css';

const ZOOMS = [
  { value: '1', label: '1x' },
  { value: '4', label: '4x' },
  { value: '8', label: '8x' },
] as const;

/**
 * The tone grid and its screen at one framing, split by a seam. Left of
 * the seam is the grid as the cutter wrote it, an 8-bit gray JPEG drawn at
 * the theme's opacity (inverted in the light theme, where a lit cell is
 * ink on paper); right of it is the same grid screened at 1 CSS px cells.
 * Drag across the stage or use the Seam control to move the seam, and
 * zoom to see the cells. Both layers zoom about the stage's centre inside
 * one clip, so the seam stays where the pointer put it.
 */
export default function MoodCompareDemo() {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const armed = useArmed(box);
  const theme = useTheme();
  const spec = MOOD_THEMES[theme];
  const { entry, controls } = useMoodPick({ set: 'deck', name: 'earth' });
  const [zoom, setZoom] = useState(1);
  const [seam, setSeam] = useState(50);
  const [rect, setRect] = useState<PictureFrame | null>(null);
  const dragging = useRef(false);

  useLayoutWork(
    () => {
      const el = canvas.current;
      const host = box.current;
      if (!el || !host || !armed) return;
      let alive = true;
      let tone: PictureTone | null = null;
      const draw = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        if (w < 2 || h < 2) return;
        setRect(fileRect(entry, w, h));
        if (tone) screenPicture(el, tone, entry, w, h, 1, spec.ink);
      };
      loadPictureTone(entry.src).then(
        (grid) => {
          if (!alive) return;
          tone = grid;
          draw();
        },
        () => {
          /* the gray grid still shows on the left */
        }
      );
      draw();
      const resize = new ResizeObserver(draw);
      resize.observe(host);
      return () => {
        alive = false;
        resize.disconnect();
      };
    },
    { dependencies: [armed, entry.key, spec.ink], revertOnUpdate: true }
  );

  const seamAt = (event: PointerEvent<HTMLDivElement>) => {
    const r = event.currentTarget.getBoundingClientRect();
    if (r.width < 1) return;
    setSeam(Math.round(Math.min(100, Math.max(0, ((event.clientX - r.left) / r.width) * 100))));
  };

  const zoomStyle: CSSProperties = { '--art-zoom': zoom };
  const gridStyle: CSSProperties | undefined = rect
    ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
    : undefined;

  return (
    <Plate
      controls={
        <>
          <p className='dmo-bar-note'>
            <span className='dmo-art-caption-title'>{entry.title}</span> {entry.credit}
          </p>
          {controls}
          <Choice label='Zoom' options={ZOOMS} value={String(zoom)} onChange={(v) => setZoom(Number(v))} />
          <Range format={(v) => `${v}%`} label='Seam' max={100} min={0} step={1} value={seam} onChange={setSeam} />
        </>
      }
      height={400}
      label={`${entry.title}: the tone grid left of the seam, the screened picture right of it`}
      phoneHeight={240}
      tag='loadPictureTone(src), then pictureField()'
    >
      <div
        className='dmo-art-cmp'
        ref={box}
        style={{ '--art-seam': `${seam}%`, ...zoomStyle }}
        onPointerDown={(event) => {
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          seamAt(event);
        }}
        onPointerMove={(event) => {
          if (dragging.current) seamAt(event);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        <div className='dmo-art-cmp-layer'>
          <div className='dmo-art-zoom'>
            {armed && gridStyle ? (
              <img
                alt=''
                className={`dmo-art-grid is-${theme}`}
                decoding='async'
                height={entry.height}
                loading='lazy'
                src={entry.src}
                style={gridStyle}
                width={entry.width}
              />
            ) : null}
          </div>
        </div>
        <div className='dmo-art-cmp-layer is-after'>
          <div className='dmo-art-zoom'>
            <canvas aria-hidden='true' className={`dmo-art-canvas is-${theme}`} ref={canvas} />
          </div>
        </div>
        <span aria-hidden='true' className='dmo-art-cmp-seam' />
        <span aria-hidden='true' className='dmo-art-chip is-left'>
          Tone grid
        </span>
        <span aria-hidden='true' className='dmo-art-chip is-right'>
          Screened
        </span>
      </div>
    </Plate>
  );
}
