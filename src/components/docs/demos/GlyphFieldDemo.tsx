'use client';

import { useRef, useState } from 'react';

import { SCRIPTS, createGlyphField } from '@/lib/glyph-field';
import { useLayoutWork } from '@/lib/use-layout-work';

import { Action, Choice } from './controls';
import { useReplay } from './hooks';
import Plate from './Plate';

type Drift = 'fall' | 'rise';
type Copy = 'none' | 'left' | 'top';

type StageProps = {
  drift: Drift;
  copy: Copy;
  scale: number;
  onScript: (index: number) => void;
};

/**
 * The canvas, the copy block the field keeps clear of, and the engine.
 * createGlyphField takes its options once, so every option change is a
 * remount through the parent's key.
 */
function GlyphStage({ drift, copy, scale, onScript }: StageProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const block = useRef<HTMLDivElement>(null);
  const report = useRef(onScript);
  report.current = onScript;

  useLayoutWork(() => {
    const el = canvas.current;
    if (!el) return;
    const style = getComputedStyle(el);
    const field = createGlyphField({
      canvas: el,
      drift,
      copy,
      glyphScale: scale,
      displayFamily: style.fontFamily,
      monoFamily: style.getPropertyValue('--pt-mono').trim() || undefined,
      onScript: (index) => report.current(index),
      copyBottom: () => {
        const box = block.current;
        if (!box || copy !== 'top') return undefined;
        return box.offsetTop + box.offsetHeight;
      },
    });
    return () => field?.destroy();
  });

  return (
    <>
      <canvas aria-hidden='true' className='dmo-fill' ref={canvas} />
      {copy === 'none' ? null : (
        <div className={`dmo-glyph-copy is-${copy}`} ref={block}>
          <p className='dmo-glyph-head'>Ship in every language</p>
          <p className='dmo-glyph-lead'>The field keeps this block clear and rains around it.</p>
        </div>
      )}
    </>
  );
}

/**
 * The glyph field, live: the eight-script rain condensing into the word
 * for language in one script after another. Drift, copy placement and
 * glyph scale are construction options, so each change remounts the
 * engine. The ink is --tc-ink, which the stage sets from the docs theme;
 * the engine re-reads it when html[data-theme] flips.
 */
export default function GlyphFieldDemo() {
  const [drift, setDrift] = useState<Drift>('fall');
  const [copy, setCopy] = useState<Copy>('none');
  const [scale, setScale] = useState('1');
  const [script, setScript] = useState(0);
  const [run, replay] = useReplay();

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Drift'
            options={[
              { value: 'fall', label: 'Fall' },
              { value: 'rise', label: 'Rise' },
            ]}
            value={drift}
            onChange={setDrift}
          />
          <Choice
            label='Copy'
            options={[
              { value: 'none', label: 'None' },
              { value: 'left', label: 'Left' },
              { value: 'top', label: 'Top' },
            ]}
            value={copy}
            onChange={setCopy}
          />
          <Choice
            label='Glyph scale'
            options={[
              { value: '0.75', label: '0.75x' },
              { value: '1', label: '1x' },
              { value: '1.35', label: '1.35x' },
            ]}
            value={scale}
            onChange={setScale}
          />
          <Action onClick={replay}>Replay</Action>
          <p className='dmo-bar-status dmo-held' aria-live='polite'>
            {SCRIPTS.map((sample, i) => (
              <span aria-hidden={i === script ? undefined : true} className={i === script ? undefined : 'dmo-held-ghost'} key={sample.tag}>
                Printing <span lang={sample.lang}>{sample.word}</span> in {sample.script}
              </span>
            ))}
          </p>
        </>
      }
      height={340}
      label='The glyph field condensing into the word for language'
      lazy
      moves
      phoneHeight={300}
      tag={`createGlyphField({ drift: '${drift}', copy: '${copy}' })`}
    >
      <GlyphStage
        copy={copy}
        drift={drift}
        key={`${drift}-${copy}-${scale}-${run}`}
        scale={Number(scale)}
        onScript={setScript}
      />
    </Plate>
  );
}
