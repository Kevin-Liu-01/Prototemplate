'use client';

import { useRef, useState } from 'react';

import { useLayoutWork } from '@/lib/use-layout-work';

import { Range } from '../controls';
import Plate from '../Plate';
import ScaledModel from './ScaledModel';
import ViewerGrid, { GRID_ITEMS } from './ViewerGrid';

import './grids.css';

/* the stage under a 900px-tall window: the toolbar's 52px and the 2px progress line come off */
const STAGE_H = 846;

/**
 * The shell's grid view, live, at a stage width the reader sets: GridView
 * and its stylesheet lay the /brand sections out in auto-fill columns of
 * 300px or more. The plate reads the columns the browser resolved, so the
 * readout is the grid's own answer, not a formula.
 */
export default function GridViewDemo() {
  const root = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(1232);
  const [count, setCount] = useState(GRID_ITEMS.length);
  const [tracks, setTracks] = useState({ n: 0, w: 0 });

  useLayoutWork(
    () => {
      const thumbs = root.current?.querySelector<HTMLElement>('.pt-grid .pt-thumbs');
      if (!thumbs) return;
      const read = () => {
        const list = getComputedStyle(thumbs).gridTemplateColumns.split(' ').filter(Boolean);
        setTracks({ n: list.length, w: Math.round(Number.parseFloat(list[0] ?? '0') * 10) / 10 });
      };
      read();
      const observer = new ResizeObserver(read);
      observer.observe(thumbs);
      return () => observer.disconnect();
    },
    { dependencies: [stage, count], revertOnUpdate: true }
  );

  const status = `${tracks.n} ${tracks.n === 1 ? 'column' : 'columns'} of ${tracks.w}px at a ${stage}px stage.`;

  return (
    <Plate
      controls={
        <>
          <Range format={(v) => `${v}px`} label='Stage width' max={1720} min={360} step={2} value={stage} onChange={setStage} />
          <Range label='Items' max={GRID_ITEMS.length} min={1} step={1} value={count} onChange={setCount} />
          <p aria-live='polite' className='dmo-bar-status'>
            {status}
          </p>
        </>
      }
      fit
      label={`The shell's grid view of the /brand sections at a ${stage}px stage: ${status}`}
      stageClassName='dmo-lay-stage'
      tag='<GridView>'
    >
      <div ref={root}>
        <ScaledModel className='dmo-lay-gv' height={STAGE_H} maxHeight={520} width={stage}>
          <ViewerGrid count={count} active={GRID_ITEMS[0]?.id} />
        </ScaledModel>
      </div>
      <dl className='dmo-lay-readout' aria-label='The grid view at this stage width'>
        <div>
          <dt>Stage</dt>
          <dd>{`${stage} × ${STAGE_H}px`}</dd>
        </div>
        <div>
          <dt>Columns</dt>
          <dd>{`${tracks.n} at ${tracks.w}px`}</dd>
        </div>
        <div>
          <dt>Least column</dt>
          <dd>300px</dd>
        </div>
        <div>
          <dt>Gap</dt>
          <dd>26px</dd>
        </div>
        <div>
          <dt>Padding</dt>
          <dd>22px, 34px, 56px</dd>
        </div>
        <div>
          <dt>Frame</dt>
          <dd>16:9 in --pt-edge</dd>
        </div>
      </dl>
    </Plate>
  );
}
