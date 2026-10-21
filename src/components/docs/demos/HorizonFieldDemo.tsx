'use client';

import { useRef, useState } from 'react';
import type { RefObject } from 'react';

import {
  HORIZON_DEFAULTS,
  createHorizonField,
  type HorizonEffectMode,
  type HorizonFieldHandle,
  type HorizonParams,
} from '@/lib/horizon-field';
import { useLayoutWork } from '@/lib/use-layout-work';

import { Choice, Range, Toggle } from './controls';
import { useReducedMotion } from './hooks';
import Plate from './Plate';

type Effect = HorizonEffectMode | 'off';
type Tune = Pick<HorizonParams, 'exposure' | 'chroma' | 'doppler' | 'swirl'>;

const MODES: readonly HorizonEffectMode[] = ['lens', 'dither', 'redshift'];

type StageProps = {
  size: number;
  tune: Tune;
  effect: Effect;
  still: boolean;
  handle: RefObject<HorizonFieldHandle | null>;
};

/**
 * The canvas and the engine. The shader draws nothing until it has a
 * center and a radius, so the stage measures its canvas and passes both,
 * again on every resize.
 */
function HorizonStage({ size, tune, effect, still, handle }: StageProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef(size);
  sizeRef.current = size;

  useLayoutWork(() => {
    const el = canvas.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    const field = createHorizonField(el, {
      speed: 0.5,
      /* white rules and rings on the ink plate */
      params: { ...tune, ink: [1, 1, 1] },
      effects: { host, modes: MODES, initial: effect },
    });
    handle.current = field;
    const fit = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 2 || h < 2) return;
      field?.setParams({ center: [w / 2, h / 2], radius: Math.min(w, h) * sizeRef.current });
    };
    fit();
    if (field && still) {
      field.pause();
      field.renderStatic();
    }
    const resize = new ResizeObserver(fit);
    resize.observe(el);
    return () => {
      resize.disconnect();
      field?.destroy();
      if (handle.current === field) handle.current = null;
    };
  });

  /* a new radius share refits the running field */
  useLayoutWork(
    () => {
      const el = canvas.current;
      if (!el || el.clientWidth < 2 || el.clientHeight < 2) return;
      handle.current?.setParams({ radius: Math.min(el.clientWidth, el.clientHeight) * size });
    },
    { dependencies: [size] }
  );

  return <canvas aria-hidden='true' className='dmo-fill' ref={canvas} />;
}

/**
 * The horizon field, live: a purpose-built event-horizon shader in which
 * light bends around a circular rim, the page's ruled lines bow into arcs
 * and a photon ring sits on the horizon. Exposure, chroma, doppler and
 * swirl go to the running engine through setParams. The cursor effects are
 * gravitational: with Lens the pointer is a second body, Dither requantizes
 * the field through the 8x8 screen around the pointer, and Redshift aims
 * the bright flank at it.
 */
export default function HorizonFieldDemo() {
  const reduced = useReducedMotion();
  const handle = useRef<HorizonFieldHandle | null>(null);
  const [size, setSize] = useState(0.3);
  const [tune, setTune] = useState<Tune>({
    exposure: 2.6,
    chroma: HORIZON_DEFAULTS.chroma,
    doppler: HORIZON_DEFAULTS.doppler,
    swirl: HORIZON_DEFAULTS.swirl,
  });
  const [effect, setEffect] = useState<Effect>('lens');
  const [still, setStill] = useState(false);

  const set = (patch: Partial<Tune>) => {
    setTune((prev) => ({ ...prev, ...patch }));
    handle.current?.setParams(patch);
  };

  const pickEffect = (next: Effect) => {
    setEffect(next);
    handle.current?.setEffectMode(next);
  };

  const hold = (on: boolean) => {
    setStill(on);
    const field = handle.current;
    if (!field) return;
    if (on) {
      field.pause();
      field.renderStatic();
    } else {
      field.resume();
    }
  };

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Cursor effect'
            options={[
              { value: 'off', label: 'Off' },
              { value: 'lens', label: 'Lens' },
              { value: 'dither', label: 'Dither' },
              { value: 'redshift', label: 'Redshift' },
            ]}
            value={effect}
            onChange={pickEffect}
          />
          <Range format={(v) => `${Math.round(v * 100)}%`} label='Radius' max={0.42} min={0.14} step={0.01} value={size} onChange={setSize} />
          <Range format={(v) => v.toFixed(1)} label='Exposure' max={5} min={1} step={0.1} value={tune.exposure} onChange={(exposure) => set({ exposure })} />
          <Range format={(v) => v.toFixed(2)} label='Chroma' max={1} min={0} step={0.05} value={tune.chroma} onChange={(chroma) => set({ chroma })} />
          <Range format={(v) => v.toFixed(2)} label='Doppler' max={0.9} min={0} step={0.02} value={tune.doppler} onChange={(doppler) => set({ doppler })} />
          <Range format={(v) => v.toFixed(2)} label='Swirl' max={3} min={0} step={0.05} value={tune.swirl} onChange={(swirl) => set({ swirl })} />
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
      label='The horizon field: light bending around a circular horizon, reacting to the pointer'
      lazy
      moves
      night
      phoneHeight={280}
      stageClassName='dmo-horizon'
      tag={`createHorizonField(canvas, { effects: '${effect}' })`}
    >
      <HorizonStage effect={effect} handle={handle} size={size} still={still} tune={tune} />
    </Plate>
  );
}
