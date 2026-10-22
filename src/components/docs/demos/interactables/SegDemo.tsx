'use client';

import { useState } from 'react';

import { Seg } from '@/components/viewer/Seg';
import type { SegOption } from '@/components/viewer/Seg';
import type { ShellDensity, ShellMode } from '@/lib/shell-data';
import type { SurfaceSet } from '@/lib/surfaces';

import { Toggle } from '../controls';
import { useReducedMotion } from '../hooks';
import Plate from '../Plate';

import './interactables.css';

/* the toolbar's view seg on a route that offers all three views, as
   modeOptions() in Toolbar.tsx writes it (the plate keeps Toolbar.tsx and
   its search out of this chunk) */
const VIEWS: readonly SegOption<ShellMode>[] = [
  { value: 'slide', label: 'Slides', icon: 'slide', title: 'One at a time, where Escape returns' },
  { value: 'grid', label: 'Grid', icon: 'grid', title: 'Everything as a grid (G)' },
  { value: 'book', label: 'Book', icon: 'book', title: 'Read top to bottom (B)' },
];

/* the index panel's set switch, in its own words (IndexPanel.tsx) */
const SETS: readonly SegOption<SurfaceSet>[] = [
  { value: 'site', label: 'This site', title: 'Every page on this site' },
  { value: 'public', label: 'General Translation', title: 'Every public place the brand is live' },
];

/* the sidebar's density toggle (Sidebar.tsx): two icon squares */
const DENSITY: readonly SegOption<ShellDensity>[] = [
  { value: 'outline', label: 'Outline', icon: 'queue-list', title: 'Outline' },
  { value: 'thumbs', label: 'Thumbnails', icon: 'photo', title: 'Thumbnails' },
];

/** The label a value prints in the readout column. */
function labelOf<T extends string>(options: readonly SegOption<T>[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

/**
 * Seg, live, in the three forms the shell uses: the toolbar's view switch
 * with icons and words, the index panel's two-word switch, and the
 * sidebar's small icon-only density toggle. One ink pill slides under the
 * options; its place and width move together over the slide duration.
 * Slow stretches that move to 900ms so the shared indicator can be watched.
 */
export default function SegDemo() {
  const reduced = useReducedMotion();
  const [view, setView] = useState<ShellMode>('slide');
  const [set, setSet] = useState<SurfaceSet>('site');
  const [density, setDensity] = useState<ShellDensity>('outline');
  const [slow, setSlow] = useState(false);

  return (
    <Plate
      controls={
        <>
          <Toggle
            disabled={reduced}
            label='Slow'
            pressed={slow && !reduced}
            title='Stretch the indicator move to 900ms'
            onChange={setSlow}
          />
          <p className='dmo-bar-status' role='status'>
            View <span className='dmo-num'>{labelOf(VIEWS, view)}</span>, index{' '}
            <span className='dmo-num'>{labelOf(SETS, set)}</span>, density{' '}
            <span className='dmo-num'>{labelOf(DENSITY, density)}</span>
          </p>
        </>
      }
      fit
      label='Three segmented controls: the view switch, the index set switch and the density toggle'
      moves
      stageClassName={slow && !reduced ? 'ixa-segs is-slow' : 'ixa-segs'}
      tag='<Seg options value onChange label />'
    >
      <div className='ixa-seg-row'>
        <span className='ixa-seg-name'>View</span>
        <Seg label='View' options={VIEWS} value={view} onChange={setView} />
      </div>
      <div className='ixa-seg-row'>
        <span className='ixa-seg-name'>Index</span>
        <Seg label='Which index' options={SETS} value={set} onChange={setSet} />
      </div>
      <div className='ixa-seg-row'>
        <span className='ixa-seg-name'>Density</span>
        <Seg className='is-small' iconOnly label='List density' options={DENSITY} value={density} onChange={setDensity} />
      </div>
    </Plate>
  );
}
