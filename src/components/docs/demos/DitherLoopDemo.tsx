'use client';

import { useRef, useState } from 'react';
import type { RefObject } from 'react';

import {
  createDitherLoop,
  globe,
  gradientRamp,
  makeGlyphField,
  multiplyFields,
  radialBurst,
  streakBands,
  type DitherLoopHandle,
  type FieldFn,
} from '@/lib/dither';
import { useLayoutWork } from '@/lib/use-layout-work';

import { Choice, Range, Toggle } from './controls';
import { readToken, useReducedMotion, useTheme } from './hooks';
import Plate from './Plate';

type FieldName = 'burst' | 'globe' | 'bands' | 'ramp' | 'type';

const FIELDS: readonly { value: FieldName; label: string }[] = [
  { value: 'burst', label: 'Burst' },
  { value: 'globe', label: 'Globe' },
  { value: 'bands', label: 'Bands' },
  { value: 'ramp', label: 'Ramp' },
  { value: 'type', label: 'Type' },
];

/** The call each field is built from, printed in the stage's corner. */
const CALLS: Record<FieldName, string> = {
  burst: 'radialBurst()',
  globe: 'globe()',
  bands: 'streakBands()',
  ramp: 'gradientRamp()',
  type: "makeGlyphField({ text: '語' })",
};

type Look = { scale: number; bias: number; gamma: number; speed: number; invert: boolean };

/**
 * One field factory at the stage's aspect. The type field is a signed
 * distance field of one letterform in the page's own face, multiplied by a
 * slow ramp so the dithered fringe moves.
 */
function makeField(name: FieldName, aspect: number, family: string): FieldFn {
  if (name === 'burst') return radialBurst({ aspect, spokes: 13 });
  if (name === 'globe') return globe({ aspect, radius: 0.4 });
  if (name === 'bands')
    return multiplyFields(
      streakBands({ bands: 18, duty: 0.4, waviness: 0.13, taper: 0.5 }),
      gradientRamp({ angle: Math.PI / 2, from: 0.15, to: 0.95, smooth: true })
    );
  if (name === 'ramp') return gradientRamp({ angle: 0, from: 0, to: 1, wobble: 0.08, speed: 0.4 });
  const glyph = makeGlyphField({ text: '語', font: `500 {size}px ${family}`, mode: 'glow', aspect, glowRadius: 48 });
  return multiplyFields(glyph, gradientRamp({ angle: Math.PI / 4, from: 0.55, to: 1, wobble: 0.2, speed: 0.6 }));
}

type StageProps = {
  field: FieldName;
  look: Look;
  still: boolean;
  handle: RefObject<DitherLoopHandle | null>;
};

function DitherStage({ field, look, still, handle }: StageProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();

  useLayoutWork(
    () => {
      const el = canvas.current;
      if (!el) return;
      const aspect = () => Math.max(0.2, el.clientWidth / Math.max(1, el.clientHeight));
      const family = getComputedStyle(el).fontFamily;
      const loop = createDitherLoop(el, makeField(field, aspect(), family), {
        ...look,
        ink: readToken(el, '--dmo-ink', 'rgb(7, 7, 7)'),
        paper: 'transparent',
        fps: 30,
      });
      handle.current = loop;
      if (still) {
        loop.stop();
        loop.render(0);
      }
      /* the factories take the aspect at construction, so a resize rebuilds the field */
      let last = aspect();
      const resize = new ResizeObserver(() => {
        const next = aspect();
        if (Math.abs(next - last) < 0.02) return;
        last = next;
        loop.setField(makeField(field, next, family));
      });
      resize.observe(el);
      return () => {
        resize.disconnect();
        loop.destroy();
        if (handle.current === loop) handle.current = null;
      };
    },
    { dependencies: [field], revertOnUpdate: true }
  );

  /* the ink is the page's: re-read it whenever html[data-theme] flips */
  useLayoutWork(
    () => {
      const el = canvas.current;
      if (el) handle.current?.setOptions({ ink: readToken(el, '--dmo-ink', 'rgb(7, 7, 7)') });
    },
    { dependencies: [theme] }
  );

  return <canvas aria-hidden='true' className='dmo-fill' ref={canvas} />;
}

/**
 * The CPU dither loop, live: five field factories through one 8x8 ordered
 * screen, with the loop's options on the controls. Cell size, bias, gamma,
 * speed and invert go through setOptions on the running loop; a field
 * change swaps the field. The ink is the docs theme's, re-read on a theme
 * flip, over a transparent paper.
 */
export default function DitherLoopDemo() {
  const reduced = useReducedMotion();
  const handle = useRef<DitherLoopHandle | null>(null);
  const [field, setField] = useState<FieldName>('globe');
  const [look, setLook] = useState<Look>({ scale: 3, bias: 0, gamma: 1, speed: 1, invert: false });
  const [still, setStill] = useState(false);

  const set = (patch: Partial<Look>) => {
    setLook((prev) => ({ ...prev, ...patch }));
    handle.current?.setOptions(patch);
  };

  const hold = (on: boolean) => {
    setStill(on);
    const loop = handle.current;
    if (!loop) return;
    if (on) {
      loop.stop();
      loop.render(0);
    } else {
      loop.start();
    }
  };

  return (
    <Plate
      controls={
        <>
          <Choice label='Field' options={FIELDS} value={field} onChange={setField} />
          <Choice
            label='Cell'
            options={[
              { value: '2', label: '2px' },
              { value: '3', label: '3px' },
              { value: '4', label: '4px' },
              { value: '6', label: '6px' },
            ]}
            value={String(look.scale)}
            onChange={(v) => set({ scale: Number(v) })}
          />
          <Range
            format={(v) => (v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2))}
            label='Bias'
            max={0.4}
            min={-0.4}
            step={0.01}
            value={look.bias}
            onChange={(bias) => set({ bias })}
          />
          <Range
            format={(v) => v.toFixed(2)}
            label='Gamma'
            max={2.5}
            min={0.4}
            step={0.05}
            value={look.gamma}
            onChange={(gamma) => set({ gamma })}
          />
          <Range
            format={(v) => `${v.toFixed(2)}x`}
            label='Speed'
            max={3}
            min={0}
            step={0.25}
            value={look.speed}
            onChange={(speed) => set({ speed })}
          />
          <Toggle label='Invert' pressed={look.invert} onChange={(invert) => set({ invert })} />
          <Toggle
            disabled={reduced}
            label='Still'
            pressed={still || reduced}
            title='Show the frame a reader with reduced motion sees'
            onChange={hold}
          />
        </>
      }
      height={320}
      label={`The dither loop drawing the ${field} field`}
      lazy
      moves
      phoneHeight={240}
      tag={`createDitherLoop(canvas, ${CALLS[field]})`}
    >
      <DitherStage field={field} handle={handle} look={look} still={still} />
    </Plate>
  );
}
