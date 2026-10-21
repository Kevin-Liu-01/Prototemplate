'use client';

import { useRef, useState } from 'react';
import type { RefObject } from 'react';

import {
  BAYER_DEFAULT_ID,
  BAYER_PRESETS,
  STUDIO_PRESETS,
  createStudioField,
  type StudioFieldHandle,
  type StudioParams,
  type StudioPreset,
} from '@/lib/studio-field';
import { useLayoutWork } from '@/lib/use-layout-work';

import { Choice, Range, Toggle } from './controls';
import { useReducedMotion } from './hooks';
import Plate from './Plate';

type Tune = Pick<StudioParams, 'grain' | 'strength' | 'rotation' | 'brightness'>;

function tuneOf(preset: StudioPreset): Tune {
  const { grain, strength, rotation, brightness } = STUDIO_PRESETS[preset];
  return { grain, strength, rotation, brightness };
}

type StageProps = {
  preset: StudioPreset;
  speed: number;
  tune: Tune;
  still: boolean;
  handle: RefObject<StudioFieldHandle | null>;
};

/** The canvas and its engine. A preset or speed change remounts the engine on the shared GL context. */
function StudioStage({ preset, speed, tune, still, handle }: StageProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useLayoutWork(
    () => {
      const el = canvas.current;
      if (!el) return;
      const field = createStudioField(el, { preset, speed, params: tune });
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
    { dependencies: [preset, speed], revertOnUpdate: true }
  );
  return <canvas aria-hidden='true' className='dmo-fill' ref={canvas} />;
}

/**
 * The studio field, live: the ten BAYER_PRESETS on the one shared WebGL
 * context. Grain, strength, rotation and brightness go to the running
 * engine through setParams; a preset or speed change is a remount, the
 * house pattern. Still pauses the engine and renders its static frame,
 * which is what a reader with reduced motion sees.
 */
export default function StudioFieldDemo({ compact = false }: { compact?: boolean }) {
  const reduced = useReducedMotion();
  const handle = useRef<StudioFieldHandle | null>(null);
  const [id, setId] = useState(BAYER_DEFAULT_ID);
  const variant = BAYER_PRESETS.find((v) => v.id === id) ?? BAYER_PRESETS[0];
  const preset: StudioPreset = variant?.preset ?? 'bayer8';
  const [tune, setTune] = useState<Tune>(() => tuneOf(preset));
  const [speed, setSpeed] = useState(1);
  const [still, setStill] = useState(false);

  const pick = (next: string) => {
    const v = BAYER_PRESETS.find((entry) => entry.id === next);
    if (!v) return;
    setId(next);
    setTune(tuneOf(v.preset));
  };

  const set = (patch: Partial<Tune>) => {
    setTune((prev) => ({ ...prev, ...patch }));
    handle.current?.setParams(patch);
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

  const options = BAYER_PRESETS.map((v) => ({ value: v.id, label: v.id }));

  return (
    <Plate
      controls={
        <>
          <Choice label={`Preset: ${variant?.name ?? ''}`} options={options} value={id} onChange={pick} />
          {compact ? null : (
            <>
              <Range label='Grain' max={96} min={4} step={1} value={tune.grain} onChange={(grain) => set({ grain })} />
              <Range
                format={(v) => v.toFixed(2)}
                label='Strength'
                max={1.2}
                min={0}
                step={0.01}
                value={tune.strength}
                onChange={(strength) => set({ strength })}
              />
              <Range
                format={(v) => `${v}°`}
                label='Rotation'
                max={180}
                min={-180}
                step={1}
                value={tune.rotation}
                onChange={(rotation) => set({ rotation })}
              />
              <Range
                format={(v) => `${v.toFixed(2)}x`}
                label='Speed'
                max={3}
                min={0.25}
                step={0.25}
                value={speed}
                onChange={setSpeed}
              />
            </>
          )}
          <Toggle
            disabled={reduced}
            label='Still'
            pressed={still || reduced}
            title='Show the frame a reader with reduced motion sees'
            onChange={hold}
          />
        </>
      }
      height={compact ? 260 : 320}
      label={`The studio field running preset ${variant?.id ?? ''}, ${variant?.name ?? ''}`}
      lazy
      moves
      night
      phoneHeight={220}
      tag={`createStudioField({ preset: '${preset}' })`}
    >
      <StudioStage handle={handle} preset={preset} speed={speed} still={still} tune={tune} />
    </Plate>
  );
}
