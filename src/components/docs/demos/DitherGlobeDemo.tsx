'use client';

import { useRef, useState } from 'react';
import type { RefObject } from 'react';

import { createDitherLoop, globe, type DitherLoopHandle, type GlobeOptions } from '@/lib/dither';
import { useLayoutWork } from '@/lib/use-layout-work';

import { Choice, Range, Toggle } from './controls';
import { readToken, useReducedMotion, useTheme } from './hooks';
import Plate from './Plate';

type Look = 'field' | 'signin';

type Shape = Required<Pick<GlobeOptions, 'graticule' | 'landmass' | 'spin' | 'tilt' | 'meridians' | 'ambient' | 'rim'>>;

/* DitherGlobe's look on the Dither field direction, and the sign-in plate's (FieldStack.tsx) */
const LOOKS: Record<Look, { shape: Shape; scale: number; gamma: number; fps: number; token: string }> = {
  field: {
    shape: { graticule: 0.3, landmass: 0.22, spin: 0.18, tilt: 0.41, meridians: 12, ambient: 0.08, rim: 0.22 },
    scale: 3,
    gamma: 1,
    fps: 30,
    token: '--dmo-ink',
  },
  signin: {
    shape: { graticule: 0, landmass: 0.42, spin: 0.14, tilt: 0.41, meridians: 12, ambient: 0.14, rim: 0.16 },
    scale: 2,
    gamma: 1.15,
    fps: 24,
    token: '--dmo-signin',
  },
};

const DEG = Math.PI / 180;

/** A square box in the middle of the stage keeps the sphere round at any width. */
function GlobeStage({
  look,
  shape,
  scale,
  still,
  handle,
}: {
  look: Look;
  shape: Shape;
  scale: number;
  still: boolean;
  handle: RefObject<DitherLoopHandle | null>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const spec = LOOKS[look];

  useLayoutWork(
    () => {
      const el = canvas.current;
      if (!el) return;
      const loop = createDitherLoop(el, globe({ ...shape, radius: look === 'signin' ? 0.44 : 0.4 }), {
        scale,
        gamma: spec.gamma,
        fps: spec.fps,
        paper: 'transparent',
        ink: readToken(el, spec.token, 'rgb(7, 7, 7)'),
        reducedMotionTime: 8,
      });
      handle.current = loop;
      if (still) {
        loop.stop();
        loop.render(8);
      }
      return () => {
        loop.destroy();
        if (handle.current === loop) handle.current = null;
      };
    },
    { dependencies: [look], revertOnUpdate: true }
  );

  useLayoutWork(
    () => {
      const el = canvas.current;
      if (el) handle.current?.setOptions({ ink: readToken(el, spec.token, 'rgb(7, 7, 7)') });
    },
    { dependencies: [theme] }
  );

  return (
    <div className='dmo-globe-square'>
      <canvas aria-hidden='true' className='dmo-globe-canvas' ref={canvas} />
    </div>
  );
}

/**
 * The dither globe, live: globe() from src/lib/dither.ts, a lambert-shaded
 * sphere with a graticule and a noise landmass, through the 8x8 screen. The
 * sliders rebuild the field and hand it to the running loop with setField,
 * so the spin keeps its clock. Two looks load the field as the Dither field
 * direction and the dashboard's sign-in plate draw it.
 */
export default function DitherGlobeDemo() {
  const reduced = useReducedMotion();
  const handle = useRef<DitherLoopHandle | null>(null);
  const [look, setLook] = useState<Look>('field');
  const [shape, setShape] = useState<Shape>(LOOKS.field.shape);
  const [scale, setScale] = useState(LOOKS.field.scale);
  const [still, setStill] = useState(false);

  const reshape = (patch: Partial<Shape>) => {
    const next = { ...shape, ...patch };
    setShape(next);
    handle.current?.setField(globe({ ...next, radius: look === 'signin' ? 0.44 : 0.4 }));
  };

  const pickLook = (next: Look) => {
    setLook(next);
    setShape(LOOKS[next].shape);
    setScale(LOOKS[next].scale);
  };

  const pickScale = (next: string) => {
    const value = Number(next);
    setScale(value);
    handle.current?.setOptions({ scale: value });
  };

  const hold = (on: boolean) => {
    setStill(on);
    const loop = handle.current;
    if (!loop) return;
    if (on) {
      loop.stop();
      loop.render(8);
    } else {
      loop.start();
    }
  };

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Look'
            options={[
              { value: 'field', label: 'Dither field' },
              { value: 'signin', label: 'Sign-in' },
            ]}
            value={look}
            onChange={pickLook}
          />
          <Choice
            label='Cell'
            options={[
              { value: '2', label: '2px' },
              { value: '3', label: '3px' },
              { value: '4', label: '4px' },
            ]}
            value={String(scale)}
            onChange={pickScale}
          />
          <Range format={(v) => v.toFixed(2)} label='Graticule' max={1} min={0} step={0.05} value={shape.graticule} onChange={(graticule) => reshape({ graticule })} />
          <Range format={(v) => v.toFixed(2)} label='Landmass' max={0.7} min={0} step={0.02} value={shape.landmass} onChange={(landmass) => reshape({ landmass })} />
          <Range
            format={(v) => `${v.toFixed(2)} rad/s`}
            label='Spin'
            max={0.6}
            min={-0.6}
            step={0.02}
            value={shape.spin}
            onChange={(spin) => reshape({ spin })}
          />
          <Range
            format={(v) => `${Math.round(v / DEG)}°`}
            label='Tilt'
            max={60 * DEG}
            min={0}
            step={DEG}
            value={shape.tilt}
            onChange={(tilt) => reshape({ tilt })}
          />
          <Choice
            label='Meridians'
            options={[
              { value: '6', label: '6' },
              { value: '12', label: '12' },
              { value: '18', label: '18' },
            ]}
            value={String(shape.meridians)}
            onChange={(v) => reshape({ meridians: Number(v) })}
          />
          <Toggle
            disabled={reduced}
            label='Still'
            pressed={still || reduced}
            title='Show the frame a reader with reduced motion sees'
            onChange={hold}
          />
        </>
      }
      height={340}
      label={`The dithered globe field in the ${look === 'signin' ? 'sign-in' : 'Dither field'} look`}
      lazy
      moves
      phoneHeight={280}
      stageClassName='dmo-globe'
      tag={`createDitherLoop(canvas, globe({ graticule: ${shape.graticule.toFixed(2)} }))`}
    >
      <GlobeStage handle={handle} look={look} scale={scale} shape={shape} still={still} />
    </Plate>
  );
}
