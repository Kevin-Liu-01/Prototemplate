'use client';

import { useState } from 'react';

import { Sheet, SHEET_PAD, fitSheet } from '@/components/viewer/Sheet';
import { pad2 } from '@/lib/shell-data';

import { Action, Choice, Range, Toggle } from '../controls';
import Plate from '../Plate';
import ModelShell from './ModelShell';
import ScaledModel from './ScaledModel';
import { SlideBody } from './StageContent';
import { GRID_ITEMS } from './ViewerGrid';

import './shells.css';

type Win = 'wide' | 'narrow';

/**
 * The fixed sheet close up: the live Sheet and SheetFrame on a stage of
 * the size the sliders give, inside the two contexts ViewerShell would
 * publish. fitSheet() places the sheet, and the readout prints its answer.
 * A click on either half of the sheet pages it, as on a paged route.
 */
export default function SheetDemo() {
  const [width, setWidth] = useState(1232);
  const [height, setHeight] = useState(846);
  const [win, setWin] = useState<Win>('wide');
  const [frame, setFrame] = useState(true);
  const [present, setPresent] = useState(false);
  const [index, setIndex] = useState(0);

  const narrow = win === 'narrow';
  const pad = present ? SHEET_PAD.present : narrow ? SHEET_PAD.narrow : SHEET_PAD.wide;
  const fit = fitSheet({ aw: width, ah: height, w: 1600, h: 900, pad });
  const top = narrow && !present ? pad : fit.top;
  const step = (delta: number) => setIndex((i) => Math.max(0, Math.min(GRID_ITEMS.length - 1, i + delta)));
  const status = `Scale ${fit.scale.toFixed(3)}: a ${fit.width} × ${fit.height} sheet on a ${width} × ${height} stage, with a ${pad}px pad.`;

  return (
    <Plate
      controls={
        <>
          <Range format={(v) => `${v}px`} label='Stage width' max={1720} min={360} step={2} value={width} onChange={setWidth} />
          <Range format={(v) => `${v}px`} label='Stage height' max={1000} min={300} step={2} value={height} onChange={setHeight} />
          <Choice
            label='Window'
            options={[
              { value: 'wide', label: 'Wide' },
              { value: 'narrow', label: 'Narrow' },
            ]}
            value={win}
            onChange={setWin}
          />
          <Toggle label='Frame' pressed={frame} onChange={setFrame} />
          <Toggle label='Present' pressed={present} onChange={setPresent} />
          <Action disabled={index === 0} onClick={() => step(-1)}>
            Previous
          </Action>
          <Action disabled={index === GRID_ITEMS.length - 1} onClick={() => step(1)}>
            Next
          </Action>
          <p aria-live='polite' className='dmo-bar-status'>
            {status}
          </p>
        </>
      }
      fit
      label={`The fixed sheet on a ${width} by ${height} stage. ${status}`}
      stageClassName='dmo-lay-stage'
      tag={`fitSheet() · ${fit.scale.toFixed(3)}`}
    >
      <ScaledModel className={narrow ? 'dmo-lay-sheet is-narrow' : 'dmo-lay-sheet'} height={height} maxHeight={480} width={width}>
        <ModelShell
          index={index}
          items={GRID_ITEMS}
          mode='slide'
          narrow={narrow}
          present={present}
          stage={{ width, height }}
          onStep={step}
        >
          <Sheet frame={frame} variant='fixed'>
            <SlideBody item={GRID_ITEMS[index]} />
          </Sheet>
        </ModelShell>
      </ScaledModel>
      <dl className='dmo-lay-readout' aria-label='What fitSheet returns for this stage'>
        <div>
          <dt>Scale</dt>
          <dd>{fit.scale.toFixed(4)}</dd>
        </div>
        <div>
          <dt>Sheet</dt>
          <dd>{`${fit.width} × ${fit.height}px`}</dd>
        </div>
        <div>
          <dt>Border box at</dt>
          <dd>{`${fit.left}, ${top}`}</dd>
        </div>
        <div>
          <dt>Pad</dt>
          <dd>{`${pad}px`}</dd>
        </div>
        <div>
          <dt>Item</dt>
          <dd>{`${pad2(index + 1)} / ${pad2(GRID_ITEMS.length)}`}</dd>
        </div>
      </dl>
    </Plate>
  );
}
