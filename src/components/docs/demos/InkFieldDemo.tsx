'use client';

import { useRef, useState } from 'react';

import { createInkField } from '@/app/d/glyph-rain/sections/band/inkField';
import { useLayoutWork } from '@/lib/use-layout-work';

import { Choice } from './controls';
import Plate from './Plate';

type Clearing = 'none' | 'measured';

function InkStage({ clearing }: { clearing: Clearing }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const block = useRef<HTMLDivElement>(null);
  useLayoutWork(() => {
    const el = canvas.current;
    if (!el) return;
    const field = createInkField({
      canvas: el,
      clearing,
      clearEl: clearing === 'measured' ? block.current : null,
      interactive: true,
      displayFamily: getComputedStyle(el).fontFamily,
    });
    return () => field?.destroy();
  });
  return (
    <>
      <canvas aria-hidden='true' className='dmo-fill dmo-ink-canvas' ref={canvas} />
      {clearing === 'measured' ? (
        <div className='dmo-ink-copy' ref={block}>
          <p className='dmo-glyph-head'>Every language, one build</p>
        </div>
      ) : null}
    </>
  );
}

/**
 * The ink field, live and playable: paper glyphs from the same eight
 * scripts rise off an ink ground. Glyphs shiver as the pointer nears and a
 * click bursts the nearest one. With a measured clearing the field keeps
 * the text block's box clear and dithers the clearing's edge.
 */
export default function InkFieldDemo() {
  const [clearing, setClearing] = useState<Clearing>('none');
  return (
    <Plate
      controls={
        <Choice
          label='Clearing'
          options={[
            { value: 'none', label: 'None' },
            { value: 'measured', label: 'Around text' },
          ]}
          value={clearing}
          onChange={setClearing}
        />
      }
      height={300}
      label='The ink field: paper glyphs rising off ink, bursting where the reader clicks'
      lazy
      moves
      night
      phoneHeight={260}
      tag={`createInkField({ interactive: true, clearing: '${clearing}' })`}
    >
      <InkStage clearing={clearing} key={clearing} />
    </Plate>
  );
}
