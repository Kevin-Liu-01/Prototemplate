'use client';

import { useRef, useState } from 'react';
import type { RefObject } from 'react';

import {
  PRISMATIC_PRESETS,
  createPrismaticField,
  type PrismaticEffectMode,
  type PrismaticFieldHandle,
} from '@/lib/prismatic-field';
import { useLayoutWork } from '@/lib/use-layout-work';

import { Choice, Range, Toggle } from './controls';
import { useReducedMotion } from './hooks';
import Plate from './Plate';

type Preset = '1' | '2';
type Effect = PrismaticEffectMode | 'off';

const MODES: readonly PrismaticEffectMode[] = ['lens', 'dither', 'chroma'];

type StageProps = {
  preset: Preset;
  exposure: number;
  depth: number;
  effect: Effect;
  still: boolean;
  handle: RefObject<PrismaticFieldHandle | null>;
};

/** The canvas and the engine; the preset is a construction option, so a preset change remounts. */
function PrismaticStage({ preset, exposure, depth, effect, still, handle }: StageProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useLayoutWork(
    () => {
      const el = canvas.current;
      const host = el?.parentElement;
      if (!el || !host) return;
      const field = createPrismaticField(el, {
        preset,
        dpr: 1,
        speed: 0.6,
        params: { exposureScale: exposure, initialDepth: depth },
        effects: { host, modes: MODES, initial: effect },
      });
      handle.current = field;
      if (field && still) {
        field.pause();
        field.renderStatic();
      }
      return () => {
        field?.destroy();
        if (handle.current === field) handle.current = null;
      };
    },
    { dependencies: [preset], revertOnUpdate: true }
  );
  return <canvas aria-hidden='true' className='dmo-fill' ref={canvas} />;
}

/**
 * The prismatic field, live: anisotropic streaks of thin-film spectrum
 * converging on a dark center, preset 1 a wide horizontal burst and preset
 * 2 an arc over a dark core. Exposure scale and depth go to the running engine through
 * setParams; a higher exposure scale is dimmer, which is how the field sits
 * under content. The cursor effects bend the burst around the pointer,
 * requantize it through the Bayer screen, or split its color.
 */
export default function PrismaticFieldDemo() {
  const reduced = useReducedMotion();
  const handle = useRef<PrismaticFieldHandle | null>(null);
  const [preset, setPreset] = useState<Preset>('2');
  const [exposure, setExposure] = useState(4200);
  const [depth, setDepth] = useState(PRISMATIC_PRESETS['2'].initialDepth);
  const [effect, setEffect] = useState<Effect>('dither');
  const [still, setStill] = useState(false);

  const pickPreset = (next: Preset) => {
    setPreset(next);
    setDepth(PRISMATIC_PRESETS[next].initialDepth);
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
            label='Preset'
            options={[
              { value: '1', label: '1 Burst' },
              { value: '2', label: '2 Arc' },
            ]}
            value={preset}
            onChange={pickPreset}
          />
          <Choice
            label='Cursor effect'
            options={[
              { value: 'off', label: 'Off' },
              { value: 'lens', label: 'Lens' },
              { value: 'dither', label: 'Dither' },
              { value: 'chroma', label: 'Chroma' },
            ]}
            value={effect}
            onChange={pickEffect}
          />
          <Range
            label='Exposure scale'
            max={8000}
            min={1200}
            step={100}
            value={exposure}
            onChange={(v) => {
              setExposure(v);
              handle.current?.setParams({ exposureScale: v });
            }}
          />
          <Range
            format={(v) => v.toFixed(2)}
            label='Depth'
            max={4}
            min={0.8}
            step={0.02}
            value={depth}
            onChange={(v) => {
              setDepth(v);
              handle.current?.setParams({ initialDepth: v });
            }}
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
      height={320}
      label={`The prismatic field, preset ${preset}, reacting to the pointer`}
      lazy
      moves
      night
      phoneHeight={260}
      tag={`createPrismaticField(canvas, { preset: '${preset}' })`}
    >
      <PrismaticStage depth={depth} effect={effect} exposure={exposure} handle={handle} key={preset} preset={preset} still={still} />
    </Plate>
  );
}
